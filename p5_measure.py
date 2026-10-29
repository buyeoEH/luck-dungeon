"""Frozen P1 game, 400 paired seeds; test-only interventions, resumable JSONL."""
import argparse,hashlib,json,os,subprocess,time
from pathlib import Path
from playwright.sync_api import sync_playwright
from verify_v030_p1 import stable
from verify_v030 import serve,S
from urllib.parse import urlsplit
def page(browser,variant):
 p=browser.new_page(viewport={"width":390,"height":844})
 def route(r):
  u=urlsplit(r.request.url)
  if u.hostname=="luck.test" and u.path.endswith("/game.js"):
   text=(S/u.path.lstrip("/")).read_text()
   old="const aoeTotal = totalAoe();";assert text.count(old)==1
   text=text.replace(old,"const aoeTotal = window.P5_EXPERIMENT?.mode===\"no_effects\" ? 0 : totalAoe();")
   old="shuffle([...RANDOM_POOL]).slice(0, 3).map";assert text.count(old)==1
   text=text.replace(old,"shuffle([...RANDOM_POOL]).slice(0, window.P5_EXPERIMENT?.random_cards||3).map")
   return r.fulfill(body=text,content_type="application/javascript")
  return serve(r)
 p.route("**/*",route);p.goto("https://luck.test/preview/"+("v0.2.20" if variant=="baseline" else "v0.3.0")+"/");p.wait_for_function("!!window.Luck220")
 p.evaluate("render=()=>{};actionFlash=()=>{};focusSection=()=>{};log=s=>fullLogs.push(\"[R\"+round+\"][\"+phase+\"] \"+plainLogText(s));window.LuckGameAudio=undefined;")
 p.add_script_tag(path=str(R/"v030-reference-ai.js"));return p
R=Path(__file__).resolve().parent;PIN='15d136471bfc19e4cd21bb2e2dbf2218b7acc013'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def configs(seeds):
 for s in seeds:
  for p in ['aoe','economy','balanced','pierce','luck','link','attack']:
   for reward,n in [('reroll',3),('restock',3),('random',3),('stone',3),('random',1),('random',2)]:
    yield {'experiment':reward+str(n) if reward=='random' else reward,'profile':p,'seed':s,'reward_policy':reward,'random_cards':n,'mode':'normal','variant':'full'}
  for reward in ['reroll','restock','random','stone']:
   yield {'experiment':'ban_'+reward,'profile':'link','seed':s,'reward_policy':reward,'random_cards':3,'mode':'no_effects','variant':'full'}
  for p in ['attack','balanced']:
   for reward in ['reroll','random']:
    yield {'experiment':'noconv_'+reward,'profile':p,'seed':s,'reward_policy':reward,'random_cards':3,'mode':'no_conversion','variant':'full'}
    yield {'experiment':'baseline_'+reward,'profile':p,'seed':s,'reward_policy':reward,'random_cards':3,'mode':'normal','variant':'baseline'}
def key(c):return (c['experiment'],c['profile'],c['seed'])
def execute(p,c,trace=False,raw=False):
 cfg={**c,'trace':trace,'baseline_git_sha':'110d54876a121909b9bd6074cf682b6d99944083','policy_sha256':sha(R/'v030-reference-ai.js')}
 if raw:return p.evaluate('c=>V030ReferenceAI.run(c)',cfg)
 return p.evaluate('c=>{const r=P5Harness.run(c);if(!c.trace){delete r.final;delete r.metrics;delete r.trace;}return r;}',cfg)
def worker(w,workers,smoke):
 out=R/('p5-smoke' if smoke else 'p5-results');out.mkdir(exist_ok=True);f=out/f'worker-{w}.jsonl';existing={}
 if f.exists():
  lines=f.read_text().splitlines();valid=[]
  for line in lines:
   try:r=json.loads(line);existing[key(r)]=r;valid.append(line)
   except json.JSONDecodeError:break
  f.write_text('\n'.join(valid)+ ('\n' if valid else ''))
 seedlist=list(range(101,103 if smoke else 501));jobs=[c for c in configs(seedlist) if (c['seed']-101)%workers==w and key(c) not in existing]
 pairs=[];start=time.monotonic();count=0
 with sync_playwright() as pw:
  browser=pw.chromium.launch(args=['--js-flags=--max-old-space-size=256']);pages={v:page(browser,v) for v in ['full','baseline']};clean=__import__('verify_v030_p1').page(browser,'full')
  for p in pages.values():p.add_script_tag(path=str(R/'p5-probe.js'))
  # 160 observer/control regressions. Original policy and final state incl. RNG.
  for i,s in enumerate(range(101,103 if smoke else 261)):
   if i%workers!=w:continue
   c={'experiment':'control','profile':['aoe','economy','balanced','pierce','luck','link','attack'][i%7],'seed':s,'reward_policy':['reroll','restock','random','stone'][i%4],'random_cards':3,'mode':'normal'}
   a=execute(clean,c,True,True);b=execute(pages['full'],c,True);assert stable(a)==stable(b),(s,'observer changed game');pairs.append({'seed':s,'same':True,'sha256':hashlib.sha256(stable(a).encode()).hexdigest()});del a,b
   if i%4==0:
    clean.request_gc();pages['full'].request_gc()
  clean.close();(out/f'pairs-{w}.json').write_text(json.dumps(pairs))
  with f.open('a',encoding='utf-8') as dest:
   for c in jobs:
    p=pages[c['variant']];r=execute(p,c);assert r['persistent_draw'] and r['object_object_count']==0
    if c['variant']=='full':assert r['git_sha']==PIN and r['build_id']=='030-p1-5d62a9825cb6d2f9' and not r['source_tree_dirty']
    r['variant']=c['variant'];r['engine_sha']=PIN;r['observer_sha256']=sha(R/'p5-probe.js');r['policy_sha256']=sha(R/'v030-reference-ai.js');dest.write(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n');dest.flush();count+=1
    if count%8==0:p.request_gc()
    if count%100==0:print(w,count,'new',len(existing)+count,'total',round(time.monotonic()-start,1),flush=True)
  browser.close()
 (out/f'execution-{w}.json').write_text(json.dumps({'worker':w,'runs':len(existing)+count,'seconds':time.monotonic()-start,'engine_sha':PIN,'policy_sha256':sha(R/'v030-reference-ai.js'),'observer_sha256':sha(R/'p5-probe.js'),'runner_sha256':sha(R/'p5_measure.py'),'platform':'local Chromium','game_tracked_diff':subprocess.check_output(['git','diff','--stat'],cwd=R,text=True)},indent=2))
if __name__=='__main__':
 a=argparse.ArgumentParser();a.add_argument('--worker',type=int,default=0);a.add_argument('--workers',type=int,default=4);a.add_argument('--smoke',action='store_true');x=a.parse_args();worker(x.worker,x.workers,x.smoke)
