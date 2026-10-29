import path from 'node:path';
import { requireThat } from './contracts.mjs';

// This constructs a reviewed vector only. No authenticated Codex launch is enabled.
export function codexInvocation({ executable, workspace, schema, finalOutput, model }) {
  for (const p of [executable, workspace, schema, finalOutput]) requireThat(typeof p === 'string' && path.isAbsolute(p), 'ABSOLUTE_PATH_REQUIRED');
  requireThat(typeof model === 'string' && /^[a-zA-Z0-9_.-]{1,80}$/.test(model), 'INVALID_MODEL');
  return {
    executable,
    args: ['--ask-for-approval', 'never', 'exec', '--sandbox', 'workspace-write', '--json', '--ephemeral', '--ignore-user-config', '--ignore-rules', '--cd', workspace, '--output-schema', schema, '--output-last-message', finalOutput, '--model', model, '-'],
    shell: false,
    promptTransport: 'stdin',
    credentialPolicy: 'unprovisioned',
    enabled: false,
  };
}

export class CodexRunner {
  kind = 'codex-unprovisioned';
  start() { throw Object.assign(new Error('LIVE_RUNTIME_NOT_ACCEPTED'), { code: 'LIVE_RUNTIME_NOT_ACCEPTED' }); }
}
