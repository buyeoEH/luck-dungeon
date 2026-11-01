const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert'),Module=require('module');
// Run the identical frozen policy on the shipped RC2 and the new presentation.
const loader=new Module(path.join(__dirname,'p5-test-loader.cjs'),module);loader.filename=path.join(__dirname,'p5-test-loader.cjs');loader.paths=module.paths;
let src=fs.readFileSync(path.join(__dirname,'p5-node.cjs'),'utf8');
src=src.replace("const root=path.join(R,'_site/preview',variant==='baseline'?'v0.2.20':'v0.3.0');","const root=variant==='rc2'?path.join(R,'../battle-prep-baseline'):path.join(R,'_site/preview/v0.3.0');");
loader._compile(src,loader.filename);const {create}=loader.exports;
const stable=r=>JSON.stringify(Object.fromEntries(['trace','final','first_shop','random_calls','rewards'].map(k=>[k,r[k]])));
const q=(d,s)=>vm.runInContext(s,d.getInternalVMContext());
const pairs=[];let forecasts=0,base,now;
for(let i=0;i<160;i++){
 if(i%20===0){base?.window.close();now?.window.close();base=create('rc2');now=create('full');
  q(now,`window.__forecastChecks=0;const actualBattle=battle;battle=function(){
    const state=()=>JSON.stringify({enemies,prot,stats,deck,hand,draw,graveyard,phase,resource,gems,linkComboAttack,roundLinkDone,p1Round:{...p1Round,lances:[...p1Round.lances],paidLances:[...p1Round.paidLances]}});
    const before=state(),plan=battlePreparationPlan();battlePreparationPlan();
    if(before!==state())throw Error('forecast mutated game state');
    actualBattle();const scene=pendingBattleScene;
    for(const row of plan.rows){
      const events=scene.events.flatMap(e=>e.type==='aoe'?e.hits:[e]).filter(e=>e.id===row.id);
      const damage=events.reduce((n,e)=>n+e.damage,0);
      if(damage!==row.before-row.hp)throw Error('forecast mismatch '+JSON.stringify({round,row,events}));
    }
    window.__forecastChecks++;
  };`);
 }
 const cfg={seed:101+i,profile:['aoe','economy','balanced','pierce','luck','link','attack'][i%7],reward_policy:['reroll','restock','random','stone'][i%4],mode:'normal',random_cards:3,trace:true};
 const a=base.window.P5Harness.run(cfg),b=now.window.P5Harness.run(cfg);
 assert.equal(stable(a),stable(b),'gameplay changed for seed '+cfg.seed);assert.equal(b.object_object_count,0);
 pairs.push({seed:cfg.seed,profile:cfg.profile,reward:cfg.reward_policy,same:true});
 if(i%20===19){forecasts+=now.window.__forecastChecks;console.log('pairs',i+1,'forecasts',forecasts);}
}
base.window.close();now.window.close();
fs.mkdirSync(path.join(__dirname,'battle-preparation-results'),{recursive:true});
fs.writeFileSync(path.join(__dirname,'battle-preparation-results/regression.json'),JSON.stringify({pairs,forecasts,object_logs:0},null,2));
console.log('PASS 160 paired runs; '+forecasts+' battle forecasts match actual damage; state unchanged.');
