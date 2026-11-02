// GET /api/panel · datos del panel de una organización. Cabecera: Authorization: Bearer <token de Supabase Auth>.
// Comprueba quién es la persona, a qué organización pertenece y devuelve SOLO las valoraciones de sus objetivos.
// Plan «muestra»: últimos 7 días, sin comentarios ni temas. Plan «completo»: 90 días, comentarios moderados y temas de la IA.
const db = require('./_db'), org = require('./_org');
module.exports = async (req, res) => {
  if (db.cors(req, res)) return;
  res.setHeader('Cache-Control', 'no-store');
  if (!db.ok()) return res.status(503).json({ error: 'sin configurar' });
  if (db.limited(req, 60)) return res.status(429).json({ error: 'rate' });
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'auth' });
  try {
    const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;
    const ur = await fetch(process.env.SUPABASE_URL.replace(/\/+$/, '') + '/auth/v1/user', { headers: { apikey: key, Authorization: 'Bearer ' + token } });
    if (!ur.ok) return res.status(401).json({ error: 'auth' });
    const email = String((await ur.json()).email || '').toLowerCase();
    if (!email) return res.status(401).json({ error: 'auth' });
    const mem = await db.select('org_members?select=org_id&email=eq.' + encodeURIComponent(email) + '&limit=1');
    if (!Array.isArray(mem) || !mem.length) return res.status(403).json({ error: 'sin organización', email });
    const o = (await db.select('organizations?select=id,name,plan&id=eq.' + mem[0].org_id))[0];
    if (!o) return res.status(500).json({ error: 'org' });
    const full = o.plan === 'completo', days = full ? 90 : 7;
    const { rows, tg, sites } = await org.load(o.id, days);
    const out = org.compute(rows, tg, sites, days, full);
    out.org = { name: o.name, plan: o.plan }; out.email = email;
    out.targetList = tg.map(t => ({ kind: t.kind, value: t.value }));
    res.status(200).json(out);
  } catch (e) { console.error('panel', String(e)); res.status(500).json({ error: 'server' }); }
};
