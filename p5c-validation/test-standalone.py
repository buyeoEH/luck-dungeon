from pathlib import Path
from playwright.sync_api import sync_playwright
import json
R=Path(__file__).resolve().parent;f=R/'_site/downloads/LUCK-v0.3.0-dev.2.html';out=[]
with sync_playwright() as pw:
 b=pw.chromium.launch()
 for width in [360,390,430]:
  c=b.new_context(viewport={'width':width,'height':844},is_mobile=True,has_touch=True);p=c.new_page();errors=[];external=[]
  p.on('pageerror',lambda e:errors.append(str(e)))
  def route(r):
   if r.request.url=='https://luck.test/standalone.html':r.fulfill(path=str(f),content_type='text/html')
   else:external.append(r.request.url.split('?')[0]);r.abort()
  p.route('https://**/*',route);p.goto(f.as_uri(),wait_until='domcontentloaded',timeout=60000);p.wait_for_function('!!window.LuckP5Rewards');c.set_offline(True)
  meta=p.evaluate('LUCK_BUILD');assert meta['build_id']=='030-p5-2ae18b163156e902' and meta['git_sha']=='d276fbc8bd3a484b9431ef39b5b072835e6e0f5d' and not meta['source_tree_dirty']
  p.evaluate('AutoLab.begin(101);bossReward();reward(0)');p.locator('button[onclick="LuckP5Rewards.toggleLock(0)"]').click();p.locator('button[onclick="LuckP5Rewards.confirmLocks()"]').click();p.locator('button[onclick="confirmShopReroll()"]').click();p.locator('button[onclick*="pickSeed"]').first.click();assert p.evaluate('round')==2
  p.evaluate("buyCount[BASIC.find(c=>c.id==='hand').id]=BASIC.find(c=>c.id==='hand').limit;bossReward();reward(1)");p.locator('button[onclick*="pickRestock"]').first.click();p.evaluate("phase='shop';resource=2;render()");p.locator('button[onclick="buyBasic(\'hand\')"]').click();assert p.evaluate('resource')==0 and p.evaluate('LuckP5Rewards.coupon()') is None
  assert not errors and not external,(errors,external);out.append({'width':width,'offline':True,'embedded_audio':p.locator('script').count()>0,'reroll_seed_flow':True,'restock_discount_flow':True,'page_errors':errors,'external_requests':external,'build':meta['build_id'],'git_sha':meta['git_sha']});c.close()
 b.close()
(R/'p5-approved-results/standalone-mobile.json').write_text(json.dumps(out,indent=2));print('standalone offline touch: 360/390/430 passed')
