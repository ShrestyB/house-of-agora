/* House of Agora — simple hash-routed single-page site (no build step). */

const $ = (sel, root = document) => root.querySelector(sel);
const app = $("#app");
const artistById = Object.fromEntries(ARTISTS.map((a) => [a.id, a]));
const artworkById = Object.fromEntries(ARTWORKS.map((a) => [a.id, a]));
const rupee = (n) => "₹" + n.toLocaleString("en-IN");
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- storage (cart + wishlist) ---------- */
const store = {
  get(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } },
  set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
};
let cart = store.get("agora-cart");
let wish = store.get("agora-wish");

function toggleIn(list, id) { return list.includes(id) ? list.filter((x) => x !== id) : [...list, id]; }
function updateBadges() {
  const c = $("#cart-count"), w = $("#wish-count");
  c.textContent = cart.length; c.hidden = !cart.length;
  w.textContent = wish.length; w.hidden = !wish.length;
}

/* ---------- placeholder artwork generator (seeded SVG) ---------- */
function seeded(str) {
  let h = 2166136261;
  for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  let s = (h >>> 0) % 2147483646 + 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function artSVG(a) {
  if (a.image) return `<img src="${esc(a.image)}" alt="${esc(a.title)}" loading="lazy">`;
  const r = seeded(a.id), p = a.palette, W = 300, H = 400;
  const pick = () => p[1 + Math.floor(r() * (p.length - 1))];
  let s = `<rect width="${W}" height="${H}" fill="${p[0]}"/>`;

  if (a.pattern === "geo") {
    const n = 6, cw = W / n, ch = H / 8;
    for (let y = 0; y < 8; y++) for (let x = 0; x < n; x++) {
      const x0 = x * cw, y0 = y * ch;
      s += r() > 0.5
        ? `<polygon points="${x0},${y0} ${x0 + cw},${y0} ${x0},${y0 + ch}" fill="${pick()}"/><polygon points="${x0 + cw},${y0} ${x0 + cw},${y0 + ch} ${x0},${y0 + ch}" fill="${pick()}"/>`
        : `<polygon points="${x0},${y0} ${x0 + cw},${y0 + ch} ${x0},${y0 + ch}" fill="${pick()}"/><polygon points="${x0},${y0} ${x0 + cw},${y0} ${x0 + cw},${y0 + ch}" fill="${pick()}"/>`;
    }
  } else if (a.pattern === "dots") {
    for (let i = 0; i < 26; i++) {
      const cx = r() * W, cy = r() * H, rad = 18 + r() * 40, c = pick();
      s += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${c}" opacity=".9"/>`;
      for (let k = 0; k < 10; k++) {
        const ang = (k / 10) * Math.PI * 2;
        s += `<circle cx="${cx + Math.cos(ang) * rad * 0.65}" cy="${cy + Math.sin(ang) * rad * 0.65}" r="${rad * 0.08}" fill="${p[0]}"/>`;
      }
    }
  } else if (a.pattern === "waves") {
    const bands = 9;
    for (let i = 0; i < bands; i++) {
      const y = (i / bands) * H + 20, amp = 8 + r() * 14, c = p[1 + (i % (p.length - 1))];
      s += `<path d="M0 ${y} Q ${W * 0.25} ${y - amp} ${W * 0.5} ${y} T ${W} ${y} V ${H} H 0 Z" fill="${c}" opacity=".85"/>`;
    }
    s += `<circle cx="${W * 0.72}" cy="${H * 0.18}" r="28" fill="${p[p.length - 1]}"/>`;
  } else if (a.pattern === "bands") {
    for (let i = 0; i < 6; i++) s += `<rect x="${i * 6}" y="${i * 6}" width="${W - i * 12}" height="${H - i * 12}" fill="none" stroke="${pick()}" stroke-width="4"/>`;
    const cx = W / 2, cy = H / 2;
    for (let k = 0; k < 24; k++) {
      const ang = (k / 24) * Math.PI * 2;
      s += `<line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(ang) * 120}" y2="${cy + Math.sin(ang) * 150}" stroke="${pick()}" stroke-width="5"/>`;
    }
    s += `<circle cx="${cx}" cy="${cy}" r="56" fill="${p[1]}"/><circle cx="${cx}" cy="${cy}" r="30" fill="${p[2]}"/>`;
  } else if (a.pattern === "mandala") {
    const cx = W / 2, cy = H / 2;
    for (let ring = 6; ring > 0; ring--) {
      const R = ring * 22, petals = 6 + ring * 2, c = pick();
      for (let k = 0; k < petals; k++) {
        const ang = (k / petals) * 360;
        s += `<ellipse cx="${cx}" cy="${cy - R}" rx="${R * 0.22}" ry="${R * 0.42}" fill="${c}" transform="rotate(${ang} ${cx} ${cy})" opacity=".92"/>`;
      }
    }
    s += `<circle cx="${cx}" cy="${cy}" r="16" fill="${p[1]}"/>`;
  } else {
    // blocks: recursive split (Mondrian-ish)
    const split = (x, y, w, h, d) => {
      if (d > 4 || w < 50 || h < 50 || (d > 1 && r() < 0.25)) {
        s += `<rect x="${x + 3}" y="${y + 3}" width="${w - 6}" height="${h - 6}" fill="${pick()}" rx="2"/>`;
        return;
      }
      if (w > h ? r() < 0.75 : r() < 0.25) { const k = w * (0.3 + r() * 0.4); split(x, y, k, h, d + 1); split(x + k, y, w - k, h, d + 1); }
      else { const k = h * (0.3 + r() * 0.4); split(x, y, w, k, d + 1); split(x, y + k, w, h - k, d + 1); }
    };
    split(0, 0, W, H, 0);
  }
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(a.title)}">${s}</svg>`;
}

function avatar(artist, size = "") {
  const initials = artist.name.split(" ").map((w) => w[0]).join("");
  return `<span class="avatar ${size}" style="background:linear-gradient(135deg,${artist.colors[0]},${artist.colors[1]})">${initials}</span>`;
}

/* ---------- reusable pieces ---------- */
const arrowBtn = (label, href, cls = "") =>
  `<a class="btn-gold ${cls}" href="${href}"><span>${label}</span><i aria-hidden="true">↗</i></a>`;

const framedTitle = (text, dark = false) =>
  `<div class="framed-title ${dark ? "dark" : ""}"><h2>${text}</h2></div>`;

function artCard(a) {
  const artist = artistById[a.artistId];
  const wished = wish.includes(a.id);
  return `
  <article class="art-card">
    <a href="#/art/${a.id}" class="art-frame">${artSVG(a)}
      ${a.video ? `<span class="tag-video">▶ Video story</span>` : `<span class="tag-story">✎ Story</span>`}
      ${a.sold ? `<span class="sold-ribbon">Sold</span>` : ""}
    </a>
    <button class="icon-btn wish ${wished ? "on" : ""}" data-wish="${a.id}" aria-label="Save to wishlist">♥</button>
    ${a.sold ? "" : `<button class="icon-btn add-btn ${cart.includes(a.id) ? "on" : ""}" data-cart="${a.id}" aria-label="Add to cart"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>`}
    <div class="art-meta">
      <a href="#/art/${a.id}" class="art-title">${esc(a.title)}</a>
      <a href="#/artist/${artist.id}" class="art-artist">${esc(artist.name)}</a>
      <div class="art-price">${a.sold ? `<s>${rupee(a.price)}</s> Sold` : rupee(a.price)} <span>${esc(a.size)}</span></div>
    </div>
  </article>`;
}

function carousel(id, inner) {
  return `<div class="carousel" id="${id}">
    <button class="car-btn prev" data-scroll="${id}" data-dir="-1" aria-label="Previous">‹</button>
    <div class="car-track">${inner}</div>
    <button class="car-btn next" data-scroll="${id}" data-dir="1" aria-label="Next">›</button>
  </div>`;
}

/* ---------- pages ---------- */
const HERO_SLIDES = [
  { kicker: "Every artwork has a story", title: "Art You Can <em>Feel</em>,<br>Stories You Can <em>Keep</em>", art: "lotus-season", cta: ["Explore Art", "#/artworks"] },
  { kicker: "Original · Human-made · Affordable", title: "Real Art,<br>Honest <em>Prices</em>", art: "traffic-symphony", cta: ["Under ₹2,000", "#/artworks?price=0-2000"] },
  { kicker: "Meet the makers", title: "Buy Directly<br>From the <em>Artist</em>", art: "forest-breath", cta: ["Meet Artists", "#/artists"] },
];

function pageHome() {
  const featured = ARTWORKS.filter((a) => a.featured);
  const storyPick = artworkById["lotus-season"];
  const storyArtist = artistById[storyPick.artistId];
  return `
  <section class="hero">
    ${HERO_SLIDES.map((s, i) => `
      <div class="hero-slide ${i === 0 ? "active" : ""}">
        <div class="hero-art">${artSVG(artworkById[s.art])}</div>
        <div class="hero-copy">
          <p class="kicker">${s.kicker}</p>
          <h1>${s.title}</h1>
          ${arrowBtn(s.cta[0], s.cta[1])}
        </div>
      </div>`).join("")}
    <button class="hero-nav prev" aria-label="Previous slide">‹</button>
    <button class="hero-nav next" aria-label="Next slide">›</button>
    <div class="hero-dots">${HERO_SLIDES.map((_, i) => `<button data-slide="${i}" class="${i === 0 ? "active" : ""}" aria-label="Slide ${i + 1}"></button>`).join("")}</div>
  </section>

  <section class="promise">
    <div><b>100% Original</b><span>No prints passed off as paintings</span></div>
    <div><b>From ₹1,500</b><span>Real art for every wall and wallet</span></div>
    <div><b>Story Included</b><span>Video or written, with every piece</span></div>
    <div><b>Artist First</b><span>The largest share goes to the maker</span></div>
  </section>

  <section class="section">
    ${framedTitle("Our Top Picks of the Week")}
    ${carousel("picks", featured.concat(ARTWORKS.filter((a) => !a.featured).slice(0, 3)).map(artCard).join(""))}
  </section>

  <section class="section story-feature">
    <div class="story-media">
      ${storyPick.video
        ? `<video src="${esc(storyPick.video)}" muted loop playsinline autoplay poster=""></video>`
        : artSVG(storyPick)}
      <span class="tag-video big">▶ Watch the story</span>
    </div>
    <div class="story-copy">
      <p class="kicker">The Story Behind It</p>
      <h2>${esc(storyPick.title)}</h2>
      <p class="by">${avatar(storyArtist, "sm")} by <a href="#/artist/${storyArtist.id}">${esc(storyArtist.name)}</a>, ${esc(storyArtist.location)}</p>
      <p>${esc(storyPick.story[0])}</p>
      <p>${esc(storyPick.story[1])}</p>
      <div class="row">${arrowBtn("Read Full Story", `#/art/${storyPick.id}`)} <a class="link" href="#/stories">All stories →</a></div>
    </div>
  </section>

  <section class="section dark-band">
    <h2 class="display center">Shop by Style</h2>
    <div class="style-grid">
      ${STYLES.map((st) => {
        const sample = ARTWORKS.find((a) => a.style === st);
        return `<a class="style-card" href="#/artworks?style=${encodeURIComponent(st)}">
          <div class="style-art">${artSVG(sample)}</div><span>${st}</span></a>`;
      }).join("")}
    </div>
  </section>

  <section class="section mood">
    <h2 class="display mood-title">Shop by<br>Mood</h2>
    ${carousel("moods", MOODS.map((m) => {
      const sample = ARTWORKS.find((a) => a.mood === m) || ARTWORKS[0];
      return `<a class="mood-card" href="#/artworks?mood=${m}">${artSVG(sample)}<span>${m}</span></a>`;
    }).join(""))}
  </section>

  <section class="section">
    <div class="price-box">
      <h2 class="display center">Select Your Price Range</h2>
      <div class="pills">${PRICE_RANGES.map((p) => `<a class="pill" href="#/artworks?price=${p.min}-${p.max}">${p.label}</a>`).join("")}</div>
    </div>
  </section>

  <section class="section">
    ${framedTitle("Meet the Artists")}
    <div class="artist-strip">
      ${ARTISTS.map((ar) => `<a class="artist-chip" href="#/artist/${ar.id}">${avatar(ar, "lg")}<b>${esc(ar.name)}</b><span>${esc(ar.craft)}</span></a>`).join("")}
    </div>
    <div class="center">${arrowBtn("View All Artists", "#/artists")}</div>
  </section>`;
}

function pageArtworks(params) {
  const q = (params.get("q") || "").toLowerCase();
  const style = params.get("style") || "";
  const mood = params.get("mood") || "";
  const price = params.get("price") || "";
  const sort = params.get("sort") || "featured";
  let [pmin, pmax] = price ? price.split("-").map(Number) : [0, 1e9];

  let list = ARTWORKS.filter((a) => {
    const artist = artistById[a.artistId];
    return (!style || a.style === style) && (!mood || a.mood === mood) &&
      a.price >= pmin && a.price < pmax &&
      (!q || (a.title + " " + artist.name + " " + a.medium + " " + a.style).toLowerCase().includes(q));
  });
  if (sort === "low") list.sort((a, b) => a.price - b.price);
  if (sort === "high") list.sort((a, b) => b.price - a.price);

  const sel = (name, opts, cur, all) => `<select data-filter="${name}"><option value="">${all}</option>${opts.map((o) => {
    const v = typeof o === "string" ? o : `${o.min}-${o.max}`, l = typeof o === "string" ? o : o.label;
    return `<option value="${v}" ${v === cur ? "selected" : ""}>${l}</option>`;
  }).join("")}</select>`;

  return `
  <section class="page-head">
    ${framedTitle("All Artworks")}
    <p class="lead">Original pieces from independent artists — each with its story attached.</p>
  </section>
  <section class="section">
    <div class="filters">
      <input type="search" data-filter="q" placeholder="Search title, artist, medium…" value="${esc(q)}">
      ${sel("style", STYLES, style, "All styles")}
      ${sel("mood", MOODS, mood, "All moods")}
      ${sel("price", PRICE_RANGES, price, "Any price")}
      <select data-filter="sort">
        <option value="featured">Sort: Featured</option>
        <option value="low" ${sort === "low" ? "selected" : ""}>Price: Low to High</option>
        <option value="high" ${sort === "high" ? "selected" : ""}>Price: High to Low</option>
      </select>
    </div>
    <p class="muted">${list.length} artwork${list.length === 1 ? "" : "s"}</p>
    ${list.length ? `<div class="grid">${list.map(artCard).join("")}</div>`
      : `<div class="empty">No artworks match these filters. <a href="#/artworks">Clear filters</a></div>`}
  </section>`;
}

function storyBlock(a) {
  return `
  <div class="story-block">
    ${a.video ? `<div class="video-wrap">${
      /youtube|vimeo/.test(a.video)
        ? `<iframe src="${esc(a.video)}" title="Story of ${esc(a.title)}" allowfullscreen></iframe>`
        : `<video src="${esc(a.video)}" controls playsinline preload="metadata"></video>`
    }</div>` : ""}
    <div class="story-text">${a.story.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
  </div>`;
}

function pageArtwork(id) {
  const a = artworkById[id];
  if (!a) return pageNotFound();
  const artist = artistById[a.artistId];
  const more = ARTWORKS.filter((x) => x.artistId === a.artistId && x.id !== a.id);
  const inCart = cart.includes(a.id);
  return `
  <section class="section detail">
    <div class="detail-art">${artSVG(a)}</div>
    <div class="detail-info">
      <p class="crumbs"><a href="#/artworks">Artworks</a> / <a href="#/artworks?style=${encodeURIComponent(a.style)}">${esc(a.style)}</a></p>
      <h1>${esc(a.title)}</h1>
      <p class="by">${avatar(artist, "sm")} <a href="#/artist/${artist.id}">${esc(artist.name)}</a> · ${esc(artist.location)}</p>
      <div class="price-lg">${rupee(a.price)}</div>
      <dl class="specs">
        <dt>Medium</dt><dd>${esc(a.medium)}</dd>
        <dt>Size</dt><dd>${esc(a.size)}</dd>
        <dt>Style</dt><dd>${esc(a.style)}</dd>
        <dt>Mood</dt><dd>${esc(a.mood)}</dd>
      </dl>
      <div class="row">
        ${a.sold ? `<button class="btn-solid" disabled>Sold</button>` : `<button class="btn-solid" data-cart="${a.id}">${inCart ? "✓ In Cart" : "Add to Cart"}</button>`}
        <button class="btn-outline wish ${wish.includes(a.id) ? "on" : ""}" data-wish="${a.id}">♥ Wishlist</button>
      </div>
      <ul class="assure">
        <li>Original, signed by the artist</li>
        <li>Certificate of authenticity + printed story card</li>
        <li>Free shipping in India · 7-day returns</li>
      </ul>
    </div>
  </section>

  <section class="section story-section">
    ${framedTitle("The Story Behind It", true)}
    ${storyBlock(a)}
  </section>

  <section class="section artist-box">
    ${avatar(artist, "xl")}
    <div>
      <p class="kicker">About the artist</p>
      <h3>${esc(artist.name)}</h3>
      <p>${esc(artist.bio)}</p>
      <a class="link" href="#/artist/${artist.id}">See all works by ${esc(artist.name.split(" ")[0])} →</a>
    </div>
  </section>

  ${more.length ? `<section class="section"><h2 class="display">More from ${esc(artist.name)}</h2><div class="grid">${more.map(artCard).join("")}</div></section>` : ""}`;
}

function pageStories() {
  const list = [...ARTWORKS].sort((a, b) => (b.video ? 1 : 0) - (a.video ? 1 : 0));
  return `
  <section class="page-head">
    ${framedTitle("Stories")}
    <p class="lead">Every painting begins somewhere — a pond, a song, a traffic jam. Watch or read how each piece came to be.</p>
  </section>
  <section class="section stories-list">
    ${list.map((a, i) => {
      const ar = artistById[a.artistId];
      return `
      <article class="story-row ${i % 2 ? "flip" : ""}">
        <a href="#/art/${a.id}" class="story-thumb">${artSVG(a)}
          ${a.video ? `<span class="play">▶</span>` : ""}</a>
        <div>
          <p class="kicker">${a.video ? "Video story" : "Written story"} · ${esc(ar.craft)}</p>
          <h3><a href="#/art/${a.id}">${esc(a.title)}</a></h3>
          <p class="by">${avatar(ar, "sm")} ${esc(ar.name)}, ${esc(ar.location)}</p>
          <p>${esc(a.story[0])}</p>
          <a class="link" href="#/art/${a.id}">${a.video ? "Watch the story" : "Read the full story"} →</a>
        </div>
      </article>`;
    }).join("")}
  </section>`;
}

function pageArtists() {
  return `
  <section class="page-head">
    ${framedTitle("Our Artists")}
    <p class="lead">The people behind the paintings. Every artist here is independent, and every sale goes straight to supporting their practice.</p>
  </section>
  <section class="section">
    <div class="artist-grid">
      ${ARTISTS.map((ar) => {
        const works = ARTWORKS.filter((a) => a.artistId === ar.id);
        return `
        <a class="artist-card" href="#/artist/${ar.id}">
          <div class="artist-cover">${works.slice(0, 3).map((w) => `<div>${artSVG(w)}</div>`).join("")}</div>
          <div class="artist-body">
            ${avatar(ar, "lg")}
            <h3>${esc(ar.name)}</h3>
            <p class="muted">${esc(ar.craft)} · ${esc(ar.location)}</p>
            <p class="count">${works.length} artwork${works.length === 1 ? "" : "s"} · from ${rupee(Math.min(...works.map((w) => w.price)))}</p>
          </div>
        </a>`;
      }).join("")}
    </div>
  </section>`;
}

function pageArtist(id) {
  const ar = artistById[id];
  if (!ar) return pageNotFound();
  const works = ARTWORKS.filter((a) => a.artistId === id);
  return `
  <section class="artist-hero">
    ${avatar(ar, "xl")}
    <div>
      <p class="kicker">${esc(ar.craft)}</p>
      <h1>${esc(ar.name)}</h1>
      <p class="muted">${esc(ar.location)}</p>
      <p class="bio">${esc(ar.bio)}</p>
    </div>
  </section>
  <section class="section">
    <h2 class="display">Works by ${esc(ar.name)}</h2>
    <div class="grid">${works.map(artCard).join("")}</div>
  </section>`;
}

function pageAbout() {
  return `
  <section class="about-hero">
    <p class="kicker">Our Vision</p>
    <h1>Art Deserves Its Story —<br>And Every Home Deserves Art</h1>
    <p>Original art. Human-made. Honestly priced.</p>
    <div class="row center">${arrowBtn("Explore Artworks", "#/artworks")}<a class="btn-outline light" href="#/artists">Meet the Artists</a></div>
  </section>
  <section class="section about-cols">
    <div><h3>Why stories?</h3><p>A painting on a wall is beautiful. A painting whose story you can tell your guests is unforgettable. Every piece we sell comes with the artist's story — on video wherever possible, in writing always.</p></div>
    <div><h3>Why affordable?</h3><p>Original art shouldn't be a luxury. We work with emerging and folk artists, keep our margins thin, and offer small formats so a first painting can cost less than a dinner out.</p></div>
    <div><h3>Why artists first?</h3><p>Artists set their own prices and receive the largest share of every sale. Each artist has a public profile so buyers can follow their work directly.</p></div>
  </section>`;
}

function pageList(kind) {
  const ids = kind === "cart" ? cart : wish;
  const items = ids.map((id) => artworkById[id]).filter(Boolean);
  const total = items.reduce((s, a) => s + a.price, 0);
  const title = kind === "cart" ? "Your Cart" : "Your Wishlist";
  if (!items.length) return `<section class="page-head">${framedTitle(title)}<p class="lead">Nothing here yet.</p><div class="center">${arrowBtn("Browse Artworks", "#/artworks")}</div></section>`;
  if (kind === "wishlist") return `<section class="page-head">${framedTitle(title)}</section><section class="section"><div class="grid">${items.map(artCard).join("")}</div></section>`;
  return `
  <section class="page-head">${framedTitle(title)}</section>
  <section class="section cart">
    <div class="cart-items">
      ${items.map((a) => `
        <div class="cart-row">
          <a href="#/art/${a.id}" class="cart-thumb">${artSVG(a)}</a>
          <div><a href="#/art/${a.id}"><b>${esc(a.title)}</b></a><p class="muted">${esc(artistById[a.artistId].name)} · ${esc(a.size)}</p></div>
          <div class="cart-price">${rupee(a.price)}</div>
          <button class="remove" data-cart="${a.id}" aria-label="Remove">✕</button>
        </div>`).join("")}
    </div>
    <aside class="summary">
      <div><span>Subtotal</span><span>${rupee(total)}</span></div>
      <div><span>Shipping</span><span>Free</span></div>
      <div class="total"><span>Total</span><span>${rupee(total)}</span></div>
      <a class="btn-solid full" href="#/checkout">Proceed to Checkout</a>
      <p class="muted small center">Pay by UPI · Order confirmed on WhatsApp</p>
    </aside>
  </section>`;
}

function pageNotFound() {
  return `<section class="page-head">${framedTitle("Not Found")}<p class="lead">That page doesn't exist.</p><div class="center">${arrowBtn("Go Home", "#/")}</div></section>`;
}


/* ---------- checkout: UPI QR + WhatsApp confirmation (no backend) ---------- */
let order = (() => { try { return JSON.parse(localStorage.getItem("agora-order")); } catch { return null; } })();
function saveOrder() { try { localStorage.setItem("agora-order", JSON.stringify(order)); } catch {} }
const newOrderId = () => "HA" + Date.now().toString(36).toUpperCase().slice(-6);

function upiLink(o) {
  const q = new URLSearchParams({ pa: SHOP.upiId, pn: SHOP.upiName || SHOP.name, am: o.total.toFixed(2), cu: "INR", tn: `Order ${o.id}` });
  return "upi://pay?" + q.toString();
}

function qrBlock(o) {
  if (SHOP.upiId && window.qrcode) {
    const qr = qrcode(0, "M"); qr.addData(upiLink(o)); qr.make();
    return `<div class="qr">${qr.createSvgTag({ cellSize: 5, margin: 3, scalable: true })}</div>
      <a class="btn-solid full only-mobile" href="${upiLink(o)}">Pay ${rupee(o.total)} with UPI app</a>
      <p class="upi-id">UPI ID: <b>${esc(SHOP.upiId)}</b> <button class="copy" data-copy="${esc(SHOP.upiId)}">Copy</button></p>`;
  }
  if (SHOP.qrImage) {
    return `<div class="qr"><img src="${esc(SHOP.qrImage)}" alt="${esc(SHOP.name)} UPI QR code"></div>
      <p class="upi-note">Enter the amount <b>${rupee(o.total)}</b> and add <b>${o.id}</b> in the payment note.</p>`;
  }
  return `<div class="qr setup">QR not set up yet.<br><small>Add your <code>upiId</code> or <code>qrImage</code> in <code>SHOP</code> at the top of data.js.</small></div>`;
}

function orderMessage(o) {
  const c = o.customer;
  const lines = [
    `New order ${o.id} — ${SHOP.name}`, "",
    ...o.items.map((id) => { const a = artworkById[id]; return `• ${a.title} by ${artistById[a.artistId].name} — ${rupee(a.price)}`; }),
    "", `Total paid: ${rupee(o.total)}`,
    `UPI ref / UTR: ${o.utr || "(not entered)"}`, "",
    `Name: ${c.name}`, `Phone: ${c.phone}`, c.email ? `Email: ${c.email}` : "",
    `Address: ${c.address}, ${c.city} - ${c.pincode}`, c.note ? `Note: ${c.note}` : "",
  ];
  return lines.filter((l, i) => l !== "" || lines[i - 1] !== "").join("\n");
}
function orderSendLink(o) {
  const text = orderMessage(o);
  if (SHOP.whatsapp) return `https://wa.me/${SHOP.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
  if (SHOP.email) return `mailto:${SHOP.email}?subject=${encodeURIComponent("Order " + o.id)}&body=${encodeURIComponent(text)}`;
  return "";
}

const steps = (n) => `<ol class="steps">${["Details", "Pay", "Confirm"].map((s, i) => `<li class="${i < n ? "done" : i === n ? "now" : ""}">${s}</li>`).join("")}</ol>`;

function orderSummary(ids) {
  const items = ids.map((id) => artworkById[id]).filter(Boolean);
  const total = items.reduce((s, a) => s + a.price, 0);
  return `<aside class="summary">
    ${items.map((a) => `<div class="sum-item"><span class="sum-thumb">${artSVG(a)}</span><span>${esc(a.title)}<small>${esc(artistById[a.artistId].name)}</small></span><span>${rupee(a.price)}</span></div>`).join("")}
    <div><span>Shipping</span><span>Free</span></div>
    <div class="total"><span>Total</span><span>${rupee(total)}</span></div>
  </aside>`;
}

function pageCheckout(params) {
  const step = params.get("step") || "details";

  if (step === "done" && order?.sent) {
    return `<section class="page-head">${steps(3)}${framedTitle("Thank You!")}
      <p class="lead">Order <b>${order.id}</b> is with us. We'll check the payment and confirm on WhatsApp within 24 hours, then share shipping details.</p>
      <p class="muted">Didn't send the message? <a class="link" href="${orderSendLink(order)}" target="_blank" rel="noopener">Send it again</a></p>
      <div class="center">${arrowBtn("Keep Exploring", "#/artworks")}</div></section>`;
  }

  if (step === "pay" && order && !order.sent) {
    const sendable = !!orderSendLink(order);
    return `<section class="page-head">${steps(1)}${framedTitle("Scan & Pay")}</section>
    <section class="section checkout">
      <div class="pay-card">
        <p class="kicker">Order ${order.id}</p>
        <div class="pay-amount">${rupee(order.total)}</div>
        ${qrBlock(order)}
        <ol class="pay-help">
          <li>Scan with any UPI app — GPay, PhonePe, Paytm, BHIM.</li>
          <li>Pay exactly <b>${rupee(order.total)}</b>.</li>
          <li>Copy the 12-digit UPI reference (UTR) from your payment receipt.</li>
        </ol>
        <form id="paid-form" class="form">
          <label>UPI reference / UTR <span class="muted">(helps us confirm faster)</span>
            <input name="utr" inputmode="numeric" placeholder="e.g. 412345678901" value="${esc(order.utr || "")}"></label>
          <button class="btn-solid full" ${sendable ? "" : "disabled"}>I've Paid — Send Order on WhatsApp</button>
          ${sendable ? "" : `<p class="muted small">Add a <code>whatsapp</code> number or <code>email</code> in SHOP (data.js) to enable this.</p>`}
        </form>
        <a class="link small" href="#/checkout">← Edit details</a>
      </div>
      ${orderSummary(order.items)}
    </section>`;
  }

  const items = cart.map((id) => artworkById[id]).filter((a) => a && !a.sold);
  if (!items.length) return pageList("cart");
  const c = order?.customer || {};
  const f = (name, label, attrs = "") => `<label>${label}<input name="${name}" value="${esc(c[name] || "")}" ${attrs}></label>`;
  return `<section class="page-head">${steps(0)}${framedTitle("Checkout")}</section>
  <section class="section checkout">
    <form id="details-form" class="form">
      <h3>Shipping details</h3>
      ${f("name", "Full name", "required autocomplete='name'")}
      <div class="two">
        ${f("phone", "Phone (WhatsApp)", "required type='tel' inputmode='tel' pattern='[0-9+ ]{10,15}' autocomplete='tel'")}
        ${f("email", "Email <span class='muted'>(optional)</span>", "type='email' autocomplete='email'")}
      </div>
      <label>Address<textarea name="address" rows="3" required autocomplete="street-address">${esc(c.address || "")}</textarea></label>
      <div class="two">
        ${f("city", "City", "required autocomplete='address-level2'")}
        ${f("pincode", "Pincode", "required inputmode='numeric' pattern='[0-9]{6}' autocomplete='postal-code'")}
      </div>
      <label>Note for the artist <span class="muted">(optional)</span><textarea name="note" rows="2">${esc(c.note || "")}</textarea></label>
      <button class="btn-solid full">Continue to Payment</button>
    </form>
    ${orderSummary(items.map((a) => a.id))}
  </section>`;
}

document.addEventListener("submit", (e) => {
  if (e.target.id === "details-form") {
    e.preventDefault();
    const customer = Object.fromEntries(new FormData(e.target));
    const items = cart.filter((id) => artworkById[id] && !artworkById[id].sold);
    const total = items.reduce((s, id) => s + artworkById[id].price, 0);
    const keepId = order && !order.sent && order.total === total && order.items.join() === items.join();
    order = { id: keepId ? order.id : newOrderId(), items, total, customer, utr: order?.utr || "", sent: false };
    saveOrder(); location.hash = "#/checkout?step=pay"; window.scrollTo(0, 0);
  } else if (e.target.id === "paid-form") {
    e.preventDefault();
    order.utr = new FormData(e.target).get("utr").trim();
    const link = orderSendLink(order);
    if (!link) return;
    order.sent = true; saveOrder();
    window.open(link, "_blank", "noopener");
    cart = []; store.set("agora-cart", cart);
    location.hash = "#/checkout?step=done"; window.scrollTo(0, 0);
  }
});

/* ---------- router ---------- */
function route() {
  const raw = location.hash.slice(2) || "";
  const [path, query] = raw.split("?");
  const params = new URLSearchParams(query || "");
  const [section, id] = path.split("/");
  const pages = {
    "": pageHome, artworks: () => pageArtworks(params), art: () => pageArtwork(id),
    stories: pageStories, artists: pageArtists, artist: () => pageArtist(id),
    about: pageAbout, cart: () => pageList("cart"), checkout: () => pageCheckout(params), wishlist: () => pageList("wishlist"),
  };
  app.innerHTML = (pages[section] || pageNotFound)();
  document.querySelectorAll("[data-nav]").forEach((a) =>
    a.classList.toggle("active", a.dataset.nav === section || (section === "art" && a.dataset.nav === "artworks") || (section === "artist" && a.dataset.nav === "artists")));
  $(".nav").classList.remove("open");
  updateBadges();
  if (section === "") startHero();
  else stopHero();
}

let lastPath = null;
window.addEventListener("hashchange", () => {
  const path = location.hash.split("?")[0];
  route();
  if (path !== lastPath) window.scrollTo(0, 0);
  lastPath = path;
});

/* ---------- hero slider ---------- */
let heroTimer = null, heroIdx = 0;
function showSlide(i) {
  const slides = document.querySelectorAll(".hero-slide"), dots = document.querySelectorAll(".hero-dots button");
  if (!slides.length) return;
  heroIdx = (i + slides.length) % slides.length;
  slides.forEach((s, k) => s.classList.toggle("active", k === heroIdx));
  dots.forEach((d, k) => d.classList.toggle("active", k === heroIdx));
}
function startHero() { stopHero(); heroIdx = 0; heroTimer = setInterval(() => showSlide(heroIdx + 1), 6000); }
function stopHero() { clearInterval(heroTimer); }

/* ---------- events (delegated) ---------- */
document.addEventListener("click", (e) => {
  const t = e.target.closest("button, a");
  if (!t) return;
  if (t.dataset.cart) {
    e.preventDefault();
    cart = toggleIn(cart, t.dataset.cart); store.set("agora-cart", cart);
    toast(cart.includes(t.dataset.cart) ? "Added to cart" : "Removed from cart");
    route();
  } else if (t.dataset.wish) {
    e.preventDefault();
    wish = toggleIn(wish, t.dataset.wish); store.set("agora-wish", wish);
    toast(wish.includes(t.dataset.wish) ? "Saved to wishlist" : "Removed from wishlist");
    route();
  } else if (t.dataset.scroll) {
    const track = $(`#${t.dataset.scroll} .car-track`);
    track.scrollBy({ left: Number(t.dataset.dir) * track.clientWidth * 0.8, behavior: "smooth" });
  } else if (t.dataset.slide) {
    showSlide(Number(t.dataset.slide)); startHeroTimerOnly();
  } else if (t.classList.contains("hero-nav")) {
    showSlide(heroIdx + (t.classList.contains("next") ? 1 : -1)); startHeroTimerOnly();
  } else if (t.classList.contains("nav-toggle")) {
    const nav = $(".nav"); nav.classList.toggle("open");
    t.setAttribute("aria-expanded", nav.classList.contains("open"));
  } else if (t.dataset.copy) {
    navigator.clipboard?.writeText(t.dataset.copy).then(() => toast("Copied"), () => toast(t.dataset.copy));
  }
});
function startHeroTimerOnly() { stopHero(); heroTimer = setInterval(() => showSlide(heroIdx + 1), 6000); }

// filters on the artworks page update the URL hash
let searchDebounce;
document.addEventListener("input", (e) => {
  const f = e.target.dataset.filter;
  if (!f) return;
  const apply = () => {
    const params = new URLSearchParams(location.hash.split("?")[1] || "");
    e.target.value ? params.set(f, e.target.value) : params.delete(f);
    const qs = params.toString();
    location.hash = "#/artworks" + (qs ? "?" + qs : "");
  };
  if (f === "q") {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      apply();
      requestAnimationFrame(() => { const i = $('[data-filter="q"]'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } });
    }, 350);
  } else apply();
});

// header gets solid once you scroll
window.addEventListener("scroll", () => $(".site-header").classList.toggle("scrolled", window.scrollY > 40), { passive: true });

function toast(msg) {
  let el = $(".toast");
  if (!el) { el = document.createElement("div"); el.className = "toast"; document.body.appendChild(el); }
  el.textContent = msg; el.classList.add("show");
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("show"), 2000);
}

lastPath = location.hash.split("?")[0];
route();
