// GET /api/cron · se ejecuta solo cada día a las 07:00 (UTC) desde Vercel (ver «crons» en vercel.json).
//  · Alerta por email si el ánimo de las últimas 24 h baja de forma clara (máximo una cada 3 días por organización).
//  · Informe semanal los lunes con las cifras de la semana.
// Variables: CRON_SECRET (obligatoria; Vercel la envía sola), RESEND_API_KEY, y opcionales REPORTS_FROM_EMAIL y SITE_URL.
// Prueba manual: /api/cron?force=weekly  (con la cabecera Authorization: Bearer <CRON_SECRET>)
const db = require('./_db'), org = require('./_org');
const f1 = v => v == null ? '–' : Number(v).toFixed(1).replace('.', ','), esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SITE = (process.env.SITE_URL || 'https://www.citizenvoice.es').replace(/\/+$/, '');

async function mail(to, subject, html) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.REPORTS_FROM_EMAIL || process.env.LEADS_FROM_EMAIL || 'Avatar ROI <onboarding@resend.dev>', to, subject, html })
  });
  if (!r.ok) console.error('resend', r.status, await r.text());
  return r.ok;
}
const wrap = (title, body) => `<div style="font-family:system-ui,Arial,sans-serif;max-width:560px;margin:auto;color:#26331f;line-height:1.55"><h2 style="margin:0 0 12px">${title}</h2>${body}
<p style="margin:22px 0"><a href="${SITE}/panel" style="background:#3f5a3a;color:#fff;padding:12px 22px;border-radius:99px;text-decoration:none;font-weight:600">Abrir el panel</a></p>
<p style="font-size:12px;color:#4d5c43">Avatar ROI · Valora. Comparte. TU bienestar importa.</p></div>`;
const delta = (a, b) => a == null || b == null ? '' : a - b > 0 ? ` (▲ +${f1(a - b)} frente a la semana anterior)` : a - b < 0 ? ` (▼ ${f1(a - b)} frente a la semana anterior)` : ' (igual que la semana anterior)';

module.exports = async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) return res.status(503).json({ ok: false, error: 'falta CRON_SECRET' });
  if (req.headers.authorization !== 'Bearer ' + secret) return res.status(401).json({ ok: false });
  if (!db.ok() || !process.env.RESEND_API_KEY) return res.status(503).json({ ok: false, error: 'sin configurar' });
  const force = (req.query && req.query.force) || '', weekly = force === 'weekly' || new Date().getUTCDay() === 1, sent = [];
  try {
    const orgs = await db.select('organizations?select=id,name,plan,report_weekly,alerts,last_alert_at');
    for (const o of Array.isArray(orgs) ? orgs : []) {
      const mem = await db.select('org_members?select=email&org_id=eq.' + o.id);
      const to = (Array.isArray(mem) ? mem : []).map(m => m.email).filter(Boolean); if (!to.length) continue;
      const full = o.plan === 'completo', { rows, tg, sites } = await org.load(o.id, 14), c = org.compute(rows, tg, sites, 14, full);
      const now = Date.now(), last = rows.filter(r => now - Date.parse(r.created_at) < 864e5), prior = rows.filter(r => now - Date.parse(r.created_at) >= 864e5);
      const avg = a => a.length ? a.reduce((s, r) => s + r.rating, 0) / a.length : null, a24 = avg(last), aPr = avg(prior);

      if ((o.alerts || force === 'alert') && last.length >= 5 && (force === 'alert' || !o.last_alert_at || now - Date.parse(o.last_alert_at) > 3 * 864e5)
        && (force === 'alert' || a24 <= 2.3 || (prior.length >= 10 && a24 <= aPr - 0.8))) {
        const neg = last.filter(r => r.rating <= 2).length;
        const ok = await mail(to, `Alerta: baja el ánimo en ${o.name}`, wrap('Ha bajado el ánimo',
          `<p>En las últimas 24 horas, <b>${o.name}</b> ha recibido <b>${last.length}</b> valoraciones con una media de <b>${f1(a24)}</b>${aPr != null ? ` (antes: ${f1(aPr)})` : ''}. ${neg} son caritas tristes o enfadadas.</p>
          <p>Conviene revisar qué ha pasado${full ? ': en el panel tienes los comentarios y los temas' : '. Con el plan completo verías los comentarios y los temas'}.</p>`));
        if (ok) { sent.push(['alerta', o.name]); await db.patch('organizations?id=eq.' + o.id, { last_alert_at: new Date().toISOString() }) }
      }

      if (weekly && (o.report_weekly || force === 'weekly')) {
        const T = c.totals, w = c.wellbeing, locs = c.locations, topics = c.topics || [];
        const body = T.n7 ? `<p>Esta semana <b>${o.name}</b> ha recibido <b>${T.n7}</b> valoraciones, con un ánimo medio de <b>${f1(T.avg7)}</b>${delta(T.avg7, T.prevAvg7)}.</p>
          ${w.all != null ? `<p>Índice de bienestar: <b>${w.all}/100</b>${w.digital != null ? ` · digital ${w.digital}` : ''}${w.env != null ? ` · del entorno ${w.env}` : ''}${w.delta != null ? ` (${w.delta > 0 ? '+' : ''}${w.delta} esta semana)` : ''}.</p>` : ''}
          ${locs.length > 1 ? `<p>Mejor ubicación: <b>${esc(locs[locs.length - 1].name)}</b> (${f1(locs[locs.length - 1].avg)}). La que más atención necesita: <b>${esc(locs[0].name)}</b> (${f1(locs[0].avg)}).</p>` : ''}
          ${full ? (topics.length ? `<p>De lo que más se habla: ${topics.slice(0, 4).map(t => esc(t.name)).join(', ')}.</p>` : '') : `<p>Con el plan completo verías los temas y los comentarios de cada semana.</p>`}`
          : `<p>Esta semana no ha llegado ninguna valoración. Un QR visible en el sitio o un enlace en tus mensajes suele mover mucho el número de votos.</p>`;
        if (await mail(to, `Tu resumen semanal · ${o.name}`, wrap('Resumen de la semana', body))) sent.push(['informe', o.name]);
      }
    }
    res.status(200).json({ ok: true, sent });
  } catch (e) { console.error('cron', String(e)); res.status(500).json({ ok: false }) }
};
