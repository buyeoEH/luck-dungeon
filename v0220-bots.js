/* Shared-seed comparison uses the real engine. No HP, prices, spawn or rewards are changed. */
(function(){'use strict';
const profiles={pure:{gold:150,sam:130,combo:145,master:120,hand:80,chain:75,rd:60,big:55},aoe:{chainblast:200,aoe:130,bomber:140,meteor:120,hand:80,chain:80},pierce:{lance:180,pike:180,sam:100,hand:80,chain:75},economy_link:{chain:160,hand:140,rd:110,d8:130,gem:100,big:110,combo:120},luck:{dice:180,box:180,coin:160,spark:150,hand:90,chain:90}};
function banned(c){return !!(c.aoe||c.perEnemy||c.pierce||c.passive==='aoe'||c.passive==='pierce'||c.type==='aoeAttack'||c.type==='pierce'||c.type==='random');}
function promoteAll(profile){for(let n=0;n<4;n++){const p=PROMOS.filter(p=>canPromote(p)&&(profile!=='pure'||!banned(p.card))).sort((a,b)=>(b.tier||1)-(a.tier||1)||(b.card.atk||0)-(a.card.atk||0))[0];if(!p)break;promote(p.id);}}
function run(profile,seed,limit=260){AutoLab.begin(seed);let failure=null,steps=0;const rounds=[];for(;steps<limit;steps++){try{
 if(officialRecord||phase==='gameover')break;
 if(phase==='hand'){for(let n=0;n<80;n++){const i=hand.findIndex(c=>!['attack','specialAttack','curse','remove','promotionStone'].includes(c.type));if(i<0)break;use(i);}next();}
 else if(phase==='shop'){promoteAll(profile);for(let n=0;n<4;n++){const options=[...BASIC.map(c=>({...c,group:'basic'})),...randomShop.map(c=>({...c,group:'random'}))].filter(c=>c.price<=resource+gems*2&&(buyCount[c.id]||0)<c.limit&&(profile!=='pure'||!banned(c)));if(!options.length)break;const w=profiles[profile];const score=c=>{let v=w[c.id]??(20+(c.atk||0)*2+(c.draw||0)*7);if(round<9&&['hand','big','rd','gem'].includes(c.id))v+=70;if(round>=12&&(c.atk||0)>0)v+=round*3;for(const p of PROMOS){if(profile==='pure'&&banned(p.card))continue;const missing=Object.entries(p.from).map(([k,n])=>({k,n:Math.max(0,n-countInDeck(k))})).filter(x=>x.n);if(missing.length&&missing.reduce((a,x)=>a+x.n,0)<=2&&missing.some(x=>x.k===c.id))v+=80;}return v/(1+c.price*.03);};options.sort((a,b)=>score(b)-score(a));const c=options[0];while(resource<c.price&&gems>0)useGem(false);if(resource<c.price)break;if(c.group==='basic')buyBasic(c.id);else buyRandom(c.id);promoteAll(profile);}next();}
 else if(phase==='battle'){const r=round;next();rounds.push({round:r,enemy_count:enemies.length,enemy_hp:total(),attack:pendingBattleScene?.attackFinal,attack_loss:pendingBattleScene?.attackLoss,resource,gems,promotions:stats.promotions,deck:deck.map(Luck220.card),aoe:pendingBattleScene?.aoe,pierce:pendingBattleScene?.pierce});}
 else if(phase==='reward'){reward(1);}
 }catch(e){failure=String(e.stack||e);break;}}
 const s=Luck220.snapshot(),acquired=s.events.filter(e=>e.event_type==='card_acquired');const contamination=profile==='pure'?acquired.filter(e=>banned(e.payload)):[];
 const result={profile,seed,steps,finished:!!officialRecord||phase==='gameover',cleared:!!officialRecord,round,score:officialRecord?.score??scoreValue(),error:failure,first_shop:s.initial_shop,stats:JSON.parse(JSON.stringify(stats)),rounds,events:s.events,final_deck:deck.map(Luck220.card),contamination,reason:phase==='gameover'?(enemies.length>gameOverEnemyLimit(round)?'enemy_count':'enemy_hp'):officialRecord?'R30_clear':'step_limit',version:LUCK_BUILD.version,build_id:LUCK_BUILD.build_id};AutoLab.restore();return result;
}
window.StabilityBots={run,banned,profiles:Object.keys(profiles)};
})();
