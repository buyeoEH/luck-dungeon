/* Approved v0.3 multi-debuff and useful protection rules. */
DEBUFF_NAMES.combo='연계';
const GUARD_BOSS_DEBUFFS={5:[['combo',2]],10:[['resource',2]],15:[['attack',2]],20:[['combo',2],['resource',1]],25:[['resource',2],['attack',1]],30:[['attack',2],['combo',1],['resource',1]]};
const GUARD_MODES={balanced:{name:'균형',kinds:['combo','attack','resource','gem']},combat:{name:'전투 집중',kinds:['combo','attack']},economy:{name:'경제 집중',kinds:['resource','gem']}};
let guardMode='balanced',guardReports=[],guardLastCombat=null,guardStats={spent:0,firepower:0,resource:0,gems:0,gauge:0,ineffective:0};
function enemyDebuffs(e){return e.debuffs|| (e.d?[e.d]:[]);}
function guardAllows(k){return GUARD_MODES[guardMode].kinds.includes(k);}
function guardCompare(a,b){for(let i=0;i<a.length;i++)if(a[i]!==b[i])return Math.sign(a[i]-b[i]);return 0;}
function guardPool(k){const p={flat:0,pct:0,who:[],entries:[]};for(const e of enemies){if(!isEnemyDebuffActive(e))continue;for(const d of enemyDebuffs(e))if(d.k===k&&d.p>0){p[d.pct?'pct':'flat']+=d.p;p.entries.push({enemy:e,debuff:d});if(!p.who.includes(e))p.who.push(e);}}return p;}
// Maximize real result, then take the cheapest equivalent plan. A jump across rounding plateaus is allowed.
function guardAllocate(k,pool,balances,score){
 const own=window.LUCK_GUARD_QA_NO_PROTECTION?0:Math.max(0,balances[k]||0),all=window.LUCK_GUARD_QA_NO_PROTECTION||!guardAllows(k)?0:Math.max(0,balances.all||0),budget=Math.min(own+all,pool.flat+pool.pct);
 const original=score(pool),base={...pool,absorbed:0,usedOwn:0,usedAll:0,score:original};let best=base;
 for(let pct=0;pct<=Math.min(pool.pct,budget);pct++){
  const maxFlat=Math.min(pool.flat,budget-pct),candidate={...pool,pct:pool.pct-pct,flat:pool.flat-maxFlat};const target=score(candidate);
  if(guardCompare(target,original)<=0)continue;
  let lo=0,hi=maxFlat;while(lo<hi){const mid=Math.floor((lo+hi)/2),v=score({...candidate,flat:pool.flat-mid});if(guardCompare(v,target)>=0)hi=mid;else lo=mid+1;}
  const cost=pct+lo,result={...candidate,flat:pool.flat-lo,absorbed:cost,usedOwn:Math.min(own,cost),usedAll:Math.max(0,cost-own),score:target};
  if(guardCompare(target,best.score)>0||(guardCompare(target,best.score)===0&&cost<best.absorbed))best=result;
 }
 return {...best,beforeScore:original};
}
function guardCommit(r,k){prot[k]=Math.max(0,(prot[k]||0)-r.usedOwn);prot.all=Math.max(0,(prot.all||0)-r.usedAll);for(const x of r.entries)x.debuff.p=0;return r;}
function guardParts(comboRaw,comboCut,attackCut){
 const comboNet=applyCut(comboRaw,comboCut),basePre=baseAtk()+tempAttack+comboNet,p1=p1Parts(comboRaw,comboNet,{combo:comboCut},basePre),pre=p1.pre,rawFinal=applyCut(pre,attackCut),attackFloor=pre>0?Math.ceil(pre*.5):0,final=Math.max(rawFinal,attackFloor);
 return {comboRaw,comboNet,comboLoss:comboRaw-comboNet,basePre,p1,pre,rawFinal,attackFloor,final,atkLoss:pre-final,pv:{combo:comboCut,attack:attackCut}};
}
function guardEffects(p){return [p.final,p.p1.pierceBonus,p.p1.attackPct,p.p1.peakBonus,P1_EXTRAS&&p.p1.gaugeNet>=50?1:0,P1_EXTRAS&&p.p1.gaugeNet>=70?1:0];}
function guardCombatPlan(){
 const comboRaw=evalCombos().reduce((n,c)=>n+(c.ok?c.bonus:0),0)+linkComboAttack,c=guardPool('combo'),a=guardPool('attack'),balances={...prot};
 const combo=guardAllocate('combo',c,balances,r=>guardEffects(guardParts(comboRaw,r,a)));balances.combo-=combo.usedOwn;balances.all-=combo.usedAll;
 const attack=guardAllocate('attack',a,balances,r=>[guardParts(comboRaw,combo,r).final]);balances.attack-=attack.usedOwn;balances.all-=attack.usedAll;
 return {combo,attack,balances,parts:guardParts(comboRaw,combo,attack),unprotected:guardParts(comboRaw,c,a),unaffected:guardParts(comboRaw,{flat:0,pct:0},{flat:0,pct:0})};
}
function guardOutcome(r,kind,before,without,after){return {kind,before,without,after,preserved:Math.max(0,after-without),spent:r.absorbed,own:r.usedOwn,all:r.usedAll,unnecessary:r.absorbed===0&&guardCompare(r.score,r.beforeScore)===0};}
function guardEmit(type,data){window.Luck220?.emit(type,{...data,mode:guardMode,boss_turn:bossEncounter?.round===round?bossEncounter.turn:null,combat_no:bossCombatNo});}
function guardFinishCombat(plan){
 const p=plan.parts,u=plan.unprotected;
 guardLastCombat={mode:guardMode,attack:guardOutcome(plan.attack,'attack',plan.unaffected.final,u.final,p.final),combo:guardOutcome(plan.combo,'combo',plan.comboRaw,u.comboNet,p.comboNet),gauge:{without:u.p1.gaugeNet,after:p.p1.gaugeNet,pierceBefore:u.p1.pierceBonus,pierceAfter:p.p1.pierceBonus},spent:plan.combo.absorbed+plan.attack.absorbed,balances:{...prot}};
 guardStats.ineffective+=[plan.combo,plan.attack].filter(r=>r.absorbed>0&&guardCompare(r.score,r.beforeScore)===0).length;guardStats.spent+=guardLastCombat.spent;guardStats.firepower+=Math.max(0,p.final-u.final);guardStats.gauge+=Math.max(0,p.p1.gaugeNet-u.p1.gaugeNet);
 for(const [r,name,from,to,preserved] of [[plan.combo,'연계',plan.comboRaw,p.comboNet,p.comboNet-u.comboNet],[plan.attack,'공격력',p.pre,p.final,p.final-u.final]])if(r.who.length){
  if(r.absorbed)log('🛡 '+name+' '+Math.max(0,preserved)+' 보존 · 보호 '+r.absorbed+' 소모'+(name==='연계'?' · 게이지 '+u.p1.gaugeNet+' → '+p.p1.gaugeNet+'P · 변환 관통 +'+u.p1.pierceBonus+' → +'+p.p1.pierceBonus:''),'good');
  else if(from===to||guardCompare(r.score,r.beforeScore)===0)log('ℹ️ '+name+' · '+(from===to?'실제 손실 없음':'가용 보호로 개선 불가')+' · 보호 유지');
  if(from>to)log('💥 '+name+' '+from+' → '+to,true);
 }
 guardEmit('protection_combat',guardLastCombat);
}
function guardGain(kind,amount){
 if(amount<=0)return amount||0;const pool=guardPool(kind);
 if(!pool.entries.length){if(kind==='resource')stats.resourceGained+=amount;return amount;}
 const r=guardAllocate(kind,pool,prot,x=>[applyCut(amount,x)]),without=applyCut(amount,pool),after=applyCut(amount,r);guardCommit(r,kind);
 guardStats.ineffective+=r.absorbed>0&&guardCompare(r.score,r.beforeScore)===0?1:0;stats.protectionPointsUsed+=r.absorbed;guardStats.spent+=r.absorbed;if(kind==='resource'){stats.resourceGained+=after;stats.resourceBlocked+=amount-after;guardStats.resource+=after-without;}
 if(debuffReport.blocked[kind]!==undefined){debuffReport.blocked[kind]+=r.absorbed;debuffReport.lost[kind]+=amount-after;}
 const report=guardOutcome(r,kind,amount,without,after);guardEmit('protection_gain',report);updateEnemyStatus();
 const name=kind==='resource'?'자원':'보석';if(r.absorbed){log('🛡 '+name+' '+(after-without)+' 보존 · 보호 '+r.absorbed+' 소모','good');guardNotice('protected',name+' '+(after-without)+' 보존 · 보호 '+r.absorbed+' 소모');}
 else if(after===amount){log('ℹ️ 실제 손실 없음 · 보호 유지 ('+name+' '+amount+')');guardNotice('unnecessary','실제 손실 없음 · 보호 유지');}
 else{log('💥 '+name+' 획득 '+amount+' → '+after+' · 보호 '+r.absorbed+' 소모',true);guardNotice('debuff',name+' 획득 '+amount+' → '+after);}
 return after;
}
function guardConsume(k,n){const own=window.LUCK_GUARD_QA_NO_PROTECTION?0:Math.min(prot[k]||0,n),all=window.LUCK_GUARD_QA_NO_PROTECTION||!guardAllows(k)?0:Math.min(prot.all||0,n-own);prot[k]-=own;prot.all-=all;stats.protectionPointsUsed+=own+all;guardStats.spent+=own+all;return {fullyBlocked:n===own+all,blockedAmount:own+all,remainingPenalty:n-own-all,own,all};}
function guardThefts(){const lines=[],outcomes=[];for(const e of enemies.filter(e=>e.steal&&isEnemyDebuffActive(e))){
 if(gems<=0){outcomes.push({kind:'unnecessary',name:e.name,stolen:0,spent:0});lines.push({text:'💎 '+e.name+' · 보석 없음 · 보호 유지',good:true});continue;}
 const amount=Math.min(gems,Math.max(e.steal.min,Math.ceil(gems*e.steal.pct))),roll=Math.floor(Math.random()*100)+1,need=Math.round(e.steal.chance*100);
 if(roll>need){outcomes.push({kind:'theft_failed',name:e.name,stolen:0,spent:0,roll});lines.push({text:'🤏 '+e.name+' · 약탈 실패 (판정 '+roll+' > '+need+') · 보호 유지',good:true});continue;}
 const r=guardConsume('gem',amount),stolen=Math.min(gems,r.remainingPenalty);gems-=stolen;guardStats.gems+=r.blockedAmount;debuffReport.blocked.gem+=r.blockedAmount;debuffReport.lost.gem+=stolen;
 outcomes.push({kind:stolen?'theft_success':'protected',name:e.name,stolen,blocked:r.blockedAmount,spent:r.blockedAmount,roll});lines.push({text:(r.blockedAmount?'🛡 보석 '+r.blockedAmount+'개 약탈 차단 · 보호 '+r.blockedAmount+' 소모 / ':'')+(stolen?'💎 → 👹 '+e.name+' · 보석 −'+stolen:'💎 약탈 차단')+' · 남은 보석 '+gems,good:stolen===0});
 }guardEmit('protection_theft',{outcomes});guardReports.push(...outcomes);return lines;}
function guardPolicyHtml(){return '<label class="guard-policy">🛡 전체 보호 사용 범위 <select onchange="LuckGuard.setMode(this.value)" aria-label="전체 보호 사용 범위">'+Object.entries(GUARD_MODES).map(([k,v])=>'<option value="'+k+'" '+(guardMode===k?'selected':'')+'>'+v.name+'</option>').join('')+'</select></label><small>종류별 보호는 항상 사용 · 연계 보호는 손패 콤보·행동 연계 감소를 방어 · 전투 중 변경 불가</small>';}
function guardNotice(kind,text){const host=$('guardFeedback');if(host){host.className='guard-feedback';void host.offsetWidth;host.className='guard-feedback '+kind;host.textContent=text;}if(kind!=='unnecessary')window.LuckGameAudio?.statusCue?.(kind);}
function guardCombatHtml(report){if(!report)return '';const a=report.attack,c=report.combo;
 return '<section class="guard-results '+(report.spent?'protected':report.attack.before>report.attack.after?'debuff':'unnecessary')+'"><b>🛡 디버프·보호 결과</b><p>공격력 '+a.before+' → '+a.after+' · 실제 화력 '+a.preserved+' 보존</p><p>연계 '+c.before+' → '+c.after+' · 게이지 '+report.gauge.after+'P</p><p>보호 '+report.spent+' 소모'+(!report.spent?' · 보호 유지':'')+'</p></section>';}
function guardPreviewHtml(ap){const r=ap.guard;if(!r)return '';return '<section class="guard-preview"><b>🛡 예상 손실·보호 소모 · '+GUARD_MODES[guardMode].name+'</b><p>보호 전 예상 공격 손실 '+(r.unaffected.final-r.unprotected.final)+' · 보호 후 공격력 '+ap.final+' (보존 '+(ap.final-r.unprotected.final)+')</p><p>연계 '+ap.comboRaw+' → '+ap.comboNet+' · 게이지 '+ap.p1.gaugeNet+'P · 보호 소모 연계 '+r.combo.absorbed+' / 공격 '+r.attack.absorbed+'</p><p>처리 후 잔량 · 연계 '+r.balances.combo+' / 공격 '+r.balances.attack+' / 전체 '+r.balances.all+'</p><small>광역 후 생존 적 기준 · 연계 → 공격 순서 · 약탈은 공격 후 생존 사냥꾼마다 성공 확률 60%</small></section>';}
(function(){
 const make=makeEnemy;makeEnemy=function(t,r){const e=make.apply(this,arguments);if(e.boss&&GUARD_BOSS_DEBUFFS[r]){e.debuffs=GUARD_BOSS_DEBUFFS[r].map(([k,p])=>({k,p,baseP:p,pct:true}));e.d=e.debuffs[0];}return e;};
 isEnemyDebuffActive=e=>!!e&&e.hp>0;poolFor=guardPool;gain=guardGain;consume=guardConsume;
 attackParts=function(){const plan=guardCombatPlan(),ap={...plan.parts};Object.defineProperty(ap,'guard',{value:plan});return ap;};
 previewDebuffs=()=>guardCombatPlan().parts.pv;
 debuffLabel=function(e){const parts=enemyDebuffs(e).map(d=>(DEBUFF_NAMES[d.k]||d.k)+' −'+(d.pct?d.baseP*10+'%':d.baseP));if(e.steal)parts.push('보석 약탈 60% · '+Math.round(e.steal.pct*100)+'%, 최소 '+e.steal.min);return parts.join(' · ')||'디버프 없음';};
 getEnemyDebuffText=function(e){return debuffLabel(e)+(enemyDebuffs(e).length?' ['+enemyDebuffs(e).map(d=>(DEBUFF_NAMES[d.k]||d.k)+': '+(d.p>0?'대기':'소진')).join(' / ')+']':'');};
 enemyRisk=function(e){return {level:e.boss?'critical':enemyDebuffs(e).some(d=>d.p>0)||e.steal?'medium':'none',text:getEnemyDebuffText(e)};};
 const start0=start;start=function(){guardMode=$('guardWelcomeMode')?.value||'balanced';guardReports=[];guardLastCombat=null;guardStats={spent:0,firepower:0,resource:0,gems:0,gauge:0,ineffective:0};const out=start0.apply(this,arguments);if(window.Luck220?.run())Luck220.run().settings.guard_mode=guardMode;return out;};
 const roundModal=showRoundStartModal;showRoundStartModal=function(){const r=roundModal.apply(this,arguments);$('modalContent')?.insertAdjacentHTML('beforeend','<div class="guard-options">'+guardPolicyHtml()+guardResourcePreview()+'</div>');return r;};
 const action0=registerActionLink;registerActionLink=function(c,changes){const out=action0.apply(this,arguments);if(['guard_economy','guard_draw'].includes(c.guardLink)){const l=ACTION_LINKS.find(x=>x.id===c.guardLink);triggerLink('a_'+l.id,l.name,l.bonus,'지정 승급의 복합 연계 효과',changes);}return out;};
 const beforeBattle=battle;battle=function(){if(phase!=='battle')return beforeBattle.apply(this,arguments);guardReports=[];guardLastCombat=null;return beforeBattle.apply(this,arguments);};
 const scene=showBattleCinematic;showBattleCinematic=function(){const r=scene.apply(this,arguments);$('modalContent')?.querySelector('.combat-cinematic')?.insertAdjacentHTML('afterbegin',guardCombatHtml(pendingBattleScene.protection)+guardTheftHtml(pendingBattleScene.thefts));guardAnnounce();return r;};
 const render0=render;render=function(){const out=render0.apply(this,arguments);let el=$('guardFeedback');if(!el&&$('enemySection')){el=document.createElement('div');el.id='guardFeedback';el.className='guard-feedback';el.setAttribute('role','status');$('enemySection').before(el);}if(phase==='battle')$('battleStage')?.insertAdjacentHTML('beforeend',guardPreviewHtml(battlePreparationPlan().ap));return out;};
 const beforeForecast=debuffForecastHtml;debuffForecastHtml=function(){return phase==='battle'?guardPreviewHtml(battlePreparationPlan().ap):beforeForecast.apply(this,arguments)+guardResourcePreview();};
 const beforeDetails=debuffStatusHtml;debuffStatusHtml=function(){return beforeDetails.apply(this,arguments)+'<p>실제 보존: 화력 '+guardStats.firepower+' / 자원 '+guardStats.resource+' / 보석 '+guardStats.gems+' / 보호 소모 '+guardStats.spent+'</p><p>디버프는 적 처치까지 유지하며 각 전투에서 종류별로 다시 발동합니다.</p>';};
 window.LuckGuard={setMode(mode){if(!GUARD_MODES[mode]||!['hand','battle'].includes(phase)||phase==='battle'&&!pendingRoundBriefing)return false;guardMode=mode;guardEmit('protection_policy',{mode});render();return true;},mode:()=>guardMode,stats:()=>({...guardStats}),plan:guardCombatPlan};
})();
function guardTheftHtml(rows){if(!rows?.length)return '';return '<div class="guard-thefts">'+rows.map(r=>'<span class="guard-theft '+r.kind+'"><i class="guard-gem">'+(r.kind==='theft_failed'?'🤏':'💎')+'</i> '+(r.kind==='theft_success'?'→ 👹 보석 −'+r.stolen+(r.blocked?' · 🛡 '+r.blocked+'개 차단':''):r.kind==='protected'?'🛡 보석 '+r.blocked+'개 약탈 차단':r.kind==='theft_failed'?'약탈 실패':'보석 없음 · 보호 유지')+'</span>').join('')+'</div>';}
function guardAnnounce(){const r=guardLastCombat,rows=guardReports;if(!r&&!rows.length)return;const theft=rows.find(x=>x.kind==='theft_success')||rows.find(x=>x.kind==='protected')||rows.find(x=>x.kind==='theft_failed');const kind=r?.spent?'protected':(theft?.kind||(r?.attack.before>r?.attack.after?'debuff':'unnecessary'));guardNotice(kind,(r?'공격력 '+r.attack.before+' → '+r.attack.after+' · 화력 '+r.attack.preserved+' 보존 · 보호 '+r.spent+' 소모':'')+(rows.length?' · 약탈 성공 '+rows.filter(x=>x.stolen>0).length+' / 실패 '+rows.filter(x=>x.kind==='theft_failed').length+' / 차단 '+rows.filter(x=>x.blocked>0).length:''));}
function guardResourcePreview(){if(pendingRoundBriefing)return '<p>새 손패의 첫 유효 자원 획득에 자원 디버프 적용 · 실제 손실이 없으면 보호 유지</p>';const c=hand.find(c=>(c.res||0)>0),amount=c?.res||0;if(!amount||!guardPool('resource').entries.length)return '';const pool=guardPool('resource'),r=guardAllocate('resource',pool,prot,x=>[applyCut(amount,x)]);return '<p>💰 다음 자원 +'+amount+' 가정: 보호 전 '+applyCut(amount,pool)+' / 보호 '+r.absorbed+' 소모 / 보호 후 '+applyCut(amount,r)+'</p>';}
