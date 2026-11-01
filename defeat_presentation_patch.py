"""Route losing combat through the existing cinematic, without rule changes."""
from v0219_patch import once
def patch(game):
 game=once(game,'function start() {','function start() {\n  pendingBattleScene=null;','cancel stale combat presentation on new run')
 game=once(game,"  if (phase !== 'battle') return;","  if (phase !== 'battle' || pendingBattleScene?.continuation) return;",'prevent replaying resolved combat')
 game=once(game,'if (stillDanger) { gameOver(); return; }',"if (stillDanger) { if(shouldPlayBattleMotion())showBattleCinematic('gameOver');else gameOver(); return; }",'losing battle presentation before defeat')
 game=once(game,"  const b=pendingBattleScene; if(b)window.LuckGameAudio?.cinematicStart(); if(!b){ if(cont==='bossReward') bossReward(); else nextRound(); return; }", "  const b=pendingBattleScene; if(!b)return; b.continuation=cont; window.LuckGameAudio?.cinematicStart();",'bind continuation to resolved battle')
 game=once(game,'function finishBattleCinematic(cont){ window.LuckGameAudio?.cinematicEnd();',"function finishBattleCinematic(cont){ const next=pendingBattleScene?.continuation;if(!next)return;cont=next;window.LuckGameAudio?.cinematicEnd();",'finish resolved battle once')
 game=once(game,"if(cont==='officialBoss') freezeOfficialRecord('bossReward');", "if(cont==='gameOver'){gameOver();render();} else if(cont==='officialBoss') freezeOfficialRecord('bossReward');",'show defeat after combat results')
 return game
