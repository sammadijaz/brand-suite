import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import Ajv from 'ajv';
import {json, resolve, SuiteError, decimal, amount} from './safety.mjs';
import {clauses, headings, schedules} from '../templates/documents/clauses.mjs';
export const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const catalogue = json(path.join(skillRoot,'templates/catalogue.json'));
const ajv = new Ajv({allErrors:true, strict:false});
const validators = new Map();
export function validate(name, value) {
  if (!validators.has(name)) validators.set(name,ajv.compile(json(path.join(skillRoot,'schemas',name+'.schema.json'))));
  const v=validators.get(name);
  if (!v(value)) throw new SuiteError(`Invalid ${name}: ${v.errors.map(x=>x.instancePath+' '+x.message).join('; ')}`);
  return value;
}
export function validateInput(input) {
  if(input.language!=='en')throw new SuiteError('Unsupported language: English production validated; non-Latin/RTL production needs separate glyph and layout validation',3);
  validate('input',input); validate('catalogue',catalogue);
  const sources = new Set(input.sources.map(x=>x.id));
  if (sources.size!==input.sources.length) throw new SuiteError('Duplicate source identifiers');
  for (const [key, f] of Object.entries(input.fields)) {
    if (/^(company|employee|signatory|counterparty)\./.test(key)&&f.scope!==input.entity_id)throw new SuiteError('Evidence belongs to a different entity: '+key);
    if(typeof f.value==='string'&&/[\u0590-\u08ff]/.test(f.value))throw new SuiteError('RTL names/content unsupported in validated production; retain evidence and use a reviewed localized renderer',3);
    if(typeof f.value==='string'&&/[^\u0000-\u024f\u2000-\u206f\u20a0-\u20cf]/.test(f.value))throw new SuiteError('Non-Latin glyph coverage is outside validated production; use a reviewed localized renderer',3);
    if(f.status==='UNKNOWN' && f.value!==null) throw new SuiteError(`${key}: UNKNOWN requires null`);
    if(!['UNKNOWN','PROPOSED'].includes(f.status) && (!sources.has(f.source_id)||!f.locator||(!f.sha256&&!f.observed_at))) throw new SuiteError(`${key}: missing evidence source/locator/date`);
    if(f.status==='VERIFIED_PRIMARY' && !input.sources.some(s=>s.id===f.source_id&&['official','synthetic'].includes(s.kind))) throw new SuiteError(`${key}: primary status requires official or explicitly synthetic evidence`);
    if(!input.fictional && input.sources.some(s=>s.id===f.source_id&&s.kind==='synthetic')) throw new SuiteError('Synthetic evidence cannot verify a real entity');
  }
  if(input.fields['company.entity_id']?.value!==input.entity_id) throw new SuiteError('Selected entity does not match company.entity_id');
  for(const value of Object.values(input.terms))if(typeof value==='string'&&/[^\u0000-\u024f\u2000-\u206f\u20a0-\u20cf]/.test(value))throw new SuiteError('Non-Latin drafting content requires a reviewed localized renderer',3);
  if(input.language!=='en') throw new SuiteError('Unsupported language: English production validated; other scripts require an explicit renderer/glyph review',3);
  const precisions={JPY:0,KWD:3,USD:2,GBP:2,EUR:2,PKR:2};
  if(input.finance.precision!==precisions[input.finance.currency]) throw new SuiteError('Currency precision mismatch');
  for(const id of Object.keys(input.applicability)) if(!catalogue.documents.some(d=>d.id===id)) throw new SuiteError('Unknown applicability slot '+id);
  return input;
}
export function finance(input) {
  const p=input.finance.precision, items=input.finance.items.map(x=>({...x,total:amount(decimal(x.unit_price,p)*BigInt(x.quantity),p)}));
  const subtotal=items.reduce((s,x)=>s+decimal(x.total,p),0n), tax=input.finance.tax===null?null:decimal(input.finance.tax,p), total=tax===null?null:subtotal+tax, paid=decimal(input.finance.paid,p);
  if(total!==null&&paid>total) throw new SuiteError('Payment exceeds total; represent credit/refund explicitly');
  return {currency:input.finance.currency,items,subtotal:amount(subtotal,p),tax:tax===null?null:amount(tax,p),total:total===null?null:amount(total,p),paid:amount(paid,p),balance:total===null?null:amount(total-paid,p),payment_status:input.finance.payment_status};
}
export function modelTexts(model) {
  return [model.header,...(model.blank?[]:[model.title]),...model.blocks.flatMap(b=>b.rows?b.rows.flat():b.items?b.items:b.text?[b.text]:b.alt?[b.alt]:[]),model.footer];
}
export function assemble(input) {
  validateInput(input);
  const f={...input.fields};
  for(const [k,v] of Object.entries(input.terms)) f[k]={value:v,status:v===null?'UNKNOWN':'PROPOSED'};
  f['finance.currency']={value:input.finance.currency,status:'PROPOSED'};
  const n=finance(input), models=[];
  const slots=input.mode==='stationery-only'?catalogue.documents.filter(d=>d.id.startsWith('S')):catalogue.documents;
  if(input.mode==='audit-only') return {models:[],finance:n};
  for(const slot of slots) {
    let blocks=[], i=0;
    const block=(type,data,category='proposed-term')=>({id:`${slot.id}-${++i}`,type,category,...data});
    const a=input.applicability[slot.id]||{applicable:true,reason:'Context not yet reviewed',title:null};
    if(!a.applicable) blocks=[block('note',{text:`Applicability assessment: ${a.reason}. This slot is a replacement note, not an executed instrument.`},'review')];
    else if(['S01','S02','S03'].includes(slot.id)) blocks=[];
    else {
      const bodies=clauses[slot.id]; if(!bodies) throw new SuiteError('No substantive template for '+slot.id);
      const hs=headings[slot.id]||slot.sections;
      if(hs.length!==bodies.length) throw new SuiteError('Template coverage mismatch '+slot.id);
      bodies.forEach((text,k)=>blocks.push(block('heading',{level:2,text:hs[k]},'instruction'),block('paragraph',{text},slot.id.startsWith('G')||slot.id.startsWith('S')?'instruction':'proposed-term')));
      if(schedules[slot.id]) {const [title,...keys]=schedules[slot.id]; blocks.push(block('heading',{level:2,text:title},'instruction'),block('table',{rows:[['Field','Selected value'],...keys.map(k=>[k,`{{${k}}}`])]},'fact'));}
      if(slot.id==='G01') {
        for(const [label,file,w,h] of [['Logo family and clear-space specimen','logo-tests.png',155,65],['Palette and type specimen','brand-specimen.png',155,70],['Page anatomy','page-anatomy.png',110,155]]) blocks.push(block('page-break',{},'design'),block('heading',{level:2,text:label},'design'),block('image',{src:'07_Assets/Derivatives/'+file,alt:label,width_mm:w,height_mm:h},'design'));
      }
      if(slot.id==='S07') for(const [label,file,w,h] of [[input.fields['company.legal_name']?.value?'Ordinary company stamp':'Project identifier stamp (unexecuted draft)','company-stamp.png',40,40],[input.fields['company.legal_name']?.value?'Ordinary authorized-signatory stamp':'Signatory stamp (unexecuted draft)','signatory-stamp.png',62,25]]) blocks.push(block('image',{src:'07_Assets/Stamps/'+file,alt:label,width_mm:w,height_mm:h},'design'));
      if(slot.id==='G02') blocks.push(block('table',{rows:[['Source','Kind','Scope'],...input.sources.map(s=>[s.id,s.kind,s.scope])]},'fact'));
      if(slot.id[0]==='F') blocks.push(block('table',{rows:[['Item','Quantity','Unit price','Line total'],...n.items.map(x=>[x.description,String(x.quantity),x.unit_price,x.total]),['Subtotal','','',n.subtotal],['Tax','','',n.tax??'REQUIRED: tax treatment'],['Total '+n.currency,'','',n.total??'REQUIRED: tax'],['Observed paid','','',n.paid],['Balance','','',n.balance??'REQUIRED: total']]},'fact'),block('note',{text:`Payment evidence status: ${n.payment_status}. Receipt is distinct from settlement.`},'review'));
      if(['P01','P02','P04','P05','A01','A02','A03','A04','A05','A06','A07','A08','C01','C02','C04','C07'].includes(slot.id)) {
        const other=['P01','P02'].includes(slot.id)?'Employee/candidate: {{employee.full_name}}.':slot.id.startsWith('C')?'Internal adoption/acceptance requires the actual governance or mandate participants and verified procedure.':'Other party: {{counterparty.legal_name}}, {{counterparty.capacity}}.';
        blocks.push(block('signature',{text:'Unexecuted: {{company.legal_name}} — {{signatory.full_name}}, {{signatory.capacity}}; authority {{signatory.authority_reference}}. '+other+' Actual signatures/dates are not inserted.'},'fact'));
      }
    }
    if(input.model_overrides[slot.id]) blocks.push(...input.model_overrides[slot.id]);
    const unresolved=[], used=new Set();
    function r(text) { for(const m of text.matchAll(/\{\{([a-z][a-z0-9_.]+)\}\}/g)) used.add(m[1]); const x=resolve(text,f); unresolved.push(...x.unresolved); return x.text; }
    blocks=blocks.map(b=>({...b,...(b.text?{text:r(b.text)}:{}),...(b.rows?{rows:b.rows.map(row=>row.map(r))}:{}),...(b.items?{items:b.items.map(r)}:{})}));
    const header=r('{{company.trading_name}}'), footer=r('{{company.legal_name}} | {{company.mailing_address}} | {{company.email}}');
    const title=a.title||(['C01','C07'].includes(slot.id)?(slot.id==='C01'?'Governance Resolution and Limited Signing Authority':'Owner or Member Decision Record'):slot.title.replace('A4',input.paper));
    const requirements=slot.risk_gates;
    const model={schema_version:'1.0',id:slot.id,title:a.applicable?title:`${slot.id} — Applicability Note`,folder:slot.folder,paper:input.paper,applicability:{applicable:a.applicable,reason:a.reason},release_state:unresolved.length?'BLOCKED_MISSING_FACTS':'READY_FOR_REVIEW',entity_id:input.entity_id,header,footer,blank:['S01','S02','S03'].includes(slot.id)&&a.applicable,blocks,fields_used:[...used].sort(),unresolved:[...new Set(unresolved)].sort(),review_requirements:requirements,template_version:'0.1.0'};
    const ids=model.blocks.map(b=>b.id); if(new Set(ids).size!==ids.length) throw new SuiteError('Duplicate block IDs '+slot.id);
    validate('document-model',model); models.push(model);
  }
  return {models,finance:n};
}
