// Owner-authorized INSTAGRAM-HTTPS-TUNNEL, exactly one verified process, <=30 min.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import net from 'node:net';import {spawn} from 'node:child_process';
import {demand} from '../services/studio-runtime/contracts.mjs';
const root=process.cwd(),directory=path.join(root,'.runtime/orchestrator/instagram'),runtime=path.join(directory,'tunnel'),binary=path.join(runtime,'cloudflared-2026.10.7.exe');
demand(process.argv.includes('--owner-approved-instagram-https-tunnel'),'OWNER_APPROVAL_REQUIRED');
const digest=crypto.createHash('sha256').update(fs.readFileSync(binary)).digest('hex');demand(digest==='2493dbc168923bb3e59e5e7716f71deced92992eea9acd6e9d74f84ac7751343','CLOUDFLARED_DIGEST_MISMATCH');
for(const port of [8791,8792])await new Promise((resolve,reject)=>{const check=net.createServer();check.once('error',()=>reject(Error('OAUTH_PORT_IN_USE')));check.listen(port,'127.0.0.1',()=>check.close(resolve));});
const home=path.join(runtime,'empty-home');fs.mkdirSync(home,{recursive:true});
demand(!fs.existsSync(path.join(home,'.cloudflared/config.yml'))&&!fs.existsSync(path.join(home,'.cloudflared/config.yaml')),'QUICK_TUNNEL_HOME_NOT_EMPTY');
const env={SystemRoot:process.env.SystemRoot,WINDIR:process.env.WINDIR,PATH:'C:\\Windows\\System32',HOME:home,USERPROFILE:home,APPDATA:home,LOCALAPPDATA:home,TEMP:home,TMP:home};
const begin=Date.now(),deadline=begin+1800000,session=new Date(begin).toISOString().replaceAll(/[:.]/g,'-'),file=path.join(runtime,'session-'+session+'.json');
const record={approval_id:'INSTAGRAM-HTTPS-TUNNEL',replacement:true,owner_reference:'Explicit current owner message: I approve one replacement HTTPS callback-only tunnel for a maximum of 30 minutes, under the same security restrictions as the previous approval.',version:'2026.10.7',sha256:digest,started_at:new Date(begin).toISOString(),expires_at:new Date(deadline).toISOString(),upstream:'http://127.0.0.1:8792',published:false,uploaded:false};
const save=()=>fs.writeFileSync(file,JSON.stringify(record,null,2)+'\n');save();
let connector=null,closed=false,started=false,buffer='';
const tunnel=spawn(binary,['--no-autoupdate','tunnel','--url','http://127.0.0.1:8792','--protocol','http2','--loglevel','info','--metrics','127.0.0.1:0'],{cwd:home,env,windowsHide:true,stdio:['ignore','pipe','pipe']});
record.pid=tunnel.pid;save();
demand(tunnel.pid,'TUNNEL_START_FAILED');
const guard=spawn(process.execPath,[path.join(root,'scripts/instagram-tunnel-watchdog.mjs'),String(tunnel.pid),String(deadline)],{cwd:root,env,windowsHide:true,detached:true,stdio:'ignore'});guard.unref();record.watchdog_pid=guard.pid;save();
tunnel.once('exit',()=>guard.kill());
function stop(reason){if(closed)return;closed=true;clearTimeout(expiry);clearTimeout(startup);tunnel.kill();if(connector)connector.kill();record.stopped_at=new Date().toISOString();record.stop_reason=reason;save();console.log(JSON.stringify({tunnel_stopped:true,reason}));}
const expiry=setTimeout(()=>stop('maximum_30_minutes_elapsed'),Math.max(0,deadline-Date.now()));
const startup=setTimeout(()=>{if(!started)stop('no_https_hostname_within_90_seconds');},90000);
const data=chunk=>{
 // Raw cloudflared logs are never printed/persisted: only extract the hostname.
 buffer=(buffer+chunk.toString('utf8')).slice(-32768);const match=buffer.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com\b/);if(!match||started||closed)return;
 started=true;clearTimeout(startup);buffer='';const publicOrigin=new URL(match[0]).origin,redirect=publicOrigin+'/instagram/callback';record.redirect_uri=redirect;save();
 connector=spawn(process.execPath,[path.join(root,'scripts/connect-instagram.mjs'),'--approved-https-proxy','--redirect-uri='+redirect],{cwd:root,env,windowsHide:true,stdio:['ignore','pipe','pipe']});
 let lines='';connector.stdout.on('data',chunk=>{lines+=chunk.toString('utf8');let end;while((end=lines.indexOf('\n'))>=0){const line=lines.slice(0,end);lines=lines.slice(end+1);let entry;try{entry=JSON.parse(line);}catch{continue;}
  if(entry.open){record.local_setup_url=entry.open;record.login_mode=entry.login_mode;save();console.log(JSON.stringify({redirect_uri:redirect,local_setup_url:entry.open,expires_at:record.expires_at,login_mode:entry.login_mode,callback_only:true}));}
  if(entry.connected){
   // Close public access immediately after GET verification and local vault save.
   tunnel.kill();record.connected_account={username:entry.username,account_id:entry.account_id,permissions:entry.permissions};record.stopped_at=new Date().toISOString();record.stop_reason='account_connected_and_verified';save();console.log(JSON.stringify({connected:true,...record.connected_account,tunnel_stopped:true,uploaded:false,published:false}));setTimeout(()=>stop('account_connected_and_verified'),1000);
  }
 }});
 connector.stderr.on('data',()=>{});connector.once('error',()=>stop('oauth_helper_start_failed'));connector.once('exit',code=>{if(!closed&&!record.connected_account)stop(code===0?'oauth_helper_closed':'oauth_helper_failed');});
};
tunnel.stdout.on('data',data);tunnel.stderr.on('data',data);tunnel.once('error',()=>stop('tunnel_process_failed'));tunnel.once('exit',()=>{if(!closed&&!record.connected_account)stop('tunnel_process_exited');});
process.on('SIGINT',()=>stop('owner_cancelled'));process.on('SIGTERM',()=>stop('owner_cancelled'));
