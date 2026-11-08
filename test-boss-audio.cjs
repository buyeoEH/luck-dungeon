const vm=require('vm'),fs=require('fs'),assert=require('assert');
const played=[],audios=[],listeners={};let state=null;
class Audio{
 constructor(){this.dataset={};this.paused=true;audios.push(this);}
 canPlayType(){return 'probably';}
 play(){this.paused=false;played.push(this.dataset.id);return Promise.resolve();}
 pause(){this.paused=true;}
}
const elements={welcomeOverlay:{classList:{contains:()=>true}}};
const ctx={Audio,URL,performance,console,round:5,phase:'hand',pendingRoundBriefing:true,dangerActive:false,endlessMode:false,
 document:{baseURI:'https://luck.test/',hidden:false,getElementById:id=>elements[id]||null,addEventListener:(id,fn)=>listeners[id]=fn},
 setTimeout:()=>1,clearTimeout:()=>{},LuckBoss:{state:()=>state},addEventListener:()=>{}};
ctx.window=ctx;vm.createContext(ctx);
vm.runInContext(fs.readFileSync('_site/preview/v0.3-ap-final/luck-audio.js','utf8'),ctx);
const a=ctx.LuckGameAudio,flush=()=>new Promise(resolve=>setImmediate(resolve));
(async()=>{
 a.unlock();a.setBgmEnabled(true);a.runStart();await flush();
 state={round:5,turn:1,cleared:false};a.sync();await flush();
 assert.equal(a.snapshot().bgm,'boss_bgm_prepare');assert.equal(played.filter(x=>x==='boss_cue_enter').length,1);
 const count=audios.length;a.sync();await flush();assert.equal(audios.length,count,'same phase restarted audio');
 ctx.phase='shop';a.sync();await flush();assert.equal(a.snapshot().bgm,'boss_bgm_prepare');
 ctx.phase='battle';ctx.pendingRoundBriefing=false;a.sync();await flush();assert.equal(a.snapshot().bgm,'boss_bgm_battle');
 state.turn=3;ctx.phase='hand';ctx.pendingRoundBriefing=true;a.sync();await flush();
 assert.equal(a.snapshot().bgm,'boss_bgm_final_turn');assert.equal(played.filter(x=>x==='boss_cue_last_turn').length,1);
 ctx.phase='battle';ctx.pendingRoundBriefing=false;a.sync();await flush();assert.equal(played.filter(x=>x==='boss_cue_last_turn').length,1);
 const final=audios.find(x=>x.dataset.id==='boss_bgm_final_turn');a.setBgmEnabled(false);assert(final.paused);
 a.setBgmEnabled(true);await flush();assert(!final.paused);
 a.bossImpact({damage:10,shieldDamage:10,coreDamage:0},'strike',false);assert(played.includes('boss_sfx_shield_hit_01'));
 a.bossImpact({damage:15,shieldDamage:10,coreDamage:5},'strike',true);assert(played.includes('boss_sfx_shield_break'));
 a.bossImpact({damage:10,shieldDamage:0,coreDamage:10},'pierce',false);assert(played.includes('boss_sfx_body_hit_02'));assert(played.includes('boss_sfx_pierce'));
 const sfxCount=played.length;a.setSfxEnabled(false);a.bossImpact({damage:10,coreDamage:10},'strike',false);assert.equal(played.length,sfxCount);a.setSfxEnabled(true);
 a.cinematicStart();state.cleared=true;a.bossResult({round:5,turn:3,clear:true},true);assert(!played.includes('boss_cue_victory'));
 a.cinematicEnd();await flush();assert.equal(played.filter(x=>x==='boss_cue_victory').length,1);assert.equal(a.snapshot().scene,null);
 assert(audios.findLast(x=>x.dataset.id==='boss_cue_victory').paused===false,'sync cut off victory cue');
 ctx.round=6;state=null;ctx.phase='hand';a.sync();await flush();assert.equal(a.snapshot().bgm,'bgm_round');
 a.runStart();ctx.round=10;state={round:10,turn:3,cleared:false};a.bossResult({round:10,turn:3,clear:false},false);a.endRun();
 assert.equal(played.filter(x=>x==='boss_cue_timeout').length,1);assert(!played.includes('cue_run_end'));assert.equal(a.snapshot().scene,null);
 state=null;a.runStart();ctx.round=15;state={round:15,turn:1,cleared:false};
 a.battlePrepared({enemyStart:[{id:0,boss:true,shield:12}],events:[{type:'strike',id:0,damage:20,shieldDamage:12,coreDamage:8}]},false,false);
 assert.equal(played.filter(x=>x==='boss_sfx_shield_break').length,2,'skip mode missed shield break');
 a.bossResult({round:15,turn:1,clear:true},false);assert.equal(played.filter(x=>x==='boss_cue_victory').length,2);
 // A browser without OGG support must use the included MP3 fallback.
 const fallback=new ctx.LuckAudio();Audio.prototype.canPlayType=()=>'';assert(fallback.create('boss_bgm_prepare').src.endsWith('/assets/boss-audio/boss_bgm_prepare.mp3'));
 a.setBgmEnabled(false);a.setSfxEnabled(false);
 console.log('PASS boss preparation/battle/final music, no restart, one-shot cues, shield/core/pierce, skip mode, controls, terminal cues, normal restoration and MP3 fallback');
})().catch(e=>{console.error(e);process.exitCode=1});
