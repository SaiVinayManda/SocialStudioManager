// Public installed-source receipts can contain application constants. Strip
// secret-bearing literals before displaying/storing any bounded excerpt.
export const redactStaticSource=text=>text.replace(/((?:clientSecret|client_secret|apiKey|api_key|accessToken|refreshToken|access_token|refresh_token|password)\s*:\s*)["'][^"']*(?:["']|$)/gi,'$1"[REDACTED]"').replace(/GOCSPX-[A-Za-z0-9_-]+/g,'[REDACTED]');
