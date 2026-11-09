// POST /api/auth {email} · envía el enlace de acceso (Supabase Auth) solo si el correo pertenece a una organización.
// Variables: SUPABASE_URL, SUPABASE_SERVICE_KEY y SUPABASE_ANON_KEY (clave pública «anon»/«publishable»).
// En Supabase → Authentication → URL Configuration: Site URL = https://TU-DOMINIO/panel y añade esa misma URL en Redirect URLs.
const db = require('./_db');
module.exports = async (req, res) => {
  if (db.cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  if (db.limited(req, 5)) return res.status(429).json({ ok: false });
  const b = db.body(req);
  if (b && b.refresh) { // renueva la sesión sin pedir otro correo
    const an = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;
    try {
      const r = await fetch(`${process.env.SUPABASE_URL.replace(/\/+$/, '')}/auth/v1/token?grant_type=refresh_token`, { method: 'POST', headers: { apikey: an, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: String(b.refresh).slice(0, 300) }) });
      const j = await r.json();
      if (r.ok && j.access_token) return res.status(200).json({ ok: true, access_token: j.access_token, refresh_token: j.refresh_token });
    } catch (e) { console.error('refresh', String(e)); }
    return res.status(401).json({ ok: false });
  }
  const email = String((b && b.email) || '').trim().toLowerCase().slice(0, 120);
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ ok: false, error: 'email' });
  const anon = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!db.ok() || !anon) return res.status(503).json({ ok: false, error: 'sin configurar' });
  try {
    const m = await db.select('org_members?select=org_id&email=eq.' + encodeURIComponent(email) + '&limit=1');
    if (Array.isArray(m) && m.length) {
      const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0];
      const r = await fetch(`${process.env.SUPABASE_URL.replace(/\/+$/, '')}/auth/v1/otp?redirect_to=${encodeURIComponent('https://' + host + '/panel')}`, {
        method: 'POST', headers: { apikey: anon, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, create_user: true })
      });
      if (!r.ok) console.error('otp', r.status, await r.text());
    }
  } catch (e) { console.error('auth', String(e)); }
  res.status(200).json({ ok: true }); // respuesta idéntica exista o no el correo (no revela quién es cliente)
};
