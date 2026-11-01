"""Local browser QA only. Never writes to cloud services."""
import json,mimetypes
from pathlib import Path
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parent;S=R/'_site';O=R/'battle-preparation-results';O.mkdir(exist_ok=True)
def serve(route):
 u=urlsplit(route.request.url)
 if u.hostname!='luck.test':return route.abort()
 f=(S/u.path.lstrip('/')).resolve()
 if f.is_dir():f=f/'index.html'
 if f.is_relative_to(S) and f.is_file():return route.fulfill(path=str(f),content_type=mimetypes.guess_type(str(f))[0] or 'application/octet-stream')
 return route.abort()
rows=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch()
 for width in [360,390,430]:
  for visual,skip in [(True,False),(False,True)]:
   ctx=browser.new_context(viewport={'width':width,'height':844},is_mobile=True,has_touch=True)
   p=ctx.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.route('**/*',serve)
   p.goto('https://luck.test/preview/v0.3.0/');p.locator('#welcomeVisualModeToggle').set_checked(visual);p.locator('#welcomeBattleMotionSkipToggle').set_checked(skip)
   p.locator('#welcomeNormal').click();p.get_by_role('button',name='⚔ 전투 준비하기',exact=True).click()
   p.locator('#nextBtn').click();p.locator('#nextBtn').click()
   assert p.evaluate('phase')=='battle'
   assert p.evaluate('LuckGameAudio.snapshot().scene')=='bgm_battle'
   text=p.locator('#battleStage').inner_text()
   for term in ['전투 준비','덱 공격 13','HP 12 → 0','예상 실제 피해 12','발동한 연계·콤보 없음','전투 시작']:assert term in text,(width,term,text)
   assert p.evaluate('enemies[0].hp')==12,'Preview dealt damage before start'
   assert p.evaluate('document.documentElement.scrollWidth')<=width+1
   p.locator('#battleStage').scroll_into_view_if_needed();p.screenshot(path=str(O/f'preparation-{width}-{visual}.png'))
   p.locator('#nextBtn').click()
   if not skip:p.locator('#close').click()
   assert 'ROUND 2 시작' in p.locator('#modalTitle').inner_text()
   p.get_by_role('button',name='⚔ 전투 준비하기',exact=True).click()
   assert p.evaluate('LuckGameAudio.snapshot().scene')=='bgm_round'
   assert p.evaluate('round')==2
   assert errors==[],errors
   rows.append({'width':width,'visual':visual,'skip':skip,'ready_bgm':'bgm_battle','return_bgm':'bgm_round','forecast':True,'no_overflow':True,'errors':errors});ctx.close()
 # The packaged single HTML must run with all network disabled.
 ctx=browser.new_context(offline=True,viewport={'width':390,'height':844});p=ctx.new_page()
 p.goto((S/'downloads/LUCK-v0.3.0-rc.3-embedded/index.html').as_uri());p.locator('#welcomeNormal').click();p.get_by_role('button',name='⚔ 전투 준비하기',exact=True).click();p.locator('#nextBtn').click();p.locator('#nextBtn').click()
 assert 'HP 12 → 0' in p.locator('#battleStage').inner_text();assert p.evaluate('LuckGameAudio.snapshot().scene')=='bgm_battle'
 ctx.close();browser.close()
(O/'mobile.json').write_text(json.dumps({'mobile':rows,'offline_html':True},indent=2))
print('PASS 360/390/430 × visual/skip, BGM phase switching, forecast before start, R2 flow and offline HTML')
