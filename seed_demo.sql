-- Avatar ROI · organización de DEMO con datos reales en Supabase (para enseñar el panel con login real).
-- 1) Cambia TU_CORREO por el correo con el que entrarás. 2) Run. Se puede repetir: borra y recrea la demo.
-- Los votos de demo tienen client_id 'demo-…' y NO salen en los rankings públicos de la portada.
delete from organizations where name = 'Ayuntamiento de Demo';
delete from ratings where client_id like 'demo-%';
with o as (insert into organizations (name, plan, contact) values ('Ayuntamiento de Demo', 'completo', 'demo') returning id),
     m as (insert into org_members (org_id, email) select id, 'TU_CORREO' from o),
     t as (insert into org_targets (org_id, kind, value) select id, 'subject', v from o, unnest(array['Biblioteca Central','Parque del Río','Plaza Mayor','Peatonalización calle Mayor']) v),
     p as (insert into places (org_id, name, kind, description, lat, lng, radius_m)
           select id, v.n, v.k, v.d, v.la, v.lo, 150 from o, (values
             ('Biblioteca Central','place','Sala de estudio y préstamo',39.4699,-0.3763),
             ('Parque del Río','place','Zona verde y paseo',39.4712,-0.3790),
             ('Plaza Mayor','place','Centro y mercado',39.4690,-0.3745),
             ('Peatonalización calle Mayor','project','Proyecto en consulta',39.4705,-0.3752)) v(n,k,d,la,lo))
insert into org_updates (org_id, title, body, target) select id, 'Ampliamos el horario de la biblioteca', 'Desde esta semana abre hasta las 22:00 en época de exámenes.', 'Biblioteca Central' from o;

insert into ratings (client_id, anon_id, type, rating, feeling, source, subject, location, comment, ai_status, ai_sentiment, ai_topics, ai_summary, ai_kind, ai_urgency, created_at)
select 'demo-' || g, 'demo-anon-' || g, case s.n when 'Peatonalización calle Mayor' then 'project' else 'place' end,
  s.r, s.f, 'qr', s.n, s.l, s.c, case when s.c is null then 'none' else 'ok' end,
  case when s.r >= 4 then 'positive' when s.r <= 2 then 'negative' else 'mixed' end,
  case when s.c is null then null else s.t end, s.c, case when s.c is null then null else s.k end, case when s.c is null then null else s.u end,
  now() - (random() * interval '28 days')
from generate_series(1, 160) g
cross join lateral (
  select * from (values
    ('Biblioteca Central', 4, 'Tranquilidad', 'Sala de estudio', 'Muy buen ambiente de estudio.', array['estudio','ambiente'], 'elogio', 0),
    ('Biblioteca Central', 2, 'Agobio', 'Sala de estudio', 'Faltan enchufes y hay mucho ruido.', array['enchufes','ruido'], 'queja', 1),
    ('Biblioteca Central', 3, 'Calma', 'Entrada', null, null, null, 0),
    ('Parque del Río', 5, 'Bienestar', 'Zona infantil', 'Un sitio precioso para pasear.', array['paseo','zonas verdes'], 'elogio', 0),
    ('Parque del Río', 2, 'Decepción', 'Zona infantil', 'Hay columpios rotos desde hace semanas.', array['columpios','mantenimiento'], 'queja', 2),
    ('Plaza Mayor', 3, 'Indiferencia', 'Mercado', 'Pondría más sombra y bancos.', array['sombra','bancos'], 'sugerencia', 0),
    ('Plaza Mayor', 4, 'Confianza', 'Mercado', null, null, null, 0),
    ('Peatonalización calle Mayor', 5, 'Entusiasmo', null, 'Más espacio para caminar, bien.', array['peatonalización','comercio'], 'elogio', 0),
    ('Peatonalización calle Mayor', 1, 'Frustración', null, 'Los comercios no pueden recibir mercancía.', array['carga y descarga','comercio'], 'queja', 1),
    ('Peatonalización calle Mayor', 3, 'Estrés', null, '¿Cuándo termina la obra?', array['obras'], 'pregunta', 0)
  ) as x(n, r, f, l, c, t, k, u) order by random() + g * 0 limit 1) s;
