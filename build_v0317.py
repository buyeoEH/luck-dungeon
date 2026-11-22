"""Card plan, pooled actual overkill, then followups regardless of pierce."""
from pathlib import Path
import hashlib,json,re,subprocess
import build_v0316
R=Path(__file__).resolve().parent;P=build_v0316.P;once=build_v0316.once
def build():
 meta=build_v0316.build();p=P/'game.js';g=p.read_text()
 g=once(g,'if(startPierce===0 && aoeTotal===0 && hit>=55 && deckAtk()>=35){','if(followupPlan317(hit,deckAtk(),aoeTotal).eligible){')
 g=once(g,'const extras = hit>=210 ? 4 : hit>=145 ? 3 : hit>=95 ? 2 : 1;','const extras = followupPlan317(hit,deckAtk(),aoeTotal).count;')
 g=once(g,"label:'순수 연속타 '+(k+2)+'/'+(extras+1)+' (기본 공격의 55%)'","pierce_source:'followup',phase317:'followup',followup_index:k+1,followup_count:extras,label:'연속타 '+(k+1)+'/'+extras+' (최종 공격의 55%)'")
 g=once(g,"parts.push('순수 연속타 '+(k+2)+' · '+t.name+' '+dmg);","parts.push('연속타 '+(k+1)+'/'+extras+' · '+t.name+' '+dmg);")
 g=once(g,'const pure=piercing===0&&aoe===0&&ap.final>=55&&deckAtk()>=35;','const followupsPlan317=followupPlan317(ap.final,deckAtk(),aoe),pure=followupsPlan317.eligible;let actualFollowups317=0;')
 g=once(g,'const count=ap.final>=210?4:ap.final>=145?3:ap.final>=95?2:1;','const count=followupsPlan317.count;')
 g=once(g,'e.pureDamage+=damage;if(!e.hp)enemies.shift();','e.pureDamage+=damage;actualFollowups317++;if(!e.hp)enemies.shift();')
 g=once(g,'pierce316:{...counts316,plan:forecast316.plan},pure,','pierce316:{...counts316,plan:forecast316.plan,overflow_generated:forecast316.overflow_generated,link_transfers_used:forecast316.link_transfers_used,link_pool_left:forecast316.link_pool_left},followups317:{...followupsPlan317,actual_hits:actualFollowups317,actual_damage:rows.reduce((n,e)=>n+e.pureDamage,0)},pure,')
 g=once(g,'wasted_card_raw:strike316.wastedCard};','wasted_card_raw:strike316.wastedCard,rules:PIERCE_RULES317.version,overflow_generated:strike316.overflow_generated,base_overflow:strike316.base_overflow,card_overflow:strike316.card_overflow,skipped_reserved_raw:strike316.skipped_reserved_raw,link_transfers_used:strike316.link_transfers_used,link_pool_left:strike316.link_pool_left};')
 g=once(g,'events:battleEvents,pierce316:strikeSnapshot316','events:battleEvents,pierce316:strikeSnapshot316,followups317:{...followupPlan317(scoredAttack,deckAtk(),aoeTotal),actual_hits:battleEvents.filter(e=>e.pure).length,actual_damage:battleEvents.filter(e=>e.pure).reduce((n,e)=>n+e.damage,0)}')
 g=g.replace('Only counts as this archetype when the current fight uses zero AoE and zero Pierce.','Followups require zero AoE; card/link pierce no longer disables them.')
 g=g.replace(' → 기본 100% (연계 잔여 피해 전달) → 카드 70%·50%… / 적 부족 시 재분배',' → 기본100%·카드70%·50%… → 실제 초과 피해 수집 → 연계 전달')
 g=g.replace("순수 연속타 (최대 '+p.pureLimit+'타 · 추가타마다 기본 공격의 55%)","연속타 (추가 '+p.followups317.count+'회 · 타격마다 최종 공격의 55%)")
 g=g.replace('변환 관통도 관통으로 취급하므로, 관통이 1 이상이면 순수 연속타 조건은 충족하지 않습니다.','관통이 있어도 최종 공격55·덱 공격35 이상, 광역0이면 연속타가 발동합니다.')
 g=g.replace('연계 관통은 첫 타격의 잔여 피해만 전달합니다.','연계 관통은 기본·카드 관통을 모두 처리한 후 실제 초과 피해를 모아 전달합니다.')
 g=g.replace('연계는 첫 타격의 남은 피해를 전달합니다.','기본·카드 관통의 실제 초과 피해를 모아 연계로 전달한 뒤 연속타가 이어집니다.')
 g=g.replace('연계 관통이 있을 때만 첫 타격의 남은 피해를 다음 적·보스에게 전달합니다.','연계 관통은 기본·카드 관통의 실제 초과 피해를 합산해 남은 적·보스에게 전달합니다.')
 g=g.replace('v0.3.16 카드 관통·연계 관통 분리','v0.3.17 카드 관통·연속타 공존').replace('운빨 개편 유지 · 카드 관통 100%·70%·50% / 적 부족 시 재분배 / 연계 관통은 남은 피해 전달.','광역 → 기본·카드 관통 → 초과 피해를 모아 연계 전달 → 연속타. 관통이 있어도 연속타 유지.')
 g=once(g,'pierce_rules316:scene.pierce316||null,','pierce_rules316:scene.pierce316||null,followups317:scene.followups317||null,')
 g=g.replace('순수 연속타는 별개의 55% 공격입니다.','연속타는 최종 공격55·덱 공격35 이상, 광역0일 때 관통과 함께 발동하는 별개의 55% 후속 공격입니다.')
 g=g.replace('관통 N은 초과 피해 전달입니다. 관통·광역이 없어도 일정 공격력 이상이면 독립 연속타가 발동합니다.','카드 관통은 100%·70%·50% 타격 후 초과 피해를 모아 연계로 전달합니다. 광역0·공격55·덱 공격35 이상이면 관통과 연속타가 함께 발동합니다.')
 g+='\n'+(R/'pierce-v0317.js').read_text();p.write_text(g)
 core=P/'v0220-core.js';s=core.read_text()
 s=once(s,'pierce_rules:scene.pierce316||null,','pierce_rules:scene.pierce316||null,followups:scene.followups317||null,')
 s=once(s,'a.card_pierce_damage=(a.card_pierce_damage||0)+(b.card_damage||0);','a.followup_damage=(a.followup_damage||0)+(b.followup_damage||0);a.card_pierce_damage=(a.card_pierce_damage||0)+(b.card_damage||0);')
 s=once(s,"const pierceBreakdown314=window.LuckCombatFeedback314.settle(scene);","const pierceBreakdown314=window.LuckCombatFeedback314.settle(scene);\n emit('attack_stages317',{rules:'card_link_followup_v3',stages:['aoe','base_card','link','followup'],overflow:scene.pierce316||null,followups:scene.followups317||null,damage:scene.pierceBreakdown314});")
 core.write_text(s)
 hfile=P/'history.js';s=hfile.read_text();s=s.replace("+' / 보스 직격 '+(c[k].boss_direct_pierce_damage||0)","+' / 보스 직격 '+(c[k].boss_direct_pierce_damage||0)+(c[k].followup_damage===undefined?'':' / 연속타 '+c[k].followup_damage)")
 s=s.replace('exclusive_v2_card_link; card_pierce_damage absent means legacy targeted split; base excluded','exclusive_v3_followup; pierce total excludes base and followups; missing fields mean older schema');hfile.write_text(s)
 sources={n:hashlib.sha256((R/n).read_bytes()).hexdigest() for n in ['build_v0317.py','pierce-v0317.js']}
 meta['source_tree_dirty']=meta['source_tree_dirty'] or bool(subprocess.check_output(['git','status','--porcelain','--',*sources],text=True).strip())
 meta.update(version='0.3.17-coexist.1',stage='card_then_pooled_link_then_followups',coexist_sources=sources,pierce_accounting='exclusive_v3_followup',combat_rules='aoe > base_card > pooled_link > followups; followups ignore pierce; aoe still disables followups')
 meta['build_id']='0317-'+hashlib.sha256((g+json.dumps(sources,sort_keys=True)).encode()).hexdigest()[:16];(P/'build.json').write_text(json.dumps(meta,indent=2))
 h=(P/'index.html').read_text();h=re.sub(r'window.LUCK_BUILD=\{[^<]+?\};',lambda _:'window.LUCK_BUILD='+json.dumps(meta)+';',h,count=1);h=h.replace('v0.3.16 관통 개편','v0.3.17 관통·연속타 공존');(P/'index.html').write_text(h)
 return meta
if __name__=='__main__':print(json.dumps(build()))
