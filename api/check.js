// GET /api/check?h=dominio.com · ¿existe ese dominio? Solo consulta DNS (no abre la web), así no hay riesgo de que nos usen para llegar a redes internas.
const dns = require('dns').promises, db = require('./_db');
module.exports = async (req, res) => {
  if (db.cors(req, res)) return;
  if (db.limited(req, 40)) return res.status(429).json({ ok: false });
  let h = String((req.query || {}).h || '').trim().toLowerCase().replace(/^https?:\/\//, '').split(/[/?#:]/)[0].replace(/^www\./, '');
  if (!/^(?=.{4,253}$)([a-z0-9-]{1,63}\.)+[a-z]{2,24}$/.test(h)) return res.status(200).json({ ok: true, valid: false });
  try {
    const t = new Promise((_, rej) => setTimeout(() => rej(new Error('t')), 2500));
    const a = await Promise.race([dns.lookup(h, { all: true }), t]);
    res.setHeader('Cache-Control', 's-maxage=3600'); res.status(200).json({ ok: true, valid: Array.isArray(a) && a.length > 0 });
  } catch (e) { res.status(200).json({ ok: true, valid: false }); }
};
