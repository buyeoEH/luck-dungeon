from pathlib import Path
import hashlib,json,re,subprocess,importlib.util
import build_v032
from boss_audio_patch import patch as audio_patch
R=Path(__file__).resolve().parent;P=build_v032.P
spec=importlib.util.spec_from_file_location('boss_patch',R/'boss-encounter-patch.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
def build():
 meta=build_v032.build();(P/'game.js').write_text(mod.patch((P/'game.js').read_text()))
 spec2=importlib.util.spec_from_file_location('presence_patch',R/'boss-presence-patch.py');presence=importlib.util.module_from_spec(spec2);spec2.loader.exec_module(presence)
 (P/'game.js').write_text(presence.patch((P/'game.js').read_text()))
 files=['build_boss.py','boss-encounter.js','boss-encounter-patch.py','boss-ai.cjs','test-boss.cjs','test-boss-growth.cjs','test-boss-browser.cjs','run-boss-balance.cjs','boss-table.json','BOSS-BALANCE-GOALS.json','boss-presence.js','boss-presence.css','boss-presence-patch.py','boss_audio_patch.py','boss-audio.js','test-boss-audio.cjs','package_boss_audio.py']
 hashes={n:hashlib.sha256((R/n).read_bytes()).hexdigest() for n in files}
 audio_hashes={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in (R/'assets/boss-audio').glob('*') if p.is_file()}
 meta.update(version='0.3.6-boss.1',stage='boss_audio_playable',build_id='033-boss-'+hashlib.sha256((meta['build_id']+json.dumps(hashes,sort_keys=True)+json.dumps(audio_hashes,sort_keys=True)).encode()).hexdigest()[:16],boss_sources=hashes,boss_audio=audio_hashes,boss_table=json.loads((R/'boss-table.json').read_text()))
 # The checked table is injected once; no candidate chooser in the player build.
 game=(P/'game.js').read_text();(P/'game.js').write_text('window.LUCK_BOSS_TABLE='+json.dumps(meta['boss_table'])+';\n'+game)
 meta['source_tree_dirty']=meta['source_tree_dirty'] or bool(subprocess.check_output(['git','status','--porcelain','--',*files,'boss-table.json','BOSS-BALANCE-GOALS.json','boss-presence.js','boss-presence.css','boss-presence-patch.py'],text=True).strip())
 h=(P/'index.html').read_text();h=re.sub(r'window.LUCK_BUILD=\{[^<]+?\};',lambda _:'window.LUCK_BUILD='+json.dumps(meta)+';',h,count=1)
 h=h.replace('<section id="enemySection"','<section id="bossStagePanel" class="hide"></section><section id="enemySection"',1)
 css='#bossStagePanel{border:1px solid #ad7b31;border-radius:9px;padding:9px;background:#272012;font-size:12px}#bossStagePanel header{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}#bossStagePanel p{margin:6px 0;line-height:1.5}.boss-health{display:grid;gap:4px;margin-top:8px}.boss-health>div{height:8px;background:#172535;border-radius:5px;overflow:hidden}.boss-health i{display:block;height:100%;background:#60a5fa;transition:width .3s}.boss-health .boss-core i{background:#f87171}.boss-rule-note{padding:8px;border:1px solid #9a7237;border-radius:7px;font-size:12px}'
 h=h.replace('</head>','<style>'+css+(R/'boss-presence.css').read_text()+'</style></head>')
 audio=P/'luck-audio.js';audio.write_text(audio_patch(audio.read_text()))
 import shutil
 shutil.copytree(R/'assets/boss-audio',P/'assets/boss-audio',dirs_exist_ok=True)
 h=h.replace('<section class="ap-rules">','<section class="ap-rules"><p>R5 보스: 보호막 없음 · 진체력 24 · 연계 디버프 6. 보스 보상 1종 추가: 시작 손패 8장 + 시작 행동력 1 증가를 함께 적용. 손패는 8장으로 고정되며 재선택 시 행동력만 누적.</p><p><b>👑 보스전 검증판</b> R5·10·15·20·25·30마다 최대 3회 전투. R30은 보상 없이 공식전 완료. 이전 적과 보스를 모두 처치해야 다음 구간으로 갑니다. 보호막·진체력을 나눠 표시하며 보스전 수치는 검증 중입니다.</p>',1)
 h=h.replace('v0.3.2 연계 공격','v0.3.6 첫 보스 난이도 조정').replace('보석을 사용하면 다시 계산합니다.','보석을 사용하면 다시 계산합니다.')
 h=h.replace('<section class="ap-rules">','<section class="ap-rules"><p>🎵 보스 전용 음원 적용 · 준비/전투/마지막 턴 BGM 및 보호막·진체력 효과음. 시작 설정에서 BGM을 켜 주세요.</p>',1)
 for name in ['preview-ui.js','history.js','rankings.js']:
  p=P/name;p.write_text(p.read_text().replace('v0.3.2 연계 공격','v0.3.6 첫 보스 난이도 조정'))
 (P/'index.html').write_text(h);(P/'build.json').write_text(json.dumps(meta,indent=2));print(json.dumps({'build_id':meta['build_id'],'version':meta['version'],'dirty':meta['source_tree_dirty']}));return meta
if __name__=='__main__':build()
