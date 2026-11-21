"""Card multi-target strikes and independent link carry. Keep luck v0.3.15 rules."""
from pathlib import Path
import hashlib,json,re,subprocess
import build_v0315
R=Path(__file__).resolve().parent
P=build_v0315.P
once=build_v0315.once
def build():
 meta=build_v0315.build();p=P/'game.js';g=p.read_text()
 g=once(g,"pierce:new URLSearchParams(location.search).get('trialPierce')==='1'",'pierce:false')
 # Remove obsolete targeting comparison controls; this release has one rule set.
 a=g.index(" document.addEventListener('DOMContentLoaded',()=>{const box=node313('section'")
 b=g.index('\n})();',a)
 g=g[:a]+" document.addEventListener('DOMContentLoaded',()=>{const box=node313('section',undefined,'ap-rules');box.append(node313('b','v0.3.16 카드 관통·연계 관통 분리'));box.append(node313('p','운빨 개편 유지 · 카드 관통 100%·70%·50% / 적 부족 시 재분배 / 연계 관통은 남은 피해 전달. 4타부터 35%·25%·17%…는 검증용 연장 배율입니다.'));$('welcomeNormal')?.parentElement?.before(box);});"+g[b:]
 # Single shared strike resolver for preview and actual battle.
 a=g.index('    let remaining = hit;');b=g.index('    // v0.2.19: Pure-attack route.',a)
 g=g[:a]+"""    const startPierce=p1BattleSnapshot?p1BattleSnapshot.totalPierce:totalPierce();
    const counts316=pierceCounts316(ap);
    const strike316=resolvePierce316(enemies,hit,counts316.card,counts316.link,e=>battleEnemyIndex.get(e));
    strikeSnapshot316={...counts316,plan:strike316.plan,wasted_card_raw:strike316.wastedCard};
    let remaining=strike316.unusedBase;
    const parts=strike316.events.map(e=>e.label+' · '+e.name+' '+e.damage);
    for(const event of strike316.events){battleEvents.push(event);if(event.killed){const enemy=enemies.find(e=>battleEnemyIndex.get(e)===event.id);killedEnemies.push(event.name);if(enemy?.boss){bossKilled=true;killedBossZones.add(enemy.debuffZone);}}}
    enemies=enemies.filter(e=>e.hp>0);
    const pierceKillCount=strike316.events.filter(e=>e.killed&&e.pierce_source!=='base').length;

"""+g[b:]
 g=once(g,'let scoredAttack = 0, measuredAttackParts = null, p1BattleSnapshot = null;','let scoredAttack = 0, measuredAttackParts = null, p1BattleSnapshot = null, strikeSnapshot316=null;')
 old="""    if (startPierce > 0 && parts.length > 1) {
      stats.pierceDamage += parts.slice(1).reduce((sum, part) => sum + Number((part.match(/ (\\d+)$/) || [0,0])[1]), 0);
      stats.pierceKills += pierceKillCount;
    }"""
 g=once(g,old,"    stats.pierceDamage+=strike316.breakdown.total_damage;stats.pierceKills+=pierceKillCount;")
 g=once(g,'events:battleEvents','events:battleEvents,pierce316:strikeSnapshot316')
 a=g.index('    let remaining=ap.final,left=piercing,index=0;');b=g.index('    const pure=',a)
 g=g[:a]+"""    const counts316=pierceCounts316(ap),forecast316=resolvePierce316(enemies,ap.final,counts316.card,counts316.link);
    for(const hit of forecast316.events){const e=rows.find(e=>e.id===hit.id),direct=hit.corePierceDamage||0;e.coreDirectDamage=(e.coreDirectDamage||0)+direct;e.cardDamage=(e.cardDamage||0)+(hit.pierce_source==='card'?hit.damage:0);e.linkDamage=(e.linkDamage||0)+(hit.pierce_source==='link'?hit.damage-direct:0);e.strikeDamage+=hit.pierce_source==='base'?hit.damage-direct:0;e.pierceDamage+=hit.pierce_source==='base'?direct:hit.damage;}
    enemies=enemies.filter(e=>e.hp>0);
"""+g[b:]
 g=once(g,'return {rows,links,combos,ap,beforeAoe,aoe,piercing,pure,','return {rows,links,combos,ap,beforeAoe,aoe,piercing,pierce316:{...counts316,plan:forecast316.plan},pure,')
 g=once(g,"' · 🗡 '+(bossStageActive()?'관통 '+e.pierceDamage+' · 진체력 직격 '+(e.coreDirectDamage||0):'관통 '+e.pierceDamage)+' · ⚔ 연속타 '","' · 🗡 카드 '+(e.cardDamage||0)+' · 🔗 전달 '+(e.linkDamage||0)+' · 보스 직격 '+(e.coreDirectDamage||0)+' · ⚔ 연속타 '")
 g=once(g," → 기본 공격'+(bossStageActive()?' → 관통 (처치 후 남은 피해 전달 · 보스 진체력 직격 10%/관통)':' → 관통')", " → 기본 100% (연계 잔여 피해 전달) → 카드 70%·50%… / 적 부족 시 재분배'")
 g=g.replace("' · 관통 '+p.piercing+'회'","' · 카드 '+p.pierce316.card+'타 / 연계 전달 '+p.pierce316.link+'회'")
 g=g.replace("(TRIAL_FLAGS_313.pierce&&cardKey(c)==='lance'&&!trialPierceRefund313?1:0)","(cardKey(c)==='lance'&&!trialPierceRefund313?1:0)")
 g=once(g,"const hits=scene.events.filter(e=>e.type==='pierce');","const hits=scene.events.filter(e=>e.pierce_source==='link');")
 g=g.replace("준비한 관통 수와 실제 적중 수는 적의 HP·초과 피해에 따라 다릅니다.","연계 관통은 첫 타격의 잔여 피해만 전달합니다. 카드 관통과 보스 추가 직격의 피해 예산은 구분됩니다.")
 g=g.replace("관통 1당 일반 공격의 10%를 진체력에 직접 추가합니다.","연계 관통 1당 첫 일반 타격의 10%를 진체력에 직접 추가합니다. 카드 관통은 100%·70%·50%…로 별도 타격하며 추가 직격은 없습니다.")
 g=g.replace("보스전 일반 적 피해는 100%이며 관통이 있을 때만 처치 후 남은 피해가 다음 적·보스에게 전달됩니다.","보스전 일반 적 피해는 100%이며 연계 관통이 있을 때만 첫 타격의 남은 피해를 다음 적·보스에게 전달합니다. 카드 관통은 앞 적이 살아 있어도 뒤 적을 타격합니다.")
 g=g.replace("ev.type==='pierce'?'🗡 관통! 초과 화력이 다음 적에게!'", "ev.pierce_source==='card'?'🗡 카드 관통 '+ev.rate_percent+'%'+(ev.redistributed?' · 재분배':''):ev.type==='pierce'?'🔗 연계 관통 · 남은 피해 전달'")
 g=once(g,"changes.push({ text: '🗡 관통 +' + (c.pierce || 0) + ' (이번 전투 총 관통 ' + pierce + ')'", "changes.push({ text: '🗡 카드 관통 예약 +' + (c.pierce || 0) + ' (사용 누적 ' + pierce + ') · HP 피해는 전투에서 적용'")
 g=g.replace("'🗡 관통 준비 '+m.totalPierce+' (기존 '+m.existingPierce+' + 변환 '+m.pierceBonus+') · 피해는 지정 / 전달 / 보스 직격으로 구분합니다.'", "'🗡 관통 준비: 카드 '+(m.card||0)+'타 / 연계 전달 '+(m.link||0)+'회 · 기본 / 카드 / 연계 전달 / 보스 직격 피해를 구분합니다.'")
 g=g.replace('전투 적용 완료 · 실제 관통 ','전투 적용 완료 · 연계 전달 ')
 g=g.replace("관통 '+p.piercing+'회", "카드 '+p.pierce316.card+'타 / 연계 전달 '+p.pierce316.link+'회")
 g=g.replace("' / 🗡 관통 '+(forecast?.piercing??totalPierce())", "' / 🗡 카드 '+(forecast?.pierce316.card??pierceCounts316().card)+' / 🔗 연계 전달 '+(forecast?.pierce316.link??pierceCounts316().link)")
 g=once(g,'carried_enemies:bossEncounter.initialCarry,remaining:',"pierce_rules316:scene.pierce316||null,carried_enemies:bossEncounter.initialCarry,remaining:")
 g+='\n'+(R/'pierce-v0316.js').read_text();p.write_text(g)
 # Distinct, additive archive columns. Do not classify ordinary base damage as pierce.
 core=P/'v0220-core.js';s=core.read_text()
 s=s.replace("'🗡 관통 피해 구분: 지정 '+pierceBreakdown314.targeted_damage+' / 전달 '","'🗡 관통 피해 구분: 카드 '+pierceBreakdown314.card_damage+' / 연계 전달 '")
 s=once(s,'pierce_breakdown:pierceBreakdown314,','pierce_breakdown:pierceBreakdown314,pierce_rules:scene.pierce316||null,')
 s=once(s,'a.transfer_pierce_damage=(a.transfer_pierce_damage||0)+b.transfer_damage;','a.card_pierce_damage=(a.card_pierce_damage||0)+(b.card_damage||0);a.transfer_pierce_damage=(a.transfer_pierce_damage||0)+b.transfer_damage;')
 s=s.replace("(a.targeted_pierce_damage||0)+a.transfer_pierce_damage+a.boss_direct_pierce_damage", "(a.targeted_pierce_damage||0)+(a.card_pierce_damage||0)+a.transfer_pierce_damage+a.boss_direct_pierce_damage")
 core.write_text(s)
 history=P/'history.js';s=history.read_text();a=s.index('function pierceArchive314(s)');b=s.index('function entry(s)',a)
 s=s[:a]+"""function pierceArchive314(s){const c=s.live?.combat_summary||s.terminal?.combat_summary;if(!c)return '<p>관통 구분 통계: 이전 버전 기록에는 없음</p>';return ['official','endless'].filter(k=>c[k]?.exclusive_pierce_total!==undefined).map(k=>'<p>🗡 '+(k==='official'?'공식전':'무한모드')+' · '+(c[k].card_pierce_damage===undefined?'지정 '+(c[k].targeted_pierce_damage||0):'카드 '+c[k].card_pierce_damage)+' / 연계 전달 '+(c[k].transfer_pierce_damage||0)+' / 보스 직격 '+(c[k].boss_direct_pierce_damage||0)+' · 합계 '+c[k].exclusive_pierce_total+' (중복 제외)</p>').join('');}
"""+s[b:]
 s=s.replace('exclusive_v1; older records without exclusive_pierce_total are not measured','exclusive_v2_card_link; card_pierce_damage absent means legacy targeted split; base excluded')
 history.write_text(s)
 (P/'pierce-v0316.css').write_text('.pierce-rules316{padding:10px;margin:8px 0;border:1px solid #528ca6;border-radius:12px;background:#102431;overflow-wrap:anywhere}.pierce-rules316 p{margin:5px 0;font-size:.85rem}.pierce-rules316 small{display:block;color:#bfd3dc;font-size:.78rem}')
 names=['build_v0316.py','pierce-v0316.js'];sources={n:hashlib.sha256((R/n).read_bytes()).hexdigest() for n in names}
 meta['source_tree_dirty']=meta['source_tree_dirty'] or bool(subprocess.check_output(['git','status','--porcelain','--',*names],text=True).strip())
 meta.update(version='0.3.16-pierce.1',stage='card_strikes_link_overflow',pierce_sources=sources,experiments={'luck':'always_on','pierce':'always_on'},pierce_accounting='exclusive_v2_card_link',balance_status='tail_rates_after_third_strike_are_provisional')
 meta['build_id']='0316-'+hashlib.sha256((g+json.dumps(sources,sort_keys=True)).encode()).hexdigest()[:16];(P/'build.json').write_text(json.dumps(meta,indent=2))
 h=(P/'index.html').read_text();h=re.sub(r'window.LUCK_BUILD=\{[^<]+?\};',lambda _:'window.LUCK_BUILD='+json.dumps(meta)+';',h,count=1);h=h.replace('v0.3.15 운빨 개편','v0.3.16 관통 개편').replace('</head>','<link rel="stylesheet" href="pierce-v0316.css"></head>');(P/'index.html').write_text(h)
 return meta
if __name__=='__main__':print(json.dumps(build()))
