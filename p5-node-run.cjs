const fs=require('fs'),path=require('path'),crypto=require('crypto'),{create}=require('./p5-node.cjs');
const R=__dirname,w=Number(process.argv[2]||0),workers=Number(process.argv[3]||4),smoke=process.argv.includes('--smoke');
const configs=JSON.parse(fs.readFileSync(path.join(R,'p5-configs.json'),'utf8')).filter(c=>(c.seed-101)%workers===w&&(!smoke||c.seed<103));
const out=path.join(R,smoke?'p5-node-smoke':'p5-results');fs.mkdirSync(out,{recursive:true});const file=path.join(out,`worker-${w}.jsonl`),seen=new Set();
if(fs.existsSync(file)){const valid=[];for(const l of fs.readFileSync(file,'utf8').split('\n')){if(!l)continue;try{const r=JSON.parse(l);seen.add([r.experiment,r.profile,r.seed].join('|'));valid.push(l);}catch{break;}}fs.writeFileSync(file,valid.join('\n')+(valid.length?'\n':''));}
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(R,p))).digest('hex');const hashes={engine_sha:'15d136471bfc19e4cd21bb2e2dbf2218b7acc013',policy_sha256:sha('v030-reference-ai.js'),observer_sha256:sha('p5-probe.js'),runner_sha256:sha('p5-node-run.cjs'),host_sha256:sha('p5-node.cjs')};let pages={},count=0;const start=Date.now();
for(const c of configs){const key=[c.experiment,c.profile,c.seed].join('|');if(seen.has(key))continue;if(!pages[c.variant])pages[c.variant]=create(c.variant);const r=pages[c.variant].window.P5Harness.run({...c,baseline_git_sha:'110d54876a121909b9bd6074cf682b6d99944083',policy_sha256:hashes.policy_sha256});
 if(!r.persistent_draw||r.object_object_count)throw Error('Invalid run '+key);if(c.variant==='full'&&(r.git_sha!==hashes.engine_sha||r.source_tree_dirty||r.build_id!=='030-p1-5d62a9825cb6d2f9'))throw Error('Build drift');
 delete r.final;delete r.metrics;delete r.trace;Object.assign(r,hashes,{variant:c.variant});fs.appendFileSync(file,JSON.stringify(r)+'\n');count++;seen.add(key);
 if(count%50===0){for(const p of Object.values(pages))p.window.close();pages={};if(global.gc)global.gc();}
 if(count%100===0)console.log(w,count,'new',seen.size,'total',Math.round((Date.now()-start)/1000),'s');
 if(count>=250)break;
}
for(const p of Object.values(pages))p.window.close();fs.writeFileSync(path.join(out,`execution-${w}.json`),JSON.stringify({...hashes,runs:seen.size,worker:w,platform:'Node.js '+process.version+' / jsdom 26.1.0; cross-validated against Chromium',seconds:(Date.now()-start)/1000},null,2));
