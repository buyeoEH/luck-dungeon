const fs=require('fs'),{create}=require('./p5-node.cjs');fs.mkdirSync('p5b-openings',{recursive:true});const out=fs.openSync('p5b-openings/openings.jsonl','w');let d;
for(let seed=101;seed<=500;seed++){
 if((seed-101)%50===0){d?.window.close();d=create('full');if(global.gc)global.gc();}
 for(const pool of [32,34])fs.writeSync(out,JSON.stringify(d.window.P5B.opening(seed,pool))+'\n');
}
d.window.close();fs.closeSync(out);console.log('800 paired openings');
