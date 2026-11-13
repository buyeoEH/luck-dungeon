/* v0.3.12: transactional choices; one physical instance, no cloning or free reuse. */
const TACTIC_CARDS=[
 {id:'deck_call',name:'전술 검색',price:10,limit:2,type:'tactic',tactic:'tutor',tacticAP:1,text:'이번 전투에 아직 사용하지 않은 덱 카드 1장을 선택해 손패로 이동 / 복제 없음 / 행동력 1'},
 {id:'hand_cycle',name:'결단의 순환',price:9,limit:2,type:'tactic',tactic:'cycle',tacticAP:1,text:'다른 손패 1장 이상을 선택해 영구 제거 / 제거한 수만큼 드로우 / 행동력 1'},
 {id:'hand_salvage',name:'회수와 투자',price:8,limit:2,type:'tactic',tactic:'salvage',tacticAP:1,text:'다른 손패 1장을 영구 제거 / 해당 카드의 상점 정가만큼 자원 획득(디버프 적용) / 가격 없는 카드 0 / 행동력 1'},
 {id:'last_reserve',name:'마지막 기회',price:7,limit:3,type:'actionPoint',apGain:1,tacticConditional:true,tacticAP:0,text:'행동력 +1 / 사용 후 다른 사용 가능한 카드가 없으면 드로우 +1 / 카드당 전투 1회'},
 {id:'ap_core',name:'행동의 원천',price:10,limit:2,type:'actionPoint',apGain:2,tacticAP:0,text:'행동력 +2 / 카드당 전투 1회'}
];
const TACTIC_PROMOTIONS=[
 {id:'p_tactic_blade',tier:1,branch:'행동·공격',from:{ap_core:1,sword:1},cost:{res:6},card:{id:'tactic_blade',name:'전술검',type:'actionPoint',atk:10,apGain:1,tacticAP:0,text:'덱 공격 +10 / 사용 시 행동력 +1 / 카드당 전투 1회'}},
 {id:'p_tactic_drive',tier:1,branch:'행동·드로우',from:{ap_core:1,chain:1},cost:{res:7},card:{id:'tactic_drive',name:'전술 지휘',type:'actionPoint',draw:2,apGain:2,tacticAP:1,tacticDraw:true,text:'행동력 +2 / 드로우 +2 / 사용 행동력 1(순증 +1) / 카드당 전투 1회'}},
 {id:'p_tactic_lance',tier:1,branch:'행동·관통',from:{ap_core:1,lance:1},cost:{res:7},card:{id:'tactic_lance',name:'기동 관통창',type:'pierce',atkTemp:8,pierce:2,apGain:1,tacticAP:1,text:'이번 전투 공격 +8 / 관통 +2 / 행동력 +1 / 사용 행동력 1 / 카드당 전투 1회'}},
 {id:'p_tactic_link',tier:1,branch:'행동·연계',from:{ap_core:1,combo:1},cost:{res:6},card:{id:'tactic_link',name:'연계 점화',type:'link',p1Gauge:15,apGain:1,tacticAP:0,text:'행동력 +1 / 원시 연계 게이지 +15 / 카드당 전투 1회'}},
 {id:'p_tactic_blade2',tier:2,branch:'행동·공격',from:{tactic_blade:1,steel:1},cost:{res:9,gem:1},card:{id:'tactic_blade2',name:'전술 성검',type:'actionPoint',atk:24,apGain:1,tacticAP:0,text:'덱 공격 +24 / 사용 시 행동력 +1 / 카드당 전투 1회'}},
 {id:'p_tactic_drive2',tier:2,branch:'행동·드로우',from:{tactic_drive:1,d5:1},cost:{res:9,gem:1},card:{id:'tactic_drive2',name:'전술 총지휘',type:'actionPoint',draw:4,apGain:2,tacticAP:1,tacticDraw:true,text:'행동력 +2 / 드로우 +4 / 사용 행동력 1(순증 +1) / 카드당 전투 1회'}}
];
RANDOM_POOL.push(...TACTIC_CARDS);PROMOS.push(...TACTIC_PROMOTIONS);
let tacticUsed=new Set(),tacticChoice=null,stoneChoice312=null;
function tacticEsc(x){return String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function tacticTargets(c){return c.tactic==='tutor'?deck.filter(x=>x.id!==c.id&&!hand.some(h=>h.id===x.id)&&!tacticUsed.has(x.id)):hand.filter(x=>x.id!==c.id);}
function tacticAvailable(c){
 if(!c||['attack','specialAttack','curse'].includes(c.type)||!apCanUse(c))return false;
 if(c.tacticAP!==undefined&&tacticUsed.has(c.id))return false;
 if(c.tactic)return tacticTargets(c).length>0;
 if(c.type==='promotionStone')return stoneRecipes().length>0;
 if(c.type==='remove')return deck.some(x=>x.id!==c.id);
 return true;
}
function tacticModal(title){if($('modalTitle'))$('modalTitle').textContent=title;const host=$('modalContent');if(host)host.replaceChildren();if($('close'))$('close').onclick=handleModalClose;$('modal')?.classList.remove('hide');return host;}
function tacticButton(host,text,fn){const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=fn;host?.appendChild(b);return b;}
function tacticShowChoice(c){
 tacticChoice={id:c.id,kind:c.tactic,selected:new Set()};pendingChoiceCardId=c.id;pendingChoiceType='tactic312';tacticRenderChoice();
}
function tacticRenderChoice(){
 const state=tacticChoice,c=hand.find(x=>x.id===state?.id);if(!c)return;
 const host=tacticModal(c.name+' · 선택 확정 전에는 소모 없음');
 const p=document.createElement('p');p.textContent=c.text+' · 선택 취소 가능';host?.appendChild(p);
 for(const target of tacticTargets(c)){
  const extra=c.tactic==='salvage'?' · 회수 기준가 '+Math.max(0,target.price||0):'';
  tacticButton(host,(state.selected.has(target.id)?'✓ ':'')+target.name+extra,()=>{if(c.tactic!=='cycle')state.selected.clear();state.selected.has(target.id)?state.selected.delete(target.id):state.selected.add(target.id);tacticRenderChoice();});
 }
 const n=state.selected.size;const confirm=tacticButton(host,c.tactic==='cycle'?'선택 '+n+'장 영구 제거 후 '+n+'장 드로우':'선택 확정',()=>tacticConfirm([...state.selected]));if(confirm)confirm.disabled=!n;
 tacticButton(host,'취소',handleModalClose);
}
function tacticConfirm(ids){
 const state=tacticChoice,c=hand.find(x=>x.id===state?.id);if(!c||phase!=='hand'||!apCanUse(c)||tacticUsed.has(c.id))return false;
 const unique=[...new Set(ids)],valid=tacticTargets(c);if(!unique.length||unique.length!==ids.length||(c.tactic!=='cycle'&&unique.length!==1)||unique.some(id=>!valid.some(x=>x.id===id)))return false;
 const targets=unique.map(id=>valid.find(x=>x.id===id));
 if(!apSpend(apCost(c),'card',cardKey(c)))return false;
 if(!commitChoiceCard(c.id,false))return false;
 tacticUsed.add(c.id);tacticChoice=null;pendingChoiceCardId=null;pendingChoiceType=null;
 const changes=[];let actualDraw=0,value=0;
 if(c.tactic==='tutor'){
  const target=targets[0];draw=draw.filter(x=>x.id!==target.id);graveyard=graveyard.filter(x=>x.id!==target.id);hand.push(target);lastDrawn=[target.name];
  log('🔎 전술 검색 → ['+target.name+'] 덱에서 손패로 이동 (복제 없음)','good');
 }else{
  const listed=targets.map(x=>x.name);value=c.tactic==='salvage'?Math.max(0,targets[0].price||0):0;
  targets.forEach(x=>purgeCard(x.id));
  if(c.tactic==='cycle')actualDraw=drawCards(targets.length);
  else resource+=gain('resource',value);
  log('🗑 '+listed.join(', ')+' 영구 제거 → '+(c.tactic==='cycle'?'드로우 '+actualDraw+' / 요청 '+targets.length:'자원 기준가 '+value+' (실제 획득은 디버프 적용)'),'good');
 }
 registerActionLink(c,changes);changes.forEach(x=>log(typeof x==='string'?x:x.text,'good'));
 window.Luck220?.emit('card_used',{card_id:cardKey(c),instance_id:c.id,name:c.name,effects:{tactic:c.tactic,targets:unique,actual_draw:actualDraw,listed_resource:value}});
 window.Luck220?.emit('tactic_choice_committed',{card_id:cardKey(c),instance_id:c.id,kind:c.tactic,targets:unique,permanent_removal:c.tactic!=='tutor',actual_draw:actualDraw,listed_resource:value});
 $('modal')?.classList.add('hide');render();return true;
}
function stoneRows312(){
 const first=new Map(PROMOS.filter(p=>(p.tier||1)===1).map(p=>[p.card.id,p.card]));
 return PROMOS.filter(p=>p.tier===2).map(p=>{
  const missing=Object.keys(p.from).filter(k=>first.has(k)&&countInDeck(k)<p.from[k]);
  const after=k=>Object.entries(p.from).reduce((n,[id,need])=>n+Math.max(0,need-countInDeck(id)-(id===k?1:0)),0);
  missing.sort((a,b)=>after(a)-after(b)||a.localeCompare(b));
  return {promo:p,missing,remaining:missing.length?after(missing[0]):Infinity,resourceShort:Math.max(0,(p.cost.res||0)-resource),gemShort:Math.max(0,(p.cost.gem||0)-gems)};
 }).filter(x=>x.missing.length).sort((a,b)=>a.remaining-b.remaining||a.gemShort-b.gemShort||a.resourceShort-b.resourceShort||a.promo.id.localeCompare(b.promo.id));
}
function stoneOpen312(stone){
 const reward=!stone;if(!reward&&!hand.some(c=>c.id===stone.id))return;
 stoneChoice312={reward,id:stone?.id||null,recipe:null};pendingChoiceCardId=stone?.id||null;pendingChoiceType=reward?'stoneReward312':'promotionStone';pendingPromotionStoneId=stone?.id||null;
 const host=tacticModal('🧿 만능승급석 · 2차 경로용 1차 카드 즉시 지급');
 const note=document.createElement('p');note.textContent='재료 완성에 가까운 순서입니다. 카드 1장을 덱에 지급하며 2차 승급 비용은 별도입니다. 비용 부족분은 현재 보유량 기준입니다.';host?.appendChild(note);
 for(const row of stoneRows312())for(const id of row.missing){const first=PROMOS.find(p=>(p.tier||1)===1&&p.card.id===id);tacticButton(host,first.card.name+' → '+row.promo.card.name+' · 지급 후 부족 재료 '+row.remaining+' · 자원 부족 '+row.resourceShort+' · 보석 부족 '+row.gemShort,()=>showPromotionStoneOptions(row.promo.id));}
 if(!stoneRows312().length){const p=document.createElement('p');p.textContent='지급으로 보충할 1차 재료가 없습니다. 취소해 다른 보상을 선택하거나 카드를 보존하세요.';host?.appendChild(p);}
 tacticButton(host,'취소',handleModalClose);
}
function stoneOptions312(recipeId){
 if(!stoneChoice312)return;const row=stoneRows312().find(x=>x.promo.id===recipeId);if(!row)return;stoneChoice312.recipe=recipeId;pendingStoneRecipeId=recipeId;
 const host=tacticModal('🧿 '+row.promo.card.name+' · 지급 카드 확정');
 for(const id of row.missing){const p=PROMOS.find(x=>(x.tier||1)===1&&x.card.id===id);tacticButton(host,p.card.name+' 1장 지급 확정',()=>resolvePromotionStone(id));}
 tacticButton(host,'다른 경로',()=>stoneOpen312(stoneChoice312.reward?null:hand.find(c=>c.id===stoneChoice312.id)));
}
function stoneResolve312(id){
 const state=stoneChoice312;if(!state||!(state.reward?phase==='reward':phase==='hand'))return false;
 const row=stoneRows312().find(x=>x.promo.id===state.recipe);if(!row?.missing.includes(id))return false;
 const first=PROMOS.find(p=>(p.tier||1)===1&&p.card.id===id);if(!first)return false;
 if(!state.reward&&(!hand.some(c=>c.id===state.id)||!commitChoiceCard(state.id,true)))return false;
 stoneChoice312=null;pendingChoiceCardId=null;pendingChoiceType=null;pendingPromotionStoneId=null;pendingStoneRecipeId=null;
 addNewCard(cp(first.card));stats.promotionStonesUsed++;log('🧿 만능승급석 → ['+first.card.name+'] 즉시 지급 · 2차 경로 ['+row.promo.card.name+']','good');
 window.Luck220?.emit('promotion_stone_granted',{target_tier:2,recipe_id:row.promo.id,card_id:id,source:state.reward?'boss_reward':'held_stone'});
 $('modal')?.classList.add('hide');if(state.reward)nextRound();else render();return true;
}
function v312OpenStoneReward(){stoneOpen312(null);}
(function(){
 const reset=start;start=function(){tacticUsed=new Set();tacticChoice=null;stoneChoice312=null;return reset.apply(this,arguments);};
 const round0=drawStart;drawStart=function(){tacticUsed=new Set();tacticChoice=null;return round0.apply(this,arguments);};
 const cost=apCost;apCost=function(c){return c?.tacticAP!==undefined&&apEnabled()?c.tacticAP:cost(c);};
 const can=apCanUse;apCanUse=function(c){return !(c?.tacticAP!==undefined&&tacticUsed.has(c.id))&&can(c);};
 const consume=commitChoiceCard;commitChoiceCard=function(id){const c=consume.apply(this,arguments);if(c)tacticUsed.add(c.id);return c;};
 const used=use;use=function(i){if(tacticChoice||stoneChoice312)return;const c=hand[i];if(c?.tactic&&phase==='hand'){if(!apCanUse(c))return;if(!tacticTargets(c).length)return log('선택할 다른 카드가 없습니다. 카드와 행동력을 보존합니다.');return tacticShowChoice(c);}if(c?.tacticAP!==undefined&&tacticUsed.has(c.id))return;const n=stats.cardsUsed,r=used.apply(this,arguments);if(c&&stats.cardsUsed>n)tacticUsed.add(c.id);return r;};
 const refill=apUsed;apUsed=function(c){tacticUsed.add(c.id);const out=refill.apply(this,arguments);if(c.tacticDraw)drawCards(c.draw||0);if(c.tacticConditional&&!hand.some(tacticAvailable)){const n=drawCards(1);log('🃏 마지막 기회 → 다른 사용 카드 없음 · 드로우 '+n,'good');}return out;};
 const close=handleModalClose;handleModalClose=function(){if(tacticChoice||stoneChoice312){const reward=stoneChoice312?.reward;tacticChoice=null;stoneChoice312=null;pendingChoiceCardId=null;pendingChoiceType=null;pendingPromotionStoneId=null;pendingStoneRecipeId=null;if(reward)rewardLocked=false;$('modal')?.classList.add('hide');render();return;}return close.apply(this,arguments);};
 const advance=next;next=function(){if(tacticChoice||stoneChoice312)return log('먼저 카드 선택을 확정하거나 취소하세요.');return advance.apply(this,arguments);};
 stoneRecipes=stoneRows312;choosePromotionMaterial=stoneOpen312;showPromotionStoneOptions=stoneOptions312;resolvePromotionStone=stoneResolve312;
 window.showPromotionStoneOptions=stoneOptions312;
 PROMOTION_STONE.text='2차 승급에 필요한 부족한 1차 승급 카드 1장 지급 / 재료 완성에 가까운 경로 우선 / 승급 비용 별도';
 const reward0=bossReward;bossReward=function(){const out=reward0.apply(this,arguments);if(rewards[3]){rewards[3][1]='2차 승급에 필요한 1차 승급 카드 1장을 선택 즉시 덱에 지급합니다. 지급 후 부족 재료와 현재 비용 부족분 기준으로 정렬하며 승급 비용은 별도입니다.';render();}return out;};
 const category=cardCategory;cardCategory=function(c){return c.tactic?'전술 선택 / 영구 제거·검색':c.tacticAP!==undefined?'행동력·전술':category(c);};
 const tag=actionTag;actionTag=function(c){return c?.tactic?(c.tactic==='salvage'?'economy':'draw'):tag(c);};
})();
