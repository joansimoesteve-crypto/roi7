// GET /api/search?q=texto&t=place|web|org|person&lat=..&lng=..
// Buscador unificado. Direcciones y sitios: Photon (OpenStreetMap, pensado para autocompletar) y, si falla, Nominatim.
// Webs y organizaciones: dominio directo + Wikidata (con su web oficial) + SearXNG propio si defines SEARXNG_URL.
// Todo se pide desde el servidor con un User-Agent identificado (lo exigen las normas de OSM) y se cachea en Vercel.
const db = require('./_db');
const UA = 'CitizenVoice/1.0 (+https://www.citizenvoice.es)';
const J = async (url, ms = 3500) => {
  const ac = new AbortController(), tm = setTimeout(() => ac.abort(), ms);
  try { const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json', 'Accept-Language': 'es' }, signal: ac.signal }); if (!r.ok) throw new Error(r.status); return await r.json(); }
  finally { clearTimeout(tm); }
};
const clip = (s, n) => String(s || '').slice(0, n);
const domainOf = q => { const m = String(q).trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split(/[/?#\s]/)[0]; return /^([a-z0-9-]{1,63}\.)+[a-z]{2,24}$/.test(m) ? m : null; };

const hav = (a, b, c, d) => { const r = x => x * Math.PI / 180, h = Math.sin(r(c - a) / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(r(d - b) / 2) ** 2; return 12742 * Math.asin(Math.sqrt(h)); };
const ES = f => !f.properties || !f.properties.countrycode || String(f.properties.countrycode).toUpperCase() === 'ES';
const SPAIN = 'bbox=-18.3,27.4,4.6,43.9'; // España con islas
const fromPhoton = j => (j.features || []).filter(ES).map(f => {
  const p = f.properties || {}, c = (f.geometry || {}).coordinates || [];
  const street = [p.street, p.housenumber].filter(Boolean).join(' '), name = p.name || street || p.city || '';
  const sub = [p.name && street ? street : '', p.district, p.city || p.town || p.village, p.state, p.country].filter(Boolean).filter((x, i, a) => a.indexOf(x) === i && x !== name).slice(0, 3).join(', ');
  return { name: clip(name, 80), sub: clip(sub, 120), lat: c[1], lng: c[0], src: 'osm', kind: p.osm_value || p.type || '' };
});
const fromNominatim = j => (Array.isArray(j) ? j : []).filter(x => !x.address || !x.address.country_code || x.address.country_code === 'es').map(x => { const parts = String(x.display_name || '').split(','); return { name: clip(x.name || parts[0], 80), sub: clip(parts.slice(1, 4).join(',').trim(), 120), lat: +x.lat, lng: +x.lon, src: 'osm', kind: x.type || '' }; });
const fromGeoapify = j => (j.results || []).map(p => ({ name: clip(p.name || p.address_line1 || p.street || '', 80), sub: clip([p.name ? p.address_line1 : '', p.city || p.suburb, p.country].filter(Boolean).filter((x, i, a) => a.indexOf(x) === i).slice(0, 3).join(', '), 120), lat: p.lat, lng: p.lon, src: 'osm', kind: (p.result_type || p.category || '') }));

// Direcciones y sitios: se lanzan varios motores a la vez y se juntan (así si uno falla o no conoce el sitio, otro lo trae).
async function places(q, lat, lng) {
  const has = isFinite(lat) && isFinite(lng), bias = has ? `&lat=${lat}&lon=${lng}` : '';
  const vb = has ? `&viewbox=${lng - .5},${lat + .5},${lng + .5},${lat - .5}` : '';
  const key = process.env.GEOAPIFY_KEY; // opcional y gratis: geoapify.com → mucho mejor con comercios y sitios concretos
  const jobs = [
    J(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=10&lang=es&${SPAIN}${bias}`).then(fromPhoton),
    J(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&accept-language=es&countrycodes=es&addressdetails=1&q=${encodeURIComponent(q)}${vb}`).then(fromNominatim)
  ];
  if (key) jobs.push(J(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(q)}&lang=es&limit=8&format=json&filter=countrycode:es&apiKey=${encodeURIComponent(key)}${has ? `&bias=proximity:${lng},${lat}` : ''}`).then(fromGeoapify));
  const all = (await Promise.allSettled(jobs)).flatMap(r => r.status === 'fulfilled' ? r.value : []).filter(x => x.name && isFinite(x.lat) && isFinite(x.lng));
  const out = [], seen = [];
  for (const x of all) { // quita duplicados: mismo nombre a menos de 150 m
    if (seen.some(y => y.name.toLowerCase() === x.name.toLowerCase() && hav(y.lat, y.lng, x.lat, x.lng) < .15)) continue;
    seen.push(x); out.push(x);
  }
  if (has) out.sort((a, b) => hav(lat, lng, a.lat, a.lng) - hav(lat, lng, b.lat, b.lng));
  return out.slice(0, 8);
}
// Municipios de España (para buscar «tu zona» sin listar todas las calles). Devuelve pueblo/ciudad + provincia/comunidad.
async function munis(q) {
  const tags = ['place:city', 'place:town', 'place:village', 'place:suburb'].map(t => `&osm_tag=${t}`).join('');
  const jobs = [
    J(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=10&lang=es&${SPAIN}${tags}`).then(j => fromPhoton(j).map(x => ({ ...x, sub: x.sub.replace(/,?\s*España$/, ''), kind: 'municipio' }))),
    J(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&accept-language=es&countrycodes=es&addressdetails=1&featuretype=settlement&q=${encodeURIComponent(q)}`).then(j => (Array.isArray(j) ? j : []).filter(x => x.addresstype ? /city|town|village|municipality|suburb|hamlet/.test(x.addresstype) : true).map(x => { const a = x.address || {}; return { name: clip(x.name || String(x.display_name).split(',')[0], 80), sub: clip([a.county || a.province, a.state].filter(Boolean).join(', '), 120), lat: +x.lat, lng: +x.lon, src: 'osm', kind: 'municipio' }; }))
  ];
  const key = process.env.GEOAPIFY_KEY;
  if (key) jobs.push(J(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(q)}&lang=es&limit=8&format=json&type=city&filter=countrycode:es&apiKey=${encodeURIComponent(key)}`).then(j => (j.results || []).map(p => ({ name: clip(p.city || p.name || '', 80), sub: clip([p.county, p.state].filter(Boolean).join(', '), 120), lat: p.lat, lng: p.lon, src: 'osm', kind: 'municipio' }))));
  const all = (await Promise.allSettled(jobs)).flatMap(r => r.status === 'fulfilled' ? r.value : []).filter(x => x.name && isFinite(x.lat) && isFinite(x.lng));
  const out = [];
  for (const x of all) if (!out.some(y => y.name.toLowerCase() === x.name.toLowerCase() && hav(y.lat, y.lng, x.lat, x.lng) < 8)) out.push(x);
  return out.slice(0, 7);
}
async function reverse(lat, lng) {
  try {
    const j = await J(`https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}&lang=es&limit=1`);
    const r = fromPhoton(j)[0]; if (r) return r;
  } catch (e) { /* prueba Nominatim */ }
  try {
    const j = await J(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=es&zoom=18&lat=${lat}&lon=${lng}`);
    if (j && j.display_name) { const parts = String(j.display_name).split(','); return { name: clip(j.name || parts[0], 80), sub: clip(parts.slice(1, 4).join(',').trim(), 120), lat, lng, src: 'osm' }; }
  } catch (e) { /* sin dirección */ }
  return null;
}

async function wikidata(q) {
  try {
    const s = await J(`https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=es&uselang=es&type=item&limit=6&origin=*&search=${encodeURIComponent(q)}`);
    const hits = (s.search || []).slice(0, 6); if (!hits.length) return [];
    let web = {};
    try {
      const g = await J(`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=claims&origin=*&ids=${hits.map(h => h.id).join('|')}`);
      for (const h of hits) { const c = (((g.entities || {})[h.id] || {}).claims || {}).P856; const v = c && c[0] && c[0].mainsnak && c[0].mainsnak.datavalue && c[0].mainsnak.datavalue.value; if (typeof v === 'string' && /^https?:\/\//i.test(v)) web[h.id] = v; }
    } catch (e) { /* sin web oficial */ }
    return hits.map(h => { const u = web[h.id]; return { name: clip(h.label, 80), sub: clip(h.description || '', 120), url: u || '', host: u ? u.replace(/^https?:\/\/(www\.)?/, '').split(/[/?#]/)[0] : '', src: 'wikidata', kind: 'entity' }; });
  } catch (e) { return []; }
}

async function searx(q) {
  const base = process.env.SEARXNG_URL; if (!base || !/^https:\/\//.test(base)) return [];
  try {
    const j = await J(`${base.replace(/\/+$/, '')}/search?format=json&language=es&q=${encodeURIComponent(q)}`, 4000);
    return (j.results || []).slice(0, 5).map(r => { let h = ''; try { h = new URL(r.url).hostname.replace(/^www\./, ''); } catch (e) { return null; } return { name: clip(r.title, 80), sub: h, url: r.url, host: h, src: 'searxng', kind: 'web' }; }).filter(Boolean);
  } catch (e) { return []; }
}

module.exports = async (req, res) => {
  if (db.cors(req, res)) return;
  if (db.limited(req, 90)) return res.status(429).json({ ok: false, results: [] });
  const Q = req.query || {}, q = clip(String(Q.q || '').replace(/[\u0000-\u001f<>]/g, ' ').trim(), 100), t = String(Q.t || 'place');
  if (Q.rev) { const [a, b] = String(Q.rev).split(',').map(parseFloat); if (!isFinite(a) || !isFinite(b)) return res.status(200).json({ ok: true, place: null }); const p = await reverse(a, b); res.setHeader('Cache-Control', 'public, s-maxage=3600'); return res.status(200).json({ ok: true, place: p }); }
  if (q.length < 2) return res.status(200).json({ ok: true, results: [] });
  const lat = parseFloat(Q.lat), lng = parseFloat(Q.lng);
  let results = [];
  if (t === 'muni') results = await munis(q);
  else if (t === 'place') results = await places(q, lat, lng);
  else {
    const d = domainOf(q);
    const [w, s] = await Promise.all([wikidata(q), searx(q)]);
    if (d) results.push({ name: d, sub: 'Usar esta dirección', url: 'https://' + d, host: d, src: 'direct', kind: 'web' });
    const seen = new Set(results.map(r => r.host));
    for (const r of [...w, ...s]) { if (r.host && seen.has(r.host)) continue; if (r.host) seen.add(r.host); results.push(r); }
    results = results.slice(0, 8);
  }
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
  res.status(200).json({ ok: true, results });
};
