from pathlib import Path
R=Path(__file__).resolve().parent

def patch(g):
 def change(a,b):
  nonlocal g
  assert g.count(a)==1,(a[:80],g.count(a))
  g=g.replace(a,b)
 change('const dmg = Math.min(e.hp, aoeTotal); aoeActual += dmg; e.hp = Math.max(0, e.hp - aoeTotal);', "const dealt=bossApplyDamage(e,aoeTotal,'aoe',0); const dmg=dealt.damage; aoeActual += dmg;")
 change('const dmg = Math.min(t.hp, remaining);\n      t.hp -= dmg;\n      remaining -= dmg;', "const dealt=bossApplyDamage(t,remaining,'strike',startPierce);\n      const dmg=dealt.damage;\n      remaining -= dealt.spent;")
 change('const dmg=Math.min(before,blow);t.hp-=dmg;', "const dmg=bossApplyDamage(t,blow,'strike',0).damage;")
 change('aoeHits.push({id:battleEnemyIndex.get(e)', 'aoeHits.push({...dealt,id:battleEnemyIndex.get(e)')
 change("battleEvents.push({type:targetIndex>0?'pierce':'strike',", "battleEvents.push({shieldDamage:dealt.shieldDamage,coreDamage:dealt.coreDamage,damageRate:dealt.rate,rawSpent:dealt.spent,type:targetIndex>0?'pierce':'strike',")
 change('const battleEnemyStart = enemies.map((e,i)=>({id:i,name:e.name,hp:e.hp,boss:!!e.boss}));', 'const battleEnemyStart = enemies.map((e,i)=>({id:i,name:e.name,hp:e.hp,boss:!!e.boss,shield:e.shield,core:e.coreHp}));')
 change('while (killedBossZones.has(activeDebuffZone)) {', 'while (killedBossZones.has(activeDebuffZone) && (!bossStageActive() || enemies.length===0)) {')
 change('  if (dangerActive) {\n    const stillDanger', "  if(bossAfterBattle(pendingBattleScene))return;\n\n  if (dangerActive) {\n    const stillDanger")
 # Fail-safe: R30 never clears with residual enemies, including bypassed routes.
 change('  if (round === 30 && !officialRecord) {', '  if (round === 30 && !officialRecord && enemies.length===0) {')
 change("  const reason = enemies.length > gameOverEnemyLimit(round)", "  const reason = bossFailureReason || (enemies.length > gameOverEnemyLimit(round)")
 change("    : '누적 적 HP가 ' + total() + '입니다. (한계 ' + gameOverHpLimit(round) + ')';", "    : '누적 적 HP가 ' + total() + '입니다. (한계 ' + gameOverHpLimit(round) + ')');")
 change("  const suggestion=countFail?","  const suggestion=bossFailureReason?'보호막과 진체력을 깎고 이전 적까지 3회 안에 처치해야 합니다. 상점 구매·승급과 관통·연계를 활용해 보세요.':countFail?")
 # Forecast and real combat share exactly the same shield/core arithmetic.
 change('e.aoeDamage=Math.min(e.hp,aoe);e.hp-=e.aoeDamage;', "e.aoeDamage=bossApplyDamage(e,aoe,'aoe',0).damage;")
 change("const e=enemies[0],damage=Math.min(e.hp,remaining);\n      e[index?'pierceDamage':'strikeDamage']+=damage;e.hp-=damage;remaining-=damage;", "const e=enemies[0],dealt=bossApplyDamage(e,remaining,'strike',piercing),damage=dealt.damage;\n      e[index?'pierceDamage':'strikeDamage']+=damage;remaining-=dealt.spent;")
 change('const e=enemies[0],damage=Math.min(e.hp,Math.max(1,Math.floor(ap.final*.55)));\n        e.hp-=damage;e.pureDamage+=damage;', "const e=enemies[0],damage=bossApplyDamage(e,Math.max(1,Math.floor(ap.final*.55)),'strike',0).damage;\n        e.pureDamage+=damage;")
 g+='\n'+(R/'boss-encounter.js').read_text()
 return g
