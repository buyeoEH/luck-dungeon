"""Controlled real-engine before/after probes for every promotion and link."""
import csv,json
import test_v0220 as base
base.StabilityTests.setUpClass();t=base.StabilityTests('test_06_local_event_persistence_and_version');t.setUp()
try:
 t.page.evaluate("render=()=>{};actionFlash=()=>{};focusSection=()=>{};log=(s)=>fullLogs.push(plainLogText(s));")
 result=t.page.evaluate('''()=>{const catalog=[...BASE,...BASIC,...RANDOM_POOL,...PROMOS.map(p=>p.card),...LEGEND_POOL];function simulate(cards,seed,link=0){AutoLab.begin(seed);deck=cards.map(cp);hand=[...deck];draw=[];graveyard=[];resource=0;gems=0;round=16;phase='hand';for(let n=0;n<80;n++){const i=hand.findIndex(c=>!['attack','specialAttack','curse','remove','promotionStone'].includes(c.type));if(i<0)break;use(i);}linkComboAttack+=link;enemies=[20,100,300].map((hp,i)=>({name:'QA적'+i,hp,debuffZone:1,boss:false}));phase='battle';battle();const s=JSON.parse(JSON.stringify(stats)),scene=pendingBattleScene;AutoLab.restore();return {damage:s.damageDealt,attack:scene.attackFinal,aoe:s.aoeDamage,pierce:s.pierceDamage,resource,gems,extra_draw:s.extraCardsDrawn,combo_raw:scene.measuredAttackParts?.comboRaw||0};}const promotions=PROMOS.map((p,i)=>{const materials=Object.entries(p.from).flatMap(([id,n])=>Array(n).fill(catalog.find(c=>c.id===id)));const before=simulate(materials,221000+i),after=simulate([p.card],221000+i);return {recipe:p.id,card:p.card.id,name:p.card.name,tier:p.tier||1,terminal:!PROMOS.some(q=>q.from[p.card.id]),branch:p.branch||'',resource_cost:p.cost.res||0,gem_cost:p.cost.gem||0,compression:materials.length-1,atk_delta:(p.card.atk||0)-materials.reduce((n,c)=>n+(c.atk||0),0),card:p.card,before,after,damage_delta:after.damage-before.damage,method:'same seeded real-engine hand/battle; no additional draw supply; neutral enemy HP 20/100/300'};});const links=[...ACTION_LINKS.map(l=>({...l,key:'a_'+l.id})),...TACTICAL_LINKS.map(l=>({...l,key:'t_'+l.id}))].map((l,i)=>{const cards=[{id:'qa',name:'QA공격',type:'attack',atk:50}];const before=simulate(cards,222000+i),after=simulate(cards,222000+i,l.bonus);return {id:l.key,name:l.name,raw_bonus:l.bonus,before,after,damage_delta:after.damage-before.damage,method:'same seeded real-engine battle, bonus ablation with fixed neutral enemies; condition checks are separate'};});return {promotions,links};}''')
 result['build_id']=t.page.evaluate('LUCK_BUILD.build_id');result['version']='0.2.20'
 base.OUT.joinpath('effect-ablation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
 for kind in ['promotions','links']:
  fields=['recipe','name','tier','terminal','resource_cost','gem_cost','compression','atk_delta','damage_delta'] if kind=='promotions' else ['id','name','raw_bonus','damage_delta']
  with base.OUT.joinpath(kind+'-effect-table.csv').open('w',encoding='utf-8-sig') as f:
   w=csv.DictWriter(f,fields,extrasaction='ignore');w.writeheader();w.writerows(result[kind])
 assert not t.errors,t.errors
 print('Controlled effect probes:',len(result['promotions']),'promotion recipes and',len(result['links']),'link types')
finally:t.page.close();base.StabilityTests.tearDownClass()
