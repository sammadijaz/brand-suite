"""Exercise actual hostile Office containers without extraction or Office execution."""
import importlib.util,json,tempfile,zipfile
from pathlib import Path
root=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('production',root/'skills/brand-suite/scripts/production.py')
production=importlib.util.module_from_spec(spec);spec.loader.exec_module(production)
results=[]
cases=[('parent path',{'../escape.xml':'<x/>'},True),('Windows parent path',{'..\\escape.xml':'<x/>'},True),('drive path',{'C:/escape.xml':'<x/>'},True),('external entity',{'word/document.xml':'<!DOCTYPE x [<!ENTITY leak SYSTEM "file:///not-a-real-private-file">]><x>&leak;</x>'},True),('macro part',{'word/vbaProject.bin':b'INERT SYNTHETIC BYTES'},False),('external relationship',{'word/_rels/document.xml.rels':"<Relationships><Relationship TargetMode='External' Target='https://example.invalid'/></Relationships>"},False)]
with tempfile.TemporaryDirectory(prefix='brand-suite-office-') as work:
 for index,(name,parts,exception_expected) in enumerate(cases):
  target=Path(work)/f'{index}.docx'
  with zipfile.ZipFile(target,'w') as archive:
   for part,content in parts.items():archive.writestr(part,content)
  rejected=False
  try:
   result=production.inspect_docx(target)
   rejected=bool(result['defects'])
  except Exception:rejected=exception_expected
  assert rejected,name
  results.append({'case':name,'rejected':True})
report={'timestamp':__import__('datetime').datetime.now(__import__('datetime').timezone.utc).isoformat(),'cases':results,'extraction_or_office_execution':False}
(root/'.work').mkdir(exist_ok=True)
(root/'.work/security-office-results.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
