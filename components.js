/* ==========================================================================
   Ortak bileşenler: üst menü (navbar) ve alt bilgi (footer)
   Her sayfada şu iki öğe yeterli:
     <header class="site-header" data-component="site-header"></header>
     <footer class="site-footer" id="iletisim" data-component="site-footer"></footer>
   Yükleme sırası: lang.js → components.js → (sayfa betikleri)
   ========================================================================== */
(function () {
  'use strict';

  var P = window.SITE_PROFILE || {};
  var I18n = window.I18n;

  var NAV = [
    { key: 'nav.home', href: 'index.html' },
    { key: 'nav.about', href: 'hakkimda.html' },
    { key: 'nav.projects', href: 'projeler.html' },
    { key: 'nav.blog', href: 'blog.html' },
    { key: 'nav.gallery', href: 'galeri.html' },
    { key: 'nav.contact', href: 'iletisim.html' }
  ];

  var here = location.pathname.split('/').pop() || 'index.html';

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function navItems(cls) {
    return NAV.map(function (n) {
      var current = n.href === here ? ' aria-current="page"' : '';
      return '<li><a class="' + cls + '" href="' + n.href + '"' + current + ' data-i18n="' + n.key + '"></a></li>';
    }).join('');
  }

  var arrow = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h11m-4-4.5L15.5 10 11 14.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function langSwitch() {
    return '<div class="lang-switch" role="group" data-i18n-attr="aria-label:lang.label">' +
      '<button type="button" data-lang-btn="tr" aria-pressed="false" lang="tr" data-i18n-attr="aria-label:lang.tr">TR</button>' +
      '<span class="lang-switch__sep" aria-hidden="true">|</span>' +
      '<button type="button" data-lang-btn="en" aria-pressed="false" lang="en" data-i18n-attr="aria-label:lang.en">EN</button>' +
      '</div>';
  }

  /* ---------- Navbar ---------- */
  var header = document.querySelector('[data-component="site-header"]');
  if (header) {
    header.innerHTML =
      '<a class="skip-link" href="#main" data-i18n="nav.skip"></a>' +
      '<div class="container site-header__inner">' +
        '<a class="brand" href="index.html" data-i18n-attr="aria-label:nav.homeLabel">' +
          esc(P.name || '') + '<span class="brand__dot">.</span></a>' +
        '<nav class="nav-desktop" data-i18n-attr="aria-label:nav.primary"><ul>' + navItems('nav-link') + '</ul></nav>' +
        langSwitch() +
        '<button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav-panel" data-i18n-attr="aria-label:nav.open">' +
          '<span class="menu-btn__lines" aria-hidden="true"></span></button>' +
      '</div>' +
      '<div class="nav-panel" id="nav-panel" hidden>' +
        '<nav data-i18n-attr="aria-label:nav.primary"><ul class="nav-panel__list">' + navItems('nav-panel__link') + '</ul></nav>' +
        '<div class="nav-panel__foot">' +
          '<a href="mailto:' + esc(P.email || '') + '">' + esc(P.email || '') + '</a>' +
          langSwitch() +
        '</div>' +
      '</div>';

    var btn = header.querySelector('.menu-btn');
    var panel = header.querySelector('.nav-panel');
    var isOpen = false;

    function open() {
      isOpen = true;
      panel.hidden = false;
      requestAnimationFrame(function () { panel.classList.add('is-open'); });
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', I18n ? I18n.t('nav.close') : 'Close');
      document.documentElement.classList.add('menu-open');
      if (window.lenis) window.lenis.stop();
      var first = panel.querySelector('a');
      if (first) setTimeout(function () { first.focus(); }, 60);
    }

    function close(returnFocus) {
      if (!isOpen) return;
      isOpen = false;
      panel.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', I18n ? I18n.t('nav.open') : 'Open');
      document.documentElement.classList.remove('menu-open');
      if (window.lenis) window.lenis.start();
      setTimeout(function () { if (!isOpen) panel.hidden = true; }, 450);
      if (returnFocus) btn.focus();
    }

    btn.addEventListener('click', function () { isOpen ? close(true) : open(); });
    panel.addEventListener('click', function (e) { if (e.target.closest('a')) close(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen) close(true); });
    window.matchMedia('(min-width: 1080px)').addEventListener('change', function (m) { if (m.matches) close(false); });
    document.addEventListener('langchange', function () {
      btn.setAttribute('aria-label', I18n.t(isOpen ? 'nav.close' : 'nav.open'));
    });
  }

  /* ---------- Footer ---------- */
  var footer = document.querySelector('[data-component="site-footer"]');
  if (footer) {
    var s = P.social || {};
    var year = new Date().getFullYear();
    footer.innerHTML =
      '<div class="container">' +
        '<h2 class="footer__closing" data-i18n="footer.closing"></h2>' +
        '<p class="footer__lead" data-i18n="footer.lead"></p>' +
        '<a class="footer__mail" href="mailto:' + esc(P.email || '') + '">' + esc(P.email || '') + '</a>' +
        '<div class="footer__grid">' +
          '<div class="footer__col"><p class="brand">' + esc(P.name || '') + '<span class="brand__dot">.</span></p></div>' +
          '<div class="footer__col"><h2 data-i18n="footer.pages"></h2><ul>' +
            NAV.map(function (n) { return '<li><a href="' + n.href + '" data-i18n="' + n.key + '"></a></li>'; }).join('') +
          '</ul></div>' +
          '<div class="footer__col"><h2 data-i18n="footer.contact"></h2><ul>' +
            '<li>' + esc(P.city || '') + '</li>' +
            '<li><a href="tel:' + esc(P.phoneHref || '') + '">' + esc(P.phone || '') + '</a></li>' +
            '<li><a href="mailto:' + esc(P.email || '') + '">' + esc(P.email || '') + '</a></li>' +
          '</ul></div>' +
          '<div class="footer__col"><h2 data-i18n="footer.social"></h2><ul>' +
            '<li><a href="' + esc(s.github || '#') + '" rel="me noopener" target="_blank">GitHub</a></li>' +
            '<li><a href="' + esc(s.instagram || '#') + '" rel="me noopener" target="_blank">Instagram</a></li>' +
          '</ul></div>' +
        '</div>' +
        '<div class="footer__bottom">' +
          '<p>© ' + year + ' ' + esc(P.name || '') + '. <span data-i18n="footer.rights"></span></p>' +
          '<a href="#main" class="footer__top">' + '<span data-i18n="footer.top"></span> ↑</a>' +
        '</div>' +
      '</div>';
  }

  /* Profil bilgilerini sayfaya yaz: <a data-profile="phone|email|city"> */
  document.querySelectorAll('[data-profile]').forEach(function (el) {
    var k = el.getAttribute('data-profile');
    if (k === 'phone') { el.textContent = P.phone || ''; if (el.tagName === 'A') el.href = 'tel:' + (P.phoneHref || ''); }
    else if (k === 'email') { el.textContent = P.email || ''; if (el.tagName === 'A') el.href = 'mailto:' + (P.email || ''); }
    else if (k === 'city') { el.textContent = P.city || ''; }
    else if (P.social && P.social[k] != null && el.tagName === 'A') { el.href = P.social[k]; }
  });

  /* Ok simgesini butonlara ekle */
  document.querySelectorAll('.btn[data-arrow]').forEach(function (b) {
    b.insertAdjacentHTML('beforeend', arrow);
  });

  if (I18n) I18n.apply();

  /* ---------- Gül temalı kaydırma çubuğu ----------
     Sağ kenarda ince bir sap; kaydırdıkça pembe dolar. Üzerinde yol alan küçük
     gül, sayfanın başında tomurcuk, sonunda tam açmış olur. Sürüklenebilir,
     sap üzerine tıklayınca o noktaya gider. Klavye/tekerlek kaydırması aynen çalışır. */
  (function roseScroll() {
    var bar = document.createElement('div');
    bar.className = 'rose-scroll';
    bar.setAttribute('aria-hidden', 'true');
    bar.innerHTML =
      '<div class="rose-scroll__track">' +
        '<div class="rose-scroll__fill"></div>' +
        '<span class="rose-scroll__leaf" style="--at:.25"></span>' +
        '<span class="rose-scroll__leaf rose-scroll__leaf--r" style="--at:.5"></span>' +
        '<span class="rose-scroll__leaf" style="--at:.75"></span>' +
      '</div>' +
      '<div class="rose-scroll__thumb">' +
        '<span class="rose-scroll__pct">0%</span>' +
        '<svg viewBox="-20 -20 40 40" width="38" height="38" focusable="false">' +
          '<defs>' +
            '<linearGradient id="rs-petal" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#AE6076"/><stop offset=".55" stop-color="#E6A3B4"/><stop offset="1" stop-color="#FCE3E9"/></linearGradient>' +
            '<radialGradient id="rs-core"><stop offset="0" stop-color="#8E4459"/><stop offset="1" stop-color="#C97A8E"/></radialGradient>' +
          '</defs>' +
          '<path d="M-2 6 C -12 6 -16 12 -17 16 C -11 16 -6 13 -2 6Z" fill="#7F9A70" stroke="#3F5A3B" stroke-width=".8"/>' +
          '<path d="M2 6 C 12 6 16 12 17 16 C 11 16 6 13 2 6Z" fill="#7F9A70" stroke="#3F5A3B" stroke-width=".8"/>' +
          '<g class="rs-outer">' +
            [0, 72, 144, 216, 288].map(function (a) {
              return '<path transform="rotate(' + a + ')" d="M0 0 C -8 -2 -9 -12 0 -15 C 9 -12 8 -2 0 0Z" fill="url(#rs-petal)" stroke="#86405A" stroke-width=".9"/>';
            }).join('') +
          '</g>' +
          '<g class="rs-inner">' +
            [36, 108, 180, 252, 324].map(function (a) {
              return '<path transform="rotate(' + a + ')" d="M0 0 C -5 -1 -6 -8 0 -10 C 6 -8 5 -1 0 0Z" fill="url(#rs-petal)" stroke="#86405A" stroke-width=".8"/>';
            }).join('') +
          '</g>' +
          '<circle r="3.6" fill="url(#rs-core)"/>' +
          '<path d="M-2.2 -.6 A 2.3 2.3 0 1 1 1.6 1.4" fill="none" stroke="#FFE3EA" stroke-width=".8" stroke-linecap="round"/>' +
        '</svg>' +
      '</div>';
    document.body.appendChild(bar);

    var track = bar.querySelector('.rose-scroll__track');
    var fill = bar.querySelector('.rose-scroll__fill');
    var thumb = bar.querySelector('.rose-scroll__thumb');
    var pct = bar.querySelector('.rose-scroll__pct');
    var roseSvg = thumb.querySelector('svg');
    var outer = bar.querySelector('.rs-outer');
    var inner = bar.querySelector('.rs-inner');
    var leaves = bar.querySelectorAll('.rose-scroll__leaf');
    var ticking = false, dragging = false;

    function maxScroll() { return Math.max(1, document.documentElement.scrollHeight - window.innerHeight); }
    function progress() { return Math.min(1, Math.max(0, (window.scrollY || 0) / maxScroll())); }

    function paint() {
      ticking = false;
      var p = progress();
      var h = track.clientHeight;
      fill.style.transform = 'scaleY(' + p.toFixed(4) + ')';
      thumb.style.transform = 'translate3d(0,' + (p * h).toFixed(1) + 'px,0)';
      roseSvg.style.transform = 'rotate(' + (p * 160).toFixed(1) + 'deg)';
      outer.setAttribute('transform', 'scale(' + (0.68 + 0.32 * p).toFixed(3) + ')');
      inner.setAttribute('transform', 'scale(' + (0.8 + 0.2 * p).toFixed(3) + ') rotate(' + (p * 40).toFixed(1) + ')');
      pct.textContent = Math.round(p * 100) + '%';
      leaves.forEach(function (l) { l.classList.toggle('is-passed', p >= parseFloat(l.style.getPropertyValue('--at'))); });
      bar.classList.toggle('is-short', maxScroll() < 40);
    }
    function request() { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }
    window.addEventListener('scroll', request, { passive: true });
    document.addEventListener('scroll', request, { passive: true, capture: true });
    window.addEventListener('resize', request);
    /* Lenis (main.js'te kurulur) kendi kaydırma olayını da yayar */
    var hookTries = 0;
    (function hookLenis() {
      if (window.lenis && window.lenis.on) { window.lenis.on('scroll', request); return; }
      if (++hookTries < 40) setTimeout(hookLenis, 150);
    })();
    window.addEventListener('load', request);
    setTimeout(request, 600);
    request();

    /* imleçle: sürükle veya sap üzerine tıkla */
    function scrollToRatio(r, smooth) {
      var y = Math.min(1, Math.max(0, r)) * maxScroll();
      if (window.lenis) window.lenis.scrollTo(y, smooth ? { duration: 1.1 } : { immediate: true });
      else window.scrollTo({ top: y, behavior: smooth ? 'smooth' : 'auto' });
    }
    function ratioFromEvent(e) {
      var r = track.getBoundingClientRect();
      return (e.clientY - r.top) / r.height;
    }
    thumb.addEventListener('pointerdown', function (e) {
      dragging = true;
      bar.classList.add('is-dragging');
      thumb.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    thumb.addEventListener('pointermove', function (e) { if (dragging) scrollToRatio(ratioFromEvent(e), false); });
    function endDrag() { dragging = false; bar.classList.remove('is-dragging'); }
    thumb.addEventListener('pointerup', endDrag);
    thumb.addEventListener('pointercancel', endDrag);
    track.addEventListener('click', function (e) { scrollToRatio(ratioFromEvent(e), true); });
  })();
})();
