/*
 * SAMPLE DATA — replace with real artists & artworks.
 *
 * Artwork fields:
 *   image   : optional URL to a real photo of the artwork. If missing, a generated
 *             placeholder (pattern + palette) is drawn instead.
 *   video   : optional URL of the story video (mp4 file, or a YouTube embed URL like
 *             https://www.youtube.com/embed/VIDEO_ID). If missing, the written story is shown.
 *   story   : array of paragraphs — the story behind the piece.
 */

/*
 * SHOP SETTINGS — fill these in before going live.
 *   upiId    : your business UPI ID (e.g. "houseofagora@okhdfcbank"). When set, the checkout
 *              shows a QR with the exact amount + order ID pre-filled, and a "Pay with UPI app"
 *              button on phones. Leave "" to use qrImage instead.
 *   qrImage  : path to your static business QR picture (e.g. "qr.png" in this folder).
 *              Used only when upiId is empty. Buyer types the amount themselves.
 *   whatsapp : number that receives orders, country code + number, digits only (e.g. "919876543210").
 *   email    : fallback for orders if whatsapp is empty.
 *
 * To mark an artwork as sold, add  sold: true  to it below.
 */
const SHOP = {
  name: "House of Agora",
  upiId: "",
  upiName: "House of Agora",
  qrImage: "",
  whatsapp: "",
  email: "",
};

const ARTISTS = [
  {
    id: "meera-joshi",
    name: "Meera Joshi",
    location: "Jaipur, Rajasthan",
    craft: "Pichwai & Miniature",
    bio: "Meera learned Pichwai from her grandmother on the courtyard floor of their haveli. She paints with mineral pigments she grinds herself, and signs every work with a tiny lotus.",
    colors: ["#c8553d", "#f2d0a4"],
  },
  {
    id: "ravi-dhurve",
    name: "Ravi Dhurve",
    location: "Patangarh, Madhya Pradesh",
    craft: "Gond Art",
    bio: "A third-generation Gond artist, Ravi fills each animal with the dots and dashes his village calls 'the breathing of the forest'.",
    colors: ["#2a9d8f", "#e9c46a"],
  },
  {
    id: "anika-rao",
    name: "Anika Rao",
    location: "Bengaluru, Karnataka",
    craft: "Contemporary Abstract",
    bio: "Anika left a career in software to paint full-time. Her abstracts begin as city noise recordings, which she 'translates' into colour.",
    colors: ["#6d597a", "#e56b6f"],
  },
  {
    id: "sita-devi",
    name: "Sita Devi",
    location: "Madhubani, Bihar",
    craft: "Madhubani",
    bio: "Sita paints the songs women sing at weddings in her village. She uses twigs, nib pens and her fingertips — never a brush.",
    colors: ["#d62828", "#fcbf49"],
  },
  {
    id: "arjun-menon",
    name: "Arjun Menon",
    location: "Kochi, Kerala",
    craft: "Landscape & Watercolour",
    bio: "Arjun paints outdoors, in one sitting, wherever the backwaters take him. Rain spots on his paper are left in on purpose.",
    colors: ["#1d3557", "#a8dadc"],
  },
  {
    id: "lena-castro",
    name: "Lena Castro",
    location: "Oaxaca, Mexico",
    craft: "Folk Pop",
    bio: "Lena mixes the colours of Oaxacan alebrijes with comic-book bold lines. She is the first in her family to sell art outside her town.",
    colors: ["#ff006e", "#ffbe0b"],
  },
];

const ARTWORKS = [
  {
    id: "lotus-season",
    title: "Lotus Season",
    artistId: "meera-joshi",
    price: 4800,
    style: "Folk",
    mood: "Peace",
    medium: "Natural pigment on cloth",
    size: '18" × 24"',
    pattern: "mandala",
    palette: ["#1d3b2a", "#c8553d", "#f2d0a4", "#e9c46a", "#f7ede2"],
    video: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    story: [
      "Every summer the lotus pond behind Meera's home blooms for exactly three weeks. Her grandmother called it 'Krishna's season'.",
      "Meera painted this over those same three weeks, adding one flower each morning before the heat set in. The pigment for the pink petals came from crushed stones she collected on the pond's edge.",
      "In the video, she shows the last flower being painted — the one she says 'closes the season'.",
    ],
    featured: true,
  },
  {
    id: "forest-breath",
    title: "The Forest Breathes",
    artistId: "ravi-dhurve",
    price: 3500,
    style: "Folk",
    mood: "Joy",
    medium: "Acrylic on canvas",
    size: '16" × 20"',
    pattern: "dots",
    palette: ["#14213d", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"],
    story: [
      "In Ravi's village, elders say the forest breathes in at dusk and out at dawn. The dots in Gond art, he explains, are that breath made visible.",
      "This piece shows a peacock and a deer sharing the same tree — something his father swore he once saw during a drought year, when every animal came to the last water hole together.",
    ],
    featured: true,
  },
  {
    id: "traffic-symphony",
    title: "Silk Board Symphony",
    artistId: "anika-rao",
    price: 7200,
    style: "Abstract",
    mood: "Energy",
    medium: "Acrylic on canvas",
    size: '24" × 30"',
    pattern: "geo",
    palette: ["#22223b", "#e56b6f", "#6d597a", "#eaac8b", "#b56576", "#ffd166"],
    story: [
      "Anika recorded 40 minutes of horns, engines and street vendors stuck at Bengaluru's most famous traffic junction.",
      "Each triangle is one sound: red for horns, violet for engines, gold for the vendor calling out 'chai, coffee'. Listened to in order, the painting reads left to right like a score.",
    ],
    featured: true,
  },
  {
    id: "wedding-song",
    title: "The Wedding Song",
    artistId: "sita-devi",
    price: 2600,
    style: "Folk",
    mood: "Joy",
    medium: "Natural colours on handmade paper",
    size: '15" × 22"',
    pattern: "bands",
    palette: ["#fff3e0", "#d62828", "#fcbf49", "#003049", "#2a9d8f"],
    story: [
      "When a bride leaves her village in Mithila, the women sing her a song about a parrot who carries messages home.",
      "Sita painted the parrot flying between two houses — the bride's old home and her new one — with the song's verses hidden in the borders. Her own daughter's wedding inspired it.",
    ],
    featured: true,
  },
  {
    id: "backwater-dawn",
    title: "Backwater Dawn",
    artistId: "arjun-menon",
    price: 1800,
    style: "Landscape",
    mood: "Peace",
    medium: "Watercolour on paper",
    size: '11" × 15"',
    pattern: "waves",
    palette: ["#fefae0", "#a8dadc", "#457b9d", "#1d3557", "#f4a261"],
    story: [
      "Painted at 5:40 am from the front of a fishing canoe near Kumarakom. Arjun had 25 minutes before the light changed.",
      "The pale streak across the water is where the boatman's oar touched the surface — Arjun asked him to keep rowing so it would stay in the painting.",
    ],
  },
  {
    id: "alebrije-dreams",
    title: "Alebrije Dreams",
    artistId: "lena-castro",
    price: 5400,
    style: "Pop Art",
    mood: "Joy",
    medium: "Acrylic & ink on board",
    size: '20" × 20"',
    pattern: "blocks",
    palette: ["#111111", "#ff006e", "#ffbe0b", "#3a86ff", "#8338ec", "#fb5607"],
    story: [
      "Alebrijes were born from a dream: in 1936, Pedro Linares fell ill and dreamed of fantastical creatures shouting one word — 'Alebrijes!'.",
      "Lena painted her own dream creature: half jaguar, half hummingbird, the two animals her grandmother said watch over their family.",
    ],
  },
  {
    id: "monsoon-window",
    title: "Monsoon Window",
    artistId: "arjun-menon",
    price: 1500,
    style: "Landscape",
    mood: "Calm",
    medium: "Watercolour on paper",
    size: '9" × 12"',
    pattern: "waves",
    palette: ["#e9f5f2", "#84a59d", "#52796f", "#354f52", "#cad2c5"],
    story: [
      "Stuck indoors during a week of rain, Arjun painted the view from his grandmother's window — the same coconut trees he painted as a boy.",
      "The drips running down the paper are real rain. He held the sheet out of the window for ten seconds before it dried.",
    ],
  },
  {
    id: "night-market",
    title: "Night Market",
    artistId: "anika-rao",
    price: 6100,
    style: "Abstract",
    mood: "Energy",
    medium: "Oil on canvas",
    size: '24" × 24"',
    pattern: "blocks",
    palette: ["#0b090a", "#e5383b", "#f5cb5c", "#3c6e71", "#d9d9d9"],
    story: [
      "Every block is a stall at the Thursday night market near Anika's studio: the fruit seller, the man who repairs phones, the girl selling hair clips.",
      "She visited the market for twelve weeks before starting the painting, and gave a small print to each stall owner who appears in it.",
    ],
  },
  {
    id: "tiger-and-moon",
    title: "Tiger and the Moon",
    artistId: "ravi-dhurve",
    price: 2900,
    style: "Folk",
    mood: "Courage",
    medium: "Acrylic on canvas",
    size: '14" × 18"',
    pattern: "dots",
    palette: ["#3d0c02", "#f77f00", "#fcbf49", "#eae2b7", "#d62828"],
    story: [
      "A Gond folk tale says the tiger once tried to swallow the moon to keep the night for himself — and the moon's light still shows through his stripes.",
      "Ravi's version shows the tiger mid-leap, made entirely of moonlit dots.",
    ],
  },
  {
    id: "fish-of-plenty",
    title: "Fish of Plenty",
    artistId: "sita-devi",
    price: 1900,
    style: "Folk",
    mood: "Joy",
    medium: "Natural colours on handmade paper",
    size: '11" × 15"',
    pattern: "mandala",
    palette: ["#fff8e7", "#d62828", "#023e8a", "#fcbf49", "#2b9348"],
    story: [
      "In Madhubani, a pair of fish is painted on the walls of newlyweds' rooms — they stand for abundance and fertility.",
      "Sita painted these two fish swimming in a circle 'so the luck never runs out'.",
    ],
  },
  {
    id: "temple-bells",
    title: "Temple Bells at Dusk",
    artistId: "meera-joshi",
    price: 8900,
    style: "Folk",
    mood: "Peace",
    medium: "Natural pigment & gold leaf on cloth",
    size: '24" × 36"',
    pattern: "bands",
    palette: ["#14213d", "#e5c07b", "#c8553d", "#f2d0a4", "#2a9d8f"],
    video: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    story: [
      "Pichwai paintings were made to hang behind the deity in Nathdwara's temples, changed with every season and festival.",
      "Meera's piece captures the evening aarti — the moment the bells ring and the lamps are lifted. The gold leaf took four days to lay by hand.",
    ],
  },
  {
    id: "corazon-city",
    title: "Corazón City",
    artistId: "lena-castro",
    price: 3200,
    style: "Pop Art",
    mood: "Energy",
    medium: "Acrylic on canvas",
    size: '16" × 20"',
    pattern: "geo",
    palette: ["#ffffff", "#ff006e", "#3a86ff", "#ffbe0b", "#111111"],
    story: [
      "Lena's first trip to Mexico City overwhelmed her — so many colours, so much noise. She sketched on napkins for three days straight.",
      "This canvas stitches those napkin sketches together: a city drawn as a single beating heart.",
    ],
  },
];

const STYLES = ["Abstract", "Folk", "Landscape", "Pop Art"];
const MOODS = ["Joy", "Peace", "Energy", "Courage", "Calm"];
const PRICE_RANGES = [
  { label: "Under ₹2,000", min: 0, max: 2000 },
  { label: "₹2K – ₹5K", min: 2000, max: 5000 },
  { label: "₹5K – ₹10K", min: 5000, max: 10000 },
  { label: "₹10K – ₹25K", min: 10000, max: 25000 },
  { label: "Above ₹25K", min: 25000, max: 1e9 },
];
