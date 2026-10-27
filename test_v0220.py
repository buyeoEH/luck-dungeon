"""Real Chromium regression tests. Stable data are sentinels; tests never delete them."""
import hashlib,json,mimetypes,os,unittest,urllib.request,urllib.error
from pathlib import Path
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parent;S=R/'_site';OUT=R/'results-v0220';OUT.mkdir(exist_ok=True)
class StabilityTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch()
 @classmethod
 def tearDownClass(cls):cls.browser.close();cls.pw.stop()
 def setUp(self):
  self.page=self.browser.new_page(viewport={'width':390,'height':844},has_touch=True,is_mobile=True);self.errors=[]
  self.page.on('pageerror',lambda e:self.errors.append(str(e)))
  def serve(route):
   u=urlsplit(route.request.url)
   if u.hostname!='luck.test':
    if os.getenv('LIVE_CLOUD')=='1' and u.hostname=='xkmfjutncwblfebgdmar.supabase.co':
     # Use the runtime's configured HTTP proxy, which urllib honors automatically.
     req=urllib.request.Request(route.request.url,data=route.request.post_data_buffer,method=route.request.method,headers=route.request.headers)
     try:r=urllib.request.urlopen(req,timeout=30)
     except urllib.error.HTTPError as e:r=e
     return route.fulfill(status=r.status,headers={k:v for k,v in r.headers.items() if k.lower() not in ['content-length','content-encoding','transfer-encoding']},body=r.read())
    return route.abort()
   f=(S/u.path.lstrip('/')).resolve()
   if f.is_dir():f=f/'index.html'
   if f.is_relative_to(S) and f.is_file():return route.fulfill(path=str(f),content_type=mimetypes.guess_type(str(f))[0] or 'application/octet-stream')
   route.abort()
  self.page.route('**/*',serve);self.page.goto('https://luck.test/preview/v0.2.20/')
  self.page.locator('[data-adventurer-id="knight"]').wait_for()
  self.page.evaluate("localStorage.setItem('luck_dungeon_manual_runs_v0219_preview','stable-sentinel');localStorage.setItem('luck_cloud_queue_v1','stable-queue')")
 def begin(self):
  self.page.locator('#welcomeVisualModeToggle').uncheck();self.page.locator('#welcomeBattleMotionSkipToggle').check();self.page.locator('#welcomeNormal').click()
 def tearDown(self):
  self.page.screenshot(path=str(OUT/(self._testMethodName+'.png')))
  self.assertEqual(self.errors,[])
  self.assertEqual(self.page.evaluate("localStorage.getItem('luck_dungeon_manual_runs_v0219_preview')"),'stable-sentinel')
  self.assertEqual(self.page.evaluate("localStorage.getItem('luck_cloud_queue_v1')"),'stable-queue')
  self.page.close()
 def test_01_all_oneuse_instances_and_legend(self):
  self.begin()
  result=self.page.evaluate('''()=>{const templates=[...BASE,...BASIC,...RANDOM_POOL,...PROMOS.map(p=>p.card),...LEGEND_POOL].filter(c=>c.type==='oneuse'),out=[];for(const template of templates){phase='hand';const a=cp(template),b=cp(template);deck=[a,b];hand=[a];draw=[b];graveyard=[];const before=stats.cardsRemoved,used=stats.cardsUsed,count=oneuseUsed;use(0);const consumed=Luck220.events().filter(e=>e.event_type==='card_consumed').at(-1);out.push({id:template.id,consumed,remaining:deck.map(c=>c.id),usedDelta:stats.cardsUsed-used,countDelta:oneuseUsed-count,removedDelta:stats.cardsRemoved-before,usedId:a.id,otherId:b.id});}return out;}''')
  self.assertGreaterEqual(len(result),4)
  for r in result:
   self.assertEqual(r['remaining'],[r['otherId']],r['id']);self.assertEqual(r['usedDelta'],1);self.assertEqual(r['countDelta'],1);self.assertEqual(r['removedDelta'],0)
   self.assertFalse(any(r['consumed']['payload']['remaining'].values()))
  (OUT/'oneuse.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
 def test_02_score_actual_post_aoe_and_endless_immutable(self):
  self.begin()
  result=self.page.evaluate('''()=>{round=30;phase='battle';deck=[cp({id:'qa',name:'시험 공격',type:'attack',atk:100})];hand=[];draw=[];graveyard=[];aoeAttack=10;tempAttack=0;bonusAtk=0;enemies=[{name:'시험 약화 적',hp:5,debuffZone:1,attackFlat:30},{name:'시험 생존 적',hp:300,debuffZone:1}];battle();const scene=pendingBattleScene,score=officialRecord.score,detail=Luck220.run().terminal;endlessMode=true;round=40;stats.enemiesKilled+=100;stats.maxAttack=999;return {scene,max:detail.stats.maxAttack,score,sum:detail.score_breakdown.reduce((n,x)=>n+x.points,0),frozen:officialRecord.score,frozenSum:officialRecord.score_breakdown.reduce((n,x)=>n+x[1],0),version:detail.score_ruleset_version};}''')
  self.assertEqual(result['score'],result['sum']);self.assertEqual(result['score'],result['frozen']);self.assertEqual(result['score'],result['frozenSum']);self.assertEqual(result['max'],result['scene']['attackFinal']);self.assertEqual(result['max'],100)
  (OUT/'score.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
 def test_03_shop_stock_boundaries_and_restock(self):
  self.begin()
  results=self.page.evaluate('''()=>{let out=[];for(const remain of [0,1,2,3]){randomShop=RANDOM_POOL.slice(0,3).map(c=>({...c,limit:remain}));buyCount={};randomShopSeen=new Set(randomShop.map(c=>c.id));bossReward();const before=randomShop.map(c=>({id:c.id,left:c.limit}));reward(0);const changed=randomShop.filter((c,i)=>c.id!==before[i].id).length;out.push({remain,changed,stocks:randomShop.map(c=>c.limit-(buyCount[c.id]||0))});}randomShop=RANDOM_POOL.slice(0,1).map(c=>({...c,limit:0}));buyCount={};randomShopSeen=new Set(randomShop.map(c=>c.id));bossReward();reward(1);const added=randomShop[0].limit-(buyCount[randomShop[0].id]||0);bossReward();reward(0);out.push({restocked:added,after:randomShop[0].limit-(buyCount[randomShop[0].id]||0)});return out;}''')
  for r in results[:-1]:self.assertEqual(r['changed'],0 if r['remain']==0 else 3);self.assertTrue(all(n==r['remain'] for n in r['stocks']))
  self.assertEqual(results[-1],{'restocked':1,'after':1})
  # Exactly one/two available slots and the no-reappearance rule.
  for count in [1,2]:
   r=self.page.evaluate('''n=>{randomShop=RANDOM_POOL.slice(0,3).map((c,i)=>({...c,limit:i<n?1:0}));buyCount={};randomShopSeen=new Set(randomShop.map(c=>c.id));const old=randomShop.map(c=>c.id);bossReward();reward(0);return randomShop.filter((c,i)=>c.id!==old[i]).length;}''',count);self.assertEqual(r,count)
  (OUT/'shop.json').write_text(json.dumps(results,indent=2))
 def test_04_every_promotion_recipe_and_link_type(self):
  self.begin()
  result=self.page.evaluate('''()=>{const results=[];for(const p of PROMOS){phase='shop';deck=[];hand=[];draw=[];graveyard=[];resource=p.cost.res||0;gems=p.cost.gem||0;for(const [id,n]of Object.entries(p.from)){const c=[...BASE,...BASIC,...RANDOM_POOL,...PROMOS.map(q=>q.card)].find(c=>c.id===id);for(let i=0;i<n;i++)deck.push(cp(c));}const n=deck.length;promote(p.id);results.push({id:p.id,card:p.card.id,count:deck.length,key:cardKey(deck[0]),compression:n-deck.length,res:resource,gems,tier:p.tier||1,cost:p.cost,from:p.from,effects:p.card});}const links=[];for(const l of [...ACTION_LINKS,...TACTICAL_LINKS]){roundLinkDone={};linkComboAttack=0;const id=(l.seq?'a_':'t_')+l.id;triggerLink(id,l.name,l.bonus,l.text,[]);const first=linkComboAttack;triggerLink(id,l.name,l.bonus,l.text,[]);links.push({id,first,second:linkComboAttack,definition:l});}return {results,links};}''')
  for r in result['results']:self.assertEqual(r['count'],1);self.assertEqual(r['key'],r['card']);self.assertEqual(r['res'],0);self.assertEqual(r['gems'],0)
  for r in result['links']:self.assertEqual(r['first'],r['second'])
  (OUT/'promotion-link-catalog.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
 def test_05_mobile_widths_and_progress(self):
  for width in [360,390,430]:
   self.page.set_viewport_size({'width':width,'height':844});self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),width+1)
  self.begin();self.page.locator('#nextBtn').click();self.assertEqual(self.page.evaluate('phase'),'shop');self.page.locator('#nextBtn').click();self.assertEqual(self.page.evaluate('phase'),'battle');self.page.locator('#nextBtn').click();self.assertEqual(self.page.evaluate('phase'),'hand')
  self.page.locator('#deckBtn').click();self.assertTrue(self.page.locator('#modal').is_visible())
 def test_06_local_event_persistence_and_version(self):
  self.begin();self.page.evaluate('Luck220.emit("qa_persist",{value:1})');self.page.evaluate('Luck220.persist()')
  s=self.page.evaluate('Luck220.get(Luck220.runId())');self.assertEqual(s['version'],'0.2.20');self.assertEqual([e['seq'] for e in s['events']],list(range(1,s['seq']+1)));self.assertEqual(len(s['initial_shop']),8)
  self.page.evaluate('LuckHistory.view()');self.assertIn('진행 중 기록',self.page.locator('#modalContent').inner_text());self.assertIn('BUILD_ID=',self.page.evaluate('LuckHistory.exportText(Luck220.snapshot())'))
 def test_07_damage_allocation_sums(self):
  self.begin();self.page.evaluate('''phase='battle';deck=[cp({id:'qa',name:'시험',type:'attack',atk:100})];hand=[];draw=[];graveyard=[];enemies=[{name:'적',hp:200,debuffZone:1}];battle()''')
  self.assertEqual(self.page.evaluate("Luck220.events().find(e=>e.event_type==='battle_resolved').round"),1)
  result=self.page.evaluate("Luck220.events().find(e=>e.event_type==='battle_resolved').payload")
  self.assertEqual(sum(x['damage'] for x in result['allocations']),result['actual_damage'])
 def test_08_stone_consumption_and_all_link_conditions(self):
  self.begin()
  r=self.page.evaluate('''()=>{phase='hand';const c=cp(PROMOTION_STONE);deck=[c];hand=[c];draw=[];graveyard=[];const before=stats.cardsRemoved;commitChoiceCard(c.id,true);const stone={removed:stats.cardsRemoved-before,piles:[deck,hand,draw,graveyard].some(a=>a.some(x=>x.id===c.id)),consumed:Luck220.events().some(e=>e.event_type==='card_consumed'&&e.payload.instance_id===c.id)};deck=[];hand=[];const links=[];for(const l of ACTION_LINKS){roundLinkDone={};roundActionHistory=[];linkComboAttack=0;for(const tag of l.seq)registerActionLink({mixedTag:tag},[]);links.push({id:'a_'+l.id,ok:!!roundLinkDone['a_'+l.id]});}for(const l of TACTICAL_LINKS){roundLinkDone={};linkComboAttack=0;hand=l.need.map(tag=>tag==='attack'?{id:'q',type:'attack',atk:1}:tag==='luck'?{id:'q',type:'random'}:tag==='draw'?{id:'q',type:'draw',draw:1}:tag==='link'?{id:'combo',type:'attack',linkAmp:1}:tag==='aoe'?{id:'q',type:'aoeAttack'}:{id:'q',type:'pierce'});evaluateTacticalLinks([]);links.push({id:'t_'+l.id,ok:!!roundLinkDone['t_'+l.id]});}return {stone,links};}''')
  self.assertEqual(r['stone'],{'removed':0,'piles':False,'consumed':True})
  self.assertTrue(all(l['ok'] for l in r['links']))
  (OUT/'link-condition-checks.json').write_text(json.dumps(r,ensure_ascii=False,indent=2))
 def test_09_mobile_motion_and_registration_matrix(self):
  matrix=[]
  for width in [360,390,430]:
   for skip in [True,False]:
    self.page.goto('https://luck.test/preview/v0.2.20/');self.page.set_viewport_size({'width':width,'height':844})
    self.page.locator('#welcomeVisualModeToggle').uncheck();self.page.locator('#welcomeBattleMotionSkipToggle').set_checked(skip);self.page.locator('[data-adventurer-id="mage"]').click();self.page.locator('#welcomeNormal').click()
    self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),width+1)
    self.page.locator('#hand button[onclick^="use("]:not([disabled])').first.tap()
    self.assertGreater(self.page.evaluate('stats.cardsUsed'),0)
    self.page.locator('#nextBtn').click();self.page.locator('#nextBtn').click();self.page.locator('#nextBtn').click()
    if not skip:self.page.locator('#close').click()
    self.assertEqual(self.page.evaluate('phase'),'hand')
    self.page.evaluate("LuckCloud.register=async()=>{};round=30;freezeOfficialRecord('nextRound');LuckRanks.openRegistration()")
    self.page.locator('#rankInitials').fill('TEST');self.page.locator('#rankSubmit').click()
    self.assertEqual(self.page.evaluate('LuckHistory.read().find(x=>x.id===Luck220.runId()).initials'),'TEST')
    matrix.append({'width':width,'skip_motion':skip,'status':'passed'})
  (OUT/'mobile-matrix.json').write_text(json.dumps(matrix,indent=2))
 def test_10_standalone_offline(self):
  path=R/'_site/downloads/LUCK-v0.2.20.html'
  if not path.exists():self.skipTest('Run build_v0220_standalone.py for standalone validation')
  context=self.browser.new_context(offline=True,viewport={'width':360,'height':844});page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  try:
   page.goto(path.as_uri());page.locator('#welcomeVisualModeToggle').uncheck();page.locator('#welcomeBattleMotionSkipToggle').check();page.locator('#welcomeNormal').click();self.assertEqual(page.evaluate('phase'),'hand');page.locator('#nextBtn').click();page.locator('#nextBtn').click();page.locator('#nextBtn').click();self.assertEqual(page.evaluate('phase'),'hand');page.evaluate('Luck220.persist()');self.assertEqual(page.evaluate('Luck220.all().then(x=>x.length)'),1);self.assertEqual(errors,[])
  finally:context.close()
 def test_11_mixed_luck_link_results_are_readable(self):
  self.begin()
  rows=self.page.evaluate('''()=>{const out=[],saved=Math.random;try{for(const id of ['luckforge','luckminer','fateblade','lucklink','luckdraw','luckguard'])for(const roll of [.1,.6,.95])for(const visual of [false,true]){phase='hand';enemies=[];dangerActive=false;roundLinkDone={};linkComboAttack=0;tempAttack=0;resource=0;prot={attack:0,resource:0,gem:0,combo:0,all:0};const c=cp(PROMOS.find(p=>p.card.id===id).card);deck=[c];hand=[c];graveyard=[];draw=Array.from({length:6},()=>cp(BASE.find(c=>c.type==='resource')));roundActionHistory=[actionTag(c)==='economy'?'luck':'economy'];$('visualModeToggle').checked=visual;Math.random=()=>roll;const before=stats.cardsUsed;use(0);const line=fullLogs.findLast(s=>s.includes(c.name+' 전용 판정'));out.push({id,roll,visual,line,flash:$('actionFlash').innerText,modal:visual?$('modalContent').innerText:'',resource,tempAttack,link:linkComboAttack,used:stats.cardsUsed-before});$('modal').classList.add('hide');}}finally{Math.random=saved;}return out;}''')
  self.assertEqual(len(rows),36)
  for r in rows:
   for key in ['line','flash','modal']:self.assertNotIn('[object Object]',r[key],r)
   self.assertIn('연계 [',r['line'],r);self.assertGreater(r['link'],0);self.assertEqual(r['used'],1)
   if r['id'] in ['luckforge','luckminer']:self.assertEqual(r['resource'],([10,5,1] if r['id']=='luckforge' else [7,4,1])[[.1,.6,.95].index(r['roll'])])
   if r['visual']:self.assertIn('연계 [',r['modal'])
  (OUT/'hotfix-mixed-luck.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
 def test_12_link_score_and_actual_pierce_log(self):
  self.begin()
  r=self.page.evaluate('''()=>{phase='battle';deck=[cp({id:'qa_attack',name:'시험 공격',type:'attack',atk:100})];hand=[cp({id:'qa_pierce',name:'시험 관통',type:'attack',passive:'pierce',pierce:2})];draw=[];graveyard=[];tempAttack=0;bonusAtk=0;aoeAttack=0;pierce=0;linkComboAttack=0;roundLinkDone={};enemies=[20,30,200].map((hp,i)=>({name:'시험 적'+i,hp,debuffZone:1}));triggerLink('a_qa','시험 연계',10,'시험',[]);battle();const e=Luck220.events().find(e=>e.event_type==='battle_resolved');const s=Luck220.snapshot(),txt=LuckHistory.exportText(s);return {payload:e.payload,round:e.round,currentRound:round,stats,score:scoreValue(),sum:scoreBreakdown().reduce((n,x)=>n+x[1],0),summary:s.live.combat_summary,txt,logs:fullLogs.filter(x=>x.includes('연계 점수:')||x.includes('관통 수치:')),legacy:LuckHistory.exportText({version:'0.2.20',build_id:'old',id:'old',live:{round:1,stats:{},deck:[]},events:[]})};}''')
  self.assertEqual(r['round'],1);self.assertEqual(r['currentRound'],2)
  self.assertEqual(r['payload']['link_score'],{'raw_bonus':10,'triggers':1,'bonus_points':50,'trigger_points':40,'total_points':90,'included_in_combo_score':True})
  self.assertEqual(r['payload']['pierce_summary'],{'prepared':2,'hits':2,'damage':90,'kills':1})
  self.assertEqual(r['stats']['comboBonus'],10);self.assertEqual(r['stats']['comboTriggers'],1);self.assertEqual(r['stats']['pierceDamage'],90);self.assertEqual(r['score'],r['sum'])
  self.assertEqual(r['summary']['official']['link_score'],90);self.assertEqual(r['summary']['official']['pierce_damage'],90)
  self.assertIn('LINK_SCORE=',r['txt']);self.assertIn('PIERCE=',r['txt']);self.assertEqual(len(r['logs']),2)
  self.assertTrue(all(line.startswith('[R1][battle]') for line in r['logs']))
  self.assertIn('LINK_SCORE=null',r['legacy']);self.assertIn('PIERCE=null',r['legacy'])
  (OUT/'hotfix-combat-log.json').write_text(json.dumps(r,ensure_ascii=False,indent=2))
 def test_13_zero_pierce_aoe_wipe_and_official_summary_freeze(self):
  self.begin()
  r=self.page.evaluate('''()=>{round=30;phase='battle';deck=[cp({id:'qa',name:'시험',type:'attack',atk:100})];hand=[];draw=[];graveyard=[];tempAttack=0;bonusAtk=0;aoeAttack=20;pierce=2;linkComboAttack=0;roundLinkDone={};enemies=[{name:'광역 대상',hp:10,debuffZone:1}];battle();const official=JSON.stringify(Luck220.run().official_snapshot),frozenScore=officialRecord.score;endlessMode=true;round=31;phase='battle';aoeAttack=0;pierce=0;hand=[];enemies=[{name:'무한 대상',hp:10,debuffZone:1}];battle();const es=Luck220.events().filter(e=>e.event_type==='battle_resolved');return {first:es[0].payload.pierce_summary,second:es[1].payload.pierce_summary,officialUnchanged:official===JSON.stringify(Luck220.run().official_snapshot),scoreUnchanged:frozenScore===officialRecord.score,live:Luck220.snapshot().live.combat_summary,terminal:Luck220.run().terminal.combat_summary,txt:LuckHistory.exportText(Luck220.snapshot())};}''')
  self.assertEqual(r['first'],{'prepared':2,'hits':0,'damage':0,'kills':0});self.assertEqual(r['second'],{'prepared':0,'hits':0,'damage':0,'kills':0})
  self.assertTrue(r['officialUnchanged']);self.assertTrue(r['scoreUnchanged']);self.assertEqual(r['live']['official']['battles'],1);self.assertEqual(r['live']['endless']['battles'],1);self.assertEqual(r['terminal']['endless']['battles'],0)
  line=next(x for x in r['txt'].splitlines() if x.startswith('LINK_SCORE='));self.assertEqual(json.loads(line.split('=',1)[1])['endless']['battles'],1)
  (OUT/'hotfix-official-freeze.json').write_text(json.dumps(r,ensure_ascii=False,indent=2))
if __name__=='__main__':unittest.main()
