import json,hashlib
from pathlib import Path
from playwright.sync_api import sync_playwright
from p5_measure import page
R=Path(__file__).resolve().parent
cases=[json.loads(x) for x in (R/'p5b-smoke/worker-0.jsonl').read_text().splitlines()];assert len(cases)==34
old_checks=json.loads((R/'p5b-smoke/browser-parity.json').read_text()) if (R/'p5b-smoke/browser-parity.json').exists() else [];done={(x['experiment'],x['profile'],x['seed']) for x in old_checks};cases=[x for x in cases if (x['experiment'],x['profile'],x['seed']) not in done]
with sync_playwright() as pw:
 b=pw.chromium.launch(args=['--js-flags=--max-old-space-size=256']);p=page(b,'full')
 src=(R/'v030-reference-ai.js').read_text();old="const choice={reroll:0,restock:1,random:2,stone:3}[cfg.reward_policy||'reroll'];";assert src.count(old)==1
 src=src.replace(old,"const choice=cfg.reward_policy==='mixed'?P5B.chooseReward(cfg.profile):({reroll:0,restock:1,random:2,stone:3}[cfg.reward_policy||'reroll']);")
 p.add_script_tag(content=src);p.add_script_tag(path=str(R/'p5-probe.js'));p.add_script_tag(path=str(R/'p5b-policy.js'));checks=list(old_checks)
 for i,a in enumerate(cases):
  cfg={k:a[k] for k in ['experiment','profile','seed','reward_policy','mode','random_cards','conversion_on']};r=p.evaluate('c=>{const r=P5Harness.run(c);delete r.final;delete r.trace;delete r.metrics;return r;}',cfg)
  for k in ['clear','round','stats','first_shop','rewards','random_calls','battles','audit','reward_decisions']:assert r[k]==a[k],(i,k)
  checks.append({'experiment':a['experiment'],'profile':a['profile'],'seed':a['seed'],'same':True})
  if i%8==0:p.request_gc()
 b.close()
(R/'p5b-smoke/browser-parity.json').write_text(json.dumps(checks));print('34 active Chromium/Node cases matched')
