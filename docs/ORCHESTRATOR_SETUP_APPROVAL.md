# Milestone E: bounded local installation and local-auth approval requests

State: **BOTH GRANTS PENDING**. The implementation request authorizes ordinary local coding/tests, not these installations or credential operations. No installer, new image, new credential or deployment has run.

Inspection: Docker Desktop 4.40.0 / engine 28.0.4 / Linux WSL2 backend and Compose v2.34.0 are already operational. Cached n8n is 1.116.2, PostgreSQL cache 17.10. They remain untouched. The completed Horror MP4 was reprobed: 60.000 s, 1080x1920 H.264/AAC, 21,303,869 bytes. Existing unrelated services already use port 5432; this deployment exposes no database port.

## E-INFRA-SETUP-01 — software and isolated local deployment

Approve only:

- Docker images `docker.n8n.io/n8nio/n8n:2.45.7` and `postgres:17.11-alpine` from the publishers' registries, Linux amd64. n8n 2.45.7 is the [2026-10-30 stable release](https://github.com/n8n-io/n8n/releases); PostgreSQL 17.11 is in the [official release notes](https://www.postgresql.org/docs/release/17.11/). No `latest`, no Docker/WSL/Windows update.
- Exactly the frozen 14-package pg 8.16.3 closure in `services/studio-runtime/package-lock.json`, SHA256 `a1ce597ee3ea17042f9ba0fe46cdbd7b7087d6a5b7218fa838c0b98335ea331a`, public `registry.npmjs.org` only. Integrity fields bind every tarball. Total published unpacked size 431,898 bytes; scripts/audit/funding requests disabled. No optional pg-native install.
- Create and start only project `socialstudio`, network `socialstudio_internal` (internal), volumes `socialstudio_postgres_data` / `socialstudio_n8n_data`, and the three services in `infrastructure/docker-compose.yml`. Mount only the declared project directories and newly approved secret files. Apply the versioned migrations/seeds only to the fresh isolated databases; import and execute the project workflows. Existing services/databases/volumes are never reused or altered.

Exact installation/start command scope (PowerShell, project root):

```powershell
$env:DOCKER_CONFIG = Join-Path $PWD '.runtime/orchestrator-inspection/docker-empty'
docker pull docker.n8n.io/n8nio/n8n:2.45.7
docker pull postgres:17.11-alpine
npm.cmd ci --prefix services/studio-runtime --ignore-scripts --no-audit --no-fund --registry=https://registry.npmjs.org --cache=.runtime/orchestrator/npm-cache --userconfig=.runtime/orchestrator/empty.npmrc --globalconfig=.runtime/orchestrator/empty-global.npmrc
docker compose -p socialstudio -f infrastructure/docker-compose.yml up -d --pull never
```

The two npmrc files will be new empty project-local files. Saved npm/Docker credentials will not be read or reused. Before installation, recheck the lock digest; after pulling, verify actual image versions/digests and retain nonsecret receipts. Stop on a missing/different version or changed dependency/source. Public anonymous registry transport tokens are not owner-account credentials; no login is performed.

Expected downloads: about 0.6-1.0 GiB compressed images plus less than 1 MiB npm payload; image sizes are estimates until registry manifests are inspected. Hard ceiling **2 GiB additional download payload / 6 GiB additional image+project storage / 90 minutes setup**, measured from the first approved installation command, not this coding phase. USD 0. Only host loopback ports 5678 and 8780; PostgreSQL stays internal. Service memory caps approximately 2.4 GiB total; media concurrency one. No Windows power/network/firewall/account/service/startup changes, no model or 9Router install.

This grant does **not** grant credential creation/use. Starting authenticated services also requires E-LOCAL-AUTH-01.

## E-LOCAL-AUTH-01 — fresh project-local auth only

Approve creation, storage and use of exactly nine **new** random local secret files under `C:\Projects\Manas_Flow\SocialStudio\.runtime\orchestrator\secrets\`:

`pg_bootstrap`, `pg_app`, `pg_n8n`, `control_token`, `n8n_token`, `worker_token`, `webhook_key`, `n8n_encryption`, `n8n_owner_password`.

Use: new isolated PostgreSQL roles/databases, authenticated local control/worker/n8n interfaces, one-use signed webhooks, encryption of this new n8n instance's local credentials, and the new local n8n owner `owner@social-studio.local`. The operator bootstrap may initialize/login to that fresh local account, import local-only header-auth credentials and workflows, and perform an explicitly labelled **mock-only acceptance-test approval** tied to the actual video checksum. It may read only these newly created files for those purposes. No existing credentials/accounts, social OAuth, Telegram, saved Codex/Gemini sessions, 9Router or paid provider keys are included. Values must never be printed, logged, put in command arguments, Git or workflow exports.

Exact generator command, after recording the owner's grant:

```powershell
node scripts/create-studio-local-secrets.mjs --approved=E-LOCAL-AUTH-01
```

The helper creates a previously absent secret directory, determines the current Windows user's SID, and runs only this directory-scoped ACL command before generating keys:

Generator content SHA256: `ab0fbb08746c783f732cdd9cfc7beb71b0a857ce0c04e124910d65eb59989fb1`. Verify it before execution; stop if it differs. Local n8n credential import uses process stdin and encrypted n8n storage, not another plaintext secret file or command argument.

```powershell
icacls.exe C:\Projects\Manas_Flow\SocialStudio\.runtime\orchestrator\secrets /inheritance:r /grant:r "*<current-owner-SID>:(OI)(CI)F" "*S-1-5-18:(OI)(CI)F"
```

This is an explicitly requested ACL change on that new project directory only; no administrator account/elevation or existing-directory ACL change. The generator refuses an existing secret directory. PostgreSQL initialization creates only `studio_bootstrap`, `studio_app`, `n8n_internal`, application schema `studio` in database `social_studio`, and n8n schema/database `n8n`/`n8n_internal` inside the new container volume. Runtime users are non-superuser; bootstrap is container-local. Roles/secret values never appear in execution logs as plaintext passwords.

## Limits, expiry and rollback

Both approvals must be received before **2026-11-06T00:00:00Z**. They apply only to this local mock deployment and acceptance; public publishing, external accounts, public endpoints, new host startup/services or budget expansion need separate grants.

Rollback is nondestructive: stop only the `socialstudio` services and the local worker; retain images, new volumes, files and evidence inactive for review. Keep the new secrets' restrictive ACL. No automatic volume/image/key deletion or credential rotation. Deletion or changing ACLs back to inheritance is a separate owner action. No social content is posted at any point in acceptance.
