# A-03 authority store and deployment review

Status: local implementation and fixture checks pass. **Protected operator deployment is not installed or accepted.** The sample configuration cannot activate anything: expiry is deliberately invalid, Telegram enrollment is null, and no task or grant exists. No production approval, signing key, account or ACL has been created.

## Implemented contract

`PinnedAuthorityStore` reads exactly `authority.json` from an explicitly configured local directory, at most 1 MiB. It has no write, grant-creation, deployment or network operation. An operator-controlled bootstrap must supply the expected canonical-document SHA-256 and exact revision; neither may come from Telegram, worker output or a sibling worker-writable file. JSON whitespace is not part of this semantic digest. Editing any value invalidates it.

The document schema is illustrated in [the inert example](../config/authority-store.example.json). It binds a deployment ID, revision, UTC expiry, authority/state/workspace/baseline roots, registered project baseline locations and the existing task/policy/profile/grant snapshot. Every project must have a registered baseline directory strictly inside the baseline root. Task and grant references must match their reviewed digests. Baseline SHA values are declarations here; actual Git commit/content acceptance remains a separate live-run requirement.

Paths must be existing local absolute directories with no traversal, symlink/junction ancestor, alternate stream or overlapping control/worker/baseline roots. Authority files must be regular, bounded and singly linked. The reader checks file identity/size around its bounded read. These checks assume an independently protected directory tree: they are not a solution to adversarial filesystem races, mapped-drive policy, ACL inheritance or network isolation.

The controller can receive either raw fixture authority or a pinned store, never both. Store mode checks configured state/workspace roots before creating anything. It records `authority.bound` as the first journal event. On restart the deployment ID/revision/digest must match. A different pin, fallback to raw fixture authority, or automatic adoption of existing unbound state is rejected. There is no automatic migration or rollback path.

The store is re-read before Telegram operations, local enqueue/enable, dispatch and final validation. A missing, expired or altered snapshot disables dispatch; restoring a file does not resume it. Running fixtures remain subject to their existing timeout/cancel handling; this is not a live revocation watcher or a general Windows process-tree monitor. A protected local emergency-stop path must remain available if remote configuration is corrupt.

Revocations, queued grant consumption, update deduplication and job states persist in the existing fsynced audit journal. The local operator method `revokeLocal` pauses dispatch and cancels an active fixture using the revoked grant. Telegram has no grant or revocation writer. Reopening state preserves revocations and starts paused. Restoring an old journal can restore consumed grants: a hash chain alone does not prevent rollback by an authorized state writer. Deployment needs protected storage, an external accepted revision/audit anchor and an operator reconciliation procedure.

## Proposed deployment, not authorization

The example proposes `C:\ProgramData\SocialStudio` with sibling `authority`, `state`, `baselines` and `workspaces` directories. These directories have **not** been created. Accepted supervisor/validator code and the bootstrap pin must also live outside worker-writable storage.

| Resource | Authorized operator | Controller identity | Worker identity |
| --- | --- | --- | --- |
| Accepted code, bootstrap pin and authority | Manage reviewed revisions | Read/execute as appropriate; no grant edits | Deny |
| Queue/audit and revocations | Reviewed recovery and backup | Append/update through controller only | Deny |
| Accepted baselines | Reviewed import/update | Read | No direct access; receive only job-scoped material through reviewed launcher |
| Per-job workspace | Inspect quarantined artifacts | Prepare/read/validate | Only its own current job; no sibling/control access |
| Credentials and ingress signing material | Separately approved provisioning | Only through approved broker/transport | No long-lived credential/home access |

This table is a required boundary, not an ACL recipe. Exact administrator commands cannot safely be frozen until the native isolation mechanism and controller/worker/operator SIDs are selected. Do not apply a generic `icacls`, create accounts, add deny rules, enable services or modify inheritance based on this example. No such action is requested or authorized now.

Before requesting A-03 deployment approval, prepare:

1. Named existing/new identities and SIDs; native isolation and broker design; accepted source/bootstrap digests and destination paths.
2. Exact itemized PowerShell account/directory/ACL commands, current ACL backup, inheritance effects, privileges, rollback procedure and grant expiry. Separate any installation, service, firewall or credential operations.
3. An operator-authored finite canary manifest/grant, verified owner/chat IDs, accepted baseline and immutable checks; never import fictional test grants.
4. Effective-access tests **under the actual worker identity**: deny authority/code/state/credentials/sibling jobs; permit only the current job. Test process tree, egress/resource limits, revocation and restart with actual launch evidence.
5. Operator review of audit retention, anti-rollback/recovery anchors and local emergency stop. Do not delete old state, reset a failed journal, or automatically migrate its binding.

All writes outside the project, protected deployment, identity/ACL changes and activation remain gated. A-03 is incomplete until the real protected boundary passes; A-04/A-05 and the live A-06/A-07 exercise follow it.

## Actual local checks

Run `node scripts/check-supervisor.mjs` using the existing Node runtime. The added tests use fictional authority and directories under ignored `.runtime/tests`. They exercise a real fixed Node child through the disk-backed store, restart/replay/one-use behavior, persisted revocation, disk changes before dispatch/during execution, expired deployment, pin/state migration rejection, directory/project/grant mismatch, missing/malformed/oversized/hard-linked files and junction rejection. Nothing reads real credentials or starts a live service. Evidence is linked in [TEST_RESULTS.md](TEST_RESULTS.md).
