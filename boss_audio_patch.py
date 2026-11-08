"""Build-only audio integration: retain the existing game and audio controls."""
from pathlib import Path
import json
R=Path(__file__).resolve().parent
def patch(source):
 def change(a,b):
  nonlocal source
  assert source.count(a)==1,(a[:80],source.count(a))
  source=source.replace(a,b)
 manifest=json.loads((R/'assets/boss-audio/manifest.json').read_text())
 tracks=[{**t,'file':'boss-audio/'+Path(t['file']).name} for t in manifest['tracks']]
 change('class LuckAudio {','tracks.push(...'+json.dumps(tracks)+');\nclass LuckAudio {')
 change('  stop(){this.serial++;','  stopBgm(){this.serial++;')
 change('this.loading=null;this.stopSfx();}\n}', 'this.loading=null;}\n  stop(){this.stopBgm();this.stopSfx();}\n}')
 change("  if(cinematic||(typeof phase!==", "  const bossTrack=bossScene();if(bossTrack!==undefined)return bossTrack;\n  if(cinematic||(typeof phase!==")
 change('if(!id){sound.stop();return;}','if(!id){sound.stopBgm();return;}')
 change('function sync(){','function sync(){\n  bossSync();')
 change('function runStart(){run++;','function runStart(){bossReset();run++;')
 change('  if(!animated){\n    let delay=0;', '  if(!animated){\n    if(currentBoss())bossSkippedHits(b);\n    let delay=0;')
 change('function cinematicEnd(){cinematic=false;', 'function cinematicEnd(){cinematic=false;bossFinishResult();')
 change('function endRun(){if(ended)return;', "function endRun(){if(ended)return;const b=currentBoss();if(b&&!b.cleared&&b.turn>=3){pendingBossResult={round:b.round,turn:3,clear:false};bossFinishResult();return;}")
 change('global.LuckAudio=LuckAudio;', (R/'boss-audio.js').read_text()+'\nglobal.LuckAudio=LuckAudio;')
 change('setBgmEnabled,setSfxEnabled,unlock,runStart,sync,', 'bossImpact,bossResult,setBgmEnabled,setSfxEnabled,unlock,runStart,sync,')
 return source
