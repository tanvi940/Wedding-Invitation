/* =========================================================
   FX — canvas particle systems (one shared ticker)
   ========================================================= */
(function () {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MOBILE = matchMedia('(max-width: 768px), (pointer: coarse)').matches;
  const DPR = Math.min(window.devicePixelRatio || 1, MOBILE ? 1.25 : 1.75);
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[(Math.random() * a.length) | 0];
  const PAL = {
    rose: ['#9e0f2f', '#c21f45', '#e04a6b', '#f07b95', '#7a0b24'],
    blush: ['#f8c8d0', '#f2a7b5', '#fbe3e7'],
    marigold: ['#f59e0b', '#ff8a00', '#ffb627', '#e86f00', '#ffc94a'],
    gold: ['#fff2bf', '#f5d77a', '#d4af37', '#ffe08a'],
    confetti: ['#f5d77a', '#d4af37', '#fff1c1', '#f3e4c8', '#c9a54a', '#ffffff', '#e8c39e']
  };

  function fit(c) {
    const w = Math.max(1, c.clientWidth), h = Math.max(1, c.clientHeight);
    c.width = Math.round(w * DPR); c.height = Math.round(h * DPR);
    const ctx = c.getContext('2d'); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    return { ctx, w, h };
  }

  /* pre-rendered golden glow sprite */
  const sprite = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,250,225,1)'); gr.addColorStop(0.18, 'rgba(255,226,140,.95)');
    gr.addColorStop(0.5, 'rgba(212,160,55,.32)'); gr.addColorStop(1, 'rgba(212,175,55,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return c;
  })();
  function glow(ctx, x, y, r, a) { if (a <= 0) return; ctx.globalAlpha = Math.min(1, a); ctx.drawImage(sprite, x - r, y - r, r * 2, r * 2); }

  function drawPetal(ctx, p) {
    const s = p.s, a = p.alpha == null ? 1 : p.alpha; if (a <= 0) return;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    ctx.scale(Math.max(0.15, Math.abs(p.flip == null ? 1 : p.flip)), 1);
    ctx.globalAlpha = a;
    ctx.beginPath(); ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.95, -s * 0.55, s * 0.75, s * 0.8, 0, s);
    ctx.bezierCurveTo(-s * 0.75, s * 0.8, -s * 0.95, -s * 0.55, 0, -s);
    ctx.fillStyle = p.color; ctx.fill();
    ctx.globalAlpha = a * 0.3; ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(0, -s * 0.7); ctx.quadraticCurveTo(s * 0.12, 0, 0, s * 0.8); ctx.stroke();
    ctx.restore();
  }
  function petal(o) {
    return Object.assign({ x: 0, y: 0, vx: 0, vy: 0, s: rand(6, 12), rot: rand(0, 6.28), vr: rand(-0.03, 0.03), spin: rand(0, 6.28), vs: rand(0.02, 0.07), color: pick(PAL.rose), alpha: 1, sway: rand(0.6, 1.6), ph: rand(0, 6.28), flip: 1 }, o || {});
  }
  function stepPetal(p, dt) {
    const k = dt * 60; p.ph += dt * p.sway;
    p.x += (p.vx + Math.sin(p.ph) * 0.55) * k; p.y += p.vy * k;
    p.rot += p.vr * k; p.spin += p.vs * k; p.flip = Math.cos(p.spin);
  }

  function sample(w, h, draw, gap) {
    if (!(w > 0 && h > 0)) return [];
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); draw(g, w, h);
    const d = g.getImageData(0, 0, w, h).data, pts = [];
    for (let y = 0; y < h; y += gap) for (let x = 0; x < w; x += gap) if (d[(y * w + x) * 4 + 3] > 128) pts.push({ x, y });
    return pts;
  }

  function split(el) {
    const text = el.textContent.trim(); el.setAttribute('aria-label', text); el.textContent = '';
    const chars = [];
    text.split(/\s+/).forEach((word, wi, arr) => {
      const w = document.createElement('span'); w.className = 'sw'; w.setAttribute('aria-hidden', 'true');
      [...word].forEach(ch => { const c = document.createElement('span'); c.className = 'sc'; c.textContent = ch; w.appendChild(c); chars.push(c); });
      el.appendChild(w); if (wi < arr.length - 1) el.appendChild(document.createTextNode(' '));
    });
    return chars;
  }

  /* ---------- shared ticker ---------- */
  const systems = new Set();
  const add = fn => { systems.add(fn); return () => systems.delete(fn); };
  let last = performance.now();
  gsap.ticker.add(() => {
    const now = performance.now(), dt = Math.min((now - last) / 1000, 0.05); last = now;
    if (document.hidden) return;
    const t = now / 1000; systems.forEach(fn => fn(dt, t));
  });

  /* =========================================================
     GLOBAL LAYER: cursor gold dust, floating petals, streams, bursts
     ========================================================= */
  const G = { ambient: false, list: [], dust: [], stream: [], burst: [], w: innerWidth, h: innerHeight };
  function initGlobal() {
    const c = document.getElementById('fx-global'); let { ctx, w, h } = fit(c);
    addEventListener('resize', () => { ({ ctx, w, h } = fit(c)); G.w = w; G.h = h; });
    G.w = w; G.h = h;
    let mx = -1, my = -1;
    if (!MOBILE && !RM) addEventListener('pointermove', e => {
      if (mx < 0) { mx = e.clientX; my = e.clientY; return; }
      const dx = e.clientX - mx, dy = e.clientY - my, d = Math.hypot(dx, dy);
      if (d > 6) {
        const n = Math.min(3, 1 + ((d / 28) | 0));
        for (let i = 0; i < n; i++) G.dust.push({ x: e.clientX + rand(-4, 4), y: e.clientY + rand(-4, 4), vx: dx * 0.015 + rand(-0.3, 0.3), vy: dy * 0.015 + rand(-0.5, 0.1), r: rand(4, 9), life: 1, dec: rand(0.014, 0.028) });
        if (G.dust.length > 120) G.dust.splice(0, G.dust.length - 120);
        mx = e.clientX; my = e.clientY;
      }
    }, { passive: true });

    let dirty = false;
    add((dt, t) => {
      const any = G.dust.length || G.list.length || G.stream.length || G.burst.length || G.ambient;
      if (!any) { if (dirty) { ctx.clearRect(0, 0, w, h); dirty = false; } return; }
      dirty = true; ctx.clearRect(0, 0, w, h);
      const k = dt * 60;
      // ambient petals
      const target = G.ambient && !RM ? (MOBILE ? 5 : 11) : 0;
      if (G.list.length < target && Math.random() < 0.02) G.list.push(petal({ x: rand(-40, w * 0.7), y: -20, vx: rand(0.2, 0.6), vy: rand(0.35, 0.8), s: rand(5, 9), color: pick(Math.random() < 0.7 ? PAL.rose : PAL.blush), alpha: 0.8 }));
      for (let i = G.list.length - 1; i >= 0; i--) { const p = G.list[i]; stepPetal(p, dt); if (p.y > h + 30 || p.x > w + 30) G.list.splice(i, 1); else drawPetal(ctx, p); }
      // curved petal streams
      for (let i = G.stream.length - 1; i >= 0; i--) {
        const p = G.stream[i]; p.t += dt * p.speed; if (p.t < 0) continue; if (p.t > 1) { G.stream.splice(i, 1); continue; }
        const [a, b, c2, d] = p.path, u = 1 - p.t, tt = p.t;
        const x = u * u * u * a.x + 3 * u * u * tt * b.x + 3 * u * tt * tt * c2.x + tt * tt * tt * d.x;
        const y = u * u * u * a.y + 3 * u * u * tt * b.y + 3 * u * tt * tt * c2.y + tt * tt * tt * d.y;
        p.ph += dt * 2; p.x = x + Math.sin(p.ph) * 16 + p.off; p.y = y + Math.cos(p.ph * 0.8) * 12 + p.off * 0.4;
        p.rot += p.vr * k; p.spin += p.vs * k; p.flip = Math.cos(p.spin);
        p.alpha = Math.min(1, p.t * 8, (1 - p.t) * 8); drawPetal(ctx, p);
      }
      // bursts
      for (let i = G.burst.length - 1; i >= 0; i--) {
        const p = G.burst[i]; p.vx *= 0.97; p.vy = p.vy * 0.97 + 0.09; p.x += p.vx * k; p.y += p.vy * k;
        p.rot += p.vr * k; p.spin += p.vs * k; p.flip = Math.cos(p.spin); p.life -= dt * 0.45; p.alpha = Math.min(1, p.life * 2);
        if (p.life <= 0) G.burst.splice(i, 1); else drawPetal(ctx, p);
      }
      // cursor dust
      ctx.globalCompositeOperation = 'lighter';
      for (let i = G.dust.length - 1; i >= 0; i--) {
        const d = G.dust[i]; d.x += d.vx * k; d.y += d.vy * k; d.vy -= 0.008 * k; d.life -= d.dec * k;
        if (d.life <= 0) G.dust.splice(i, 1); else glow(ctx, d.x, d.y, d.r * d.life + 1, d.life * 0.85);
      }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    });
  }
  function stream() {
    if (RM) return;
    const w = G.w, h = G.h;
    const path = [{ x: -60, y: rand(h * 0.55, h * 0.9) }, { x: rand(w * 0.2, w * 0.4), y: rand(-h * 0.1, h * 0.35) }, { x: rand(w * 0.55, w * 0.8), y: rand(h * 0.6, h * 1.05) }, { x: w + 60, y: rand(h * 0.05, h * 0.35) }];
    const n = MOBILE ? 10 : 22;
    for (let i = 0; i < n; i++) G.stream.push(petal({ path, t: -i * 0.035, speed: rand(0.1, 0.13), off: rand(-34, 34), s: rand(6, 11), color: pick(Math.random() < 0.75 ? PAL.rose : PAL.blush) }));
  }
  function burst(x, y, n, pal) {
    if (RM) return;
    n = n || (MOBILE ? 22 : 40);
    for (let i = 0; i < n; i++) { const a = rand(0, Math.PI * 2), sp = rand(2, 7); G.burst.push(petal({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 3, s: rand(5, 10), life: rand(1.4, 2.4), color: pick(pal || PAL.rose) })); }
  }

  /* =========================================================
     FIREWORKS (golden, subtle)
     ========================================================= */
  class Fireworks {
    constructor(canvas, opts) {
      this.c = canvas; this.o = Object.assign({ rate: 1, sound: false }, opts || {});
      this.active = false; this.rockets = []; this.sparks = []; this.next = 0; this.dirty = false;
      this.resize(); addEventListener('resize', () => this.resize()); add(this.frame.bind(this));
    }
    resize() { Object.assign(this, fit(this.c)); }
    start() { if (RM) return; if (!this.active) this.resize(); this.active = true; }
    stop() { this.active = false; }
    launch(x) { this.rockets.push({ x: x == null ? rand(this.w * 0.15, this.w * 0.85) : x, y: this.h + 10, vy: -rand(7.5, 10.5) * Math.min(1.3, this.h / 800 + 0.35), ty: rand(this.h * 0.12, this.h * 0.42) }); }
    explode(x, y) {
      const n = MOBILE ? 42 : 72, rose = Math.random() < 0.25;
      for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + rand(-0.05, 0.05), sp = rand(1.4, 4.4); this.sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, dec: rand(0.011, 0.019), r: rand(1.6, 3), rose: rose && Math.random() < 0.5 }); }
      if (this.o.sound && window.RoyalAudio) RoyalAudio.pop();
    }
    frame(dt, t) {
      if (!this.active && !this.rockets.length && !this.sparks.length) { if (this.dirty) { this.ctx.clearRect(0, 0, this.w, this.h); this.dirty = false; } return; }
      this.dirty = true; const ctx = this.ctx, k = dt * 60;
      ctx.globalCompositeOperation = 'destination-out'; ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(0,0,0,.24)'; ctx.fillRect(0, 0, this.w, this.h);
      ctx.globalCompositeOperation = 'lighter';
      if (this.active && t > this.next) { this.launch(); this.next = t + rand(0.9, 1.9) / this.o.rate; }
      for (let i = this.rockets.length - 1; i >= 0; i--) {
        const r = this.rockets[i]; r.y += r.vy * k; r.vy += 0.1 * k; glow(ctx, r.x, r.y, 5, 0.9);
        if (r.vy > -1.4 || r.y <= r.ty) { this.explode(r.x, r.y); this.rockets.splice(i, 1); }
      }
      for (let i = this.sparks.length - 1; i >= 0; i--) {
        const s = this.sparks[i]; s.vx *= 0.985; s.vy = s.vy * 0.985 + 0.04 * k; s.x += s.vx * k; s.y += s.vy * k; s.life -= s.dec * k;
        if (s.life <= 0) { this.sparks.splice(i, 1); continue; }
        if (s.rose) { ctx.globalAlpha = s.life; ctx.fillStyle = '#ff7a9a'; ctx.fillRect(s.x, s.y, 2, 2); }
        else glow(ctx, s.x, s.y, s.r * 2.6, s.life);
      }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    }
  }

  /* =========================================================
     CONFETTI (reception)
     ========================================================= */
  class Confetti {
    constructor(canvas) { this.c = canvas; this.list = []; this.active = false; this.dirty = false; this.resize(); addEventListener('resize', () => this.resize()); add(this.frame.bind(this)); }
    resize() { Object.assign(this, fit(this.c)); }
    start() { if (RM) return; if (!this.active) this.resize(); this.active = true; }
    stop() { this.active = false; }
    piece(x, y, vx, vy) { return { x, y, vx, vy, w: rand(5, 10), h: rand(8, 15), rot: rand(0, 6.28), vr: rand(-0.12, 0.12), spin: rand(0, 6.28), vs: rand(0.08, 0.2), color: pick(PAL.confetti), life: 1 }; }
    burst() {
      if (RM) return; this.start(); const n = MOBILE ? 80 : 170;
      for (let i = 0; i < n; i++) { const left = i % 2 === 0, a = left ? rand(-1.3, -0.5) : rand(-2.6, -1.8), sp = rand(8, 17); this.list.push(this.piece(left ? -10 : this.w + 10, this.h * 0.75, Math.cos(a) * sp * (left ? -1 : 1) * (left ? -1 : 1), Math.sin(a) * sp)); }
    }
    frame(dt) {
      const ctx = this.ctx, k = dt * 60;
      if (!this.active && !this.list.length) { if (this.dirty) { ctx.clearRect(0, 0, this.w, this.h); this.dirty = false; } return; }
      this.dirty = true; ctx.clearRect(0, 0, this.w, this.h);
      if (this.active && this.list.length < (MOBILE ? 50 : 110) && Math.random() < 0.5) this.list.push(this.piece(rand(0, this.w), -20, rand(-0.5, 0.5), rand(1, 2.2)));
      for (let i = this.list.length - 1; i >= 0; i--) {
        const p = this.list[i]; p.vx *= 0.985; p.vy = Math.min(p.vy * 0.985 + 0.12 * k, 3.2); p.x += (p.vx + Math.sin(p.spin) * 0.6) * k; p.y += p.vy * k; p.rot += p.vr * k; p.spin += p.vs * k;
        if (p.y > this.h + 30) { this.list.splice(i, 1); continue; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.cos(p.spin));
        ctx.fillStyle = p.color; ctx.globalAlpha = 0.92; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      }
      ctx.globalAlpha = 1;
    }
  }

  /* =========================================================
     PETAL RAIN (haldi marigolds, finale roses)
     ========================================================= */
  class Rain {
    constructor(canvas, opts) { this.c = canvas; this.o = Object.assign({ pal: PAL.rose, count: 60, size: [6, 12] }, opts || {}); this.list = []; this.active = false; this.dirty = false; this.resize(); addEventListener('resize', () => this.resize()); add(this.frame.bind(this)); }
    resize() { Object.assign(this, fit(this.c)); }
    start() { if (RM) return; if (!this.active) this.resize(); this.active = true; }
    stop() { this.active = false; }
    frame(dt) {
      const ctx = this.ctx;
      if (!this.active && !this.list.length) { if (this.dirty) { ctx.clearRect(0, 0, this.w, this.h); this.dirty = false; } return; }
      this.dirty = true; ctx.clearRect(0, 0, this.w, this.h);
      const max = MOBILE ? this.o.count * 0.5 : this.o.count;
      if (this.active && this.list.length < max && Math.random() < 0.45) this.list.push(petal({ x: rand(-20, this.w), y: -20, vx: rand(-0.2, 0.5), vy: rand(0.8, 1.8), s: rand(this.o.size[0], this.o.size[1]), color: pick(this.o.pal) }));
      for (let i = this.list.length - 1; i >= 0; i--) { const p = this.list[i]; stepPetal(p, dt); if (p.y > this.h + 30) this.list.splice(i, 1); else drawPetal(ctx, p); }
    }
  }

  /* =========================================================
     GOLDEN NAME PARTICLES (finale)
     ========================================================= */
  class NameParticles {
    constructor(canvas, text) {
      this.c = canvas; this.text = text; this.parts = []; this.active = false; this.mouse = { x: -9999, y: -9999 };
      this.resize();
      addEventListener('resize', () => { this.resize(); if (this.active) this.retarget(); });
      const host = canvas.parentElement;
      host.addEventListener('pointermove', e => { const r = this.c.getBoundingClientRect(); this.mouse.x = e.clientX - r.left; this.mouse.y = e.clientY - r.top; }, { passive: true });
      host.addEventListener('pointerleave', () => { this.mouse.x = this.mouse.y = -9999; });
      add(this.frame.bind(this));
    }
    resize() { Object.assign(this, fit(this.c)); }
    targets() {
      const w = Math.round(this.w), h = Math.round(this.h), text = this.text;
      const pts = sample(w, h, g => {
        let fs = Math.min(w * 0.15, 170); g.font = `${fs}px "Great Vibes", cursive`;
        const tw = g.measureText(text).width; if (tw > w * 0.9) { fs *= (w * 0.9) / tw; g.font = `${fs}px "Great Vibes", cursive`; }
        g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.fillText(text, w / 2, h * 0.36);
      }, MOBILE ? 3 : 3);
      const max = MOBILE ? 1400 : 3200;
      if (pts.length > max) { const step = pts.length / max; return Array.from({ length: max }, (_, i) => pts[Math.floor(i * step)]); }
      return pts;
    }
    form() {
      if (this.active) return; this.active = true; this.resize();
      const pts = this.targets();
      this.parts = pts.map(p => {
        const a = rand(0, Math.PI * 2), d = Math.max(this.w, this.h) * rand(0.5, 0.9);
        return { x: this.w / 2 + Math.cos(a) * d, y: this.h * 0.36 + Math.sin(a) * d, vx: 0, vy: 0, tx: p.x, ty: p.y, delay: rand(0, 1.4), s: rand(1.2, 2.2), ph: rand(0, 6.28), col: pick(PAL.gold), g: Math.random() < 0.05 };
      });
    }
    retarget() { const pts = this.targets(); this.parts.forEach((p, i) => { const q = pts[i % pts.length]; p.tx = q.x; p.ty = q.y; }); }
    scatter() { this.parts.forEach(p => { p.vx += rand(-14, 14); p.vy += rand(-14, 14); }); }
    frame(dt, t) {
      if (!this.active) return;
      const ctx = this.ctx, mx = this.mouse.x, my = this.mouse.y, k = dt * 60;
      ctx.clearRect(0, 0, this.w, this.h); ctx.globalCompositeOperation = 'lighter';
      for (const p of this.parts) {
        if (p.delay > 0) { p.delay -= dt; continue; }
        p.vx += (p.tx - p.x) * 0.045 * k; p.vy += (p.ty - p.y) * 0.045 * k;
        const dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 7000) { const d = Math.sqrt(d2) || 1, f = ((7000 - d2) / 7000) * 3.2; p.vx += (dx / d) * f; p.vy += (dy / d) * f; }
        p.vx *= 0.82; p.vy *= 0.82; p.x += p.vx * k; p.y += p.vy * k;
        const a = 0.55 + 0.45 * Math.sin(t * 3 + p.ph);
        if (p.g) glow(ctx, p.x, p.y, 6, a * 0.8);
        else { ctx.globalAlpha = a; ctx.fillStyle = p.col; ctx.fillRect(p.x, p.y, p.s, p.s); }
      }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    }
  }

  window.FX = { RM, MOBILE, DPR, rand, pick, PAL, fit, glow, drawPetal, petal, stepPetal, sample, split, add, initGlobal, stream, burst, global: G, Fireworks, Confetti, Rain, NameParticles };
})();
