const assert=require('assert'),fs=require('fs'),{create,q}=require('./boss-ai-v313.cjs');
let checks=0;const ok=(value,label)=>{assert(value,label);checks++;};
function init(d){q(d,"AutoLab.begin(1301);phase='hand';hand=[];draw=[];graveyard=[];deck=[];enemies=[];resource=0;gems=0;apState.points=5;tacticUsed=new Set();pendingChoiceCardId=null;pendingChoiceType=null;tacticChoice=null;prot={attack:0,combo:0,resource:0,gem:0,all:0};");}
function setupSalvage(d,id){q(d,`var source=cp(TACTIC_CARDS.find(c=>c.id==='hand_salvage')),target=cp(CARD_CATALOG_313.get('${id}'));deck=[source,target];hand=[source,target];use(0);`);}
const stable=create();init(stable);
for(const [id,value]of [['mine',2],['dagger',2],['sword',4],['smash',7],['big',6],['hero',28],['promo_stone',18],['curse_dead',1]]){
 init(stable);setupSalvage(stable,id);ok(q(stable,'cardRefund313(target)')===value,'canonical refund '+id);q(stable,'target.atk=999;target.price=999');ok(q(stable,'cardRefund313(target)')===value,'mutable value ignored '+id);
 const preview=q(stable,'selectionPreview313(source,[target]).actual');q(stable,'tacticConfirm([target.id])');ok(q(stable,'resource')===preview,'preview payout '+id);
 ok(q(stable,"Luck220.events().filter(e=>e.event_type==='card_used'&&e.payload.instance_id===source.id).length")===1,'one card use '+id);
 ok(q(stable,"Luck220.events().filter(e=>e.event_type==='tactic_choice_committed').at(-1).payload.actual_resource")===value,'actual resource event '+id);
}
init(stable);ok(q(stable,'LuckSelection313.catalog().length')===105,'baseline catalog preserved');
ok(q(stable,'LuckSelection313.catalog().every(x=>Number.isFinite(x.refundValue)&&x.refundValue>0)'),'all canonical definitions have positive fixed refunds');
// Same pure planner used for preview and commit across rounding, flat/pct, own/all protection.
for(const flat of [0,1,3])for(const pct of [0,1,3])for(const own of [0,1,5])for(const all of [0,2]){
 init(stable);setupSalvage(stable,'smash');q(stable,`enemies=[{name:'QA',hp:100,debuffs:[{k:'resource',p:${flat},baseP:${flat},pct:false},{k:'resource',p:${pct},baseP:${pct},pct:true}]}];prot.resource=${own};prot.all=${all};`);
 const before=q(stable,'JSON.stringify({prot,enemies,stats,resource})'),p=q(stable,'selectionPreview313(source,[target])');
 ok(q(stable,'JSON.stringify({prot,enemies,stats,resource})')===before,'preview does not mutate');q(stable,'tacticConfirm([target.id])');ok(q(stable,'resource')===p.actual,'debuff payout parity');ok(q(stable,'stats.protectionPointsUsed')===p.protection,'protection parity');
}
// Real DOM: detail and selection are different actions; multi-select, deselect, limited draw.
init(stable);q(stable,"var source=cp(TACTIC_CARDS.find(c=>c.id==='hand_cycle')),a=cp(BASE[0]),b=cp(BASE[1]),x=cp(BASIC[0]);deck=[source,a,b,x];hand=[source,a,b];draw=[x];use(0)");
let host=stable.window.document.getElementById('modalContent');ok(host.querySelectorAll('.selection-card').length===2,'two card tiles');ok(host.querySelectorAll('.selection-card img').length===2,'card artwork');
host.querySelector('.selection-more').click();ok(q(stable,'tacticChoice.selected.size')===0,'details do not select');ok(host.querySelector('.selection-details').textContent.includes('환원 가치 2'),'detail refund');
host.querySelector('.selection-toggle').click();host.querySelectorAll('.selection-toggle')[1].click();ok(q(stable,'tacticChoice.selected.size')===2,'multi select');ok(host.querySelector('.selection-summary').textContent.includes('2장 영구 삭제 → 최대 1장 드로우'),'actual draw limit');
host.querySelector('.selection-toggle').click();ok(q(stable,'tacticChoice.selected.size')===1,'toggle off');host.querySelector('.selection-toggle').click();host.querySelector('.selection-confirm').click();ok(q(stable,'stats.cardsRemoved')===2&&q(stable,'stats.extraCardsDrawn')>=1,'confirm permanent deletion and draw');
ok(q(stable,'tacticConfirm([a.id,b.id])')===false,'stale confirmation');
init(stable);setupSalvage(stable,'sword');const before=q(stable,'JSON.stringify({deck,hand,draw,graveyard,stats,apState,resource})');host.querySelector('.selection-toggle').click();host.querySelector('.selection-toggle').click();ok(q(stable,'tacticChoice.selected.size')===0,'single selection can deselect');q(stable,'handleModalClose()');ok(q(stable,'JSON.stringify({deck,hand,draw,graveyard,stats,apState,resource})')===before,'cancel preserves gameplay state');
// Legacy whole-deck removal also requires select then confirm.
init(stable);q(stable,"var source=cp([...BASIC,...RANDOM_POOL].find(c=>c.type==='remove')),target=cp(BASE[1]);deck=[source,target];hand=[source];use(0)");host.querySelector('.selection-more').click();ok(q(stable,'stats.cardsRemoved')===0,'removal detail safe');host.querySelector('.selection-toggle').click();ok(q(stable,'stats.cardsRemoved')===0,'removal not eager');host.querySelector('.selection-confirm').click();ok(q(stable,'stats.cardsRemoved')===1,'whole deck removal confirmed');
stable.window.close();
const trial=create({trialPierce:true,trialLuck:true});init(trial);
q(trial,"var a=cp(RANDOM_POOL.find(c=>c.id==='lance')),b=cp(RANDOM_POOL.find(c=>c.id==='lance'));deck=[a,b];hand=[a,b];enemies=[{name:'前衛',hp:1000},{name:'자원도둑',hp:6,debuffs:[{k:'resource',p:3,baseP:3,pct:false}]}];apState.points=2;use(0)");
const ps=q(trial,'JSON.stringify({apState,stats,hand,enemies})');q(trial,'handleModalClose()');ok(q(trial,'JSON.stringify({apState,stats,hand,enemies})')===ps,'pierce cancel preserves state');
q(trial,'use(0);trialChoice313.selected=enemies[1];targetedConfirm313()');ok(q(trial,'enemies.length')===1&&q(trial,'enemies[0].hp')===1000,'target back enemy directly');ok(q(trial,'apState.points')===2,'first beginner refund');ok(q(trial,"gain('resource',6)")===6,'killed thief no longer debuffs');ok(q(trial,'stats.damageDealt')===6&&q(trial,'stats.targetedPierceDamage')===6,'targeted damage counted once');q(trial,'use(0);trialChoice313.selected=enemies[0];targetedConfirm313()');ok(q(trial,'apState.points')===1,'second beginner no refund');ok(q(trial,'targetedConfirm313()')===false,'pierce duplicate confirm');
ok(q(trial,'JSON.stringify(targetedResult313({boss:true,hp:110,shield:40,coreHp:70},6))')===JSON.stringify({enemy:{boss:true,hp:104,shield:36,coreHp:68},damage:6,shieldDamage:4,coreDamage:2,bypass:2,killed:false}),'boss fixed total budget and direct core');
init(trial);q(trial,"var c=cp(RANDOM_POOL.find(c=>c.id==='drill'));deck=[c];hand=[c];enemies=[{hp:100,name:'QA'}];apState.points=2;use(0);trialChoice313.selected=enemies[0];targetedConfirm313()");ok(q(trial,'apState.points')===1,'upper pierce costs AP without first refund');
for(const strength of [0,1,3,6,999])for(const id of q(trial,'Object.keys(LUCK_TABLES_313)')){
 q(trial,`trialState313.tempLuck=${strength};trialState313.runLuck=${strength}`);const t=q(trial,`luckTable313(CARD_CATALOG_313.get('${id}'))`);ok(t.good+t.neutral+t.bad===100&&t.bad>=15,'probability sum and bad floor '+id);
}
// Exercise all categorical result paths, including every mixed specialization.
for(const id of q(trial,'Object.keys(LUCK_TABLES_313)'))for(const roll of [0,.7,.999]){
 init(trial);q(trial,`var c=cp(CARD_CATALOG_313.get('${id}'));deck=[c,...BASE.map(cp)];hand=[c];draw=deck.slice(1);resource=10;var savedRandom=Math.random;Math.random=()=>${roll};use(0);Math.random=savedRandom;`);
 ok(q(trial,'trialState313.luckEvents')===1,'one luck event '+id);ok(q(trial,"Luck220.events().filter(e=>e.event_type==='card_used'&&e.payload.instance_id===c.id).length")===1,'one luck use '+id);
}
init(trial);q(trial,"var c=cp(LUCK_SUPPORT_313[1]);deck=[c];hand=[c];use(0)");ok(q(trial,'trialState313.runLuck')===1,'run luck grows');ok(q(trial,"Luck220.events().filter(e=>e.event_type==='card_used'&&e.payload.instance_id===c.id).length")===1,'support use not double logged');
q(trial,'trialState313.runLuck=3;var c=cp(LUCK_SUPPORT_313[1]);deck.push(c);hand=[c]');const ap=q(trial,'apState.points');q(trial,'use(0)');ok(q(trial,'apState.points')===ap&&q(trial,'hand.length')===1,'cap preserves card and AP');
q(trial,'trialState313.tempLuck=3;bossCombatNo=10;futureGive313(true)');
for(let i=1;i<=4;i++){q(trial,'drawStart()');ok(q(trial,'trialState313.tempLuck')===0&&q(trial,'trialState313.runLuck')===3,'temporary resets, run persists');ok(!!q(trial,'futureActive313()')===(i<=3),'three combats, including boss turns');}
q(trial,"phase='shop';resource=100;apState.points=3;trialState313.runBoon=1;trialState313.runCurse=0;trialState313.shopUsed=false;var c=BASIC.find(x=>x.id==='hand');buyCount[c.id]=0;var basePrice=c.price;var offered=p5Price(c);buyBasic(c.id)");ok(q(trial,'offered')===q(trial,'basePrice')-1,'run boon first purchase discount');ok(q(trial,'p5Price(c)')===q(trial,'basePrice'),'discount consumed on successful purchase');
ok(q(trial,'JSON.stringify(LUCK_BOSS_TABLE)')===JSON.stringify(JSON.parse(fs.readFileSync('boss-table.json','utf8'))),'actual boss HP table unchanged');
trial.window.close();
fs.writeFileSync('v0313-test-results.json',JSON.stringify({pass:true,assertions:checks,browser_layout:'not verified; local Chromium launch blocked',checks:['fixed canonical refunds','pure preview/actual protection parity','real DOM detail/select/deselect/confirm/cancel','actual draw limits','one use event per action','targeted pierce and fixed boss damage budget','first beginner AP refund once per combat','luck probability floor and all result paths','temporary/run luck caps and lifetime','future effects expire after three combat turns','successful-purchase-only discount','boss HP preserved']},null,2));
console.log('PASS '+checks+' assertions');
