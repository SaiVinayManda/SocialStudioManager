#!/bin/sh
set -eu
# Secrets are fresh project-local credentials, provisioned only after approval.
# Never echo passwords or pass them in command arguments.
export STUDIO_APP_PASSWORD="$(cat /run/secrets/pg_app)"
export STUDIO_N8N_PASSWORD="$(cat /run/secrets/pg_n8n)"
psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --set ON_ERROR_STOP=1 <<'SQL'
\getenv app_password STUDIO_APP_PASSWORD
\getenv n8n_password STUDIO_N8N_PASSWORD
CREATE ROLE studio_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION PASSWORD :'app_password';
CREATE ROLE n8n_internal LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION PASSWORD :'n8n_password';
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
CREATE SCHEMA studio AUTHORIZATION studio_bootstrap;
CREATE DATABASE n8n_internal OWNER n8n_internal;
REVOKE CONNECT ON DATABASE social_studio FROM PUBLIC;
GRANT CONNECT ON DATABASE social_studio TO studio_app;
REVOKE CONNECT ON DATABASE n8n_internal FROM PUBLIC;
GRANT CONNECT ON DATABASE n8n_internal TO n8n_internal;
\connect n8n_internal
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
CREATE SCHEMA n8n AUTHORIZATION n8n_internal;
SQL
unset STUDIO_APP_PASSWORD STUDIO_N8N_PASSWORD
migration_checksum="$(sha256sum /studio-migrations/001-foundation.sql | cut -d ' ' -f1)"
psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --set ON_ERROR_STOP=1 --set migration_checksum="$migration_checksum" --file /studio-migrations/001-foundation.sql
psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --set ON_ERROR_STOP=1 --file /studio-seeds/001-brands-mock.sql
