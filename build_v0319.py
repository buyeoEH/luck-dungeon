"""Main-screen artwork/sound update on unchanged v0.3.18 rules. 2.5D is not edited."""
from pathlib import Path
import hashlib,json,re,shutil,subprocess,zipfile
import build_v0318
R=Path(__file__).resolve().parent;P=build_v0318.P;once=build_v0318.once
def build():
 meta=build_v0318.build()
 # Exact pre-media files retained for controlled regression, never shipped as a new game.
 baseline=R/'media319-baseline';baseline.mkdir(exist_ok=True)
 for name in ['game.js','index.html','v0220-core.js','luck-audio.js']:shutil.copyfile(P/name,baseline/name)
 with zipfile.ZipFile(R/'main-media319.zip') as z:z.extractall(P/'assets/main-media319')
 manifest=json.loads((P/'assets/main-media319/manifest.json').read_text())
 for path,sha in manifest['hashes'].items():assert hashlib.sha256((P/'assets/main-media319'/path).read_bytes()).hexdigest()==sha,path
 game=(P/'game.js').read_text()
 game=once(game,"if(s.kind!=='unnecessary')window.LuckGameAudio?.statusCue?.(s.kind);","window.LuckMainMedia319?.status(s);if(s.kind!=='unnecessary')window.LuckGameAudio?.statusCue?.(s.kind);")
 game+='\nwindow.LUCK_MAIN_MEDIA319='+json.dumps(manifest,ensure_ascii=False)+';\n'+(R/'main-media319.js').read_text();(P/'game.js').write_text(game)
 core=P/'v0220-core.js';s=core.read_text();s=once(s,'version:B.version,build_id:B.build_id});persistSoon();}',"version:B.version,build_id:B.build_id});try{window.LuckMainMedia319?.observe(type,events[events.length-1]);}catch{}persistSoon();}");core.write_text(s)
 audio=P/'luck-audio.js';s=audio.read_text();s=once(s,'class LuckAudio {','tracks.push(...'+json.dumps(manifest['audio'],ensure_ascii=False)+');\nclass LuckAudio {')
 s=once(s,'function hit(ev){',"function hit(ev){\n  global.LuckMainMedia319?.hit(ev);\n  if(ev.damage>0&&shouldPlayBattleMotion()&&(ev.pure||['card','link','followup'].includes(ev.pierce_source)))return;")
 s=once(s,'function cinematicStart(){cinematic=true;', 'function cinematicStart(){global.LuckMainMedia319?.clear();cinematic=true;')
 s=once(s,"if(kind==='pierce'||hit.corePierceDamage>0)play('boss_sfx_pierce');","if(!global.LuckMainMedia319&&(kind==='pierce'||hit.corePierceDamage>0))play('boss_sfx_pierce');")
 marker='global.LuckGameAudio={'
 methods="motionCue(id){if(!tracks.some(t=>t.id===id&&id.startsWith('motion319_')))return;if(sound.voices.size>=4){const old=[...sound.voices].find(a=>a.dataset.id.startsWith('motion319_'));if(old){old.pause();old._release();}else return;}sfx(id);},motionStop(){for(const a of [...sound.voices])if(a.dataset.id.startsWith('motion319_')){a.pause();a._release();}},"
 s=once(s,marker,marker+methods);audio.write_text(s)
 (P/'main-media319.css').write_text((R/'main-media319.css').read_text())
 names=['build_v0319.py','main-media319.js','main-media319.css','main-media319.zip'];sources={n:hashlib.sha256((R/n).read_bytes()).hexdigest() for n in names}
 meta.update(version='0.3.19-main-media.1',stage='main_screen_media_update',media319_sources=sources,media319={'effects':len(manifest['effects']),'icons':len(manifest['icons']),'new_sfx':len(manifest['audio']),'rules':'v0.3.18 unchanged','powder_art':'existing meteor icon retained; no matching powder card concept in supplied pack'})
 meta['source_tree_dirty']=meta['source_tree_dirty'] or bool(subprocess.check_output(['git','status','--porcelain','--',*names],text=True).strip())
 meta['build_id']='0319-'+hashlib.sha256((game+json.dumps(sources,sort_keys=True)).encode()).hexdigest()[:16];(P/'build.json').write_text(json.dumps(meta,indent=2))
 h=(P/'index.html').read_text();h=re.sub(r'window.LUCK_BUILD=\{[^<]+?\};',lambda _:'window.LUCK_BUILD='+json.dumps(meta)+';',h,count=1);h=h.replace('</head>','<link rel="stylesheet" href="main-media319.css"></head>').replace('v0.3.18 발아·파괴 보상','v0.3.19 본판 이미지·효과음');(P/'index.html').write_text(h)
 return meta
if __name__=='__main__':print(json.dumps(build()))
