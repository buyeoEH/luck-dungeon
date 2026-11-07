from pathlib import Path
R=Path(__file__).resolve().parent

def patch(g):
 def change(a,b):
  nonlocal g
  assert g.count(a)==1,(a[:70],g.count(a))
  g=g.replace(a,b)
 change("const damage=Math.min(before,raw);e.hp-=damage;return {damage,spent:damage,shieldDamage:0,coreDamage:damage,kind};", "const rate=bossCarryRate(),damage=Math.min(before,Math.floor(raw*rate));e.hp-=damage;const spent=e.hp===0?Math.ceil(damage/rate):raw;return {damage,spent,shieldDamage:0,coreDamage:damage,kind,carryRate:rate};")
 change('stats.aoePotentialDamage += aoeTotal * enemies.length;', 'stats.aoePotentialDamage += enemies.reduce((n,e)=>n+aoeTotal*(e.boss?1:bossCarryRate()),0);')
 # Free sweep only follows a defeated normal enemy in a boss arena. It is not a prepared pierce point.
 change('let targetIndex = 0, pierceKillCount = 0;', 'let targetIndex = 0, pierceKillCount = 0, bossSweepTransfer=false;')
 change("type:targetIndex>0?'pierce':'strike',label:targetIndex>0?'관통 피해':'기본 공격',", "type:targetIndex>0?(bossSweepTransfer?'sweep':'pierce'):'strike',label:targetIndex>0?(bossSweepTransfer?'전장 돌파':'관통 피해'):'기본 공격',")
 change('if (remaining > 0 && pierceLeft > 0) {\n          pierceLeft--;', "if (remaining > 0 && (pierceLeft > 0 || bossStageActive()&&!t.boss)) {\n          bossSweepTransfer=bossStageActive()&&!t.boss;\n          if(!bossSweepTransfer)pierceLeft--;")
 change("if(e.hp===0){enemies.shift();if(remaining>0&&left>0){left--;index++;continue;}}", "if(e.hp===0){enemies.shift();if(remaining>0&&(left>0||bossStageActive()&&!e.boss)){if(!(bossStageActive()&&!e.boss))left--;index++;continue;}}")
 change("stats.pierceDamage += parts.slice(1).reduce((sum, part) => sum + Number((part.match(/ (\\d+)$/) || [0,0])[1]), 0);", "stats.pierceDamage += battleEvents.filter(e=>e.type==='pierce').reduce((n,e)=>n+e.damage,0);")
 change('if (targetIndex > 0) pierceKillCount++;', 'if (targetIndex > 0 && !bossSweepTransfer) pierceKillCount++;')
 change('boss:!!e.boss,shield:e.shield,core:e.coreHp}', 'boss:!!e.boss,shield:e.shield,core:e.coreHp,shieldMax:e.shieldMax,coreMax:e.coreMax}')
 change("<b>'+e.name+'</b><div class=\"cin-hp\">", "<b>'+e.name+'</b>'+bossCinematicVitals(e)+'<div class=\"cin-hp\">")
 g+='\n'+(R/'boss-presence.js').read_text()
 return g
