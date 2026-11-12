/* =========================================================
   RITUALS — an illustrated couple performs six wedding rituals,
   step by step, driven by scroll (pinned + scrubbed).
   All motion comes from one state object S → render().
   ========================================================= */
window.Rituals = (function () {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const RM = window.FX ? FX.RM : false, MOBILE = window.FX ? FX.MOBILE : false;

  const STEPS = [
    { t: 0, title: 'Varmala', text: 'The garland exchange — a joyful acceptance of each other.' },
    { t: 4.0, title: 'Gathbandhan', text: 'Their garments are tied together — one knot, two lives, two families.' },
    { t: 6.0, title: 'Saat Phere', text: 'Seven rounds around the sacred fire, seven promises for seven lifetimes.' },
    { t: 11.6, title: 'Sindoor Daan', text: 'The groom fills the parting of her hair with sindoor.' },
    { t: 14.0, title: 'Mangalsutra', text: 'A sacred thread of gold and black, tied with love.' },
    { t: 16.2, title: 'Ashirwad', text: 'Blessed by the elders, they rise as husband and wife.' }
  ];

  /* ---------- geometry (figure-local coordinates, feet at 0,0, facing right) ---------- */
  const G = { shoulder: [12, -156], hand: [12, 66], neckGar: [4, -128], sash: [20, -100] };
  const B = { shoulder: [8, -140], hand: [11, 50], neckGar: [2, -118], sash: [24, -84], maang: [2, -180] };
  const FIRE = [400, 434];

  function garland(id) {
    let s = '';
    const n = 18;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, x = Math.sin(a) * 13, y = -Math.cos(a) * 30;
      s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.3" fill="${i % 2 ? '#ffb627' : '#ff8a00'}"/>`;
    }
    return `<g ${id ? `class="${id}"` : ''}>${s}<circle cx="0" cy="31" r="5.5" fill="#c21f45"/><circle cx="0" cy="31" r="2.4" fill="#f07b95"/></g>`;
  }

  function svg() {
    let pillars = '', strings = '';
    [[70, 1], [730, 1]].forEach(([x]) => { pillars += `<rect x="${x - 14}" y="150" width="28" height="300" fill="url(#rPillar)"/><rect x="${x - 22}" y="140" width="44" height="14" rx="3" fill="#d4af37"/><rect x="${x - 24}" y="438" width="48" height="18" rx="4" fill="#b8892c"/>`; });
    for (let i = 0; i < 9; i++) { const x = 120 + i * 70; for (let j = 0; j < 6; j++) strings += `<circle cx="${x}" cy="${162 + j * 11}" r="4.2" fill="${j % 2 ? '#ffd23f' : '#ff8a00'}"/>`; }
    return `<svg viewBox="0 0 800 520" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
<defs>
  <linearGradient id="rPillar" x1="0" x2="1"><stop offset="0" stop-color="#5a0c1c"/><stop offset=".5" stop-color="#a01c2c"/><stop offset="1" stop-color="#5a0c1c"/></linearGradient>
  <linearGradient id="sherwani" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbedc8"/><stop offset="1" stop-color="#e2c98c"/></linearGradient>
  <linearGradient id="lehenga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c0183e"/><stop offset="1" stop-color="#7a0a22"/></linearGradient>
  <radialGradient id="rFloor" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="rgba(255,190,100,.35)"/><stop offset="1" stop-color="rgba(255,190,100,0)"/></radialGradient>
  <radialGradient id="rFire"><stop offset="0" stop-color="rgba(255,200,100,.8)"/><stop offset="1" stop-color="rgba(255,120,30,0)"/></radialGradient>
  <radialGradient id="rHalo"><stop offset="0" stop-color="rgba(255,236,170,.55)"/><stop offset="1" stop-color="rgba(255,220,140,0)"/></radialGradient>
</defs>
<path d="M30 150 Q400 20 770 150 Z" fill="#7d0a1f"/><path d="M30 150 Q400 20 770 150" fill="none" stroke="#d4af37" stroke-width="7"/>
${Array.from({ length: 22 }, (_, i) => `<circle cx="${44 + i * 34}" cy="154" r="9" fill="#d4af37"/>`).join('')}
${strings}${pillars}
<ellipse cx="400" cy="452" rx="330" ry="44" fill="url(#rFloor)"/>
<ellipse cx="400" cy="452" rx="250" ry="30" fill="none" stroke="#f5d77a" stroke-width="1.6" stroke-dasharray="5 8" opacity=".6"/>
<circle class="r-halo" cx="400" cy="300" r="230" fill="url(#rHalo)" opacity="0"/>
<g class="r-actors">
  <g class="r-fire" data-y="${FIRE[1]}">
    <circle cx="0" cy="-30" r="70" fill="url(#rFire)" class="ch-glow"/>
    <path d="M-34 -6 L34 -6 L26 14 L-26 14 Z" fill="#b8692c"/><rect x="-38" y="-12" width="76" height="8" fill="#d4af37"/>
    <path class="fl f1" d="M0 -8 Q-26 -32 -12 -62 Q-8 -44 2 -54 Q6 -80 -2 -100 Q32 -66 20 -36 Q28 -22 8 -8Z" fill="#ff8a1f"/>
    <path class="fl f2" d="M0 -8 Q-16 -28 -6 -48 Q-2 -36 4 -42 Q8 -60 4 -72 Q24 -48 14 -28 Q18 -16 4 -8Z" fill="#ffc94a"/>
    <path class="fl f3" d="M1 -8 Q-8 -20 -2 -32 Q2 -26 5 -30 Q12 -20 6 -8Z" fill="#fff3c4"/>
  </g>
  <g class="r-groom" data-y="430"><g class="fig">
    <ellipse cx="0" cy="2" rx="34" ry="6" fill="rgba(0,0,0,.35)"/>
    <path d="M-14 0 L-11 -66 L-1 -66 L-2 0Z" fill="#efdfb4"/><path d="M2 0 L1 -66 L11 -66 L14 0Z" fill="#e6d29e"/>
    <rect x="-20" y="-4" width="18" height="5" rx="2.5" fill="#7a1a10"/><rect x="2" y="-4" width="18" height="5" rx="2.5" fill="#7a1a10"/>
    <path d="M-25 -58 Q-29 -116 -21 -160 Q0 -170 21 -160 Q29 -116 25 -58 Z" fill="url(#sherwani)"/>
    <path d="M-25 -60 H25" stroke="#d4af37" stroke-width="4"/><path d="M0 -158 V-64" stroke="#d4af37" stroke-width="2.4" stroke-dasharray=".1 7" stroke-linecap="round"/>
    <path d="M-20 -158 Q-6 -122 20 -98 L23 -104 Q2 -126 -12 -160Z" fill="#b3123a"/>
    <rect x="-5" y="-174" width="10" height="13" fill="#b97e55"/>
    <circle cx="2" cy="-186" r="15" fill="#c98d64"/>
    <path d="M-14 -190 Q-16 -213 4 -215 Q23 -213 20 -192 Q10 -199 2 -198 Q-8 -198 -14 -190Z" fill="#e8742a"/>
    <path d="M-14 -192 Q-27 -178 -24 -146 L-19 -146 Q-20 -175 -10 -190Z" fill="#d8601e"/>
    <path d="M8 -212 Q16 -233 10 -244 Q23 -229 13 -210Z" fill="#fff1c1"/><circle cx="9" cy="-208" r="3.2" fill="#d4af37"/>
    <g class="r-neckgar" transform="translate(${G.neckGar})" opacity="0">${garland()}</g>
    <g transform="translate(${G.shoulder})"><g class="r-garm">
      <path d="M-5 -2 Q8 34 8 62 L17 62 Q19 30 7 -4Z" fill="#f3e3b8"/><path d="M8 58 H17" stroke="#d4af37" stroke-width="3"/>
      <circle cx="${G.hand[0]}" cy="${G.hand[1]}" r="5.2" fill="#c98d64"/></g></g>
  </g></g>
  <g class="r-bride" data-y="430"><g class="fig">
    <ellipse cx="0" cy="2" rx="44" ry="7" fill="rgba(0,0,0,.35)"/>
    <path d="M-12 -92 L12 -92 Q46 -40 50 0 L-50 0 Q-46 -40 -12 -92Z" fill="url(#lehenga)"/>
    <path d="M-50 -3 L50 -3" stroke="#d4af37" stroke-width="6"/><path d="M-44 -20 Q0 -10 44 -20 M-34 -48 Q0 -40 34 -48" stroke="#f5d77a" stroke-width="2" stroke-dasharray="2 7" fill="none"/>
    <path d="M-12 -94 Q-14 -130 -10 -146 Q0 -152 10 -146 Q14 -130 12 -94Z" fill="#9e0f2f"/>
    <rect x="-4" y="-158" width="8" height="10" fill="#b97e55"/>
    <circle cx="1" cy="-168" r="13" fill="#c98d64"/>
    <circle cx="-12" cy="-165" r="7" fill="#1a0a0a"/><path d="M-12 -170 Q-10 -184 2 -182 Q12 -180 13 -172 Q4 -178 -12 -170Z" fill="#1a0a0a"/>
    <circle cx="5" cy="-174" r="2.2" fill="#f5d77a"/>
    <circle class="r-sindoor-glow" cx="${B.maang[0]}" cy="${B.maang[1]}" r="9" fill="rgba(255,60,80,.45)" opacity="0"/>
    <path class="r-sindoor" d="M-1 -183 Q2 -180 4 -176" stroke="#e0102a" stroke-width="3" stroke-linecap="round" fill="none" opacity="0"/>
    <path class="r-mangal" d="M-7 -152 Q1 -134 9 -152" stroke="#1a1a1a" stroke-width="2.2" stroke-dasharray="1" stroke-dashoffset="1" pathLength="1" fill="none"/>
    <circle class="r-pendant" cx="1" cy="-141" r="3" fill="#f5d77a" opacity="0"/>
    <path d="M-16 -178 Q2 -196 16 -178 Q27 -122 31 -80 Q8 -70 -6 -86 Q-22 -122 -16 -178Z" fill="rgba(200,20,50,.42)" stroke="#d4af37" stroke-width="1.2"/>
    <g class="r-neckgar" transform="translate(${B.neckGar})" opacity="0">${garland()}</g>
    <g transform="translate(${B.shoulder})"><g class="r-barm">
      <path d="M-3 -2 Q7 26 7 46 L14 46 Q15 22 5 -4Z" fill="#c98d64"/><path d="M6 38 H15 M6 42 H15" stroke="#e0102a" stroke-width="2.4"/>
      <circle cx="${B.hand[0]}" cy="${B.hand[1]}" r="4.6" fill="#c98d64"/></g></g>
  </g></g>
</g>
<path class="r-sash" d="M0 0" stroke="#d4af37" stroke-width="4" fill="none" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>
<g class="r-fly1">${garland()}</g><g class="r-fly2">${garland()}</g>
</svg>`;
  }

  /* ---------- state & render ---------- */
  const S = { gx: 290, bx: 510, y: 430, k: 0, th: 0, fireY: FIRE[1], fireS: 1, gArm: 0, bArm: 0, gBow: 0, bBow: 0, fly1: 0, fly2: 0, sash: 0, fire: 0, sindoor: 0, mangal: 0, halo: 0 };
  let el = {};
  const rot = (x, y, deg) => { const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); return [x * c - y * s, x * s + y * c]; };

  function pose(base, theta, baseFace) {
    const ox = FIRE[0] + 130 * Math.cos(theta), oy = 430 + 36 * Math.sin(theta);
    const k = S.k, x = base + (ox - base) * k, y = S.y + (oy - S.y) * k;
    const orbitFace = Math.max(-1, Math.min(1, -Math.sin(theta) * 3)) || 1;
    let face = baseFace + (orbitFace - baseFace) * k;
    if (Math.abs(face) < 0.12) face = face < 0 ? -0.12 : 0.12;
    const sc = 1 + 0.08 * Math.sin(theta) * k;
    return { x, y, face, sc };
  }
  // local point → stage point
  const world = (p, lx, ly) => [p.x + lx * p.face * p.sc, p.y + ly * p.sc];
  const handWorld = (p, sh, hand, deg) => { const [hx, hy] = rot(hand[0], hand[1], deg); return world(p, sh[0] + hx, sh[1] + hy); };

  function render() {
    const gp = pose(S.gx, S.th - 0.8, 1), bp = pose(S.bx, S.th, -1);
    el.groom.setAttribute('transform', `translate(${gp.x.toFixed(1)},${gp.y.toFixed(1)}) scale(${(gp.face * gp.sc).toFixed(3)},${gp.sc.toFixed(3)}) rotate(${S.gBow})`);
    el.bride.setAttribute('transform', `translate(${bp.x.toFixed(1)},${bp.y.toFixed(1)}) scale(${(bp.face * bp.sc).toFixed(3)},${bp.sc.toFixed(3)}) rotate(${S.bBow})`);
    el.garm.setAttribute('transform', `rotate(${S.gArm})`);
    el.barm.setAttribute('transform', `rotate(${S.bArm})`);
    el.fire.setAttribute('transform', `translate(${FIRE[0]},${S.fireY.toFixed(1)}) scale(${Math.max(0.001, S.fire * S.fireS).toFixed(3)})`);
    el.fire.style.opacity = Math.min(1, S.fire * 1.5);
    // depth sort: farther (smaller y) first
    [[el.fire, S.fireY - 1], [el.groom, gp.y], [el.bride, bp.y]].sort((a, b) => a[1] - b[1]).forEach(([n]) => el.actors.appendChild(n));
    // garlands: in hand → flying → on the other's neck
    const fly = (node, p, from, to) => {
      const x = from[0] + (to[0] - from[0]) * p, y = from[1] + (to[1] - from[1]) * p - Math.sin(Math.PI * p) * 70;
      node.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${(0.9 + 0.1 * p).toFixed(2)})`);
      node.style.opacity = p >= 0.999 ? 0 : 1;
    };
    fly(el.fly1, S.fly1, handWorld(bp, B.shoulder, B.hand, S.bArm), world(gp, G.neckGar[0], G.neckGar[1]));
    fly(el.fly2, S.fly2, handWorld(gp, G.shoulder, G.hand, S.gArm), world(bp, B.neckGar[0], B.neckGar[1]));
    el.gNeck.setAttribute('opacity', S.fly1 >= 0.999 ? 1 : 0);
    el.bNeck.setAttribute('opacity', S.fly2 >= 0.999 ? 1 : 0);
    // gathbandhan sash between them
    const a = world(gp, G.sash[0], G.sash[1]), b = world(bp, B.sash[0], B.sash[1]);
    const mx = (a[0] + b[0]) / 2, my = Math.max(a[1], b[1]) + 34;
    el.sash.setAttribute('d', `M${a[0].toFixed(1)} ${a[1].toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`);
    el.sash.style.strokeDashoffset = 1 - S.sash;
    el.sindoor.style.opacity = S.sindoor; el.sGlow.style.opacity = S.sindoor * (1 - Math.max(0, S.sindoor - 0.6));
    el.mangal.style.strokeDashoffset = 1 - S.mangal; el.pendant.style.opacity = S.mangal > 0.9 ? 1 : 0;
    el.halo.style.opacity = S.halo;
  }

  function init() {
    const host = $('[data-rituals]'); if (!host) return;
    host.innerHTML = svg();
    el = {
      actors: $('.r-actors'), groom: $('.r-groom'), bride: $('.r-bride'), fire: $('.r-fire'),
      garm: $('.r-garm'), barm: $('.r-barm'), fly1: $('.r-fly1'), fly2: $('.r-fly2'),
      gNeck: $('.r-groom .r-neckgar'), bNeck: $('.r-bride .r-neckgar'), sash: $('.r-sash'),
      sindoor: $('.r-sindoor'), sGlow: $('.r-sindoor-glow'), mangal: $('.r-mangal'), pendant: $('.r-pendant'), halo: $('.r-halo')
    };
    // always show the full height: letterbox on wide screens, crop the sides on tall phones
    const svgEl = host.querySelector('svg');
    const fitStage = () => { const r = host.getBoundingClientRect(); svgEl.setAttribute('preserveAspectRatio', r.width / Math.max(1, r.height) > 800 / 520 ? 'xMidYMax meet' : 'xMidYMax slice'); };
    fitStage(); addEventListener('resize', fitStage);
    const cap = { n: $('.rit-n'), title: $('.rit-title'), text: $('.rit-text'), phera: $('.rit-phera'), pn: $('.rit-phera span'), box: $('.rit-caption') };
    const dots = $$('.rit-dots li');
    let cur = -1;
    const setStep = (i, animate) => {
      if (i === cur) return; cur = i;
      const st = STEPS[i];
      const swap = () => { cap.n.textContent = i + 1; cap.title.textContent = st.title; cap.text.textContent = st.text; };
      if (animate && !RM) gsap.timeline().to(cap.box, { opacity: 0, y: -10, duration: 0.2 }).add(swap).to(cap.box, { opacity: 1, y: 0, duration: 0.35 });
      else swap();
      dots.forEach((d, j) => d.classList.toggle('on', j <= i));
      if (animate && window.RoyalAudio && RoyalAudio.enabled) RoyalAudio.chime();
    };

    if (RM) {
      Object.assign(S, { fly1: 1, fly2: 1, sash: 1, fire: 1, fireY: 392, fireS: 0.72, sindoor: 1, mangal: 1, halo: 1, gx: 420, bx: 500 });
      render(); setStep(5, false); return;
    }
    render(); setStep(0, false);

    const rain = window.FX ? new FX.Rain($('#ritual-canvas'), { pal: FX.PAL.rose.concat(FX.PAL.marigold), count: 50 }) : null;
    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onUpdate: () => {
        render();
        const t = tl.time(); let i = 0; STEPS.forEach((s, j) => { if (t >= s.t) i = j; }); setStep(i, true);
        const inPheras = t > 7.0 && t < 11.0;
        cap.phera.classList.toggle('on', inPheras);
        if (inPheras) cap.pn.textContent = Math.min(7, Math.floor(S.th / (Math.PI * 2)) + 1);
        if (rain) { if (t > 16.4) rain.start(); else rain.stop(); }
      },
      scrollTrigger: {
        trigger: '#rituals', start: 'top top', end: () => '+=' + innerHeight * (MOBILE ? 6 : 7.5), pin: true, scrub: 1,
        onLeave: () => rain && rain.stop(), onLeaveBack: () => rain && rain.stop()
      }
    });
    // 1. Varmala
    tl.to(S, { bArm: -80, duration: 0.6 }, 0.4)
      .to(S, { fly1: 1, duration: 1.0 }, 0.9)
      .to(S, { bArm: 0, duration: 0.5 }, 1.9)
      .to(S, { gArm: -80, duration: 0.6 }, 2.1)
      .to(S, { fly2: 1, duration: 1.0 }, 2.6)
      .to(S, { gArm: 0, duration: 0.5 }, 3.6)
      // 2. Gathbandhan
      .to(S, { gx: 340, bx: 470, duration: 0.6 }, 4.0)
      .to(S, { sash: 1, duration: 1.2 }, 4.4)
      // 3. Saat Phere around the sacred fire
      .to(S, { fire: 1, duration: 0.7, ease: 'back.out(1.6)' }, 6.0)
      .to(S, { k: 1, duration: 0.6 }, 6.6)
      .to(S, { th: Math.PI * 14, duration: 3.6, ease: 'none' }, 7.2)
      .to(S, { k: 0, gx: 330, bx: 500, duration: 0.6 }, 10.8)
      .to(S, { fireY: 392, fireS: 0.72, duration: 0.6 }, 10.8)         // sacred fire settles behind them
      // 4. Sindoor
      .to(S, { gx: 440, duration: 0.6 }, 11.6)
      .to(S, { gArm: -108, duration: 0.6 }, 12.2)
      .to(S, { sindoor: 1, duration: 0.5 }, 12.7)
      .to(S, { gArm: 0, duration: 0.5 }, 13.3)
      // 5. Mangalsutra
      .to(S, { gArm: -74, duration: 0.6 }, 14.0)
      .to(S, { mangal: 1, duration: 0.8 }, 14.5)
      .to(S, { gArm: 0, gx: 420, duration: 0.6 }, 15.4)
      // 6. Ashirwad
      .to(S, { halo: 1, duration: 1 }, 16.2)
      .to(S, { gBow: 14, bBow: 14, duration: 0.6, ease: 'sine.inOut' }, 16.5)
      .to(S, { gBow: 0, bBow: 0, duration: 0.6, ease: 'sine.inOut' }, 17.3)
      .to({}, { duration: 1.4 }, 18);
  }

  return { init };
})();
