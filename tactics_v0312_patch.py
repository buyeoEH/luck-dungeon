from pathlib import Path
R=Path(__file__).resolve().parent
def patch(g):
 marker='const CARD_NAME = {};'
 assert g.count(marker)==1
 raw=(R/'tactics-v0312.js').read_text()
 catalog,logic=raw.split('let tacticUsed=',1)
 g=g.replace(marker,catalog+'\n'+marker)
 old="      addNewCard(cp(PROMOTION_STONE));\n      log('🧿 보스 보상 ➔ [만능승급석] 획득! 드로우 후 사용할 때 승급 재료를 선택합니다.', 'good');\n      nextRound();"
 assert g.count(old)==1
 g=g.replace(old,'      v312OpenStoneReward();')
 g=g.replace('const BOSS_RESTOCK_BASIC = 3;', 'const BOSS_RESTOCK_BASIC = 2;').replace('const BOSS_RESTOCK_RANDOM = 1;', 'const BOSS_RESTOCK_RANDOM = 2;')
 g=g.replace("let P5_REWARDS_ENABLED=window.LUCK_P5_REWARDS_ENABLED!==false&&p5Flags.get('p5')!=='0';",'let P5_REWARDS_ENABLED=true; // v0.3.12 fixed reward contract')
 g=g.replace("let p5SeedChoices=Number(window.LUCK_P5_SEED_CHOICES??p5Flags.get('seeds'))===8?8:3,p5SeedOffer=null;",'let p5SeedChoices=3,p5SeedOffer=null;')
 g=g.replace("let p5RestockMode=['A','B','C','legacy'].includes(p5RequestedMode)?p5RequestedMode:'A';","let p5RestockMode='A';")
 old=".filter(z=>z.remain>0 && !p5IsLocked(z.idx))"
 assert g.count(old)==1
 g=g.replace(old,'.filter(z=>!p5IsLocked(z.idx))')
 assert g.count('limit:z.remain,protect:')==1
 g=g.replace('limit:z.remain,protect:','limit:z.remain>0?z.remain:src.limit,protect:')
 g=g.replace("'+(!stock?'disabled':'')+'", "'+'")
 g=g.replace("||randomShop[i].limit-(buyCount[randomShop[i].id]||0)<=0",'')
 a=g.index('function p5BeginRestock(){');b=g.index('\nfunction p5DiscountPrice',a)
 g=g[:a]+"function p5BeginRestock(){p5RestockCandidates=[];p5Flow='restock';p5BulkRestock();p5GiveCoupon();p5Flow='finishing';p5Finish();}\n"+g[b:]
 a=g.index('function p5RestockDescription(){');b=g.index('\nfunction p5BulkRestock',a)
 g=g[:a]+"function p5RestockDescription(){return '기본 상점 +2 / 현재 랜덤 상점 +2 재입고. 추가 품절 복구 없음. 다음 상점 첫 카드 구매 50% 할인(최대 6, 최소 가격 1).';}\n"+g[b:]
 g=g.replace("basic:BOSS_RESTOCK_BASIC,random:BOSS_RESTOCK_RANDOM", "basic:BOSS_RESTOCK_BASIC,random:BOSS_RESTOCK_RANDOM")
 g=g.replace('기본 상점 +3 / 현재 랜덤 상점 +1 일괄 재입고','기본 상점 +2 / 현재 랜덤 상점 +2 일괄 재입고')
 g=g.replace('재고가 남은 비잠금 상품 중 최대 3장 교체','품절 포함 비잠금 상품 최대 3장 교체')
 g=g.replace('🔥 메가턴','🔥 폭발의 기회').replace('메가턴 예약','폭발의 기회 예약').replace('메가턴 시작','폭발의 기회 시작').replace('메가턴 보상','폭발의 기회 보상').replace('메가턴은','폭발의 기회는')
 g+='\nlet tacticUsed='+logic
 return g
