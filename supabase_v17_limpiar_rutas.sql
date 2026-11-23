-- v17 Limpieza: borra las rutas de ejemplo de El Real que ya no quieres ver.
-- Las rutas dinamicas del mapa (Relax, Gastro, Tramites, Valoraciones) se generan solas y no estan en la base de datos.
delete from routes where name in ('Paseo saludable por El Real', 'Ruta del forn y el esmorzaret');
-- Si ademas quieres quitar las zonas de ejemplo que sigan existiendo, descomenta:
-- delete from places where name like '% · El Real de Gandia';
