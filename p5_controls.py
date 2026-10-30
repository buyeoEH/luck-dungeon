"""160 full-state/RNG comparisons: native Chromium vs test adapter and Node host."""
import json,hashlib
from pathlib import Path
from playwright.sync_api import sync_playwright
from verify_v030_p1 import page as clean_page,stable
from p5_measure import page,execute
R=Path(__file__).resolve().parent;out=R/'p5-controls';out.mkdir(exist_ok=True)
with sync_playwright() as pw:
 b=pw.chromium.launch(args=['--js-flags=--max-old-space-size=256']);p=clean_page(b,'full');q=page(b,'full');q.add_script_tag(path=str(R/'p5-probe.js'))
 with (out/'chromium.jsonl').open('w') as f:
  for i,s in enumerate(range(101,261)):
   c={'experiment':'control','profile':['aoe','economy','balanced','pierce','luck','link','attack'][i%7],'seed':s,'reward_policy':['reroll','restock','random','stone'][i%4],'random_cards':3,'mode':'normal','variant':'full'}
   a=execute(p,c,True,True);r=execute(q,c,True);assert stable(a)==stable(r),(s,'test adapter drift');h=hashlib.sha256(stable(a).encode()).hexdigest();f.write(json.dumps({'config':c,'stable_sha256':h})+'\n');f.flush()
   if i%8==0:p.request_gc();q.request_gc()
   if i%20==19:print('control',i+1,flush=True)
 b.close()
