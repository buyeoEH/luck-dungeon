from pathlib import Path
from PIL import Image,ImageChops
import json,hashlib
R=Path(__file__).resolve().parent;P=R/'_site/preview/v0.3.0';B=R.parent/'v030-close-base/_site/preview/v0.3.0';m=json.loads((P/'asset-optimization.json').read_text());out=[]
for x in m['assets']:
 raw=(P/x['output']).read_bytes();assert hashlib.sha256(raw).hexdigest()==x['output_sha256'];im=Image.open(B/x['original']).convert('RGBA');limit=384 if 'cards' in Path(x['original']).parts else 512;im.thumbnail((limit,limit),Image.Resampling.LANCZOS);dec=Image.open(P/x['output']).convert('RGBA');assert im.tobytes()==dec.tobytes(),x['output'];out.append({'asset':x['output'],'pixels':list(dec.size),'rgba_exact_to_resized_original':True,'bytes':len(raw)})
(R/'close-results').mkdir(exist_ok=True);(R/'close-results/image-pixels.json').write_text(json.dumps(out,indent=2));print(len(out),'images: all resized RGBA pixels exact')
