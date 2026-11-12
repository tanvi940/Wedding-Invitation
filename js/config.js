/* =========================================================
   WEDDING CONFIG — edit names, dates, venues and stories here.
   Photos: drop files into /images using the names below and they
   replace the illustrated placeholders automatically.
   ========================================================= */
window.WEDDING = {
  bride: "Riya",
  groom: "Sagar",
  initials: ["R", "S"],
  // Countdown target. Wedding start time not given yet — counting down to Lagan Sagai (5:00 PM, 2 Feb 2027).
  dateISO: "2027-02-02T17:00:00+05:30",
  city: "Faridabad",
  venue: "Khalsa Garden, Suraj Kund, Faridabad",
  families: "With the blessings of Shri Rajendra & Smt. Sunita and Shri Kaushal Verma & Smt. Pooja Verma",
  hashtag: "",
  // Where the website will live once hosted — the QR card points here
  siteURL: "https://your-wedding-site.example",

  // Our Story + Gallery: leave empty to hide those sections; fill to show them.
  // story:   { date: "2023-05-20", title: "First Meeting", text: "…", motif: "chai|mountain|diya|ring|lotus|moon", bg: "maroon|emerald|indigo|saffron|plum|teal", img: "images/story-1.jpg" }
  // gallery: { title: "…", place: "…", motif: "lotus", bg: "maroon", img: "images/gallery-1.jpg" }
  story: [],
  gallery: [],

  // date: ISO with +05:30. time: text shown to guests ("" if not decided yet).
  // scene: which animated scene shows this card — haldi | stage | mandala | diyas | wedding
  events: [
    { key: "haldi", scene: "haldi", icon: "haldi", name: "Haldi", tag: "The Golden Glow",
      date: "2027-01-31T12:00:00+05:30", time: "12:00 PM onwards", hours: 4,
      venue: "At our residence", dress: "",
      blurb: "Turmeric, laughter and marigolds — a sunny afternoon of blessings at home." },
    { key: "mehendi-sangeet", scene: "stage", icon: "sangeet", name: "Mehendi & Sangeet", tag: "Henna & Music",
      date: "2027-01-31T19:00:00+05:30", time: "7:00 PM onwards", hours: 4,
      venue: "At our residence", dress: "",
      blurb: "Henna, dholak and dancing — an evening of colour and music with the whole family." },
    { key: "chaak-bhaat", scene: "mandala", icon: "mehendi", name: "Chaak Bhaat", tag: "Family Blessings",
      date: "2027-02-01T00:00:00+05:30", time: "", hours: 0,
      venue: "At our residence", dress: "",
      blurb: "Cherished family traditions — the Chaak puja and the Bhaat, filled with blessings from the maternal family." },
    { key: "lagan-sagai", scene: "diyas", icon: "ring", name: "Lagan Sagai", tag: "The Sacred Promise",
      date: "2027-02-02T17:00:00+05:30", time: "5:00 PM onwards", hours: 2,
      venue: "Khalsa Garden, Suraj Kund, Faridabad", dress: "",
      blurb: "The two families come together for the sacred Lagan and Sagai rituals." },
    { key: "wedding", scene: "wedding", icon: "wedding", name: "The Wedding", tag: "Seven Sacred Vows",
      date: "2027-02-02T00:00:00+05:30", time: "", hours: 0,
      venue: "Khalsa Garden, Suraj Kund, Faridabad", dress: "",
      blurb: "Under the mandap, before the sacred fire, two souls take seven steps into forever." }
  ]
};
