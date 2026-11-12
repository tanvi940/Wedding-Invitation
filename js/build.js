/* =========================================================
   BUILD — generates the SVG artwork and data-driven markup
   ========================================================= */
(function () {
  const W = window.WEDDING, { rand, MOBILE } = FX;
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  let uid = 0;
  const tz = { timeZone: 'Asia/Kolkata' };
  const fmtDay = iso => new Date(iso).toLocaleDateString('en-GB', Object.assign({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }, tz));
  const fmtShort = iso => new Date(iso).toLocaleDateString('en-GB', Object.assign({ day: 'numeric', month: 'short' }, tz));
  // "Sunday, 31 January 2027 · 12:00 PM onwards"  /  short: "31 Jan · 12:00 PM onwards"
  const when = (e, short) => (short ? fmtShort(e.date) : fmtDay(e.date)) + (e.time ? ' · ' + e.time : '');

  /* ---------- royal emblem / monogram ---------- */
  function emblem() {
    const id = 'eg' + (++uid), [a, b] = W.initials;
    let petals = '';
    for (let i = 0; i < 24; i++) petals += `<ellipse cx="120" cy="9" rx="2.6" ry="6.5" transform="rotate(${i * 15} 120 120)"/>`;
    return `<svg viewBox="0 0 240 240" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2bf"/><stop offset=".35" stop-color="#e9c75f"/><stop offset=".62" stop-color="#a87b25"/><stop offset="1" stop-color="#f5d77a"/></linearGradient></defs>
<g fill="none" stroke="url(#${id})"><circle cx="120" cy="120" r="104" stroke-width="3"/><circle cx="120" cy="120" r="94" stroke-width="1" stroke-dasharray="1.5 5"/><circle cx="120" cy="120" r="84" stroke-width="1.2"/></g>
<g fill="url(#${id})">${petals}</g>
<path d="M92 72 L100 52 L110 66 L120 44 L130 66 L140 52 L148 72 Q120 66 92 72Z" fill="url(#${id})"/>
<text x="120" y="146" text-anchor="middle" fill="url(#${id})" font-family="Cinzel, serif" font-size="50" font-weight="600">${a}<tspan font-family="Great Vibes, cursive" font-size="38" font-weight="400" dx="3" dy="-4">&amp;</tspan><tspan dx="3" dy="4">${b}</tspan></text>
<path d="M78 168 Q120 184 162 168" fill="none" stroke="url(#${id})" stroke-width="1.4"/><circle cx="120" cy="178" r="2.6" fill="url(#${id})"/></svg>`;
  }

  /* ---------- palace ---------- */
  function palace() {
    const arch = (x, y, w, h, cls) => `<path class="${cls || 'win'}" d="M${x} ${y + h}V${y + w * 0.55}Q${x} ${y} ${x + w / 2} ${y - w * 0.18}Q${x + w} ${y} ${x + w} ${y + w * 0.55}V${y + h}Z"/>`;
    const dome = (cx, base, wd, ht) => `<path d="M${cx - wd / 2} ${base}C${cx - wd / 2} ${base - ht * 0.75} ${cx - wd * 0.12} ${base - ht * 0.85} ${cx} ${base - ht}C${cx + wd * 0.12} ${base - ht * 0.85} ${cx + wd / 2} ${base - ht * 0.75} ${cx + wd / 2} ${base}Z"/><path class="finial" d="M${cx} ${base - ht}V${base - ht * 1.35}"/><circle class="finial-ball" cx="${cx}" cy="${base - ht * 1.18}" r="${Math.max(4, wd * 0.035)}"/>`;
    const merlons = (x1, x2, y) => { let m = ''; for (let x = x1; x < x2 - 10; x += 36) m += `<rect x="${x + 4}" y="${y - 14}" width="20" height="14" rx="3"/>`; return m; };
    const chhatri = (cx, base) => `<rect x="${cx - 34}" y="${base - 10}" width="68" height="10"/><rect x="${cx - 28}" y="${base - 56}" width="6" height="46"/><rect x="${cx + 22}" y="${base - 56}" width="6" height="46"/><rect x="${cx - 38}" y="${base - 64}" width="76" height="9" rx="2"/>${dome(cx, base - 64, 64, 50)}`;
    let s = `<svg class="palace" viewBox="0 0 2400 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs>
<linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4c2b3b"/><stop offset=".5" stop-color="#2c1622"/><stop offset="1" stop-color="#170a11"/></linearGradient>
<linearGradient id="wallG2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1420"/><stop offset="1" stop-color="#0f060a"/></linearGradient>
<radialGradient id="gateG" cx=".5" cy=".75" r=".75"><stop offset="0" stop-color="#fff6d8"/><stop offset=".45" stop-color="#ffc35a"/><stop offset="1" stop-color="#a8520e"/></radialGradient>
<filter id="winGlow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;
    s += `<g fill="url(#wallG2)"><rect x="40" y="600" width="2320" height="300"/>${merlons(40, 2360, 600)}</g>`;
    s += `<g fill="url(#wallG)" stroke="rgba(255,225,180,.07)" stroke-width="2">`;
    s += `<rect x="300" y="470" width="1800" height="430"/>${merlons(300, 2100, 470)}`;
    s += `<rect x="840" y="330" width="720" height="140"/>${merlons(840, 1560, 330)}`;
    s += `<rect x="1060" y="270" width="280" height="62"/>${dome(1200, 272, 300, 190)}`;
    s += dome(900, 332, 90, 80) + dome(1500, 332, 90, 80);
    [250, 2150].forEach(cx => { s += `<rect x="${cx - 80}" y="300" width="160" height="600"/><rect x="${cx - 92}" y="288" width="184" height="14" rx="3"/>${dome(cx, 290, 150, 120)}`; });
    [520, 720, 1680, 1880].forEach(cx => { s += chhatri(cx, 470); });
    s += `<rect x="1120" y="600" width="160" height="300" fill="#12050a"/></g>`;
    s += `<g stroke="rgba(212,175,55,.24)" stroke-width="2" fill="none"><path d="M300 600H1110M1290 600H2100M300 760H1110M1290 760H2100M840 420H1560"/></g>`;
    let wins = '';
    for (let x = 340; x < 2080; x += 72) { if (x > 1080 && x < 1300) continue; wins += arch(x, 505, 32, 70); }
    for (let x = 360; x < 2060; x += 96) { if (x > 1060 && x < 1320) continue; wins += arch(x, 640, 40, 90); }
    for (let x = 880; x < 1530; x += 64) wins += arch(x, 362, 30, 66);
    [250, 2150].forEach(cx => [370, 510, 650, 790].forEach(y => { wins += arch(cx - 16, y, 32, 68); }));
    s += `<g class="wins" filter="url(#winGlow)">${wins}${arch(1130, 640, 140, 260, 'gate-lit')}</g>`;
    s += `<g fill="none" stroke="#d4af37" stroke-width="3" opacity=".55"><path d="M1124 900V675Q1124 616 1200 600Q1276 616 1276 675V900"/></g>`;
    return s.replace('class="gate-lit"', 'class="gate-lit" fill="url(#gateG)"') + '</svg>';
  }

  /* ---------- vintage wedding car (layered SVG) ---------- */
  function car() {
    const wheel = (cx, cy) => {
      let sp = '';
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; sp += `<line x1="${cx + Math.cos(a) * 7}" y1="${cy + Math.sin(a) * 7}" x2="${cx + Math.cos(a) * 27}" y2="${cy + Math.sin(a) * 27}"/>`; }
      return `<g class="wheel" data-o="${cx} ${cy}"><circle cx="${cx}" cy="${cy}" r="44" fill="url(#tyre)"/><circle cx="${cx}" cy="${cy}" r="34" fill="none" stroke="#efe6d4" stroke-width="5"/><circle cx="${cx}" cy="${cy}" r="29" fill="#2a161c"/><g stroke="#d8bf74" stroke-width="2.2">${sp}</g><circle cx="${cx}" cy="${cy}" r="9" fill="url(#chrome)"/><circle cx="${cx}" cy="${cy}" r="3.4" fill="#8a6420"/><circle cx="${cx + 20}" cy="${cy - 20}" r="2" fill="#f5d77a"/></g>`;
    };
    let garland = '';
    for (let i = 0; i <= 20; i++) { const t = i / 20, x = (1 - t) * (1 - t) * 376 + 2 * (1 - t) * t * 480 + t * t * 584, y = (1 - t) * (1 - t) * 94 + 2 * (1 - t) * t * 134 + t * t * 104; garland += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="${['#ff8a00', '#ffc233', '#f59e0b', '#fff3d6'][i % 4]}"/>`; }
    return `<svg class="car" viewBox="0 0 640 240" aria-hidden="true"><defs>
<linearGradient id="carBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8243f"/><stop offset=".45" stop-color="#6d0c22"/><stop offset="1" stop-color="#2a030c"/></linearGradient>
<linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="#c9c0b2"/><stop offset=".55" stop-color="#6f6860"/><stop offset="1" stop-color="#ece6da"/></linearGradient>
<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a3346"/><stop offset=".5" stop-color="#140c16"/><stop offset="1" stop-color="#2e1d2a"/></linearGradient>
<radialGradient id="lamp"><stop offset="0" stop-color="#fffef5"/><stop offset=".55" stop-color="#ffe9a8"/><stop offset="1" stop-color="#d4a640"/></radialGradient>
<linearGradient id="interior" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0c4"/><stop offset=".6" stop-color="#f2b552"/><stop offset="1" stop-color="#a8520e"/></linearGradient>
<radialGradient id="tyre"><stop offset=".7" stop-color="#1a1416"/><stop offset=".88" stop-color="#2e2629"/><stop offset="1" stop-color="#0a0809"/></radialGradient></defs>
<g class="car-chassis"><g class="car-chassis-bob">
<path d="M28 176 L28 122 Q30 96 62 93 L112 90 L128 42 Q132 31 146 31 L330 31 Q344 31 350 42 L372 92 L556 98 Q584 100 590 122 L592 172 Z" fill="url(#carBody)"/>
<rect x="138" y="25" width="200" height="9" rx="4.5" fill="#1b0a0f"/>
<path d="M60 104 L370 104 L556 108" stroke="rgba(255,255,255,.28)" stroke-width="2" fill="none"/>
<path d="M32 132 L590 136" stroke="#d4af37" stroke-width="1.6" fill="none"/>
<path d="M140 44 L190 44 L190 86 L128 86 Z" fill="url(#glass)"/>
<path d="M276 44 L332 44 L350 86 L276 86 Z" fill="url(#glass)"/>
<path d="M150 46 L170 46 L156 84 L140 84Z" fill="rgba(255,255,255,.07)"/>
<line x1="270" y1="40" x2="270" y2="172" stroke="rgba(0,0,0,.45)" stroke-width="1.5"/>
<g class="car-interior" opacity="0"><rect x="198" y="40" width="68" height="134" fill="url(#interior)"/><path d="M204 120 Q232 104 262 120 L262 172 L204 172Z" fill="#7a1a10" opacity=".45"/></g>
<g class="car-door"><path d="M198 40 L266 40 L266 174 L198 174 Z" fill="url(#carBody)" stroke="rgba(212,175,55,.65)" stroke-width="1.2"/><rect x="204" y="46" width="56" height="40" rx="3" fill="url(#glass)"/><path d="M200 132 L264 133" stroke="#d4af37" stroke-width="1.6"/><rect x="246" y="112" width="14" height="3.4" rx="1.7" fill="url(#chrome)"/></g>
${wheel(150, 190)}${wheel(500, 190)}
<path d="M84 194 Q90 126 150 124 Q210 126 216 194 L204 194 Q200 140 150 138 Q100 140 96 194 Z" fill="url(#carBody)"/>
<path d="M432 194 Q440 122 500 122 Q566 124 590 160 L604 194 L590 194 Q568 140 500 136 Q450 140 446 194 Z" fill="url(#carBody)"/>
<rect x="210" y="180" width="232" height="9" rx="3" fill="#1a0a0e"/><path d="M212 180 H440" stroke="url(#chrome)" stroke-width="1.6"/>
<rect x="582" y="98" width="16" height="74" rx="3" fill="url(#chrome)"/><g stroke="#6f6860" stroke-width="1"><path d="M586 104V166M590 104V166M594 104V166"/></g>
<path d="M587 99 L592 84 L601 88 L594 94 Z" fill="url(#chrome)"/>
<rect x="586" y="176" width="46" height="8" rx="4" fill="url(#chrome)"/><rect x="6" y="172" width="32" height="8" rx="4" fill="url(#chrome)"/>
<circle cx="32" cy="118" r="5" fill="#ff3b3b" opacity=".85"/>
<circle cx="568" cy="106" r="16" fill="url(#chrome)"/><circle class="lamp-core" cx="570" cy="106" r="11.5" fill="url(#lamp)"/>
<path d="M548 114 V64" stroke="url(#chrome)" stroke-width="2"/><path class="pennant" d="M548 64 L580 70 L548 78 Z" fill="#d4af37"/>
${garland}<circle cx="590" cy="134" r="8" fill="#c21f45"/><circle cx="590" cy="134" r="4" fill="#f07b95"/>
</g></g></svg>`;
  }

  /* ---------- couple silhouette (fallback when no photo) ---------- */
  function couple() {
    return `<svg viewBox="0 0 300 400" aria-hidden="true"><defs><linearGradient id="cpl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0c0"/><stop offset=".5" stop-color="#d4af37"/><stop offset="1" stop-color="#7a5518"/></linearGradient></defs>
<g fill="url(#cpl)">
<path d="M88 74 Q90 50 112 48 Q134 50 134 72 Q124 66 112 67 Q98 66 88 74Z"/><path d="M124 52 Q134 30 127 16 Q142 32 130 55Z"/>
<circle cx="112" cy="86" r="17"/><rect x="106" y="100" width="12" height="10"/>
<path d="M84 112 Q112 100 140 112 L150 292 Q112 302 74 292 Z"/>
<path d="M88 292 L92 392 L106 392 L110 298Z M114 298 L118 392 L132 392 L136 292Z"/>
<path d="M136 116 Q160 160 168 210 L158 214 Q148 168 130 130Z"/>
<path d="M168 88 Q172 54 192 52 Q214 54 218 90 L242 254 Q192 240 146 256 Z" opacity=".45"/>
<circle cx="192" cy="88" r="15"/>
<path d="M176 106 Q192 100 208 106 L206 170 L178 170Z"/>
<path d="M178 166 L206 166 Q264 300 266 392 L120 392 Q122 300 178 166Z"/>
<path d="M178 112 Q164 160 166 210 L176 210 Q176 168 186 124Z"/>
<circle cx="167" cy="212" r="6"/></g>
<g fill="none" stroke="#3a0d16" stroke-width="1.2" opacity=".5"><path d="M112 120 V286"/><path d="M150 330 Q192 318 236 330 M140 360 Q192 346 250 360"/></g></svg>`;
  }

  /* ---------- line-art motifs for placeholder photos ---------- */
  const MOTIF = {
    chai: '<svg viewBox="0 0 100 100"><path d="M18 46h26v12a13 13 0 0 1-26 0z"/><path d="M44 50h4a5 5 0 0 1 0 10h-5"/><path d="M54 52h26v10a13 13 0 0 1-26 0z"/><path d="M26 40c0-6 6-6 6-12M36 40c0-6 6-6 6-12M62 46c0-6 6-6 6-12M72 46c0-6 6-6 6-12"/><path d="M10 80h80"/></svg>',
    mountain: '<svg viewBox="0 0 100 100"><path d="M6 78 L34 34 L50 56 L64 40 L94 78 Z"/><path d="M28 44 L34 34 L40 44"/><circle cx="72" cy="22" r="8"/><path d="M14 88h72"/></svg>',
    diya: '<svg viewBox="0 0 100 100"><path d="M18 60h64c-3 13-17 20-32 20s-29-7-32-20z"/><path d="M50 52c-9-9-6-19 0-32 6 13 9 23 0 32z"/><path d="M50 46c-3-3-2-7 0-11 2 4 3 8 0 11z"/><path d="M30 88h40"/><path d="M14 36l4 4M86 36l-4 4M50 8v4"/></svg>',
    ring: '<svg viewBox="0 0 100 100"><circle cx="50" cy="60" r="24"/><circle cx="50" cy="60" r="18"/><path d="M40 30 L50 22 L60 30 L50 40 Z"/><path d="M40 30H60M50 22V40"/><path d="M22 20l3 3M78 20l-3 3M14 50h5M81 50h5"/></svg>',
    lotus: '<svg viewBox="0 0 100 100"><path d="M50 74c-10-10-10-30 0-46 10 16 10 36 0 46z"/><path d="M50 74c-18-2-28-16-30-32 14 2 26 12 30 32z"/><path d="M50 74c18-2 28-16 30-32-14 2-26 12-30 32z"/><path d="M50 74c-22 4-36-2-42-12 14-4 30 0 42 12zM50 74c22 4 36-2 42-12-14-4-30 0-42 12z"/><path d="M20 86h60"/></svg>',
    moon: '<svg viewBox="0 0 100 100"><path d="M62 18a30 30 0 1 0 22 46 26 26 0 1 1-22-46z"/><path d="M24 22l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM76 82l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z"/></svg>'
  };
  const media = (src, alt, motif, bg) => `<div class="art" data-bg="${bg || 'maroon'}">${MOTIF[motif] || MOTIF.lotus}</div><img src="${src}" alt="${alt}" loading="lazy" decoding="async" onerror="this.remove()">`;

  function storyHTML() {
    return W.story.map((s, i) => {
      const d = new Date(s.date + 'T12:00:00'), side = i % 2 ? 'right' : 'left';
      return `<article class="milestone ${side}">
<div class="ms-marker" aria-hidden="true"></div>
<figure class="ms-photo"><div class="ms-media">${media(s.img, s.title, s.motif, s.bg)}</div>${i % 2 ? '<span class="ms-curtain l"></span><span class="ms-curtain r"></span>' : ''}</figure>
<div class="ms-text"><p class="ms-date"><span class="ms-day">${String(d.getDate()).padStart(2, '0')}</span><span class="ms-month">${d.toLocaleString('en', { month: 'long' })}</span><span class="ms-year" data-y="${d.getFullYear()}">${d.getFullYear()}</span></p>
<h3 class="ms-title">${s.title}</h3><p class="ms-body">${s.text}</p></div></article>`;
    }).join('');
  }

  function galleryHTML() {
    return W.gallery.map(g => `<figure class="gal-item"><div class="frame3d"><div class="frame-inner"><div class="media">${media(g.img, g.title, g.motif, g.bg)}</div></div></div><figcaption><em>${g.title}</em>${g.place}</figcaption></figure>`).join('');
  }

  const ICON = {
    haldi: '<svg class="ec-icon" viewBox="0 0 64 64"><circle cx="32" cy="32" r="6"/>' + Array.from({ length: 10 }, (_, i) => `<ellipse cx="32" cy="17" rx="4.5" ry="9" transform="rotate(${i * 36} 32 32)"/>`).join('') + '</svg>',
    mehendi: '<svg class="ec-icon" viewBox="0 0 64 64"><path d="M18 50 L42 14 L50 22 Z"/><path d="M42 14c4-5 12 3 8 8"/><path d="M12 56c5-2 8-7 5-12"/><path d="M28 40c3 1 5 3 5 6M33 32c3 1 5 3 5 6"/></svg>',
    sangeet: '<svg class="ec-icon" viewBox="0 0 64 64"><ellipse cx="20" cy="32" rx="8" ry="15"/><ellipse cx="44" cy="32" rx="8" ry="15"/><path d="M20 17h24M20 47h24"/><path d="M24 17 L30 47 L36 17 L42 47"/></svg>',
    wedding: '<svg class="ec-icon" viewBox="0 0 64 64"><path d="M12 40h40c-2 9-10 14-20 14s-18-5-20-14z"/><path d="M32 35c-7-7-5-15 0-25 5 10 7 18 0 25z"/><path d="M32 30c-2-2-1.5-5 0-8 1.5 3 2 6 0 8z"/></svg>',
    ring: '<svg class="ec-icon" viewBox="0 0 64 64"><circle cx="32" cy="40" r="15"/><circle cx="32" cy="40" r="11"/><path d="M25 20 L32 13 L39 20 L32 27 Z"/><path d="M25 20H39"/><path d="M14 14l3 3M50 14l-3 3"/></svg>',
    reception: '<svg class="ec-icon" viewBox="0 0 64 64"><path d="M14 10h14l-2 18a5 5 0 0 1-10 0z"/><path d="M21 33v18M15 51h12"/><path d="M36 10h14l-2 18a5 5 0 0 1-10 0z"/><path d="M43 33v18M37 51h12"/><path d="M30 6l2-4 2 4M24 18h2M40 18h2"/></svg>'
  };
  function eventCard(e) {
    return `<svg class="card-border" aria-hidden="true"><rect class="o" pathLength="1"/><rect class="i" pathLength="1"/></svg><div class="card-glow"></div>
${ICON[e.icon || e.key] || ''}<p class="ec-tag">${e.tag}</p><h3 class="ec-title">${e.name}</h3><div class="ec-orn"></div>
<dl class="ec-meta"><div><dt>When</dt><dd>${when(e)}</dd></div><div><dt>Where</dt><dd>${e.venue}</dd></div>${e.dress ? `<div><dt>Attire</dt><dd>${e.dress}</dd></div>` : ''}</dl>
<p class="ec-blurb">${e.blurb}</p><button class="btn-ghost" type="button" data-ics="${e.key}">Add to calendar</button>`;
  }

  function mandala() {
    let s = '<svg class="mandala" viewBox="-500 -500 1000 1000">';
    [[40, 110, 8, 30], [110, 190, 12, 34], [190, 280, 16, 40], [280, 380, 24, 36], [380, 470, 32, 30]].forEach(([r1, r2, n, wd], ri) => {
      for (let i = 0; i < n; i++) {
        const a = (360 / n) * i + (ri % 2 ? 180 / n : 0);
        s += `<path class="hd" pathLength="1" d="M0 ${-r1} Q${wd} ${-(r1 + r2) / 2} 0 ${-r2} Q${-wd} ${-(r1 + r2) / 2} 0 ${-r1}" transform="rotate(${a})"/>`;
        if (ri > 0) s += `<circle class="hdot" cx="0" cy="${-(r2 + 9)}" r="4" transform="rotate(${a})"/>`;
      }
      s += `<circle class="hd" pathLength="1" r="${r2}"/>`;
    });
    return s + '<circle class="hd" pathLength="1" r="22"/><circle class="hdot" r="8"/></svg>';
  }

  function chandelier() {
    let drops = '';
    for (let i = 0; i < 9; i++) { const x = 62 + i * 9.5, l = 10 + Math.abs(4 - i) * -1.6 + 12; drops += `<line x1="${x}" y1="150" x2="${x}" y2="${150 + l}" stroke="#d4af37" stroke-width=".7"/><circle cx="${x}" cy="${153 + l}" r="2.6" fill="#fff6dc"/>`; }
    const candle = (x, y) => `<rect x="${x - 3}" y="${y - 14}" width="6" height="14" fill="#f8efe0"/><ellipse class="ch-glow" cx="${x}" cy="${y - 20}" rx="3.2" ry="6" fill="#ffd36b"/><circle class="ch-glow" cx="${x}" cy="${y - 20}" r="14" fill="url(#chG)"/>`;
    return `<svg viewBox="0 0 200 260" aria-hidden="true"><defs><radialGradient id="chG"><stop offset="0" stop-color="rgba(255,220,140,.75)"/><stop offset="1" stop-color="rgba(255,200,100,0)"/></radialGradient><radialGradient id="chBig"><stop offset="0" stop-color="rgba(255,214,140,.35)"/><stop offset="1" stop-color="rgba(255,200,100,0)"/></radialGradient></defs>
<circle class="ch-glow" cx="100" cy="128" r="110" fill="url(#chBig)"/>
<line x1="100" y1="0" x2="100" y2="66" stroke="#c9a54a" stroke-width="2"/><circle cx="100" cy="70" r="6" fill="#d4af37"/>
<path d="M100 76 V150" stroke="#d4af37" stroke-width="3"/>
<g fill="none" stroke="#d4af37" stroke-width="2.4"><path d="M100 120 Q62 124 40 100"/><path d="M100 120 Q138 124 160 100"/><path d="M100 136 Q56 150 22 120"/><path d="M100 136 Q144 150 178 120"/></g>
<path d="M58 140 Q100 192 142 140 Z" fill="#b8892c"/><path d="M70 142 Q100 176 130 142" fill="none" stroke="#fff1c1" stroke-width="1"/>
${drops}${candle(40, 100)}${candle(160, 100)}${candle(22, 120)}${candle(178, 120)}${candle(100, 112)}</svg>`;
  }

  function peacock() {
    let barbs = '';
    for (let i = 0; i < 26; i++) { const y = 380 - i * 12, l = 14 + i * 1.6; barbs += `<path d="M60 ${y} q${-l * 0.6} -6 ${-l} -14M60 ${y} q${l * 0.6} -6 ${l} -14"/>`; }
    return `<svg viewBox="0 0 120 420" aria-hidden="true"><g fill="none" stroke="rgba(120,190,150,.55)" stroke-width="1">${barbs}</g><path d="M60 420 Q66 260 60 60" fill="none" stroke="#c9a54a" stroke-width="2"/>
<ellipse cx="60" cy="74" rx="40" ry="54" fill="#1f6f5a" opacity=".75"/><ellipse cx="60" cy="80" rx="28" ry="38" fill="#c9a54a"/><ellipse cx="60" cy="86" rx="18" ry="25" fill="#1e4ea8"/><ellipse cx="60" cy="92" rx="9" ry="12" fill="#0d1b4a"/></svg>`;
  }

  function marigold() {
    let s = '<svg viewBox="-50 -50 100 100">';
    [[16, 22, 10, 24, '#e86f00'], [12, 16, 8, 18, '#ff9a1f'], [10, 11, 6, 12, '#ffc233']].forEach(([n, cy, rx, ry, c]) => {
      for (let i = 0; i < n; i++) s += `<ellipse cx="0" cy="${-cy}" rx="${rx}" ry="${ry * 0.6}" fill="${c}" transform="rotate(${(360 / n) * i + cy})"/>`;
    });
    return s + '<circle r="7" fill="#b35500"/></svg>';
  }

  function mandap() {
    let flowers = '';
    const string = (x1, y1, x2, y2, sag, n) => { let o = ''; for (let i = 0; i <= n; i++) { const t = i / n, x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t + Math.sin(t * Math.PI) * sag; o += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="${i % 3 ? '#ff9a1f' : '#ffd23f'}"/>`; } return o; };
    flowers += string(240, 250, 860, 250, 70, 34);
    [300, 420, 550, 680, 800].forEach((x, i) => { for (let j = 0; j < 9; j++) flowers += `<circle cx="${x}" cy="${262 + j * 13}" r="5.5" fill="${j % 2 ? '#fff3d6' : '#c21f45'}"/>`; });
    const pillar = (x, top, w, shade) => `<g fill="${shade}"><rect x="${x}" y="${top}" width="${w}" height="${620 - top}"/><rect x="${x - 8}" y="${top - 14}" width="${w + 16}" height="16" rx="3" fill="#d4af37"/><rect x="${x - 10}" y="596" width="${w + 20}" height="24" rx="4" fill="#b8892c"/>${[0.25, 0.5, 0.75].map(f => `<rect x="${x - 2}" y="${top + (620 - top) * f}" width="${w + 4}" height="7" fill="#d4af37"/>`).join('')}</g>`;
    return `<svg viewBox="0 0 1100 700" aria-hidden="true"><defs><linearGradient id="mpG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f5d77a"/><stop offset="1" stop-color="#9a7424"/></linearGradient><radialGradient id="fireG"><stop offset="0" stop-color="rgba(255,210,110,.85)"/><stop offset="1" stop-color="rgba(255,140,40,0)"/></radialGradient></defs>
${pillar(340, 260, 26, '#7a1a22')}${pillar(734, 260, 26, '#7a1a22')}
<path d="M170 240 Q550 10 930 240 Z" fill="#8a0d24"/><path d="M170 240 Q550 10 930 240" fill="none" stroke="url(#mpG)" stroke-width="10"/>
${Array.from({ length: 24 }, (_, i) => `<circle cx="${190 + i * 31}" cy="246" r="12" fill="url(#mpG)"/>`).join('')}
<path d="M540 70 h20 l-4 -26 h-12z M550 44 c-12 0 -12 -16 0 -22 c12 6 12 22 0 22z" fill="url(#mpG)"/>
${pillar(200, 240, 40, '#a01c2c')}${pillar(860, 240, 40, '#a01c2c')}
${flowers}
<rect x="150" y="620" width="800" height="22" fill="#b8892c"/><rect x="120" y="642" width="860" height="26" fill="#7a5518"/>
<ellipse cx="550" cy="672" rx="280" ry="18" fill="none" stroke="#f5d77a" stroke-width="2" stroke-dasharray="6 8" opacity=".7"/>
<circle cx="550" cy="560" r="120" fill="url(#fireG)" class="ch-glow"/>
<path d="M500 600 L600 600 L588 630 L512 630 Z" fill="#b8692c"/><rect x="494" y="594" width="112" height="10" fill="#d4af37"/>
<g><path class="fl f1" d="M550 596 Q512 560 534 510 Q540 540 552 526 Q556 494 548 462 Q592 512 576 556 Q588 576 560 596Z" fill="#ff8a1f"/><path class="fl f2" d="M550 596 Q526 566 540 534 Q546 552 554 542 Q558 520 553 500 Q580 534 568 566 Q574 584 556 596Z" fill="#ffc94a"/><path class="fl f3" d="M551 596 Q538 578 546 560 Q552 570 556 562 Q566 578 558 596Z" fill="#fff3c4"/></g></svg>`;
  }

  /* ---------- assemble ---------- */
  function build() {
    const fill = {
      bride: W.bride, groom: W.groom, venue: W.venue, city: W.city, families: W.families, hashtag: W.hashtag,
      hosts: W.hosts, groomParents: W.groomParents,
      date: new Date(W.dateISO).toLocaleDateString('en-GB', Object.assign({ day: '2-digit', month: '2-digit', year: 'numeric' }, tz)).replace(/\//g, ' · '),
      dateLong: fmtDay(W.dateISO)
    };
    $$('[data-w]').forEach(el => { const v = fill[el.dataset.w]; if (v != null) el.textContent = v; });
    document.title = `${W.bride} & ${W.groom} · A Royal Wedding`;
    const set = (sel, html) => { const el = $(sel); if (el) el.innerHTML = html; };
    const swap = (sel, html) => { const el = $(sel); if (el) el.outerHTML = html; };
    // sections without content are removed (and their menu links)
    [['story', W.story], ['gallery', W.gallery]].forEach(([id, list]) => {
      if (list && list.length) return;
      const sec = document.getElementById(id); if (sec) sec.remove();
      $$(`.menu a[href="#${id}"]`).forEach(a => a.closest('li').remove());
    });
    $$('.menu li a span').forEach((s, i) => { s.textContent = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][i] || ''; });
    $$('[data-emblem]').forEach(el => { el.innerHTML = emblem(); });
    // diya field (Lagan Sagai)
    let dh = ''; const nD = MOBILE ? 16 : 30;
    for (let i = 0; i < nD; i++) { const row = i % 3, s = rand(0.6, 1.15) * (row === 0 ? 1 : row === 1 ? 0.8 : 0.62); dh += `<i class="diya" style="left:${rand(2, 96).toFixed(1)}%;bottom:${(row * 9 + rand(1, 7)).toFixed(1)}%;--s:${s.toFixed(2)};--d:${rand(-2, 0).toFixed(2)}s;z-index:${3 - row}"><b></b></i>`; }
    set('[data-diyas]', dh);
    set('[data-palace]', palace());
    swap('[data-car]', car());
    set('[data-couple]', couple());
    swap('[data-story]', storyHTML());
    set('[data-gallery]', galleryHTML());
    W.events.forEach(e => { const c = $(`.event-card[data-event="${e.key}"]`); if (c) c.innerHTML = eventCard(e); });
    set('[data-chips]', W.events.map((e, i) => `<label class="chip"><input type="checkbox" name="events" value="${e.key}" ${i >= 2 ? 'checked' : ''}><span>${e.name.replace('The ', '')}</span></label>`).join(''));
    set('[data-mandala]', mandala());
    $$('[data-chandelier]').forEach(el => { el.innerHTML = chandelier(); });
    $$('[data-peacock]').forEach(el => { el.innerHTML = peacock(); });
    set('[data-mandap]', mandap());
    // marigold bloom border (haldi)
    let mh = ''; const nF = MOBILE ? 6 : 11;
    for (let i = 0; i < nF; i++) mh += `<div class="mflower" style="left:${(i / (nF - 1)) * 100}%;--s:${Math.round(rand(90, 170))}px">${marigold()}</div>`;
    set('[data-marigolds]', mh);
    // lanterns
    let lh = ''; const lanterns = MOBILE ? [18, 40, 62, 84] : [14, 27, 40, 60, 73, 86];
    lanterns.forEach((x, i) => { lh += `<div class="lantern" style="left:${x}%;--len:${Math.round(rand(16, 34))}vh;animation-delay:${(-i * 0.7).toFixed(1)}s"><div class="string"></div><div class="cap"></div><div class="body"></div><div class="glow" style="animation-delay:${(-i * 0.37).toFixed(2)}s"></div></div>`; });
    set('.lanterns', lh);
    // toran (hanging marigold strings)
    let th = ''; const nT = MOBILE ? 14 : 30;
    for (let i = 0; i < nT; i++) { const x = (i + 0.5) / nT, dy = Math.sqrt(Math.max(0, 1 - Math.pow((x - 0.5) / 0.5, 2))); th += `<i style="left:${(x * 100).toFixed(2)}%;--l:${Math.round(8 + (1 - dy) * 70 + 20)}px;animation-delay:${(-i * 0.21).toFixed(2)}s"></i>`; }
    set('.toran', th);
    // stars (box-shadow trick, 2 layers)
    $$('.stars').forEach((s, k) => { const n = MOBILE ? 50 : 110, a = []; for (let i = 0; i < n; i++) a.push(`${Math.round(rand(0, 100))}vw ${Math.round(rand(0, 55))}vh 0 ${k ? 0 : rand(0, 1).toFixed(1)}px rgba(255,${240 - k * 20},${210 + k * 20},${rand(0.4, 1).toFixed(2)})`); s.style.boxShadow = a.join(','); });
    // sparkles + waveform (sangeet)
    let sh = ''; for (let i = 0; i < (MOBILE ? 18 : 40); i++) sh += `<i style="left:${rand(2, 98).toFixed(1)}%;top:${rand(4, 70).toFixed(1)}%;animation-delay:${rand(-2.4, 0).toFixed(2)}s"></i>`; set('.sparkles', sh);
    let wh = ''; for (let i = 0; i < (MOBILE ? 32 : 64); i++) wh += `<i style="--d:${rand(-1.2, 0).toFixed(2)}s;--t:${rand(0.6, 1.3).toFixed(2)}s;--lo:${rand(0.05, 0.25).toFixed(2)};--hi:${rand(0.4, 1).toFixed(2)}"></i>`; set('.waveform', wh);
    // infinity path (lemniscate of Bernoulli)
    let d = ''; const a = 193;
    for (let i = 0; i <= 160; i++) { const t = (i / 160) * Math.PI * 2, s = Math.sin(t), c = Math.cos(t), den = 1 + s * s; d += (i ? 'L' : 'M') + ((a * c) / den).toFixed(2) + ' ' + ((a * s * c) / den).toFixed(2); }
    $$('.infinity path').forEach(p => p.setAttribute('d', d + 'Z'));
  }

  /* keep SVG card borders matched to their card size */
  function sizeBorders() {
    const ro = new ResizeObserver(entries => entries.forEach(en => {
      const svg = en.target.querySelector(':scope > .card-border'); if (!svg) return;
      const w = en.target.offsetWidth, h = en.target.offsetHeight;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      const [o, i] = svg.querySelectorAll('rect'), r = 18;
      [[o, 8, r], [i, 15, r - 6]].forEach(([el, m, rr]) => { if (!el) return; el.setAttribute('x', m); el.setAttribute('y', m); el.setAttribute('width', Math.max(0, w - m * 2)); el.setAttribute('height', Math.max(0, h - m * 2)); el.setAttribute('rx', rr); });
    }));
    $$('.event-card, .inv-card, .rsvp-card').forEach(el => ro.observe(el));
  }

  window.Build = { build, sizeBorders, fmtDay, emblem, when };
})();
