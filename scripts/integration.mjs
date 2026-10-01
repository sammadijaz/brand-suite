import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {fileHash,json,writeJson} from '../skills/brand-suite/lib/safety.mjs';
const root=process.cwd(),workspace=fs.mkdtempSync(path.join(os.tmpdir(),'brand-suite-installed-'));
const npmCli=process.env.BRAND_SUITE_NPM_CLI||path.join(path.dirname(process.execPath),'node_modules/npm/bin/npm-cli.js');
function command(args,cwd=workspace,timeout=300000,expected=0){const r=spawnSync(process.execPath,args,{cwd,encoding:'utf8',windowsHide:true,timeout,maxBuffer:4_000_000,env:{...process.env,DISABLE_TELEMETRY:'1'}});if(r.status!==expected)throw Error('Command failed: '+args.slice(0,3).join(' ')+'\n'+r.stderr+'\n'+r.stdout);return r.stdout;}
const skillsCLI=path.join(root,'node_modules/skills/bin/cli.mjs');
const installs=[];
for(const agent of ['codex','claude-code']) {
  const project=path.join(workspace,agent);fs.mkdirSync(project);
  const log=command([skillsCLI,'add',path.join(root,'skills/brand-suite'),'--skill','brand-suite','--agent',agent,'--yes','--copy'],project);
  const installed=agent==='codex'?path.join(project,'.agents/skills/brand-suite'):path.join(project,'.claude/skills/brand-suite');
  assert.ok(fs.existsSync(path.join(installed,'SKILL.md')));
  for(const resource of ['scripts/brand-suite.mjs','scripts/production.py','templates/catalogue.json','templates/documents/clauses.mjs','schemas/input.schema.json','references/brand-principles.md'])assert.equal(fileHash(path.join(installed,resource)),fileHash(path.join(root,'skills/brand-suite',resource)));
  installs.push({agent,path:installed,installed:true,log:log.replaceAll(root,'<source-root>').replaceAll(workspace,'<temporary-project>')});
}
const installed=installs[0].path;command([npmCli,'ci','--ignore-scripts','--prefix',installed]);
const evidence=path.join(workspace,'evidence');fs.cpSync(path.join(root,'tests/fixtures/codebase'),evidence,{recursive:true});
const logo=path.join(workspace,'logo.svg');fs.copyFileSync(path.join(root,'tests/fixtures/logo.svg'),logo);
const before=['README.md','routes.js','theme.css'].map(p=>fileHash(path.join(evidence,p)));
let doctor;
const suites=[];
const originalSkill=path.join(root,'skills/brand-suite'),unavailable=path.join(root,'skills/.brand-suite-unavailable-for-test');
if(fs.existsSync(unavailable))throw Error('Unexpected unavailable-source directory; refusing replacement');
fs.renameSync(originalSkill,unavailable);
try {
doctor=JSON.parse(command([path.join(installed,'scripts/brand-suite.mjs'),'doctor']));assert.equal(doctor.supported_production,true);
for(const name of ['full','messy']) {
  const input=json(path.join(root,'tests/fixtures',name+'.json'));if(input.brand.logo)input.brand.logo=logo;
  const ip=path.join(workspace,name+'.json');writeJson(ip,input);
  const out=path.join(workspace,name+'-suite');
  // The working directory has no original clone and the installed runtime has
  // no import or file reference to it; only copied fixture evidence remains.
  const result=JSON.parse(command([path.join(installed,'scripts/brand-suite.mjs'),'build','--input',ip,'--target',evidence,'--out',out],workspace,600000));
  assert.equal(result.baseline_artifacts,108);assert.equal(result.technical_pass,true);
  const manifest=json(path.join(out,'08_Controls/manifest.json'));assert.equal(manifest.documents.length,36);assert.ok(manifest.artifacts.every(a=>fs.existsSync(path.join(out,a.path))));
  const release=JSON.parse(command([path.join(installed,'scripts/validate-release.mjs'),out],workspace,120000,6));assert.equal(release.execution_approved,false);
  const zip=path.join(workspace,name+'.zip');command([path.join(installed,'scripts/brand-suite.mjs'),'package','--out',out,'--zip',zip]);assert.ok(fs.statSync(zip).size>10000);
  const reopen=path.join(workspace,name+'-reopened');
  const py=process.env.BRAND_SUITE_PYTHON||(process.platform==='win32'?'python':'python3');
  const r=spawnSync(py,['-m','zipfile','-e',zip,reopen],{windowsHide:true,timeout:120000,encoding:'utf8'});assert.equal(r.status,0);
  const qa=JSON.parse(command([path.join(installed,'scripts/brand-suite.mjs'),'qa','--out',reopen]));assert.equal(qa.technical_pass,true);
  suites.push({fixture:name,output:out,baseline:108,technical_pass:true,zip_reopened:true,word_pages:manifest.documents.reduce((sum,d)=>sum+d.pages,0),notes:manifest.documents.filter(d=>!d.applicability.applicable).length});
}
} finally {fs.renameSync(unavailable,originalSkill);}
assert.deepEqual(['README.md','routes.js','theme.css'].map(p=>fileHash(path.join(evidence,p))),before);
const result={timestamp:new Date().toISOString(),installation_agents:installs.map(x=>({...x,path:x.path.replace(workspace,'<temporary-project>')})),execution_environment:{platform:process.platform,node:process.version,word:doctor.dependencies.document_renderer,browser:doctor.dependencies.browser,python:doctor.dependencies.python.python},source_independent:true,original_skill_source_unavailable_during_execution:true,target_unchanged:true,suites};
writeJson(path.join(root,'.work/integration-results.json'),result);console.log(JSON.stringify(result,null,2));
