/* Boss identity and shield/core feedback. */
let bossCinemaState=new Map();
function bossCinematicVitals(e){if(!e.boss||e.shield===undefined)return '';
 return '<div class="cin-boss-vitals">'+(e.shieldMax?'<label>🛡 보호막 <b class="cin-shield-num">'+e.shield+'</b> / '+e.shieldMax+'</label><div class="cin-shield-track"><i style="width:'+e.shield/e.shieldMax*100+'%"></i></div>':'<label>🛡 보호막 없음</label>')+'<label>❤️ 진체력 <b class="cin-core-num">'+e.core+'</b> / '+e.coreMax+'</label><div class="cin-core-track"><i style="width:'+e.core/e.coreMax*100+'%"></i></div><strong class="cin-boss-impact" aria-live="polite"></strong></div>';
}
(function(){
 const originalShow=showRoundStartModal;showRoundStartModal=function(){const r=originalShow.apply(this,arguments);if(bossStageActive()&&bossEncounter.turn===1){
 const e=enemies.find(e=>e.boss);if(!e)return r;
 $('modalTitle').textContent='👑 보스 출현 · ROUND '+round;
 $('modalContent').innerHTML='<div class="boss-entry"><div class="boss-entry-warning">BOSS ENCOUNTER</div><div class="boss-entry-portrait">'+luckEnemyIcon(e,'battle')+'</div><h2>'+e.name+'</h2><p class="boss-entry-limit">최대 3번의 전투 안에 모두 격파</p>'+bossCinematicVitals({...e,core:e.coreHp})+(round===5?'<p>첫 보스 · 보호막 없음 / 진체력 36 / 연계 디버프 6</p>':'')+'<p>인계된 일반 적 '+bossEncounter.initialCarry+'마리 · 누적 HP 그대로 유지</p><p class="boss-arena-rule">일반 적 피해 100% · 관통이 있으면 처치 후 남은 피해가 다음 적·보스에게 전달<br>보호막 초과 피해는 진체력으로 연결 · 관통 1당 일반 공격의 10% 진체력 직격</p><button class="primary-btn" onclick="confirmRoundStart()">⚔ 보스전 준비하기</button></div>';
 document.body.classList.add('boss-arena');window.LuckGameAudio?.sync();
 }return r;};
 const panel=renderBossPanel;renderBossPanel=function(){const r=panel.apply(this,arguments);const on=!!bossEncounter&&bossEncounter.round===round;document.body.classList.toggle('boss-arena',on);
 const roundEl=$('round'),parent=roundEl?.parentElement;if(parent){let strip=$('bossStickyVitals');if(!strip){strip=document.createElement('span');strip.id='bossStickyVitals';parent.append(strip);}strip.classList.toggle('hide',!on);if(on){const e=enemies.find(x=>x.boss),s=bossEncounter.spec;const sh=e?.shield||0,core=e?.coreHp||0;strip.innerHTML=(s.shield?'<span title="보호막 '+sh+' / '+s.shield+'">🛡 '+sh+'<i><em style="width:'+sh/s.shield*100+'%"></em></i></span>':'<span>🛡 없음</span>')+'<span title="진체력 '+core+' / '+s.core+'">❤️ '+core+'<i><em style="width:'+core/s.core*100+'%"></em></i></span>';}}
 return r;};
 const showCin=showBattleCinematic;showBattleCinematic=function(cont){const b=pendingBattleScene;bossCinemaState=new Map((b?.enemyStart||[]).filter(e=>e.boss&&e.shield!==undefined).map(e=>[e.id,{shield:e.shield,core:e.core,maxShield:e.shieldMax,maxCore:e.coreMax}]));const r=showCin.apply(this,arguments);if(b?.bossEncounter||bossStageActive())$('modalContent')?.querySelector('.combat-cinematic')?.classList.add('boss-cinematic');return r;};
 const oldHit=cinHit;cinHit=async function(hit,kind,delay){const st=bossCinemaState.get(hit.id);if(!st)return oldHit.apply(this,arguments);const el=cinFoe(hit.id);if(!el)return;
 const shieldLoss=Math.min(st.shield,hit.shieldDamage??hit.damage),coreLoss=Math.min(st.core,hit.coreDamage??Math.max(0,hit.damage-shieldLoss)),broken=st.shield>0&&shieldLoss===st.shield;
 window.LuckGameAudio?.bossImpact({...hit,shieldDamage:shieldLoss,coreDamage:coreLoss},kind,broken);
 const playback=oldHit.apply(this,arguments);const impact=el.querySelector('.cin-boss-impact');
 if(shieldLoss){st.shield-=shieldLoss;el.querySelector('.cin-shield-num').textContent=st.shield;el.querySelector('.cin-shield-track i').style.width=st.shield/st.maxShield*100+'%';el.classList.add('boss-shield-hit');if(impact)impact.textContent='🛡 보호막 −'+shieldLoss;}
 if(broken){el.classList.add('boss-shattered');cinBanner('🛡 보호막 파괴! 진체력 노출','shield-break');cinFeed(hit.name+' · 보호막 파괴');if(impact)impact.textContent='SHIELD BREAK';if(!(hit.corePierceDamage>0))await cinWait(240);}
 if(coreLoss){st.core-=coreLoss;el.querySelector('.cin-core-num').textContent=st.core;el.querySelector('.cin-core-track i').style.width=st.core/st.maxCore*100+'%';el.classList.add('boss-core-hit');cinFeed(hit.name+' · 진체력 −'+coreLoss);if(impact)impact.textContent='❤️ 진체력 −'+coreLoss;}
 if(hit.corePierceDamage>0){if(impact)impact.textContent='🛡 −'+shieldLoss+' · ❤️ −'+coreLoss+' (관통 직격 '+hit.corePierceDamage+')';cinFeed(hit.name+' · 관통 진체력 직격 −'+hit.corePierceDamage);}
 await playback;if(hit.killed){el.classList.add('boss-defeated');cinBanner('👑 보스 격파!','boss-victory');}
 };
})();
