/* =========================================================
   WEDDING CONFIG — edit names, dates, venues and stories here.
   Photos: drop files into /images using the names below and they
   replace the illustrated placeholders automatically.
   ========================================================= */
window.WEDDING = {
  bride: "Riya",
  groom: "Sagar",
  initials: ["R", "S"],
  // Countdown target: the wedding, 8:00 PM, 2 Feb 2027.
  dateISO: "2027-02-02T20:00:00+05:30",
  city: "Faridabad",
  venue: "Khalsa Garden, Suraj Kund, Faridabad",
  // Venue section: one gold-framed Google Map per place. Events point at a place via place.
  //   query = what Google Maps searches (exact address works best)
  //   link  = the Google Maps share link (buttons open this exact pin when set)
  venues: [
    { key: "house", label: "Our Residence", name: "Galaxy Vega Apartment",
      area: "Tower 3, Plot 3-B, Nawada, New Delhi 110059",
      query: "Galaxy Vega Apartment Tower 3, Plot no. 3-B, Nawada Rd, Nawada Majra Village, Uttam Nagar, New Delhi, Delhi 110059",
      link: "https://maps.app.goo.gl/UWJPkX2jKbTH4o6j7" },
    { key: "hall", label: "Wedding Venue", name: "Khalsa Garden",
      area: "Suraj Kund Badkhal Road, Green Fields Colony, Faridabad 121004",
      query: "Khalsa Gardens, Suraj Kund Badkhal Rd, Aravali Hills, Green Fields Colony, Faridabad, Haryana 121004",
      link: "https://maps.app.goo.gl/nMGBmLycufdgMkjp6" }
  ],
  // The invitation is sent by the BRIDE'S family (hosts). "Our residence" = the bride's home.
  hosts: "Sh. Rajendra & Smt. Sunita",                       // bride's parents (surname still to confirm)
  groomParents: "Sh. Om Prakash Verma & Smt. Pooja Verma",
  families: "With the blessings of Sh. Rajendra & Smt. Sunita and Sh. Om Prakash Verma & Smt. Pooja Verma",
  hashtag: "",
  // Background song: put the file in /music and set its path here (e.g. "music/song.mp3").
  // Empty = the built-in sitar-style music. Used by the website and the WhatsApp video.
  musicFile: "music/jashn-e-bahaara-flute.mp3",   // Jashn-e-Bahaara (instrumental flute), supplied by the client
  musicStart: 0,                                   // seconds into the song where the video's music begins
  // Where the website will live once hosted — the QR card points here
  siteURL: "https://riya-weds-sagar.onrender.com",

  // No real photos are used anywhere: the couple appears as animated illustrations
  // (car reveal). The story/gallery sections were removed.
  story: [],
  gallery: [],

  // date: ISO with +05:30. time: text shown to guests ("" if not decided yet).
  // scene: which animated scene shows this card — haldi | stage | mandala | diyas | wedding
  events: [
    { key: "haldi", scene: "haldi", icon: "haldi", name: "Haldi", tag: "The Golden Glow",
      date: "2027-01-31T12:00:00+05:30", time: "12:00 PM onwards", hours: 4,
      place: "house", venue: "Our Residence, Nawada, New Delhi", dress: "",
      blurb: "Turmeric, laughter and marigolds — a sunny afternoon of blessings at home." },
    { key: "mehendi-sangeet", scene: "stage", icon: "sangeet", name: "Mehendi & Sangeet", tag: "Henna & Music",
      date: "2027-01-31T19:00:00+05:30", time: "7:00 PM onwards", hours: 4,
      place: "house", venue: "Our Residence, Nawada, New Delhi", dress: "",
      blurb: "Henna, dholak and dancing — an evening of colour and music with the whole family." },
    { key: "chaak-bhaat", scene: "mandala", icon: "mehendi", name: "Chaak Bhaat", tag: "Family Blessings",
      date: "2027-02-01T00:00:00+05:30", time: "", hours: 0,
      place: "house", venue: "Our Residence, Nawada, New Delhi", dress: "",
      blurb: "Cherished family traditions — the Chaak puja and the Bhaat, filled with blessings from the maternal family." },
    { key: "lagan-sagai", scene: "diyas", icon: "ring", name: "Lagan Sagai", tag: "The Sacred Promise",
      date: "2027-02-02T17:00:00+05:30", time: "5:00 PM onwards", hours: 2,
      place: "hall", venue: "Khalsa Garden, Suraj Kund, Faridabad", dress: "",
      blurb: "The two families come together for the sacred Lagan and Sagai rituals." },
    { key: "wedding", scene: "wedding", icon: "wedding", name: "The Wedding", tag: "Seven Sacred Vows",
      date: "2027-02-02T20:00:00+05:30", time: "8:00 PM onwards", hours: 5,
      place: "hall", venue: "Khalsa Garden, Suraj Kund, Faridabad", dress: "",
      blurb: "Under the mandap, before the sacred fire, two souls take seven steps into forever." }
  ]
};
