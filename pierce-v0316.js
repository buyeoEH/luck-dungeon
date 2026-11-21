/* Card pierce is a diminishing strike plan; link pierce alone carries overkill. */
const PIERCE_RULES316=Object.freeze({version:'card_link_v2',rates:[100,70,50],tail:'round(50 * .7^(slot-2)); provisional',redistribution:'integer_equal_to_original_front_targets',link_overflow:'first_100_percent_strike_only',boss_direct:'link_only_10_percent_per_point'});
function pierceRate316(index){return index<3?[100,70,50][index]:Math.round(50*Math.pow(.7,index-2)+1e-9);}
function pierceCounts316(ap){return {card:Math.max(0,Math.floor(pierce+handPassive('pierce'))),link:Math.max(0,Math.floor((ap||attackParts()).p1?.pierceBonus||0))};}
function piercePlan316(targets,attack,count){
 const live=targets.filter(e=>e.hp>0),n=Math.max(1,Math.floor(count)),width=Math.min(live.length,n),packets=[];
 if(!width)return packets;
 for(let slot=0;slot<n;slot++){
  const rate=pierceRate316(slot),raw=Math.max(0,Math.floor(attack*rate/100));
  if(slot<width)packets.push({target:live[slot],slot,rate_percent:rate,raw,redistributed:false,source:slot?'card':'base'});
  else for(let i=0;i<width;i++)packets.push({target:live[i],slot,rate_percent:rate,raw:Math.floor(raw/width)+(i<raw%width?1:0),redistributed:true,source:'card'});
 }
 return packets;
}
function resolvePierce316(targets,attack,cardCount,linkCount,idOf=e=>e.id){
 const plan=piercePlan316(targets,Math.max(0,attack),cardCount),events=[];let unusedBase=0,wastedCard=0;
 function hit(target,raw,packet,source){
  if(raw<=0||target.hp<=0){if(source==='card')wastedCard+=raw;return null;}
  const before=target.hp,shieldBefore=target.shield||0,coreBefore=target.coreHp??target.hp;
  const dealt=bossApplyDamage(target,raw,'strike',source==='card'?0:linkCount);
  const event={...dealt,id:idOf(target),name:target.name,before,after:target.hp,damage:dealt.damage,killed:target.hp===0,raw,rawSpent:dealt.spent,damageRate:dealt.rate,pierce_source:source,slot:packet.slot,rate_percent:packet.rate_percent,redistributed:packet.redistributed,shield_before:shieldBefore,shield_after:target.shield||0,core_before:coreBefore,core_after:target.coreHp??target.hp,type:source==='base'?'strike':'pierce',label:source==='base'?'기본 타격 100%':source==='link'?'연계 관통 · 남은 피해 전달':'카드 관통 '+packet.rate_percent+'%'+(packet.redistributed?' · 재분배':'' )};
  events.push(event);if(source==='card')wastedCard+=Math.max(0,raw-dealt.spent);return event;
 }
 for(const packet of plan){
  if(packet.source!=='base'){hit(packet.target,packet.raw,packet,'card');continue;}
  let target=packet.target,remaining=packet.raw,left=linkCount,source='base';
  while(target&&remaining>0){const ev=hit(target,remaining,packet,source);if(!ev)break;remaining=Math.max(0,remaining-ev.rawSpent);if(!ev.killed||!remaining||!left)break;left--;target=targets.find(e=>e.hp>0);source='link';}
  unusedBase=remaining;
 }
 const breakdown={base_damage:0,card_damage:0,transfer_damage:0,boss_direct_damage:0,total_damage:0};
 for(const e of events){const direct=e.corePierceDamage||0;breakdown.boss_direct_damage+=direct;breakdown[e.pierce_source==='base'?'base_damage':e.pierce_source==='card'?'card_damage':'transfer_damage']+=e.damage-direct;}
 breakdown.total_damage=breakdown.card_damage+breakdown.transfer_damage+breakdown.boss_direct_damage;
 return {events,unusedBase,wastedCard,breakdown,plan:plan.map(p=>({target_id:idOf(p.target),target:p.target.name,slot:p.slot,rate_percent:p.rate_percent,raw:p.raw,redistributed:p.redistributed,source:p.source}))};
}
function classifyPierce316(events){const b={base_damage:0,card_damage:0,transfer_damage:0,boss_direct_damage:0,targeted_damage:0,total_damage:0,definition:'exclusive_v2_card_link; base excluded; card and link-transfer exclude boss direct'};
 for(const e of events||[]){if(e.type==='aoe'||e.pure)continue;const direct=e.corePierceDamage||0;b.boss_direct_damage+=direct;b[e.pierce_source==='card'?'card_damage':e.pierce_source==='link'?'transfer_damage':'base_damage']+=Math.max(0,(e.damage||0)-direct);}
 b.total_damage=b.card_damage+b.transfer_damage+b.boss_direct_damage;return b;}
function settlePierce316(scene){if(scene.pierceBreakdown314)return scene.pierceBreakdown314;const b=classifyPierce316(scene.events);scene.pierceBreakdown314=b;
 const total=stats.pierceBreakdown314||(stats.pierceBreakdown314={base_damage:0,card_damage:0,targeted_damage:0,transfer_damage:0,boss_direct_damage:0,total_damage:0});
 for(const key of ['base_damage','card_damage','transfer_damage','boss_direct_damage'])total[key]=(total[key]||0)+b[key];total.total_damage=(total.card_damage||0)+total.transfer_damage+total.boss_direct_damage;
 feedback314.battle={...b,round,turn:bossStageActive()?bossEncounter.turn:null};renderFeedback314();return b;}
(function(){
 const capture=p1Capture;p1Capture=function(ap){return {...capture(ap),...pierceCounts316(ap)};};
 const refill=apUsed;apUsed=function(c){const out=refill.apply(this,arguments);if(cardKey(c)==='lance'&&!trialPierceRefund313&&apEnabled()){trialPierceRefund313=true;apState.points++;apEvent('pierce_first_refund',1,{id:cardKey(c)});log('🗡 첫 관통창 · 행동력 1 회복 (전투당 1회)','good');}return out;};
 pierceClassify314=classifyPierce316;pierceSettle314=settlePierce316;window.LuckCombatFeedback314.classify=classifyPierce316;window.LuckCombatFeedback314.settle=settlePierce316;
 const feedback=renderFeedback314;renderFeedback314=function(){feedback();const line=document.querySelector('.pierce-breakdown314');if(line&&feedback314.battle){const b=feedback314.battle;line.textContent='기본 '+b.base_damage+' / 카드 추가 타격 '+b.card_damage+' / 연계 전달 '+b.transfer_damage+' / 보스 직격 '+b.boss_direct_damage+' · 관통 합계 '+b.total_damage+' (기본 제외 · 중복 없음)';}
  const anchor=$('hand');if(!anchor)return;let box=$('pierceRules316');if(!box){box=node313('section',undefined,'pierce-rules316');box.id='pierceRules316';anchor.before(box);}box.hidden=!['hand','shop','battle'].includes(phase);const c=pierceCounts316();
  box.replaceChildren(node313('b','🗡 카드 관통 '+c.card+' · 🔗 연계 관통 '+c.link),node313('p','카드: 100% → 70% → 50%'+(c.card>3?' → '+Array.from({length:Math.min(c.card,7)-3},(_,i)=>pierceRate316(i+3)+'%').join(' → '):'')+' · 적이 부족하면 남은 타격을 앞의 적에게 균등 분배합니다.'),node313('small','사용형은 사용 시 예약, 패시브형은 손패 보유 시 적용. HP는 전투에서 감소합니다. 연계는 첫 타격의 남은 피해를 전달합니다.'));
 };
 window.LuckCombatFeedback314.render=renderFeedback314;
 for(const c of CARD_CATALOG_313.values())if(c.pierce){
  const parts=[];if(c.atk)parts.push('덱 공격 +'+c.atk);if(c.atkTemp)parts.push('이번 전투 공격 +'+c.atkTemp);if(c.aoe)parts.push('광역 '+c.aoe);
  parts.push((c.passive==='pierce'?'손패 보유 중':'사용 시 예약')+' 카드 관통 +'+c.pierce+' (총 수치만큼 100%·70%·50%… 타격)');
  if(c.apGain)parts.push('행동력 +'+c.apGain);if(c.p1Lance)parts.push('연계 사용 시 게이지 +8 / 관통 변환 기준 10P');if(c.type==='oneuse')parts.push('일회용·사용 후 소멸');if(c.id==='lance')parts.push('전투 첫 사용 행동력 1 회복');
  c.text=parts.join(' / ');CARD_META_313.set(c.id,Object.freeze({...CARD_META_313.get(c.id),selectionDescription:c.text,actionPointCost:apCost(c)}));
 }
 const meta=metadataText313;metadataText313=function(c){return meta(c)+(c.pierce?' · '+(c.passive==='pierce'?'패시브형: 손패 보유 필요·직접 사용 불가':'사용형: 행동력 지불 후 이번 전투 예약')+' · 새 카드 관통은 별도 지정 타격·보스 추가 직격 없음':'');};
 const buffs=getActiveBuffs;getActiveBuffs=function(){return buffs().filter(b=>b.name!=='🗡 관통 준비').concat(totalPierce()>0?[{name:'🗡 관통 구분',desc:'카드 '+pierceCounts316().card+'타 / 연계 전달 '+pierceCounts316().link+'회 · 카드 100%·70%·50%…',color:'#38bdf8'}]:[]);};
 window.LuckPierce316={rules:PIERCE_RULES316,counts:pierceCounts316,rate:pierceRate316,plan:piercePlan316,resolve:resolvePierce316,classify:classifyPierce316};
 document.addEventListener('DOMContentLoaded',renderFeedback314);
})();
