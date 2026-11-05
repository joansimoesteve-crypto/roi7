// Cálculos compartidos del panel y de los informes por email: carga las valoraciones de una organización y las resume.
const db = require('./_db');
const BAD = ['spam', 'ofensivo', 'datos_personales', 'sin_sentido'];
const MIN_GROUP = 3; // privacidad: no se enseña la media de una ubicación con menos votos que esto
// Valor de cada emoción (0 = malestar, 1 = bienestar). El índice de bienestar mezcla la carita (50 %) y la emoción (50 %).
const FEEL = { Enfado: 0, Frustración: 0, Agobio: 0, Decepción: .15, Desconfianza: .15, Estrés: .15, Indiferencia: .5, Desconexión: .4, Calma: .7,
  Confianza: .85, Tranquilidad: .9, Bienestar: 1, Entusiasmo: 1, Plenitud: 1, Inspiración: 1 };
const q = v => '"' + String(v).replace(/[\\"]/g, '\\$&') + '"';
const r1 = x => Math.round(x * 100) / 100, day = t => new Date(t).toISOString().slice(0, 10);
const top = (m, k) => Object.entries(m).sort((a, b) => b[1].n - a[1].n).slice(0, k);
const score = r => 100 * (r.feeling in FEEL ? .5 * (r.rating - 1) / 4 + .5 * FEEL[r.feeling] : (r.rating - 1) / 4);
exports.score = score;

exports.load = async (orgId, days) => {
  const tg = await db.select('org_targets?select=kind,value&org_id=eq.' + orgId);
  if (!Array.isArray(tg)) throw new Error('targets');
  const since = new Date(Date.now() - days * 864e5).toISOString();
  const sites = tg.filter(t => t.kind === 'site').map(t => q(t.value)), subs = tg.filter(t => t.kind === 'subject').map(t => q(t.value));
  const run = async cols => {
    const base = `ratings?select=${cols}&type=neq.person&order=created_at.desc&limit=5000`;
    return Promise.all([
      sites.length ? db.select(`${base}&site=in.(${sites.join(',')})&created_at=gte.${since}`) : [],
      subs.length ? db.select(`${base}&subject=in.(${subs.join(',')})&created_at=gte.${since}`) : []
    ]);
  };
  const c0 = 'id,type,site,subject,location,rating,feeling,comment,created_at,ai_sentiment,ai_topics,ai_summary,ai_flags';
  let parts = await run(c0 + ',ai_kind,ai_urgency');
  if (parts.some(p => !Array.isArray(p))) parts = await run(c0); // v4 sin ejecutar: funciona igual, sin tipo/urgencia
  const seen = new Set();
  const rows = [].concat(...parts.map(p => Array.isArray(p) ? p : [])).filter(r => !seen.has(r.id) && seen.add(r.id)).sort((a, b) => b.created_at.localeCompare(a.created_at));
  return { rows, tg, sites };
};

exports.compute = (rows, tg, sites, days, full) => {
  const n = rows.length, dist = [0, 0, 0, 0, 0], D = {}, E = {}, T = {}, X = {}, L = {};
  let sum = 0, n7 = 0, s7 = 0, nP = 0, sP = 0, today = 0;
  const TP = {}, T14 = Date.now() - 14 * 864e5, T7 = Date.now() - 7 * 864e5;
  const W = { all: [0, 0], dig: [0, 0], env: [0, 0], cur: [0, 0], prev: [0, 0] }; // [suma, n]
  const t7 = Date.now() - 7 * 864e5, t14 = Date.now() - 14 * 864e5, t1 = Date.now() - 864e5;
  for (const r of rows) {
    dist[r.rating - 1]++; sum += r.rating; const ts = Date.parse(r.created_at), sc = score(r);
    const d = D[day(ts)] || (D[day(ts)] = { n: 0, s: 0 }); d.n++; d.s += r.rating;
    W.all[0] += sc; W.all[1]++; const dom = r.type === 'web' ? 'dig' : 'env'; W[dom][0] += sc; W[dom][1]++;
    if (ts >= t7) { n7++; s7 += r.rating; W.cur[0] += sc; W.cur[1]++ } else if (ts >= t14) { nP++; sP += r.rating; W.prev[0] += sc; W.prev[1]++ }
    if (ts >= t1) today++;
    if (r.feeling) { const e = E[r.feeling] || (E[r.feeling] = { n: 0, s: 0 }); e.n++; e.s += r.rating }
    const nm = r.site && sites.includes(q(r.site)) ? r.site : r.subject || r.site, x = X[nm] || (X[nm] = { n: 0, s: 0, kind: r.type }); x.n++; x.s += r.rating;
    if (r.location) { const l = L[r.location] || (L[r.location] = { n: 0, s: 0, w: 0 }); l.n++; l.s += r.rating; l.w += sc }
    if (full && Array.isArray(r.ai_topics)) for (const t of r.ai_topics) { const k = String(t).toLowerCase(); (T[k] || (T[k] = { n: 0 })).n++; const z = TP[k] || (TP[k] = { c: 0, p: 0, s: 0 }); if (ts >= T7) { z.c++; z.s += r.rating } else if (ts >= T14) z.p++ }
  }
  const idx = a => a[1] ? Math.round(a[0] / a[1]) : null;
  const daily = []; for (let i = days - 1; i >= 0; i--) { const k = day(Date.now() - i * 864e5), d = D[k]; daily.push({ d: k, n: d ? d.n : 0, avg: d ? r1(d.s / d.n) : null }) }
  const locAll = Object.entries(L), locOk = locAll.filter(([, v]) => v.n >= MIN_GROUP).sort((a, b) => a[1].s / a[1].n - b[1].s / b[1].n);
  return {
    days,
    totals: { n, avg: n ? r1(sum / n) : null, today, n7, avg7: n7 ? r1(s7 / n7) : null, prevAvg7: nP ? r1(sP / nP) : null, pos: n ? Math.round((dist[3] + dist[4]) * 100 / n) : 0, neg: n ? Math.round((dist[0] + dist[1]) * 100 / n) : 0 },
    wellbeing: { all: idx(W.all), digital: idx(W.dig), env: idx(W.env), nDigital: W.dig[1], nEnv: W.env[1], delta: W.cur[1] && W.prev[1] ? idx(W.cur) - idx(W.prev) : null },
    dist, daily,
    emotions: top(E, 8).map(([name, v]) => ({ name, n: v.n, avg: r1(v.s / v.n) })),
    targets: top(X, 12).map(([name, v]) => ({ name, kind: v.kind, n: v.n, avg: r1(v.s / v.n) })),
    locations: locOk.map(([name, v]) => ({ name, n: v.n, avg: r1(v.s / v.n), idx: Math.round(v.w / v.n) })),
    locHidden: locAll.filter(([, v]) => v.n < MIN_GROUP).reduce((a, [, v]) => a + v.n, 0),
    trending: full ? Object.entries(TP).filter(([, v]) => v.c >= 2 && v.c > v.p).sort((a, b) => (b[1].c - b[1].p) - (a[1].c - a[1].p)).slice(0, 5).map(([name, v]) => ({ name, now: v.c, before: v.p, avg: r1(v.s / v.c) })) : null,
    attention: full ? rows.filter(r => r.ai_urgency >= 1 && r.comment && Date.parse(r.created_at) >= T14).slice(0, 5).map(r => ({ kind: r.ai_kind, urgency: r.ai_urgency, summary: r.ai_summary || r.comment, name: r.site || r.subject, location: r.location, ts: r.created_at })) : null,
    topics: full ? top(T, 12).map(([name, v]) => ({ name, n: v.n })) : null,
    comments: full ? rows.filter(r => r.comment && !(r.ai_flags || []).some(f => BAD.includes(f))).slice(0, 40).map(r => ({
      kind: r.ai_kind, urgency: r.ai_urgency, rating: r.rating, feeling: r.feeling, comment: r.comment, summary: r.ai_summary, sentiment: r.ai_sentiment, topics: r.ai_topics, name: r.site || r.subject, location: r.location, ts: r.created_at })) : null,
    locked: full ? undefined : { comments: rows.filter(r => r.comment).length }
  };
};

// Comprueba el token de Supabase Auth y devuelve la persona y su organización: { email, org } o { status, error }.
exports.auth = async req => {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return { status: 401, error: 'auth' };
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;
  const ur = await fetch(process.env.SUPABASE_URL.replace(/\/+$/, '') + '/auth/v1/user', { headers: { apikey: key, Authorization: 'Bearer ' + token } });
  if (!ur.ok) return { status: 401, error: 'auth' };
  const email = String((await ur.json()).email || '').toLowerCase();
  if (!email) return { status: 401, error: 'auth' };
  const mem = await db.select('org_members?select=org_id&email=eq.' + encodeURIComponent(email) + '&limit=1');
  if (!Array.isArray(mem) || !mem.length) return { status: 403, error: 'sin organización', email };
  const o = (await db.select('organizations?select=id,name,plan&id=eq.' + mem[0].org_id))[0];
  return o ? { email, org: o } : { status: 500, error: 'org' };
};
