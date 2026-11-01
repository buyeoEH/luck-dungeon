/* Experimental only. Daily AP budget shared by hand actions and shopping. */
const AP_MODES=['off','shop','strong','new','promo'];
const AP_MODE=(()=>{const m=window.LUCK_AP_MODE||new URLSearchParams(location.search).get('ap')||'new';return AP_MODES.includes(m)?m:'new';})();
const AP_COSTS=Object.freeze({aoe:1,chainblast:1,meteor:1,kill:1,rush:1,lance:1,drill:1,breaker:2,barrage:2,annihilation:2,d5:1,d8:2,over:1,gb:1,linkseal:1,linkpeak:1,linklance:2,legend_oracle:2,legend_cataclysm:2,legend_star:2});
let apState={points:2,round:0,events:[]};
function apEnabled(){return AP_MODE!=='off';}
function apCost(c){return apEnabled()&&AP_MODE!=='shop'?(AP_COSTS[cardKey(c)]||0):0;}
function apCanUse(c){return !apEnabled()||apState.points>=apCost(c);}
function apCatalog(){
 if(AP_MODE==='new')BASIC.push({id:'ap_supply',name:'전술 정비',price:4,limit:3,type:'actionPoint',apGain:1,text:'행동력 +1 · 사용 비용 0 · 구매한 카드는 묘지로 이동 · 연계 태그 없음'});
 if(AP_MODE==='promo')for(const p of PROMOS){const n={skill:1,foreman:2}[p.card.id];if(n){p.card.apGain=n;p.card.text+=' / 행동력 +'+n;}}
}
function apEvent(kind,amount,extra={}){if(apEnabled()){const e={round,phase,kind,amount,points:apState.points,...extra};apState.events.push(e);window.Luck220?.emit('action_points',e);}}
function apReset(){apState={points:2,round:0,events:[]};}
function apRoundStart(){if(!apEnabled()||apState.round===round)return;const unused=apState.round?apState.points:0;apState.points=2;apState.round=round;apEvent('round_start',2,{unused});}
function apSpend(n,kind,id){if(!apEnabled()||!n)return true;if(apState.points<n){apEvent('denied',n,{action:kind,id});log('⚡ 행동력 부족: 필요 '+n+' / 남음 '+apState.points);return false;}apState.points-=n;apEvent(kind,-n,{id});log('⚡ '+({purchase:'구매',promotion:'승급',card:'카드 사용'}[kind]||kind)+' 행동력 −'+n+' (남음 '+apState.points+')');return true;}
function apUsed(c){if(!apEnabled()||!c.apGain)return;apState.points+=c.apGain;apEvent('refill',c.apGain,{id:cardKey(c)});log('⚡ '+c.name+' → 행동력 +'+c.apGain+' (남음 '+apState.points+')');}
function apCardText(c){if(!apEnabled())return '';return ' · ⚡ 비용 '+apCost(c)+(c.apGain?' / 보충 +'+c.apGain:'');}
function apRender(){
 const el=document.getElementById('apHud');if(!el)return;
 const names={off:'현재판 기준',shop:'구매·승급만',strong:'강한 카드 포함',new:'신규 보충 카드',promo:'승급 보충 옵션'};
 el.textContent='🧪 행동력 검증 · '+names[AP_MODE]+(apEnabled()?' | ⚡ '+apState.points+' | 매 라운드 2 · 손패/상점 공유 · 이월 없음':' | 행동력 제한 없음');
}
window.LuckAP={mode:AP_MODE,canUse:apCanUse,cost:apCost,snapshot:()=>JSON.parse(JSON.stringify(apState)),
 observe(){if(!apEnabled())return;const blocked=hand.filter(c=>!['attack','specialAttack','curse'].includes(c.type)&&!apCanUse(c));if(phase==='hand'&&blocked.length)apEvent('blocked_hand',0,{cards:blocked.map(cardKey)});if(phase==='shop'&&apState.points<1){const offers=[...BASIC,...randomShop].filter(c=>(buyCount[c.id]||0)<c.limit&&resource>=p5Price(c));if(offers.length)apEvent('blocked_shop',0,{resource,gems,offers:offers.map(c=>c.id)});}},
 costs:AP_COSTS};
