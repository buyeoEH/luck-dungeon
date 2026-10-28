"""P1: frozen reference policy, OFF regression and staged ON comparisons."""
import argparse,csv,gzip,hashlib,json,os,subprocess,sys,time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from playwright.sync_api import sync_playwright
from verify_v030 import serve,run,sha,R
O=R/'results-v030-p1'
def page(browser,variant):
 p=browser.new_page(viewport={'width':390,'height':844});p.route('**/*',serve)
 if variant!='baseline':p.add_init_script('window.LUCK_P1_ENABLED='+str(variant!='off').lower()+';window.LUCK_P1_CARDS='+str(variant in ['cards','full']).lower()+';window.LUCK_P1_EXTRAS='+str(variant=='full').lower()+';')
 p.goto('https://luck.test/preview/'+('v0.2.20' if variant=='baseline' else 'v0.3.0')+'/');p.wait_for_function('!!window.Luck220');p.evaluate("render=()=>{};actionFlash=()=>{};focusSection=()=>{};log=s=>fullLogs.push('[R'+round+']['+phase+'] '+plainLogText(s));window.LuckGameAudio=undefined;");p.add_script_tag(path=str(R/'v030-reference-ai.js'));return p
def stable(row):return json.dumps({k:row[k] for k in ['trace','final','first_shop','random_calls','rewards']},sort_keys=True,ensure_ascii=False,separators=(',',':'))
def worker(i,smoke):
 d=O/f'worker-{i}';d.mkdir(parents=True,exist_ok=True);began=time.monotonic();pairs=[];count=0;errors=[]
 with sync_playwright() as pw:
  b=pw.chromium.launch();pages={v:page(b,v) for v in ['baseline','off','core','cards','full']}
  for v,p in pages.items():p.on('pageerror',lambda e,v=v:errors.append(v+': '+str(e)))
  profiles=pages['full'].evaluate('V030ReferenceAI.profiles')
  for n,seed in enumerate(range(101,103 if smoke else 261)):
   if n%4!=i:continue
   profile=profiles[n%len(profiles)];a=run(pages['baseline'],profile,seed,True);c=run(pages['off'],profile,seed,True);same=stable(a)==stable(c)
   pair={'seed':seed,'profile':profile,'same':same,'baseline_sha256':hashlib.sha256(stable(a).encode()).hexdigest(),'off_sha256':hashlib.sha256(stable(c).encode()).hexdigest()};pairs.append(pair)
   if not same:(d/f'mismatch-{seed}.json').write_text(json.dumps({'baseline':a,'off':c}));raise AssertionError(pair)
  with gzip.open(d/'runs.jsonl.gz','wt',encoding='utf-8') as f:
   for variant in ['baseline','core','cards','full']:
    # Core then cards are small staged checks; full before/after uses all 200.
    seeds=range(101,103) if smoke else (list(range(101,106))+list(range(201,206)) if variant in ['core','cards'] else range(101,301))
    for profile in profiles:
     for seed in seeds:
      if (profiles.index(profile)*200+seed-101)%4!=i:continue
      r=run(pages[variant],profile,seed);r.pop('trace');r['variant']=variant;r['policy_sha256']=sha(R/'v030-reference-ai.js');assert r['object_object_count']==0
      r['p1_enabled']=variant not in ['baseline','off'];r['p1_cards']=variant in ['cards','full'];r['p1_extras']=variant=='full'
      f.write(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n');count+=1
    print(i,variant,'finished',flush=True)
  assert not errors,errors;b.close()
 (d/'pairs.json').write_text(json.dumps(pairs,indent=2));(d/'execution.json').write_text(json.dumps({'pairs':len(pairs),'runs':count,'errors':errors,'seconds':time.monotonic()-began,'policy_sha256':sha(R/'v030-reference-ai.js')}));return 0
def main():
 global O
 a=argparse.ArgumentParser();a.add_argument('--worker',type=int);a.add_argument('--smoke',action='store_true');a.add_argument('--merge-only',action='store_true');args=a.parse_args()
 if args.smoke:O=O/'smoke'
 O.mkdir(parents=True,exist_ok=True)
 if args.worker is not None:return worker(args.worker,args.smoke)
 if not args.merge_only:
  def task(i):
   with (O/f'worker-{i}.log').open('w') as f:return subprocess.run([sys.executable,__file__,'--worker',str(i)]+(['--smoke'] if args.smoke else []),cwd=R,stdout=f,stderr=subprocess.STDOUT).returncode
  with ThreadPoolExecutor(max_workers=4) as pool:codes=list(pool.map(task,range(4)))
  assert codes==[0]*4,codes
 pairs=[];rows=[]
 for i in range(4):
  pairs+=json.loads((O/f'worker-{i}/pairs.json').read_text())
  with gzip.open(O/f'worker-{i}/runs.jsonl.gz','rt') as f:rows += [json.loads(s) for s in f]
 assert len(pairs)==(2 if args.smoke else 160) and all(p['same'] for p in pairs)
 assert len(rows)==(56 if args.smoke else 2940)
 with gzip.open(O/'runs.jsonl.gz','wt',encoding='utf-8') as f:
  for r in rows:f.write(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n')
 flat=[]
 for r in rows:
  rr=next((x for x in r['battles'] if x['round']==30),None);p1=[e['payload']['p1'] for e in r['metrics'] if e['type']=='battle_metrics' and e['payload'].get('p1')]
  flat.append({'variant':r['variant'],'profile':r['profile'],'seed':r['seed'],'cohort':'101-200' if r['seed']<=200 else '201-300','clear':int(r['clear']),'round':r['round'],'within_limits_r30':int(bool(rr and rr['within_limits'])),'max_attack':r['stats']['maxAttack'],'aoe_damage':r['stats']['aoeDamage'],'damage':r['stats']['damageDealt'],'pierce_damage':r['stats']['pierceDamage'],'promotions':r['stats']['promotions'],'purchases':r['stats']['cardsBought'],'p1_battles':len(p1),'max_gauge':max([m['gaugeNet'] for m in p1] or [0]),'reward_policy':r['reward_policy'],'build_id':r['build_id'],'git_sha':r['git_sha']})
 with (O/'benchmark.csv').open('w',newline='') as f:w=csv.DictWriter(f,fieldnames=list(flat[0]));w.writeheader();w.writerows(flat)
 summary=[]
 for v in ['baseline','core','cards','full']:
  for p in sorted({r['profile'] for r in flat}):
   for c in ['101-200','201-300']:
    g=[r for r in flat if r['variant']==v and r['profile']==p and r['cohort']==c]
    if not g:continue
    n=len(g);summary.append({'variant':v,'profile':p,'cohort':c,'runs':n,'clear_rate':sum(x['clear'] for x in g)/n,'within_rate':sum(x['within_limits_r30'] for x in g)/n,'deaths_r10_11':sum(not x['clear'] and 10<=x['round']<=11 for x in g),'deaths_r19_21':sum(not x['clear'] and 19<=x['round']<=21 for x in g),'deaths_r22_29':sum(not x['clear'] and 22<=x['round']<=29 for x in g)})
 (O/'paired-regression.json').write_text(json.dumps(pairs,indent=2));(O/'summary.json').write_text(json.dumps(summary,indent=2));(O/'execution.json').write_text(json.dumps({'pairs':len(pairs),'runs':len(rows),'draw':'always_ON','policy_sha256':sha(R/'v030-reference-ai.js'),'object_object_count':sum(r['object_object_count'] for r in rows),'variants':['baseline','core','cards','full']},indent=2));print({'pairs':len(pairs),'runs':len(rows)},flush=True)
if __name__=='__main__':main()
