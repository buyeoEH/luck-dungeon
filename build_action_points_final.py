"""One applied AP play build. The experiment remains a measurement-only source."""
import hashlib,json,re,shutil,subprocess
from pathlib import Path
from defeat_presentation_patch import patch as defeat_patch
from status_sync_patch import patch as status_sync_patch
R=Path(__file__).resolve().parent
P=R/'_site/preview/v0.3-ap-final'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def build():
 source=R/'_site/preview/v0.3-ap'
 if P.exists():shutil.rmtree(P)
 shutil.copytree(source,P)
 game=defeat_patch((P/'game.js').read_text())
 old="el.textContent='🧪 행동력 검증 · '+names[AP_MODE]+(apEnabled()?' | ⚡ '+apState.points+' | 매 라운드 2 · 손패/상점 공유 · 이월 없음':' | 행동력 제한 없음');"
 assert game.count(old)==1
 game=game.replace(old,"el.textContent='⚡ 행동력 '+apState.points;")
 (P/'game.js').write_text("window.LUCK_AP_MODE='promo'; // Fixed applied rules; query choices are ignored.\n"+game)
 meta=json.loads((P/'build.json').read_text())
 final_hashes={p:sha(R/p) for p in ['build_action_points_final.py','test-ap-final.cjs','defeat_presentation_patch.py','test-defeat-presentation.cjs','status_sync_patch.py','v031-sync.sql','test-status-sync.cjs','test-status-browser.cjs','v0220-cloud.js']}
 meta.update(version='0.3.1-ap.3',stage='action_points_applied',git_sha=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),build_id='031-ap-final-'+hashlib.sha256((json.dumps(final_hashes,sort_keys=True)+meta['build_id']).encode()).hexdigest()[:16],final_sources=final_hashes,release_scope='single_applied_play_build',ap_mode='promo',mode_selection=False,defeat_presentation='combat_then_gameover')
 meta['source_tree_dirty']=bool(subprocess.check_output(['git','status','--porcelain','--',*meta['ap_sources'],*final_hashes],text=True).strip())
 mode="(new URLSearchParams(location.search).get('ap')||'new')"
 for f in ['v0220-core.js','cloud/cloud.js']:
  s=(P/f).read_text().replace("('luck-ap-exp-'+"+mode+")","'luck-ap-applied-1'").replace("('luck_local_ap_exp_'+"+mode+")","'luck_local_ap_applied_1'")
  (P/f).write_text(s)
 html=(P/'index.html').read_text()
 html=re.sub(r'window.LUCK_BUILD=\{[^<]+?\};',lambda _: 'window.LUCK_BUILD='+json.dumps(meta)+';',html,count=1)
 html,n=re.subn(r'<section class="ap-intro">.*?</section>','<section class="ap-rules"><b>⚡ 행동력</b><p>매 라운드 2 · 구매/승급 각 1 · 강한 액션 1~2 · 남은 행동력은 이월하지 않습니다.</p><p>숙련의 손: 행동력 +1 / 광부 대장: +2. 일반 채굴과 자동 공격·패시브는 행동력을 소모하지 않습니다.</p></section>',html,flags=re.S)
 assert n==1
 hud='<div id="apHud" role="status" aria-live="polite"></div>'
 assert html.count(hud)==1
 html=html.replace(hud,'')
 assert html.count('<header class="dashboard">')==1
 html=html.replace('<header class="dashboard">','<header class="dashboard"><span class="dash-item" id="apHud" role="status" aria-live="polite"></span>')
 html=html.replace('선택한 행동력 후보 규칙으로 플레이합니다.','행동력이 반영된 규칙으로 플레이합니다.')
 html=html.replace('</head>','<style>body{min-width:0}#app{min-width:0;max-width:900px}#apHud{position:static;top:auto;z-index:auto;flex:0 0 auto;align-self:center;display:inline-flex;background:transparent;border:0;padding:0;margin:0;color:#a7f3d0;font-size:12px;font-weight:700;white-space:nowrap;line-height:1.5;min-width:0;max-width:100%}.ap-rules{padding:10px;border:1px solid #315566;border-radius:8px;font-size:12px;line-height:1.6}.ap-rules p{margin:4px 0}</style></head>')
 (P/'index.html').write_text(html)
 for f in ['index.html','preview-ui.js','rankings.js','history.js']:
  s=(P/f).read_text().replace('v0.3.1 행동력 실험 개발판','v0.3.1 행동력 반영판').replace('v0.3.1 행동력 실험 P5 개발판','v0.3.1 행동력 반영판').replace('0.3.1 행동력 실험 개발판','0.3.1 행동력 반영판').replace('P5 보상 개발판','행동력 반영판').replace('이 기기 후보별 기록','이 기기 기록').replace('기기 테스트 기록','기기 기록')
  (P/f).write_text(s)
 status_sync_patch(P)
 (P/'build.json').write_text(json.dumps(meta,indent=2))
 print(json.dumps({'build_id':meta['build_id'],'dirty':meta['source_tree_dirty'],'mode_selection':False}))
 return meta
if __name__=='__main__':build()
