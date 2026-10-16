/* AutoLab v0.2 — diagnostics bridge for real engine; gameplay rules are unchanged. */
(function(){
'use strict';
let seed=1,enabled=false,eventSink=[];
function seeded(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
const originalRandom=Math.random;
const profiles={random:{},economy:{chain:100,hand:70,big:80,gem:75,rd:90,d8:110,aoe:20,meteor:20},attack:{sam:85,gold:100,combo:95,master:95,kill:75,meteor:30},aoe:{aoe:140,meteor:145,bomber:125,chainblast:130,d8:85,chain:70},link:{chain:95,hand:75,rd:90,d8:95,combo:105,gem:55},survival:{aoe:120,meteor:125,kill:100,lance:80,chainblast:105,ag:65},promotion:{rd:150,bd:150,hand:95,chain:90,big:85,thief:120,mage:120,gg:80,rg:80}};
function state(){return {round,phase,score:scoreValue(),resource,gems,enemyCount:enemies.length,enemyHp:total(),deckSize:deck.length,drawSize:draw.length,handSize:hand.length,stats:{...stats},deck:deck.map(c=>c.baseId||c.id),lastBattle:pendingBattleScene?{attackPre:pendingBattleScene.attackPre,attackFinal:pendingBattleScene.attackFinal,attackLoss:pendingBattleScene.attackLoss,aoe:pendingBattleScene.aoe,killed:pendingBattleScene.killed,enemyStart:pendingBattleScene.enemyStart,remaining:pendingBattleScene.remaining}:null};}
function priceScore(c,profile){const w=profiles[profile]||{};let s=w[c.id]??(profile==='random'?Math.random()*100:20+(c.atk||0)*1.5+(c.draw||0)*5+(c.aoe||0)*2);if(profile==='random')s=Math.random()*100;return s/(1+Math.max(0,c.price||0)*.025);}
function emit(type,data){if(eventSink)eventSink.push({type,round,phase,...data});}
function deckCounts(){const counts={};for(const c of deck){const k=cardKey(c);counts[k]=(counts[k]||0)+1;}return counts;}
function diagnostics(stage){
 const counts=deckCounts(),available=[...BASIC.map(c=>({...c,source:'basic'})),...randomShop.map(c=>({...c,source:'random'}))].map(c=>({id:c.id,source:c.source,price:c.price,left:Math.max(0,(c.limit||0)-(buyCount[c.id]||0))}));
 const recipes=PROMOS.map(p=>{
   const missing=Object.fromEntries(Object.entries(p.from).map(([k,n])=>[k,Math.max(0,n-(counts[k]||0))]).filter(([,n])=>n>0));
   const resShort=Math.max(0,(p.cost.res||0)-resource),gemShort=Math.max(0,(p.cost.gem||0)-gems);
   return {id:p.id,name:p.card.name,tier:p.tier||1,missing,missingCount:Object.values(missing).reduce((a,b)=>a+b,0),resourceShort:resShort,gemShort,ready:!Object.keys(missing).length&&!resShort&&!gemShort};
 });
 emit('shop_snapshot',{stage,resource,gems,deckCounts:counts,offers:available,recipes});
}
function doPromotions(){
 let done=0;
 // Only use the real game engine's eligibility check; spend on upgrades before shopping.
 while(done<4){
   const eligible=PROMOS.filter(p=>canPromote(p)).sort((a,b)=>(b.tier||1)-(a.tier||1));
   if(!eligible.length)break;
   const p=eligible[0],before=stats.promotions;
   promote(p.id);
   if(stats.promotions<=before)break;
   emit('promotion',{id:p.id,tier:p.tier||1,name:p.card.name,resource,gems});done++;
 }
 return done;
}
function step(profile='economy'){
 if(!enabled)throw Error('Call AutoLab.begin(seed) first');
 if(phase==='gameover'||officialRecord)return {done:true,state:state()};
 if(phase==='hand'){
   for(let n=0;n<60;n++){let i=hand.findIndex(c=>!['attack','specialAttack','curse','remove'].includes(c.type));if(i<0)break;
    if(hand[i].type==='promotionStone'){use(i);resolvePromotionStone('dagger');continue;}
    use(i);
   }
   next();
 }else if(phase==='shop'){
   diagnostics('entry');
   doPromotions();
   for(let n=0;n<5;n++){
     const opts=[...BASIC.map(c=>({...c,group:'basic'})),...randomShop.map(c=>({...c,group:'random'}))].filter(c=>resource>=c.price&&(buyCount[c.id]||0)<c.limit);
     if(!opts.length)break;
     opts.sort((a,b)=>priceScore(b,profile)-priceScore(a,profile));
     if(profile==='random'&&Math.random()<.35)break;
     const best=opts[0],before=stats.cardsBought,cash=resource;
     if(best.group==='basic')buyBasic(best.id);else buyRandom(best.id);
     if(stats.cardsBought>before)emit('purchase',{id:best.id,name:best.name,source:best.group,price:best.price,cashBefore:cash,cashAfter:resource});
     doPromotions();
   }
   diagnostics('exit');next();
 }else if(phase==='battle')next();
 else if(phase==='reward'){
   const name=rewards?.[0]?.[0]||'unknown';reward(0);
   // Reroll rewards open a confirmation UI; bots must confirm to advance.
   if(phase==='reward'&&typeof confirmShopReroll==='function')confirmShopReroll();
   emit('reward',{name});
 }
 return {done:phase==='gameover'||!!officialRecord,state:state()};
}
window.AutoLab={
 begin(s=1){seed=(Number(s)>>>0)||1;enabled=true;eventSink=[];window.__luckAutoLabBotActive=true;Math.random=seeded;const visual=$('visualModeToggle');if(visual)visual.checked=false;const skip=$('battleMotionSkipToggle');if(skip)skip.checked=true;const welcome=$('welcomeOverlay');if(welcome)welcome.classList.add('hide');start();return state();},
 step,state,
 run(profile='economy',limit=250){let trace=[],errors=[],steps=0;eventSink=[];for(let i=0;i<limit;i++){steps=i+1;const before=state();try{const result=step(profile);const after=result.state;if(before.phase==='battle')trace.push({round:before.round,score:after.score,enemyHp:after.lastBattle.remaining.reduce((sum,e)=>sum+e.hp,0),enemyCount:after.lastBattle.remaining.length,attack:after.lastBattle.attackFinal,damage:after.stats.damageDealt-before.stats.damageDealt,aoeDamage:after.stats.aoeDamage-before.stats.aoeDamage,deck:after.deckSize});if(result.done)break;}catch(e){errors.push(String(e.stack||e));break;}}return {profile,seed,finished:phase==='gameover'||!!officialRecord,steps,trace,events:eventSink,errors,final:state(),logs:fullLogs.slice(-20)};},
 restore(){Math.random=originalRandom;enabled=false;window.__luckAutoLabBotActive=false;eventSink=[];}
};
})();
