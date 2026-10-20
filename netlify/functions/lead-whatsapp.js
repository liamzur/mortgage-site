// Netlify Function: lead-whatsapp
// שולח לליאם הודעת וואטסאפ על כל ליד חדש מבדיקת המחזור (במקביל למייל של Web3Forms).
//
// עובד דרך CallMeBot (חינמי, שולח הודעות למספר של עצמך בלבד).
// הגדרה חד-פעמית ב-Netlify → Site configuration → Environment variables:
//   CALLMEBOT_PHONE   — המספר שלך בפורמט בינלאומי, למשל 972523434916
//   CALLMEBOT_APIKEY  — המפתח שקיבלת מ-CallMeBot בוואטסאפ
// בלי שני המשתנים האלה הפונקציה פשוט לא שולחת, והמייל ממשיך לעבוד כרגיל.

const ALLOWED_ORIGINS = [
  'https://liamzur.co.il',
  'https://www.liamzur.co.il',
];

const clip = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, n);

function phoneOk(p) {
  let t = String(p || '').replace(/[-\s().]/g, '');
  if (/^\+?972\d{8,9}$/.test(t)) t = '0' + t.replace(/^\+?972/, '');
  return /^0(5\d|[23489]|7\d)\d{7}$/.test(t) ? t : '';
}

function json(status, obj, origin) {
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin || ALLOWED_ORIGINS[0],
      'Vary': 'Origin',
    },
    body: JSON.stringify(obj),
  };
}

exports.handler = async function (event) {
  const origin = event.headers.origin || event.headers.Origin || '';
  const okOrigin = ALLOWED_ORIGINS.includes(origin) || /^https:\/\/[a-z0-9-]+--[a-z0-9-]+\.netlify\.app$/.test(origin);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: {
      'Access-Control-Allow-Origin': okOrigin ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    }, body: '' };
  }
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'method' });
  if (!okOrigin) return json(403, { ok: false, error: 'origin' });

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { ok: false, error: 'json' }, origin); }

  // Honeypot: bots fill hidden fields, people don't.
  if (body.botcheck) return json(200, { ok: true }, origin);

  const name = clip(body.name, 60);
  const phone = phoneOk(body.phone);
  if (name.length < 2 || !phone) return json(400, { ok: false, error: 'fields' }, origin);

  const PHONE = process.env.CALLMEBOT_PHONE;
  const KEY = process.env.CALLMEBOT_APIKEY;
  if (!PHONE || !KEY) return json(200, { ok: false, whatsapp: 'not_configured' }, origin);

  const result = clip(body.result, 80);
  const source = clip(body.source, 30);
  const answers = Array.isArray(body.answers) ? body.answers.slice(0, 5).map(a => '• ' + clip(a, 140)) : [];

  const text = [
    '🔔 ליד חדש — בדיקת מחזור',
    `שם: ${name}`,
    `טלפון: ${phone}`,
    result && `תוצאה: ${result}`,
    source && `מקור: ${source}`,
    answers.length ? '\nתשובות:\n' + answers.join('\n') : '',
    `\nלחיצה לוואטסאפ ללקוח: https://wa.me/972${phone.slice(1)}`,
  ].filter(Boolean).join('\n');

  const url = 'https://api.callmebot.com/whatsapp.php?phone=' + encodeURIComponent(PHONE) +
    '&text=' + encodeURIComponent(text) + '&apikey=' + encodeURIComponent(KEY);

  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 9000);
    const r = await fetch(url, { signal: ctl.signal });
    clearTimeout(t);
    const out = await r.text();
    const sent = r.ok && !/error|invalid/i.test(out.slice(0, 400));
    return json(sent ? 200 : 502, { ok: sent }, origin);
  } catch {
    return json(502, { ok: false, error: 'send' }, origin);
  }
};
