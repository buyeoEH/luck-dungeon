"""Additive v0.3 P1 development build; v0.2.20 remains byte-identical."""
import hashlib,json,shutil,subprocess
from pathlib import Path
from v0219_patch import once,offline_cloud
from v030_p1_patch import patch as p1_patch
R=Path(__file__).resolve().parent;S=R/'_site';P=S/'preview/v0.3.0'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def build():
 before={str(p.relative_to(S)):sha(p) for p in S.rglob('*') if p.is_file() and not str(p.relative_to(S)).startswith('preview/v0.3.0/')}
 source=S/'preview/v0.2.20'
 if P.exists():shutil.rmtree(P)
 shutil.copytree(source,P)
 commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=R,text=True).strip()
 build_id='030-p5-'+hashlib.sha256((sha(R/'build_v030.py')+sha(R/'v030-telemetry.js')+sha(R/'v030-p1.js')+sha(R/'v030_p1_patch.py')+sha(source/'game.js')).encode()).hexdigest()[:16]
 source_paths=['build_v030.py','v030-telemetry.js','v030-reference-ai.js','verify_v030.py','run_v030_stage0.py','test_v030.py','v030-p1.js','v030_p1_patch.py','test_v030_p1.py','verify_v030_p1.py','build_v030_standalone.py','write_v030_p1_report.py']
 source_manifest={f:sha(R/f) for f in source_paths}
 source_dirty=bool(subprocess.check_output(['git','status','--porcelain','--',*source_paths],cwd=R,text=True).strip())
 meta={'version':'0.3.0-dev.2','stage':'p5_stone_description','build_id':build_id,'git_sha':commit,'baseline_git_sha':'110d54876a121909b9bd6074cf682b6d99944083','baseline_build_id':json.loads((source/'build.json').read_text())['build_id'],'score_ruleset_version':'v2-actual-strike-0220','persistent_draw':True,'gameplay_changes':['draw_always_on','p1_link_conversion','p1_cards','p1_next_round_bonuses'],'comparison_contract':'P1 disabled regression; core, cards, extras isolated ON cohorts','cloud_mode':'isolated_local','source_tree_dirty':source_dirty,'source_manifest_sha256':hashlib.sha256(json.dumps(source_manifest,sort_keys=True).encode()).hexdigest(),'source_files':source_manifest}
 game=(source/'game.js').read_text()
 game=once(game,'let persistentDraw = PERSISTENT_DRAW;','const persistentDraw = true;','fixed ON draw policy')
 game=once(game,'      persistentDraw = pToggle.checked;','      // v0.3: draw policy is permanently ON.','no in-game draw toggle')
 game=once(game,"      if(to==='persistToggle')persistentDraw=welcome.checked;","      // v0.3: no selectable draw mode.",'no startup draw toggle')
 game=once(game,"    persistentDraw=$('persistToggle').checked;","    // v0.3: persistentDraw is the constant true.",'fixed startup draw policy')
 game=once(game,'  window.Luck220?.recordBattle(pendingBattleScene);','  window.Luck030?.recordBattle(pendingBattleScene);\n  window.Luck220?.recordBattle(pendingBattleScene);','v030 observation before round transition')
 game=p1_patch(game)
 game=once(game,'만능승급석 1장을 덱에 추가합니다. 손패에서 사용하면 단검/검/강타 중 하나를 선택해 승급 재료로 바꿉니다. 잘못 선택해도 되돌릴 수 없습니다.','만능승급석 1장을 덱에 추가합니다. 손패에서 1차 승급을 선택하고, 부족한 비전설 랜덤 상점 재료 중 1종의 카드 1장을 보충합니다. 후보가 없으면 돌을 소모하지 않고 취소합니다. 승급 비용은 별도로 필요합니다.','P5 stone reward description')
 (P/'game.js').write_text(game)
 core=(source/'v0220-core.js').read_text().replace("DBNAME='luck-v0220'","DBNAME='luck-v030-p1'").replace('id,!!$(id)?.checked','id,id===\'persistToggle\'?true:!!$(id)?.checked')
 (P/'v0220-core.js').write_text(core)
 (P/'rankings.js').write_text((source/'rankings.js').read_text().replace('0.2.20','0.3.0-dev.2 개발판').replace('온라인','기기 테스트'))
 (P/'history.js').write_text((source/'history.js').read_text().replace('v0.2.20','v0.3.0 개발판'))
 (P/'cloud/config.js').write_text('window.LUCK_CLOUD_CONFIG={};\n')
 (P/'cloud/cloud.js').write_text(offline_cloud().replace('0.2.19','0.3.0-dev.2 개발판').replace('로컬 테스트','v0.3 계측 테스트'))
 shutil.copyfile(R/'v030-telemetry.js',P/'v030-telemetry.js')
 index=(source/'index.html').read_text()
 import re
 index=re.sub(r'window.LUCK_BUILD=\{[^<]+?\};',lambda _: 'window.LUCK_BUILD='+json.dumps(meta)+';',index,count=1)
 index=index.replace('0.2.20','0.3.0-dev.2 개발판').replace('안정화 검증판','P5 보상 개발판')
 index=index.replace('개인 기록 자동 저장·재연결 동기화 · 이니셜 등록 시에만 순위 공개','이 기기에만 테스트 기록 저장 · 정식 기록과 분리')
 index=index.replace('기록 자동 저장·온라인 동기화','기기 테스트 기록 · 온라인 업로드 없음')
 index=index.replace("connect-src 'self' https://xkmfjutncwblfebgdmar.supabase.co","connect-src 'none'")
 index=index.replace('☁️ 온라인 기록','📊 테스트 기록').replace('🏆 온라인 랭킹','🏆 테스트 랭킹')
 for id in ['welcomePersistToggle','persistToggle']:
  pattern=r'<label\b[^>]*>\s*<input\b[^>]*\bid="'+id+r'"[^>]*>.*?</label>'
  index,n=re.subn(pattern,'<div role="status">♻️ 이어가기 드로우 · 항상 ON</div>',index,flags=re.S)
  assert n==1,(id,n)
 index=re.sub(r'\?v=[^"<>]+(?=")','?v='+build_id,index)
 index=index.replace('</head>','<style>.p1-gauge{padding:9px;margin:6px 0;border:1px solid #34d399;border-radius:8px;background:#102d2a;color:#d1fae5;line-height:1.5;font-size:12px;overflow-wrap:anywhere}.p1-gauge small{color:#a7f3d0}</style></head>')
 index=index.replace('</body>','<script src="v030-telemetry.js?v='+build_id+'"></script></body>')
 (P/'index.html').write_text(index);(P/'build.json').write_text(json.dumps(meta,indent=2))
 assert all(sha(S/f)==v for f,v in before.items()),'Previous runtime changed'
 report={'meta':meta,'preserved_files':len(before),'files':{str(p.relative_to(P)):sha(p) for p in P.rglob('*') if p.is_file()}}
 (R/'v030-build-report.json').write_text(json.dumps(report,indent=2))
 print(json.dumps({'build_id':build_id,'preserved_files':len(before)}));return meta
if __name__=='__main__':build()
