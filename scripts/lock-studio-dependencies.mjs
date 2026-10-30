// Public registry metadata only. No package payloads, scripts, auth or installation.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const target=path.join(process.cwd(),'services','studio-runtime');fs.mkdirSync(target,{recursive:true});
const versions={pg:'8.16.3','pg-cloudflare':'1.2.7','pg-connection-string':'2.9.1','pg-pool':'3.10.1','pg-protocol':'1.10.3','pg-types':'2.2.0',pgpass:'1.0.5','pg-int8':'1.0.1','postgres-array':'2.0.0','postgres-bytea':'1.0.0','postgres-date':'1.0.7','postgres-interval':'1.2.0',xtend:'4.0.2',split2:'4.2.0'};
const pkg={name:'social-studio-orchestrator',version:'0.1.0',private:true,type:'module',engines:{node:'>=22.19.0'},dependencies:{pg:versions.pg},overrides:Object.fromEntries(Object.entries(versions).filter(([k])=>k!=='pg'))};
const packages={'':{name:pkg.name,version:pkg.version,dependencies:pkg.dependencies,engines:pkg.engines}};const metadata=[];
for(const [name,version] of Object.entries(versions)){
 const url=`https://registry.npmjs.org/${name}/${version}`;const response=await fetch(url,{headers:{'User-Agent':'SocialStudio-Metadata-Audit/1.0'},redirect:'error',signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw Error(`${name}: HTTP ${response.status}`);const data=await response.json();
 if(data.name!==name||data.version!==version||new URL(data.dist.tarball).hostname!=='registry.npmjs.org'||!data.dist.integrity)throw Error('Unexpected registry metadata');
 packages['node_modules/'+name]={version,resolved:data.dist.tarball,integrity:data.dist.integrity,...(data.license?{license:data.license}:{}),...(data.dependencies?{dependencies:data.dependencies}:{}),...(data.optionalDependencies?{optionalDependencies:data.optionalDependencies}:{}),...(data.peerDependencies?{peerDependencies:data.peerDependencies}:{}),...(data.peerDependenciesMeta?{peerDependenciesMeta:data.peerDependenciesMeta}:{}),...(data.engines?{engines:data.engines}:{})};
 metadata.push({name,version,url,tarball:data.dist.tarball,integrity:data.dist.integrity,unpacked_size:data.dist.unpackedSize??null,has_install_scripts:Boolean(data.scripts?.install||data.scripts?.postinstall||data.scripts?.preinstall)});
}
for(const data of Object.values(packages))for(const dep of Object.keys({...data.dependencies,...data.optionalDependencies}))if(!versions[dep])throw Error('Unpinned transitive dependency: '+dep);
for(const [name,data] of [['package.json',pkg],['package-lock.json',{name:pkg.name,version:pkg.version,lockfileVersion:3,requires:true,packages}]])fs.writeFileSync(path.join(target,name),JSON.stringify(data,null,2)+'\n',{flag:'wx'});
const evidence=path.join(process.cwd(),'docs','test-evidence','milestone-e-foundation');fs.mkdirSync(evidence,{recursive:true});
const record={captured_at_utc:new Date().toISOString(),operation:'public metadata only; no package downloaded/installed',packages:metadata,lock_sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(target,'package-lock.json'))).digest('hex')};
fs.writeFileSync(path.join(evidence,'dependency-metadata.json'),JSON.stringify(record,null,2),{flag:'wx'});
console.log(JSON.stringify({packages:metadata.length,unpacked_bytes:metadata.reduce((n,p)=>n+(p.unpacked_size??0),0),lock_sha256:record.lock_sha256}));
