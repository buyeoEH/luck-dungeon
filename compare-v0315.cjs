/* Policy simulations are diagnostics, not player win-rate predictions. */
const fs=require('fs'),assert=require('assert'),{create,q}=require('./boss-ai-v313.cjs');const rows=[];
for(const family of ['none','attack','resource','draw','guard','link']){
 const d=create({trialPierce:true,skill:'expert'});
 q(d,`var forcedFamily315='${family}',forcedGranted315=false;var begin315=AutoLab.begin;AutoLab.begin=function(){forcedGranted315=false;return begin315.apply(this,arguments);};var forceStart315=drawStart;drawStart=function(){if(!forcedGranted315&&forcedFamily315!=='none'&&round>=5){addNewCard(cp(LUCK_LEGENDS_315.find(c=>c.family315===forcedFamily315)));forcedGranted315=true;}return forceStart315.apply(this,arguments);};`);
 for(const profile of ['balanced','luck','link','pierce'])for(let seed=101;seed<=108;seed++){
  const r=d.window.BossRun({seed,profile,skill:'expert',reward_policy:'mega',trace:false});assert(r.steps<400,'no stall');const uses=q(d,"Luck220.events().filter(e=>e.event_type==='card_used').length");assert.equal(uses,q(d,'stats.cardsUsed'),'exactly once use telemetry');
  const last=r.boss_timeline.filter(x=>x.round===10).at(-1);rows.push({family,profile,seed,clear:r.clear,round:r.round,granted:q(d,'forcedGranted315'),r10:last?last.clear?'clear':'failed':'not_reached',remaining:last?.remaining_hp,diagnostics:q(d,"Luck220.events().filter(e=>e.event_type==='r10_diagnostic').map(e=>e.payload)"),luck_results:q(d,'luckState315.results.length'),legends:q(d,'luckState315.legends'),mutations:q(d,'luckState315.mutations'),failure:r.boss_failure});
 }
 d.window.close();console.log('Completed '+family);
}
const summary=[...new Set(rows.map(x=>x.family))].map(family=>{const a=rows.filter(x=>x.family===family);return {family,runs:a.length,granted:a.filter(x=>x.granted).length,clears:a.filter(x=>x.clear).length,r10_reached:a.filter(x=>x.r10!=='not_reached').length,r10_clears:a.filter(x=>x.r10==='clear').length,mean_round:a.reduce((n,x)=>n+x.round,0)/a.length};});
fs.writeFileSync('v0315-comparison-results.json',JSON.stringify({scope:'192 seeded expert-policy diagnostics; forced legend at first R5 combat for each family; 32 baseline plus 32 per family. Different decisions consume different RNG. Not causal or human win-rate evidence. Late acquisition still needs playtesting.',summary,rows},null,2));console.log(summary);
