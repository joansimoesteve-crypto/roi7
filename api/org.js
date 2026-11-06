// POST /api/org · acciones de una organización con plan completo (cabecera Authorization: Bearer <token>).
//   {action:'update', title, body, target}      publica una novedad («Tú dijiste, nosotros hicimos»)
//   {action:'delete_update', id}                la retira
//   {action:'pulse', question, subject, type, location}   crea una pregunta puntual (devuelve su id)
//   {action:'close_pulse', id}                  la cierra
//   {action:'place', name, kind, description, lat, lng, radius_m}  añade un lugar/proyecto geolocalizado (sale en /mapa)
//   {action:'delete_place', id}                 lo retira
//   {action:'hide_msg', id}                     oculta un mensaje de la charla de sus salas
const db = require('./_db'), org = require('./_org');
const ID = /^[0-9a-f-]{32,40}$/i;
module.exports = async (req, res) => {
  if (db.cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  if (!db.ok()) return res.status(503).json({ ok: false, error: 'sin configurar' });
  if (db.limited(req, 30)) return res.status(429).json({ ok: false });
  try {
    const a = await org.auth(req); if (!a.org) return res.status(a.status).json({ ok: false, error: a.error });
    if (a.org.plan !== 'completo') return res.status(402).json({ ok: false, error: 'plan' });
    const b = db.body(req); if (!b) return res.status(400).json({ ok: false });
    const oid = a.org.id;
    if (b.action === 'update') {
      const title = db.clip(b.title, 120); if (!title) return res.status(400).json({ ok: false, error: 'title' });
      const r = await db.insert('org_updates', { org_id: oid, title, body: db.clip(b.body, 600), target: db.clip(b.target, 160) });
      return res.status(r.ok ? 200 : 500).json({ ok: r.ok });
    }
    if (b.action === 'delete_update' && ID.test(String(b.id))) {
      const r = await db.patch(`org_updates?id=eq.${b.id}&org_id=eq.${oid}`, { published: false }); return res.status(r.ok ? 200 : 500).json({ ok: r.ok });
    }
    if (b.action === 'pulse') {
      const question = db.clip(b.question, 140), subject = db.clip(b.subject, 160), type = ['web', 'project', 'place', 'org'].includes(b.type) ? b.type : 'place';
      if (!question || !subject) return res.status(400).json({ ok: false, error: 'datos' });
      const row = await db.insertRet('pulses', { org_id: oid, question, subject, type, location: db.clip(b.location, 80) });
      return row ? res.status(200).json({ ok: true, id: row.id }) : res.status(500).json({ ok: false });
    }
    if (b.action === 'close_pulse' && ID.test(String(b.id))) {
      const r = await db.patch(`pulses?id=eq.${b.id}&org_id=eq.${oid}`, { active: false }); return res.status(r.ok ? 200 : 500).json({ ok: r.ok });
    }
    if (b.action === 'place') {
      const name = db.clip(b.name, 120), lat = db.num(b.lat, -90, 90), lng = db.num(b.lng, -180, 180);
      if (!name || lat == null || lng == null) return res.status(400).json({ ok: false, error: 'datos' });
      const row = await db.insertRet('places', { org_id: oid, name, kind: b.kind === 'project' ? 'project' : 'place', description: db.clip(b.description, 160), lat, lng, radius_m: Math.round(db.num(b.radius_m, 30, 1000) || 150) });
      if (!row) return res.status(500).json({ ok: false });
      await db.insert('org_targets', { org_id: oid, kind: 'subject', value: name }); // sus votos pasan solos al panel
      return res.status(200).json({ ok: true, id: row.id });
    }
    if (b.action === 'delete_place' && ID.test(String(b.id))) {
      const r = await db.patch(`places?id=eq.${b.id}&org_id=eq.${oid}`, { active: false }); return res.status(r.ok ? 200 : 500).json({ ok: r.ok });
    }
    if (b.action === 'hide_msg' && ID.test(String(b.id))) { // oculta un mensaje de la charla de una sala suya
      const m = (await db.select(`chat_messages?select=room&id=eq.${b.id}&limit=1`))[0];
      const tg = await db.select('org_targets?select=value&org_id=eq.' + oid);
      if (!m || !Array.isArray(tg) || !tg.some(t => String(t.value).toLowerCase() === m.room)) return res.status(403).json({ ok: false });
      const r = await db.patch(`chat_messages?id=eq.${b.id}`, { hidden: true }); return res.status(r.ok ? 200 : 500).json({ ok: r.ok });
    }
    res.status(400).json({ ok: false, error: 'action' });
  } catch (e) { console.error('org', String(e)); res.status(500).json({ ok: false }); }
};
