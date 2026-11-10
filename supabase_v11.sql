-- v11 · Escaparate de la landing: lo que tú (cuenta «todo Roi») decides mostrar u ocultar en los rankings públicos
create table if not exists landing_hide (
  value      text primary key,          -- nombre en minúsculas (web, lugar o proyecto)
  created_at timestamptz not null default now()
);
alter table landing_hide enable row level security;
