/* site-nav.js — התנהגות התפריט העליון האחיד (ראו site-nav.css) */
(function () {
  var header = document.getElementById('lzHeader');
  var drawer = document.getElementById('lzDrawer');
  if (!header) return;
  var burger = document.getElementById('lzBurger');
  var root = document.documentElement;

  /* ── mobile action bar: call / WhatsApp / free consult (shown ≤768px, see site-nav.css) ── */
  var mbar = document.querySelector('.lz-mbar');
  if (!mbar) {
    var icon = function (sel) { var s = drawer && drawer.querySelector(sel + ' svg'); return s ? s.outerHTML : ''; };
    mbar = document.createElement('div');
    mbar.className = 'lz-mbar';
    mbar.setAttribute('role', 'navigation');
    mbar.setAttribute('aria-label', 'יצירת קשר מהירה');
    mbar.innerHTML =
      '<a class="lz-mbar-tel" href="tel:+972523434916" aria-label="התקשרו 052-343-4916">' + icon('.lz-dcontact a[href^="tel"]') + '<span dir="ltr">052-343-4916</span></a>' +
      '<a class="lz-mbar-wa" href="https://wa.me/972523434916?text=' + encodeURIComponent('היי ליאם, אשמח לייעוץ משכנתא') + '" target="_blank" rel="noopener" aria-label="וואטסאפ">' + icon('.lz-dcontact a[href*="wa.me"]') + '</a>' +
      '<a class="lz-mbar-main" href="/#contact">ייעוץ ראשוני חינם</a>';
    document.body.appendChild(mbar);
  }
  root.classList.add('lz-has-mbar');
  /* step aside while the contact form is on screen or a field is being typed in */
  var mHide = { form: false, typing: false };
  function mPaint() { mbar.classList.toggle('is-hidden', mHide.form || mHide.typing); }
  var contact = document.getElementById('contact');
  if (contact && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { mHide.form = es[0].isIntersecting; mPaint(); }, { threshold: 0.15 }).observe(contact);
  }
  document.addEventListener('focusin', function (e) { if (e.target.matches('input,textarea,select')) { mHide.typing = true; mPaint(); } });
  document.addEventListener('focusout', function (e) { if (e.target.matches('input,textarea,select')) { mHide.typing = false; mPaint(); } });

  /* ── quick lead form: step 1 topic, step 2 name + phone (sheet from any "/#contact" link + inline mounts) ──
     Same two channels as every lead form on the site: email (Web3Forms) + WhatsApp alert (/api/lead).
     The lead counts as received if at least one succeeds, then the visitor goes to /thanks. */
  var TOPICS = ['משכנתא חדשה', 'מחזור משכנתא', 'איחוד הלוואות', 'דירה מקבלן', 'משהו אחר'];
  var leadSeq = 0;
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function buildLead(box, where) {
    var id = 'lzl' + (++leadSeq);
    box.classList.add('lzl');
    box.innerHTML =
      '<form class="lzl-form" novalidate>' +
        '<div class="lzl-steps" aria-hidden="true"><i class="on"></i><i></i></div>' +
        '<div class="lzl-step lzl-s1">' +
          '<p class="lzl-q" id="' + id + 'q">במה אפשר לעזור?</p>' +
          '<div class="lzl-chips" role="group" aria-labelledby="' + id + 'q">' +
            TOPICS.map(function (t) { return '<button type="button" class="lzl-chip" aria-pressed="false">' + esc(t) + '</button>'; }).join('') +
          '</div>' +
          '<p class="lzl-fine">שיחה ראשונה ללא עלות וללא התחייבות</p>' +
        '</div>' +
        '<div class="lzl-step lzl-s2" hidden>' +
          '<p class="lzl-q lzl-q2" tabindex="-1"></p>' +
          '<label class="lzl-label" for="' + id + 'n">שם מלא</label>' +
          '<input class="lzl-in" id="' + id + 'n" name="name" type="text" autocomplete="name" required>' +
          '<label class="lzl-label" for="' + id + 'p">טלפון</label>' +
          '<input class="lzl-in" id="' + id + 'p" name="phone" type="tel" inputmode="tel" autocomplete="tel" dir="ltr" required>' +
          '<input type="checkbox" name="botcheck" class="lzl-hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
          '<p class="lzl-err" role="alert" hidden></p>' +
          '<button type="submit" class="lzl-go">שלחו, ליאם יחזור אליכם</button>' +
          '<div class="lzl-row"><button type="button" class="lzl-back">חזרה לבחירת נושא</button><span class="lzl-fine">הפרטים נשארים אצלי</span></div>' +
        '</div>' +
      '</form>';
    var form = box.querySelector('form'), s1 = box.querySelector('.lzl-s1'), s2 = box.querySelector('.lzl-s2');
    var dots = box.querySelectorAll('.lzl-steps i'), q2 = box.querySelector('.lzl-q2'), err = box.querySelector('.lzl-err');
    var go = box.querySelector('.lzl-go'), topic = '';
    function step(n) {
      s1.hidden = n !== 1; s2.hidden = n !== 2; dots[1].classList.toggle('on', n === 2);
      if (n === 2) { q2.textContent = topic + '. לאן לחזור אליכם?'; setTimeout(function () { box.querySelector('input[name="name"]').focus({ preventScroll: true }); }, 30); }
      else { var on = s1.querySelector('[aria-pressed="true"]') || s1.querySelector('.lzl-chip'); setTimeout(function () { on.focus({ preventScroll: true }); }, 30); }
    }
    s1.querySelectorAll('.lzl-chip').forEach(function (c) {
      c.addEventListener('click', function () {
        s1.querySelectorAll('.lzl-chip').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        c.setAttribute('aria-pressed', 'true'); topic = c.textContent; step(2);
      });
    });
    box.querySelector('.lzl-back').addEventListener('click', function () { step(1); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim(), phone = form.phone.value.trim(), digits = phone.replace(/\D/g, '');
      err.hidden = true;
      if (name.length < 2) { err.textContent = 'נא לכתוב שם.'; err.hidden = false; form.name.focus(); return; }
      if (digits.length < 9 || digits.length > 12) { err.textContent = 'נא לכתוב מספר טלפון מלא, למשל 050-1234567.'; err.hidden = false; form.phone.focus(); return; }
      var bot = form.botcheck.checked, page = location.pathname;
      go.disabled = true; go.textContent = 'שולח...';
      var fd = new FormData();
      fd.append('access_key', '53582e2d-6806-460d-9881-3197dd6bedaf');
      fd.append('subject', 'בקשת ייעוץ ראשוני חינם — ליאם צור משכנתאות');
      fd.append('from_name', 'אתר ליאם צור משכנתאות');
      fd.append('form', 'טופס מהיר (' + where + ')');
      fd.append('name', name); fd.append('phone', phone); fd.append('service_type', topic); fd.append('page', page);
      if (bot) fd.append('botcheck', 'on');
      var email = fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd })
        .then(function (r) { return r.json(); }).then(function (j) { return !!j.success; }, function () { return false; });
      var wa = fetch('/api/lead', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form: 'טופס מהיר (' + where + ')', name: name, phone: phone, service_type: topic, source: page, botcheck: bot })
      }).then(function (r) { return r.json().then(function (j) { return !!(r.ok && j.ok); }); }).catch(function () { return false; });
      Promise.all([email, wa]).then(function (r) {
        if (!(r[0] || r[1])) throw new Error('send');
        try { sessionStorage.setItem('lead_form_data', JSON.stringify({ first_name: name, phone: phone, service_type: topic })); } catch (x) {}
        location.href = '/thanks';
      }).catch(function () {
        err.innerHTML = 'השליחה לא הצליחה. נסו שוב, או התקשרו ישירות: <a href="tel:+972523434916" dir="ltr">052-343-4916</a>';
        err.hidden = false; go.disabled = false; go.textContent = 'שלחו, ליאם יחזור אליכם';
      });
    });
    return { reset: function () { step(1); } };
  }
  document.querySelectorAll('[data-lz-lead]').forEach(function (b) { buildLead(b, b.getAttribute('data-lz-lead') || 'עמוד'); });

  var sheet = null, sheetApi = null, lastFocus = null;
  function openSheet() {
    if (!sheet) {
      sheet = document.createElement('div');
      sheet.className = 'lzl-sheet';
      sheet.innerHTML = '<div class="lzl-scrim"></div><div class="lzl-panel" role="dialog" aria-modal="true" aria-labelledby="lzlTitle">' +
        '<div class="lzl-grab" aria-hidden="true"></div>' +
        '<button type="button" class="lzl-x" aria-label="סגירה">×</button>' +
        '<h2 class="lzl-title" id="lzlTitle">ייעוץ ראשוני <span>ללא עלות</span></h2>' +
        '<div class="lzl-mount"></div>' +
        '<p class="lzl-or">מעדיפים לדבר? <a href="tel:+972523434916" dir="ltr">052-343-4916</a></p></div>';
      document.body.appendChild(sheet);
      sheetApi = buildLead(sheet.querySelector('.lzl-mount'), 'חלון');
      sheet.querySelector('.lzl-scrim').addEventListener('click', closeSheet);
      sheet.querySelector('.lzl-x').addEventListener('click', closeSheet);
      sheet.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { closeSheet(); return; }
        if (e.key !== 'Tab') return;
        var f = [].filter.call(sheet.querySelectorAll('button,input,a[href]'), function (el) { return el.offsetParent !== null && !el.classList.contains('lzl-hp'); });
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      });
      sheet.offsetHeight; // allow the opening transition
    }
    lastFocus = document.activeElement;
    sheetApi.reset();
    sheet.classList.add('is-open');
    document.body.classList.add('lz-locked');
    if (typeof gtag === 'function') gtag('event', 'open_lead_sheet', { event_category: 'contact', event_label: location.pathname });
  }
  function closeSheet() {
    if (!sheet) return;
    sheet.classList.remove('is-open');
    document.body.classList.remove('lz-locked');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  /* every link to the contact section opens the sheet instead of jumping to the home page form */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.closest('.lzl-sheet')) return;
    var u; try { u = new URL(a.getAttribute('href'), location.href); } catch (x) { return; }
    if (u.hash !== '#contact' || u.pathname.replace(/index\.html$/, '') !== '/' || !/liamzur\.co\.il$|^localhost$|^127\.0\.0\.1$/.test(u.hostname) && u.hostname !== location.hostname) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (typeof setDrawer === 'function') setDrawer(false);
    openSheet();
  }, true);

  /* ── current page ── */
  var path = location.pathname.replace(/index\.html$/, '').replace(/\.html$/, '');
  if (path.length > 1) path = path.replace(/\/$/, '');
  function norm(href) {
    try {
      var u = new URL(href, location.href);
      if (u.hash && u.pathname.replace(/index\.html$/, '') === '/') return null; // section links on the home page
      var p = u.pathname.replace(/index\.html$/, '').replace(/\.html$/, '');
      return p.length > 1 ? p.replace(/\/$/, '') : p;
    } catch (e) { return null; }
  }
  var inBlog = path.indexOf('/blog') === 0;
  document.querySelectorAll('.lz-header a[href], .lz-drawer a[href]').forEach(function (a) {
    var p = norm(a.getAttribute('href'));
    if (p && p !== '/' && (p === path || (p === '/blog' && inBlog))) {
      a.setAttribute('aria-current', 'page');
      var drop = a.closest('.lz-drop');
      if (drop) drop.querySelector('.lz-drop-btn').classList.add('is-current');
    }
  });

  /* ── scrolled state ── */
  var ticking = false, last = null;
  function paint() {
    ticking = false;
    var s = window.scrollY > 24;
    if (s !== last) { last = s; header.classList.toggle('is-scrolled', s); }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
  paint();

  /* ── tools dropdown (hover on desktop, click/keyboard everywhere) ── */
  document.querySelectorAll('.lz-drop').forEach(function (drop) {
    var btn = drop.querySelector('.lz-drop-btn');
    var timer;
    function set(open) { drop.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); }
    btn.addEventListener('click', function (e) { e.stopPropagation(); set(!drop.classList.contains('is-open')); });
    drop.addEventListener('mouseenter', function () { if (matchMedia('(hover:hover)').matches) { clearTimeout(timer); set(true); } });
    drop.addEventListener('mouseleave', function () { if (matchMedia('(hover:hover)').matches) { timer = setTimeout(function () { set(false); }, 160); } });
    drop.addEventListener('keydown', function (e) { if (e.key === 'Escape') { set(false); btn.focus(); } });
    drop.addEventListener('focusout', function (e) { if (!drop.contains(e.relatedTarget)) set(false); });
    document.addEventListener('click', function (e) { if (!drop.contains(e.target)) set(false); });
  });

  /* ── mobile drawer ── */
  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('is-open', open);
    header.classList.toggle('is-open', open);
    document.body.classList.toggle('lz-locked', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'סגירת התפריט' : 'פתיחת התפריט');
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) { var first = drawer.querySelector('a'); if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 60); }
  }
  if (burger) burger.addEventListener('click', function () { setDrawer(!drawer.classList.contains('is-open')); });
  if (drawer) {
    drawer.querySelector('.lz-scrim').addEventListener('click', function () { setDrawer(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer.classList.contains('is-open')) { setDrawer(false); burger.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 1060 && drawer.classList.contains('is-open')) setDrawer(false); });
  }

  /* ── same-page section links: smooth scroll under the fixed bar ── */
  document.querySelectorAll('.lz-header a[href*="#"], .lz-drawer a[href*="#"], .lz-mbar a[href*="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var u; try { u = new URL(a.getAttribute('href'), location.href); } catch (x) { return; }
      var here = u.pathname.replace(/index\.html$/, '') === location.pathname.replace(/index\.html$/, '');
      if (!here || !u.hash) { setDrawer(false); return; }
      var target = document.getElementById(decodeURIComponent(u.hash.slice(1)));
      if (!target) return;
      e.preventDefault();
      setDrawer(false);
      var y = target.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 8;
      if (window.__lenis) window.__lenis.scrollTo(y); else window.scrollTo({ top: y, behavior: 'smooth' });
      history.replaceState(null, '', u.hash);
    });
  });

  /* ── theme toggle (same storage key the site already uses) ── */
  var tbtn = document.getElementById('lzTheme');
  if (tbtn) tbtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('lz-theme', next); } catch (e) {}
    var icon = document.getElementById('themeIcon'); // legacy icon on some pages
    if (icon) icon.textContent = next === 'dark' ? '🌙' : '☀️';
    tbtn.setAttribute('aria-pressed', next === 'light' ? 'true' : 'false');
  });
  if (!root.getAttribute('data-theme')) root.setAttribute('data-theme', 'dark');
})();
