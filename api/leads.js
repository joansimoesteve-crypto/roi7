// POST /api/leads · formulario «Hablemos de tu organización». Guarda el contacto en Supabase y avisa por email.
// Variables de entorno: SUPABASE_URL, SUPABASE_SERVICE_KEY, RESEND_API_KEY (aviso por email) y LEADS_TO_EMAIL (tu correo).
const db = require('./_db');

async function notify(l) {
  const key = process.env.RESEND_API_KEY, to = process.env.LEADS_TO_EMAIL || 'urnovai@outlook.es';
  if (!key) return false;
  const text = `Nuevo contacto de empresa en Avatar ROI\n\nNombre: ${l.name}\nOrganización: ${l.org}\nTeléfono: ${l.phone}\nEmail: ${l.email || '(no indicado)'}\nSomos: ${l.kind}\nLe interesa: ${l.interest}\n\nMensaje:\n${l.message || '(sin mensaje)'}`;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.LEADS_FROM_EMAIL || 'Avatar ROI <onboarding@resend.dev>', to: [to], subject: `Contacto de ${l.org} (${l.name})`, text, ...(l.email ? { reply_to: l.email } : {}) })
  });
  if (!r.ok) console.error('resend', r.status, await r.text());
  return r.ok;
}

module.exports = async (req, res) => {
  if (db.cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  if (db.limited(req, 5)) return res.status(429).json({ ok: false });
  const b = db.body(req);
  if (!b || b.website || (typeof b.elapsed === 'number' && b.elapsed < 2000)) return res.status(b ? 200 : 400).json({ ok: !!b, ignored: !!b }); // robots: respuesta neutra
  const phone = (db.clip(b.phone, 30) || '').replace(/[^\d+()\s.-]/g, ''), digits = phone.replace(/\D/g, '');
  const email = db.clip(b.email, 120);
  if (!b.consent || digits.length < 7 || digits.length > 15 || !db.clip(b.name, 100) || !db.clip(b.org, 120) || (email && !/^\S+@\S+\.\S+$/.test(email)))
    return res.status(400).json({ ok: false, error: 'invalid' });
  const lead = { name: db.clip(b.name, 100), org: db.clip(b.org, 120), phone, email, kind: db.clip(b.kind, 40), interest: db.clip(b.interest, 60), message: db.clip(b.message, 1000) };
  let saved = false, mailed = false;
  if (db.ok()) { try { const r = await db.insert('leads', lead); saved = r.ok; if (!r.ok) console.error('lead insert', r.status, await r.text()); } catch (e) { console.error('lead insert', String(e)); } }
  try { mailed = await notify(lead); } catch (e) { console.error('lead mail', String(e)); }
  if (!saved && !mailed) return res.status(503).json({ ok: false });
  res.status(200).json({ ok: true, saved, mailed });
};
