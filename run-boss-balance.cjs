const {create,q}=require('./boss-ai.cjs'),fs=require('fs');
const N=Number(process.env.BOSS_RUNS||100),factors=(process.env.BOSS_FACTORS||'0.5,0.75,1,1.25,1.5').split(',').map(Number),out=process.env.BOSS_OUTPUT||'boss-balance-results.json';
const crypto=require('crypto');const provenance={policy:'boss-skill-proxy-v2',engine_sha256:crypto.createHash('sha256').update(fs.readFileSync('_site/preview/v0.3-ap-final/game.js')).digest('hex'),policy_sha256:crypto.createHash('sha256').update(fs.readFileSync('boss-ai.cjs')).digest('hex'),build:JSON.parse(fs.readFileSync('_site/preview/v0.3-ap-final/build.json','utf8')),seed_start:Number(process.env.BOSS_SEED_START||101)};
const rows=[];const base=JSON.parse(fs.readFileSync('boss-table.json','utf8'));
for(const factor of factors)for(const skill of ['novice','skilled','expert']){
 let d;for(let i=0;i<N;i++){if(i%25===0){d?.window.close();d=create({skill});d.window.LUCK_BOSS_TABLE=base.map(x=>({...x,shield:Math.max(1,Math.round(x.shield*factor)),core:Math.max(1,Math.round(x.core*factor))}));}
 const seed=provenance.seed_start+i,profile=skill==='novice'?'balanced':skill==='skilled'?'balanced':(process.env.BOSS_EXPERT_PROFILE||'aoe');
 const r=d.window.BossRun({seed,profile,skill,reward_policy:'random',mode:'normal',trace:false});rows.push({factor,skill,seed,profile,clear:r.clear,round:r.round,boss_failure:r.boss_failure,steps:r.steps,stats:r.stats,boss_timeline:r.boss_timeline,battles:r.battles});}
 d.window.close();const group=rows.filter(x=>x.factor===factor&&x.skill===skill),rounds=group.map(x=>x.round).sort((a,b)=>a-b);console.log(JSON.stringify({factor,skill,n:N,clear:group.filter(x=>x.clear).length,median_round:rounds[Math.floor(N/2)],boss_timeouts:group.filter(x=>x.boss_failure).length}));fs.writeFileSync(out,JSON.stringify({provenance,base,rows}));
}
