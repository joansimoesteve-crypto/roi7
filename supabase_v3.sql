-- Avatar ROI · actualización v5 («Tú dijiste, nosotros hicimos» y preguntas puntuales).
-- Pégalo en Supabase → SQL Editor → Run. Se puede ejecutar más de una vez y no borra datos.

-- Novedades que publica una organización: se muestran a quien vota en ese servicio.
create table if not exists org_updates (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organizations(id) on delete cascade,
  created_at timestamptz not null default now(),
  title      text not null,
  body       text,
  target     text,                       -- web (dominio) o lugar/proyecto (texto exacto) al que se refiere
  published  boolean not null default true
);
create index if not exists org_updates_target_idx on org_updates (target, created_at desc);

-- Preguntas puntuales con su propio enlace y QR.
create table if not exists pulses (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organizations(id) on delete cascade,
  created_at timestamptz not null default now(),
  question   text not null,
  subject    text not null,
  type       text not null default 'place' check (type in ('web','project','place','org')),
  location   text,
  active     boolean not null default true,
  closes_at  timestamptz
);

alter table ratings add column if not exists pulse_id uuid;
create index if not exists ratings_pulse_idx on ratings (pulse_id);

alter table org_updates enable row level security;
alter table pulses      enable row level security;
