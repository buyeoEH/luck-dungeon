"""Add visible targeting feedback, exclusive accounting and AP readiness guidance."""
from pathlib import Path
import hashlib,json,re,subprocess
import build_v0313
R=Path(__file__).resolve().parent
P=build_v0313.P
def once(s,a,b):
    assert s.count(a)==1,(a,s.count(a))
    return s.replace(a,b)
def build():
    meta=build_v0313.build()
    g=(P/'game.js').read_text()
    g=once(g,'Object.assign(enemy,p.enemy);stats.damageDealt',"const targetBefore314={hp:enemy.hp,shield:enemy.shield||0,core:enemy.coreHp??enemy.hp};\n Object.assign(enemy,p.enemy);stats.damageDealt")
    g=once(g,'target:enemy.name,target_count:', 'target:enemy.name,target_id:enemy.id,hp_before:targetBefore314.hp,hp_after:enemy.hp,shield_before:targetBefore314.shield,shield_after:enemy.shield||0,core_before:targetBefore314.core,core_after:enemy.coreHp??enemy.hp,target_count:')
    g=once(g,"' 지정 피해 '+p.damage+' · 보호막 '","' 지정 피해 '+p.damage+' · HP '+targetBefore314.hp+' → '+enemy.hp+' · 보호막 '")
    g=once(g,"return '<span class=\"chip'", "return '<span data-enemy-id=\"'+e.id+'\" class=\"chip'")
    old="  log('🗡 관통 준비 '+m.totalPierce+' (기존 '+m.existingPierce+' + 변환 '+m.pierceBonus+') · 실제 '+hits.length+'회 / '+scene.p1.pierceDamage+' 피해 / '+scene.p1.pierceKills+'킬');"
    g=once(g,old,"  log('🗡 관통 준비 '+m.totalPierce+' (기존 '+m.existingPierce+' + 변환 '+m.pierceBonus+') · 피해는 지정 / 전달 / 보스 직격으로 구분합니다.');")
    g+='\n'+(R/'combat-feedback-v0314.js').read_text()
    (P/'game.js').write_text(g)
    (P/'combat-feedback-v0314.css').write_text((R/'combat-feedback-v0314.css').read_text())
    core=P/'v0220-core.js';s=core.read_text()
    anchor=" log('🗡 관통 수치: 준비 '+pierceSummary.prepared+' · 추가 적중 '+pierceSummary.hits+'회 · 실제 피해 '+pierceSummary.damage+' · 처치 '+pierceSummary.kills+'마리');"
    s=once(s,anchor," const pierceBreakdown314=window.LuckCombatFeedback314.settle(scene);\n log('🗡 관통 피해 구분: 지정 '+pierceBreakdown314.targeted_damage+' / 전달 '+pierceBreakdown314.transfer_damage+' / 보스 직격 '+pierceBreakdown314.boss_direct_damage+' · 합계 '+pierceBreakdown314.total_damage+' (중복 제외)');\n emit('pierce_breakdown',pierceBreakdown314);")
    s=once(s,'link_score:linkScore,pierce_summary:pierceSummary,','link_score:linkScore,pierce_summary:pierceSummary,pierce_breakdown:pierceBreakdown314,')
    # New accounting is authoritative for the split view; legacy summary fields stay compatible.
    s=once(s,'a.pierce_kills+=p.kills;',"a.pierce_kills+=p.kills;const b=e.payload.pierce_breakdown;if(b){a.transfer_pierce_damage=(a.transfer_pierce_damage||0)+b.transfer_damage;a.boss_direct_pierce_damage=(a.boss_direct_pierce_damage||0)+b.boss_direct_damage;a.exclusive_pierce_total=(a.targeted_pierce_damage||0)+a.transfer_pierce_damage+a.boss_direct_pierce_damage;}")
    s=once(s,'a.targeted_pierce_kills=(a.targeted_pierce_kills||0)+Number(e.payload.killed);','a.targeted_pierce_kills=(a.targeted_pierce_kills||0)+Number(e.payload.killed);a.exclusive_pierce_total=(a.targeted_pierce_damage||0)+(a.transfer_pierce_damage||0)+(a.boss_direct_pierce_damage||0);')
    core.write_text(s)
    history=P/'history.js';s=history.read_text()
    helper="""function pierceArchive314(s){const c=s.live?.combat_summary||s.terminal?.combat_summary;if(!c||c.official?.exclusive_pierce_total===undefined&&c.endless?.exclusive_pierce_total===undefined)return '<p>관통 구분 통계: 이전 버전 기록에는 없음</p>';return ['official','endless'].filter(k=>c[k]?.exclusive_pierce_total!==undefined).map(k=>'<p>🗡 '+(k==='official'?'공식전':'무한모드')+' · 지정 '+(c[k].targeted_pierce_damage||0)+' / 전달 '+(c[k].transfer_pierce_damage||0)+' / 보스 직격 '+(c[k].boss_direct_pierce_damage||0)+' · 합계 '+c[k].exclusive_pierce_total+' (중복 제외)</p>').join('');}\n"""
    s=once(s,'function entry(s){',helper+'function entry(s){')
    s=once(s,"...combatLines(s),'FINAL_DECK_INSTANCES='", "...combatLines(s),'PIERCE_SPLIT='+JSON.stringify({official:(s.live?.combat_summary||s.terminal?.combat_summary)?.official??null,endless:(s.live?.combat_summary||s.terminal?.combat_summary)?.endless??null,definition:'exclusive_v1; older records without exclusive_pierce_total are not measured'}),'FINAL_DECK_INSTANCES='")
    s=once(s,"window.Luck220.characterHtml(s.character)+'<button", "window.Luck220.characterHtml(s.character)+pierceArchive314(s)+'<button")
    s=once(s,'score_breakdown:s.terminal?.score_breakdown,events:', 'score_breakdown:s.terminal?.score_breakdown,combat_summary:s.live?.combat_summary||s.terminal?.combat_summary,events:')
    history.write_text(s)
    names=['build_v0314.py','combat-feedback-v0314.js','combat-feedback-v0314.css','test-v0314.cjs','test-v0314-browser.cjs']
    hashes={n:hashlib.sha256((R/n).read_bytes()).hexdigest() for n in names}
    meta.update(version='0.3.14-feedback.1',stage='target_feedback_pierce_accounting_ap_guidance',release_scope='public_web_playtest',feedback_sources=hashes,pierce_accounting='exclusive_v1',ap_guidance='before spend or leaving hand; explicit continue/cancel; no forced priority')
    meta['source_tree_dirty']=meta['source_tree_dirty'] or bool(subprocess.check_output(['git','status','--porcelain','--',*names],text=True).strip())
    meta['build_id']='0314-'+hashlib.sha256((g+json.dumps(hashes,sort_keys=True)).encode()).hexdigest()[:16]
    (P/'build.json').write_text(json.dumps(meta,indent=2))
    h=(P/'index.html').read_text()
    h=re.sub(r'window.LUCK_BUILD=\{[^<]+?\};',lambda _:'window.LUCK_BUILD='+json.dumps(meta)+';',h,count=1)
    h=h.replace('</head>','<link rel="stylesheet" href="combat-feedback-v0314.css"></head>')
    for name in ['index.html','preview-ui.js','history.js','rankings.js']:
        text=h if name=='index.html' else (P/name).read_text()
        text=text.replace('v0.3.13 카드 선택·환원 가치','v0.3.14 관통 피드백').replace('v0.3.12 보상·전술 카드','v0.3.14 관통 피드백')
        (P/name).write_text(text)
    return meta
if __name__=='__main__':print(json.dumps(build()))
