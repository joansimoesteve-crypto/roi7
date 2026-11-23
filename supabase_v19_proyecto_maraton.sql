-- v19 · Fechas de proyectos + proyecto «Despliegue Maratón · 6 dic» (València). Ejecuta en Supabase > SQL Editor.
alter table places add column if not exists starts_on date;
alter table places add column if not exists ends_on date;

insert into places(org_id, name, kind, description, lat, lng, radius_m, info, starts_on, ends_on, hitos)
select o.id, 'Despliegue Maratón · 6 dic', 'project',
  'Montaje y despliegue del Maratón València en la zona de la Plaza de la Maratón',
  39.4550, -0.3500, 250,
  'Posición aproximada: ajústala en el panel. Aquí irá el resumen oficial: cortes de tráfico, horarios y alternativas.',
  date '2026-12-06', date '2026-12-06',
  '[{"t":"Montaje de infraestructuras","s":"pendiente"},{"t":"Día de la prueba","s":"pendiente"},{"t":"Desmontaje y reapertura","s":"pendiente"}]'::jsonb
from (select id from organizations where name ilike 'Avatar ROI%' order by created_at limit 1) o
where not exists (select 1 from places p where p.name = 'Despliegue Maratón · 6 dic');
-- Fechas: ajusta inicio y fin (montaje/desmontaje) desde el panel > Tus lugares en el mapa.
