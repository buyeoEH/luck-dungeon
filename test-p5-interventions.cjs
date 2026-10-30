const assert=require('assert'),vm=require('vm'),fs=require('fs'),{create}=require('./p5-node.cjs');const checks=[];
for(const n of [1,2,3]){
 const d=create('full');d.window.P5Harness.run({experiment:'random'+n,profile:'balanced',seed:101,reward_policy:'random',random_cards:n,mode:'normal'});
 const result=vm.runInContext(`(()=>{phase='reward';rewardLocked=false;bossReward();let count=0;const old=addNewCard;addNewCard=function(c){count++;return old.apply(this,arguments);};reward(2);addNewCard=old;return count;})()`,d.getInternalVMContext());assert.strictEqual(result,n);checks.push({random_cards:n,actual_reward_additions:result,passed:true});d.window.close();
}
for(const mode of ['no_conversion','no_effects']){
 const d=create('full');const r=d.window.P5Harness.run({experiment:mode,profile:'link',seed:110,reward_policy:'random',random_cards:3,mode});assert(r.audit.battles.every(b=>b.converted_pierce===0));if(mode==='no_effects'){assert.strictEqual(r.stats.aoeDamage,0);assert.strictEqual(r.stats.pierceDamage,0);assert(r.audit.acquiredEffects.length>0);}checks.push({mode,passed:true});d.window.close();
}
fs.mkdirSync('p5-controls',{recursive:true});fs.writeFileSync('p5-controls/intervention-tests.json',JSON.stringify(checks,null,2));console.log('5 intervention checks passed');
