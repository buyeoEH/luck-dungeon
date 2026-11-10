from pathlib import Path
R=Path(__file__).resolve().parent
def patch(g):
 g=g.replace("combo:guardOutcome(plan.combo,'combo',plan.comboRaw,", "combo:guardOutcome(plan.combo,'combo',plan.parts.comboRaw,")
 g=g.replace("gauge:{without:u.p1.gaugeNet,", "gauge:{raw:p.p1.gaugeRaw,without:u.p1.gaugeNet,")
 marker=' guardStats.ineffective+=[plan.combo,plan.attack]'
 assert g.count(marker)==1
 g=g.replace(marker," guardLastCombat.attack.active=plan.attack.entries.length>0;guardLastCombat.combo.active=plan.combo.entries.length>0;\n"+marker)
 # The real damage order remains untouched. Only presentation is sequenced:
 # AoE, surviving-enemy debuffs/protection, strikes, surviving-hunter theft.
 old="  if(b.attackLoss>0){ cinBanner('💢 적 디버프 · 공격 '+b.attackPre+' → '+b.attackFinal,'debuff'); cinFeed('공격력 -'+b.attackLoss+' 적용'); await cinWait(650); }"
 assert g.count(old)==1
 g=g.replace(old,'  let guardPlayed=false;')
 old="    } else {\n      const kind=ev.type==='pierce'?'pierce':'strike';"
 assert g.count(old)==1
 g=g.replace(old,"    } else {\n      if(!guardPlayed){await guardPlayCombatEffects(b);guardPlayed=true;if(pendingBattleScene!==token)return;}\n      const kind=ev.type==='pierce'?'pierce':'strike';")
 old="  cinBanner('☠ '+b.killed.length+'킬"
 assert g.count(old)==1
 g=g.replace(old,"  await guardPlayTheftEffects(b);if(pendingBattleScene!==token)return;\n"+old)
 g=g.replace('guardAnnounce();return r;','return r;')
 g=g.replace('plan.comboRaw','plan.parts.comboRaw')
 return g+'\n'+(R/'guard-feedback-v040.js').read_text()
