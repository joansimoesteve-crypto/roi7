// Utilidades compartidas de la API (Vercel). Variables de entorno: SUPABASE_URL y SUPABASE_SERVICE_KEY (secreta, solo en Vercel).
const U = (process.env.SUPABASE_URL || '').replace(/\/+$/, ''), K = process.env.SUPABASE_SERVICE_KEY;
const H = { apikey: K, Authorization: 'Bearer ' + K, 'Content-Type': 'application/json' };

exports.cors = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return true; }
};
exports.ok = () => !!(U && K);
exports.insert = (table, row) => fetch(`${U}/rest/v1/${table}`, { method: 'POST', headers: { ...H, Prefer: 'return=minimal' }, body: JSON.stringify(row) });
// Inserta o actualiza si ya existe (evita duplicados al reintentar): la columna debe ser única
exports.upsert = (table, row, conflict) => fetch(`${U}/rest/v1/${table}?on_conflict=${conflict}`, { method: 'POST', headers: { ...H, Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(row) });
exports.insertRet = async (table, row) => { const r = await fetch(`${U}/rest/v1/${table}`, { method: 'POST', headers: { ...H, Prefer: 'return=representation' }, body: JSON.stringify(row) }); return r.ok ? (await r.json())[0] : null; };
exports.patch = (q, row) => fetch(`${U}/rest/v1/${q}`, { method: 'PATCH', headers: { ...H, Prefer: 'return=minimal' }, body: JSON.stringify(row) });
exports.select = async q => (await fetch(`${U}/rest/v1/${q}`, { headers: H })).json();
exports.clip = (v, n) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, n) : null);
exports.num = (v, lo, hi) => (typeof v === 'number' && isFinite(v) && v >= lo && v <= hi ? v : null);
exports.body = req => { try { return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}; } catch (e) { return null; } };

// Límite de frecuencia sencillo por IP (en memoria; frena abusos básicos)
const hits = new Map();
exports.limited = (req, max = 30, windowMs = 60000) => {
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x', now = Date.now();
  const a = (hits.get(ip) || []).filter(t => now - t < windowMs); a.push(now); hits.set(ip, a);
  if (hits.size > 5000) hits.clear();
  return a.length > max;
};
