"""Real Chromium fixed-ON benchmark and 160 paired state regressions."""
import argparse,csv,gzip,hashlib,json,mimetypes,statistics,time
from collections import Counter
from pathlib import Path
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parent;S=R/'_site';O=R/'results-v030';O.mkdir(exist_ok=True)
BASE_SHA='110d54876a121909b9bd6074cf682b6d99944083'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def serve(route):
 u=urlsplit(route.request.url)
 if u.hostname!='luck.test':return route.abort()
 f=(S/u.path.lstrip('/')).resolve()
 if f.is_dir():f=f/'index.html'
 if f.is_relative_to(S) and f.is_file():return route.fulfill(path=str(f),content_type=mimetypes.guess_type(str(f))[0] or 'application/octet-stream')
 return route.abort()
def page_for(browser,version):
 p=browser.new_page(viewport={'width':390,'height':844});p.route('**/*',serve);p.goto('https://luck.test/preview/'+version+'/');p.wait_for_function('!!window.Luck220')
 p.evaluate("render=()=>{};actionFlash=()=>{};focusSection=()=>{};log=s=>fullLogs.push('[R'+round+']['+phase+'] '+plainLogText(s));window.LuckGameAudio=undefined;")
 p.add_script_tag(path=str(R/'v030-reference-ai.js'));return p
def run(p,profile,seed,trace=False):
 cfg={'profile':profile,'seed':seed,'reward_policy':'reroll','policy_sha256':sha(R/'v030-reference-ai.js'),'baseline_git_sha':BASE_SHA,'trace':trace}
 return p.evaluate('c=>V030ReferenceAI.run(c)',cfg)
def main():
 global O
 ap=argparse.ArgumentParser();ap.add_argument('--smoke',action='store_true');ap.add_argument('--shard',type=int,default=0);ap.add_argument('--shards',type=int,default=1);a=ap.parse_args();began=time.monotonic()
 assert 0<=a.shard<a.shards
 if a.smoke:O=O/'smoke';O.mkdir(exist_ok=True)
 if a.shards>1:O=O/('worker-'+str(a.shard));O.mkdir(exist_ok=True)
 with sync_playwright() as pw:
  browser=pw.chromium.launch();baseline=page_for(browser,'v0.2.20');candidate=page_for(browser,'v0.3.0');errors=[]
  baseline.on('pageerror',lambda e:errors.append('baseline '+str(e)));candidate.on('pageerror',lambda e:errors.append('candidate '+str(e)))
  catalog=candidate.evaluate("()=>({promotions:PROMOS.map(p=>({id:p.id,tier:p.tier||1,from:p.from,cost:p.cost,card:p.card})),random_pool:RANDOM_POOL.map(c=>c.id),basic:BASIC.map(c=>({id:c.id,atk:c.atk||0,price:c.price})),limits:[1,5,10,11,14,16,20,26,30].map(r=>({round:r,count:gameOverEnemyLimit(r),hp:gameOverHpLimit(r),spawns:spawnCount(r)})),rewards:(()=>{bossReward();const out=rewards.map(x=>({name:x[0],description:x[1]}));return out;})()})")
  (O/'source-catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2))
  # Every baseline/candidate pair uses the exact same policy code, seed, reward,
  # and ON setting. Only identities/time and added observation records differ.
  profiles=candidate.evaluate('V030ReferenceAI.profiles');pairs=[]
  for n,seed in enumerate(range(101,103 if a.smoke else 261)):
   if n%a.shards!=a.shard:continue
   profile=profiles[n%len(profiles)];b=run(baseline,profile,seed,True);c=run(candidate,profile,seed,True)
   stable=lambda row:json.dumps({'trace':row['trace'],'final':row['final'],'first_shop':row['first_shop'],'random_calls':row['random_calls'],'rewards':row['rewards']},ensure_ascii=False,sort_keys=True,separators=(',',':'))
   bs,cs=stable(b),stable(c);same=bs==cs
   pairs.append({'seed':seed,'profile':profile,'persistent_draw':True,'same':same,'baseline_sha256':hashlib.sha256(bs.encode()).hexdigest(),'candidate_sha256':hashlib.sha256(cs.encode()).hexdigest(),'states':len(c['trace'])})
   if not same:
    (O/f'mismatch-{seed}.json').write_text(json.dumps({'baseline':b,'candidate':c},ensure_ascii=False));raise AssertionError(f'Unexpected state change seed {seed}')
   if n%20==0:print('paired',n+1,flush=True)
  (O/'paired-regression.json').write_text(json.dumps(pairs,indent=2));assert not errors,errors
  # Full baseline benchmark remains separate from the regression subset.
  rows=[]
  with gzip.open(O/'benchmark-runs.jsonl.gz','wt',encoding='utf-8') as output:
   for profile in profiles:
    for seed in range(101,103 if a.smoke else 301):
     if (profiles.index(profile)*200+seed-101)%a.shards!=a.shard:continue
     c=run(candidate,profile,seed);c.pop('trace');output.write(json.dumps(c,ensure_ascii=False,separators=(',',':'))+'\n')
     r30=next((r for r in c['battles'] if r['round']==30),None)
     rows.append({'profile':profile,'seed':seed,'cohort':'101-200' if seed<=200 else '201-300','persistent_draw':True,'clear':int(c['clear']),'round':c['round'],'within_limits_r30':int(bool(r30 and r30['within_limits'])),'max_attack':c['stats']['maxAttack'],'damage':c['stats']['damageDealt'],'aoe_damage':c['stats']['aoeDamage'],'pierce_damage':c['stats']['pierceDamage'],'promotions':c['stats']['promotions'],'purchases':c['stats']['cardsBought'],'reward_policy':c['reward_policy'],'build_id':c['build_id'],'git_sha':c['git_sha']})
    print('benchmark',profile,'complete',flush=True)
  with (O/'benchmark.csv').open('w',newline='') as f:w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
  summary=[]
  for profile in profiles:
   for cohort in sorted(set(r['cohort'] for r in rows)):
    group=[r for r in rows if r['profile']==profile and r['cohort']==cohort];n=len(group)
    summary.append({'profile':profile,'cohort':cohort,'runs':n,'clear_rate':sum(r['clear'] for r in group)/n,'within_limits_r30_rate':sum(r['within_limits_r30'] for r in group)/n,'deaths_r10_11':sum(not r['clear'] and 10<=r['round']<=11 for r in group),'deaths_r19_21':sum(not r['clear'] and 19<=r['round']<=21 for r in group),'deaths_r22_29':sum(not r['clear'] and 22<=r['round']<=29 for r in group),'mean_round':statistics.mean(r['round'] for r in group)})
  (O/'summary.json').write_text(json.dumps(summary,indent=2));(O/'execution.json').write_text(json.dumps({'paired_runs':len(pairs),'pairs_passed':sum(p['same'] for p in pairs),'benchmark_runs':len(rows),'seconds':time.monotonic()-began,'policy_sha256':sha(R/'v030-reference-ai.js'),'errors':errors,'historical_policy_available':False},indent=2));browser.close()
  print(json.dumps({'pairs':len(pairs),'benchmark_runs':len(rows),'seconds':time.monotonic()-began}),flush=True)
if __name__=='__main__':main()
