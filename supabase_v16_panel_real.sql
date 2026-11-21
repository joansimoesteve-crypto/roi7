-- v16 Panel del piloto El Real de Gandia. Se puede ejecutar mas de una vez.
-- Ejecutar DESPUES de supabase_v15_real_de_gandia.sql.
-- Crea la organizacion "Piloto · El Real de Gandia", da acceso a urnovai@outlook.es
-- y le pasa las 3 zonas y 2 rutas del Real.

insert into organizations (name, plan, contact)
select 'Piloto · El Real de Gandia', 'completo', 'urnovai@outlook.es'
where not exists (select 1 from organizations where name = 'Piloto · El Real de Gandia');

insert into org_members (org_id, email)
select o.id, 'urnovai@outlook.es' from organizations o
where o.name = 'Piloto · El Real de Gandia'
and not exists (select 1 from org_members m where m.org_id = o.id and lower(m.email) = 'urnovai@outlook.es');

update places set org_id = (select id from organizations where name = 'Piloto · El Real de Gandia' limit 1)
where name like '% · El Real de Gandia';

update routes set org_id = (select id from organizations where name = 'Piloto · El Real de Gandia' limit 1)
where name in ('Paseo saludable por El Real', 'Ruta del forn y el esmorzaret');

insert into org_targets (org_id, kind, value)
select o.id, 'subject', p.name
from organizations o, places p
where o.name = 'Piloto · El Real de Gandia' and p.name like '% · El Real de Gandia'
and not exists (select 1 from org_targets t where t.org_id = o.id and t.kind = 'subject' and t.value = p.name);
