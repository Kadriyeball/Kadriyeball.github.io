/* ==========================================================================
   Gün Batımı Gül Bahçesi · canvas sahnesi
   Harici görsel/video kullanmaz. Her şey çalışma anında çizilir:
   - Gökyüzü + gün batımı güneşi + ışık huzmeleri (arka plan)
   - Uzak çit silüetleri ve pus (arka plan)
   - 3B yerleştirilmiş gül kümeleri, yapraklar, çalılar (orta plan)
   - Kameranın önünde duran, kaydırınca yanlara açılan büyük flu güller (ön plan)
   - Bokeh ışık parçacıkları ve rüzgârda süzülen yapraklar (atmosfer)
   İmleç/parmak hareketi küçük bir esinti yaratır ve yaprakları savurur.

   Dışa açılan API: window.RoseGarden.setProgress(0..1)
   ========================================================================== */
(function () {
  'use strict';

  var canvas = document.getElementById('garden');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Yardımcılar ---------- */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t * t * (3 - 2 * t); }
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var hexCache = {};
  function hexToRgb(h) {
    if (hexCache[h]) return hexCache[h];
    var n = parseInt(h.slice(1), 16);
    return (hexCache[h] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]);
  }
  function mix(a, b, t, alpha) {
    var A = hexToRgb(a), B = hexToRgb(b);
    var r = Math.round(lerp(A[0], B[0], t)), g = Math.round(lerp(A[1], B[1], t)), bl = Math.round(lerp(A[2], B[2], t));
    return alpha == null ? 'rgb(' + r + ',' + g + ',' + bl + ')' : 'rgba(' + r + ',' + g + ',' + bl + ',' + alpha + ')';
  }
  function rgba(h, a) { var c = hexToRgb(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function makeCanvas(w, h) {
    var c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w));
    c.height = Math.max(1, Math.round(h));
    return c;
  }

  /* Canvas filter desteği (Safari'de olmayabilir) */
  var FILTER_OK = (function () {
    try { var g = makeCanvas(2, 2).getContext('2d'); g.filter = 'blur(2px)'; return g.filter === 'blur(2px)'; }
    catch (e) { return false; }
  })();

  /* Bir sprite'ın flu (soft-focus) kopyasını üretir.
     Dönen nesne: { img, ext (genişlik oranı), padRel (kenar payı / taban genişlik), hRatio } */
  function blurred(src, px) {
    var w0 = src.width, h0 = src.height;
    if (px < 0.45) return { img: src, ext: 1, padRel: 0, hRatio: h0 / w0 };
    var pad = Math.ceil(px * 2.6);
    var padded = makeCanvas(w0 + pad * 2, h0 + pad * 2);
    var pg = padded.getContext('2d');
    var out;
    if (FILTER_OK) {
      pg.filter = 'blur(' + px.toFixed(2) + 'px)';
      pg.drawImage(src, pad, pad);
      out = padded;
    } else {
      pg.drawImage(src, pad, pad);
      var factor = Math.max(1, px / 1.1);
      var cur = padded, w = padded.width, h = padded.height;
      var tw = Math.max(6, Math.round(w / factor)), th = Math.max(6, Math.round(h / factor));
      while (w / 2 > tw) {
        w = Math.round(w / 2); h = Math.round(h / 2);
        var c = makeCanvas(w, h), g = c.getContext('2d');
        g.imageSmoothingQuality = 'high';
        g.drawImage(cur, 0, 0, w, h);
        cur = c;
      }
      out = makeCanvas(tw, th);
      var og = out.getContext('2d');
      og.imageSmoothingQuality = 'high';
      og.drawImage(cur, 0, 0, tw, th);
    }
    return { img: out, ext: (w0 + pad * 2) / w0, padRel: pad / w0, hRatio: h0 / w0 };
  }

  /* ---------- Renk paletleri ---------- */
  var PALETTES = [
    { outer: '#F9D6D9', mid: '#EEADB7', inner: '#C2707F', core: '#6E2B3A' }, // pastel pembe
    { outer: '#FDF0DF', mid: '#F3D5B6', inner: '#D9A582', core: '#8C5A43' }, // krem
    { outer: '#E5B2B4', mid: '#CB8E94', inner: '#985864', core: '#52222C' }, // gül kurusu
    { outer: '#FBDCC7', mid: '#F2B697', inner: '#CC7E62', core: '#7C3D2E' }  // şeftali
  ];
  var PAL_CDF = [0.34, 0.62, 0.9, 1];
  function pickPal(x) { for (var i = 0; i < PAL_CDF.length; i++) if (x <= PAL_CDF[i]) return i; return 0; }

  /* ---------- Sprite çizimleri ---------- */
  function petalPath(g, r, w) {
    g.beginPath();
    g.moveTo(0, 0);
    g.bezierCurveTo(-w * 0.95, -r * 0.12, -w * 1.08, -r * 0.8, -w * 0.3, -r * 0.97);
    g.quadraticCurveTo(0, -r * 1.05, w * 0.3, -r * 0.97);
    g.bezierCurveTo(w * 1.08, -r * 0.8, w * 0.95, -r * 0.12, 0, 0);
    g.closePath();
  }

  function paintRose(S, pal, seed) {
    var c = makeCanvas(S, S), g = c.getContext('2d'), rnd = rng(seed);
    var R0 = S * 0.42;
    g.translate(S / 2, S / 2);
    g.scale(1, 0.84);
    g.rotate((rnd() - 0.5) * 0.5);
    var rings = 7;
    for (var i = 0; i < rings; i++) {
      var t = i / (rings - 1);
      var r = R0 * (1 - t * 0.78);
      var n = Math.max(3, Math.round(lerp(7, 3, t)));
      var w = r * lerp(0.66, 0.82, t);
      var rot0 = rnd() * Math.PI * 2;
      var baseC = mix(pal.inner, pal.core, t * 0.85);
      var midC = mix(pal.mid, pal.inner, t * 0.9);
      var tipC = mix(pal.outer, pal.mid, t * 0.6);
      for (var k = 0; k < n; k++) {
        var a = rot0 + (k / n) * Math.PI * 2 + (rnd() - 0.5) * 0.35;
        var rr = r * (0.88 + rnd() * 0.18);
        g.save();
        g.rotate(a);
        petalPath(g, rr, w * (0.9 + rnd() * 0.2));
        var gr = g.createLinearGradient(0, 0, 0, -rr);
        gr.addColorStop(0, baseC);
        gr.addColorStop(0.5, midC);
        gr.addColorStop(1, tipC);
        g.fillStyle = gr;
        g.fill();
        /* kavis gölgesi: taç yaprağın bir yanı gölgede kalır */
        var side = k % 2 ? 1 : -1;
        var cv = g.createLinearGradient(-w * side, 0, w * 0.4 * side, 0);
        cv.addColorStop(0, rgba(pal.core, 0.28));
        cv.addColorStop(1, rgba(pal.core, 0));
        g.fillStyle = cv;
        g.fill();
        /* belirgin kontur: koyu dış hat + açık iç kenar */
        g.lineJoin = 'round';
        g.lineWidth = S * 0.0075;
        g.strokeStyle = rgba(pal.core, 0.42 - t * 0.12);
        g.stroke();
        g.lineWidth = S * 0.004;
        g.strokeStyle = rgba(pal.outer, 0.7 - t * 0.3);
        g.stroke();
        /* kıvrık uç parlaması (ufuktan gelen ışık) */
        g.beginPath();
        g.ellipse(0, -rr * 0.86, w * 0.52, rr * 0.11, 0, Math.PI * 1.05, Math.PI * 1.95);
        g.strokeStyle = 'rgba(255,240,222,' + (0.55 - t * 0.2) + ')';
        g.lineWidth = S * 0.011;
        g.stroke();
        g.restore();
      }
      /* çanak gölgesi: bir sonraki halkanın tabanını koyulaştırır */
      var cs = g.createRadialGradient(0, 0, 0, 0, 0, r * 0.78);
      cs.addColorStop(0, rgba(pal.core, 0.62));
      cs.addColorStop(1, rgba(pal.core, 0));
      g.fillStyle = cs;
      g.beginPath(); g.arc(0, 0, r * 0.78, 0, Math.PI * 2); g.fill();
    }
    /* göbek: sıkı sarmal */
    var cr = R0 * 0.17;
    var core = g.createRadialGradient(0, 0, 0, 0, 0, cr);
    core.addColorStop(0, pal.core);
    core.addColorStop(1, mix(pal.inner, pal.core, 0.45));
    g.fillStyle = core;
    g.beginPath(); g.arc(0, 0, cr, 0, Math.PI * 2); g.fill();
    g.lineCap = 'round';
    for (var j = 0; j < 4; j++) {
      var sr = cr * (0.3 + j * 0.26), s0 = rnd() * Math.PI * 2;
      g.beginPath(); g.arc(0, 0, sr, s0, s0 + Math.PI * (1.1 + rnd() * 0.5));
      g.strokeStyle = rgba(pal.mid, 0.6);
      g.lineWidth = S * 0.009;
      g.stroke();
    }
    /* gün batımı ışığı sağ üstten, gölge sol alttan */
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'source-atop';
    /* yumuşak altın saat ışığı: sağ üst kenarda ince bir sıcak kenar ışığı */
    var hl = g.createRadialGradient(S * 0.78, S * 0.2, S * 0.18, S * 0.78, S * 0.2, S * 0.62);
    hl.addColorStop(0, 'rgba(255,232,200,0.5)');
    hl.addColorStop(0.45, 'rgba(255,222,190,0.16)');
    hl.addColorStop(1, 'rgba(255,222,190,0)');
    g.fillStyle = hl; g.fillRect(0, 0, S, S);
    var sh = g.createRadialGradient(S * 0.26, S * 0.8, 0, S * 0.26, S * 0.8, S * 0.58);
    sh.addColorStop(0, 'rgba(58,26,34,0.42)');
    sh.addColorStop(1, 'rgba(58,26,34,0)');
    g.fillStyle = sh; g.fillRect(0, 0, S, S);
    g.globalCompositeOperation = 'source-over';
    return c;
  }

  function paintLeaf(S, seed) {
    var w = S * 0.6, h = S;
    var c = makeCanvas(w, h), g = c.getContext('2d'), rnd = rng(seed);
    g.translate(w / 2, h * 0.96);
    var L = h * 0.9, Wd = w * 0.42;
    g.beginPath();
    g.moveTo(0, 0);
    g.bezierCurveTo(-Wd * 1.1, -L * 0.25, -Wd * 0.8, -L * 0.75, 0, -L);
    g.bezierCurveTo(Wd * 0.8, -L * 0.75, Wd * 1.1, -L * 0.25, 0, 0);
    g.closePath();
    var dark = rnd() < 0.5 ? '#3A4429' : '#4A452A';
    var gr = g.createLinearGradient(-Wd, 0, Wd, -L);
    gr.addColorStop(0, dark);
    gr.addColorStop(1, '#7E8450');
    g.fillStyle = gr; g.fill();
    g.strokeStyle = 'rgba(232,212,160,0.28)';
    g.lineWidth = S * 0.014;
    g.beginPath(); g.moveTo(0, -2); g.quadraticCurveTo(Wd * 0.12, -L * 0.5, 0, -L * 0.94); g.stroke();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'source-atop';
    var hl = g.createLinearGradient(w, 0, 0, h);
    hl.addColorStop(0, 'rgba(255,218,180,0.36)');
    hl.addColorStop(1, 'rgba(255,218,180,0)');
    g.fillStyle = hl; g.fillRect(0, 0, w, h);
    return c;
  }

  /* Çalı: yaprak sprite'larından örülmüş yaprak kümesi */
  function paintBush(S, seed) {
    var w = S, h = S * 0.7;
    var c = makeCanvas(w, h), g = c.getContext('2d'), rnd = rng(seed);
    var cx = w / 2, cy = h * 0.6, rx = w * 0.4, ry = h * 0.34;
    var ug = g.createRadialGradient(cx, cy, 0, cx, cy, rx);
    ug.addColorStop(0, 'rgba(42,26,24,0.9)');
    ug.addColorStop(0.75, 'rgba(42,26,24,0.55)');
    ug.addColorStop(1, 'rgba(42,26,24,0)');
    g.fillStyle = ug;
    g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.fill();
    var leafs = [paintLeaf(S * 0.2, seed + 1), paintLeaf(S * 0.2, seed + 2)];
    for (var i = 0; i < 70; i++) {
      var a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd());
      var x = cx + Math.cos(a) * rx * rr * 0.95, y = cy + Math.sin(a) * ry * rr * 0.95;
      var lf = leafs[i % 2], s = lerp(0.7, 1.1, rnd());
      g.save();
      g.translate(x, y);
      g.rotate(a + Math.PI / 2 + (rnd() - 0.5) * 1.2);
      g.globalAlpha = lerp(0.55, 0.95, rr);
      g.drawImage(lf, -lf.width * s / 2, -lf.height * s * 0.9, lf.width * s, lf.height * s);
      g.restore();
    }
    g.globalAlpha = 1;
    /* iç ve alt kısım gölgede, üst kenar gün batımı ışığında */
    g.globalCompositeOperation = 'source-atop';
    var sh = g.createLinearGradient(0, cy - ry, 0, cy + ry);
    g.fillStyle = 'rgba(70,30,40,0.38)';
    g.fillRect(0, 0, w, h);
    sh.addColorStop(0, 'rgba(255,220,185,0.14)');
    sh.addColorStop(0.45, 'rgba(40,18,24,0.3)');
    sh.addColorStop(1, 'rgba(26,12,16,0.72)');
    g.fillStyle = sh; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'source-over';
    return c;
  }

  function paintPetal(S, pal) {
    var c = makeCanvas(S, S), g = c.getContext('2d');
    g.translate(S / 2, S * 0.92);
    var r = S * 0.84, w = S * 0.36;
    petalPath(g, r, w);
    var gr = g.createLinearGradient(0, 0, 0, -r);
    gr.addColorStop(0, pal.inner);
    gr.addColorStop(0.45, pal.mid);
    gr.addColorStop(1, pal.outer);
    g.fillStyle = gr; g.fill();
    g.save();
    g.clip();
    /* damarlar: tabandan uca ince çizgiler */
    g.strokeStyle = rgba(pal.inner, 0.32);
    g.lineWidth = S * 0.012;
    g.lineCap = 'round';
    for (var v = -3; v <= 3; v++) {
      g.beginPath();
      g.moveTo(v * w * 0.04, -r * 0.04);
      g.quadraticCurveTo(v * w * 0.22, -r * 0.5, v * w * 0.26, -r * 0.94);
      g.stroke();
    }
    /* kavis: bir yan gölgede, diğer yan ışıkta */
    var cv = g.createLinearGradient(-w, 0, w, 0);
    cv.addColorStop(0, rgba(pal.core, 0.3));
    cv.addColorStop(0.5, rgba(pal.core, 0));
    cv.addColorStop(1, 'rgba(255,238,215,0.32)');
    g.fillStyle = cv;
    g.fillRect(-S, -S, S * 2, S * 2);
    g.restore();
    /* kontur + ışık kenarı */
    petalPath(g, r, w);
    g.lineWidth = S * 0.02;
    g.strokeStyle = rgba(pal.inner, 0.55);
    g.stroke();
    g.globalCompositeOperation = 'source-atop';
    var hl = g.createLinearGradient(w, -r, -w, 0);
    hl.addColorStop(0, 'rgba(255,236,206,0.55)');
    hl.addColorStop(0.5, 'rgba(255,236,206,0)');
    g.fillStyle = hl; g.fillRect(-S, -S, S * 2, S * 2);
    return c;
  }

  function paintBokeh(S) {
    var c = makeCanvas(S, S), g = c.getContext('2d'), r = S / 2;
    var gr = g.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, 'rgba(255,240,215,0.26)');
    gr.addColorStop(0.62, 'rgba(255,232,205,0.32)');
    gr.addColorStop(0.84, 'rgba(252,224,196,0.5)');
    gr.addColorStop(0.94, 'rgba(250,220,195,0.14)');
    gr.addColorStop(1, 'rgba(250,220,195,0)');
    g.fillStyle = gr; g.fillRect(0, 0, S, S);
    return c;
  }

  function paintSpark(S) {
    var c = makeCanvas(S, S), g = c.getContext('2d'), r = S / 2;
    var gr = g.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, 'rgba(255,246,220,1)');
    gr.addColorStop(0.25, 'rgba(255,232,195,0.55)');
    gr.addColorStop(1, 'rgba(255,220,180,0)');
    g.fillStyle = gr; g.fillRect(0, 0, S, S);
    return c;
  }

  /* ---------- Durum ---------- */
  var W = 1, H = 1, dpr = 1, F = 1, HZ = 1, isMobile = false, SUN_X = 0.64;
  var bakedS = 0;
  var roseSprites = [], leafSprites = [], bushSprites = [], petalSprites = [], bokehSprite, sparkSprite;
  var sil = null, vignette = null;
  var objects = [], bokeh = [], petals = [], rays = [];
  var TRAVEL = 1500, FAR = 2150, NEAR = 28;
  var BLURS = [0, 1.6, 4.2, 9];

  var state = { p: 0, target: 0, t: 0, prevP: 0 };
  var pointer = { x: -9999, y: -9999, vx: 0, vy: 0, lastT: 0, inside: false };

  function bakeSprites(S) {
    var k = S / 220;
    roseSprites = PALETTES.map(function (pal, pi) {
      return [0, 1].map(function (sh) {
        var base = paintRose(S, pal, 101 + pi * 17 + sh * 53);
        return BLURS.map(function (b) { return blurred(base, b * k); });
      });
    });
    leafSprites = [0, 1, 2].map(function (i) {
      var base = paintLeaf(S * 0.62, 300 + i * 11);
      return BLURS.map(function (b) { return blurred(base, b * k * 0.7); });
    });
    bushSprites = [0, 1].map(function (i) {
      var base = paintBush(S * 1.3, 500 + i * 7);
      return BLURS.map(function (b) { return blurred(base, Math.max(1.6, b) * k); });
    });
    petalSprites = PALETTES.map(function (pal) { return paintPetal(isMobile ? 64 : 88, pal); });
    bokehSprite = paintBokeh(96);
    sparkSprite = paintSpark(48);
  }

  /* ---------- Sahne kurulumu ---------- */
  function buildScene() {
    var r = rng(42);
    objects = [];
    var spread = clamp((W / H) / 1.6, 0.42, 1.35);
    var clusters = isMobile ? 52 : 84;
    var zMax = TRAVEL + FAR;

    /* zemin örtüsü: güller arasındaki boşluğu dolduran alçak çalılar */
    var ground = isMobile ? 40 : 70;
    for (var gi = 0; gi < ground; gi++) {
      var gz = lerp(80, zMax, Math.pow(r(), 0.85));
      var gside = r() < 0.5 ? -1 : 1;
      objects.push({
        type: 'bush',
        x: gside * (40 + Math.pow(r(), 1.1) * 700 * spread),
        y: lerp(190, 280, r()), z: gz,
        size: lerp(220, 320, r()), shape: r() < 0.5 ? 0 : 1,
        rot: (r() - 0.5) * 0.2, phase: r() * 6.28, sway: 0.006
      });
    }

    function leaves() {
      var n = 2 + (r() < 0.35 ? 1 : 0), out = [];
      for (var i = 0; i < n; i++) {
        var side = r() < 0.5 ? -1 : 1;
        out.push({ ang: side * lerp(1.25, 2.5, r()), len: lerp(0.75, 1.05, r()), shape: Math.floor(r() * 3) });
      }
      return out;
    }

    for (var i = 0; i < clusters; i++) {
      var z = lerp(60, zMax, Math.pow(r(), 0.9));
      var side = r() < 0.5 ? -1 : 1;
      var corridor = 75 + r() * 45;
      var x = side * (corridor + Math.pow(r(), 1.25) * 640 * spread);
      var tall = r() < 0.33;
      var y = tall ? lerp(-130, 40, r()) : lerp(90, 240, r());
      var n = 2 + Math.floor(r() * 3);
      var pal = pickPal(r());
      objects.push({ type: 'bush', x: x, y: y + 30, z: z + 25, size: lerp(190, 260, r()), shape: r() < 0.5 ? 0 : 1, rot: (r() - 0.5) * 0.3, phase: r() * 6.28, sway: 0.01 });
      for (var k = 0; k < n; k++) {
        objects.push({
          type: 'rose',
          x: x + (r() - 0.5) * 120, y: y + (r() - 0.5) * 60, z: z + (r() - 0.5) * 90,
          size: lerp(72, 118, r()),
          pal: k === 0 ? pal : pickPal(r()), shape: r() < 0.5 ? 0 : 1,
          rot: (r() - 0.5) * 0.9, phase: r() * 6.28, sway: 0.03 + r() * 0.05,
          leaves: leaves()
        });
      }
    }

    /* Ön plan çerçevesi: kameraya çok yakın, flu, köşelerde büyük güller.
       Ekran koordinatlarından dünya koordinatına çevrilir. */
    var spots = isMobile
      ? [[-0.95, 0.42, 0.95], [1.0, 0.36, 0.8], [-1.05, -0.34, 0.7], [1.05, -0.4, 0.75], [0.15, 0.62, 0.9]]
      : [[-0.92, 0.42, 1], [-1.02, -0.3, 0.8], [0.95, 0.4, 0.95], [1.02, -0.36, 0.75], [-0.42, 0.62, 0.85], [0.5, 0.64, 0.8]];
    spots.forEach(function (s, i) {
      var d = lerp(115, 170, r());
      var sx = s[0] * (W / 2), sy = s[1] * H;
      objects.push({
        type: 'rose', fg: true,
        x: sx * d / F, y: sy * d / F, z: d,
        size: lerp(100, 128, r()) * s[2] * (isMobile ? 0.85 : 1),
        pal: pickPal(r()), shape: i % 2, rot: (r() - 0.5) * 1.2, phase: r() * 6.28, sway: 0.025,
        leaves: leaves()
      });
    });
  }

  function initBokeh() {
    var r = rng(9), n = isMobile ? 26 : 54;
    bokeh = [];
    for (var i = 0; i < n; i++) {
      bokeh.push({ x: lerp(-0.3, 1.3, r()), y: r(), z: lerp(0.25, 1, r()), size: lerp(6, 34, r()), sp: lerp(0.15, 0.7, r()), ph: r() * 6.28, spark: r() < 0.35 });
    }
  }

  function spawnPetal(r, anywhere) {
    return {
      x: anywhere ? r() * W : -40 - r() * W * 0.25,
      y: anywhere ? r() * H : r() * H * 0.85 - H * 0.1,
      vx: 0, vy: 0,
      base: lerp(24, 62, r()), fall: lerp(10, 32, r()),
      size: lerp(14, 34, r()) * (isMobile ? 0.85 : 1),
      rot: r() * 6.28, vr: lerp(-1.2, 1.2, r()),
      flip: r() * 6.28, vf: lerp(1.4, 3.4, r()),
      ph: r() * 6.28, pal: Math.floor(r() * 4), z: lerp(0.55, 1.4, r())
    };
  }
  function initPetals() {
    var r = rng(77), n = isMobile ? 30 : 64;
    petals = [];
    for (var i = 0; i < n; i++) petals.push(spawnPetal(r, true));
  }

  function initRays() {
    var r = rng(13);
    rays = [];
    for (var i = 0; i < 12; i++) rays.push({ a: lerp(0.06, 0.94, r()) * Math.PI, w: lerp(0.015, 0.05, r()), k: lerp(0.6, 1, r()), ph: r() * 6.28 });
    for (var j = 0; j < 6; j++) rays.push({ a: -lerp(0.08, 0.92, r()) * Math.PI, w: lerp(0.01, 0.03, r()), k: lerp(0.25, 0.5, r()), ph: r() * 6.28 });
  }

  function blurPass(src, px) {
    var b = blurred(src, px);
    return b.img;
  }

  function bakeSilhouettes() {
    var w = Math.round(W * 1.4), h = Math.round(H * 0.42);
    var c = makeCanvas(w, h), g = c.getContext('2d'), r = rng(5);
    for (var i = 0; i < 90; i++) {
      var x = r() * w, rad = lerp(h * 0.06, h * 0.22, r()) * (r() < 0.15 ? 1.6 : 1);
      var y = h * 0.66 - r() * rad * 0.7;
      var gr = g.createRadialGradient(x, y, 0, x, y, rad);
      var col = r() < 0.5 ? '#6A4A50' : '#5C4048';
      gr.addColorStop(0, rgba(col, 0.95));
      gr.addColorStop(0.7, rgba(col, 0.8));
      gr.addColorStop(1, rgba(col, 0));
      g.fillStyle = gr;
      g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = 'rgba(92,64,72,0.9)';
    g.fillRect(0, h * 0.66, w, h * 0.34);
    sil = blurPass(c, Math.max(3, H * 0.006));
  }

  function bakeVignette() {
    vignette = makeCanvas(W * dpr, H * dpr);
    var g = vignette.getContext('2d');
    var cx = vignette.width / 2, cy = vignette.height * 0.52, R = Math.hypot(cx, cy);
    var gr = g.createRadialGradient(cx, cy, R * 0.35, cx, cy, R * 1.05);
    gr.addColorStop(0, 'rgba(26,10,14,0)');
    gr.addColorStop(1, 'rgba(26,10,14,0.62)');
    g.fillStyle = gr;
    g.fillRect(0, 0, vignette.width, vignette.height);
  }

  /* ---------- Çizim ---------- */
  function base() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawSprite(v, cx, cy, size, rot, alpha, anchorY) {
    if (alpha <= 0.004) return;
    var sizeH = size * v.hRatio;
    var pad = v.padRel * size;
    var cos = Math.cos(rot) * dpr, sin = Math.sin(rot) * dpr;
    ctx.globalAlpha = alpha > 1 ? 1 : alpha;
    ctx.setTransform(cos, sin, -sin, cos, cx * dpr, cy * dpr);
    ctx.drawImage(v.img, -size / 2 - pad, -sizeH * anchorY - pad, size + pad * 2, sizeH + pad * 2);
  }

  function drawSky(p) {
    var hz = HZ / H;
    var g = ctx.createLinearGradient(0, 0, 0, H);
    /* doğal altın saat: tozlu gül kurusu yükseklik → şeftali → soluk altın ufuk */
    g.addColorStop(0, mix('#46303A', '#52343A', p));
    g.addColorStop(hz * 0.45, mix('#A07070', '#B97E6E', p));
    g.addColorStop(hz * 0.78, mix('#E0AE98', '#EDBE90', p));
    g.addColorStop(hz * 0.94, mix('#F4D4B4', '#F9DDA8', p));
    g.addColorStop(hz, mix('#F9E3CC', '#FCE8C4', p));
    g.addColorStop(Math.min(1, hz + 0.035), mix('#B98C80', '#C99A7E', p));
    g.addColorStop(Math.min(1, hz + 0.2), mix('#6A4A44', '#765044', p));
    g.addColorStop(1, mix('#2A1A1E', '#30201E', p));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function drawSilhouettes(p, camX) {
    if (!sil) return;
    var sc = 1 + p * 0.12;
    var w = W * 1.4 * sc, h = H * 0.42 * sc;
    var x = W * SUN_X - w * (SUN_X + 0.2) / 1.4 - camX * 0.08;
    var y = HZ - h * 0.66 + H * 0.01;
    ctx.globalAlpha = 0.82;
    ctx.drawImage(sil, x, y, w, h);
    ctx.globalAlpha = 1;
  }

  function drawSun(p, t) {
    var sx = W * SUN_X, sy = HZ - H * 0.012;
    var glowR = Math.max(W, H) * (0.55 + 0.4 * p);
    ctx.globalCompositeOperation = 'screen';
    var g1 = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
    g1.addColorStop(0, 'rgba(255,240,214,' + (0.5 + 0.3 * p) + ')');
    g1.addColorStop(0.14, 'rgba(255,218,180,' + (0.26 + 0.22 * p) + ')');
    g1.addColorStop(0.45, 'rgba(232,170,150,' + (0.08 + 0.1 * p) + ')');
    g1.addColorStop(1, 'rgba(232,170,150,0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);
    var r = H * (0.042 + 0.03 * p) * (1 + Math.sin(t * 0.6) * 0.01);
    var g2 = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 1.7);
    g2.addColorStop(0, 'rgba(255,252,240,0.98)');
    g2.addColorStop(0.55, 'rgba(255,238,205,0.85)');
    g2.addColorStop(1, 'rgba(255,220,180,0)');
    ctx.fillStyle = g2;
    ctx.beginPath(); ctx.arc(sx, sy, r * 1.7, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawRays(p, t, mul) {
    var sx = W * SUN_X, sy = HZ - H * 0.02, len = Math.hypot(W, H) * 1.15;
    ctx.globalCompositeOperation = 'screen';
    for (var i = 0; i < rays.length; i++) {
      var ray = rays[i];
      var a = ray.a + Math.sin(t * 0.05 + ray.ph) * 0.035;
      var al = (0.035 + 0.06 * p) * ray.k * mul * (0.7 + 0.3 * Math.sin(t * 0.35 + ray.ph));
      var ex = sx + Math.cos(a) * len, ey = sy + Math.sin(a) * len;
      var g = ctx.createLinearGradient(sx, sy, ex, ey);
      g.addColorStop(0, 'rgba(255,236,206,' + al.toFixed(3) + ')');
      g.addColorStop(0.6, 'rgba(250,214,190,' + (al * 0.35).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(245,205,185,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(a - ray.w) * len, sy + Math.sin(a - ray.w) * len);
      ctx.lineTo(sx + Math.cos(a + ray.w) * len, sy + Math.sin(a + ray.w) * len);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function horizonHaze(p, alpha) {
    var g = ctx.createLinearGradient(0, HZ - H * 0.3, 0, HZ + H * 0.42);
    g.addColorStop(0, mix('#F2D2C0', '#F6DCC0', p, 0));
    g.addColorStop(0.42, mix('#F2D2C0', '#F6DCC0', p, alpha));
    g.addColorStop(1, mix('#F2D2C0', '#F6DCC0', p, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  /* Derinliğe göre flu seviyesi: odak düzlemi orta mesafede */
  /* daha geniş net bölge: güller orta mesafede keskin */
  var BLUR_D = [0, 140, 260, 380, 520, 1250, 1750, 2150];
  var BLUR_V = [3, 3, 2, 1, 0, 0, 1, 1.6];
  function blurLevel(d) {
    if (d <= BLUR_D[0]) return BLUR_V[0];
    for (var i = 1; i < BLUR_D.length; i++) {
      if (d < BLUR_D[i]) return lerp(BLUR_V[i - 1], BLUR_V[i], (d - BLUR_D[i - 1]) / (BLUR_D[i] - BLUR_D[i - 1]));
    }
    return BLUR_V[BLUR_V.length - 1];
  }

  var drawList = [];
  function drawGarden(p, t, camX, camY, camZ) {
    var gust = 0.65 + 0.35 * Math.sin(t * 0.23) * Math.sin(t * 0.71 + 1);
    var open = ease(clamp(p * 1.7, 0, 1));
    drawList.length = 0;

    for (var i = 0; i < objects.length; i++) {
      var o = objects[i];
      var d = o.fg ? o.z - camZ * 0.05 : o.z - camZ;
      if (d < NEAR) continue;
      var s = F / d;
      var x = o.x - camX;
      if (o.fg) x += (o.x < 0 ? -1 : 1) * open * (W * 0.62) * d / F;
      var sx = W / 2 + x * s + Math.sin(t * 0.8 + o.phase) * 1.6 * s;
      var sy = HZ + (o.y - camY) * s;
      var size = o.size * s * (o.fg ? 1 + open * 0.35 : 1);
      var reach = size * (o.type === 'bush' ? 0.8 : 1.3);
      if (sx < -reach || sx > W + reach || sy < -reach || sy > H + reach) continue;
      var alpha = clamp((FAR - d) / 650, 0, 1) * clamp((d - NEAR) / 70, 0, 1);
      if (alpha <= 0.01) continue;
      drawList.push({ o: o, d: d, sx: sx, sy: sy, size: size, alpha: alpha });
    }
    drawList.sort(function (a, b) { return b.d - a.d; });

    var hazeDone = false;
    for (var j = 0; j < drawList.length; j++) {
      var it = drawList[j], ob = it.o;
      if (!hazeDone && it.d < 1050) {
        base();
        horizonHaze(p, 0.32);
        hazeDone = true;
      }
      var bl = blurLevel(it.d);
      var bi = Math.floor(bl), bf = bl - bi;
      var rot = ob.rot + Math.sin(t * 1.1 + ob.phase) * ob.sway * gust;

      if (ob.type === 'bush') {
        var bset = bushSprites[ob.shape];
        drawSprite(bset[Math.max(1, Math.min(3, Math.round(bl)))], it.sx, it.sy, it.size, rot, it.alpha * 0.9, 0.5);
        continue;
      }
      /* yapraklar gülün arkasında */
      for (var l = 0; l < ob.leaves.length; l++) {
        var lf = ob.leaves[l];
        var lset = leafSprites[lf.shape];
        drawSprite(lset[Math.min(3, Math.round(bl))], it.sx, it.sy, it.size * 0.52 * lf.len, rot + lf.ang, it.alpha, 0.96);
      }
      var set = roseSprites[ob.pal][ob.shape];
      drawSprite(set[bi], it.sx, it.sy, it.size, rot, it.alpha, 0.5);
      if (bf > 0.06 && bi < 3) drawSprite(set[bi + 1], it.sx, it.sy, it.size, rot, it.alpha * bf, 0.5);
    }
    if (!hazeDone) { base(); horizonHaze(p, 0.32); }
    base();
  }

  function grade(p) {
    /* hafif sıcak ton: yapay turuncu yerine şeftali-altın, düşük doz */
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = 'rgba(252,196,150,' + (0.14 + 0.18 * p).toFixed(3) + ')';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'screen';
    var sx = W * SUN_X, sy = HZ;
    var g = ctx.createRadialGradient(sx, sy, 0, sx, sy, Math.max(W, H) * 0.7);
    g.addColorStop(0, 'rgba(255,230,200,' + (0.08 + 0.15 * p).toFixed(3) + ')');
    g.addColorStop(0.5, 'rgba(240,200,185,' + (0.03 + 0.05 * p).toFixed(3) + ')');
    g.addColorStop(1, 'rgba(240,200,185,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawBokeh(p, t) {
    ctx.globalCompositeOperation = 'screen';
    var cx = W / 2, cy = H * 0.55;
    for (var i = 0; i < bokeh.length; i++) {
      var b = bokeh[i];
      var ex = 1 + p * b.z * 0.9;
      var bx = ((b.x + Math.sin(t * 0.07 * b.sp + b.ph) * 0.02) - 0.5) * W * ex + cx;
      var yy = ((b.y - t * 0.006 * b.sp) % 1 + 1) % 1;
      var by = (yy - 0.55) * H * ex + cy;
      var size = b.size * (0.55 + 0.8 * b.z) * (1 + p * 0.6) * (isMobile ? 0.8 : 1);
      if (bx < -size || bx > W + size || by < -size || by > H + size) continue;
      var tw = Math.sin(t * (0.6 + b.sp) + b.ph);
      var a = (0.22 + 0.5 * p) * (0.55 + 0.45 * tw * tw);
      ctx.globalAlpha = a;
      var img = b.spark ? sparkSprite : bokehSprite;
      var sz = b.spark ? size * 0.45 : size;
      ctx.drawImage(img, bx - sz / 2, by - sz / 2, sz, sz);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  function updatePetals(dt, t, scrollVel) {
    var gust = 0.7 + 0.5 * Math.sin(t * 0.3) * Math.sin(t * 0.83 + 2);
    var R = isMobile ? 140 : 200;
    for (var i = 0; i < petals.length; i++) {
      var q = petals[i];
      var tvx = q.base * gust * q.z;
      var tvy = q.fall * q.z + Math.sin(t * 1.3 + q.ph) * 14;
      var k = Math.min(1, dt * 1.4);
      q.vx += (tvx - q.vx) * k;
      q.vy += (tvy - q.vy) * k;
      /* imleç esintisi */
      if (pointer.inside) {
        var dx = q.x - pointer.x, dy = q.y - pointer.y, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < R) {
          var f = (1 - dist / R); f *= f;
          q.vx += (pointer.vx * 0.9 + dx * 2) * f * dt * 3;
          q.vy += (pointer.vy * 0.9 + dy * 2) * f * dt * 3;
          q.vr += (pointer.vx > 0 ? 1 : -1) * f * dt * 6;
        }
      }
      /* ileri hareket: yapraklar merkezden dışa doğru açılır */
      q.vx += (q.x - W / 2) * scrollVel * 1.4 * dt * 60 * 0.02;
      q.vy += (q.y - H * 0.5) * scrollVel * 1.4 * dt * 60 * 0.02;
      q.vr *= 0.995;
      q.x += q.vx * dt; q.y += q.vy * dt;
      q.rot += q.vr * dt; q.flip += q.vf * dt;
      if (q.x > W + 60) { q.x = -50; q.y = Math.random() * H * 0.85; }
      else if (q.x < -160) { q.x = W + 40; q.y = Math.random() * H * 0.85; }
      if (q.y > H + 60) { q.y = -40; q.x = Math.random() * W; }
      else if (q.y < -160) { q.y = H + 40; }
    }
  }

  function drawPetals() {
    for (var i = 0; i < petals.length; i++) {
      var q = petals[i];
      var img = petalSprites[q.pal];
      var s = q.size * q.z;
      var fx = Math.cos(q.flip);
      fx = (fx < 0 ? -1 : 1) * Math.max(0.18, Math.abs(fx));
      var c = Math.cos(q.rot) * dpr, sn = Math.sin(q.rot) * dpr;
      ctx.globalAlpha = 0.92;
      ctx.setTransform(c * fx, sn * fx, -sn, c, q.x * dpr, q.y * dpr);
      ctx.drawImage(img, -s / 2, -s / 2, s, s);
    }
    base();
  }

  function render(p, t) {
    var camZ = p * TRAVEL + (reduced ? 0 : Math.sin(t * 0.2) * 6);
    var camX = Math.sin(p * Math.PI * 1.2) * 30 + (reduced ? 0 : Math.sin(t * 0.15) * 8);
    var camY = -p * 26;
    base();
    drawSky(p);
    drawSilhouettes(p, camX);
    drawSun(p, t);
    drawRays(p, t, 1);
    drawGarden(p, t, camX, camY, camZ);
    grade(p);
    drawRays(p, t, 0.45);
    drawBokeh(p, t);
    drawPetals();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(vignette, 0, 0);
    base();
  }

  /* ---------- Döngü ---------- */
  var running = false, visible = true, raf = 0, last = 0;

  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    state.t += dt;
    state.p += (state.target - state.p) * Math.min(1, dt * 7);
    var scrollVel = (state.p - state.prevP) / Math.max(dt, 0.001);
    state.prevP = state.p;
    pointer.vx *= 0.9; pointer.vy *= 0.9;
    updatePetals(dt, state.t, scrollVel);
    render(state.p, state.t);
    raf = requestAnimationFrame(frame);
  }
  function start() {
    if (running || reduced) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  /* ---------- Boyut ---------- */
  var lastW = 0, lastH = 0;
  function resize(force) {
    var rect = canvas.getBoundingClientRect();
    var w = Math.max(1, rect.width), h = Math.max(1, rect.height);
    if (!force && Math.abs(w - lastW) < 1 && Math.abs(h - lastH) < 1) return;
    lastW = w; lastH = h;
    W = w; H = h;
    isMobile = W < 720;
    var maxPx = isMobile ? 1.3e6 : 2.4e6;
    dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(maxPx / (W * H)));
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    F = H * (isMobile ? 0.8 : 0.9);
    HZ = H * (isMobile ? 0.5 : 0.47);
    SUN_X = isMobile ? 0.6 : 0.64;
    var S = isMobile ? 200 : 300;
    if (S !== bakedS) { bakeSprites(S); bakedS = S; initPetals(); }
    buildScene();
    initBokeh();
    if (!rays.length) initRays();
    bakeSilhouettes();
    bakeVignette();
    if (!running) render(state.p, state.t);
  }

  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { resize(false); }, 140);
  });

  /* ---------- İmleç esintisi ---------- */
  window.addEventListener('pointermove', function (e) {
    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left, y = e.clientY - rect.top;
    var now = performance.now();
    var dt = Math.max(8, now - pointer.lastT) / 1000;
    if (pointer.inside) {
      pointer.vx = clamp((x - pointer.x) / dt, -2400, 2400);
      pointer.vy = clamp((y - pointer.y) / dt, -2400, 2400);
    }
    pointer.x = x; pointer.y = y; pointer.lastT = now;
    pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
  }, { passive: true });
  document.addEventListener('pointerleave', function () { pointer.inside = false; });

  /* ---------- Görünürlük ---------- */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible && !document.hidden) start(); else stop();
    }).observe(canvas);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else if (visible) start();
  });

  /* ---------- API ---------- */
  window.RoseGarden = {
    setProgress: function (v) {
      state.target = clamp(v, 0, 1);
      if (reduced || !running) {
        state.p = state.target;
        state.prevP = state.p;
        render(state.p, state.t);
      }
    },
    get progress() { return state.p; }
  };

  resize(true);
  start();
})();
