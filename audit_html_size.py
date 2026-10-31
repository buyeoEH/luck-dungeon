from pathlib import Path
from collections import Counter,defaultdict
import base64,hashlib,json,re,subprocess,zipfile
R=Path(__file__).resolve().parent;B=R.parent/'p5f-size-base';P=B/'_site/preview/v0.3.0';f=B/'_site/downloads/LUCK-v0.3.0-dev.2.html';h=f.read_text();out=[]
for p in sorted((P/'assets').rglob('*')):
 if not p.is_file():continue
 raw=p.read_bytes();data=base64.b64encode(raw).decode();n=h.count(data);d={'path':str(p.relative_to(P)),'raw_bytes':len(raw),'base64_chars':len(data),'embedded_copies':n,'embedded_bytes':n*len(data),'sha256':hashlib.sha256(raw).hexdigest()}
 if p.suffix in ['.ogg','.mp3','.wav']:
  x=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration,bit_rate','-of','json',str(p)],text=True));d['audio']=x.get('format',{})
 out.append(d)
cat=defaultdict(lambda:{'files':0,'raw_bytes':0,'embedded_bytes':0,'embedded_files':0})
for x in out:
 key='audio' if '/audio/' in x['path'] else 'avatar' if '/avatar' in x['path'] else 'image' if x['path'].endswith(('.png','.jpg','.webp','.svg')) else 'other'
 for k,v in [('files',1),('raw_bytes',x['raw_bytes']),('embedded_bytes',x['embedded_bytes']),('embedded_files',int(x['embedded_copies']>0))]:cat[key][k]+=v
uris=Counter(re.findall(r'data:[^\s"\'<>]+?;base64,[A-Za-z0-9+/=]+',h));dups=sum(len(x)*(n-1) for x,n in uris.items());full=sum(len(x)*n for x,n in uris.items());pairs=[]
for p in (P/'assets/audio').glob('*.ogg'):
 q=p.with_suffix('.mp3')
 if q.exists():pairs.append({'stem':p.stem,'ogg_bytes':p.stat().st_size,'mp3_bytes':q.stat().st_size})
r={'baseline_html_bytes':f.stat().st_size,'html_sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'zip_bytes':(B/'_site/downloads/LUCK-v0.3.0-dev.2.zip').stat().st_size,'asset_categories':dict(cat),'assets':out,'uri_occurrences':sum(uris.values()),'unique_uris':len(uris),'uri_total_bytes':full,'duplicate_uri_bytes':dups,'audio_format_pairs':pairs,'top_assets':sorted(out,key=lambda x:x['embedded_bytes'],reverse=True)[:12]}
Path('p5f-tests').mkdir(exist_ok=True);Path('p5f-tests/html-size-audit.json').write_text(json.dumps(r,ensure_ascii=False,indent=2));print(json.dumps({k:r[k] for k in ['baseline_html_bytes','zip_bytes','asset_categories','uri_occurrences','unique_uris','uri_total_bytes','duplicate_uri_bytes']},ensure_ascii=False));print('top',[(x['path'],x['embedded_copies'],x['embedded_bytes']) for x in r['top_assets']])
