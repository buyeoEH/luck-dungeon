from pathlib import Path
from PIL import Image,ImageDraw
import json
R=Path(__file__).resolve().parent;B=R.parent/'v030-close-base/_site/preview/v0.3.0';P=R/'_site/preview/v0.3.0';names=['assets/icons/cards/stararmor.png','assets/icons/cards/luckdraw.png','assets/enemies/iron_giant.png','assets/player/adventurer-mage.png','assets/cards/ag2.png']
out=Image.new('RGB',(5*300,400),'#131c2d');d=ImageDraw.Draw(out)
for i,name in enumerate(names):
 for j,path in enumerate([B/name,P/Path(name).with_suffix('.webp')]):
  with Image.open(path) as a:
   a=a.convert('RGBA');a.thumbnail((140,175),Image.Resampling.LANCZOS);out.paste(a,(300*i+150*j,15),a)
  d.text((300*i+150*j,194),'source' if j==0 else 'WebP',fill='white')
 # Typical 88-CSS-pixel detail icon at 2x sampling, shown 1:1.
 for j,path in enumerate([B/name,P/Path(name).with_suffix('.webp')]):
  with Image.open(path) as a:a=a.convert('RGBA').resize((88,88),Image.Resampling.LANCZOS);out.paste(a,(300*i+150*j+20,245),a)
 d.text((300*i+2,357),Path(name).stem,fill='white')
(R/'close-qa').mkdir(exist_ok=True);out.save(R/'close-qa/compare.png')
r=json.loads((P/'asset-optimization.json').read_text());print('image bytes',r['webp_asset_bytes'],'assets',len(r['assets']),'exact_alpha',all(x['alpha_exact'] for x in r['assets']))
