"""Exercise shipped v0.2.18 UI with a deterministic cloud double; never write production."""
import json,mimetypes,unittest
from urllib.parse import urlsplit
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class V0218BrowserTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch(headless=True)
 @classmethod
 def tearDownClass(cls):cls.browser.close();cls.pw.stop()
 def setUp(self):
  self.page=self.browser.new_page(viewport={'width':390,'height':844});self.errors=[];self.manual={};self.ranks={};self.fail=False
  self.page.on('pageerror',lambda e:self.errors.append(str(e)))
  def serve(route):
   u=urlsplit(route.request.url);r=route.request
   if u.hostname=='xkmfjutncwblfebgdmar.supabase.co':
    self.assertNotEqual(r.headers.get('authorization'),'Bearer sb_publishable_I3zZMdrOGn5j1wRi4JKlnA_dvtm8PGK')
    if self.fail:return route.fulfill(status=503,json={})
    if u.path=='/auth/v1/signup':return route.fulfill(json={'access_token':'test-session','refresh_token':'test-refresh','expires_in':3600,'user':{'id':'00000000-0000-0000-0000-000000000001'}})
    table=u.path.rsplit('/',1)[-1];data=self.manual if table=='manual_runs' else self.ranks
    if r.method=='POST':
     for row in r.post_data_json:data[row.get('id') or row['run_id']]=row
     return route.fulfill(status=201,body='')
    return route.fulfill(json=[] if table=='autolab_batches' else list(data.values()))
   file=(ROOT/(u.path.lstrip('/') or 'index.html')).resolve()
   if u.hostname=='luck.test' and file.is_relative_to(ROOT) and file.is_file():return route.fulfill(path=str(file),content_type=mimetypes.guess_type(str(file))[0] or 'text/plain')
   route.abort()
  self.page.route('**/*',serve);self.page.goto('https://luck.test/');self.page.wait_for_function('!!window.LuckRanks && !!window.AutoLab')
 def tearDown(self):
  out=ROOT/'results-ui';out.mkdir(exist_ok=True);self.page.screenshot(path=str(out/(self._testMethodName+'.png')),full_page=True)
  self.assertEqual(self.errors,[]);self.page.close()
 def begin(self):
  self.page.locator('#welcomeVisualModeToggle').uncheck();self.page.locator('#welcomeBattleMotionSkipToggle').check();self.page.locator('#welcomeNormal').click()
 def end(self):
  self.page.evaluate("phase='battle';round=11;enemies=[{name:'test',hp:999,boss:false,debuffZone:1}];gameOver()")
 def test_start_and_mobile_assets(self):
  self.assertEqual(self.page.locator('[data-rank]').count(),5)
  self.assertFalse(self.page.locator('#welcomeBgmToggle').is_checked());self.assertTrue(self.page.locator('#welcomeSfxToggle').is_checked())
  self.begin();self.assertEqual(self.page.evaluate('phase'),'hand');self.assertTrue(self.page.evaluate('luckAvatarLocked'))
  self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),400)
  self.page.wait_for_function("Array.from(document.images).filter(i=>i.src && !i.src.startsWith('data:')).every(i=>i.complete&&i.naturalWidth>0)")
  out=ROOT/'results-ui';out.mkdir(exist_ok=True);self.page.screenshot(path=str(out/'v0218-mobile.png'),full_page=True)
 def test_initials_public_registration_and_online_records(self):
  self.begin();self.end();self.page.get_by_text('🏆 이니셜 등록',exact=True).click()
  self.page.locator('#rankInitials').fill('N');self.page.locator('#rankSubmit').click();self.assertIn('2~6',self.page.locator('#rankError').inner_text())
  self.page.locator('#rankInitials').fill('ner');self.page.locator('#rankSubmit').click();self.page.get_by_text('🏆 온라인 등록 완료',exact=True).wait_for()
  self.assertEqual(len(self.manual),1);self.assertEqual(len(self.ranks),1);r=list(self.ranks.values())[0];self.assertEqual(r['initials'],'NER');self.assertEqual(r['version'],'0.2.18');self.assertNotIn('user_id',r)
  self.page.locator('#rankView').click();self.page.get_by_text('1위 · NER',exact=True).wait_for();self.assertIn('NER',self.page.locator('#onlineRanksContent').inner_text());self.page.locator('#close').click()
  self.page.locator('#cloudRecordsBtn').click();self.page.get_by_text('내 온라인 플레이 기록 1건',exact=True).wait_for()
 def test_failed_upload_retry(self):
  self.begin();self.fail=True;self.end();self.page.get_by_text('🏆 이니셜 등록',exact=True).click();self.page.locator('#rankInitials').fill('재시도');self.page.locator('#rankSubmit').click()
  self.page.wait_for_function("document.getElementById('rankError').textContent.includes('온라인 등록 실패')")
  self.assertEqual(len(self.ranks),0);self.fail=False;self.page.locator('#rankSubmit').click();self.page.get_by_text('🏆 온라인 등록 완료',exact=True).wait_for();self.assertEqual(len(self.ranks),1)
 def test_official_then_endless_updates_one_record(self):
  self.begin();self.page.evaluate("round=30;freezeOfficialRecord('nextRound')");self.page.get_by_text('🏆 이니셜 등록',exact=True).click();self.page.locator('#rankInitials').fill('END');self.page.locator('#rankSubmit').click();self.page.get_by_text('♾ 무한모드 계속',exact=True).wait_for();self.page.get_by_text('♾ 무한모드 계속',exact=True).click()
  score=self.page.evaluate('officialRecord.score');self.page.evaluate("round=40;phase='battle';gameOver()");self.page.wait_for_function("JSON.parse(localStorage.getItem('luck_cloud_queue_v1')||'[]').length===0")
  self.assertEqual(len(self.manual),1);self.assertEqual(len(self.ranks),1);r=list(self.ranks.values())[0];self.assertEqual(r['score'],score);self.assertEqual(r['endless_max_round'],40)
 def test_six_new_promotions_and_stone(self):
  self.begin()
  for ident in ['bountygold','royalgold','skylance','annihilation','fateblade','luckminer']:
   result=self.page.evaluate("""id=>{const p=PROMOS.find(p=>p.card.id===id);phase='shop';deck=[];hand=[];draw=[];graveyard=[];for(const[k,n]of Object.entries(p.from)){const c=[...BASE,...BASIC,...RANDOM_POOL,...PROMOS.map(q=>q.card)].find(c=>c.id===k);for(let i=0;i<n;i++)deck.push(cp(c));}resource=p.cost.res||0;gems=p.cost.gem||0;promote(p.id);return {deck:deck.map(c=>c.baseId),res:resource,gems};}""",ident)
   self.assertEqual(result,{'deck':[ident],'res':0,'gems':0})
  r=self.page.evaluate("""()=>{start();const stone=cp(PROMOTION_STONE);deck.push(stone);hand=[stone];phase='hand';const row=stoneRecipes()[0];choosePromotionMaterial(stone);showPromotionStoneOptions(row.promo.id);resolvePromotionStone(row.missing[0]);return {used:stats.promotionStonesUsed,found:deck.some(c=>c.baseId===row.missing[0])};}""")
  self.assertEqual(r,{'used':1,'found':True})
if __name__=='__main__':unittest.main()
