// GET /api/nearby?lat&lng&r&lim · sitios con nombre cerca (OpenStreetMap/Overpass) desde el servidor: más fiable y con caché.
const ENDPOINTS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const u = new URL(req.url, 'http://x'), lat = +u.searchParams.get('lat'), lng = +u.searchParams.get('lng');
  const r = Math.min(Math.max(+u.searchParams.get('r') || 500, 100), 1500), lim = Math.min(Math.max(+u.searchParams.get('lim') || 40, 10), 100);
  if (!(lat > 27 && lat < 44 && lng > -19 && lng < 5)) return res.status(400).json({ error: 'coords' });
  const at = `(around:${r},${lat.toFixed(4)},${lng.toFixed(4)})`;
  const q = `[out:json][timeout:10];(nwr${at}["name"]["amenity"~"^(restaurant|cafe|bar|fast_food|ice_cream|library|pharmacy|hospital|clinic|university|college|school|townhall|post_office|bank|cinema|theatre)$"];nwr${at}["name"]["leisure"~"^(park|playground|pitch|sports_centre|fitness_centre|swimming_pool)$"];nwr${at}["name"]["tourism"="museum"];nwr${at}["name"]["shop"~"^(supermarket|mall|clothes|bakery|books|sports|electronics)$"];);out center ${lim};`;
  for (const e of ENDPOINTS) {
    try {
      const f = await fetch(e, { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'CitizenVoice/1.0 (+https://www.citizenvoice.es)' }, signal: AbortSignal.timeout(9000) });
      if (!f.ok) continue; const j = await f.json();
      res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600'); return res.status(200).json({ elements: j.elements || [] });
    } catch (_) { }
  }
  res.status(502).json({ error: 'overpass' });
};
