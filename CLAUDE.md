# CLAUDE.md

Royal wedding invitation for **Riya & Sagar** (2nd Feb 2027), sent by the **bride's family**.
Live: **https://riya-weds-sagar.onrender.com**. Read `README.md` for the full handoff (file map, scenes, client details, gotchas).

## Stack
Plain HTML/CSS/JS, no build step. GSAP 3.12.5 + ScrollTrigger, Lenis 1.0.42, Google Fonts (Cinzel, Cormorant Garamond, Great Vibes). Web Audio for effects. Python + Playwright + ffmpeg (imageio-ffmpeg) for the video/card export.

## Commands
```bash
python -m http.server 5527                # preview at http://localhost:5527 (not file://)
python tools/make_invite.py               # re-render exports/wedding-invite.mp4 + exports/wedding-card.png (~1 min)
```

## After every change
1. All wedding data lives in `js/config.js`. Change it there, not in the HTML.
2. If names, dates, venues, wording, the song or `css/style.css` changed, re-run `python tools/make_invite.py` so the video and QR card match the site (`film.html` loads `css/style.css` and renders at 720×1280 portrait, so phone media queries apply to the video too). The client keeps copies of `wedding-invite.mp4` and `wedding-card.png` on the Desktop (`C:\Users\Tanvi Nishad\OneDrive\Desktop`); refresh them after a re-render if asked.
3. Check at phone sizes (320×568, 375×812, 390×844, 430×932, 844×390 landscape). The pinned scenes (arrival, invitation, wedding) must fit one screen.
4. Commit, then push to **both** remotes: `git push origin main` and `git push invitation main`. Render auto-deploys from `invitation` (tanvi940/Wedding-Invitation) in about 40 s.
5. Add any new client decision to `README.md` under "Decisions already made by the client".

## Client decisions: do not undo
- From the bride's family: hosts "Sh. Rajendra & Smt. Sunita"; "son of Sh. Om Prakash Verma & Smt. Pooja Verma". Use **Sh./Smt.**, never Mr./Mrs. (client switched back on 12 Nov 2026).
- Dates use ordinals: 31st, 1st, 2nd (`ord()` in `js/build.js`).
- Names: "Galaxy Vega **Apartment**" (no s), "Khalsa **Garden**" (no s), house area written as **Nawada** (not Uttam Nagar). The map `query` fields keep the exact Google addresses.
- Ceremonies: Haldi, Mehendi & Sangeet, Chaak Bhaat (house); Lagan Sagai 5 PM and Wedding **8 PM** (hall). No Reception, no RSVP.
- Removed for good: Our Story, Gallery, real photos, the animated ritual scene, per-guest personalisation and guest lists. One common video and one common QR card.
- **No bells or chimes anywhere** (`RoyalAudio.allowBells = false`; video cues have empty `bells`/`chime`).
- Music: client's Jashn-e-Bahaara flute MP3 (`music/`, `musicFile` in config). Never autoplays; sound is opt-in.
- Names must look clear: separate script words with a spaced "WITH" between them. Gold script text needs top padding, because `background-clip:text` cuts off the swash of the S.
- Sent on WhatsApp as the video plus the QR card, never a bare link.
- **Hosting: Render only.** Netlify was tried and deleted on 12 Nov 2026 because the free plan injects a "Powered by Netlify" badge. Render adds no watermark. Don't suggest Netlify again; keep `siteURL`, the `og:` tags and the QR on the onrender.com address.

## Gotchas
- In timelines with `invalidateOnRefresh`, use `fromTo()`, not `from()`.
- A hidden or minimised Browser pane pauses rAF, so timelines look frozen and screenshots go black. Show the pane before visual checks.
- Python's http.server is cached by the browser: `fetch(url, {cache:'reload'})` the changed files before reloading.
- `window.__lenis.scrollTo(target, {immediate:true, force:true})` jumps reliably. Plain `scrollTo` gets overridden by Lenis.
- For a pinned scene, jump with `ScrollTrigger.getAll().find(s => s.trigger.id === 'arrival' && s.pin)` and use its `start`/`end`.
- Don't use GSAP `svgOrigin`/`transformOrigin` on the car's SVG parts in `js/scenes.js`: after a ScrollTrigger refresh the origin was recalculated, so the tyres flew across the screen and the door slid away. `arrivalSetup()` tweens a `rig` object and writes `rotate(a cx cy)` / `scale` transform attributes itself; keep it that way. (`film.js` still uses `svgOrigin`; that's fine because the film never refreshes.)
- Phone layout: the Wedding curtains stay 20% open (about 10% of the width each side), so content in that scene must keep clear of the edges. Wedding buttons stack on portrait phones; on sideways phones (height < 500) the intro crest is smaller (`crestScale()` in `js/intro.js`).
- Phones get `html.lite` (set in `index.html` only, never in `film.html`): no animated CSS/SVG blur filters, no backdrop blur on the fixed buttons, no gold shimmer, palace window glow filter added only after the windows are lit, no window flicker. These were what made the site stutter on phones (13 Nov 2026 screen recording). Don't add new animated `filter`/`backdrop-filter` effects for phones.
- Intro on slow phones: GSAP uses `lagSmoothing(100, 33)` during the intro and only switches to `lagSmoothing(0)` (for Lenis) in `start()` in `js/main.js`; `Intro.init` waits for fonts, page load, a visible tab and two frames before playing. Otherwise a busy phone jumps past the light and golden sparkle straight to the crest.
- `film.html` must stay deterministic: seeded random, fixed-step simulation, CSS transitions off.
- `.gitignore` excludes the outdated `Wedding-Details-Needed.docx`. The MP3 is committed, so keep both repos **private** (copyrighted song and home address).
- Ask the client before inventing content (stories, times, venues). Note open items in the README instead.

## Still open
Chaak Bhaat time and the bride's family surname.
