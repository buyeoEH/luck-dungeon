const fs=require('fs'),path=require('path'),vm=require('vm'),Module=require('module'),assert=require('assert');
const {create}=require('./ap-node.cjs');
const loader=new Module(path.join(__dirname,'ap-final-loader.cjs'),module);loader.filename=path.join(__dirname,'ap-final-loader.cjs');loader.paths=module.paths;
let src=fs.readFileSync(path.join(__dirname,'ap-node.cjs'),'utf8').replace("path.join(R,'_site/preview/v0.3-ap')","path.join(R,'_site/preview/v0.3-ap-final')");loader._compile(src,loader.filename);
const finalCreate=loader.exports.create,run=d=>d.window.P5Harness;
const stable=r=>JSON.stringify(Object.fromEntries(['trace','final','first_shop','random_calls','rewards'].map(k=>[k,r[k]])));
let a,b;const rows=[];
for(let i=0;i<160;i++){
 if(i%20===0){a?.window.close();b?.window.close();a=create('promo');b=finalCreate('off');assert.equal(b.window.LuckAP.mode,'promo','final must ignore external OFF setting');}
 const cfg={seed:101+i,profile:['aoe','economy','balanced','pierce','luck','link','attack'][i%7],reward_policy:['reroll','restock','random','stone'][i%4],mode:'normal',random_cards:3,trace:true};
 const x=run(a).run(cfg),y=run(b).run(cfg);assert.equal(stable(x),stable(y),'final rules drift '+cfg.seed);assert.deepEqual(b.window.LuckAP.snapshot(),a.window.LuckAP.snapshot());rows.push({seed:cfg.seed,profile:cfg.profile,reward:cfg.reward_policy,same:true});
 if(i%20===19)console.log('final vs measured promo',i+1);
}
a.window.close();b.window.close();
const html=fs.readFileSync(path.join(__dirname,'_site/preview/v0.3-ap-final/index.html'),'utf8');assert(!html.includes('href="?ap='));assert(html.includes('<header class="dashboard"><span class="dash-item" id="apHud"'));assert(!html.includes('<body><div id="apHud"'));
fs.mkdirSync(path.join(__dirname,'ap-final-results'),{recursive:true});fs.writeFileSync(path.join(__dirname,'ap-final-results/regression.json'),JSON.stringify({pairs:rows,fixed_mode:'promo',mode_selection:false},null,2));
console.log('PASS 160 final/promo pairs; external OFF ignored; no candidate links; HUD inside dashboard');
