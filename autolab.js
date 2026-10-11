/* AutoLab v0.1 — developer-only simulation bridge; no gameplay rule changes. */
(function(){
let seed=1, enabled=false;
function seeded(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
const originalRandom=Math.random;
const profiles={random:{},economy:{chain:100,hand:70,big:80,gem:75,rd:90,d8:110,aoe:20,meteor:20},attack:{sam:85,gold:100,combo:95,master:95,kill:75,meteor:30},aoe:{aoe:140,meteor:145,bomber:125,chainblast:130,d8:85,chain:70},link:{chain:95,hand:75,rd:90,d8:95,combo:105,gem:55},survival:{aoe:120,meteor:125,kill:100,lance:80,chainblast:105,ag:65}};
function state(){return {round,phase,score:scoreValue(),resource,gems,enemyCount:enemies.length,enemyHp:total(),deckSize:deck.length,drawSize:draw.length,handSize:hand.length,stats:{...stats},deck:deck.map(c=>c.baseId||c.id),lastBattle:pendingBattleScene?{attackPre:pendingBattleScene.attackPre,attackFinal:pendingBattleScene.attackFinal,attackLoss:pendingBattleScene.attackLoss,aoe:pendingBattleScene.aoe,killed:pendingBattleScene.killed,enemyStart:pendingBattleScene.enemyStart,remaining:pendingBattleScene.remaining}:null};}
function priceScore(c,profile){const w=profiles[profile]||{};let s=w[c.id]??(profile==='random'?Math.random()*100:20+(c.atk||0)*1.5+(c.draw||0)*5+(c.aoe||0)*2);if(profile==='random')s=Math.random()*100;return s/(1+Math.max(0,c.price||0)*.025);}
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
   for(let n=0;n<5;n++){
     const opts=[...BASIC.map(c=>({...c,group:'basic'})),...randomShop.map(c=>({...c,group:'random'}))].filter(c=>resource>=c.price&&(buyCount[c.id]||0)<c.limit);
     if(!opts.length)break;
     opts.sort((a,b)=>priceScore(b,profile)-priceScore(a,profile));
     if(profile==='random'&&Math.random()<.35)break;
     const best=opts[0];if(best.group==='basic')buyBasic(best.id);else buyRandom(best.id);
   }
   next();
 }else if(phase==='battle')next();
 else if(phase==='reward')reward(0);
 return {done:phase==='gameover'||!!officialRecord,state:state()};
}
window.AutoLab={begin(s=1){seed=(Number(s)>>>0)||1;enabled=true;window.__luckAutoLabBotActive=true;Math.random=seeded;const visual=$('visualModeToggle');if(visual)visual.checked=false;const skip=$('battleMotionSkipToggle');if(skip)skip.checked=true;const welcome=$('welcomeOverlay');if(welcome)welcome.classList.add('hide');start();return state();},step,state,run(profile='economy',limit=250){let trace=[],errors=[];for(let i=0;i<limit;i++){const before=state();try{const result=step(profile);const after=result.state;if(before.round!==after.round||result.done)trace.push({round:before.round,score:after.score,enemyHp:after.enemyHp,enemyCount:after.enemyCount,attack:after.stats.maxAttack,damage:after.stats.damageDealt,aoeDamage:after.stats.aoeDamage,deck:after.deckSize});if(result.done)break;}catch(e){errors.push(String(e.stack||e));break;}}return {profile,seed,finished:phase==='gameover'||!!officialRecord,trace,errors,final:state(),logs:fullLogs.slice(-20)};},restore(){Math.random=originalRandom;enabled=false;window.__luckAutoLabBotActive=false;}};
})();
