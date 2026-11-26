/* ==========================================================================
   Gül buketi galeri (anasayfa ve galeri.html)
   Galeri fotoğrafları başlangıçta pembe kâğıda sarılı bir gül buketinin içinde,
   yelpaze gibi açılmış bir deste halinde durur. Kurdeleye dokununca kurdele
   çözülür, kâğıt ve güller süzülerek iner, fotoğraflar tek tek ızgaradaki
   yerlerine uçar. "Buketi Topla" ile fotoğraflar desteye geri döner, kâğıt ve
   güller yükselir, kurdele yeniden bağlanır. JS yoksa galeri normal ızgaradır.
   ========================================================================== */
(function () {
  'use strict';

  var grid = document.querySelector('[data-bouquet]');
  if (!grid) return;
  var tiles = Array.prototype.slice.call(grid.querySelectorAll('.gtile, .lb-item'));
  if (!tiles.length) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var I18n = window.I18n;
  function t(k, fb) { return I18n ? I18n.t(k) : fb; }

  /* ---------- SVG parçaları ---------- */
  var VB_W = 400, VB_H = 600;          /* alt kısımda saplar için uzatıldı */

  /* Küçük gül: halka halka taç yapraklar, sitedeki gülle aynı renkler/kontur */
  function rose(cx, cy, r, rot) {
    var out = '<g transform="translate(' + cx + ' ' + cy + ') rotate(' + (rot || 0) + ')">';
    var rings = [[r, 6, 'url(#bq-p1)'], [r * 0.72, 5, 'url(#bq-p2)'], [r * 0.46, 4, 'url(#bq-p3)']];
    rings.forEach(function (ring, ri) {
      var rr = ring[0], n = ring[1];
      for (var i = 0; i < n; i++) {
        var a = (360 / n) * i + ri * 23;
        var w = rr * 0.62;
        out += '<path transform="rotate(' + a + ')" d="M0 0 C ' + (-w) + ' ' + (-rr * 0.2) + ' ' + (-w * 1.05) + ' ' + (-rr * 0.85) + ' 0 ' + (-rr) +
          ' C ' + (w * 1.05) + ' ' + (-rr * 0.85) + ' ' + w + ' ' + (-rr * 0.2) + ' 0 0Z" fill="' + ring[2] + '" stroke="#86405A" stroke-width="1.1" stroke-linejoin="round"/>';
      }
    });
    out += '<circle r="' + (r * 0.2) + '" fill="#8E4459"/>' +
      '<path d="M' + (-r * 0.12) + ' ' + (-r * 0.04) + ' a ' + (r * 0.13) + ' ' + (r * 0.13) + ' 0 1 1 ' + (r * 0.2) + ' ' + (r * 0.1) + '" fill="none" stroke="#FFE3EA" stroke-width="1.2" stroke-linecap="round"/>' +
      '</g>';
    return out;
  }
  function leaf(x, y, rot, s) {
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ') scale(' + s + ')">' +
      '<path d="M0 0 C -14 -12 -16 -44 0 -64 C 16 -44 14 -12 0 0Z" fill="url(#bq-leaf)" stroke="#3F5A3B" stroke-width="1.3"/>' +
      '<path d="M0 -4 Q 2 -34 0 -58" fill="none" stroke="rgba(232,240,214,.6)" stroke-width="1.2"/></g>';
  }
  /* buketin alt kısmı: kâğıdın ucundan çıkan, kesik uçlu saplar */
  function stems() {
    var paths = [
      'M192 438 C 182 492 160 528 140 572',
      'M196 440 C 192 500 180 545 168 592',
      'M200 440 C 200 512 198 552 197 598',
      'M204 440 C 210 500 222 545 234 590',
      'M208 438 C 220 494 244 528 262 568'
    ];
    var out = '<g class="bq-stems">';
    paths.forEach(function (d) {
      out += '<path d="' + d + '" fill="none" stroke="#4F6848" stroke-width="8" stroke-linecap="butt"/>' +
             '<path d="' + d + '" fill="none" stroke="#7F9A70" stroke-width="4" stroke-linecap="butt"/>';
    });
    [[140, 572, -36], [168, 592, -14], [197, 598, 0], [234, 590, 14], [262, 568, 36]].forEach(function (e) {
      out += '<ellipse cx="' + e[0] + '" cy="' + e[1] + '" rx="4.6" ry="2.6" transform="rotate(' + e[2] + ' ' + e[0] + ' ' + e[1] + ')" fill="#CFE0B0" stroke="#4F6848" stroke-width="1"/>';
    });
    out += leaf(170, 520, -62, 0.55) + leaf(230, 515, 62, 0.55) + '</g>';
    return out;
  }

  var DEFS =
    '<defs>' +
      '<linearGradient id="bq-p1" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#A85A70"/><stop offset=".5" stop-color="#DE9AAD"/><stop offset="1" stop-color="#F9D8E0"/></linearGradient>' +
      '<linearGradient id="bq-p2" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#B4677C"/><stop offset=".5" stop-color="#EAAABB"/><stop offset="1" stop-color="#FCE4EA"/></linearGradient>' +
      '<linearGradient id="bq-p3" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#9A4E64"/><stop offset="1" stop-color="#E7A1B3"/></linearGradient>' +
      '<linearGradient id="bq-leaf" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#55704F"/><stop offset=".6" stop-color="#7F9A70"/><stop offset="1" stop-color="#A7BC94"/></linearGradient>' +
      '<linearGradient id="bq-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDF0F3"/><stop offset="1" stop-color="#F0C7D2"/></linearGradient>' +
      '<linearGradient id="bq-paper-back" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EDBCCA"/><stop offset="1" stop-color="#D99AAD"/></linearGradient>' +
      '<linearGradient id="bq-ribbon" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D67E97"/><stop offset="1" stop-color="#A24F69"/></linearGradient>' +
    '</defs>';

  /* Arka katman (fotoğrafların arkasında): saplar, kâğıdın iç yüzü, arka güller, yapraklar */
  var BACK =
    '<svg class="bouquet__svg" viewBox="0 0 ' + VB_W + ' ' + VB_H + '" aria-hidden="true" focusable="false">' + DEFS +
      '<g class="bq-back">' +
        /* kurdelenin altında sapları arkadan saran kâğıt eteği */
        '<path d="M182 392 L 90 552 Q 120 550 138 576 Q 168 560 200 584 Q 232 560 262 576 Q 280 550 310 552 L 218 392 Z" fill="url(#bq-paper-back)" stroke="#C98A9C" stroke-width="1.5" stroke-linejoin="round"/>' +
        stems() +
        '<path d="M22 196 Q 200 118 378 196 L 216 468 Q 200 476 184 468 Z" fill="url(#bq-paper-back)" stroke="#C98A9C" stroke-width="1.5"/>' +
        leaf(70, 205, -58, 1.1) + leaf(330, 205, 58, 1.1) + leaf(112, 160, -30, 0.9) + leaf(288, 160, 30, 0.9) +
        rose(120, 150, 34, 10) + rose(280, 150, 34, -12) + rose(200, 128, 30, 4) +
      '</g>' +
    '</svg>';

  /* Ön katman (fotoğrafların önünde): kâğıdın ön yüzü, kenar gülleri, kurdele.
     Renk tanımları yalnızca arka katmanda; ön katman aynı kimlikleri kullanır. */
  var FRONT =
    '<svg class="bouquet__svg" viewBox="0 0 ' + VB_W + ' ' + VB_H + '" aria-hidden="true" focusable="false">' +
      '<g class="bq-paper">' +
        /* sapların iki yanını saran ön kâğıt kanatları */
        '<path d="M184 394 L 104 546 Q 128 546 148 564 Q 160 496 202 430 Z M216 394 L 296 546 Q 272 546 252 564 Q 240 496 198 430 Z" fill="url(#bq-paper)" stroke="#C98A9C" stroke-width="1.5" stroke-linejoin="round"/>' +
        '<path d="M186 408 L 128 540 M214 408 L 272 540" stroke="rgba(180,98,122,.28)" stroke-width="1.4" fill="none"/>' +
        '<path d="M30 206 Q 120 236 200 226 Q 280 236 370 206 L 216 468 Q 200 476 184 468 Z" fill="url(#bq-paper)" stroke="#C98A9C" stroke-width="1.6"/>' +
        '<path d="M118 232 L 192 460 M282 232 L 208 460 M200 228 L 200 466" stroke="rgba(180,98,122,.28)" stroke-width="1.4" fill="none"/>' +
        '<path d="M30 206 Q 120 236 200 226 Q 280 236 370 206" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2"/>' +
      '</g>' +
      '<g class="bq-roses">' +
        rose(58, 196, 32, -18) + rose(342, 196, 32, 16) + rose(96, 224, 26, 8) + rose(304, 224, 26, -6) +
      '</g>' +
      '<g class="bq-ribbon">' +
        '<path class="bq-band" d="M132 372 Q 200 392 268 372 L 262 390 Q 200 410 138 390 Z" fill="url(#bq-ribbon)" stroke="#86405A" stroke-width="1.2"/>' +
        '<g class="bq-tails">' +
          '<path d="M194 392 L 166 458 L 178 452 L 186 466 L 202 396 Z" fill="url(#bq-ribbon)" stroke="#86405A" stroke-width="1.2"/>' +
          '<path d="M206 392 L 234 458 L 222 452 L 214 466 L 198 396 Z" fill="url(#bq-ribbon)" stroke="#86405A" stroke-width="1.2"/>' +
        '</g>' +
        '<g class="bq-bow">' +
          '<path d="M200 384 C 160 344 118 352 136 390 C 148 414 184 404 200 384 Z" fill="url(#bq-ribbon)" stroke="#86405A" stroke-width="1.3"/>' +
          '<path d="M200 384 C 240 344 282 352 264 390 C 252 414 216 404 200 384 Z" fill="url(#bq-ribbon)" stroke="#86405A" stroke-width="1.3"/>' +
          '<path d="M150 372 C 166 366 182 372 192 382 M250 372 C 234 366 218 372 208 382" fill="none" stroke="#FFD6E0" stroke-opacity=".8" stroke-width="1.6" stroke-linecap="round"/>' +
          '<ellipse cx="200" cy="386" rx="12" ry="10" fill="#B4627A" stroke="#86405A" stroke-width="1.3"/>' +
          '<path d="M194 382 Q 200 378 206 382" fill="none" stroke="#FFD6E0" stroke-width="1.4" stroke-linecap="round"/>' +
        '</g>' +
      '</g>' +
    '</svg>';

  /* ---------- Yerleşim ---------- */
  var back = document.createElement('div');
  back.className = 'bouquet bouquet--back';
  back.innerHTML = BACK;
  var front = document.createElement('div');
  front.className = 'bouquet bouquet--front';
  front.innerHTML = FRONT;
  var btnOpen = document.createElement('button');
  btnOpen.type = 'button';
  btnOpen.className = 'bouquet__ribbon-btn';
  btnOpen.setAttribute('aria-expanded', 'false');
  var hint = document.createElement('p');
  hint.className = 'bouquet__hint';
  front.appendChild(btnOpen);
  front.appendChild(hint);
  grid.appendChild(back);
  grid.appendChild(front);

  /* "Buketi Topla" düğmesi: galerinin altında, yalnızca buket açıkken görünür */
  var actions = document.createElement('div');
  actions.className = 'bouquet-actions';
  actions.innerHTML =
    '<button type="button" class="btn bouquet-close" hidden>' +
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M12 21 7.5 11h9L12 21Z"/><circle cx="12" cy="7.5" r="3.5"/><path d="M10.5 15h3"/></svg>' +
      '<span></span></button>';
  grid.parentNode.insertBefore(actions, grid.nextSibling);
  var btnClose = actions.querySelector('.bouquet-close');

  function setTexts() {
    btnOpen.setAttribute('aria-label', t('bq.open', 'Kurdeleyi çöz, fotoğrafları aç'));
    hint.textContent = t('bq.hint', 'Kurdeleye dokun, buket açılsın');
    btnClose.querySelector('span').textContent = t('bq.close', 'Buketi Topla');
  }
  setTexts();
  document.addEventListener('langchange', setTexts);

  /* ---------- Deste hesabı ---------- */
  var FAN = [-17, -10, -4, 3, 10, 17];
  /* Fotoğraflar doğal (dönüşümsüz) konumdayken, desteye götüren dönüşümleri hesaplar */
  function computeDeck() {
    var g = grid.getBoundingClientRect();
    var b = front.getBoundingClientRect();
    var cx = b.left + b.width * 0.5 - g.left;
    var cy = b.top + b.height * (150 / VB_H) - g.top;
    var cardW = b.width * 0.36;
    var n = tiles.length;
    return tiles.map(function (tile, i) {
      /* galeri.html'de kart = fotoğraf düğmesi; altındaki yazı hesaba katılmaz */
      var photo = tile.querySelector('.lb-open');
      var r = (photo || tile).getBoundingClientRect();
      if (photo) tile.style.transformOrigin = '50% ' + (r.top + r.height / 2 - tile.getBoundingClientRect().top).toFixed(1) + 'px';
      var tx = r.left - g.left + r.width / 2, ty = r.top - g.top + r.height / 2;
      var k = i - (n - 1) / 2;
      var s = cardW / r.width;
      var dx = cx + k * b.width * 0.06 - tx;
      var dy = cy + Math.abs(k) * 7 - ty;
      var a = FAN[i % FAN.length] || k * 6;
      return 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) rotate(' + a + 'deg) scale(' + s.toFixed(3) + ')';
    });
  }
  function resetTiles() {
    tiles.forEach(function (tile) { tile.style.transition = 'none'; tile.style.transform = 'none'; });
  }
  function restoreTransitions() {
    void grid.offsetWidth;
    tiles.forEach(function (tile) { tile.style.transition = ''; });
  }

  var state = 'closed';
  function layoutDeck() {
    if (state !== 'closed') return;
    resetTiles();
    var tr = computeDeck();
    tiles.forEach(function (tile, i) { tile.style.transform = tr[i]; tile.style.zIndex = String(10 + i); });
    restoreTransitions();
  }

  grid.classList.add('is-bouquet');
  /* destedeki kartlar ekran okuyucuya ve klavyeye kapalı */
  tiles.forEach(function (tile) { tile.setAttribute('aria-hidden', 'true'); tile.inert = true; });
  var resizeT = 0;
  window.addEventListener('resize', function () { clearTimeout(resizeT); resizeT = setTimeout(layoutDeck, 120); });
  window.addEventListener('load', layoutDeck);
  layoutDeck();
  setTimeout(layoutDeck, 400);   /* yazı tipleri yüklendikten sonra yeniden ölç */

  /* ---------- Kurdeleyi çöz: buket açılır ---------- */
  function open() {
    if (state !== 'closed') return;
    state = 'opening';
    btnOpen.setAttribute('aria-expanded', 'true');
    grid.classList.add('is-untying');
    var delay = reduce ? 0 : 520;
    setTimeout(function () {
      grid.classList.add('is-moving');
      tiles.forEach(function (tile, i) {
        tile.style.transitionDelay = reduce ? '0s' : (i * 0.09) + 's';
        tile.style.transform = '';
        tile.removeAttribute('aria-hidden');
        tile.inert = false;
      });
      grid.classList.remove('is-bouquet');
    }, delay);
    setTimeout(function () {
      grid.classList.remove('is-moving');
      grid.classList.add('is-open');
      tiles.forEach(function (tile) { tile.style.transitionDelay = ''; tile.style.zIndex = ''; });
      back.hidden = true; front.hidden = true;
      btnClose.hidden = false;
      state = 'open';
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    }, reduce ? 50 : delay + 1500 + tiles.length * 90);
  }

  /* ---------- Buketi topla: fotoğraflar desteye döner, kurdele bağlanır ---------- */
  function close() {
    if (state !== 'open') return;
    state = 'closing';
    btnClose.hidden = true;
    grid.classList.remove('is-open');
    /* katmanları görünmez (çözülmüş) halde geri getir, ölç, sonra yükselt */
    back.hidden = false; front.hidden = false;
    grid.classList.add('is-tying');
    resetTiles();
    var tr = computeDeck();
    restoreTransitions();
    grid.classList.add('is-moving', 'is-bouquet');
    var n = tiles.length;
    tiles.forEach(function (tile, i) {
      tile.style.transitionDelay = reduce ? '0s' : ((n - 1 - i) * 0.08) + 's';
      tile.style.transform = tr[i];
      tile.style.zIndex = String(10 + i);
      tile.setAttribute('aria-hidden', 'true');
      tile.inert = true;
    });
    /* galeri.html'de sayfa kısalır: buket görünür kalsın */
    if (grid.classList.contains('lb-grid') && grid.getBoundingClientRect().top < 0) {
      if (window.lenis) window.lenis.scrollTo(grid, { offset: -100 });
      else grid.scrollIntoView({ block: 'start' });
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { grid.classList.remove('is-untying'); });
    });
    setTimeout(function () {
      grid.classList.remove('is-moving', 'is-tying');
      tiles.forEach(function (tile) { tile.style.transitionDelay = ''; });
      btnOpen.setAttribute('aria-expanded', 'false');
      state = 'closed';
      btnOpen.focus({ preventScroll: true });
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    }, reduce ? 50 : 2100);
  }

  btnOpen.addEventListener('click', open);
  btnClose.addEventListener('click', close);
})();
