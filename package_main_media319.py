"""Same single-file distribution, with every new effect MP3 explicitly mapped."""
from pathlib import Path
import hashlib,json,shutil,subprocess
import build_v030_standalone as standalone
R=Path(__file__).resolve().parent;P=R/'_site/preview/v0.3-ap-final'
def build():
 work=R/'main-media319-package';audio=work/'release-audio-candidates';audio.mkdir(parents=True,exist_ok=True)
 base=R/'release-audio-candidates';manifest=json.loads((base/'manifest.json').read_text())
 for row in manifest['tracks']:shutil.copyfile(base/row['file'],audio/row['file'])
 for p in sorted((R/'assets/boss-audio').glob('*')):
  if p.suffix not in ['.ogg','.wav']:continue
  target=audio/(p.stem+'.mp3')
  if p.suffix=='.ogg':shutil.copyfile(p.with_suffix('.mp3'),target)
  else:subprocess.run(['ffmpeg','-v','error','-y','-i',str(p),'-codec:a','libmp3lame','-b:a','128k',str(target)],check=True)
  aliases=['boss-audio/'+p.name]
  if p.suffix=='.ogg':aliases.append('boss-audio/'+p.with_suffix('.mp3').name)
  manifest['tracks'].append({'id':p.stem,'file':target.name,'aliases':aliases,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
 media=json.loads((P/'assets/main-media319/manifest.json').read_text())
 for t in media['audio']:
  source=P/'assets'/t['file'];target=audio/source.name;shutil.copyfile(source,target);manifest['tracks'].append({'id':t['id'],'file':target.name,'aliases':[t['file']],'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
 (audio/'manifest.json').write_text(json.dumps(manifest,indent=2));standalone.R=work;standalone.P=P;standalone.D=R/'main-media319-delivery'
 return standalone.build('embedded',max_package_bytes=35_000_000)
if __name__=='__main__':build()
