import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {chromium} from 'playwright';
import {skillRoot} from './models.mjs';
import {escape, json, writeJson, safeSvg, inside, SuiteError, fileHash} from './safety.mjs';

export function run(command,args,timeout=120000) {
  const r=spawnSync(command,args,{encoding:'utf8',windowsHide:true,timeout,maxBuffer:8_000_000,shell:false});
  if(r.error || r.status!==0) throw new SuiteError(`Tool failed (${path.basename(command)}): ${r.error?.message||r.stderr?.slice(0,1000)||'exit '+r.status}`,r.error?.code==='ENOENT'?3:4);
  return r.stdout;
}
export const python = () => process.env.BRAND_SUITE_PYTHON || (process.platform==='win32'?'python':'python3');
export function py(command,args=[]) {return run(python(),[path.join(skillRoot,'scripts/production.py'),command,...args],300000);}
export async function browser() {
  const options={headless:true,chromiumSandbox:true};
  if(process.env.BRAND_SUITE_BROWSER) options.executablePath=process.env.BRAND_SUITE_BROWSER;
  else if(process.platform==='win32') options.channel='chrome';
  const b=await chromium.launch(options).catch(()=>{throw new SuiteError('Browser missing or sandbox launch failed; set BRAND_SUITE_BROWSER or explicitly install Playwright Chromium in work area',3);});
  return b;
}
export async function guardedPage(b, options={}) {
  const ctx=await b.newContext({...options,serviceWorkers:'block',javaScriptEnabled:false});
  await ctx.route('**/*',route=>route.abort());
  return {ctx,page:await ctx.newPage()};
}
const imageData=p=>'data:image/png;base64,'+fs.readFileSync(p).toString('base64');
export function html(model,out,brand) {
  let css=fs.readFileSync(path.join(skillRoot,'templates/layouts/print.css'),'utf8');
  css=css.replace('size: A4',`size: ${model.paper}`).replaceAll('#172b35',model.id==='S02'?'#000000':brand.ink);
  const logo=path.join(out,'07_Assets/Derivatives/logo-primary.png');
  const head=(fs.existsSync(logo)&&!['S02','S03'].includes(model.id)?`<img src="${imageData(logo)}" alt="Brand mark">`:'')+`<strong>${escape(model.header)}</strong>`;
  const body=model.blocks.map(b=>{
    switch(b.type) {
      case 'heading':return `<h2 id="${escape(b.id)}">${escape(b.text)}</h2>`;
      case 'paragraph':return `<p id="${escape(b.id)}">${escape(b.text)}</p>`;
      case 'note':case 'signature':return `<p id="${escape(b.id)}" class="${b.type}">${escape(b.text)}</p>`;
      case 'list':return `<ul id="${escape(b.id)}">${b.items.map(s=>`<li>${escape(s)}</li>`).join('')}</ul>`;
      case 'table':return `<table id="${escape(b.id)}"><thead><tr>${b.rows[0].map(x=>`<th scope="col">${escape(x)}</th>`).join('')}</tr></thead><tbody>${b.rows.slice(1).map(row=>`<tr>${row.map(x=>`<td>${escape(x)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
      case 'image':{const p=inside(out,b.src); if(!p.endsWith('.png')) throw new SuiteError('Only generated local PNG images allowed',5); return `<figure id="${escape(b.id)}"><img src="${imageData(p)}" alt="${escape(b.alt)}" style="width:${b.width_mm}mm;height:${b.height_mm}mm"><figcaption>${escape(b.alt)}</figcaption></figure>`;}
      case 'page-break':return '<div class="page-break"></div>';
      default:throw new SuiteError('Unknown semantic block type');
    }
  }).join('\n');
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(model.title)}</title><style>${css}</style><body><header>${head}</header><main class="${model.blank?'blank':''}">${model.blank?'':`<h1>${escape(model.title)}</h1><p>${escape(model.release_state)} — unexecuted review copy</p>`}${body}</main><footer>${escape(model.footer)} | ${model.id}</footer></body></html>`;
}
export async function makeAssets(out,input) {
  const original=path.join(out,'07_Assets/Originals'), derivative=path.join(out,'07_Assets/Derivatives'), stamps=path.join(out,'07_Assets/Stamps');
  for(const p of [original,derivative,stamps]) fs.mkdirSync(p,{recursive:true});
  const provenance=[];
  let svg;
  if(input.brand.logo) {
    if(fs.lstatSync(input.brand.logo).isSymbolicLink()||fs.statSync(input.brand.logo).size>2_000_000) throw new SuiteError('Logo link/size denied',5);
    if(path.extname(input.brand.logo).toLowerCase()==='.png') {
      const assessment=JSON.parse(py('raster-check',['--spec',path.resolve(input.brand.logo)]));
      fs.copyFileSync(input.brand.logo,path.join(original,'logo-source.png'));
      writeJson(path.join(out,'08_Controls/raster-assessment.json'),{...assessment,sha256:fileHash(input.brand.logo),status:'ORIGINAL RETAINED; conversion/quality review required; no vector or transparency invented'});
      throw new SuiteError('Raster logo production requires an approved passive SVG conversion. Original PNG retained; '+(assessment.low_resolution?'low resolution; ':'')+(assessment.opaque_corners?'opaque corners; ':'')+'review quality and rights before conversion',3);
    }
    if(path.extname(input.brand.logo).toLowerCase()!=='.svg')throw new SuiteError('Unsupported logo format; supply an approved passive SVG or PNG for assessment',3);
    svg=safeSvg(fs.readFileSync(input.brand.logo,'utf8'));
    fs.writeFileSync(path.join(original,'logo-source.svg'),svg);
    provenance.push({file:'07_Assets/Originals/logo-source.svg',sha256:fileHash(path.join(original,'logo-source.svg')),rights:input.brand.logo_rights,status:'owner-supplied source; approval must be confirmed'});
  } else {
    svg=`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="70" viewBox="0 0 300 70"><title>Provisional typographic treatment</title><text x="0" y="50" font-family="Arial" font-size="32" fill="${input.brand.ink}">${escape(input.fields['company.trading_name']?.value||'Project')}</text></svg>`;
    provenance.push({status:'PROVISIONAL typographic treatment; not an approved vector master'});
  }
  const variants={primary:svg,black:svg.replace(/(fill|stroke)="#[a-f0-9]{6}"/gi,'$1="#000000"'),reversed:svg.replace(/(fill|stroke)="#[a-f0-9]{6}"/gi,'$1="#ffffff"'),grayscale:svg.replace(/(fill|stroke)="#[a-f0-9]{6}"/gi,'$1="#444444"')};
  const b=await browser();
  try {
    const {ctx,page}=await guardedPage(b,{deviceScaleFactor:4});
    for(const [name,s] of Object.entries(variants)) {
      safeSvg(s); fs.writeFileSync(path.join(derivative,`logo-${name}.svg`),s);
      await page.setContent(`<style>body{margin:0}svg{width:300px;height:90px}</style>${s}`);
      await page.locator('svg').screenshot({path:path.join(derivative,`logo-${name}.png`),omitBackground:true});
      provenance.push({file:`07_Assets/Derivatives/logo-${name}.svg`,sha256:fileHash(path.join(derivative,`logo-${name}.svg`)),derivation:name==='primary'?'unchanged geometry; rendered to PNG':`${name} recolour only; geometry preserved`,source:input.brand.logo?'Originals/logo-source.svg':'provisional'});
    }
    const spec={company:String(input.fields['company.legal_name']?.value||input.fields['company.trading_name']?.value||'Project'),company_caption:input.fields['company.legal_name']?.value?'ORDINARY COMPANY':'PROJECT IDENTIFIER',signatory:'AUTHORIZED SIGNATORY',signatory_caption:input.fields['company.legal_name']?.value?'AUTHORIZED SIGNATORY':'UNEXECUTED DRAFT',circle:input.brand.stamp_company_mm,rectangle:input.brand.stamp_signatory_mm,brand:input.brand};
    const temp=path.join(out,'08_Controls/asset-job.json');writeJson(temp,spec);
    py('assets',['--out',stamps,'--spec',temp]);
    for(const name of ['company-stamp','signatory-stamp']) {
      const s=safeSvg(fs.readFileSync(path.join(stamps,name+'.svg'),'utf8'));
      const dimensions=name==='company-stamp'?[spec.circle,spec.circle]:spec.rectangle;
      await page.setContent(`<style>@page{size:${dimensions[0]}mm ${dimensions[1]}mm;margin:0}body{margin:0}svg{display:block}</style>${s}`);
      await page.pdf({path:path.join(stamps,name+'.pdf'),width:dimensions[0]+'mm',height:dimensions[1]+'mm',margin:{top:0,right:0,bottom:0,left:0},printBackground:true,preferCSSPageSize:true});
      await page.locator('svg').screenshot({path:path.join(stamps,name+'.png'),omitBackground:true,scale:'css'});
      // Re-render at 600dpi rather than upsampling a small raster.
      const high=await guardedPage(b,{deviceScaleFactor:600/96});
      await high.page.setContent(`<style>body{margin:0}svg{display:block}</style>${s}`);
      await high.page.locator('svg').screenshot({path:path.join(stamps,name+'.png'),omitBackground:true}); await high.ctx.close();
    }
    const specimens=[
      ['logo-tests',`<h2>Preserved mark · proposed use tests</h2><div style="display:flex;gap:20px">${['primary','black','grayscale','reversed'].map(v=>`<div style="background:${v==='reversed'?'#172b35':'white'};padding:12px"><img alt="${v}" src="${imageData(path.join(derivative,`logo-${v}.png`))}" width="150"><p style="color:${v==='reversed'?'white':'black'}">${v}</p></div>`).join('')}</div><p>Clear space: ${escape(input.terms['brand.clear_space']||'REVIEW REQUIRED')}</p><div style="border:1px dashed;padding:15px;width:270px"><img src="${imageData(path.join(derivative,'logo-primary.png'))}" width="230"></div><p>Size ladder · review legibility at intended size</p>${[16,24,32,64].map(w=>`<img src="${imageData(path.join(derivative,'logo-primary.png'))}" width="${w}" style="margin:20px">${w}px`).join('')}<p>Incorrect: distortion or unapproved recolouring changes recognition.</p>`],
      ['brand-specimen',`<h1>${escape(input.fields['company.trading_name']?.value||'Project')}</h1><p>Available document font: ${escape(input.brand.font)} · 11pt body / 9pt footer</p><div style="display:flex">${['primary','ink','accent'].map(k=>`<div style="padding:20px"><div style="width:160px;height:90px;background:${input.brand[k]}"></div><p>${k} ${input.brand[k]}</p></div>`).join('')}</div><h2>Clear hierarchy, quiet confidence</h2><p>We recorded your request. Here is the next step and the evidence we need.</p><p>RGB screen values; print conversion and supplier proof remain proposed.</p>`],
      ['page-anatomy','<div style="border:1px solid;width:470px;height:670px;padding:45px"><div style="border-bottom:1px solid;padding-bottom:30px">Header · modest identifier</div><h2>Subject and reference</h2><p>22mm margins</p><div style="height:400px;border-left:1px dashed;padding:20px">Body · 11pt<br>Tables repeat headings<br>Signatures stay together<br>Content reflows without hidden overflow</div><div style="border-top:1px solid">Footer · legal party, contacts, page field</div></div>']
    ];
    for(const [name,content] of specimens) {
      await page.setViewportSize({width:1000,height:900}); await page.setContent(`<body style="margin:20px;font-family:Arial;color:${input.brand.ink}">${content}</body>`);
      await page.locator('body').screenshot({path:path.join(derivative,name+'.png')});
    }
    await ctx.close();
  } finally {await b.close();}
  writeJson(path.join(out,'08_Controls/asset-provenance.json'),{assets:provenance,notes:'No bundled fonts. Supplier and trademark clearance not performed. Stamp lettering outlined from a locally installed font.'});
  fs.copyFileSync(path.join(derivative,'logo-primary.png'),path.join(out,'02_Stationery/logo-cid.png'));
}
export async function render(out,models,brand) {
  const spec=path.join(out,'08_Controls/render-job.json');writeJson(spec,{models,brand});
  py('docx',['--out',out,'--spec',spec]);
  const docs=models.map(m=>({id:m.id,docx:path.join(out,m.folder,m.id+'.docx'),pdf:path.join(out,m.folder,m.id+'.pdf')}));
  if(process.platform==='win32'&&!process.env.BRAND_SUITE_SOFFICE) {
    const job=path.join(out,'08_Controls/word-job.json');writeJson(job,{documents:docs,result:path.join(out,'08_Controls/word-results.json')});
    run('powershell.exe',['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',path.join(skillRoot,'scripts/export-word.ps1'),'-Job',job],300000);
  } else {
    const soffice=process.env.BRAND_SUITE_SOFFICE||'soffice';
    for(const d of docs) run(soffice,['--headless','--convert-to','pdf','--outdir',path.dirname(d.pdf),d.docx],120000);
    writeJson(path.join(out,'08_Controls/word-results.json'),docs.map(d=>({id:d.id,renderer:'LibreOffice',version:run(soffice,['--version']).trim()})));
  }
  const b=await browser(), checks=[];
  try {
    const {ctx,page}=await guardedPage(b);
    for(const m of models) {
      const content=html(m,out,brand); fs.writeFileSync(path.join(out,m.folder,m.id+'.html'),content);
      await page.setContent(content);
      const overflow=await page.locator('body').evaluate(el=>({scroll:el.scrollWidth,width:el.clientWidth,images:[...el.querySelectorAll('img')].map(i=>({ok:i.complete&&i.naturalWidth>0,alt:i.alt}))}));
      if(overflow.scroll>overflow.width+2||overflow.images.some(x=>!x.ok||!x.alt)) throw new SuiteError('HTML overflow or missing image/alt '+m.id,4);
      const printInk=m.id==='S02'?'#000000':brand.ink;
      const headerTemplate=`<div style="font-family:Arial;font-size:11pt;color:${printInk};width:100%;margin:0 22mm;padding-top:6mm;border-bottom:0.5pt solid ${printInk}">${escape(m.header)}</div>`;
      const footerTemplate=`<div style="font-family:Arial;font-size:9pt;color:${printInk};width:100%;margin:0 22mm;border-top:0.5pt solid #aaa;padding-top:2mm">${escape(m.footer)} | ${escape(m.id)} | <span class="pageNumber"></span></div>`;
      await page.pdf({path:path.join(out,'previews',m.id+'.html-print.pdf'),preferCSSPageSize:true,printBackground:true,displayHeaderFooter:true,headerTemplate,footerTemplate,margin:{top:'37mm',bottom:'29mm',left:'22mm',right:'22mm'}});
      checks.push({id:m.id,engine:b.version(),overflow,printed:true});
    }
    await ctx.close();
  } finally {await b.close();}
  writeJson(path.join(out,'08_Controls/html-checks.json'),checks);
  py('inspect',['--out',out,'--spec',spec]);
}
