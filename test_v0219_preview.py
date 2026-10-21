"""Real mobile browser checks for isolated experimental build, with no database access."""
import json,mimetypes,unittest
from pathlib import Path
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent
SITE=ROOT/'_site'

class PreviewTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch(headless=True)
 @classmethod
 def tearDownClass(cls):cls.browser.close();cls.pw.stop()
 def setUp(self):
  self.page=self.browser.new_page(viewport={'width':390,'height':844});self.errors=[];self.external=[]
  self.page.on('pageerror',lambda e:self.errors.append(str(e)))
  self.page.add_init_script("localStorage.setItem('luck_dungeon_manual_runs_v0216','[{\"id\":\"stable-sentinel\"}]');localStorage.setItem('luck_cloud_queue_v1','stable-queue-sentinel');")
  def serve(route):
   u=urlsplit(route.request.url)
   if u.hostname!='luck.test':self.external.append(route.request.url);return route.abort()
   file=(SITE/(u.path.lstrip('/') or 'index.html')).resolve()
   if file.is_dir():file=file/'index.html'
   if file.is_relative_to(SITE) and file.is_file():return route.fulfill(path=str(file),content_type=mimetypes.guess_type(str(file))[0] or 'text/plain')
   route.abort()
  self.page.route('**/*',serve);self.page.goto('https://luck.test/preview/v0.2.19/');self.page.locator('[data-adventurer-id="knight"][aria-pressed="true"]').wait_for()
 def wait(self,expression):
  # Keep the shipped CSP active: Playwright's polling uses eval, ordinary evaluate does not.
  for _ in range(100):
   if self.page.evaluate(expression):return
   self.page.wait_for_timeout(50)
  self.fail('Condition did not become true: '+expression+'; broken images='+json.dumps(self.page.evaluate("Array.from(document.images).filter(i=>i.src&&(!i.complete||!i.naturalWidth)).map(i=>({src:i.getAttribute('src').slice(0,180),alt:i.alt,complete:i.complete}))"),ensure_ascii=False))
 def tearDown(self):
  out=ROOT/'results-v0219';out.mkdir(exist_ok=True)
  self.page.screenshot(path=str(out/(self._testMethodName+'.png')),full_page=True)
  self.assertEqual(self.external,[]);self.assertEqual(self.errors,[]);self.page.close()
 def begin(self):
  self.page.locator('#welcomeVisualModeToggle').uncheck();self.page.locator('#welcomeBattleMotionSkipToggle').check();self.page.locator('#welcomeNormal').click()
 def test_mobile_start_shop_battle(self):
  self.assertIn('v0.2.19',self.page.title());self.assertEqual(self.page.locator('[data-adventurer-id]').count(),5)
  self.page.locator('[data-adventurer-id="mage"]').click();self.assertEqual(self.page.locator('[data-adventurer-id="mage"]').get_attribute('aria-pressed'),'true')
  self.begin();self.assertEqual(self.page.evaluate('phase'),'hand');self.assertGreater(self.page.locator('.luck-info-toggle').count(),0)
  self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),400)
  self.page.locator('#nextBtn').click();self.assertEqual(self.page.evaluate('phase'),'shop')
  self.page.locator('#nextBtn').click();self.assertEqual(self.page.evaluate('phase'),'battle')
  self.page.locator('#nextBtn').click();self.assertNotEqual(self.page.evaluate('phase'),'battle')
  # Decode offscreen/hidden lazy card icons too, without changing the shipped UI.
  self.page.locator('img[loading="lazy"]').evaluate_all("imgs=>imgs.forEach(i=>i.loading='eager')")
  self.wait("Array.from(document.images).filter(i=>i.src).every(i=>i.complete&&i.naturalWidth>0)")
 def test_records_and_rankings_are_separate(self):
  self.begin();self.page.evaluate("round=30;freezeOfficialRecord('nextRound')")
  self.page.get_by_text('🏆 이니셜 등록',exact=True).click();self.assertIn('최종 클리어',self.page.locator('#modalContent').inner_text())
  self.page.locator('#rankInitials').fill('TEST');self.page.locator('#rankSubmit').click()
  self.wait("JSON.parse(localStorage.getItem('luck_local_0219_rankings')||'[]').length===1")
  row=self.page.evaluate('LuckHistory.read()[0]');self.assertEqual(row['version'],'0.2.19');self.assertEqual(row['outcome'],'clear')
  self.assertEqual(self.page.evaluate("JSON.parse(localStorage.getItem('luck_dungeon_manual_runs_v0216'))[0].id"),'stable-sentinel')
  self.assertEqual(self.page.evaluate("localStorage.getItem('luck_cloud_queue_v1')"),'stable-queue-sentinel')
  self.page.evaluate('LuckRanks.show()')
  self.page.locator('#onlineRanksContent').get_by_text('1위 · TEST',exact=True).wait_for()
  self.assertIn('클리어',self.page.locator('#onlineRanksContent').inner_text())
 def test_new_promotions_and_reduced_prices(self):
  self.begin()
  self.assertEqual(self.page.evaluate("Object.fromEntries([...BASIC,...RANDOM_POOL].filter(c=>['thief','mage','pike'].includes(c.id)).map(c=>[c.id,c.price]))"),{'thief':14,'mage':14,'pike':13})
  for ident in ['raiderking','wisdomsword','stararmor','masterlink','lucklink','luckdraw','luckguard','luckforge']:
   result=self.page.evaluate("""id=>{const p=PROMOS.find(p=>p.card.id===id);phase='shop';deck=[];hand=[];draw=[];graveyard=[];for(const[k,n]of Object.entries(p.from)){const c=[...BASE,...BASIC,...RANDOM_POOL,...PROMOS.map(q=>q.card)].find(c=>c.id===k);for(let i=0;i<n;i++)deck.push(cp(c));}resource=p.cost.res||0;gems=p.cost.gem||0;promote(p.id);return {deck:deck.map(c=>c.baseId),res:resource,gems};}""",ident)
   self.assertEqual(result,{'deck':[ident],'res':0,'gems':0})
 def test_pure_attack_extra_strikes(self):
  self.begin()
  result=self.page.evaluate("""()=>{round=1;phase='battle';deck=[{id:'qa-pure',baseId:'qa-pure',name:'시험 검',type:'attack',atk:100}];hand=[];draw=[];graveyard=[];tempAttack=0;pierce=0;linkComboAttack=0;roundActionHistory=[];roundLinkDone={};enemies=Array.from({length:4},(_,i)=>({name:'시험 적 '+i,hp:10,boss:false,debuffZone:1}));battle();return {hits:stats.v0219PureHits,damage:stats.v0219PureDamage,killed:stats.enemiesKilled,aoe:stats.aoeDamage,pierce:stats.pierceDamage};}""")
  self.assertGreaterEqual(result['hits'],1);self.assertGreater(result['damage'],0);self.assertGreaterEqual(result['killed'],2)
  self.assertEqual(result['aoe'],0);self.assertEqual(result['pierce'],0)
 def test_six_seeded_bot_profiles(self):
  for profile in ['random','economy','attack','aoe','link','survival']:
   self.page.evaluate('AutoLab.begin(219001)');r=self.page.evaluate('p=>AutoLab.run(p)',profile)
   self.assertTrue(r['finished'],profile);self.assertEqual(r['errors'],[],profile)
   self.assertTrue(any(e['type']=='shop_snapshot' for e in r['events']),profile)
   (ROOT/'results-v0219').mkdir(exist_ok=True)
   (ROOT/'results-v0219'/('bot-'+profile+'.json')).write_text(json.dumps(r,ensure_ascii=False))
 def test_original_root_runtime_is_preserved(self):
  report=json.loads((ROOT/'preview-build-report.json').read_text());self.assertGreater(report['stable_files_unchanged'],60)
  self.assertEqual((SITE/'index.html').read_bytes(),(ROOT/'index.html').read_bytes())
  self.assertEqual((SITE/'game.js').read_bytes(),(ROOT/'game.js').read_bytes())
  self.assertIn("connect-src 'none'",(SITE/'preview/v0.2.19/index.html').read_text())
  self.assertNotIn('supabase.co',(SITE/'preview/v0.2.19/cloud/cloud.js').read_text())

if __name__=='__main__':unittest.main()
