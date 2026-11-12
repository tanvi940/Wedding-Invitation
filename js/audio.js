/* =========================================================
   ROYAL AUDIO — every sound is synthesised in the browser
   (no files). Nothing plays until the guest opts in.
   ========================================================= */
(function () {
  const A = { ctx: null, enabled: false, musicPlaying: false };
  let master, bus, sfx, music, amb, noiseBuf, cache = {}, timer = null, nextTime = 0, beat = 0, mel = 3, windOn = false, eng = null;
  const BEAT = 0.62;
  const SCALE = [293.66, 329.63, 369.99, 440, 493.88, 587.33, 659.25, 739.99]; // D, Bhupali-inspired
  const TANPURA = [220, 293.66, 293.66, 146.83];

  function impulse(sec, decay) {
    const rate = A.ctx.sampleRate, len = Math.floor(rate * sec), b = A.ctx.createBuffer(2, len, rate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
    return b;
  }
  function noise() {
    const s = A.ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; return s;
  }

  A.init = function () {
    if (A.ctx) { if (A.ctx.state === 'suspended') A.ctx.resume(); return true; }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return false;
    buildGraph(new C());
    return true;
  };

  function buildGraph(ctx) {
    A.ctx = ctx; cache = {}; windOn = false; eng = null;
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3; comp.connect(master);
    const rev = ctx.createConvolver(); rev.buffer = impulse(3.4, 2.6);
    const wet = ctx.createGain(); wet.gain.value = 0.3; rev.connect(wet); wet.connect(comp);
    bus = ctx.createGain(); bus.connect(comp); bus.connect(rev);
    sfx = ctx.createGain(); sfx.gain.value = 0.9; sfx.connect(bus);
    music = ctx.createGain(); music.gain.value = 0; music.connect(bus);
    amb = ctx.createGain(); amb.gain.value = 0; amb.connect(comp);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  }

  A.setEnabled = function (on) {
    if (on && !A.init()) return;
    A.enabled = on;
    if (!A.ctx) return;
    const t = A.ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setTargetAtTime(on ? 0.85 : 0, t, on ? 0.3 : 0.15);
    if (on) { startMusic(); startWind(); } else { stopMusic(); A.engine.stop(); }
    document.dispatchEvent(new CustomEvent('royal:sound', { detail: on }));
  };

  /* ---------- Karplus–Strong plucked strings (sitar / tanpura feel) ---------- */
  function ks(freq, dur, decay) {
    const key = freq + '|' + dur + '|' + decay; if (cache[key]) return cache[key];
    const rate = A.ctx.sampleRate, len = Math.floor(rate * dur), N = Math.max(2, Math.round(rate / freq));
    const buf = A.ctx.createBuffer(1, len, rate), d = buf.getChannelData(0), ring = new Float32Array(N);
    for (let i = 0; i < N; i++) ring[i] = Math.random() * 2 - 1;
    let idx = 0;
    for (let i = 0; i < len; i++) {
      const cur = ring[idx], nxt = ring[(idx + 1) % N];
      ring[idx] = decay * 0.5 * (cur + nxt); d[i] = cur * 0.35; idx = (idx + 1) % N;
    }
    return (cache[key] = buf);
  }
  function pluck(freq, t, vol, dur, decay, pan) {
    const src = A.ctx.createBufferSource(); src.buffer = ks(freq, dur, decay);
    const g = A.ctx.createGain(); g.gain.value = vol; src.connect(g);
    if (A.ctx.createStereoPanner) { const p = A.ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); p.connect(music); } else g.connect(music);
    src.start(t);
  }
  function schedule(horizon) {
    if (horizon == null) horizon = A.ctx.currentTime + 0.3;
    while (nextTime < horizon) {
      const t = nextTime;
      pluck(TANPURA[beat % 4], t, 0.24, 4, 0.9985, -0.35);
      if (beat % 2 === 0 || Math.random() < 0.35) {
        if (Math.random() < 0.72) {
          const step = [-2, -1, -1, 0, 1, 1, 2][(Math.random() * 7) | 0];
          mel = Math.max(0, Math.min(SCALE.length - 1, mel + step));
          pluck(SCALE[mel], t + (Math.random() < 0.3 ? BEAT / 2 : 0), 0.3, 2.4, 0.995, 0.3);
        }
      }
      if (beat > 0 && beat % 32 === 0) A.bell(1174.66, t, 0.05);
      beat++; nextTime += BEAT;
    }
  }
  // custom song (WEDDING.musicFile) replaces the built-in music when set
  let song = null;
  const songFile = () => (window.WEDDING && WEDDING.musicFile) || '';
  function startMusic() {
    if (A.musicPlaying) return;
    A.musicPlaying = true;
    if (songFile()) {
      if (!song) { song = new Audio(songFile()); song.loop = true; song.preload = 'auto'; }
      song.volume = 0; const p = song.play(); if (p && p.catch) p.catch(() => {});
      let v = 0; clearInterval(song._fade); song._fade = setInterval(() => { v = Math.min(0.75, v + 0.05); song.volume = v; if (v >= 0.75) clearInterval(song._fade); }, 100);
      return;
    }
    nextTime = A.ctx.currentTime + 0.15;
    clearInterval(timer); timer = setInterval(() => schedule(), 90);
    music.gain.cancelScheduledValues(A.ctx.currentTime);
    music.gain.setTargetAtTime(0.9, A.ctx.currentTime, 1.2);
  }
  function stopMusic() {
    if (!A.musicPlaying) return;
    A.musicPlaying = false;
    if (song) { clearInterval(song._fade); song.pause(); return; }
    music.gain.setTargetAtTime(0, A.ctx.currentTime, 0.3);
    setTimeout(() => { if (!A.musicPlaying) clearInterval(timer); }, 1500);
  }

  /* ---------- wind & flower ambience ---------- */
  function startWind() {
    if (windOn) return; windOn = true;
    const n = noise(), lp = A.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; lp.Q.value = 0.8;
    const lfo = A.ctx.createOscillator(), lg = A.ctx.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 260;
    lfo.connect(lg); lg.connect(lp.frequency); n.connect(lp); lp.connect(amb); n.start(); lfo.start();
    amb.gain.setTargetAtTime(0.045, A.ctx.currentTime, 2);
  }

  /* ---------- bells ---------- */
  // Client asked for no bells / "ting ting" anywhere. Set true to bring every bell & chime back.
  A.allowBells = false;
  A.bell = function (freq, t, vol) {
    if (!A.allowBells || !A.ctx || !A.enabled) return;
    t = t == null ? A.ctx.currentTime : t; vol = vol == null ? 0.18 : vol;
    [[1, 1], [2.01, 0.6], [2.76, 0.42], [4.07, 0.28], [5.43, 0.16], [0.5, 0.35]].forEach(([m, a]) => {
      const o = A.ctx.createOscillator(), g = A.ctx.createGain(), d = 2.8 / (m * 0.6 + 0.5);
      o.type = 'sine'; o.frequency.value = freq * m;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol * a, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(sfx); o.start(t); o.stop(t + d + 0.05);
    });
  };
  A.bells = function (at) {
    if (!A.ctx || !A.enabled) return;
    const t = at == null ? A.ctx.currentTime : at;
    [[659.25, 0], [783.99, 0.28], [987.77, 0.56], [1318.5, 1.0], [659.25, 1.6]].forEach(([f, w]) => A.bell(f, t + w, 0.14));
  };
  A.chime = function (at) {
    if (!A.ctx || !A.enabled) return;
    const t = at == null ? A.ctx.currentTime : at;
    [1567.98, 1975.53, 2349.32].forEach((f, i) => A.bell(f, t + i * 0.09, 0.07));
  };

  /* ---------- palace doors: creak, rumble, thud ---------- */
  A.doors = function (at) {
    if (!A.ctx || !A.enabled) return;
    const ctx = A.ctx, t = at == null ? ctx.currentTime : at;
    const o = ctx.createOscillator(); o.type = 'sawtooth';
    for (let i = 0; i < 34; i++) o.frequency.setValueAtTime(48 + Math.random() * 55, t + i * 0.07);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 9;
    bp.frequency.setValueAtTime(520, t); bp.frequency.linearRampToValueAtTime(1300, t + 2.2);
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.1, t + 0.3); g.gain.linearRampToValueAtTime(0.05, t + 1.8); g.gain.linearRampToValueAtTime(0, t + 2.4);
    o.connect(bp); bp.connect(g); g.connect(sfx); o.start(t); o.stop(t + 2.5);
    const n = noise(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260;
    const ng = ctx.createGain(); ng.gain.setValueAtTime(0, t); ng.gain.linearRampToValueAtTime(0.35, t + 0.8); ng.gain.linearRampToValueAtTime(0, t + 2.8);
    n.connect(lp); lp.connect(ng); ng.connect(sfx); n.start(t); n.stop(t + 3);
    const th = ctx.createOscillator(), tg = ctx.createGain(); th.frequency.setValueAtTime(70, t + 2.6); th.frequency.exponentialRampToValueAtTime(32, t + 3.2);
    tg.gain.setValueAtTime(0, t + 2.6); tg.gain.linearRampToValueAtTime(0.4, t + 2.62); tg.gain.exponentialRampToValueAtTime(0.0001, t + 3.4);
    th.connect(tg); tg.connect(sfx); th.start(t + 2.6); th.stop(t + 3.5);
  };

  /* ---------- whoosh (camera moves, curtains) ---------- */
  A.whoosh = function (dur, at) {
    if (!A.ctx || !A.enabled) return;
    dur = dur || 1.6; const ctx = A.ctx, t = at == null ? ctx.currentTime : at;
    const n = noise(), bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(300, t); bp.frequency.exponentialRampToValueAtTime(2400, t + dur * 0.6); bp.frequency.exponentialRampToValueAtTime(400, t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.22, t + dur * 0.55); g.gain.linearRampToValueAtTime(0, t + dur);
    n.connect(bp); bp.connect(g); g.connect(sfx); n.start(t); n.stop(t + dur + 0.1);
  };

  /* ---------- soft firework pop ---------- */
  A.pop = function () {
    if (!A.ctx || !A.enabled) return;
    const ctx = A.ctx, t = ctx.currentTime;
    const n = noise(), hp = ctx.createBiquadFilter(); hp.type = 'bandpass'; hp.frequency.value = 900 + Math.random() * 900; hp.Q.value = 0.7;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    n.connect(hp); hp.connect(g); g.connect(sfx); n.start(t); n.stop(t + 0.55);
  };

  /* ---------- vintage car engine (level driven by car speed) ---------- */
  A.engine = {
    start() {
      if (!A.ctx || !A.enabled || eng) return;
      const ctx = A.ctx;
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 36;
      const o2 = ctx.createOscillator(); o2.type = 'square'; o2.frequency.value = 18;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 210;
      const n = noise(), nlp = ctx.createBiquadFilter(); nlp.type = 'lowpass'; nlp.frequency.value = 380;
      const ng = ctx.createGain(); ng.gain.value = 0.35;
      const g = ctx.createGain(); g.gain.value = 0;
      o.connect(lp); o2.connect(lp); n.connect(nlp); nlp.connect(ng); ng.connect(lp); lp.connect(g); g.connect(sfx);
      o.start(); o2.start(); n.start();
      eng = { o, o2, n, g };
    },
    level(v) {
      if (!eng) return; const t = A.ctx.currentTime;
      eng.g.gain.setTargetAtTime(v * 0.16, t, 0.15);
      eng.o.frequency.setTargetAtTime(32 + v * 28, t, 0.2);
      eng.o2.frequency.setTargetAtTime(16 + v * 14, t, 0.2);
    },
    stop() {
      if (!eng) return; const e = eng; eng = null;
      e.g.gain.setTargetAtTime(0, A.ctx.currentTime, 0.2);
      setTimeout(() => { try { e.o.stop(); e.o2.stop(); e.n.stop(); } catch (_) {} }, 1200);
    },
    get on() { return !!eng; }
  };

  /* ---------- offline soundtrack for the WhatsApp video ---------- */
  A.renderSoundtrack = async function (dur, cues) {
    const rate = 44100, off = new OfflineAudioContext(2, Math.ceil(rate * dur), rate);
    buildGraph(off); A.enabled = true; master.gain.value = 0.85;
    music.gain.setValueAtTime(0, 0); music.gain.linearRampToValueAtTime(0.85, 3);
    music.gain.setValueAtTime(0.85, dur - 3); music.gain.linearRampToValueAtTime(0, dur - 0.2);
    // with a custom song, the video exporter mixes the song in with ffmpeg instead
    if (!cues.noMusic) { nextTime = 0.4; beat = 0; mel = 3; schedule(dur - 1.5); }
    startWind();
    (cues.bells || []).forEach(t => A.bells(t));
    (cues.doors || []).forEach(t => A.doors(t));
    (cues.whoosh || []).forEach(([t, d]) => A.whoosh(d, t));
    (cues.chime || []).forEach(t => A.chime(t));
    if (cues.engine) {
      const [a, b, c] = cues.engine; // fade in at a, slowing until b, off by c
      const o = off.createOscillator(); o.type = 'sawtooth';
      const o2 = off.createOscillator(); o2.type = 'square';
      const lp = off.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 210;
      const g = off.createGain(); g.gain.setValueAtTime(0, 0); g.gain.setValueAtTime(0, a);
      g.gain.linearRampToValueAtTime(0.16, a + 1.2); g.gain.linearRampToValueAtTime(0.05, b); g.gain.linearRampToValueAtTime(0, c);
      o.frequency.setValueAtTime(58, a); o.frequency.linearRampToValueAtTime(34, b);
      o2.frequency.setValueAtTime(29, a); o2.frequency.linearRampToValueAtTime(17, b);
      o.connect(lp); o2.connect(lp); lp.connect(g); g.connect(sfx); o.start(a); o2.start(a); o.stop(c + 0.1); o2.stop(c + 0.1);
    }
    const buf = await off.startRendering();
    // encode 16-bit PCM WAV → base64
    const L = buf.getChannelData(0), R = buf.getChannelData(1), n = L.length;
    const ab = new ArrayBuffer(44 + n * 4), v = new DataView(ab);
    const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    str(0, 'RIFF'); v.setUint32(4, 36 + n * 4, true); str(8, 'WAVE'); str(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
    v.setUint32(24, rate, true); v.setUint32(28, rate * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); str(36, 'data'); v.setUint32(40, n * 4, true);
    for (let i = 0, o = 44; i < n; i++, o += 4) { v.setInt16(o, Math.max(-1, Math.min(1, L[i])) * 32767, true); v.setInt16(o + 2, Math.max(-1, Math.min(1, R[i])) * 32767, true); }
    const bytes = new Uint8Array(ab); let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  };

  window.RoyalAudio = A;
})();
