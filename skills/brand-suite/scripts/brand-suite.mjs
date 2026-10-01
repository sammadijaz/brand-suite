#!/usr/bin/env node
import path from 'node:path';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {doctor,build,reconcile,checkTechnical} from '../lib/package.mjs';
import {inventory,json,writeJson,SuiteError,separate,fileHash} from '../lib/safety.mjs';
import {validateInput,skillRoot} from '../lib/models.mjs';
import {render,py,run} from '../lib/render.mjs';
const args=process.argv.slice(2),command=args.shift();
const help=`brand-suite — evidence-based draft document production\n\nnode <installed-skill>/scripts/brand-suite.mjs COMMAND [flags]\n\nCommands:\n  doctor\n  inventory --target ROOT --out REPORT.json\n  validate-input --input INPUT.json\n  build --input INPUT.json --target READ_ONLY_ROOT --out NEW_OUTPUT [--no-render]\n  render --out GENERATED_PACKAGE\n  qa --out GENERATED_PACKAGE\n  validate-release --out PACKAGE [--trusted-reviewer-key PUBLIC_KEY]\n  package --out PACKAGE --zip NEW_ARCHIVE.zip\n\nInput mode: full-suite, audit-only, stationery-only, update-existing, validate-existing.\nEnglish production; A4 or Letter. Existing outputs are never overwritten by build.\nExit codes: 0 technical success; 2 invalid input; 3 missing dependency; 4 production/QA failure; 5 security/protected output; 6 unresolved execution gate.\n`;
function parse() {
  const flags={};
  for(let i=0;i<args.length;i++) {
    const key=args[i];if(!['--target','--input','--out','--zip','--trusted-reviewer-key','--no-render'].includes(key))throw new SuiteError('Unknown flag '+key);
    if(key==='--no-render')flags.noRender=true;else{if(!args[i+1]||args[i+1].startsWith('--'))throw new SuiteError('Missing value for '+key);flags[key.slice(2)]=args[++i];}
  }return flags;
}
try {
  if(!command||['help','--help','-h'].includes(command)){console.log(help);process.exit(0);}
  const f=parse(),need=k=>{if(!f[k])throw new SuiteError('Required --'+k);return path.resolve(f[k]);};let result;
  if(command==='doctor')result=await doctor();
  else if(command==='inventory'){separate(need('target'),path.dirname(need('out')));result=inventory(need('target'));writeJson(need('out'),result);}
  else if(command==='validate-input'){validateInput(json(need('input')));result={valid:true};}
  else if(command==='build')result=await build(need('input'),need('target'),need('out'),{noRender:!!f.noRender});
  else if(command==='qa'){result=checkTechnical(need('out'));if(!result.technical_pass)process.exitCode=4;}
  else if(command==='render') {
    const out=need('out');const prior=checkTechnical(out),manifest=json(path.join(out,'08_Controls/manifest.json'));
    const deferred=manifest.blockers.includes('Rendering explicitly deferred')&&manifest.artifacts.every(a=>fs.existsSync(path.join(out,a.path))&&fileHash(path.join(out,a.path))===a.sha256);
    if(!prior.technical_pass&&!deferred)throw new SuiteError('Package changed or incomplete; review sources before rerendering',5);
    const checkpoint=json(path.join(out,'08_Controls/checkpoint.json'));
    const models=checkpoint.completed_slots.map(id=>json(path.join(out,'08_Controls/document-models',id+'.json')));
    const tokens=json(path.join(out,'08_Controls/brand-tokens.json')).fields;
    await render(out,models,Object.fromEntries(Object.entries(tokens).map(([k,v])=>[k.split('.')[1],v.value])));
    checkpoint.blockers=checkpoint.blockers.filter(x=>x!=='Rendering explicitly deferred');writeJson(path.join(out,'08_Controls/checkpoint.json'),checkpoint);
    for(const name of ['asset-job.json','render-job.json','word-job.json']) {const p=path.join(out,'08_Controls',name);if(fs.existsSync(p))fs.unlinkSync(p);}
    writeJson(path.join(out,'08_Controls/task-ledger.json'),{state:'GENERATED_DRAFT',completed_slots:checkpoint.completed_slots,remaining_slots:checkpoint.remaining_slots,blockers:checkpoint.blockers});
    const updated=reconcile(out),index=path.join(out,'index.html');
    fs.appendFileSync(index,'<details><summary>Rendered artifact register</summary><ul>'+updated.artifacts.map(a=>'<li><a href="'+a.path+'">'+a.path+'</a></li>').join('')+'</ul></details>');
    reconcile(out);result=checkTechnical(out);writeJson(path.join(out,'08_Controls/qa-results.json'),result);fs.writeFileSync(path.join(out,'08_Controls/QA-REPORT.md'),'# Resumed rendering QA\n\nTechnical pass: '+result.technical_pass+'\n\nVisual, factual, legal and authorized release gates remain separate.\n');if(!result.technical_pass)process.exitCode=4;
  } else if(command==='validate-release') {
    const r=spawnSync(process.execPath,[path.join(skillRoot,'scripts/validate-release.mjs'),need('out'),...(f['trusted-reviewer-key']?['--trusted-reviewer-key',need('trusted-reviewer-key')]:[])],{encoding:'utf8',windowsHide:true,timeout:120000});result=JSON.parse(r.stdout);process.exitCode=r.status||0;
  } else if(command==='package') {
    const out=need('out'),zip=need('zip');if(fs.existsSync(zip))throw new SuiteError('Archive already exists',5);
    const qa=checkTechnical(out);if(!qa.technical_pass)throw new SuiteError('Packaging blocked by technical defects',4);
    result=JSON.parse(py('zip',['--out',out,'--destination',zip]));result.release_state='DRAFT_REVIEW_PACKAGE; execution approval absent';
  } else throw new SuiteError('Unknown command '+command);
  console.log(JSON.stringify(result,null,2));
} catch(e) {const code=typeof e.code==='number'?e.code:2;console.error(JSON.stringify({status:'failed',code,error:e.message}));process.exit(code);}
