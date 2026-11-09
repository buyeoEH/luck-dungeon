/* Boss encounter contract v1. No random forced losses; shared pure damage helper. */
const BOSS_DEFAULT_TABLE=Object.freeze([
 {round:5,shield:0,core:36},{round:10,shield:40,core:70},
 {round:15,shield:70,core:120},{round:20,shield:110,core:180},
 {round:25,shield:160,core:260},{round:30,shield:220,core:360}
]);
let bossGrowth={hand:0,ap:0};
function bossPrepareNextCombat(){
 p1ResetRound();linkComboAttack=0;roundActionHistory=[];roundLinkDone={};
 window.LuckLinkView?.beginCombat();
}
function bossBaseHand(){return 5+bossGrowth.hand;}
function bossBaseAP(){return 2+bossGrowth.ap;}
function bossGainGrowth(){
 bossGrowth.hand=3;bossGrowth.ap++;
 bossEmit('boss_growth_reward',{kind:'hand8_ap1',start_hand:8,ap_gain:1,totals:{...bossGrowth},start_ap:bossBaseAP()});
 log('👑 전술 확장 ➜ 매 전투 시작 손패 8장 / 시작 행동력 +1 · 이번 플레이 동안 적용 (행동력 '+bossBaseAP()+')','good');
 nextRound();
}
let bossEncounter=null,bossTimeline=[],bossCombatNo=0,bossFailureReason='';
function bossStageActive(){return !!bossEncounter&&bossEncounter.round===round&&!bossEncounter.cleared;}
function bossSpec(r){const rows=window.LUCK_BOSS_TABLE||BOSS_DEFAULT_TABLE;const i=Math.min(rows.length-1,Math.floor(r/5)-1);return {...rows[Math.max(0,i)]};}
function bossApplyDamage(e,raw,kind='strike',count=0){
 raw=Math.max(0,Math.floor(raw));const before=e.hp;
 if(!e.boss||e.shield===undefined){const damage=Math.min(before,raw);e.hp-=damage;return {damage,spent:damage,shieldDamage:0,coreDamage:damage,kind};}
 const shieldDamage=Math.min(e.shield,raw);e.shield-=shieldDamage;
 const left=raw-shieldDamage,rate=kind==='aoe'?70:100;
 const coreBefore=e.coreHp,coreOverflowDamage=Math.min(coreBefore,Math.floor(left*rate/100));
 const corePierceDamage=kind==='aoe'?0:Math.min(coreBefore-coreOverflowDamage,Math.floor(raw*10*Math.max(0,count)/100));
 const coreDamage=coreOverflowDamage+corePierceDamage;e.coreHp-=coreDamage;e.hp=e.shield+e.coreHp;
 // Preserve overkill accounting for the existing pierce-limited transfer to the next enemy.
 let spent=raw;
 if(e.hp===0){let lo=0,hi=raw;const initialShield=before-coreBefore;while(lo<hi){const x=Math.floor((lo+hi)/2),sh=Math.min(initialShield,x),core=Math.floor((x-sh)*rate/100)+(kind==='aoe'?0:Math.floor(x*10*Math.max(0,count)/100));if(sh===initialShield&&core>=coreBefore)hi=x;else lo=x+1;}spent=lo;}
 return {damage:before-e.hp,spent,shieldDamage,coreDamage,coreOverflowDamage,corePierceDamage,rate,kind};
}
function bossEmit(type,payload){window.Luck220?.emit(type,{stage_round:round,boss_turn:bossEncounter?.turn||null,combat_no:bossCombatNo,...payload});}
function bossAfterBattle(scene){
 if(!bossStageActive())return false;
 const boss=enemies.find(e=>e.boss),row={round,turn:bossEncounter.turn,remaining_count:enemies.length,remaining_hp:total(),boss_shield:boss?.shield||0,boss_core:boss?.coreHp||0,attack:scene.attackFinal,aoe:scene.aoe,pierce:scene.pierce,damage:scene.events.reduce((n,e)=>n+(e.damage||0)+(e.hits||[]).reduce((a,h)=>a+h.damage,0),0),core_pierce_damage:scene.events.reduce((n,e)=>n+(e.corePierceDamage||0),0),clear:enemies.length===0};
 bossTimeline.push(row);scene.bossEncounter={...bossEncounter,result:row};bossEmit('boss_turn_result',row);
 let cont;
 if(!enemies.length){bossEncounter.cleared=true;bossEncounter.clearedOnTurn=bossEncounter.turn;dangerActive=false;activeDebuffZone=Math.max(activeDebuffZone,Math.floor(round/5)+1);log('👑 보스전 완전 격파! R'+round+' · '+bossEncounter.turn+'/3전투 · 이전 적과 보스 모두 처치','good');if(round===30)rewards=[];cont=round===30?'officialNext':'bossReward';}
 else if(bossEncounter.turn>=3){bossFailureReason='R'+round+' 보스전 3회 제한: 이전 적과 보스를 모두 처치하지 못했습니다.';log('⌛ '+bossFailureReason,true);cont='gameOver';}
 else{log('👑 보스전 '+bossEncounter.turn+'/3 종료 · 남은 적 HP 유지 · 다음 전투에서 행동력 '+bossBaseAP()+' / 시작 손패 '+bossBaseHand(),'good');cont='nextRound';}
 window.LuckGameAudio?.bossResult(row,shouldPlayBattleMotion());
 if(shouldPlayBattleMotion())showBattleCinematic(cont);else if(cont==='gameOver')gameOver();else if(cont==='bossReward')bossReward();else if(cont==='officialNext')freezeOfficialRecord('nextRound');else nextRound();
 return true;
}
(function(){
 const roll=rollSpawn;rollSpawn=function(r){return r<=30&&r%5===0?[bossFor(r)]:roll.apply(this,arguments);};
 const make=makeEnemy;makeEnemy=function(t,r){const e=make.apply(this,arguments);if(!e.boss&&r>=1&&r<=4)e.hp=Math.max(1,Math.round(e.hp*.75));if(e.boss&&r<=30){const spec=bossSpec(r);e.shield=e.shieldMax=spec.shield;e.coreHp=e.coreMax=spec.core;e.hp=e.shield+e.coreHp;if(r===5&&e.d){e.d.p=e.d.baseP=(e.d.baseP??e.d.p)+1;}}return e;};
 const start0=start;start=function(){bossGrowth={hand:0,ap:0};bossEncounter=null;bossTimeline=[];bossCombatNo=0;bossFailureReason='';return start0.apply(this,arguments);};
 const add=addEnemy;addEnemy=function(){const out=add.apply(this,arguments);if(round<=30&&round%5===0){bossEncounter={round,turn:1,cleared:false,rewardOffered:false,clearedOnTurn:null,initialCarry:enemies.filter(e=>!e.boss).length,spec:bossSpec(round)};dangerActive=false;bossEmit('boss_encounter_started',{...bossEncounter,enemies:enemies.map(e=>({id:e.id,name:e.name,hp:e.hp,shield:e.shield,core:e.coreHp}))});}return out;};
 const draw0=drawStart;drawStart=function(){if(bossStageActive()){apState.round=0;p1RewardRound=0;}bossCombatNo++;const out=draw0.apply(this,arguments);bossEmit('combat_turn_started',{base_ap:bossBaseAP(),actual_ap:apState.points,base_draw:bossBaseHand(),growth:{...bossGrowth},hand_size:hand.length,deck_size:deck.length});return out;};
 const next0=nextRound;nextRound=function(){
  if(bossStageActive()){
   if(bossEncounter.turn>=3){if(!bossFailureReason)bossFailureReason='보스전 3회 제한';return gameOver();}
   bossPrepareNextCombat();
   bossEncounter.turn++;resource=0;phase='battle';dangerActive=false;spawnedIds=[];tempAttack=0;aoeAttack=0;pierce=0;linkComboAttack=0;roundActionHistory=[];roundLinkDone={};
   if(isVisualMode()||!window.__luckAutoLabBotActive)showRoundStartModal();else drawStart();return;
  }
  if(bossEncounter?.cleared&&round===30&&!officialRecord){return freezeOfficialRecord('nextRound');}
  bossPrepareNextCombat();
  return next0.apply(this,arguments);
 };
 const reward0=bossReward;bossReward=function(){if(round===30){if(!bossEncounter?.cleared||enemies.length)return false;rewards=[];return officialRecord?false:freezeOfficialRecord('nextRound');}if(round<30){if(!bossEncounter?.cleared||enemies.length)return false;if(bossEncounter.rewardOffered)return false;bossEncounter.rewardOffered=true;bossEmit('boss_reward_offered',{cleared_on_turn:bossEncounter.clearedOnTurn,options:'five_options_with_combined_growth',reward_scaling:'none'});}const out=reward0.apply(this,arguments);rewards.push(['🃏⚡ 전술 확장 · 손패 8장 + 행동력 1','두 효과를 함께 받습니다. 다음 전투부터 시작 손패를 8장으로 설정하고 시작 행동력 +1. 이번 플레이 동안 보스전 각 턴에도 적용됩니다. 다시 선택하면 손패는 8장을 유지하고 행동력만 +1 누적됩니다. 현재 행동력 '+bossBaseAP()+' → '+(bossBaseAP()+1),bossGainGrowth]);render();return out;};
 const freeze0=freezeOfficialRecord;freezeOfficialRecord=function(){if(round===30&&(!bossEncounter?.cleared||enemies.length))return false;return freeze0.apply(this,arguments);};
 const show=showRoundStartModal;showRoundStartModal=function(){const r=show.apply(this,arguments);if(bossStageActive()){
  if($('modalTitle'))$('modalTitle').textContent='👑 R'+round+' 보스전 · 전투 '+bossEncounter.turn+'/3';
  $('modalContent')?.insertAdjacentHTML('afterbegin','<p class="boss-rule-note">이전 적과 보스를 모두 처치하세요. 남은 HP는 유지됩니다. 매 전투 행동력 '+bossBaseAP()+' · 시작 손패 '+bossBaseHand()+' · 상점/승급 가능 · '+(round===30?'보상 없이 공식전 종료':'클리어 횟수와 무관하게 동일 보상')+'</p>');
  window.LuckGameAudio?.sync();
 }return r;};
 const render0=render;render=function(){const r=render0.apply(this,arguments);renderBossPanel();return r;};
 function installTelemetry(){if(!window.Luck220||window.Luck220.bossContextInstalled)return;const emit=Luck220.emit;Luck220.emit=function(t,p={},ctx){return emit.call(this,t,{...p,boss_turn:bossEncounter?.round===round?bossEncounter.turn:null,combat_no:bossCombatNo},ctx);};Luck220.bossContextInstalled=true;}
 document.addEventListener('DOMContentLoaded',()=>{installTelemetry();const outer=render;render=function(){const r=outer.apply(this,arguments);if(bossStageActive()&&$('danger220'))$('danger220').textContent='보스전 '+bossEncounter.turn+'/3 · 남은 적 '+enemies.length+' · HP '+total();return r;};});
 window.LuckBoss={applyDamage:bossApplyDamage,spec:bossSpec,state:()=>bossEncounter?JSON.parse(JSON.stringify(bossEncounter)):null,timeline:()=>JSON.parse(JSON.stringify(bossTimeline)),growth:()=>({...bossGrowth}),baseHand:bossBaseHand,baseAP:bossBaseAP};
})();
function renderBossPanel(){
 for(const id of ['nextPreview','shopPreview'])$(id)?.classList.toggle('hide',bossStageActive());
 const el=$('bossStagePanel');if(!el)return;
 let growth=$('bossGrowthSummary');if(!growth){growth=document.createElement('p');growth.id='bossGrowthSummary';growth.className='boss-rule-note';el.before(growth);}
 growth.textContent='👑 성장 보상 · 시작 손패 '+bossBaseHand()+'장 · 행동력 '+bossBaseAP()+' (손패 +'+bossGrowth.hand+' / 행동력 +'+bossGrowth.ap+')';
 if(!bossEncounter||bossEncounter.round!==round){el.classList.add('hide');return;}
 el.classList.remove('hide');const b=enemies.find(e=>e.boss),spec=bossEncounter.spec;
 const sh=b?.shield||0,hp=b?.coreHp||0,shMax=b?.shieldMax||spec.shield,hpMax=b?.coreMax||spec.core;
 el.innerHTML='<header><b>👑 R'+round+' 보스전 · '+bossEncounter.turn+'/3 전투</b><span>'+ (bossEncounter.cleared?'전원 격파 완료':bossFailureReason?'시간 초과':(3-bossEncounter.turn)+'회 추가 기회')+'</span></header>'+
 '<div class="boss-health">'+(shMax?'<label>🛡 보호막 '+sh+' / '+shMax+'</label><div><i style="width:'+100*sh/shMax+'%"></i></div>':'<label>🛡 보호막 없음</label>')+'<label>❤️ 진체력 '+hp+' / '+hpMax+'</label><div class="boss-core"><i style="width:'+(hpMax?100*hp/hpMax:0)+'%"></i></div></div>'+
 '<p>남은 일반 적 '+enemies.filter(e=>!e.boss).length+'마리 · '+(round===30?'모든 적을 처치하면 공식전 완료':'모든 적을 처치해야 보상 획득')+'</p><details><summary>보스전 피해·진행 규칙</summary><p>보호막: 모든 공격 100%. 진체력: 광역 70%, 일반·연계 100%. 관통 1당 일반 공격의 10%를 진체력에 직접 추가합니다. 보호막 초과 피해는 관통 없이 진체력으로 이어집니다. 보스전 일반 적 피해는 100%이며 관통이 있을 때만 처치 후 남은 피해가 다음 적·보스에게 전달됩니다. 순수 연속타는 별개의 55% 공격입니다. 매 전투 시작 행동력 '+bossBaseAP()+'·손패 '+bossBaseHand()+'장, 상점·승급 유지. 보상 5종 중 하나를 선택하며 성장 보상은 이번 플레이 동안 누적됩니다. 추가 전투에는 적이 새로 나오지 않으며 R5~25 보상은 클리어 횟수와 무관하게 같으며, R30은 보상 없이 공식전이 종료됩니다.</p></details>';
 const forecast=$('debuffForecast');if(forecast)forecast.innerHTML=forecast.innerHTML.replace('처치 후 초과 피해 전달','처치 후 초과 피해 전달 · 보스 진체력 직격 10%/관통');
 const r=$('round');if(r)r.textContent=round+' · 보스 '+bossEncounter.turn+'/3';
}
