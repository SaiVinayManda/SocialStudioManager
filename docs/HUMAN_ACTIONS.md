# Human actions and approval register

## Milestone E immediate blocker — 2026-10-31

Owner approval is still needed for **E-INFRA-SETUP-01** and separately **E-LOCAL-AUTH-01**, exactly as scoped in [ORCHESTRATOR_SETUP_APPROVAL.md](ORCHESTRATOR_SETUP_APPROVAL.md), SHA256 `7ae25c85329724af724b676bc69c2802a17f1ec24136ba8cb06dc0e0920ee26a`. No approval record/secret directory has been created. The prior B grants are consumed and do not authorize these operations.

- Infrastructure: n8n 2.45.7 + PostgreSQL 17.11-alpine images and the frozen 14-package pg 8.16.3 closure; only isolated `socialstudio` Compose resources, two loopback ports and fresh databases. Maximum 2 GiB downloads / 6 GiB storage / 90-minute setup / USD 0. No Windows/Docker backend/startup changes. Nondestructive rollback stops only the new resources.
- Local auth: exactly nine new project-local keys; owner/SYSTEM ACL on the new secret directory; fresh local PostgreSQL/n8n owner/internal interfaces and a labelled checksum-bound mock acceptance decision. No existing/social/Telegram/model credentials, external accounts or live posting. Both grants expire if not received by 2026-11-06T00:00:00Z.

After setup, owner video preview/pacing review and any real publishing decision remain separate. Current platform plans are disabled; Meta's current version-specific documentation/permission checks remain incomplete (HTTP 429). Google Drive/OAuth, Hermes notifications, Windows startup, backup restore and any public media hosting need their own scope/approval. [Runbook](ORCHESTRATOR_OPERATIONS.md) lists prepared commands and partial-failure recovery.

## Current implementation authorization and next actions

**Current Milestone E gates:** [E-INFRA-SETUP-01](ORCHESTRATOR_SETUP_APPROVAL.md) covers exactly the new pinned images/locked pg packages and isolated local Compose deployment. **E-LOCAL-AUTH-01 is separate**, covering nine fresh project-local secrets, the new directory's owner/SYSTEM ACL and this fresh n8n/PG instance's local auth only. Neither is granted by this checklist. No existing credentials, external account connections, new host services/startup or live publishing are included. Ordinary E coding/tests/commits are explicitly authorized by the latest owner request; A remains deferred.

**Immediate owner action: review the completed local video** at `generated-videos/horror/pilot-001/final/horror_pilot_001.mp4` or its smaller preview. Automated checks and sampled caption visibility passed; subjective narration, pacing and subtitle synchronization need listening. No new setup/media approval is pending for this completed pilot. Publishing remains prohibited until a separate explicit grant; do not access social credentials or resume advanced supervisor work.

**Latest priority change:** the owner explicitly deferred advanced A hardening and authorized the local OpenMontage Horror pilot before A acceptance. A-03 protected deployment is deferred, not requested now. Supervisor code/tests/history remain preserved and live dispatch disabled. This replaces the A-first sequencing below only for the local pilot.

**B-PILOT-SETUP-01 was explicitly approved by the owner**, with its initially partial work subsequently completed under B-PILOT-CONTINUE-01. Source, venv, 52 locked dependencies, portable FFmpeg and voice are ready; real narration/encoding/registry/dependency checks pass. Do not reinstall completed components. Cumulative limits remain 100 wheels / 750 MiB downloads / 3 GiB storage / USD 0 paid API calls; the completed setup windows are historical, not permission for more installs. No credential/system/publishing grant.

**B-PILOT-CONTINUE-01 was explicitly approved** by the owner's subsequent "approve" reply to that exact request. The 22:22:00-22:42:00 UTC window was recorded without changing cumulative caps. Resolution, wheel verification/offline installation, real Piper test and actual local registry preflight completed by 22:40:41 UTC. No further installation grant is being requested for those completed components. [Actual evidence](TEST_RESULTS.md).

**B-PILOT-MEDIA-01 was explicitly approved** by the owner's exact reply `approve B-PILOT-MEDIA-01`. The frozen packet digest and received-before-expiry check are recorded in [the receipt](test-evidence/openmontage-pilot-assets-01/media-approval.json). It includes unchanged full-run creative preauthorization, recorded upstream as approval_policy. Three item-licensed clips were downloaded, hashed and decoded; narration, original audio and subtitles are prepared. The 20-minute acquisition window is consumed; its original packet's PENDING label is historical.

**B-PILOT-MEDIA-CONTINUE-01 was explicitly approved and executed**, not pending. Frozen packet SHA256 `7845bbe366c0ebc2918f0c4b914dfa00f2beee1697924c3a9215c0bcd421dedd` matched before execution; grant received before expiry. Three exact clips / 11,459,413 bytes acquired by 18:34:57 UTC inside the recorded 20-minute window. [Owner-grant receipt](test-evidence/openmontage-pilot-render-01/media-continuation-approval.json), [window](test-evidence/openmontage-pilot-render-01/media-continuation-session.json), [result](test-evidence/openmontage-pilot-render-01/render_report.json). No cumulative budget increase, unrelated download or paid call. Authored packets remain frozen; their original PENDING labels are historical. The grant is consumed, not open permission for future downloads.

Any further scope expansion needs a separate grant. No external music was fetched; score/effects are original local synthesis. Do not replace missing interior footage with a slideshow or claim the audio preview/synthetic encoding test is a finished pilot.

The preceding **A-AUTH-METADATA-01 is completed**, not pending: the owner explicitly approved its exact existing packet, expiry and helper/dependency hashes matched, and the command exited 0. The [sanitized result](research/auth-metadata-A-AUTH-METADATA-01.json) retains no secret values. It is a consumed one-inspection grant, not permission to access credentials again. Authentication validity and Telegram ownership remain unverified.

The rows and A deployment requests below are preserved history; current B actions above take precedence.

The previous implementation request authorized ordinary Milestone A coding/tests/docs/checkpoints; the latest request adds the bounded local B pilot described above and defers advanced A work. OpenMontage remains primary and MoneyPrinterTurbo/Postiz excluded. This records owner instructions, not installations, credentials, paid usage, system changes, protected deployment or publishing grants.

The existing evaluation was preserved in local baseline commit d691604. The local supervisor now has 77/77 checks plus a separate process-based fixture canary; [actual evidence](TEST_RESULTS.md) preserves the earlier 51-test checkpoint and explicitly keeps Milestone A unaccepted. No authenticated Codex/Telegram call was made. Existing installed tools are not to be reinstalled merely because PATH lookup failed.

| Current action | State / exact next intervention |
| --- | --- |
| Local A coding/tests/checkpoint commits | Authorized by the owner's current development workflow; implemented local core and evidence ready for review |
| OpenMontage selection | Owner decision recorded; do not integrate MoneyPrinterTurbo or Postiz; keep prior staging evidence/cache intact |
| Telegram enrollment | Configured user/home-chat candidates found in the approved inspection; actual ownership is not verified and no enrollment change was made |
| A-AUTH-METADATA-01 | **COMPLETED under explicit owner approval**, exact helper unchanged; [sanitized receipt](research/auth-metadata-A-AUTH-METADATA-01.json). No authentication use or renewal granted |
| A-03 authority store | Local pinned reader, directory registry, deployment binding and persisted revocation tests implemented. Review [AUTHORITY_STORE.md](AUTHORITY_STORE.md); the example has no grants/enrollment and cannot activate anything |
| Native runtime and protected deployment | **DEFERRED by owner**; no directories/accounts/ACLs deployed. Do not continue this advanced supervisor task now |
| Existing credential use and live canary | Requires separate provider/model/data-flow/limits/budget/expiry grant after readiness is understood; no saved CLI authentication or bot token has been reused |
| Actual Milestone A acceptance | Real owner Telegram launch, approved Codex task, independent checks, actual result delivery and deployed negative/recovery tests; **NOT RUN** |
| OpenMontage Horror pilot and later milestones | Local pilot explicitly authorized before A acceptance; setup/models still need B-PILOT-SETUP-01. Other product/infrastructure/publishing milestones remain out of scope |

Completed metadata command: `node scripts/inspect-auth-metadata.mjs --inspect-approved=A-AUTH-METADATA-01`. The original [review packet](LIVE_SUPERVISOR_REVIEW.md) and sanitized receipt preserve its approved limits and observed result. Do not rerun from its old pending label or infer credential-use permission.

Earlier FND/DEV/GIT/VE/VA requests below are historical planning records where superseded by this current section. Their pending rows are not permission to activate a remote queue or install any engine. Completed owner-approved MoneyPrinterTurbo staging remains a historical completed action, not current integration authority.

Status: **all future grants below are pending**. The owner requested an inspection/documentation phase first. This file records proposed interventions; it is not an approval database and agents cannot turn its checkboxes into authority.

Latest scope, 2026-10-29: the owner explicitly requested a **read-only Phase A audit with isolated clones of both OpenMontage and MoneyPrinterTurbo now**. This supersedes the earlier no-early-clone sequencing for that inspection scope only. The anonymous no-checkout clones were completed in a temporary evaluation directory after the tool's network approval; no upstream code ran. This records the owner's instruction and observed work, not a self-issued grant. M4 acceptance, installation, credentials, model downloads, paid usage, execution and production integration remain separately gated.

## 1. Immediate decision

- [ ] **FND-01 — Approve the foundation.** Review [AGENTS.md](../AGENTS.md), [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md), [REMOTE_DEVELOPMENT.md](REMOTE_DEVELOPMENT.md), the earlier [MoneyPrinterTurbo design](MONEYPRINTERTURBO_EVALUATION.md), and the current [comparison](VIDEO_ENGINE_COMPARISON.md), [benchmarks](VIDEO_ENGINE_BENCHMARKS.md), [architecture](VIDEO_ENGINE_ARCHITECTURE.md) and [estimated backlog](VIDEO_ENGINE_BACKLOG.md). Confirm the remote-development milestone must precede product/runtime work unless a bounded local-POC exception is explicitly granted.
- [ ] **DEV-01 — Authorize local implementation scope.** Suggested first scope: RD-01 through RD-03, using existing Node tools, fake runners, fixtures and local tests only. Review protected supervisor changes before deploying them. No software downloads, credentials, paid calls, live gateway, system changes, or public publishing are included.
- [ ] **GIT-01 — Establish a baseline.** Review the foundation files and authorize an initial local commit and, if desired, subsequent local checkpoint commits in a defined task scope. Choose the main branch name and local Git identity if missing. No remote exists; configuring a remote, pushing, and making it public are separate actions. Do not reset/reinitialize this repository.

An example bounded response is: "Approve FND-01 and DEV-01 for RD-01 through RD-03, local code and fixture tests only." This example is not a grant. No token or password should be included in an approval message.

## 2. Before live runtime setup

| ID | Owner intervention / exact approval scope | When |
| --- | --- | --- |
| HOST-01 | Choose the runtime route. Proposed: reuse `Ubuntu-22.04` WSL2 with separated gateway/control identities and isolated container workers. Authorize starting that stopped distribution and inspecting its tool versions. Docker daemon/backend startup needs explicit permission too. Native Windows or a separate VM requires an equivalent reviewed plan. | After local supervisor review, before starting host components |
| INSTALL-01 | Approve an itemized software packet: Hermes and Codex releases/commits; artifact origins and hashes; managed Python/Node and other transitive runtimes; supervisor dependencies if any; container image digests; destinations; download sizes where available; PATH/profile edits; optional tools and rollback/uninstall effects. Omit browser/computer-use/desktop extras unless separately wanted. | Before any install, package restore, image pull, upgrade or installer execution |
| ADMIN-01 | Approve each necessary host change after the selected route is validated: dedicated accounts, ACLs, egress controls, sandbox provisioning, WSL interoperability/drive access restrictions, Windows features, firewall/service configuration, or elevated action. A non-admin runtime remains the goal. Do not elevate automatically. | Only when an exact change set is available |
| STARTUP-01 | Decide whether the runtime should be always on. Approve a named scheduled task/service, its account, executable, startup trigger, recovery policy and logs. Machine sleep/wake/power changes need their own explicit scope. Foreground operation is the initial default. | After the private foreground pilot passes |

**No installer is approved yet.** Exact software versions and hashes have not been selected; installation approval must wait for that review packet. The installed `uv` does not imply permission for it to download Python or packages. Existing Docker/WSL does not imply permission to start it or mount the owner's drives.

## 3. Credentials, Telegram, and cost decisions

| ID | Owner action | Limits to record |
| --- | --- | --- |
| AUTH-01 | Choose Codex authentication and a separate Hermes model provider. Approve any credential creation/use and securely provision the selected credential broker or isolated runtime. Do not import the owner's existing Codex configuration/authentication by default. | Provider/account, permitted model/routes, credential location/identity, expiry/rotation, and which process may use it |
| COST-01 | Approve billable usage before the first real request, even with an existing subscription. Include Hermes reasoning, Codex, optional tools, storage and cloud charges. Local-only inference can be evaluated, but installing/downloading it is still gated. | Explicit currency, per-job and batch monetary caps, model/request/token caps, time window, provider enforcement, and treatment of in-flight requests |
| TG-01 | Create a dedicated development bot yourself using official [@BotFather](https://t.me/BotFather) and `/newbot`. After its credential-use grant, enter the token through the approved local secret entry mechanism; never in Git, Telegram task chat, or an AI prompt. | Bot identity and permitted private destination; owner controls token revocation |
| TG-02 | Enroll your numeric Telegram user ID and private chat ID locally, verified against a real update from the bot. Approve sending sanitized progress/status messages to that destination. Configure Telegram account two-step verification yourself if desired. | Exact user ID + private chat ID, no wildcard/group access, enrolled device/account, notification contents |
| RUN-01 | Approve a single harmless live canary, followed later by an exact immutable backlog revision and bounded batch. | Task/policy/test-profile digests, accepted baseline, dependencies, allowed paths, model, spend, runtime/attempt/job limits and expiry |

Initial live execution and billable budget are **disabled / zero authorized spend**. Proposed operating ceilings are one job at a time, 20 minutes per attempt, at most two attempts per task (one repair), at most three tasks and 60 minutes per batch. These ceilings require approval and do not replace a monetary budget; retries and Hermes calls count toward the same cap.

Choose whether source/prompts may leave the machine for a model provider, and approve the exact data flow with AUTH-01. The controller and job storage can be self-hosted while Telegram and a hosted model remain external services. Telegram receives only redacted status metadata by default; raw logs, patches, secrets, and repository contents are not sent.

## 4. Actions that stay separately gated

- **DESTRUCT-01:** Each deletion, overwrite outside an approved patch scope, environment removal, credential revocation, history rewrite, destructive migration, or data reset needs an explicit target, consequence and recovery plan. Do not auto-delete artifacts at retention expiry; first use the approved retention/deletion grant or request one.
- **PUBLISH-01:** Each public deployment, domain/tunnel/webhook, public repository/artifact, social post, or paid hosting purchase needs explicit approval. The initial design uses outbound Telegram polling and needs no public listener.
- **PUSH-01:** Configure a Git remote and approve pushes/PR creation separately, specifying repository, visibility, branch and contents. None are currently configured.
- **ACCEPT-01:** Review the M4 evidence and accept secure remote development before authorizing any Social Studio feature backlog.

## 5. How approvals become enforceable

An authorized local operator records a grant in the future supervisor's protected approval store, outside worker-writable files. A grant binds owner identity, action and content/task/policy digest, relevant host paths/versions, budget and time window, request nonce, and revocation state. The supervisor revalidates it at dispatch and sensitive boundaries. Any scope change invalidates the grant. A repository checkbox, model message, installation wizard, or generic "continue" cannot mint a grant.

Bootstrap and high-risk grants are local only in the first release. Telegram can request an approval and display its status, but cannot approve installations, credentials, administrator changes, destructive actions, spend increases or publishing. Remote starts consume an existing local grant; they do not create one.

If a tool separately requests sandbox escalation, review that command's actual scope. The approved read-only OS/WSL inventory during foundation work did not authorize software installation, administrator access, or configuration changes.

## 6. Operator recovery steps to verify before unattended use

1. Learn the local pause/emergency-stop procedure; verify it blocks dispatch, kills the worker tree, and revokes job-scoped broker access without Telegram.
2. Keep the bot/provider revocation procedures and a private backup/restore procedure for supervisor state. Approve backup destinations and any secret handling separately.
3. On a suspected compromise: pause locally, isolate the runtime, preserve audit evidence, then approve targeted credential revocation and recovery. Do not wipe evidence automatically.
4. After a crash, power loss or long offline period: inspect interrupted jobs and approval expiry, reconcile artifacts, and deliberately resume. Never replay old Telegram commands blindly.

## 7. MoneyPrinterTurbo and n8n actions after remote acceptance

The owner requested this evaluation on 2026-10-29. Its execution is sequenced **after ACCEPT-01 / M4 sign-off**. Today only public-source inspection and foundation documentation have occurred. All grants below are pending; none may be inferred from the requirement or granted by editing this table. See the [evaluation design and preliminary findings](MONEYPRINTERTURBO_EVALUATION.md).

The subsequent two-engine Phase A request permits the read-only source clones described above. MPT-SOURCE below describes the original future evaluation grant and is not a request to approve the already completed anonymous inspection clones again. New source revisions, checkout/execution, downloads or integration need the applicable new scope.

| ID | Owner intervention / exact scope | Required record |
| --- | --- | --- |
| MPT-SOURCE | After M4, authorize VE-01 against the reviewed source revision and isolated destination, outside the owner's production checkout | Repository URL, full commit and optional tag, destination, transfer/size ceiling, licence review scope, task digest, limits and expiry. No upstream scripts, submodules or LFS payloads run/fetched implicitly. |
| MPT-INSTALL | Review and approve the itemized evaluation environment before VE-02 | Python and dependency versions/lock digest; package/artifact origins, hashes, sizes and hooks; FFmpeg/font/runtime needs; destination and rollback. Container images, CUDA libraries, drivers, local TTS/LLM services and models are separate listed items if needed. No automatic restores or upgrades. |
| MPT-DATA | Approve selected external providers and media/data flows, including services advertised as free | Exact LLM, TTS and stock endpoints; sent topic/script/text; download limits; media/music/font/voice rights and provenance. Choose language, voice and permitted local fixtures. No unrelated integrations or paid fallback. |
| MPT-AUTH | Provision only approved evaluation credentials through the reviewed secret mechanism | Provider, identity, scope, storage and permitted runtime, expiry and revocation method. Do not read/reuse owner browser sessions, saved CLI authentication or existing provider keys. No secrets in job JSON, Git, Telegram or logs. |
| MPT-RUN | Approve VE-02/03 sample and comparison runs; pair with COST-01 if any service is billable | Exact fixture/profile/source/runtime digests; RTX 4060 8 GB / 16 GB RAM verification; job count, time, RAM/VRAM/disk/network ceilings, allowed downloads, monetary cap/currency and expiry. Proposed limits in the evaluation design are not grants. |
| MPT-ADAPTER | Approve VE-04 adapter code and isolated checks after findings are available | Contract revision, accepted source/dependency baseline, editable paths, fixed test profile, budgets and expiry. Protected policy/network/test-registry changes need their own reviewed deployment. |
| MPT-ACCEPT | Review VE-05 evidence and record adopt, conditional adoption, defer or reject; separately authorize any production integration | Sample artifacts, quality/resource results, licence and maintenance risks, unresolved human actions, accepted engine/adapter versions, limits and expiry. A passing sample alone does not authorize rollout. |
| N8N-01 | Review and authorize n8n installation/deployment and future scheduling/publishing workflows | Pinned runtime/workflow digests, location, credential boundary, schedule/timezone, target accounts, approved content, retries/idempotency, spend and expiry. Use AUTH-01/INSTALL-01/PUBLISH-01 as applicable; no live n8n connection or post is authorized now. |

Do not enable MoneyPrinterTurbo cross-posting. All publishing and scheduling must stay in n8n, including platform credentials and delayed retries. Maintain the independent FFmpeg long-form-to-reels workflow. If any required dependency, model, endpoint or permission is missing, preserve evidence and present that exact missing action rather than switching providers or downloading it automatically.

## 8. Two-engine proof-of-concept readiness and approvals

Read the [Phase A comparison](VIDEO_ENGINE_COMPARISON.md), [controlled benchmark protocol](VIDEO_ENGINE_BENCHMARKS.md), [common interface](VIDEO_ENGINE_ARCHITECTURE.md) and [118-204 hour POC / 104-184 hour production backlog](VIDEO_ENGINE_BACKLOG.md). The recommendation is provisional strategy C, qualifying MoneyPrinterTurbo first and OpenMontage only after its own gates; no production winner or benchmark pass has been declared.

| ID | Required owner action / review packet | Current status |
| --- | --- | --- |
| VA-GATE | Accept M4 evidence, or explicitly authorize a bounded local-only POC exception identifying tasks, isolation, limits and expiry. Discovering a Hermes executable is not M4 acceptance. | Pending; remote acceptance not evidenced in this audit |
| VA-INPUT | Supply the long-form local path or Drive file reference and rights; approve duration/size/hash, evaluation brand/channel, language, voice, logo/font and stock/music sources. Neutral draft fixtures can be replaced before freezing. | Long-form reference requested during audit; not supplied with original request |
| VA-LICENCE | Review OpenMontage AGPL v3 notices, modifications/distribution/network access and combined-work implications; decide willingness to meet obligations or obtain other rights. Verify Remotion commercial eligibility and renderer terms; approve every model/voice/font/media licence. | Pending; neither process separation nor MIT on the other engine removes these obligations |
| VA-INSTALL | Approve the final itemized Windows packet **before** any dependency/runtime/browser/model install or execution: exact versions, source/lock digests, artifact origins/hashes/sizes, hooks, destinations and rollback. Keep two environments because declared OpenAI SDK ranges conflict. | [Setup packet](VIDEO_ENGINE_SETUP_PACKET.md) now identifies 116 MoneyPrinterTurbo target wheels for a separate staging proposal. Installation is still not ready: archive/licence/native-file review, OpenMontage Python lock, accepted runtime/FFmpeg/ffprobe/browser and isolation remain pending. Existing Python was located outside PATH; no auto-install |
| VA-PROVIDERS | Select free/local LLM/TTS/stock/music route and explicit data-flow/credential provisioning scope. Any use of Codex or another paid reasoning account also needs COST-01. No saved owner session is reused by default. | No provider authenticated/activated; zero paid calls authorized |
| VA-RUN | Approve the frozen eight-job manifest, exact engine/runtime/input/profile/test digests, ordered job count, proposed resource/time/disk/download limits, attempts, costs/currency and expiry. Require real media validation, cancellation/failure checks and no publishing. | [Draft fixtures](benchmarks/video-engine-jobs.json) all BLOCKED with null approval IDs; no execution grant |
| VA-FALLBACK | If wanted, approve a pinned Gemini/Antigravity Windows CLI and supported owner-provisioned API-key/ADC or other reviewed auth profile, exact model entitlement, renewal/restart tests and budget. Do not use unsupported session extraction. | Official headless/auth routes documented; local unattended authentication and model access NOT VALIDATED; fallback stays disabled |
| VA-ACCEPT | Review actual videos, measured resources/times, blinded scores, native/assisted capability labels, failures, licence/security risks and recommendation before selecting production routes. | Pending all POC evidence |
| VA-PRODUCTION | Authorize VP backlog, n8n/PostgreSQL changes, Drive intake, separate channel destinations and direct official platform APIs. Keep credential/publishing grants per account, content hash and schedule. | No production pipeline changed; no integration or publication authorized |

Preparation of documents does not authorize the packet's installers or tests. No blanket install approval is being inferred while artifact hashes/sizes and the long-form source are unresolved. Free local model and browser downloads are still downloads and must be enumerated. Do not change drivers, power mode, firewall, services, execution policy or WSL settings to make the POC work without a separate exact grant.

## 9. Completed bounded dependency staging

**VA-STAGE-MPT-01 was explicitly approved by the owner and completed.** After the specific request, the owner said: "ok i give approval to download and verify those files only". The [setup packet](VIDEO_ENGINE_SETUP_PACKET.md) binds the unchanged manifest digest, destination, limits and expiry. This is a record of the owner's authorization and observed result, not a new agent-created grant.

At 2026-10-29 06:26:41.967 UTC, all 116 wheels (224,210,240 bytes) passed streaming and independent on-disk size/SHA-256 verification. No retries, failed checks, partial files, extraction, installation, package execution, models, credentials, paid calls or production changes occurred. See the [verification report](research/mpt-staging-verification-20261029.json) and [events](research/mpt-staging-events-20261029.jsonl). Installer/runtime grants and all benchmark jobs remain pending; the completed staging scope does not extend to them.
