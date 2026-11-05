// Independent deadline guard for this one owner-authorized temporary process.
// Never schedules startup, installs a service, reads auth, or kills by name.
import {spawnSync} from 'node:child_process';import path from 'node:path';
const [pidText,deadlineText]=process.argv.slice(2),pid=Number(pidText),deadline=Number(deadlineText);
if(!Number.isInteger(pid)||pid<1||!Number.isFinite(deadline)||deadline>Date.now()+1800000||deadline<Date.now())process.exit(2);
const binary=path.join(process.cwd(),'.runtime/orchestrator/instagram/tunnel/cloudflared-2026.10.7.exe');
setTimeout(()=>{
 const script=`$ErrorActionPreference='Stop'; $p=Get-CimInstance Win32_Process -Filter 'ProcessId=${pid}'; if(!$p){exit 0}; if($p.ExecutablePath -ne '${binary.replaceAll("'","''")}' -or !$p.CommandLine.Contains('http://127.0.0.1:8792')){exit 3}; Stop-Process -Id ${pid} -ErrorAction Stop`;
 const result=spawnSync('C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',['-NoProfile','-NonInteractive','-Command',script],{windowsHide:true,timeout:10000,stdio:'ignore',env:{SystemRoot:process.env.SystemRoot,WINDIR:process.env.WINDIR}});process.exitCode=result.status??1;
},Math.max(0,deadline-Date.now()));
