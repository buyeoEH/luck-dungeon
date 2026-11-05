const fs=require('fs'),path=require('path'),vm=require('vm'),Module=require('module'),assert=require('assert');
function host(root){const m=new Module(path.join(__dirname,'v032-loader.cjs'),module);m.filename=path.join(__dirname,'v032-loader.cjs');m.paths=module.paths;m._compile(fs.readFileSync(path.join(__dirname,'ap-node.cjs'),'utf8').replace("path.join(R,'_site/preview/v0.3-ap')",JSON.stringify(root)),m.filename);return m.exports.create('promo');}
const q=(d,s)=>vm.runInContext(s,d.getInternalVMContext());
const root=path.join(__dirname,'_site/preview/v0.3-ap-final'),d=host(root);
q(d,"AutoLab.begin(101);hand=[];deck=[];enemies=[];round=1;phase='hand';resetStats();p1ResetRun();apState.points=2;gems=5;");
q(d,'useGem(true)');assert.equal(q(d,'gems'),4);assert.equal(q(d,'apState.points'),3);
q(d,"registerActionLink({id:'m',name:'채굴',type:'resource'},[]);registerActionLink({id:'d',name:'드로우',type:'draw'},[]);");assert.equal(q(d,'linkComboAttack'),6);assert.equal(q(d,'LuckLinkView.snapshot().entries.length'),1);assert.equal(q(d,'LuckLinkView.snapshot().entries[0].amount'),6);
q(d,"registerActionLink({id:'m2',name:'채굴',type:'resource'},[]);registerActionLink({id:'d2',name:'드로우',type:'draw'},[]);");assert.equal(q(d,"LuckLinkView.snapshot().entries.filter(e=>e.id==='a_economy_draw').length"),1);
q(d,"p1Used({id:'seal',name:'증폭 문장',type:'link',p1Gauge:15},[]);");assert.equal(q(d,'p1Round.gaugeBonus'),15);assert.equal(q(d,'LuckLinkView.snapshot().entries.at(-1).amount'),15);
q(d,"p1Used({id:'lance-one',name:'관통창',type:'pierce',p1Lance:true},[]);p1Used({id:'lance-one',name:'관통창',type:'pierce',p1Lance:true},[]);");assert.equal(q(d,'p1Round.gaugeBonus'),23);
q(d,"p1RoundStart();linkComboAttack=0;roundActionHistory=[];roundLinkDone={};");assert.equal(q(d,'LuckLinkView.snapshot().entries.length'),0);
for(const [n,pct,pierce] of [[0,0,0],[19,0,0],[20,5,1],[40,10,2],[60,15,3],[80,20,4],[120,20,4]]){q(d,'linkComboAttack='+n);const m=q(d,'attackParts().p1');assert.equal(m.attackPct,pct);assert.equal(m.pierceBonus,pierce);assert.equal(m.gaugeNet,n);}
q(d,'p1Round.step=10;linkComboAttack=30');assert.equal(q(d,'attackParts().p1.pierceBonus'),3);
q(d,"linkComboAttack=40;enemies=[{name:'디버프',hp:100,d:{type:'combo',p:50},debuffZone:1}];");
const before=q(d,'JSON.stringify({enemies,linkComboAttack,roundActionHistory,stats,ap:apState,round,p1:p1Round.gaugeBonus})');for(let i=0;i<20;i++)q(d,'LuckLinkView.model()');assert.equal(q(d,'JSON.stringify({enemies,linkComboAttack,roundActionHistory,stats,ap:apState,round,p1:p1Round.gaugeBonus})'),before);
q(d,"enemies=[];p1Round.step=20;linkComboAttack=40;p1Round.gaugeBonus=20;");
const reduced=q(d,"p1Parts(80,40,{combo:{pct:0,flat:40}},100)");assert.equal(reduced.gaugeRaw,60);assert.equal(reduced.gaugeNet,36);assert.equal(reduced.percentBonus,5);
q(d,"p1RoundStart();linkComboAttack=70;phase='battle';window.qaScene={events:[]};p1BattleDone(qaScene,p1Capture(attackParts()));");assert.equal(q(d,'qaScene.p1.nextGuard'),1);assert.equal(q(d,'qaScene.p1.nextDraw'),1);const nd=q(d,'nextDraw');q(d,'p1BattleDone(qaScene,p1Capture(attackParts()))');assert.equal(q(d,'nextDraw'),nd);
q(d,"p1RoundStart();linkComboAttack=90;window.qaEmptyScene={events:[]};p1BattleDone(qaEmptyScene,null);");assert.equal(q(d,'LuckLinkView.model().m.gaugeNet'),0);assert.equal(q(d,'LuckLinkView.model().raw'),90);assert.equal(q(d,'LuckLinkView.model().m.step'),20);
const source=fs.readFileSync(path.join(root,'game.js'),'utf8');assert(!source.includes('onclick="useGem(true)"'));assert(source.includes('const n=1; // v0.3.2'));d.window.close();
if(process.argv.includes('--features-only')){console.log('PASS v032 feedback, dedupe, source ledger, thresholds, custom pierce step, read purity, single-gem guard');process.exit(0);}
const stable=r=>JSON.stringify(Object.fromEntries(['trace','final','first_shop','random_calls','rewards'].map(k=>[k,r[k]])));
let old,now;for(let i=0;i<160;i++){
 if(i%20===0){old?.window.close();now?.window.close();old=host(path.join(__dirname,'../ap-before-v032'));now=host(root);q(old,'const gemBefore032=useGem;useGem=function(all,target){return gemBefore032(false,target)};');}
 const cfg={seed:101+i,profile:['aoe','economy','balanced','pierce','luck','link','attack'][i%7],reward_policy:['reroll','restock','random','stone'][i%4],mode:'normal',random_cards:3,trace:true};
 assert.equal(stable(old.window.P5Harness.run(cfg)),stable(now.window.P5Harness.run(cfg)),'unintended rules drift '+cfg.seed);
 if(i%40===39)console.log('v032 regression',i+1);
}old.window.close();now.window.close();console.log('PASS 160 paired seeds; former build adapted to single-gem conversion only');
