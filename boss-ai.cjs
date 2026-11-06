const fs=require('fs'),path=require('path'),vm=require('vm');
const {JSDOM,VirtualConsole}=require(process.env.P5_JSDOM_PATH||path.join(__dirname,'../ap-runtime/node_modules/jsdom'));
function create({root=path.join(__dirname,'_site/preview/v0.3-ap-final'),skill='skilled'}={}){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://luck.test',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:new VirtualConsole()});const w=dom.window;
 w.fetch=()=>Promise.reject(Error('offline QA'));w.scrollTo=()=>{};w.structuredClone=structuredClone;w.crypto.randomUUID=require('crypto').randomUUID;
 for(const s of [...w.document.scripts])vm.runInContext(s.src?fs.readFileSync(path.join(root,s.getAttribute('src').split('?')[0]),'utf8'):s.textContent,dom.getInternalVMContext());
 Object.defineProperty(w.Element.prototype,'innerHTML',{get(){return '';},set(v){},configurable:true});w.Element.prototype.insertAdjacentHTML=()=>{};
 vm.runInContext("render=()=>{};focusSection=()=>{};actionFlash=()=>{};window.LuckGameAudio=undefined;log=s=>fullLogs.push('[R'+round+'] '+plainLogText(s));",dom.getInternalVMContext());
 let ai=fs.readFileSync(path.join(__dirname,'v030-reference-ai.js'),'utf8');
 ai=ai.replace('function value(c,profile){',`function value(c,profile){
 const key=c.baseId||c.id;
 if(window.BOSS_AI_SKILL==='novice')return ({hand:95,big:100,gem:30,sword:50,sam:55,aoe:60,pike:35,chain:35}[key]||30)+(c.atk||0);
 if(c.apGain)return 180+c.apGain*45;
 if(window.BOSS_AI_SKILL==='expert'){
 const eco=deck.filter(x=>['resource','gem'].includes(x.type)).length/Math.max(1,deck.length),aoes=deck.filter(x=>x.aoe||x.perEnemy||x.passive==='aoe').length;
 let v=(W[profile][key]??(30+(c.atk||0)*2+(c.draw||0)*10+(c.aoe||0)*3+(c.pierce||0)*12));
 if(['hand','big','gem','furnace','skill','foreman'].includes(key))v*=eco<.3?1.5:eco>.5?.35:.8;
 if(c.aoe||c.perEnemy||c.passive==='aoe')v*=aoes<2?1.9:aoes>=4?.5:1;
 if(c.type==='attack'||c.type==='specialAttack')v*=round>=10?1.5:1.1;
 return v;
 }
 `);
 ai=ai.replace('function promotions(profile){',"function promotions(profile){if(window.BOSS_AI_SKILL==='novice')return;");
 const from="const i=hand.findIndex(c=>!['attack','specialAttack','curse'].includes(c.type)&&(c.type!=='promotionStone'||stoneRecipes().length)&&(c.type!=='remove'||deck.some(x=>x.id!==c.id&&cardKey(x)==='mine')));";
 const to=`let options=hand.map((c,i)=>({c,i})).filter(({c})=>!['attack','specialAttack','curse'].includes(c.type)&&(c.type!=='promotionStone'||stoneRecipes().length)&&(c.type!=='remove'||deck.some(x=>x.id!==c.id&&cardKey(x)==='mine')));
 if(window.BOSS_AI_SKILL==='expert')options.sort((a,b)=>{
 const score=c=>{let x=c.apGain?1000:0;const tag=actionTag(c);for(const l of ACTION_LINKS){if(roundLinkDone['a_'+l.id])continue;const k=l.seq.length-1;if(l.seq.at(-1)===tag&&roundActionHistory.slice(-k).every((t,j)=>t===l.seq[j])&&roundActionHistory.length>=k)x+=200;}
 x+=['resource','gem'].includes(c.type)?90:c.draw?80:c.type==='promotionStone'?70:30;
 if((c.type==='aoeAttack'||c.p1Gauge)&&bossStageActive())x+=50;return x-(apCost(c)||0)*8;};return score(b.c)-score(a.c);
 });
 let selected=options.find(({c})=>apCanUse(c));
 if(!selected&&window.BOSS_AI_SKILL==='expert'&&gems>0&&options.length){const c=options[0].c;while(!apCanUse(c)&&gems>0)useGem(false);if(apCanUse(c))selected=options[0];}
 const i=selected?.i??-1;`;
 if(!ai.includes(from))throw Error('hand policy anchor');ai=ai.replace(from,to);
 // Use the current discounted prices and reserve one gem when a purchase needs AP.
 ai=ai.replace("...BASIC.map(c=>({...c,group:'basic'})),...randomShop.map(c=>({...c,group:'random'}))","...BASIC.map(c=>({...c,price:p5Price(c),group:'basic'})),...randomShop.map(c=>({...c,price:p5Price(c),group:'random'}))");
 ai=ai.replace('.filter(c=>c.price<=resource+2*gems',".filter(c=>(apState.points>0||(window.BOSS_AI_SKILL!=='novice'&&gems>0))&&c.price<=resource+(window.BOSS_AI_SKILL==='novice'?0:2*Math.max(0,gems-(apState.points>0?0:1)))");
 ai=ai.replace("const c=offers[0];while(resource<c.price&&gems>0)useGem(false);", "const c=offers[0];if(apState.points<1&&window.BOSS_AI_SKILL!=='novice'&&gems>0)useGem(false);while(resource<c.price&&gems>0&&window.BOSS_AI_SKILL!=='novice')useGem(false,'resource');");
 ai=ai.replace("reward(choice);if(rewardRevealPending)","reward(choice);if(window.LuckP5Rewards?.enabled)LuckP5Rewards.botResolve(cfg.profile,value);if(rewardRevealPending)");
 ai=ai.replace("const choice={reroll:0,restock:1,random:2,stone:3}[cfg.reward_policy||'reroll'];", "const choice={reroll:0,restock:1,random:2,stone:3}[cfg.reward_policy||'random'];");
 ai=ai.replace("window.V030ReferenceAI={run,profiles:Object.keys(W),weights:W};", "window.BossPolicyValue=value;window.V030ReferenceAI={run,profiles:Object.keys(W),weights:W};");
 w.BOSS_AI_SKILL=skill;vm.runInContext(ai,dom.getInternalVMContext());
 const qa=dom.getInternalVMContext();w.BossRun=cfg=>{w.BOSS_AI_SKILL=cfg.skill||skill;const r=w.V030ReferenceAI.run(cfg);r.boss_timeline=w.LuckBoss.timeline();r.boss_failure=vm.runInContext('bossFailureReason',qa);r.skill=w.BOSS_AI_SKILL;delete r.metrics;return r;};
 return dom;
}
module.exports={create,q:(d,s)=>vm.runInContext(s,d.getInternalVMContext())};
