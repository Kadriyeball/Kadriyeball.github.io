/* ==========================================================================
   Proje güneş sistemi (anasayfa ve projeler.html)
   Projeler ortadaki "güneş"in çevresinde, her biri kendi yörüngesinde döner.
   Öndeki gezegen büyür, arkadaki küçülüp güneşin arkasından geçer.
   Üzerine gelince, klavyeyle odaklanınca veya düğmeyle dönüş durur.
   Anasayfada mevcut kartlar gezegen olur; projeler.html'de ayrıntılı kartlar
   yerinde kalır, üstlerine onlara götüren bir yörünge eklenir.
   JS yoksa sayfalar normal kart düzeniyle görünür.
   ========================================================================== */
(function () {
  'use strict';

  var I18n = window.I18n;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function el(tag, cls) { var n = document.createElement(tag); if (cls) n.className = cls; return n; }

  var orbit = document.querySelector('.projects .cards');

  /* projeler.html: ayrıntılı kartlardan küçük gezegenler üret */
  var details = document.querySelectorAll('.pcard');
  if (!orbit && details.length) {
    orbit = el('div', 'container');
    each(details, function (card) {
      var planet = el('article');
      var link = el('a');
      link.href = '#' + card.id;
      var media = card.querySelector('.media').cloneNode(true);
      var title = el('h2', 'planet__title');
      var source = card.querySelector('.pcard__title');
      title.setAttribute('data-i18n', source.getAttribute('data-i18n'));
      title.textContent = source.textContent;
      link.appendChild(media);
      link.appendChild(title);
      planet.appendChild(link);
      orbit.appendChild(planet);   /* tıklayınca karta kaydırmayı main.js yapar */
    });
    var section = details[0].closest('section');
    section.parentNode.insertBefore(orbit, section);
  }
  if (!orbit) return;

  var planets = Array.prototype.slice.call(orbit.children);
  var n = planets.length;
  if (!n) return;
  orbit.classList.add('orbit');
  planets.forEach(function (p, i) { p.classList.add('planet', 'planet--' + (i % 4)); });

  var NS = 'http://www.w3.org/2000/svg';
  var rings = document.createElementNS(NS, 'svg');
  rings.setAttribute('class', 'orbit__rings');
  rings.setAttribute('aria-hidden', 'true');
  var ellipses = planets.map(function () {
    var e = document.createElementNS(NS, 'ellipse');
    rings.appendChild(e);
    return e;
  });
  var sun = el('div', 'orbit__sun');
  sun.innerHTML = '<span data-i18n="orbit.sun">Projelerim</span>';
  var toggle = el('button', 'orbit__toggle');
  toggle.type = 'button';
  orbit.insertBefore(rings, orbit.firstChild);

  /* küçük göktaşları: güneşle ilk yörünge arasında bir kuşak + köşelerde süzülenler */
  function rock(cls, size) {
    var r = el('span', cls);
    r.setAttribute('aria-hidden', 'true');
    r.style.width = size + 'px';
    r.style.height = (size * 0.8).toFixed(1) + 'px';
    orbit.appendChild(r);
    return r;
  }
  var belt = [];
  for (var k = 0; k < 18; k++) {
    /* sabit ama düzensiz dağılım */
    belt.push({ el: rock('orbit__rock', 4 + (k * 7) % 8), a: k * Math.PI * 2 / 18 + (k % 3) * 0.13, off: 0.9 + ((k * 5) % 7) * 0.033 });
  }
  var beltGeo = null, beltTurn = 0;
  [[9, 14, 15], [87, 9, 11], [91, 70, 18], [7, 66, 10], [76, 87, 9], [22, 88, 13]].forEach(function (d, i) {
    var r = rock('orbit__rock orbit__rock--drift', d[2]);
    r.style.left = d[0] + '%';
    r.style.top = d[1] + '%';
    r.style.animationDelay = (-i * 1.7) + 's';
  });
  orbit.appendChild(sun);
  if (!reduce) orbit.appendChild(toggle);

  /* ---------- Durdur / döndür ---------- */
  var stopped = false, hovering = false, focused = false, visible = true;
  function setToggle() {
    var key = stopped ? 'orbit.play' : 'orbit.pause';
    toggle.setAttribute('data-i18n', key);
    toggle.textContent = I18n ? I18n.t(key) : (stopped ? 'Döndür' : 'Durdur');
  }
  setToggle();
  toggle.addEventListener('click', function () { stopped = !stopped; setToggle(); });
  planets.forEach(function (p) {
    p.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hovering = true; });
    p.addEventListener('pointerleave', function () { hovering = false; });
    p.addEventListener('focusin', function () { focused = true; });
    p.addEventListener('focusout', function () { focused = false; });
  });
  if (I18n) I18n.apply(orbit);

  /* ---------- Yerleşim ve hareket ---------- */
  var geo = [];
  var angle = planets.map(function (p, i) { return (Math.PI * 2 / n) * i + 0.6; });

  function measure() {
    var w = orbit.clientWidth, h = orbit.clientHeight;
    if (!w || !h) return;
    var small = w < 600;
    var size = Math.round(Math.max(68, Math.min(118, w * (small ? 0.21 : 0.12))));
    orbit.style.setProperty('--planet', size + 'px');
    /* en uzun etiketli gezegenin yüksekliği: alt ve üstte taşma olmasın */
    var boxH = Math.max.apply(null, planets.map(function (p) { return p.offsetHeight; }));
    var cy = (h - (boxH - size)) / 2 - 18;
    var rxMax = w / 2 - (size + 34) / 2 - 8;
    var ryMax = cy - size / 2 - 14;
    var inner = small ? 0.86 : 0.74;     /* en içteki yörüngenin dıştakine oranı */
    rings.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    sun.style.top = cy + 'px';
    geo = planets.map(function (p, i) {
      var f = inner + (1 - inner) * (n > 1 ? i / (n - 1) : 1);
      var rx = rxMax * f, ry = ryMax * f;
      var e = ellipses[i];
      e.setAttribute('cx', w / 2); e.setAttribute('cy', cy);
      e.setAttribute('rx', rx); e.setAttribute('ry', ry);
      return { rx: rx, ry: ry, size: size, dy: cy - h / 2 };
    });
    beltGeo = { rx: rxMax * 0.5, ry: ryMax * 0.5, cx: w / 2, cy: cy };
    paint();
  }

  function paint() {
    if (beltGeo) {
      belt.forEach(function (b) {
        var a = b.a + beltTurn;
        b.el.style.transform = 'translate(' + (beltGeo.cx + Math.cos(a) * beltGeo.rx * b.off).toFixed(1) + 'px,' +
          (beltGeo.cy + Math.sin(a) * beltGeo.ry * b.off).toFixed(1) + 'px) rotate(' + (a * 90).toFixed(0) + 'deg)';
      });
    }
    planets.forEach(function (p, i) {
      var g = geo[i];
      if (!g) return;
      var depth = Math.sin(angle[i]);            /* -1 arkada, 1 önde */
      var x = Math.cos(angle[i]) * g.rx;
      var y = depth * g.ry;
      p.style.transform = 'translate(' + (x - (g.size + 34) / 2).toFixed(1) + 'px,' +
        (g.dy + y - g.size / 2).toFixed(1) + 'px) scale(' + (0.88 + 0.12 * depth).toFixed(3) + ')';
      p.style.transformOrigin = '50% ' + (g.size / 2) + 'px';
      p.style.zIndex = String(100 + Math.round(depth * 50));
    });
  }

  var last = 0, frame = 0;
  function tick(now) {
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    if (!stopped && !hovering && !focused) {
      /* hepsi aynı hızda: aralarındaki mesafe korunur, üst üste binmezler */
      for (var i = 0; i < n; i++) angle[i] += dt * Math.PI * 2 / 36;
      beltTurn += dt * Math.PI * 2 / 70;
      paint();
    }
    orbit.classList.toggle('is-paused', stopped);
    frame = visible ? requestAnimationFrame(tick) : 0;
  }
  function run() { if (!reduce && visible && !frame) { last = 0; frame = requestAnimationFrame(tick); } }

  measure();
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(orbit);
  else window.addEventListener('resize', measure);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      run();
    }).observe(orbit);
  }
  document.addEventListener('langchange', function () { requestAnimationFrame(measure); });
  run();
  if (window.ScrollTrigger) window.ScrollTrigger.refresh();
})();
