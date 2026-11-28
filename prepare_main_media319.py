"""Prepare existing user artwork/audio, never generate gameplay definitions."""
from pathlib import Path
from PIL import Image
import argparse,hashlib,json,subprocess,zipfile
R=Path(__file__).resolve().parent
def prepare(unpacked):
 out=R/'main-media319';out.mkdir(exist_ok=True)
 for d in ['fx','icons','audio']:(out/d).mkdir(exist_ok=True)
 expansion=unpacked/'1/LUCK-Motion-Expansion-0315-0317'
 growth=unpacked/'0';base=unpacked/'2/LUCK-2.5D-Motion-Pack';audio=unpacked/'3/LUCK-motion-audio-v1'
 manifest={'version':'0.3.19-main-media.1','effects':{},'icons':{},'audio':[],'provenance':[]}
 chosen=['fx-luck_success','fx-luck_fail','fx-shield_block','fx-debuff_attack','fx-debuff_link','fx-resource_drain','fx-gem_theft','fx-theft_block','fx-energy_gain','fx-draw','fx-slash','fx-aoe','fx-promote']
 sources={k:(base,v) for k,v in json.loads((base/'manifest.json').read_text())['assets'].items() if k in chosen}
 sources.update({k:(expansion,v) for k,v in json.loads((expansion/'manifest.json').read_text())['assets'].items()})
 sources.update({k:(growth,v) for k,v in json.loads((growth/'manifest.json').read_text())['assets'].items()})
 for key,(root,a) in sources.items():
  src=root/a['image'];im=Image.open(src).convert('RGBA');frames=a['frames'];size=192;sheet=Image.new('RGBA',(size*len(frames),size))
  for i,f in enumerate(frames):sheet.paste(im.crop((f['x'],f['y'],f['x']+f['w'],f['y']+f['h'])).resize((size,size),Image.Resampling.LANCZOS),(size*i,0))
  target=out/'fx'/f'{key}.webp';sheet.save(target,'WEBP',quality=82,method=6)
  clip=a['clips']['play'];timing=json.loads((growth/'manifest.json').read_text()).get('timing',{}).get(key,{})
  order=clip['frames'];duration=round(len(order)/clip['fps']*1000)
  manifest['effects'][key]={'image':'assets/main-media319/fx/'+target.name,'size':size,'frames':order,'duration':duration,'name':a.get('name',key),'poster':order[-1]}
  manifest['provenance'].append({'source':str(src.relative_to(unpacked)),'sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'output':'fx/'+target.name})
 mapping={'luck_seed313':'luck_seed','hand_cycle':'concept_ritual_shears','erase':'concept_crowned_shears','hand_salvage':'concept_reclaim_crucible','ash318':'concept_ember_brazier','ash318_up':'concept_winged_brazier','vault318':'concept_reclaim_crucible','vault318_up':'concept_gilded_crucible','prophecy318':'concept_thorn_contract','prophecy318_up':'concept_thorn_contract','cocoon318':'concept_amethyst_catalyst','cocoon318_up':'concept_twinring_catalyst','sprout_resource':'sprout_resource','sprout_attack':'sprout_attack','sprout_link':'sprout_link_gauge'}
 for key,stem in mapping.items():
  src=growth/'icons'/f'{stem}.webp';target=out/'icons'/f'{key}.webp';target.write_bytes(src.read_bytes());manifest['icons'][key]='assets/main-media319/icons/'+target.name
  manifest['provenance'].append({'source':str(src.relative_to(unpacked)),'sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'output':'icons/'+target.name})
 for t in json.loads((audio/'motion-audio-map.json').read_text())['tracks']:
  src=audio/t['file'];target=out/'audio'/f"motion319_{t['id']}.mp3"
  subprocess.run(['ffmpeg','-v','error','-y','-i',str(src),'-codec:a','libmp3lame','-b:a','96k','-ar','44100',str(target)],check=True)
  manifest['audio'].append({'id':'motion319_'+t['id'],'motionId':t['motionId'],'file':'main-media319/audio/'+target.name,'duration':t['duration'],'loop':False,'title':t['name']})
  manifest['provenance'].append({'source':str(src.relative_to(unpacked)),'sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'output':'audio/'+target.name})
 manifest['hashes']={str(p.relative_to(out)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(out.rglob('*')) if p.is_file() and p.name!='manifest.json'}
 (out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
 with zipfile.ZipFile(R/'main-media319.zip','w',zipfile.ZIP_DEFLATED) as z:
  for p in sorted(out.rglob('*')):
   if p.is_file():z.write(p,str(p.relative_to(out)))
 print(json.dumps({'effects':len(manifest['effects']),'icons':len(mapping),'sounds':len(manifest['audio']),'zip_bytes':(R/'main-media319.zip').stat().st_size}))
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('unpacked',type=Path);prepare(parser.parse_args().unpacked.resolve())
