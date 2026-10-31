import fs from 'node:fs';import path from 'node:path';
import {demand,checksum} from '../studio-runtime/contracts.mjs';import {fileHash} from './media.mjs';
const types={'.mp4':'video','.mov':'video','.png':'image','.jpg':'image','.jpeg':'image','.wav':'audio','.mp3':'audio'};
export function assetPath(root,slug,relative){
 demand(typeof relative==='string'&&relative.split('/').every(p=>/^[A-Za-z0-9][A-Za-z0-9._ -]*$/.test(p)&&p!=='.'&&p!=='..'&&!p.endsWith('.')&&!p.endsWith(' ')&&!/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/i.test(p)),'UNSAFE_ASSET_PATH');
 demand(relative.startsWith(`brands/${slug}/assets/`)||(relative.startsWith(`generated-videos/${slug}/`)&&relative.includes('/assets/')),'ASSET_BRAND_MISMATCH');
 let current=root;for(const part of relative.split('/')){current=path.join(current,part);demand(!fs.lstatSync(current).isSymbolicLink(),'ASSET_LINK_FORBIDDEN');}
 const s=fs.statSync(current);demand(s.isFile()&&s.nlink===1&&s.size>0&&s.size<=536870912,'UNSAFE_ASSET_FILE');return current;
}
export async function indexLocalAssets(root,slug){
 const rows=[],seen=new Set(),catalog=path.join(root,'brands',slug,'config','asset-catalog.json');
 const approved=fs.existsSync(catalog)?JSON.parse(fs.readFileSync(catalog,'utf8')).assets:[];demand(Array.isArray(approved)&&approved.length<=256,'ASSET_CATALOG_LIMIT');
 for(const item of approved){
  try{demand(/^[A-Za-z0-9_-]{1,100}$/.test(item.id)&&!seen.has(item.id)&&item.licence?.status==='verified'&&checksum(item.checksum)&&checksum(item.licence.evidence_checksum),'ASSET_PROVENANCE_REQUIRED');
   const file=assetPath(root,slug,item.relative_path),proof=assetPath(root,slug,item.licence.evidence_reference);demand(await fileHash(file)===item.checksum&&await fileHash(proof)===item.licence.evidence_checksum,'ASSET_DIGEST_MISMATCH');
   rows.push({...item,kind:types[path.extname(file).toLowerCase()],tags:[...(item.tags??[]),...path.basename(file).toLowerCase().split(/[^a-z0-9]+/)].slice(0,30),eligible:true,absolute_path:file});seen.add(item.id);
  }catch(e){rows.push({id:item.id,eligible:false,reason:e.code??'ASSET_MISSING_OR_UNVERIFIED'});}
 }
 let count=0;function walk(dir){if(!fs.existsSync(dir)||fs.lstatSync(dir).isSymbolicLink())return;for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(++count>2000)return;const p=path.join(dir,entry.name);if(entry.isSymbolicLink())continue;if(entry.isDirectory())walk(p);else if(types[path.extname(entry.name).toLowerCase()]&&!approved.some(a=>path.resolve(root,a.relative_path)===p))rows.push({id:'unverified-'+rows.length,relative_path:path.relative(root,p).replaceAll('\\','/'),kind:types[path.extname(p).toLowerCase()],tags:entry.name.toLowerCase().split(/[^a-z0-9]+/),eligible:false,reason:'No digest-bound licence entry'});}}
 walk(path.join(root,'brands',slug,'assets'));
 const generated=path.join(root,'generated-videos',slug);if(fs.existsSync(generated))for(const p of fs.readdirSync(generated,{withFileTypes:true}))if(p.isDirectory()&&!p.isSymbolicLink())walk(path.join(generated,p.name,'assets'));
 return {brand_slug:slug,assets:rows,scanned_entries:count,classification:'Local filename/tags/metadata only; no AI or downloads'};
}
export function selectAssets(index,scenes){const used=new Map();return scenes.map(s=>{
 const candidates=index.assets.filter(a=>a.eligible&&['image','video'].includes(a.kind)&&(!s.asset_id||a.id===s.asset_id)).map(a=>{const score=s.asset_query.reduce((n,k)=>n+(a.tags??[]).some(t=>t.includes(k.toLowerCase())||k.toLowerCase().includes(t)) ,0);return {asset:a,score:score-(used.get(a.id)??0)*2-(a.width&&a.height?Math.abs(Math.log((a.width/a.height)/(9/16)))*.1:0)};}).sort((a,b)=>b.score-a.score);
 const best=candidates[0];if(!best||(!s.asset_id&&best.score<=0))return {scene_number:s.scene_number,selected:null,fallback:'original procedural '+s.environment,reason:s.asset_id?'Requested asset missing, changed or unverified':'No suitable licensed local visual'};
 used.set(best.asset.id,(used.get(best.asset.id)??0)+1);return {scene_number:s.scene_number,selected:best.asset,fallback:null,score:best.score};
});}
