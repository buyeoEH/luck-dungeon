/* Presentation and accounting only. No damage, price, HP or AP-cost changes. */
let feedback314={hit:null,serial:0,battle:null},apWarning314=null,apBypass314=false;
function pierceClassify314(events,targeted=0){
 const hits=(events||[]).filter(e=>e.type!=='aoe');
 const direct=hits.reduce((n,e)=>n+(e.corePierceDamage||0),0);
 const transfer=hits.filter(e=>e.type==='pierce').reduce((n,e)=>n+Math.max(0,(e.damage||0)-(e.corePierceDamage||0)),0);
 return {targeted_damage:targeted,transfer_damage:transfer,boss_direct_damage:direct,total_damage:targeted+transfer+direct,definition:'exclusive_v1; boss direct is removed from transferred hit damage; targeted bypass stays in targeted'};
}
function pierceSettle314(scene){
 if(scene.pierceBreakdown314)return scene.pierceBreakdown314;
 const b=pierceClassify314(scene.events,trialState313.targetedCombatDamage);
 scene.pierceBreakdown314=b;
 const total=stats.pierceBreakdown314||(stats.pierceBreakdown314={targeted_damage:0,transfer_damage:0,boss_direct_damage:0,total_damage:0});
 total.transfer_damage+=b.transfer_damage;total.boss_direct_damage+=b.boss_direct_damage;
 total.total_damage=total.targeted_damage+total.transfer_damage+total.boss_direct_damage;
 feedback314.battle={...b,round,turn:bossStageActive()?bossEncounter.turn:null};
 renderFeedback314();return b;
}
function breakerReadiness314(){
 const c=hand.find(c=>cardKey(c)==='breaker'&&!tacticUsed.has(c.id));if(!c)return null;
 const cost=apCost(c),missing=Math.max(0,cost-apState.points);
 return {card:c,cost,points:apState.points,missing,ready:phase==='hand'&&!missing&&enemies.length>0,canRefill:gems>=missing&&missing>0};
}
function renderFeedback314(){
 if(!$('enemySection'))return;
 let panel=$('combatFeedback314');if(!panel){panel=node313('section',undefined,'combat-feedback314');panel.id='combatFeedback314';panel.setAttribute('aria-live','polite');$('enemySection').before(panel);}
 panel.hidden=!feedback314.hit&&!feedback314.battle;
 const stamp=feedback314.serial+'|'+JSON.stringify(feedback314.battle);
 if(panel.dataset.stamp!==stamp){
  panel.dataset.stamp=stamp;panel.replaceChildren();
  if(feedback314.hit){const hit=feedback314.hit,box=node313('div',undefined,'pierce-impact314');
   box.append(node313('b','🗡 최근 지정 관통 · '+hit.name+' · R'+hit.round+(hit.turn?' '+hit.turn+'차':'')));
   for(const p of hit.targets){const row=node313('div',undefined,'pierce-target314');row.dataset.targetId=p.id||'';
    row.append(node313('strong',p.name+' · HP '+p.before.hp+' → '+p.after.hp+' (−'+p.damage+')'));
    if(p.boss)row.append(node313('p','🛡 보호막 '+p.before.shield+' → '+p.after.shield+' / ❤️ 진체력 '+p.before.core+' → '+p.after.core));
    if(p.killed)row.append(node313('span','처치 완료','pierce-kill314'));box.append(row);
   }panel.append(box);
  }
  if(feedback314.battle){const b=feedback314.battle;panel.append(node313('b','지난 전투 관통 피해 · R'+b.round+(b.turn?' '+b.turn+'차':'')),node313('p','지정 '+b.targeted_damage+' / 전달 '+b.transfer_damage+' / 보스 직격 '+b.boss_direct_damage+' · 합계 '+b.total_damage+' (중복 제외)','pierce-breakdown314'));}
 }
 let ready=$('breakerReadiness314');if(!ready&&$('hand')){ready=node313('div',undefined,'breaker-readiness314');ready.id='breakerReadiness314';ready.setAttribute('role','status');$('hand').before(ready);}
 const r=breakerReadiness314();if(ready){ready.hidden=!r||!['hand','shop'].includes(phase);ready.classList.toggle('is-blocked',!!r&&!r.ready);
  ready.textContent=r?'파쇄창 · 필요 행동력 '+r.cost+' / 현재 '+r.points+' · '+(phase!=='hand'?'손패 단계가 끝나 이번 전투 사용 불가':!enemies.length?'공격할 적 없음':r.ready?'지금 사용 가능':r.missing+' 부족'+(r.canRefill?' · 보석 '+r.missing+'개로 보충 가능':'')):'';
 }
}
function apWarningShow314(action,resume,leave=false){
 const r=breakerReadiness314();if(!r)return false;
 const state={resume,phase,card:r.card.id};apWarning314=state;
 const host=tacticModal('파쇄창 사용 전 행동력 확인');host.classList.add('ap-warning314');
 host.append(node313('p',leave?'상점으로 이동하면 손패에 남은 파쇄창을 이번 전투에 사용할 수 없습니다.':action+' · 사용 후 행동력이 파쇄창 비용 '+r.cost+'보다 적어집니다.'));
 host.append(node313('p','현재 행동력 '+r.points+' · 파쇄창 필요 '+r.cost+(r.missing?' · '+r.missing+' 부족':'')));
 const cancel=()=>{if(apWarning314!==state)return;apWarning314=null;$('modal')?.classList.add('hide');host.classList.remove('ap-warning314');render();};
 const first=tacticButton(host,'파쇄창 먼저 사용',()=>{if(apWarning314!==state)return;cancel();const i=hand.findIndex(c=>c.id===state.card);if(i>=0&&phase==='hand')use(i);});first.disabled=!r.ready;
 const proceed=tacticButton(host,leave?'그대로 상점으로 이동':'행동력을 소모하고 계속',()=>{
  if(apWarning314!==state||phase!==state.phase)return;cancel();apBypass314=true;try{state.resume();}finally{apBypass314=false;}
 });proceed.classList.add('ap-warning-proceed314');tacticButton(host,'돌아가기',cancel);
 window.Luck220?.emit('breaker_ap_warning',{action,leave_hand:leave,points:r.points,required:r.cost,card_id:r.card.id});return true;
}
(function(){
 const use0=use;use=function(i){
  if(apWarning314)return;const c=hand[i],r=breakerReadiness314();
  if(c&&r&&phase==='hand'&&r.ready&&c.id!==r.card.id&&!apBypass314&&!window.__luckAutoLabBotActive&&!pendingChoiceCardId){
   const cost=apCost(c),refill=(c.apGain||0)+(TRIAL_FLAGS_313.pierce&&cardKey(c)==='lance'&&!trialPierceRefund313?1:0);
   if(cost>0&&tacticAvailable(c)&&apState.points-cost+refill<r.cost){const id=c.id;return apWarningShow314(c.name+' 사용',()=>{const j=hand.findIndex(x=>x.id===id);if(j>=0)use(j);});}
  }return use0.apply(this,arguments);
 };
 const next0=next;next=function(){if(apWarning314)return;const r=breakerReadiness314();if(phase==='hand'&&r&&enemies.length&&(r.ready||r.canRefill)&&!apBypass314&&!window.__luckAutoLabBotActive&&!pendingChoiceCardId)return apWarningShow314('상점으로 이동',()=>next(),true);return next0.apply(this,arguments);};
 const close0=handleModalClose;handleModalClose=function(){apWarning314=null;$('modalContent')?.classList.remove('ap-warning314');return close0.apply(this,arguments);};
 const confirm0=targetedConfirm313;targetedConfirm313=function(){
  const state=trialChoice313,c=hand.find(x=>x.id===state?.id);
  const targets=c&&state.selected instanceof Set?[...state.selected].map(e=>({enemy:e,id:e.id,name:e.name,boss:!!e.boss,before:{hp:e.hp,shield:e.shield||0,core:e.coreHp??e.hp}})):[];
  const result=confirm0.apply(this,arguments);if(!result)return result;
  for(const p of targets){p.after={hp:p.enemy.hp,shield:p.enemy.shield||0,core:p.enemy.coreHp??p.enemy.hp};p.damage=p.before.hp-p.after.hp;p.killed=p.after.hp===0;delete p.enemy;}
  feedback314.hit={name:c.name,round,turn:bossStageActive()?bossEncounter.turn:null,targets};feedback314.serial++;
  const totals=stats.pierceBreakdown314||(stats.pierceBreakdown314={targeted_damage:0,transfer_damage:0,boss_direct_damage:0,total_damage:0});totals.targeted_damage+=targets.reduce((n,p)=>n+p.damage,0);totals.total_damage=totals.targeted_damage+totals.transfer_damage+totals.boss_direct_damage;
  renderFeedback314();for(const node of document.querySelectorAll('[data-enemy-id]'))if(targets.some(p=>p.id&&p.id===node.dataset.enemyId)){node.classList.remove('pierce-flash314');void node.offsetWidth;node.classList.add('pierce-flash314');}
  if(targets.some(p=>p.boss)&&$('bossStagePanel')){const panel=$('bossStagePanel');panel.classList.remove('pierce-flash314');void panel.offsetWidth;panel.classList.add('pierce-flash314');}
  window.LuckGameAudio?.statusCue?.('theft_success');
  window.Luck220?.emit('targeted_pierce_feedback',{card_id:cardKey(c),targets,actual_damage:targets.reduce((n,p)=>n+p.damage,0)});return result;
 };
 window.LuckTrials313.confirmTarget=targetedConfirm313;
 const render0=render;render=function(){const result=render0.apply(this,arguments);renderFeedback314();return result;};
 const start0=start;start=function(){feedback314={hit:null,serial:0,battle:null};apWarning314=null;apBypass314=false;return start0.apply(this,arguments);};
 window.LuckCombatFeedback314={classify:pierceClassify314,settle:pierceSettle314,readiness:breakerReadiness314,snapshot:()=>JSON.parse(JSON.stringify(feedback314)),render:renderFeedback314};
 document.addEventListener('DOMContentLoaded',renderFeedback314);
})();
