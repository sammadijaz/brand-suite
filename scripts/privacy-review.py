"""Inspect the staged public boundary and synthetic release archives locally."""
import io,json,re,subprocess,zipfile,hashlib
from pathlib import Path
from pypdf import PdfReader
root=Path(__file__).resolve().parents[1]
files=subprocess.check_output(['git','ls-files','--cached','-z'],cwd=root).decode().split('\0');files=[x for x in files if x]
assert files,'Stage the reviewed public allowlist first'
bad=[];inspected=0;pdfs=0;docx=0
def inspect(name,data):
 global inspected,pdfs,docx
 inspected+=1
 if re.search(rb'[CD]:[\\/]+(?:Users|work)[\\/]',data,re.I):bad.append(name+': local personal/work path')
 if re.search(rb'gh[pousr]_[A-Za-z0-9]{30,}|-----BEGIN (?:RSA |OPENSSH )?PRIVATE KEY-----',data):bad.append(name+': credential-shaped value')
 if name.endswith('.docx'):
  docx+=1
  with zipfile.ZipFile(io.BytesIO(data)) as z:
   for part in z.namelist():
    payload=z.read(part);inspect(name+'!'+part,payload)
    if part=='docProps/core.xml' and re.search(rb'<(?:dc:creator|cp:lastModifiedBy)>[^<]+</',payload):bad.append(name+': personal author metadata')
    if re.search('comments|people|vbaProject|embeddings',part,re.I):bad.append(name+': private or active Office part')
 elif name.endswith('.pdf'):
  pdfs+=1;pdf=PdfReader(io.BytesIO(data))
  if pdf.metadata and pdf.metadata.get('/Author'):bad.append(name+': PDF author metadata')
  inspect(name+'!metadata',str(pdf.metadata).encode())
for name in files:
 if name.startswith(('.work/','node_modules/','tests/fixtures/codebase/')) or name in ['BUILD_BRAND_SUITE_SKILL.md','REFERENCE_DOCUMENT_CATALOGUE.json']:bad.append(name+': denied private boundary')
 inspect(name,(root/name).read_bytes())
archives=[]
for archive in sorted((root/'.work/public-release').glob('*.zip')):
 with zipfile.ZipFile(archive) as z:
  for name in z.namelist():inspect(archive.name+'!'+name,z.read(name))
 archives.append({'name':archive.name,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest()})
report={'timestamp':__import__('datetime').datetime.now(__import__('datetime').timezone.utc).isoformat(),'staged_files':len(files),'inspected_members':inspected,'pdfs':pdfs,'docx':docx,'archives':archives,'findings':bad,'boundary':'Original private prompt/catalogue, local paths, dependencies and private company materials excluded; examples are synthetic; intentional secret canaries exist only in tests.'}
(root/'docs/results/privacy.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report));raise SystemExit(bool(bad))
