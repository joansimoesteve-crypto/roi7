// Avatares cercanos en el mapa. Solo si la persona lo activa. Nunca se guarda ni se devuelve la posición exacta:
// se redondea a una cuadrícula de ~400 m y se desplaza un poco de forma estable. Caduca a los 10 minutos.
//   POST { anon_id, nick, mood, lat, lng }        → "estoy aquí" (cada ~60 s mientras el mapa está abierto)
//   POST { anon_id, off:true }                    → deja de mostrarme
//   GET  ?lat=&lng=                               → [{nick, mood, lat, lng}] de otras personas en ~3 km
const db = require('./_db');
const GRID = 0.004, BLOCK = /(https?:|www\.|@|\.com|\.es|\d{6,})/i;
const snap = (v, id, k) => { let h = 0; for (const c of id + k) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.round(v / GRID) * GRID + (((h >>> 0) % 1000) / 1000 - .5) * GRID * .8; };
module.exports = async (req, res) => {
  if (db.cors(req, res)) return;
  if (db.limited(req, 60)) return res.status(429).json({ ok: false });
  if (!db.ok()) return res.status(200).json({ ok: true, people: [] });
  try {
    if (req.method === 'POST') {
      const b = db.body(req) || {}, id = db.clip(b.anon_id, 64);
      if (!id) return res.status(400).json({ ok: false });
      if (b.off) { await db.del(`presence_geo?anon_id=eq.${encodeURIComponent(id)}`); return res.status(200).json({ ok: true }); }
      const la = db.num(b.lat, -90, 90), lo = db.num(b.lng, -180, 180);
      if (la == null || lo == null) return res.status(400).json({ ok: false });
      let nick = (db.clip(b.nick, 20) || 'Anónimo').replace(/[<>]/g, '').trim() || 'Anónimo'; if (BLOCK.test(nick)) nick = 'Anónimo';
      const mood = Math.max(0, Math.min(4, parseInt(b.mood, 10) || 3));
      const r = await db.upsert('presence_geo', { anon_id: id, nick, mood, lat: +snap(la, id, 'a').toFixed(5), lng: +snap(lo, id, 'b').toFixed(5), seen_at: new Date().toISOString() }, 'anon_id');
      return res.status(r.ok ? 200 : 500).json({ ok: r.ok });
    }
    const Q = req.query || {}, la = parseFloat(Q.lat), lo = parseFloat(Q.lng), me = String(Q.a || '').slice(0, 64);
    if (!isFinite(la) || !isFinite(lo)) return res.status(200).json({ ok: true, people: [] });
    const since = encodeURIComponent(new Date(Date.now() - 10 * 60e3).toISOString());
    const rows = await db.select(`presence_geo?select=anon_id,nick,mood,lat,lng&seen_at=gte.${since}&lat=gte.${la - .03}&lat=lte.${la + .03}&lng=gte.${lo - .04}&lng=lte.${lo + .04}&limit=40`);
    const people = (Array.isArray(rows) ? rows : []).filter(x => x.anon_id !== me).map(x => ({ nick: x.nick, mood: x.mood, lat: x.lat, lng: x.lng }));
    res.setHeader('Cache-Control', 'no-store'); res.status(200).json({ ok: true, people });
  } catch (e) { res.status(200).json({ ok: true, people: [] }); }
};
