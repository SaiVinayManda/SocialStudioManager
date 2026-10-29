# Social Studio implementation plan

Status: **foundation prepared; awaiting owner review**. Inspected on 2026-10-28. This document proposes work; it does not authorize installation or execution.

Updated on 2026-10-29 to record the owner's MoneyPrinterTurbo requirement and n8n publishing/scheduling boundary. Current work remains inspection and foundation documentation only; M4 is not accepted and evaluation execution has not begun.

The subsequent two-engine instruction explicitly authorized read-only Phase A clones now. That inspection exception has been used without checkout or upstream code execution. Current findings are in [VIDEO_ENGINE_COMPARISON.md](VIDEO_ENGINE_COMPARISON.md); the [benchmark protocol](VIDEO_ENGINE_BENCHMARKS.md), [interface](VIDEO_ENGINE_ARCHITECTURE.md) and [estimated backlog](VIDEO_ENGINE_BACKLOG.md) expand the earlier single-engine proposal. Runtime/production gates remain pending; no benchmark has run.

## 1. Environment and repository findings

Repository: `C:\Projects\Manas_Flow\SocialStudio`.

| Area | Observed result | Implication |
| --- | --- | --- |
| Repository | Only `.git` before this foundation; zero tracked/untracked files, no commits, no remotes; unborn branch `master` | No application or existing tests. An owner-approved initial baseline is needed before jobs can reference a commit. |
| Instructions | No `AGENTS.md` in the repository or checked parent directories (`C:\`, `C:\Projects`, `C:\Projects\Manas_Flow`) | This foundation establishes project guidance. |
| Windows | Windows 11 Home Single Language, 64-bit, version 10.0.26300, build 26300.9711; 16 logical processors; 15.8 GB RAM | Native Windows and existing WSL2 are candidates. Validate resource limits before unattended use. |
| Shell and identity | Windows PowerShell 5.1.26100.9711 Desktop; current token is not administrator | Do not assume PowerShell 7 or administrator access. |
| Git and search | Git 2.49.0.windows.1; ripgrep 15.2.0 | Available for local inspection and later approved snapshots. |
| JavaScript | Node.js v22.19.0; npm 10.9.3 | Can prototype the supervisor and tests with Node built-ins without adding dependencies. This is not a Hermes runtime compatibility finding. |
| Python tools | `uv` 0.9.6 and `pip` commands resolve; `python`, `python3`, and `py` do not resolve on this session's PATH | Python may exist elsewhere. Do not conclude it is absent, or download a runtime automatically. Hermes has its own versioned runtime requirements. |
| Codex and Hermes | Neither `codex` nor `hermes` resolves on PATH | Standalone CLI availability/authentication is unverified. Codex application support files are present; they are not evidence of a usable standalone CLI. |
| WSL | WSL 2.6.1.0, kernel 6.6.87.2-1; `Ubuntu-22.04`, `docker-desktop`, and `Ubuntu` are WSL2 and stopped; default is `Ubuntu-22.04` | Reuse may avoid a new distribution, subject to approval. No distribution was started or inspected internally. |
| Docker | Docker CLI 28.0.4 present; reading its user configuration was denied in the sandbox | Engine availability, container isolation, and licensing/account suitability are unverified. No daemon was started and no image was pulled. |
| Other commands | `pwsh`, `gh`, and `winget` do not resolve on this session's PATH | They are not assumed prerequisites; no installation requested by this document alone. |

Initial CIM/WSL enumeration was sandbox-denied. A separately approved read-only inventory outside the sandbox confirmed the OS/RAM and WSL distributions. The Windows product-name registry value was stale (`Windows 10`); the OS caption and build above are the confirmed inventory. No credentials, authentication files, Git remote secrets, or user environment values were read. No software, services, accounts, firewall rules, or startup settings were changed. Disk capacity, installed Linux packages, effective Codex sandbox configuration, model entitlements, and Docker runtime readiness remain unverified.

## 2. Proposed deployment decision

Begin supervisor development using the installed Node runtime, built-in tests, and a fake Codex runner. Keep the deployment interface portable. For live integration, prefer evaluating the existing `Ubuntu-22.04` WSL2 environment with Hermes in a separate restricted gateway runtime and disposable non-root containers for Codex and tests. The trusted supervisor/launcher alone controls the container engine. Workers receive no Docker socket or Windows drive mounts.

This route is **proposed, not selected or provisioned**. Native Windows is also documented by both vendors. Select it only if the pinned tools can enforce equivalent identity, filesystem, process-tree, and network boundaries. WSL alone, an ordinary Git worktree, and running everything as the owner's account do not supply those boundaries. If neither route passes isolation tests, stop and propose a separate VM with its own approval packet.

Use foreground/manual startup first. Automatic startup, waking the machine, changing sleep behavior, and an always-on service are separate decisions. Do not install a new distribution, Docker backend, PowerShell, Python, or Node upgrade just because an installer suggests one.

## 3. Milestones and exit gates

| Milestone | Deliverables | Required exit evidence |
| --- | --- | --- |
| M0 — Foundation (current) | Project instructions, environment inventory, threat model, approval register, proposed backlog and candidate-engine evaluation design | Owner approves the foundation and exact next implementation scope; no live integrations enabled. |
| M1 — Local restricted supervisor | Typed task/approval schemas; protected policy loader; durable queue/audit; fake runner; limits and recovery; built-in unit/integration tests | Adversarial fixtures prove denial of unauthorized tasks, approval forgery, injection, scope escapes, duplicate dispatch, and unsafe restart. No real model calls. |
| M2 — Reviewed runtime and Codex | Version/hash/install review packet; owner-selected host route; credential broker; pinned CLI adapter; isolated runner and test harness | Required installation/credential/admin/spend grants recorded. One supervised canary creates a harmless patch, emits structured progress, runs independent checks, and stops for review. Sandbox denials are tested. |
| M3 — Hermes and Telegram | Reviewed Hermes installation; deterministic ingress; private owner-only bot; narrow supervisor bridge; redacted notifications | Real owner can inspect/start/pause/cancel approved jobs. Unknown users, groups, replayed/stale messages, and forged tool calls cannot start work or approve actions. No inbound public service. |
| M4 — Bounded remote backlog | Approved backlog revision; finite batch scheduler; job/test reports; recovery and revocation runbook | Complete the remote-development acceptance demonstration below; owner signs off. |
| M4V — Candidate video engines | Read-only two-engine Phase A now authorized; after M4 acceptance or an explicit local-POC exception, qualify OpenMontage/MoneyPrinterTurbo with controlled jobs, measured resources and common interface | VA POC backlog evidence and owner decision recorded; production integration stays disabled until accepted. See [comparison](VIDEO_ENGINE_COMPARISON.md) and [estimated backlog](VIDEO_ENGINE_BACKLOG.md). |
| M5 — Studio foundation | Product requirements, data model, private local UI, authentication/roles, storage, backups, and self-hosted packaging | Begin only after M4. Approve product backlog and any dependencies separately. |
| M6 — Content workflow | Drafting, media library, editing, review; accepted topic-to-video adapter and separate FFmpeg long-form-to-reels pipeline; calendar UI delegates schedules to n8n | Human review covers quality, ownership and artifact provenance; MoneyPrinterTurbo production use requires M4V acceptance. n8n is the only scheduling authority; model/media costs separately approved. |
| M7 — Platform integrations through n8n | n8n-owned platform OAuth, publishing workflows, retry/idempotency and audit; Studio submits reviewed artifact references | Separate n8n/integration/credential grants, platform verification, and explicit publishing approvals; generation workers have no publishing credentials or direct posting path. |
| M8 — Operations and analytics | Analytics ingestion, observability, restore drills, resource/cost controls, release process | Private deployment accepted; each public deployment, paid resource, or destructive migration separately approved. |

## 4. Proposed remote-development backlog

All rows are **UNAPPROVED**. These are implementation candidates, not an active queue. The owner may authorize a subset; activation requires immutable task manifests and limits as specified in [REMOTE_DEVELOPMENT.md](REMOTE_DEVELOPMENT.md).

| ID | Depends on | Bounded scope | Acceptance criteria |
| --- | --- | --- | --- |
| RD-01 | M0 approval | Add supervisor skeleton, strict task/result/approval schemas, fixtures, and Node built-in test harness; no dependencies/network | Invalid/unknown fields and arbitrary commands rejected; tests execute locally with a fake runner. |
| RD-02 | RD-01 | Add protected policy/approval adapters, queue transitions, audit, locks, pause/cancel and restart recovery | Expired, replayed, self-issued, changed-digest grants fail; concurrent starts and orphaned processes fail closed. |
| RD-03 | RD-02 | Add isolated launcher abstraction, canonical path checks, environment filtering, time/resource/log limits, and trusted test profiles | Fake adversarial tests pass; produce a concrete host-isolation and installation packet before live setup. |
| RD-04 | RD-03 + separate runtime grants | Provision approved runtime; implement pinned Codex CLI adapter and credential broker; run one local canary | Independent test results and patch report exist; credential, network, path and process boundary probes pass. |
| RD-05 | RD-04 + Hermes/Telegram grants | Install reviewed Hermes; implement deterministic Telegram ingress and narrow bridge; foreground private pilot | Auth/replay/injection tests pass, owner-only status/start/pause/cancel work, no arbitrary shell or approval-grant tool. |
| RD-06 | RD-05 + batch grant | Implement bounded continuation, dependency checks, aggregate budgets, revocation and sanitized summaries | Two harmless approved fixture tasks run in order; failure, pause, limit, or protected change stops dispatch. |
| RD-07 | RD-06 | Execute remote acceptance exercise; write operator/run/restore guidance and evidence | Owner accepts M4; production/product backlog still disabled until explicitly approved. |

Changes to the supervisor, policy, test registry, isolation or ingress are protected. Their patches must be reviewed and deliberately deployed between steps. A running supervisor must never install its own freshly generated replacement to advance the backlog. Later approved tasks may use a reviewed candidate snapshot from a predecessor; protected changes require a new accepted baseline.

### Video evaluation backlog after M4

All rows remain **UNAPPROVED**. The owner has requested this future evaluation; the request does not waive M4 acceptance or supply installation, credential, download, execution or spend grants. Exact tasks, source revisions, limits and expiry must be bound before dispatch. M5 may proceed under its own approved scope after M4; M4V must pass before production adopts MoneyPrinterTurbo.

| ID | Depends on | Bounded scope | Acceptance criteria |
| --- | --- | --- | --- |
| VE-01 | Owner accepts M4; scoped source/evaluation grant | Clone the public repository at a reviewed full commit into an isolated evaluation workspace; inspect licence, dependencies, configuration, API/CLI, maintenance and publishing hooks without running upstream code | Source identity and hashes, maintenance evidence, licence/media obligations, dependency and installation packet, exact paths and human actions recorded. No main application changes. |
| VE-02 | VE-01; itemized runtime/install/model/network/credential/spend grants as needed | Provision only approved dependencies and configuration; run one real topic-to-video sample | Playable local video, subtitles, voiceover, footage/music provenance, redacted logs, actual exits and resource trace; no publishing, undeclared download, paid fallback or owner credential reuse. |
| VE-03 | VE-02; bounded comparison-run grant | Evaluate sample and approved comparisons on RTX 4060 8 GB / 16 GB RAM; compare CPU/NVENC or optional transcription only when available and approved | Human quality rubric and measured RAM/VRAM/CPU/disk/time/network/cost results; failures and unsupported modes recorded. No compatibility claims based on specs alone. |
| VE-04 | VE-03 findings; adapter implementation grant and accepted dependency baseline | Build reusable structured-job adapter in isolation; keep separate FFmpeg long-form-to-reels route and n8n handoff | Contract and real artifact checks pass; timeout/cancel/retry/error/redaction tests pass; no generation-side scheduling/publishing or arbitrary command/path/URL passthrough. |
| VE-05 | VE-04; owner review | Deliver evidence, licence/maintenance risks, required actions and adopt/conditional/defer/reject recommendation | Owner records production decision and approved limits; integration remains disabled until an explicit integration grant. |

## 5. Remote-development acceptance demonstration

- An allowlisted owner in an enrolled private Telegram chat starts an exact approved task. A stranger, group member, forwarded instruction, attachment, edited command, replay, and stale callback cannot start it.
- Hermes has only the approved bridge; prompt injection cannot obtain shell/file/browser/package/cron/delegation access, alter the backlog, or grant approvals.
- A Codex job writes only in its disposable workspace. Probes cannot read owner credentials, modify deployed policy/audit/baseline storage, reach the host/Docker socket, or use unapproved network destinations.
- Progress, exit code, independently run tests, patch hash, changed-path validation, durations and usage are recorded. Failure and missing evidence cannot be reported as success.
- Passing approved tasks advance within the same finite batch. A failing check, protected diff, expired grant, cost/time/attempt limit, or revocation stops progression.
- Pause blocks new dispatch. Cancel kills and verifies the entire job process/container tree. A simulated crash/restart identifies orphans, preserves evidence and remains paused until recovery is confirmed.
- Telegram/model outages do not cause duplicate work or broaden permissions. A restart cannot approve pending work. A local emergency stop works without Telegram.
- No public endpoint, repository push, social post, installation, or billable action occurs outside its explicit grant. Owner reviews the reports and accepts M4 before M5 starts.

## 6. Next review

Review [HUMAN_ACTIONS.md](HUMAN_ACTIONS.md). The immediate decision is foundation approval and, optionally, RD-01 through RD-03 as local code/fixture work only. That does not authorize downloads, credentials, WSL/container startup, system changes, real Codex/Hermes requests, or Telegram messages.

Installation versions/hashes and the actual host changes must be prepared as a concrete packet before asking for those approvals. There is no runnable supervisor or active remote execution in this foundation.

MoneyPrinterTurbo research and the proposed VE backlog are documented in [MONEYPRINTERTURBO_EVALUATION.md](MONEYPRINTERTURBO_EVALUATION.md). Do not clone, install or run it before M4 and the applicable grants. n8n deployment, credentials and live publishing remain separate future approvals.

The latest Phase A instruction supersedes the preceding no-clone rule only for the completed read-only audit. For further work follow the scoped VA approvals in [HUMAN_ACTIONS.md](HUMAN_ACTIONS.md). The VA/VP backlog refines VE-01 through VE-05 for both candidates; inclusion and hour estimates do not activate tasks.
