/* v0.3.15: three independent stages. All numbers are playtest starting values. */
const LUCK_TIERS_315=Object.freeze([
 {name:'저가형',use:[45,30,25],destroy:[2,40,18,18,12,10],scale:1,turns:0},
 {name:'중저가형',use:[50,25,25],destroy:[4,30,18,20,14,14],scale:2,turns:0},
 {name:'중고가형',use:[52,20,28],destroy:[7,20,18,22,17,16],scale:3,turns:2},
 {name:'고가형',use:[55,15,30],destroy:[12,12,18,22,18,18],scale:4,turns:3}
]);
const LUCK_CARDS_315=Object.freeze({
 spark:{tier:0,break:4},coin:{tier:1,break:6},dice:{tier:2,break:8},potion:{tier:2,break:10},box:{tier:3,break:14},
 luckcharm:{tier:2,break:8},luckfate:{tier:3,break:10},
 fateblade:{tier:2,break:6,family:'attack',effect:'attack',values:[12,4,-6],fixed:'공격 +13'},
 luckminer:{tier:2,break:6,family:'resource',effect:'resource',values:[7,4,1]},
 luckdraw:{tier:2,break:6,family:'draw',effect:'draw',values:[5,2,0]},
 luckguard:{tier:2,break:6,family:'guard',effect:'guard',values:[3,1,0]},
 lucklink:{tier:3,break:8,family:'link',effect:'link',values:[24,10,-8],fixed:'공격 +18 · 연계 증폭 +5'},
 luckforge:{tier:3,break:8,family:'resource',effect:'resource',values:[10,5,1],fixed:'공격 +17'}
});
const LUCK_MUTATIONS_315=Object.freeze({mine:'resource',chain:'draw',gem:'resource',sam:'attack',gold:'resource',hand:'draw'});
const LUCK_FAMILY_315=Object.freeze({attack:'공격',resource:'경제',draw:'드로우',guard:'보호',link:'연계',all:'종합'});
const LUCK_DESTROY_315=['레전드 파괴','단순 파괴','불운 파괴','카드 획득 파괴','큰 영향 파괴','변이 파괴'];
const LUCK_NORMAL_315={attack:['sam','combo','master','aoe','lance'],resource:['big','gem','gold'],draw:['hand','chain','d5'],guard:['ag','rg','gg','cg','allg'],link:['sam','combo','master']};
const LUCK_LEGENDS_315=[
 {id:'legend_warlord315',name:'천운의 패왕검',family315:'attack',atk:180,legendStart315:{attack:60,pierce:3,guard:3},legendUse315:{attack:80,aoe:40}},
 {id:'legend_treasury315',name:'무한 황금고',family315:'resource',atk:180,legendStart315:{resource:18,gem:4,ap:2,discount:3},legendUse315:{resource:20,gem:6}},
 {id:'legend_archive315',name:'운명의 무한서고',family315:'draw',atk:150,legendStart315:{draw:3,ap:2},legendUse315:{draw:8,resource:10}},
 {id:'legend_aegis315',name:'절대 행운의 방벽',family315:'guard',atk:160,legendStart315:{guard:8,ap:1},legendUse315:{guard:8,attack:70}},
 {id:'legend_chain315',name:'운명 연결의 심장',family315:'link',atk:130,linkAmp:20,legendStart315:{link:40,ap:2},legendUse315:{link:60,pierce:3,attack:50}}
].map(c=>({...c,type:'luckLegend315',rarity:'legend',refund315:40,text:'🌈 LEGEND · 덱 공격 +'+c.atk+' / 보유 중 매 전투 '+effectText315(c.legendStart315)+' / 사용: '+effectText315(c.legendUse315)+' / 행동력 1 · 자동 승리 아님'}));
let luckState315;
let mutationApplied315=new Set();
function resetLuck315(){mutationApplied315=new Set();luckState315={future:[],results:[],mutations:0,destroyed:0,legends:0};}
resetLuck315();
function luckEmit315(type,payload){window.Luck220?.emit(type,{rules:'luck315',combat_no:bossCombatNo,...payload});}
function weighted315(weights,roll=Math.random()*100){let sum=0;for(let i=0;i<weights.length;i++){sum+=weights[i];if(roll<sum)return i;}return weights.length-1;}
function pick315(list){return list[Math.floor(Math.random()*list.length)];}
function luckTable315(c){const spec=LUCK_CARDS_315[cardKey(c)];if(!spec)return null;const [g,n,b]=spec.family?[50,35,15]:LUCK_TIERS_315[spec.tier].use;
 const strength=Math.min(6,Math.max(0,trialState313.tempLuck+trialState313.runLuck)),shift=Math.min(b-15,strength*3);
 return {good:g+shift,neutral:n,bad:b-shift,strength,minimumBad:15,separateDestruction:true,destruction:spec.break};}
function effectText315(e){const labels={attack:'이번 전투 공격',resource:'자원',gem:'보석',draw:'드로우',link:'연계포인트',guard:'전체 보호',pierce:'관통',aoe:'광역 피해',ap:'행동력',discount:'상점 할인'};return Object.entries(e).map(([k,n])=>(labels[k]||k)+' '+(n>=0?'+':'')+n).join(' · ');}
function applyEffect315(e,changes){const actual={};for(const [k,n]of Object.entries(e)){
 if(k==='attack'){tempAttack+=n;actual[k]=n;}
 else if(k==='resource'){const v=n>=0?gain('resource',n):-Math.min(resource,-n);resource+=v;actual[k]=v;}
 else if(k==='gem'){const v=n>=0?Math.max(0,gain('gem',n)):-Math.min(gems,-n);if(v>=0)addGems(v);else gems+=v;actual[k]=v;}
 else if(k==='draw'){actual[k]=drawCards(Math.max(0,n));}
 else if(k==='link'){p1Round.gaugeBonus+=n;actual[k]=n;}
 else if(k==='guard'){const v=n>=0?n:-Math.min(prot.all,-n);prot.all+=v;actual[k]=v;}
 else if(k==='pierce'){const v=n>=0?n:-Math.min(pierce,-n);pierce+=v;actual[k]=v;}
 else if(k==='aoe'){const v=n>=0?n:-Math.min(aoeAttack,-n);aoeAttack+=v;actual[k]=v;}
 else if(k==='ap'){const v=n>=0?n:-Math.min(apState.points,-n);if(apEnabled()){apState.points+=v;apEvent('luck_effect',v);}actual[k]=apEnabled()?v:0;}
 }
 changes.push(effectText315(actual)||'변화 없음');return actual;}
function usagePool315(tier,good){const s=LUCK_TIERS_315[tier].scale;
 if(good){const pool=[{attack:5*s},{resource:3*s},{link:6*s},{draw:s}];if(tier>=2)pool.push({gem:s},{pierce:tier-1,attack:4*s},{aoe:6*s},{guard:tier-1});if(tier===3)pool.push({attack:24,pierce:2},{resource:14,gem:3},{draw:4,guard:2},{aoe:24,link:18});return pool;}
 const pool=[{attack:-3*s},{resource:-2*s},{link:-4*s}];if(tier>=2)pool.push({gem:-s},{guard:-(tier-1)},{curse:1});if(tier===3)pool.push({attack:-10,resource:-5},{gem:-2,link:-10});return pool;
}
function grantNormal315(family,changes){const ids=family&&LUCK_NORMAL_315[family];const pool=ids?ids.map(id=>CARD_CATALOG_313.get(id)).filter(Boolean):[...BASIC,...RANDOM_POOL.filter(c=>c.type!=='random'&&c.type!=='luckStrength')];const src=pick315(pool);const c=cp(src);addNewCard(c);changes.push('일반 카드 ['+c.name+'] 획득');return {card_id:cardKey(c),instance_id:c.id,family:family||'all'};}
function grantLegend315(family,changes){const src=pick315(LUCK_LEGENDS_315.filter(c=>!family||c.family315===family));const c=cp(src);addNewCard(c);luckState315.legends++;changes.push('🌈 레전드 ['+c.name+'] 획득 · '+c.text);return {card_id:cardKey(c),instance_id:c.id,family:src.family315};}
function mutationTargets315(family){const eligible={attack:['sam'],resource:['mine','gem','gold'],draw:['chain','hand'],link:['sam'],guard:[]};const ids=family?eligible[family]:Object.keys(LUCK_MUTATIONS_315);return deck.filter(c=>ids.includes(cardKey(c))&&!c.mutation315);}
function mutate315(spec,changes){const candidates=mutationTargets315(spec.family);if(!candidates.length)return {fallback:true,...grantNormal315(spec.family,changes)};
 const c=pick315(candidates),key=cardKey(c),high=spec.tier===3,s=high?2:1,boost={mine:{res:3*s},chain:{res:2*s,draw:1},gem:{gem:2*s},sam:{atk:8*s},gold:{atk:6*s,res:3*s},hand:{res:2*s,draw:1}}[key];
 for(const [k,n]of Object.entries(boost))c[k]=(c[k]||0)+n;
 if(key==='sam'){c.combo={...c.combo,bonus:(c.combo?.bonus||0)+10*s};boost.combo=10*s;}
 const extra=high?({mine:{gem:1},chain:{guard:1},gem:{guard:1},sam:{link:8},gold:{gem:1},hand:{guard:1}}[key]):{};
 c.mutation315={original:key,tier:spec.tier,boost:{...boost},extra:{...extra},combat:bossCombatNo};c.text=(c.text||'')+' / 🧬 변이: '+Object.entries(boost).map(([k,v])=>({res:'자원',draw:'드로우',gem:'보석',atk:'덱 공격',combo:'3장 연격 보너스'}[k]||k)+' +'+v).join(' · ')+(Object.keys(extra).length?' / 전투당 첫 손패 등장 시 '+effectText315(extra):'');
 luckState315.mutations++;changes.push('🧬 ['+c.name+'] 변이 · 원본 '+(CARD_NAME[key]||c.name)+' 유지 · '+c.text);return {instance_id:c.id,card_id:key,mutation:structuredClone(c.mutation315),fallback:false};}
function major315(spec,changes){const good=Math.random()<.7,s=LUCK_TIERS_315[spec.tier].scale,f=spec.family;
 const goodEffects={attack:{attack:15*s,pierce:1},resource:{resource:8*s,gem:s},draw:{draw:2+s,ap:1},guard:{guard:2+s,attack:5*s},link:{link:16*s,pierce:1},all:{attack:10*s,resource:5*s,guard:s}};
 const badEffects={attack:{attack:-6*s},resource:{resource:-4*s,gem:-s},draw:{resource:-3*s},guard:{guard:-s,attack:-3*s},link:{link:-10*s},all:{attack:-5*s,resource:-3*s}};
 const effects=(good?goodEffects:badEffects)[f||'all'],actual=applyEffect315(effects,changes),turns=LUCK_TIERS_315[spec.tier].turns;
 // A draw-family risk never lowers a future starting hand. Discount/markup applies to every purchase.
 const futureEffects=good&&f==='draw'?{draw:2,ap:1}:effects;
 const priceDelta=f==='resource'||!f?(good?-s:s):f==='draw'&&!good?s:0;
 if(turns){const future={effects:futureEffects,priceDelta,good,family:f||'all',created:bossCombatNo,remaining:turns};luckState315.future.push(future);changes.push('다음 '+turns+'전투에도 '+effectText315(futureEffects)+(priceDelta?' / 상점 가격 '+(priceDelta>0?'+':'')+priceDelta:''));}
 return {good,benefit_probability:70,risk_probability:30,family:f||'all',actual,next_combats:turns,price_delta:priceDelta};}
function resolveLuck315(c){const spec=LUCK_CARDS_315[cardKey(c)];if(!spec)return false;const table=luckTable315(c),changes=[],usageRoll=Math.random()*100,index=weighted315([table.good,table.neutral,table.bad],usageRoll),outcome=['good','neutral','bad'][index];let effect={};
 if(spec.family)effect={[spec.effect]:spec.values[index]};else if(index!==1)effect=pick315(usagePool315(spec.tier,index===0));
 let usageActual;
 if(effect.curse){grantCurse(changes);usageActual={curse:1};}else usageActual=applyEffect315(effect,changes);
 const usageChanges=changes.slice();registerActionLink(c,changes);trialState313.luckEvents++;
 luckEmit315('luck_usage_result',{card_id:cardKey(c),instance_id:c.id,tier:spec.tier,family:spec.family||'all',outcome,roll:usageRoll,probabilities:table,effect,actual:usageActual});
 const destructionRoll=Math.random()*100,destroyed=destructionRoll<spec.break;let result=null;
 luckEmit315('luck_destruction_roll',{card_id:cardKey(c),instance_id:c.id,roll:destructionRoll,probability:spec.break,destroyed,luck_applies:false});
 if(destroyed){destroyRandomCard(c);luckState315.destroyed++;const roll=Math.random()*100,kind=weighted315(LUCK_TIERS_315[spec.tier].destroy,roll);let detail={};
 changes.push('🔥 ['+c.name+'] 사용 인스턴스 영구 파괴 · 이미 적용한 사용 효과 유지');
 if(kind===0)detail=grantLegend315(spec.family,changes);
 else if(kind===1)changes.push('추가 결과 없이 파괴');
 else if(kind===2){grantCurse(changes);detail={curse:true};}
 else if(kind===3)detail=grantNormal315(spec.family,changes);
 else if(kind===4)detail=major315(spec,changes);
 else detail=mutate315(spec,changes);
 result={kind,label:LUCK_DESTROY_315[kind],roll,weights:LUCK_TIERS_315[spec.tier].destroy,detail};
 luckEmit315('luck_destruction_result',{card_id:cardKey(c),instance_id:c.id,tier:spec.tier,family:spec.family||'all',...result});
 }
 const record={card_id:cardKey(c),instance_id:c.id,outcome,usage:usageActual,destroyed,result};luckState315.results.push(record);
 log('🎲 '+c.name+' → '+['행운','변화 없음·보통','불운'][index]+' · '+changes.map(x=>typeof x==='string'?x:x.text).join(' / '),index===2?true:'good');
 render();if(isVisualMode()&&!dangerActive){const host=tacticModal(c.name+' · 운빨 판정');host.append(node313('h3','① 사용 효과: '+['행운','변화 없음·보통','불운'][index]));for(const text of usageChanges)host.append(node313('p',text));host.append(node313('h3','② 별도 파괴 판정: '+(destroyed?'파괴':'생존')+' ('+spec.break+'%)'));host.append(node313('p','행운력은 사용 효과 확률에만 적용합니다. 적용된 사용 효과는 파괴 후에도 유지합니다.'));if(result){host.append(node313('h3','③ '+result.label));for(const x of changes.slice(usageChanges.length))host.append(node313('p',typeof x==='string'?x:x.text));}tacticButton(host,'확인',handleModalClose);}
 return true;}
function luckText315(c){const spec=LUCK_CARDS_315[cardKey(c)];if(!spec)return c.text;const tier=LUCK_TIERS_315[spec.tier],table={good:(spec.family?[50,35,15]:tier.use)[0],neutral:(spec.family?[50,35,15]:tier.use)[1],bad:(spec.family?[50,35,15]:tier.use)[2]},family=LUCK_FAMILY_315[spec.family||'all'];return (spec.fixed?spec.fixed+' / ':'')+family+' '+tier.name+' · '+(spec.family?spec.values.map(n=>effectText315({[spec.effect]:n})).join(' / '):'행운·불운 효과 목록에서 1개 추첨 / 변화 없음은 효과 없음')+' / 기본 사용 효과 '+table.good+'%·'+table.neutral+'%·'+table.bad+'% / 별도 파괴 '+spec.break+'% / 사용당 변이 '+(spec.break*tier.destroy[5]/100).toFixed(2)+'% · 레전드 '+(spec.break*tier.destroy[0]/100).toFixed(2)+'%';}
function megaReshuffle315(){const live=new Map(deck.map(c=>[c.id,c])),seen=new Set();const pool=[...draw,...graveyard].filter(c=>live.has(c.id)&&!seen.has(c.id)&&seen.add(c.id)).map(c=>live.get(c.id));draw=shuffle(pool);graveyard=[];luckEmit315('boss_mega_reshuffle',{draw_count:draw.length,instance_ids:draw.map(c=>c.id),start_hand:8,start_ap:3});log('🔥 폭발의 기회 · 첫 드로우 전 드로우 더미와 묘지 전체 리셔플 ('+draw.length+'장)','good');}
function prepareCombatLuck315(){mutationApplied315=new Set();luckState315.future=luckState315.future.filter(f=>f.remaining>0||f.active===bossCombatNo);for(const f of luckState315.future)if(f.created<bossCombatNo&&f.remaining>0&&f.active!==bossCombatNo){f.active=bossCombatNo;f.remaining--;}}
function applyCombatLuck315(){const changes=[];for(const f of luckState315.future)if(f.active===bossCombatNo){const actual=applyEffect315(f.effects,changes);luckEmit315('luck_major_tick',{family:f.family,good:f.good,remaining:f.remaining,actual});}
 for(const c of deck){if(c.legendStart315){applyEffect315(c.legendStart315,changes);luckEmit315('luck_legend_combat',{instance_id:c.id,card_id:cardKey(c),effects:c.legendStart315});}}
 applyMutationHand315(changes);
 if(changes.length)log('🍀 전투 시작 보너스 · '+changes.join(' / '),'good');}
function applyMutationHand315(changes){for(const c of hand)if(c.mutation315&&!mutationApplied315.has(c.id)&&Object.keys(c.mutation315.extra).length){mutationApplied315.add(c.id);applyEffect315(c.mutation315.extra,changes);luckEmit315('luck_mutation_hand',{instance_id:c.id,extra:c.mutation315.extra});}}
(function(){
 // Replace old opt-in usage rules for this release; targeting experiment remains independent.
 luckTable313=luckTable315;trialLuckText313=luckText315;window.LuckTrials313.luckTable=luckTable315;
 random=function(c){return resolveLuck315(c);};
 for(const c of LUCK_LEGENDS_315){LEGEND_POOL.push(c);CARD_CATALOG_313.set(c.id,c);CARD_NAME[c.id]=c.name;LUCK_CARD_ICONS[c.id]=LUCK_CARD_ICONS[{attack:'legend_cataclysm',resource:'legend_fortune',draw:'legend_oracle',guard:'legend_star',link:'lucklink'}[c.family315]];}
 for(const c of CARD_CATALOG_313.values()){if(LUCK_CARDS_315[c.id])c.text=luckText315(c);CARD_META_313.set(c.id,Object.freeze({...CARD_META_313.get(c.id),refundValue:c.refund315??CARD_META_313.get(c.id)?.refundValue,selectionDescription:c.text,actionPointCost:apCost(c),luckTable:luckTable315(c)}));}
 const strategy=strategyText;strategyText=function(c){return LUCK_CARDS_315[cardKey(c)]?luckText315(c):strategy(c);};
 const metadata=metadataText313;metadataText313=function(c){const s=LUCK_CARDS_315[cardKey(c)];return metadata(c)+(s?' · '+luckText315(c):'')+(c.mutation315?' · 🧬 원본 유지 / 이번 런 1회 변이 / 승급 시 미계승 · '+c.text:'');};
 const detail=detail313;detail313=function(c,host){const box=detail(c,host),s=LUCK_CARDS_315[cardKey(c)];if(s){if(!s.family){for(const [label,good]of [['행운 목록',true],['불운 목록',false]])box.append(node313('p',label+': '+usagePool315(s.tier,good).map(e=>e.curse?'불운 카드 1장 획득':effectText315(e)).join(' / ')));}box.append(node313('p','파괴된 경우에만: '+LUCK_DESTROY_315.map((label,i)=>label+' '+LUCK_TIERS_315[s.tier].destroy[i]+'%').join(' / ')));box.append(node313('p','레전드·일반 카드·큰 영향·변이는 '+LUCK_FAMILY_315[s.family||'all']+' 계열. 변이 대상이 없으면 같은 계열 일반 카드로 대체합니다. 큰 영향: 혜택 70% / 위험 30%.'));}return box;};
 const draw0=drawCards;drawCards=function(){const out=draw0.apply(this,arguments);if(phase==='hand'){const changes=[];applyMutationHand315(changes);if(changes.length)log('🧬 변이 손패 효과 · '+changes.join(' / '),'good');}return out;};
 const oldCost=apCost;apCost=function(c){if(c?.type==='luckLegend315')return apEnabled()?1:0;if(LUCK_CARDS_315[cardKey(c||{})])return apEnabled()?cardKey(c)==='spark'?0:cardKey(c)==='luckfate'?2:1:0;return oldCost(c);};
 const start0=start;start=function(){resetLuck315();const out=start0.apply(this,arguments);stats.luck315=luckState315;return out;};
 const price0=p5Price;p5Price=function(c){let n=price0(c);if(phase==='shop'){for(const f of luckState315.future)if(f.active===bossCombatNo)n+=f.priceDelta||0;for(const card of deck)n-=card.legendStart315?.discount||0;}return Math.max(1,n);};
 const combos0=evalCombos;evalCombos=function(){const out=combos0.apply(this,arguments);const sam=out.find(x=>x.name===CARD_NAME.sam&&x.kind==='same');if(sam)sam.bonus=CARD_CATALOG_313.get('sam').combo.bonus+hand.filter(c=>cardKey(c)==='sam').reduce((n,c)=>n+(c.mutation315?.boost.combo||0),0);return out;};
 const category=cardCategory;cardCategory=function(c){return c.type==='luckLegend315'?'레전드 · '+LUCK_FAMILY_315[c.family315]:category(c);};
 const hud0=apRender;apRender=function(){const out=hud0.apply(this,arguments);const el=$('apHud');if(el){const active=luckState315.future.filter(f=>f.active===bossCombatNo||f.remaining>0);if(active.length)el.textContent+=' · 지속 사건 '+active.map(f=>(f.good?'혜택':'위험')+' '+LUCK_FAMILY_315[f.family]+' / 남은 '+f.remaining+'전투').join(' · ');}return out;};
 window.Luck315={cards:LUCK_CARDS_315,tiers:LUCK_TIERS_315,legends:LUCK_LEGENDS_315,table:luckTable315,resolve:resolveLuck315,snapshot:()=>structuredClone(luckState315),mutations:mutationTargets315};
})();
