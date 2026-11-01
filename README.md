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

## Endpoints
- `POST /api/ratings` valoración (rate limit, honeypot, Gemini opcional; se guarda aunque la IA falle)
- `GET /api/rankings` rankings, totales y últimas valoraciones (las de tipo persona no salen)
- `POST /api/leads` contacto de empresas (teléfono obligatorio)

## Móvil
`/v?t=place&n=Café%20Central&u=https://…&s=qr` abre Roi a pantalla completa. La web es instalable (PWA) y en Android aparece en *Compartir → Avatar ROI*.
