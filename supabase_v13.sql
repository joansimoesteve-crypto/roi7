-- v13 · Privacidad por organización: lo que valora la gente en lo de un ayuntamiento NO sale en la portada
-- salvo que tú (super-admin) lo publiques desde el Escaparate o abras todo el municipio.
alter table organizations add column if not exists landing_public boolean not null default false;
-- Para abrir TODO lo de un ayuntamiento al público más adelante:
--   update organizations set landing_public = true where name ilike 'Ayuntamiento de X%';
