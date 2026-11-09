// GET /api/panel · datos del panel de una organización. Cabecera: Authorization: Bearer <token de Supabase Auth>.
// Devuelve SOLO las valoraciones de sus objetivos. Plan «muestra»: 7 días, sin comentarios, temas, novedades ni preguntas.
const db = require('./_db'), org = require('./_org');
const placesQ = async oid => { // prueba con todas las columnas y baja si el SQL nuevo aún no está ejecutado
  const base = 'id,name,kind,description,lat,lng,radius_m';
  for (const c of [`${base},shape,info,cta_label,cta_url,hitos`, `${base},shape,info,cta_label,cta_url`, `${base},shape,info`, base]) {
    const r = await db.select(`places?select=${c}&org_id=eq.${oid}&active=eq.true&order=created_at.desc&limit=100`); if (Array.isArray(r)) return r;
  } return [];
};
const list = x => Array.isArray(x) ? x : []; // si una tabla aún no existe (SQL sin ejecutar), no rompe el panel
module.exports = async (req, res) => {
  if (db.cors(req, res)) return;
  res.setHeader('Cache-Control', 'no-store');
  if (!db.ok()) return res.status(503).json({ error: 'sin configurar' });
  if (db.limited(req, 60)) return res.status(429).json({ error: 'rate' });
  try {
    const a = await org.auth(req);
    if (!a.org) return res.status(a.status).json({ error: a.error, email: a.email });
    const o = a.org, full = o.plan === 'completo', days = full ? 90 : 7;
    const { rows, tg, sites } = await org.load(o.id, days);
    const out = org.compute(rows, tg, sites, days, full);
    out.org = { name: o.name, plan: o.plan }; out.email = a.email;
    out.targetList = tg.map(t => ({ kind: t.kind, value: t.value }));
    if (full) {
      const [ups, pls, pcs, rts] = await Promise.all([
        db.select(`org_updates?select=id,title,body,target,created_at,status&org_id=eq.${o.id}&published=eq.true&order=created_at.desc&limit=20`).then(r => Array.isArray(r) ? r : db.select(`org_updates?select=id,title,body,target,created_at&org_id=eq.${o.id}&published=eq.true&order=created_at.desc&limit=20`)),
        db.select(`pulses?select=id,question,subject,type,location,active,created_at&org_id=eq.${o.id}&order=created_at.desc&limit=20`),
        placesQ(o.id),
        db.select(`routes?select=id,name,description,reward,place_ids&org_id=eq.${o.id}&active=eq.true&order=created_at.desc&limit=30`)
      ]);
      const rooms = [...new Set(tg.map(t => String(t.value).toLowerCase()))].map(v => '"' + v.replace(/[\\"]/g, '\\$&') + '"');
      out.chat = rooms.length ? list(await db.select(`chat_messages?select=id,room,nick,body,created_at&hidden=eq.false&room=in.(${rooms.join(',')})&order=created_at.desc&limit=30`)) : [];
      out.places = list(pcs); out.routes = list(rts); out.updates = list(ups); out.pulses = list(pls);
      if (out.pulses.length) {
        const rs = list(await db.select(`ratings?select=pulse_id,rating&pulse_id=in.(${out.pulses.map(p => p.id).join(',')})&limit=5000`)), S = {};
        for (const r of rs) { const s = S[r.pulse_id] || (S[r.pulse_id] = { n: 0, s: 0 }); s.n++; s.s += r.rating }
        out.pulses.forEach(p => { const s = S[p.id]; p.n = s ? s.n : 0; p.avg = s ? Math.round(s.s / s.n * 100) / 100 : null });
      }
    }
    res.status(200).json(out);
  } catch (e) { console.error('panel', String(e)); res.status(500).json({ error: 'server' }); }
};
