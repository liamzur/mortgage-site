# CLAUDE.md — הקשר לפרויקט liamzur.co.il

## מי אני ומה הפרויקט
שמי **ליאם צור**, יועץ משכנתאות מורשה ישראלי.  
האתר: **https://liamzur.co.il**  
GitHub: **https://github.com/liamzur/mortgage-site**  
Hosting: **Vercel**, פרויקט `mortgage-site` (team `team_m1M3YUUoP43dXzPvDBpowmo6`, project `prj_HOHXLTO0PAh3RabrAoOeVCQOCp6d`)  
טלפון: 052-343-4916

## ארכיטקטורת האתר
- **סטטי לחלוטין** — HTML/CSS/JS בלבד, ללא framework
- **Vercel** — hosting + CDN. כל push ל-`main` עולה לאתר (production). push לבראנץ' אחר יוצר רק תצוגה מקדימה (preview).
  - ההגדרות (rewrites, redirects, headers) נמצאות ב-`vercel.json`.
  - פונקציות שרת נמצאות ב-`api/` (Vercel Functions):
    - `api/lead.js`: התראת וואטסאפ לליאם על כל ליד. קודם מנסה וואטסאפ רשמי של Meta, עם תבנית `lead_alert` שיש בה 3 משתנים: שם, טלפון ופרטים. משתני סביבה: `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `WHATSAPP_TO` ו-`WHATSAPP_TEMPLATE`, `WHATSAPP_LANG` (לא חובה). אם Meta לא עובד, הגיבוי הוא CallMeBot, עם `CALLMEBOT_PHONE` ו-`CALLMEBOT_APIKEY`.
    - `api/delete-review.js`: מחיקת ביקורת. משתני סביבה: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `ADMIN_PASS`.
  - **כל טופס ליד שולח בשני ערוצים במקביל**: מייל (Web3Forms) וגם וואטסאפ (`/api/lead`). הליד נחשב שהתקבל אם לפחות אחד מהם הצליח. **טופס ליד חדש חייב לעבוד באותה שיטה**, עם שדה `form` שמזהה ממנו הגיע הליד (למשל `michzur.html`, `ichud-halvaot.html` או טופס הקשר ב-`index.html`).
- **GitHub** — repo: `liamzur/mortgage-site`
- **עיצוב**: רקע שחור `#080808`, זהב `#C9A84C`, פונט Heebo, RTL עברית

## מבנה הקבצים
```
mortgage-site/
├── index.html          # דף הבית (302KB) - hero, services, FAQ, blog section
├── card.html           # כרטיס ביקור דיגיטלי (10KB - אופטימז!)
├── card-photo-1.jpg    # תמונת הפרופיל ב-hero (805x1024, 65KB) — רקע סטודיו שחור
├── card-photo-2.jpg    # לוגו LIAM ZUR (13KB) — לא בשימוש בכרטיס כרגע
├── sitemap.xml         # 14 עמודים
├── accessibility.html
├── privacy.html
├── terms.html
└── blog/
    ├── index.html                      # אינדקס הבלוג
    ├── yoetz-mashkanta.html            # יועץ משכנתאות (מוצמד)
    ├── mashkanta-achuz-mimun.html      # אחוז מימון
    ├── mashkanta-bank-check.html       # בדיקת בנקים
    ├── mashkanta-binyan-atzmit.html    # בניין עצמית
    ├── mashkanta-ribit-keren.html      # ריבית וקרן
    ├── mashkanta-michzur-2026.html     # מחזור 2026 (חדש!)
    ├── mashkanta-zugot-tzeirim.html    # זוגות צעירים (חדש!)
    └── tipim-hokhmat-mashkanta.html    # 10 טיפים (חדש!)
```

## מה עשינו בשיחה הקודמת (אפריל 2026)

### תיקונים שבוצעו:
1. **index.html** — נוסף סקשן "מאמרים מהבלוג" עם 6 כרטיסים + קישורים פנימיים + schema.org LocalBusiness + FAQPage markup
2. **card.html** — דחיסה מ-3.38MB ל-10KB (הוצאת base64 images לקבצים נפרדים)
3. **sitemap.xml** — עודכן עם כל 14 העמודים
4. **3 פוסטי בלוג חדשים** — מחזור 2026, זוגות צעירים, 10 טיפים
5. **blog/index.html** — עודכן עם 3 הפוסטים החדשים

### קבצים שעוד צריך להעלות:
הקבצים נמצאים ב: `~/Documents/Claude/outputs/mortgage-site-update/`
יש להעתיק לתיקיית הrepository ב: `~/Desktop/mortgage-site/`
ואז: `git add -A && git commit -m "SEO updates" && git push`

## אייג'נטים אוטומטיים (Scheduled Tasks)

### 1. mortgage-social-media-weekly
- **תזמון**: כל יום ראשון בשעה 09:00
- **מה עושה**: יוצר 3-4 פוסטים לפייסבוק/אינסטגרם בעברית
- **פורמט**: 4 פוסטים/שבוע (ראשון=טיפ, שלישי=חדשות, חמישי=FAQ, שבת=הצלחה)
- **תוצאה**: קובץ Markdown בתיקיית outputs

### 2. mortgage-blog-biweekly
- **תזמון**: ב-1 וב-15 לכל חודש בשעה 10:00
- **מה עושה**: כותב פוסט בלוג חדש בנושא משכנתאות (800-1200 מילים)
- **פורמט**: HTML מלא עם SEO, schema markup, internal linking
- **תוצאה**: קובץ HTML בתיקיית outputs + הנחיות העלאה

## אסטרטגיית SEO
- **מילות מפתח ראשיות**: יועץ משכנתאות, ייעוץ משכנתאות, מחזור משכנתא
- **מילות מפתח זנב ארוך**: יועץ משכנתאות מורשה ישראל, מחזור משכנתא 2026, משכנתא לזוגות צעירים
- **יעד**: 100+ ביקורים/חודש עד שבוע 6 (מאפריל 2026)
- **יעד**: דירוג ראשון לשאילתות מפתח עד שבוע 12

## מה Claude Code צריך לדעת

### כשמוסיפים פוסט בלוג חדש:
1. צור HTML בתיקיית `/blog/`
2. הוסף ל-`blog/index.html` (בתחילת הרשימה, אחרי הפוסט "נבחר")
3. הוסף ל-`sitemap.xml`
4. הוסף כרטיס ל-`index.html` בסקשן "מאמרים מהבלוג"
5. **חובה לכלול סקשן "מאמרים קשורים"** עם 3 לינקים פנימיים (ראה תבנית למטה)
6. **חובה לעבור בדיקת CTA** — להריץ `python3 /tmp/validate_blog.py blog/[slug].html` לפני העלאה
7. רק אחרי שעבר ולידציה: `git add -A && git commit && git push`

### ⚠️ דרישות עיצוב חובה לכל פוסט בלוג (אסור לסטות מהן):

**CSS של כפתור CTA — חובה להעתיק כמו שהוא:**
```css
.cta-btn{display:inline-block;background:#C9A84C !important;color:#1A0F00 !important;padding:16px 44px;text-decoration:none !important;font-weight:800 !important;font-size:1rem;letter-spacing:1px;transition:background 0.2s,transform 0.2s;border:none;}
.cta-btn:hover{background:#E8C97A !important;color:#1A0F00 !important;transform:translateY(-2px);text-decoration:none !important;}
[data-theme="light"] .cta-btn{background:#8B6914 !important;color:#FFFFFF !important;}
[data-theme="light"] .cta-btn:hover{background:#6B4F0C !important;color:#FFFFFF !important;}
```
🛑 **אסור להשתמש ב-`var(--gold)` או `var(--black)` ב-`.cta-btn`** — המשתנים מוחלפים ב-light mode והכפתור הופך לבלתי קריא. תמיד צבעים מוחלטים עם `!important`.

**CSS של מאמרים קשורים — חובה להעתיק:**
```css
.related-posts{margin:72px 0 0;padding-top:48px;border-top:1px solid var(--black-border);}
.related-posts-title{font-family:'Heebo',Georgia,serif;font-size:1.5rem;color:var(--gold);margin-bottom:28px;text-align:center;letter-spacing:1px;font-weight:700;}
.related-posts-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
.related-post-card{display:flex;flex-direction:column;background:var(--black-card);border:1px solid var(--black-border);padding:24px;text-decoration:none;transition:border-color 0.2s,transform 0.2s;}
.related-post-card:hover{border-color:var(--gold);transform:translateY(-3px);}
.related-post-card h3{font-family:'Heebo',Georgia,serif;font-size:1.05rem;color:var(--white);margin:0 0 12px;line-height:1.45;font-weight:700;}
.related-post-card p{color:var(--white-dim);font-size:0.85rem;line-height:1.65;margin:0 0 16px;flex:1;}
.related-post-card .read-more{color:var(--gold);font-size:0.82rem;font-weight:700;letter-spacing:0.5px;}
@media(max-width:900px){.related-posts-grid{grid-template-columns:1fr;}.related-posts{margin:48px 0 0;padding-top:36px;}}
```

### תבנית HTML לפוסט בלוג:
```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="description" content="[150-160 תווים]">
  <title>[מילת מפתח] | ליאם צור - יועץ משכנתאות</title>
  <link rel="canonical" href="https://liamzur.co.il/blog/[slug].html">
  <!-- schema.org BlogPosting -->
  <!-- Heebo font -->
  <!-- CSS: רקע #080808, זהב #C9A84C -->
</head>
<body>
  <!-- nav → hero עם H1 → תוכן H2/H3 → CTA → footer -->
</body>
</html>
```

### ⚠️ סטנדרט עיצוב לכל עמוד, כלי או כפתור חדש (בקשה של ליאם)
- **כפתורים תמיד מעוגלים ("גלולה", `border-radius:999px`)**, עם מעבר הזהב של כפתור "ייעוץ ראשוני חינם" בסרגל הנייד. זה מוגדר פעם אחת ב-`site-theme.css` (סעיפים 15–16), שנטען בכל עמוד.
  - כפתור ראשי: `class="cta-btn"` (בפוסטים) או `class="ui-btn"` (בעמודים וכלים).
  - כפתור משני (מסגרת): `class="ui-btn-ghost"`. כמה כפתורים יחד בתוך `<div class="ui-actions">`.
  - **לא להגדיר לכפתור צורה או צבע בתוך העמוד.** אם נוסף סוג כפתור חדש, מוסיפים את ה-class שלו לרשימה בסעיף 15 ב-`site-theme.css`.
- **מבנה העמוד כמו בעמוד המחשבון (`calculator.html`)**:
  ```html
  <div class="ui-breadcrumb"><a href="/">דף הבית</a><span>›</span>שם העמוד</div>
  <section class="ui-hero">
    <div class="ui-tag">כלי חינמי</div>
    <h1>מילה רגילה <span>מילה בזהב</span></h1>
    <p class="ui-sub">משפט הסבר קצר</p>
  </section>
  <main class="ui-main">
    <section class="ui-card"><h2>כותרת</h2><p>...</p></section>
  </main>
  ```
- כרטיסים ותיבות פנימיות: פינות מעוגלות (`ui-card` 18px, תיבות פנימיות 12–14px).
- עמוד חדש בשורש האתר שמשתמש ב-`ui-hero`: להוסיף אותו ל-`SPACER` ב-`tools/sync_nav.py`, כדי שהתוכן לא יוסתר מתחת לתפריט הקבוע.
- לבדוק תמיד גם במצב בהיר וגם בנייד (375px).

### ⚠️ התפריט העליון — אחיד בכל האתר
- התפריט זהה בכל העמודים: עיצוב ב-`site-nav.css`, התנהגות ב-`site-nav.js`, ה-HTML מוכנס ע"י `tools/sync_nav.py`.
- **אסור לערוך את התפריט ידנית בעמוד** (הבלוק שבין `LZ-NAV:START` ל-`LZ-NAV:END`).
- לשינוי קישור/סדר: לערוך את הרשימות `MAIN` / `TOOLS` ב-`tools/sync_nav.py` ולהריץ `python3 tools/sync_nav.py`.
- **עמוד חדש (כולל פוסט בלוג)**: אחרי יצירתו להריץ `python3 tools/sync_nav.py` — הוא מחליף את ה-`<nav>` של התבנית בתפריט האחיד.
- אם משנים את site-nav.css/js — להעלות את `VERSION` בסקריפט ולהריץ אותו (מרענן קאש בדפדפנים).

### כשמעדכנים index.html:
הקובץ גדול (302KB) — תמיד קרא חלקים ספציפיים עם grep/sed ואל תקרא את כולו

### כשמעלים לאתר (Vercel):
```bash
git add -A
git commit -m "הוספת פוסט: [כותרת]"
git push origin main
# Vercel מעדכן אוטומטית תוך ~30–60 שניות
```
- **לדחוף רק ל-`main`.** אם אותו קומיט נדחף גם לבראנץ' אחר, Vercel עלול לבנות רק preview ולדלג על ה-production.
- **תמיד לוודא שהשינוי באוויר**: `curl -s "https://liamzur.co.il/<עמוד>?nc=$RANDOM" | grep -c "<טקסט חדש>"`. אם אחרי 2 דקות אין שינוי, לבדוק ב-Vercel (`list_deployments`) שיש deployment עם `target: production` לקומיט החדש. אם אין, לדחוף ל-`main` קומיט ריק (`git commit --allow-empty`).

## Skills זמינים
- `mortgage-social-media` — יוצר פוסטים לסושיאל מדיה
- `bank-submission-letter` — יוצר מכתבי הגשה לבנקים
- `pdf`, `docx`, `pptx` — עבודה עם מסמכים
- `skill-creator` — יצירת skills חדשים

## הוראות לClaude Code

### כשמריצים task של סושיאל מדיה:
```
תפעיל את ה-skill: mortgage-social-media
ושמור את התוצאה ב-~/Documents/Claude/outputs/social-posts-[DATE].md
```

### כשמריצים task של בלוג:
```
כתוב פוסט בלוג בנושא [נושא] לאתר liamzur.co.il
תוצאה: ~/Documents/Claude/outputs/blog/[slug].html
ואז עדכן blog/index.html, sitemap.xml, ו-index.html
```

### Flow מלא לעדכון אתר:
1. `cd ~/Desktop/mortgage-site`
2. `git pull origin main` (לוודא עדכון)
3. עשה את השינויים
4. `git add -A && git commit -m "תיאור" && git push`
5. Vercel מעדכן תוך ~30–60 שניות. לוודא באתר החי (ראו "כשמעלים לאתר")

---
*קובץ זה נוצר על ידי Claude (Cowork) בשיחה מאפריל 2026*
*לשאלות על הפרויקט — קרא את הקובץ הזה ואז שאל*
