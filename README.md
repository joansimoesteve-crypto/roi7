# Avatar ROI · web + API

Estático (`index.html`, `valorar.html`, `privacy.html`) + funciones en `/api` para Vercel.
Una sola base de datos (Supabase) recibe las valoraciones de la extensión, de `/v` (QR, enlaces, compartir), del marcador y del widget incrustado.

## Puesta en marcha
1. **Supabase**: crea proyecto → SQL Editor → ejecuta `supabase.sql` (si ya tenías tablas antiguas, bórralas antes).
2. **GitHub**: sube esta carpeta a un repositorio.
3. **Vercel**: *Add New → Project* → importa el repo (sin framework, sin build). En *Settings → Environment Variables*:

| Variable | Valor |
|---|---|
| `SUPABASE_URL` | URL del proyecto (https://xxxx.supabase.co) |
| `SUPABASE_SERVICE_KEY` | clave `service_role` (nunca en el navegador) |
| `GEMINI_API_KEY` | clave de Google AI Studio |
| `GEMINI_MODEL` | opcional, por defecto `gemini-3.5-flash-lite` |
| `RESEND_API_KEY` | opcional, para avisarte por email de cada contacto |
| `LEADS_TO_EMAIL` | opcional, por defecto `urnovai@outlook.es` |

   Redespliega tras añadirlas. Los contactos se guardan en Supabase aunque no configures Resend. Con el remitente de pruebas de Resend (`onboarding@resend.dev`) solo llegan avisos al email con el que te registraste en Resend.
4. **Dominio**: sustituye `TU-DOMINIO.vercel.app` en `index.html` (og:image).
5. **Chrome Web Store**: cuando publiques la extensión, pega el enlace en la constante `CHROME_URL` de `index.html`.
6. **Extensión**: en `config.js` pon `API_URL: 'https://TU-DOMINIO.vercel.app/api/ratings'`.
7. **Privacidad**: completa en `privacy.html` nombre, NIF, región de Supabase y plazos.

## Panel de organizaciones (`/panel`)
1. Supabase → SQL Editor: ejecuta `supabase_panel.sql` (después de `supabase.sql`).
2. Vercel → variable nueva `SUPABASE_ANON_KEY` (clave pública «anon» / «publishable»). Redeploy.
3. Supabase → Authentication → URL Configuration: *Site URL* = `https://TU-DOMINIO/panel` y la misma URL en *Redirect URLs*.
4. Supabase → Authentication → SMTP: el correo por defecto de Supabase tiene un límite muy bajo (pocos correos por hora). Para clientes reales conecta Resend por SMTP.
5. Dar de alta una organización: ejemplo comentado al final de `supabase_panel.sql` (organización + correos autorizados + qué webs/lugares son suyos). `plan = 'completo'` desbloquea comentarios y temas; `'muestra'` los bloquea.
6. Enlaces: `/panel` (acceso), `/panel?demo` (muestra completa para reuniones), `/panel?demo=muestra` (cómo ve el plan gratuito).
7. Cuando tengas el enlace de pago de Stripe, pégalo en `UPGRADE_URL` de `panel.html`.

## Ubicaciones, informes y alertas (v4)
1. Supabase → SQL Editor: ejecuta `supabase_v2.sql` (añade la columna de ubicación y los ajustes de informes; no borra nada).
2. Vercel → variables nuevas: `CRON_SECRET` (una clave larga inventada por ti; Vercel la usa para llamar al cron) y, opcional, `REPORTS_FROM_EMAIL` (p. ej. `Avatar ROI <avisos@citizenvoice.es>`, necesita dominio verificado en Resend) y `SITE_URL`.
3. `vercel.json` ya programa `/api/cron` cada día a las 07:00 UTC: los lunes envía el informe semanal y cada día comprueba si hay que mandar una alerta (máximo una cada 3 días por organización).
4. Probar sin esperar: `GET /api/cron?force=weekly` o `?force=alert` con la cabecera `Authorization: Bearer <CRON_SECRET>`.
5. Desactivar a una organización los informes o las alertas: `update organizations set report_weekly = false, alerts = false where name = '...';`
6. QR por ubicación: en el panel (sección «Códigos QR por ubicación») o en la landing («Pide que te valoren» → campo Ubicación). El enlace es `/v?t=place&n=Nombre&l=Planta%202&s=qr`.

## «Tú dijiste, nosotros hicimos» y preguntas puntuales (v5)
1. Supabase → SQL Editor: ejecuta `supabase_v3.sql` (tablas `org_updates` y `pulses`, y la columna `pulse_id` en `ratings`; no borra nada).
2. En el panel (plan `completo`) aparecen dos tarjetas: **Preguntas puntuales** (cada una tiene su enlace `/v?p=<id>` y su QR; sus votos se cuentan aparte) y **Tú dijiste, nosotros hicimos** (la novedad se muestra al terminar de votar en ese servicio).
3. Quien vota ve también «En las últimas 24 h han valorado N personas» cuando hay al menos 3 votos (nunca para personas).
4. `/panel?demo` es una demostración que funciona sin base de datos: puedes crear preguntas y novedades de prueba y desaparecen al recargar.

## Versión definitiva (v6): mapa, lugares y IA que prioriza
1. Supabase → SQL Editor: ejecuta `supabase_v4.sql` (tabla `places` y columnas `ai_kind`, `ai_urgency`; no borra nada). Si aún no lo has ejecutado, todo sigue funcionando, solo sin tipo/urgencia.
2. Sube todo el contenido del zip (incluye la nueva página `mapa.html` y `vercel.json` con la ruta `/mapa`).
3. Panel → «Tus lugares en el mapa»: añade biblioteca, parque, obra… con coordenadas (o «Usar mi ubicación»). Aparecen en `/mapa` y cada uno tiene su QR (`/v?...&g=lat,lng&v=1`: voto «verificado en el lugar»).
4. «Qué hacer esta semana»: temas en alza (7 días frente a los 7 anteriores) y comentarios importantes/urgentes según la IA.
5. Demo con datos reales: edita `seed_demo.sql` (tu correo) y ejecútalo. Sus votos (`client_id` `demo-…`) no salen en rankings públicos. `/panel?demo` sigue funcionando sin base de datos.
6. La ubicación del visitante en `/mapa` se calcula en su móvil y no se envía ni se guarda.

## v8: zonas dibujadas, información por zona y módulos
1. Ejecuta `supabase_v6.sql` (añade `shape` e `info` a `places` y `status` a `org_updates`). Sin él todo funciona, pero las zonas se guardan como punto con radio.
2. Panel → «Publica y escucha»: atajos a Preguntar, Informar, Zona o proyecto, QR y Charla.
3. Zonas: se dibujan tocando las esquinas en el mapa. En `/mapa`, al tocar «Ver lo que tengo cerca», la página sigue la posición mientras esté abierta y avisa al entrar en una zona con su información, sus novedades y su pregunta activa. Con el móvil bloqueado no avisa (limitación de las webs).
4. Novedades con estado (En estudio, En marcha, Hecho) y «Responder públicamente» desde cada comentario.

## Endpoints
- `POST /api/ratings` valoración (rate limit, honeypot, Gemini opcional; se guarda aunque la IA falle)
- `GET /api/rankings` rankings, totales y últimas valoraciones (las de tipo persona no salen)
- `POST /api/auth` envía el enlace de acceso solo a correos de organizaciones
- `GET /api/panel` datos de la organización de quien ha entrado (token de Supabase Auth)
- `POST /api/org` crear/cerrar preguntas y publicar/retirar novedades (plan completo)
- `GET /api/public` pregunta puntual y novedades que ve quien vota
- `GET /api/cron` informe semanal y alertas (solo con `CRON_SECRET`)
- `POST /api/leads` contacto de empresas (teléfono obligatorio)

## Móvil
`/v?t=place&n=Café%20Central&u=https://…&s=qr` abre Roi a pantalla completa. La web es instalable (PWA) y en Android aparece en *Compartir → Avatar ROI*.
