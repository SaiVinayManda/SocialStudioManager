import { requireThat, integer, id } from './contracts.mjs';

export function telegramCommand(update, enrollment, nowMs) {
  requireThat(enrollment.owner_user_id !== null && enrollment.private_chat_id !== null, 'NOT_ENROLLED');
  requireThat(update && typeof update === 'object' && Object.keys(update).every(k => ['update_id', 'message'].includes(k)), 'UNSUPPORTED_UPDATE');
  integer(update.update_id, 0, Number.MAX_SAFE_INTEGER);
  const m = update.message;
  requireThat(m && m.from && m.chat && m.chat.type === 'private' && m.from.is_bot === false, 'DENIED_IDENTITY');
  requireThat(Number.isSafeInteger(m.from.id) && Number.isSafeInteger(m.chat.id), 'DENIED_IDENTITY');
  requireThat(String(m.from.id) === enrollment.owner_user_id && String(m.chat.id) === enrollment.private_chat_id, 'DENIED_IDENTITY');
  const forbidden = ['forward_origin', 'forward_from', 'forward_date', 'forward_sender_name', 'via_bot', 'sender_chat', 'is_automatic_forward', 'document', 'photo', 'audio', 'voice', 'video', 'attachment', 'caption', 'edit_date', 'external_reply'];
  requireThat(!forbidden.some(k => Object.hasOwn(m, k)), 'UNTRUSTED_MESSAGE');
  integer(m.date, 0, Number.MAX_SAFE_INTEGER);
  const age = Math.floor(nowMs / 1000) - m.date;
  requireThat(age >= -30 && age <= enrollment.max_age_seconds, 'STALE_COMMAND');
  requireThat(typeof m.text === 'string' && m.text.length <= 256 && !/[\r\n\t\0]/.test(m.text), 'INVALID_COMMAND');
  const tokens = m.text.split(' ');
  requireThat(tokens.every(Boolean), 'INVALID_COMMAND');
  const operation = tokens[0];
  if (['/studio_status', '/studio_queue', '/studio_pause'].includes(operation)) {
    requireThat(tokens.length === 1, 'INVALID_COMMAND'); return { operation, update_id: update.update_id };
  }
  if (['/studio_run', '/studio_approval'].includes(operation)) {
    requireThat(tokens.length === 3, 'INVALID_COMMAND'); id(tokens[1]);
    requireThat(/^[1-9][0-9]{0,5}$/.test(tokens[2]), 'INVALID_COMMAND');
    return { operation, task_id: tokens[1], revision: Number(tokens[2]), update_id: update.update_id };
  }
  if (['/studio_stop', '/studio_logs'].includes(operation)) {
    requireThat(tokens.length === 2, 'INVALID_COMMAND'); id(tokens[1]);
    return { operation, job_id: tokens[1], update_id: update.update_id };
  }
  throw Object.assign(new Error('COMMAND_NOT_ALLOWED'), { code: 'COMMAND_NOT_ALLOWED' });
}
