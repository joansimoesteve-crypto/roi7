-- v9 · Avatares cercanos en el mapa (opcional para cada persona, zona aproximada de ~400 m, caduca a los 10 min)
create table if not exists presence_geo (
  anon_id text primary key,
  nick    text not null default 'Anónimo',
  mood    int  not null default 3,
  lat     double precision not null,
  lng     double precision not null,
  seen_at timestamptz not null default now()
);
create index if not exists presence_geo_seen on presence_geo (seen_at);
alter table presence_geo enable row level security;
