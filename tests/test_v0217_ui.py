"""0.2.17 UI / early shop / luck promotion / local ranking smoke tests.
Run with: python -m unittest discover -s tests -p 'test_v0217_ui.py' -v
"""
import mimetypes
from urllib.parse import urlsplit
import unittest
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]

class V0217BrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()

    def setUp(self):
        self.page = self.browser.new_page(viewport={"width": 390, "height": 844})
        self.errors = []
        self.page.on("pageerror", lambda exc: self.errors.append(str(exc)))
        # Exercise the shipped HTML and script order; never contact Supabase.
        def serve(route):
            url = urlsplit(route.request.url)
            target = (ROOT / (url.path.lstrip('/') or 'index.html')).resolve()
            if url.hostname == 'luck.test' and target.is_relative_to(ROOT) and target.is_file():
                route.fulfill(path=str(target), content_type=mimetypes.guess_type(str(target))[0] or 'text/plain')
            else:
                route.abort()
        self.page.route('**/*', serve)
        self.page.goto('https://luck.test/', wait_until='load')
        self.page.wait_for_function('!!window.LuckRanks && !!window.AutoLab')

    def tearDown(self):
        self.assertEqual(self.errors, [])
        self.page.close()

    def begin(self):
        self.page.evaluate("""() => {document.getElementById('welcomeOverlay').classList.add('hide');document.getElementById('visualModeToggle').checked=false;start();}""")

    def test_price_and_random_pool(self):
        d = self.page.evaluate("""() => ({first:BASIC[0],second:BASIC[1],spark:RANDOM_POOL.find(c=>c.id==='spark'),randSize:RANDOM_SHOP_SIZE})""")
        self.assertEqual((d['first']['id'],d['first']['price']), ('hand',4))
        self.assertEqual((d['second']['id'],d['second']['price']), ('sam',5))
        self.assertEqual(d['spark']['price'],4)
        self.assertEqual(d['randSize'],8)
        self.begin()
        self.page.evaluate("phase='shop';resource=4;render()")
        self.page.evaluate("buyBasic('hand')")
        self.assertEqual(self.page.evaluate('resource'),0)

    def test_debuff_and_catalog_unique_cards(self):
        self.begin()
        self.page.locator('#debuffQuickBtn').click()
        self.assertIn('콤보',self.page.locator('#modalContent').inner_text())
        self.page.locator('#close').click()
        self.page.locator('#cardTableBtn').click()
        self.assertEqual(self.page.locator('button.catalog-card').count(),self.page.evaluate("""() => new Set([...BASE,...BASIC,...RANDOM_POOL,...PROMOS.map(p=>p.card),PROMOTION_STONE,...LEGEND_POOL,...CURSE_POOL].map(c=>c.baseId||c.id)).size"""))
        text=self.page.locator('#modalContent').inner_text()
        for category in ['기본 카드','랜덤 카드','승급(자원)','승급(공격)','승급(행동)','승급(운빨)']:
            self.assertIn(category,text)

    def test_luck_promotion_chain(self):
        self.begin()
        d=self.page.evaluate("""() => {phase='shop';resource=5;deck=[cp(RANDOM_POOL.find(c=>c.id==='coin')),cp(RANDOM_POOL.find(c=>c.id==='dice'))];draw=[];hand=[];graveyard=[];promote('p_luck_charm');const first=deck.map(c=>c.baseId);deck.push(cp(RANDOM_POOL.find(c=>c.id==='box')));resource=8;gems=1;promote('p_luck_fate');return {first,after:deck.map(c=>c.baseId),cost:resource,gem:gems,upgrades:stats.promotions}}""")
        self.assertEqual(d['first'],['luckcharm'])
        self.assertEqual(d['after'],['luckfate'])
        self.assertEqual((d['cost'],d['gem'],d['upgrades']),(0,0,2))

    def test_local_ranking_initials(self):
        self.assertEqual(self.page.locator('#welcomeRanks button[data-rank]').count(),5)
        self.begin()
        self.page.evaluate("phase='battle';round=11;enemies=[{name:'적',hp:400,boss:false,debuffZone:1}];gameOver()")
        self.page.get_by_text('🏆 이니셜 등록',exact=True).click()
        self.page.locator('#rankInitials').fill('NER')
        self.page.locator('#rankSubmit').click()
        self.assertEqual(self.page.evaluate('LuckHistory.read()[0].initials'),'NER')
        self.page.evaluate('LuckRanks.render()')
        self.assertIn('NER',self.page.locator('#welcomeRanks').inner_text())

    def test_old_records_and_official_endless_score(self):
        self.page.evaluate("""() => localStorage.setItem('luck_dungeon_manual_runs_v0216', JSON.stringify([{id:'legacy',version:'0.2.16',initials:'OLD',score:123,date:new Date().toISOString()}]))""")
        self.begin()
        self.page.evaluate("round=30;freezeOfficialRecord('nextRound')")
        self.page.get_by_text('🏆 이니셜 등록',exact=True).click()
        self.page.locator('#rankInitials').fill('N')
        self.page.locator('#rankSubmit').click()
        self.assertIn('2~6',self.page.locator('#rankError').inner_text())
        self.page.locator('#rankInitials').fill('NER')
        self.page.locator('#rankSubmit').click()
        self.page.get_by_text('♾ 무한모드 계속',exact=True).click()
        before=self.page.evaluate('officialRecord.score')
        self.page.evaluate("round=40;phase='battle';gameOver()")
        records=self.page.evaluate('LuckHistory.read()')
        self.assertEqual(len(records),2)
        self.assertEqual(records[0]['score'],before)
        self.assertEqual(records[0]['endlessMaxRound'],40)
        self.assertEqual(records[0]['initials'],'NER')
        self.assertEqual(records[1]['id'],'legacy')
        self.assertEqual(records[1]['score'],123)

    def test_debuff_preview_and_actual_gem_theft(self):
        self.begin()
        self.page.evaluate("""() => {phase='battle';gems=10;prot.gem=1;activeDebuffZone=1;enemies=[{id:'test-thief',name:'보석사냥꾼',hp:999,boss:false,debuffZone:1,steal:{chance:1,pct:.2,min:2}}];render();}""")
        before=self.page.evaluate('JSON.stringify({prot,debuffReport})')
        self.page.locator('#debuffQuickBtn').click()
        self.assertEqual(self.page.evaluate('JSON.stringify({prot,debuffReport})'),before)
        self.page.locator('#close').click()
        self.page.evaluate("battle()")
        self.assertEqual(self.page.evaluate('debuffReport.blocked.gem'),1)
        self.assertEqual(self.page.evaluate('debuffReport.lost.gem'),1)
        self.assertEqual(self.page.evaluate('gems'),9)
        self.page.locator('#debuffQuickBtn').click()
        self.assertIn('누적 방어 1',self.page.locator('#modalContent').inner_text())

    def test_desktop_and_mobile_views(self):
        out=ROOT/'results-ui';out.mkdir(exist_ok=True)
        self.page.screenshot(path=str(out/'welcome-mobile.png'))
        self.assertTrue(self.page.locator('#welcomeRanks').is_visible())
        self.begin()
        self.page.evaluate("phase='shop';resource=20;render()")
        self.assertTrue(self.page.locator('#debuffQuickBtn').is_visible())
        for width,height,label in [(390,844,'mobile'),(1440,1000,'desktop')]:
            self.page.set_viewport_size({'width':width,'height':height})
            self.page.screenshot(path=str(out/('shop-'+label+'.png')))
            self.assertTrue(self.page.locator('#basicShop .shop-origin').count()>0)
            self.page.locator('#debuffQuickBtn').click()
            self.assertTrue(self.page.locator('#modalContent .debuff-detail-row').count()==4)
            self.page.screenshot(path=str(out/('debuff-'+label+'.png')))
            self.page.locator('#close').click()

if __name__=='__main__':unittest.main()

