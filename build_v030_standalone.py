"""Standalone mobile HTML for the isolated v0.3 development build."""
import base64,hashlib,json,mimetypes,re,zipfile
from pathlib import Path
R=Path(__file__).resolve().parent;P=R/'_site/preview/v0.3.0';D=R/'_site/downloads';D.mkdir(exist_ok=True)
assets={str(p.relative_to(P)):'data:'+(mimetypes.guess_type(str(p))[0] or 'application/octet-stream')+';base64,'+base64.b64encode(p.read_bytes()).decode() for p in (P/'assets').rglob('*') if p.is_file()}
def embed(text):
 for path,data in assets.items():text=text.replace(path,data)
 return text
html=(P/'index.html').read_text()
def script(m):return '<script>'+embed((P/m[1].split('?')[0]).read_text()).replace('</script','<\\/script')+'</script>'
html=re.sub(r'<script src="([^"]+)"\s*></script>',script,html)
html=re.sub(r'<link rel="stylesheet" href="([^"]+)">',lambda m:'<style>'+embed((P/m[1]).read_text())+'</style>',html)
html=embed(html);out=D/'LUCK-v0.3.0-dev.1.html';out.write_text(html)
with zipfile.ZipFile(D/'LUCK-v0.3.0-dev.1.zip','w',zipfile.ZIP_DEFLATED) as z:z.write(out,out.name)
(R/'v030-standalone-report.json').write_text(json.dumps({'build_id':json.loads((P/'build.json').read_text())['build_id'],'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'embedded_assets':len(assets)},indent=2))
print('Standalone v0.3 development HTML:',out.stat().st_size,'bytes')
