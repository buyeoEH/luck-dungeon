"""Build concrete audio comparison candidates; an explicit mode is required."""
import argparse,base64,hashlib,json,mimetypes,re,shutil,zipfile,os
from pathlib import Path
R=Path(__file__).resolve().parent;P=R/'_site/preview/v0.3.0';D=R/'_site/downloads'
def build(mode):
 assert mode in ['embedded','external'];audio=R/'release-audio-candidates';manifest=json.loads((audio/'manifest.json').read_text());D.mkdir(exist_ok=True)
 version=json.loads((P/'build.json').read_text())['version'];folder=D/('LUCK-v'+version+'-'+mode)
 if folder.exists():shutil.rmtree(folder)
 folder.mkdir();assets={str(p.relative_to(P)):'data:'+(mimetypes.guess_type(str(p))[0] or 'application/octet-stream')+';base64,'+base64.b64encode(p.read_bytes()).decode() for p in (P/'assets').rglob('*') if p.is_file() and p.suffix=='.webp'}
 def embed(text):
  for path,data in assets.items():text=text.replace(path,data)
  return text
 entries=[];aliases={}
 for i,t in enumerate(manifest['tracks']):
  raw=(audio/t['file']).read_bytes();assert hashlib.sha256(raw).hexdigest()==t['sha256']
  for alias in t['aliases']:aliases['assets/'+alias]=i
  if mode=='embedded':entries.append('data:audio/mpeg;base64,'+base64.b64encode(raw).decode())
  else:
   rel='assets/audio/'+t['file'];out=folder/rel;out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(raw);entries.append(rel)
 media={'mode':mode,'approval_status':'review_candidate','assets':entries,'aliases':aliases};html=(P/'index.html').read_text()
 bootstrap='<script>window.LUCK_RELEASE_MEDIA='+json.dumps(media,separators=(',',':'))+';</script>'
 html=html.replace('</head>',bootstrap+'</head>')
 def script(m):
  name=m[1].split('?')[0];text=(P/name).read_text()
  if name=='luck-audio.js':
   old="a.src=new URL('assets/'+(fallback?t.file.replace(/\\.ogg$/,'.mp3'):t.file),document.baseURI).href;"
   new="const path='assets/'+(fallback?t.file.replace(/\\.ogg$/,'.mp3'):t.file),map=global.LUCK_RELEASE_MEDIA,index=map.aliases[path];if(index===undefined)throw Error('Unmapped audio '+path);a.src=map.assets[index];"
   assert text.count(old)==1;text=text.replace(old,new)
  return '<script>'+embed(text).replace('</script','<\\/script')+'</script>'
 html=re.sub(r'<script src="([^"]+)"\s*></script>',script,html)
 html=re.sub(r'<link rel="stylesheet" href="([^"]+)">',lambda m:'<style>'+embed((P/m[1]).read_text())+'</style>',html)
 html=embed(html)
 # Preview keeps cloud isolation; data media is scoped to this review artifact.
 if 'media-src' not in html:html=html.replace("connect-src 'none'", "connect-src 'none'; media-src 'self' data: blob:")
 out=folder/'index.html';out.write_text(html)
 with out.open('rb') as f:os.fsync(f.fileno())
 total=sum(p.stat().st_size for p in folder.rglob('*') if p.is_file());assert total<=15_000_000,(mode,total,'15MB budget exceeded')
 zip_path=D/(folder.name+'.zip')
 with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
  for p in sorted(folder.rglob('*')):
   if p.is_file():z.write(p,str(p.relative_to(folder)))
 with zip_path.open('rb') as f:os.fsync(f.fileno())
 with zipfile.ZipFile(zip_path) as z:assert z.testzip() is None
 report={'mode':mode,'approval_status':'pending_user_choice','html_bytes':out.stat().st_size,'package_uncompressed_bytes':total,'zip_bytes':zip_path.stat().st_size,'html_sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'tracks':len(entries),'aliases':len(aliases),'image_assets':len(assets),'external_audio_files_required':mode=='external','original_assets_unchanged':True,'build_id':json.loads((P/'build.json').read_text())['build_id']}
 (R/('close-audio-'+mode+'.json')).write_text(json.dumps(report,indent=2));print(json.dumps(report));return report
if __name__=='__main__':
 p=argparse.ArgumentParser(description='Audio packaging review; no strategy selected automatically.');p.add_argument('--audio',choices=['embedded','external'],required=True);build(p.parse_args().audio)
