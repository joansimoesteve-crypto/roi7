-- Avatar ROI · base de datos única (Supabase → SQL Editor → pega todo → Run)
-- Recibe: valoraciones de la extensión, del marcador, del código para webs, de los QR/enlaces (/v) y de la propia web,
--         y los contactos de empresas.
--
-- ¿Ya ejecutaste la versión anterior de este archivo y aún no tienes datos reales? Ejecuta primero estas dos líneas:
--   drop table if exists ratings cascade;  drop table if exists leads cascade;

create table if not exists ratings (
  id              uuid primary key default gen_random_uuid(),
  client_id       text unique,                     -- id de la valoración en el dispositivo (evita duplicados al reintentar)
  anon_id         text,                            -- id anónimo de la instalación o del navegador
  created_at      timestamptz not null default now(),
  received_at     timestamptz not null default now(),
  source          text not null default 'web'
                  check (source in ('extension','land','web','qr','link','share','bookmarklet','embed')),
  ext_version     text,
  type            text not null check (type in ('web','project','place','org','person')),
  subject         text,                            -- web, iniciativa, elemento, lugar o persona valorada
  site            text,                            -- dominio
  url             text,                            -- origen + ruta, sin parámetros
  target_label    text,                            -- elemento concreto señalado en la web
  rating          smallint not null check (rating between 1 and 5),   -- 1 muy insatisfecho … 5 muy satisfecho
  feeling         text,                            -- sentimiento elegido (p. ej. Estrés, Inspiración)
  comment         text,
  place_name      text,
  lat             double precision,
  lng             double precision,
  place_verified  boolean default false,
  lang            text,
  -- Análisis con IA (Gemini)
  ai_status       text not null default 'none' check (ai_status in ('none','ok','failed')),
  ai_sentiment    text check (ai_sentiment in ('positive','neutral','negative','mixed')),
  ai_score        numeric(3,2),                    -- -1 muy negativo … 1 muy positivo
  ai_topics       text[],
  ai_summary      text,
  ai_flags        text[]                           -- spam, ofensivo, datos_personales, sin_sentido
);
create index if not exists ratings_created_idx on ratings (created_at desc);
create index if not exists ratings_site_idx    on ratings (site, created_at desc);
create index if not exists ratings_type_idx    on ratings (type, created_at desc);
create index if not exists ratings_anon_idx    on ratings (anon_id, created_at desc);

create table if not exists leads (
  id        uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text, org text, phone text, email text, kind text, interest text, message text
);

-- Seguridad: sin políticas = nadie con la clave pública puede leer ni escribir.
-- Solo el servidor (funciones de Vercel con la clave service_role) accede.
alter table ratings enable row level security;
alter table leads   enable row level security;

-- Vista cómoda para tu panel: media diaria por sitio y origen
create or replace view ratings_daily as
select date_trunc('day', created_at) as day, type, source, site,
       count(*) as n, round(avg(rating)::numeric, 2) as avg_rating, round(avg(ai_score), 2) as avg_ai_score
from ratings where type <> 'person' group by 1, 2, 3, 4;
revoke all on ratings_daily from anon, authenticated;
