import fs from 'node:fs';
import path from 'node:path';
import {json,writeJson,fileHash} from '../skills/brand-suite/lib/safety.mjs';
import {reconcile,checkTechnical} from '../skills/brand-suite/lib/package.mjs';
import {py,run,python} from '../skills/brand-suite/lib/render.mjs';
const report=json('.work/integration-results.json'),destination=path.resolve('.work/public-release');
fs.mkdirSync(destination,{recursive:true});fs.mkdirSync('examples/fictional-company',{recursive:true});fs.mkdirSync('docs/results',{recursive:true});
const summaries=[];
for(const suite of report.suites) {
  const out=path.join(destination,suite.fixture+'-suite');if(fs.existsSync(out))throw Error('Public example destination exists; use a fresh version');fs.cpSync(suite.output,out,{recursive:true});
  const info=json(path.join(out,'08_Controls/build-info.json'));info.skill_root='<isolated installed skill>';info.dependencies.python.font='<locally installed permitted font>';writeJson(path.join(out,'08_Controls/build-info.json'),info);
  const inspection=json(path.join(out,'08_Controls/inspection.json'));
  if(inspection.documents.some(d=>d.pdfs.some(p=>p.pages.some(page=>page.visual_review==='PENDING'))))throw Error('Actual visual review record required before publishing examples');
  reconcile(out);const qa=checkTechnical(out);if(!qa.technical_pass)throw Error(JSON.stringify(qa.defects));writeJson(path.join(out,'08_Controls/qa-results.json'),qa);
  const archive=path.join(destination,'brand-suite-'+suite.fixture+'-synthetic-v0.1.0.zip');const packaged=JSON.parse(py('zip',['--out',out,'--destination',archive]));
  const reopened=path.join(destination,suite.fixture+'-reopened');run(python(),['-m','zipfile','-e',archive,reopened]);const reopenedQA=checkTechnical(reopened);if(!reopenedQA.technical_pass)throw Error(JSON.stringify(reopenedQA.defects));
  summaries.push({fixture:suite.fixture,baseline:suite.baseline,word_pages:suite.word_pages,html_pages:inspection.documents.reduce((n,d)=>n+d.pdfs[1].pages.length,0),technical_pass:true,zip_reopened:true,execution_approved:false,archive:path.basename(archive),archive_sha256:packaged.sha256});
  if(suite.fixture==='full') {
    for(const [src,dest] of [['previews/G01-p04.png','preview.png'],['previews/contact-sheet.png','contact-sheet.png'],['01_Guides/G01.pdf','catalogue.pdf'],['01_Guides/G01.docx','catalogue.docx'],['01_Guides/G01.html','catalogue.html']])fs.copyFileSync(path.join(out,src),path.join('examples/fictional-company',dest));
  }
}
writeJson('docs/results/production.json',{...report,installation_agents:report.installation_agents.map(x=>({agent:x.agent,installed:x.installed,path:x.path,cli:'skills 1.7.0',project_scope:true,method:'copy'})),suites:summaries});
fs.writeFileSync('examples/fictional-company/README.md','# Fictional company demonstration\n\nAster Works Ltd is synthetic. The catalogue is generated from the public fixture and original geometric SVG, with native editable Word and real Word-derived PDF. The contact sheet is an overview; the recorded page review used full-size previews. Full and messy 36-slot draft suites are release assets, including controls, an offline index, sending email files and stamps. No signature, legal approval, incorporation verification, physical proof or live email test is claimed. Fonts are local dependencies and are not bundled.\n');
writeJson('docs/results/example-assets.json',summaries);console.log(JSON.stringify(summaries,null,2));
