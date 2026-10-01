import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {json,writeJson,fileHash} from '../skills/brand-suite/lib/safety.mjs';
const root=process.cwd(),work=fs.mkdtempSync(path.join(os.tmpdir(),'brand-suite-modes-'));
const cli=path.join(root,'skills/brand-suite/scripts/brand-suite.mjs'),target=path.join(root,'tests/fixtures/codebase');
const prior=json('.work/integration-results.json').suites[0].output,cases=[];
function run(args,expected=0,env={}) {const r=spawnSync(process.execPath,[cli,...args],{cwd:root,encoding:'utf8',windowsHide:true,timeout:300000,env:{...process.env,...env}});assert.equal(r.status,expected,r.stderr+'\n'+r.stdout);return JSON.parse(r.stdout||r.stderr);}
function input(name,mode,change=()=>{}){const f=json('tests/fixtures/full.json');f.mode=mode;change(f);const p=path.join(work,name+'.json');writeJson(p,f);return p;}
const audit=path.join(work,'audit');assert.equal(run(['build','--input',input('audit','audit-only'),'--target',target,'--out',audit]).slots,0);cases.push({case:'audit-only',passed:true});
const stationery=path.join(work,'stationery'),ip=input('stationery','stationery-only');run(['build','--input',ip,'--target',target,'--out',stationery,'--no-render'],4);assert.equal(json(path.join(stationery,'08_Controls/checkpoint.json')).completed_slots.length,7);assert.equal(run(['render','--out',stationery]).technical_pass,true);cases.push({case:'stationery-deferred-render-resume',passed:true});
assert.equal(run(['build','--input',input('validate','validate-existing',f=>{f.prior=prior;}),'--target',target,'--out',path.join(work,'validate-unused')]).technical_pass,true);cases.push({case:'validate-existing',passed:true});
const priorHash=fileHash(path.join(prior,'04_Agreements/A01.docx'));const next=path.join(work,'updated');run(['build','--input',input('update','update-existing',f=>{f.prior=prior;f.brand.primary='#194d60';}),'--target',target,'--out',next,'--no-render'],4);assert.equal(fileHash(path.join(prior,'04_Agreements/A01.docx')),priorHash);assert.notEqual(json(path.join(next,'08_Controls/checkpoint.json')).input_hash,json(path.join(prior,'08_Controls/checkpoint.json')).input_hash);cases.push({case:'changed-brand-update-preserves-prior',passed:true});
const edited=path.join(work,'edited');fs.cpSync(prior,edited,{recursive:true});fs.appendFileSync(path.join(edited,'04_Agreements/A01.docx'),'manual-edit-canary');run(['build','--input',input('edited','update-existing',f=>{f.prior=edited;}),'--target',target,'--out',path.join(work,'edited-next')],5);cases.push({case:'user-edited-master-protected',passed:true});
run(['build','--input',ip,'--target',target,'--out',stationery],5);cases.push({case:'existing-output-protected',passed:true});
const blocked=path.join(work,'missing-renderer');run(['build','--input',ip,'--target',target,'--out',blocked],3,{BRAND_SUITE_PYTHON:path.join(work,'absent-python')});assert.ok(fs.existsSync(path.join(blocked,'08_Controls/company-profile.json')));assert.ok(!fs.existsSync(path.join(blocked,'02_Stationery/S01.pdf')));cases.push({case:'missing-dependency-preserves-controls-without-fake-pdf',passed:true});
for(const name of ['low-resolution-png','opaque-corner-logo']) {const out=path.join(work,name);run(['build','--input',input(name,'stationery-only',f=>{f.brand.logo=json('tests/fixtures/scenarios/'+name+'.json').brand.logo;}),'--target',target,'--out',out],3);assert.ok(fs.existsSync(path.join(out,'07_Assets/Originals/logo-source.png')));assert.ok(!fs.existsSync(path.join(out,'07_Assets/Originals/logo-source.svg')));cases.push({case:name,passed:true,scope:'explicit raster conversion blocker, original retained'});}
writeJson('.work/mode-results.json',{timestamp:new Date().toISOString(),cases});console.log(JSON.stringify({cases},null,2));
