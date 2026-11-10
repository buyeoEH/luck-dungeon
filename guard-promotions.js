/* First playtest values: role-preserving compression, not a sum of materials. */
const GUARD_PROMOTIONS=[
 {id:'p_guard_sword',tier:2,branch:'보호·공격',from:{ag2:1,steel:1},cost:{res:7,gem:1},card:{id:'guard_sword',name:'수호검',type:'protection',guardPromo:true,guardPermanent:true,atk:16,protect:{attack:4},text:'영구 공격 +16 / 사용: 공격 보호 +4 · 행동력 1 · 2장 → 1장 압축'}},
 {id:'p_guard_miner',tier:1,branch:'보호·자원',from:{rg:1,big:1,mine:1},cost:{res:6},card:{id:'guard_miner',name:'수호 채굴기',type:'protection',guardPromo:true,protect:{resource:3},res:7,guardLink:'guard_economy',text:'자원 보호 +3 / 자원 +7 / 수호 채굴 조건 충족(전투당 1회) · 행동력 1 · 3장 → 1장'}},
 {id:'p_guard_vault',tier:1,branch:'보호·보석',from:{gg:1,gem:1},cost:{res:6},card:{id:'guard_vault',name:'보석 수호금고',type:'protection',guardPromo:true,protect:{gem:3},gem:3,text:'보석 보호 +3 / 보석 +3 · 행동력 1 · 2장 → 1장 압축'}},
 {id:'p_guard_cycle',tier:1,branch:'보호·드로우',from:{cg:1,hand:1},cost:{res:5},card:{id:'guard_cycle',name:'수호 순환서',type:'protection',guardPromo:true,protect:{combo:2},draw:2,guardLink:'guard_draw',text:'연계 보호 +2 / 드로우 +2 / 수호 전개 조건 충족(전투당 1회) · 행동력 1 · 2장 → 1장'}},
 {id:'p_guard_link',tier:1,branch:'보호·연계',from:{cg:1,combo:1},cost:{res:6,gem:1},card:{id:'guard_link',name:'연계 수호문장',type:'protection',guardPromo:true,protect:{combo:3},p1Gauge:12,text:'연계 보호 +3 / 원시 연계 게이지 +12 · 행동력 1 · 2장 → 1장 · 보호 스택 보너스 없음'}}
];
PROMOS.push(...GUARD_PROMOTIONS);
for(const p of GUARD_PROMOTIONS)LUCK_CARD_ICONS[p.card.id]='assets/cards/'+p.card.id+'.svg';
