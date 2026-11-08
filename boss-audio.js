/* Included inside LuckGameAudio's closure by boss_audio_patch.py. No gameplay RNG. */
let pendingBossResult=null,bossHoldRound=null,bossHitVariant=0;
const bossCueKeys=new Set(),bossHitTimes=new Map();
function currentBoss(){
  const b=global.LuckBoss?.state();
  return b&&typeof round!=='undefined'&&b.round===round?b:null;
}
function bossScene(){
  const b=currentBoss();if(!b)return undefined;
  if(bossHoldRound===b.round)return null;
  if(b.cleared&&!cinematic&&!pendingBossResult)return null;
  if(b.turn===3)return 'boss_bgm_final_turn';
  return cinematic||(typeof phase!=='undefined'&&phase==='battle'&&!(typeof pendingRoundBriefing!=='undefined'&&pendingRoundBriefing))?'boss_bgm_battle':'boss_bgm_prepare';
}
function bossSync(){
  const b=currentBoss();if(!b||b.cleared||ended||pendingBossResult||cinematic)return;
  const id=b.turn===1?'boss_cue_enter':b.turn===3?'boss_cue_last_turn':null;
  const key=run+':'+b.round+':'+id;
  if(id&&!bossCueKeys.has(key)){bossCueKeys.add(key);sfx(id);}
}
function bossReset(){pendingBossResult=null;bossHoldRound=null;bossCueKeys.clear();bossHitTimes.clear();bossHitVariant=0;}
function bossImpact(hit,kind,broken){
  if(!(hit.damage>0))return;
  if(broken){sfx('boss_sfx_shield_break');return;}
  const now=performance.now(),play=id=>{if(now-(bossHitTimes.get(id)??-Infinity)>=100){bossHitTimes.set(id,now);sfx(id);}};
  const variant=1+(bossHitVariant++%2);
  if(hit.shieldDamage>0)play('boss_sfx_shield_hit_0'+variant);
  if(hit.coreDamage>0)play('boss_sfx_body_hit_0'+variant);
  if(kind==='pierce'||hit.corePierceDamage>0)play('boss_sfx_pierce');
}
function bossSkippedHits(b){
  const states=new Map((b.enemyStart||[]).filter(e=>e.boss&&e.shield!==undefined).map(e=>[e.id,{shield:e.shield}]));
  for(const ev of b.events||[])for(const hit of ev.hits||[ev]){
    const st=states.get(hit.id);if(!st)continue;
    const loss=Math.min(st.shield,hit.shieldDamage??hit.damage),broken=st.shield>0&&loss===st.shield;
    st.shield-=loss;bossImpact({...hit,shieldDamage:loss,coreDamage:hit.coreDamage??Math.max(0,hit.damage-loss)},ev.type,broken);
  }
}
function bossFinishResult(){
  const row=pendingBossResult;if(!row)return;pendingBossResult=null;
  if(row.clear){bossHoldRound=row.round;cancelTimers();sound.stopBgm();sfx('boss_cue_victory');}
  else if(row.turn>=3){ended=true;cancelTimers();sound.stopBgm();sfx('boss_cue_timeout');}
}
function bossResult(row,animated){pendingRound=null;pendingBossResult={...row};if(!animated)bossFinishResult();}
