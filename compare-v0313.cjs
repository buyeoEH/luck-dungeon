const fs=require('fs'),assert=require('assert'),{create,q}=require('./boss-ai-v313.cjs');
const rows=[],modes={baseline:{},pierce:{trialPierce:true},luck:{trialLuck:true},both:{trialPierce:true,trialLuck:true}};
for(const [mode,flags]of Object.entries(modes)){
 const d=create({...flags,skill:'expert'});
 for(const profile of ['balanced','pierce','luck','link'])for(let seed=101;seed<=112;seed++){
  const r=d.window.BossRun({seed,profile,skill:'expert',reward_policy:'random',trace:false});
  assert(r.steps<400,'choice stall');
  const uses=q(d,"Luck220.events().filter(e=>e.event_type==='card_used').length"),actual=q(d,'stats.cardsUsed');assert.equal(uses,actual,'one use per card '+mode+'/'+profile+'/'+seed);
  const t=r.boss_timeline.filter(x=>x.round===10),last=t.at(-1),state=d.window.LuckTrials313.snapshot();
  rows.push({mode,profile,seed,round:r.round,clear:r.clear,steps:r.steps,r10:!last?'not_reached':last.clear?'clear':'failed',r10_remaining:last?.remaining_hp??null,r10_shield:last?.boss_shield??null,r10_core:last?.boss_core??null,r10_diagnostics:q(d,"Luck220.events().filter(e=>e.event_type==='r10_diagnostic').map(e=>e.payload)"),failure:r.boss_failure,card_uses:uses,targeted_damage:state.targetedDamage,luck_events:state.luckEvents,stats:r.stats});
 }
 d.window.close();console.log('completed '+mode);
}
const summary=Object.keys(modes).map(mode=>{const a=rows.filter(x=>x.mode===mode),r10=a.filter(x=>x.r10!=='not_reached');return {mode,runs:a.length,r10_reached:r10.length,r10_clears:r10.filter(x=>x.r10==='clear').length,r10_failures:r10.filter(x=>x.r10==='failed').length,r30_clears:a.filter(x=>x.clear).length,mean_final_round:a.reduce((n,x)=>n+x.round,0)/a.length,targeted_damage:a.reduce((n,x)=>n+x.targeted_damage,0),luck_events:a.reduce((n,x)=>n+x.luck_events,0)};});
fs.writeFileSync('v0313-comparison-results.json',JSON.stringify({scope:'192 fixed-policy seeded simulations; starting balance proposal, not player validation or causal win-rate evidence. Luck mode adds two shop cards, changing shop composition/RNG paths. Same seeds do not imply identical encounters after divergent decisions.',policy:'expert v0313 greedy target: debuff enemy first then lowest HP; random boss rewards; 4 archetypes × 12 seeds × 4 modes',summary,rows},null,2));console.log(JSON.stringify(summary));
