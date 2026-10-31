from pathlib import Path
from playwright.sync_api import sync_playwright
import json
R=Path(__file__).resolve().parent;rows=[]
with sync_playwright() as pw:
 b=pw.chromium.launch()
 for mode in ['embedded','external']:
  c=b.new_context(offline=True);p=c.new_page();p.goto((R/'_site/downloads'/('LUCK-v0.3.0-rc.1-'+mode)/'index.html').as_uri(),wait_until='domcontentloaded');p.locator('body').click(position={'x':5,'y':5});x=p.evaluate("async()=>{const a=new LuckAudio().create('bgm_round');await a.play();await new Promise(r=>setTimeout(r,160));const out={time:a.currentTime,paused:a.paused,duration:a.duration,src:a.src.startsWith('data:')?'data':'file'};a.pause();return out;}");assert x['time']>0 and not x['paused'];rows.append({'mode':mode,'offline_file':True,**x});c.close()
 b.close()
(R/'close-results/file-offline-audio.json').write_text(json.dumps(rows,indent=2));print('final file/offline audio in both modes passed')
