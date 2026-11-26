/* ==========================================================================
   Kaydırdıkça açan gül
   [data-bloom] alanının arka planına, sağ tarafa yapışkan (sticky) bir SVG gül
   yerleştirir. Alan boyunca aşağı kaydırdıkça:
     1. sap en alttan yukarı doğru çizilir, dikenler belirir
     2. yapraklar sırayla açılır
     3. tomurcuk ve çanak yaprakları görünür
     4. taç yapraklar dıştan içe doğru açılarak gül tam çiçek olur
     5. alanın en sonunda yapraklar küçülüp ekranın her yerine savrulur,
        ışıltılar saçılır (tam ekran .bloom-scatter katmanı)
   Hareket azaltma tercihinde gül, tam açmış haliyle durağan gösterilir.
   ========================================================================== */
(function () {
  'use strict';

  var zone = document.querySelector('[data-bloom]');
  if (!zone) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function seg(p, start, dur) { return ease(clamp((p - start) / dur, 0, 1)); }

  /* ---------- Sahne ---------- */
  var stage = document.createElement('div');
  stage.className = 'bloom-stage';
  stage.setAttribute('aria-hidden', 'true');
  zone.insertBefore(stage, zone.firstChild);

  /* viewBox üstteki boşluğu kırpar: gül aynı çizimle daha büyük görünür */
  var svg = el('svg', { viewBox: '0 60 400 940', preserveAspectRatio: 'xMidYMax meet', focusable: 'false' }, stage);
  var defs = el('defs', {}, svg);

  function linGrad(id, stops, x1, y1, x2, y2) {
    var g = el('linearGradient', { id: id, x1: x1 || 0, y1: y1 || 1, x2: x2 || 0, y2: y2 || 0 }, defs);
    stops.forEach(function (s) { el('stop', { offset: s[0], 'stop-color': s[1], 'stop-opacity': s[2] == null ? 1 : s[2] }, g); });
  }
  /* Taç yaprak renkleri: tabanda koyu gül kurusu, uçta pudra pembe */
  linGrad('rb-back',  [[0, '#9E5268'], [0.45, '#D88FA2'], [1, '#F7D2DB']]);
  linGrad('rb-mid',   [[0, '#AE6076'], [0.5, '#E6A3B4'], [1, '#FBE0E6']]);
  linGrad('rb-front', [[0, '#BC7286'], [0.5, '#F0B8C6'], [1, '#FFEDF1']]);
  linGrad('rb-core',  [[0, '#8E4459'], [1, '#D98CA0']]);
  linGrad('rb-leaf',  [[0, '#55704F'], [0.6, '#7F9A70'], [1, '#A7BC94']], 0, 1, 1, 0);
  linGrad('rb-stem',  [[0, '#4F6848'], [1, '#7A9468']]);
  var glow = el('radialGradient', { id: 'rb-glow' }, defs);
  el('stop', { offset: 0, 'stop-color': '#FFE3EA', 'stop-opacity': 0.85 }, glow);
  el('stop', { offset: 0.5, 'stop-color': '#F7C6D2', 'stop-opacity': 0.35 }, glow);
  el('stop', { offset: 1, 'stop-color': '#F7C6D2', 'stop-opacity': 0 }, glow);

  var plant = el('g', { class: 'rb-plant' }, svg);

  /* ---------- Sap + dikenler ---------- */
  var STEM_D = 'M214 1004 C 204 910, 232 830, 216 740 C 200 650, 184 572, 198 480 C 208 412, 206 372, 200 336';
  var stem = el('path', { d: STEM_D, fill: 'none', stroke: 'url(#rb-stem)', 'stroke-width': 9, 'stroke-linecap': 'round' }, plant);
  var stemLen = stem.getTotalLength();
  stem.style.strokeDasharray = stemLen;

  var thorns = [[0.18, 1], [0.34, -1], [0.52, 1], [0.7, -1]].map(function (t) {
    var pt = stem.getPointAtLength(stemLen * (1 - t[0]));
    var g = el('g', { transform: 'translate(' + pt.x + ' ' + pt.y + ')' }, plant);
    var th = el('path', { d: 'M0 -5 L' + (11 * t[1]) + ' -12 L0 4 Z', fill: '#5F7A55' }, g);
    return { g: g, el: th, at: t[0] };
  });

  /* ---------- Yapraklar ---------- */
  var LEAF_D = 'M0 0 C -30 -26, -34 -92, 0 -136 C 34 -92, 30 -26, 0 0 Z';
  var LEAF_VEIN = 'M0 -6 Q 3 -70 0 -128 M0 -40 Q -12 -50 -20 -66 M0 -40 Q 12 -50 20 -66 M1 -78 Q -9 -88 -15 -102 M1 -78 Q 11 -88 16 -102';
  var leaves = [
    { x: 216, y: 812, rot: -58, s: 1.05, at: 0.12 },
    { x: 206, y: 668, rot: 54, s: 0.95, at: 0.2 },
    { x: 196, y: 548, rot: -50, s: 0.8, at: 0.28 },
    { x: 200, y: 440, rot: 46, s: 0.62, at: 0.34 }
  ].map(function (L) {
    var g = el('g', {}, plant);
    el('path', { d: 'M0 0 L0 -14', stroke: '#5F7A55', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    var leaf = el('g', { transform: 'translate(0 -12)' }, g);
    el('path', { d: LEAF_D, fill: 'url(#rb-leaf)', stroke: '#3F5A3B', 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, leaf);
    el('path', { d: LEAF_VEIN, fill: 'none', stroke: 'rgba(232,240,214,0.55)', 'stroke-width': 1.4, 'stroke-linecap': 'round' }, leaf);
    L.g = g;
    return L;
  });

  /* ---------- Çiçek başı ---------- */
  var HX = 200, HY = 338;
  var glowEl = el('ellipse', { cx: HX, cy: HY - 80, rx: 190, ry: 170, fill: 'url(#rb-glow)', opacity: 0 }, plant);
  var head = el('g', {}, plant);

  /* Çanak yapraklar (sepal) */
  /* yol aşağı bakar: final açıları aşağıya doğru yelpaze, kapalıyken (±168°) yukarı sarılır */
  var sepals = [-64, -32, 32, 64, 0].map(function (a) {
    var g = el('g', {}, head);
    el('path', { d: 'M0 0 C -7 14, -5 40, 0 58 C 5 40, 7 14, 0 0 Z', fill: '#6E8A60', stroke: '#45603F', 'stroke-width': 1.2 }, g);
    return { g: g, final: a };
  });

  function petalPath(h, w) {
    return 'M0 0 C ' + (-w * 0.92) + ' ' + (-h * 0.14) + ', ' + (-w * 1.06) + ' ' + (-h * 0.7) + ', ' + (-w * 0.56) + ' ' + (-h * 0.95) +
      ' Q ' + (-w * 0.26) + ' ' + (-h * 1.07) + ', 0 ' + (-h * 0.97) +
      ' Q ' + (w * 0.26) + ' ' + (-h * 1.07) + ', ' + (w * 0.56) + ' ' + (-h * 0.95) +
      ' C ' + (w * 1.06) + ' ' + (-h * 0.7) + ', ' + (w * 0.92) + ' ' + (-h * 0.14) + ', 0 0 Z';
  }
  function rimPath(h, w) {
    return 'M ' + (-w * 0.6) + ' ' + (-h * 0.9) + ' Q ' + (-w * 0.27) + ' ' + (-h * 1.03) + ', 0 ' + (-h * 0.93) +
      ' Q ' + (w * 0.27) + ' ' + (-h * 1.03) + ', ' + (w * 0.6) + ' ' + (-h * 0.9);
  }
  function makePetal(o) {
    var g = el('g', {}, head);
    el('path', { d: petalPath(o.h, o.w), fill: 'url(#' + o.fill + ')', stroke: '#86405A', 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, g);
    /* kavis gölgesi + orta damar */
    el('path', { d: 'M0 -4 C ' + (-o.w * 0.35) + ' ' + (-o.h * 0.35) + ', ' + (-o.w * 0.2) + ' ' + (-o.h * 0.7) + ', ' + (-o.w * 0.05) + ' ' + (-o.h * 0.88),
      fill: 'none', stroke: 'rgba(134,64,90,0.28)', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, g);
    /* kıvrık kenarın ışığı */
    el('path', { d: rimPath(o.h, o.w), fill: 'none', stroke: 'rgba(255,246,248,0.85)', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    o.g = g;
    return o;
  }

  /* Çizim sırası = arkadan öne. closed: tomurcuk açısı, final: açmış açı, d: açılma gecikmesi */
  var petals = [
    { h: 150, w: 80, fill: 'rb-back', closed: -10, final: -58, d: 0.00 },
    { h: 150, w: 80, fill: 'rb-back', closed: 10, final: 58, d: 0.00 },
    { h: 178, w: 82, fill: 'rb-back', closed: -6, final: -34, d: 0.05 },
    { h: 178, w: 82, fill: 'rb-back', closed: 6, final: 34, d: 0.05 },
    { h: 188, w: 84, fill: 'rb-mid', closed: 0, final: -4, d: 0.08 },
    { h: 160, w: 70, fill: 'rb-mid', closed: -4, final: -17, d: 0.12 },
    { h: 160, w: 70, fill: 'rb-mid', closed: 4, final: 17, d: 0.12 }
  ].map(makePetal);

  /* Göbek: sıkı sarılmış iç yapraklar */
  var core = el('g', {}, head);
  el('path', { d: petalPath(118, 62), fill: 'url(#rb-core)', stroke: '#7A3850', 'stroke-width': 1.6 }, core);
  el('path', { d: 'M-30 -96 C -14 -122, 18 -120, 30 -96 M-20 -74 C -6 -96, 14 -92, 22 -74 M-26 -58 C -4 -40, 16 -46, 26 -60',
    fill: 'none', stroke: 'rgba(255,226,234,0.7)', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, core);

  /* Ön yapraklar: kupayı önden sarar, açarken dışa ve aşağı kıvrılır */
  var front = [
    { h: 132, w: 66, fill: 'rb-front', closed: -16, final: -44, d: 0.18 },
    { h: 132, w: 66, fill: 'rb-front', closed: 16, final: 44, d: 0.18 },
    { h: 96, w: 62, fill: 'rb-front', closed: -6, final: -14, d: 0.24 },
    { h: 96, w: 62, fill: 'rb-front', closed: 6, final: 14, d: 0.24 }
  ].map(makePetal);

  /* ---------- Final: yapraklar küçülüp dağılır, ışıltılar saçılır ---------- */
  var seed = 11;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  var allPetals = petals.concat(front);
  allPetals.forEach(function (o) {
    var a = (o.final + (rnd() - 0.5) * 50) * Math.PI / 180;
    o.dx = Math.sin(a) * lerp(130, 270, rnd()) + (rnd() - 0.5) * 60;
    o.dy = -Math.cos(a) * lerp(70, 210, rnd()) + lerp(-10, 70, rnd());
    o.spin = (rnd() < 0.5 ? -1 : 1) * lerp(90, 240, rnd());
    o.ph = rnd() * 6.28;
  });

  var spark = el('radialGradient', { id: 'rb-spark' }, defs);
  el('stop', { offset: 0, 'stop-color': '#FFF3D0', 'stop-opacity': 1 }, spark);
  el('stop', { offset: 0.3, 'stop-color': '#F8CF85', 'stop-opacity': 0.85 }, spark);
  el('stop', { offset: 0.65, 'stop-color': '#F2A9B9', 'stop-opacity': 0.35 }, spark);
  el('stop', { offset: 1, 'stop-color': '#F2A9B9', 'stop-opacity': 0 }, spark);

  var CX = HX, CY = HY - 110;            /* çiçeğin görsel merkezi */

  /* Tam ekran dağılma katmanı: yapraklar ve ışıltılar gülün başından çıkıp
     ekranın her yerine yayılır. Koordinatlar ekran pikseli cinsindendir. */
  var overlay = el('svg', { class: 'bloom-scatter', 'aria-hidden': 'true', focusable: 'false' });
  overlay.setAttribute('hidden', '');
  document.body.appendChild(overlay);
  var VW = 1, VH = 1;
  function sizeOverlay() {
    VW = window.innerWidth; VH = window.innerHeight;
    overlay.setAttribute('viewBox', '0 0 ' + VW + ' ' + VH);
  }
  sizeOverlay();
  window.addEventListener('resize', sizeOverlay);

  var hp = svg.createSVGPoint();
  function headOnScreen() {
    var m = svg.getScreenCTM();
    if (!m) return { x: VW * 0.85, y: VH * 0.3 };
    hp.x = CX; hp.y = CY;
    var r = hp.matrixTransform(m);
    return { x: r.x, y: r.y };
  }

  /* savrulan taç yaprakları: ekran ızgarasına dengeli dağıtılır (her köşeye ulaşsın) */
  var minis = [];
  var COLS = 11, ROWS = 4;
  for (var mi = 0; mi < COLS * ROWS; mi++) {
    var mg = el('g', {}, overlay);
    el('path', { d: petalPath(36, 21), fill: 'url(#' + (mi % 3 ? 'rb-front' : 'rb-mid') + ')', stroke: '#86405A', 'stroke-width': 1.1 }, mg);
    el('path', { d: rimPath(36, 21), fill: 'none', stroke: 'rgba(255,246,248,0.9)', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, mg);
    var c = mi % COLS, r0 = Math.floor(mi / COLS);
    minis.push({
      g: mg,
      tx: (c + 0.15 + 0.7 * rnd()) / COLS,
      ty: 0.08 + 0.88 * (r0 + 0.15 + 0.7 * rnd()) / ROWS,
      d: rnd() * 0.35, arc: lerp(40, 170, rnd()),
      spin: (rnd() < 0.5 ? -1 : 1) * lerp(120, 320, rnd()), rs: (rnd() < 0.5 ? -1 : 1) * lerp(10, 30, rnd()),
      ph: rnd() * 6.28, size: lerp(0.7, 1.35, rnd())
    });
  }

  /* ışıltılar: yumuşak hale + dört köşeli yıldız, tüm ekrana saçılır */
  var STAR = 'M0 -11 L2.4 -2.4 L11 0 L2.4 2.4 L0 11 L-2.4 2.4 L-11 0 L-2.4 -2.4 Z';
  var sparks = [];
  for (var si = 0; si < 90; si++) {
    var sg = el('g', {}, overlay);
    el('circle', { r: 16, fill: 'url(#rb-spark)' }, sg);
    el('path', { d: STAR, fill: si % 3 ? '#F4BB5E' : '#FFDB91', stroke: '#E0A04A', 'stroke-width': 0.6, 'stroke-linejoin': 'round' }, sg);
    el('circle', { r: 2.2, fill: '#FFFBEF' }, sg);
    sparks.push({
      g: sg, tx: lerp(0.02, 0.98, rnd()), ty: lerp(0.05, 0.97, rnd()),
      d: rnd() * 0.4, arc: lerp(20, 120, rnd()),
      size: lerp(0.5, 1.4, rnd()), speed: lerp(1.6, 4.2, rnd()), ph: rnd() * 6.28
    });
  }

  /* ---------- Zamanlama ---------- */
  var target = reduce ? 1 : 0, current = target, swayT = 0, scatState = 0;
  /* üstünde parçacıkların saydamlaştığı içerik blokları */
  var fadeEls = document.querySelectorAll('.gallery-grid, [data-bloom-fade]');
  minis.concat(sparks).forEach(function (o) { o.ox = 0; o.oy = 0; o.vx = 0; o.vy = 0; o.gf = 1; o.gs = 1; });

  function render(p, dt) {
    /* 1. sap */
    var s = seg(p, 0, 0.32);
    stem.style.strokeDashoffset = String(stemLen * (1 - s));
    thorns.forEach(function (t) {
      var v = clamp((s - t.at) / 0.08, 0, 1);
      t.el.style.opacity = v;
      t.el.setAttribute('transform', 'scale(' + v + ')');
    });

    /* 2. yapraklar */
    var sway = Math.sin(swayT * 0.9) * 1.6;
    leaves.forEach(function (L, i) {
      var v = seg(p, L.at, 0.16);
      L.g.setAttribute('transform', 'translate(' + L.x + ' ' + L.y + ') rotate(' + (L.rot * lerp(0.4, 1, v) + sway * (i % 2 ? 1 : -1)) + ') scale(' + (L.s * v) + ')');
      L.g.style.opacity = v > 0.01 ? 1 : 0;
    });

    /* 3. tomurcuk */
    var bud = seg(p, 0.3, 0.12);
    var bloom = clamp((p - 0.4) / 0.4, 0, 1);   /* p≈0.78'de tam açar */
    var headSway = Math.sin(swayT * 0.7) * 1.2;
    head.setAttribute('transform', 'translate(' + HX + ' ' + HY + ') rotate(' + headSway + ') scale(' + lerp(0.2, 1, bud) + ')');
    head.style.opacity = bud > 0.01 ? 1 : 0;
    sepals.forEach(function (sp, i) {
      var v = seg(p, 0.36 + i * 0.015, 0.16);
      var a = lerp(sp.final >= 0 ? 168 : -168, sp.final, v);
      sp.g.setAttribute('transform', 'rotate(' + a + ')');
    });

    /* 4. açılma, 5. dağılma (sayfanın en altında)
       Dağılma kaydırmayla eş zamanlı: tekerlek döndükçe yapraklar o kadar yayılır.
       Geniş bir kaydırma aralığına yayıldığı için hareket yavaş ve akıcıdır. */
    var scat = clamp((p - 0.79) / 0.21, 0, 1);
    var t = swayT;
    var fdt = dt || 0;
    function openPetal(o) {
      var v = ease(clamp((bloom - o.d) / 0.72, 0, 1));
      var a = lerp(o.closed, o.final, v) + o.spin * scat;
      var sc = lerp(0.5, 1, Math.max(v, bud * 0.3)) * (1 - 0.62 * scat);
      var sy = o.squash ? lerp(1.15, 0.82, v) : 1;
      var tx = (o.dx + Math.sin(t * 1.3 + o.ph) * 8) * scat;
      var ty = (o.dy + Math.cos(t * 1.1 + o.ph) * 7) * scat;
      o.g.setAttribute('transform', 'translate(' + tx.toFixed(1) + ' ' + ty.toFixed(1) + ') rotate(' + a.toFixed(1) + ') scale(' + sc.toFixed(3) + ' ' + (sc * sy).toFixed(3) + ')');
      /* gülün kendi yaprakları küçülüp solar; yerini ekrana yayılanlar alır */
      o.g.style.opacity = (1 - 0.88 * scat).toFixed(3);
    }
    allPetals.forEach(openPetal);
    var coreV = ease(clamp(bloom / 0.8, 0, 1));
    core.setAttribute('transform', 'scale(' + (lerp(0.55, 0.9, coreV) * (1 - 0.5 * scat)).toFixed(3) + ')');
    glowEl.setAttribute('opacity', (ease(bloom) * 0.9 * (1 - 0.3 * scat) + scat * 0.25).toFixed(3));

    if (scat <= 0.002) {
      if (!overlay.hasAttribute('hidden')) overlay.setAttribute('hidden', '');
      return;
    }
    if (overlay.hasAttribute('hidden')) overlay.removeAttribute('hidden');
    var h = headOnScreen();
    /* küçük ekranda: daha küçük ve yarı sayıda parçacık, metin okunur kalsın */
    var small = VW < 720, k = small ? 0.62 : 1;
    /* içerik bloklarının (galeri, kartlar, tablo, listeler...) üstüne gelen
       parçacıklar saydamlaşır, içerik görünür kalsın */
    var rects = [];
    for (var fi = 0; fi < fadeEls.length; fi++) {
      var fr = fadeEls[fi].getBoundingClientRect();
      if (fr.bottom > 0 && fr.top < VH) rects.push({ r: fr, gal: fadeEls[fi].classList.contains('gallery-grid') });
    }
    /* 0: boşluk, 1: içerik bloğu, 2: galeri (en hafif: fotoğraflar net görünsün) */
    function overGallery(x, y) {
      var lvl = 0;
      for (var ri = 0; ri < rects.length; ri++) {
        var r = rects[ri].r;
        if (x > r.left && x < r.right && y > r.top && y < r.bottom) lvl = Math.max(lvl, rects[ri].gal ? 2 : 1);
      }
      return lvl;
    }
    var FADE_M = [1, 0.36, 0.12], FADE_S = [1, 0.42, 0.18], SHRINK = [1, 1, 0.7];
    function fadeTo(o, target) { o.gf += (target - o.gf) * Math.min(1, fdt * 6 || 1); return o.gf; }

    minis.forEach(function (m, i) {
      if (small && i % 2) { m.g.style.opacity = 0; return; }
      var e = ease(clamp((scat - m.d) / (1 - m.d), 0, 1));
      var arcY = Math.sin(e * Math.PI) * m.arc;
      var x = lerp(h.x, m.tx * VW, e) + Math.sin(t * 0.8 + m.ph) * 12 * e;
      var y = lerp(h.y, m.ty * VH, e) - arcY + Math.cos(t * 0.7 + m.ph) * 10 * e;
      push(m, x, y, fdt, e, 1);
      x += m.ox; y += m.oy;
      var rot = m.spin * e + t * m.rs * e + m.ox * 0.35;
      var lvl = overGallery(x, y);
      var g = fadeTo(m, FADE_M[lvl]);
      m.gs += (SHRINK[lvl] - m.gs) * Math.min(1, fdt * 6 || 1);
      var sc = m.size * k * lerp(0.35, 1, e) * m.gs;
      m.g.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + rot.toFixed(1) + ') scale(' + sc.toFixed(3) + ')');
      m.g.style.opacity = (Math.min(1, e * 4) * 0.95 * g).toFixed(3);
    });
    sparks.forEach(function (sp, i) {
      if (small && i % 2) { sp.g.style.opacity = 0; return; }
      var e = ease(clamp((scat - sp.d) / (1 - sp.d), 0, 1));
      var tw = 0.3 + 0.7 * Math.abs(Math.sin(t * sp.speed + sp.ph));
      var x = lerp(h.x, sp.tx * VW, e);
      var y = lerp(h.y, sp.ty * VH, e) - Math.sin(e * Math.PI) * sp.arc + Math.sin(t * 0.6 + sp.ph) * 6 * e;
      push(sp, x, y, fdt, e, 0.8);
      x += sp.ox; y += sp.oy;
      sp.g.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + ((t * 40 + sp.ph * 57) % 360).toFixed(0) + ') scale(' + (sp.size * k * (0.55 + 0.45 * tw) * Math.min(1, e * 2)).toFixed(3) + ')');
      var g = fadeTo(sp, FADE_S[overGallery(x, y)]);
      sp.g.style.opacity = (Math.min(1, e * 3) * tw * g).toFixed(3);
    });
  }

  /* ---------- İmleç: dağılmış yaprakları sağa sola iter ---------- */
  var ptr = { x: -9999, y: -9999, vx: 0, vy: 0, t: 0 };
  window.addEventListener('pointermove', function (ev) {
    var now = performance.now(), dts = Math.max(8, now - ptr.t) / 1000;
    if (ptr.x > -9000) {
      ptr.vx = clamp((ev.clientX - ptr.x) / dts, -3000, 3000);
      ptr.vy = clamp((ev.clientY - ptr.y) / dts, -3000, 3000);
    }
    ptr.x = ev.clientX; ptr.y = ev.clientY; ptr.t = now;
  }, { passive: true });
  document.addEventListener('pointerleave', function () { ptr.x = ptr.y = -9999; });

  /* yay-sönüm modeli: imlece yakın parçacık itilir, sonra yerine salınarak döner */
  function push(o, x, y, dt, e, strength) {
    if (!dt) return;
    var R = VW < 720 ? 110 : 160;
    if (e > 0.5) {
      var dx = x + o.ox - ptr.x, dy = y + o.oy - ptr.y, d2 = dx * dx + dy * dy;
      if (d2 < R * R && d2 > 0.01) {
        var d = Math.sqrt(d2), f = 1 - d / R; f *= f * strength;
        o.vx += (dx / d) * f * 2600 * dt + ptr.vx * f * 0.06;   /* ağırlık yatayda: sağa sola */
        o.vy += (dy / d) * f * 900 * dt + ptr.vy * f * 0.02;
      }
    }
    o.vx -= o.ox * 9 * dt; o.vy -= o.oy * 9 * dt;
    var damp = Math.exp(-3.2 * dt);
    o.vx *= damp; o.vy *= damp;
    o.ox += o.vx * dt; o.oy += o.vy * dt;
  }

  function measure() {
    var r = zone.getBoundingClientRect(), vh = window.innerHeight;
    /* alan ekranın altına girince başlar; alanın sonu ekranın altına gelince tam açar */
    return clamp((vh * 0.9 - r.top) / Math.max(1, r.height - vh * 0.3), 0, 1);
  }

  /* hareket azaltma: dağılma yok, tam açmış gül durağan gösterilir */
  if (reduce) { render(0.8); return; }

  var running = false, raf = 0, last = 0;
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    swayT += dt;
    target = measure();
    current += (target - current) * Math.min(1, dt * 6);
    ptr.vx *= 0.85; ptr.vy *= 0.85;
    render(current, dt);
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); } }
  function stop() { running = false; cancelAnimationFrame(raf); overlay.setAttribute('hidden', ''); }

  current = target = measure();
  render(current);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { e[0].isIntersecting ? start() : stop(); }).observe(zone);
  } else {
    start();
  }
})();
