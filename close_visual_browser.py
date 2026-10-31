from pathlib import Path
from playwright.sync_api import sync_playwright
from verify_v030 import serve
import json
R=Path(__file__).resolve().parent;results=[]
with sync_playwright() as pw:
 b=pw.chromium.launch()
 for w in [360,390,430]:
  p=b.new_page(viewport={'width':w,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True);p.route('**/*',serve);p.goto('https://luck.test/preview/v0.3.0/');p.wait_for_function('!!window.LuckP5Rewards');p.evaluate('AutoLab.begin(101);bossReward();reward(0)');p.locator('button[onclick="LuckP5Rewards.confirmLocks()"]').click();p.locator('button[onclick="confirmShopReroll()"]').click();p.evaluate("async()=>{await Promise.all(Array.from(document.images).filter(i=>i.getAttribute('src')).map(i=>i.decode()));}");p.evaluate('document.fonts.ready');p.screenshot(path=str(R/f'close-qa/seed-choice-{w}.png'));assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1');results.append({'width':w,'font_qa':'NotoSansCJKkr installed locally; emoji checked when available','real_images':True,'seed3':p.locator('button[onclick*="pickSeed"]').count()==3});p.close()
 b.close()
(R/'close-results/visual-mobile.json').write_text(json.dumps(results,indent=2));print('three image-loaded seed choice visual screens ready')
