# Royal Wedding Invitation — Website + WhatsApp Video + QR Card

An animation-rich, cinematic **royal Indian wedding invitation**, delivered in three ways:

| Deliverable | File | What it is |
|---|---|---|
| Interactive website | `index.html` | Scroll-driven "royal wedding film": palace doors, vintage car arrival, envelope, story timeline, gallery, 4 ceremony scenes, rings, countdown, finale |
| WhatsApp video | `exports/wedding-invite.mp4` | 35-second portrait (720×1280) film with synthesized sound, rendered frame-by-frame from `film.html` |
| WhatsApp QR card | `exports/wedding-card.png` | 1080×1350 gold card; its QR opens the website |

Guests receive **the video + the card on WhatsApp — never a text link**. They scan the card's QR to open the full website.

> **Status:** fully built and tested on desktop and phone sizes. The couple's real details from the client's checklist are applied (**Riya & Sagar**, 5 ceremonies, Faridabad). Photos, story, wedding start time and hosting are still pending (see "Still to do").

---

## Quick start

```bash
# preview the website (fonts and scripts need a local server, not file://)
python -m http.server 5527
# open http://localhost:5527            → website
# open http://localhost:5527/film.html  → video source (static until renderFrame(t) is called)
# open http://localhost:5527/card.html  → QR card

# re-make the WhatsApp video + card (about 1 minute) → exports/
pip install playwright imageio-ffmpeg
python -m playwright install chromium
python tools/make_invite.py
```

No build step, no npm. Plain HTML/CSS/JS with CDN libraries:
- GSAP 3.12.5 + ScrollTrigger (cdnjs)
- Lenis 1.0.42 smooth scroll (unpkg, optional — the site falls back to native scroll)
- qrcode-generator 1.4.4 (cdnjs, card only)
- Google Fonts: Cinzel, Cormorant Garamond, Great Vibes

---

## Where to edit things

**Almost every change happens in `js/config.js`:** bride, groom, initials, `dateISO` (countdown), city, venue, families line, hashtag, `siteURL` (QR target), `story[]`, `gallery[]`, `events[]`. The website, video and card all read from it.

**Photos:** create an `images/` folder. Any missing file falls back to an illustrated gold placeholder (`<img onerror="this.remove()">`).

| File name | Used for |
|---|---|
| `couple.jpg` | Couple reveal after the car arrives (portrait 3:4) |
| `story-1.jpg` … `story-4.jpg` | "Our Story" timeline |
| `gallery-1.jpg` … `gallery-6.jpg` | Horizontal gallery |

**Text that isn't in config:**
- The "॥ Shree Ganeshaya Namah ॥" kicker is in `index.html`, `film.html` and `card.html`.
- The "Dear Family & Friends," greeting is in `film.html` and `card.html`.

**Colours and fonts:** CSS variables at the top of `css/style.css`.

After any change, re-run `python tools/make_invite.py` so the video and card match.

---

## File map

```
index.html          Website markup (all sections). Content is filled by js/build.js from config.
film.html           Portrait film page used ONLY to render the MP4 (seeded Math.random in <head>).
card.html           QR card page (inline CSS + script; draws QR from WEDDING.siteURL).
css/style.css       All website styles + responsive (≤768px) + reduced-motion rules.
css/film.css        Film-only overrides (disables CSS transitions; closing card styles).
js/config.js        ★ Wedding data (names, dates, events, story, gallery, siteURL).
js/audio.js         RoyalAudio: Web Audio synth (bells, door creak, whoosh, car engine, wind,
                    Karplus-Strong sitar/tanpura music). Live mode + renderSoundtrack()
                    for the video (OfflineAudioContext → base64 WAV).
js/fx.js            FX: canvas particle systems on one gsap.ticker — cursor gold dust, floating
                    and stream petals, bursts, Fireworks, Confetti, Rain, NameParticles; helpers
                    fit/glow/drawPetal/sample/split.
js/build.js         Build: generates SVG art (emblem, palace, car with rotating wheels and
                    opening door, couple silhouette, mandala, mandap, chandelier, peacock,
                    marigolds) and data-driven markup; fills [data-w] text; sizes card borders.
js/intro.js         Intro sequence: light → dust → particle emblem → doors → typing →
                    "Open Invitation" → 3D door swing, camera zoom, petal storm, flash.
js/scenes.js        Every ScrollTrigger scene + micro-interactions (tilt, magnetic, ripple,
                    cursor, menu, .ics calendar download).
js/main.js          Bootstrap: Build → Lenis → FX → Scenes → Intro; scroll unlock after intro.
js/film.js          Deterministic film timeline. window.renderFrame(t) seeks the GSAP timeline,
                    steps particles at a fixed 60 Hz, pins CSS animations to t, then draws.
tools/make_invite.py  Playwright + ffmpeg: renders soundtrack, 1050 JPEG frames → H.264 MP4
                    (yuv420p, AAC), and screenshots the card → exports/.
exports/            Last rendered video + card (placeholder content).
Wedding-Details-Needed-v2.docx  Checklist the couple fills in (names, ceremonies, photos, style,
                    website address).
```

---

## Website scene order (`index.html`)

1. **Intro** (fixed overlay, `js/intro.js`): tiny light, then golden dust, then particles form the emblem, then palace doors with a light leak, then letter-by-letter text. The "Sound on" toggle lets the guest opt in; nothing autoplays. "Open Invitation" swings the doors open in 3D, zooms the camera in, fires the petal storm and flashes to the courtyard. "Skip intro" is available.
2. **Arrival** (`#arrival`, pinned scrub about 5.6 viewport heights): an autoplay pan with windows lighting one by one, lanterns and petals. On scroll: a distant headlight, the car enters (wheel rotation is mathematically synced to distance), headlight beams, dust and petals react to the car, a brake dip, a camera zoom to the door, the door opens, an iris reveal of the couple, and the names written in gold.
3. **Invitation envelope** (`#invitation`, pinned): sheer curtains open, the wax seal breaks, the flap opens, the card slides out and its gold border draws itself.
4. **Our Story** (`#story`): a self-drawing gold line, glowing markers, circle/curtain photo reveals, counting years, peacock motifs.
5. **Gallery** (`#gallery`, pinned horizontal): 3D-tilting arched frames, a different mask reveal per frame, background colour shifts.
6. **Events** (`#events`), each with a unique entrance:
   - Haldi: marigold bloom border, inset wipe, marigold rain
   - Mehendi: henna mandala draws itself, circular card reveal
   - Sangeet: sweeping stage beams, waveform, sparkles, neon flicker
   - Wedding (pinned): red velvet curtains part to reveal the mandap with sacred fire
7. **Rings** (`#rings`, pinned): two 3D rings spin together, then an infinity path draws itself.
8. **Countdown** (`#countdown`): digit roll-in, live flip digits, golden fireworks.
9. **Finale** (`#finale`): couple's names formed by gold particles (they react to the cursor and scatter on click), rose rain, fireworks, "Relive the invitation" button.

Global layers: a custom cursor and gold dust (desktop only), ambient floating petals, an animated menu, a floating sound button.

## Video timeline (`js/film.js`, 35 s @ 30 fps)

| Time | What happens |
|---|---|
| 0–4.2 s | Light, dust, emblem forms |
| 4.2–6 s | Emblem moves to the arch; doors appear |
| 6–8.8 s | "You are invited" text |
| 9.2–12.2 s | Doors open, petals fly, zoom, flash |
| 12.2–16 s | Palace pan, lights, lanterns |
| 16–20.4 s | Car drive-in |
| 21–23 s | Zoom to car; door opens |
| 23.5–27 s | Couple reveal and names |
| 28.6–35 s | Closing card: "Dear Family & Friends", date, venue, 4 ceremonies, "Scan your invitation card…" |

Sound cues are in `FILM.cues`.

---

## Details supplied by the client (from the filled checklist)

| Item | Value |
|---|---|
| Couple | Riya & Sagar. Initials R & S (derived). |
| Bride's parents | Rajendra & Sunita (surname not given) |
| Groom's parents | Kaushal Verma & Pooja Verma |
| Haldi | 31 Jan 2027, 12:00 PM onwards, at the family residence |
| Mehendi & Sangeet (combined) | 31 Jan 2027, 7:00 PM onwards, at residence |
| Chaak Bhaat | 1 Feb 2027, time not given, at residence |
| Lagan Sagai | 2 Feb 2027, 5:00 PM onwards. **Venue not given; assumed Khalsa Garden.** |
| Wedding | 2 Feb 2027, **time not given**, Khalsa Garden, Suraj Kund, Faridabad |

Left blank by the client: initials, family line, blessing line, hashtag, dress codes, descriptions (written by us), story, photos, colours, language, music, website address.

Each event in `config.js` has:
- `time`: display text; empty means date only, and the calendar entry becomes all-day.
- `scene`: which animated scene shows the card. Haldi uses the marigold scene; Mehendi & Sangeet the stage lights; Chaak Bhaat the henna mandala; Lagan Sagai the diya field (`#lagan`, new); Wedding the curtains and mandap.

The countdown targets Lagan Sagai (2 Feb, 5 PM) until the wedding time is known.

## Decisions already made by the client (do not undo)

- **Reception was removed.** The ceremonies are the five listed above.
- **Our Story and Gallery sections are hidden** while `story`/`gallery` are empty in config (the sections and their menu links are removed at build time). Do **not** invent story text. Fill the arrays when the client sends real moments and photos.
- **The RSVP section ("Will You Join Us?") was removed** entirely. `scenes.js` `rsvp()` safely no-ops; leftover RSVP CSS is harmless.
- **No personalisation and no guest list.** One common video and one common card for everyone (an earlier per-guest `?to=Name` version was intentionally removed).
- **Delivered on WhatsApp as a video plus a QR card, not as a link.**
- **Must be phone-friendly.** Mobile tweaks live in the `@media (max-width:768px)` block; `FX.MOBILE` reduces particles.
- **Sound must never autoplay.** It is opt-in only.

## Still to do (waiting on the client)

1. **Open questions for the client:**
   - Wedding (pheras) start time, and the Chaak Bhaat time
   - Lagan Sagai venue: confirm Khalsa Garden
   - Bride's family surname, for the family blessing line
   - Couple photo, story moments and photos, gallery photos (Story and Gallery are hidden until then)
   - Optional: dress codes, hashtag, colour theme, Hindi names, music feel
2. **Hosting:** deploy the folder as a static site (Netlify, Vercel or GitHub Pages all work; no build needed). Then set `siteURL` in `js/config.js` and re-run `tools/make_invite.py` so the QR works. **The QR currently points to `https://your-wedding-site.example` (placeholder).**
3. **Optional, not started:**
   - Add a "long-press the card → Scan QR" hint, because guests view the card on the same phone they would scan with.
   - Add Hindi (Devanagari) names.

---

## Gotchas learned the hard way

- **`from()` tweens inside timelines with `invalidateOnRefresh: true` break.** On refresh they re-record their "end" as the hidden state, so elements stay invisible. Use `fromTo()` there (see the arrival and rings timelines).
- **Scroll restoration:** `history.scrollRestoration = 'manual'` is set in `<head>`, and `main.js` calls `toTop()` on start and unlock. Without this, reloads land mid-page with the car already parked.
- **Do not put `opacity < 1` or `filter` on `.doors` while they rotate.** It flattens the 3D (preserve-3d). `intro.js` clears the filter after the fade-in.
- **The film must be deterministic.** It uses seeded `Math.random`, fixed-step simulation, `tl.seek`, and `document.getAnimations()` pinned to `t`. CSS transitions are disabled in film mode. Lantern glow uses `filter: opacity()` because the CSS flicker animation owns `opacity`.
- **Video encoding:** JPEG frames are full-range; the exporter converts to `yuv420p` (tv range) and boosts audio by 1.8× for WhatsApp compatibility.
- **Background browser tabs pause `requestAnimationFrame`,** so GSAP timelines appear stuck when testing in a hidden pane. That is the cause, not a bug.
- **Missing photos produce 404s in the console.** This is expected: placeholders take over.
- **Reduced motion:** `html.rm` (set in `<head>`) skips pins and particles and shows final states. CSS defaults are the final visible state; JS sets the hidden starting states.
