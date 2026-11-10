const assert=require('assert'),{create,q}=require('./boss-ai.cjs');
const d=create();
const setup=()=>q(d,"AutoLab.begin(101);bossEncounter=null;round=16;phase='shop';resource=99;gems=99;apState.points=2;prot={attack:0,combo:0,resource:0,gem:0,all:0};");
assert.equal(q(d,'GUARD_PROMOTIONS.length'),5);
for(const id of ['guard_sword','guard_miner','guard_vault','guard_cycle','guard_link']){
 setup();q(d,`var recipe=GUARD_PROMOTIONS.find(p=>p.card.id==='${id}');deck=Object.entries(recipe.from).flatMap(([k,n])=>Array.from({length:n},()=>cp([...BASE,...BASIC,...RANDOM_POOL,...PROMOS.map(p=>p.card)].find(c=>c.id===k))));draw=deck.slice();graveyard=[];hand=[];var beforeSize=deck.length;promote(recipe.id);`);
 assert.equal(q(d,'deck.length'),1,'compression '+id);assert.equal(q(d,'cardKey(deck[0])'),id);assert.equal(q(d,'apState.points'),1);
 assert.equal(q(d,'apCost(deck[0])'),1);assert.equal(q(d,"promoGroup(recipe)"),'protection');
 q(d,"hand=deck.slice();draw=[];graveyard=[];phase='hand';apState.points=1;resource=0;gems=0;enemies=[];p1ResetRound();roundActionHistory=[];roundLinkDone={};linkComboAttack=0;var atkBefore=deckAtk();var tempBefore=tempAttack;use(0);");
 assert.equal(q(d,'apState.points'),0);assert.equal(q(d,'roundActionHistory.length'),1,'one card is one action');
 if(id==='guard_sword'){assert.equal(q(d,'deckAtk()'),16);assert.equal(q(d,'tempAttack'),q(d,'tempBefore'));assert.equal(q(d,'prot.attack'),4);}
 if(id==='guard_miner'){assert.equal(q(d,'resource'),7);assert.equal(q(d,'prot.resource'),3);assert(q(d,"roundLinkDone.a_guard_economy"));}
 if(id==='guard_vault'){assert.equal(q(d,'gems'),3);assert.equal(q(d,'prot.gem'),3);}
 if(id==='guard_cycle'){assert.equal(q(d,'prot.combo'),2);assert(q(d,"roundLinkDone.a_guard_draw"));}
 if(id==='guard_link'){assert.equal(q(d,'prot.combo'),3);assert.equal(q(d,'p1Round.gaugeBonus'),12);}
}
setup();q(d,"var c=cp(GUARD_PROMOTIONS.find(p=>p.card.id==='guard_miner').card);phase='hand';hand=[c,cp(c)];deck=hand.slice();draw=[];apState.points=2;roundLinkDone={};roundActionHistory=[];linkComboAttack=0;use(0);var firstLink=linkComboAttack;use(0);");assert.equal(q(d,'linkComboAttack'),q(d,'firstLink'));assert.equal(q(d,'roundActionHistory.length'),2);assert.equal(q(d,"!!roundLinkDone.a_economy_draw"),false);
// Combat reports must contain concrete link values and a visible gauge-only defense.
setup();q(d,"phase='battle';deck=[{id:'qa',atk:1,type:'attack'}];hand=[];enemies=[{hp:100,d:{k:'combo',p:2,baseP:2,pct:false}}];p1ResetRound();p1Round.gaugeBonus=21;prot.combo=1;var plan=guardCombatPlan();guardFinishCombat(plan);");
assert.equal(q(d,'guardLastCombat.combo.before'),0);assert.equal(q(d,'guardLastCombat.gauge.raw'),21);assert(q(d,"guardCombatSteps(guardLastCombat).some(r=>r.kind==='protected')"));assert(!q(d,'guardCombatHtml(guardLastCombat)').includes('undefined'));
assert.equal(q(d,"guardTheftGroups([{kind:'theft_failed'},{kind:'theft_failed'}])[0].count"),2);
d.window.close();console.log('PASS five real promotions, material compression, action cost, permanent sword, effects, one-action links, one-combat cap, concrete feedback and grouped theft');
