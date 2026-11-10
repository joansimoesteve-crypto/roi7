-- v10 · Tu cuenta propia (ve TODO lo que se valora en Roi, de webs y lugares) + poder ocultar comentarios
alter table ratings       add column if not exists hidden   boolean not null default false;
alter table organizations add column if not exists all_data boolean not null default false;

-- Evita duplicados si ya habías probado con este correo
delete from org_members where email = 'joansimoesteve@gmail.com';

-- Tu organización «Roi» con plan completo y acceso a todo. Entras en /panel con joansimoesteve@gmail.com
with o as (
  insert into organizations (name, plan, contact, all_data)
  values ('Avatar ROI · Joan Simó', 'completo', 'joansimoesteve@gmail.com', true)
  returning id
)
insert into org_members (org_id, email) select id, 'joansimoesteve@gmail.com' from o;
