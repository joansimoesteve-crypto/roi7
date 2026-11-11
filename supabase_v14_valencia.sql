-- v14 · Piloto Valencia: renombra tu organización y añade zonas, 2 rutas más y 9 proyectos (universidad, ayuntamiento, comercio local)
-- Solo AÑADE (no borra nada). Se puede ejecutar más de una vez.
do $$
declare o uuid;
  za uuid; zb uuid; zc uuid; zd uuid; ze uuid; zf uuid; zg uuid;
begin
  select id into o from organizations where name ilike 'Avatar ROI%' limit 1;
  if o is null then raise exception 'No existe la organización Avatar ROI (ejecuta antes v10)'; end if;
  update organizations set name = 'Avatar ROI · Valencia' where id = o;

  -- helper: crea la zona si no existe y devuelve su id
  create temp table if not exists _z(n text, d text, la float8, lo float8, r int, i text) on commit drop;
  truncate _z;
  insert into _z values
   ('Mercado de Ruzafa','Comercio de barrio: fruta, pescado y producto local',39.4600,-0.3736,150,'Apoya el comercio local de Ruzafa.'),
   ('Mercado Central · Valencia','Uno de los mercados más grandes de Europa',39.4743,-0.3790,150,'Producto fresco y puestos de siempre.'),
   ('Mercado de Colón','Mercado modernista con cafeterías y tiendas',39.4693,-0.3688,150,'Terrazas y comercio en pleno Ensanche.'),
   ('UPV · Campus de Vera','Campus de la Universitat Politècnica de València',39.4812,-0.3411,250,'Ágora, biblioteca y servicios al estudiante.'),
   ('Universitat de València · Blasco Ibáñez','Campus de Humanidades y Ciencias Sociales',39.4786,-0.3640,200,'Biblioteca y secretaría en planta baja.'),
   ('Playa de la Malvarrosa','Paseo marítimo y playa urbana',39.4770,-0.3240,300,'Paseo, chiringuitos y zona deportiva.');
  insert into places(org_id,name,kind,description,lat,lng,radius_m,info)
    select o,n,'place',d,la,lo,r,i from _z z where not exists (select 1 from places p where p.org_id=o and p.name=z.n);
  select id into za from places where org_id=o and name='Mercado de Ruzafa' limit 1;
  select id into zb from places where org_id=o and name='Mercado Central · Valencia' limit 1;
  select id into zc from places where org_id=o and name='Mercado de Colón' limit 1;
  select id into zd from places where org_id=o and name='UPV · Campus de Vera' limit 1;
  select id into ze from places where org_id=o and name='Universitat de València · Blasco Ibáñez' limit 1;
  select id into zf from places where org_id=o and name='Playa de la Malvarrosa' limit 1;

  if not exists (select 1 from routes where org_id=o and name='Ruta del comercio local') then
    insert into routes(org_id,name,description,reward,place_ids)
    values (o,'Ruta del comercio local','Tres mercados de Valencia: valora cada parada y apoya al comercio de barrio',
      '¡Ruta completada! Enseña esta pantalla en tu próximo comercio adherido.', jsonb_build_array(za::text, zb::text, zc::text));
  end if;
  if not exists (select 1 from routes where org_id=o and name='Ruta universitaria hasta el mar') then
    insert into routes(org_id,name,description,reward,place_ids)
    values (o,'Ruta universitaria hasta el mar','De Blasco Ibáñez al Campus de Vera y a la Malvarrosa',
      '¡Ruta completada! Un paseo universitario con vistas al mar.', jsonb_build_array(ze::text, zd::text, zf::text));
  end if;

  create temp table if not exists _p(n text, d text, h jsonb) on commit drop;
  truncate _p;
  insert into _p values
   ('Universidad · Biblioteca abierta en época de exámenes','Ampliar el horario de biblioteca y salas de estudio','[{"t":"Propuesta","s":"hecho"},{"t":"Votación del alumnado","s":"curso"},{"t":"Puesta en marcha","s":"pendiente"}]'),
   ('Universidad · Campus sostenible: carril bici y aparcabicis','Más aparcabicis y conexión ciclista con el campus','[{"t":"Estudio de rutas","s":"hecho"},{"t":"Consulta a la comunidad","s":"curso"},{"t":"Instalación","s":"pendiente"}]'),
   ('Universidad · Huertos y zonas verdes del campus','Espacios verdes y huertos gestionados por estudiantes','[{"t":"Ideas recogidas","s":"hecho"},{"t":"Diseño","s":"curso"},{"t":"Siembra","s":"pendiente"}]'),
   ('Ayuntamiento · Presupuestos participativos de barrio','El vecindario propone y vota en qué invertir','[{"t":"Recogida de propuestas","s":"hecho"},{"t":"Votación vecinal","s":"curso"},{"t":"Resultados","s":"pendiente"}]'),
   ('Ayuntamiento · Más sombra y arbolado en parques','Zonas de sombra y bancos en parques y calles','[{"t":"Diagnóstico por zonas","s":"hecho"},{"t":"Opinión vecinal","s":"curso"},{"t":"Plantación","s":"pendiente"}]'),
   ('Ayuntamiento · Calles tranquilas y peatonales','Pacificar el tráfico en entornos escolares','[{"t":"Propuesta","s":"hecho"},{"t":"Consulta","s":"curso"},{"t":"Prueba piloto","s":"pendiente"}]'),
   ('Comercio · Bono comercio de barrio','Incentivos para comprar en tiendas y mercados del barrio','[{"t":"Diseño del bono","s":"hecho"},{"t":"Comercios adheridos","s":"curso"},{"t":"Lanzamiento","s":"pendiente"}]'),
   ('Comercio · Ruta de mercados con checkpoints','Recorre mercados, valora cada parada y consigue premios','[{"t":"Mercados participantes","s":"hecho"},{"t":"Primera ruta","s":"curso"},{"t":"Premios","s":"pendiente"}]'),
   ('Comercio · Cafeterías y negocios amigables','Distintivo para negocios mejor valorados por su trato','[{"t":"Criterios","s":"hecho"},{"t":"Valoraciones reales","s":"curso"},{"t":"Distintivo","s":"pendiente"}]');
  insert into places(org_id,name,kind,description,hitos)
    select o,n,'project',d,h from _p x where not exists (select 1 from places p where p.org_id=o and p.name=x.n);
end $$;
