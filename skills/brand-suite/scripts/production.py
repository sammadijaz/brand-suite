"""Native DOCX, outlined assets, PDF inspection and bounded ZIP operations.

Only generated files are opened. No target code or supplied Office archive is executed.
"""
import argparse
import hashlib
import importlib.metadata
import json
import os
from pathlib import Path
import re
import sys
import unicodedata
import zipfile
from defusedxml import ElementTree as ET
from PIL import Image, ImageDraw, ImageFont


def write_json(path, value):
    Path(path).write_text(json.dumps(value, indent=2, ensure_ascii=False)+"\n", encoding="utf-8")


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def font_path():
    explicit = os.environ.get("BRAND_SUITE_FONT")
    choices = [explicit] if explicit else [
        str(Path(os.environ.get("WINDIR", "C:/Windows"))/"Fonts/arial.ttf"),
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/Library/Fonts/Arial.ttf",
    ]
    for p in choices:
        if p and Path(p).is_file():
            return Path(p)
    raise RuntimeError("No supported local font; set BRAND_SUITE_FONT to a permitted installed TTF")


def outline(text, x, y, size, font):
    from fontTools.ttLib import TTFont
    from fontTools.pens.svgPathPen import SVGPathPen
    from fontTools.pens.transformPen import TransformPen
    ft = TTFont(font); glyphs = ft.getGlyphSet(); cmap = ft.getBestCmap()
    scale = size / ft["head"].unitsPerEm
    parts = []; pos = x
    for c in text:
        name = cmap.get(ord(c))
        if not name:
            raise RuntimeError("Unsupported font glyph in stamp; no silent substitution")
        pen = SVGPathPen(glyphs)
        glyphs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, pos, y)))
        parts.append(pen.getCommands())
        pos += ft["hmtx"].metrics[name][0] * scale
    ft.close()
    return " ".join(parts), pos-x


def assets(out, spec):
    dest=Path(out); dest.mkdir(parents=True, exist_ok=True)
    font=font_path()
    company=spec["company"]; signatory=spec["signatory"]
    sizes=[("company-stamp", spec["circle"], spec["circle"], company),
           ("signatory-stamp", *spec["rectangle"], signatory)]
    asset_record=[]
    for name,w,h,text in sizes:
        # Wrap at words. Do not squeeze or alter lettering to fit.
        available=w-8; lines=[]; line=""; size=3.0
        for word in text.split():
            trial=(line+" "+word).strip()
            _,width=outline(trial,0,0,size,font)
            if width>available and line: lines.append(line); line=word
            else: line=trial
        if line: lines.append(line)
        if any(outline(l,0,0,size,font)[1]>available for l in lines) or len(lines)*4.5>h-12:
            raise RuntimeError("Stamp name exceeds legible geometry; choose larger dimensions or an approved short form")
        paths=[]
        for k,line in enumerate(lines):
            _,width=outline(line,0,0,size,font)
            d,_=outline(line,(w-width)/2,h/2+(k-(len(lines)-1)/2)*4.5,size,font)
            paths.append(d)
        caption=spec.get("company_caption","ORDINARY COMPANY") if name.startswith("company") else spec.get("signatory_caption","AUTHORIZED SIGNATORY")
        _,width=outline(caption,0,0,1.8,font)
        d,_=outline(caption,(w-width)/2,h-5,1.8,font); paths.append(d)
        if name.startswith("company"):
            r=w/2-1; r2=r-.35; cx=w/2; cy=h/2
            border=f'M {cx-r} {cy} A {r} {r} 0 1 1 {cx+r} {cy} A {r} {r} 0 1 1 {cx-r} {cy} Z M {cx-r2} {cy} A {r2} {r2} 0 1 0 {cx+r2} {cy} A {r2} {r2} 0 1 0 {cx-r2} {cy} Z'
        else:
            border=f'M 1 1 H {w-1} V {h-1} H 1 Z M 1.35 1.35 V {h-1.35} H {w-1.35} V 1.35 Z'
        svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}mm" height="{h}mm" viewBox="0 0 {w} {h}"><title>{name}</title><path fill="black" fill-rule="evenodd" d="{border}"/><path fill="black" d="{" ".join(paths)}"/></svg>'
        (dest/(name+".svg")).write_text(svg,encoding="utf-8")
        write_json(dest/(name+"-editable.json"),{"text":text,"width_mm":w,"height_mm":h,"font_family":ImageFont.truetype(str(font),20).getname()[0],"font_hash":digest(font),"font_size_mm":size,"lines":lines,"orientation":"positive impression; not mirrored","line_gap_floor_mm":0.3,"supplier_proof":"REQUIRED; not physically fabricated"})
        asset_record.append({"name":name,"width_mm":w,"height_mm":h,"dpi":600,"svg_sha256":digest(dest/(name+".svg")),"font_hash":digest(font),"status":"PROPOSED ordinary stamp; proof required"})
    write_json(dest/"stamp-specification.json",asset_record)


def docx(out, models, brand):
    from docx import Document
    from docx.shared import Mm, Pt, RGBColor
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn
    for m in models:
        doc=Document(); section=doc.sections[0]
        section.page_width=Mm(210 if m["paper"]=="A4" else 215.9)
        section.page_height=Mm(297 if m["paper"]=="A4" else 279.4)
        section.top_margin=Mm(37); section.bottom_margin=Mm(29)
        section.left_margin=section.right_margin=Mm(22)
        section.header_distance=Mm(12); section.footer_distance=Mm(12)
        normal=doc.styles['Normal']; normal.font.name=brand["font"]; normal.font.size=Pt(11)
        normal.font.color.rgb=RGBColor.from_string('000000' if m['id']=='S02' else brand["ink"].lstrip('#'))
        normal.paragraph_format.line_spacing=1.15; normal.paragraph_format.space_after=Pt(7)
        normal.paragraph_format.widow_control=True
        for name,size in [('Title',23),('Heading 1',17),('Heading 2',13)]:
            style=doc.styles[name]; style.font.name=brand["font"]; style.font.size=Pt(size)
            style.font.color.rgb=RGBColor.from_string(('000000' if m['id']=='S02' else brand['primary'].lstrip('#')))
            style.paragraph_format.keep_with_next=True
        hp=section.header.paragraphs[0]
        logo=Path(out)/'07_Assets/Derivatives/logo-primary.png'
        if logo.exists() and m['id'] not in ['S02','S03']:
            hp.add_run().add_picture(str(logo),width=Mm(23))
            hp.add_run('  ')
        run=hp.add_run(m['header']); run.bold=True; run.font.size=Pt(14 if m['id']!='S03' else 11)
        fp=section.footer.paragraphs[0]; fp.paragraph_format.space_after=Pt(0)
        r=fp.add_run(m['footer']+' | '+m['id']+' | '); r.font.size=Pt(9)
        field=OxmlElement('w:fldSimple'); field.set(qn('w:instr'),'PAGE'); fp._p.append(field)
        if not m['blank']:
            doc.add_paragraph(m['title'],'Title')
            p=doc.add_paragraph(m['release_state']+' — unexecuted review copy'); p.runs[0].font.size=Pt(9)
        for b in m['blocks']:
            t=b['type']
            if t=='heading': doc.add_paragraph(b['text'],'Heading 2')
            elif t in ['paragraph','note','signature']:
                if t in ['signature','note'] and doc.paragraphs:
                    doc.paragraphs[-1].paragraph_format.keep_with_next=True
                    # A schedule can be the immediately preceding block. Keep its
                    # closing row with the signature instead of a detached page.
                    previous=doc.element.body[-2]
                    if previous.tag==qn('w:tbl') and doc.tables:
                        for cell in doc.tables[-1].rows[-1].cells:
                            for paragraph in cell.paragraphs:
                                paragraph.paragraph_format.keep_with_next=True
                p=doc.add_paragraph(b.get('text',''))
                if t in ['signature','note']: p.paragraph_format.keep_together=True
                if t=='note': p.runs[0].italic=True
            elif t=='list':
                for item in b['items']: doc.add_paragraph(item,'List Bullet')
            elif t=='table':
                table=doc.add_table(rows=0,cols=len(b['rows'][0])); table.autofit=False
                available=(210 if m['paper']=='A4' else 215.9)-44
                for column in table.columns: column.width=Mm(available/len(table.columns))
                for ri,row in enumerate(b['rows']):
                    cells=table.add_row().cells
                    for ci,value in enumerate(row):
                        cells[ci].text=value
                        for p in cells[ci].paragraphs:
                            p.paragraph_format.space_after=Pt(3)
                            for r in p.runs: r.font.size=Pt(10); r.bold=ri==0
                    if ri==0:
                        repeat=OxmlElement('w:tblHeader'); table.rows[0]._tr.get_or_add_trPr().append(repeat)
                    no_split=OxmlElement('w:cantSplit'); table.rows[-1]._tr.get_or_add_trPr().append(no_split)
            elif t=='image':
                pth=(Path(out)/b['src']).resolve()
                if not pth.is_relative_to(Path(out).resolve()) or pth.suffix.lower()!='.png': raise RuntimeError('Image path denied')
                p=doc.add_paragraph(); run=p.add_run(); run.add_picture(str(pth),width=Mm(b['width_mm']),height=Mm(b['height_mm']))
                for node in p._p.xpath('.//wp:docPr'): node.set('descr',b['alt'])
                doc.add_paragraph(b['alt'],'Caption')
            elif t=='page-break': doc.add_page_break()
        doc.core_properties.author=''; doc.core_properties.last_modified_by=''; doc.core_properties.comments=''
        doc.core_properties.title=m['title']; doc.core_properties.subject=m['id']+' '+m['release_state']
        dest=Path(out)/m['folder']/(m['id']+'.docx'); dest.parent.mkdir(parents=True,exist_ok=True); doc.save(dest)
        # python-docx's default base document includes a legacy bibliography
        # customXML part. Remove it and its relationships rather than publishing
        # unnecessary hidden data.
        with zipfile.ZipFile(dest) as z:
            entries={name:z.read(name) for name in z.namelist() if not name.startswith('customXml/')}
        for name,data in list(entries.items()):
            if name.endswith('.rels'):
                entries[name]=re.sub(rb'<Relationship\b[^>]*Target="[^\"]*customXml/[^\"]*"[^>]*/>',b'',data)
            if name=='[Content_Types].xml':
                entries[name]=re.sub(rb'<Override\b[^>]*PartName="/customXml/[^\"]*"[^>]*/>',b'',data)
        with zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED) as z:
            for name,data in entries.items(): z.writestr(name,data)


def norm(text):
    return re.sub(r'\s+','',unicodedata.normalize('NFKC',text)).replace('\u00ad','').replace('—','-').replace('–','-')


def inspect_docx(p):
    ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    parts={}; defects=[]
    with zipfile.ZipFile(p) as z:
        if sum(x.file_size for x in z.infolist())>30_000_000 or len(z.infolist())>500: raise RuntimeError('Office archive exceeds budget')
        for info in z.infolist():
            normalized_name=info.filename.replace('\\','/')
            if '..' in normalized_name.split('/') or normalized_name.startswith('/') or re.match(r'^[A-Za-z]:',normalized_name) or info.file_size>10_000_000: raise RuntimeError('Hostile Office archive path/size')
            name=info.filename
            if re.search(r'vbaProject|embeddings|activeX|comments|people',name,re.I): defects.append('active object/comment/private revision part '+name)
            if name.endswith('.xml'):
                data=z.read(name); tree=ET.fromstring(data)
                if name=='word/document.xml' or re.match(r'word/(header|footer)\d+\.xml',name):
                    paragraphs=[]
                    for para in tree.findall('.//w:p',ns): paragraphs.append(''.join(t.text or '' for t in para.findall('.//w:t',ns)))
                    parts[name]='\n'.join(paragraphs)
                    if tree.findall('.//w:vanish',ns) or tree.findall('.//w:ins',ns) or tree.findall('.//w:del',ns): defects.append('hidden or revision text '+name)
            if name.endswith('.rels'):
                tree=ET.fromstring(z.read(name))
                if any(element.get('TargetMode')=='External' for element in tree.iter()): defects.append('external Office relationship')
    return {'parts':parts,'defects':defects,'text':'\n'.join(parts.values())}


def inspect(out, models, previews=True):
    from pypdf import PdfReader
    import pypdfium2 as pdfium
    out=Path(out); results=[]; thumbs=[]
    pd=out/'previews'; pd.mkdir(exist_ok=True)
    for m in models:
        base=out/m['folder']/m['id']; office=inspect_docx(base.with_suffix('.docx'))
        checks={'id':m['id'],'docx':office,'pdfs':[],'defects':office['defects'].copy()}
        expected=[m['header']]+([] if m['blank'] else [m['title']])
        for b in m['blocks']:
            expected.extend(b.get('items',[]) or ([x for row in b['rows'] for x in row] if 'rows' in b else [b['text']] if 'text' in b else [b['alt']] if 'alt' in b else []))
        expected.append(m['footer'])
        for suffix in ['.pdf','.html-print.pdf']:
            p=base.with_suffix(suffix) if suffix=='.pdf' else out/'previews'/(m['id']+suffix)
            reader=PdfReader(p)
            text='\n'.join(page.extract_text() or '' for page in reader.pages)
            normalized=norm(text)
            bodies=[]
            for page_number,page in enumerate(reader.pages,1):
                raw=page.extract_text() or ''
                raw=re.sub(r'^\s*'+re.escape(m['header'])+r'\s*$', '',raw,flags=re.M)
                page_text=norm(raw)
                page_text=page_text.replace(norm(m['footer'])+'|'+m['id']+'|'+str(page_number),'').replace(norm(m['footer']),'')
                bodies.append(page_text)
            body_text=''.join(bodies)
            missing=[s[:100] for s in expected[1:-1] if norm(s) not in body_text]
            for s in [m['header'],m['footer']]:
                if norm(s) not in normalized:missing.append(s[:100])
            if missing: checks['defects'].append(suffix+' missing semantic blocks: '+repr(missing))
            if reader.is_encrypted: checks['defects'].append('PDF encrypted')
            if '\ufffd' in text or '\u25a1' in text: checks['defects'].append('replacement/box glyph')
            pages=[]; pdf=pdfium.PdfDocument(p)
            for pi,page in enumerate(reader.pages):
                width,height=float(page.mediabox.width),float(page.mediabox.height)
                expected_size=(595.28,841.89) if m['paper']=='A4' else (612,792)
                if abs(width-expected_size[0])>2 or abs(height-expected_size[1])>2: checks['defects'].append('Wrong page box')
                preview=None; layout=[]
                pp=pdf[pi]; tp=pp.get_textpage()
                for ci in range(tp.count_chars()):
                    left,bottom,right,top=tp.get_charbox(ci)
                    if left<0 or right>width+1 or bottom<0 or top>height+1: layout.append('text outside page')
                if layout: checks['defects'].append('text outside page '+str(pi+1))
                if previews:
                    preview=f'{m["id"]}{"-html" if suffix!=".pdf" else ""}-p{pi+1:02}.png'
                    image=pp.render(scale=1.67).to_pil(); image.save(pd/preview)
                    if suffix=='.pdf':
                        thumb=image.copy(); thumb.thumbnail((170,240)); thumbs.append((m['id']+' p'+str(pi+1),thumb))
                pages.append({'page':pi+1,'width_pt':width,'height_pt':height,'preview':preview,'visual_review':'PENDING','sha256':digest(p)})
                tp.close(); pp.close()
            pdf.close()
            checks['pdfs'].append({'kind':'Word-derived primary' if suffix=='.pdf' else 'Chromium printed HTML','sha256':digest(p),'pages':pages,'text':text,'missing':missing})
        results.append(checks)
    if thumbs:
        columns=6; rows=(len(thumbs)+columns-1)//columns
        sheet=Image.new('RGB',(columns*190,rows*270),'#e9ecee'); draw=ImageDraw.Draw(sheet)
        for i,(label,img) in enumerate(thumbs):
            x=i%columns*190+10; y=i//columns*270+20; sheet.paste(img,(x,y)); draw.text((x,y-15),label,fill='black')
        sheet.save(pd/'contact-sheet.png')
    write_json(out/'08_Controls/inspection.json',{'documents':results,'reviewer_type':'automated structural checks; visual inspection remains separate'})
    return results


def zip_package(root, destination):
    root=Path(root).resolve(); destination=Path(destination).resolve()
    if destination.is_relative_to(root): raise RuntimeError('ZIP must be outside package root')
    with zipfile.ZipFile(destination,'w',zipfile.ZIP_DEFLATED) as z:
        for p in sorted(root.rglob('*')):
            if p.is_symlink(): raise RuntimeError('Symlink denied during packaging')
            if p.is_file():
                if p.stat().st_size>30_000_000: raise RuntimeError('Package file exceeds budget')
                z.write(p,p.relative_to(root).as_posix())
    with zipfile.ZipFile(destination) as z:
        if z.testzip(): raise RuntimeError('ZIP integrity failure')
    return {'zip':str(destination),'sha256':digest(destination),'files':len(z.namelist())}


def main():
    parser=argparse.ArgumentParser(); parser.add_argument('command',choices=['doctor','docx','assets','inspect','zip','office-check','raster-check']); parser.add_argument('--out'); parser.add_argument('--spec'); parser.add_argument('--destination')
    args=parser.parse_args()
    if args.command=='doctor':
        print(json.dumps({'python':sys.version.split()[0],'packages':{p:importlib.metadata.version(p) for p in ['python-docx','pypdf','pypdfium2','Pillow','fonttools','defusedxml']},'font':str(font_path()),'font_family':ImageFont.truetype(str(font_path()),20).getname()[0],'font_hash':digest(font_path())})); return
    if args.command=='office-check': print(json.dumps(inspect_docx(args.spec))); return
    if args.command=='raster-check':
        p=Path(args.spec)
        if p.stat().st_size>2_000_000: raise RuntimeError('Raster size denied')
        with Image.open(p,formats=['PNG']) as im:
            if im.width>4096 or im.height>4096: raise RuntimeError('Raster pixel budget denied')
            im.verify()
        with Image.open(p,formats=['PNG']) as im:
            im=im.convert('RGBA'); w,h=im.size
            print(json.dumps({'width_px':w,'height_px':h,'low_resolution':min(w,h)<256,'opaque_corners':all(im.getpixel(pos)[3]==255 for pos in [(0,0),(w-1,0),(0,h-1),(w-1,h-1)]),'conversion':'NOT PERFORMED'}))
        return
    spec=json.loads(Path(args.spec).read_text(encoding='utf-8')) if args.spec else None
    if args.command=='docx': docx(args.out,spec['models'],spec['brand'])
    elif args.command=='assets': assets(args.out,spec)
    elif args.command=='inspect': inspect(args.out,spec['models'])
    elif args.command=='zip': print(json.dumps(zip_package(args.out,args.destination)))


if __name__=='__main__':
    try: main()
    except Exception as exc:
        print(json.dumps({'status':'failed','error':str(exc)}),file=sys.stderr); sys.exit(4)
