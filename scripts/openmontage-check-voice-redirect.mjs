// Inspect only the approved voice URL's redirect hostname, never the signed URL.
const url = 'https://huggingface.co/rhasspy/piper-voices/resolve/bae641dcb5a608cff81ccaf7ff018baaca1a33e1/en/en_US/ljspeech/medium/en_US-ljspeech-medium.onnx';
const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(30000) });
const location = response.headers.get('location');
await response.body?.cancel();
console.log(JSON.stringify({ status: response.status, redirect_host: location ? new URL(location, url).hostname : null }));
