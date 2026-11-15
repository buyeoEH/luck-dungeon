/* Selection contract: previews are pure; canonical values never read mutable instances. */
const REFUND_SPECIAL_313=Object.freeze({
 mine:2,vein:10,furnace:12,lode:18,mint:12,skill:10,foreman:12,
 steel:11,hero:28,frenzy:30,raider:10,scholar:11,breaker:14,barrage:16,
 skyhero:24,stormhero:24,linkhero:24,infinite:24,bountygold:12,royalgold:20,
 skylance:20,annihilation:24,fateblade:14,luckminer:12,raiderking:20,wisdomsword:20,
 stararmor:20,masterlink:20,lucklink:20,luckdraw:12,luckguard:12,luckforge:20,
 luckcharm:14,luckfate:22,skyking:30,stormking:30,linkking:30,zenith:30,
 linklance:14,guard_sword:20,guard_miner:12,guard_vault:12,guard_cycle:12,guard_link:12,
 tactic_blade:12,tactic_drive:12,tactic_lance:14,tactic_link:12,tactic_blade2:20,tactic_drive2:20,
 legend_fortune:24,legend_star:24,legend_cataclysm:24,legend_oracle:24,promo_stone:18,
 curse_dead:1,curse_debt:1
});
const CARD_CATALOG_313=new Map([...BASE,...BASIC,...RANDOM_POOL,...PROMOS.map(p=>p.card),...LEGEND_POOL,...CURSE_POOL,PROMOTION_STONE].map(c=>[c.id,c]));
const CARD_META_313=new Map([...CARD_CATALOG_313].map(([id,c])=>{
 const refund=REFUND_SPECIAL_313[id]??(c.price!==undefined?c.price:(c.type==='attack'?c.atk:undefined));
 if(!Number.isFinite(refund)||refund<0)throw Error('Missing fixed refund value: '+id);
 return [id,Object.freeze({refundValue:refund,selectionDescription:c.text||('기본 공격 +'+(c.atk||0)),actionPointCost:apCost(c),luckTable:c.type==='random'?legacyLuckTable313(id):null})];
}));
function legacyLuckTable313(id){
 const table={dice:[34,30,36],box:[38,24,38],coin:[48,32,20],potion:[40,25,35],spark:[42,35,23],luckcharm:[58,26,16],luckfate:[66,23,11]};
 const row=table[id]||(['fateblade','luckminer','lucklink','luckdraw','luckguard','luckforge'].includes(id)?[50,35,15]:null);return row?{good:row[0],neutral:row[1],bad:row[2],legacy:true,separateDestruction:!!table[id]}:null;
}
function cardRefund313(c){const row=CARD_META_313.get(cardKey(c));if(!row)throw Error('Unregistered refund value: '+cardKey(c));return row.refundValue;}
function resourcePreview313(value){
 const pool=guardPool('resource'),allocation=guardAllocate('resource',pool,prot,x=>[applyCut(value,x)]);
 return {listed:value,actual:applyCut(value,allocation),blocked:value-applyCut(value,allocation),protection:allocation.absorbed};
}
function selectionPreview313(c,targets){
 if(c.tactic==='tutor')return {text:targets.length?targets[0].name+'을(를) 손패로 가져옵니다':'가져올 카드 1장을 선택하세요',permanent:false};
 if(c.tactic==='cycle'){const actual=Math.min(targets.length,draw.length);return {text:targets.length+'장 영구 삭제 → 최대 '+actual+'장 드로우 (요청 '+targets.length+'장 · 남은 드로우 '+draw.length+'장)',permanent:true,requestedDraw:targets.length,actualDraw:actual};}
 if(c.tactic==='salvage'&&targets.length){const result=resourcePreview313(cardRefund313(targets[0]));return {text:targets[0].name+' 영구 삭제 → 자원 +'+result.actual+' (환원 '+result.listed+' · 감소 '+result.blocked+' · 보호 '+result.protection+' 소모)',permanent:true,...result};}
 return {text:'영구 삭제할 카드 1장을 선택하세요',permanent:true};
}
function metadataText313(c){
 const m=CARD_META_313.get(cardKey(c));if(!m)return '';
 const table=window.LuckTrials313?.luckTable(c)||m.luckTable;
 return '환원 가치 '+m.refundValue+' · 행동력 비용 '+apCost(c)+(table?' · 행운 '+table.good+'% / 중립 '+table.neutral+'% / 불운 '+table.bad+'%'+(table.legacy?(table.separateDestruction?' (기존 판정 · 별도 파괴 가능)':' (기존 고유 판정 · 별도 파괴 없음)'):''):c.type==='random'?' · 확률은 아래 고유 효과 참조':'');
}
function node313(tag,text,cls){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;}
function detail313(c,host){
 const box=node313('section',undefined,'selection-details');box.append(node313('p',c.text||'기본 공격 +'+(c.atk||0)),node313('p',metadataText313(c)));
 const recipes=PROMOS.filter(p=>p.card.id===cardKey(c)||Object.hasOwn(p.from,cardKey(c)));
 box.append(node313('strong','승급 경로'));
 if(!recipes.length)box.append(node313('p','연결된 승급 없음'));
 for(const p of recipes)box.append(node313('p',Object.entries(p.from).map(([id,n])=>(CARD_NAME[id]||id)+' ×'+n).join(' + ')+' → '+p.card.name+' · 자원 '+(p.cost.res||0)+' / 보석 '+(p.cost.gem||0)));
 host.append(box);return box;
}
function cardTile313(c,selected,toggle){
 const tile=node313('article',undefined,'shop-card selection-card'+(selected?' is-selected':''));tile.dataset.cardId=c.id;
 const button=node313('button',undefined,'selection-toggle');button.type='button';button.setAttribute('aria-pressed',String(selected));button.setAttribute('aria-label',c.name+' 선택');
 const src=LUCK_CARD_ICONS[cardKey(c)];if(src){const img=document.createElement('img');img.src=src;img.alt='';img.className='luck-card-icon luck-icon-shop';button.append(img);}
 button.append(node313('b',(selected?'✓ ':'')+c.name),node313('span',cardCategory(c),'selection-type'),node313('p',CARD_META_313.get(cardKey(c))?.selectionDescription||c.text||'기본 공격 +'+(c.atk||0)),node313('small',metadataText313(c)));
 button.onclick=toggle;tile.append(button);
 const more=node313('button','상세','selection-more');more.type='button';more.setAttribute('aria-label',c.name+' 상세');more.setAttribute('aria-expanded','false');let details;
 more.onclick=()=>{if(!details)details=detail313(c,tile);else details.hidden=!details.hidden;more.setAttribute('aria-expanded',String(!details.hidden));};tile.append(more);return tile;
}
function choiceSurface313(title,subtitle,targets,selected,toggle,preview,confirm){
 const host=tacticModal(title);host.classList.add('selection-surface');host.append(node313('p',subtitle));
 const grid=node313('div',undefined,'selection-grid');
 for(const target of targets)grid.append(cardTile313(target,selected.has(target.id),()=>{toggle(target.id);const fresh=[...host.querySelectorAll('[data-card-id]')].find(x=>x.dataset.cardId===target.id);fresh?.querySelector('.selection-toggle')?.focus({preventScroll:true});}));host.append(grid);
 const footer=node313('footer',undefined,'selection-footer');const summary=node313('p',preview.text,'selection-summary');summary.setAttribute('aria-live','polite');footer.append(summary);
 const ok=tacticButton(footer,'선택 확정',confirm);ok.disabled=!selected.size;ok.classList.add('selection-confirm');tacticButton(footer,'취소',handleModalClose);host.append(footer);
}
tacticRenderChoice=function(){
 const state=tacticChoice,c=hand.find(x=>x.id===state?.id);if(!c)return;
 const targets=tacticTargets(c);state.selected=new Set([...state.selected].filter(id=>targets.some(x=>x.id===id)));
 const selected=targets.filter(x=>state.selected.has(x.id));
 choiceSurface313(c.name,'선택·해제 후 확정하세요. 확정 전에는 카드·행동력을 소모하지 않습니다.',targets,state.selected,id=>{
  if(state.selected.has(id))state.selected.delete(id);else{if(c.tactic!=='cycle')state.selected.clear();state.selected.add(id);}tacticRenderChoice();
 },selectionPreview313(c,selected),()=>tacticConfirm([...state.selected]));
};
let removeSelected313=new Set();
removeChoice=function(){
 if(pendingChoiceType!=='remove')return;const source=hand.find(c=>c.id===pendingChoiceCardId);if(!source)return;
 const targets=deck.filter(c=>c.id!==source.id);removeSelected313=new Set([...removeSelected313].filter(id=>targets.some(c=>c.id===id)));
 const target=targets.find(c=>removeSelected313.has(c.id));
 choiceSurface313(source.name,'덱에서 1장을 영구 삭제합니다. 상세 확인은 선택과 별도입니다.',targets,removeSelected313,id=>{const was=removeSelected313.has(id);removeSelected313.clear();if(!was)removeSelected313.add(id);removeChoice();},{text:target?target.name+' 영구 삭제':'영구 삭제할 카드 1장을 선택하세요'},()=>{if(target)removeCard(target.id);});
};
(function(){
 const close=handleModalClose;handleModalClose=function(){removeSelected313.clear();$('modalContent')?.classList.remove('selection-surface');return close.apply(this,arguments);};
 const reset=start;start=function(){removeSelected313.clear();return reset.apply(this,arguments);};
 const modal=tacticModal;tacticModal=function(){const host=modal.apply(this,arguments);host?.classList.remove('selection-surface');return host;};
 // R10 evidence includes preparation context and per-turn budgets, without changing boss HP.
 const after=bossAfterBattle;bossAfterBattle=function(scene){
  if(round===10&&bossStageActive())bossEmit('r10_diagnostic',{turn:bossEncounter.turn,deck_size:deck.length,base_attack:baseAtk(),attack:scene.attackFinal,aoe:scene.aoe,pierce:scene.pierce,ap_remaining:apState.points,resource,gems,carried_enemies:bossEncounter.initialCarry,remaining:enemies.map(e=>({name:e.name,hp:e.hp,shield:e.shield||0,core:e.coreHp||0,debuffs:enemyDebuffs(e)})),trial:window.LuckTrials313?.flags||{pierce:false,luck:false}});
  return after.apply(this,arguments);
 };
 window.LuckSelection313={refund:cardRefund313,preview:selectionPreview313,resourcePreview:resourcePreview313,metadata:c=>({...CARD_META_313.get(cardKey(c)),actionPointCost:apCost(c)}),catalog:()=>[...CARD_META_313].map(([id,m])=>({id,...m}))};
})();
