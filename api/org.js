// POST /api/org · acciones de una organización con plan completo (cabecera Authorization: Bearer <token>).
//   {action:'update', title, body, target, status}      publica una novedad («Tú dijiste, nosotros hicimos»)
//   {action:'delete_update', id}                la retira
//   {action:'pulse', question, subject, type, location}   crea una pregunta puntual (devuelve su id)
//   {action:'close_pulse', id}                  la cierra
//   {action:'place', name, kind, description, lat, lng, radius_m}  añade un lugar/proyecto geolocalizado (sale en /mapa)
//   {action:'update_place', id, ...}            edita una zona (forma, textos, botón de acción cta_label + cta_url https)
//   {action:'route', name, description, reward, place_ids:[…]}  ruta con puntos de control (≥2 zonas)
//   {action:'delete_route', id}
//   (place y update_place admiten hitos:[{t,s:'hecho'|'curso'|'pendiente'}]; un proyecto puede ir sin ubicación)
//   {action:'delete_place', id}                 lo retira
//   {action:'hide_msg', id}                     oculta un mensaje de la charla de sus salas
const db = require('./_db'), org = require('./_org');
const ID = /^[0-9a-f-]{32,40}$/i;
const hitosOf = b => Array.isArray(b.hitos) ? b.hitos.slice(0, 12).map(h => ({ t: db.clip(h && h.t, 100), s: ['hecho', 'curso', 'pendiente'].includes(h && h.s) ? h.s : 'pendiente' })).filter(h => h.t) : null;
const ctaOf = b => { const l = db.clip(b.cta_label, 40), u = String(b.cta_url || '').trim().slice(0, 300); return l && /^https:\/\/[^\s]+$/i.test(u) ? { cta_label: l, cta_url: u } : { cta_label: null, cta_url: null } };
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
      const row = { org_id: oid, title, body: db.clip(b.body, 600), target: db.clip(b.target, 160) };
      let r = await db.insert('org_updates', { ...row, status: ['estudio', 'marcha', 'hecho'].includes(b.status) ? b.status : 'hecho' });
      if (!r.ok && r.status >= 400 && r.status < 500) r = await db.insert('org_updates', row); // v8 sin ejecutar
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
      const name = db.clip(b.name, 120);
      let shape = Array.isArray(b.shape) ? b.shape.slice(0, 60).map(p => Array.isArray(p) ? [db.num(p[0], -90, 90), db.num(p[1], -180, 180)] : null) : null;
      if (shape && (shape.length < 3 || shape.some(p => !p || p[0] == null || p[1] == null))) shape = null;
      let lat = db.num(b.lat, -90, 90), lng = db.num(b.lng, -180, 180);
      if (shape) { lat = shape.reduce((t, p) => t + p[0], 0) / shape.length; lng = shape.reduce((t, p) => t + p[1], 0) / shape.length }
      const proj = b.kind === 'project', hasGeo = lat != null && lng != null;
      if (!name || (!hasGeo && !proj)) return res.status(400).json({ ok: false, error: 'datos' });
      if (!hasGeo) { lat = null; lng = null }
      const row = { org_id: oid, name, kind: b.kind === 'project' ? 'project' : 'place', description: db.clip(b.description, 160), lat, lng, radius_m: Math.round(db.num(b.radius_m, 30, 1000) || 150) };
      const cta = ctaOf(b);
      let ins = await db.insertRet('places', { ...row, shape, info: db.clip(b.info, 500), hitos: hitosOf(b), ...cta });
      if (!ins) ins = await db.insertRet('places', { ...row, shape, info: db.clip(b.info, 500), ...cta });
      if (!ins) ins = await db.insertRet('places', { ...row, shape, info: db.clip(b.info, 500) }); // SQL nuevo sin ejecutar
      if (!ins) ins = await db.insertRet('places', row); // v8 sin ejecutar: lo guarda como punto con radio
      if (!ins) return res.status(500).json({ ok: false });
      await db.insert('org_targets', { org_id: oid, kind: 'subject', value: name }); // sus votos pasan solos al panel
      return res.status(200).json({ ok: true, id: ins.id });
    }
    if (b.action === 'update_place' && ID.test(String(b.id))) { // edita una zona suya (forma, textos, botón)
      let shape = Array.isArray(b.shape) ? b.shape.slice(0, 60).map(p => Array.isArray(p) ? [db.num(p[0], -90, 90), db.num(p[1], -180, 180)] : null) : null;
      if (shape && (shape.length < 3 || shape.some(p => !p || p[0] == null || p[1] == null))) shape = null;
      const cur = (await db.select(`places?select=name&id=eq.${b.id}&org_id=eq.${oid}&limit=1`))[0]; if (!cur) return res.status(404).json({ ok: false });
      const name = db.clip(b.name, 120) || cur.name, patch = { name, kind: b.kind === 'project' ? 'project' : 'place', description: db.clip(b.description, 160), info: db.clip(b.info, 500), ...ctaOf(b) };
      const hh = hitosOf(b); if (hh) patch.hitos = hh;
      if (shape) { patch.shape = shape; patch.lat = shape.reduce((t, p) => t + p[0], 0) / shape.length; patch.lng = shape.reduce((t, p) => t + p[1], 0) / shape.length }
      else if (b.lat != null && b.lng != null && db.num(b.lat, -90, 90) != null) { patch.lat = db.num(b.lat, -90, 90); patch.lng = db.num(b.lng, -180, 180); patch.shape = null; patch.radius_m = Math.round(db.num(b.radius_m, 30, 1000) || 150) }
      let r = await db.patch(`places?id=eq.${b.id}&org_id=eq.${oid}`, patch);
      if (!r.ok) { delete patch.hitos; r = await db.patch(`places?id=eq.${b.id}&org_id=eq.${oid}`, patch) }
      if (!r.ok) { delete patch.cta_label; delete patch.cta_url; r = await db.patch(`places?id=eq.${b.id}&org_id=eq.${oid}`, patch) }
      if (r.ok && name !== cur.name) await db.insert('org_targets', { org_id: oid, kind: 'subject', value: name });
      return res.status(r.ok ? 200 : 500).json({ ok: r.ok });
    }
    if (b.action === 'route') { // ruta = lista ordenada de zonas (puntos de control)
      const name = db.clip(b.name, 100), ids = Array.isArray(b.place_ids) ? b.place_ids.filter(x => ID.test(String(x))).slice(0, 12) : [];
      if (!name || ids.length < 2) return res.status(400).json({ ok: false, error: 'datos' });
      const own = await db.select(`places?select=id&org_id=eq.${oid}&id=in.(${ids.join(',')})`);
      const okIds = ids.filter(x => Array.isArray(own) && own.some(p => p.id === x));
      if (okIds.length < 2) return res.status(400).json({ ok: false, error: 'zonas' });
      const r = await db.insert('routes', { org_id: oid, name, description: db.clip(b.description, 160), reward: db.clip(b.reward, 200), place_ids: okIds });
      return res.status(r.ok ? 200 : 500).json({ ok: r.ok });
    }
    if (b.action === 'delete_route' && ID.test(String(b.id))) {
      const r = await db.patch(`routes?id=eq.${b.id}&org_id=eq.${oid}`, { active: false }); return res.status(r.ok ? 200 : 500).json({ ok: r.ok });
    }
    if (b.action === 'delete_place' && ID.test(String(b.id))) {
      const r = await db.patch(`places?id=eq.${b.id}&org_id=eq.${oid}`, { active: false }); return res.status(r.ok ? 200 : 500).json({ ok: r.ok });
    }
    if (b.action === 'showcase') { // solo la cuenta «todo Roi» decide qué sale en la landing
      if (!a.org.all_data) return res.status(403).json({ ok: false });
      const v = db.clip(String(b.value || ''), 120).toLowerCase(); if (!v) return res.status(400).json({ ok: false });
      const r = b.hide ? await db.upsert('landing_hide', { value: v }, 'value') : await db.del('landing_hide?value=eq.' + encodeURIComponent(v));
      return res.status(r && r.ok === false ? 500 : 200).json({ ok: !(r && r.ok === false) });
    }
    if (b.action === 'showcase_delete') { // borra de verdad las valoraciones de ese nombre (solo cuenta «todo Roi»)
      if (!a.org.all_data) return res.status(403).json({ ok: false });
      const v = db.clip(String(b.value || ''), 120); if (!v) return res.status(400).json({ ok: false });
      const q = encodeURIComponent(v.replace(/[*,()]/g, ' ').trim());
      const r1 = await db.del('ratings?site=ilike.' + q), r2 = await db.del('ratings?subject=ilike.' + q);
      await db.del('landing_hide?value=eq.' + encodeURIComponent(v.toLowerCase()));
      return res.status(200).json({ ok: !((r1 && r1.ok === false) || (r2 && r2.ok === false)) });
    }
    if (b.action === 'hide_rating' && ID.test(String(b.id))) { // oculta un comentario (de verdad: deja de salir en todos los paneles)
      const me = a.org, rt = (await db.select(`ratings?select=site,subject&id=eq.${b.id}&limit=1`))[0];
      const tg = await db.select('org_targets?select=value&org_id=eq.' + oid);
      const mine = rt && Array.isArray(tg) && tg.some(t => [rt.site, rt.subject].some(v => v && String(v).toLowerCase() === String(t.value).toLowerCase()));
      if (!rt || !(me.all_data || mine)) return res.status(403).json({ ok: false });
      const r = await db.patch(`ratings?id=eq.${b.id}`, { hidden: true }); return res.status(r.ok ? 200 : 500).json({ ok: r.ok });
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
