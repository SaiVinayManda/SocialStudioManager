import { requireThat, redact } from './contracts.mjs';

/** Agent-reported telemetry only; never authorizes a command or proves a test passed. */
export class CodexEvents {
  constructor({ maxLineBytes = 65536, maxTotalBytes = 1048576 } = {}) {
    this.maxLineBytes = maxLineBytes; this.maxTotalBytes = maxTotalBytes;
    this.pending = Buffer.alloc(0); this.total = 0;
    this.summary = { events: 0, turn_completed: false, turn_failed: false, usage: null, agent_reported_commands: 0 };
  }
  push(buffer) {
    requireThat(Buffer.isBuffer(buffer), 'INVALID_EVENT_BUFFER'); this.total += buffer.length;
    requireThat(this.total <= this.maxTotalBytes, 'CODEX_EVENT_LIMIT');
    this.pending = Buffer.concat([this.pending, buffer]);
    let index;
    while ((index = this.pending.indexOf(10)) !== -1) {
      const line = this.pending.subarray(0, index); this.pending = this.pending.subarray(index + 1);
      requireThat(line.length <= this.maxLineBytes, 'CODEX_LINE_LIMIT');
      if (line.length) this.event(JSON.parse(line.toString('utf8')));
    }
    requireThat(this.pending.length <= this.maxLineBytes, 'CODEX_LINE_LIMIT');
  }
  event(value) {
    requireThat(value && typeof value === 'object' && typeof value.type === 'string', 'INVALID_CODEX_EVENT');
    this.summary.events++;
    if (value.type === 'turn.completed') {
      this.summary.turn_completed = true;
      const usage = value.usage;
      if (usage) {
        const fields = ['input_tokens', 'cached_input_tokens', 'output_tokens'];
        requireThat(fields.every(k => Number.isSafeInteger(usage[k]) && usage[k] >= 0), 'INVALID_CODEX_USAGE');
        this.summary.usage = Object.fromEntries(fields.map(k => [k, usage[k]]));
      }
    }
    if (value.type === 'turn.failed' || value.type === 'error') this.summary.turn_failed = true;
    if (value.type === 'item.completed' && value.item?.type === 'command_execution') this.summary.agent_reported_commands++;
  }
  finish() {
    requireThat(this.pending.length === 0, 'TRUNCATED_CODEX_EVENTS');
    return { ...this.summary, usage: this.summary.usage && { ...this.summary.usage }, diagnostic_policy: redact('bounded telemetry; no raw model/tool text exported') };
  }
}
