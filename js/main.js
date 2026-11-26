/* ==========================================================================
   Sayfa davranışları: Lenis yumuşak kaydırma, GSAP ScrollTrigger ile
   sabitlenen (pinned) hero, köşe metinleri ve bölüm girişleri.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = !!(window.gsap && window.ScrollTrigger);
  var header = document.querySelector('.site-header');
  var lenis = null;

  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis ---------- */
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.9 });
    window.lenis = lenis;
    if (hasGSAP) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      var loop = function (t) { lenis.raf(t); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }
  }

  /* ---------- Sayfa içi bağlantılar ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    var el = document.getElementById(id.slice(1));
    if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
    history.replaceState(null, '', id);
  });

  /* ---------- Navbar arka planı ---------- */
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', (window.scrollY || 0) > 12);
  }
  if (lenis) lenis.on('scroll', onScroll); else window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Hero: gül bahçesi ---------- */
  var hero = document.querySelector('[data-hero]');
  var garden = window.RoseGarden;

  function smooth(t) { return t * t * (3 - 2 * t); }
  function cueOpacity(p, at) {
    var a = at - 0.1, b = at - 0.02, c = at + 0.07, d = at + 0.14;
    if (p <= a || p >= d) return 0;
    if (p < b) return smooth((p - a) / (b - a));
    if (p <= c) return 1;
    return 1 - smooth((p - c) / (d - c));
  }

  if (hero) {
    var cues = Array.prototype.slice.call(hero.querySelectorAll('[data-cue]'));
    var setCues = function (p) {
      cues.forEach(function (c) {
        var o = cueOpacity(p, parseFloat(c.getAttribute('data-cue')));
        c.style.opacity = o.toFixed(3);
        c.style.transform = 'translate3d(0,' + ((1 - o) * 22).toFixed(1) + 'px,0)';
      });
    };

    if (hasGSAP && !reduce) {
      ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        end: function () { return '+=' + Math.round(window.innerHeight * 3.6); },
        pin: true,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          if (garden) garden.setProgress(self.progress);
          setCues(self.progress);
        },
        onToggle: function (self) {
          if (header) header.classList.toggle('over-hero', self.isActive);
        }
      });
      if (header && (window.scrollY || 0) < window.innerHeight * 3.6) header.classList.add('over-hero');
      setCues(0);
    } else {
      hero.classList.add('is-static');
      if (garden) garden.setProgress(0.6);
    }
  }

  /* ---------- Bölüm girişleri ---------- */
  if (hasGSAP && !reduce) {
    gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      gsap.fromTo(el,
        { autoAlpha: 0, y: 32 },
        {
          autoAlpha: 1, y: 0, duration: 1.1, ease: 'power3.out',
          delay: parseFloat(el.getAttribute('data-reveal-delay') || '0'),
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        });
    });
  }

  /* Dil veya font değişince yükseklikler değişebilir */
  function refresh() { if (hasGSAP) ScrollTrigger.refresh(); }
  document.addEventListener('langchange', refresh);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  window.addEventListener('load', refresh);
})();
