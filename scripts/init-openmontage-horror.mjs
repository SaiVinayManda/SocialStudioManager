// Initialize this one approved local production with upstream checkpoint code.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const runtime = path.join(root, '.runtime', 'openmontage-pilot');
const project = path.join(root, 'generated-videos', 'horror', 'pilot-001');
if (fs.existsSync(path.join(project, 'project.json')) || fs.existsSync(path.join(project, 'final', 'horror_pilot_001.mp4'))) throw new Error('EXISTING_PRODUCTION_PRESERVED');
const code = `import json, os, socket, sys
from pathlib import Path
root = Path(${JSON.stringify(root)})
project = root / "generated-videos" / "horror" / "pilot-001"
if (root / "openmontage" / ".env").exists():
    raise RuntimeError("Unexpected environment file")
def denied(*args, **kwargs):
    raise RuntimeError("Network disabled for initialization")
socket.socket.connect = denied
socket.create_connection = denied
socket.getaddrinfo = denied
os.environ["OPENMONTAGE_PROJECTS_DIR"] = str(project.parent)
sys.path.insert(0, str(root / "openmontage"))
from lib.checkpoint import init_project
result = init_project("pilot-001", title="The Second Caller", pipeline_type="cinematic", pipeline_dir=project.parent)
print(json.dumps({"project_directory": str(result), "pipeline": "cinematic", "stage_completed": False, "generation_executed": False}))
`;
const driver = path.join(project, 'scripts', 'initialize_pipeline.py'); fs.writeFileSync(driver, code, { flag: 'wx' });
const executable = path.join(runtime, 'venv', 'Scripts', 'python.exe');
const env = { SystemRoot: 'C:\\Windows', PATH: path.join(runtime, 'venv', 'Scripts') + ';C:\\Windows\\System32', TEMP: path.join(runtime, 'tmp'), TMP: path.join(runtime, 'tmp'), HOME: path.join(runtime, 'home'), USERPROFILE: path.join(runtime, 'home'), APPDATA: path.join(runtime, 'home', 'AppData', 'Roaming'), LOCALAPPDATA: path.join(runtime, 'home', 'AppData', 'Local') };
const started = new Date().toISOString();
const r = spawnSync(executable, ['-I', driver], { env, shell: false, windowsHide: true, encoding: 'utf8', timeout: 30000, maxBuffer: 1048576 });
const receipt = { executable, args: ['-I', driver], started_utc: started, finished_utc: new Date().toISOString(), exit_code: r.status, error_code: r.error?.code ?? null, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
fs.writeFileSync(path.join(project, 'logs', 'pipeline-initialization.json'), JSON.stringify(receipt, null, 2), { flag: 'wx' });
console.log(JSON.stringify(receipt, null, 2));
if (r.status !== 0 || r.error) process.exitCode = 1;
