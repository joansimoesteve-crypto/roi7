-- Avatar ROI · v6 (Supabase → SQL Editor → pega todo → Run). Ejecútalo después de supabase_v3.sql.
-- 1) Lugares geolocalizados de las organizaciones (aparecen en /mapa y en «cerca de ti»)
create table if not exists places (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  org_id      uuid not null references organizations(id) on delete cascade,
  name        text not null,
  kind        text not null default 'place' check (kind in ('place','project')),
  description text,
  lat         double precision not null,
  lng         double precision not null,
  radius_m    int not null default 150,
  active      boolean not null default true
);
create index if not exists places_org_idx on places (org_id);
alter table places enable row level security;

-- 2) Qué tipo de comentario es y cuánta urgencia tiene (lo rellena la IA)
alter table ratings add column if not exists ai_kind    text;   -- queja | sugerencia | elogio | pregunta
alter table ratings add column if not exists ai_urgency int;    -- 0 normal · 1 importante · 2 urgente
