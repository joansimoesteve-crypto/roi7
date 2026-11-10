-- Avatar ROI · v7: chat por sala (Supabase → SQL Editor → pega todo → Run). Ejecútalo después de supabase_v4.sql.
create table if not exists chat_messages (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  room       text not null,           -- dominio de la web o nombre del lugar, en minúsculas
  nick       text not null default 'Anónimo',
  body       text not null,
  anon_id    text,
  hidden     boolean not null default false   -- la moderación (IA o la organización) lo oculta
);
create index if not exists chat_messages_room_idx on chat_messages (room, created_at desc);

-- Quién está en la sala ahora (se renueva cada pocos segundos; solo se cuenta, no se muestra)
create table if not exists chat_presence (
  room    text not null,
  anon_id text not null,
  seen_at timestamptz not null default now(),
  primary key (room, anon_id)
);
alter table chat_messages enable row level security;
alter table chat_presence enable row level security;
