-- Avatar ROI · actualización v4 (ubicaciones, informes y alertas). Pégalo en Supabase → SQL Editor → Run.
-- Es seguro ejecutarlo más de una vez y no borra datos.
alter table ratings add column if not exists location text;            -- ubicación dentro del sitio: «Planta 2», «Aula 3.04»…
create index if not exists ratings_loc_idx on ratings (location);

alter table organizations add column if not exists report_weekly boolean not null default true;   -- informe semanal (lunes)
alter table organizations add column if not exists alerts        boolean not null default true;   -- alertas de bajada
alter table organizations add column if not exists last_alert_at timestamptz;
