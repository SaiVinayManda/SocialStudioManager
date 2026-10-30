// Fixed commands from B-PILOT-SETUP-01. This is a local setup wrapper, not a
// production orchestrator. The owner's grant is external; this cannot mint one.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const runtime = path.join(root, '.runtime', 'openmontage-pilot');
const source = path.join(root, 'openmontage');
const clone = 'C:\\Users\\Vinay\\AppData\\Local\\Temp\\SocialStudio-VideoEngineAudit-20261029\\OpenMontage';
const commit = '195eab24478dc9363326aec437aefc3701635ddf';
const python = 'C:\\Users\\Vinay\\AppData\\Local\\Microsoft\\WindowsApps\\PythonSoftwareFoundation.Python.3.11_qbz5n2kfra8p0\\python.exe';
const uv = 'C:\\Users\\Vinay\\AppData\\Local\\Packages\\PythonSoftwareFoundation.Python.3.11_qbz5n2kfra8p0\\LocalCache\\local-packages\\Python311\\Scripts\\uv.exe';
const git = 'C:\\Program Files\\Git\\cmd\\git.exe';
const sha = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const assert = (condition, code) => { if (!condition) throw new Error(code); };
assert(sha(path.join(root, 'docs', 'OPENMONTAGE_INSTALL_APPROVAL.md')) === 'eff54d5d35aa8515df023e5a7a84eac4564136117107fbc20056d73ce4209dbe', 'PACKET_CHANGED');
assert(sha(path.join(root, 'setup', 'openmontage-pilot.requirements.in')) === 'decee478ec624073e22d8061190b3adddff8b132f8103d43e190476bc8e2a284', 'INPUT_CHANGED');
const phase = process.argv[2];
if (phase === 'init') {
  assert(!fs.existsSync(runtime) && !fs.existsSync(source), 'DESTINATION_EXISTS');
  for (const directory of ['downloads', 'wheelhouse', 'ffmpeg', 'voices', 'cache', 'logs', 'tmp', 'home']) fs.mkdirSync(path.join(runtime, directory), { recursive: true });
  fs.writeFileSync(path.join(runtime, 'session.json'), JSON.stringify({ approval: 'B-PILOT-SETUP-01', owner_grant: 'Explicit conversation approval', started_utc: '2026-10-29T21:17:56Z', deadline_utc: '2026-10-29T22:17:56Z', packet_sha256: sha(path.join(root, 'docs', 'OPENMONTAGE_INSTALL_APPROVAL.md')), max_download_bytes: 750 * 1048576, max_storage_bytes: 3 * 1073741824 }, null, 2), { flag: 'wx' });
  console.log('Fresh project-local setup directories initialized.');
} else {
  const session = JSON.parse(fs.readFileSync(path.join(runtime, 'session.json'), 'utf8'));
  const remaining = Date.parse(session.deadline_utc) - Date.now(); assert(remaining > 0, 'SETUP_TIME_LIMIT');
  const environment = { SystemRoot: 'C:\\Windows', PATH: 'C:\\Windows\\System32;C:\\Program Files\\nodejs;C:\\Program Files\\Git\\cmd', TEMP: path.join(runtime, 'tmp'), TMP: path.join(runtime, 'tmp'), HOME: path.join(runtime, 'home'), USERPROFILE: path.join(runtime, 'home'), APPDATA: path.join(runtime, 'home', 'AppData', 'Roaming'), LOCALAPPDATA: path.join(runtime, 'home', 'AppData', 'Local'), UV_CACHE_DIR: path.join(runtime, 'cache'), UV_PYTHON: path.join(runtime, 'venv', 'Scripts', 'python.exe'), UV_KEYRING_PROVIDER: 'disabled', UV_DEFAULT_INDEX: 'https://pypi.org/simple', PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1', PIP_CONFIG_FILE: 'NUL', PIP_KEYRING_PROVIDER: 'disabled', npm_config_offline: 'true', npm_config_yes: 'false' };
  environment.VIRTUAL_ENV = path.join(runtime, 'venv');
  environment.PATH = path.join(runtime, 'venv', 'Scripts') + ';' + environment.PATH;
  const gitPrefix = ['-c', 'safe.directory=' + clone.replaceAll('\\', '/'), '-c', 'core.hooksPath=NUL', '-C', clone];
  const lock = path.join(runtime, 'requirements.lock'), venvPython = path.join(runtime, 'venv', 'Scripts', 'python.exe');
  const operations = {
    portable: [process.execPath, [path.join(root, 'scripts', 'openmontage-download-portable.mjs')]],
    'portable-voice': [process.execPath, [path.join(root, 'scripts', 'openmontage-download-portable.mjs')]],
    'voice-redirect': [process.execPath, [path.join(root, 'scripts', 'openmontage-check-voice-redirect.mjs')]],
    archive: [git, [...gitPrefix, 'archive', '--format=tar', '--output=' + path.join(runtime, 'downloads', 'source.tar'), commit]],
    venv: [python, ['-I', '-m', 'venv', path.join(runtime, 'venv')]],
    resolve: [uv, ['--no-config', '--no-cache', '--no-python-downloads', 'pip', 'compile', path.join(root, 'setup', 'openmontage-pilot.requirements.in'), '--python-version', '3.11.9', '--python-platform', 'x86_64-pc-windows-msvc', '--only-binary', ':all:', '--no-build', '--generate-hashes', '--output-file', lock]],
    'resolve-binary': [uv, ['--no-config', '--no-cache', '--no-python-downloads', 'pip', 'compile', path.join(root, 'setup', 'openmontage-pilot.requirements.in'), '--python-version', '3.11.9', '--python-platform', 'x86_64-pc-windows-msvc', '--only-binary', ':all:', '--generate-hashes', '--output-file', lock]],
    manifest: [process.execPath, [path.join(root, 'scripts', 'openmontage-wheel-manifest.mjs')]],
    'registry-local': [venvPython, ['-I', path.join(root, 'scripts', 'openmontage-local-preflight.py')]],
    'download-wheels': [venvPython, ['-I', '-m', 'pip', '--isolated', '--disable-pip-version-check', 'download', '--index-url', 'https://pypi.org/simple', '--keyring-provider', 'disabled', '--only-binary=:all:', '--require-hashes', '-r', lock, '-d', path.join(runtime, 'wheelhouse')]],
    install: [venvPython, ['-I', '-m', 'pip', '--isolated', '--disable-pip-version-check', 'install', '--no-index', '--only-binary=:all:', '--require-hashes', '--find-links', path.join(runtime, 'wheelhouse'), '-r', lock]],
  };
  if (phase === 'registry-ascii') operations['registry-ascii'] = operations['registry-local'];
  if (['registry-local', 'registry-ascii'].includes(phase)) environment.PATH = path.join(runtime, 'venv', 'Scripts') + ';' + path.join(runtime, 'ffmpeg', 'ffmpeg-9.0.2-essentials_build', 'bin') + ';C:\\Windows\\System32';
  if (phase === 'resolve-venv') operations['resolve-venv'] = operations['resolve-binary'];
  if (phase === 'resolve-active') operations['resolve-active'] = operations['resolve-binary'];
  if (phase === 'extract') {
    assert(!fs.existsSync(source), 'SOURCE_EXISTS');
    const listed = spawnSync('C:\\Windows\\System32\\tar.exe', ['-tf', path.join(runtime, 'downloads', 'source.tar')], { env: environment, encoding: 'utf8', shell: false, windowsHide: true, timeout: 30000, maxBuffer: 4 * 1048576 });
    assert(listed.status === 0, 'ARCHIVE_LIST_FAILED');
    const names = listed.stdout.trim().split(/\r?\n/);
    assert(names.every(n => !n.startsWith('/') && !n.includes('\\') && !n.includes(':') && !n.split('/').includes('..') && !n.split('/').includes('.git')), 'ARCHIVE_PATH');
    fs.mkdirSync(source);
    operations.extract = ['C:\\Windows\\System32\\tar.exe', ['-xf', path.join(runtime, 'downloads', 'source.tar'), '-C', source]];
  }
  assert(Object.hasOwn(operations, phase), 'UNKNOWN_FIXED_PHASE');
  if (phase === 'archive') assert(!fs.existsSync(path.join(runtime, 'downloads', 'source.tar')), 'ARCHIVE_EXISTS');
  if (phase === 'venv') assert(!fs.existsSync(path.join(runtime, 'venv')), 'VENV_EXISTS');
  if (['resolve', 'resolve-binary', 'resolve-venv', 'resolve-active'].includes(phase)) assert(!fs.existsSync(lock), 'LOCK_EXISTS');
  if (phase === 'download-wheels') {
    const manifest = JSON.parse(fs.readFileSync(path.join(runtime, 'wheel-manifest.json'), 'utf8'));
    assert(manifest.state === 'metadata_verified_before_download' && manifest.artifacts.length <= 100 && fs.readdirSync(path.join(runtime, 'wheelhouse')).length === 0, 'WHEEL_DOWNLOAD_NOT_READY');
  }
  if (phase === 'install') {
    const manifest = JSON.parse(fs.readFileSync(path.join(runtime, 'wheel-manifest.json'), 'utf8'));
    assert(manifest.state === 'downloaded_verified' && manifest.artifacts.length <= 100, 'WHEELS_NOT_VERIFIED');
    assert(fs.readdirSync(path.join(runtime, 'wheelhouse')).length === manifest.artifacts.length, 'WHEELHOUSE_CONTENTS');
    for (const item of manifest.artifacts) assert(sha(path.join(runtime, 'wheelhouse', item.filename)) === item.sha256, 'WHEEL_HASH');
  }
  const [executable, args] = operations[phase], started = new Date().toISOString();
  const result = spawnSync(executable, args, { cwd: root, env: environment, encoding: 'utf8', shell: false, windowsHide: true, timeout: Math.min(300000, remaining), maxBuffer: 8 * 1048576 });
  fs.writeFileSync(path.join(runtime, 'logs', phase + '.stdout'), result.stdout ?? '', { flag: 'wx' });
  fs.writeFileSync(path.join(runtime, 'logs', phase + '.stderr'), result.stderr ?? '', { flag: 'wx' });
  fs.writeFileSync(path.join(runtime, 'logs', phase + '.receipt.json'), JSON.stringify({ executable, args, started_utc: started, finished_utc: new Date().toISOString(), exit_code: result.status, error_code: result.error?.code ?? null, environment: 'explicit allowlist only; controlled HOME, TEMP, caches; no owner credentials', inherited_environment: false }, null, 2), { flag: 'wx' });
  console.log(JSON.stringify({ phase, exit_code: result.status, error_code: result.error?.code ?? null }));
  if (result.status !== 0 || result.error) { console.error((result.stderr ?? '').slice(-12000)); process.exitCode = 1; }
  else if (phase === 'download-wheels') {
    const file = path.join(runtime, 'wheel-manifest.json'), manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert(fs.readdirSync(path.join(runtime, 'wheelhouse')).length === manifest.artifacts.length, 'WHEELHOUSE_CONTENTS');
    for (const item of manifest.artifacts) {
      const wheel = path.join(runtime, 'wheelhouse', item.filename);
      assert(fs.statSync(wheel).size === item.size_bytes && sha(wheel) === item.sha256, 'WHEEL_HASH_OR_SIZE');
    }
    fs.copyFileSync(file, path.join(runtime, 'wheel-manifest-before-download.json'), fs.constants.COPYFILE_EXCL);
    manifest.state = 'downloaded_verified'; manifest.verified_at_utc = new Date().toISOString(); fs.writeFileSync(file, JSON.stringify(manifest, null, 2));
    console.log(JSON.stringify({ wheels_verified: manifest.artifacts.length, payload_bytes: manifest.wheel_bytes }));
  }
}
