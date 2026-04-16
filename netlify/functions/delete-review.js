// Netlify Function: delete-review
// מחיקת ביקורת — מאומת לפי token של הלקוח או סיסמת admin

exports.handler = async function(event) {
  // Only POST allowed
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { id, deleteToken, adminPassword } = body;

  if (!id) {
    return { statusCode: 400, body: 'Missing review id' };
  }

  const SUPABASE_URL         = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const ADMIN_PASS           = process.env.ADMIN_PASS;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { statusCode: 500, body: 'Server configuration error' };
  }

  const headers = {
    'apikey':        SUPABASE_SERVICE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY,
    'Content-Type':  'application/json'
  };

  // ── Admin delete: any review ──────────────────────────────────────
  if (adminPassword && ADMIN_PASS && adminPassword === ADMIN_PASS) {
    const res = await fetch(
      SUPABASE_URL + '/rest/v1/reviews?id=eq.' + encodeURIComponent(id),
      { method: 'DELETE', headers }
    );
    if (!res.ok) return { statusCode: 500, body: 'Delete failed' };
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true })
    };
  }

  // ── User delete: only own review (token must match) ───────────────
  if (deleteToken) {
    // First verify token matches before deleting
    const check = await fetch(
      SUPABASE_URL + '/rest/v1/reviews?id=eq.' + encodeURIComponent(id) +
      '&delete_token=eq.' + encodeURIComponent(deleteToken) + '&select=id',
      { headers }
    );
    const rows = await check.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return { statusCode: 403, body: 'Unauthorized' };
    }

    const res = await fetch(
      SUPABASE_URL + '/rest/v1/reviews?id=eq.' + encodeURIComponent(id) +
      '&delete_token=eq.' + encodeURIComponent(deleteToken),
      { method: 'DELETE', headers }
    );
    if (!res.ok) return { statusCode: 500, body: 'Delete failed' };
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true })
    };
  }

  return { statusCode: 403, body: 'Unauthorized' };
};
