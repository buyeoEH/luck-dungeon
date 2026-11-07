/* Reproducible comparison policy v1. Historical 38/58 policy was not supplied. */
(function(){'use strict';
const W={
 aoe:{chainblast:160,aoe:125,bomber:150,meteor:100,hand:75,chain:85,big:70},
 economy:{chain:125,hand:105,big:120,gem:105,rd:110,bomber:100},
 balanced:{chain:100,hand:90,big:90,sam:95,aoe:85,pike:85,ag:65},
 pierce:{pike:160,lance:170,chain:90,hand:80,sam:100,gold:100},
 luck:{dice:160,coin:140,box:165,spark:130,hand:90,chain:80},
 link:{combo:160,master:130,chain:140,hand:115,rd:100},
 attack:{sam:150,gold:145,combo:120,master:110,hand:75,big:75}
};
function value(c,profile){return W[profile][c.id]??(25+(c.atk||0)*2+(c.draw||0)*10+(c.aoe||0)*3+(c.pierce||0)*10);}
function stableStats(){const s={...stats};delete s.officialPlayMs;return s;}
function stableCard(c){const x={...c};delete x.id;return {key:cardKey(c),...x,baseId:cardKey(c)};}
function stableEnemy(e){const x={...e};delete x.id;return x;}
function state(){return {round,phase,resource,gems,prot:{...prot},deck:deck.map(stableCard),hand:hand.map(stableCard),draw:draw.map(stableCard),graveyard:graveyard.map(stableCard),enemies:enemies.map(stableEnemy),stats:stableStats(),linkComboAttack,roundActionHistory:[...roundActionHistory],roundLinkDone:{...roundLinkDone},bonusAtk,tempAttack,pierce,aoeAttack,nextDraw,nextRes,oneuseUsed,oneuseHistory:{...oneuseHistory},buyCount:{...buyCount},randomShop:randomShop.map(c=>({id:c.id,limit:c.limit})),seen:[...randomShopSeen],dangerActive,activeDebuffZone,official_score:officialRecord?.score??null};}
function promotions(profile){let count=0;for(;;){const p=PROMOS.filter(canPromote).sort((a,b)=>(b.tier||1)-(a.tier||1)||value(b.card,profile)-value(a.card,profile))[0];if(!p)return;const n=stats.promotions;promote(p.id);if(stats.promotions===n)throw Error('promotion made no progress');if(++count>200)throw Error('promotion loop safety failure');}}
function useHand(profile){let count=0;for(;;){const i=hand.findIndex(c=>!['attack','specialAttack','curse'].includes(c.type)&&(c.type!=='promotionStone'||stoneRecipes().length)&&(c.type!=='remove'||deck.some(x=>x.id!==c.id&&cardKey(x)==='mine')));if(i<0)return;const c=hand[i];if(c.type==='promotionStone'){const q=stoneRecipes().sort((a,b)=>value(b.promo.card,profile)-value(a.promo.card,profile))[0];use(i);showPromotionStoneOptions(q.promo.id);resolvePromotionStone(q.missing[0]);}else if(c.type==='remove'){const target=deck.find(x=>cardKey(x)==='mine'&&x.id!==c.id);use(i);removeCard(target.id);}else use(i);if(++count>1000)throw Error('card-use safety failure; not a game action limit');}}
function shop(profile){promotions(profile);let count=0;for(;;){const offers=[...BASIC.map(c=>({...c,group:'basic'})),...randomShop.map(c=>({...c,group:'random'}))].filter(c=>c.price<=resource+2*gems&&(buyCount[c.id]||0)<c.limit);offers.sort((a,b)=>{const score=c=>{let x=value(c,profile);if(round<=8&&['hand','big','rd','gem'].includes(c.id))x+=60;for(const p of PROMOS){const missing=Object.entries(p.from).filter(([id,n])=>countInDeck(id)<n);if(missing.length===1&&missing[0][0]===c.id)x+=60;}return x/(1+.035*c.price);};return score(b)-score(a);});if(!offers.length)return;const c=offers[0];while(resource<c.price&&gems>0)useGem(false);if(resource<c.price)return;const n=stats.cardsBought;c.group==='basic'?buyBasic(c.id):buyRandom(c.id);if(n===stats.cardsBought)throw Error('purchase made no progress');promotions(profile);if(++count>300)throw Error('shop safety failure');}}
function run(cfg){window.LUCK_BATCH_CONTEXT={...cfg,ai_policy:'v030-reference-policy-v1:'+cfg.profile};if(!window.LUCK_BUILD.persistent_draw)persistentDraw=true;const p=$('persistToggle');if(p)p.checked=true;const sound=$('sfxToggle');if(sound)sound.checked=false;const music=$('bgmToggle');if(music)music.checked=false;
 AutoLab.begin(cfg.seed);const firstShop=randomShop.map(c=>c.id);let randomCalls=0;const rng=Math.random;Math.random=()=>{randomCalls++;return rng();};const trace=[],battles=[],rewardsTaken=[],startDraw=true;let steps=0;
 try{for(;steps<400;steps++){if(officialRecord||phase==='gameover')break;const before=phase,r=round;
  if(phase==='hand'){useHand(cfg.profile);next();}
  else if(phase==='shop'){shop(cfg.profile);next();}
  else if(phase==='battle'){next();const s=pendingBattleScene;battles.push({round:r,enemy_count:s.remaining.length,enemy_hp:s.remaining.reduce((n,e)=>n+e.hp,0),enemy_limit:gameOverEnemyLimit(r),hp_limit:gameOverHpLimit(r),within_limits:s.remaining.length<=gameOverEnemyLimit(r)&&s.remaining.reduce((n,e)=>n+e.hp,0)<=gameOverHpLimit(r),attack:s.attackFinal,attack_loss:s.attackLoss,aoe:s.aoe,pierce:s.pierce,deck_attack:deckAtk(),resource,gems});}
  else if(phase==='reward'){const choice={reroll:0,restock:1,random:2,stone:3}[cfg.reward_policy||'reroll'];rewardsTaken.push({round:r,choice,name:rewards[choice][0]});reward(choice);if(rewardRevealPending)handleModalClose();else if(phase==='reward')confirmShopReroll();}
  else throw Error('unexpected phase '+phase);
  if(cfg.trace)trace.push({before,after:state(),random_calls:randomCalls});
 }}finally{Math.random=rng;}
 const finished=!!officialRecord||phase==='gameover';if(!finished)throw Error('AI step limit; not completion');
 const row={profile:cfg.profile,seed:cfg.seed,reward_policy:cfg.reward_policy||'reroll',policy_version:'v030-reference-policy-v1',persistent_draw:true,git_sha:window.LUCK_BUILD.git_sha||cfg.baseline_git_sha,source_tree_dirty:window.LUCK_BUILD.source_tree_dirty??false,object_object_count:fullLogs.filter(x=>x.includes('[object Object]')).length,build_id:window.LUCK_BUILD.build_id,clear:!!officialRecord,round,steps,random_calls:randomCalls,first_shop:firstShop,rewards:rewardsTaken,stats:stableStats(),final:state(),battles,trace,metrics:window.Luck030?.records()||[]};AutoLab.restore();return row;
}
window.V030ReferenceAI={run,profiles:Object.keys(W),weights:W};
})();
