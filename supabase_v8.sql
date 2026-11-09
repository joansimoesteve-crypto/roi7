-- Avatar ROI · v10: iniciativas con hitos (también sin ubicación) y rutas con puntos de control.
-- Supabase → SQL Editor → pega todo → Run. Ejecútalo después de supabase_v7.sql. No borra nada.
alter table places alter column lat drop not null;
alter table places alter column lng drop not null;
alter table places add column if not exists hitos jsonb;   -- [{"t":"Licitación publicada","s":"hecho"},{"t":"Obras","s":"curso"},{"t":"Inauguración","s":"pendiente"}]

create table if not exists routes (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  org_id      uuid not null references organizations(id) on delete cascade,
  name        text not null,
  description text,
  reward      text,                 -- mensaje al completarla: «¡Ruta completada! Enseña esta pantalla en recepción»
  place_ids   jsonb not null,       -- lista ordenada de ids de zonas (los puntos de control)
  active      boolean not null default true
);
create index if not exists routes_org_idx on routes (org_id);
alter table routes enable row level security;
