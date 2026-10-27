"""Deterministic additive stabilization build. The v0.2.18/19 runtimes stay byte-identical."""
import base64,hashlib,json,mimetypes,re,shutil
from pathlib import Path
from v0219_patch import once
R=Path(__file__).resolve().parent
S=R/'_site'; P=S/'preview/v0.2.20'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def build():
 before={str(p.relative_to(S)):sha(p) for p in S.rglob('*') if p.is_file() and not str(p.relative_to(S)).startswith(('preview/v0.2.20/','downloads/'))}
 source=R/'_site/preview/v0.2.19'
 if P.exists():shutil.rmtree(P)
 shutil.copytree(source,P)
 inputs=['build_v0220.py','v0220-core.js','v0220-cloud.js','v0220-history.js','v0220-ui.css']
 build_id='0220-'+hashlib.sha256(''.join(sha(R/f) for f in inputs).encode()).hexdigest()[:16]
 meta={'version':'0.2.20','build_id':build_id,'base_commit':'567a22bb3d2da107e7553232a2096afd96ecd6f5','score_ruleset_version':'v2-actual-strike-0220'}
 game=(source/'game.js').read_text()
 # Round preparation is required information, independent of card-effect popups.
 game=once(game,"  addEnemy();\n  \n  if (isVisualMode()) {\n    showRoundStartModal();", "  addEnemy();\n  \n  if (isVisualMode() || !window.__luckAutoLabBotActive) {\n    showRoundStartModal();",'always show round one briefing for players')
 game=once(game,"  window.LuckGameAudio?.sync();\n  if (isVisualMode()) {\n    showRoundStartModal();", "  window.LuckGameAudio?.sync();\n  if (isVisualMode() || !window.__luckAutoLabBotActive) {\n    showRoundStartModal();",'always show next round briefing for players')
 game=once(game,'function showRoundStartModal() {','let pendingRoundBriefing=false;\nfunction showRoundStartModal() {\n  pendingRoundBriefing=true;','round briefing guard')
 game=once(game,"  if ($('close')) $('close').onclick = handleModalClose;\n  if ($('modal')) $('modal').classList.remove('hide');\n}\n\nfunction handleModalClose()", "  if ($('close')) $('close').onclick = confirmRoundStart;\n  if ($('modal')) $('modal').classList.remove('hide');\n}\n\nfunction handleModalClose()",'briefing close proceeds safely')
 game=once(game,'function confirmRoundStart() {','function confirmRoundStart() {\n  if(!pendingRoundBriefing)return;\n  pendingRoundBriefing=false;','prevent duplicate briefing draw')
 # Surviving enemies precede new spawns in the required preparation briefing.
 game=once(game,"        freshHtml + oldHtml +", "        oldHtml + '<h4 style=\"margin:0;color:#f87171\">🆕 이번 라운드 신규 적 ('+fresh.length+'마리)</h4>' + freshHtml +",'accumulated enemies first')
 game=once(game,"🎯 먼저 처치해야 할 이전 적 (' + old.length + '마리)","🎯 현재 누적 적 (' + old.length + '마리 · HP ' + old.reduce((n,e)=>n+e.hp,0) + ')",'accumulated enemy total HP')
 game=once(game,"    : '';\n\n  const ap = attackParts();", "    : '<div style=\"background:#1e293b;padding:10px;border-radius:6px\"><b>🎯 현재 누적 적 0마리 · HP 0</b><p>이전 라운드에서 남은 적이 없습니다.</p></div>';\n\n  const ap = attackParts();",'explicit empty accumulated enemies')
 # Mixed-luck effects collect strings; triggerLink appends {text,color} objects.
 # Normalize only this presentation list after the real effect/link resolution.
 game=once(game,"    registerActionLink(c,changes);\n    log('🎲 '","    registerActionLink(c,changes);\n    changes.splice(0,changes.length,...changes.map(x=>typeof x==='string'?x:x.text));\n    log('🎲 '",'mixed luck readable link results')
 game=once(game,'    comboNames:battleComboNames, linkNames:battleLinkNames, aoe:aoeTotal,','    linkBonus:linkComboAttack, linkTriggers:scoredLinkTriggers,\n    comboNames:battleComboNames, linkNames:battleLinkNames, aoe:aoeTotal,','link score measurement before reset')
 game=once(game,"const SCORE_RULE_VERSION='v1'", "const SCORE_RULE_VERSION='v2-actual-strike-0220'",'score ruleset')
 game=once(game,'  hand.splice(i, 1);','  hand.splice(i, 1);\n  if(c.type===\'oneuse\'){deck=deck.filter(x=>x.id!==c.id);draw=draw.filter(x=>x.id!==c.id);graveyard=graveyard.filter(x=>x.id!==c.id);}', 'consume all piles before effects')
 game=once(game,'  const scoredAttack = attackValue();','  let scoredAttack = 0, measuredAttackParts = null;\n  const previewAttackParts=attackParts();','strike measurement')
 game=once(game,'    const hit = ap.final;','    const hit = ap.final;\n    scoredAttack=hit;measuredAttackParts=JSON.parse(JSON.stringify(ap));','actual strike')
 game=once(game,'  const scoredParts = attackParts();','  const scoredParts = measuredAttackParts || {pre:0,final:0,atkLoss:0,comboRaw:0,comboNet:0,comboLoss:0};','freeze measured parts')
 game=once(game,'    events:battleEvents','    previewAttackParts,measuredAttackParts,events:battleEvents','battle audit')
 game=game.replace("'Luck Dungeon v0.2.18 DEV LOG'","'Luck Dungeon '+window.LUCK_BUILD.version+' DEV LOG · '+window.LUCK_BUILD.build_id")
 game=once(game,"window.__luckManualRunId = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);",'window.__luckManualRunId = window.Luck220.runId();','one run id')
 game=once(game,"  if(purge){ purgeCard(id); }","  if(purge){ const before=stats.cardsRemoved;purgeCard(id);if(c.type==='promotionStone')stats.cardsRemoved=before; }",'stone consumption is not generic removal')
 # Make the official object and score component list immutable at R30.
 game=once(game,'  officialRecord={round:30,score,playMs,recordedAt:new Date().toISOString()};','  officialRecord=Object.freeze({round:30,score,playMs,recordedAt:new Date().toISOString(),score_breakdown:Object.freeze(scoreBreakdown().map(x=>Object.freeze([...x]))),score_ruleset_version:SCORE_RULE_VERSION});','official immutable snapshot')
 game=once(game,"  if($('modalContent')) $('modalContent').innerHTML='<div class=\"official-complete\">", "  if($('modalContent')) $('modalContent').innerHTML=scoreBreakdownHtml()+'<div class=\"official-complete\">",'official score detail')
 game=once(game,'  window.LuckGameAudio?.battlePrepared(pendingBattleScene,scoredAttack>previousAudioMax,shouldPlayBattleMotion());','  window.Luck220?.recordBattle(pendingBattleScene);\n  window.LuckGameAudio?.battlePrepared(pendingBattleScene,scoredAttack>previousAudioMax,shouldPlayBattleMotion());','record battle before round transition')
 # Existing UI paths close over globals. The core records them without changing effects.
 (P/'game.js').write_text(game)
 for f,target in [('v0220-core.js','v0220-core.js'),('v0220-cloud.js','cloud/cloud.js'),('v0220-history.js','history.js'),('v0220-ui.css','v0220-ui.css')]:shutil.copyfile(R/f,P/target)
 shutil.copyfile(R/'cloud/config.js',P/'cloud/config.js')
 (P/'preview-ui.js').write_text((source/'preview-ui.js').read_text().replace('0.2.19','0.2.20').replace('통합 웹 테스트 · 기록은 브라우저에 저장','안정화 검증판 · 기록 자동 저장·온라인 동기화'))
 (P/'rankings.js').write_text((R/'rankings.js').read_text().replace('0.2.18','0.2.20'))
 index=(source/'index.html').read_text().replace('0.2.19','0.2.20').replace('0219-preview-2',build_id)
 index=index.replace("connect-src 'none'","connect-src 'self' https://xkmfjutncwblfebgdmar.supabase.co")
 index=index.replace('🧪 v0.2.20 테스트판 · 기록은 이 기기에만 저장 · 정식 랭킹에 반영되지 않습니다','🧪 v0.2.20 안정화 검증판 · 개인 기록 자동 저장·재연결 동기화 · 이니셜 등록 시에만 순위 공개')
 index=index.replace('기록은 브라우저에 저장','기록 자동 저장·온라인 동기화')
 index=index.replace('라운드 시작과 카드 효과를 팝업으로 표시','카드 효과를 팝업으로 표시 · 라운드 적 정보는 항상 표시')
 index=index.replace('</head>','<link rel="stylesheet" href="v0220-ui.css"><script>window.LUCK_BUILD='+json.dumps(meta)+';</script></head>')
 index=index.replace('</body>','<script src="v0220-core.js?v='+build_id+'"></script></body>')
 index=index.replace('📊 테스트 기록','☁️ 온라인 기록').replace('🏆 테스트 랭킹','🏆 온라인 랭킹')
 (P/'index.html').write_text(index)
 (P/'build.json').write_text(json.dumps(meta,indent=2))
 assert all(sha(S/n)==v for n,v in before.items()),'Previous build changed'
 report={'build':meta,'preserved_files':len(before),'runtime_files':{str(p.relative_to(P)):sha(p) for p in P.rglob('*') if p.is_file()}}
 (R/'v0220-build-report.json').write_text(json.dumps(report,indent=2))
 print('v0.2.20',build_id,'preserved',len(before),'prior files')
 return meta
if __name__=='__main__':build()
