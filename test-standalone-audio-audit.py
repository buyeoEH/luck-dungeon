from pathlib import Path
from playwright.sync_api import sync_playwright
import json
R=Path(__file__).resolve().parent;f=R.parent/'p5f-size-base/_site/downloads/LUCK-v0.3.0-dev.2.html';requests=[];failed=[]
with sync_playwright() as pw:
 b=pw.chromium.launch();p=b.new_page();p.on('request',lambda r:requests.append(r.url) if '/assets/audio/' in r.url else None);p.on('requestfailed',lambda r:failed.append({'url':r.url,'failure':r.failure}) if '/assets/audio/' in r.url else None);p.goto(f.as_uri(),wait_until='domcontentloaded',timeout=60000);p.locator('body').click(position={'x':5,'y':5});p.evaluate('LuckGameAudio.unlock();LuckGameAudio.setBgmEnabled(true);LuckGameAudio.runStart();');p.wait_for_timeout(1500);snapshot=p.evaluate('LuckGameAudio.snapshot()');b.close()
assert requests and failed,(requests,failed);out={'html':f.name,'audio_requests':requests,'failed_audio_requests':failed,'snapshot':snapshot,'offline_audio_embedded':False};(R/'p5f-tests/standalone-audio-audit.json').write_text(json.dumps(out,ensure_ascii=False,indent=2));print('confirmed standalone dynamic audio requests fail:',len(failed))
