import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {skillRoot,validate,validateInput,assemble,modelTexts} from './models.mjs';
import {json,writeJson,fileHash,hash,inventory,separate,escape,safeLink,SuiteError,inside,contrast} from './safety.mjs';
import {makeAssets,render,py,run,python,browser,guardedPage} from './render.mjs';
import {website} from './website.mjs';

export async function doctor() {
  const checks={node:process.version,platform:process.platform,skill_root:skillRoot,telemetry:false,commands:['doctor','inventory','validate-input','build','render','qa','validate-release','package'],modes:['full-suite','audit-only','stationery-only','update-existing','validate-existing'],dependencies:{},supported_production:false};
  try {checks.dependencies.python=JSON.parse(py('doctor'));}catch(e){checks.dependencies.python={blocker:e.message};}
  try {const b=await browser();checks.dependencies.browser=b.version();await b.close();}catch(e){checks.dependencies.browser={blocker:e.message};}
  try {checks.dependencies.document_renderer=process.platform==='win32'&&!process.env.BRAND_SUITE_SOFFICE?run('powershell.exe',['-NoProfile','-NonInteractive','-Command',"$w=New-Object -ComObject Word.Application; try { $w.Visible=$false; $w.Version } finally { $w.Quit() }"],20000).trim():run(process.env.BRAND_SUITE_SOFFICE||'soffice',['--version']).trim();}catch(e){checks.dependencies.document_renderer={blocker:e.message};}
  checks.supported_production=Object.values(checks.dependencies).every(v=>!(v&&typeof v==='object'&&v.blocker));
  return checks;
}
function artifactList(out) {
  const list=[];
  const inspection=fs.existsSync(path.join(out,'08_Controls/inspection.json'))?json(path.join(out,'08_Controls/inspection.json')):null;
  function walk(dir) {for(const e of fs.readdirSync(dir,{withFileTypes:true})) {
    const p=path.join(dir,e.name);if(e.isSymbolicLink())throw new SuiteError('Package symlink denied',5);
    if(e.isDirectory())walk(p);else {
      const rel=path.relative(out,p).replaceAll('\\','/');
      if(['08_Controls/manifest.json','08_Controls/qa-results.json','08_Controls/QA-REPORT.md','08_Controls/approval-signature.bin','08_Controls/review-attestation.json'].includes(rel))continue;
      const item={path:rel,bytes:fs.statSync(p).size,sha256:fileHash(p)};
      if(rel.endsWith('.pdf')) {
        const id=path.basename(p).split('.')[0],data=inspection?.documents.find(d=>d.id===id);
        const pdf=data?.pdfs.find(x=>(rel.includes('html-print')?x.kind.startsWith('Chromium'):x.kind.startsWith('Word')));
        if(pdf)item.pages=pdf.pages.length;
      }
      list.push(item);
    }
  }}walk(out);return list.sort((a,b)=>a.path.localeCompare(b.path));
}
export function reconcile(out) {
  const checkpoint=json(path.join(out,'08_Controls/checkpoint.json'));
  const models=checkpoint.completed_slots.map(id=>json(path.join(out,'08_Controls/document-models',id+'.json')));
  const manifest={schema_version:'1.0',mode:checkpoint.mode,complete:checkpoint.mode==='full-suite'||checkpoint.mode==='update-existing'?models.length===36:checkpoint.mode==='stationery-only'?models.length===7:false,entity_id:checkpoint.entity_id,input_hash:checkpoint.input_hash,documents:models.map(m=>({id:m.id,title:m.title,folder:m.folder,formats:['html','pdf','docx'],applicability:m.applicability,release_state:m.release_state,unresolved:m.unresolved,review_requirements:m.review_requirements,model_sha256:fileHash(path.join(out,'08_Controls/document-models',m.id+'.json')),pages:json(path.join(out,'08_Controls/inspection.json')).documents.find(d=>d.id===m.id)?.pdfs[0]?.pages.length??null})),artifacts:artifactList(out),blockers:checkpoint.blockers};
  validate('manifest',manifest);writeJson(path.join(out,'08_Controls/manifest.json'),manifest); return manifest;
}
export function checkTechnical(out) {
  const r=spawnSync(python(),[path.join(skillRoot,'scripts/check-package.py'),out],{encoding:'utf8',timeout:120000,windowsHide:true,maxBuffer:4_000_000});
  try{return JSON.parse(r.stdout);}catch{throw new SuiteError('Portable checker dependency missing or malformed output',3);}
}
export async function email(out,input) {
  const dir=path.join(out,'02_Stationery'), name=String(input.fields['company.trading_name']?.value||'Project'), sender=String(input.fields['signatory.full_name']?.value||'[REQUIRED: signatory.full_name]'), contact=String(input.fields['company.email']?.value||'[REQUIRED: company.email]'), site=input.fields['company.website']?.value;
  let link=''; if(site) link=` | <a href="${escape(safeLink(site))}">${escape(site)}</a>`;
  const signature=`<table role="presentation" style="font-family:Arial,Helvetica,sans-serif;width:100%;max-width:600px;color:#172b35"><tr><td style="padding:12px 0;overflow-wrap:anywhere"><strong>${escape(sender)}</strong><br>${escape(name)}<br>${escape(contact)}${link}</td></tr></table>`;
  const message=`<h1 style="font-size:20px;margin:0 0 16px;overflow-wrap:anywhere">${escape(input.terms['email.subject']||'[REQUIRED: email.subject]')}</h1><p style="margin:0 0 20px;line-height:1.5;overflow-wrap:anywhere">${escape(input.terms['email.body']||'[REQUIRED: email.body]')}</p>`;
  const template=fs.readFileSync(path.join(skillRoot,'templates/email/send.html'),'utf8');
  const base=template.replace('%%BRANDING%%',`<strong>${escape(name)}</strong>`).replace('%%MESSAGE%%',message).replace('%%SIGNATURE%%',signature);
  fs.writeFileSync(path.join(dir,'S05_Email_Letterhead_SEND.html'),base);
  fs.writeFileSync(path.join(dir,'S05_Email_Letterhead_SEND_CID.html'),base.replace(`<strong>${escape(name)}</strong>`,`<img src="cid:brand-suite-logo" width="120" alt="${escape(name)}" style="display:block;margin-bottom:8px"><strong>${escape(name)}</strong>`));
  fs.writeFileSync(path.join(dir,'S06_Email_Signature_SEND.html'),signature);
  fs.writeFileSync(path.join(dir,'S05_Email_Letterhead.txt'),`${name}\n${input.terms['email.subject']||'[REQUIRED: email.subject]'}\n\n${input.terms['email.body']||'[REQUIRED: email.body]'}\n\n${sender}\n${contact}\n`);
  fs.writeFileSync(path.join(dir,'S06_Email_Signature.txt'),`${sender}\n${name}\n${contact}\n${site||''}\n`);
  fs.copyFileSync(path.join(skillRoot,'references/email-production.md'),path.join(dir,'EMAIL_IMPLEMENTATION.md'));
  const b=await browser(),checks=[];
  try {
    for(const width of [320,375,768,1200]) {
      const {ctx,page}=await guardedPage(b,{viewport:{width,height:900}});
      for(const scenario of ['normal','long-fields','dark-approximation','blocked-images']) {
        let content=scenario==='long-fields'?base.replace(message,`<p style="overflow-wrap:anywhere">${'Long subject/contact '.repeat(30)}</p>${message}`):scenario==='dark-approximation'?base.replace('</head>','<style>body,table,td{background:#172b35!important;color:white!important}a{color:#a8dbff!important}</style></head>'):base;
        await page.setContent(content);
        const metrics=await page.locator('body').evaluate(el=>({overflow:el.scrollWidth>el.clientWidth+1,text:el.innerText.length}));
        checks.push({width,scenario,...metrics});if(metrics.overflow||metrics.text<20)throw new SuiteError('Email layout failed',4);
        if(scenario==='normal')await page.screenshot({path:path.join(out,'previews',`email-${width}.png`),fullPage:true});
      }await ctx.close();
    }
  }finally{await b.close();}
  writeJson(path.join(out,'08_Controls/email-checks.json'),{checks,live_send:'NOT RUN',clients:{Gmail:'NOT RUN',Outlook:'NOT RUN',AppleMail:'NOT RUN'},dark_mode:'browser CSS approximation only',blocked_images:'image-free template remains readable; CID requires attachment and actual-client testing'});
}
export async function build(inputPath,target,out,{noRender=false}={}) {
  const input=validateInput(json(inputPath)); target=path.resolve(target);out=path.resolve(out);separate(target,out);
  if(input.mode==='validate-existing') {if(!input.prior)throw new SuiteError('validate-existing requires prior');return checkTechnical(path.resolve(input.prior));}
  if(fs.existsSync(out)&&fs.readdirSync(out).length)throw new SuiteError('Output contains existing files; choose a new version directory. Manual and signed masters are never overwritten',5);
  if(input.mode==='update-existing') {
    if(!input.prior)throw new SuiteError('update-existing requires prior');
    const old=checkTechnical(path.resolve(input.prior));if(!old.technical_pass)throw new SuiteError('Prior package has changed or defective artifacts; preserve and review edits before regeneration',5);
    // Import of negotiated Word changes is deliberately not automatic.
  }
  fs.mkdirSync(out,{recursive:true});for(const d of ['01_Guides','02_Stationery','03_People','04_Agreements','05_Corporate','06_Finance','08_Controls/document-models','previews'])fs.mkdirSync(path.join(out,d),{recursive:true});
  writeJson(path.join(out,'08_Controls/task-ledger.json'),{input_hash:fileHash(inputPath),state:'IN_PROGRESS',remaining_slots:input.mode==='stationery-only'?7:input.mode==='audit-only'?0:36,decisions:['new output directory; originals untouched'],blockers:[]});
  const inv=inventory(target),initialHashes=hash(JSON.stringify(inv.files));
  for(const review of input.reviewed_paths) {
    const original=inv.files.find(x=>x.path===review.path);if(!original||review.sha256!==original.sha256)throw new SuiteError('Review references changed or excluded source');
    original.depth=review.depth||'HOST_REVIEWED';original.claims=review.claims||[];
  }
  inv.unresolved=inv.files.filter(x=>x.depth==='INVENTORIED_ONLY').map(x=>x.path);
  const c=path.join(out,'08_Controls');
  const profile={schema_version:'1.0',entity_id:input.entity_id,fictional:input.fictional,fields:input.fields};validate('company-profile',profile);writeJson(path.join(c,'company-profile.json'),profile);
  const brandFields=Object.fromEntries(Object.entries(input.brand).filter(([k])=>['primary','ink','accent','font'].includes(k)).map(([k,v])=>['brand.'+k,{value:v,status:'OWNER_PROVIDED',source_id:'brand-input',locator:'input.brand.'+k,observed_at:new Date().toISOString(),sha256:fileHash(inputPath),scope:input.entity_id,verification:'Confirm approved brand masters and available font'}]));
  const brand={schema_version:'1.0',fields:brandFields,geometry:{margin_mm:22,body_pt:11,footer_pt:9,paper:input.paper},provisional:!input.brand.logo};validate('brand-tokens',brand);writeJson(path.join(c,'brand-tokens.json'),brand);
  const inputSource={id:'brand-input',kind:'owner',locator:'approved input record',sha256:fileHash(inputPath),scope:input.entity_id};
  for(const [name,data] of Object.entries({'source-register':{schema_version:'1.0',sources:[...input.sources,inputSource]},'evidence-map':{schema_version:'1.0',claims:[...Object.entries(input.fields).map(([field,data])=>({field,...data})),...Object.entries(input.terms).map(([field,value])=>({field,value,status:value===null?'UNKNOWN':'PROPOSED',source_id:'brand-input',locator:'input.terms.'+field,sha256:fileHash(inputPath),observed_at:new Date().toISOString(),scope:input.entity_id,verification:'Intentional business selection and applicable legal review required'}))]},'unknowns':{schema_version:'1.0',fields:Object.entries(input.fields).filter(([,f])=>f.value===null||['UNKNOWN','CONFLICTED'].includes(f.status)).map(([k])=>k)},'contradictions':{schema_version:'1.0',items:input.contradictions},'website-coverage':await website(input)})) {validate(name,data);writeJson(path.join(c,name+'.json'),data);}
  writeJson(path.join(c,'codebase-coverage.json'),inv);
  fs.writeFileSync(path.join(out,'CODEBASE_MAP.md'),`# Reviewed scope\n\nInventory is not semantic understanding. Source root is read-only.\n\n${inv.files.map(x=>`- ${x.path}: ${x.depth}; claims ${x.claims.join(', ')||'none yet'}`).join('\n')}\n\nUnreviewed paths: ${inv.unresolved.length}. Exclusions: ${inv.exclusions.length}.\n`);
  const {models,finance}=assemble(input);writeJson(path.join(c,'finance-reconciliation.json'),finance);
  const unknowns={schema_version:'1.0',fields:[...new Set([...json(path.join(c,'unknowns.json')).fields,...models.flatMap(m=>m.unresolved)])].sort()};validate('unknowns',unknowns);writeJson(path.join(c,'unknowns.json'),unknowns);
  writeJson(path.join(c,'contrast-results.json'),{pairs:['ink','primary','accent'].map(role=>({role,foreground:input.brand[role],background:'#ffffff',ratio:Number(contrast(input.brand[role],'#ffffff').toFixed(2)),body_text_minimum:4.5})),scope:'mathematical screen contrast only; no accessibility certification'});
  for(const m of models)writeJson(path.join(c,'document-models',m.id+'.json'),m);
  writeJson(path.join(c,'checkpoint.json'),{schema_version:'1.0',mode:input.mode,entity_id:input.entity_id,input_hash:fileHash(inputPath),source_hash:initialHashes,completed_slots:[],remaining_slots:models.length,blockers:['Production pending'],decisions:['evidence/model assembly saved; resume into a new output version'],pending_models:models.map(m=>m.id)});
  const registry={schema_version:'1.0',fields:[...new Set(models.flatMap(m=>m.fields_used))].sort().map(k=>({key:k,type:'namespaced factual/selected-term scalar',value:input.fields[k]?.value??input.terms[k]??null,status:input.fields[k]?.status||'PROPOSED',validation:'explicit nonempty value; identity evidence separately checked',required_stage:'before execution',sensitivity:/employee|signatory|tax|registration|counterparty/.test(k)?'restricted':'ordinary',documents:models.filter(m=>m.fields_used.includes(k)).map(m=>m.id)}))};validate('field-registry',registry);writeJson(path.join(c,'field-registry.json'),registry);
  writeJson(path.join(c,'approval-record.json'),{schema_version:'1.0',state:'NOT_APPROVED',reviewer:null,evidence:null,reason:'Technical generation cannot award human factual/legal/authority approval'});
  fs.copyFileSync(path.join(skillRoot,'scripts/check-package.py'),path.join(c,'check-package.py'));fs.copyFileSync(path.join(skillRoot,'scripts/validate-release.mjs'),path.join(c,'validate-release.mjs'));
  fs.writeFileSync(path.join(c,'CHECKER.md'),'Run node validate-release.mjs PACKAGE_ROOT with BRAND_SUITE_PYTHON set to a Python environment containing pypdf and defusedxml. Exit 4: technical failure; 6: unresolved human release gates. Optional --trusted-reviewer-key requires an externally trusted Ed25519 public key and a signed attestation. The checker never creates approval.\n');
  fs.writeFileSync(path.join(c,'release-checklist.md'),'# Release checklist\n\n- Verify entity and factual fields against proper sources.\n- Resolve every term and applicability decision.\n- Obtain local legal review where material.\n- Inspect all rendered pages; record hashes and actual reviewer type.\n- Verify authority and signatures through authentic evidence.\n- Proof ordinary stamps and actual email clients before use.\n- Rebuild and invalidate approval after source, model, asset or typography changes.\n');
  const blockers=[];
  if(inv.unresolved.length)blockers.push('Host semantic source review incomplete');
  if(input.contradictions.length)blockers.push('Unresolved contradictions');
  if(noRender)blockers.push('Rendering explicitly deferred');
  if(input.mode!=='audit-only') {
    const commit=spawnSync('git',['-C',target,'rev-parse','HEAD'],{encoding:'utf8',windowsHide:true,timeout:10000});
    const d=await doctor();writeJson(path.join(c,'build-info.json'),{...d,template_version:'0.1.0',timestamp:new Date().toISOString(),input_sha256:fileHash(inputPath),source_commit:commit.status===0?commit.stdout.trim():null,source_hashes:inv.files.map(x=>({path:x.path,sha256:x.sha256}))});
    if(!d.supported_production){writeJson(path.join(c,'task-ledger.json'),{state:'BLOCKED_DEPENDENCY',remaining_slots:models.length,blockers:d.dependencies});throw new SuiteError('Required production dependency missing; evidence controls preserved. Run doctor for exact blockers',3);}
    if(contrast(input.brand.ink,'#ffffff')<4.5||contrast(input.brand.primary,'#ffffff')<4.5)throw new SuiteError('Selected text/heading colours fail 4.5:1 screen contrast; retain masters and choose an owner-approved readable stationery colour',4);
    // The selected font is verified by the local helper. Unsupported requested fonts use a documented fallback.
    const available=d.dependencies.python.font_family;
    if(input.brand.font!==available) {
      blockers.push('Requested font unavailable in selected production path; substituted '+available);
      const info=json(path.join(c,'build-info.json'));info.font_substitution={requested:input.brand.font,rendered:available};writeJson(path.join(c,'build-info.json'),info);
      input.brand.font=available;brand.fields['brand.font']={...brand.fields['brand.font'],value:available,status:'PROPOSED',verification:'Renderer fallback; original requested family recorded in build-info'};writeJson(path.join(c,'brand-tokens.json'),brand);
    }
    await makeAssets(out,input);await email(out,input);
    for(const m of models)for(const b of m.blocks)if(b.type==='image') {
      const png=fs.readFileSync(inside(out,b.src));
      b.height_mm=Number((b.width_mm*png.readUInt32BE(20)/png.readUInt32BE(16)).toFixed(2));
      if(b.height_mm>230)throw new SuiteError('Illustration exceeds page body; choose an appropriate specimen layout',4);
    }
    for(const m of models)writeJson(path.join(c,'document-models',m.id+'.json'),m);
    if(!noRender)await render(out,models,input.brand);
  }
  if(hash(JSON.stringify(inventory(target).files))!==initialHashes)throw new SuiteError('Target source changed during build; review invalidated',5);
  const previous=input.prior?json(path.join(path.resolve(input.prior),'08_Controls/checkpoint.json')):null;
  const checkpoint={schema_version:'1.0',mode:input.mode,entity_id:input.entity_id,input_hash:fileHash(inputPath),source_hash:initialHashes,completed_slots:models.map(m=>m.id),remaining_slots:input.mode==='full-suite'?36-models.length:0,blockers,decisions:['draft outputs only','no self approval','existing originals retained'],prior_input_hash:previous?.input_hash||null,changed_sources:previous?previous.source_hash!==initialHashes:null};writeJson(path.join(c,'checkpoint.json'),checkpoint);writeJson(path.join(c,'task-ledger.json'),{state:noRender?'RENDERING_DEFERRED':'GENERATED_DRAFT',remaining_slots:checkpoint.remaining_slots,completed_slots:checkpoint.completed_slots,blockers});
  // Remove renderer job files containing machine-specific absolute paths.
  for(const name of ['asset-job.json','render-job.json','word-job.json'])if(fs.existsSync(path.join(c,name)))fs.unlinkSync(path.join(c,name));
  fs.writeFileSync(path.join(out,'README.md'),`# Corporate suite\n\n${input.fictional?'FICTIONAL DEMONSTRATION. ':''}${input.mode}; ${models.length} slots. All documents are unexecuted review copies. Word is the editable master; its exported PDF is authoritative for print. HTML print is checked separately.\n\nOpen index.html offline. Do not print digital branding over preprinted stationery. SEND/CID email files are separate from references; see EMAIL_IMPLEMENTATION.md. Stamps require supplier proof. Keep the manifest and source hashes with revisions. Approval is absent.\n`);
  const links=models.map(m=>`<li>${m.id} ${escape(m.title)} — ${escape(m.release_state)} (${m.applicability.applicable?'instrument/reference':'applicability note'}) ${['html','pdf','docx'].map(ext=>`<a href="${m.folder}/${m.id}.${ext}">${ext.toUpperCase()}</a>`).join(' · ')}</li>`).join('\n');
  const extras=['02_Stationery/S05_Email_Letterhead_SEND.html','02_Stationery/S05_Email_Letterhead_SEND_CID.html','02_Stationery/S06_Email_Signature_SEND.html','02_Stationery/EMAIL_IMPLEMENTATION.md','07_Assets/Stamps/company-stamp.svg','07_Assets/Stamps/signatory-stamp.svg','08_Controls/manifest.json','08_Controls/QA-REPORT.md','08_Controls/release-checklist.md'];
  const everyArtifact=[...new Set([...artifactList(out).map(a=>a.path),'index.html','08_Controls/manifest.json','08_Controls/qa-results.json','08_Controls/QA-REPORT.md'])].sort();
  fs.writeFileSync(path.join(out,'index.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Corporate suite handover</title><body style="font-family:Arial;max-width:1000px;margin:40px auto;padding:20px"><h1>${escape(input.fields['company.trading_name']?.value||'Project')} corporate suite</h1><p>${input.fictional?'Fictional demonstration. ':''}${escape(input.mode)}. Draft/review use only; no legal approval or execution. All required baseline artifacts are linked below.</p><ul>${links}</ul><h2>Sending files, assets and controls</h2><ul>${extras.filter(p=>fs.existsSync(path.join(out,p))||p.includes('manifest')||p.includes('QA-REPORT')).map(p=>`<li><a href="${p}">${p}</a></li>`).join('')}</ul><p>CID sending requires the supplied PNG attachment. No client send test has been performed. Use read-only release checker before authorized use.</p><details><summary>All package artifacts</summary><ul>${everyArtifact.map(p=>`<li><a href="${escape(p)}">${escape(p)}</a></li>`).join('')}</ul></details></body></html>`);
  if(!fs.existsSync(path.join(c,'inspection.json')))writeJson(path.join(c,'inspection.json'),{documents:models.map(m=>({id:m.id,defects:['Rendering missing'],pdfs:[]}))});
  fs.writeFileSync(path.join(c,'QA-REPORT.md'),'# QA report\n\nChecks in progress. Technical generation does not constitute human review or approval.\n');
  writeJson(path.join(c,'qa-results.json'),{technical_pass:false,status:'CHECKS_IN_PROGRESS',execution_approved:false});
  reconcile(out);
  let result;try{result=checkTechnical(out);}catch(e){result={technical_pass:false,defects:[e.message],release_gates:[]};}
  writeJson(path.join(c,'qa-results.json'),result);fs.writeFileSync(path.join(c,'QA-REPORT.md'),`# QA report\n\nTechnical pass: ${result.technical_pass}.\n\nDefects: ${JSON.stringify(result.defects)}\n\nRelease gates: ${JSON.stringify(result.release_gates)}\n\nAutomated checks are not visual or legal approval. Inspect inspection.json and every page preview. Actual email clients and physical fabrication: NOT RUN.\n`);
  if(!result.technical_pass&&models.length)throw new SuiteError('Technical QA failed; review 08_Controls/qa-results.json',4);
  return {output:out,slots:models.length,baseline_artifacts:models.length*3,technical_pass:result.technical_pass,execution_approved:false,blockers};
}
