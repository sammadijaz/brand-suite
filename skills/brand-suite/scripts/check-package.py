"""Read-only portable package verifier; requires pypdf and defusedxml.

Reports technical defects separately from unresolved release gates. Does not
authenticate a human reviewer; the Node entrypoint verifies a detached signature.
"""
import argparse
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
import unicodedata
import zipfile
from defusedxml import ElementTree as ET
from pypdf import PdfReader


class HTML(HTMLParser):
    def __init__(self):
        super().__init__(); self.text=[]; self.links=[]; self.defects=[];self.footer=[];self.in_footer=False
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if tag=='footer': self.in_footer=True
        if tag in ['script','iframe','object','embed','form'] or any(k.lower().startswith('on') for k in attrs): self.defects.append('Active HTML')
        if tag=='a': self.links.append(attrs.get('href',''))
        if tag=='img' and not attrs.get('alt'): self.defects.append('Missing image alt text')
        for k,v in attrs.items():
            if v and (re.search(r'javascript:|file:|token=|password=',v,re.I)): self.defects.append('Unsafe HTML attribute')
        if any(x in attrs.get('style','').replace(' ','').lower() for x in ['display:none','visibility:hidden','font-size:0']): self.defects.append('Hidden HTML text')
        self.text.extend(v for v in attrs.values() if v)
    def handle_endtag(self,tag):
        if tag=='footer': self.in_footer=False
    def handle_data(self,data):
        self.text.append(data)
        if self.in_footer:self.footer.append(data)


def safe_path(root,relative):
    p=root/relative
    if p.is_symlink() or not p.resolve().is_relative_to(root): raise ValueError('Path escape/link')
    for parent in p.parents:
        if parent==root: break
        if parent.is_symlink(): raise ValueError('Symlink ancestor')
    return p


def check(root):
    root=Path(root).resolve(); controls=root/'08_Controls'
    manifest=json.loads((controls/'manifest.json').read_text(encoding='utf-8'))
    defects=[]; gates=[]; declared=set(); texts=[];footers={}
    expected=36 if manifest['mode'] in ['full-suite','update-existing'] else 7 if manifest['mode']=='stationery-only' else 0
    if len(manifest['documents'])!=expected: defects.append('Manifest slot count mismatch')
    ids=[d['id'] for d in manifest['documents']]
    if len(set(ids))!=len(ids): defects.append('Duplicate document slots')
    if expected==36 and set(ids)!=set(['G00','G01','G02']+[f'S{i:02}' for i in range(1,8)]+[f'P{i:02}' for i in range(1,8)]+[f'A{i:02}' for i in range(1,9)]+[f'C{i:02}' for i in range(1,9)]+[f'F{i:02}' for i in range(1,4)]): defects.append('Required slot IDs missing')
    for d in manifest['documents']:
        if set(d['formats'])!={'html','pdf','docx'}: defects.append('Three-format declaration missing '+d['id'])
        if d['release_state']!='APPROVED_BY_AUTHORIZED_REVIEWER': gates.append(d['id']+' unapproved')
        if d['unresolved']: gates.append(d['id']+' unresolved facts/terms')
    for a in manifest['artifacts']:
        try:
            p=safe_path(root,a['path']); declared.add(a['path'])
            data=p.read_bytes()
            if hashlib.sha256(data).hexdigest()!=a['sha256'] or len(data)!=a['bytes']: defects.append('Stale hash/size '+a['path'])
            if len(data)>30_000_000: defects.append('Artifact over size budget'); continue
            suffix=p.suffix.lower(); text=''
            if suffix=='.html':
                parser=HTML(); parser.feed(data.decode('utf-8')); text='\n'.join(parser.text); footers[a['path']]=''.join(parser.footer);defects.extend(x+' '+a['path'] for x in parser.defects)
                for link in parser.links:
                    if link.startswith(('https:','mailto:','tel:','#')): continue
                    if not link or not safe_path(root,str((p.parent/link).relative_to(root))).is_file(): defects.append('Broken local link '+a['path'])
            elif suffix=='.docx':
                with zipfile.ZipFile(p) as z:
                    infos=z.infolist()
                    if len(infos)>500 or sum(i.file_size for i in infos)>30_000_000: raise ValueError('Office archive size/count denied')
                    for info in infos:
                        if '..' in Path(info.filename).parts or info.filename.startswith('/') or info.file_size>10_000_000: raise ValueError('Office archive path denied')
                        if re.search(r'vbaProject|embeddings|activeX|comments|customXml',info.filename,re.I): defects.append('Active/private Office part '+a['path'])
                        if info.filename.endswith(('.xml','.rels')):
                            raw=z.read(info.filename); node=ET.fromstring(raw)
                            ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
                            for para in node.findall('.//w:p',ns): text+=''.join(t.text or '' for t in para.findall('.//w:t',ns))+'\n'
                            if re.match(r'word/footer\d+\.xml',info.filename):footers[a['path']]=''.join(t.text or '' for t in node.findall('.//w:t',ns))
                            if node.findall('.//w:vanish',ns) or node.findall('.//w:ins',ns) or node.findall('.//w:del',ns): defects.append('Hidden/revision Word content '+a['path'])
                            if b'TargetMode="External"' in raw: defects.append('External Word relationship '+a['path'])
            elif suffix=='.pdf':
                pdf=PdfReader(p)
                if pdf.is_encrypted: defects.append('Encrypted PDF '+a['path'])
                if pdf.attachments: defects.append('Embedded PDF file '+a['path'])
                if '/JavaScript' in str(pdf.trailer): defects.append('Active PDF')
                text='\f'.join(page.extract_text() or '' for page in pdf.pages)
                if a.get('pages') and len(pdf.pages)!=a['pages']: defects.append('PDF page count mismatch '+a['path'])
            elif suffix=='.svg':
                text=data.decode('utf-8'); ET.fromstring(text)
                if re.search(r'<!DOCTYPE|<!ENTITY|<\s*(script|foreignObject|image|use|style|filter|animate)\b|\bon\w+\s*=|(?:href|src)\s*=|url\s*\(',text,re.I): defects.append('Unsafe SVG '+a['path'])
                if '/Stamps/' in a['path'] and '<text' in text: defects.append('Live lettering in fabrication SVG')
            elif suffix in ['.json','.md','.txt']: text=data.decode('utf-8')
            if re.search(r'\{\{[^}]+\}\}|\[REQUIRED:|REQUIRED: tax|UNRESOLVED_ALTERNATIVE',text): gates.append('Unresolved field/alternative '+a['path'])
            if re.search(r'PRIVATE_CANARY|BEGIN (?:RSA |OPENSSH )?PRIVATE KEY|gh[pousr]_[A-Za-z0-9]{30,}|AKIA[A-Z0-9]{16}',text): defects.append('Secret/private canary '+a['path'])
            if '\ufffd' in text: defects.append('Broken glyph '+a['path'])
            texts.append((a['path'],text))
        except Exception as exc: defects.append(a['path']+': '+type(exc).__name__)
    for d in manifest['documents']:
        for ext in ['html','pdf','docx']:
            if f"{d['folder']}/{d['id']}.{ext}" not in declared: defects.append('Missing baseline artifact '+d['id']+'.'+ext)
        model=json.loads((controls/'document-models'/(d['id']+'.json')).read_text(encoding='utf-8'))
        if model['entity_id']!=manifest['entity_id']: defects.append('Mixed entity '+d['id'])
        if model['review_requirements']!=d['review_requirements']: defects.append('Review gate changed '+d['id'])
        if model['unresolved']!=d['unresolved']: defects.append('Unresolved registry differs '+d['id'])
        if len(set(b['id'] for b in model['blocks']))!=len(model['blocks']): defects.append('Duplicate block ID')
        if any(b.get('reference') and not (root/b['reference']).is_file() for b in model['blocks']): defects.append('Missing referenced schedule '+d['id'])
        company=json.loads((controls/'company-profile.json').read_text(encoding='utf-8'))
        if model['footer'].split(' | ')[0]!=str(company['fields'].get('company.legal_name',{}).get('value')) and '[REQUIRED:' not in model['footer']: defects.append('Wrong entity in footer '+d['id'])
        if sum(b.get('text','').count('SELECTED_ALTERNATIVE:') for b in model['blocks'])>1: defects.append('Both alternatives selected '+d['id'])
        expected=[] if model['blank'] else [model['title']]
        for b in model['blocks']:
            expected.extend(b.get('items',[]) or ([x for row in b['rows'] for x in row] if 'rows' in b else [b['text']] if 'text' in b else [b['alt']] if 'alt' in b else []))
        normalize=lambda s: re.sub(r'\s+','',unicodedata.normalize('NFKC',s)).replace('\u00ad','').replace('—','-').replace('–','-')
        required_schedules={'P02':'Employment terms','P03':'Supplied policy and asset record','P04':'Services schedule','P05':'Background IP schedule','P07':'Handover checklist','A01':'Confidentiality schedule','A02':'Disclosure schedule','A03':'Commercial schedule','A04':'Acceptance schedule','A07':'Processing schedule','C08':'Release and stamp register'}
        if model['applicability']['applicable'] and d['id'] in required_schedules:
            if not any(b['type']=='heading' and b.get('text')==required_schedules[d['id']] for b in model['blocks']) or not any(b['type']=='table' for b in model['blocks']):defects.append('Missing required schedule '+d['id'])
        for ext in ['html','pdf','docx']:
            found=next((text for name,text in texts if name==f"{d['folder']}/{d['id']}.{ext}"),'')
            normalized=normalize(found);cursor=0
            if ext=='pdf':
                bodies=[]
                for page_number,page_text in enumerate(found.split('\f'),1):
                    page_text=re.sub(r'^\s*'+re.escape(model['header'])+r'\s*$', '',page_text,flags=re.M)
                    page_text=normalize(page_text)
                    page_text=page_text.replace(normalize(model['footer'])+'|'+model['id']+'|'+str(page_number),'').replace(normalize(model['footer']),'')
                    bodies.append(page_text)
                normalized=''.join(bodies)
            if ext in ['html','docx'] and normalize(model['footer']) not in normalize(footers.get(f"{d['folder']}/{d['id']}.{ext}",'')):defects.append('Wrong entity or inconsistent footer '+d['id']+'.'+ext)
            for block in expected:
                position=normalized.find(normalize(block),cursor)
                if position<0: defects.append('Missing or disordered semantic content '+d['id']+'.'+ext);break
                cursor=position+len(normalize(block))
            if model['header'] not in found or model['footer'].replace('\n','') not in found.replace('\n',' '):
                # Full semantic comparison is performed by inspection; detect obvious changed parties here.
                legal=str(company['fields'].get('company.legal_name',{}).get('value') or '')
                if legal and legal not in found: defects.append('Party absent '+d['id']+'.'+ext)
    inspection=controls/'inspection.json'
    if expected and not inspection.exists(): defects.append('Missing real rendering inspection')
    if inspection.exists():
        for d in json.loads(inspection.read_text(encoding='utf-8'))['documents']:
            defects.extend(d['defects'])
            for pdf in d['pdfs']:
                suffix='.html-print.pdf' if pdf['kind'].startswith('Chromium') else '.pdf'
                folder=next(x['folder'] for x in manifest['documents'] if x['id']==d['id'])
                actual=root/'previews'/(d['id']+suffix) if suffix!='.pdf' else root/folder/(d['id']+suffix)
                if hashlib.sha256(actual.read_bytes()).hexdigest()!=pdf['sha256']: defects.append('Stale rendering inspection '+d['id'])
                if any(p['visual_review']=='PENDING' for p in pdf['pages']): gates.append('Visual review pending '+d['id'])
    for blocker in manifest.get('blockers',[]): gates.append(blocker)
    finance=json.loads((controls/'finance-reconciliation.json').read_text(encoding='utf-8'))
    from decimal import Decimal
    if finance['total'] is not None:
        if sum(Decimal(x['total']) for x in finance['items'])!=Decimal(finance['subtotal']) or Decimal(finance['subtotal'])+Decimal(finance['tax'])!=Decimal(finance['total']) or Decimal(finance['total'])-Decimal(finance['paid'])!=Decimal(finance['balance']): defects.append('Currency totals inconsistent')
    approved=controls/'approval-record.json'
    if not approved.exists() or json.loads(approved.read_text(encoding='utf-8')).get('state')!='APPROVED_BY_AUTHORIZED_REVIEWER': gates.append('Human authorized approval absent')
    # Any unmanifested file could carry hidden/private content; only verifier controls may be added.
    allowed={'08_Controls/manifest.json','08_Controls/qa-results.json','08_Controls/QA-REPORT.md','08_Controls/approval-signature.bin','08_Controls/review-attestation.json'}
    for p in root.rglob('*'):
        if p.is_file() and p.relative_to(root).as_posix() not in declared|allowed: defects.append('Unmanifested file '+p.relative_to(root).as_posix())
    return {'technical_pass':not defects,'defects':sorted(set(defects)),'release_gates':sorted(set(gates)),'execution_approved':False,'read_only':True}


if __name__=='__main__':
    parser=argparse.ArgumentParser(); parser.add_argument('root'); args=parser.parse_args()
    try:
        result=check(args.root); print(json.dumps(result)); sys.exit(0 if result['technical_pass'] else 4)
    except Exception as exc:
        print(json.dumps({'technical_pass':False,'error':str(exc)})); sys.exit(4)
