const fs=require('fs'),path=require('path'),crypto=require('crypto'),{create}=require('./ap-node.cjs');
const worker=Number(process.argv[2]||0),workers=Number(process.argv[3]||1),smoke=process.argv.includes('--smoke');
const modes=['off','shop','strong','new','promo'],profiles=['aoe','economy','balanced','pierce','luck','link','attack'];
const out=path.join(__dirname,'ap-results');fs.mkdirSync(out,{recursive:true});const file=path.join(out,smoke?'smoke-'+worker+'.jsonl':'runs-'+worker+'.jsonl');
const hashes=Object.fromEntries(['ap-node.cjs','run-action-points.cjs','v030-reference-ai.js','p5-node.cjs','p5b-policy.js','action-points.js'].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,f))).digest('hex')]));
const seen=new Set(fs.existsSync(file)?fs.readFileSync(file,'utf8').trim().split('\n').filter(Boolean).map(l=>{const r=JSON.parse(l);if(JSON.stringify(r.hashes)!==JSON.stringify(hashes))throw Error('stale batch');return [r.ap_mode,r.profile,r.seed].join('|');}):[]);
let d,count=0;const began=Date.now();
for(const mode of modes){d=create(mode);for(let seed=101;seed<=(smoke?102:300);seed++)if((seed-101)%workers===worker)for(const profile of profiles){
 const key=[mode,profile,seed].join('|');if(seen.has(key))continue;
 const cfg={seed,profile,reward_policy:'mixed',mode:'normal',random_cards:3,experiment:'ap-'+mode};const r=d.window.P5Harness.run(cfg);const ap=d.window.LuckAP.snapshot();
 if(r.object_object_count||ap.points<0||ap.events.some(e=>e.points<0))throw Error('invalid run '+key);
 const row={...r,ap_mode:mode,action_points:ap,policy_version:'v030-reference-policy-v1+ap-legality-refill-first-v1+p5b-mixed',hashes,baseline_git_sha:'f9a0eeb90a4b12ba6f4b4f5fac187c852d8c086e',within_limits_r30:r.clear&&r.battles.at(-1).within_limits};
 delete row.trace;delete row.final;delete row.metrics;fs.appendFileSync(file,JSON.stringify(row)+'\n');count++;
 if(count%70===0){console.log(worker,mode,count,Math.round((Date.now()-began)/1000)+'s');d.window.close();d=create(mode);if(global.gc)global.gc();}
 }d.window.close();}
console.log('DONE',worker,count,'runs',Math.round((Date.now()-began)/1000)+'s');
