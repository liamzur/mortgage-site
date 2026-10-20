/* site-nav.js — התנהגות התפריט העליון האחיד (ראו site-nav.css) */
(function () {
  var header = document.getElementById('lzHeader');
  var drawer = document.getElementById('lzDrawer');
  if (!header) return;
  var burger = document.getElementById('lzBurger');
  var root = document.documentElement;

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
  document.querySelectorAll('.lz-header a[href*="#"], .lz-drawer a[href*="#"]').forEach(function (a) {
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
