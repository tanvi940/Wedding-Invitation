/* =========================================================
   INTRO — light → golden dust → emblem → palace doors → open
   ========================================================= */
window.Intro = (function () {
  const { RM, MOBILE, rand, pick, PAL, fit, glow, drawPetal, sample, split, add } = FX;
  const W = window.WEDDING;
  const LITE = document.documentElement.classList.contains('lite'); // phones: skip animated CSS filters
  const $ = s => document.querySelector(s);
  let c, ctx, w, h, parts = [], petals = [], mode = 'light', light = { r: 0, a: 0 }, state = { formK: 0 };
  let opened = false, onDone = null, soundPref = true, live = true, unhook = null, tl = null;

  function resize() { ({ ctx, w, h } = fit(c)); }

  function emblemTargets() {
    const el = $('.emblem-wrap'), S = el.offsetWidth, cx = w / 2, cy = h / 2, k = S / 240;
    const pts = sample(Math.ceil(S), Math.ceil(S), g => {
      g.strokeStyle = g.fillStyle = '#fff';
      g.lineWidth = Math.max(2, 3 * k); g.beginPath(); g.arc(S / 2, S / 2, 104 * k, 0, 7); g.stroke();
      g.lineWidth = Math.max(1.2, 1.2 * k); g.beginPath(); g.arc(S / 2, S / 2, 84 * k, 0, 7); g.stroke();
      for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; g.beginPath(); g.arc(S / 2 + Math.cos(a) * 112 * k, S / 2 + Math.sin(a) * 112 * k, 3 * k, 0, 7); g.fill(); }
      g.beginPath(); [[92, 72], [100, 52], [110, 66], [120, 44], [130, 66], [140, 52], [148, 72]].forEach(([x, y], i) => i ? g.lineTo(x * k, y * k) : g.moveTo(x * k, y * k)); g.closePath(); g.fill();
      g.font = `600 ${50 * k}px Cinzel, serif`; g.textAlign = 'center'; g.fillText(`${W.initials[0]} & ${W.initials[1]}`, 120 * k, 146 * k);
    }, MOBILE ? 4 : 3);
    return pts.map(p => ({ x: p.x + cx - S / 2, y: p.y + cy - S / 2 }));
  }

  function spawn() {
    const N = LITE ? 360 : MOBILE ? 520 : 1100;
    for (let i = 0; i < N; i++) {
      const a = rand(0, Math.PI * 2), sp = Math.pow(Math.random(), 0.6) * rand(2, 9);
      parts.push({ x: w / 2, y: h / 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: rand(1.2, 3.2), a: 0, tx: null, ty: null, k: rand(0.5, 1.5), ph: rand(0, 6.28), fade: 1 });
    }
  }
  function assign() {
    if (!live || !$('.emblem-wrap') || !$('.emblem-wrap').offsetWidth) return;
    const pts = emblemTargets();
    for (let i = pts.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pts[i], pts[j]] = [pts[j], pts[i]]; }
    const n = Math.min(pts.length, parts.length - 90);
    for (let i = 0; i < n; i++) { parts[i].tx = pts[i].x; parts[i].ty = pts[i].y; }
  }
  function petalStorm() {
    const N = MOBILE ? 45 : 100;
    for (let i = 0; i < N; i++) petals.push({ x: rand(-1, 1), y: rand(-0.7, 0.7), z: rand(1.6, 4.5), vz: rand(1.3, 2.2), rot: rand(0, 6.28), vr: rand(-2, 2), spin: rand(0, 6.28), vs: rand(2, 5), s: rand(10, 18), color: pick(Math.random() < 0.75 ? PAL.rose : PAL.blush) });
  }

  function frame(dt, t) {
    if (!live) return;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    if (light.a > 0) { glow(ctx, w / 2, h / 2, light.r * 3.2, light.a * 0.45); glow(ctx, w / 2, h / 2, light.r, light.a); }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i], targeted = p.tx != null;
      if (mode === 'form' && targeted) {
        const kk = state.formK * p.k; p.vx += (p.tx - p.x) * kk * 0.5; p.vy += (p.ty - p.y) * kk * 0.5; p.vx *= 0.78; p.vy *= 0.78;
      } else if (mode === 'release' && targeted) {
        p.fade -= dt * 0.7; p.vy -= 0.012; p.vx += Math.sin(t + p.ph) * 0.02;
        if (p.fade <= 0) { parts.splice(i, 1); continue; }
      } else {
        p.vx *= 0.965; p.vy *= 0.965; p.vx += Math.sin(t * 0.6 + p.ph) * 0.012; p.vy -= 0.006;
        if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10; if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
      }
      p.x += p.vx; p.y += p.vy; p.a = Math.min(1, p.a + dt * 1.6);
      const tw = 0.55 + 0.45 * Math.sin(t * 3 * p.k + p.ph);
      const alpha = p.a * p.fade * (targeted && mode === 'form' ? 0.95 : tw * 0.7);
      glow(ctx, p.x, p.y, p.r * 2.3, alpha);
    }
    ctx.globalCompositeOperation = 'source-over';
    if (petals.length) {
      const f = Math.min(w, h) * 0.6;
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i]; p.z -= p.vz * dt; p.rot += p.vr * dt; p.spin += p.vs * dt;
        if (p.z < 0.08) { petals.splice(i, 1); continue; }
        const sx = w / 2 + (p.x * f) / p.z, sy = h / 2 + (p.y * f) / p.z;
        drawPetal(ctx, { x: sx, y: sy, s: p.s / p.z, rot: p.rot, flip: Math.cos(p.spin), color: p.color, alpha: Math.min(1, (4.6 - p.z) / 1.4) });
      }
    }
    ctx.globalAlpha = 1;
  }

  function crestDY() { const d = $('.doors'); return d.offsetTop - h / 2 - 6; }
  function crestScale() { return Math.min(0.52, (h < 500 ? 96 : 128) / $('.emblem-wrap').offsetWidth); } // smaller crest on sideways phones so it clears the text

  function typeIn() {
    const t2 = gsap.timeline();
    const k = split($('.intro-kicker')), ti = split($('.intro-title'));
    t2.set('.intro-copy', { opacity: 1 })
      .from(k, { opacity: 0, duration: 0.05, stagger: 0.03, ease: 'none' })
      .from(ti, Object.assign({ opacity: 0, y: 24, scale: 1.4, duration: 0.9, stagger: 0.07, ease: 'power3.out' }, LITE ? {} : { filter: 'blur(10px)' }), '-=.3')
      .from('.intro-sub', { opacity: 0, y: 14, duration: 1 }, '-=.5')
      .from('.intro-actions > *', { opacity: 0, y: 20, scale: 0.9, duration: 0.8, stagger: 0.15, ease: 'back.out(1.7)' }, '-=.5');
    return t2;
  }

  function play() {
    gsap.set('.intro-copy', { opacity: 0 });
    gsap.set('.doors', LITE ? { opacity: 0, scale: 1.08 } : { opacity: 0, scale: 1.08, filter: 'brightness(0)' });
    tl = gsap.timeline({ delay: 0.35 });
    tl.to(light, { r: Math.min(w, h) * 0.05, a: 1, duration: 1.3, ease: 'power2.out' })
      .add(() => { mode = 'spread'; spawn(); })
      .to(light, { a: 0, r: Math.min(w, h) * 0.16, duration: 1.5, ease: 'power2.out' })
      .add(() => { assign(); mode = 'form'; }, '-=0.55')
      .fromTo(state, { formK: 0 }, { formK: 0.16, duration: 1.9, ease: 'power2.in' }, '<')
      .add(() => { mode = 'release'; }, '+=0.25')
      .to('.emblem-wrap', { opacity: 1, duration: 0.6, ease: 'power1.out' }, '<')
      .to('.emblem-wrap', { y: crestDY, scale: crestScale, duration: 1.6, ease: 'power3.inOut' }, '+=.35')
      .to('.doors', LITE ? { opacity: 1, scale: 1, duration: 2.1, ease: 'power2.out' } : { opacity: 1, scale: 1, filter: 'brightness(1)', duration: 2.1, ease: 'power2.out', onComplete: () => gsap.set('.doors', { clearProps: 'filter' }) }, '<')
      .to('.intro-floor', { opacity: 1, duration: 2 }, '<')
      .to('.door-gap', { opacity: 1, duration: 1.2 }, '-=1')
      .to('.light-spill', { opacity: 0.7, duration: 1.4 }, '<')
      .add(typeIn(), '-=.5');
  }

  function open() {
    if (opened) return; opened = true;
    if (tl) tl.progress(1);
    if (soundPref && window.RoyalAudio) {
      RoyalAudio.setEnabled(true); RoyalAudio.bells();
      setTimeout(() => RoyalAudio.doors(), 450); setTimeout(() => RoyalAudio.whoosh(2.4), 1900);
    } else document.dispatchEvent(new CustomEvent('royal:sound', { detail: false }));
    if (RM) { gsap.to('#intro', { opacity: 0, duration: 0.6, onComplete: destroy }); onDone && onDone(); return; }
    if (LITE) gsap.set('.intro-stage', { willChange: 'transform' });
    const t3 = gsap.timeline();
    t3.to('.intro-copy', { opacity: 0, scale: 0.94, y: 20, duration: 0.7, ease: 'power2.in' })
      .to('.emblem-wrap', { opacity: 0, y: '-=30', duration: 0.6 }, '<')
      .to('.door-gap', { scaleX: 5, duration: 0.5 }, '-=.1')
      .to('.door-left', { rotationY: -112, duration: 2.8, ease: 'power2.inOut' }, '-=.15')
      .to('.door-right', { rotationY: 112, duration: 2.8, ease: 'power2.inOut' }, '<')
      .to('.door-gap', { opacity: 0, duration: 0.6 }, '<+.4')
      .to('.light-spill', { opacity: 1, scaleX: 1.5, scaleY: 1.8, duration: 2.2 }, '<')
      .add(petalStorm, '<+.9')
      .to('.intro-stage', { scale: 3.6, duration: 2.6, ease: 'power3.in' }, '<+.3')
      .to('.intro-flash', { opacity: 1, duration: 0.8, ease: 'power2.in' }, '-=.9')
      .add(() => { onDone && onDone(); })
      .to('#intro', { opacity: 0, duration: 1.4, ease: 'power2.out', onComplete: destroy });
  }

  function skip() {
    if (opened) return; opened = true;
    if (tl) tl.kill();
    document.dispatchEvent(new CustomEvent('royal:sound', { detail: false }));
    gsap.to('#intro', { opacity: 0, duration: 0.7, onComplete: destroy });
    onDone && onDone();
  }

  function destroy() { live = false; unhook && unhook(); const el = $('#intro'); el && el.remove(); }

  function init(done) {
    onDone = done;
    c = $('#intro-canvas'); resize(); addEventListener('resize', resize);
    const pref = $('#sound-pref');
    pref.addEventListener('click', () => { soundPref = !soundPref; pref.setAttribute('aria-pressed', soundPref); pref.textContent = soundPref ? '♪ Sound on' : '♪ Sound off'; });
    $('#open-invite').addEventListener('click', open);
    $('#skip-intro').addEventListener('click', skip);
    if (RM) {
      gsap.set('.emblem-wrap', { scale: 0.5, y: () => $('.doors').offsetTop - h / 2 });
      gsap.set(['.doors', '.door-gap', '.light-spill', '.intro-copy'], { opacity: 1 });
      return;
    }
    unhook = add(frame);
    // Start only once the page has settled, so a busy phone doesn't skip the light + golden sparkle:
    // fonts loaded (max 1.8 s), page loaded (max 4 s), tab actually visible, then two clean frames.
    const wait = (p, ms) => Promise.race([p, new Promise(r => setTimeout(r, ms))]);
    const fontsReady = document.fonts ? wait(document.fonts.load('600 50px Cinzel'), 1800) : Promise.resolve();
    const loaded = document.readyState === 'complete' ? Promise.resolve() : wait(new Promise(r => addEventListener('load', r, { once: true })), 4000);
    const visible = () => new Promise(r => { if (!document.hidden) return r(); const f = () => { if (!document.hidden) { document.removeEventListener('visibilitychange', f); r(); } }; document.addEventListener('visibilitychange', f); });
    const twoFrames = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    Promise.all([fontsReady, loaded]).then(visible).then(twoFrames).then(() => { if (!opened) play(); });
  }

  return { init };
})();
