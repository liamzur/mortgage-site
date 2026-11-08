// Vercel Function: /api/lead
// שולח לליאם התראת וואטסאפ על כל ליד חדש מכל טופס באתר (במקביל למייל של Web3Forms).
//
// ערוץ 1 (מועדף): וואטסאפ רשמי של Meta (WhatsApp Cloud API). משתני סביבה ב-Vercel:
//   WHATSAPP_TOKEN     — טוקן קבוע (System User) מ-Meta
//   WHATSAPP_PHONE_ID  — Phone number ID של המספר השולח
//   WHATSAPP_TO        — המספר של ליאם שמקבל את ההתראה, למשל 972523434916
//   WHATSAPP_TEMPLATE  — שם התבנית המאושרת (ברירת מחדל lead_alert), עם 3 משתנים: שם, טלפון, פרטים
//   WHATSAPP_LANG      — שפת התבנית (ברירת מחדל he)
// ערוץ 2 (גיבוי): CallMeBot — CALLMEBOT_PHONE, CALLMEBOT_APIKEY
// בלי משתנים הפונקציה לא שולחת, והמייל ממשיך לעבוד כרגיל.

const ALLOWED = [/^https:\/\/(www\.)?liamzur\.co\.il$/, /^https:\/\/mortgage-site-[a-z0-9-]+\.vercel\.app$/, /^http:\/\/localhost(:\d+)?$/];

const clip = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, n);

function phoneOk(p) {
  let t = String(p || '').replace(/[-\s().]/g, '');
  if (/^\+?972\d{8,9}$/.test(t)) t = '0' + t.replace(/^\+?972/, '');
  return /^0(5\d|[23489]|7\d)\d{7}$/.test(t) ? t : '';
}

// פרמטר בתבנית של Meta: שורה אחת, בלי טאבים ובלי יותר מ-4 רווחים רצופים
const oneLine = (v, n) => clip(v, n).replace(/\s+/g, ' ') || '-';

async function sendMeta(lead) {
  const TOKEN = process.env.WHATSAPP_TOKEN, PID = process.env.WHATSAPP_PHONE_ID, TO = process.env.WHATSAPP_TO;
  if (!TOKEN || !PID || !TO) return 'not_configured';
  const body = {
    messaging_product: 'whatsapp',
    to: TO.replace(/\D/g, ''),
    type: 'template',
    template: {
      name: process.env.WHATSAPP_TEMPLATE || 'lead_alert',
      language: { code: process.env.WHATSAPP_LANG || 'he' },
      components: [{ type: 'body', parameters: [
        { type: 'text', text: oneLine(lead.name, 60) },
        { type: 'text', text: oneLine(lead.phone, 20) },
        { type: 'text', text: oneLine(lead.summary, 700) },
      ] }],
    },
  };
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 9000);
      const r = await fetch(`https://graph.facebook.com/v21.0/${encodeURIComponent(PID)}/messages`, {
        method: 'POST', signal: ctl.signal,
        headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      clearTimeout(t);
      if (r.ok) return 'sent';
      console.error('meta', r.status, (await r.text()).slice(0, 400));
      if (r.status >= 400 && r.status < 500 && r.status !== 429) break; // שגיאת הגדרה: אין טעם לנסות שוב
    } catch (e) { console.error('meta fetch', e && e.name); }
  }
  return 'failed';
}

async function sendCallMeBot(text) {
  const PHONE = process.env.CALLMEBOT_PHONE, KEY = process.env.CALLMEBOT_APIKEY;
  if (!PHONE || !KEY) return 'not_configured';
  const url = 'https://api.callmebot.com/whatsapp.php?phone=' + encodeURIComponent(PHONE) +
    '&text=' + encodeURIComponent(text) + '&apikey=' + encodeURIComponent(KEY);
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 9000);
      const r = await fetch(url, { signal: ctl.signal });
      clearTimeout(t);
      const out = (await r.text()).slice(0, 400);
      if (r.ok && !/error|invalid|not\s+active/i.test(out)) return 'sent';
      console.error('callmebot', r.status, out);
    } catch (e) { console.error('callmebot fetch', e && e.name); }
  }
  return 'failed';
}

// קודם Meta; אם הוא לא מוגדר או נכשל — CallMeBot (אם מוגדר).
async function sendWhatsApp(lead, text) {
  const meta = await sendMeta(lead);
  if (meta === 'sent') return 'sent';
  const cmb = await sendCallMeBot(text);
  if (cmb === 'sent') return 'sent';
  return meta === 'not_configured' && cmb === 'not_configured' ? 'not_configured' : 'failed';
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || '';
  const okOrigin = ALLOWED.some(re => re.test(origin));
  res.setHeader('Vary', 'Origin');
  if (okOrigin) res.setHeader('Access-Control-Allow-Origin', origin);

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method' });
  if (origin && !okOrigin) return res.status(403).json({ ok: false, error: 'origin' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== 'object') return res.status(400).json({ ok: false, error: 'json' });

  // Honeypot: bots fill hidden fields, people don't.
  if (body.botcheck) return res.status(200).json({ ok: true });

  const name = clip(body.name, 60);
  const phone = phoneOk(body.phone);
  if (name.length < 2 || !phone) return res.status(400).json({ ok: false, error: 'fields' });

  const form = clip(body.form || 'טופס באתר', 40);
  const result = clip(body.result, 80);
  const source = clip(body.source, 30);
  const email = clip(body.email, 80);
  const service = clip(body.service_type, 60);
  const message = clip(body.message, 300);
  const answers = Array.isArray(body.answers) ? body.answers.slice(0, 6).map(a => '• ' + clip(a, 140)) : [];

  const text = [
    `🔔 ליד חדש — ${form}`,
    `שם: ${name}`,
    `טלפון: ${phone}`,
    email && `מייל: ${email}`,
    service && `נושא: ${service}`,
    result && `תוצאה: ${result}`,
    message && `הודעה: ${message}`,
    source && `מקור: ${source}`,
    answers.length ? '\nפרטים:\n' + answers.join('\n') : '',
    `\nלחיצה לוואטסאפ ללקוח: https://wa.me/972${phone.slice(1)}`,
  ].filter(Boolean).join('\n');

  const summary = [form, email && `מייל ${email}`, service, result, message, source && `מקור ${source}`,
    answers.length ? answers.map(x => x.replace(/^• /, '')).join(' | ') : '']
    .filter(Boolean).join(' · ') + ` · לחזרה בוואטסאפ: wa.me/972${phone.slice(1)}`;
  const whatsapp = await sendWhatsApp({ name, phone, summary }, text);
  console.log('lead', JSON.stringify({ form, whatsapp }));
  return res.status(whatsapp === 'sent' ? 200 : (whatsapp === 'not_configured' ? 200 : 502))
    .json({ ok: whatsapp === 'sent', whatsapp });
};
