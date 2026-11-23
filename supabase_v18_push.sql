-- v18 · Notificaciones push (avisos por zona). Ejecuta en Supabase > SQL Editor.
create table if not exists push_subs (
  id uuid primary key default gen_random_uuid(),
  endpoint text unique not null,
  p256dh text not null,
  auth text not null,
  lat double precision,
  lng double precision,
  radius_km real default 10,
  zone text,
  created_at timestamptz default now(),
  last_sent_at timestamptz
);
alter table push_subs enable row level security;  -- solo la API (clave de servicio) accede
