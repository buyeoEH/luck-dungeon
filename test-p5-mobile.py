from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from verify_v030 import serve
R=Path(__file__).resolve().parent;out=[]
with sync_playwright() as pw:
 b=pw.chromium.launch()
 for width in [360,390,430]:
  p=b.new_page(viewport={'width':width,'height':844},is_mobile=True,has_touch=True);errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.route('**/*',serve);p.goto('https://luck.test/preview/v0.3.0/');p.wait_for_function('!!window.LuckP5Rewards');p.evaluate('AutoLab.begin(101);bossReward();reward(0)')
  p.locator('button[onclick="LuckP5Rewards.toggleLock(0)"]').click();p.locator('button[onclick="LuckP5Rewards.toggleLock(1)"]').click();p.locator('button[onclick="LuckP5Rewards.toggleLock(2)"]').click();assert p.evaluate('LuckP5Rewards.locks().length')==2
  p.locator('button[onclick="LuckP5Rewards.confirmLocks()"]').click();p.locator('button[onclick="confirmShopReroll()"]').click();assert p.locator('button[onclick*="pickSeed"]').count()==8
  box=p.locator('.p5-content').bounding_box();assert box['x']>=0 and box['x']+box['width']<=width+1
  if width==390:p.screenshot(path='p5-approved-results/reroll-mobile-390.png')
  p.locator('button[onclick*="pickSeed"]').nth(1).click();assert p.evaluate('round')==2 and p.evaluate('LuckP5Rewards.pending()') is None
  assert not errors,errors;out.append({'width':width,'locks_cap2':True,'eight_seed_choices':True,'modal_within_width':True,'next_round':2,'errors':errors});p.close()
 b.close()
(R/'p5-approved-results/reroll-mobile.json').write_text(json.dumps(out,indent=2));print('360/390/430 touch flow passed')
