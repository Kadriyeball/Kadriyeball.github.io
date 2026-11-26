/* ==========================================================================
   Alt sayfa davranışları
   - .bars        : görünür olunca dolan yetenek çubukları (hakkimda.html)
   - [data-lightbox] : tıklayınca büyüyen galeri (galeri.html)
   - #contact-form : doğrulamalı iletişim formu (iletisim.html)
   ========================================================================== */
(function () {
  'use strict';

  var I18n = window.I18n;
  var P = window.SITE_PROFILE || {};
  function t(k) { return I18n ? I18n.t(k) : k; }

  /* ---------- 1. İlerleme çubukları ---------- */
  document.querySelectorAll('.bars').forEach(function (group) {
    if (!('IntersectionObserver' in window)) { group.classList.add('is-in'); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { group.classList.add('is-in'); io.disconnect(); }
      });
    }, { threshold: 0.35 });
    io.observe(group);
  });

  /* ---------- 2. Lightbox ---------- */
  var dialog = document.getElementById('lightbox');
  if (dialog) {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
    var img = dialog.querySelector('.lightbox__frame img');
    var cap = dialog.querySelector('.lightbox__cap strong');
    var desc = dialog.querySelector('.lightbox__desc');
    var count = dialog.querySelector('.lightbox__count');
    var index = 0, opener = null;

    function show(i) {
      index = (i + items.length) % items.length;
      var it = items[index];
      var src = it.getAttribute('data-src');
      img.classList.remove('is-broken');
      img.removeAttribute('src');
      img.alt = t(it.getAttribute('data-cap'));
      img.src = src;
      cap.textContent = t(it.getAttribute('data-cap'));
      desc.textContent = t(it.getAttribute('data-desc'));
      count.textContent = (index + 1) + ' / ' + items.length;
    }
    function open(i, from) {
      opener = from || null;
      show(i);
      if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
      document.documentElement.classList.add('lb-lock');
      if (window.lenis) window.lenis.stop();
    }
    function close() {
      if (dialog.open && typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open');
    }
    dialog.addEventListener('close', function () {
      document.documentElement.classList.remove('lb-lock');
      if (window.lenis) window.lenis.start();
      if (opener) opener.focus();
    });

    items.forEach(function (it, i) {
      it.addEventListener('click', function () { open(i, it); });
    });
    dialog.querySelector('.lb-close').addEventListener('click', close);
    dialog.querySelector('.lb-prev').addEventListener('click', function () { show(index - 1); });
    dialog.querySelector('.lb-next').addEventListener('click', function () { show(index + 1); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) close(); });
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
    });
    /* dokunmatik kaydırma ile gezinme */
    var sx = null;
    dialog.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    dialog.addEventListener('touchend', function (e) {
      if (sx == null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      sx = null;
    });
    document.addEventListener('langchange', function () { if (dialog.open) show(index); });
  }

  /* ---------- 3. İletişim formu ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    var status = form.querySelector('.form__status');
    var submit = form.querySelector('[type="submit"]');
    var submitLabel = submit.querySelector('span');
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var rules = {
      name: function (v) { return v.trim().length >= 3; },
      email: function (v) { return EMAIL_RE.test(v.trim()); },
      subject: function (v) { return v.trim().length >= 3; },
      message: function (v) { return v.trim().length >= 10; }
    };
    var touched = {};

    function field(name) { return form.elements[name]; }
    function check(name) {
      var el = field(name);
      var ok = rules[name](el.value);
      var err = document.getElementById(el.getAttribute('aria-describedby').split(' ')[0]);
      el.setAttribute('aria-invalid', String(!ok));
      err.textContent = ok ? '' : t('co.err.' + name);
      return ok;
    }
    Object.keys(rules).forEach(function (name) {
      var el = field(name);
      el.addEventListener('blur', function () { touched[name] = true; check(name); });
      el.addEventListener('input', function () { if (touched[name]) check(name); });
    });
    document.addEventListener('langchange', function () {
      Object.keys(touched).forEach(check);
      if (status.dataset.key) status.textContent = t(status.dataset.key);
    });

    function setStatus(kind, key) {
      status.className = 'form__status is-' + kind;
      status.dataset.key = key;
      status.textContent = t(key);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      Object.keys(rules).forEach(function (name) {
        touched[name] = true;
        if (!check(name) && !firstBad) firstBad = field(name);
      });
      if (firstBad) {
        setStatus('error', 'co.err.summary');
        firstBad.focus();
        return;
      }
      if (form.elements.website && form.elements.website.value) return; /* bot tuzağı */

      var data = {
        name: field('name').value.trim(),
        email: field('email').value.trim(),
        subject: field('subject').value.trim(),
        message: field('message').value.trim()
      };

      if (!P.formEndpoint) {
        /* Sunucu tanımlı değil: e-posta uygulamasını hazır mesajla aç */
        var body = data.message + '\n\n' + data.name + ' <' + data.email + '>';
        window.location.href = 'mailto:' + encodeURIComponent(P.email || '') +
          '?subject=' + encodeURIComponent(data.subject) +
          '&body=' + encodeURIComponent(body);
        setStatus('info', 'co.mailto');
        return;
      }

      submit.disabled = true;
      submitLabel.textContent = t('co.f.sending');
      fetch(P.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        setStatus('ok', 'co.ok');
        form.reset();
        touched = {};
        Object.keys(rules).forEach(function (n) { field(n).removeAttribute('aria-invalid'); });
      }).catch(function () {
        setStatus('error', 'co.fail');
      }).then(function () {
        submit.disabled = false;
        submitLabel.textContent = t('co.f.send');
      });
    });
  }
})();
