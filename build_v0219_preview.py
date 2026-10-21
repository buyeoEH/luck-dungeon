"""Build a separate web playtest while preserving every v0.2.18 runtime byte."""
import hashlib,json,re,shutil,zipfile
from pathlib import Path
import v0219_patch as patch

ROOT=Path(__file__).resolve().parent
SITE=ROOT/'_site'
PREVIEW=SITE/'preview'/'v0.2.19'
BUILD='0219-preview-2'
ICON_IDS={'raiderking','wisdomsword','stararmor','masterlink','lucklink','luckdraw','luckguard','luckforge'}

def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def build():
 if not (SITE/'index.html').is_file():raise SystemExit('Run prepare_site.py first')
 originals={str(p.relative_to(SITE)):digest(p) for p in SITE.rglob('*') if p.is_file() and 'preview' not in p.relative_to(SITE).parts}
 PREVIEW.mkdir(parents=True,exist_ok=True)
 for name in ['index.html','game.js','avatars.js','history.js','rankings.js','luck-audio.js','autolab.js']:
  shutil.copyfile(SITE/name,PREVIEW/name)
 shutil.copytree(SITE/'assets',PREVIEW/'assets',dirs_exist_ok=True)
 (PREVIEW/'cloud').mkdir(exist_ok=True)
 game=patch.patch_game((ROOT/'game.js').read_text())
 # Read only reviewed card artwork from the bundle; never extract arbitrary paths.
 assert digest(ROOT/'assets-v0219-icons.zip')=='85e47ca66b9bdf2410c86e942323e4434e7751fd737ad4117ba7431e0045291c','Icon archive checksum mismatch'
 with zipfile.ZipFile(ROOT/'assets-v0219-icons.zip') as icons:
  entries=json.loads(icons.read('manifest.json'))
  assert len(entries)==8 and {e['id'] for e in entries}==ICON_IDS,'Unexpected icon mapping'
  icon_map={}
  for entry in entries:
   name='assets/icons/cards/'+entry['id']+'.png'
   assert entry['file']==name,'Unexpected icon path'
   data=icons.read(name)
   assert hashlib.sha256(data).hexdigest()==entry['sha256'],'Icon checksum mismatch: '+name
   target=PREVIEW/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
   icon_map[entry['id']]=name
 game=patch.once(game,'function luckIcon(card, kind) {','Object.assign(LUCK_CARD_ICONS,'+json.dumps(icon_map)+');\nfunction luckIcon(card, kind) {','v0.2.19 dedicated card icons')
 (PREVIEW/'game.js').write_text(game)
 history=patch.patch_history((ROOT/'history.js').read_text()).replace('luck_dungeon_manual_runs_v0216','luck_dungeon_manual_runs_v0219_preview')
 (PREVIEW/'history.js').write_text(history)
 ranking=patch.patch_rankings((ROOT/'rankings.js').read_text())
 ranking=patch.once(ranking,"+'</b><span>'+(tab", "+'</b><em class=\"luck-clear-tag\">'+(r.outcome==='clear'?'🏆 최종 클리어':'💀 게임 종료')+'</em><span>'+(tab",'랭킹 최종 클리어 표시')
 for old,new in [('온라인 최고기록 순위','테스트 기록 순위'),('온라인 랭킹','테스트 랭킹'),('온라인 조회 중','기기 기록 조회 중'),('서버 전체 기록','이 기기 테스트 기록'),('온라인 조회 실패','기기 기록 조회 실패'),('온라인 기록 등록','테스트 기록 등록'),('온라인 등록 중','기기 저장 중'),('온라인 등록 완료','테스트 등록 완료'),('온라인 랭킹에 등록했습니다','기기 테스트 랭킹에 등록했습니다'),('등록하면 이니셜·점수·라운드·플레이 시간이 공개됩니다.','등록하면 이 기기의 테스트 랭킹에만 표시됩니다.')]:
  ranking=ranking.replace(old,new)
 (PREVIEW/'rankings.js').write_text(ranking)
 cloud=patch.offline_cloud().replace('로컬 테스트','웹 테스트').replace('독립 로컬 테스트','독립 웹 테스트')
 (PREVIEW/'cloud'/'cloud.js').write_text(cloud)
 (PREVIEW/'cloud'/'config.js').write_text('/* Isolated preview: production cloud config is intentionally absent. */\nwindow.LUCK_CLOUD_CONFIG={};\n')
 # Existing templates contain registration labels too; keep the isolated behavior clear.
 for name in ['game.js','history.js']:
  p=PREVIEW/name;s=p.read_text().replace('온라인 등록 완료','테스트 등록 완료').replace('온라인 기록','테스트 기록').replace('온라인 랭킹','테스트 랭킹')
  p.write_text(s)
 ui='window.LUCK_V0219_COMPACT_CSS='+json.dumps(patch.CSS,ensure_ascii=False)+';\n'+patch.ui_patch_js()
 ui=ui.replace('통합 로컬 테스트','통합 웹 테스트')
 (PREVIEW/'preview-ui.js').write_text(ui)
 index=(PREVIEW/'index.html').read_text().replace('v0.2.18','v0.2.19').replace('Original UI Playtest','Isolated Web Playtest')
 index=index.replace('☁️ v0.2.19 온라인 · 종료 기록 자동 저장 · 이니셜 등록 시 랭킹 공개','🧪 v0.2.19 테스트판 · 기록은 이 기기에만 저장 · 정식 랭킹에 반영되지 않습니다')
 index=index.replace('☁️ 온라인 기록·AI 활동','📊 테스트 기록').replace('🏆 온라인 랭킹','🏆 테스트 랭킹')
 index=index.replace('☁️ 온라인 연결 가능','🔒 독립 테스트 기록').replace('🧪 로컬 테스트','🧪 v0.2.19 테스트판')
 index=index.replace('</head>','<meta name="robots" content="noindex,nofollow">\n</head>')
 index=index.replace('</body>','<script src="preview-ui.js"></script></body>')
 index=re.sub(r'(<script src="[^"]+\.js)(")',lambda m:m[1]+'?v='+BUILD+m[2],index)
 (PREVIEW/'index.html').write_text(index)
 # No outbound network requests from the experiment, including accidental future clients.
 policy="default-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' data: blob:; connect-src 'none'; object-src 'none'; base-uri 'self'"
 index=index.replace('<head>','<head>\n<meta http-equiv="Content-Security-Policy" content="'+policy+'">',1)
 (PREVIEW/'index.html').write_text(index)
 assert all(digest(SITE/name)==expected for name,expected in originals.items()),'Stable runtime changed'
 assert 'supabase.co' not in (PREVIEW/'cloud'/'cloud.js').read_text()
 (ROOT/'preview-build-report.json').write_text(json.dumps({'preview_path':'preview/v0.2.19/','base_commit':patch.PIN,'stable_files_unchanged':len(originals),'source_patch_sha256':digest(ROOT/'v0219_patch.py'),'preview_files':{str(p.relative_to(PREVIEW)):digest(p) for p in PREVIEW.rglob('*') if p.is_file()}},indent=2))
 print('Built preview/v0.2.19/; preserved',len(originals),'stable files; test records isolated; outbound connections disabled.')

if __name__=='__main__':build()
