import test from 'node:test';
import assert from 'node:assert/strict';
import { jsonAuthMetadata, envAuthMetadata } from '../src/supervisor/auth-metadata.mjs';

test('auth JSON exposes allowlisted method/presence/explicit expiry, never fictional token values', () => {
  const secret = 'FICTIONAL_SECRET_MARKER_NOT_A_CREDENTIAL';
  const result = jsonAuthMetadata(JSON.stringify({ auth_mode: 'chatgpt', tokens: { access_token: secret, refresh_token: secret, id_token: secret, expires_at: '2026-10-30T00:00:00Z' }, unrelated: secret }));
  assert.deepEqual(result.auth_methods, ['chatgpt']); assert.equal(result.credential_fields.access_token, true);
  assert.equal(result.expiry_metadata.length, 1); assert.equal(JSON.stringify(result).includes(secret), false);
});
test('unknown method/provider/expiry text and JSON errors do not leak input', () => {
  const secret = 'FICTIONAL_SECRET_MARKER';
  for (const value of ['{' + secret, JSON.stringify({ auth_mode: secret, provider: secret, expires_at: secret, providers: { [secret]: { api_key: secret } } })]) assert.equal(JSON.stringify(jsonAuthMetadata(value)).includes(secret), false);
  assert.equal(jsonAuthMetadata('[]').parse_status, 'unsupported_shape');
});
test('known provider metadata is bounded and no JWT is decoded', () => {
  const result = jsonAuthMetadata(JSON.stringify({ providers: { openai: { auth_method: 'oauth', token: 'fictional.jwt.value', expires_at: 1999999999 } } }));
  assert.deepEqual(result.provider_names, ['openai']); assert.deepEqual(result.auth_methods, ['oauth']);
  assert.equal(result.credential_fields.token, true); assert.deepEqual(result.expiry_metadata, []);
});
test('env parser returns fictional numeric candidates and presence only without evaluating shell syntax', () => {
  const secret = 'FICTIONAL_SECRET_MARKER';
  const result = envAuthMetadata('TELEGRAM_BOT_TOKEN=' + secret + '\nexport TELEGRAM_ALLOWED_USERS="100001,100002"\nTELEGRAM_CHAT_ID=100001\nUNRELATED=$(' + secret + ')');
  assert.equal(result.credential_fields.TELEGRAM_BOT_TOKEN, true);
  assert.deepEqual(result.configured_telegram_ids.TELEGRAM_ALLOWED_USERS.ids, ['100001', '100002']);
  assert.equal(result.telegram_identity_verified, false); assert.equal(JSON.stringify(result).includes(secret), false);
});
test('wildcards, usernames, shell expressions, duplicate fields and unsafe IDs never become enrollment', () => {
  for (const value of ['*', '@someone', '$(whoami)', '-100001', '100001;whoami', '90071992547409922', '100001\nTELEGRAM_ALLOWED_USERS=100002']) {
    const result = envAuthMetadata('TELEGRAM_ALLOWED_USERS=' + value);
    assert.deepEqual(result.configured_telegram_ids.TELEGRAM_ALLOWED_USERS.ids, []);
    assert.equal(result.telegram_identity_verified, false);
  }
});
