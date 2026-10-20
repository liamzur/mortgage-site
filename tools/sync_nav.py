#!/usr/bin/env python3
"""
sync_nav.py — מכניס את התפריט העליון האחיד לכל עמודי האתר.

שימוש (מתיקיית האתר):   python3 tools/sync_nav.py
- מחליף את התפריט הישן (<nav> + מגירת המובייל) בתפריט אחד, זהה בכל עמוד.
- בהרצה חוזרת מעדכן רק את הבלוק שבין הסימונים LZ-NAV, כך שאפשר לשנות
  כאן קישור אחד ולהריץ שוב.
- עמוד חדש? פשוט להריץ שוב, והוא יקבל את התפריט.
העיצוב: site-nav.css | ההתנהגות: site-nav.js
"""
import glob, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VERSION = '4'
SKIP = {'card.html'}                       # כרטיס הביקור הדיגיטלי — בלי תפריט אתר
# עמודים שהתפריט הישן שלהם היה "דביק" (חלק מזרימת העמוד) — צריכים מרווח מתחת לבר הקבוע
SPACER = {'calculator.html', 'michzur.html', 'blog/mashkanta-binyan-atzmit.html', 'blog/yoetz-mashkanta.html'}

MAIN = [('/#services', 'שירותים'), ('/#why', 'למה אני'), ('/#process', 'תהליך'),
        ('/#testimonials', 'לקוחות'), ('/blog/', 'בלוג'), ('/faq.html', 'שאלות נפוצות')]
TOOLS = [('/michzur.html', 'בדיקת מחזור', '5 שאלות, 30 שניות: כדאי לך למחזר?', True),
         ('/calculator.html', 'מחשבון משכנתא', 'החזר חודשי וסך הריבית לפי סכום ושנים', False),
         ('/glossary.html', 'מילון מונחים', 'כל מושגי המשכנתא בשפה פשוטה', False)]
CTA = ('/#contact', 'ייעוץ ראשוני חינם')

LOGO = '''<svg viewBox="0 0 296 116" aria-hidden="true" focusable="false">
        <line class="lz-logo-line" x1="148" y1="4" x2="96" y2="40" stroke-width="3.5" stroke-linecap="round"/>
        <line class="lz-logo-line" x1="148" y1="4" x2="200" y2="40" stroke-width="3.5" stroke-linecap="round"/>
        <line class="lz-logo-line" x1="78" y1="40" x2="218" y2="40" stroke-width="2"/>
        <rect class="lz-logo-line" x="138" y="15" width="20" height="17" stroke-width="2.5"/>
        <text class="lz-logo-ink" x="148" y="75" text-anchor="middle" font-family="'Heebo',Georgia,serif" font-size="30" font-weight="700" letter-spacing="6">LIAM ZUR</text>
        <text class="lz-logo-gold" x="148" y="100" text-anchor="middle" font-family="Georgia,serif" font-size="11.5" letter-spacing="5.5">MORTGAGE ADVISOR</text>
      </svg>'''

WA_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.27-.2-.57-.35zM12.05 21.8h-.01a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 01-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 012.89 6.99c0 5.45-4.44 9.88-9.88 9.88zm8.41-18.3A11.82 11.82 0 0012.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 005.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 00-3.48-8.41z"/></svg>'
TEL_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 013 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/></svg>'

def build(spacer):
    new = '<span class="lz-new">חדש</span>'
    main = '\n'.join(f'      <li><a class="lz-link" href="{h}">{t}</a></li>' for h, t in MAIN)
    tools = '\n'.join(
        f'          <li><a href="{h}"><span class="lz-mt">{t}{" " + new if n else ""}</span><span class="lz-md">{d}</span></a></li>'
        for h, t, d, n in TOOLS)
    dmain = '\n'.join(f'      <a class="lz-dlink" href="{h}">{t}</a>' for h, t in MAIN)
    dtools = '\n'.join(f'      <a class="lz-dlink" href="{h}">{t}{new if n else ""}</a>' for h, t, d, n in TOOLS)
    return f'''<!-- LZ-NAV:START — נוצר ע"י tools/sync_nav.py, לא לערוך ידנית -->
<div class="lz-header" id="lzHeader" role="banner">
  <div class="lz-inner">
    <a class="lz-logo" href="/" aria-label="ליאם צור — יועץ משכנתאות, לדף הבית">
      {LOGO}
    </a>
    <div class="lz-navwrap" role="navigation" aria-label="תפריט ראשי"><ul class="lz-links">
{main}
      <li class="lz-drop">
        <button class="lz-drop-btn" type="button" aria-expanded="false" aria-haspopup="true">כלים <svg class="lz-caret" viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 3.5L5 7l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <ul class="lz-menu">
{tools}
        </ul>
      </li>
    </ul></div>
    <div class="lz-actions">
      <a class="lz-cta" href="{CTA[0]}">{CTA[1]}</a>
      <button class="lz-theme" id="lzTheme" type="button" aria-label="מצב כהה או בהיר" title="מצב כהה / בהיר">
        <svg class="lz-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>
        <svg class="lz-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.2M12 19.8V22M2 12h2.2M19.8 12H22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"/></svg>
      </button>
      <button class="lz-burger" id="lzBurger" type="button" aria-label="פתיחת התפריט" aria-expanded="false" aria-controls="lzDrawer"><span></span><span></span><span></span></button>
    </div>
  </div>
</div>
<div class="lz-drawer" id="lzDrawer" aria-hidden="true">
  <div class="lz-scrim"></div>
  <div class="lz-panel" role="dialog" aria-modal="true" aria-label="תפריט">
    <div class="lz-dgroup" role="navigation" aria-label="עמודים">
{dmain}
    </div>
    <div class="lz-dsep"></div>
    <div class="lz-dgroup" role="group" aria-label="כלים">
      <span class="lz-dlabel">כלים</span>
{dtools}
    </div>
    <a class="lz-dcta" href="{CTA[0]}">{CTA[1]}</a>
    <div class="lz-dcontact">
      <a href="tel:+972523434916">{TEL_ICON}052-343-4916</a>
      <a href="https://wa.me/972523434916" target="_blank" rel="noopener">{WA_ICON}וואטסאפ</a>
    </div>
    <a class="lz-dmail" href="mailto:liamzur89@gmail.com">liamzur89@gmail.com</a>
  </div>
</div>
{'<div class="lz-nav-spacer" aria-hidden="true"></div>' + chr(10) if spacer else ''}<!-- LZ-NAV:END -->'''

def cut_balanced(h, start_pat, tag):
    m = re.search(start_pat, h)
    if not m:
        return h, False
    i = m.start(); depth = 0
    for t in re.finditer(rf'<{tag}\b|</{tag}>', h[i:]):
        depth += 1 if not t.group(0).startswith('</') else -1
        if depth == 0:
            end = i + t.end()
            # swallow one preceding comment line like <!-- MOBILE DRAWER -->
            pre = re.search(r'<!--[^>]{0,60}-->\s*$', h[:i])
            s = pre.start() if pre else i
            return h[:s] + h[end:], True
    raise ValueError('unbalanced ' + tag)


def drop_legacy_menu_js(h):
    """הסרת סקריפטים של התפריט הישן שאינם מוגנים — הם זורקים שגיאה כשהאלמנטים הוסרו."""
    def only_menu(code):
        c = re.sub(r'\s+', ' ', code).strip()
        if not re.search(r"getElementById\(['\"](hamburger|mobileMenu)['\"]\)", c):
            return False
        if re.search(r'if\s*\(\s*!hb|if\s*\(hb\)', c):          # already guarded: harmless, keep
            return False
        if len(c) < 600 and re.match(r"const\s+\w+\s*=\s*document\.getElementById\('hamburger'\)", c) and 'cookie' not in c.lower() and 'fetch' not in c:
            return True
        # nothing else of value in the block
        rest = re.sub(r"(const|let|var)[^;]*getElementById\([^)]*\)[^;]*;|[\w.]+\.addEventListener\([\s\S]*?\)\s*\)?\s*;|[\w.]+\.querySelectorAll\([^)]*\)\.forEach\([\s\S]*?\)\)\s*\)?\s*;", '', c)
        return len(rest.strip(' ;')) < 40
    h = re.sub(r'\n?<script>([\s\S]*?)</script>', lambda m: '' if only_menu(m.group(1)) else m.group(0), h)
    h = re.sub(r"document\.querySelector\('\.hamburger'\)\.addEventListener\('click',function\(\)\{document\.getElementById\('navbar'\)\.classList\.toggle\('nav-open'\);this\.classList\.toggle\('active'\);\}\);\n?", '', h)
    return h

def process(rel):
    p = os.path.join(ROOT, rel)
    h = open(p, encoding='utf-8').read()
    orig = h
    block = build(rel in SPACER)
    if 'LZ-NAV:START' in h:
        h = re.sub(r'<!-- LZ-NAV:START[\s\S]*?<!-- LZ-NAV:END -->', lambda m: block, h, count=1)
    else:
        m = re.search(r'<nav\b[\s\S]*?</nav>', h)
        if not m:
            print('  ! no <nav> in', rel); return False
        pre = re.search(r'<!--[^>]{0,40}(?:NAV|nav)[^>]{0,20}-->\s*$', h[:m.start()])
        s = pre.start() if pre else m.start()
        h = h[:s] + '\u0000NAV\u0000' + h[m.end():]
        h, _ = cut_balanced(h, r'<div class="mobile-menu"', 'div')
        h = h.replace('\u0000NAV\u0000', block, 1)
    h = drop_legacy_menu_js(h)
    css = f'<link rel="stylesheet" href="/site-nav.css?v={VERSION}">'
    js = f'<script src="/site-nav.js?v={VERSION}" defer></script>'
    h = re.sub(r'<link rel="stylesheet" href="/site-nav\.css[^"]*">', css, h)
    h = re.sub(r'<script src="/site-nav\.js[^"]*" defer></script>', js, h)
    if css not in h:
        h = h.replace('</head>', f'  {css}\n</head>', 1)
    if js not in h:
        h = h.replace('</head>', f'  {js}\n</head>', 1)
    if h != orig:
        open(p, 'w', encoding='utf-8').write(h)
        return True
    return False

if __name__ == '__main__':
    os.chdir(ROOT)
    pages = sorted(glob.glob('*.html') + glob.glob('blog/*.html') + glob.glob('ezor/*.html'))
    changed = [p for p in pages if p not in SKIP and process(p)]
    print(f'updated {len(changed)} page(s)')
    for p in changed: print('  ', p)
