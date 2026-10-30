import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {spawnSync} from 'node:child_process';
const [target,stop,parent]=process.argv.slice(2),begin=Date.now();
const base=path.join(process.cwd(),'generated-videos','horror','pilot-001','logs')+path.sep;
if(!path.resolve(target).startsWith(base)||!path.resolve(stop).startsWith(base))throw Error('Invalid resource log path');
while(Date.now()-begin<910000&&!fs.existsSync(stop)){
 try{process.kill(Number(parent),0);}catch{break;}
 const row={at_utc:new Date().toISOString(),host_total_ram_bytes:os.totalmem(),host_free_ram_bytes:os.freemem(),gpu_scope:'whole GPU observation, includes other applications'};
 const gpu=spawnSync('C:\\Windows\\System32\\nvidia-smi.exe',['--query-gpu=index,memory.used,utilization.gpu','--format=csv,noheader,nounits'],{windowsHide:true,encoding:'utf8',timeout:4000});
 if(gpu.status===0)row.gpu_csv=gpu.stdout.trim();else row.gpu_unavailable=true;
 fs.appendFileSync(target,JSON.stringify(row)+'\n');
 Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,1000);
}
