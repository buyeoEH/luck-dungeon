/* Reconcile every attack addend with the authoritative combat forecast. */
updateAtkTooltip=function(){
 const el=$('atkTooltip');if(!el)return;
 const forecast=phase==='battle'?battlePreparationPlan():null,ap=forecast?.ap||attackParts(),combos=evalCombos();
 const handBonus=combos.reduce((n,c)=>n+(c.ok?c.bonus:0),0),linkBonus=ap.comboRaw-handBonus;
 const entries=[['기본 덱 공격력',deckAtk()],['영구 공격 보너스',bonusAtk],['카드/보석 임시 버프',tempAttack],['행동·전술 연계 공격',linkBonus]];
 for(const c of combos)entries.push([c.name+' ('+comboProgress(c)+')',c.ok?c.bonus:0]);
 entries.push(['연계 디버프',-ap.comboLoss],['정점 추가 공격',ap.p1.peakBonus],['게이지 공격 증가 ('+ap.p1.attackPct+'%)',ap.p1.percentBonus],['공격력 디버프',ap.rawFinal-ap.pre],['공격력 하한 보정',ap.final-ap.rawFinal]);
 const row=([label,value])=>'<div class="attack-detail-row"><span>'+label+'</span><b style="color:'+(value<0?'#f87171':'#e2e8f0')+'">'+(value>=0?'+':'')+value+'</b></div>';
 const formula=entries.map(x=>x[1]).reduce((n,x)=>n+x,0),guard=ap.guard;
 el.innerHTML='<b>⚔️ 공격력 상세 산출 내역</b><p class="attack-detail-context">'+(forecast?'전투 예상 · 광역 후 생존 적 기준':'현재 상태 기준 · 전투 준비 시 광역·전술 연계를 다시 반영')+'</p>'+entries.map(row).join('')+
 '<div class="attack-detail-total"><b>🎯 최종 예상 공격력</b><strong>'+ap.final+'</strong></div>'+
 '<p class="attack-detail-formula">'+entries.map(x=>x[1]).filter(x=>x!==0).map((x,i)=>(i&&x>0?'+ ':'')+x).join(' ')+' = '+formula+'</p>'+
 (guard?'<p>🛡 보호 전 '+guard.unprotected.final+' → 보호 후 '+ap.final+' · 화력 '+Math.max(0,ap.final-guard.unprotected.final)+' 보존<br>예상 보호 소모: 연계 '+guard.combo.absorbed+' / 공격 '+guard.attack.absorbed+'<br>예상 잔량: 연계 '+guard.balances.combo+' / 공격 '+guard.balances.attack+' / 전체 '+guard.balances.all+'</p>':'')+
 '<p>🔗 게이지 '+ap.p1.gaugeRaw+' → '+ap.p1.gaugeNet+'P · 변환 관통 +'+ap.p1.pierceBonus+'<br>💥 광역 '+(forecast?.aoe??totalAoe())+' / 🗡 관통 '+(forecast?.piercing??totalPierce())+'<br><small>게이지·광역·관통 수치는 위 공격력 합계에 직접 더하지 않습니다. 보호는 예상치이며 여기서 소모하지 않습니다.</small></p>';
 el.dataset.sum=String(formula);el.dataset.final=String(ap.final);
};
