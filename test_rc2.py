"""RC.2 UI and isolated storage checks; no live network/database writes."""
import json,mimetypes,unittest,hashlib
from pathlib import Path
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parent;S=R/'_site';OUT=R/'rc2-results';OUT.mkdir(exist_ok=True)
def serve(route):
 u=urlsplit(route.request.url)
 if u.hostname!='luck.test':return route.abort()
 f=(S/u.path.lstrip('/')).resolve()
 if f.is_dir():f=f/'index.html'
 if f.is_relative_to(S) and f.is_file():return route.fulfill(path=str(f),content_type=mimetypes.guess_type(str(f))[0] or 'application/octet-stream')
 return route.abort()
class RC2(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch()
 @classmethod
 def tearDownClass(cls):cls.browser.close();cls.pw.stop()
 def page(self,width=390):
  c=self.browser.new_context(viewport={'width':width,'height':844},is_mobile=True,has_touch=True);p=c.new_page();self.addCleanup(c.close);p.route('**/*',serve);p.goto('https://luck.test/preview/v0.3.0/');p.wait_for_function('!!window.Luck220');return p
 def begin(self,p):
  p.locator('#welcomeVisualModeToggle').uncheck();p.locator('#welcomeBattleMotionSkipToggle').check();p.locator('#welcomeNormal').click();p.get_by_role('button',name='⚔ 전투 준비하기',exact=True).click()
 def test_rankings(self):
  p=self.page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)));self.begin(p)
  result=p.evaluate('''async()=>{const version=LUCK_BUILD.version,date=new Date().toISOString(),old=JSON.stringify([{id:'legacy',version:'0.2.19',initials:'OLD',score:999999}]);localStorage.setItem('luck_local_0219_rankings',old);localStorage.setItem('luck_local_v030_rankings',JSON.stringify([{id:'mixed',version:'0.2.20',initials:'MIX',score:999999,created_at:date},{id:'previousRC',version:'0.3.0-rc.1',initials:'RC1',score:999999,created_at:date},null]));const before=(await LuckCloud.ranks()).length;const rejected=await LuckCloud.register({id:'foreign',version:'0.2.20'});await LuckCloud.register({id:'new',version,date,initials:'NEW',score:100,endlessMaxRound:31});const views={};for(const mode of ['all','daily','weekly','monthly','endless'])views[mode]=(await LuckCloud.ranks(mode)).map(r=>({id:r.id,version:r.version}));return {before,rejected,views,old_key_unchanged:localStorage.getItem('luck_local_0219_rankings')===old,configured:LuckCloud.configured};}''')
  self.assertEqual(result['before'],0);self.assertFalse(result['rejected']);self.assertTrue(result['old_key_unchanged']);self.assertFalse(result['configured']);self.assertEqual(errors,[])
  for rows in result['views'].values():self.assertEqual(rows,[{'id':'new','version':'0.3.0-rc.2'}])
  (OUT/'rankings.json').write_text(json.dumps(result,indent=2))
 def test_mobile_tutorial(self):
  rows=[]
  for width in [360,390,430]:
   p=self.page(width);errors=[];p.on('pageerror',lambda e:errors.append(str(e)));self.begin(p);p.locator('#v030FeaturesBtn').click();text=p.locator('#modalContent').inner_text()
   for term in ['v0.3 새 기능','원시 게이지','디버프 후 게이지','20','40','60','80','연계 점수','관통창 강화','3장 중 1장','다음 라운드 상점','첫 성공 구매 1회','최대 6','상점 단계가 끝나면']:self.assertIn(term,text)
   section=p.locator('.v030-features');box=section.bounding_box();self.assertGreaterEqual(box['x'],0);self.assertLessEqual(box['x']+box['width'],width+1);self.assertLessEqual(p.evaluate('document.documentElement.scrollWidth'),width+1)
   p.get_by_role('button',name='📚 신규 카드 · 전체 도감 보기',exact=True).click();catalog=p.locator('#modalContent').inner_text()
   for term in ['증폭 문장','꿰뚫는 정점','연계 관통창','관통창']:self.assertIn(term,catalog)
   p.evaluate('showTutorialReference();showTutorialReference()');self.assertEqual(p.locator('.v030-features').count(),1);self.assertEqual(errors,[]);rows.append({'width':width,'guide':True,'catalog_navigation':True,'no_overflow':True,'errors':errors});p.close()
  (OUT/'mobile-tutorial.json').write_text(json.dumps(rows,indent=2))
 def test_identity_and_protected_sources(self):
  p=self.page();b=p.evaluate('LUCK_BUILD');self.assertEqual(b['version'],'0.3.0-rc.2');self.assertTrue(b['build_id'].startswith('030-rc2-'));self.assertTrue(b['persistent_draw']);self.assertFalse(b['source_tree_dirty']);self.assertFalse(b['record_policy']['server_upload'])
  baseline=R.parent/'rc2-baseline';files=['game.js','v0220-core.js','v030-p1.js','v030_p1_patch.py','p5-rewards.js','p5_rewards_patch.py','v030-reference-ai.js'];protected=[]
  for f in files:self.assertEqual((R/f).read_bytes(),(baseline/f).read_bytes());protected.append(f)
  self.assertEqual((S/'preview/v0.3.0/game.js').read_bytes(),(baseline/'_site/preview/v0.3.0/game.js').read_bytes())
  for f in (baseline/'.github/workflows').glob('*.yml'):self.assertEqual(f.read_bytes(),(R/'.github/workflows'/f.name).read_bytes())
  for f in (baseline/'cloud').glob('*.sql'):self.assertEqual(f.read_bytes(),(R/'cloud'/f.name).read_bytes())
  (OUT/'identity.json').write_text(json.dumps({'build':b,'protected_sources':protected,'runtime_game_identical':True,'workflows_sql_unchanged':True},indent=2))
if __name__=='__main__':unittest.main()
