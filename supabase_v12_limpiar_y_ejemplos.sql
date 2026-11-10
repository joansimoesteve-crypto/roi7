-- v12 · LIMPIAR datos de prueba + EJEMPLOS reales de zonas y ruta (para enseñar el potencial)
-- Ejecuta por bloques. El BLOQUE 1 borra de verdad; el 2 crea ejemplos en TU organización.

-- ===== BLOQUE 1 · BORRAR TODO LO DE PRUEBA (valoraciones, charla, presencia, ocultos) =====
delete from ratings;
delete from chat_messages;
delete from presence_geo;
delete from landing_hide;
-- Zonas, rutas y avisos de TODAS las organizaciones (si solo quieres los tuyos, salta esta línea)
delete from routes;
delete from places;

-- ===== BLOQUE 2 · EJEMPLOS en la organización «Avatar ROI · Joan Simó» =====
do $$
declare o uuid; a uuid; b uuid; c uuid; d uuid; e uuid;
begin
  select id into o from organizations where name ilike 'Avatar ROI%' limit 1;
  if o is null then raise exception 'No existe la organización Avatar ROI (ejecuta antes v10)'; end if;

  insert into places(org_id,name,kind,description,lat,lng,radius_m,info)
    values (o,'Plaza del Ayuntamiento · Valencia','place','Punto de encuentro del centro',39.4699,-0.3774,180,'Atención ciudadana en el edificio consistorial.') returning id into a;
  insert into places(org_id,name,kind,description,lat,lng,radius_m,info)
    values (o,'Jardín del Turia · Gulliver','place','Parque para pasear y hacer deporte',39.4625,-0.3590,220,'Zona de juegos y carril peatonal.') returning id into b;
  insert into places(org_id,name,kind,description,lat,lng,radius_m,info)
    values (o,'Parque de Cabecera','place','Lago, paseo y zonas verdes',39.4695,-0.4017,250,'Alquiler de barcas en temporada.') returning id into c;
  insert into places(org_id,name,kind,description,lat,lng,radius_m,info)
    values (o,'Universitat de València · Blasco Ibáñez','place','Campus de Humanidades y Ciencias Sociales',39.4786,-0.3640,200,'Biblioteca y secretaría en planta baja.') returning id into d;
  insert into places(org_id,name,kind,description,hitos,info)
    values (o,'Presupuestos participativos 2027','project','El vecindario propone y vota en qué se invierte una parte del presupuesto',
      '[{"t":"Recogida de propuestas","s":"hecho"},{"t":"Votación vecinal","s":"curso"},{"t":"Resultados","s":"pendiente"}]'::jsonb,
      'Ejemplo de proyecto de participación ciudadana.') returning id into e;

  insert into routes(org_id,name,description,reward,place_ids)
    values (o,'Ruta saludable por el Turia','Camina del jardín al parque y valora cada parada',
      '¡Ruta completada! Has recorrido una ruta saludable.', jsonb_build_array(b::text, c::text, a::text));
end $$;
