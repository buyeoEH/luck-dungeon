from pathlib import Path
from playwright.sync_api import sync_playwright
from verify_v030 import serve
import json
R=Path(__file__).resolve().parent;out=[]
with sync_playwright() as pw:
 b=pw.chromium.launch()
 for width in [360,390,430]:
  p=b.new_page(viewport={'width':width,'height':844},is_mobile=True,has_touch=True);errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.route('**/*',serve);p.goto('https://luck.test/preview/v0.3.0/');p.wait_for_function('!!window.LuckP5Rewards');p.evaluate("AutoLab.begin(101);buyCount[BASIC[0].id]=BASIC[0].limit;buyCount[randomShop[0].id]=randomShop[0].limit;bossReward();reward(1)")
  buttons=p.locator('button[onclick*="pickRestock"]');assert buttons.count()==2;buttons.nth(0).click();assert p.evaluate('LuckP5Rewards.coupon().uses')==1;p.evaluate("phase='shop';resource=2;render()")
  buy=p.locator('button[onclick="buyBasic(\'hand\')"]');assert buy.is_enabled();assert '할인' in buy.locator('..').inner_text();buy.click();assert p.evaluate('resource')==0 and p.evaluate('LuckP5Rewards.coupon()') is None
  assert not errors,errors;out.append({'width':width,'two_sold_out_options':True,'restore_selection':True,'discount_price_affordable':True,'consumed_once':True,'errors':errors});p.close()
 b.close()
(R/'p5-approved-results/restock-mobile.json').write_text(json.dumps(out,indent=2));print('restock mobile 360/390/430 passed')
