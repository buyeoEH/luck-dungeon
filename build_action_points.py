"""Build isolated AP test from a previously reproduced RC.3; never edit published paths."""
import hashlib,json,re,shutil,subprocess
from pathlib import Path
from action_points_patch import patch
R=Path(__file__).resolve().parent
P=R/'_site/preview/v0.3-ap'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def build():
 source=R/'_site/preview/v0.3.0'
 if P.exists():shutil.rmtree(P)
 shutil.copytree(source,P)
 (P/'game.js').write_text(patch((source/'game.js').read_text()))
 files=['action-points.js','action_points_patch.py','build_action_points.py','ap-node.cjs','test-action-points.cjs','run-action-points.cjs','package_action_points.py']
 hashes={f:sha(R/f) for f in files}
 meta=json.loads((P/'build.json').read_text());meta.update(version='0.3.1-ap.exp.1',stage='action_points_experiment',git_sha=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),baseline_build_id=meta['build_id'],build_id='031-ap-'+hashlib.sha256(json.dumps(hashes,sort_keys=True).encode()).hexdigest()[:16],source_tree_dirty=bool(subprocess.check_output(['git','status','--porcelain','--',*files],text=True).strip()),ap_sources=hashes,ap_contract={'base_per_round':2,'carry':False,'shared_hand_shop':True,'purchase':1,'promotion':1,'cost_scope':'explicit_active_cards_only','passive_cost':0,'refill_cap':None},release_scope='isolated_experiment_not_adopted')
 # Each candidate keeps its records separate, including the no-AP control.
 mode="(new URLSearchParams(location.search).get('ap')||'new')"
 for f in ['v0220-core.js','cloud/cloud.js']:
  s=(P/f).read_text().replace("'luck-v030-p1'","('luck-ap-exp-'+"+mode+")").replace("'luck_local_v030_rankings'","('luck_local_ap_exp_'+"+mode+")")
  (P/f).write_text(s)
 html=(P/'index.html').read_text()
 html=re.sub(r'window.LUCK_BUILD=\{[^<]+?\};',lambda _: 'window.LUCK_BUILD='+json.dumps(meta)+';',html,count=1)
 html=html.replace('0.3.0-rc.3','0.3.1 행동력 실험')
 # Existing telemetry assumes a secure context. Local HTTP needs the same
 # UUID API without consuming the game's seeded Math.random stream.
 uuid="<script>if(typeof crypto.randomUUID!=='function')crypto.randomUUID=()=>{const b=crypto.getRandomValues(new Uint8Array(16));b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;const h=Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20);};</script>"
 html=html.replace('</head>',uuid+'</head>')
 html=html.replace('안내 없이 기존 규칙 그대로 플레이합니다.','선택한 행동력 후보 규칙으로 플레이합니다.')
 for f in ['preview-ui.js','rankings.js']:
  s=(P/f).read_text().replace('0.3.0-rc.3','0.3.1 행동력 실험').replace('서버 전체 기록','이 기기 후보별 기록')
  (P/f).write_text(s)
 links=' '.join('<a href="?ap='+m+'">'+n+'</a>' for m,n in [('off','기준판'),('shop','구매·승급'),('strong','강한 카드'),('new','신규 보충'),('promo','승급 보충')])
 controls='<section class="ap-intro"><b>🧪 행동력 검증 · 정식 반영 전</b><p>매 라운드 2 · 구매/승급 각 1 · 강한 액션 1~2 · 손패와 상점 공유 · 이월 없음. 강한 카드의 자동 패시브와 기본 공격은 비용 0입니다.</p><nav>'+links+'</nav><p>신규 보충: 기본 상점 전술 정비(4원/재고3), 사용 시 +1. 승급 보충: 숙련의 손 +1 / 광부 대장 +2. 후보를 바꾸면 새 게임으로 시작합니다.</p></section>'
 html=html.replace('<div class="welcome-options">',controls+'<div class="welcome-options">')
 html=html.replace('<body>','<body><div id="apHud" role="status" aria-live="polite"></div>')
 html=html.replace('</head>','<style>#apHud{position:sticky;top:0;z-index:100;background:#162c37;color:#a7f3d0;padding:10px;font-size:13px;border-bottom:1px solid #34d399}.ap-intro{padding:12px;border:1px solid #34d399;border-radius:10px;line-height:1.6}.ap-intro nav{display:flex;flex-wrap:wrap;gap:8px}.ap-intro a{background:#164e63;color:white;padding:7px;border-radius:7px}</style></head>')
 (P/'index.html').write_text(html);(P/'build.json').write_text(json.dumps(meta,indent=2))
 print(json.dumps({'build_id':meta['build_id'],'dirty':meta['source_tree_dirty']}))
 return meta
if __name__=='__main__':build()
