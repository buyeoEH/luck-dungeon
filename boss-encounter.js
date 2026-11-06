/* Boss encounter contract v1. No random forced losses; shared pure damage helper. */
const BOSS_DEFAULT_TABLE=Object.freeze([
 {round:5,shield:20,core:35},{round:10,shield:40,core:70},
 {round:15,shield:70,core:120},{round:20,shield:110,core:180},
 {round:25,shield:160,core:260},{round:30,shield:220,core:360}
]);
let bossEncounter=null,bossTimeline=[],bossCombatNo=0,bossFailureReason='';
function bossStageActive(){return !!bossEncounter&&bossEncounter.round===round&&!bossEncounter.cleared;}
function bossSpec(r){const rows=window.LUCK_BOSS_TABLE||BOSS_DEFAULT_TABLE;const i=Math.min(rows.length-1,Math.floor(r/5)-1);return {...rows[Math.max(0,i)]};}
function bossApplyDamage(e,raw,kind='strike',count=0){
 raw=Math.max(0,Math.floor(raw));const before=e.hp;
 if(!e.boss||e.shield===undefined){const damage=Math.min(before,raw);e.hp-=damage;return {damage,spent:damage,shieldDamage:0,coreDamage:damage,kind};}
 const shieldDamage=Math.min(e.shield,raw);e.shield-=shieldDamage;
 const left=raw-shieldDamage,rate=kind==='aoe'?70:100+10*Math.max(0,count);
 const coreBefore=e.coreHp,coreDamage=Math.min(coreBefore,Math.floor(left*rate/100));e.coreHp-=coreDamage;e.hp=e.shield+e.coreHp;
 const spent=e.hp===0?shieldDamage+Math.ceil(coreDamage*100/rate):raw;
 return {damage:before-e.hp,spent:Math.min(raw,spent),shieldDamage,coreDamage,rate,kind};
}
function bossEmit(type,payload){window.Luck220?.emit(type,{stage_round:round,boss_turn:bossEncounter?.turn||null,combat_no:bossCombatNo,...payload});}
function bossAfterBattle(scene){
 if(!bossStageActive())return false;
 const boss=enemies.find(e=>e.boss),row={round,turn:bossEncounter.turn,remaining_count:enemies.length,remaining_hp:total(),boss_shield:boss?.shield||0,boss_core:boss?.coreHp||0,attack:scene.attackFinal,aoe:scene.aoe,pierce:scene.pierce,damage:scene.events.reduce((n,e)=>n+(e.damage||0)+(e.hits||[]).reduce((a,h)=>a+h.damage,0),0),clear:enemies.length===0};
 bossTimeline.push(row);scene.bossEncounter={...bossEncounter,result:row};bossEmit('boss_turn_result',row);
 let cont;
 if(!enemies.length){bossEncounter.cleared=true;bossEncounter.clearedOnTurn=bossEncounter.turn;dangerActive=false;activeDebuffZone=Math.max(activeDebuffZone,Math.floor(round/5)+1);log('👑 보스전 완전 격파! R'+round+' · '+bossEncounter.turn+'/3전투 · 이전 적과 보스 모두 처치','good');cont='bossReward';}
 else if(bossEncounter.turn>=3){bossFailureReason='R'+round+' 보스전 3회 제한: 이전 적과 보스를 모두 처치하지 못했습니다.';log('⌛ '+bossFailureReason,true);cont='gameOver';}
 else{log('👑 보스전 '+bossEncounter.turn+'/3 종료 · 남은 적 HP 유지 · 다음 전투에서 행동력 2 / 기본 손패 5','good');cont='nextRound';}
 window.LuckGameAudio?.roundFinished(round,shouldPlayBattleMotion());
 if(shouldPlayBattleMotion())showBattleCinematic(cont);else if(cont==='gameOver')gameOver();else if(cont==='bossReward')bossReward();else nextRound();
 return true;
}
(function(){
 const roll=rollSpawn;rollSpawn=function(r){return r<=30&&r%5===0?[bossFor(r)]:roll.apply(this,arguments);};
 const make=makeEnemy;makeEnemy=function(t,r){const e=make.apply(this,arguments);if(e.boss&&r<=30){const spec=bossSpec(r);e.shield=e.shieldMax=spec.shield;e.coreHp=e.coreMax=spec.core;e.hp=e.shield+e.coreHp;}return e;};
 const start0=start;start=function(){bossEncounter=null;bossTimeline=[];bossCombatNo=0;bossFailureReason='';return start0.apply(this,arguments);};
 const add=addEnemy;addEnemy=function(){const out=add.apply(this,arguments);if(round<=30&&round%5===0){bossEncounter={round,turn:1,cleared:false,rewardOffered:false,clearedOnTurn:null,initialCarry:enemies.filter(e=>!e.boss).length,spec:bossSpec(round)};dangerActive=false;bossEmit('boss_encounter_started',{...bossEncounter,enemies:enemies.map(e=>({id:e.id,name:e.name,hp:e.hp,shield:e.shield,core:e.coreHp}))});}return out;};
 const draw0=drawStart;drawStart=function(){if(bossStageActive()){apState.round=0;p1RewardRound=0;}bossCombatNo++;const out=draw0.apply(this,arguments);bossEmit('combat_turn_started',{base_ap:2,actual_ap:apState.points,base_draw:5,hand_size:hand.length,deck_size:deck.length});return out;};
 const next0=nextRound;nextRound=function(){
  if(bossStageActive()){
   if(bossEncounter.turn>=3){if(!bossFailureReason)bossFailureReason='보스전 3회 제한';return gameOver();}
   bossEncounter.turn++;resource=0;phase='battle';dangerActive=false;spawnedIds=[];tempAttack=0;aoeAttack=0;pierce=0;linkComboAttack=0;roundActionHistory=[];roundLinkDone={};
   if(isVisualMode()||!window.__luckAutoLabBotActive)showRoundStartModal();else drawStart();return;
  }
  if(bossEncounter?.cleared&&round===30&&!officialRecord){return freezeOfficialRecord('nextRound');}
  return next0.apply(this,arguments);
 };
 const reward0=bossReward;bossReward=function(){if(round<=30){if(!bossEncounter?.cleared||enemies.length)return false;if(bossEncounter.rewardOffered)return false;bossEncounter.rewardOffered=true;bossEmit('boss_reward_offered',{cleared_on_turn:bossEncounter.clearedOnTurn,options:'unchanged_four_options',reward_scaling:'none'});}return reward0.apply(this,arguments);};
 const freeze0=freezeOfficialRecord;freezeOfficialRecord=function(){if(round===30&&(!bossEncounter?.cleared||enemies.length))return false;return freeze0.apply(this,arguments);};
 const show=showRoundStartModal;showRoundStartModal=function(){const r=show.apply(this,arguments);if(bossStageActive()){
  if($('modalTitle'))$('modalTitle').textContent='👑 R'+round+' 보스전 · 전투 '+bossEncounter.turn+'/3';
  $('modalContent')?.insertAdjacentHTML('afterbegin','<p class="boss-rule-note">이전 적과 보스를 모두 처치하세요. 남은 HP는 유지됩니다. 매 전투 행동력 2 · 기본 손패 5 · 상점/승급 가능 · 보상 동일.</p>');
 }return r;};
 const render0=render;render=function(){const r=render0.apply(this,arguments);renderBossPanel();return r;};
 function installTelemetry(){if(!window.Luck220||window.Luck220.bossContextInstalled)return;const emit=Luck220.emit;Luck220.emit=function(t,p={},ctx){return emit.call(this,t,{...p,boss_turn:bossEncounter?.round===round?bossEncounter.turn:null,combat_no:bossCombatNo},ctx);};Luck220.bossContextInstalled=true;}
 document.addEventListener('DOMContentLoaded',()=>{installTelemetry();const outer=render;render=function(){const r=outer.apply(this,arguments);if(bossStageActive()&&$('danger220'))$('danger220').textContent='보스전 '+bossEncounter.turn+'/3 · 남은 적 '+enemies.length+' · HP '+total();return r;};});
 window.LuckBoss={applyDamage:bossApplyDamage,spec:bossSpec,state:()=>bossEncounter?JSON.parse(JSON.stringify(bossEncounter)):null,timeline:()=>JSON.parse(JSON.stringify(bossTimeline))};
})();
function renderBossPanel(){
 for(const id of ['nextPreview','shopPreview'])$(id)?.classList.toggle('hide',bossStageActive());
 const el=$('bossStagePanel');if(!el)return;
 if(!bossEncounter||bossEncounter.round!==round){el.classList.add('hide');return;}
 el.classList.remove('hide');const b=enemies.find(e=>e.boss),spec=bossEncounter.spec;
 const sh=b?.shield||0,hp=b?.coreHp||0,shMax=b?.shieldMax||spec.shield,hpMax=b?.coreMax||spec.core;
 el.innerHTML='<header><b>👑 R'+round+' 보스전 · '+bossEncounter.turn+'/3 전투</b><span>'+ (bossEncounter.cleared?'전원 격파 완료':bossFailureReason?'시간 초과':(3-bossEncounter.turn)+'회 추가 기회')+'</span></header>'+
 '<div class="boss-health"><label>🛡 보호막 '+sh+' / '+shMax+'</label><div><i style="width:'+(shMax?100*sh/shMax:0)+'%"></i></div><label>❤️ 진체력 '+hp+' / '+hpMax+'</label><div class="boss-core"><i style="width:'+(hpMax?100*hp/hpMax:0)+'%"></i></div></div>'+
 '<p>남은 일반 적 '+enemies.filter(e=>!e.boss).length+'마리 · 모든 적을 처치해야 보상 획득</p><details><summary>보스전 피해·진행 규칙</summary><p>보호막: 모든 공격 100%. 진체력: 광역 70%, 일반·연계 100%, 관통 1당 일반 공격 +10%. 보호막 초과 피해는 진체력으로 이어집니다. 매 전투 행동력 2·기본 손패 5, 상점·승급 유지. 추가 전투에는 적이 새로 나오지 않으며 보상은 몇 번째에 클리어하든 같습니다.</p></details>';
 const r=$('round');if(r)r.textContent=round+' · 보스 '+bossEncounter.turn+'/3';
}
