/* =========================================================
   WEDDING CONFIG — edit names, dates, venues and stories here.
   Photos: drop files into /images using the names below and they
   replace the illustrated placeholders automatically.
   ========================================================= */
window.WEDDING = {
  bride: "Ananya",
  groom: "Aarav",
  initials: ["A", "A"],
  dateISO: "2027-02-02T18:30:00+05:30",      // ceremony start (used by countdown)
  city: "Udaipur",
  venue: "The Royal Palace, Udaipur",
  families: "Together with the blessings of their families",
  hashtag: "#AnanyaWedsAarav",
  // Where the website will live once hosted — every QR card points here (with ?to=<guest>)
  siteURL: "https://your-wedding-site.example",

  story: [
    { date: "2019-08-14", title: "A Monsoon Hello", motif: "chai", bg: "maroon", img: "images/story-1.jpg",
      text: "A rain-soaked café, one shared umbrella and two cups of masala chai that went cold while we talked for hours." },
    { date: "2021-12-24", title: "The First Journey", motif: "mountain", bg: "indigo", img: "images/story-2.jpg",
      text: "Snow in the Himalayas, a missed train and the moment we realised every adventure felt like home together." },
    { date: "2024-11-01", title: "Diwali Under Stars", motif: "diya", bg: "saffron", img: "images/story-3.jpg",
      text: "Our families met over a hundred glowing diyas — and somewhere between the sweets and fireworks, they became one." },
    { date: "2026-02-14", title: "The Proposal", motif: "ring", bg: "plum", img: "images/story-4.jpg",
      text: "On a palace terrace at sunset, one knee, one ring and the easiest 'yes' ever spoken." }
  ],

  gallery: [
    { title: "Pink City Evenings", place: "Jaipur", motif: "lotus", bg: "maroon", img: "images/gallery-1.jpg" },
    { title: "Lake of Dreams", place: "Udaipur", motif: "moon", bg: "teal", img: "images/gallery-2.jpg" },
    { title: "Golden Dunes", place: "Jaisalmer", motif: "mountain", bg: "saffron", img: "images/gallery-3.jpg" },
    { title: "Temple Bells", place: "Varanasi", motif: "diya", bg: "plum", img: "images/gallery-4.jpg" },
    { title: "Monsoon Gardens", place: "Kerala", motif: "chai", bg: "emerald", img: "images/gallery-5.jpg" },
    { title: "Forever Starts", place: "Our Home", motif: "ring", bg: "indigo", img: "images/gallery-6.jpg" }
  ],

  events: [
    { key: "haldi", name: "Haldi", tag: "The Golden Glow", date: "2027-01-31T10:00:00+05:30", hours: 3,
      venue: "The Marigold Courtyard", dress: "Every shade of sunshine yellow",
      blurb: "Turmeric, laughter and marigolds — a morning of blessings before the big days." },
    { key: "mehendi", name: "Mehendi", tag: "Stories in Henna", date: "2027-01-31T16:00:00+05:30", hours: 4,
      venue: "The Zenana Gardens", dress: "Greens, florals & festive prints",
      blurb: "Intricate henna, folk songs and an evening painted in deep shades of love." },
    { key: "sangeet", name: "Sangeet", tag: "A Night of Music", date: "2027-02-01T19:30:00+05:30", hours: 5,
      venue: "The Durbar Hall", dress: "Indo-western glamour",
      blurb: "Two families, one stage — dance-offs, dholaks and a night nobody will forget." },
    { key: "wedding", name: "The Wedding", tag: "Seven Sacred Vows", date: "2027-02-02T18:30:00+05:30", hours: 5,
      venue: "The Palace Mandap", dress: "Royal traditional",
      blurb: "Under the mandap, before the sacred fire, two souls take seven steps into forever." }
  ]
};
