"""v0.3.2: visible link feedback; preserve combat/AP formulas and automatic sync."""
from pathlib import Path
import hashlib,json,re,subprocess
import build_action_points_final as previous
R=Path(__file__).resolve().parent
P=previous.P
def build():
 meta=previous.build()
 g=(P/'game.js').read_text()
 button=' <button onclick="useGem(true)" style="padding:2px 6px;font-size:10px">전부 → ⚡</button>'
 assert g.count(button)==1
 g=g.replace(button,'').replace('const n=all?gems:1;','const n=1; // v0.3.2: even stale bulk calls exchange one gem only.')
 g+='\n'+(R/'link-feedback-v032.js').read_text()
 (P/'game.js').write_text(g)
 sources=['build_v032.py','link-feedback-v032.js','link-feedback-v032.css','test-v032.cjs','test-v032-browser.cjs']
 hashes={p:hashlib.sha256((R/p).read_bytes()).hexdigest() for p in sources}
 meta.update(version='0.3.2-ui.1',stage='link_feedback',git_sha=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),build_id='032-link-'+hashlib.sha256((meta['build_id']+json.dumps(hashes,sort_keys=True)).encode()).hexdigest()[:16],v032_sources=hashes)
 meta['source_tree_dirty']=meta['source_tree_dirty'] or bool(subprocess.check_output(['git','status','--porcelain','--',*sources],text=True).strip())
 h=(P/'index.html').read_text()
 h=re.sub(r'window.LUCK_BUILD=\{[^<]+?\};',lambda _: 'window.LUCK_BUILD='+json.dumps(meta)+';',h,count=1)
 h=h.replace('<div class="mini-status">','<div class="mini-status">',1)
 mark='    <!-- 스크롤 가능한 하단 콘텐츠 구역 -->'
 assert mark in h
 # Pin only the compact meter; the expandable conditions remain outside the sticky area.
 old='      </div>\n    </div>\n\n'+mark
 assert old in h
 h=h.replace(old,'      </div><section id="linkMeter" aria-label="연계 포인트"></section>\n    </div>\n\n'+mark,1)
 # Detailed lists and secondary run info must not occupy the sticky viewport.
 overview=[]
 for id in ['enemyChips','protections']:
  pattern=r'<div id="'+id+r'" class="[^"]+"></div>'
  found=re.search(pattern,h);assert found
  overview.append(found[0]);h=h[:found.start()]+h[found.end():]
 secondary=[]
 patterns=[r'<div class="dash-item">📚.*?</div>',r'<div class="dash-item score-dash">.*?</div>',r'<div class="dash-item time-dash">.*?</div>',r'<div class="dash-item mode-dash">.*?</div>']
 for pattern in patterns:
  found=re.search(pattern,h);assert found
  secondary.append(found[0]);h=h[:found.start()]+h[found.end():]
 h=h.replace(mark,'<section class="enemy-overview"><div class="run-secondary">'+''.join(secondary)+'</div>'+''.join(overview)+'</section>'+mark,1)
 dialog='<dialog id="linkDialog" aria-labelledby="linkDialogTitle"><header class="link-dialog-header"><h2 id="linkDialogTitle">연계 상세</h2><button id="linkDialogClose" type="button" onclick="closeLinkDetails()" aria-label="연계 상세 닫기">닫기 ✕</button></header><section id="linkDetailsHost"></section></dialog>'
 h=h.replace('</body>',dialog+'</body>')
 h=h.replace('</head>','<style>'+(R/'link-feedback-v032.css').read_text()+'</style></head>')
 h=h.replace('v0.3.1 행동력 반영판','v0.3.2 연계 공격').replace('행동력 반영판 행동력 반영판','연계 공격').replace('LUCK DUNGEON · v0.3.1','LUCK DUNGEON · v0.3.2')
 (P/'index.html').write_text(h)
 for name in ['preview-ui.js','history.js','rankings.js']:
  p=P/name;p.write_text(p.read_text().replace('v0.3.1 행동력 반영판','v0.3.2 연계 공격'))
 (P/'build.json').write_text(json.dumps(meta,indent=2))
 print(json.dumps({'version':meta['version'],'build_id':meta['build_id'],'dirty':meta['source_tree_dirty']}))
 return meta
if __name__=='__main__':build()
