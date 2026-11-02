// GET /api/panel · datos del panel de una organización. Cabecera: Authorization: Bearer <token de Supabase Auth>.
// Comprueba quién es la persona, a qué organización pertenece y devuelve SOLO las valoraciones de sus objetivos.
// Plan «muestra»: últimos 7 días, sin comentarios ni temas. Plan «completo»: 90 días, comentarios moderados y temas de la IA.
const db = require('./_db');
const BAD = ['spam', 'ofensivo', 'datos_personales', 'sin_sentido'];
const q = v => '"' + String(v).replace(/[\\"]/g, '\\$&') + '"';
const r1 = x => Math.round(x * 100) / 100, day = t => new Date(t).toISOString().slice(0, 10);
const top = (m, k) => Object.entries(m).sort((a, b) => b[1].n - a[1].n).slice(0, k);

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
    const org = (await db.select('organizations?select=id,name,plan&id=eq.' + mem[0].org_id))[0];
    const tg = await db.select('org_targets?select=kind,value&org_id=eq.' + org.id);
    if (!org || !Array.isArray(tg)) return res.status(500).json({ error: 'org' });
    const full = org.plan === 'completo', days = full ? 90 : 7, since = new Date(Date.now() - days * 864e5).toISOString();
    const sites = tg.filter(t => t.kind === 'site').map(t => q(t.value)), subs = tg.filter(t => t.kind === 'subject').map(t => q(t.value));
    const cols = 'id,type,site,subject,rating,feeling,comment,created_at,ai_sentiment,ai_topics,ai_summary,ai_flags';
    const base = `ratings?select=${cols}&type=neq.person&order=created_at.desc&limit=5000`;
    const parts = await Promise.all([
      sites.length ? db.select(`${base}&site=in.(${sites.join(',')})&created_at=gte.${since}`) : [],
      subs.length ? db.select(`${base}&subject=in.(${subs.join(',')})&created_at=gte.${since}`) : []
    ]);
    const seen = new Set(), rows = [].concat(...parts.map(p => Array.isArray(p) ? p : [])).filter(r => !seen.has(r.id) && seen.add(r.id)).sort((a, b) => b.created_at.localeCompare(a.created_at));

    const n = rows.length, dist = [0, 0, 0, 0, 0], D = {}, E = {}, T = {}, X = {};
    let sum = 0, n7 = 0, s7 = 0, nP = 0, sP = 0, today = 0; const t7 = Date.now() - 7 * 864e5, t14 = Date.now() - 14 * 864e5, t1 = Date.now() - 864e5;
    for (const r of rows) {
      dist[r.rating - 1]++; sum += r.rating; const ts = Date.parse(r.created_at);
      const d = D[day(ts)] || (D[day(ts)] = { n: 0, s: 0 }); d.n++; d.s += r.rating;
      if (ts >= t7) { n7++; s7 += r.rating } else if (ts >= t14) { nP++; sP += r.rating }
      if (ts >= t1) today++;
      if (r.feeling) { const e = E[r.feeling] || (E[r.feeling] = { n: 0, s: 0 }); e.n++; e.s += r.rating }
      const nm = r.site && sites.includes(q(r.site)) ? r.site : r.subject || r.site, x = X[nm] || (X[nm] = { n: 0, s: 0, kind: r.type });
      x.n++; x.s += r.rating;
      if (full && Array.isArray(r.ai_topics)) for (const t of r.ai_topics) { const k = String(t).toLowerCase(); (T[k] || (T[k] = { n: 0 })).n++ }
    }
    const daily = []; for (let i = days - 1; i >= 0; i--) { const k = day(Date.now() - i * 864e5), d = D[k]; daily.push({ d: k, n: d ? d.n : 0, avg: d ? r1(d.s / d.n) : null }) }
    const out = {
      org: { name: org.name, plan: org.plan }, email, days,
      totals: { n, avg: n ? r1(sum / n) : null, today, n7, avg7: n7 ? r1(s7 / n7) : null, prevAvg7: nP ? r1(sP / nP) : null, pos: n ? Math.round((dist[3] + dist[4]) * 100 / n) : 0, neg: n ? Math.round((dist[0] + dist[1]) * 100 / n) : 0 },
      dist, daily,
      emotions: top(E, 8).map(([name, v]) => ({ name, n: v.n, avg: r1(v.s / v.n) })),
      targets: top(X, 12).map(([name, v]) => ({ name, kind: v.kind, n: v.n, avg: r1(v.s / v.n) })),
      topics: full ? top(T, 12).map(([name, v]) => ({ name, n: v.n })) : null,
      comments: full ? rows.filter(r => r.comment && !(r.ai_flags || []).some(f => BAD.includes(f))).slice(0, 40).map(r => ({
        rating: r.rating, feeling: r.feeling, comment: r.comment, summary: r.ai_summary, sentiment: r.ai_sentiment, topics: r.ai_topics, name: r.site || r.subject, ts: r.created_at })) : null
    };
    if (!full) { // para mostrar lo que se desbloquea: solo cuántas valoraciones y comentarios hay, sin contenido
      out.locked = { comments: rows.filter(r => r.comment).length };
    }
    res.status(200).json(out);
  } catch (e) { console.error('panel', String(e)); res.status(500).json({ error: 'server' }); }
};
