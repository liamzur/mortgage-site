# CLAUDE.md — הקשר לפרויקט liamzur.co.il

## מי אני ומה הפרויקט
שמי **ליאם צור**, יועץ משכנתאות מורשה ישראלי.  
האתר: **https://liamzur.co.il**  
GitHub: **https://github.com/liamzur/mortgage-site**  
Netlify Site ID: **c96420f6-9fc5-43d8-9e79-99ea1bbc9051**  
טלפון: 052-343-4916

## ארכיטקטורת האתר
- **סטטי לחלוטין** — HTML/CSS/JS בלבד, ללא framework
- **Netlify** — hosting + CDN. כל push ל-main מעלה אוטומטית
- **GitHub** — repo: `liamzur/mortgage-site`
- **עיצוב**: רקע שחור `#080808`, זהב `#C9A84C`, פונט Heebo, RTL עברית

## מבנה הקבצים
```
mortgage-site/
├── index.html          # דף הבית (302KB) - hero, services, FAQ, blog section
├── card.html           # כרטיס ביקור דיגיטלי (10KB - אופטימז!)
├── card-photo-1.jpg    # תמונת פרופיל (58KB)
├── card-photo-2.jpg    # תמונת QR (13KB)
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
5. עשה `git add -A && git commit && git push`

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

### כשמעדכנים index.html:
הקובץ גדול (302KB) — תמיד קרא חלקים ספציפיים עם grep/sed ואל תקרא את כולו

### כשמ-deploy ל-Netlify:
```bash
git add -A
git commit -m "הוספת פוסט: [כותרת]"
git push origin main
# Netlify יעדכן אוטומטית תוך ~1 דקה
```

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
5. Netlify מעדכן תוך ~60 שניות

---
*קובץ זה נוצר על ידי Claude (Cowork) בשיחה מאפריל 2026*
*לשאלות על הפרויקט — קרא את הקובץ הזה ואז שאל*
