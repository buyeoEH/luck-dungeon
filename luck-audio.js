/* LUCK audio v1 integration. Does not use the gameplay random generator. */
(function(global){
'use strict';
const tracks=[{"id":"bgm_title","title":"시작 전 · 운명의 문","file":"audio/bgm_title.ogg","duration":43.636,"loop":true,"bpm":88,"description":"직접 작곡한 합성 악기 기반 반복 음악"},{"id":"bgm_round","title":"라운드 진행 · 선택의 불씨","file":"audio/bgm_round.ogg","duration":53.333,"loop":true,"bpm":108,"description":"직접 작곡한 합성 악기 기반 반복 음악"},{"id":"bgm_battle","title":"전투 모션 · 뒤집는 한 수","file":"audio/bgm_battle.ogg","duration":41.739,"loop":true,"bpm":138,"description":"직접 작곡한 합성 악기 기반 반복 음악"},{"id":"bgm_danger","title":"위험모드 · 붉은 경계","file":"audio/bgm_danger.ogg","duration":25.6,"loop":true,"bpm":150,"description":"직접 작곡한 합성 악기 기반 반복 음악"},{"id":"bgm_infinite","title":"무한모드 · 끝없는 계단","file":"audio/bgm_infinite.ogg","duration":40.0,"loop":true,"bpm":144,"description":"직접 작곡한 합성 악기 기반 반복 음악"},{"id":"cue_round_clear","title":"일반 라운드 종료 · 작은 승리","file":"audio/cue_round_clear.wav","duration":3.0,"loop":false,"bpm":null,"description":"한 번 재생하는 전환 음악"},{"id":"cue_round30_clear","title":"30라운드 클리어 · 운명을 넘어서","file":"audio/cue_round30_clear.wav","duration":4.2,"loop":false,"bpm":null,"description":"한 번 재생하는 전환 음악"},{"id":"cue_infinite_enter","title":"무한모드 진입 · 다시 열린 문","file":"audio/cue_infinite_enter.wav","duration":3.6,"loop":false,"bpm":null,"description":"한 번 재생하는 전환 음악"},{"id":"sfx_attack_01","title":"일반 공격 1","file":"audio/sfx_attack_01.wav","duration":0.62,"loop":false,"bpm":null,"description":"짧은 합성 전투 효과음"},{"id":"sfx_attack_02","title":"일반 공격 2","file":"audio/sfx_attack_02.wav","duration":0.62,"loop":false,"bpm":null,"description":"짧은 합성 전투 효과음"},{"id":"sfx_attack_03","title":"일반 공격 3","file":"audio/sfx_attack_03.wav","duration":0.62,"loop":false,"bpm":null,"description":"짧은 합성 전투 효과음"},{"id":"sfx_aoe","title":"전체 공격 · 확산 충격","file":"audio/sfx_aoe.wav","duration":1.6,"loop":false,"bpm":null,"description":"짧은 합성 전투 효과음"},{"id":"sfx_pierce","title":"관통 공격 · 꿰뚫는 빛","file":"audio/sfx_pierce.wav","duration":0.95,"loop":false,"bpm":null,"description":"짧은 합성 전투 효과음"},{"id":"sfx_max_intro","title":"최대공격 소개 · 힘의 집결","file":"audio/sfx_max_intro.wav","duration":2.1,"loop":false,"bpm":null,"description":"짧은 합성 전투 효과음"},{"id":"sfx_max_hit","title":"최대공격 타격 · 운명 파쇄","file":"audio/sfx_max_hit.wav","duration":1.7,"loop":false,"bpm":null,"description":"짧은 합성 전투 효과음"},{"id":"cue_danger_enter","title":"위험모드 진입 · 경계 경보","file":"audio/cue_danger_enter.wav","duration":2.4,"loop":false,"bpm":null,"description":"짧은 합성 전투 효과음"},{"id":"cue_run_end","title":"30라운드 전 도전 종료 · 남은 불씨","file":"audio/cue_run_end.wav","duration":3.3,"loop":false,"bpm":null,"description":"패배/도전 종료 전환음"}];
class LuckAudio {
  constructor(){this.bg=null;this.loading=null;this.pending=null;this.serial=0;this.bgmOn=false;this.sfxOn=true;this.bgmVolume=.45;this.sfxVolume=.75;this.voices=new Set();this.attackVariant=0;}
  create(id){
    const t=tracks.find(t=>t.id===id);if(!t)throw Error('Unknown audio '+id);
    const a=new Audio();a.dataset.id=id;a.preload='none';
    const fallback=t.file.endsWith('.ogg')&&!a.canPlayType('audio/ogg; codecs="vorbis"');
    a.src=new URL('assets/'+(fallback?t.file.replace(/\.ogg$/,'.mp3'):t.file),document.baseURI).href;
    return a;
  }
  volume(){if(this.bg)this.bg.volume=this.bgmOn?this.bgmVolume*(this.voices.size ? .38 : 1):0;}
  setBgmEnabled(on){this.bgmOn=!!on;if(!on){this.serial++;if(this.bg)this.bg.pause();if(this.loading)this.loading.a.pause();this.loading=null;}this.volume();}
  setSfxEnabled(on){this.sfxOn=!!on;if(!on)this.stopSfx();}
  setVolumes(bgm,sfx){this.bgmVolume=Math.max(0,Math.min(1,bgm));this.sfxVolume=Math.max(0,Math.min(1,sfx));this.volume();for(const a of this.voices)a.volume=this.sfxVolume;}
  async playBgm(id){
    this.pending=id;if(!this.bgmOn||document.hidden)return false;
    if(this.loading&&this.loading.id!==id){this.serial++;this.loading.a.pause();this.loading=null;}
    if(this.bg?.dataset.id===id){try{if(this.bg.paused)await this.bg.play();this.volume();return true;}catch{return false;}}
    if(this.loading?.id===id)return this.loading.promise;
    if(this.loading)this.loading.a.pause();
    const n=++this.serial,a=this.create(id);a.loop=true;a.volume=this.bgmVolume;
    const loading={id,a,promise:null};this.loading=loading;
    loading.promise=(async()=>{
      try{
        try{await a.play();}catch{a.pause();return false;}
        if(n!==this.serial||!this.bgmOn||document.hidden){a.pause();return false;}
        if(this.bg)this.bg.pause();this.bg=a;this.volume();return true;
      }finally{if(this.loading===loading)this.loading=null;}
    })();
    return loading.promise;
  }
  async playSfx(id){
    if(!this.sfxOn||document.hidden)return false;
    if(id==='sfx_attack')id='sfx_attack_0'+(1+(this.attackVariant++%3));
    if(this.voices.size>=8){const old=this.voices.values().next().value;old.pause();old._release();}
    const a=this.create(id);a.volume=this.sfxVolume;let released=false;
    const release=()=>{if(released)return;released=true;clearTimeout(a._expiry);this.voices.delete(a);this.volume();};
    a._release=release;a.onended=release;a.onerror=release;
    a._expiry=setTimeout(release,1000+(tracks.find(t=>t.id===id).duration*1000));
    this.voices.add(a);this.volume();try{await a.play();return true;}catch{release();return false;}
  }
  stopSfx(id){for(const a of [...this.voices])if(!id||a.dataset.id===id){a.pause();a._release();}}
  stop(){this.serial++;if(this.bg){this.bg.pause();this.bg=null;}if(this.loading)this.loading.a.pause();this.loading=null;this.stopSfx();}
}
const sound=new LuckAudio();let unlocked=false,started=false,ended=false,cinematic=false;
let previousDanger=false,officialPlayed=false,infinitePlayed=false,run=0,previewKey='',battle=null,pendingRound=null;
const timers=new Set();
const silent=()=>!!global.__luckAutoLabBotActive||document.hidden;
function status(message){const el=document.getElementById('luckSoundStatus');if(el)el.textContent=message;}
function scene(){
  if(ended)return null;
  const welcome=document.getElementById('welcomeOverlay');
  if(!started||welcome&&!welcome.classList.contains('hide'))return 'bgm_title';
  if(typeof dangerActive!=='undefined'&&dangerActive)return 'bgm_danger';
  if(cinematic)return 'bgm_battle';
  return typeof endlessMode!=='undefined'&&endlessMode?'bgm_infinite':'bgm_round';
}
function bgm(){const id=scene();if(!id){sound.stop();return;}if(unlocked&&!silent()&&sound.bgmOn)void sound.playBgm(id).then(ok=>{if(!sound.bgmOn||scene()!==id)return;if(!ok)status('음악을 재생하려면 화면을 한 번 더 눌러주세요.');else status('');});}
function sfx(id){if(unlocked&&!silent())void sound.playSfx(id);}
function cancelTimers(){for(const t of timers)clearTimeout(t);timers.clear();}
function later(fn,ms){const token=run,t=setTimeout(()=>{timers.delete(t);if(token===run&&!ended&&!silent())fn();},ms);timers.add(t);}
function setBgmEnabled(on){sound.setBgmEnabled(on);for(const id of ['welcomeBgmToggle','bgmToggle']){const e=document.getElementById(id);if(e)e.checked=!!on;}bgm();}
function setSfxEnabled(on){sound.setSfxEnabled(on);if(!on)cancelTimers();for(const id of ['welcomeSfxToggle','sfxToggle']){const e=document.getElementById(id);if(e)e.checked=!!on;}}
function sync(){
  const danger=started&&!ended&&typeof dangerActive!=='undefined'&&dangerActive;
  if(danger&&!previousDanger){sound.stopSfx('cue_round_clear');sfx('cue_danger_enter');}previousDanger=danger;bgm();
}
function unlock(){if(silent())return;unlocked=true;bgm();}
function runStart(){run++;cancelTimers();sound.stopSfx();started=true;ended=false;cinematic=false;previousDanger=false;officialPlayed=false;infinitePlayed=false;previewKey='';pendingRound=null;battle=null;sync();}
function previewAttack(attack,previous){
  const key=run+':'+round;if(attack>0&&attack>previous&&previewKey!==key){previewKey=key;sfx('sfx_max_intro');}
}
function hit(ev){
  if(ev.type==='aoe')sfx('sfx_aoe');
  else if(ev.type==='pierce')sfx('sfx_pierce');
  else if(ev.type==='strike'){
    if(battle?.newBest){sound.stopSfx('sfx_max_intro');sfx('sfx_max_hit');battle.newBest=false;}
    else sfx('sfx_attack');
  }
}
function battlePrepared(b,newBest,animated){
  battle={scene:b,newBest:!!newBest};
  if(!animated){
    let delay=0;const seen=new Set();
    for(const ev of b.events||[]){if(seen.has(ev.type))continue;seen.add(ev.type);if(!delay)hit(ev);else later(()=>hit(ev),delay);delay+=120;}
  }
}
function cinematicStart(){cinematic=true;sync();}
function cinematicHit(ev){hit(ev);}
function roundFinished(r,animated){
  if(r>=30)return;
  if(animated)pendingRound=r;else later(()=>{if(!previousDanger)sfx('cue_round_clear');},420);
}
function cinematicEnd(){cinematic=false;if(pendingRound!==null){pendingRound=null;sfx('cue_round_clear');}sync();}
function officialClear(){
  if(officialPlayed)return;officialPlayed=true;cancelTimers();cinematic=false;ended=true;sound.stop();sfx('cue_round30_clear');
}
function infiniteStart(){
  if(infinitePlayed)return;infinitePlayed=true;cancelTimers();sound.stopSfx();ended=false;cinematic=false;sfx('cue_infinite_enter');sync();
}
function endRun(){if(ended)return;ended=true;cinematic=false;cancelTimers();sound.stop();sfx('cue_run_end');}
function finishOfficial(){ended=true;cinematic=false;cancelTimers();sound.stop();}
global.LuckAudio=LuckAudio;
global.LuckGameAudio={setBgmEnabled,setSfxEnabled,unlock,runStart,sync,previewAttack,battlePrepared,cinematicStart,cinematicHit,cinematicEnd,roundFinished,officialClear,infiniteStart,endRun,finishOfficial,
  snapshot:()=>({started,ended,cinematic,bgmOn:sound.bgmOn,sfxOn:sound.sfxOn,bgm:sound.bg?.dataset.id||null,voices:sound.voices.size,scene:scene()})};
document.addEventListener('pointerdown',unlock,{capture:true});
document.addEventListener('click',unlock,{capture:true});
document.addEventListener('keydown',unlock,{capture:true});
document.addEventListener('DOMContentLoaded',()=>{
  setBgmEnabled(!!document.getElementById('bgmToggle')?.checked);
  for(const id of ['welcomeSfxToggle','sfxToggle'])document.getElementById(id)?.addEventListener('change',e=>setSfxEnabled(e.target.checked));
  sync();
});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelTimers();sound.stop();}else bgm();});
global.addEventListener('pagehide',()=>{cancelTimers();sound.stop();});
})(window);
