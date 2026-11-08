// Vercel Function: /api/delete-review
// מחיקת ביקורת: לפי token של הלקוח (רק הביקורת שלו) או סיסמת admin.
// משתני סביבה ב-Vercel: SUPABASE_URL, SUPABASE_SERVICE_KEY, ADMIN_PASS

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== 'object') return res.status(400).send('Invalid JSON');

  const { id, deleteToken, adminPassword } = body;
  if (!id) return res.status(400).send('Missing review id');

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const ADMIN_PASS = process.env.ADMIN_PASS;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return res.status(500).send('Server configuration error');

  const headers = {
    apikey: SUPABASE_SERVICE_KEY,
    Authorization: 'Bearer ' + SUPABASE_SERVICE_KEY,
    'Content-Type': 'application/json',
  };
  const base = SUPABASE_URL + '/rest/v1/reviews?id=eq.' + encodeURIComponent(id);

  // Admin: any review
  if (adminPassword && ADMIN_PASS && adminPassword === ADMIN_PASS) {
    const r = await fetch(base, { method: 'DELETE', headers });
    if (!r.ok) return res.status(500).send('Delete failed');
    return res.status(200).json({ success: true });
  }

  // User: only own review (token must match)
  if (deleteToken) {
    const q = base + '&delete_token=eq.' + encodeURIComponent(deleteToken);
    const check = await fetch(q + '&select=id', { headers });
    const rows = await check.json().catch(() => []);
    if (!Array.isArray(rows) || rows.length === 0) return res.status(403).send('Unauthorized');
    const r = await fetch(q, { method: 'DELETE', headers });
    if (!r.ok) return res.status(500).send('Delete failed');
    return res.status(200).json({ success: true });
  }

  return res.status(403).send('Unauthorized');
};
