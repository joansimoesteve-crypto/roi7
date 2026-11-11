// Nombres que son «objetivo» de una organización que NO ha abierto sus datos al público: no salen en la portada.
// Solo los ve el super-admin en su panel (Escaparate), que decide si los muestra.
const db = require('./_db');
module.exports = async () => {
  const orgs = await db.select('organizations?select=id,landing_public,all_data');
  if (!Array.isArray(orgs)) return new Set(); // columna aún sin crear (SQL v13): no filtra nada
  const priv = new Set(orgs.filter(o => o.landing_public === false && !o.all_data).map(o => o.id));
  if (!priv.size) return new Set();
  const tg = await db.select('org_targets?select=org_id,value');
  const f = await db.select('landing_hide?select=value'), F = new Set(Array.isArray(f) ? f.filter(x => String(x.value)[0] === '+').map(x => String(x.value).slice(1)) : []);
  return new Set(Array.isArray(tg) ? tg.filter(t => priv.has(t.org_id)).map(t => String(t.value).toLowerCase()).filter(v => !F.has(v)) : []);
};
