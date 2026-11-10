from pathlib import Path
import hashlib,json,re,subprocess,importlib.util
import build_v032
import protection_v039_patch as guard_patch
import mobile_ui_patch
import guard_promotion_patch,guard_feedback_patch,guard_card_assets
from boss_audio_patch import patch as audio_patch
R=Path(__file__).resolve().parent;P=build_v032.P
spec=importlib.util.spec_from_file_location('boss_patch',R/'boss-encounter-patch.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
def build():
 meta=build_v032.build();(P/'game.js').write_text(mod.patch((P/'game.js').read_text()))
 spec2=importlib.util.spec_from_file_location('presence_patch',R/'boss-presence-patch.py');presence=importlib.util.module_from_spec(spec2);spec2.loader.exec_module(presence)
 (P/'game.js').write_text(presence.patch((P/'game.js').read_text()))
 (P/'game.js').write_text(guard_patch.patch((P/'game.js').read_text()))
 (P/'game.js').write_text(mobile_ui_patch.patch((P/'game.js').read_text()))
 (P/'game.js').write_text(guard_promotion_patch.patch((P/'game.js').read_text()))
 (P/'game.js').write_text(guard_feedback_patch.patch((P/'game.js').read_text()))
 guard_card_assets.build(P/'assets/cards')
 import shutil
 art=R/'card-art-v0311'
 for asset in art.glob('*.webp'):shutil.copyfile(asset,P/'assets/cards'/asset.name)
 game=(P/'game.js').read_text()
 marker='const CARD_NAME = {};'
 mapping='\n'.join('LUCK_CARD_ICONS['+json.dumps(p.stem)+']='+json.dumps('assets/cards/'+p.name)+';' for p in sorted(art.glob('*.webp')))
 game=game.replace(marker,mapping+'\n'+marker)
 game=game.replace('const LUCK_NAMED_ICON_IDS =',"Object.assign(CARD_NAME,{linkseal:'증폭 문장',linkpeak:'꿰뚫는 정점',linklance:'연계 관통창'});\nconst LUCK_NAMED_ICON_IDS =")
 game+='\n'+(R/'attack-details.js').read_text()
 (P/'game.js').write_text(game)
 files=['protection-v039.js','protection_v039_patch.py','test-protection.cjs','build_boss.py','boss-encounter.js','boss-encounter-patch.py','boss-ai.cjs','test-boss.cjs','test-boss-growth.cjs','test-link-transition.cjs','test-boss-browser.cjs','run-boss-balance.cjs','boss-table.json','BOSS-BALANCE-GOALS.json','boss-presence.js','boss-presence.css','boss-presence-patch.py','boss_audio_patch.py','boss-audio.js','test-boss-audio.cjs','package_boss_audio.py']
 files+=['attack-details.js','test-endless.cjs','test-attack-details.cjs','test-release-browser.cjs','V0311-ENDLESS-RELEASE.md']
 files+=['mobile-ui.js','mobile-ui.css','mobile_ui_patch.py','test-mobile-browser.cjs']
 files+=['guard-promotions.js','guard_promotion_patch.py','guard-feedback-v040.js','guard_feedback_patch.py','guard-feedback-v040.css','guard_card_assets.py','build_v030_standalone.py','test-guard-promotions.cjs','test-guard-visual-browser.cjs','measure-guard-promotions.cjs','V0310-MEGA-GUARD-RELEASE.md']
 files += [str(p.relative_to(R)) for p in sorted((R/'card-art-v0311').glob('*'))]
 hashes={n:hashlib.sha256((R/n).read_bytes()).hexdigest() for n in files}
 audio_hashes={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in (R/'assets/boss-audio').glob('*') if p.is_file()}
 meta.update(version='0.3.11-boss.1',stage='debuff_protection_playable',build_id='033-boss-'+hashlib.sha256((meta['build_id']+json.dumps(hashes,sort_keys=True)+json.dumps(audio_hashes,sort_keys=True)).encode()).hexdigest()[:16],boss_sources=hashes,boss_audio=audio_hashes,boss_table=json.loads((R/'boss-table.json').read_text()))
 meta['protection_contract']={'boss_debuffs':{'5':{'combo':20},'10':{'resource':20},'15':{'attack':20},'20':{'combo':20,'resource':10},'25':{'resource':20,'attack':10},'30':{'attack':20,'combo':10,'resource':10}},'all_modes':['balanced','combat','economy'],'default_mode':'balanced','spend':'minimal_effective_only','order':['combo','attack'],'promotion_values':'first_playtest_five_roles'}
 # The checked table is injected once; no candidate chooser in the player build.
 game=(P/'game.js').read_text();(P/'game.js').write_text('window.LUCK_BOSS_TABLE='+json.dumps(meta['boss_table'])+';\n'+game)
 meta['source_tree_dirty']=meta['source_tree_dirty'] or bool(subprocess.check_output(['git','status','--porcelain','--',*files,'boss-table.json','BOSS-BALANCE-GOALS.json','boss-presence.js','boss-presence.css','boss-presence-patch.py'],text=True).strip())
 h=(P/'index.html').read_text();h=re.sub(r'window.LUCK_BUILD=\{[^<]+?\};',lambda _:'window.LUCK_BUILD='+json.dumps(meta)+';',h,count=1)
 h=h.replace('<section id="enemySection"','<section id="bossStagePanel" class="hide"></section><section id="enemySection"',1)
 css='#bossStagePanel{border:1px solid #ad7b31;border-radius:9px;padding:9px;background:#272012;font-size:12px}#bossStagePanel header{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}#bossStagePanel p{margin:6px 0;line-height:1.5}.boss-health{display:grid;gap:4px;margin-top:8px}.boss-health>div{height:8px;background:#172535;border-radius:5px;overflow:hidden}.boss-health i{display:block;height:100%;background:#60a5fa;transition:width .3s}.boss-health .boss-core i{background:#f87171}.boss-rule-note{padding:8px;border:1px solid #9a7237;border-radius:7px;font-size:12px}'
 h=h.replace('</head>','<style>'+css+(R/'boss-presence.css').read_text()+guard_patch.CSS+(R/'mobile-ui.css').read_text()+(R/'guard-feedback-v040.css').read_text()+'</style></head>')
 audio=P/'luck-audio.js';audio.write_text(audio_patch(audio.read_text()).replace('setBgmEnabled,setSfxEnabled,unlock,runStart,sync,',"statusCue(kind){sfx(({protected:'boss_sfx_shield_hit_01',debuff:'boss_sfx_attack_charge',theft_success:'boss_sfx_pierce',theft_failed:'boss_sfx_body_hit_02'})[kind]);},setBgmEnabled,setSfxEnabled,unlock,runStart,sync,"))
 import shutil
 shutil.copytree(R/'assets/boss-audio',P/'assets/boss-audio',dirs_exist_ok=True)
 h=h.replace('<section class="ap-rules">','<section class="ap-rules"><p>첫 관문: R1~4 일반 적 HP 25% 완화. R5 보스: 보호막 없음 · 진체력 36 유지 · 연계 디버프 −20%. 메가턴 보상: 다음 1턴만 시작 손패 8장 · 행동력 3. 이후 5장 · 2로 복귀하며 영구 누적 없음.</p><p><b>👑 보스전 검증판</b> R5·10·15·20·25·30마다 최대 3회 전투. R30 공식전 종료에는 보상 없음. 무한모드 선택 시 R30 보상 1회. R35 이후도 개편 보스 규칙 유지. 이전 적과 보스를 모두 처치해야 다음 구간으로 갑니다. 보호막·진체력을 나눠 표시하며 보스전 수치는 검증 중입니다.</p>',1)
 h=h.replace('v0.3.2 연계 공격','v0.3.11 무한 보스·보호 이미지').replace('보석을 사용하면 다시 계산합니다.','보석을 사용하면 다시 계산합니다.')
 h=h.replace('<section class="ap-rules">','<section class="ap-rules"><p>🎵 보스 전용 음원 적용 · 준비/전투/마지막 턴 BGM 및 보호막·진체력 효과음. 시작 설정에서 BGM을 켜 주세요.</p>',1)
 for name in ['preview-ui.js','history.js','rankings.js']:
  p=P/name;p.write_text(p.read_text().replace('v0.3.2 연계 공격','v0.3.11 무한 보스·보호 이미지'))
 h=h.replace('<section class="ap-rules">','<section class="ap-rules"><p>🛡 다중 디버프·유효 보호 적용. 전체 보호 범위는 시작 설정과 각 전투 준비 안내에서 선택합니다.</p>',1)
 h=h.replace('<div class="welcome-options">','<div class="welcome-options"><label class="guard-policy">🛡 전체 보호 사용 범위 <select id="guardWelcomeMode"><option value="balanced">균형</option><option value="combat">전투 집중</option><option value="economy">경제 집중</option></select></label>')
 h=h.replace('</head>','<style>.attack-detail-row{display:flex;justify-content:space-between;gap:12px;margin:5px 0}.attack-detail-row span{min-width:0;overflow-wrap:anywhere}.attack-detail-row b{flex-shrink:0}.attack-detail-total{display:flex;justify-content:space-between;border-top:1px solid #475569;padding-top:10px;margin-top:10px;color:#38bdf8}.attack-detail-context,.attack-detail-formula{color:#94a3b8;font-size:12px}</style></head>')
 h=h.replace('콤보 보호','연계 보호')
 (P/'index.html').write_text(h);(P/'build.json').write_text(json.dumps(meta,indent=2));print(json.dumps({'build_id':meta['build_id'],'version':meta['version'],'dirty':meta['source_tree_dirty']}));return meta
if __name__=='__main__':build()
