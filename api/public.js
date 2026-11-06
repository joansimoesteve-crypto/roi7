// GET /api/public · datos públicos que ve quien vota.
//   ?pulse=<id>  la pregunta puntual (si está activa)      ?n=<nombre>  las últimas novedades publicadas para ese servicio
const db = require('./_db');
module.exports = async (req, res) => {
  if (db.cors(req, res)) return;
  if (!db.ok()) return res.status(503).json({ ok: false });
  if (db.limited(req, 60)) return res.status(429).json({ ok: false });
  const { pulse, n, places } = req.query || {};
  try {
    if (places) { // lugares geolocalizados de las organizaciones (para /mapa)
      const base = 'id,name,kind,description,lat,lng,radius_m';
      let pl = await db.select(`places?select=${base},shape,info&active=eq.true&limit=500`);
      if (!Array.isArray(pl)) pl = await db.select(`places?select=${base}&active=eq.true&limit=500`);
      res.setHeader('Cache-Control', 's-maxage=60'); return res.status(200).json({ ok: true, places: Array.isArray(pl) ? pl : [] });
    }
    if (pulse) {
      if (!/^[0-9a-f-]{32,40}$/i.test(String(pulse))) return res.status(400).json({ ok: false });
      const p = (await db.select('pulses?select=question,subject,type,location,active,closes_at&id=eq.' + pulse + '&limit=1'))[0];
      if (!p || !p.active || (p.closes_at && Date.parse(p.closes_at) < Date.now())) return res.status(404).json({ ok: false });
      res.setHeader('Cache-Control', 's-maxage=30'); return res.status(200).json({ ok: true, question: p.question, subject: p.subject, type: p.type, location: p.location });
    }
    const name = db.clip(n, 160); if (!name) return res.status(400).json({ ok: false });
    const qn = '"' + name.replace(/[\\"]/g, '\\$&') + '"';
    const updQ = cols => db.select(`org_updates?select=${cols}&published=eq.true&target=eq.` + encodeURIComponent(name) + '&order=created_at.desc&limit=3');
    const [u0, rs, pls] = await Promise.all([
      updQ('title,body,created_at,status'),
      db.select('ratings?select=rating&type=neq.person&or=' + encodeURIComponent(`(subject.eq.${qn},site.eq.${qn})`) + '&created_at=gte.' + new Date(Date.now() - 864e5).toISOString() + '&limit=2000'),
      db.select('pulses?select=id,question&active=eq.true&subject=eq.' + encodeURIComponent(name) + '&order=created_at.desc&limit=1')
    ]);
    const u = Array.isArray(u0) ? u0 : await updQ('title,body,created_at');
    // «Hoy han valorado N personas»: solo se enseña a partir de 3 votos, para no señalar a nadie
    const today = Array.isArray(rs) && rs.length >= 3 ? { n: rs.length, avg: Math.round(rs.reduce((s, r) => s + r.rating, 0) / rs.length * 10) / 10 } : null;
    res.setHeader('Cache-Control', 's-maxage=60'); res.status(200).json({ ok: true, updates: Array.isArray(u) ? u : [], today, pulse: Array.isArray(pls) && pls[0] ? pls[0] : null });
  } catch (e) { res.status(500).json({ ok: false }) }
};
