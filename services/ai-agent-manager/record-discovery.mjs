// Operator-only metadata import via existing docker exec; not an HTTP endpoint.
import {database} from '../studio-runtime/db.mjs';import {demand} from '../studio-runtime/contracts.mjs';
let bytes=0,text='';for await(const b of process.stdin){bytes+=b.length;demand(bytes<100000,'DISCOVERY_TOO_LARGE');text+=b;}
const report=JSON.parse(text);demand(report.credential_access===false&&report.inference_requests===0,'INVALID_DISCOVERY_RECEIPT');
const command=name=>report.commands?.some(c=>c.name===name&&c.exit_code===0);
demand(command('codex-version')&&command('codex-exec-help')&&command('agy-help'),'CLI_HELP_DISCOVERY_INCOMPLETE');
demand(/^codex-cli \d+\.\d+\.\d+$/.test(report.codex_version),'CODEX_VERSION_EVIDENCE_REQUIRED');
const router=report.endpoints.find(e=>e.url==='http://127.0.0.1:20128/v1/models');demand(router?.http_status===200,'ROUTER_DISCOVERY_INCOMPLETE');
const rows=[
  ['codex','unsupported','external_isolation_not_verified',{cli_help_verified:true,version:report.codex_version,jsonl:true,output_schema:true,live_inference_verified:false}],
  ['agy','unsupported','external_isolation_and_tool_allowlist_not_verified',{cli_help_verified:true,executable_sha256:report.agy.sha256,print_mode:true,json_schema:true,live_inference_verified:false}],
  ['9router','approval_required','route_cost_and_provider_authorization_required',{package_version:report.router.version,loopback_endpoint:'http://127.0.0.1:20128/v1',model_list_http_status:200,listed_models:router.models.map(m=>m.id),free_usage_verified:false,live_inference_verified:false}]
];
const db=await database();try{for(const [provider,status,reason,metadata]of rows)await db.query('UPDATE studio.ai_provider_health SET status=$2,error_category=$3,last_checked=now(),capability_metadata=$4 WHERE provider=$1',[provider,status,reason,metadata]);console.log(JSON.stringify({passed:true,metadata_rows:rows.length,model_requests:0}));}finally{await db.end();}
