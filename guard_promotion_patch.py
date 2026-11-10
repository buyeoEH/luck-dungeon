from pathlib import Path
R=Path(__file__).resolve().parent
def patch(g):
 marker='const CARD_NAME = {};'
 assert g.count(marker)==1
 g=g.replace(marker,(R/'guard-promotions.js').read_text()+'\n'+marker)
 # Existing deckAtk counts atk on every card. A permanent guard sword must not
 # receive that attack a second time as a temporary use effect.
 old="    tempAttack += c.atk || 0;\n    const got = c.draw ? drawCards(c.draw) : 0;"
 assert g.count(old)==1
 g=g.replace(old,"    if(!c.guardPermanent)tempAttack += c.atk || 0;\n    const got = c.draw ? drawCards(c.draw) : 0;")
 g=g.replace("if (c.atk) changes.push({ text: '⚔️ 임시 공격력 +'", "if (c.atk&&!c.guardPermanent) changes.push({ text: '⚔️ 임시 공격력 +'")
 g=g.replace("function apCost(c){return ","function apCost(c){if(c?.guardPromo&&apEnabled()&&AP_MODE!=='shop')return 1;return ",1)
 g=g.replace("function promoGroup(p){", "function promoGroup(p){\n  if(p.card.guardPromo)return 'protection';",1)
 g=g.replace('const PROMO_GROUPS=[',"const PROMO_GROUPS=[['protection','🛡 승급(보호) · 방어와 덱 압축'],",1)
 g=g.replace("luck:'🟣 승급(운빨)',other:","luck:'🟣 승급(운빨)',protection:'🛡 승급(보호)',other:",1)
 g=g.replace('function cardCategory(c) {',"function cardCategory(c) {\n  if(c.guardPromo)return '보호 승급 / '+(c.guardPermanent?'영구 공격':c.guardLink?'복합 연계':'복합 효과');",1)
 g=g.replace('function promoNetHtml(p){',"function promoNetHtml(p){\n  if(p.card.guardPromo)return '<small class=\"luck-promo-net\">덱 '+Object.values(p.from).reduce((n,x)=>n+x,0)+'장 → 1장 · '+(p.card.guardPermanent?'영구 공격 '+p.card.atk+' 유지 · 사용 시 보호':'사용 시 보호와 복합 효과')+' · 사용 행동력 1 · 재료의 기존 효과는 승급 카드 설명으로 대체</small>';",1)
 return g
