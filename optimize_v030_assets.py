"""Only optimize the isolated v0.3 output; reviewed original assets stay untouched."""
from pathlib import Path
import base64,hashlib,io,json,math,re
from PIL import Image,ImageChops,ImageStat,features
LIMIT=512;CARD_LIMIT=384;QUALITY=100
PAT=re.compile(r'data:image/(?:png|jpeg);base64,[A-Za-z0-9+/=]+')
def sha(b):return hashlib.sha256(b).hexdigest()
def encode(raw,lossless=True,max_edge=LIMIT):
 im=Image.open(io.BytesIO(raw)).convert('RGBA');size=im.size;im.thumbnail((max_edge,max_edge),Image.Resampling.LANCZOS)
 out=io.BytesIO();im.save(out,'WEBP',quality=QUALITY,method=4,lossless=lossless,exact=True);data=out.getvalue();dec=Image.open(io.BytesIO(data)).convert('RGBA')
 assert dec.size==im.size
 assert ImageChops.difference(im.getchannel('A'),dec.getchannel('A')).getbbox() is None,'alpha changed'
 psnr=[]
 for bg in ['#131c2d','#ffffff']:
  a=Image.new('RGBA',im.size,bg);a.alpha_composite(im);b=Image.new('RGBA',im.size,bg);b.alpha_composite(dec)
  rms=ImageStat.Stat(ImageChops.difference(a.convert('RGB'),b.convert('RGB'))).rms;mse=sum(x*x for x in rms)/3
  if mse:psnr.append(10*math.log10(255**2/mse))
 minimum=min(psnr) if psnr else None
 assert minimum is None or minimum>=34,(minimum,size)
 return data,{'original_pixels':size,'output_pixels':im.size,'original_bytes':len(raw),'output_bytes':len(data),'original_sha256':sha(raw),'output_sha256':sha(data),'alpha_exact':True,'psnr_min_composited_db':minimum,'lossless':lossless}
def optimize(root):
 root=Path(root);mapping={};rows=[]
 for p in sorted((root/'assets').rglob('*.png')):
  data,row=encode(p.read_bytes(),max_edge=CARD_LIMIT if 'cards' in p.parts else LIMIT);q=p.with_suffix('.webp');q.write_bytes(data);old=str(p.relative_to(root));new=str(q.relative_to(root));mapping[old]=new;row.update({'original':old,'output':new});rows.append(row)
 inline={};inline_rows=[]
 for p in sorted(root.rglob('*')):
  if not p.is_file() or p.suffix not in ['.js','.html','.css']:continue
  text=p.read_text()
  for old,new in mapping.items():text=text.replace(old,new)
  def sub(m):
   old=m[0]
   if old not in inline:
    data,row=encode(base64.b64decode(old.split(',',1)[1]),lossless=True);inline[old]='data:image/webp;base64,'+base64.b64encode(data).decode();row['uri_sha256']=sha(old.encode());inline_rows.append(row)
   return inline[old]
  text=PAT.sub(sub,text);p.write_text(text)
 for old in mapping:(root/old).unlink()
 report={'max_edge':LIMIT,'card_max_edge':CARD_LIMIT,'lossless':True,'pillow_webp':features.version('webp'),'assets':rows,'inline':inline_rows,'raw_asset_bytes':sum(x['original_bytes'] for x in rows),'webp_asset_bytes':sum(x['output_bytes'] for x in rows),'source_assets_preserved':True}
 (root/'asset-optimization.json').write_text(json.dumps(report,indent=2));return report
