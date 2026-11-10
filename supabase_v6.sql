-- Avatar ROI · v8: zonas dibujadas, información por zona y estado de las novedades.
-- Supabase → SQL Editor → pega todo → Run. Ejecútalo después de supabase_v5.sql. No borra nada.
alter table places      add column if not exists shape  jsonb;  -- lista de puntos [[lat,lng],...] del polígono dibujado
alter table places      add column if not exists info   text;   -- información útil que ve quien entra en la zona
alter table org_updates add column if not exists status text default 'hecho';  -- estudio | marcha | hecho
