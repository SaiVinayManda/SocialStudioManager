# Telegram management commands

Status: parser/controller behavior is locally tested with fictional updates. Commands are **not connected to the existing Hermes bot** yet. The operator must enroll the actual owner user/private-chat IDs and deploy a reviewed deterministic integration after the live gates pass.

| Milestone A command | Current controller behavior |
| --- | --- |
| `/studio_status` | Paused/recovery/live-enabled status, active job and counts |
| `/studio_queue` | Latest 20 job summaries and total count |
| `/studio_run TASK-ID REVISION` | Enqueue only the exact registered task covered by a valid matching grant; never approve it |
| `/studio_stop JOB-ID` | Cancel a queued task or stop the owned fixed fixture process; live stop is not provisioned |
| `/studio_logs JOB-ID` | Latest 20 sanitized controller state/exit/error facts |
| `/studio_approval TASK-ID REVISION` | Persist a request for the local owner; cannot grant approval |
| `/studio_pause` | Stop new dispatch; does not implicitly cancel active work |

Only a trusted local operator can enable the fixture dispatcher. No Telegram resume/grant/install/publish/shell operation exists in this release. Unknown commands and extra arguments are rejected. Do not route an unrecognized management request into an unrestricted model/tool runtime.

Future Milestone G commands for brands, media production, previews, revisions, schedules, publishing failures and finite-batch resume are unimplemented. New approval classes require explicit policy review; the initial high-risk approval interface remains local. Bot/user IDs, signing keys and credentials must not be stored in this document or committed configuration.
