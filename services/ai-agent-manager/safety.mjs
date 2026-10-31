import fs from 'node:fs';import path from 'node:path';
import {demand} from '../studio-runtime/contracts.mjs';
export function rejectCredentialMaterial(value){
  const text=typeof value==='string'?value:JSON.stringify(value);
  demand(!/(?:\bsk-[A-Za-z0-9_-]{18,}|\bBearer\s+[A-Za-z0-9._~+/=-]{18,}|\b(?:access_token|refresh_token|api_key|authorization|password|cookie)\s*[=:]\s*\S+)/i.test(text),'AI_CREDENTIAL_MATERIAL_DENIED',403);
}
export function safeProjectDirectory(root,relative){
  const base=path.resolve(root),target=path.resolve(base,relative);demand(target.startsWith(base+path.sep),'AI_UNSAFE_ARTIFACT_PATH');
  demand(!fs.lstatSync(base).isSymbolicLink(),'AI_LINK_FORBIDDEN');let current=base;
  for(const part of path.relative(base,target).split(path.sep)){current=path.join(current,part);if(fs.existsSync(current))demand(!fs.lstatSync(current).isSymbolicLink()&&fs.statSync(current).isDirectory(),'AI_LINK_FORBIDDEN');else fs.mkdirSync(current);}
  return target;
}
