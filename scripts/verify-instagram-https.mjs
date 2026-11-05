// GET-only route/TLS checks; never passes an OAuth code, token or setup cookie.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const value=process.argv.find(x=>x.startsWith('--origin='))?.slice(9),url=new URL(value);
assert.equal(url.protocol,'https:');assert(/^[a-z0-9-]+\.trycloudflare\.com$/.test(url.hostname));assert.equal(url.pathname,'/');assert(!url.username&&!url.password&&!url.search&&!url.hash);
const results=[];
for(const route of ['/','/configure','/select','/jobs','/videos','/instagram/callback?state=fixture-invalid-no-code']){
 let response,text;for(let n=0;n<10;n++){try{response=await fetch(new URL(route,url),{method:'GET',redirect:'error',signal:AbortSignal.timeout(10000)});text=await response.text();if(response.status===400)break;}catch{}if(n<9)await new Promise(r=>setTimeout(r,1000));}
 assert.equal(response?.status,400,'Only state-bound OAuth callback may be processed');assert(!text.includes('name="secret"')&&!text.includes('name="app_id"')&&!text.includes('access_token'),'No setup form or token exposed');assert.equal(response.headers.get('cache-control'),'no-store');results.push({route:route.split('?')[0],status:response.status,no_secret_form:true});
}
const report={at:new Date().toISOString(),origin:url.origin,tls_verified:true,checks:results,oauth_codes_sent:0,uploaded:false,published:false};const directory=path.join(process.cwd(),'docs/test-evidence/instagram-pilot');fs.writeFileSync(path.join(directory,'https-'+report.at.replaceAll(/[:.]/g,'-')+'.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));
