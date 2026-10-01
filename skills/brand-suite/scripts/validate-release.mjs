import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {verify,createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(process.argv[2]||'.');
const r=spawnSync(process.env.BRAND_SUITE_PYTHON||(process.platform==='win32'?'python':'python3'),[path.join(here,'check-package.py'),root],{encoding:'utf8',windowsHide:true,timeout:120000,maxBuffer:4_000_000});
let result;
try {result=JSON.parse(r.stdout);} catch { console.error(JSON.stringify({status:'MISSING_DEPENDENCY',error:'Install pypdf and defusedxml for portable checker'}));process.exit(3); }
const keyIndex=process.argv.indexOf('--trusted-reviewer-key');
if(keyIndex>=0) {
  try {
    const control=path.join(root,'08_Controls');
    const raw=fs.readFileSync(path.join(control,'review-attestation.json'));
    const attestation=JSON.parse(raw);
    const digest=fs.readFileSync(path.join(control,'manifest.json'));
    const hash=createHash('sha256').update(digest).digest('hex');
    result.authentic_attestation=verify(null,raw,fs.readFileSync(process.argv[keyIndex+1]),fs.readFileSync(path.join(control,'approval-signature.bin')))&&attestation.manifest_sha256===hash&&attestation.reviewer_type==='human'&&attestation.authorized===true&&['facts','legal','visual','authority'].every(k=>attestation.gates?.[k]==='approved');
  } catch {result.authentic_attestation=false;}
} else result.authentic_attestation=false;
result.execution_approved=result.technical_pass&&result.release_gates.length===0&&result.authentic_attestation;
console.log(JSON.stringify(result,null,2));
process.exit(!result.technical_pass?4:result.execution_approved?0:6);
