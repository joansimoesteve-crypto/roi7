-- Avatar ROI · v9: botón de acción por zona (p. ej. «Reservar pista»). Supabase → SQL Editor → Run. Después de supabase_v6.sql.
alter table places add column if not exists cta_label text;  -- texto del botón: «Reservar pista»
alter table places add column if not exists cta_url   text;  -- enlace (https://…)
