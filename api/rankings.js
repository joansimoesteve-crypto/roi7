// GET /api/rankings · medias por web, lugar, proyecto y organización + datos «en vivo» para la portada.
// Las personas (type = person) NO aparecen en rankings públicos: solo las ve su dueño en el panel de Supabase.
const db = require('./_db');
module.exports = async (req, res) => {
  if (db.cors(req, res)) return;
  if (!db.ok()) return res.status(503).json({ error: 'sin configurar' });
  const rows = await db.select('ratings?select=client_id,type,subject,site,rating,feeling,lat,lng,created_at&order=created_at.desc&limit=20000');
  if (!Array.isArray(rows)) return res.status(500).json({});
  const hid = await db.select('landing_hide?select=value'), H = new Set(Array.isArray(hid) ? hid.map(x => String(x.value).toLowerCase()) : []);
  const G = { webs: {}, places: {}, projects: {}, orgs: {} }, since = Date.now() - 864e5;
  let n = 0, day = 0, daySum = 0; const recent = [];
  for (const r of rows) {
    if (r.type === 'person' || String(r.client_id).startsWith('demo-')) continue;
    const k = r.type === 'place' ? 'places' : r.type === 'project' ? 'projects' : r.type === 'org' ? 'orgs' : 'webs';
    const name = k === 'webs' ? (r.site || r.subject) : r.subject; if (!name || H.has(String(name).toLowerCase())) continue;
    const g = G[k][name] || (G[k][name] = { name, s: 0, n: 0, la: 0, lo: 0, c: 0 });
    g.s += r.rating; g.n++; n++;
    if (r.lat != null && r.lng != null) { g.la += r.lat; g.lo += r.lng; g.c++; }
    if (Date.parse(r.created_at) >= since) { day++; daySum += r.rating; }
    if (recent.length < 10) recent.push({ rating: r.rating, type: r.type, name, feeling: r.feeling, ts: r.created_at });
  }
  const out = { totals: { n, day, dayAvg: day ? +(daySum / day).toFixed(2) : null }, recent };
  for (const k in G) out[k] = Object.values(G[k]).map(g => ({ name: g.name, avg: +(g.s / g.n).toFixed(2), n: g.n, lat: g.c ? g.la / g.c : undefined, lng: g.c ? g.lo / g.c : undefined }));
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60'); res.status(200).json(out);
};
