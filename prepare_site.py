"""Reproduce shipped artwork/audio from reviewed archives; publish only runtime files."""
import hashlib,json,shutil,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parent
manifest=json.loads((ROOT/'assets-v0218-manifest.json').read_text())
for bundle in manifest['bundles']:
 p=ROOT/bundle['file']
 if hashlib.sha256(p.read_bytes()).hexdigest()!=bundle['sha256']:raise SystemExit('Asset archive checksum mismatch')
 with zipfile.ZipFile(p) as z:
  for n in z.namelist():
   target=(ROOT/n).resolve()
   if not target.is_relative_to(ROOT/'assets'):raise SystemExit('Unsafe asset archive path')
  z.extractall(ROOT)
for name,expected in manifest['files'].items():
 if hashlib.sha256((ROOT/name).read_bytes()).hexdigest()!=expected:raise SystemExit('Asset file checksum mismatch: '+name)
site=ROOT/'_site';site.mkdir(exist_ok=True)
for name in ['index.html','game.js','history.js','rankings.js','avatars.js','luck-audio.js','autolab.js']:
 shutil.copyfile(ROOT/name,site/name)
(site/'cloud').mkdir(exist_ok=True)
for name in ['config.js','cloud.js']:shutil.copyfile(ROOT/'cloud'/name,site/'cloud'/name)
shutil.copytree(ROOT/'assets',site/'assets',dirs_exist_ok=True)
(site/'.nojekyll').touch()
print('Verified',len(manifest['files']),'assets; runtime-only site ready')
