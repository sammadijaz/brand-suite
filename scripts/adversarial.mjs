import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {fileHash,json,writeJson} from '../skills/brand-suite/lib/safety.mjs';
import {checkTechnical} from '../skills/brand-suite/lib/package.mjs';
import {skillRoot} from '../skills/brand-suite/lib/models.mjs';
const source=path.resolve(process.argv[2]||'.work/full-v2'), temp=fs.mkdtempSync(path.join(os.tmpdir(),'brand-suite-adversarial-'));
function clone(name){const out=path.join(temp,name);fs.cpSync(source,out,{recursive:true});return out;}
function rehash(out,rel){const m=json(path.join(out,'08_Controls/manifest.json')),a=m.artifacts.find(x=>x.path===rel);a.sha256=fileHash(path.join(out,rel));a.bytes=fs.statSync(path.join(out,rel)).size;writeJson(path.join(out,'08_Controls/manifest.json'),m);}
function office(out,code){const p=process.env.BRAND_SUITE_PYTHON||(process.platform==='win32'?'python':'python3');const r=spawnSync(p,['-c',code,out],{encoding:'utf8',windowsHide:true,timeout:30000});assert.equal(r.status,0,r.stderr);}
const cases=[];
function scenario(name,mutate,expected){const out=clone(name);mutate(out);const result=checkTechnical(out);assert.ok(expected(result),name+' did not detect intended defect: '+JSON.stringify(result));cases.push({case:name,passed:true,technical_pass:result.technical_pass,detected:result.defects.concat(result.release_gates).filter(x=>!/ unapproved$|Visual review pending|Human authorized/.test(x)).slice(0,6)});}
scenario('split-word-run-token',out=>{office(out,"import sys\nfrom docx import Document\nfrom pathlib import Path\np=Path(sys.argv[1])/'04_Agreements/A01.docx'\nd=Document(p)\nq=d.add_paragraph()\nq.add_run('{{company.')\nq.add_run('tax_identifier}}')\nd.save(p)");rehash(out,'04_Agreements/A01.docx');},r=>r.release_gates.some(x=>x.includes('A01.docx')));
scenario('header-footer-token',out=>{office(out,"import sys\nfrom docx import Document\nfrom pathlib import Path\np=Path(sys.argv[1])/'04_Agreements/A01.docx'\nd=Document(p)\nd.sections[0].header.add_paragraph('{{employee.full_name}}')\nd.save(p)");rehash(out,'04_Agreements/A01.docx');},r=>r.release_gates.some(x=>x.includes('A01.docx')));
scenario('missing-processing-schedule',out=>{const p=path.join(out,'08_Controls/document-models/A07.json'),m=json(p);m.blocks=m.blocks.filter(b=>b.type!=='table'&&b.text!=='Processing schedule');writeJson(p,m);rehash(out,'08_Controls/document-models/A07.json');},r=>r.defects.some(x=>x.includes('Missing required schedule')));
scenario('both-alternatives',out=>{const p=path.join(out,'08_Controls/document-models/A01.json'),m=json(p);m.blocks.push({id:'choice-a',type:'paragraph',category:'proposed-term',text:'SELECTED_ALTERNATIVE: A'},{id:'choice-b',type:'paragraph',category:'proposed-term',text:'SELECTED_ALTERNATIVE: B'});writeJson(p,m);rehash(out,'08_Controls/document-models/A01.json');},r=>r.defects.some(x=>x.includes('Both alternatives')));
scenario('stale-pdf',out=>{fs.copyFileSync(path.join(out,'06_Finance/F01.pdf'),path.join(out,'04_Agreements/A01.pdf'));rehash(out,'04_Agreements/A01.pdf');},r=>r.defects.some(x=>x.includes('Stale rendering')||x.includes('Missing or disordered')));
scenario('wrong-entity-footer',out=>{office(out,"import sys\nfrom docx import Document\nfrom pathlib import Path\np=Path(sys.argv[1])/'04_Agreements/A01.docx'\nd=Document(p)\nd.sections[0].footer.paragraphs[0].text='Other Corporation | unrelated address'\nd.save(p)");rehash(out,'04_Agreements/A01.docx');},r=>r.defects.some(x=>x.includes('inconsistent footer')));
scenario('broken-link',out=>{const p=path.join(out,'index.html');fs.appendFileSync(p,'<a href="missing.pdf">Broken</a>');rehash(out,'index.html');},r=>r.defects.some(x=>x.includes('Broken local link')));
scenario('hidden-private-text',out=>{const p=path.join(out,'02_Stationery/S04.html');fs.appendFileSync(p,'<p style="display:none">PRIVATE_CANARY</p>');rehash(out,'02_Stationery/S04.html');},r=>r.defects.some(x=>x.includes('Hidden HTML'))&&r.defects.some(x=>x.includes('canary')));
scenario('currency-total-mismatch',out=>{const p=path.join(out,'08_Controls/finance-reconciliation.json'),f=json(p);f.total='1250.01';writeJson(p,f);rehash(out,'08_Controls/finance-reconciliation.json');},r=>r.defects.some(x=>x.includes('Currency totals')));
scenario('changed-approved-source',out=>{const p=path.join(out,'08_Controls/company-profile.json'),f=json(p);f.fields['company.legal_name'].value='Changed Entity';writeJson(p,f);},r=>r.defects.some(x=>x.includes('Stale hash')));
scenario('harmless-brackets',out=>{const p=path.join(out,'README.md');fs.appendFileSync(p,'\n[ordinary explanatory bracket] (not a field)\n');rehash(out,'README.md');},r=>r.technical_pass);
scenario('fake-approval',out=>{writeJson(path.join(out,'08_Controls/approval-record.json'),{state:'APPROVED_BY_AUTHORIZED_REVIEWER',reviewer:'fabricated',evidence:'none'});rehash(out,'08_Controls/approval-record.json');},r=>r.execution_approved===false);
const result={timestamp:new Date().toISOString(),cases,scope:'Read-only release-checker adversarial mutations, synthetic package only'};writeJson('.work/adversarial-results.json',result);console.log(JSON.stringify(result,null,2));
