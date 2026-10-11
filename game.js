const BASIC = [
  { id: 'sam', name: '삼연격', price: 5, type: 'attack', atk: 5, text: '공격 +5 / 같은 카드 3장 콤보 +10', limit: 9, combo: { kind: 'same', need: 3, bonus: 10 } },
  { id: 'hand', name: '손재주', price: 5, type: 'draw', res: 1, draw: 1, text: '자원 +1 / 드로우 +1', limit: 8 },
  { id: 'chain', name: '연속채굴', price: 9, type: 'draw', res: 2, draw: 2, text: '자원 +2 / 드로우 +2', limit: 6 },
  { id: 'big', name: '대형채굴', price: 6, type: 'resource', res: 4, text: '자원 +4', limit: 6 },
  { id: 'gem', name: '보석광산', price: 8, type: 'gem', gem: 2, text: '💎 +2', limit: 6 },
  { id: 'gold', name: '황금검', price: 13, type: 'specialAttack', atk: 5, res: 2, passive: 'res', text: '공격 +5 / 손패 등장 시 자원 +2', limit: 3 }
];

const RANDOM_POOL = [
  { id: 'aoe', name: '전체 폭격', price: 18, type: 'aoeAttack', atk: 12, text: '💥 쌓여 있는 모든 적에게 각각 12 피해', limit: 2 },
  { id: 'erase', name: '망각의 서', price: 13, type: 'remove', text: '덱에서 카드 1장 영구 제거', limit: 2 },
  { id: 'ag', name: '전사의 갑주', price: 10, type: 'protection', protect: { attack: 2 }, res: 2, text: '⚔️ 공격 보호 +2 / 자원 +2', limit: 3 },
  { id: 'ag2', name: '수호기사 갑주', price: 17, type: 'protection', protect: { attack: 4 }, atk: 3, text: '⚔ 공격 보호 +4 / 공격 +3', limit: 2 },
  { id: 'rg', name: '풍요의 부적', price: 10, type: 'protection', protect: { resource: 2 }, res: 3, text: '🔋 자원 보호 +2 / 자원 +3', limit: 3 },
  { id: 'gg', name: '보석 수호석', price: 12, type: 'protection', protect: { gem: 2 }, gem: 2, text: '💎 보석 보호 +2 / 보석 +2', limit: 3 },
  { id: 'cg', name: '집중의 문장', price: 12, type: 'protection', protect: { combo: 2 }, draw: 1, text: '🔒 콤보 보호 +2 / 드로우 +1', limit: 3 },
  { id: 'allg', name: '만능 수호석', price: 22, type: 'protection', protect: { all: 2 }, res: 2, atk: 2, text: '🛡 전체 보호 +2 / 자원 +2 / 공격 +2', limit: 1 },
  { id: 'bd', name: '검의 부름', price: 9, type: 'drawFilter', draw: 2, filter: 'attack', text: '공격카드만 2장 드로우', limit: 3 },
  { id: 'rd', name: '채굴의 부름', price: 9, type: 'drawFilter', draw: 3, filter: 'resource', text: '자원계열만 3장 드로우', limit: 3 },
  { id: 'd5', name: '폭풍의 손', price: 14, type: 'draw', draw: 5, text: '드로우 +5', limit: 2 },
  { id: 'd8', name: '운명의 책', price: 19, type: 'draw', draw: 8, text: '드로우 +8', limit: 1 },
  { id: 'ad', name: '전투 서적', price: 14, type: 'specialAttack', atk: 4, draw: 2, passive: 'draw', text: '공격 +4 / 손패 등장 시 드로우 +2', limit: 2 },
  { id: 'kill', name: '필살의 일격', price: 8, type: 'oneuse', atkTemp: 25, text: '이번 전투 공격 +25 / 일회용(소멸)', limit: 2 },
  { id: 'over', name: '과충전', price: 6, type: 'oneuse', res: 14, text: '자원 +14 / 일회용(소멸)', limit: 2 },
  { id: 'gb', name: '보석 폭발', price: 7, type: 'oneuse', gem: 8, text: '💎 +8 / 일회용(소멸)', limit: 2 },
  { id: 'meteor', name: '유성 낙하', price: 9, type: 'oneuse', aoe: 20, text: '💥 모든 적에게 20 피해 / 일회용(소멸)', limit: 2 },
  { id: 'rush', name: '돌파의 일격', price: 8, type: 'oneuse', atkTemp: 12, pierce: 2, text: '이번 전투 공격 +12 / 관통 2회(처치 후 초과 피해를 다음 적에게 최대 2회 전달) / 일회용(소멸)', limit: 2 },
  { id: 'lance', name: '관통창', price: 11, type: 'pierce', atkTemp: 4, pierce: 1, text: '이번 전투 공격 +4 / 관통 1회(처치 후 초과 피해를 다음 적에게 1회 전달)', limit: 3 },
  { id: 'drill', name: '천공 드릴', price: 18, type: 'pierce', atkTemp: 8, pierce: 2, text: '이번 전투 공격 +8 / 관통 2회(처치 후 초과 피해 전달)', limit: 2 },
  { id: 'chainblast', name: '연쇄 폭발', price: 15, type: 'aoeAttack', perEnemy: 5, text: '💥 쌓인 적 1마리당 5 광역 피해 (사용 시점 기준)', limit: 2 },
  { id: 'pike', name: '관통검', price: 16, type: 'specialAttack', atk: 6, pierce: 1, passive: 'pierce', text: '공격 +6 / 손패에 있으면 관통 +1', limit: 2 },
  { id: 'bomber', name: '폭격수의 서', price: 15, type: 'specialAttack', atk: 5, aoe: 6, passive: 'aoe', text: '공격 +5 / 손패에 있으면 광역 피해 +6', limit: 2 },
  { id: 'combo', name: '연계의 검', price: 16, type: 'attack', atk: 6, text: '공격 +6 / 공격카드 2종 이상 조합 +8', limit: 2, combo: { kind: 'types', need: 2, bonus: 8 } },
  { id: 'master', name: '검의 달인', price: 20, type: 'attack', atk: 8, text: '공격 +8 / 검 2장 이상 +12', limit: 2, combo: { kind: 'target', target: 'sword', targetName: '검', need: 2, bonus: 12 } },
  { id: 'thief', name: '약탈검', price: 18, type: 'specialAttack', atk: 7, res: 3, passive: 'res', text: '공격 +7 / 손패 등장 시 자원 +3', limit: 2 },
  { id: 'mage', name: '마법검', price: 18, type: 'specialAttack', atk: 5, draw: 2, passive: 'draw', text: '공격 +5 / 손패 등장 시 드로우 +2', limit: 2 },
  { id: 'dice', name: '운명의 주사위', price: 13, type: 'random', text: '🎲 사건 카드: 자원·공격·드로우·보호·카드 강화/저주가 발생하며, 낮은 확률로 카드가 파괴되고 운빨 전용 레전드를 발견합니다.', limit: 2 },
  { id: 'box', name: '혼돈 상자', price: 16, type: 'random', text: '🎁 고위험 사건 카드: 랜덤 카드 획득·광역·관통·보석 대박 또는 손실/저주. 사용 후 파괴되며 레전드가 나올 수도 있습니다.', limit: 2 },
  { id: 'coin', name: '행운의 동전', price: 9, type: 'random', text: '🪙 비교적 안전한 사건 카드: 자원·보석·공격·보호·드로우 중 하나. 매우 낮은 확률로 파괴되며 레전드 발견 가능.', limit: 3 },
  { id: 'potion', name: '미지의 약병', price: 14, type: 'random', text: '🧪 변이 사건 카드: 카드 강화, 대량 드로우, 랜덤 보호, 보석 변화 또는 저주 카드 생성. 낮은 확률로 파괴/레전드 발견.', limit: 2 }

];

// v0.2.12: 운빨 카드에서만 획득 가능한 레전드 카드. 일반 상점/보스 보상에는 등장하지 않습니다.
const LEGEND_POOL = [
  { id:'legend_fortune', name:'행운의 왕관', type:'specialAttack', atk:22, res:6, passive:'res', rarity:'legend', text:'👑 LEGEND · 공격 +22 / 손패 등장 시 자원 +6' },
  { id:'legend_star', name:'별의 심장', type:'protection', protect:{all:5}, gem:5, atk:8, rarity:'legend', text:'🌟 LEGEND · 전체 보호 +5 / 보석 +5 / 이번 전투 공격 +8' },
  { id:'legend_cataclysm', name:'천운의 대폭발', type:'oneuse', aoe:55, pierce:3, atkTemp:20, rarity:'legend', text:'☄️ LEGEND · 모든 적 55 피해 / 공격 +20 / 관통 3 / 일회용' },
  { id:'legend_oracle', name:'운명의 지배자', type:'draw', res:8, draw:10, rarity:'legend', text:'🔮 LEGEND · 자원 +8 / 드로우 +10' }
];

const CURSE_POOL = [
  { id:'curse_dead', name:'불운의 잔재', type:'curse', text:'☠️ 저주 · 손패 한 칸을 차지하며 사용할 수 없습니다.' },
  { id:'curse_debt', name:'탐욕의 빚', type:'curse', atk:-3, text:'☠️ 저주 · 덱 전체 공격력 -3. 제거/승급으로 정리하세요.' }
];

const BASE = [
  { id: 'dagger', name: '단검', type: 'attack', atk: 2 },
  { id: 'sword', name: '검', type: 'attack', atk: 4 },
  { id: 'smash', name: '강타', type: 'attack', atk: 7 },
  ...Array(7).fill(0).map(() => ({ id: 'mine', name: '채굴', type: 'resource', res: 2, text: '자원 +2' }))
];

const EARLY_ENEMIES = [
  { name: '약한 슬라임', hp: 12, eff: '디버프 없음', d: null },
  { name: '야생 고블린', hp: 18, eff: '디버프 없음', d: null },
  { name: '동굴 늑대', hp: 24, eff: '디버프 없음', d: null },
  { name: '정예 숲 도적', hp: 30, eff: '디버프 없음', d: null }
];

const ADVANCED_ENEMIES = [
  { name: '자원도둑', hp: 22, d: { k: 'resource', base: 2 } },
  { name: '봉인술사', hp: 28, d: { k: 'combo', base: 2 } },
  { name: '보석사냥꾼', hp: 32, steal: { chance: 0.6, pct: 0.2, min: 2 } },
  { name: '뒤틀린 기사', hp: 40, d: { k: 'attack', base: 3 } }
];

// 보스: % 디버프 (pts 1점 = 10%) · 5라운드마다 순서대로 등장
const BOSSES = [
  { name: '운명의 수호자', hp: 55, boss: true, d: { k: 'combo', pts: 5 } },
  { name: '탐욕의 용', hp: 62, boss: true, d: { k: 'resource', pts: 4 } },
  { name: '강철의 거인', hp: 72, boss: true, d: { k: 'attack', pts: 3 } }
];

/* ===== v0.2.6 추가 데이터 ===== */
const RANDOM_SHOP_SIZE = 8;      // 랜덤 상점 카드 수

/* ===== v0.2.7 난이도 곡선 (상수만 바꾸면 조정 가능) ===== */
const HP_QUAD = 0.003;           // 적 HP 배율 = 1 + HP_QUAD × (라운드-1)²  → R10 약 1.2배 · R20 약 2.1배 · R30 약 3.5배
const DEBUFF_GROWTH = 1 / 6;     // 일반 몹 디버프 계수 = 1 + (라운드-1) × DEBUFF_GROWTH → R7 2배 · R16 3.5배 · R31 6배
const PCT_PER_POINT = 10;        // 보스 % 디버프: 점수 1점 = 10%
const PERSISTENT_DRAW = true;      // 이어가기 드로우: 드로우 더미를 라운드를 넘어 이어 쓰고, 부족할 때만 묘지를 섞음 (false = 매 라운드 전체 재셔플)
const BOSS_RESTOCK_BASIC = 3;     // 보스 보상 '재입고': 기본 상점 모든 카드 재고 +N (재입고는 보스 보상으로만)
const BOSS_RESTOCK_RANDOM = 1;    // 보스 보상 '재입고': 현재 랜덤 상점 카드 재고 +N
let persistentDraw = PERSISTENT_DRAW;
const spawnCount = r => (r <= 15 ? 1 : r <= 25 ? 2 : 3);   // 라운드당 동시 등장 수
const hpMult = r => 1 + HP_QUAD * Math.pow(r - 1, 2);
const debuffMult = r => 1 + (r - 1) * DEBUFF_GROWTH;
const gameOverEnemyLimit = r => 6 + 2 * (spawnCount(r) - 1);        // 누적 적 수 한계
const gameOverHpLimit = r => Math.round(150 * hpMult(r) * spawnCount(r)); // 누적 HP 한계
const sg = n => (n >= 0 ? '+' : '') + n;

const DEBUFF_NAMES = { resource: '자원 획득', combo: '콤보', gem: '보석 획득', attack: '공격력' };


// 일회용(소멸) 카드 사용 이력 보너스
const ONEUSE_MILESTONE = { every: 3, atk: 5 }; // 일회용 3장 사용할 때마다 영구 공격력 +5
const ONEUSE_COMBOS = [
  { id: 'rampage',  name: '폭주 연계',   need: ['kill', 'over'],                          text: '영구 공격 +4 / 자원 +6',            reward: { atk: 4, res: 6 } },
  { id: 'bloom',    name: '광맥 폭발',   need: ['over', 'gb'],                            text: '자원 +8 / 💎 +3',                   reward: { res: 8, gem: 3 } },
  { id: 'disaster', name: '천재지변',    need: ['meteor', 'kill'],                        text: '영구 공격 +6',                      reward: { atk: 6 } },
  { id: 'storm',    name: '쇄도 연계',   need: ['rush', 'meteor'],                        text: '영구 공격 +5 / 💎 +2',              reward: { atk: 5, gem: 2 } },
  { id: 'grand',    name: '일회용 마스터', need: ['kill', 'over', 'gb', 'meteor', 'rush'], text: '영구 공격 +15 / 자원 +10 / 💎 +5', reward: { atk: 15, res: 10, gem: 5 } }
];

// 승급/전직: 덱의 재료 카드를 소모해 더 강한 카드 1장으로 교체 (덱 압축)
/* 
  승급/전직 (v0.2.7): 모든 조합에는 반드시 '랜덤 상점 카드'가 1장 이상 필요합니다.
  시작 덱이나 고정 상점 카드만으로는 승급할 수 없어, 랜덤 상점 · 보스 보상 카드의 가치가 높아집니다.
*/
const PROMOS = [
  { id: 'p_vein',    from: { mine: 2, rd: 1 },                cost: { res: 3 }, card: { id: 'vein',    name: '광맥',       type: 'draw', res: 7, draw: 1, text: '자원 +7 / 드로우 +1' } },
  { id: 'p_furnace', from: { big: 2, rg: 1 },                 cost: { res: 4 }, card: { id: 'furnace', name: '용광로',     type: 'gem', res: 10, gem: 1, text: '자원 +10 / 💎 +1' } },
  { id: 'p_lode',    from: { vein: 2, d5: 1 },                cost: { res: 7 }, card: { id: 'lode',    name: '금맥',       type: 'draw', res: 16, draw: 1, text: '자원 +16 / 드로우 +1' } },
  { id: 'p_mint',    from: { gem: 2, gg: 1 },                 cost: { res: 4 }, card: { id: 'mint',    name: '보석 주조소', type: 'gem', gem: 5, text: '💎 +5' } },
  { id: 'p_skill',   from: { hand: 2, bd: 1 },                cost: { res: 4 }, card: { id: 'skill',   name: '숙련의 손',  type: 'draw', res: 2, draw: 3, text: '자원 +2 / 드로우 +3' } },
  { id: 'p_foreman', from: { chain: 2, rd: 1 },               cost: { res: 7 }, card: { id: 'foreman', name: '광부 대장',  type: 'draw', res: 5, draw: 4, text: '자원 +5 / 드로우 +4' } },
  { id: 'p_steel',   from: { dagger: 1, sword: 1, bd: 1 },    cost: { res: 4 }, card: { id: 'steel',   name: '강철검',     type: 'attack', atk: 11, text: '공격 +11' } },
  { id: 'p_hero',    from: { steel: 1, smash: 1, combo: 1 },  cost: { res: 8 }, card: { id: 'hero',    name: '용사의 검',  type: 'attack', atk: 28, text: '공격 +28' } },
  { id: 'p_frenzy',  from: { sam: 3, master: 1 },             cost: { res: 9 }, card: { id: 'frenzy',  name: '삼연 난무',  type: 'attack', atk: 30, text: '공격 +30 · 삼연격 3장 손패 콤보를 포기하고 덱을 압축해 안정적인 영구 공격력을 확보' } },
  { id: 'p_raider',  from: { dagger: 1, thief: 1 },           cost: { res: 5 }, card: { id: 'raider',  name: '약탈 단검',  type: 'specialAttack', atk: 10, res: 4, passive: 'res', text: '공격 +10 / 손패 등장 시 자원 +4' } },
  { id: 'p_scholar', from: { sword: 1, mage: 1 },             cost: { res: 5 }, card: { id: 'scholar', name: '학자의 검',  type: 'specialAttack', atk: 11, draw: 3, passive: 'draw', text: '공격 +11 / 손패 등장 시 드로우 +3' } },
  { id: 'p_breaker', from: { lance: 2, smash: 1 },            cost: { res: 6 }, card: { id: 'breaker', name: '파쇄창',     type: 'pierce', atkTemp: 10, pierce: 3, text: '이번 전투 공격 +10 / 관통 3' } },
  { id: 'p_barrage', from: { aoe: 2, sam: 1 },                cost: { res: 8 }, card: { id: 'barrage', name: '대폭격',     type: 'aoeAttack', atk: 34, text: '💥 모든 적에게 34 피해' } },

  // v0.2.13 · 2차 전문화: 한 갈래를 선택하면 원본 승급 카드가 소모되어 되돌리기 어렵습니다.
  { id: 'p_hero_pierce', tier: 2, branch:'관통', from: { hero:1, drill:1 }, cost:{res:10}, card:{ id:'skyhero', name:'천공 용사검', type:'specialAttack', atk:40, pierce:2, passive:'pierce', text:'2차 승급 · 공격 +40 / 손패에 있으면 관통 +2 · 관통 테크' } },
  { id: 'p_hero_aoe', tier: 2, branch:'광역', from: { hero:1, bomber:1 }, cost:{res:10}, card:{ id:'stormhero', name:'폭풍 용사검', type:'specialAttack', atk:38, aoe:12, passive:'aoe', text:'2차 승급 · 공격 +38 / 손패에 있으면 광역 +12 · 광역 테크' } },
  { id: 'p_hero_link', tier: 2, branch:'연계', from: { hero:1, combo:1 }, cost:{res:10}, card:{ id:'linkhero', name:'연계 성검', type:'attack', atk:42, linkAmp:5, text:'2차 승급 · 공격 +42 / 행동 연계 공격 보너스 +5 · 연계 테크' } },
  { id: 'p_frenzy_link', tier: 2, branch:'연격', from:{ frenzy:1, d5:1 }, cost:{res:11}, card:{ id:'infinite', name:'무한연격', type:'attack', atk:44, linkAmp:6, text:'2차 승급 · 공격 +44 / 행동 연계 공격 보너스 +6 · 드로우 연격 테크' } },

  // v0.2.13 · 3차 완성형. 2차 선택과 랜덤 상점 카드가 다시 요구됩니다.
  { id:'p_skyhero3', tier:3, branch:'관통', from:{skyhero:1,pike:1}, cost:{res:14,gem:2}, card:{id:'skyking',name:'천공 성검',type:'specialAttack',atk:58,pierce:3,passive:'pierce',text:'3차 승급 · 공격 +58 / 손패에 있으면 관통 +3'} },
  { id:'p_stormhero3', tier:3, branch:'광역', from:{stormhero:1,chainblast:1}, cost:{res:14,gem:2}, card:{id:'stormking',name:'폭풍 성검',type:'specialAttack',atk:52,aoe:20,passive:'aoe',text:'3차 승급 · 공격 +52 / 손패에 있으면 광역 +20'} },
  { id:'p_linkhero3', tier:3, branch:'연계', from:{linkhero:1,master:1}, cost:{res:14,gem:2}, card:{id:'linkking',name:'연계 왕검',type:'attack',atk:56,linkAmp:12,text:'3차 승급 · 공격 +56 / 행동 연계 공격 보너스 +12'} },
  { id:'p_infinite3', tier:3, branch:'연격', from:{infinite:1,combo:1}, cost:{res:14,gem:2}, card:{id:'zenith',name:'연격의 극의',type:'attack',atk:60,linkAmp:14,text:'3차 승급 · 공격 +60 / 행동 연계 공격 보너스 +14'} }
];

const CARD_NAME = {};
[...BASE, ...BASIC, ...RANDOM_POOL].forEach(c => { if (c.id) CARD_NAME[c.id] = c.name; });
PROMOS.forEach(p => { CARD_NAME[p.card.id] = p.card.name; });
const PROMOTION_STONE = { id:'promo_stone', name:'만능승급석', type:'promotionStone', text:'보스 전용 보상 · 사용 시 단검/검/강타 중 승급 재료 1장을 선택해 덱에 추가. 선택은 되돌릴 수 없습니다.' };
CARD_NAME[PROMOTION_STONE.id] = PROMOTION_STONE.name;


let deck = [], hand = [], draw = [], graveyard = [], resource = 0, gems = 0, round = 1, enemies = [], randomShop = [], buyCount = {}, phase = 'hand', tempAttack = 0, aoeAttack = 0, nextRes = 0, nextDraw = 0, prot = { attack: 0, resource: 0, gem: 0, combo: 0, all: 0 }, rewards = [];
let bonusAtk = 0, oneuseUsed = 0, oneuseHistory = {}, oneuseDone = {}, pierce = 0, nextSpawn = null, spawnedIds = [], lastDrawn = [], recentLogs = [];
let linkComboAttack = 0, roundActionHistory = [], roundLinkDone = {}, pendingPromotionStoneId = null; // v0.2.13 행동 연계
let fullLogs = [], stats = {};
let dangerActive = false, recentAdvancedPrimary = [], trackingStartDraw = false, activeDebuffZone = 1;
let rewardLocked = false, rewardRevealPending = false;
// v0.2.14 · 공식전/무한모드/선택형 카드 트랜잭션
let runStartedAt = 0, officialRecord = null, endlessMode = false, pendingOfficialContinuation = null;
let pendingChoiceCardId = null, pendingChoiceType = null, playTimerHandle = null;
// v0.2.15 · 랜덤상점 발견 이력 / 전투 연출
let randomShopSeen = new Set(), pendingBattleScene = null;

function resetStats() { stats = { maxAttack: 0, maxPreDebuffAttack: 0, maxEffectiveAttack: 0, comboBonus: 0, comboTriggers: 0, gemsEarned: 0, enemiesKilled: 0, bossesKilled: 0, promotions: 0, cardsUsed: 0, round30Clear: false, damageDealt: 0, aoeDamage: 0, aoePotentialDamage: 0, overkillDamage: 0, pierceDamage: 0, pierceKills: 0, resourceGained: 0, resourceBlocked: 0, attackDebuffLoss: 0, protectionPointsUsed: 0, dangerEntries: 0, dangerEscapes: 0, maxDeckSize: 10, cardsDrawn: 0, extraCardsDrawn: 0, cardsBought: 0, cardsRemoved: 0, firstBossKillRound: null, linkComboTriggers: 0, baseCardsRecovered: 0, promotionStonesUsed: 0, firstPromotionTier1: null, firstPromotionTier2: null, firstPromotionTier3: null, randomShopUniqueSeen: 0, shopRerollCardsChanged: 0, officialScore: null, officialPlayMs: null, endlessMaxRound: 0 }; }
function addGems(n) { if (n > 0) stats.gemsEarned += n; gems += n; }
function scoreValue() { stats.maxDeckSize = Math.max(stats.maxDeckSize || 0, deck.length); return Math.round(stats.maxAttack * 10 + stats.comboBonus * 5 + stats.comboTriggers * 40 + stats.gemsEarned * 25 + stats.enemiesKilled * 30 + stats.bossesKilled * 150 + stats.promotions * 120 + Math.max(0, round - 1) * 50 + (stats.round30Clear ? 3000 : 0)); }
function plainLogText(s) { const d = document.createElement('div'); d.innerHTML = s; return d.textContent || d.innerText || ''; }
function formatPlayTime(ms) {
  ms = Math.max(0, ms || 0);
  const sec = Math.floor(ms / 1000), h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return (h ? String(h).padStart(2,'0') + ':' : '') + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
}
function currentPlayMs(){ return runStartedAt ? Date.now() - runStartedAt : 0; }
function updatePlayTimeUI(){
  const el=$('playTime'); if(!el) return;
  const ms = officialRecord && !endlessMode ? officialRecord.playMs : currentPlayMs();
  el.textContent = formatPlayTime(ms);
  const mode=$('runMode'); if(mode) mode.textContent = endlessMode ? '♾ ENDLESS' : (officialRecord ? '🏆 OFFICIAL COMPLETE' : '🏆 OFFICIAL R1–30');
}
function startPlayTimer(){
  runStartedAt=Date.now();
  if(playTimerHandle) clearInterval(playTimerHandle);
  playTimerHandle=setInterval(updatePlayTimeUI,1000);
  updatePlayTimeUI();
}
function commitChoiceCard(id, purge=false){
  const c=hand.find(x=>x.id===id); if(!c) return null;
  hand=hand.filter(x=>x.id!==id);
  stats.cardsUsed++;
  if(purge){ purgeCard(id); }
  else if(!graveyard.some(x=>x.id===id)) graveyard.push(c);
  return c;
}

const $ = id => document.getElementById(id);

function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
}

const cp = o => ({ ...o, baseId: o.baseId || o.id, id: generateUUID(), protect: o.protect ? { ...o.protect } : undefined });

function isVisualMode() {
  const toggle = $('visualModeToggle');
  return toggle ? toggle.checked : true;
}

function shouldPlayBattleMotion() {
  const toggle = $('battleMotionSkipToggle');
  return !(toggle && toggle.checked);
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function log(s, kind) {
  fullLogs.push('[R' + round + '][' + phase + '] ' + plainLogText(s));
  const style = kind === true ? 'color:#f87171; font-weight:bold;' : kind === 'good' ? 'color:#4ade80; font-weight:bold;' : '';
  const html = '<div style="' + style + '">' + s + '</div>';

  const logBox = $('log');
  if (logBox) logBox.innerHTML = html + logBox.innerHTML;

  // 비주얼 모드 OFF 일 때 결과를 바로 볼 수 있는 '최근 로그' 영역
  recentLogs.unshift(html);
  if (recentLogs.length > 6) recentLogs.length = 6;
  const recent = $('recentLog');
  if (recent) recent.innerHTML = '<div class="recent-log-title">📜 최근 로그 (비주얼 모드 OFF: 결과는 여기서 확인하세요)</div>' + recentLogs.join('');
}

function total() {
  return enemies.reduce((a, e) => a + (e?.hp || 0), 0);
}

function deckAtk() {
  return deck.reduce((a, c) => a + (c.atk || 0), 0);
}

function baseAtk() {
  return deckAtk() + bonusAtk;
}

function enemy() {
  return enemies[0] || null;
}

function consume(k, p) {
  let n = p;
  let used = 0;

  let t = Math.min(prot[k] || 0, n);
  prot[k] -= t;
  n -= t;
  used += t;

  if (n > 0) {
    t = Math.min(prot.all || 0, n);
    prot.all -= t;
    n -= t;
    used += t;
  }

  stats.protectionPointsUsed += used;
  return { fullyBlocked: n === 0, blockedAmount: used, remainingPenalty: n };
}

/* 
  [v0.2.5 규칙] 드로우 로직
  - 라운드 중에는 드로우 덱(draw)에 남은 카드만 뽑을 수 있습니다.
  - 드로우 덱이 소진되면 더 이상 뽑지 않습니다. (버린 더미를 다시 섞지 않음)
  - 사용/버린 카드는 다음 라운드 시작(drawStart) 때 전체 덱과 함께 다시 섞입니다.
*/
function drawCards(n, filter) {
  let got = 0;
  lastDrawn = [];
  for (let x = 0; x < n; x++) {
    const findCardIndex = () => {
      if (!filter) return draw.length - 1;
      for (let j = draw.length - 1; j >= 0; j--) {
        let c = draw[j];
        if (filter === 'attack' && (c.type === 'attack' || c.type === 'specialAttack' || c.type === 'aoeAttack')) return j;
        if (filter === 'resource' && ['resource', 'draw', 'drawFilter', 'gem'].includes(c.type)) return j;
      }
      return -1;
    };

    const i = findCardIndex();

    // 드로우 덱에 뽑을 카드가 없는 경우 (라운드 중에는 재셔플하지 않음)
    if (i < 0) {
      if (draw.length === 0) log('⚠️ 드로우 덱이 소진되어 더 이상 뽑을 수 없습니다! (다음 라운드에 다시 섞입니다)', true);
      else log('⚠️ 드로우 덱에 조건에 맞는 카드가 없습니다!', true);
      break;
    }

    const dc = draw.splice(i, 1)[0];
    hand.push(dc);
    lastDrawn.push(dc.name);
    got++;
    stats.cardsDrawn++;
    if (!trackingStartDraw) stats.extraCardsDrawn++;
  }
  return got;
}

function start() {
  if (!window.__luckAutoLabBotActive) { window.__luckManualRunId = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2); }
  phase = 'hand';
  deck = BASE.map(cp);
  hand = [];
  draw = shuffle([...deck]);
  graveyard = [];
  resource = 0;
  gems = 0;
  round = 1;
  enemies = [];
  buyCount = {};
  randomShop = shuffle(RANDOM_POOL.map(x => ({ ...x, protect: x.protect ? { ...x.protect } : undefined }))).slice(0, RANDOM_SHOP_SIZE);
  randomShopSeen = new Set(randomShop.map(x=>x.id));
  prot = { attack: 0, resource: 0, gem: 0, combo: 0, all: 0 };
  tempAttack = 0;
  aoeAttack = 0;
  nextRes = 0;
  nextDraw = 0;
  bonusAtk = 0;
  oneuseUsed = 0;
  oneuseHistory = {};
  oneuseDone = {};
  pierce = 0;
  nextSpawn = null;
  spawnedIds = [];
  recentLogs = [];
  fullLogs = [];
  dangerActive = false;
  recentAdvancedPrimary = [];
  activeDebuffZone = 1;
  rewardLocked = false;
  rewardRevealPending = false;
  linkComboAttack = 0; roundActionHistory = []; roundLinkDone = {}; pendingPromotionStoneId = null;
  pendingChoiceCardId = null; pendingChoiceType = null; officialRecord = null; endlessMode = false; pendingOfficialContinuation = null;
  resetStats();
  stats.randomShopUniqueSeen=randomShopSeen.size;
  startPlayTimer();
  
  if ($('log')) $('log').innerHTML = '';
  if ($('modal')) $('modal').classList.add('hide');
  
  log('🎲 게임이 시작되었습니다.');
  addEnemy();
  
  if (isVisualMode()) {
    showRoundStartModal();
  } else {
    drawStart();
  }
}

const bossFor = r => BOSSES[((Math.floor(r / 5) - 1) % BOSSES.length + BOSSES.length) % BOSSES.length];

// 라운드 r에 등장할 적 템플릿 목록 (동시 등장 수는 spawnCount)
function rollSpawn(r) {
  if (r < 5) return [EARLY_ENEMIES[(r - 1) % EARLY_ENEMIES.length]];
  const list = [];
  const n = spawnCount(r);
  if (r % 5 === 0) list.push(bossFor(r));
  let pool = shuffle([...ADVANCED_ENEMIES]);
  // v0.2.10: 같은 일반 적이 3개 라운드 연속 주력으로 등장하는 극단 RNG 방지.
  if (recentAdvancedPrimary.length >= 2 && recentAdvancedPrimary.at(-1) === recentAdvancedPrimary.at(-2)) {
    const blocked = recentAdvancedPrimary.at(-1);
    pool = [...pool.filter(x => x.id !== blocked), ...pool.filter(x => x.id === blocked)];
  }
  let i = 0;
  while (list.length < n) { list.push(pool[i % pool.length]); i++; }
  return list;
}

function makeEnemy(t, r) {
  const e = { name: t.name, hp: Math.round(t.hp * hpMult(r)), boss: !!t.boss, d: null, id: generateUUID(), spawnRound: r, debuffZone: Math.ceil(r / 5) };
  if (t.d) {
    if (t.d.pts) {
      e.d = { k: t.d.k, p: t.d.pts, baseP: t.d.pts, pct: true };
    } else {
      const p = Math.max(1, Math.round(t.d.base * debuffMult(r)));
      e.d = { k: t.d.k, p, baseP: p, pct: false };
    }
  }
  if (t.steal) {
    e.steal = { ...t.steal, min: Math.max(t.steal.min, Math.round(t.steal.min * debuffMult(r) * 0.5)) };
  }
  return e;
}

/* 
  [v0.2.7] 적 등장: 라운드마다 spawnCount(round)마리가 동시에 등장하고,
  기존 적의 디버프는 만료되지 않고 모두 유지(중첩)됩니다. 다음 라운드 적은 미리 정해 예고합니다.
*/
function addEnemy() {
  const templates = nextSpawn || rollSpawn(round);
  const primaryAdvanced = templates.find(t => !t.boss && ADVANCED_ENEMIES.some(a => a.id === t.id));
  if (primaryAdvanced) { recentAdvancedPrimary.push(primaryAdvanced.id); recentAdvancedPrimary = recentAdvancedPrimary.slice(-2); }
  nextSpawn = rollSpawn(round + 1);
  spawnedIds = [];
  templates.forEach(t => {
    const e = makeEnemy(t, round);
    enemies.push(e);
    spawnedIds.push(e.id);
    log((e.boss ? '👑 ' : '👹 ') + e.name + ' 등장! HP ' + e.hp + ' (' + debuffLabel(e) + ')');
  });
  updateEnemyStatus();
  if ($('nextEnemy')) $('nextEnemy').textContent = round + '라운드 · ' + templates.map(t => t.name).join(', ');
  if ($('nextSpec')) $('nextSpec').textContent = '';
}

function isEnemyDebuffActive(e) { return !!e && e.debuffZone === activeDebuffZone; }

function debuffLabel(e) {
  const parts = [];
  if (e.d) {
    const nm = DEBUFF_NAMES[e.d.k];
    parts.push(e.d.pct ? nm + ' -' + (e.d.baseP * PCT_PER_POINT) + '%' : nm + ' -' + e.d.baseP);
  }
  if (e.steal) {
    parts.push('보석 약탈 시도 (성공 ' + Math.round(e.steal.chance * 100) + '% · 보유 보석의 ' + Math.round(e.steal.pct * 100) + '%, 최소 ' + e.steal.min + ')');
  }
  return parts.length ? parts.join(' / ') : '디버프 없음';
}

function getEnemyDebuffText(e) {
  if (!e || (!e.d && !e.steal)) return '디버프 없음';
  const base = debuffLabel(e);
  if (!isEnemyDebuffActive(e)) return base + (e.debuffZone < activeDebuffZone ? ' (구간 종료 · 비활성)' : ' (보스 처치 전 · 대기)');
  if (e.d) return base + (e.d.p > 0 ? ' (현재 구간 발동 ⚠️)' : ' (소모 완료 ✔)');
  return base + ' (현재 구간 · 생존 시 약탈 💎)';
}

// 살아 있는 모든 적의 발동 대기 디버프 합산
function activeDebuffSummary() {
  const parts = [];
  ['resource', 'combo', 'attack'].forEach(k => {
    const pl = poolFor(k);
    if (pl.flat > 0) parts.push(DEBUFF_NAMES[k] + ' -' + pl.flat);
    if (pl.pct > 0) parts.push(DEBUFF_NAMES[k] + ' -' + (pl.pct * PCT_PER_POINT) + '%');
  });
  const hunters = enemies.filter(e => e.steal && isEnemyDebuffActive(e)).length;
  if (hunters) parts.push('💎 약탈자 ' + hunters + '마리');
  return parts.length ? parts.join(', ') + ' (모든 적 합산 ⚠️)' : '발동 대기 중인 디버프 없음';
}

function renderNextPreview() {
  let html = '';
  if (nextSpawn && phase !== 'gameover') {
    const r = round + 1;
    const lines = nextSpawn.map(t => {
      const e = makeEnemy(t, r);
      return (e.boss ? '👑 ' : '👹 ') + e.name + ' · HP ' + e.hp + ' · ' + debuffLabel(e);
    });
    // 예상 누적 디버프: 현재 생존 적 + 신규 적 (최대치) vs 보유 보호력
    const proj = { resource: [0, 0], combo: [0, 0], attack: [0, 0] };
    const add = e => { if (e.d && proj[e.d.k]) proj[e.d.k][e.d.pct ? 1 : 0] += e.d.baseP; };
    enemies.forEach(add);
    nextSpawn.forEach(t => add(makeEnemy(t, r)));
    const tot = [];
    Object.keys(proj).forEach(k => {
      const f = proj[k][0], p = proj[k][1];
      if (f > 0 || p > 0) {
        tot.push(DEBUFF_NAMES[k] + ' -' + [f > 0 ? f : '', p > 0 ? (p * PCT_PER_POINT) + '%' : ''].filter(Boolean).join(' & ') +
          ' (보호 ' + ((prot[k] || 0) + (prot.all || 0)) + ')');
      }
    });
    const hunter = nextSpawn.some(t => t.steal) || enemies.some(e => e.steal);
    html = '<b style="color:#c084fc;">🔮 다음 라운드(' + r + ') 예고 · ' + nextSpawn.length + '마리</b><br>' + lines.join('<br>') +
      '<br><span style="color:#9ca3af;">예상 누적 디버프(생존 적 포함 최대): ' + (tot.length ? tot.join(', ') : '없음') + '</span>' +
      (hunter ? '<br><span style="color:#fbbf24;">💎 보석사냥꾼 주의: 처치하지 못하면 보유 보석 ' + gems + '개 중 일부를 약탈당할 수 있어요 (보석 보호력으로 방어 가능)</span>' : '');
  }
  if ($('nextPreview')) $('nextPreview').innerHTML = html;
  if ($('shopPreview')) $('shopPreview').innerHTML = html;
}

function updateEnemyStatus() {
  let e = enemy();
  if (!e) {
    if ($('currentEnemyName')) $('currentEnemyName').textContent = '없음';
    if ($('currentEnemyHp')) $('currentEnemyHp').textContent = '-';
    if ($('currentEnemyDebuff')) $('currentEnemyDebuff').textContent = '-';
    if ($('enemyCount')) $('enemyCount').textContent = '0';
    return;
  }
  if ($('currentEnemyName')) $('currentEnemyName').textContent = e.name + (e.boss ? ' 👑' : '') + ' (우선 타겟 🎯)';
  if ($('currentEnemyHp')) $('currentEnemyHp').textContent = e.hp + ' HP';
  if ($('currentEnemyDebuff')) $('currentEnemyDebuff').textContent = activeDebuffSummary();
  if ($('enemyCount')) $('enemyCount').textContent = enemies.length;
}

function showRoundStartModal() {
  const fresh = enemies.filter(e => spawnedIds.includes(e.id));
  const old = enemies.filter(e => !spawnedIds.includes(e.id));

  const freshHtml = fresh.map(e =>
    '<div style="background:#2d1b1e; padding:10px; border-radius:6px; border:2px solid #ef4444;">' +
      '<span style="background:#ef4444; color:white; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px;">NEW ENEMY</span>' +
      '<h4 style="margin:6px 0 4px 0; color:#f87171; font-size:15px;">👹 ' + e.name + (e.boss ? ' 👑' : '') + '</h4>' +
      '<p style="margin:2px 0;">• 체력: <b style="color:#fca5a5; font-size:14px;">' + e.hp + ' HP</b></p>' +
      '<p style="margin:2px 0; background:#3b0764; padding:6px; border-radius:4px; border:1px solid #a855f7;">• 보유 능력: <b style="color:#fde047; font-size:12px;">' + debuffLabel(e) + '</b></p>' +
    '</div>').join('');

  const oldHtml = old.length > 0
    ? '<div style="background:#1e1e24; padding:8px; border-radius:6px; border:1px solid #4b5563;">' +
        '<b style="color:#f87171; font-size:12px;">🎯 먼저 처치해야 할 이전 적 (' + old.length + '마리)</b>' +
        '<div style="margin-top:4px; display:flex; flex-direction:column; gap:2px; font-size:11px; color:#d1d5db;">' +
        old.map(e => '<div>• ' + e.name + ': <b style="color:#fca5a5;">' + e.hp + ' HP</b> · ' + debuffLabel(e) + '</div>').join('') +
        '</div></div>'
    : '';

  const ap = attackParts();
  const buffs = getActiveBuffs();
  const buffsHtml = buffs.length > 0
    ? buffs.map(b => '<div style="color:' + b.color + '; font-size:11px;">• <b>' + b.name + '</b>: ' + b.desc + '</div>').join('')
    : '<span style="color:#9ca3af; font-size:11px;">현재 손패에 적용된 시너지/콤보가 없습니다.</span>';

  if ($('modalTitle')) $('modalTitle').textContent = '⚔️ ROUND ' + round + ' 시작 (적 ' + fresh.length + '마리 등장)';
  if ($('modalContent')) {
    $('modalContent').innerHTML =
      '<div style="text-align:left; font-size:13px; display:flex; flex-direction:column; gap:10px;">' +
        freshHtml + oldHtml +
        '<div style="background:#132338; padding:10px; border-radius:6px; border:1px solid #3b82f6;">' +
          '<b style="color:#38bdf8; font-size:13px;">⚔ 현재 내 공격지수 정보</b>' +
          '<div style="margin-top:4px; font-size:12px; color:#e2e8f0; display:flex; flex-direction:column; gap:3px;">' +
            '<div>• 총 예상 공격력: <b style="color:#ef4444; font-size:14px;">' + ap.final + '</b> (기본 ' + deckAtk() + (bonusAtk ? ' + 영구 ' + bonusAtk : '') + ' + 임시 ' + tempAttack + ')</div>' +
            '<div style="margin-top:4px; background:#0f172a; padding:6px; border-radius:4px; border:1px solid #1e293b;">' +
              '<b style="color:#fde047; font-size:11px; display:block; margin-bottom:2px;">✨ 적용 중인 콤보 및 시너지:</b>' + buffsHtml +
            '</div>' +
          '</div>' +
        '</div>' +
        '<button onclick="confirmRoundStart()" style="padding:10px; background:#2563eb; color:white; font-weight:bold; border:none; border-radius:6px; cursor:pointer; margin-top:4px;">⚔ 전투 준비하기</button>' +
      '</div>';
  }

  if ($('close')) $('close').onclick = handleModalClose;
  if ($('modal')) $('modal').classList.remove('hide');
}

function handleModalClose() {
  if (pendingChoiceCardId) {
    pendingChoiceCardId=null; pendingChoiceType=null; pendingPromotionStoneId=null;
    if ($('modal')) $('modal').classList.add('hide');
    render();
    return;
  }
  if (rewardRevealPending) {
    rewardRevealPending = false;
    if ($('modal')) $('modal').classList.add('hide');
    nextRound();
    return;
  }
  if ($('modal')) $('modal').classList.add('hide');
}

function confirmRoundStart() {
  if ($('modal')) $('modal').classList.add('hide');
  if ($('close')) $('close').onclick = () => $('modal').classList.add('hide');
  drawStart();
}

// 새로 얻은 카드(구매·보상·승급)를 덱에 추가
// 이어가기 드로우: 묘지로 들어가 다음 셔플 때부터 등장 / 기존 방식: 드로우 더미에 바로 섞임
function addNewCard(c) {
  deck.push(c);
  if (persistentDraw) {
    graveyard.push(c);
  } else {
    draw.push(c);
    shuffle(draw);
  }
}

function drawStart() {
  enemies.forEach(e => {
    if (e?.d?.baseP !== undefined) {
      e.d.p = e.d.baseP;
    }
  });

  if (hand.length > 0) {
    graveyard.push(...hand);
    hand = [];
  }

  let n = 5 + nextDraw;
  nextDraw = 0;
  let got = 0;
  let drawnNames = '';

  trackingStartDraw = true;
  if (persistentDraw) {
    // 이어가기 드로우: 남은 드로우 더미에서 먼저 뽑고, 모자랄 때만 묘지를 섞어 새 더미를 만든다 (라운드 시작에서만)
    const direct = Math.min(n, draw.length);
    got = drawCards(direct);
    const first = lastDrawn.slice();
    if (direct < n && graveyard.length > 0) {
      draw = shuffle([...graveyard]);
      graveyard = [];
      log('🔄 드로우 더미가 부족해 묘지를 섞어 새 더미를 만들었습니다 (' + draw.length + '장)', 'good');
      got += drawCards(n - direct);
      lastDrawn = [...first, ...lastDrawn];
    }
    drawnNames = lastDrawn.join(', ');
  } else {
    // 기존 방식: 새 라운드마다 사용한 카드까지 전체 덱(소멸된 일회용 제외)을 다시 섞어 드로우 덱을 구성
    draw = shuffle([...draw, ...graveyard]);
    graveyard = [];
    got = drawCards(n);
    drawnNames = lastDrawn.join(', ');
  }
  resource = Math.max(0, nextRes);
  nextRes = 0;
  log('ROUND ' + round + ' → ' + got + '장 드로우: ' + drawnNames + ' (드로우 더미 ' + draw.length + '장 · 묘지 ' + graveyard.length + '장)');
  trackingStartDraw = false;
  hand.forEach(c => {
    if (c.passive === 'res') {
      resource += c.res || 0;
      log('✨ ' + c.name + ' 손패 효과 → 자원 +' + (c.res || 0));
    }
    if (c.passive === 'draw') {
      let g = drawCards(c.draw || 0);
      log('✨ ' + c.name + ' 손패 효과 → 드로우 +' + g + (g ? ' (' + lastDrawn.join(', ') + ')' : ''));
    }
  });
  phase = 'hand';
  render();
}

/* 
  [v0.2.6] 자원/보석 획득 디버프: 살아 있는 모든 적의 디버프가 합산되어 적용됩니다. (적마다 라운드당 1회 발동)
*/
/* 
  [v0.2.7] 자원 획득 디버프: 살아 있는 모든 적의 디버프가 합산(고정값+보스 %)되어 적용됩니다.
  적마다 라운드당 1회 발동하며, 자원은 0 아래(음수)로 내려갈 수 있어 도둑맞은 양이 눈에 보입니다.
*/
function gain(kind, amount) {
  if (!amount) return 0;
  if (poolFor(kind).who.length === 0) { if (kind === 'resource') stats.resourceGained += Math.max(0, amount); return amount; }

  const r = resolveDebuff(kind, true);
  stats.protectionPointsUsed += r.absorbed || 0;
  updateEnemyStatus();
  const names = r.who.map(e => e.name).join(', ');
  const rawAfter = Math.round(amount * (1 - Math.min(10, r.pct) * PCT_PER_POINT / 100)) - r.flat;
  const after = kind === 'resource' ? Math.max(0, rawAfter) : rawAfter;
  if (kind === 'resource') { stats.resourceGained += Math.max(0, after); stats.resourceBlocked += Math.max(0, amount - after); }
  const label = kind === 'resource' ? '자원' : '보석';

  if (after === amount) {
    log('🛡 ' + names + ' 디버프를 보호석으로 모두 방어했습니다! (보호 ' + r.absorbed + ' 소모)', 'good');
    return amount;
  }
  log('💥 [디버프 발동] ' + names + ' → ' + label + ' ' + sg(after - amount) + ' (보호 ' + r.absorbed + ' 방어) · 획득 ' + sg(amount) + ' ➔ ' + sg(after), true);
  return after;
}

function dangerSnapshot() {
  if (!dangerActive) return null;
  const enemyLimit = gameOverEnemyLimit(round), hpLimit = gameOverHpLimit(round);
  return { count: enemies.length, hp: total(), needKills: Math.max(0, enemies.length - enemyLimit), needHp: Math.max(0, total() - hpLimit) };
}
function estimateDangerCard(card) {
  const snap = dangerSnapshot();
  if (!snap || !card) return null;
  let aoe = aoeAttack, atk = attackValue(), pc = pierce;
  if (card.type === 'aoeAttack') aoe += card.perEnemy ? card.perEnemy * enemies.length : (card.atk || 0);
  if (card.type === 'oneuse') { aoe += card.aoe || 0; atk += card.atkTemp || 0; pc += card.pierce || 0; }
  if (card.type === 'pierce') { atk += card.atkTemp || 0; pc += card.pierce || 0; }
  if (card.type === 'protection') atk += card.atk || 0;
  let sim = enemies.map(e => e.hp);
  let kills = 0, hpCut = 0;
  if (aoe > 0) sim = sim.map(h => { const d=Math.min(h,aoe); hpCut+=d; if(h-d<=0) kills++; return Math.max(0,h-d); });
  let power = atk, idx=0, jumps=pc;
  while(power>0 && idx<sim.length){ if(sim[idx]<=0){idx++;continue;} const d=Math.min(power,sim[idx]); sim[idx]-=d; hpCut+=d; power-=d; if(sim[idx]<=0){kills++; if(jumps>0){jumps--; idx++; continue;}} break; }
  const remainCount = Math.max(0, snap.count-kills), remainHp=Math.max(0,snap.hp-hpCut);
  const safe = remainCount <= gameOverEnemyLimit(round) && remainHp <= gameOverHpLimit(round);
  return {kills, hpCut, safe, needKills:snap.needKills, needHp:snap.needHp};
}
function dangerCardBadge(card) {
  const e=estimateDangerCard(card); if(!e) return '';
  if (card.type==='draw'||card.type==='drawFilter') return '<div class="danger-hand-badge search">🃏 생존 카드 탐색</div>';
  if (card.type==='random') return '<div class="danger-hand-badge gamble">🎲 변수 창출</div>';
  if(e.kills>0 || e.hpCut>0) return '<div class="danger-hand-badge '+(e.safe?'safe':'fight')+'">'+(e.safe?'✅ 생존선 가능':'🚨 예상 '+e.kills+'킬 · HP -'+e.hpCut)+'</div>';
  return '';
}
function showDangerUseFeedback(card) {
  const e=estimateDangerCard({}); if(!e) return;
  let detail='현재 예상 '+e.kills+'킬 · HP '+e.hpCut+' 감소';
  if(card.type==='draw'||card.type==='drawFilter') detail='추가 드로우로 광역/관통/전투 카드를 찾습니다.';
  else if(card.type==='random') detail='랜덤 결과가 생존 가능성을 바꿀 수 있습니다.';
  if(e.safe) detail='현재 차징 기준 생존선 도달 가능 · '+detail;
  actionFlash(e.safe?'✅ DANGER 생존선 확보':'🚨 DANGER 대응: '+card.name, detail, e.safe?'danger-safe':'danger-use');
}
function showLuckResultFlash(card, resultText, statusChanges, isGood, isBad, destroyed) {
  const title=(isGood?'✨ ':isBad?'💀 ':'🎲 ')+card.name+' → '+resultText;
  const detail=statusChanges.join(' · ')+(destroyed?' · 카드 영구 파괴':'');
  actionFlash(title, detail, isGood?'luck-good':isBad?'luck-bad':'luck-neutral');
}

function showCardUseModal(card, changes, title) {
  if ($('modalTitle')) $('modalTitle').textContent = title || ('🎴 카드 사용: ' + card.name);
  if ($('modalContent')) {
    $('modalContent').innerHTML = 
      '<div style="text-align:left; font-size:13px; display:flex; flex-direction:column; gap:10px;">' +
        '<div style="background:#1e293b; padding:10px; border-radius:6px; border:1px solid #3b82f6;">' +
          '<b style="color:#60a5fa;">' + card.name + ' (' + (card.text || '') + ')</b>' +
        '</div>' +
        '<div style="background:#0f172a; padding:10px; border-radius:6px; border:1px solid #334155;">' +
          '<b style="color:#fde047; font-size:12px; display:block; margin-bottom:6px;">📊 상태 변화 내역:</b>' +
          '<div style="display:flex; flex-direction:column; gap:4px; font-size:12px;">' +
            changes.map(ch => '<div style="color:' + (ch.color || '#e2e8f0') + ';">• ' + ch.text + '</div>').join('') +
          '</div>' +
        '</div>' +
        '<button onclick="$(\'modal\').classList.add(\'hide\')" style="padding:8px; background:#2563eb; color:white; font-weight:bold; border:none; border-radius:6px; cursor:pointer;">확인</button>' +
      '</div>';
  }
  if ($('modal')) $('modal').classList.remove('hide');
}


function focusSection(id) { const el=$(id); if(el) el.scrollIntoView({behavior:'smooth',block:'center'}); }
function actionFlash(title, detail, kind) {
  let el=$('actionFlash'); if(!el){ el=document.createElement('div'); el.id='actionFlash'; el.className='action-flash'; document.body.appendChild(el); }
  el.className='action-flash show '+(kind||''); el.innerHTML='<b>'+title+'</b><span>'+detail+'</span>';
  clearTimeout(actionFlash._t); actionFlash._t=setTimeout(()=>el.className='action-flash',850);
}

function use(i) {
  if (phase !== 'hand') return;
  let c = hand[i];
  if (!c) return;
  if (c.type === 'attack' || c.type === 'specialAttack') {
    log('⚔️ ' + c.name + '은 공격카드라 사용할 수 없습니다.');
    return;
  }
  // 선택형 카드는 선택 확정 전까지 손패/묘지/통계/연계 상태를 전혀 변경하지 않는다.
  if (c.type === 'promotionStone') { pendingChoiceCardId=c.id; pendingChoiceType='promotionStone'; choosePromotionMaterial(c); return; }
  if (c.type === 'remove') { pendingChoiceCardId=c.id; pendingChoiceType='remove'; removeChoice(); return; }

  actionFlash('🎴 '+c.name, '사용 → 효과 처리 → '+(c.type==='oneuse'?'소멸':'묘지'), 'use');
  focusSection('hand');
  hand.splice(i, 1);
  stats.cardsUsed++;
  if (c.type !== 'oneuse') {
    graveyard.push(c);
  }

  const changes = [];
  const prevRes = resource;
  const prevGems = gems;
  const drewTxt = got => '🃏 드로우 +' + got + '장' + (got ? ' (' + lastDrawn.join(', ') + ')' : '');
  const resTxt = () => '💰 자원 ' + prevRes + ' ➔ ' + resource + ' (' + sg(resource - prevRes) + ')';

  if (c.type === 'aoeAttack') {
    const addAoe = c.perEnemy ? c.perEnemy * enemies.length : (c.atk || 0);
    aoeAttack += addAoe;
    changes.push({ text: '💥 광역 차징 피해 +' + addAoe + (c.perEnemy ? ' (적 ' + enemies.length + '마리 × ' + c.perEnemy + ')' : '') + ' (누적 ' + aoeAttack + ')', color: '#f43f5e' });
  } else if (c.type === 'resource') {
    resource += gain('resource', c.res || 0);
    changes.push({ text: resTxt(), color: '#fde047' });
  } else if (c.type === 'draw') {
    resource += gain('resource', c.res || 0);
    const got = drawCards(c.draw || 0);
    if (resource !== prevRes) changes.push({ text: resTxt(), color: '#fde047' });
    changes.push({ text: drewTxt(got), color: '#38bdf8' });
  } else if (c.type === 'drawFilter') {
    const got = drawCards(c.draw || 0, c.filter);
    changes.push({ text: drewTxt(got) + ' [' + (c.filter === 'attack' ? '공격카드만' : '자원계열만') + ']', color: '#38bdf8' });
  } else if (c.type === 'gem') {
    { const gg = gain('gem', c.gem || 0); addGems(gg); }
    resource += gain('resource', c.res || 0);
    changes.push({ text: '💎 보석 ' + prevGems + ' ➔ ' + gems + ' (+' + (gems - prevGems) + ')', color: '#c084fc' });
    if (resource !== prevRes) changes.push({ text: resTxt(), color: '#fde047' });
  } else if (c.type === 'protection') {
    for (let k in c.protect) prot[k] = (prot[k] || 0) + c.protect[k];
    resource += gain('resource', c.res || 0);
    { const gg = gain('gem', c.gem || 0); addGems(gg); }
    tempAttack += c.atk || 0;
    const got = c.draw ? drawCards(c.draw) : 0;
    changes.push({ text: '🛡 보호력 +' + Object.keys(c.protect).map(k => ({ attack: '공격', resource: '자원', gem: '보석', combo: '콤보', all: '전체' }[k] || k) + ' ' + c.protect[k]).join(', '), color: '#60a5fa' });
    if (resource !== prevRes) changes.push({ text: resTxt(), color: '#fde047' });
    if (gems > prevGems) changes.push({ text: '💎 보석 +' + (gems - prevGems), color: '#c084fc' });
    if (c.atk) changes.push({ text: '⚔️ 임시 공격력 +' + c.atk, color: '#f87171' });
    if (c.draw) changes.push({ text: drewTxt(got), color: '#38bdf8' });
  } else if (c.type === 'pierce') {
    tempAttack += c.atkTemp || 0;
    pierce += c.pierce || 0;
    changes.push({ text: '🗡 관통 +' + (c.pierce || 0) + ' (이번 전투 총 관통 ' + pierce + ')', color: '#38bdf8' });
    if (c.atkTemp) changes.push({ text: '⚔️ 이번 전투 공격력 +' + c.atkTemp, color: '#f87171' });
  } else if (c.type === 'oneuse') {
    resource += gain('resource', c.res || 0);
    { const gg = gain('gem', c.gem || 0); addGems(gg); }
    tempAttack += c.atkTemp || 0;
    if (c.aoe) aoeAttack += c.aoe;
    if (c.pierce) pierce += c.pierce;
    const got = c.draw ? drawCards(c.draw) : 0;
    changes.push({ text: '⚡ 일회용 [' + c.name + '] 발동 → 덱에서 소멸', color: '#fbbf24' });
    if (resource !== prevRes) changes.push({ text: resTxt(), color: '#fde047' });
    if (gems > prevGems) changes.push({ text: '💎 보석 ' + prevGems + ' ➔ ' + gems + ' (+' + (gems - prevGems) + ')', color: '#c084fc' });
    if (c.atkTemp) changes.push({ text: '⚔️ 이번 전투 공격력 +' + c.atkTemp, color: '#f87171' });
    if (c.aoe) changes.push({ text: '💥 광역 차징 피해 +' + c.aoe + ' (누적 ' + aoeAttack + ')', color: '#f43f5e' });
    if (c.pierce) changes.push({ text: '🗡 관통 +' + c.pierce + ' (이번 전투 총 관통 ' + pierce + ')', color: '#38bdf8' });
    if (c.draw) changes.push({ text: drewTxt(got), color: '#38bdf8' });
    trackOneuse(c, changes);
  } else if (c.type === 'random') {
    random(c);
    return;
  }

  registerActionLink(c, changes);
  const special = changes.some(ch => ch.text.startsWith('🧨') || ch.text.startsWith('✨') || ch.text.startsWith('🔗'));
  log('🎴 ' + c.name + ' 사용 ➔ ' + changes.map(ch => ch.text).join(' | '), special ? 'good' : false);
  render();
  if (dangerActive) showDangerUseFeedback(c);

  if (isVisualMode() && changes.length > 0 && !dangerActive) {
    showCardUseModal(c, changes);
  }
}

function removeChoice() {
  if ($('close')) $('close').onclick=handleModalClose;
  if ($('modalTitle')) $('modalTitle').textContent = '🗑 덱에서 제거할 카드 선택';
  if ($('modalContent')) {
    $('modalContent').innerHTML = '<p style="margin-bottom:8px;"><b>대상을 선택해야 망각의 서가 사용됩니다.</b><br>X로 닫으면 손패와 드로우 순서를 포함해 아무 변화도 없습니다.</p>' + 
      '<div style="display:flex; flex-direction:column; gap:4px; max-height:250px; overflow-y:auto;">' + 
        deck.filter(c => c.id !== pendingChoiceCardId).map(c => '<button onclick="removeCard(\'' + c.id + '\')" style="padding:6px; background:#334155; color:white; border:1px solid #475569; border-radius:4px; cursor:pointer; text-align:left;">' + c.name + ' · ' + (c.type === 'attack' ? '공격 +' + c.atk : (c.text || '액션')) + '</button>').join('') +
      '</div>';
  }
  if ($('modal')) $('modal').classList.remove('hide');
}

function removeCard(id) {
  if (pendingChoiceType !== 'remove' || !pendingChoiceCardId) return;
  const bookId=pendingChoiceCardId;
  const target=deck.find(c=>c.id===id);
  if(!target || id===bookId) return;
  const book=commitChoiceCard(bookId, false);
  if(!book) return;
  purgeCard(id);
  pendingChoiceCardId=null; pendingChoiceType=null;
  log('🎴 ['+book.name+'] 사용 확정 → 🗑 ['+target.name+'] 영구 제거 완료', 'good');
  if ($('modal')) $('modal').classList.add('hide');
  render();
}

function destroyRandomCard(c) {
  const key = c.baseId;
  deck = deck.filter(x => x.id !== c.id);
  hand = hand.filter(x => x.id !== c.id);
  draw = draw.filter(x => x.id !== c.id);
  graveyard = graveyard.filter(x => x.id !== c.id);
  return key;
}
function randomDeckCard() { return deck.length ? deck[Math.floor(Math.random()*deck.length)] : null; }
function grantLegend(statusChanges) {
  const src = LEGEND_POOL[Math.floor(Math.random()*LEGEND_POOL.length)];
  const nc = cp(src); addNewCard(nc);
  statusChanges.push('🌈 운빨 전용 LEGEND [' + src.name + '] 획득! · ' + src.text);
  return src;
}
function grantRareBase(statusChanges, chance) {
  if(Math.random() >= chance) return false;
  const src=[...BASE.filter(x=>['dagger','sword','smash'].includes(x.id))][Math.floor(Math.random()*3)];
  addNewCard(cp(src)); stats.baseCardsRecovered++;
  statusChanges.push('🌱 희귀 기본 승급재료 ['+src.name+'] 획득'); return true;
}
function grantRandomNormal(statusChanges) {
  if(grantRareBase(statusChanges,.04)) return;
  const pool=RANDOM_POOL.filter(x=>x.type!=='random'); const src=pool[Math.floor(Math.random()*pool.length)];
  addNewCard(cp(src)); statusChanges.push('🎴 랜덤 카드 ['+src.name+'] 획득');
}
function grantCurse(statusChanges) {
  const src=CURSE_POOL[Math.floor(Math.random()*CURSE_POOL.length)]; addNewCard(cp(src)); statusChanges.push('☠️ 저주 카드 ['+src.name+'] 덱에 추가');
}
function random(c) {
  let r=Math.random(), resultText='', statusChanges=[], isGood=false, isBad=false, destroyed=false;
  const roll=(arr)=>arr[Math.floor(Math.random()*arr.length)];
  // 각 운빨 카드는 성향만 다르고 결과 풀은 덱/전투 전체에 영향을 줄 수 있습니다.
  const good=[
    ()=>{resource+=8; statusChanges.push('💰 자원 +8');},
    ()=>{addGems(4); statusChanges.push('💎 보석 +4');},
    ()=>{tempAttack+=12; statusChanges.push('⚔️ 이번 전투 공격 +12');},
    ()=>{const n=drawCards(4); statusChanges.push('🃏 추가 드로우 +'+n);},
    ()=>{prot.all+=2; statusChanges.push('🛡 전체 보호 +2');},
    ()=>{aoeAttack+=12; pierce+=1; statusChanges.push('💥 광역 +12 / 🗡 관통 +1');},
    ()=>{const t=randomDeckCard(); if(t){t.atk=(t.atk||0)+3; t.text=(t.text||'')+' / ✨ 행운 강화 공격 +3'; statusChanges.push('✨ ['+t.name+'] 랜덤 강화: 공격 +3');}else resource+=5;},
    ()=>grantRandomNormal(statusChanges)
  ];
  const bad=[
    ()=>{const loss=Math.min(resource,6); resource-=loss; statusChanges.push('💰 자원 -'+loss);},
    ()=>{const loss=Math.min(gems,3); gems-=loss; statusChanges.push('💎 보석 -'+loss);},
    ()=>{tempAttack-=8; statusChanges.push('⚔️ 이번 전투 공격 -8');},
    ()=>grantCurse(statusChanges),
    ()=>{const t=randomDeckCard(); if(t && (t.atk||0)>0){t.atk=Math.max(0,t.atk-3); statusChanges.push('💀 ['+t.name+'] 랜덤 약화: 공격 -3');}else grantCurse(statusChanges);}
  ];
  const cfg={dice:[.34,.30,.08], box:[.38,.24,.14], coin:[.48,.32,.05], potion:[.40,.25,.10]}[c.baseId]||[.4,.3,.08];
  if(r<cfg[0]) { resultText='✨ 행운 사건!'; roll(good)(); isGood=true; }
  else if(r<cfg[0]+cfg[1]) { resultText='➖ 아무 일도 일어나지 않았습니다.'; statusChanges.push('변화 없음'); }
  else { resultText='💀 불운 사건!'; roll(bad)(); isBad=true; }
  // 별도 파괴 판정: 상자 > 약병/주사위 > 동전. 파괴될 때 레전드 잭팟 가능.
  const destroyChance={dice:.10,box:.18,coin:.06,potion:.12}[c.baseId]||.08;
  if(Math.random()<destroyChance){
    destroyed=true; destroyRandomCard(c); statusChanges.push('💥 ['+c.name+'] 카드가 운명을 다해 영구 파괴');
    const legendChance=c.baseId==='box'?.28:.20;
    if(Math.random()<legendChance){grantLegend(statusChanges); isGood=true; isBad=false; resultText='🌈 LEGEND JACKPOT!';}
    else if(Math.random()<.45){grantRandomNormal(statusChanges);}
  }
  log('🎲 '+c.name+' 발동 ➔ '+resultText+' ('+statusChanges.join(', ')+')', isGood?'good':isBad?true:false);
  render();
  showLuckResultFlash(c, resultText, statusChanges, isGood, isBad, destroyed);
  if(isVisualMode() && !dangerActive){
    $('modalTitle').textContent='🎲 운빨 사건: '+c.name;
    $('modalContent').innerHTML='<div class="luck-result '+(isGood?'good':isBad?'bad':'neutral')+'"><h3>'+resultText+'</h3>'+statusChanges.map(x=>'<p>• '+x+'</p>').join('')+(destroyed?'<p><b>파괴 판정이 발생했습니다.</b> 운빨 카드는 항상 안전한 자산이 아닙니다.</p>':'')+'</div>';
    $('modal').classList.remove('hide');
  }
}

const cardKey = c => c.baseId || c.id || c.name;
const isAtkCard = c => c.type === 'attack' || c.type === 'specialAttack';

// ===== v0.2.7 디버프 계산 (일반 몹: 고정값 / 보스: % 점수) =====
// 종류별 활성 디버프 합 (flat: 고정값, pct: % 점수)
function poolFor(kind) {
  const r = { flat: 0, pct: 0, who: [] };
  enemies.forEach(e => {
    const d = e.d;
    if (isEnemyDebuffActive(e) && d && d.k === kind && d.p > 0) {
      r[d.pct ? 'pct' : 'flat'] += d.p;
      r.who.push(e);
    }
  });
  return r;
}

// 보호력 반영. commit=true 면 보호력을 실제로 소모하고 디버프를 소진 처리, false 면 미리보기
function resolveDebuff(kind, commit, sharedAll) {
  const pool = poolFor(kind);
  let own = prot[kind] || 0;
  const all = sharedAll || { v: prot.all || 0 };
  let absorbed = 0;
  const take = need => {
    const a = Math.min(own, need); own -= a;
    const b = Math.min(all.v, need - a); all.v -= b;
    absorbed += a + b;
    return need - a - b;
  };
  const pct = take(pool.pct);   // 보스 % 디버프를 먼저 방어
  const flat = take(pool.flat);
  if (commit) {
    prot[kind] = own;
    prot.all = all.v;
    pool.who.forEach(e => { e.d.p = 0; });
  }
  return { flat, pct, absorbed, who: pool.who };
}

function previewDebuffs() {
  const all = { v: prot.all || 0 };
  return { attack: resolveDebuff('attack', false, all), combo: resolveDebuff('combo', false, all) };
}

const applyCut = (v, d) => Math.max(0, Math.round(v * (1 - Math.min(10, d.pct) * PCT_PER_POINT / 100)) - d.flat);

// 공격력 산출 상세 (콤보 디버프 → 공격 디버프 순서)
function attackParts() {
  const pv = previewDebuffs();
  const comboRaw = evalCombos().reduce((a, cb) => a + (cb.ok ? cb.bonus : 0), 0) + linkComboAttack;
  const comboNet = applyCut(comboRaw, pv.combo);
  const pre = baseAtk() + tempAttack + comboNet;
  const rawFinal = applyCut(pre, pv.attack);
  const attackFloor = pre > 0 ? Math.ceil(pre * 0.5) : 0;
  const final = Math.max(rawFinal, attackFloor);
  return { comboRaw, comboNet, comboLoss: comboRaw - comboNet, pre, final, rawFinal, attackFloor, atkLoss: pre - final, pv };
}

const handPassive = k => hand.reduce((a, c) => a + (c.passive === k ? (c[k] || 0) : 0), 0);
const totalPierce = () => pierce + handPassive('pierce');
const totalAoe = () => aoeAttack + handPassive('aoe');

// 손패에 있는 콤보 카드의 진행 상태 (카드 데이터의 combo 필드 기준)
function evalCombos() {
  const seen = new Set();
  const list = [];
  hand.forEach(c => {
    if (!c.combo || seen.has(cardKey(c))) return;
    seen.add(cardKey(c));
    const cb = c.combo;
    let cur = 0;
    if (cb.kind === 'same') cur = hand.filter(h => cardKey(h) === cardKey(c)).length;
    else if (cb.kind === 'types') cur = new Set(hand.filter(isAtkCard).map(cardKey)).size;
    else if (cb.kind === 'target') cur = hand.filter(h => cardKey(h) === cb.target).length;
    list.push({ name: c.name, kind: cb.kind, cur, need: cb.need, bonus: cb.bonus, ok: cur >= cb.need, targetName: cb.targetName });
  });
  return list;
}

function comboProgress(cb) {
  if (cb.kind === 'types') return '서로 다른 공격 카드 ' + cb.cur + '/' + cb.need + '종';
  if (cb.kind === 'target') return cb.targetName + ' ' + cb.cur + '/' + cb.need + '장';
  return cb.cur + '/' + cb.need + '장';
}

const ACTION_LINKS = [
  {id:'engine', name:'연속 기동', seq:['draw','economy','draw'], bonus:12, text:'드로우 → 경제 → 드로우'},
  {id:'economy_draw', name:'채굴 전개', seq:['economy','draw'], bonus:6, text:'경제 → 드로우'},
  {id:'draw_economy', name:'기동 채굴', seq:['draw','economy'], bonus:6, text:'드로우 → 경제'},
  {id:'guard_economy', name:'수호 채굴', seq:['protect','economy'], bonus:8, text:'보호 → 경제'},
  {id:'guard_draw', name:'수호 전개', seq:['protect','draw'], bonus:8, text:'보호 → 드로우'}
];
const TACTICAL_LINKS = [
  {id:'bomb_pierce',name:'폭격 관통',need:['aoe','pierce'],bonus:10,text:'광역 패시브 + 관통 패시브'},
  {id:'link_pierce',name:'연계 돌파',need:['link','pierce'],bonus:12,text:'연계 카드 + 관통 패시브'},
  {id:'link_aoe',name:'연계 폭격',need:['link','aoe'],bonus:12,text:'연계 카드 + 광역 패시브'},
  {id:'trinity',name:'삼중 전술',need:['link','aoe','pierce'],bonus:20,text:'연계 + 광역 + 관통 동시 전개'}
];
function actionTag(c){
  if(!c) return '';
  if(c.type==='protection') return 'protect';
  if(c.type==='draw'||c.type==='drawFilter'||(c.draw||0)>0) return 'draw';
  if(c.type==='resource'||c.type==='gem'||(c.res||0)>0||(c.gem||0)>0) return 'economy';
  if(c.type==='random') return 'luck';
  return 'action';
}
function tacticalTags(){
  const tags=new Set();
  hand.forEach(c=>{
    const k=cardKey(c);
    if(c.type==='aoeAttack'||c.passive==='aoe'||c.aoe||c.perEnemy) tags.add('aoe');
    if(c.type==='pierce'||c.passive==='pierce'||c.pierce) tags.add('pierce');
    if(k==='combo'||c.linkAmp||k==='linkhero'||k==='linkking'||k==='infinite'||k==='zenith') tags.add('link');
  });
  return tags;
}
function deckLinkAmp(){ return deck.reduce((a,c)=>a+(c.linkAmp||0),0); }
function triggerLink(id,name,bonus,text,changes){
  if(roundLinkDone[id]) return false;
  roundLinkDone[id]=true; const b=bonus+deckLinkAmp(); linkComboAttack+=b; stats.linkComboTriggers++;
  const msg='🔗 연계 ['+name+'] 발동! '+text+' → 콤보 공격 +'+b;
  if(changes) changes.push({text:msg,color:'#4ade80'}); else log(msg,'good');
  actionFlash('🔗 '+name+'!', text+' · 콤보 공격 +'+b, 'combo-hit');
  return true;
}
function evaluateTacticalLinks(changes){
  const tags=tacticalTags();
  TACTICAL_LINKS.forEach(l=>{ if(l.need.every(x=>tags.has(x))) triggerLink('t_'+l.id,l.name,l.bonus,l.text,changes); });
}
function registerActionLink(c, changes){
  const tag=actionTag(c); if(!tag) return;
  roundActionHistory.push(tag); if(roundActionHistory.length>8) roundActionHistory.shift();
  ACTION_LINKS.forEach(l=>{
    if(roundLinkDone['a_'+l.id] || roundActionHistory.length<l.seq.length) return;
    const tail=roundActionHistory.slice(-l.seq.length);
    if(l.seq.every((x,i)=>tail[i]===x)) triggerLink('a_'+l.id,l.name,l.bonus,l.text,changes);
  });
  evaluateTacticalLinks(changes);
}
function linkProgressRows(){
  const tags=tacticalTags(), rows=[];
  TACTICAL_LINKS.forEach(l=>{const have=l.need.filter(x=>tags.has(x)); const miss=l.need.filter(x=>!tags.has(x)); rows.push({name:l.name,ready:miss.length===0,near:miss.length===1,text:l.text,progress:have.length+'/'+l.need.length,missing:miss});});
  ACTION_LINKS.forEach(l=>{let n=0; for(let k=Math.min(l.seq.length,roundActionHistory.length);k>0;k--){const tail=roundActionHistory.slice(-k); if(tail.every((x,i)=>x===l.seq[i])){n=k;break;}} rows.push({name:l.name,ready:n===l.seq.length,near:n===l.seq.length-1,text:l.text,progress:n+'/'+l.seq.length,missing:n<l.seq.length?[l.seq[n]]:[]});});
  return rows;
}
const TAG_KO={aoe:'광역',pierce:'관통',link:'연계',draw:'드로우',economy:'경제',protect:'보호'};
function linkStatusHtml(){
  const amp=deckLinkAmp(), rows=linkProgressRows().filter(x=>x.ready||x.near).slice(0,6);
  const body=rows.length?rows.map(x=>'<span class="link-chip '+(x.ready?'ready':'near')+'"><b>'+(x.ready?'🔥 ':'⏳ ')+x.name+'</b> '+x.progress+(x.missing.length?' · 다음 '+x.missing.map(m=>TAG_KO[m]||m).join('/'):' · 발동 가능')+'</span>').join(''):'<span class="link-empty">현재 한 단계 이내 연계 없음</span>';
  return '<div class="link-hud"><strong>🔗 연계 전술</strong><div class="link-chips">'+body+'</div><small>이번 전투 연계 공격 +'+linkComboAttack+(amp?' · 테크 보너스 +'+amp+'/연계':'')+'</small></div>';
}
function getActiveBuffs() {
  const buffs = [];
  const ap = attackParts();

  if (linkComboAttack > 0) buffs.push({ name:'🔗 행동 연계 공격', desc:'이번 전투 콤보 공격 +'+linkComboAttack+' (콤보 디버프 적용 대상)', color:'#4ade80' });
  if (ap.comboLoss > 0) {
    buffs.push({ name: '⚠️ 콤보 디버프', desc: '콤보 보너스 ' + ap.comboRaw + ' ➔ ' + ap.comboNet + ' (-' + ap.comboLoss + ')', color: '#f87171' });
  }

  evalCombos().forEach(cb => {
    if (cb.ok) buffs.push({ name: '🔥 ' + cb.name + ' 콤보', desc: comboProgress(cb) + ' ➔ 공격력 +' + cb.bonus, color: '#4ade80' });
    else buffs.push({ name: '⏳ ' + cb.name + ' 준비 중', desc: comboProgress(cb) + ' (완성 시 +' + cb.bonus + ')', color: '#9ca3af' });
  });

  if (ap.atkLoss > 0) {
    buffs.push({ name: '⚠️ 공격력 디버프', desc: '공격력 ' + ap.pre + ' ➔ ' + ap.final + ' (-' + ap.atkLoss + ')', color: '#f87171' });
  }
  if (tempAttack > 0) {
    buffs.push({ name: '⚡ 카드 임시 공격력 버프', desc: '이번 전투 공격력 +' + tempAttack, color: '#fbbf24' });
  }
  if (totalAoe() > 0) {
    buffs.push({ name: '💥 광역 폭격 준비', desc: '모든 적에게 ' + totalAoe() + ' 광역 피해 (손패 효과 ' + handPassive('aoe') + ' 포함)', color: '#f43f5e' });
  }
  if (totalPierce() > 0) {
    buffs.push({ name: '🗡 관통 준비', desc: '이번 전투 관통 ' + totalPierce() + ' (손패 효과 ' + handPassive('pierce') + ' 포함) — 처치 후 초과 피해가 다음 적에게', color: '#38bdf8' });
  }
  return buffs;
}

function attackValue() {
  return attackParts().final;
}

function battle() {
  if (phase !== 'battle') return;

  const killedEnemies = [];
  const battleEnemyStart = enemies.map((e,i)=>({id:i,name:e.name,hp:e.hp,boss:!!e.boss}));
  const battleEnemyIndex = new Map(enemies.map((e,i)=>[e,i]));
  const battleEvents = [];
  const stealLines = [];
  evaluateTacticalLinks();
  const scoredAttack = attackValue();
  const scoredCombos = evalCombos().filter(x => x.ok);
  const scoredComboBonus = scoredCombos.reduce((a, x) => a + x.bonus, 0) + linkComboAttack;
  const scoredLinkTriggers = Object.keys(roundLinkDone).filter(k=>roundLinkDone[k]).length;
  let aoeLog = '';
  let singleLog = '';
  let bossKilled = false;
  const killedBossZones = new Set();

  // 1) 광역 피해 (차징 + 손패 효과)
  const aoeTotal = totalAoe();
  if (aoeTotal > 0 && enemies.length > 0) {
    let aoeActual = 0;
    const aoeHits=[];
    enemies.forEach(e => { const before=e.hp; const dmg = Math.min(e.hp, aoeTotal); aoeActual += dmg; e.hp = Math.max(0, e.hp - aoeTotal); aoeHits.push({id:battleEnemyIndex.get(e),name:e.name,before,damage:dmg,after:e.hp,killed:e.hp===0}); });
    battleEvents.push({type:'aoe',label:'광역 공격',amount:aoeTotal,hits:aoeHits});
    stats.aoeDamage += aoeActual; stats.aoePotentialDamage += aoeTotal * enemies.length; stats.damageDealt += aoeActual;
    aoeLog = '💥 광역 폭격으로 모든 적(' + enemies.length + '마리)에게 각각 ' + aoeTotal + ' 피해!';
    enemies = enemies.filter(e => {
      if (e.hp === 0) {
        killedEnemies.push(e.name);
        if (e.boss) { bossKilled = true; killedBossZones.add(e.debuffZone); }
        return false;
      }
      return true;
    });
  }
  aoeAttack = 0;

  // 2) 단일 공격 (디버프 반영된 최종 공격력, 관통 시 초과 피해가 다음 적에게)
  if (enemies.length > 0) {
    const ap = attackParts();
    const hit = ap.final;

    const rc = resolveDebuff('combo', true);   // 보호력 실제 소모 + 디버프 소진
    const ra = resolveDebuff('attack', true);
    if (rc.who.length > 0) {
      const names = rc.who.map(e => e.name).join(', ');
      if (ap.comboRaw === 0) log('ℹ️ ' + names + '의 콤보 디버프가 발동했지만 활성 콤보가 없어 영향이 없었습니다.');
      else if (ap.comboLoss > 0) log('💥 [디버프 발동] ' + names + ' → 콤보 보너스 ' + ap.comboRaw + ' ➔ ' + ap.comboNet + ' (-' + ap.comboLoss + ', 보호 ' + rc.absorbed + ' 방어)', true);
      else log('🛡 ' + names + '의 콤보 디버프를 보호석으로 모두 방어했습니다! (콤보 ' + ap.comboRaw + ' 유지)', 'good');
    }
    if (ra.who.length > 0) {
      const names = ra.who.map(e => e.name).join(', ');
      if (ap.atkLoss > 0) log('💥 [디버프 발동] ' + names + ' → 공격력 ' + ap.pre + ' ➔ ' + ap.final + ' (-' + ap.atkLoss + ', 보호 ' + ra.absorbed + ' 방어)' + (ap.rawFinal < ap.attackFloor ? ' · 🧱 50% 하한 적용' : ''), true);
      else log('🛡 ' + names + '의 공격력 디버프를 보호석으로 모두 방어했습니다!', 'good');
    }

    let remaining = hit;
    const startPierce = totalPierce();
    let pierceLeft = startPierce;
    let targetIndex = 0, pierceKillCount = 0;
    const parts = [];
    while (remaining > 0 && enemies.length > 0) {
      const t = enemies[0];
      const before=t.hp;
      const dmg = Math.min(t.hp, remaining);
      t.hp -= dmg;
      remaining -= dmg;
      parts.push(t.name + ' ' + dmg);
      battleEvents.push({type:targetIndex>0?'pierce':'strike',label:targetIndex>0?'관통 피해':'기본 공격',id:battleEnemyIndex.get(t),name:t.name,before,damage:dmg,after:t.hp,killed:t.hp===0,pierceIndex:targetIndex});
      if (t.hp === 0) {
        killedEnemies.push(t.name);
        if (targetIndex > 0) pierceKillCount++;
        if (t.boss) { bossKilled = true; killedBossZones.add(t.debuffZone); }
        enemies.shift();
        if (remaining > 0 && pierceLeft > 0) {
          pierceLeft--;
          targetIndex++;
          continue;
        }
      }
      break;
    }

    const singleActual = parts.reduce((sum, part) => sum + Number((part.match(/ (\d+)$/) || [0,0])[1]), 0);
    stats.damageDealt += singleActual;
    stats.overkillDamage += Math.max(0, remaining);
    if (startPierce > 0 && parts.length > 1) {
      stats.pierceDamage += parts.slice(1).reduce((sum, part) => sum + Number((part.match(/ (\d+)$/) || [0,0])[1]), 0);
      stats.pierceKills += pierceKillCount;
    }
    stats.attackDebuffLoss += ap.atkLoss;
    stats.protectionPointsUsed += (rc.absorbed || 0) + (ra.absorbed || 0);

    singleLog = '⚔️ 공격력 ' + hit + ' ➔ ' + (parts.length ? parts.join(' ➔ ') + ' 피해' : '피해 없음') +
      (startPierce > 0 ? ' [관통 ' + startPierce + ']' : '') +
      (remaining > 0 ? ' (초과 피해 ' + remaining + ' 소멸)' : '');
  }

  // 3) 생존한 보석사냥꾼의 약탈 판정 (실패할 수도 있음, 결과와 약탈 정도를 표시)
  enemies.filter(e => e.steal && isEnemyDebuffActive(e)).forEach(e => {
    if (gems <= 0) {
      stealLines.push({ text: '💎 ' + e.name + ': 훔칠 보석이 없어 빈손으로 물러났습니다.', good: true });
      return;
    }
    const amount = Math.min(gems, Math.max(e.steal.min, Math.ceil(gems * e.steal.pct)));
    const roll = Math.floor(Math.random() * 100) + 1;
    const need = Math.round(e.steal.chance * 100);
    if (roll > need) {
      stealLines.push({ text: '💎 ' + e.name + ' 약탈 실패! (판정 ' + roll + ' > 성공구간 ' + need + ') — 성공했다면 보석 -' + amount + ' 였습니다. (보유 ' + gems + ')', good: true });
      return;
    }
    const res = consume('gem', amount);
    const stolen = Math.min(gems, res.remainingPenalty);
    gems -= stolen;
    stealLines.push({
      text: '💎 ' + e.name + ' 약탈 ' + (stolen > 0 ? '성공' : '무산') + '! (판정 ' + roll + ' ≤ ' + need + ') — 보석 -' + stolen +
        (res.blockedAmount ? ' (보석 보호 ' + res.blockedAmount + ' 방어)' : '') + ' · 남은 보석 ' + gems,
      good: stolen === 0
    });
  });

  while (killedBossZones.has(activeDebuffZone)) {
    const cleared = activeDebuffZone;
    activeDebuffZone++;
    log('🔓 구간 보스 처치! ' + ((cleared - 1) * 5 + 1) + '~' + (cleared * 5) + 'R 디버프 종료 → ' + ((activeDebuffZone - 1) * 5 + 1) + '~' + (activeDebuffZone * 5) + 'R 적 디버프 활성화', 'good');
  }

  const scoredParts = attackParts();
  stats.maxPreDebuffAttack = Math.max(stats.maxPreDebuffAttack, scoredParts.pre);
  stats.maxEffectiveAttack = Math.max(stats.maxEffectiveAttack, scoredAttack);
  stats.maxAttack = stats.maxEffectiveAttack;
  if (scoredComboBonus > 0) { stats.comboBonus += scoredComboBonus; stats.comboTriggers += scoredCombos.length + scoredLinkTriggers; }
  stats.enemiesKilled += killedEnemies.length;
  if (bossKilled) { stats.bossesKilled++; if (stats.firstBossKillRound == null) stats.firstBossKillRound = round; }
  // v0.2.14: R30 공식 기록은 전투 종료 처리 후 freezeOfficialRecord()에서 확정

  const battleComboNames = scoredCombos.map(x=>x.name);
  const battleLinkNames = Object.keys(roundLinkDone).filter(k=>roundLinkDone[k]).map(k=>{
    const id=k.slice(2); const pool=k.startsWith('t_')?TACTICAL_LINKS:ACTION_LINKS; const z=pool.find(x=>x.id===id); return z?z.name:id;
  });
  if (scoredComboBonus >= 10 || battleComboNames.length || battleLinkNames.length || killedEnemies.length >= 3) {
    const title = battleLinkNames.length ? '🔗 연계 공격 폭발!' : battleComboNames.length ? '🔥 콤보 공격!' : '💥 대량 격파!';
    const bits=[]; if(battleLinkNames.length) bits.push(battleLinkNames.join(' + ')); if(battleComboNames.length) bits.push(battleComboNames.join(' + ')); if(scoredComboBonus) bits.push('콤보 공격 +'+scoredComboBonus); if(aoeTotal) bits.push('광역 '+aoeTotal+'×'+(enemies.length+killedEnemies.length)); if(killedEnemies.length) bits.push(killedEnemies.length+'킬');
    actionFlash(title,bits.join(' · '),'battle-burst');
  }

  pendingBattleScene={
    attackPre:scoredParts.pre, attackFinal:scoredAttack, comboBonus:scoredComboBonus,
    comboNames:battleComboNames, linkNames:battleLinkNames, aoe:aoeTotal,
    enemyStart:battleEnemyStart, killed:[...killedEnemies], remaining:enemies.map(e=>({name:e.name,hp:e.hp,boss:!!e.boss})),
    single:singleLog, attackLoss:scoredParts.atkLoss||0, pierce:totalPierce(),
    mvp:pickBattleMvp(scoredComboBonus,aoeTotal,battleEnemyStart.length,battleComboNames,battleLinkNames,killedEnemies.length),
    events:battleEvents
  };

  tempAttack = 0;
  pierce = 0;
  linkComboAttack = 0; roundActionHistory = []; roundLinkDone = {};
  updateEnemyStatus();

  if (aoeLog) log(aoeLog);
  if (singleLog) log(singleLog);
  stealLines.forEach(l => log(l.text, l.good ? 'good' : true));
  if (killedEnemies.length > 0) log('☠ 처치: ' + killedEnemies.join(', '), 'good');
  log('👹 남은 적 ' + enemies.length + '마리 (누적 HP ' + total() + ')');

  if (dangerActive) {
    const stillDanger = enemies.length > gameOverEnemyLimit(round) || total() > gameOverHpLimit(round);
    if (stillDanger) { gameOver(); return; }
    dangerActive = false;
    stats.dangerEscapes++;
    log('✅ DANGER 탈출! 적 누적 상태를 안전선 아래로 낮췄습니다.', 'good');
  }

  if (round === 30 && !officialRecord) {
    const c=bossKilled?'officialBoss':'officialNext';
    if(shouldPlayBattleMotion()) showBattleCinematic(c); else freezeOfficialRecord(bossKilled ? 'bossReward' : 'nextRound');
    return;
  }
  if (bossKilled) {
    if(shouldPlayBattleMotion()) showBattleCinematic('bossReward'); else bossReward();
    return;
  }

  if (shouldPlayBattleMotion()) showBattleCinematic('nextRound'); else nextRound();
}

function pickBattleMvp(combo,aoe,count,combos,links,kills){
  const aoeImpact=aoe*count;
  if(aoeImpact>=combo && aoeImpact>0) return {title:'💥 광역 화력',value:aoe+' × '+count+' = '+aoeImpact+' 잠재 피해',detail:'쌓인 적을 한 번에 압박한 핵심 효과'};
  if(combo>0) return {title:links.length?'🔗 '+links[0]:(combos.length?'🔥 '+combos[0]:'🔥 콤보'),value:'추가 공격 +'+combo,detail:(links.concat(combos).join(' · ')||'연계/콤보 공격')};
  return {title:'⚔️ 기본 화력',value:kills+'킬',detail:'이번 전투의 주력 공격'};
}
function renderBattleStage(){
  const el=$('battleStage'); if(!el) return;
  if(phase!=='battle'){ el.classList.add('hide'); return; }
  const ap=attackParts(), foes=enemies.slice(0,12).map(e=>'<div class="battle-foe '+(e.boss?'boss':'')+'"><span>'+(e.boss?'👑':'👹')+'</span><small>'+e.name+'<br>HP '+e.hp+'</small></div>').join('');
  el.classList.remove('hide'); el.innerHTML='<div class="battle-stage-title">⚔️ 전투 준비</div><div class="battle-field"><div class="battle-hero"><span>🧙</span><b>공격력 '+ap.final+'</b><small>전투 전 '+ap.pre+(totalPierce()?' · 관통 '+totalPierce():'')+(totalAoe()?' · 광역 '+totalAoe():'')+'</small></div><div class="battle-vs">VS</div><div class="battle-army">'+foes+'<b>적 '+enemies.length+' · HP '+total()+'</b></div></div><div class="battle-ready-note">전투 시작 시 연계/콤보 → 디버프 → 광역 → 기본 공격/관통 → 처치 순으로 표시됩니다.</div>';
}
function showBattleCinematic(cont){
  const b=pendingBattleScene; if(!b){ if(cont==='bossReward') bossReward(); else nextRound(); return; }
  if($('modalTitle')) $('modalTitle').textContent='⚔️ ROUND '+round+' 전투 재생';
  const foes=b.enemyStart.map(e=>'<div class="cin-foe '+(e.boss?'boss':'')+'" data-eid="'+e.id+'"><span class="cin-icon">'+(e.boss?'👑':'👹')+'</span><b>'+e.name+'</b><div class="cin-hp"><i style="width:100%"></i></div><small>HP <strong class="cin-hpnum">'+e.hp+'</strong> / '+e.hp+'</small><em class="cin-dmg"></em></div>').join('');
  if($('modalContent')) $('modalContent').innerHTML='<div class="combat-cinematic live"><div class="cin-head"><div class="cin-hero"><span>🧙</span><b>공격력 '+b.attackFinal+'</b><small>'+(b.pierce?'관통 '+b.pierce:'단일 공격')+(b.aoe?' · 광역 '+b.aoe:'')+'</small></div><div class="cin-clash">⚔️</div><div class="cin-summary">적 '+b.enemyStart.length+'마리</div></div><div class="cin-banner" id="cinBanner">전투 개시!</div><div class="cin-army">'+foes+'</div><div class="cin-feed" id="cinFeed"></div><div class="combat-mvp cin-mvp hide" id="cinMvp"><small>🏆 이번 전투 MVP</small><b>'+b.mvp.title+'</b><strong>'+b.mvp.value+'</strong><p>'+b.mvp.detail+'</p></div><button id="battleContinueBtn" class="primary-btn hide">계속</button></div>';
  if($('modal')) $('modal').classList.remove('hide');
  if($('close')) $('close').onclick=()=>finishBattleCinematic(cont);
  playBattleCinematic(b,cont);
}
function cinWait(ms){ return new Promise(r=>setTimeout(r,ms)); }
function cinBanner(text,cls){ const el=$('cinBanner'); if(!el)return; el.className='cin-banner '+(cls||''); el.textContent=text; void el.offsetWidth; el.classList.add('pulse'); }
function cinFeed(text){ const el=$('cinFeed'); if(!el)return; const d=document.createElement('div'); d.textContent=text; el.prepend(d); while(el.children.length>3) el.lastChild.remove(); }
function cinFoe(id){ return document.querySelector('.cin-foe[data-eid="'+id+'"]'); }
async function cinHit(hit,kind,delay=360){
  const el=cinFoe(hit.id); if(!el)return;
  const hp=el.querySelector('.cin-hpnum'), bar=el.querySelector('.cin-hp i'), dmg=el.querySelector('.cin-dmg');
  el.classList.remove('hit','aoe-hit','pierce-hit','dead'); void el.offsetWidth;
  el.classList.add(kind==='aoe'?'aoe-hit':kind==='pierce'?'pierce-hit':'hit');
  dmg.textContent='-'+hit.damage; dmg.className='cin-dmg show '+kind;
  hp.textContent=hit.after; const max=Math.max(1,hit.before+(Number(hp.dataset.lost)||0));
  const original=Number(el.querySelector('small').textContent.match(/\/ (\d+)/)?.[1]||hit.before); bar.style.width=Math.max(0,hit.after/original*100)+'%';
  await cinWait(delay);
  if(hit.killed){ el.classList.add('dead'); dmg.textContent='K.O.'; cinFeed('☠ '+hit.name+' 처치'); }
  await cinWait(120);
}
async function playBattleCinematic(b,cont){
  const token=b; await cinWait(300); if(pendingBattleScene!==token)return;
  if(b.linkNames.length||b.comboNames.length||b.comboBonus){ cinBanner('🔗 연계 / 콤보 공격 +'+b.comboBonus,'link'); cinFeed((b.linkNames.concat(b.comboNames).join(' · ')||'전술 보너스')+' → 공격 증폭'); await cinWait(700); }
  if(b.attackLoss>0){ cinBanner('💢 적 디버프 · 공격 '+b.attackPre+' → '+b.attackFinal,'debuff'); cinFeed('공격력 -'+b.attackLoss+' 적용'); await cinWait(650); }
  for(const ev of (b.events||[])){
    if(pendingBattleScene!==token)return;
    if(ev.type==='aoe'){
      cinBanner('💥 광역 공격 '+ev.amount+' · 전 적군 동시 타격!','aoe'); cinFeed('광역 피해가 '+ev.hits.length+'마리에게 동시에 적용');
      const ps=ev.hits.map(h=>cinHit(h,'aoe',430)); await Promise.all(ps); await cinWait(420);
    } else {
      const kind=ev.type==='pierce'?'pierce':'strike';
      cinBanner(ev.type==='pierce'?'🗡 관통! 초과 화력이 다음 적에게!':'⚔️ 기본 공격 '+b.attackFinal,' '+kind);
      cinFeed((ev.type==='pierce'?'관통 피해':'기본 피해')+' → '+ev.name+' -'+ev.damage);
      await cinHit(ev,kind,520); await cinWait(260);
    }
  }
  if(pendingBattleScene!==token)return;
  cinBanner('☠ '+b.killed.length+'킬 · 적 '+b.enemyStart.length+' → '+b.remaining.length,'result');
  cinFeed('전투 종료 · 남은 적 HP '+b.remaining.reduce((a,x)=>a+x.hp,0));
  await cinWait(500);
  const m=$('cinMvp'); if(m)m.classList.remove('hide'); const bc=$('battleContinueBtn'); if(bc){bc.classList.remove('hide');bc.onclick=()=>finishBattleCinematic(cont);bc.scrollIntoView({block:'nearest',behavior:'smooth'});}
}

function finishBattleCinematic(cont){ pendingBattleScene=null; if($('modal')) $('modal').classList.add('hide'); if($('close')) $('close').onclick=handleModalClose; if(cont==='officialBoss') freezeOfficialRecord('bossReward'); else if(cont==='officialNext') freezeOfficialRecord('nextRound'); else if(cont==='bossReward') bossReward(); else nextRound(); }

function freezeOfficialRecord(continuation){
  if(officialRecord) return false;
  const playMs=currentPlayMs();
  stats.round30Clear=true;
  const score=scoreValue();
  officialRecord={round:30,score,playMs,recordedAt:new Date().toISOString()};
  stats.officialScore=score; stats.officialPlayMs=playMs;
  pendingOfficialContinuation=continuation || 'nextRound';
  log('🏆 R30 공식전 완료! 공식 점수 '+score.toLocaleString()+' · 플레이타임 '+formatPlayTime(playMs), 'good');
  showOfficialCompleteModal();
  if (window.LuckHistory) window.LuckHistory.save('clear');
  render();
  return true;
}
function showOfficialCompleteModal(){
  if(!officialRecord) return;
  if($('modalTitle')) $('modalTitle').textContent='🏆 ROUND 30 공식전 완료';
  if($('modalContent')) $('modalContent').innerHTML='<div class="official-complete"><b>공식 기록이 확정되었습니다.</b><div class="official-record-grid"><span>🏆 공식 점수<strong>'+officialRecord.score.toLocaleString()+'</strong></span><span>⏱ 플레이타임<strong>'+formatPlayTime(officialRecord.playMs)+'</strong></span></div><p>R31부터는 ♾ 무한모드입니다. 이후 성장과 점수는 공식 기록을 변경하지 않습니다.</p><div class="official-actions"><button onclick="finishOfficialOnly()">여기서 종료</button><button class="endless" onclick="continueEndless()">♾ 무한모드 계속</button></div></div>';
  if($('close')) $('close').onclick=showOfficialCompleteModal;
  if($('modal')) $('modal').classList.remove('hide');
}
function finishOfficialOnly(){
  phase='complete'; pendingOfficialContinuation=null;
  if($('modal')) $('modal').classList.add('hide');
  log('🏁 공식 기록으로 도전을 종료했습니다.', 'good'); render();
}
function continueEndless(){
  endlessMode=true; stats.endlessMaxRound=Math.max(stats.endlessMaxRound,30);
  const cont=pendingOfficialContinuation; pendingOfficialContinuation=null;
  if($('modal')) $('modal').classList.add('hide');
  if($('close')) $('close').onclick=handleModalClose;
  log('♾ 무한모드 진입! 공식 점수와 공식 플레이타임은 R30 기록으로 고정됩니다.', 'good');
  if(cont==='bossReward') bossReward(); else nextRound();
}
function showRoundResultModal(singleLog, aoeLog, killedEnemies, stealLines) {
  stealLines = stealLines || [];
  const killedHtml = killedEnemies.length > 0
    ? killedEnemies.map(k => '<b style="color:#4ade80;">• ' + k + ' (처치 완료 🎉)</b>').join('<br>')
    : '<span style="color:#9ca3af;">처치한 적 없음</span>';

  const remainingHtml = enemies.length > 0
    ? enemies.map(e => '<div style="color:#fca5a5;">• ' + e.name + ': ' + e.hp + ' HP 남음</div>').join('')
    : '<span style="color:#60a5fa;">적을 모두 소탕했습니다!</span>';

  const stealHtml = stealLines.length > 0
    ? '<div style="background:#2a2410; padding:10px; border-radius:6px; border:1px solid #f59e0b;">' +
        '<b style="color:#fbbf24;">💎 보석 약탈 결과</b>' +
        '<div style="margin-top:4px; font-size:12px;">' +
        stealLines.map(l => '<div style="color:' + (l.good ? '#86efac' : '#fca5a5') + ';">' + l.text + '</div>').join('') +
        '</div></div>'
    : '';

  if ($('modalTitle')) $('modalTitle').textContent = '📊 ROUND ' + round + ' 전투 결과';
  if ($('modalContent')) {
    $('modalContent').innerHTML =
      '<div style="text-align:left; font-size:13px; display:flex; flex-direction:column; gap:10px;">' +
        '<div style="background:#1e293b; padding:10px; border-radius:6px; border:1px solid #3b82f6;">' +
          '<b style="color:#60a5fa;">⚔ 이번 라운드 공격 요약</b>' +
          '<div style="margin-top:4px; font-size:12px; color:#e2e8f0;">' +
            (aoeLog ? '<div>' + aoeLog + '</div>' : '') +
            (singleLog ? '<div>' + singleLog + '</div>' : '') +
          '</div>' +
        '</div>' +
        '<div style="background:#14532d; padding:10px; border-radius:6px; border:1px solid #22c55e;">' +
          '<b style="color:#86efac;">☠ 처치된 적</b>' +
          '<div style="margin-top:4px; font-size:12px;">' + killedHtml + '</div>' +
        '</div>' +
        stealHtml +
        '<div style="background:#311215; padding:10px; border-radius:6px; border:1px solid #ef4444;">' +
          '<b style="color:#f87171;">⚠️ 다음 라운드로 누적되는 적 (' + enemies.length + '마리)</b>' +
          '<div style="margin-top:4px; font-size:12px;">' + remainingHtml + '</div>' +
        '</div>' +
        '<button onclick="confirmRoundResult()" style="padding:10px; background:#2563eb; color:white; font-weight:bold; border:none; border-radius:6px; cursor:pointer; margin-top:4px;">▶️ 다음 라운드로 진행</button>' +
      '</div>';
  }
  if ($('modal')) $('modal').classList.remove('hide');
}

function confirmRoundResult() {
  if ($('modal')) $('modal').classList.add('hide');
  nextRound();
}

function nextRound() {
  phase = 'battle'; // v0.2.13: 보상 직후 다음 라운드 생성/드로우 로그가 reward로 남지 않도록 먼저 전환
  resource = 0;
  round++;
  if(endlessMode) stats.endlessMaxRound=Math.max(stats.endlessMaxRound,round);

  const overEnemy = enemies.length > gameOverEnemyLimit(round);
  const overHp = total() > gameOverHpLimit(round);
  if (overEnemy || overHp) { dangerActive = true; stats.dangerEntries++; }
  addEnemy();
  if (dangerActive) {
    const enemyLimit = gameOverEnemyLimit(round), hpLimit = gameOverHpLimit(round);
    const needEnemies = Math.max(0, enemies.length - enemyLimit);
    const needHp = Math.max(0, total() - hpLimit);
    const dangerNeeds = [];
    if (needEnemies > 0) dangerNeeds.push('적 ' + needEnemies + '마리 처치');
    if (needHp > 0) dangerNeeds.push('HP ' + needHp + ' 이상 감소');
    log('🚨 DANGER! 현재 적 ' + enemies.length + '/' + enemyLimit + '마리 · 누적 HP ' + total() + '/' + hpLimit +
      ' — 이번 전투 생존 조건: ' + dangerNeeds.join(' + ') + '!', true);
  }

  if (isVisualMode()) {
    showRoundStartModal();
  } else {
    drawStart();
  }
}


/* 
  [요구사항 4 적용] 구매 시 덱 셔플
  - 구매한 카드를 deck과 draw 더미에 추가한 후 shuffle(draw)를 실행하여 무작위로 섞습니다.
*/
function buy(list, id) {
  if (phase !== 'shop') return;
  let s = list.find(x => x.id === id);
  if (!s) return;
  let n = buyCount[id] || 0;
  if (n >= s.limit) return log('재고 소진');
  if (resource < s.price) return log('자원 부족');
  actionFlash('🛒 '+s.name, '구매 확정 · 💰 '+s.price, 'buy');
  focusSection('shopPanel');
  resource -= s.price;
  buyCount[id] = n + 1;
  
  const newCard = cp(s);
  addNewCard(newCard);
  stats.cardsBought++;
  
  log('🛒 ' + s.name + ' 구매 완료! (' + (persistentDraw ? '묘지에 추가 — 다음 셔플 때부터 등장합니다' : '덱에 추가 후 드로우 덱이 무작위로 섞였습니다') + ')');
  render();
}

function buyBasic(id) { buy(BASIC, id); }
function buyRandom(id) { buy(randomShop, id); }

window.confirmRewardAndNext = function() {
  rewardRevealPending = false;
  if ($('modal')) $('modal').classList.add('hide');
  nextRound();
};

function showDrawnCardModal(card, title) {
  title = title || '🎁 카드 획득 완료!';
  if ($('modalTitle')) $('modalTitle').textContent = title;
  if ($('modalContent')) {
    $('modalContent').innerHTML = 
      '<div style="text-align:left; font-size:13px; display:flex; flex-direction:column; gap:10px;">' +
        '<div style="background:#22152a; border:2px solid #a855f7; padding:14px; border-radius:8px; text-align:center;">' +
          '<span style="font-size:10px; font-weight:bold; color:#c084fc; background:#581c87; padding:2px 6px; border-radius:4px;">NEW CARD</span>' +
          '<h3 style="color:#e9d5ff; font-size:18px; margin:8px 0 4px 0;">' + card.name + '</h3>' +
          '<p style="color:#fde047; font-weight:bold; font-size:14px; margin-bottom:6px;">' + (card.type === 'attack' ? '⚔️ 공격 +' + card.atk : (card.text || '')) + '</p>' +
          '<p style="color:#94a3b8; font-size:11px;">구매한 카드가 덱에 추가되고 드로우 덱이 무작위로 섞였습니다.</p>' +
        '</div>' +
        '<button onclick="confirmRewardAndNext()" style="padding:8px; background:#2563eb; color:white; font-weight:bold; border:none; border-radius:6px; cursor:pointer;">확인</button>' +
      '</div>';
  }
  if ($('modal')) $('modal').classList.remove('hide');
}

function showDrawnCardsModal(cards, title) {
  if ($('modalTitle')) $('modalTitle').textContent = title;
  if ($('modalContent')) {
    $('modalContent').innerHTML =
      '<div class="reward-reveal-head">🎁 획득한 카드 <b>'+cards.length+'장</b> · 효과와 전략을 확인하세요.</div>'+
      '<div class="reward-reveal-grid">' +
        cards.map(card =>
          '<div class="reward-reveal-card '+(card.rarity==='legend'?'legend':'')+'">' +
            '<span>NEW CARD · '+cardCategory(card)+'</span>' +
            '<h3>' + card.name + '</h3>' +
            '<div class="reward-effect">' + (card.text || '') + '</div>' +
            '<p>💡 '+strategyText(card)+'</p>'+
          '</div>').join('') +
      '</div>'+
      '<button onclick="confirmRewardAndNext()" style="width:100%;margin-top:9px;padding:8px;background:#2563eb;color:white;font-weight:bold;border:none;border-radius:6px;cursor:pointer;">다음 라운드로</button>';
  }
  if ($('modal')) $('modal').classList.remove('hide');
}

function bossReward() {
  phase = 'reward';
  rewardLocked = false;
  rewardRevealPending = false;
  rewards = [
    ['🔄 상점 교체', '현재 재고가 남은 랜덤 상점 카드 중 최대 3장을 새 카드로 교체합니다. 한 번 랜덤 상점에 등장한 카드는 같은 게임의 랜덤 상점에는 다시 등장하지 않습니다. (랜덤 카드 보상/행운 효과 획득은 가능)', () => {
      const occupied=randomShop.map((x,idx)=>({x,idx,remain:Math.max(0,(x.limit||0)-(buyCount[x.id]||0))})).filter(z=>z.remain>0);
      const unseen=shuffle(RANDOM_POOL.filter(x=>!randomShopSeen.has(x.id)).map(x=>({...x,protect:x.protect?{...x.protect}:undefined})));
      const changeCount=Math.min(3, occupied.length, unseen.length);
      if(changeCount<=0){
        log('🔄 랜덤 상점 교체: 새로 발견할 카드가 없거나 교체 가능한 재고 슬롯이 없습니다. 변화 없음.', true);
        showShopRerollResult([], occupied.map(z=>z.x.name), true); return;
      }
      const targets=shuffle(occupied).slice(0,changeCount), changes=[];
      targets.forEach((z,i)=>{
        const src=unseen[i], before=z.x;
        const replacement={...src,limit:z.remain,protect:src.protect?{...src.protect}:undefined};
        buyCount[replacement.id]=0; randomShop[z.idx]=replacement; randomShopSeen.add(replacement.id);
        changes.push({before:before.name, after:replacement.name, text:replacement.text||''});
      });
      stats.randomShopUniqueSeen=randomShopSeen.size; stats.shopRerollCardsChanged+=changes.length;
      const kept=randomShop.filter((x,idx)=>!targets.some(t=>t.idx===idx)).map(x=>x.name);
      log('🔄 랜덤 상점 교체 ['+changes.length+'장] ➔ '+changes.map(c=>c.before+' → '+c.after).join(' / ')+(kept.length?' · 유지: '+kept.join(', '):''), 'good');
      showShopRerollResult(changes, kept, false);
    }],
    ['📦 재입고', '기본 상점 모든 카드 재고 +' + BOSS_RESTOCK_BASIC + ' / 현재 랜덤 상점 카드 재고 +' + BOSS_RESTOCK_RANDOM + ' (재입고는 보스 보상으로만 받을 수 있습니다)', () => {
      BASIC.forEach(b => { buyCount[b.id] = (buyCount[b.id] || 0) - BOSS_RESTOCK_BASIC; });
      randomShop.forEach(x => { x.limit += BOSS_RESTOCK_RANDOM; });
      log('📦 보스 보상 ➔ 재입고! 기본 상점 재고 +' + BOSS_RESTOCK_BASIC + ' / 랜덤 상점 재고 +' + BOSS_RESTOCK_RANDOM, 'good');
      nextRound();
    }],
    ['🎁 랜덤 카드 3장', '랜덤 풀에서 서로 다른 카드 3장을 즉시 덱에 추가합니다.', () => {
      const cards = shuffle([...RANDOM_POOL]).slice(0, 3).map(p => {
        let src=p;
        if(Math.random()<.02){ src=[...BASE.filter(x=>['dagger','sword','smash'].includes(x.id))][Math.floor(Math.random()*3)]; stats.baseCardsRecovered++; }
        const nc = cp(src); addNewCard(nc); return nc;
      });
      log('🎁 보스 보상 ➔ ' + cards.map(c => '[' + c.name + ']').join(' ') + ' 3장 획득! ' + cards.map(c => c.name + ': ' + (c.text || '')).join(' / '), 'good');
      actionFlash('🎁 보스 랜덤 카드 보상!', cards.map(c => c.name).join(' · '), 'luck');
      // 선택 즉시 보상을 확정한다. 팝업의 X/확인 어느 쪽이든 다음 라운드로만 진행한다.
      rewardRevealPending = true;
      if ($('close')) $('close').onclick = handleModalClose;
      showDrawnCardsModal(cards, '🎉 보스 보상 · 랜덤 카드 3장 획득!');
    }],
    ['🧿 만능승급석', '만능승급석 1장을 덱에 추가합니다. 손패에서 사용하면 단검/검/강타 중 하나를 선택해 승급 재료로 바꿉니다. 잘못 선택해도 되돌릴 수 없습니다.', () => {
      addNewCard(cp(PROMOTION_STONE));
      log('🧿 보스 보상 ➔ [만능승급석] 획득! 드로우 후 사용할 때 승급 재료를 선택합니다.', 'good');
      nextRound();
    }]
  ];
  log('👑 보스 보상 선택');
  render();
}

function showShopRerollResult(changes, kept, noChange){
  if($('modalTitle')) $('modalTitle').textContent='🔄 랜덤 상점 교체 결과';
  const rows=changes.length?changes.map(c=>'<div class="reroll-row"><div class="reroll-old">'+c.before+'</div><div class="reroll-arrow">→</div><div class="reroll-new"><b>'+c.after+'</b><small>'+c.text+'</small></div></div>').join(''):'<div class="reroll-empty">교체 가능한 새로운 카드가 없습니다.</div>';
  if($('modalContent')) $('modalContent').innerHTML='<div class="reroll-result">'+rows+(kept.length?'<div class="reroll-kept">유지 · '+kept.join(', ')+'</div>':'')+'<p class="reroll-note">※ 랜덤 상점 재등장만 제한됩니다. 랜덤 카드 획득/행운 효과에서는 획득할 수 있습니다.</p><button class="primary-btn" onclick="confirmShopReroll()">다음 라운드로</button></div>';
  if($('close')) $('close').onclick=confirmShopReroll; if($('modal')) $('modal').classList.remove('hide'); render();
}
function confirmShopReroll(){ if($('modal')) $('modal').classList.add('hide'); if($('close')) $('close').onclick=handleModalClose; nextRound(); }

function reward(i) {
  if (rewardLocked || phase !== 'reward') return;
  if (rewards[i] && rewards[i][2]) {
    rewardLocked = true;
    const chosen = rewards[i][0];
    log('🏆 보상 확정: ' + chosen);
    rewards[i][2]();
    render();
  }
}

function useGem(all) {
  if (gems <= 0) return;
  const n = all ? gems : 1;
  gems -= n;
  if (phase === 'shop') {
    resource += 2 * n;
    log('💎 ' + n + '개 → 자원 +' + (2 * n) + (all ? ' (일괄 변환)' : ''));
  } else {
    tempAttack += 2 * n;
    log('💎 ' + n + '개 → 이번 전투 공격 +' + (2 * n) + (all ? ' (일괄 변환)' : ''));
  }
  render();
}

function next() {
  if (phase === 'hand') {
    phase = 'shop';
    log('🃏 손패 단계 완료 → 상점 단계');
    render();
    return;
  }
  if (phase === 'shop') {
    phase = 'battle';
    log('🛒 상점 단계 완료 → 전투 단계');
    render();
    return;
  }
  if (phase === 'battle') {
    battle();
    return;
  }
  if (phase === 'reward') {
    log('👑 보스 보상을 먼저 선택하세요.');
    return;
  }
}

function gameOver() {
  phase = 'gameover';
  const reason = enemies.length > gameOverEnemyLimit(round)
    ? '적이 ' + enemies.length + '마리 누적되었습니다. (한계 ' + gameOverEnemyLimit(round) + '마리)'
    : '누적 적 HP가 ' + total() + '입니다. (한계 ' + gameOverHpLimit(round) + ')';
  log('💀 GAME OVER — ' + reason, true);
  if (window.LuckHistory) window.LuckHistory.save('gameover', reason);
  if ($('modalTitle')) $('modalTitle').textContent = '💀 GAME OVER';
  if ($('modalContent')) $('modalContent').innerHTML = '<p>' + reason + '</p><p>ROUND ' + round + ' · 덱 ' + deck.length + '장</p><button onclick="start()">다시 시작</button>';
  if ($('modal')) $('modal').classList.remove('hide');
}

function deckView() {
  const getCounts = (arr) => {
    let m = {};
    arr.forEach(c => m[c.name] = (m[c.name] || 0) + 1);
    return Object.entries(m).map(x => '<p style="margin:2px 0;">• ' + x[0] + ' × ' + x[1] + '</p>').join('') || '<p style="color:#6b7280;margin:2px 0;">없음</p>';
  };

  if ($('modalTitle')) $('modalTitle').textContent = '📚 내 덱 상세 (총 ' + deck.length + '장)';
  if ($('modalContent')) {
    $('modalContent').innerHTML = 
      '<div style="font-size:12px; display:flex; flex-direction:column; gap:10px; text-align:left;">' +
        '<div style="background:#222630; padding:8px; border-radius:6px;">' +
          '<b style="color:#67e8f9;">🃏 손패 (' + hand.length + '장)</b>' +
          getCounts(hand) +
        '</div>' +
        '<div style="background:#222630; padding:8px; border-radius:6px;">' +
          '<b style="color:#a78bfa;">🎴 남은 카드 (드로우 덱: ' + draw.length + '장)</b>' +
          getCounts(draw) +
        '</div>' +
        '<div style="background:#222630; padding:8px; border-radius:6px;">' +
          '<b style="color:#f87171;">🗑 사용한 카드 (버린 더미: ' + graveyard.length + '장)</b>' +
          getCounts(graveyard) +
        '</div>' +
      '</div>';
  }
  if ($('modal')) $('modal').classList.remove('hide');
}

/* 
  [요구사항 2 적용] 공격력 산출 상세 분석 레이어 업데이트
  - 기본 덱, 임시 버프, 콤보/시너지 가산값, 적 디버프 차감 수치를 항목별로 계산하여 출력
*/
function updateAtkTooltip() {
  const tooltip = $('atkTooltip');
  if (!tooltip) return;

  const row = (label, val, color) =>
    '<div style="display:flex; justify-content:space-between; gap:8px; color:' + color + ';"><span>• ' + label + '</span><b>' + val + '</b></div>';

  const ap = attackParts();
  let rows = row('기본 덱 공격력', '+' + deckAtk(), '#f8fafc') +
             (bonusAtk > 0 ? row('일회용 이력 영구 보너스', '+' + bonusAtk, '#fbbf24') : '') +
             row('카드/보석 임시 버프', '+' + tempAttack, '#fbbf24');

  evalCombos().forEach(cb => {
    rows += row(cb.name + ' (' + comboProgress(cb) + ')', '+' + (cb.ok ? cb.bonus : 0), cb.ok ? '#4ade80' : '#64748b');
  });
  if (ap.comboLoss > 0) rows += row('콤보 디버프', '-' + ap.comboLoss, '#f87171');
  if (ap.atkLoss > 0) rows += row('공격력 디버프', '-' + ap.atkLoss, '#f87171');
  if (totalAoe() > 0) rows += row('광역 피해 (전투 시)', totalAoe(), '#f43f5e');
  if (totalPierce() > 0) rows += row('관통 (이번 전투)', totalPierce(), '#38bdf8');

  tooltip.innerHTML =
    '<div style="font-weight:bold; color:#ef4444; border-bottom:1px solid #334155; padding-bottom:4px; margin-bottom:6px; font-size:12px;">⚔️ 공격력 상세 산출 내역</div>' +
    '<div style="display:flex; flex-direction:column; gap:3px; font-size:11px;">' + rows +
      '<div style="border-top:1px solid #334155; margin-top:4px; padding-top:4px; display:flex; justify-content:space-between; font-weight:bold; color:#38bdf8;">' +
        '<span>🎯 최종 예상 공격력:</span><span style="font-size:13px; color:#ef4444;">' + ap.final + '</span>' +
      '</div>' +
    '</div>';
}

function choosePromotionMaterial(stone){
  if($('close')) $('close').onclick=handleModalClose;
  pendingPromotionStoneId = stone.id; pendingChoiceCardId=stone.id; pendingChoiceType='promotionStone';
  if($('modalTitle')) $('modalTitle').textContent='🧿 만능승급석 · 재료 선택';
  if($('modalContent')) $('modalContent').innerHTML='<p><b>재료를 선택하면 즉시 확정되며 되돌릴 수 없습니다.</b><br>선택 전 X로 닫으면 승급석은 사용되지 않고 손패/드로우 순서도 그대로 유지됩니다.<br>선택한 기본 카드는 덱에 들어가며 다음 셔플부터 등장합니다.</p><div class="stone-choice">'+
    BASE.filter(x=>['dagger','sword','smash'].includes(x.id)).map(x=>'<button onclick="resolvePromotionStone(\''+x.id+'\')"><b>'+x.name+'</b><small>공격 +'+x.atk+' · 승급 재료</small></button>').join('')+'</div>';
  if($('modal')) $('modal').classList.remove('hide');
}
function resolvePromotionStone(baseId){
  const src=BASE.find(x=>x.id===baseId); if(!src || !pendingPromotionStoneId || pendingChoiceType!=='promotionStone') return;
  const stoneId=pendingPromotionStoneId;
  const stone=commitChoiceCard(stoneId, true); if(!stone) return;
  pendingPromotionStoneId=null; pendingChoiceCardId=null; pendingChoiceType=null;
  addNewCard(cp(src)); stats.promotionStonesUsed++; stats.baseCardsRecovered++;
  log('🧿 만능승급석 확정 → ['+src.name+'] 선택 · 덱에 승급 재료 추가', 'good');
  if($('modal')) $('modal').classList.add('hide'); render();
}

/* ===== v0.2.6 일회용 이력 / 승급·전직 ===== */
function trackOneuse(c, changes) {
  oneuseUsed++;
  oneuseHistory[c.baseId] = (oneuseHistory[c.baseId] || 0) + 1;

  if (oneuseUsed % ONEUSE_MILESTONE.every === 0) {
    bonusAtk += ONEUSE_MILESTONE.atk;
    changes.push({ text: '🧨 일회용 ' + oneuseUsed + '장 사용 달성 → 영구 공격력 +' + ONEUSE_MILESTONE.atk, color: '#fbbf24' });
  }

  ONEUSE_COMBOS.forEach(cb => {
    if (oneuseDone[cb.id]) return;
    if (!cb.need.every(id => oneuseHistory[id] > 0)) return;
    oneuseDone[cb.id] = true;
    const r = cb.reward;
    if (r.atk) bonusAtk += r.atk;
    if (r.res) resource += r.res;
    if (r.gem) addGems(r.gem);
    changes.push({ text: '✨ 이력 조합 [' + cb.name + '] 완성! ' + cb.text, color: '#4ade80' });
  });
}

function oneuseStatusHtml() {
  if (oneuseUsed === 0 && !deck.some(c => c.type === 'oneuse')) return '';
  const toNext = ONEUSE_MILESTONE.every - (oneuseUsed % ONEUSE_MILESTONE.every);
  let h = '<div style="margin-top:6px; border-top:1px dashed #374151; padding-top:4px;">' +
    '<b style="color:#fbbf24;">🧨 일회용 이력</b> 사용 ' + oneuseUsed + '장 · ' + toNext + '장 더 쓰면 영구 공격 +' + ONEUSE_MILESTONE.atk +
    (bonusAtk > 0 ? ' <span style="color:#9ca3af;">(누적 영구 보너스 +' + bonusAtk + ')</span>' : '');
  ONEUSE_COMBOS.forEach(cb => {
    const done = !!oneuseDone[cb.id];
    const parts = cb.need.map(id => CARD_NAME[id] + (oneuseHistory[id] > 0 ? ' ✔' : ' ✗')).join(' / ');
    h += '<div style="color:' + (done ? '#4ade80' : '#9ca3af') + '; margin-top:2px;">' + (done ? '✅ ' : '• ') + '<b>' + cb.name + '</b>: ' + parts + ' → ' + cb.text + '</div>';
  });
  return h + '</div>';
}

const countInDeck = key => deck.filter(c => cardKey(c) === key).length;
const costText = cost => [cost.res ? '💰' + cost.res : '', cost.gem ? '💎' + cost.gem : ''].filter(Boolean).join(' ');

function canPromote(p) {
  return Object.keys(p.from).every(k => countInDeck(k) >= p.from[k]) &&
    resource >= (p.cost.res || 0) && gems >= (p.cost.gem || 0);
}

// 카드 1장을 덱/손패/드로우/묘지에서 모두 제거 (로그·모달 없음)
function purgeCard(id) {
  const existed = deck.some(c => c.id === id);
  deck = deck.filter(c => c.id !== id);
  hand = hand.filter(c => c.id !== id);
  draw = draw.filter(c => c.id !== id);
  graveyard = graveyard.filter(c => c.id !== id);
  if (existed) stats.cardsRemoved++;
}

function promote(id) {
  if (phase !== 'shop') return;
  const p = PROMOS.find(x => x.id === id);
  if (!p) return;
  if (!canPromote(p)) {
    log('⬆️ 승급 조건이 부족합니다 (재료 카드 / 비용을 확인하세요)', true);
    return;
  }

  const used = [];
  Object.keys(p.from).forEach(k => {
    deck.filter(c => cardKey(c) === k).slice(0, p.from[k]).forEach(c => used.push(c));
  });
  const before = deck.length;
  used.forEach(c => purgeCard(c.id));
  resource -= p.cost.res || 0;
  gems -= p.cost.gem || 0;

  const nc = cp(p.card);
  addNewCard(nc);
  stats.promotions++;
  const tier=p.tier||1; const key='firstPromotionTier'+tier; if(stats[key]==null) stats[key]=round;

  const mats = Object.keys(p.from).map(k => CARD_NAME[k] + ' ×' + p.from[k]).join(' + ');
  log('⬆️ 승급/전직: ' + mats + ' → [' + p.card.name + '] (' + p.card.text + ') · 비용 ' + costText(p.cost) + ' · 덱 ' + before + '장 → ' + deck.length + '장', 'good');
  render();

  if (isVisualMode()) {
    showCardUseModal(nc, [
      { text: '🧩 소모: ' + mats, color: '#f87171' },
      { text: '✨ 획득: ' + p.card.name + ' (' + p.card.text + ')', color: '#4ade80' },
      { text: '📚 덱 ' + before + '장 → ' + deck.length + '장 (비용 ' + costText(p.cost) + ')', color: '#38bdf8' }
    ], '⬆️ 승급 완료: ' + p.card.name);
  }
}

function shopStockForKey(key) {
  const cards = [...BASIC, ...randomShop];
  return cards.reduce((sum, c) => {
    if (cardKey(c) !== key) return sum;
    const left = Math.max(0, (c.limit || 0) - (buyCount[c.id] || 0));
    return sum + left;
  }, 0);
}

function promoMaterialShopState(card) {
  const key = cardKey(card);
  const recipes = PROMOS.filter(p => p.from[key]);
  if (!recipes.length) return '';
  const useful = recipes.some(p => countInDeck(key) < p.from[key]);
  return useful ? ' promo-material-shop' : '';
}

function promoTechTreeHtml(){
  const node=(id,label)=>'<span class="tech-node '+(countInDeck(id)>0?'owned':'')+'">'+label+(countInDeck(id)>0?' ✓':'')+'</span>';
  return '<div class="promo-tech-tree"><div class="tech-title">🧭 승급 테크트리 <small>보유 카드는 ✓ 표시 · 2차부터 전문화 선택</small></div>'+ 
    '<div class="tech-row"><b>관통</b>'+node('hero','용사의 검')+'<i>→</i>'+node('skyhero','천공 용사검')+'<i>→</i>'+node('skyking','천공 성검')+'</div>'+ 
    '<div class="tech-row"><b>광역</b>'+node('hero','용사의 검')+'<i>→</i>'+node('stormhero','폭풍 용사검')+'<i>→</i>'+node('stormking','폭풍 성검')+'</div>'+ 
    '<div class="tech-row"><b>연계</b>'+node('hero','용사의 검')+'<i>→</i>'+node('linkhero','연계 성검')+'<i>→</i>'+node('linkking','연계 왕검')+'</div>'+ 
    '<div class="tech-row"><b>연격</b>'+node('frenzy','삼연 난무')+'<i>→</i>'+node('infinite','무한연격')+'<i>→</i>'+node('zenith','연격의 극의')+'</div></div>';
}
function renderPromo() {
  const box = $('promoList');
  if (!box) return;
  box.innerHTML = promoTechTreeHtml() + PROMOS.map(p => {
    const materialInfo = Object.keys(p.from).map(k => {
      const need = p.from[k], have = countInDeck(k), shop = shopStockForKey(k);
      const missing = Math.max(0, need - have);
      const state = have >= need ? 'owned' : (shop >= missing && shop > 0 ? 'shop' : 'missing');
      const suffix = state === 'owned' ? '✓ 덱 보유' : state === 'shop' ? '🛒 현재 상점' : '○ 미확보';
      return '<span class="promo-mat ' + state + '">' + CARD_NAME[k] + ' ' + have + '/' + need + ' <small>' + suffix + '</small></span>';
    });
    const allOwned = Object.keys(p.from).every(k => countInDeck(k) >= p.from[k]);
    const allReachable = Object.keys(p.from).every(k => {
      const missing = Math.max(0, p.from[k] - countInDeck(k));
      return missing === 0 || shopStockForKey(k) >= missing;
    });
    const stateClass = allOwned ? 'promo-ready' : (allReachable ? 'promo-shop-ready' : 'promo-locked');
    const ok = canPromote(p);
    const costOk = resource >= (p.cost.res || 0) && gems >= (p.cost.gem || 0);
    return '<div class="shop-card promo-card ' + stateClass + '"><b>⬆️ ' + (p.tier ? p.tier+'차 · ' : '') + p.card.name + (p.branch ? ' <small>['+p.branch+']</small>' : '') + '</b><p>' + p.card.text + '</p>' +
      '<div class="promo-mats">' + materialInfo.join('') + '</div>' +
      '<span class="price">비용 ' + costText(p.cost) + (allOwned && !costOk ? ' · 재료 완성 / 비용 부족' : '') + '</span>' +
      '<button ' + (ok ? '' : 'disabled') + ' onclick="promote(\'' + p.id + '\')">' + (ok ? '승급' : allOwned ? '비용 부족' : '조건 부족') + '</button></div>';
  }).join('');
}
// v0.2.16 beta: onboarding and optional synthesized BGM. No external assets required.
let tutorialActive = false;
let tutorialStepSeen = new Set();
let tutorialCoachDismissed = false;
let bgmContext = null, bgmNodes = [], bgmInterval = null, bgmStep = 0;
const BGM_NOTES = [164.81, 196.00, 220.00, 196.00, 146.83, 174.61, 196.00, 174.61];
function stopBgm(){
  if(bgmInterval){clearInterval(bgmInterval);bgmInterval=null;}
  bgmNodes.forEach(n=>{try{n.stop();}catch(e){}}); bgmNodes=[];
  if(bgmContext){bgmContext.close().catch(()=>{});bgmContext=null;}
}
function bgmTick(){
  if(!bgmContext || bgmContext.state!=='running')return;
  const now=bgmContext.currentTime, osc=bgmContext.createOscillator(), gain=bgmContext.createGain();
  osc.type='sine'; osc.frequency.setValueAtTime(BGM_NOTES[bgmStep++ % BGM_NOTES.length],now);
  gain.gain.setValueAtTime(0.0001,now);gain.gain.exponentialRampToValueAtTime(0.035,now+0.06);gain.gain.exponentialRampToValueAtTime(0.0001,now+0.7);
  osc.connect(gain);gain.connect(bgmContext.destination);osc.start(now);osc.stop(now+0.72);
}
async function toggleBgm(on){
  if(!on){stopBgm();return;}
  try{
    stopBgm(); const AudioCtx=window.AudioContext||window.webkitAudioContext;
    if(!AudioCtx)throw new Error('오디오 미지원');
    bgmContext=new AudioCtx();await bgmContext.resume();bgmTick();bgmInterval=setInterval(bgmTick,800);
  }catch(e){stopBgm();if($('bgmToggle'))$('bgmToggle').checked=false;log('🎵 BGM 재생 불가: 브라우저 오디오 설정을 확인해주세요.');}
}
function startTutorial(){
  tutorialActive=true; tutorialCoachDismissed=false; tutorialStepSeen=new Set();
  if($('welcomeOverlay'))$('welcomeOverlay').classList.add('hide');
  if($('tutorialBtn'))$('tutorialBtn').textContent='📖 안내 종료';
  render();
  requestAnimationFrame(updateSpotTutorial);
}
function toggleTutorial(){
  tutorialActive=!tutorialActive; tutorialCoachDismissed=false;
  if($('tutorialBtn'))$('tutorialBtn').textContent=tutorialActive?'📖 안내 종료':'📖 튜토리얼 안내';
  render();
  requestAnimationFrame(updateSpotTutorial);
}
// Brief, event-based spotlight tutorial: no repeated instructions every round.
let spotlightKey = null;
function dismissSpotTutorial(){
  if(spotlightKey)tutorialStepSeen.add(spotlightKey);
  spotlightKey=null;updateSpotTutorial();
}
function updateSpotTutorial(){
  const shade=$('tutorialShade'),coach=$('tutorialSpotCoach');
  if(!shade||!coach)return;
  document.querySelectorAll('.tutorial-focus').forEach(el=>el.classList.remove('tutorial-focus'));
  const hide=()=>{shade.classList.add('hide');coach.classList.add('hide');};
  if(!tutorialActive){hide();return;}
  const steps=[];
  if(round===1 && phase==='hand')steps.push(['hand-first','hand','① 손패 사용','채굴 카드를 눌러 자원을 얻어보세요. 공격 카드는 직접 사용하는 대신 공격력에 기여합니다.']);
  if(round===1 && phase==='shop')steps.push(['shop-first','shopPanel','② 상점','자원으로 카드를 구매해 보세요. 구매한 카드는 묘지에 들어갑니다.']);
  if(round===1 && phase==='battle')steps.push(['battle-first','battleBtn','③ 첫 전투','전투 진행 버튼을 눌러 적에게 공격해 보세요.']);
  if(round>=3 && phase==='hand')steps.push(['combo-once','hand','🔗 연계 콤보','경제 카드와 드로우 카드를 순서대로 사용하면 연계 공격 보너스를 얻을 수 있어요.']);
  if(round>=5 && phase==='hand')steps.push(['debuff-once','debuffForecast','⚠️ 디버프','적이 콤보와 공격력을 감소시킵니다. 여기에서 감소 전후 수치를 확인하세요.']);
  if(phase==='shop' && round>=2 && $('promoPanel') && !$('promoPanel').classList.contains('hide') && $('promoList') && $('promoList').children.length)steps.push(['promo-once','promoPanel','⬆️ 승급 / 전직','이곳에서 재료 카드와 비용을 확인하세요. 승급은 덱을 압축하고 카드를 강화합니다.']);
  if(phase==='reward')steps.push(['reward-once','rewardPanel','👑 보스 보상','보스 처치 보상을 선택하세요. 해당 보스 구간의 디버프도 종료됩니다.']);
  const step=steps.find(x=>!tutorialStepSeen.has(x[0]) && $(x[1]) && !$(x[1]).classList.contains('hide'));
  if(!step){spotlightKey=null;hide();return;}
  spotlightKey=step[0];
  const target=$(step[1]);target.classList.add('tutorial-focus');
  shade.classList.remove('hide');coach.classList.remove('hide');
  coach.innerHTML='<strong>'+step[2]+'</strong><p>'+step[3]+'</p><div class="spot-actions"><button type="button" onclick="dismissSpotTutorial()">알겠어요 · 계속하기</button><button type="button" onclick="toggleTutorial()">튜토리얼 종료</button></div>';
  const rect=target.getBoundingClientRect();
  if(rect.bottom<70||rect.top>window.innerHeight-90)target.scrollIntoView({block:'center',behavior:'instant'});
}
function tutorialCoachHtml(){
  const phases={
    hand:{number:'01',name:'손패 사용',target:'hand',text:'먼저 손패에서 채굴·드로우·보호 카드를 눌러 사용하세요. 검·단검·강타는 손패에서 직접 사용하지 않으며 덱의 공격력을 높입니다.',action:'카드를 사용하고 상단 [손패 완료 → 상점]으로 이동'},
    shop:{number:'02',name:'상점과 승급',target:'shopPanel',text:'모은 자원으로 카드를 구매하세요. 구매한 카드는 묘지에 들어가 다음 셔플부터 등장합니다. 승급은 재료 카드를 합쳐 덱을 압축합니다.',action:'상점 구매 또는 승급을 확인하고 [상점 완료 → 전투] 선택'},
    battle:{number:'03',name:'전투와 관통',target:'debuffForecast',text:'광역은 모든 적에게 먼저 적용되고, 이후 일반 공격은 앞쪽 적에게 적용됩니다. 관통 N은 적 처치 후 남은 피해를 다음 적에게 전달하는 최대 N회입니다.',action:'적 상태와 예상 피해를 확인하고 [전투 진행] 선택'},
    reward:{number:'04',name:'보스 보상',target:'rewardPanel',text:'보스를 처치하면 보상 중 하나를 고릅니다. 보스를 처치한 뒤에는 해당 구간 디버프가 종료됩니다.',action:'보상을 선택해 다음 라운드로 진행'},
    complete:{number:'05',name:'튜토리얼 완료',target:'score',text:'R30 공식전을 완료했어요! 점수와 덱 구성을 확인하고 새로운 전략에 도전하세요.',action:'다음에는 일반 게임으로 도전'},
    gameover:{number:'05',name:'다시 도전',target:'score',text:'적 수 또는 누적 HP가 한도를 넘으면 게임 오버입니다. 광역·관통·승급을 활용해 적 누적을 관리하세요.',action:'게임을 다시 시작해 전략을 바꿔보세요'}
  };
  const d=phases[phase]||phases.hand;
  let special='';
  if(phase==='hand' && round>=2)special='<p><b>🔗 연계 콤보:</b> 카드 사용 순서에 따라 경제 → 드로우, 보호 → 경제 등 연계 보너스가 발생합니다. 같은 카드를 사용해도 순서가 중요해요.</p>';
  if(round>=5 && (phase==='hand'||phase==='battle'))special+='<p><b>⚠️ 디버프:</b> 콤보 감소는 연계로 얻은 공격 보너스를 깎고, 공격력 감소는 그 결과에 적용됩니다. 위의 [전투 영향 미리보기]에서 적용 전 → 후를 확인하세요.</p>';
  if(phase==='shop' && round>=5)special+='<p><b>⬆️ 승급 팁:</b> 승급 재료와 비용을 확인하세요. 승급은 카드 수를 줄이면서 강한 효과를 얻는 핵심 성장 방법입니다.</p>';
  return '<div class="coach-top"><span class="coach-step">가이드 '+d.number+' / 05 · ROUND '+round+'</span><button type="button" onclick="toggleTutorial()" class="coach-exit">안내 종료 ✕</button></div>'+
    '<h3>📖 '+d.name+'</h3><p>'+d.text+'</p>'+special+'<div class="coach-action">👉 '+d.action+'</div>'+
    '<div class="coach-actions"><button type="button" onclick="tutorialScrollTo(\''+d.target+'\')">관련 화면 보기 ↗</button><button type="button" onclick="showTutorialReference()">게임 규칙 자세히</button></div>';
}
function tutorialScrollTo(id){const el=$(id);if(el)el.scrollIntoView({behavior:'smooth',block:'center'});}
function showTutorialReference(){
  if($('modalTitle'))$('modalTitle').textContent='📖 게임 규칙 가이드';
  if($('modalContent'))$('modalContent').innerHTML='<div class="tutorial-reference"><h4>① 손패</h4><p>경제·드로우·보호 카드는 사용합니다. 공격 카드는 직접 사용하지 않고 공격력 및 손패 효과에 관여합니다.</p><h4>② 상점</h4><p>자원으로 카드를 구매합니다. 구매 카드는 묘지로 이동하며 다음 셔플에서 등장합니다.</p><h4>③ 연계</h4><p>카드 행동 순서에 따라 추가 콤보 공격력이 발생합니다. 같은 턴의 사용 순서를 바꾸면 결과가 달라질 수 있습니다.</p><h4>④ 디버프</h4><p>콤보 디버프는 콤보 공격 보너스를, 공격 디버프는 계산된 공격력을 감소시킵니다. 활성 적과 보호 수치를 전투 미리보기에서 확인하세요.</p><h4>⑤ 전투</h4><p>광역 피해가 먼저 모든 적에게 들어갑니다. 일반 공격은 앞쪽 적부터 처리하며, 관통 N은 초과 피해를 다음 적에게 넘기는 최대 N회입니다.</p><h4>⑥ 승급</h4><p>정해진 재료 카드와 비용을 소모해 강력한 카드로 바꾸고 덱을 압축합니다.</p><h4>⑦ 생존·점수</h4><p>적 수 또는 누적 HP가 위험 한도를 초과하면 DANGER가 발생할 수 있습니다. 30라운드를 완료하면 공식 점수가 확정됩니다.</p><button type="button" onclick="document.getElementById(\'modal\').classList.add(\'hide\')">가이드 닫기</button></div>';
  if($('modal'))$('modal').classList.remove('hide');
}
function tutorialText(){
  if(phase==='hand')return '<b>① 손패 단계</b> · 채굴/드로우/보호 카드는 [사용]할 수 있어요. 검·단검 등 공격 카드는 손패에 존재하는 것만으로 공격력을 올리며 직접 사용하지 않습니다. 카드를 사용한 뒤 상단의 [손패 완료 → 상점]을 누르세요.';
  if(phase==='shop')return '<b>② 상점 단계</b> · 모은 자원으로 카드를 구매하세요. 구매 카드는 이어가기 드로우일 때 묘지에 들어가 다음 셔플부터 등장합니다. 승급/전직은 재료를 소비해 덱을 압축합니다. 준비되면 [상점 완료 → 전투]를 누르세요.';
  if(phase==='battle')return '<b>③ 전투 단계</b> · 광역 피해가 먼저 모든 적에게 적용되고, 이후 공격력이 첫 적에게 적용됩니다. 관통 N은 적을 처치한 뒤 남는 피해를 다음 적에게 넘길 수 있는 최대 N회입니다. 전투를 진행하세요.';
  if(phase==='reward')return '<b>④ 보스 보상</b> · 보스 처치 후 보상을 선택하세요. 보스 처치에 따라 디버프 구간이 바뀝니다.';
  return '<b>튜토리얼</b> · R30 공식전 완료 또는 게임 종료입니다. 다른 카드 조합으로 다시 도전해보세요.';
}
function enemyTier(e){return e.boss?'boss':e.name.includes('정예')?'elite':'normal';}
function enemyRisk(e){
  if(!isEnemyDebuffActive(e))return {level:'inactive',text:'비활성'};
  if(!e.d&&!e.steal)return {level:'none',text:'디버프 없음'};
  if(e.d&&e.d.p<=0&&!e.steal)return {level:'inactive',text:'소모 완료'};
  if(e.d){const n=e.d.pct?e.d.baseP*PCT_PER_POINT:e.d.baseP;return {level:(e.boss||n>=12)?'critical':n>=6?'high':'medium',text:e.d.k==='combo'?'콤보 위협':e.d.k==='attack'?'공격 위협':'경제 위협'};}
  return {level:'medium',text:'보석 약탈'};
}
function debuffForecastHtml(){
  const ap=attackParts(), pc=totalPierce(), aoe=totalAoe();
  return '<div class="forecast-head"><b>⚠️ 전투 영향 미리보기</b><span>활성 적의 디버프 합산 · 보호 반영 예상</span></div>'+
    '<div class="forecast-stats"><span>🔗 콤보 <b>'+ap.comboRaw+' → '+ap.comboNet+'</b><small>감소 '+ap.comboLoss+'</small></span>'+
    '<span>⚔️ 공격 <b>'+ap.pre+' → '+ap.final+'</b><small>감소 '+ap.atkLoss+(ap.rawFinal<ap.attackFloor?' · 50% 하한':'')+'</small></span>'+
    '<span>💥 광역 <b>'+aoe+'/적</b><small>공격 디버프와 별도</small></span>'+
    '<span>🗡 관통 <b>'+pc+'회</b><small>처치 후 초과 피해 전달</small></span></div>'+
    '<p class="forecast-note">콤보 디버프는 카드 조합·행동 연계의 보너스를 줄이고, 공격 디버프는 그 결과에 다시 적용됩니다. 수치는 현재 손패 기준 예상값이며 전투 중 카드 사용으로 달라집니다.</p>';
}
function render() {
  renderBattleStage();
  updateEnemyStatus();
  if ($('round')) $('round').textContent = round;
  updatePlayTimeUI();
  if($('officialRecord')) $('officialRecord').innerHTML = officialRecord ? '🏆 R30 '+officialRecord.score.toLocaleString()+' · ⏱ '+formatPlayTime(officialRecord.playMs) : 'R30 기록 대기';
  if ($('score')) $('score').textContent = (officialRecord ? officialRecord.score : scoreValue()).toLocaleString();
  if ($('res')) { $('res').textContent = resource; $('res').style.color = resource < 0 ? '#f87171' : ''; }
  if ($('gem')) $('gem').textContent = gems;
  if ($('atk')) $('atk').textContent = attackValue();
  if ($('dc')) $('dc').textContent = deck.length;
  if ($('pileInfo')) $('pileInfo').textContent = '더미 ' + draw.length + ' · 묘지 ' + graveyard.length;
  if ($('handCount')) $('handCount').textContent = '(' + hand.length + '장)';
  if ($('enemyTotal')) $('enemyTotal').textContent = total();
  renderNextPreview();
  if($('debuffForecast'))$('debuffForecast').innerHTML=debuffForecastHtml();
  if($('tutorialCoach'))$('tutorialCoach').classList.add('hide');
  requestAnimationFrame(updateSpotTutorial);
  if($('tutorialHint'))$('tutorialHint').classList.add('hide');
  if ($('recentLog')) $('recentLog').classList.toggle('hide', isVisualMode());

  updateAtkTooltip();

  let activeBuffs = getActiveBuffs();
  let buffContainer = $('buffStatus');
  if (!buffContainer) {
    buffContainer = document.createElement('div');
    buffContainer.id = 'buffStatus';
    buffContainer.style.cssText = 'background:#1a1d24; border:1px solid #374151; padding:8px; border-radius:6px; margin-bottom:10px; font-size:12px; text-align:left;';
    const handBox = $('hand');
    if (handBox && handBox.parentNode) {
      handBox.parentNode.insertBefore(buffContainer, handBox);
    }
  }

  if (buffContainer) {
    if (activeBuffs.length === 0) {
      buffContainer.innerHTML = '<span style="color:#6b7280;">✨ 활성화된 콤보 / 시너지 버프가 없습니다.</span>';
    } else {
      buffContainer.innerHTML = '<b style="color:#fde047; display:block; margin-bottom:4px;">✨ 활성화된 버프 & 시너지:</b>' + 
        activeBuffs.map(b => '<div style="color:' + b.color + '; margin-top:2px;">• <b>' + b.name + '</b>: ' + b.desc + '</div>').join('');
    }
  }

  if (buffContainer) buffContainer.innerHTML += oneuseStatusHtml() + linkStatusHtml();

  if ($('enemies')) {
    const dangerEnemyLimit = gameOverEnemyLimit(round), dangerHpLimit = gameOverHpLimit(round);
    const dangerNeedKills = dangerActive ? Math.max(0, enemies.length - dangerEnemyLimit) : 0;
    const dangerNeedHp = dangerActive ? Math.max(0, total() - dangerHpLimit) : 0;
    const dangerHead = dangerActive ? '<div class="danger-mission"><b>🚨 이번 전투 생존 조건</b><span>☠ 적 처치 <strong>0 / '+dangerNeedKills+'</strong></span><span>❤️ HP 감소 <strong>0 / '+dangerNeedHp+'</strong></span></div>' : '';
    $('enemies').innerHTML = dangerHead + enemies.map((e, i) => {
      const hasActiveDebuff = isEnemyDebuffActive(e) && ((e.d && e.d.p > 0) || !!e.steal);
      const killPriority = dangerActive && dangerNeedKills > 0 && i < dangerNeedKills;
      const hpPriority = dangerActive && dangerNeedHp > 0;
      const risk=enemyRisk(e), tier=enemyTier(e);
      const identity='<div class="enemy-identity"><span class="enemy-tier '+tier+'">'+(tier==='boss'?'👑 보스':tier==='elite'?'◆ 정예':'● 일반')+'</span><span class="enemy-risk '+risk.level+'">'+risk.text+'</span></div>';
      const riskTags = dangerActive ? '<div class="danger-tags">'+(killPriority?'<span class="danger-tag kill">☠ 처치 우선</span>':'')+(hpPriority?'<span class="danger-tag hp">❤️ HP 정리</span>':'')+(hasActiveDebuff?'<span class="danger-tag debuff">⚠ 활성 디버프</span>':'')+'</div>' : '';
      return '<div class="enemy ' + (hasActiveDebuff ? 'debuff-active ' : '') + (dangerActive?'danger-enemy ':'') + (killPriority?'kill-priority':'') + '">' +
        identity + '<b>' + (i === 0 ? '🎯 [우선 타겟] ' : '') + e.name + (e.boss ? ' 👑' : '') + '</b>' +
        '<span class="hp">' + e.hp + ' HP</span>' + riskTags +
        '<div class="debuff-badge ' + (hasActiveDebuff ? 'active' : 'done') + '">' + getEnemyDebuffText(e) + '</div>' +
      '</div>';
    }).join('');
  }

  if ($('enemyChips')) {
    const head = '<span class="chip-label">👹 ' + enemies.length + '마리 · HP ' + total() + '</span>';
    $('enemyChips').innerHTML = head + enemies.map((e, i) => {
      const warn = isEnemyDebuffActive(e) && ((e.d && e.d.p > 0) || !!e.steal);
      return '<span class="chip' + (i === 0 ? ' target' : '') + (warn ? ' warn' : '') + '">' +
        (i === 0 ? '🎯 ' : '') + (e.boss?'👑 ':e.name.includes('정예')?'◆ ':'') + e.name + ' <b>' + e.hp + '</b>' + (warn ? ' ⚠️' : '') + '</span>';
    }).join('');
  }

  const labs = [['attack', '⚔️'], ['resource', '🔋'], ['gem', '💎'], ['combo', '🔒'], ['all', '🛡']];
  if ($('protections')) {
    $('protections').innerHTML = '<span class="chip-label">🛡 보호력</span>' + labs.map(x => {
      const v = prot[x[0]] || 0;
      return '<span class="protect' + (v > 0 ? ' on' : '') + '">' + x[1] + ' <b>' + v + '</b></span>';
    }).join('');
  }

  if ($('hand')) {
    $('hand').innerHTML = hand.map((c, i) => {
      let a = c.type === 'attack' || c.type === 'specialAttack', p = c.type === 'protection', o = c.type === 'oneuse', r = c.type === 'random', aoe = c.type === 'aoeAttack', pc = c.type === 'pierce', curse=c.type==='curse';
      let val = a ? '+' + (c.atk || 0) : aoe ? '💥' + (c.perEnemy ? c.perEnemy + '/마리' : c.atk) : p ? '🛡' : o ? '1회' : r ? '🎲' : c.type === 'draw' || c.type === 'drawFilter' ? '+' + (c.draw || 0) + '장' : pc ? '🗡관통 ' + c.pierce : c.type === 'gem' ? '💎+' + c.gem + (c.res ? ' 💰+' + c.res : '') : '+' + (c.res || 0);
      return '<div class="card ' + (c.rarity==='legend'?'legend ':'') + (curse?'curse ':'') + (a ? 'attack ' : '') + (aoe ? 'attack ' : '') + (p ? 'protection ' : '') + (o ? 'oneuse ' : '') + (r ? 'random' : '') + '"><div><span class="tag">' + (a ? 'ATTACK' : aoe ? 'AOE' : p ? 'PROTECT' : o ? 'ONE USE' : r ? 'RANDOM' : pc ? 'PIERCE' : 'ACTION') + '</span><h3>' + c.name + '</h3><div class="val">' + val + '</div><div class="desc">' + (c.text || '') + '</div>'+dangerCardBadge(c)+'</div><button ' + ((a||curse) ? 'disabled' : '') + ' onclick="use(' + i + ')">' + ((a||curse) ? '사용 불가' : '사용') + '</button></div>';
    }).join('');
  }

  if ($('shopPanel')) $('shopPanel').classList.toggle('hide', phase !== 'shop');
  if ($('rewardPanel')) $('rewardPanel').classList.toggle('hide', phase !== 'reward');
  if ($('promoPanel')) $('promoPanel').classList.toggle('hide', phase !== 'shop');

  if (phase === 'shop') {
    renderShop(BASIC, 'basicShop', 'buyBasic');
    renderShop(randomShop, 'randomShop', 'buyRandom');
    renderPromo();
  }
  if (phase === 'reward' && $('rewards')) {
    $('rewards').innerHTML = rewards.map((r, i) => '<div class="shop-card"><b>' + r[0] + '</b><p>' + r[1] + '</p><button onclick="reward(' + i + ')">선택</button></div>').join('');
  }

  if ($('phase')) $('phase').textContent = { hand: '① 손패 사용', shop: '② 상점 구매', battle: '③ 전투 실행', reward: '④ 보스 보상 선택', gameover: 'GAME OVER', complete:'🏁 공식전 종료' }[phase] || phase;
  if ($('nextBtn')) $('nextBtn').textContent = phase === 'hand' ? '손패 완료 → 상점' : phase === 'shop' ? '상점 완료 → 전투' : phase === 'battle' ? '전투 실행' : '보상 선택';
  if ($('battleBtn')) $('battleBtn').textContent = $('nextBtn') ? $('nextBtn').textContent : '전투 진행';
  if ($('gemActionBox')) $('gemActionBox').innerHTML = gems > 0
    ? '<button onclick="useGem()" style="padding:2px 6px;font-size:9px;background:#8b5cf6">💎 ' + (phase === 'shop' ? '→자원+2' : '+2공격') + '</button> ' +
      '<button onclick="useGem(true)" style="padding:2px 6px;font-size:9px;background:#6d28d9">전부(' + gems + ')</button>'
    : '';
}

function renderShop(list, id, fn) {
  if (!$(id)) return;
  $(id).innerHTML = list.map(s => {
    let n = buyCount[s.id] || 0, d = phase !== 'shop' || n >= s.limit || resource < s.price;
    return '<div class="shop-card ' + (list === randomShop ? 'random-card' : '') + promoMaterialShopState(s) + '"><b>' + s.name + '</b><p>' + s.text + '</p><span class="price">💰 ' + s.price + ' · 재고 ' + Math.max(0, s.limit - n) + '개 (최대 ' + s.limit + ')</span><button ' + (d ? 'disabled' : '') + ' onclick="' + fn + '(\'' + s.id + '\')">' + (n >= s.limit ? '재고 소진' : '구매') + '</button></div>';
  }).join('');
}


function cardCategory(c) {
  if(c.type==='promotionStone') return '승급 재료';
  if (c.type === 'attack') return '순수 공격';
  if (c.type === 'specialAttack') return '공격+패시브';
  if (c.type === 'resource') return '자원';
  if (c.type === 'draw' || c.type === 'drawFilter') return '드로우/엔진';
  if (c.type === 'gem') return '보석/경제';
  if (c.type === 'protection') return '보호/유틸';
  if (c.type === 'aoeAttack') return '광역';
  if (c.type === 'pierce') return '관통';
  if (c.type === 'oneuse') return '일회용';
  if (c.type === 'remove') return '덱 압축';
  if (c.rarity === 'legend') return 'LEGEND';
  if (c.type === 'curse') return '저주';
  if (c.type === 'random') return '운빨';
  return c.type;
}
function strategyText(c) {
  const k=c.baseId||c.id;
  if(k==='frenzy') return '삼연격 3장 손패 콤보(+10)를 노리는 대신, 재료 3장을 압축해 공격 +30을 안정적으로 확보합니다. 콤보 변동성을 버리고 영구 공격/덱 압축을 택하는 승급입니다.';
  if(k==='dice') return '행운 34% · 무변화 30% · 불운 36% + 별도 파괴 10%. 파괴 시 20% 확률로 운빨 전용 LEGEND 발견. 자원·공격·드로우·보호·광역/관통·랜덤 카드/강화 또는 손실·저주가 발생합니다.';
  if(k==='box') return '행운 38% · 무변화 24% · 불운 38% + 별도 파괴 18%. 파괴 시 28% 확률로 LEGEND 발견. 가장 위험하지만 랜덤 카드·광역/관통·보석 대박까지 노리는 고위험 운빨 카드입니다.';
  if(k==='coin') return '행운 48% · 무변화 32% · 불운 20% + 별도 파괴 6%. 파괴 시 20% 확률로 LEGEND 발견. 운빨 카드 중 비교적 안전한 선택입니다.';
  if(k==='potion') return '행운 40% · 무변화 25% · 불운 35% + 별도 파괴 12%. 파괴 시 20% 확률로 LEGEND 발견. 카드 강화·드로우·보호·보석 변화와 저주 위험이 공존합니다.';
  if(c.rarity==='legend') return '운빨 카드 파괴 잭팟에서만 획득. 라운드 돌파력을 크게 높이는 희귀 카드.';
  if(c.type==='random') return '결과를 확정할 수 없는 운빨 전략. 평범한 수치 변화부터 덱 강화·저주·카드 획득, 파괴 후 LEGEND 잭팟까지 노립니다.';
  if(c.type==='aoeAttack'||c.aoe) return '적이 많이 쌓일수록 가치가 상승. DANGER에서 적 숫자를 줄이는 핵심 수단.';
  if(c.type==='pierce'||c.pierce) return '높은 단일 공격의 초과 피해를 다음 적에게 전달해 오버킬을 줄입니다.';
  if(c.type==='draw'||c.type==='drawFilter') return '덱 순환을 빠르게 해 필요한 경제/전투 카드를 찾는 엔진. 과도한 덱 비대화도 보완합니다.';
  if(c.type==='protection') return '현재 구간의 강한 디버프를 상쇄. 보스와 누적 적이 겹칠 때 안정성이 큽니다.';
  if(c.type==='gem'||c.res) return '경제 성장용. 보석은 다음 라운드까지 보존되어 위기 대응 자원으로 활용 가능합니다.';
  if(c.type==='attack'||c.type==='specialAttack') return '덱에 있는 것만으로 기본 공격력을 높입니다. 너무 많으면 손패 액션 밀도가 낮아집니다.';
  if(c.type==='curse') return '불운으로 들어오는 방해 카드. 덱 압축/제거 가치가 올라갑니다.';
  return '조합과 현재 적 압력에 맞춰 활용하세요.';
}
function showCardTable() {
  const all=[]; const add=(arr,src)=>arr.forEach(c=>all.push({c,src}));
  add(BASE,'시작 덱'); add(BASIC,'기본 상점'); add(RANDOM_POOL,'랜덤 상점'); add([PROMOTION_STONE],'보스 전용'); PROMOS.forEach(p=>add([p.card],'승급')); add(LEGEND_POOL,'운빨 전용'); add(CURSE_POOL,'불운 결과');
  const inShop=k=>[...BASIC,...randomShop].some(x=>(x.baseId||x.id)===k && (buyCount[x.id]||0)<(x.limit||999));
  const esc=t=>String(t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
  const cards=all.map(({c,src},idx)=>{const k=c.baseId||c.id; const dh=hand.filter(x=>(x.baseId||x.id)===k).length, dd=deck.filter(x=>(x.baseId||x.id)===k).length, sh=inShop(k); const cls=dh?'catalog-hand':sh?'catalog-shop':dd?'catalog-deck':''; const spec=(c.atk?'⚔ '+c.atk+' ':'')+(c.res?'💰 '+c.res+' ':'')+(c.gem?'💎 '+c.gem+' ':'')+(c.draw?'🃏 '+c.draw+' ':'')+(c.aoe?'💥 '+c.aoe+' ':'')+(c.pierce?'🗡 '+c.pierce:''); return '<button type="button" class="catalog-card spread-card '+cls+' '+(c.rarity==='legend'?'legend':'')+'" data-card-idx="'+idx+'"><div class="catalog-head"><b>'+esc(c.name)+'</b><span>'+cardCategory(c)+'</span></div><div class="catalog-state">'+(dh?'🃏 손패 '+dh+' ':dd?'📚 덱 '+dd+' ':'')+(sh?'🛒 상점 ':'')+(c.rarity==='legend'?'🌈 LEGEND ':'')+'</div><div class="spread-spec">'+(spec||'특수 효과')+'</div><p>'+esc(c.text||(c.atk?'공격 +'+c.atk:'효과 없음'))+'</p><small>💡 '+esc(strategyText(c))+'</small><em>자세히 보기</em></button>';}).join('');
  $('modalTitle').textContent='🃏 전체 카드 펼쳐보기';
  $('modalContent').innerHTML='<div class="catalog-legend">🟦 손패 · 🟩 덱 · 🟨 현재 상점 · 🌈 LEGEND</div><p class="catalog-help">카드를 책상 위에 펼쳐 놓듯 여러 장을 동시에 비교합니다. 카드를 누르면 가격·출처·효과·전략을 크게 볼 수 있습니다.</p><div class="catalog-spread">'+cards+'</div><div id="catalogDetail" class="catalog-detail"><b>카드를 선택해 상세 전략을 확인하세요.</b></div>';
  $('modal').classList.remove('hide');
  const detail=$('catalogDetail');
  $('modalContent').querySelectorAll('[data-card-idx]').forEach(btn=>btn.addEventListener('click',()=>{const {c,src}=all[Number(btn.dataset.cardIdx)]; detail.innerHTML='<div><b>'+esc(c.name)+'</b><span>'+cardCategory(c)+' · '+src+' · '+(c.price==null?'획득 전용':'가격 💰'+c.price)+'</span></div><p>'+esc(c.text||(c.atk?'공격 +'+c.atk:'효과 없음'))+'</p><strong>💡 전략</strong><p>'+esc(strategyText(c))+'</p>'; detail.scrollIntoView({behavior:'smooth',block:'nearest'}); }));
}

async function copyDevLog() {
  const snapshot = [
    'Luck Dungeon v0.2.15 DEV LOG',
    'ROUND=' + round + ' PHASE=' + phase + ' SCORE=' + scoreValue(),
    'DECK=' + deck.length + ' RES=' + resource + ' GEMS=' + gems + ' ENEMIES=' + enemies.length + ' ENEMY_HP=' + total(),
    'STATS=' + JSON.stringify(stats),
    'PERSISTENT_DRAW=' + persistentDraw,
    'MODE=' + (endlessMode ? 'ENDLESS' : (officialRecord ? 'OFFICIAL_COMPLETE' : 'OFFICIAL')) + ' PLAYTIME=' + formatPlayTime(currentPlayMs()) + (officialRecord ? ' OFFICIAL_SCORE=' + officialRecord.score + ' OFFICIAL_TIME=' + formatPlayTime(officialRecord.playMs) : ''),
    'DECK_LIST=' + deck.map(c => c.name).join(', '),
    '--- LOG ---', ...fullLogs
  ].join('\n');
  try { await navigator.clipboard.writeText(snapshot); log('📋 개발 로그를 클립보드에 복사했습니다.', 'good'); }
  catch (e) { $('modalTitle').textContent = '📋 개발 로그'; $('modalContent').innerHTML = '<textarea style="width:100%;height:320px">' + snapshot.replace(/</g,'&lt;') + '</textarea>'; $('modal').classList.remove('hide'); }
}

window.use = use;
window.resolvePromotionStone = resolvePromotionStone;
window.buyBasic = buyBasic;
window.buyRandom = buyRandom;
window.removeCard = removeCard;
window.promote = promote;
window.reward = reward;
window.useGem = useGem;
window.start = start;
window.confirmRoundStart = confirmRoundStart;
window.showRoundStartModal = showRoundStartModal;
window.confirmRoundResult = confirmRoundResult;
window.finishOfficialOnly=finishOfficialOnly; window.continueEndless=continueEndless; window.confirmShopReroll=confirmShopReroll; window.finishBattleCinematic=finishBattleCinematic;

document.addEventListener('DOMContentLoaded', () => {
  const nextBtn = $('nextBtn');
  const battleBtn = $('battleBtn');
  const deckBtn = $('deckBtn');
  const closeBtn = $('close');
  const copyLogBtn = $('copyLogBtn');
  const cardTableBtn = $('cardTableBtn');

  if (nextBtn) nextBtn.onclick = next;
  if (battleBtn) battleBtn.onclick = next;
  if (deckBtn) deckBtn.onclick = deckView;
  const pToggle = $('persistToggle');
  if (pToggle) {
    pToggle.checked = persistentDraw;
    pToggle.addEventListener('change', () => {
      persistentDraw = pToggle.checked;
      log(persistentDraw ? '♻️ 이어가기 드로우 ON: 드로우 더미를 라운드를 넘어 이어 씁니다.' : '🔀 이어가기 드로우 OFF: 매 라운드 전체 덱을 다시 섞습니다.');
      render();
    });
  }
  const vToggle = $('visualModeToggle');
  if (vToggle) vToggle.addEventListener('change', () => render());
  const battleSkipToggle = $('battleMotionSkipToggle');
  if (battleSkipToggle) battleSkipToggle.addEventListener('change', () => {
    log(battleSkipToggle.checked ? '⏩ 전투 모션 스킵 ON: 전투 계산 후 결과로 즉시 진행합니다.' : '⚔️ 전투 모션 ON: 모든 모드에서 전투 연출을 재생합니다.');
  });
  if (closeBtn) closeBtn.onclick = handleModalClose;
  if (copyLogBtn) copyLogBtn.onclick = copyDevLog;
  if (cardTableBtn) cardTableBtn.onclick = showCardTable;
  if($('tutorialBtn'))$('tutorialBtn').onclick=toggleTutorial;
  if($('welcomeTutorial'))$('welcomeTutorial').onclick=()=>{start();startTutorial();};
  if($('welcomeNormal'))$('welcomeNormal').onclick=()=>{if($('welcomeOverlay'))$('welcomeOverlay').classList.add('hide');tutorialActive=false;start();};
  if($('bgmToggle'))$('bgmToggle').addEventListener('change',e=>{if($('welcomeBgmToggle'))$('welcomeBgmToggle').checked=e.target.checked;toggleBgm(e.target.checked);});
  if($('welcomeBgmToggle'))$('welcomeBgmToggle').addEventListener('change',e=>{if($('bgmToggle'))$('bgmToggle').checked=e.target.checked;toggleBgm(e.target.checked);});

  const atkBox = $('atkContainer');
  const tooltip = $('atkTooltip');

  if (atkBox && tooltip) {
    atkBox.addEventListener('click', (e) => {
      e.stopPropagation();
      tooltip.classList.toggle('hide');
    });

    atkBox.addEventListener('focus', () => {
      tooltip.classList.remove('hide');
    });

    document.addEventListener('click', (e) => {
      if (!atkBox.contains(e.target)) {
        tooltip.classList.add('hide');
      }
    });
  }

  // Show mode selection before the first run; do not start the timer until a mode is chosen.
});

