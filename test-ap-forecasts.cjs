const fs=require('fs'),path=require('path'),{create,q}=require('./ap-node.cjs');
const results=[];
for(const mode of ['off','shop','strong','new','promo']){
 const d=create(mode);q(d,`window.__forecasts=0;const actual=battle;battle=function(){
 const snapshot=()=>JSON.stringify({enemies,prot,stats,deck,hand,draw,graveyard,phase,resource,gems,linkComboAttack,roundLinkDone,ap:LuckAP.snapshot(),p1Round:{...p1Round,lances:[...p1Round.lances],paidLances:[...p1Round.paidLances]}});
 const before=snapshot(),p=battlePreparationPlan();battlePreparationPlan();if(before!==snapshot())throw Error('forecast side effect');actual();
 for(const row of p.rows){const hits=pendingBattleScene.events.flatMap(e=>e.type==='aoe'?e.hits:[e]).filter(e=>e.id===row.id);if(hits.reduce((n,e)=>n+e.damage,0)!==row.before-row.hp)throw Error('forecast mismatch');}window.__forecasts++;
 };`);
 for(let i=0;i<40;i++)d.window.P5Harness.run({seed:101+i*5,profile:['aoe','economy','balanced','pierce','luck','link','attack'][i%7],reward_policy:'mixed',mode:'normal',random_cards:3});
 results.push({mode,runs:40,forecasts:d.window.__forecasts,matches:true,state_changes:0});d.window.close();
}
fs.writeFileSync(path.join(__dirname,'ap-results/forecasts.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));
