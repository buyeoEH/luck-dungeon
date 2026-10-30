/* Measurement-only fixed state reward selector v1. No quotas, RNG, look-ahead or tuning. */
(function(){'use strict';
const pool34=[...RANDOM_POOL],NAMES=['reroll','restock','random','stone'];let decisions=[];
const value=(c,p)=>V030ReferenceAI.weights[p][c.id]??(25+(c.atk||0)*2+(c.draw||0)*10+(c.aoe||0)*3+(c.pierce||0)*10);
function chooseReward(profile){
 const vals=RANDOM_POOL.map(c=>value(c,profile)).sort((a,b)=>a-b),median=(vals[16]+vals[17])/2;
 const active=randomShop.filter(c=>c.limit-(buyCount[c.id]||0)>0),unseen=RANDOM_POOL.filter(c=>!randomShopSeen.has(c.id));
 const weak=active.filter(c=>value(c,profile)<median).length;
 const strongRandomSold=randomShop.filter(c=>c.limit-(buyCount[c.id]||0)<=0&&value(c,profile)>=90).length;
 const strongBasicSold=BASIC.filter(c=>c.limit-(buyCount[c.id]||0)<=0&&value(c,profile)>=90).length;
 const near=stoneRecipes().filter(x=>Object.entries(x.promo.from).reduce((n,[k,v])=>n+Math.max(0,v-countInDeck(k)),0)<=2);
 const bestStone=near.length?Math.max(...near.map(x=>value(x.promo.card,profile))):0;
 const stones=deck.filter(c=>cardKey(c)==='promo_stone').length;
 const danger=enemies.length/gameOverEnemyLimit(round)>=.7||total()/gameOverHpLimit(round)>=.7;
 const random=50+(danger?15:0)+(deck.length<18?8:0)-(deck.length>32?10:0);
 const gap=unseen.length&&active.length?Math.max(0,unseen.reduce((n,c)=>n+value(c,profile),0)/unseen.length-active.reduce((n,c)=>n+value(c,profile),0)/active.length):0;
 const reroll=active.length&&unseen.length?20+12*Math.min(3,weak)+Math.min(8,gap/10):-1000;
 const restock=15+18*Math.min(3,strongRandomSold)+6*Math.min(3,strongBasicSold);
 const stone=near.length?20+6*Math.min(4,near.length)+Math.min(25,bestStone/8)-25*Math.min(2,stones):-1000;
 const scores={random,reroll,restock,stone};const order=['random','reroll','restock','stone'];const chosen=order.reduce((a,b)=>scores[b]>scores[a]?b:a);
 decisions.push({round,chosen,scores,inputs:{deck_size:deck.length,enemy_count:enemies.length,enemy_hp:total(),danger,active_slots:active.length,unseen:unseen.length,weak_slots:weak,strong_random_sold_out:strongRandomSold,strong_basic_sold_out:strongBasicSold,near_recipes:near.length,best_stone_value:bestStone,owned_stones:stones,unseen_value_gap:gap}});
 return NAMES.indexOf(chosen);
}
const run0=P5Harness.run;P5Harness.run=function(c){decisions=[];const r=run0(c);r.reward_decisions=decisions;r.reward_selector_version=c.reward_policy==='mixed'?'state-reward-v1':'fixed';r.conversion_on=!!c.conversion_on;return r;};
function opening(seed,poolSize){RANDOM_POOL.splice(0,RANDOM_POOL.length,...pool34.filter(c=>poolSize===34||!['linkseal','linkpeak'].includes(c.id)));window.P5_EXPERIMENT={mode:'normal',random_cards:3};AutoLab.begin(seed);const result={seed,pool_size:RANDOM_POOL.length,first_shop:randomShop.map(c=>c.id),pool:RANDOM_POOL.map(c=>c.id)};AutoLab.restore();return result;}
window.P5B={chooseReward,opening};
})();
