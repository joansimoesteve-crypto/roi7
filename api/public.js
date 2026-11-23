// GET /api/public · datos públicos que ve quien vota.
//   ?pulse=<id>  la pregunta puntual (si está activa)      ?n=<nombre>  las últimas novedades publicadas para ese servicio
const db = require('./_db');
module.exports = async (req, res) => {
  if (db.cors(req, res)) return;
  if (!db.ok()) return res.status(503).json({ ok: false });
  if (db.limited(req, 60)) return res.status(429).json({ ok: false });
  const { pulse, n, places, sitemap, c, l } = req.query || {};
  try {
    if (sitemap || c) return seo(req, res, { sitemap, c, l }); // SEO: /sitemap-dinamico.xml y /mapa/<municipio>[/<lugar>]
    if (places) { // lugares, iniciativas y rutas de las organizaciones (para /mapa)
      const base = 'id,org_id,name,kind,description,lat,lng,radius_m';
      let pl = null;
      for (const cols of [`${base},shape,info,cta_label,cta_url,hitos,organizations(name)`, `${base},shape,info,cta_label,cta_url,hitos`, `${base},shape,info,cta_label,cta_url`, `${base},shape,info`, base]) {
        pl = await db.select(`places?select=${cols}&active=eq.true&limit=500`); if (Array.isArray(pl)) break;
      }
      pl = (Array.isArray(pl) ? pl : []).map(p => { const o = p.organizations; delete p.organizations; delete p.org_id; if (o && o.name) p.org = o.name; return p });
      let rt = await db.select('routes?select=id,name,description,reward,place_ids&active=eq.true&limit=100');
      res.setHeader('Cache-Control', 's-maxage=60'); return res.status(200).json({ ok: true, places: pl, routes: Array.isArray(rt) ? rt : [] });
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
    const placeQ = async () => { const q = c => db.select(`places?select=${c}&active=eq.true&name=eq.${encodeURIComponent(name)}&limit=1`); let r = await q('info,cta_label,cta_url,hitos'); if (!Array.isArray(r)) r = await q('info,cta_label,cta_url'); if (!Array.isArray(r)) r = await q('info'); return Array.isArray(r) && r[0] ? r[0] : null };
    const [u0, rs, pls, plc] = await Promise.all([
      updQ('title,body,created_at,status'),
      db.select('ratings?select=rating&type=neq.person&or=' + encodeURIComponent(`(subject.eq.${qn},site.eq.${qn})`) + '&created_at=gte.' + new Date(Date.now() - 864e5).toISOString() + '&limit=2000'),
      db.select('pulses?select=id,question&active=eq.true&subject=eq.' + encodeURIComponent(name) + '&order=created_at.desc&limit=1'),
      placeQ()
    ]);
    const u = Array.isArray(u0) ? u0 : await updQ('title,body,created_at');
    // «Hoy han valorado N personas»: solo se enseña a partir de 3 votos, para no señalar a nadie
    const today = Array.isArray(rs) && rs.length >= 3 ? { n: rs.length, avg: Math.round(rs.reduce((s, r) => s + r.rating, 0) / rs.length * 10) / 10 } : null;
    res.setHeader('Cache-Control', 's-maxage=60'); res.status(200).json({ ok: true, updates: Array.isArray(u) ? u : [], today, pulse: Array.isArray(pls) && pls[0] ? pls[0] : null, place: plc });
  } catch (e) { res.status(500).json({ ok: false }) }
};

// ---- SEO hiperlocal: páginas indexables por municipio y lugar (datos reales; sin valoraciones inventadas) ----
const SITE = 'https://www.citizenvoice.es';
const CITIES = [['valencia', 'València', 39.4699, -0.3763, 9], ['el-real-de-gandia', 'El Real de Gandia', 38.9472, -0.1906, 3], ['gandia', 'Gandia', 38.9680, -0.1850, 6], ['picassent', 'Picassent', 39.3625, -0.4619, 4], ['ayora', 'Ayora', 39.0592, -1.0589, 5], ['cofrentes', 'Cofrentes', 39.2306, -1.0642, 4]];
const slug = t => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70);
const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
const km = (a, b, c, d) => { const R = 6371, r = Math.PI / 180, x = (c - a) * r, y = (d - b) * r, h = Math.sin(x / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(y / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
async function seo(req, res, { sitemap, c, l }) {
  const pl0 = await db.select('places?select=name,description,lat,lng,kind,org_id&active=eq.true&limit=500'), pl = (Array.isArray(pl0) ? pl0 : []).filter(p => p.lat != null && p.lng != null);
  const cityOf = p => CITIES.map(x => ({ x, d: km(x[2], x[3], p.lat, p.lng) })).filter(z => z.d <= z.x[4]).sort((a, b) => a.d - b.d)[0];
  if (sitemap) {
    const u = [SITE + '/', SITE + '/mapa', SITE + '/participacion-ciudadana', SITE + '/empresas'];
    CITIES.forEach(x => u.push(SITE + '/mapa/' + x[0]));
    pl.forEach(p => { const z = cityOf(p); if (z) u.push(SITE + '/mapa/' + z.x[0] + '/' + slug(p.name)); });
    res.setHeader('Content-Type', 'application/xml; charset=utf-8'); res.setHeader('Cache-Control', 's-maxage=3600');
    return res.status(200).send('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + [...new Set(u)].map(x => '<url><loc>' + esc(x) + '</loc></url>').join('\n') + '\n</urlset>');
  }
  const city = CITIES.find(x => x[0] === slug(c));
  if (!city) { res.setHeader('Content-Type', 'text/html; charset=utf-8'); return res.status(404).send('<!doctype html><meta charset="utf-8"><title>No encontrado</title><p style="font:18px system-ui;padding:40px">No tenemos ese municipio todavía. <a href="/mapa">Abrir el mapa</a></p>'); }
  const inCity = pl.filter(p => km(city[2], city[3], p.lat, p.lng) <= city[4]);
  let place = null; if (l) { place = inCity.find(p => slug(p.name) === slug(l)); if (!place) { res.setHeader('Content-Type', 'text/html; charset=utf-8'); return res.status(404).send('<!doctype html><meta charset="utf-8"><title>No encontrado</title><p style="font:18px system-ui;padding:40px">No encontramos ese lugar. <a href="/mapa/' + city[0] + '">Ver ' + esc(city[1]) + '</a></p>'); } }
  // valoraciones reales de la zona (solo se enseña la media a partir de 3 votos, para no señalar a nadie)
  const since = encodeURIComponent(new Date(Date.now() - 90 * 864e5).toISOString()), cen = place ? [place.lat, place.lng, 0.3] : [city[2], city[3], city[4]];
  const dl = cen[2] / 111, dn = dl / Math.max(0.2, Math.cos(cen[0] * Math.PI / 180));
  const rs0 = await db.select(`ratings?select=rating,feeling&type=neq.person&created_at=gte.${since}&lat=gte.${cen[0] - dl}&lat=lte.${cen[0] + dl}&lng=gte.${cen[1] - dn}&lng=lte.${cen[1] + dn}&limit=2000`), rs = Array.isArray(rs0) ? rs0 : [];
  const avg = rs.length >= 3 ? (rs.reduce((a, r) => a + r.rating, 0) / rs.length).toFixed(1).replace('.', ',') : null;
  const fe = {}; rs.forEach(r => { if (r.feeling) fe[r.feeling] = (fe[r.feeling] || 0) + 1; }); const top = rs.length >= 3 ? Object.entries(fe).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0]) : [];
  const name = place ? place.name : city[1], title = place ? `Opiniones sobre ${place.name}${slug(place.name).includes(city[0]) ? '' : ' en ' + city[1]} | CitizenVoice` : `Opiniones y estado de servicios, obras y lugares en ${city[1]} | CitizenVoice`;
  const desc = place ? `Qué opina la gente de ${place.name} (${city[1]}). Vota en 10 segundos, sin registro.` : `Qué opina la gente en ${city[1]}: lugares, rutas, trámites y proyectos. Vota en 10 segundos, sin registro.`;
  const canon = SITE + '/mapa/' + city[0] + (place ? '/' + slug(place.name) : '');
  const list = place ? [] : inCity.slice(0, 40);
  const mapUrl = '/mapa?lat=' + cen[0].toFixed(4) + '&lng=' + cen[1].toFixed(4) + '&near=1', vUrl = place ? '/v?t=place&n=' + encodeURIComponent(place.name) + '&s=seo' : mapUrl;
  const ld = place ? { '@context': 'https://schema.org', '@type': 'Place', name: place.name, description: place.description || undefined, geo: { '@type': 'GeoCoordinates', latitude: place.lat, longitude: place.lng }, url: canon } : { '@context': 'https://schema.org', '@type': 'WebPage', name: title, url: canon, about: { '@type': 'City', name: city[1] } };
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${esc(canon)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:image" content="${SITE}/og.png"><meta property="og:type" content="website"><link rel="icon" href="/favicon.png"><script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
<style>body{margin:0;background:#faf6ea;color:#26331f;font:17px/1.5 system-ui,sans-serif}main{max-width:640px;margin:0 auto;padding:20px 16px 60px}a{color:#0b6e44}h1{font-size:28px;line-height:1.2;margin:.4em 0}.b{display:block;text-align:center;background:#139556;color:#fff;border-radius:16px;padding:15px;font-weight:800;text-decoration:none;margin:18px 0}.c{background:#fff;border-radius:18px;padding:14px 16px;margin:12px 0;box-shadow:0 2px 10px rgba(0,0,0,.06)}ul{padding:0;list-style:none}li{padding:9px 0;border-bottom:1px solid #eee}small{color:#667}</style></head><body><main>
<p><a href="/">CitizenVoice</a> › <a href="/mapa/${city[0]}">${esc(city[1])}</a>${place ? ' › ' + esc(place.name) : ''}</p>
<h1>${place ? 'Opiniones sobre ' + esc(place.name) : 'Qué opina la gente en ' + esc(city[1])}</h1>
${place && place.description ? '<p>' + esc(place.description) + '</p>' : ''}
<div class="c">${avg ? `<b>Ánimo medio ${avg} de 5</b> · ${rs.length} valoraciones en los últimos 90 días${top.length ? '<br>Lo que más se siente: ' + top.map(esc).join(', ') : ''}` : `<b>Aún hay pocas valoraciones.</b><br>Se muestra el resultado a partir de 3 opiniones, para proteger a quien opina. Sé de las primeras personas.`}</div>
<a class="b" href="${esc(vUrl)}">Opinar en 10 segundos</a><p><a href="${esc(mapUrl)}">Ver el mapa de ${esc(name)} →</a></p>
${list.length ? '<h2>Lugares y proyectos</h2><ul>' + list.map(p => `<li><a href="/mapa/${city[0]}/${slug(p.name)}">${esc(p.name)}</a>${p.description ? '<br><small>' + esc(String(p.description).slice(0, 110)) + '</small>' : ''}</li>`).join('') + '</ul>' : ''}
<p><small>Opiniones anónimas de personas que han estado allí. CitizenVoice no es un canal oficial del ayuntamiento.</small></p></main></body></html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=86400');
  return res.status(200).send(html);
}
