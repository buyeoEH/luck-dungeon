const fs=require('fs'),crypto=require('crypto'),{create,q}=require('./boss-ai.cjs');const rows=[];let d;
for(const disabled of [false,true])for(const profile of ['balanced','attack','aoe']){
 for(let seed=101;seed<=120;seed++){
  if(!d||seed===101||seed%10===1){d?.window.close();global.gc?.();d=create({skill:'expert'});}
  d.window.LUCK_GUARD_QA_NO_PROTECTION=disabled;
  const r=d.window.BossRun({seed,profile,skill:'expert',reward_policy:'random',trace:false});const guard=q(d,'({...guardStats})');if(guard.ineffective)throw Error('ineffective protection');if(disabled&&guard.spent)throw Error('disabled condition spent protection');
  rows.push({seed,profile,disabled,clear:r.clear,round:r.round,guard,protectionPoints:r.stats.protectionPointsUsed});
 }
 const g=rows.filter(r=>r.disabled===disabled&&r.profile===profile);console.log(JSON.stringify({disabled,profile,runs:g.length,clear:g.filter(x=>x.clear).length,firepower:g.reduce((n,x)=>n+x.guard.firepower,0),resource:g.reduce((n,x)=>n+x.guard.resource,0),gems:g.reduce((n,x)=>n+x.guard.gems,0),spent:g.reduce((n,x)=>n+x.guard.spent,0)}));
}
d?.window.close();const out={engine_sha256:crypto.createHash('sha256').update(fs.readFileSync('_site/preview/v0.3-ap-final/game.js')).digest('hex'),runs:rows.length,rows};fs.writeFileSync('protection-measurement.json',JSON.stringify(out,null,2));
