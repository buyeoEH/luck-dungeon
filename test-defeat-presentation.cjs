const fs=require('fs'),path=require('path'),vm=require('vm'),Module=require('module'),assert=require('assert');
function host(root){const m=new Module(path.join(__dirname,'defeat-test-loader.cjs'),module);m.filename=path.join(__dirname,'defeat-test-loader.cjs');m.paths=module.paths;let s=fs.readFileSync(path.join(__dirname,'ap-node.cjs'),'utf8').replace("path.join(R,'_site/preview/v0.3-ap')",JSON.stringify(root));m._compile(s,m.filename);return m.exports.create('promo');}
const q=(d,s)=>vm.runInContext(s,d.getInternalVMContext());
const root=path.join(__dirname,'_site/preview/v0.3-ap-final'),results=[];
for(const kind of ['count','hp','no_kill','aoe','pierce','r30'])for(const skip of [false,true]){
 const d=host(root);q(d,`AutoLab.begin(101);$('battleMotionSkipToggle').checked=${skip};phase='battle';round=${kind==='r30'?30:10};dangerActive=true;hand=[];draw=[];graveyard=[];prot={attack:0,resource:0,gem:0,combo:0,all:0};tempAttack=0;pierce=${kind==='pierce'?1:0};aoeAttack=${kind==='aoe'?5:0};linkComboAttack=0;p1ResetRun();pendingBattleScene=null;
 enemies=Array.from({length:${['count','aoe','pierce'].includes(kind)?8:2}},(_,i)=>({id:'foe'+i,name:'대상'+i,hp:${kind==='no_kill'?'10000':kind==='pierce'?'i<2?1:10000':'i===0?1:10000'},debuffZone:1}));
 window.__endCalls=0;const end=gameOver;gameOver=function(){window.__endCalls++;return end.apply(this,arguments);};playBattleCinematic=()=>{};
 battle();`);
 assert.equal(d.window.__endCalls,skip?1:0,kind+' defeat must wait for motion');
 if(!skip){
  assert.equal(q(d,'phase'),'battle');assert.equal(q(d,'pendingBattleScene.continuation'),'gameOver');assert.equal(q(d,'officialRecord'),null);
  const before=q(d,'JSON.stringify({stats,enemies,resource,gems,round,ap:LuckAP.snapshot()})');q(d,'battle();');assert.equal(before,q(d,'JSON.stringify({stats,enemies,resource,gems,round,ap:LuckAP.snapshot()})'),'repeat battle changed state');
  q(d,"finishBattleCinematic('nextRound');");assert.equal(q(d,'phase'),'gameover');assert.equal(d.window.__endCalls,1);assert.equal(q(d,'round'),kind==='r30'?30:10);assert.equal(q(d,'officialRecord'),null);
  q(d,"finishBattleCinematic('gameOver');");assert.equal(d.window.__endCalls,1,'duplicate continue finalized again');
 }
 results.push({kind,skip,pass:true});d.window.close();
}
const stable=r=>JSON.stringify(Object.fromEntries(['trace','final','first_shop','random_calls','rewards'].map(k=>[k,r[k]])));
let old,now;for(let i=0;i<160;i++){
 if(i%20===0){old?.window.close();now?.window.close();old=host(path.join(__dirname,'../ap-before-defeat'));now=host(root);}
 const cfg={seed:101+i,profile:['aoe','economy','balanced','pierce','luck','link','attack'][i%7],reward_policy:['reroll','restock','random','stone'][i%4],mode:'normal',random_cards:3,trace:true};
 assert.equal(stable(old.window.P5Harness.run(cfg)),stable(now.window.P5Harness.run(cfg)),'gameplay drift '+cfg.seed);
 if(i%20===19)console.log('defeat regression',i+1);
}old.window.close();now.window.close();
fs.mkdirSync(path.join(__dirname,'defeat-results'),{recursive:true});fs.writeFileSync(path.join(__dirname,'defeat-results/checks.json'),JSON.stringify({scenarios:results,regression_pairs:160},null,2));console.log('PASS 12 defeat scenarios and 160 unchanged gameplay pairs');
