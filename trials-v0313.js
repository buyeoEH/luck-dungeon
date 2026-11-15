/* Opt-in, independent experiments; unchanged HP table and link overflow algorithm. */
const TRIAL_FLAGS_313=Object.freeze({pierce:new URLSearchParams(location.search).get('trialPierce')==='1',luck:new URLSearchParams(location.search).get('trialLuck')==='1'});
const LUCK_SUPPORT_313=[
 {id:'luck_focus313',name:'행운 집중',type:'luckStrength',price:8,limit:2,tacticAP:1,tempLuck313:1,text:'이번 전투 행운력 +1 (최대 3) / 좋은 결과 확률만 증가 / 행동력 1 / 카드당 전투 1회'},
 {id:'luck_seed313',name:'행운의 씨앗',type:'luckStrength',price:14,limit:1,tacticAP:1,runLuck313:1,text:'이번 런 누적 행운력 +1 (최대 3) / 불운 최소 15% / 행동력 1 / 카드당 전투 1회'}
];
if(TRIAL_FLAGS_313.luck)RANDOM_POOL.push(...LUCK_SUPPORT_313);
LUCK_CARD_ICONS.luck_focus313=LUCK_CARD_ICONS.luckcharm;LUCK_CARD_ICONS.luck_seed313=LUCK_CARD_ICONS.coin;
/* TRIAL_LOGIC_313 */
const PIERCE_HIT_313=Object.freeze({lance:6,drill:12,breaker:18,linklance:16,tactic_lance:12});
const PIERCE_TARGETS_313=Object.freeze({breaker:2,linklance:2});
const LUCK_TABLES_313=Object.freeze({
 spark:[45,30,25],coin:[50,25,25],dice:[52,18,30],potion:[55,20,25],box:[55,15,30],
 luckcharm:[60,20,20],luckfate:[65,20,15],
 fateblade:[50,35,15],luckminer:[50,35,15],lucklink:[50,35,15],luckdraw:[50,35,15],luckguard:[50,35,15],luckforge:[50,35,15]
});
let trialChoice313=null,trialState313,trialPierceRefund313=false;
function resetTrials313(){trialState313={tempLuck:0,runLuck:0,future:null,runBoon:0,runCurse:0,shopUsed:false,targetedDamage:0,targetedCombatDamage:0,luckEvents:0};trialPierceRefund313=false;trialChoice313=null;}
resetTrials313();
function luckTable313(c){
 if(!TRIAL_FLAGS_313.luck||!LUCK_TABLES_313[cardKey(c)])return null;
 const [g,n,b]=LUCK_TABLES_313[cardKey(c)],strength=Math.min(6,trialState313.tempLuck+trialState313.runLuck),shift=Math.min(b-15,strength*3);
 return {good:g+shift,neutral:n,bad:b-shift,strength,minimumBad:15};
}
function trialLuckText313(c){
 const id=cardKey(c),table=luckTable313(c);if(!table)return c.text;
 const effect={spark:'행운: 자원 +3 / 중립: +1 / 불운: 보유 자원 최대 2 손실',coin:'행운: 자원 +6 / 중립: +2 / 불운: 보유 자원 최대 3 손실',dice:'행운: 이번 전투 행동력 +1·연계 게이지 +12 / 중립: 자원 +2 / 불운: 이번 전투 공격 −4',potion:'행운: 이번 전투 행동력 +1·드로우 +2 / 중립: 드로우 +1 / 불운: 이번 전투 공격 −5',box:'행운: 다음 3전투 드로우 +1·첫 구매 1 할인 / 중립: 자원 +3 / 불운: 다음 3전투 첫 구매 비용 +1',luckcharm:'행운: 자원 +6·다음 3전투 드로우 +1·첫 구매 1 할인 / 중립: 자원 +3 / 불운: 다음 3전투 첫 구매 비용 +1',luckfate:'행운: 이번 런 시작 드로우 +1·첫 구매 1 할인 / 중립: 자원 +4 / 불운: 이번 런 첫 구매 비용 +1 (다음 행운으로 회복)',fateblade:'영구 공격 +13 / 행운: 이번 전투 공격 +12 / 중립: +4 / 불운: −6',luckminer:'행운: 자원 +7 / 중립: +4 / 불운: +1',lucklink:'영구 공격 +18·연계 증폭 +5 / 행운: 이번 전투 공격 +18 / 중립: +7 / 불운: −5',luckdraw:'행운: 드로우 +5 / 중립: +2 / 불운: 드로우 없음',luckguard:'행운: 전체 보호 +3 / 중립: +1 / 불운: 보호 없음',luckforge:'영구 공격 +17 / 행운: 자원 +10 / 중립: +5 / 불운: +1'}[id];
 return effect+' / 불운 최소 15% / 별도 파괴 없음 / 행동력 '+apCost(c);
}
function futureActive313(){const f=trialState313.future;return f&&bossCombatNo>f.started&&bossCombatNo<=f.expires?f:null;}
function futureGive313(good){trialState313.future={good,started:bossCombatNo,expires:bossCombatNo+3};}
function resolveLuck313(c){
 const table=luckTable313(c);if(!table)return false;
 const roll=Math.random()*100,outcome=roll<table.good?'good':roll<table.good+table.neutral?'neutral':'bad',idx={good:0,neutral:1,bad:2}[outcome],id=cardKey(c),changes=[];
 const res=n=>{if(n>=0)resource+=gain('resource',n);else resource=Math.max(0,resource+n);};
 if(id==='spark')res([3,1,-2][idx]);
 else if(id==='coin')res([6,2,-3][idx]);
 else if(id==='dice'){if(idx===0){apState.points++;apEvent('luck_refill',1,{id});p1Round.gaugeBonus+=12;}else if(idx===1)res(2);else tempAttack-=4;}
 else if(id==='potion'){if(idx===0){apState.points++;apEvent('luck_refill',1,{id});drawCards(2);}else if(idx===1)drawCards(1);else tempAttack-=5;}
 else if(id==='box'||id==='luckcharm'){if(idx===1)res(3);else{futureGive313(idx===0);if(idx===0&&id==='luckcharm')res(6);}}
 else if(id==='luckfate'){if(idx===0){trialState313.runBoon=1;trialState313.runCurse=0;}else if(idx===1)res(4);else{trialState313.runCurse=1;trialState313.runBoon=0;}}
 else if(id==='fateblade')tempAttack+=[12,4,-6][idx];
 else if(id==='lucklink')tempAttack+=[18,7,-5][idx];
 else if(id==='luckminer')res([7,4,1][idx]);
 else if(id==='luckforge')res([10,5,1][idx]);
 else if(id==='luckdraw')drawCards([5,2,0][idx]);
 else if(id==='luckguard')prot.all+=(idx===0?3:idx===1?1:0);
 trialState313.luckEvents++;
 registerActionLink(c,changes);changes.forEach(x=>log(typeof x==='string'?x:x.text,'good'));
 const label={good:'행운',neutral:'중립',bad:'불운'}[outcome];log('🎲 '+c.name+' → '+label+' · 행운력 '+table.strength+' · '+trialLuckText313(c),idx===2?true:'good');
 window.Luck220?.emit('luck_trial_result',{card_id:id,instance_id:c.id,outcome,probabilities:table,roll,scope:id==='luckfate'?'run':['box','luckcharm'].includes(id)?'next_3_combats':'combat',state:{...trialState313}});
 render();if(isVisualMode()&&!dangerActive)showCardUseModal(c,[{text:label+' · '+trialLuckText313(c),color:idx===2?'#fca5a5':'#fde68a'}]);return true;
}
function targetedResult313(enemy,damage){
 const e={...enemy},before=e.hp;let bypass=0;
 if(e.boss&&e.shield!==undefined){bypass=Math.min(e.coreHp,Math.ceil(damage*.25));e.coreHp-=bypass;e.hp=e.coreHp+e.shield;}
 const normal=bossApplyDamage(e,damage-bypass,'strike',0);
 return {enemy:e,damage:before-e.hp,shieldDamage:normal.shieldDamage,coreDamage:normal.coreDamage+bypass,bypass,killed:e.hp===0};
}
function targetedPlan313(c,selected){
 const targets=[...selected],budget=PIERCE_HIT_313[cardKey(c)];
 if(!targets.length)return [];
 // Divide the existing total budget; choosing two enemies must not double damage.
 return targets.map((enemy,i)=>({target:enemy,budget:Math.floor(budget/targets.length)+(i<budget%targets.length?1:0),...targetedResult313(enemy,Math.floor(budget/targets.length)+(i<budget%targets.length?1:0))}));
}
function targetedShow313(c){trialChoice313={id:c.id,selected:new Set()};pendingChoiceCardId=c.id;pendingChoiceType='pierce313';targetedRender313();}
function targetedRender313(){
 const c=hand.find(x=>x.id===trialChoice313?.id);if(!c)return;
 const host=tacticModal(c.name+' · 먼저 타격할 적 선택'),limit=PIERCE_TARGETS_313[cardKey(c)]||1,n=PIERCE_HIT_313[cardKey(c)];
 trialChoice313.selected=new Set([...trialChoice313.selected].filter(e=>enemies.includes(e)));
 const selected=trialChoice313.selected,plan=targetedPlan313(c,selected);
 host.classList.add('selection-surface');
 host.append(node313('p','최대 '+limit+'명 · 총 지정 피해 '+n+'을 선택한 적에게 나눕니다. 보스는 배정 피해의 25% 올림을 진체력에 우선 적용합니다. 기존 공격·관통 효과도 유지합니다.'));
 const grid=node313('div',undefined,'selection-grid');
 for(const e of enemies){
  const row=node313('article',undefined,'selection-card'+(selected.has(e)?' is-selected':'')),p=plan.find(x=>x.target===e);
  const button=tacticButton(row,(selected.has(e)?'✓ ':'')+e.name+' · HP '+e.hp+(p?' → '+p.enemy.hp+' · 보호막 −'+p.shieldDamage+' / 진체력 −'+p.coreDamage:''),()=>{
   if(selected.has(e))selected.delete(e);else if(limit===1){selected.clear();selected.add(e);}else if(selected.size<limit)selected.add(e);
   targetedRender313();
  });button.classList.add('targeted-toggle');button.setAttribute('aria-pressed',String(selected.has(e)));button.disabled=!selected.has(e)&&selected.size>=limit&&limit>1;grid.append(row);
 }host.append(grid);
 const footer=node313('footer',undefined,'selection-footer'),summary=node313('p',plan.length?plan.map(p=>p.target.name+' '+p.damage+' 피해').join(' / ')+' · 실제 총 피해 '+plan.reduce((sum,p)=>sum+p.damage,0):'먼저 타격할 적을 선택하세요. 확정 전에는 소모하지 않습니다.','selection-summary');summary.setAttribute('aria-live','polite');footer.append(summary);
 const ok=tacticButton(footer,'지정 타격 확정',()=>targetedConfirm313());ok.classList.add('selection-confirm');ok.disabled=!selected.size;tacticButton(footer,'취소',handleModalClose);host.append(footer);
}
function targetedConfirm313(){
 const state=trialChoice313,c=hand.find(x=>x.id===state?.id),targets=state?.selected;
 if(!TRIAL_FLAGS_313.pierce||phase!=='hand'||!c||!(targets instanceof Set)||!targets.size||targets.size>(PIERCE_TARGETS_313[cardKey(c)]||1)||[...targets].some(e=>!enemies.includes(e))||!apCanUse(c)||tacticUsed.has(c.id))return false;
 const plan=targetedPlan313(c,targets);
 if(!apSpend(apCost(c),'card',cardKey(c))||!commitChoiceCard(c.id,false))return false;
 trialChoice313=null;pendingChoiceCardId=null;pendingChoiceType=null;
 tempAttack+=c.atkTemp||0;pierce+=c.pierce||0;apUsed(c);
 if(cardKey(c)==='lance'&&!trialPierceRefund313&&apEnabled()){trialPierceRefund313=true;apState.points++;apEvent('pierce_first_refund',1,{id:cardKey(c)});}
 for(const p of plan){const enemy=p.target;
 Object.assign(enemy,p.enemy);stats.damageDealt+=p.damage;stats.pierceDamage+=p.damage;stats.targetedPierceDamage=(stats.targetedPierceDamage||0)+p.damage;
 trialState313.targetedDamage+=p.damage;trialState313.targetedCombatDamage+=p.damage;
 if(p.killed){enemies=enemies.filter(x=>x!==enemy);stats.enemiesKilled++;stats.pierceKills++;if(enemy.boss){stats.bossesKilled++;if(stats.firstBossKillRound==null)stats.firstBossKillRound=round;}}
 log('🗡 '+c.name+' → '+enemy.name+' 지정 피해 '+p.damage+' · 보호막 '+p.shieldDamage+' / 진체력 '+p.coreDamage+' (직접 우회 '+p.bypass+')','good');
 window.Luck220?.emit('targeted_pierce',{card_id:cardKey(c),instance_id:c.id,target:enemy.name,target_count:plan.length,allocated_budget:p.budget,total_budget:PIERCE_HIT_313[cardKey(c)],damage:p.damage,shield_damage:p.shieldDamage,core_damage:p.coreDamage,bypass:p.bypass,killed:p.killed,scope:'hand_before_battle',counted_in_damage_dealt:true});
 }
 const changes=[];registerActionLink(c,changes);changes.forEach(x=>log(typeof x==='string'?x:x.text,'good'));updateEnemyStatus();
 $('modal')?.classList.add('hide');render();return true;
}
(function(){
 const cost=apCost;apCost=function(c){if(TRIAL_FLAGS_313.luck&&c?.type==='random')return apEnabled()?cardKey(c)==='spark'?0:cardKey(c)==='luckfate'?2:1:0;return cost(c);};
 if(TRIAL_FLAGS_313.luck)for(const c of CARD_CATALOG_313.values())if(c.type==='random')c.text=trialLuckText313(c);
 if(TRIAL_FLAGS_313.pierce)for(const c of CARD_CATALOG_313.values())if(PIERCE_HIT_313[c.id])c.text+=' / [검증] 최대 '+(PIERCE_TARGETS_313[c.id]||1)+'명에게 총 '+PIERCE_HIT_313[c.id]+' 지정 피해 분배'+(c.id==='lance'?' / 전투 첫 관통창만 행동력 1 회복':'');
 for(const [id,c]of CARD_CATALOG_313)CARD_META_313.set(id,Object.freeze({...CARD_META_313.get(id),selectionDescription:c.text||'기본 공격 +'+(c.atk||0),actionPointCost:apCost(c)}));
 const oldUse=use;use=function(i){
  if(trialChoice313)return;const c=hand[i];if(phase!=='hand'||!c)return oldUse.apply(this,arguments);
  if(TRIAL_FLAGS_313.pierce&&PIERCE_HIT_313[cardKey(c)]){if(tacticChoice||stoneChoice312||!apCanUse(c)||tacticUsed.has(c.id)||!enemies.length)return;return targetedShow313(c);}
  if(TRIAL_FLAGS_313.luck&&c.type==='luckStrength'){
   if(tacticChoice||stoneChoice312||!apCanUse(c)||tacticUsed.has(c.id))return;
   const k=c.tempLuck313?'tempLuck':'runLuck';if(trialState313[k]>=3)return log('🍀 행운력 상한 3 · 카드와 행동력 보존');
   if(!apSpend(apCost(c),'card',cardKey(c))||!commitChoiceCard(c.id,false))return;
   trialState313[k]=Math.min(3,trialState313[k]+1);log('🍀 '+c.name+' → '+(k==='tempLuck'?'임시':'누적')+' 행운력 '+trialState313[k]+'/3','good');window.Luck220?.emit('luck_strength',{kind:k,value:trialState313[k],cap:3});render();return;
  }
  return oldUse.apply(this,arguments);
 };
 const roll=random;random=function(c){return TRIAL_FLAGS_313.luck&&luckTable313(c)?resolveLuck313(c):roll.apply(this,arguments);};
 const close=handleModalClose;handleModalClose=function(){if(trialChoice313){trialChoice313=null;pendingChoiceCardId=null;pendingChoiceType=null;$('modal')?.classList.add('hide');render();return;}return close.apply(this,arguments);};
 const advance=next;next=function(){if(trialChoice313)return log('지정 타격을 확정하거나 취소하세요.');return advance.apply(this,arguments);};
 const start0=start;start=function(){resetTrials313();const r=start0.apply(this,arguments);stats.trials313=trialState313;window.Luck220?.emit('trial_modes',{...TRIAL_FLAGS_313,bad_floor:15,temp_luck_cap:3,run_luck_cap:3});return r;};
 const draw0=drawStart;drawStart=function(){trialState313.tempLuck=0;trialState313.shopUsed=false;trialState313.targetedCombatDamage=0;trialPierceRefund313=false;trialChoice313=null;const out=draw0.apply(this,arguments);if(TRIAL_FLAGS_313.luck){const f=futureActive313(),extra=(f?.good?1:0)+trialState313.runBoon;if(extra){const actual=drawCards(extra);log('🍀 지속 행운 · 시작 추가 드로우 '+actual,'good');}render();}return out;};
 const price=p5Price;p5Price=function(c){const base=price(c);if(!TRIAL_FLAGS_313.luck||phase!=='shop'||trialState313.shopUsed)return base;const f=futureActive313(),delta=trialState313.runCurse-trialState313.runBoon+(f?(f.good?-1:1):0);return Math.max(1,base+delta);};
 const buy0=buy;buy=function(){const before=stats.cardsBought,r=buy0.apply(this,arguments);if(TRIAL_FLAGS_313.luck&&stats.cardsBought>before){trialState313.shopUsed=true;render();}return r;};
 const parts=apCardText;apCardText=function(c){return parts(c)+(TRIAL_FLAGS_313.luck&&c?.type==='random'?' · 🍀 '+trialState313.tempLuck+'+'+trialState313.runLuck:'');};
 const category=cardCategory;cardCategory=function(c){return c.type==='luckStrength'?'행운력':category(c);};
 const available=tacticAvailable;tacticAvailable=function(c){if(TRIAL_FLAGS_313.luck&&c?.type==='luckStrength'&&trialState313[c.tempLuck313?'tempLuck':'runLuck']>=3)return false;if(TRIAL_FLAGS_313.pierce&&PIERCE_HIT_313[cardKey(c||{})]&&!enemies.length)return false;return available(c);};
 const hud=apRender;apRender=function(){const r=hud.apply(this,arguments);if(TRIAL_FLAGS_313.luck&&$('apHud'))$('apHud').textContent+=' · 🍀 임시 '+trialState313.tempLuck+'/3 · 누적 '+trialState313.runLuck+'/3';return r;};
 const strategy=strategyText;strategyText=function(c){return TRIAL_FLAGS_313.luck&&c.type==='random'?trialLuckText313(c):strategy(c);};
 window.LuckTrials313={flags:TRIAL_FLAGS_313,luckTable:luckTable313,snapshot:()=>JSON.parse(JSON.stringify(trialState313)),targetPreview:targetedResult313,confirmTarget:targetedConfirm313};
 document.addEventListener('DOMContentLoaded',()=>{const box=node313('section',undefined,'ap-rules');box.append(node313('b','이번 판의 검증 옵션: 관통 '+(TRIAL_FLAGS_313.pierce?'켜짐':'꺼짐')+' / 행운 '+(TRIAL_FLAGS_313.luck?'켜짐':'꺼짐')));for(const [label,p,l]of [['기준판',0,0],['관통만 검증',1,0],['행운만 검증',0,1],['둘 다 검증',1,1]]){const a=node313('a',label);const u=new URL(location.href);u.searchParams.set('trialPierce',p);u.searchParams.set('trialLuck',l);a.href=u.href;a.style.cssText='display:inline-block;margin:6px;padding:8px;border:1px solid #64748b;border-radius:8px';box.append(a);}$('welcomeNormal')?.parentElement?.before(box);});
})();
