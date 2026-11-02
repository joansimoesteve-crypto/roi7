-- Avatar ROI · panel de organizaciones (Supabase → SQL Editor → pega todo → Run)
-- Ejecútalo DESPUÉS de supabase.sql. No toca las tablas ratings ni leads.

create table if not exists organizations (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text not null,
  plan       text not null default 'muestra' check (plan in ('muestra','completo')),  -- 'completo' = de pago
  contact    text
);

-- Quién puede entrar (por email). El acceso es por enlace que llega a ese correo.
create table if not exists org_members (
  org_id uuid not null references organizations(id) on delete cascade,
  email  text not null,
  primary key (org_id, email)
);

-- Qué valoraciones son de la organización.
--   kind = 'site'    -> coincide con ratings.site (dominio de una web, p. ej. 'uoc.edu')
--   kind = 'subject' -> coincide con ratings.subject (lugar, proyecto u organización, texto exacto)
create table if not exists org_targets (
  id     uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  kind   text not null check (kind in ('site','subject')),
  value  text not null
);
create index if not exists org_targets_org_idx on org_targets (org_id);

-- Solo el servidor (clave service_role) accede.
alter table organizations enable row level security;
alter table org_members   enable row level security;
alter table org_targets   enable row level security;

-- ===== Ejemplo: alta de una organización (cámbialo por los datos reales) =====
-- with o as (insert into organizations (name, plan, contact) values ('Universidad de Ejemplo', 'completo', 'calidad@ejemplo.es') returning id),
--      m as (insert into org_members (org_id, email) select id, 'persona@ejemplo.es' from o)
-- insert into org_targets (org_id, kind, value) select id, 'site', 'ejemplo.es' from o;
--
-- Añadir otro objetivo o persona a una organización existente:
-- insert into org_targets (org_id, kind, value) select id, 'subject', 'Biblioteca Central' from organizations where name = 'Universidad de Ejemplo';
-- insert into org_members (org_id, email) select id, 'otra@ejemplo.es' from organizations where name = 'Universidad de Ejemplo';
--
-- Pasar a de pago:   update organizations set plan = 'completo' where name = 'Universidad de Ejemplo';
-- Volver a muestra:  update organizations set plan = 'muestra'  where name = 'Universidad de Ejemplo';
