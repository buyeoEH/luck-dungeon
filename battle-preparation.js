/* Presentation-only forecast: no RNG, card use, protection spending or events. */
function battlePreparationPlan(){
  const originalEnemies=enemies, originalLink=linkComboAttack;
  const rows=enemies.map((e,id)=>({...e,id,before:e.hp,aoeDamage:0,strikeDamage:0,pierceDamage:0,pureDamage:0}));
  const links=[];
  try{
    const tags=tacticalTags();
    for(const l of TACTICAL_LINKS){
      const pending=!roundLinkDone['t_'+l.id]&&l.need.every(t=>tags.has(t));
      if(roundLinkDone['t_'+l.id]||pending)links.push({name:l.name,bonus:l.bonus+deckLinkAmp(),pending});
      if(pending)linkComboAttack+=l.bonus+deckLinkAmp();
    }
    for(const l of ACTION_LINKS)if(roundLinkDone['a_'+l.id])links.push({name:l.name,bonus:l.bonus+deckLinkAmp(),pending:false});
    const beforeAoe=attackParts(),aoe=totalAoe();
    for(const e of rows){e.aoeDamage=Math.min(e.hp,aoe);e.hp-=e.aoeDamage;}
    enemies=rows.filter(e=>e.hp>0);
    const ap=attackParts(),piercing=totalPierce(),combos=evalCombos().filter(c=>c.ok);
    let remaining=ap.final,left=piercing,index=0;
    while(remaining>0&&enemies.length){
      const e=enemies[0],damage=Math.min(e.hp,remaining);
      e[index?'pierceDamage':'strikeDamage']+=damage;e.hp-=damage;remaining-=damage;
      if(e.hp===0){enemies.shift();if(remaining>0&&left>0){left--;index++;continue;}}
      break;
    }
    const pure=piercing===0&&aoe===0&&ap.final>=55&&deckAtk()>=35;
    if(pure){
      const count=ap.final>=210?4:ap.final>=145?3:ap.final>=95?2:1;
      for(let k=0;k<count&&enemies.length;k++){
        const e=enemies[0],damage=Math.min(e.hp,Math.max(1,Math.floor(ap.final*.55)));
        e.hp-=damage;e.pureDamage+=damage;if(!e.hp)enemies.shift();
      }
    }
    return {rows,links,combos,ap,beforeAoe,aoe,piercing,pure,hasStrike:rows.some(e=>e.before>e.aoeDamage),
      deckAttack:deckAtk(),permanent:bonusAtk,temporary:tempAttack,
      damage:rows.reduce((n,e)=>n+e.before-e.hp,0),kills:rows.filter(e=>!e.hp).length};
  }finally{enemies=originalEnemies;linkComboAttack=originalLink;}
}
function renderBattlePreparation(){
  const el=$('battleStage');if(!el)return;
  if(phase!=='battle'){el.classList.add('hide');return;}
  const p=battlePreparationPlan(),a=p.ap,m=a.p1;
  window.LuckGameAudio?.sync();
  window.LuckGameAudio?.previewAttack(p.hasStrike?a.final:0,stats.maxEffectiveAttack);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const names=p.links.map(l=>esc(l.name)+' +'+l.bonus+(l.pending?' (전투 시작 시)':''))
    .concat(p.combos.map(c=>esc(c.name)+' 콤보 +'+c.bonus));
  const foes=p.rows.map(e=>{
    const bars=[['aoe',e.aoeDamage],['strike',e.strikeDamage],['pierce',e.pierceDamage],['pure',e.pureDamage],['remaining',e.hp]];
    return '<article class="prep-enemy '+(!e.hp?'prep-ko':'')+'"><div class="prep-enemy-title">'+luckEnemyIcon(e,'battle')+'<b>'+esc(e.name)+'</b><strong>HP '+e.before+' → '+e.hp+'</strong></div>'+
      '<div class="prep-hp" aria-label="'+esc(e.name)+' 예상 남은 HP '+e.hp+' / '+e.before+'">'+bars.filter(x=>x[1]>0).map(([kind,n])=>'<i class="prep-'+kind+'" style="width:'+n/e.before*100+'%"></i>').join('')+'</div>'+
      '<p>💥 광역 '+e.aoeDamage+' · ⚔ 기본 '+e.strikeDamage+' · 🗡 관통 '+e.pierceDamage+' · ⚔ 연속타 '+e.pureDamage+'</p><small>'+(!e.hp?'예상 처치':'예상 생존 · HP '+e.hp)+'</small></article>';
  }).join('');
  el.classList.remove('hide');
  el.innerHTML='<h3>⚔️ 전투 준비 · ROUND '+round+'</h3><p>현재 덱과 사용한 손패 기준 예상입니다. 보석을 사용하면 다시 계산합니다.</p>'+
    '<div class="prep-summary"><strong>최종 공격력 '+(p.hasStrike?a.final:0)+'</strong><strong>예상 실제 피해 '+p.damage+'</strong><strong>예상 처치 '+p.kills+' / '+p.rows.length+'</strong></div>'+
    '<div class="prep-breakdown"><b>① 공격력 산출'+(!p.hasStrike?' (광역으로 전멸 · 단일 공격 없음)':'')+'</b><p>덱 공격 '+p.deckAttack+' + 영구 보너스 '+p.permanent+' + 임시 공격 '+p.temporary+'</p>'+
    '<p>콤보·연계 '+a.comboRaw+' → '+a.comboNet+' (디버프 −'+a.comboLoss+')</p>'+
    '<p>🔗 '+(names.join(' · ')||'발동한 연계·콤보 없음')+'</p>'+
    '<p>연계 게이지 '+m.gaugeRaw+' → '+m.gaugeNet+' · 변환 관통 +'+m.pierceBonus+' · 공격 +'+m.attackPct+'% (+'+m.percentBonus+') · 정점 +'+m.peakBonus+'</p>'+
    '<p>디버프 전 '+a.pre+' → 최종 '+a.final+' (공격 디버프 −'+a.atkLoss+') · 관통 '+p.piercing+'회</p></div>'+
    '<div class="prep-breakdown"><b>② 피해 적용 순서</b><p>광역 '+p.aoe+'/적 → 생존 적 기준 디버프 재계산 → 기본 공격 → 관통'+(p.pure?' → 순수 연속타':'')+'</p><small>광역으로 처치된 적의 디버프는 이후 공격에 적용되지 않습니다. 피해는 적의 남은 HP까지만 계산합니다.</small></div>'+
    '<div class="prep-enemies">'+(foes||'<p>공격할 적이 없습니다.</p>')+'</div>'+
    '<p class="prep-ready">준비를 확인했으면 아래 「전투 시작」을 누르세요. 아직 피해는 적용되지 않았습니다.</p>';
}
