/* =========================================================
   SCENES — every section is its own scene in the film
   ========================================================= */
window.Scenes = (function () {
  const { RM, MOBILE, rand, pick, PAL, fit, drawPetal, petal, stepPetal, split, add } = FX;
  const W = window.WEDDING;
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const vw = () => innerWidth, vh = () => innerHeight;
  const Audio = () => window.RoyalAudio || { enabled: false };

  /* =========================================================
     HEADINGS — a different cinematic text split per section
     ========================================================= */
  function headings() {
    $$('[data-split]').forEach(el => {
      if (el.closest('#intro')) return;
      const chars = split(el); if (RM) return;
      const st = { trigger: el, start: 'top 86%', once: true };
      const v = {
        rise: () => gsap.from(chars, { yPercent: 120, rotationX: -90, opacity: 0, transformOrigin: '50% 100%', duration: 1.1, ease: 'power4.out', stagger: 0.035, scrollTrigger: st }),
        blur: () => gsap.from(chars, { opacity: 0, filter: 'blur(14px)', scale: 1.7, duration: 1.4, ease: 'power3.out', stagger: { each: 0.06, from: 'random' }, scrollTrigger: st, clearProps: 'filter' }),
        wave: () => gsap.from(chars, { y: 80, rotation: 14, opacity: 0, duration: 1.2, ease: 'back.out(1.7)', stagger: { each: 0.045, from: 'center' }, scrollTrigger: st }),
        flip: () => gsap.from(chars, { rotationY: 95, opacity: 0, x: -24, transformOrigin: '0% 50%', duration: 1, ease: 'power3.out', stagger: 0.05, scrollTrigger: st }),
        drop: () => gsap.from(chars, { y: -140, opacity: 0, rotation: () => gsap.utils.random(-35, 35), duration: 1.3, ease: 'bounce.out', stagger: 0.04, scrollTrigger: st })
      };
      (v[el.dataset.split] || v.rise)();
    });
  }

  /* =========================================================
     ARRIVAL — palace, lights, lanterns, car, door, couple
     ========================================================= */
  const AFX = { inView: true, petals: false, list: [], dust: [], lastX: null, progress: 0 };

  function arrivalSetup() {
    const sec = $('#arrival'), cam = $('.camera'), pan = $('.pan'), car = $('.car-wrap'), chassis = $('.car-chassis'),
      wheels = $$('.car .wheel'), door = $('.car-door'), interior = $('.car-interior'), beam = $('.headbeam'),
      beamG = $('.beam-ground'), distant = $('.distant-light'), reveal = $('.couple-reveal'), flash = $('.iris-flash'),
      hint = $('.arrival-hint'), pl = $('.pillar-l'), pr = $('.pillar-r'), arch = $('.fg-arch');
    const cw = () => car.offsetWidth, ch = () => car.offsetHeight;
    const startX = () => -cw() * 1.1, endX = () => (vw() - cw()) / 2 + cw() * 0.04;
    const spin = () => ((endX() - startX()) / (2 * Math.PI * (cw() * 44 / 640))) * 360;
    const doorPt = () => ({ x: endX() + cw() * 232 / 640, y: car.offsetTop + ch() * 107 / 240 });
    const panEnd = () => -(pan.offsetWidth - vw()) / 2;

    if (RM) {
      gsap.set(car, { x: endX() }); gsap.set(pan, { x: panEnd() });
      $$('.palace .win').forEach(w => { w.style.fill = '#ffd27a'; });
      gsap.set(['.palace .gate-lit', '.ground-glow'], { opacity: 1 }); $$('.lantern').forEach(l => l.classList.add('lit'));
      gsap.set([beam, beamG], { opacity: 0.5 });
      return;
    }

    gsap.set(car, { x: startX });
    gsap.set(pan, { x: 0, scale: 1.12, transformOrigin: '50% 100%' });
    gsap.set(reveal, { clipPath: 'circle(0% at 50% 50%)', visibility: 'hidden' });
    gsap.set(['.cn-bride', '.cn-groom'], { clipPath: 'inset(-40% 100% -40% -10%)' });
    gsap.set([beam, beamG, distant, flash, hint], { opacity: 0 });
    wheels.forEach(wh => gsap.set(wh, { svgOrigin: wh.dataset.o }));
    gsap.set(door, { svgOrigin: '198 107' });
    gsap.set(chassis, { svgOrigin: '320 192' });

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: () => '+=' + vh() * (MOBILE ? 4.4 : 5.6), pin: true, scrub: 1, invalidateOnRefresh: true,
        onToggle: s => { AFX.inView = s.isActive; if (!s.isActive) Audio().engine && RoyalAudio.engine.stop(); },
        onUpdate: s => { AFX.progress = s.progress; hint.classList.toggle('gone', s.progress > 0.012); }
      }
    });
    tl.fromTo(distant, { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1, duration: 1, ease: 'power1.out' }, 0.2)
      .to(car, { x: endX, duration: 5, ease: 'power2.out' }, 1)
      .to(wheels, { rotation: spin, duration: 5, ease: 'power2.out' }, 1)
      .to(distant, { opacity: 0, duration: 0.8 }, 1.7)
      .to([beam, beamG], { opacity: 1, duration: 0.8 }, 1.2)
      .to(chassis, { rotation: 0.9, duration: 0.35, ease: 'sine.out' }, 5.55)
      .to(chassis, { rotation: 0, duration: 0.7, ease: 'elastic.out(1,.35)' }, 5.9)
      .to([beam, beamG], { opacity: 0.55, duration: 0.6 }, 6)
      .to(cam, { scale: MOBILE ? 1.7 : 2, transformOrigin: () => { const p = doorPt(); return `${p.x}px ${p.y}px`; }, duration: 2, ease: 'power2.inOut' }, 6.4)
      .to(pl, { xPercent: -140, duration: 2, ease: 'power2.inOut' }, 6.4)
      .to(pr, { xPercent: 140, duration: 2, ease: 'power2.inOut' }, 6.4)
      .to(arch, { yPercent: -120, duration: 2, ease: 'power2.inOut' }, 6.4)
      .to('.lanterns', { yPercent: -60, opacity: 0, duration: 2, ease: 'power2.in' }, 6.4)
      .to(door, { scaleX: -0.3, duration: 1, ease: 'power2.inOut' }, 8.3)
      .to(interior, { opacity: 1, duration: 0.8 }, 8.3)
      .to(flash, { opacity: 1, duration: 0.5, ease: 'power2.in' }, 9)
      .set(reveal, { visibility: 'visible' }, 9.2)
      .fromTo(reveal, { clipPath: () => { const p = doorPt(); return `circle(0% at ${p.x}px ${p.y}px)`; } }, { clipPath: () => { const p = doorPt(); return `circle(150% at ${p.x}px ${p.y}px)`; }, duration: 1.4, ease: 'power2.inOut' }, 9.2)
      .to(flash, { opacity: 0, duration: 1 }, 9.7)
      .fromTo('.couple-frame', { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, ease: 'power2.out' }, 9.7)
      .fromTo('.couple-halo', { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.6 }, 9.7)
      .to('.cn-bride', { clipPath: 'inset(-40% -10% -40% -10%)', duration: 1.2, ease: 'power1.inOut' }, 10.5)
      .fromTo('.cn-amp', { opacity: 0, scale: 0.3, rotation: -30 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2)' }, 11.3)
      .to('.cn-groom', { clipPath: 'inset(-40% -10% -40% -10%)', duration: 1.2, ease: 'power1.inOut' }, 11.6)
      .fromTo(['.couple-line', '.couple-date'], { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 }, 12.5)
      .to({}, { duration: 1 }, 13.3);
    tl.call(() => { if (AFX.progress > 0.6 && AFX.progress < 0.75) Audio().chime && RoyalAudio.chime(); }, null, 9.2);
  }

  function arrivalPlay(cb) {
    if (RM) { cb && cb(); return; }
    const pan = $('.pan');
    const wins = $$('.palace .win').map(w => { const b = w.getBBox(); return { w, d: Math.abs(b.x + b.width / 2 - 1200) + Math.abs(b.y - 600) * 0.4 }; }).sort((a, b) => a.d - b.d).map(o => o.w);
    const t = gsap.timeline();
    t.to(pan, { x: () => -(pan.offsetWidth - vw()) / 2, scale: 1, duration: 5.5, ease: 'power2.inOut' }, 0)
      .from('.sky', { filter: 'brightness(.3)', duration: 3, ease: 'power1.out', clearProps: 'filter' }, 0)
      .to(wins, { fill: '#ffd27a', duration: 0.3, stagger: 0.045, ease: 'power1.in' }, 1)
      .to('.palace .gate-lit', { opacity: 1, duration: 1.2 }, 1.4)
      .to('.ground-glow', { opacity: 1, duration: 2.5 }, 1.4)
      .add(() => { $$('.lantern').forEach((l, i) => setTimeout(() => l.classList.add('lit'), i * 280)); }, 2.4)
      .add(() => { AFX.petals = true; }, 3.2)
      .to('.arrival-hint', { opacity: 1, duration: 1 }, 4)
      .add(() => cb && cb(), 3.6);
    // occasional window flicker for life
    gsap.delayedCall(7, function flick() {
      const w = pick(wins); gsap.fromTo(w, { opacity: 0.4 }, { opacity: 1, duration: 0.12, repeat: 3, yoyo: true, ease: 'steps(1)' });
      gsap.delayedCall(rand(2, 5), flick);
    });
  }

  function arrivalFX() {
    const c = $('#arrival-canvas'); let { ctx, w, h } = fit(c);
    addEventListener('resize', () => ({ ctx, w, h } = fit(c)));
    const car = $('.car-wrap'), max = MOBILE ? 22 : 46;
    add(dt => {
      if (!AFX.inView || RM) return;
      ctx.clearRect(0, 0, w, h);
      const cx = gsap.getProperty(car, 'x'), cw = car.offsetWidth, chh = car.offsetHeight, ctop = car.offsetTop;
      const vel = AFX.lastX == null ? 0 : (cx - AFX.lastX) / Math.max(dt * 60, 0.3); AFX.lastX = cx;
      const ground = ctop + chh * 0.97, k = dt * 60;
      // engine audio follows the car's speed
      const A = Audio();
      if (A.enabled && A.engine) {
        const onScreen = cx > -cw * 0.9 && AFX.progress < 0.62;
        if (onScreen) { A.engine.start(); A.engine.level(Math.min(1, 0.2 + Math.abs(vel) / 6)); } else if (A.engine.on) A.engine.stop();
      }
      // dust kicked up behind the rear wheel
      if (Math.abs(vel) > 0.6 && AFX.dust.length < 140) {
        const rx = cx + cw * 150 / 640;
        for (let i = 0; i < 2; i++) AFX.dust.push({ x: rx + rand(-cw * 0.07, 0), y: ground - rand(0, 8), vx: -rand(0.2, 1) - vel * 0.05, vy: -rand(0.1, 0.6), r: rand(4, 10), life: 1 });
      }
      for (let i = AFX.dust.length - 1; i >= 0; i--) {
        const d = AFX.dust[i]; d.x += d.vx * k; d.y += d.vy * k; d.r += 0.35 * k; d.life -= dt * 0.9;
        if (d.life <= 0) { AFX.dust.splice(i, 1); continue; }
        ctx.globalAlpha = 1; ctx.fillStyle = `rgba(200,160,120,${(d.life * 0.16).toFixed(3)})`; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.283); ctx.fill();
      }
      // falling petals that settle, then get swept up by the car
      if (AFX.petals && AFX.list.length < max && Math.random() < 0.3) AFX.list.push(petal({ x: rand(-50, w), y: -20, vy: rand(0.5, 1.1), vx: rand(0.1, 0.5), s: rand(5, 10), color: pick(Math.random() < 0.8 ? PAL.rose : PAL.blush) }));
      for (let i = AFX.list.length - 1; i >= 0; i--) {
        const p = AFX.list[i];
        if (p.rest) {
          p.life -= dt; p.alpha = Math.min(1, p.life);
          if (Math.abs(vel) > 0.5 && p.x > cx + cw * 0.1 && p.x < cx + cw * 1.08) { p.rest = false; p.vy = -rand(1.5, 3.2); p.vx = vel * 0.6 + rand(0, 1); p.vs = rand(0.05, 0.12); }
          if (p.life <= 0) { AFX.list.splice(i, 1); continue; }
          drawPetal(ctx, p); continue;
        }
        stepPetal(p, dt); p.vy = Math.min(p.vy + 0.02 * k, 1.5); p.vx *= 0.99;
        if (Math.abs(vel) > 0.5) { const dx = p.x - (cx + cw); if (dx > -cw && dx < 170 && p.y > ctop - 60 && p.y < ground) { p.vx += vel * 0.015; p.vy -= 0.05; } }
        if (p.y >= ground - 4 + (p.ph % 1) * 16 && p.vy > 0) { p.rest = true; p.life = rand(2, 5); p.vs = 0; }
        if (p.x > w + 40 || p.y > h + 40) AFX.list.splice(i, 1); else drawPetal(ctx, p);
      }
      ctx.globalAlpha = 1;
    });
  }

  /* =========================================================
     INVITATION — curtains part, seal breaks, card slides out
     ========================================================= */
  function invitation() {
    if (RM) return;
    gsap.set('.env-flap', { transformPerspective: 1100, transformOrigin: '50% 0%' });
    gsap.set('.card-border-inv rect', { strokeDashoffset: 1 });
    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, scrollTrigger: { trigger: '#invitation', start: 'top top', end: () => '+=' + vh() * (MOBILE ? 2.6 : 3.2), pin: true, scrub: 1, onEnter: () => Audio().whoosh && RoyalAudio.whoosh(1.4) } });
    tl.to('.sheer-l', { xPercent: -100, duration: 1.6 }, 0).to('.sheer-r', { xPercent: 100, duration: 1.6 }, 0)
      .from('.envelope', { y: () => vh() * 0.45, rotationX: 28, opacity: 0, transformPerspective: 1200, duration: 1.6, ease: 'power3.out' }, 0.2)
      .from('.inv-intro', { opacity: 0, y: 30, duration: 1 }, 0.5)
      .to('.seal-glow', { opacity: 1, scale: 2.2, duration: 0.4, ease: 'power2.out' }, 1.9)
      .to('.seal-l', { x: -46, y: 26, rotation: -38, opacity: 0, duration: 0.8 }, 2)
      .to('.seal-r', { x: 46, y: 26, rotation: 38, opacity: 0, duration: 0.8 }, 2)
      .to('.seal-glow', { opacity: 0, duration: 0.5 }, 2.3)
      .to('.inv-intro', { opacity: 0, y: -30, duration: 0.6 }, 2.6)
      .to('.env-flap', { rotationX: 180, duration: 1.2 }, 2.6)
      .set('.env-flap', { zIndex: 1 }, 3.2)
      .to('.inv-card', { yPercent: -62, duration: 1.3 }, 3.8)
      .set('.inv-card', { zIndex: 6 }, 5.1)
      .to(['.env-back', '.env-front', '.env-flap'], { yPercent: 90, opacity: 0, duration: 1.2, ease: 'power2.in' }, 5.1)
      .to('.inv-card', { yPercent: 0, scale: MOBILE ? 1.04 : 1.12, duration: 1.3 }, 5.1)
      .to('.card-border-inv rect', { strokeDashoffset: 0, duration: 1.4, stagger: 0.2 }, 6)
      .from('.inv-card .ic-mono', { rotation: -220, scale: 0, opacity: 0, duration: 1.2, ease: 'back.out(1.4)' }, 6.1)
      .from('.inv-card .ic-stagger', { opacity: 0, y: 16, duration: 0.6, stagger: 0.15 }, 6.3)
      .to({}, { duration: 0.8 });
  }

  /* =========================================================
     OUR STORY — self-drawing golden timeline
     ========================================================= */
  function story() {
    const tlEl = $('.timeline');
    if (!tlEl) return;
    if (!RM) {
      gsap.to('.tl-fill', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: tlEl, start: 'top 55%', end: 'bottom 55%', scrub: true } });
      gsap.to('.tl-head', { y: () => $('.tl-track').offsetHeight, ease: 'none', scrollTrigger: { trigger: tlEl, start: 'top 55%', end: 'bottom 55%', scrub: true, invalidateOnRefresh: true } });
      gsap.to('.peacock', { yPercent: -40, ease: 'none', scrollTrigger: { trigger: '#story', start: 'top bottom', end: 'bottom top', scrub: true } });
      ScrollTrigger.create({ trigger: '#story', start: 'top 60%', once: true, onEnter: () => FX.stream() });
    }
    $$('.milestone').forEach((m, i) => {
      ScrollTrigger.create({ trigger: m, start: 'top 55%', onEnter: () => { m.classList.add('is-on'); Audio().chime && RoyalAudio.chime(); }, onLeaveBack: () => m.classList.remove('is-on') });
      if (RM) return;
      const st = { trigger: m, start: 'top 72%' }, right = m.classList.contains('right'), media = $('.ms-media', m);
      if (i % 2 === 0) gsap.fromTo(media, { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', duration: 1.7, ease: 'power3.inOut', scrollTrigger: st });
      else gsap.to($$('.ms-curtain', m), { scaleX: 0, duration: 1.5, ease: 'power3.inOut', scrollTrigger: st });
      gsap.from(media.children, { scale: 1.35, duration: 2.2, ease: 'power2.out', scrollTrigger: st });
      gsap.from($('.ms-text', m).children, { opacity: 0, x: MOBILE ? 0 : (right ? -50 : 50), y: MOBILE ? 30 : 0, duration: 1.1, stagger: 0.14, ease: 'power3.out', scrollTrigger: st });
      gsap.from($('.ms-day', m), { yPercent: 110, duration: 1, ease: 'power4.out', scrollTrigger: st });
      const yEl = $('.ms-year', m), yr = +yEl.dataset.y, o = { v: yr - 24 };
      yEl.textContent = yr - 24;
      gsap.to(o, { v: yr, duration: 1.9, ease: 'power3.out', scrollTrigger: st, onUpdate: () => { yEl.textContent = Math.round(o.v); } });
    });
  }

  /* =========================================================
     GALLERY — pinned horizontal film strip with 3D frames
     ========================================================= */
  function gallery() {
    if (RM || !$('#gallery')) return;
    const sec = $('#gallery'), track = $('.gal-track');
    const dist = () => Math.max(0, track.scrollWidth - vw());
    const tw = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true } });
    gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(), scrub: true } })
      .to(sec, { backgroundColor: '#14143a', ease: 'none' }).to(sec, { backgroundColor: '#0d2a24', ease: 'none' }).to(sec, { backgroundColor: '#2a0d18', ease: 'none' });
    gsap.to('.gal-progress span', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(), scrub: true } });
    const masks = [
      ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'],
      ['circle(0% at 50% 40%)', 'circle(80% at 50% 40%)'],
      ['inset(0% 50% 0% 50%)', 'inset(0% 0% 0% 0%)'],
      ['polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)', 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)']
    ];
    $$('.gal-item').forEach((it, i) => {
      const fr = $('.frame3d', it), media = $('.media', it), m = masks[i % masks.length];
      gsap.fromTo(fr, { rotationY: 26, transformPerspective: 1100 }, { rotationY: -26, ease: 'none', scrollTrigger: { trigger: it, containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } });
      gsap.fromTo(media, { clipPath: m[0] }, { clipPath: m[1], ease: 'power2.out', scrollTrigger: { trigger: it, containerAnimation: tw, start: 'left 98%', end: 'left 52%', scrub: true } });
      gsap.fromTo(media, { xPercent: -8 }, { xPercent: 8, ease: 'none', scrollTrigger: { trigger: it, containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } });
      gsap.from($('figcaption', it), { opacity: 0, y: 30, scrollTrigger: { trigger: it, containerAnimation: tw, start: 'left 70%', end: 'left 45%', scrub: true } });
    });
  }

  /* =========================================================
     EVENTS — each ceremony gets its own entrance
     ========================================================= */
  function events() {
    $$('.event-card').forEach(card => {
      tilt(card);
      if (!RM) gsap.fromTo(card.querySelectorAll('.card-border rect'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', stagger: 0.3, scrollTrigger: { trigger: card, start: 'top 82%' } });
    });
    if (RM) return;

    /* HALDI — marigolds bloom, yellow floral wipe, petal rain */
    const haldi = $('#haldi');
    const rain = new FX.Rain($('#haldi-canvas'), { pal: PAL.marigold, count: 70, size: [5, 10] });
    gsap.fromTo(haldi, { clipPath: 'inset(14% 5% 0% 5% round 48px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: haldi, start: 'top bottom', end: 'top 15%', scrub: true } });
    gsap.from('.mflower', { scale: 0, rotation: -140, duration: 1.6, ease: 'back.out(1.5)', stagger: { each: 0.08, from: 'center' }, scrollTrigger: { trigger: haldi, start: 'top 75%' } });
    gsap.from('#haldi .ev-inner', { y: 160, rotation: -6, opacity: 0, duration: 1.5, ease: 'power3.out', scrollTrigger: { trigger: haldi, start: 'top 55%' } });
    ScrollTrigger.create({ trigger: haldi, start: 'top 80%', end: 'bottom top', onToggle: s => s.isActive ? rain.start() : rain.stop() });

    /* MEHENDI — henna mandala draws itself, card blooms from the centre */
    const meh = $('#mehendi'), hd = $$('#mehendi .hd');
    gsap.set(hd, { strokeDashoffset: 1 });
    gsap.to(hd, { strokeDashoffset: 0, ease: 'none', stagger: { each: 0.012 }, scrollTrigger: { trigger: meh, start: 'top 80%', end: 'center 45%', scrub: 1 } });
    gsap.from('#mehendi .hdot', { opacity: 0, stagger: 0.01, scrollTrigger: { trigger: meh, start: 'top 40%', end: 'center center', scrub: 1 } });
    gsap.fromTo('.mandala', { rotation: -50, scale: 0.75 }, { rotation: 20, scale: 1, ease: 'none', scrollTrigger: { trigger: meh, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo('#mehendi .ev-inner', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(85% at 50% 50%)', duration: 1.7, ease: 'power2.inOut', scrollTrigger: { trigger: meh, start: 'top 45%' }, onComplete: () => gsap.set('#mehendi .ev-inner', { clearProps: 'clipPath' }) });

    /* SANGEET — stage lights sweep, waveform pulses, card spotlit */
    const sang = $('#sangeet');
    ScrollTrigger.create({ trigger: sang, start: 'top 70%', end: 'bottom 20%', onToggle: s => sang.classList.toggle('is-live', s.isActive) });
    gsap.to('.beam', { opacity: 1, duration: 1, stagger: 0.2, scrollTrigger: { trigger: sang, start: 'top 60%' } });
    $$('.beam').forEach((b, i) => gsap.fromTo(b, { rotation: i % 2 ? -24 : 24 }, { rotation: i % 2 ? 18 : -18, duration: rand(2.6, 4), repeat: -1, yoyo: true, ease: 'sine.inOut' }));
    gsap.from('.spotlight', { opacity: 0, scale: 0.3, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: sang, start: 'top 50%' } });
    gsap.from('#sangeet .ev-inner', { scale: 0.6, opacity: 0, filter: 'blur(20px)', duration: 1.4, ease: 'expo.out', clearProps: 'filter', scrollTrigger: { trigger: sang, start: 'top 50%' } });
    // neon flicker — even repeat count + explicit end so the title always ends fully visible
    gsap.fromTo('#sangeet .ec-title', { opacity: 0 }, { opacity: 1, duration: 0.07, repeat: 6, yoyo: true, ease: 'steps(1)', immediateRender: false, scrollTrigger: { trigger: sang, start: 'top 40%' }, onComplete: () => gsap.set('#sangeet .ec-title', { opacity: 1 }) });

    /* LAGAN SAGAI — a field of diyas lights up one by one */
    const lag = $('#lagan');
    if (lag) {
      const flames = $$('#lagan .diya b');
      gsap.set(flames, { scale: 0, opacity: 0 });
      gsap.to(flames, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(3)', stagger: { each: 0.06, from: 'center' }, scrollTrigger: { trigger: lag, start: 'top 60%' } });
      gsap.fromTo('.diya-glow', { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 2.2, ease: 'power2.out', scrollTrigger: { trigger: lag, start: 'top 55%' } });
      gsap.from('#lagan .ev-inner', { y: 90, opacity: 0, rotationX: 25, transformPerspective: 900, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: lag, start: 'top 50%' } });
      gsap.to('.diya-field', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: lag, start: 'top bottom', end: 'bottom top', scrub: true } });
    }

    /* WEDDING — royal velvet curtains part to reveal the mandap */
    const wtl = gsap.timeline({ scrollTrigger: { trigger: '#wedding', start: 'top top', end: () => '+=' + vh() * 1.7, pin: true, scrub: 1, onEnter: () => Audio().whoosh && RoyalAudio.whoosh(1.8) } });
    wtl.to('.curtain-l', { scaleX: 0.2, duration: 2, ease: 'power2.inOut' }, 0)
      .to('.curtain-r', { scaleX: 0.2, duration: 2, ease: 'power2.inOut' }, 0)
      .from('.mandap-wrap', { scale: 1.3, yPercent: 10, transformOrigin: '50% 100%', duration: 2.4, ease: 'power2.out' }, 0)
      .from('.wed-glow', { opacity: 0, scale: 0.4, duration: 2 }, 0.4)
      .from('#wedding .ev-inner', { opacity: 0, y: 80, duration: 1.2, ease: 'power3.out' }, 1.4)
      .to({}, { duration: 0.6 });
  }

  /* =========================================================
     VENUE — gold border draws, map unveils through an arch, pin drops
     ========================================================= */
  function venue() {
    if (RM) return;
    $$('.venue-card').forEach(card => {
      const st = { trigger: card, start: 'top 75%' }, frame = $('.map-frame', card), flip = card.classList.contains('flip');
      const rects = $$('.card-border rect', card);
      gsap.set(rects, { strokeDashoffset: 1 });
      gsap.to(rects, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', stagger: 0.3, scrollTrigger: st });
      gsap.fromTo(frame, { clipPath: 'inset(100% 0% 0% 0% round 40px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.6, ease: 'power3.inOut', scrollTrigger: st, onComplete: () => gsap.set(frame, { clearProps: 'clipPath' }) });
      gsap.from(card, { x: MOBILE ? 0 : (flip ? 60 : -60), opacity: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: st });
      gsap.from($('.venue-pin', card), { y: -120, opacity: 0, duration: 1.1, ease: 'bounce.out', delay: 0.5, scrollTrigger: st });
      gsap.from($$('.venue-info > *:not(.venue-pin)', card), { opacity: 0, y: 24, duration: 0.9, stagger: 0.12, delay: 0.7, ease: 'power3.out', scrollTrigger: st });
    });
  }

  /* =========================================================
     RINGS — two rings spin together into an infinity
     ========================================================= */
  function rings() {
    if (RM) return;
    gsap.set(['.rw-l', '.rw-r'], { transformPerspective: 700 });
    const off = () => $('.ring-wrap').offsetWidth * 0.42;
    const tl = gsap.timeline({ scrollTrigger: { trigger: '#rings', start: 'top top', end: () => '+=' + vh() * 2, pin: true, scrub: 1, invalidateOnRefresh: true } });
    tl.fromTo('.rw-l', { x: () => -vw() * 0.6, rotationY: 0, rotation: -30 }, { x: () => -off(), rotationY: 720, rotation: 0, duration: 3, ease: 'power3.out' }, 0)
      .fromTo('.rw-r', { x: () => vw() * 0.6, rotationY: 0, rotation: 30 }, { x: off, rotationY: -720, rotation: 0, duration: 3, ease: 'power3.out' }, 0)
      .to('.rings-flash', { opacity: 1, scale: 1.6, duration: 0.3 }, 3)
      .to('.rings-flash', { opacity: 0, duration: 0.6 }, 3.3)
      .to('.inf-path', { strokeDashoffset: 0, duration: 2, ease: 'power1.inOut' }, 3.3)
      .to('.inf-glow', { opacity: 0.7, duration: 1.4 }, 3.8)
      .to(['.rw-l', '.rw-r'], { opacity: 0.2, scale: 0.92, duration: 1.4 }, 4.2)
      .fromTo('.rings-copy > *', { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.2, duration: 1 }, 4.4)
      .to({}, { duration: 0.6 });
    tl.call(() => Audio().chime && RoyalAudio.chime(), null, 3);
  }

  /* =========================================================
     COUNTDOWN — rolling digits + golden fireworks
     ========================================================= */
  function countdown() {
    const target = new Date(W.dateISO).getTime(), units = {};
    ['d', 'h', 'm', 's'].forEach(u => { units[u] = $(`[data-u="${u}"]`); });
    const setNum = (el, val, anim) => {
      const cur = el.lastElementChild; if (cur && cur.textContent === val) return;
      const n = document.createElement('span'); n.textContent = val; el.appendChild(n);
      if (anim && cur && !RM) {
        gsap.fromTo(n, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
        gsap.to(cur, { yPercent: -100, opacity: 0, duration: 0.6, ease: 'power3.out', onComplete: () => cur.remove() });
      } else if (cur) cur.remove();
    };
    const parts = () => {
      let diff = Math.max(0, target - Date.now());
      const d = Math.floor(diff / 864e5); diff -= d * 864e5; const h = Math.floor(diff / 36e5); diff -= h * 36e5; const m = Math.floor(diff / 6e4); diff -= m * 6e4;
      return { d, h, m, s: Math.floor(diff / 1000) };
    };
    const show = (p, anim) => Object.keys(units).forEach(u => setNum(units[u], String(p[u]).padStart(2, '0'), anim));
    show(parts(), false);
    let live = false;
    setInterval(() => { if (live || RM) show(parts(), true); }, 1000);
    if (RM) return;
    const fw = new FX.Fireworks($('#fw-canvas'), { rate: 1, sound: true });
    ScrollTrigger.create({
      trigger: '#countdown', start: 'top 60%', end: 'bottom 30%',
      onToggle: s => s.isActive ? fw.start() : fw.stop(),
      onEnter: () => { if (live) return; const p = parts(), o = { k: 0 }; gsap.to(o, { k: 1, duration: 1.8, ease: 'power3.out', onUpdate: () => show({ d: Math.round(p.d * o.k), h: Math.round(p.h * o.k), m: Math.round(p.m * o.k), s: Math.round(p.s * o.k) }, false), onComplete: () => { live = true; } }); [0.2, 0.6, 0.9].forEach((t, i) => setTimeout(() => fw.launch(fw.w * (0.25 + i * 0.25)), t * 1000)); }
    });
    gsap.from('.cd-part', { y: -120, opacity: 0, rotationX: 90, duration: 1.3, ease: 'bounce.out', stagger: 0.18, scrollTrigger: { trigger: '#countdown', start: 'top 65%' } });
    gsap.from('.cd-date .dot', { scale: 0, rotation: 180, duration: 1, stagger: 0.2, ease: 'back.out(2)', scrollTrigger: { trigger: '#countdown', start: 'top 60%' } });
    gsap.from('.cd-unit', { y: 50, opacity: 0, duration: 1, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.cd-grid', start: 'top 85%' } });
  }

  /* =========================================================
     RSVP — validation, button morph, wax-seal confirmation
     ========================================================= */
  function rsvp() {
    const form = $('#rsvp-form'), done = $('.rsvp-done'), err = $('.form-error'), btn = $('.rsvp-submit');
    if (!form) return;
    if (!RM) {
      gsap.set('.card-border-rsvp rect', { strokeDashoffset: 1 });
      gsap.to('.card-border-rsvp rect', { strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut', stagger: 0.3, scrollTrigger: { trigger: '.rsvp-card', start: 'top 80%' } });
      gsap.from('.rsvp-form > *', { opacity: 0, y: 30, duration: 0.9, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.rsvp-card', start: 'top 75%' } });
      ScrollTrigger.create({ trigger: '#rsvp', start: 'top 50%', once: true, onEnter: () => FX.stream() });
    }
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = form.name.value.trim(), field = form.name.closest('.field');
      if (!name) {
        err.textContent = 'Please share your name so we know who is coming.'; field.classList.add('is-error');
        gsap.fromTo(field, { x: -10 }, { x: 0, duration: 0.6, ease: 'elastic.out(1,.3)' }); form.name.focus(); return;
      }
      err.textContent = ''; field.classList.remove('is-error');
      const data = { name, attend: form.attend.value, guests: form.guests.value, events: $$('input[name="events"]:checked', form).map(i => i.value), msg: form.msg.value.trim(), at: new Date().toISOString() };
      try { localStorage.setItem('royal-rsvp', JSON.stringify(data)); } catch (_) {}
      $('.done-name').textContent = name.split(' ')[0];
      const r = btn.getBoundingClientRect();
      const tl = gsap.timeline();
      tl.to('.btn-label', { opacity: 0, duration: 0.25 })
        .to(btn, { width: btn.offsetHeight, padding: 0, duration: 0.5, ease: 'power3.inOut' })
        .to('.btn-check', { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out' })
        .add(() => { FX.burst(r.left + r.width / 2, r.top + r.height / 2, MOBILE ? 26 : 50); Audio().bells && RoyalAudio.bells(); })
        .to(form, { opacity: 0, y: -20, duration: 0.5, delay: 0.3 })
        .add(() => { form.hidden = true; done.hidden = false; })
        .fromTo('.seal-stamp', { scale: 3, rotation: -40, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.6, ease: 'power4.in' })
        .to('.rsvp-card', { x: 5, duration: 0.05, repeat: 5, yoyo: true })
        .from(['.done-title', '.done-text', '#rsvp-edit'], { opacity: 0, y: 20, stagger: 0.12, duration: 0.6 });
      if (RM) tl.progress(1);
    });
    $('#rsvp-edit').addEventListener('click', () => {
      done.hidden = true; form.hidden = false;
      gsap.set(form, { opacity: 1, y: 0 }); gsap.set(btn, { clearProps: 'width,padding' }); gsap.set('.btn-label', { opacity: 1 }); gsap.set('.btn-check', { strokeDashoffset: 1 });
    });
  }

  /* =========================================================
     FINALE — golden particle names, rose rain, fireworks
     ========================================================= */
  function finale() {
    if (RM) return;
    const names = new FX.NameParticles($('#finale-canvas'), `${W.bride} & ${W.groom}`);
    const fw = new FX.Fireworks($('#finale-fw'), { rate: 0.8 });
    const rain = new FX.Rain($('#finale-petals'), { pal: PAL.rose.concat(PAL.blush), count: 55 });
    ScrollTrigger.create({
      trigger: '#finale', start: 'top 55%', end: 'bottom top',
      onEnter: () => {
        names.form(); fw.start(); rain.start(); FX.stream(); setTimeout(() => FX.stream(), 1600);
        // once the particles have formed, crisp gold names take over and the particles soften into a glow
        gsap.to('.finale-names', { opacity: 1, duration: 1.4, delay: 2.4, ease: 'power2.out' });
        gsap.to(names, { dim: 0.28, duration: 1.4, delay: 2.6 });
      },
      onEnterBack: () => { fw.start(); rain.start(); },
      onLeaveBack: () => { fw.stop(); rain.stop(); }
    });
    gsap.from('.finale-copy > *', { opacity: 0, y: 30, duration: 1.2, stagger: 0.18, ease: 'power3.out', scrollTrigger: { trigger: '#finale', start: 'top 30%' } });
    $('#finale').addEventListener('click', e => { if (!e.target.closest('button')) names.scatter(); });
  }

  /* =========================================================
     MICRO-INTERACTIONS
     ========================================================= */
  function tilt(el) {
    if (MOBILE || RM) return;
    gsap.set(el, { transformPerspective: 900 });
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.7, ease: 'power3' }), ry = gsap.quickTo(el, 'rotationY', { duration: 0.7, ease: 'power3' });
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      ry((px - 0.5) * 14); rx((0.5 - py) * 12);
      el.style.setProperty('--mx', (px * 100).toFixed(1) + '%'); el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    });
    el.addEventListener('pointerleave', () => { rx(0); ry(0); });
  }
  function magnetic(el, strength) {
    if (MOBILE || RM) return; strength = strength || 0.32;
    const xt = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' }), yt = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
    el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); xt((e.clientX - r.left - r.width / 2) * strength); yt((e.clientY - r.top - r.height / 2) * strength); });
    el.addEventListener('pointerleave', () => { xt(0); yt(0); });
  }
  function interactions(lenis) {
    $$('.magnetic, .menu-btn, .music-btn').forEach(el => magnetic(el));
    // golden ripple on every button
    document.addEventListener('pointerdown', e => {
      const b = e.target.closest('.btn-royal, .btn-ghost'); if (!b) return;
      const r = b.getBoundingClientRect(), s = document.createElement('span'), size = Math.max(r.width, r.height) * 2.4;
      s.className = 'ripple'; Object.assign(s.style, { width: size + 'px', height: size + 'px', left: e.clientX - r.left - size / 2 + 'px', top: e.clientY - r.top - size / 2 + 'px' });
      b.appendChild(s); gsap.fromTo(s, { scale: 0, opacity: 0.9 }, { scale: 1, opacity: 0, duration: 0.9, ease: 'power2.out', onComplete: () => s.remove() });
    });
    // custom cursor
    if (!MOBILE && !RM && matchMedia('(hover: hover) and (pointer: fine)').matches) {
      document.body.classList.add('has-cursor');
      const cur = $('.cursor'), dot = $('.cursor-dot'), ring = $('.cursor-ring');
      const dx = gsap.quickTo(dot, 'x', { duration: 0.08 }), dy = gsap.quickTo(dot, 'y', { duration: 0.08 });
      const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
      addEventListener('pointermove', e => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); }, { passive: true });
      document.addEventListener('pointerover', e => cur.classList.toggle('is-hover', !!e.target.closest('a, button, label, input, select, textarea, .event-card, .frame3d, .ms-photo')));
      addEventListener('pointerdown', () => cur.classList.add('is-down')); addEventListener('pointerup', () => cur.classList.remove('is-down'));
    }
    // calendar buttons
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-ics]'); if (!b) return;
      const ev = W.events.find(x => x.key === b.dataset.ics); if (!ev) return;
      const start = new Date(ev.date), end = new Date(start.getTime() + (ev.hours || 4) * 36e5);
      const f = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      const ymd = d => d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }).replace(/-/g, '');
      const day = ymd(start), next = ymd(new Date(start.getTime() + 864e5));
      // no fixed time yet → all-day event
      const when = ev.time ? [`DTSTART:${f(start)}`, `DTEND:${f(end)}`] : [`DTSTART;VALUE=DATE:${day}`, `DTEND;VALUE=DATE:${next}`];
      const loc = ev.venue.includes(W.city) ? ev.venue : `${ev.venue}, ${W.city}`;
      const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Royal Wedding//EN', 'BEGIN:VEVENT', `UID:${ev.key}-${day}@royal-wedding`, `DTSTAMP:${f(new Date())}`, ...when,
        `SUMMARY:${ev.name} · ${W.bride} & ${W.groom}`, `LOCATION:${loc.replace(/,/g, '\\,')}`, `DESCRIPTION:${(ev.time || 'Time to be announced') + (ev.dress ? ' · Attire: ' + ev.dress : '')}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = `${ev.key}-${W.bride}-${W.groom}.ics`.toLowerCase();
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1500);
      const t = b.textContent; b.textContent = 'Added ✦'; setTimeout(() => { b.textContent = t; }, 2200);
    });
    // menu
    const menu = $('#menu'), mb = $('#menu-btn'), nav = $('#nav'); let open = false;
    const mtl = gsap.timeline({ paused: true })
      .set(menu, { visibility: 'visible' })
      .to(menu, { clipPath: 'circle(150% at calc(100% - 70px) 40px)', duration: 0.9, ease: 'power3.inOut' })
      .from('.menu a', { yPercent: 110, opacity: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out' }, '-=.45');
    const setMenu = o => {
      open = o; nav.classList.toggle('menu-open', o); mb.setAttribute('aria-expanded', o);
      $('.menu-label').textContent = o ? 'Close' : 'Menu';
      if (o) { mtl.timeScale(1).play(); lenis && lenis.stop(); } else { mtl.timeScale(1.6).reverse(); lenis && lenis.start(); }
    };
    mb.addEventListener('click', () => setMenu(!open));
    addEventListener('keydown', e => { if (e.key === 'Escape' && open) setMenu(false); });
    $$('[data-link]').forEach(a => a.addEventListener('click', e => {
      e.preventDefault(); const id = a.getAttribute('href'); if (open) setMenu(false);
      const target = id === '#arrival' ? 0 : $(id);
      setTimeout(() => { if (lenis) lenis.scrollTo(target, { duration: 2.2 }); else (target === 0 ? scrollTo({ top: 0, behavior: 'smooth' }) : target.scrollIntoView({ behavior: 'smooth' })); }, open ? 500 : 0);
    }));
    // nav hides on scroll down, returns on scroll up
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => { if (!open) nav.classList.toggle('is-hidden', s.direction === 1 && s.scroll() > 300); } });
    // replay
    $('#replay').addEventListener('click', () => { scrollTo(0, 0); location.reload(); });
  }

  function init(lenis) {
    headings(); arrivalSetup(); arrivalFX(); invitation(); story(); gallery(); events();
    venue();
    rings(); countdown(); rsvp(); finale(); interactions(lenis);
  }

  return { init, arrivalPlay };
})();
