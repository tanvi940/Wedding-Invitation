# CLAUDE.md

Royal wedding invitation for **Riya & Sagar** (2nd Feb 2027), sent by the **bride's family**.
Live: **https://riya-weds-sagar.netlify.app**. Read `README.md` for the full handoff (file map, scenes, client details, gotchas).

## Stack
Plain HTML/CSS/JS, no build step. GSAP 3.12.5 + ScrollTrigger, Lenis 1.0.42, Google Fonts (Cinzel, Cormorant Garamond, Great Vibes). Web Audio for effects. Python + Playwright + ffmpeg (imageio-ffmpeg) for the video/card export.

## Commands
```bash
python -m http.server 5527                # preview at http://localhost:5527 (not file://)
python tools/make_invite.py               # re-render exports/wedding-invite.mp4 + exports/wedding-card.png (~1 min)
```

## After every change
1. All wedding data lives in `js/config.js`. Change it there, not in the HTML.
2. If names, dates, venues, wording or the song changed, re-run `python tools/make_invite.py` so the video and QR card match the site.
3. Check at phone sizes (320×568, 375×812, 390×844, 430×932, 844×390 landscape). The pinned scenes (arrival, invitation, wedding) must fit one screen.
4. Commit, then push to **both** remotes: `git push origin main` and `git push invitation main` (Render backup auto-deploys from `invitation`). Then redeploy Netlify (the live site) as described in README "Hosting".
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

## Gotchas
- In timelines with `invalidateOnRefresh`, use `fromTo()`, not `from()`.
- A hidden or minimised Browser pane pauses rAF, so timelines look frozen and screenshots go black. Show the pane before visual checks.
- Python's http.server is cached by the browser: `fetch(url, {cache:'reload'})` the changed files before reloading.
- `window.__lenis.scrollTo(target, {immediate:true, force:true})` jumps reliably. Plain `scrollTo` gets overridden by Lenis.
- For a pinned scene, jump with `ScrollTrigger.getAll().find(s => s.trigger.id === 'arrival' && s.pin)` and use its `start`/`end`.
- `film.html` must stay deterministic: seeded random, fixed-step simulation, CSS transitions off.
- `.gitignore` excludes the outdated `Wedding-Details-Needed.docx`. The MP3 is committed, so keep both repos **private** (copyrighted song and home address).
- Ask the client before inventing content (stories, times, venues). Note open items in the README instead.

## Still open
Chaak Bhaat time and the bride's family surname.
