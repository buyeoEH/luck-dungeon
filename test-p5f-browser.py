from pathlib import Path
from urllib.parse import urlsplit
import json,hashlib
from playwright.sync_api import sync_playwright
from verify_v030 import serve,S
R=Path(__file__).resolve().parent;out=[]
with sync_playwright() as pw:
 b=pw.chromium.launch()
 # Exact browser/Node parity for 24 target interventions.
 p=b.new_page();p.route('**/*',lambda r:r.abort() if r.request.resource_type in ['image','media'] else serve(r))
 def bridge(route):
  u=urlsplit(route.request.url);s=(S/u.path.lstrip('/')).read_text();i=s.rfind('})();');route.fulfill(body=s[:i]+'window.AutoLab.inspectRng=()=>({seed,enabled});\n'+s[i:],content_type='application/javascript')
 p.route('**/autolab.js*',bridge);p.goto('https://luck.test/preview/v0.3.0/');p.wait_for_function('!!window.LuckP5Rewards');p.evaluate("render=()=>{};actionFlash=()=>{};focusSection=()=>{};log=s=>fullLogs.push('[R'+round+']['+phase+'] '+plainLogText(s));window.LuckGameAudio=undefined;")
 ai=(R/'v030-reference-ai.js').read_text().replace("const choice={reroll:0,restock:1,random:2,stone:3}[cfg.reward_policy||'reroll'];","const choice=cfg.reward_policy==='mixed'?P5B.chooseReward(cfg.profile):({reroll:0,restock:1,random:2,stone:3}[cfg.reward_policy||'reroll']);").replace('window.V030ReferenceAI={run,profiles:Object.keys(W),weights:W};','window.V030ReferenceAI={run,profiles:Object.keys(W),weights:W,snapshot:state};').replace("...BASIC.map(c=>({...c,group:'basic'})),...randomShop.map(c=>({...c,group:'random'}))","...BASIC.map(c=>({...c,price:window.LuckP5Rewards?.price(c)??c.price,group:'basic'})),...randomShop.map(c=>({...c,price:window.LuckP5Rewards?.price(c)??c.price,group:'random'}))").replace('reward(choice);if(rewardRevealPending)','reward(choice);if(window.LuckP5Rewards?.enabled)LuckP5Rewards.botResolve(cfg.profile,value);if(rewardRevealPending)')
 p.add_script_tag(content=ai)
 for f in ['p5-probe.js','p5b-policy.js','p5f-fork.js']:p.add_script_tag(path=str(R/f))
 jobs=[j for j in json.loads((R/'p5c-jobs.json').read_text()) if j['seed']==101 and j['target']==0 and j['choice']==1]
 node={(x['profile'],x['variant']):x for l in (R/'p5f-smoke-fork/worker-0.jsonl').open() if (x:=json.loads(l))}
 for j in jobs:
  for variant in ['A','B','C','seed3']:
   r=p.evaluate('j=>P5F.run(j)',{**j,'variant':variant});n=node[j['profile'],variant]
   for k in ['stats','clear','round','random_calls','rewards']:assert r[k]==n[k],(j,variant,k)
   normalize=lambda ev:[{k:v for k,v in x.items() if k!='instance_id'} for x in ev]
   assert normalize(r['events'])==normalize(n['events']),(j,variant,'events')
   h=hashlib.sha256(json.dumps(r['point']['snapshot'],sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest();assert h==n['state_sha256'];out.append({'profile':j['profile'],'variant':variant,'matched':True})
 p.close();(R/'p5f-tests/browser-parity.json').write_text(json.dumps(out));out=[]
 for width in [360,390,430]:
  for mode in ['A','B','C']:
   p=b.new_page(viewport={'width':width,'height':844},is_mobile=True,has_touch=True);errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.route('**/*',lambda r:r.abort() if r.request.resource_type in ['image','media'] else serve(r));p.goto('https://luck.test/preview/v0.3.0/?restock='+mode);p.wait_for_function('!!window.LuckP5Rewards');p.evaluate("AutoLab.begin(110);const c=BASIC.find(c=>c.id==='hand');buyCount[c.id]=c.limit;resource=30;bossReward();reward(1)");p.locator('button[onclick*="pickRestock"]').first.click();assert p.evaluate('round')==2 and p.evaluate('p5Flow') is None;assert not errors,errors
   p.evaluate('AutoLab.begin(101);bossReward();reward(0)');p.locator('button[onclick="LuckP5Rewards.toggleLock(0)"]').click();p.locator('button[onclick="LuckP5Rewards.confirmLocks()"]').click();p.locator('button[onclick="confirmShopReroll()"]').click();buttons=p.locator('button[onclick*="pickSeed"]');assert buttons.count()==3;offer=p.evaluate('LuckP5Rewards.seedOffer()');p.locator('#close').click();assert p.evaluate('LuckP5Rewards.seedOffer()')==offer;buttons.first.click();assert p.evaluate('round')==2;assert not errors,errors;out.append({'width':width,'restock':mode,'seed_choices':3,'no_reroll_on_close':True,'next_round':True});p.close()
 b.close()
(R/'p5f-tests/mobile.json').write_text(json.dumps(out));print('24 browser parity branches and 9 mobile ABC/seed3 flows passed')
