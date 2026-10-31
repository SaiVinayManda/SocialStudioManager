import fs from 'node:fs';
export async function database(){
  const {Pool}=await import('pg');
  const password=fs.readFileSync(process.env.PG_PASSWORD_FILE,'utf8').trim();
  const pool=new Pool({host:process.env.PGHOST??'127.0.0.1',port:Number(process.env.PGPORT??5432),database:process.env.PGDATABASE??'social_studio',user:process.env.PGUSER??'studio_app',password,max:6,connectionTimeoutMillis:3000,statement_timeout:8000,query_timeout:10000,application_name:'socialstudio-runtime'});
  pool.on('error',()=>{});return pool;
}
// Callbacks must have database-only or deterministic mock effects. Never wrap a live upload.
export async function transaction(db,fn){for(let attempt=0;attempt<3;attempt++){
  const c=await db.connect();try{await c.query('BEGIN');const result=await fn(c);await c.query('COMMIT');return result;}
  catch(e){await c.query('ROLLBACK').catch(()=>{});if(!['40001','40P01'].includes(e.code)||attempt===2)throw e;await new Promise(r=>setTimeout(r,25*(attempt+1)));}
  finally{c.release();}
}}
export async function event(db,jobId,type,payload={},key=null){await db.query('INSERT INTO studio.job_events(job_id,event_type,event_payload,event_key) VALUES($1,$2,$3,$4) ON CONFLICT(event_key) DO NOTHING',[jobId,type,payload,key]);}
