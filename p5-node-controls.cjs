const fs=require('fs'),crypto=require('crypto'),{create}=require('./p5-node.cjs');
const canonical=v=>v===null||typeof v!=='object'?v:Array.isArray(v)?v.map(canonical):Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])]));
const rows=fs.readFileSync('p5-controls/chromium.jsonl','utf8').trim().split('\n').filter(Boolean).map(JSON.parse);const out=[];let d;
for(let i=0;i<rows.length;i++){
 if(i%20===0){d?.window.close();d=create('full');}
 const x=rows[i],r=d.window.P5Harness.run({...x.config,trace:true,baseline_git_sha:'110d54876a121909b9bd6074cf682b6d99944083'});
 const state=Object.fromEntries(['trace','final','first_shop','random_calls','rewards'].map(k=>[k,r[k]]));
 const h=crypto.createHash('sha256').update(JSON.stringify(canonical(state),(_key,value)=>value===undefined?null:value)).digest('hex');if(h!==x.stable_sha256)throw Error('Host regression '+x.config.seed);out.push({seed:x.config.seed,same:true,sha256:h});
}
d?.window.close();fs.writeFileSync('p5-controls/node-pairs.json',JSON.stringify(out,null,2));console.log('cross-host complete',out.length);
