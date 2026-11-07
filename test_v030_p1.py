"""P1 arithmetic, actual combat timing, instance usage and touch UI."""
import json,unittest
from pathlib import Path
from playwright.sync_api import sync_playwright
from verify_v030 import serve,O
class P1Tests(unittest.TestCase):
 @classmethod
 def setUpClass(c):c.pw=sync_playwright().start();c.browser=c.pw.chromium.launch()
 @classmethod
 def tearDownClass(c):c.browser.close();c.pw.stop()
 def setUp(self):
  self.p=self.browser.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True);self.errors=[];self.p.on('pageerror',lambda e:self.errors.append(str(e)));self.p.route('**/*',serve);self.p.goto('https://luck.test/preview/v0.3.0/');self.p.wait_for_function('!!window.Luck030');self.p.locator('#welcomeVisualModeToggle').uncheck();self.p.locator('#welcomeBattleMotionSkipToggle').check();self.p.locator('#welcomeNormal').click();self.p.get_by_role('button',name='⚔ 전투 준비하기',exact=True).click()
  self.p.evaluate("()=>{hand=[];draw=[];graveyard=[];enemies=[];prot={attack:0,combo:0,resource:0,gem:0,all:0};tempAttack=0;pierce=0;aoeAttack=0;linkComboAttack=0;p1ResetRun();}")
 def tearDown(self):self.assertEqual(self.errors,[]);self.p.close()
 def test_boundaries_cap_and_attack_order(self):
  rows=self.p.evaluate("()=>[0,19,20,39,40,49,50,59,60,69,70,79,80,200].map(g=>{linkComboAttack=g;return {g,m:attackParts()};})")
  for x in rows:
   g=x['g'];m=x['m'];self.assertEqual(m['p1']['gaugeNet'],g);self.assertEqual(m['p1']['pierceBonus'],min(4,g//20));self.assertEqual(m['p1']['attackPct'],min(4,g//20)*5);self.assertEqual(m['pre'],13+g+(13+g)*(min(4,g//20)*5)//100)
  x=self.p.evaluate("()=>{linkComboAttack=80;enemies=[{hp:10000,name:'seal',debuffZone:1,d:{k:'combo',p:5,baseP:5,pct:false}},{hp:10000,name:'cut',debuffZone:1,d:{k:'attack',p:10,baseP:10,pct:false}}];const m=attackParts();return {m,still:enemies.map(e=>e.d.p)};}")
  self.assertEqual(x['m']['p1']['gaugeNet'],75);self.assertEqual(x['m']['p1']['attackPct'],15);self.assertEqual(x['m']['pre'],101);self.assertEqual(x['m']['final'],91);self.assertEqual(x['still'],[5,10])
 def test_lance_order_instances_and_shared_cap(self):
  out=self.p.evaluate("()=>{const lance=RANDOM_POOL.find(c=>c.id==='lance'),seal=RANDOM_POOL.find(c=>c.id==='linkseal');const run=reverse=>{p1ResetRun();linkComboAttack=0;phase='hand';hand=[cp(lance),cp(lance),cp(seal)];deck=[...hand];const a=hand.map(c=>c.id);for(const id of reverse?[a[2],a[1],a[0]]:a)use(hand.findIndex(c=>c.id===id));return {extra:p1Round.gaugeBonus,paid:p1Round.paidLances.size};};const results=[run(false),run(true)];p1Round.step=10;linkComboAttack=80;pierce=7;hand=[{passive:'pierce',pierce:4}];return {results,p:attackParts().p1,total:totalPierce()};}")
  self.assertEqual(out['results'],[{'extra':31,'paid':2}]*2);self.assertEqual(out['p']['pierceBonus'],4);self.assertEqual(out['total'],15)
 def test_card_effects_no_score_inflation_and_peak(self):
  x=self.p.evaluate("()=>{phase='hand';hand=[cp(RANDOM_POOL.find(c=>c.id==='linkseal')),cp(RANDOM_POOL.find(c=>c.id==='linkpeak'))];deck=[...BASE.map(cp),...hand];linkComboAttack=40;use(0);use(0);const a=attackParts();const before=p1Round.gaugeBonus;for(let i=0;i<5;i++)attackParts();return {a,bonus:p1Round.gaugeBonus,before,scoreCombo:stats.comboBonus,used:stats.cardsUsed};}")
  self.assertEqual(x['bonus'],15);self.assertEqual(x['before'],15);self.assertEqual(x['a']['p1']['gaugeNet'],55);self.assertEqual(x['a']['p1']['peakBonus'],16);self.assertEqual(x['a']['comboRaw'],40);self.assertEqual(x['scoreCombo'],0);self.assertEqual(x['used'],2)
 def test_actual_pierce_frozen_before_debuff_spend(self):
  x=self.p.evaluate("()=>{phase='battle';linkComboAttack=40;enemies=[{name:'seal',hp:1,debuffZone:1,d:{k:'combo',p:5,baseP:5,pct:false}},{name:'target',hp:10000,debuffZone:1}];battle();return pendingBattleScene;}")
  self.assertEqual(x['p1']['gaugeNet'],35);self.assertEqual(x['pierce'],1);self.assertEqual(x['p1']['pierceBonus'],1);self.assertEqual(x['p1']['pierceHits'],1)
 def test_rewards_apply_once_next_round_and_reset(self):
  x=self.p.evaluate("()=>{phase='battle';round=1;linkComboAttack=70;enemies=[{name:'target',hp:10000,debuffZone:1}];battle();const s=pendingBattleScene;const before={draw:nextDraw,guard:prot.combo};p1BattleDone(s,s.p1);const twice={draw:nextDraw,guard:prot.combo};draw=[...BASE.map(cp)];hand=[];graveyard=[];const drawn=stats.cardsDrawn;drawStart();const after={draw:stats.cardsDrawn-drawn,guard:prot.combo,gauge:p1Round.gaugeBonus,peak:p1Round.peakUses,step:p1Round.step};p1ResetRun();return {before,twice,after,pending:p1PendingGuard};}")
  self.assertEqual(x['before'],{'draw':1,'guard':0});self.assertEqual(x['twice'],x['before']);self.assertEqual(x['after'],{'draw':6,'guard':1,'gauge':0,'peak':0,'step':20});self.assertEqual(x['pending'],0)
 def test_aoe_cleanup_and_pure_exclusion(self):
  x=self.p.evaluate("()=>{phase='battle';round=1;deck=[{id:'power',atk:60}];hand=[];linkComboAttack=20;enemies=[{name:'one',hp:1,debuffZone:1},{name:'two',hp:1000,debuffZone:1}];battle();return {pure:stats.v0219PureHits,s:pendingBattleScene};}")
  self.assertEqual(x['pure'],0);self.assertEqual(x['s']['p1']['pierceBonus'],1)
  x=self.p.evaluate("()=>{p1ResetRun();phase='battle';round=2;aoeAttack=100;linkComboAttack=80;enemies=[{name:'all',hp:1,debuffZone:1}];battle();return {s:pendingBattleScene,next:nextDraw,guard:p1PendingGuard};}")
  self.assertTrue(x['s']['p1']['no_strike']);self.assertEqual(x['s']['attackFinal'],0);self.assertEqual(x['next'],0);self.assertEqual(x['guard'],0)
 def test_promotion_materials_and_step_no_stacking(self):
  x=self.p.evaluate("()=>{phase='shop';const p=PROMOS.find(p=>p.id==='p_linklance');deck=[cp(RANDOM_POOL.find(c=>c.id==='lance')),cp(RANDOM_POOL.find(c=>c.id==='lance')),cp(RANDOM_POOL.find(c=>c.id==='combo'))];hand=[...deck];resource=8;promote(p.id);const output=deck[0];phase='hand';hand=graveyard.splice(0);use(0);linkComboAttack=30;return {keys:deck.map(cardKey),m:attackParts().p1,pc:totalPierce(),res:resource,used:stats.cardsUsed,grave:graveyard.map(cardKey)};}")
  self.assertEqual(x['keys'],['linklance']);self.assertEqual(x['m']['step'],10);self.assertEqual(x['m']['pierceBonus'],3);self.assertEqual(x['pc'],4);self.assertEqual(x['res'],0);self.assertEqual(x['used'],1)
 def test_mobile_new_cards_and_gauge(self):
  for w in [360,390,430]:
   self.p.set_viewport_size({'width':w,'height':844});self.p.evaluate("()=>{phase='hand';hand=[cp(RANDOM_POOL.find(c=>c.id==='linkseal')),cp(RANDOM_POOL.find(c=>c.id==='linkpeak'))];deck=[...BASE.map(cp),...hand];render();}");self.assertIn('연계 게이지 예상',self.p.locator('.p1-gauge').inner_text());self.p.locator('#hand').get_by_role('button',name='사용',exact=True).first.click();self.assertGreater(self.p.evaluate('p1Round.gaugeBonus'),0);self.assertLessEqual(self.p.evaluate('document.documentElement.scrollWidth'),w+1);self.p.screenshot(path=str(O/f'p1-mobile-{w}.png'))
 def test_official_score_stays_frozen_in_endless(self):
  x=self.p.evaluate("()=>{phase='battle';round=30;linkComboAttack=80;enemies=[{name:'R30',hp:10000,debuffZone:1}];battle();const saved=JSON.stringify(officialRecord),score=officialRecord.score;continueEndless();hand=[];phase='battle';round=31;linkComboAttack=200;enemies=[{name:'R31',hp:10000,debuffZone:1}];battle();return {same:saved===JSON.stringify(officialRecord),score,official:stats.officialScore,combo:stats.comboBonus};}")
  self.assertTrue(x['same']);self.assertEqual(x['score'],x['official']);self.assertEqual(x['combo'],280)
if __name__=='__main__':unittest.main()
