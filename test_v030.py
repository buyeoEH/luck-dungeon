"""Fixed-ON UI and observation correctness; no production database traffic."""
import json,unittest
from pathlib import Path
from playwright.sync_api import sync_playwright
from verify_v030 import serve,R,O
class V030Tests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch()
 @classmethod
 def tearDownClass(cls):cls.browser.close();cls.pw.stop()
 def setUp(self):
  self.p=self.browser.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True);self.errors=[];self.p.on('pageerror',lambda e:self.errors.append(str(e)));self.p.route('**/*',serve);self.p.goto('https://luck.test/preview/v0.3.0/');self.p.wait_for_function('!!window.Luck030')
 def tearDown(self):self.assertEqual(self.errors,[]);self.p.screenshot(path=str(O/(self._testMethodName+'.png')));self.p.close()
 def begin(self):self.p.locator('#welcomeVisualModeToggle').uncheck();self.p.locator('#welcomeBattleMotionSkipToggle').check();self.p.locator('#welcomeNormal').click();self.p.get_by_role('button',name='⚔ 전투 준비하기',exact=True).click()
 def test_01_fixed_on_and_private_archive(self):
  self.assertEqual(self.p.locator('#persistToggle,#welcomePersistToggle').count(),0);self.assertIn('항상 ON',self.p.locator('#welcomeOverlay').inner_text());self.begin()
  self.assertTrue(self.p.evaluate('persistentDraw'));self.assertTrue(self.p.evaluate('Luck220.run().settings.persistToggle'));self.assertTrue(self.p.evaluate('Luck030.metadata().persistent_draw'));self.assertFalse(self.p.evaluate('LuckCloud.configured'))
  self.assertEqual(self.p.evaluate('Luck220.db().then(d=>d.name)'),'luck-v030-stage0')
 def test_02_mobile_first_and_next_briefings(self):
  cases=[]
  for width in [360,390,430]:
   for visual in [False,True]:
    for skip in [False,True]:
     self.p.goto('https://luck.test/preview/v0.3.0/');self.p.set_viewport_size({'width':width,'height':844});self.p.locator('#welcomeVisualModeToggle').set_checked(visual);self.p.locator('#welcomeBattleMotionSkipToggle').set_checked(skip);self.p.locator('#welcomeNormal').click()
     self.assertIn('약한 슬라임',self.p.locator('#modalContent').inner_text());self.p.get_by_role('button',name='⚔ 전투 준비하기',exact=True).click();self.assertEqual(self.p.evaluate('stats.cardsDrawn'),5)
     for _ in range(3):self.p.locator('#nextBtn').click()
     if not skip:self.p.locator('#close').click()
     self.assertIn('ROUND 2 시작',self.p.locator('#modalTitle').inner_text());self.p.get_by_role('button',name='⚔ 전투 준비하기',exact=True).click();self.assertEqual(self.p.evaluate('stats.cardsDrawn'),10);self.assertTrue(self.p.evaluate('persistentDraw'));self.assertLessEqual(self.p.evaluate('document.documentElement.scrollWidth'),width+1)
     cases.append({'width':width,'visual':visual,'skip_motion':skip,'persistent_draw':True})
  (O/'mobile-on-matrix.json').write_text(json.dumps(cases,indent=2))
 def test_03_post_debuff_gauge_observation(self):
  self.begin();m=self.p.evaluate("()=>{phase='battle';hand=[];linkComboAttack=20;enemies=[{name:'봉인 시험',hp:1000,debuffZone:1,d:{k:'combo',p:5,baseP:5,pct:false}}];battle();return Luck030.records().find(x=>x.type==='battle_metrics').payload;}")
  self.assertEqual(m['link_gauge_before_debuff'],20);self.assertEqual(m['link_gauge_after_debuff'],15);self.assertEqual(m['combo_loss'],5)
 def test_04_all_promotion_attack_deltas(self):
  self.begin();data=self.p.evaluate("()=>{const out=[],catalog=[...BASE,...BASIC,...RANDOM_POOL,...PROMOS.map(p=>p.card)];for(const p of PROMOS){phase='shop';deck=[];hand=[];draw=[];graveyard=[];resource=p.cost.res||0;gems=p.cost.gem||0;for(const [id,n]of Object.entries(p.from))for(let i=0;i<n;i++)deck.push(cp(catalog.find(c=>c.id===id)));const a=deckAtk();promote(p.id);const e=Luck030.records().findLast(x=>x.type==='promotion_metrics');out.push({id:p.id,before:a,after:deckAtk(),event:e.payload});}return out;}")
  self.assertEqual(len(data),37)
  for x in data:self.assertEqual(x['before'],x['event']['deck_attack_before']);self.assertEqual(x['after'],x['event']['deck_attack_after'])
  (O/'promotion-attack-deltas.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
 def test_05_existing_pierce_and_r30_are_not_changed(self):
  self.begin();r=self.p.evaluate("()=>{hand=[{id:'audit',passive:'pierce',pierce:4}];pierce=7;const uncapped=totalPierce();hand=[];pierce=0;round=30;phase='battle';dangerActive=false;enemies=[{name:'R30 기준 판정 시험',hp:10000,debuffZone:1}];battle();return {uncapped,official:!!officialRecord,within:Luck030.records().findLast(x=>x.type==='battle_metrics').payload.within_limits};}")
  self.assertEqual(r,{'uncapped':11,'official':True,'within':False});(O/'unchanged-r30-pierce.json').write_text(json.dumps(r,indent=2))
 def test_06_standalone_offline(self):
  path=R/'_site/downloads/LUCK-v0.3.0-dev.0.html'
  self.assertTrue(path.exists(),'build_v030_standalone.py must run first')
  context=self.browser.new_context(offline=True,viewport={'width':360,'height':844});p=context.new_page()
  try:
   p.goto(path.as_uri());self.assertEqual(p.locator('#persistToggle,#welcomePersistToggle').count(),0);p.locator('#welcomeVisualModeToggle').uncheck();p.locator('#welcomeBattleMotionSkipToggle').check();p.locator('#welcomeNormal').click();self.assertIn('약한 슬라임',p.locator('#modalContent').inner_text());p.get_by_role('button',name='⚔ 전투 준비하기',exact=True).click();self.assertTrue(p.evaluate('persistentDraw'));self.assertEqual(p.evaluate('stats.cardsDrawn'),5)
  finally:context.close()
if __name__=='__main__':unittest.main()
