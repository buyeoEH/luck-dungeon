const fs=require('fs'),vm=require('vm');const {create,q}=require('./boss-ai.cjs');
const rows=[];const core=Number(process.argv[2]||24),runs=Number(process.argv[3]||200);let d;
for(const policy of ['attack','mixed','draw_first'])for(let seed=101;seed<101+runs;seed++){
 if(!d||(seed-101)%25===0){d?.window.close();global.gc?.();d=create();}
 q(d,`window.LUCK_BOSS_TABLE[0].core=${core};AutoLab.begin(${seed});`);
 const r=q(d,`(()=>{const buys=[],turns=[];let steps=0;while(steps++<50&&phase!=='gameover'&&round<=5&&!(round===5&&bossEncounter?.cleared)){
 if(phase==='hand'){for(let i=0;i<150;i++){const n=hand.findIndex(c=>!['attack','specialAttack','curse'].includes(c.type)&&apCanUse(c));if(n<0)break;use(n);}next();}
 else if(phase==='shop'){for(let i=0;i<20;i++){
 const weights=${JSON.stringify(policy==='attack'?{sam:150,gold:120,hand:65,big:55,chain:45,gem:30}:policy==='mixed'?{sam:100,gold:85,hand:110,big:100,chain:85,gem:60}:{sam:100,gold:85,hand:110,big:100,chain:85,gem:60})};
 if('${policy}'==='mixed'){if(deck.filter(c=>cardKey(c)==='hand').length>=2)weights.hand=45;if(deck.filter(c=>cardKey(c)==='big').length>=1)weights.big=40;}
 const choices=BASIC.filter(c=>(buyCount[c.id]||0)<c.limit&&p5Price(c)<=resource+2*Math.max(0,gems-(apState.points?0:1))).sort((a,b)=>weights[b.id]-weights[a.id]);
 if(!choices.length||(!apState.points&&!gems))break;const c=choices[0];if(!apState.points&&gems)useGem(false);while(resource<p5Price(c)&&gems)useGem(false,'resource');const before=stats.cardsBought;buyBasic(c.id);if(stats.cardsBought===before)break;buys.push({round,id:c.id});}next();}
 else if(phase==='battle'){const r=round;next();if(r===5)turns.push({turn:bossTimeline.at(-1)?.turn,attack:pendingBattleScene.attackFinal,left:enemies.map(e=>({boss:e.boss,hp:e.hp}))});}
 else break;}
 const result={seed:${seed},policy:'${policy}',core:${core},clear:round===5&&!!bossEncounter?.cleared,round,phase,buys,turns,promotions:stats.promotions,purchases_basic_only:buys.every(x=>BASIC.some(c=>c.id===x.id)),basic_catalog:BASIC.map(c=>c.id),growth_before_reward:{...bossGrowth}};AutoLab.restore();return result;})()`);if(!r.purchases_basic_only||r.basic_catalog.length!==6||r.promotions||r.growth_before_reward.hand||r.growth_before_reward.ap)throw Error('basic-only isolation failed');if(r.round!==5)throw Error('did not reach R5');rows.push(r);
}
d?.window.close();for(const policy of ['attack','mixed','draw_first']){const g=rows.filter(x=>x.policy===policy);console.log(JSON.stringify({policy,core,runs:g.length,clear:g.filter(x=>x.clear).length,fails:g.filter(x=>!x.clear).slice(0,2)}));}
fs.writeFileSync(require('path').join(__dirname,'basic-r5-'+core+'.json'),JSON.stringify(rows));
