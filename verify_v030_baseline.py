"""Verify the pinned baseline against the currently playable v0.2.20 files."""
import concurrent.futures,hashlib,json,urllib.request
from pathlib import Path
R=Path(__file__).resolve().parent;O=R/'results-v030';O.mkdir(exist_ok=True)
BASE='https://buyeoeh.github.io/luck-dungeon/preview/v0.2.20/'
def check(name):
 local=(R/'_site/preview/v0.2.20'/name).read_bytes();live=urllib.request.urlopen(BASE+name,timeout=30).read()
 return {'file':name,'same':local==live,'sha256':hashlib.sha256(live).hexdigest()}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:rows=list(pool.map(check,['build.json','game.js','v0220-core.js','index.html']))
(O/'baseline-identity.json').write_text(json.dumps(rows,indent=2));assert all(x['same'] for x in rows),rows
print('Pinned baseline matches all four live files.')
