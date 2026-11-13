/* =========================================================
   MAIN — bootstraps the royal experience
   ========================================================= */
(function () {
  const { RM } = FX;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  Build.build();
  Build.sizeBorders();

  // During the intro a stalled frame (slow phone still loading) must not let the timeline
  // jump ahead past the light + golden sparkle; Lenis gets lagSmoothing(0) once the site starts.
  gsap.ticker.lagSmoothing(100, 33);

  let lenis = null;
  if (!RM && window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    lenis.stop();
    window.__lenis = lenis; // handy for debugging / automated checks
  }

  FX.initGlobal();
  Scenes.init(lenis);

  /* floating music control */
  const mb = document.getElementById('music-btn');
  const syncBtn = on => { mb.setAttribute('aria-pressed', on); mb.querySelector('.mb-label').textContent = on ? 'Sound on' : 'Sound off'; };
  document.addEventListener('royal:sound', e => syncBtn(!!e.detail));
  mb.addEventListener('click', () => RoyalAudio.setEnabled(!RoyalAudio.enabled));

  const toTop = () => { scrollTo(0, 0); if (lenis) lenis.scrollTo(0, { immediate: true, force: true }); };

  function unlock() {
    document.body.classList.remove('is-locked');
    toTop();
    if (lenis) lenis.start();
    ScrollTrigger.refresh();
  }

  function start() {
    if (lenis) gsap.ticker.lagSmoothing(0);
    toTop();
    FX.global.ambient = true;
    gsap.to(['#nav', '#music-btn'], { autoAlpha: 1, duration: 1.2, delay: 1.2, stagger: 0.15 });
    Scenes.arrivalPlay(unlock);
  }

  Intro.init(start);

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());
})();
