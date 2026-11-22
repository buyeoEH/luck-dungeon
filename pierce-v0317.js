/* v0.3.17: fixed card plan -> pooled actual overflow -> independent followups. */
const PIERCE_RULES317=Object.freeze({...PIERCE_RULES316,version:'card_link_followup_v3',order:['aoe','base_card','link','followup'],link_overflow:'pooled_actual_overkill_from_base_and_card; skipped_reservations_excluded',followup:'attack>=55 && deckAttack>=35 && aoe===0; ignore pierce; no recursive carry'});
function followupPlan317(attack,deckAttack,aoe){const eligible=attack>=55&&deckAttack>=35&&aoe===0;return {eligible,count:eligible?(attack>=210?4:attack>=145?3:attack>=95?2:1):0,per_hit:eligible?Math.max(1,Math.floor(attack*.55)):0,blocked:aoe>0?'aoe':attack<55?'attack_below_55':deckAttack<35?'deck_attack_below_35':null};}
function resolvePierce317(targets,attack,cardCount,linkCount,idOf=e=>e.id){
 const plan=piercePlan316(targets,Math.max(0,attack),cardCount),events=[];let pool=0,skippedRaw=0,baseOverflow=0,cardOverflow=0,transfersUsed=0;
 function hit(target,raw,packet,source){
  if(raw<=0||target.hp<=0){if(source==='card')skippedRaw+=raw;return null;}
  const before=target.hp,shieldBefore=target.shield||0,coreBefore=target.coreHp??target.hp;
  const dealt=bossApplyDamage(target,raw,'strike',source==='card'?0:linkCount);
  const overflow=target.hp===0?Math.max(0,raw-dealt.spent):0;
  const event={...dealt,id:idOf(target),name:target.name,before,after:target.hp,damage:dealt.damage,killed:target.hp===0,raw,rawSpent:dealt.spent,raw_overflow:overflow,damageRate:dealt.rate,pierce_source:source,phase317:source==='link'?'link':'base_card',slot:packet.slot,rate_percent:packet.rate_percent,redistributed:packet.redistributed,shield_before:shieldBefore,shield_after:target.shield||0,core_before:coreBefore,core_after:target.coreHp??target.hp,type:source==='base'?'strike':'pierce',label:source==='base'?'기본 공격 100%':source==='link'?'연계 관통 '+transfersUsed+'/'+linkCount:'관통 '+packet.rate_percent+'%'+(packet.redistributed?' · 재분배':'')};
  events.push(event);return event;
 }
 // Do not retarget, and do not collect raw from a reservation whose target is dead.
 for(const packet of plan){const ev=hit(packet.target,packet.raw,packet,packet.source);if(ev){pool+=ev.raw_overflow;if(packet.source==='base')baseOverflow+=ev.raw_overflow;else cardOverflow+=ev.raw_overflow;}}
 const generated=pool;
 while(pool>0&&transfersUsed<linkCount){const target=targets.find(e=>e.hp>0);if(!target)break;transfersUsed++;const ev=hit(target,pool,{slot:null,rate_percent:null,redistributed:false},'link');if(!ev)break;pool=ev.raw_overflow;}
 const breakdown={base_damage:0,card_damage:0,transfer_damage:0,boss_direct_damage:0,total_damage:0};
 for(const e of events){const direct=e.corePierceDamage||0;breakdown.boss_direct_damage+=direct;breakdown[e.pierce_source==='base'?'base_damage':e.pierce_source==='card'?'card_damage':'transfer_damage']+=e.damage-direct;}
 breakdown.total_damage=breakdown.card_damage+breakdown.transfer_damage+breakdown.boss_direct_damage;
 return {events,unusedBase:pool,wastedCard:skippedRaw,overflow_generated:generated,base_overflow:baseOverflow,card_overflow:cardOverflow,skipped_reserved_raw:skippedRaw,link_transfers_used:transfersUsed,link_pool_left:pool,breakdown,plan:plan.map(p=>({target_id:idOf(p.target),target:p.target.name,slot:p.slot,rate_percent:p.rate_percent,raw:p.raw,redistributed:p.redistributed,source:p.source}))};
}
function classifyPierce317(events){const b={base_damage:0,card_damage:0,transfer_damage:0,boss_direct_damage:0,followup_damage:0,targeted_damage:0,total_damage:0,definition:'exclusive_v3_followup; pierce total excludes base and followups'};
 for(const e of events||[]){if(e.type==='aoe')continue;if(e.pure||e.pierce_source==='followup'){b.followup_damage+=e.damage||0;continue;}const direct=e.corePierceDamage||0;b.boss_direct_damage+=direct;b[e.pierce_source==='card'?'card_damage':e.pierce_source==='link'?'transfer_damage':'base_damage']+=Math.max(0,(e.damage||0)-direct);}
 b.total_damage=b.card_damage+b.transfer_damage+b.boss_direct_damage;b.non_aoe_damage=b.base_damage+b.total_damage+b.followup_damage;return b;}
(function(){
 resolvePierce316=resolvePierce317;classifyPierce316=classifyPierce317;pierceClassify314=classifyPierce317;
 window.LuckPierce316.resolve=resolvePierce317;window.LuckPierce316.classify=classifyPierce317;window.LuckPierce316.rules=PIERCE_RULES317;window.LuckCombatFeedback314.classify=classifyPierce317;
 const settle=window.LuckCombatFeedback314.settle;function settle317(scene){if(scene.pierceBreakdown314)return scene.pierceBreakdown314;const b=settle(scene);stats.pierceBreakdown314.followup_damage=(stats.pierceBreakdown314.followup_damage||0)+b.followup_damage;return b;}
 window.LuckCombatFeedback314.settle=settle317;pierceSettle314=settle317;
 const render0=renderBattlePreparation;renderBattlePreparation=function(){const out=render0.apply(this,arguments);if(phase!=='battle')return out;const host=$('battleStage');if(!host)return out;const p=battlePreparationPlan(),cards=p.pierce316.plan.filter(x=>x.source==='card'),section=node313('section',undefined,'prep-breakdown');section.id='attackStages317';section.setAttribute('aria-label','공격 단계별 예상 피해');
  section.append(node313('b','공격 단계별 예상'),node313('p','기본 공격 '+(p.hasStrike?p.ap.final:0)+' (100% · 한 번만 계산)'),node313('p','카드 관통 '+(cards.length?cards.map(c=>c.raw+' ('+c.rate_percent+'%'+(c.redistributed?' 재분배':'')+')').join(' · '):'추가 타격 없음 · 관통 2부터 70% 추가')),
  node313('p','연계 관통 최대 '+p.pierce316.link+'회 · 실제 초과 피해 '+p.pierce316.overflow_generated+' 수집 → 예상 전달 '+p.pierce316.link_transfers_used+'회'),
  node313('p','연속타 '+(p.followups317.eligible?p.followups317.per_hit+' × '+p.followups317.count+'회 · 대상이 남아 있을 때':'발동 안 함 ('+({aoe:'광역 피해 있음',attack_below_55:'최종 공격 55 미만',deck_attack_below_35:'덱 공격 35 미만'}[p.followups317.blocked]||'조건 미충족')+')')),
  node313('small','광역 → 기본·카드 관통 → 연계 관통 → 연속타. 타격 숫자는 원시 예산이며 실제 피해는 HP까지만 적용합니다. 죽은 대상의 예약과 연속타 초과 피해는 재전달하지 않습니다.'));host.querySelector('.prep-summary')?.after(section);return out;};
 const feedback=renderFeedback314;renderFeedback314=function(){feedback();const line=document.querySelector('.pierce-breakdown314');if(line&&feedback314.battle){const b=feedback314.battle;line.textContent='기본 '+b.base_damage+' / 카드 추가 '+b.card_damage+' / 연계 전달 '+b.transfer_damage+' / 보스 직격 '+b.boss_direct_damage+' / 연속타 '+b.followup_damage+' · 관통 합계 '+b.total_damage+' (기본·연속타 제외)';}const box=$('pierceRules316');if(box){const small=box.querySelector('small');if(small)small.textContent='사용형은 사용 시 예약, 패시브형은 손패 보유 시 적용. HP는 전투에서 감소합니다. 관통 2부터 추가 타격. 관통이 있어도 연속타 유지.';}};
 window.LuckCombatFeedback314.render=renderFeedback314;
 for(const c of CARD_CATALOG_313.values())if(c.pierce){c.text+=' / 관통 2부터 추가 타격 / 관통 보유 시에도 연속타 유지';CARD_META_313.set(c.id,Object.freeze({...CARD_META_313.get(c.id),selectionDescription:c.text}));}
 window.LuckPierce317={rules:PIERCE_RULES317,resolve:resolvePierce317,followups:followupPlan317,classify:classifyPierce317};
})();
