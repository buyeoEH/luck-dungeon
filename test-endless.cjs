const assert=require('assert'),{create,q}=require('./boss-ai.cjs');const d=create();
const init=()=>q(d,"AutoLab.begin(111);round=30;phase='battle';enemies=[];bossEncounter={round:30,turn:1,cleared:true,rewardOffered:false,clearedOnTurn:1,spec:bossSpec(30)};bossReward();");
init();assert(q(d,'!!officialRecord'));assert.equal(q(d,'rewards.length'),0);const score=q(d,'officialRecord.score');
q(d,'continueEndless()');assert.equal(q(d,'round'),30);assert.equal(q(d,'phase'),'reward');assert.equal(q(d,'rewards.length'),5);
q(d,'continueEndless();bossReward()');assert.equal(q(d,'rewards.length'),5);
q(d,'reward(4)');assert.equal(q(d,'round'),31);assert.equal(q(d,'hand.length'),8);assert.equal(q(d,'apState.points'),3);q(d,'reward(4)');assert.equal(q(d,'bossMega.used'),1);
q(d,"phase='battle';nextRound()");assert.equal(q(d,'hand.length'),5);assert.equal(q(d,'apState.points'),2);assert.equal(q(d,'officialRecord.score'),score);
init();q(d,'finishOfficialOnly();continueEndless()');assert.equal(q(d,'phase'),'complete');assert.equal(q(d,'rewards.length'),0);assert.equal(q(d,'endlessMode'),false);
for(const r of [35,40,45,60,100]){
 q(d,`AutoLab.begin(${r});endlessMode=true;round=${r};enemies=[{id:'carry',name:'이전 적',hp:18}];nextSpawn=rollSpawn(round);addEnemy();`);
 assert.equal(q(d,'nextSpawn.length>0'),true);assert.equal(q(d,'enemies.length'),2,'boss only spawn');assert.equal(q(d,'bossEncounter.turn'),1);assert.equal(q(d,'bossStageActive()'),true);
 assert(q(d,'enemies[1].shield>0&&enemies[1].coreHp>0'));assert.equal(q(d,'enemies[1].shield'),q(d,`bossSpec(${r}).shield`));assert.equal(q(d,'enemies[1].debuffs.length'),3);
 const hp=q(d,'JSON.stringify(enemies.map(e=>e.hp))');q(d,"phase='battle';nextRound()");assert.equal(q(d,'round'),r);assert.equal(q(d,'bossEncounter.turn'),2);assert.equal(q(d,'JSON.stringify(enemies.map(e=>e.hp))'),hp);assert.equal(q(d,'apState.points'),2);
 assert(q(d,"enemies[1].debuffs.every(x=>x.p===x.baseP)"));
 q(d,"phase='battle';nextRound();phase='battle';nextRound()");assert.equal(q(d,'phase'),'gameover');assert(q(d,'bossFailureReason.includes("3회")'));
 q(d,`AutoLab.begin(${r});endlessMode=true;round=${r};enemies=[];bossEncounter={round:${r},turn:3,cleared:true,rewardOffered:false,clearedOnTurn:3,spec:bossSpec(${r})};bossReward();bossReward();`);assert.equal(q(d,'rewards.length'),5);q(d,'reward(1)');assert.equal(q(d,'round'),r+1);
}
// Actual R35 combat uses unchanged strike damage, conditional overflow and pure forecast parity.
for(const pierce of [0,1,2]){
 q(d,`AutoLab.begin(123);endlessMode=true;round=35;enemies=[{id:'carry',name:'이전 적',hp:10}];nextSpawn=rollSpawn(35);addEnemy();deck=[{id:'qa',name:'검',type:'attack',atk:40}];hand=[];draw=[];graveyard=[];bonusAtk=0;tempAttack=0;aoeAttack=0;pierce=${pierce};p1ResetRun();prot={attack:0,combo:0,gem:0,resource:0,all:0};phase='battle';$('battleMotionSkipToggle').checked=true;`);
 const expected=q(d,'JSON.stringify(battlePreparationPlan().rows.filter(e=>e.hp>0).map(e=>e.hp))');q(d,'battle()');assert.equal(q(d,'JSON.stringify(enemies.map(e=>e.hp))'),expected);assert.equal(q(d,'bossEncounter.turn'),2);assert.equal(q(d,'round'),35);
}
d.window.close();console.log('PASS R30 official/endless reward choice, duplicate lock, mega R31 once, R35–100 new bosses, HP continuity, debuff rearm, timeout, rewards and real damage/forecast parity');
