import json,hashlib
from pathlib import Path
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright
from p5_measure import page,S
R=Path(__file__).resolve().parent;jobs=json.loads((R/'p5c-jobs.json').read_text());jobs=[j for j in jobs if j['seed']==101 and j['target']==0]
node={ (r['seed'],r['profile'],r['target'],r['choice']):r for r in map(json.loads,(R/'p5c-smoke/worker-0.jsonl').read_text().splitlines())}
with sync_playwright() as pw:
 b=pw.chromium.launch(args=['--js-flags=--max-old-space-size=256']);p=page(b,'full')
 def bridge(route):
  u=urlsplit(route.request.url);text=(S/u.path.lstrip('/')).read_text();n=text.rfind('})();');assert n>=0;text=text[:n]+'window.AutoLab.inspectRng=()=>({seed,enabled});\n'+text[n:];route.fulfill(body=text,content_type='application/javascript')
 p.route('**/autolab.js*',bridge);p.reload();p.wait_for_function('!!window.Luck220');p.evaluate("render=()=>{};actionFlash=()=>{};focusSection=()=>{};log=s=>fullLogs.push('[R'+round+']['+phase+'] '+plainLogText(s));window.LuckGameAudio=undefined;")
 ai=(R/'v030-reference-ai.js').read_text().replace("const choice={reroll:0,restock:1,random:2,stone:3}[cfg.reward_policy||'reroll'];","const choice=cfg.reward_policy==='mixed'?P5B.chooseReward(cfg.profile):({reroll:0,restock:1,random:2,stone:3}[cfg.reward_policy||'reroll']);").replace('window.V030ReferenceAI={run,profiles:Object.keys(W),weights:W};','window.V030ReferenceAI={run,profiles:Object.keys(W),weights:W,snapshot:state};')
 p.add_script_tag(content=ai)
 for f in ['p5-probe.js','p5b-policy.js','p5c-fork.js']:p.add_script_tag(path=str(R/f))
 checks=[]
 for i,j in enumerate(jobs):
  r=p.evaluate('j=>P5C.run(j)',j);n=node[j['seed'],j['profile'],j['target'],j['choice']];h=hashlib.sha256(json.dumps(r['point']['snapshot'],sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest();assert h==n['state_sha256'],(j,'state hash')
  for k in ['clear','round','stats','first_shop','random_calls','rewards','within_r30','last_battle']:assert r[k]==n[k],(j,k)
  checks.append({'seed':j['seed'],'profile':j['profile'],'choice':j['choice'],'same':True})
  if i%6==0:p.request_gc()
 b.close()
(R/'p5c-smoke/browser-parity.json').write_text(json.dumps(checks));print(len(checks),'counterfactual Chromium matches')
