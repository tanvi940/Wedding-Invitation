/* =========================================================
   FILM — deterministic, frame-by-frame invitation film.
   window.renderFrame(t) puts the page exactly at time t (s).
   ========================================================= */
(function () {
  const { fit, glow, drawPetal, petal, stepPetal, sample, split, PAL, pick, rand } = FX;
  const W = window.WEDDING;
  const $ = s => document.querySelector(s), $$ = s => Array.from(document.querySelectorAll(s));
  const DURATION = 35, STEP = 1 / 60;

  window.FILM = {
    duration: DURATION,
    cues: { bells: [6.1, 24.7], doors: [9.2], whoosh: [[10.2, 2.4], [21, 1.8]], chime: [23.4, 29.2, 31.5], engine: [15.8, 20.3, 21.3] },
    ready: false
  };

  function setup() {
    Build.build();
    // ceremony list on the closing card
    const tz = { timeZone: 'Asia/Kolkata' };
    $('[data-fe-events]').innerHTML = W.events.map(e => `<div class="fe-ev"><b>${e.name.replace('The ', '')}</b><span>${new Date(e.date).toLocaleDateString('en-GB', Object.assign({ day: 'numeric', month: 'short' }, tz))} · ${new Date(e.date).toLocaleTimeString('en-US', Object.assign({ hour: 'numeric', minute: '2-digit' }, tz))}</span></div>`).join('');
    $$('.lantern').forEach(l => l.classList.add('lit'));

    /* ---------- canvases ---------- */
    const IC = fit($('#intro-canvas')), AC = fit($('#arrival-canvas')), EC = fit($('#fe-canvas'));
    const w = IC.w, h = IC.h, L = { r: 0, a: 0 };
    const parts = [], storm = [], aPetals = [], dust = [], sparks = [];
    let spawned = false, assigned = false, stormed = false;

    function emblemTargets() {
      const el = $('.emblem-wrap'), S = el.offsetWidth, k = S / 240;
      return sample(Math.ceil(S), Math.ceil(S), g => {
        g.strokeStyle = g.fillStyle = '#fff';
        g.lineWidth = Math.max(2, 3 * k); g.beginPath(); g.arc(S / 2, S / 2, 104 * k, 0, 7); g.stroke();
        g.lineWidth = Math.max(1.2, 1.2 * k); g.beginPath(); g.arc(S / 2, S / 2, 84 * k, 0, 7); g.stroke();
        for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; g.beginPath(); g.arc(S / 2 + Math.cos(a) * 112 * k, S / 2 + Math.sin(a) * 112 * k, 3 * k, 0, 7); g.fill(); }
        g.font = `600 ${50 * k}px Cinzel, serif`; g.textAlign = 'center'; g.fillText(`${W.initials[0]} & ${W.initials[1]}`, 120 * k, 146 * k);
      }, 3).map(p => ({ x: p.x + w / 2 - S / 2, y: p.y + h / 2 - S / 2 }));
    }

    /* ---------- DOM refs & geometry ---------- */
    const pan = $('.pan'), car = $('.car-wrap'), chassis = $('.car-chassis'), wheels = $$('.car .wheel'), door = $('.car-door');
    const cw = () => car.offsetWidth, ch = () => car.offsetHeight;
    const startX = -cw() * 1.1, endX = (w - cw()) / 2 + cw() * 0.04;
    const spin = ((endX - startX) / (2 * Math.PI * (cw() * 44 / 640))) * 360;
    const dp = { x: endX + cw() * 232 / 640, y: car.offsetTop + ch() * 107 / 240 };
    const wins = $$('.palace .win').map(el => { const b = el.getBBox(); return { el, d: Math.abs(b.x + b.width / 2 - 1200) + Math.abs(b.y - 600) * 0.4 }; }).sort((a, b) => a.d - b.d).map(o => o.el);

    /* ---------- initial states ---------- */
    gsap.set('.intro-copy', { opacity: 0 });
    gsap.set('.doors', { opacity: 0, scale: 1.08 });
    gsap.set(pan, { x: 0, scale: 1.12, transformOrigin: '50% 100%' });
    gsap.set(car, { x: startX });
    gsap.set('.couple-reveal', { clipPath: `circle(0% at ${dp.x}px ${dp.y}px)`, visibility: 'hidden' });
    gsap.set(['.cn-bride', '.cn-groom'], { clipPath: 'inset(-40% 100% -40% -10%)' });
    gsap.set(['.headbeam', '.beam-ground', '.distant-light', '.iris-flash'], { opacity: 0 });
    gsap.set('.lantern .body', { filter: 'brightness(.3) saturate(.6)' });
    gsap.set('.lantern .glow', { filter: 'opacity(0)' });
    wheels.forEach(wh => gsap.set(wh, { svgOrigin: wh.dataset.o }));
    gsap.set(door, { svgOrigin: '198 107' }); gsap.set(chassis, { svgOrigin: '320 192' });
    const crestDY = $('.doors').offsetTop - h / 2 - 6, crestS = Math.min(0.52, 128 / $('.emblem-wrap').offsetWidth);
    const kick = split($('.intro-kicker')), title = split($('.intro-title'));

    /* ---------- master timeline ---------- */
    const tl = gsap.timeline({ paused: true });
    tl.to(L, { r: Math.min(w, h) * 0.05, a: 1, duration: 1.2, ease: 'power2.out' }, 0)
      .to(L, { a: 0, r: Math.min(w, h) * 0.16, duration: 1.5, ease: 'power2.out' }, 1.2)
      .to('.emblem-wrap', { opacity: 1, duration: 0.6 }, 4.2)
      .to('.emblem-wrap', { y: crestDY, scale: crestS, duration: 1.5, ease: 'power3.inOut' }, 4.8)
      .to('.doors', { opacity: 1, scale: 1, duration: 1.8, ease: 'power2.out' }, 4.8)
      .to('.intro-floor', { opacity: 1, duration: 1.6 }, 4.8)
      .to('.door-gap', { opacity: 1, duration: 1 }, 5.6)
      .to('.light-spill', { opacity: 0.7, duration: 1.2 }, 5.6)
      .set('.intro-copy', { opacity: 1 }, 6)
      .from(kick, { opacity: 0, duration: 0.05, stagger: 0.025 }, 6)
      .from(title, { opacity: 0, y: 24, scale: 1.4, filter: 'blur(10px)', duration: 0.8, stagger: 0.06 }, 6.5)
      .from('.intro-sub', { opacity: 0, y: 14, duration: 0.8 }, 7.4)
      .to('.intro-copy', { opacity: 0, y: 20, scale: 0.95, duration: 0.5 }, 8.8)
      .to('.emblem-wrap', { opacity: 0, duration: 0.5 }, 8.8)
      .to('.door-gap', { scaleX: 5, duration: 0.4 }, 9.0)
      .to('.door-left', { rotationY: -112, duration: 2.6, ease: 'power2.inOut' }, 9.2)
      .to('.door-right', { rotationY: 112, duration: 2.6, ease: 'power2.inOut' }, 9.2)
      .to('.door-gap', { opacity: 0, duration: 0.5 }, 9.6)
      .to('.light-spill', { opacity: 1, scaleX: 1.5, scaleY: 1.8, duration: 2 }, 9.2)
      .to('.intro-stage', { scale: 3.6, duration: 2.4, ease: 'power3.in' }, 9.8)
      .to('.intro-flash', { opacity: 1, duration: 0.7, ease: 'power2.in' }, 11.5)
      .set(['.intro-stage', '#intro-canvas'], { visibility: 'hidden' }, 12.2)
      .to('#intro', { opacity: 0, duration: 1.1 }, 12.2)
      // courtyard
      .to(pan, { x: -(pan.offsetWidth - w) / 2, scale: 1, duration: 5, ease: 'power2.inOut' }, 12.2)
      .to(wins, { fill: '#ffd27a', duration: 0.3, stagger: 0.04 }, 12.8)
      .to('.palace .gate-lit', { opacity: 1, duration: 1 }, 13.2)
      .to('.ground-glow', { opacity: 1, duration: 2 }, 13.2)
      .to('.lantern .body', { filter: 'brightness(1.05) saturate(1.1)', duration: 0.8, stagger: 0.25 }, 14)
      .to('.lantern .glow', { filter: 'opacity(1)', duration: 0.8, stagger: 0.25 }, 14)
      // the car
      .fromTo('.distant-light', { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1, duration: 0.8 }, 15.3)
      .to(car, { x: endX, duration: 4.4, ease: 'power2.out' }, 16)
      .to(wheels, { rotation: spin, duration: 4.4, ease: 'power2.out' }, 16)
      .to('.distant-light', { opacity: 0, duration: 0.6 }, 16.5)
      .to(['.headbeam', '.beam-ground'], { opacity: 1, duration: 0.6 }, 16.1)
      .to(chassis, { rotation: 0.9, duration: 0.3, ease: 'sine.out' }, 20.2)
      .to(chassis, { rotation: 0, duration: 0.6, ease: 'elastic.out(1,.35)' }, 20.5)
      .to(['.headbeam', '.beam-ground'], { opacity: 0.55, duration: 0.5 }, 20.6)
      .to('.camera', { scale: 1.8, transformOrigin: `${dp.x}px ${dp.y}px`, duration: 1.8, ease: 'power2.inOut' }, 21)
      .to('.pillar-l', { xPercent: -140, duration: 1.8, ease: 'power2.inOut' }, 21)
      .to('.pillar-r', { xPercent: 140, duration: 1.8, ease: 'power2.inOut' }, 21)
      .to('.fg-arch', { yPercent: -120, duration: 1.8, ease: 'power2.inOut' }, 21)
      .to('.lanterns', { yPercent: -60, opacity: 0, duration: 1.8, ease: 'power2.in' }, 21)
      .to(door, { scaleX: -0.3, duration: 0.9, ease: 'power2.inOut' }, 22.6)
      .to('.car-interior', { opacity: 1, duration: 0.7 }, 22.6)
      .to('.iris-flash', { opacity: 1, duration: 0.4, ease: 'power2.in' }, 23.2)
      .set('.couple-reveal', { visibility: 'visible' }, 23.5)
      .to('.couple-reveal', { clipPath: `circle(150% at ${dp.x}px ${dp.y}px)`, duration: 1.2, ease: 'power2.inOut' }, 23.5)
      .to('.iris-flash', { opacity: 0, duration: 0.8 }, 23.9)
      .fromTo('.couple-frame', { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.1, ease: 'power2.out' }, 23.9)
      .fromTo('.couple-halo', { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.4 }, 23.9)
      .to('.cn-bride', { clipPath: 'inset(-40% -10% -40% -10%)', duration: 1, ease: 'power1.inOut' }, 24.6)
      .fromTo('.cn-amp', { opacity: 0, scale: 0.3, rotation: -30 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(2)' }, 25.4)
      .to('.cn-groom', { clipPath: 'inset(-40% -10% -40% -10%)', duration: 1, ease: 'power1.inOut' }, 25.6)
      .fromTo(['.couple-line', '.couple-date'], { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.15 }, 26.4)
      // closing personal card
      .to('.film-end', { opacity: 1, duration: 1 }, 28.6)
      .fromTo('.fe-mono', { scale: 0, rotation: -200, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 1.2, ease: 'back.out(1.4)' }, 29)
      .fromTo('.fe-item', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.32, ease: 'power3.out' }, 29.5)
      .to({}, { duration: 0.1 }, DURATION - 0.1);

    /* ---------- deterministic simulation ---------- */
    let simT = 0;
    function step(t) {
      const k = STEP * 60;
      // intro dust → emblem
      if (!spawned && t >= 1.2) {
        spawned = true;
        for (let i = 0; i < 700; i++) { const a = rand(0, Math.PI * 2), sp = Math.pow(Math.random(), 0.6) * rand(2, 9); parts.push({ x: w / 2, y: h / 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: rand(1.2, 3.2), a: 0, tx: null, ty: null, k: rand(0.5, 1.5), ph: rand(0, 6.28), fade: 1 }); }
      }
      if (!assigned && t >= 2.3) {
        assigned = true; const pts = emblemTargets();
        for (let i = pts.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pts[i], pts[j]] = [pts[j], pts[i]]; }
        const n = Math.min(pts.length, parts.length - 90); for (let i = 0; i < n; i++) { parts[i].tx = pts[i].x; parts[i].ty = pts[i].y; }
      }
      const mode = t < 2.3 ? 'spread' : t < 4.2 ? 'form' : 'release';
      const formK = Math.pow(Math.min(1, Math.max(0, (t - 2.3) / 1.9)), 2) * 0.16;
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i], tg = p.tx != null;
        if (mode === 'form' && tg) { const kk = formK * p.k; p.vx += (p.tx - p.x) * kk * 0.5; p.vy += (p.ty - p.y) * kk * 0.5; p.vx *= 0.78; p.vy *= 0.78; }
        else if (mode === 'release' && tg) { p.fade -= STEP * 0.7; p.vy -= 0.012; p.vx += Math.sin(t + p.ph) * 0.02; if (p.fade <= 0) { parts.splice(i, 1); continue; } }
        else { p.vx *= 0.965; p.vy *= 0.965; p.vx += Math.sin(t * 0.6 + p.ph) * 0.012; p.vy -= 0.006; if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10; if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10; }
        p.x += p.vx; p.y += p.vy; p.a = Math.min(1, p.a + STEP * 1.6);
      }
      // petals flying toward camera
      if (!stormed && t >= 10.1) { stormed = true; for (let i = 0; i < 70; i++) storm.push({ x: rand(-1, 1), y: rand(-0.7, 0.7), z: rand(1.6, 4.5), vz: rand(1.3, 2.2), rot: rand(0, 6.28), vr: rand(-2, 2), spin: rand(0, 6.28), vs: rand(2, 5), s: rand(10, 18), color: pick(Math.random() < 0.75 ? PAL.rose : PAL.blush) }); }
      for (let i = storm.length - 1; i >= 0; i--) { const p = storm[i]; p.z -= p.vz * STEP; p.rot += p.vr * STEP; p.spin += p.vs * STEP; if (p.z < 0.08) storm.splice(i, 1); }
      // courtyard petals, settling and swept by the car
      if (t >= 12.2) {
        const cx = gsap.getProperty(car, 'x'), cW = cw(), ctop = car.offsetTop, ground = ctop + ch() * 0.97;
        const vel = (cx - (step.lx == null ? cx : step.lx)) / k; step.lx = cx;
        if (t >= 14.4 && aPetals.length < 30 && Math.random() < 0.3) aPetals.push(petal({ x: rand(-50, w), y: -20, vy: rand(0.5, 1.1), vx: rand(0.1, 0.5), s: rand(5, 10), color: pick(Math.random() < 0.8 ? PAL.rose : PAL.blush) }));
        for (let i = aPetals.length - 1; i >= 0; i--) {
          const p = aPetals[i];
          if (p.rest) { p.life -= STEP; p.alpha = Math.min(1, p.life); if (Math.abs(vel) > 0.5 && p.x > cx + cW * 0.1 && p.x < cx + cW * 1.08) { p.rest = false; p.vy = -rand(1.5, 3.2); p.vx = vel * 0.6 + rand(0, 1); p.vs = rand(0.05, 0.12); } if (p.life <= 0) aPetals.splice(i, 1); continue; }
          stepPetal(p, STEP); p.vy = Math.min(p.vy + 0.02 * k, 1.5); p.vx *= 0.99;
          if (Math.abs(vel) > 0.5) { const dx = p.x - (cx + cW); if (dx > -cW && dx < 170 && p.y > ctop - 60 && p.y < ground) { p.vx += vel * 0.015; p.vy -= 0.05; } }
          if (p.y >= ground - 4 + (p.ph % 1) * 16 && p.vy > 0) { p.rest = true; p.life = rand(2, 5); p.vs = 0; }
          if (p.x > w + 40 || p.y > h + 40) aPetals.splice(i, 1);
        }
        if (Math.abs(vel) > 0.6 && dust.length < 140) { const rx = cx + cW * 150 / 640; for (let i = 0; i < 2; i++) dust.push({ x: rx + rand(-cW * 0.07, 0), y: ground - rand(0, 8), vx: -rand(0.2, 1) - vel * 0.05, vy: -rand(0.1, 0.6), r: rand(4, 10), life: 1 }); }
        for (let i = dust.length - 1; i >= 0; i--) { const d = dust[i]; d.x += d.vx * k; d.y += d.vy * k; d.r += 0.35 * k; d.life -= STEP * 0.9; if (d.life <= 0) dust.splice(i, 1); }
      }
      // golden sparkles on the closing card
      if (t >= 28.6) {
        if (sparks.length < 70 && Math.random() < 0.5) sparks.push({ x: rand(0, w), y: h + 10, vy: -rand(0.4, 1.2), vx: rand(-0.2, 0.2), r: rand(2, 5), life: 1, dec: rand(0.003, 0.007), ph: rand(0, 6.28) });
        for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; s.x += s.vx + Math.sin(t * 2 + s.ph) * 0.3; s.y += s.vy; s.life -= s.dec; if (s.life <= 0) sparks.splice(i, 1); }
      }
    }

    function draw(t) {
      const ic = IC.ctx; ic.clearRect(0, 0, w, h);
      if (t < 12.3) {
        ic.globalCompositeOperation = 'lighter';
        if (L.a > 0) { glow(ic, w / 2, h / 2, L.r * 3.2, L.a * 0.45); glow(ic, w / 2, h / 2, L.r, L.a); }
        for (const p of parts) { const tw = 0.55 + 0.45 * Math.sin(t * 3 * p.k + p.ph), tg = p.tx != null; glow(ic, p.x, p.y, p.r * 2.3, p.a * p.fade * (tg && t >= 2.3 && t < 4.2 ? 0.95 : tw * 0.7)); }
        ic.globalCompositeOperation = 'source-over';
        const f = Math.min(w, h) * 0.6;
        for (const p of storm) drawPetal(ic, { x: w / 2 + (p.x * f) / p.z, y: h / 2 + (p.y * f) / p.z, s: p.s / p.z, rot: p.rot, flip: Math.cos(p.spin), color: p.color, alpha: Math.min(1, (4.6 - p.z) / 1.4) });
        ic.globalAlpha = 1;
      }
      const ac = AC.ctx; ac.clearRect(0, 0, AC.w, AC.h);
      for (const d of dust) { ac.globalAlpha = 1; ac.fillStyle = `rgba(200,160,120,${(d.life * 0.16).toFixed(3)})`; ac.beginPath(); ac.arc(d.x, d.y, d.r, 0, 6.283); ac.fill(); }
      for (const p of aPetals) drawPetal(ac, p);
      ac.globalAlpha = 1;
      const ec = EC.ctx; ec.clearRect(0, 0, EC.w, EC.h); ec.globalCompositeOperation = 'lighter';
      for (const s of sparks) glow(ec, s.x, s.y, s.r * 2, s.life * 0.8);
      ec.globalCompositeOperation = 'source-over'; ec.globalAlpha = 1;
    }

    window.renderFrame = function (t) {
      t = Math.max(0, Math.min(DURATION, t));
      while (simT + 1e-6 < t) { simT = Math.round((simT + STEP) * 60) / 60; tl.seek(simT, false); step(simT); }
      tl.seek(t, false);
      document.getAnimations().forEach(a => { a.pause(); a.currentTime = t * 1000; });
      draw(t);
      return t;
    };
    window.renderFrame(0);
    FILM.ready = true;
  }

  gsap.ticker.sleep();
  const fonts = document.fonts ? Promise.all([document.fonts.load('600 50px Cinzel'), document.fonts.load('40px "Great Vibes"'), document.fonts.load('italic 20px "Cormorant Garamond"')]) : Promise.resolve();
  Promise.race([fonts, new Promise(r => setTimeout(r, 4000))]).then(() => document.fonts.ready).then(setup);
})();
