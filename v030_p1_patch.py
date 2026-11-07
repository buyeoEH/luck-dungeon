"""Narrow, fail-closed edits on the generated v0.3 game, never stable sources."""
from pathlib import Path
from v0219_patch import once
def patch(game):
    def change(old,new,label):
        nonlocal game
        game=once(game,old,new,'P1 '+label)
    game=Path(__file__).with_name('v030-p1.js').read_text()+'\n'+game
    change('const CARD_NAME = {};','p1Catalog();\nconst CARD_NAME = {};','catalog')
    change('  // Lock the selected character at the exact moment the game begins.','  p1ResetRun();\n  // Lock the selected character at the exact moment the game begins.','run reset')
    change('function drawStart() {','function drawStart() {\n  p1RoundStart();','round reset and pending guard')
    change('  const pre = baseAtk() + tempAttack + comboNet;','  const basePre = baseAtk() + tempAttack + comboNet;\n  const p1 = p1Parts(comboRaw,comboNet,pv,basePre);\n  const pre = p1.pre;','attack order')
    change('return { comboRaw, comboNet, comboLoss: comboRaw - comboNet, pre, final, rawFinal, attackFloor, atkLoss: pre - final, pv };','return { comboRaw, comboNet, comboLoss: comboRaw - comboNet, pre, final, rawFinal, attackFloor, atkLoss: pre - final, pv, basePre, p1 };','attack details')
    change("const totalPierce = () => pierce + handPassive('pierce');","const totalPierce = () => pierce + handPassive('pierce') + (P1_ENABLED ? attackParts().p1.pierceBonus : 0);",'preview pierce')
    change('function registerActionLink(c, changes){','function registerActionLink(c, changes){\n  p1Used(c,changes||[]);','successful use only')
    change("    if(k==='combo'||c.linkAmp||k==='linkhero'||k==='linkking'||k==='infinite'||k==='zenith') tags.add('link');","    if(c.type==='link'||k==='combo'||c.linkAmp||k==='linkhero'||k==='linkking'||k==='infinite'||k==='zenith') tags.add('link');",'link tags')
    change("  if(c.mixedTag) return c.mixedTag;","  if(c.type==='link') return 'link';\n  if(c.mixedTag) return c.mixedTag;",'link action tag')
    change("return '<div class=\"link-hud\"><strong>","return p1Hud()+'<div class=\"link-hud\"><strong>",'gauge UI')
    change('  let scoredAttack = 0, measuredAttackParts = null;','  let scoredAttack = 0, measuredAttackParts = null, p1BattleSnapshot = null;','frozen combat measurement')
    change('    scoredAttack=hit;measuredAttackParts=JSON.parse(JSON.stringify(ap));','    scoredAttack=hit;measuredAttackParts=JSON.parse(JSON.stringify(ap));\n    if(P1_ENABLED)p1BattleSnapshot=p1Capture(ap);','before debuff consumption')
    change('    const startPierce = totalPierce();','    const startPierce = p1BattleSnapshot ? p1BattleSnapshot.totalPierce : totalPierce();','actual pierce')
    change('single:singleLog, attackLoss:scoredParts.atkLoss||0, pierce:totalPierce(),','single:singleLog, attackLoss:scoredParts.atkLoss||0, pierce:p1BattleSnapshot ? p1BattleSnapshot.totalPierce : totalPierce(),','frozen scene pierce')
    change('  window.Luck030?.recordBattle(pendingBattleScene);','  p1BattleDone(pendingBattleScene,p1BattleSnapshot);\n  window.Luck030?.recordBattle(pendingBattleScene);','metrics and next round bonuses')
    change("  if(c.type==='promotionStone') return '승급 재료';","  if(c.type==='link') return '연계 게이지';\n  if(c.type==='promotionStone') return '승급 재료';",'card category')
    change("let val = a ? '+'", "let val = c.type==='link' ? (c.p1Gauge ? '🔗 +'+c.p1Gauge : '🔗 30%') : a ? '+'",'hand value')
    return game
