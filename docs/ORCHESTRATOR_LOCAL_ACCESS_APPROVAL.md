# E-LOCAL-ACCESS-01 — fixed loopback proxy proposal

State: **PENDING**, not covered by the original exact three-service/network packet. Original E-INFRA-SETUP-01 and E-LOCAL-AUTH-01 were explicitly approved and used; their frozen packet is unchanged. No change in this proposal has been deployed.

## Verified blocker and completed checks

The three new services started successfully. n8n reports **2.45.7** and its in-container readiness returns HTTP 200. PostgreSQL applied migration 001, seeded six brands and eighteen mock accounts; four real SQL constraint/permission/invalidation assertions passed and rolled back their own fixture. Both runtime database roles are non-superuser/non-createdb/non-createrole; application role cannot connect to n8n's database.

Actual `docker inspect` shows requested `HostConfig.PortBindings` for 127.0.0.1:5678 and :8780, but empty effective `NetworkSettings.Ports`. Neither Windows loopback endpoint connects. The [Docker maintainer explanation](https://github.com/moby/moby/discussions/53256) confirms internal-only networks have no default-gateway network on which to publish ports and recommends a separate fixed proxy. This is also consistent with Docker's [internal network documentation](https://docs.docker.com/reference/cli/docker/network/create/#network-internal-mode---internal). We will not remove application outbound isolation to bypass this restriction.

## Exact proposed scope

- Add only service `loopback-proxy` in the existing `socialstudio` project using the **already installed** `docker.n8n.io/n8nio/n8n:2.45.7` image. No new image, package, model or external download. Node runs only the reviewed proxy module, non-root, read-only filesystem, dropped capabilities, no-new-privileges, 128 MiB RAM / 0.5 CPU. No credentials or media are mounted into it.
- Add one ordinary Docker bridge named **socialstudio_frontend**. Only the proxy joins it and the existing `socialstudio_internal` network. PostgreSQL, n8n and the application stay on the existing internal network with no new outbound route. The proxy has outbound-capable routing but its fixed code only connects to `n8n:5678` or `studio-api:8780`; it has no arbitrary destination/CONNECT/Upgrade interface and logs no request headers/bodies.
- Move the same two host bindings onto the proxy: **127.0.0.1:5678 and 127.0.0.1:8780**. No LAN/public binding, extra port, tunnel, host networking, firewall/Windows/WSL/Docker daemon setting or automatic Windows startup.
- n8n's override sets `N8N_PROXY_HOPS=1` and `N8N_PUSH_BACKEND=sse` for this one local hop; WebSocket tunnelling is deliberately unsupported. Backend authentication remains mandatory. The native worker and tests retain the exact original loopback URLs.
- Recreate only these new project's affected containers, preserving the two approved persistent volumes, roles, nine keys and all original media. Complete the already approved fresh owner/credential/workflow bootstrap and the existing-video mock acceptance. No existing credential access, account connection or real publication.

Exact proposal files and SHA256:

| File | SHA256 |
| --- | --- |
| `infrastructure/docker-compose.local-access.yml` | `4ce3adb9f0cd9c1ee757eb1816dff2ca831594ba8b707a81ed8008b248ff4a07` |
| `services/loopback-proxy/server.mjs` | `39cb42a4ba4f1df48f65d13631a4e9930749ec93dbeab2a810b522fbb6178b67` |

Two local proxy HTTP tests passed; combined Compose config validation passed. These are **not** a claim of successful Docker port publication or end-to-end acceptance.

Exact activation (PowerShell, existing project root), only after explicit grant and matching hashes:

```powershell
$env:DOCKER_CONFIG = Join-Path $PWD '.runtime/orchestrator-inspection/docker-empty'
docker compose -p socialstudio -f infrastructure/docker-compose.yml -f infrastructure/docker-compose.local-access.yml up -d --pull never
node scripts/bootstrap-studio-n8n.mjs --fresh-local-instance
node services/production-adapter/worker.mjs --config .runtime/orchestrator/worker.json
node scripts/studio-e2e.mjs --explicit-mock-test-approval
```

The bootstrap's n8n-only restart uses the combined Compose files so it cannot silently undo the approved network override. Its other CLI/SQL calls still target only the same new project's n8n/PostgreSQL services. Services must pass actual readiness/port-binding checks before bootstrap/test execution.

## Limits, risks, expiry and rollback

Request **one additional 30-minute completion window**, starting at the first approved local-access configuration command, specifically extending the original setup-time allowance for this correction/bootstrap. Original setup began 2026-10-31T06:13:43.085Z and ends at 07:43:43.085Z; no original-grant setup expansion occurs after that deadline without this additional grant. No further software download; cumulative **2 GiB downloads / 6 GiB additional storage / USD 0** caps remain unchanged. New proxy adds only a small container writable layer/log and code; image layers are shared. Grant must be received before **2026-11-06T00:00:00Z**.

Main security change: the small proxy has general outbound routing on its frontend bridge. The application/n8n/database retain isolation; proxy code, fixed targets and lack of secret mounts reduce exposure but do not constitute a host firewall. A compromised proxy would sit on the internal network; backend authentication and database credentials remain required. Do not claim this is the unaccepted Milestone A OS sandbox.

Nondestructive rollback: with the same two `-f` arguments, `docker compose ... stop loopback-proxy`; optionally restore the original three-service definitions with `docker compose -p socialstudio -f infrastructure/docker-compose.yml up -d --pull never`. That restores the original internal-only state (and its inaccessible host ports). Retain all volumes, keys, stopped proxy and network for review; no `down -v`, prune, key deletion, credential rotation or unrelated-container changes.
