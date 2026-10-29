// Pure allowlist parsers. Tested only with fictional data until owner approval.
const methods = new Set(['chatgpt', 'api_key', 'apikey', 'oauth', 'oauth2', 'device_code', 'token', 'openai', 'openai-codex', 'anthropic', 'google', 'gemini', 'openrouter', 'github-copilot', 'copilot', 'zai', 'minimax', 'custom']);
const providers = ['openai', 'openai-codex', 'anthropic', 'google', 'gemini', 'openrouter', 'github-copilot', 'copilot', 'zai', 'minimax', 'custom'];
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const present = x => typeof x === 'string' ? x.length > 0 : x !== null && x !== undefined;
const credentialNames = ['OPENAI_API_KEY', 'api_key', 'access_token', 'refresh_token', 'id_token', 'token'];
const expiryNames = ['expires_at', 'expiry', 'expiration'];

export function jsonAuthMetadata(content) {
  let data;
  try { data = JSON.parse(content); } catch { return { parse_status: 'invalid_json' }; }
  if (!object(data)) return { parse_status: 'unsupported_shape' };
  const entries = [['root', data]];
  if (object(data.tokens)) entries.push(['tokens', data.tokens]);
  for (const name of providers) if (object(data.providers) && object(data.providers[name])) entries.push(['providers.' + name, data.providers[name]]);
  const credential_fields = Object.fromEntries(credentialNames.map(k => [k, entries.some(([, v]) => Object.hasOwn(v, k) && present(v[k]))]));
  const auth_methods = [...new Set(entries.flatMap(([, v]) => ['auth_mode', 'auth_method', 'provider', 'active_provider'].map(k => v[k]).filter(v => typeof v === 'string' && methods.has(v))))];
  const provider_names = providers.filter(k => object(data.providers) && Object.hasOwn(data.providers, k));
  const expiry_metadata = [];
  for (const [location, entry] of entries) for (const field of expiryNames) {
    const value = entry[field];
    if (typeof value === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(value) && Number.isFinite(Date.parse(value))) expiry_metadata.push({ field: location + '.' + field, value });
  }
  return { parse_status: 'parsed_allowlisted_fields', auth_methods, provider_names, credential_fields, expiry_metadata };
}

const envCredentials = ['TELEGRAM_BOT_TOKEN', 'OPENAI_API_KEY', 'OPENROUTER_API_KEY', 'ANTHROPIC_API_KEY', 'GOOGLE_API_KEY', 'GEMINI_API_KEY'];
const envIdentities = ['TELEGRAM_ALLOWED_USERS', 'TELEGRAM_ALLOWED_USER_IDS', 'TELEGRAM_ALLOWED_CHAT_IDS', 'TELEGRAM_OWNER_ID', 'TELEGRAM_CHAT_ID', 'TELEGRAM_HOME_CHANNEL', 'TELEGRAM_HOME_CHANNEL_ID'];
export function envAuthMetadata(content) {
  const selected = new Set([...envCredentials, ...envIdentities]), values = new Map(), duplicates = new Set();
  for (const line of content.split(/\r?\n/)) {
    const match = /^(?:export\s+)?([A-Z][A-Z0-9_]*)\s*=\s*(.*)$/.exec(line.trim());
    if (!match || !selected.has(match[1])) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (values.has(match[1])) duplicates.add(match[1]);
    values.set(match[1], value);
  }
  const configured_telegram_ids = {};
  for (const field of envIdentities) {
    if (!values.has(field)) continue;
    const value = values.get(field), parts = value.split(',').map(v => v.trim());
    const valid = !duplicates.has(field) && parts.length <= 32 && parts.every(v => /^[1-9][0-9]{0,15}$/.test(v));
    configured_telegram_ids[field] = valid ? { format: 'numeric_ids', ids: [...new Set(parts)] } : { format: 'not_unambiguously_numeric', ids: [] };
  }
  return {
    credential_fields: Object.fromEntries(envCredentials.map(k => [k, values.has(k) && present(values.get(k))])),
    configured_telegram_ids, duplicate_selected_fields: [...duplicates].sort(), telegram_identity_verified: false,
  };
}
