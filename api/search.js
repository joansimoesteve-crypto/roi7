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

async function places(q, lat, lng) {
  const bias = isFinite(lat) && isFinite(lng) ? `&lat=${lat}&lon=${lng}` : '';
  try {
    const j = await J(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=7&lang=es${bias}`);
    const out = (j.features || []).map(f => {
      const p = f.properties || {}, c = (f.geometry || {}).coordinates || [];
      const street = [p.street, p.housenumber].filter(Boolean).join(' ');
      const name = p.name || street || p.city || '';
      const sub = [p.name && street ? street : '', p.district, p.city || p.town || p.village, p.state, p.country].filter(Boolean).filter((x, i, a) => a.indexOf(x) === i && x !== name).slice(0, 3).join(', ');
      return { name: clip(name, 80), sub: clip(sub, 120), lat: c[1], lng: c[0], src: 'osm', kind: p.osm_value || p.type || '' };
    }).filter(x => x.name && isFinite(x.lat));
    if (out.length) return out;
  } catch (e) { /* cae a Nominatim */ }
  try {
    const j = await J(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&accept-language=es&addressdetails=0&q=${encodeURIComponent(q)}`);
    return (Array.isArray(j) ? j : []).map(x => { const parts = String(x.display_name || '').split(','); return { name: clip(x.name || parts[0], 80), sub: clip(parts.slice(1, 4).join(',').trim(), 120), lat: +x.lat, lng: +x.lon, src: 'osm', kind: x.type || '' }; }).filter(x => x.name && isFinite(x.lat));
  } catch (e) { return []; }
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
  if (q.length < 2) return res.status(200).json({ ok: true, results: [] });
  const lat = parseFloat(Q.lat), lng = parseFloat(Q.lng);
  let results = [];
  if (t === 'place') results = await places(q, lat, lng);
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
