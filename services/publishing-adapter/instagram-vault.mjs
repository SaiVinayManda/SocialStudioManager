// Dedicated, Git-ignored vault; key and ciphertext are separate mounted secrets.
// No publishing credential is mounted in the media worker or passed through n8n.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {demand} from '../studio-runtime/contracts.mjs';
export function sealCredential(value,key){demand(Buffer.isBuffer(key)&&key.length===32,'INVALID_VAULT_KEY');const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',key,iv);const data=Buffer.concat([cipher.update(JSON.stringify(value),'utf8'),cipher.final()]);return JSON.stringify({v:1,iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),data:data.toString('base64')});}
export function openCredential(text,key){const r=JSON.parse(text);demand(r.v===1&&Buffer.isBuffer(key)&&key.length===32,'INVALID_VAULT');const cipher=crypto.createDecipheriv('aes-256-gcm',key,Buffer.from(r.iv,'base64'));cipher.setAuthTag(Buffer.from(r.tag,'base64'));return JSON.parse(Buffer.concat([cipher.update(Buffer.from(r.data,'base64')),cipher.final()]).toString('utf8'));}
export function readInstagramCredential(){return openCredential(fs.readFileSync(process.env.INSTAGRAM_VAULT_FILE,'utf8'),fs.readFileSync(process.env.INSTAGRAM_VAULT_KEY_FILE));}
