const fs=require('fs'),path=require('path'),assert=require('assert'),{create,q}=require('./boss-ai-v313.cjs');
const live=path.join(__dirname,'_site/preview/v0.3-ap-final'),base=path.join(__dirname,'media319-baseline');
for(const name of fs.readdirSync(live))if(!fs.existsSync(path.join(base,name)))fs.symlinkSync(path.join(live,name),path.join(base,name));
function clean(x){if(Array.isArray(x))return x.map(clean);if(x&&typeof x==='object')return Object.fromEntries(Object.entries(x).filter(([k])=>!['id','instance_id','instance_ids','instance','target_id','processed','created_at','completed_at','officialPlayMs','sourceInstance'].includes(k)).map(([k,v])=>[k,clean(v)]));return typeof x==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x)?'_instance_':x;}
const a=create({root:base,skill:'expert'}),b=create({root:live,skill:'expert'}),rows=[];
for(const profile of ['balanced','pierce','luck','link'])for(const seed of [101,102,103,104,201,202,203,204]){
 const cfg={seed,profile,skill:'expert',reward_policy:'mega',trace:false},x=a.window.BossRun(cfg),y=b.window.BossRun(cfg);
 for(const key of ['clear','round','steps','random_calls','first_shop','boss_timeline','boss_failure'])assert.equal(JSON.stringify(clean(y[key])),JSON.stringify(clean(x[key])),profile+'/'+seed+'/'+key);
 // Check numeric outcome counters rather than elapsed time / physical instance IDs.
 for(const [key,v]of Object.entries(x.stats))if(typeof v==='number'||typeof v==='boolean')assert.equal(y.stats[key],v,profile+'/'+seed+'/stats/'+key);
 assert.equal(JSON.stringify(clean(q(a,'[...CARD_CATALOG_313.values()].map(c=>{const a={...c};return a})'))),JSON.stringify(clean(q(b,'[...CARD_CATALOG_313.values()].map(c=>{const a={...c};return a})'))),'card definitions unchanged');
 rows.push({profile,seed,round:y.round,clear:y.clear,random_calls:y.random_calls,matched:true});
}
a.window.close();b.window.close();fs.writeFileSync('main-media319-regression-results.json',JSON.stringify({pass:true,paired_runs:rows.length,scope:'v0.3.18 vs v0.3.19 media-only: same seeded choices/RNG/rounds/boss outcomes/numeric stats/card definitions',rows},null,2));console.log('PASS '+rows.length+' seeded gameplay pairs unchanged');
