"""Fail-closed P5 changes restricted to v0.3 runtime."""
from pathlib import Path
from v0219_patch import once
def patch(game):
 game=once(game,".filter(z=>z.remain>0);",".filter(z=>z.remain>0 && !p5IsLocked(z.idx));",'P5 exclude locked slots')
 game=once(game,'function start() {','function start() {\n  p5Reset();','P5 reset reward flow')
 game=once(game,"  if (resource < s.price) return log('자원 부족');","  const p5Cost=p5Price(s);\n  if (resource < p5Cost) return log('자원 부족');",'P5 coupon affordability')
 game=once(game,"'구매 확정 · 💰 '+s.price","'구매 확정 · 💰 '+p5Cost",'P5 paid price feedback')
 game=once(game,'  resource -= s.price;','  resource -= p5Cost;\n  p5Bought(s,p5Cost);','P5 coupon payment')
 game=once(game,"  if (phase === 'shop') {\n    phase = 'battle';","  if (phase === 'shop') {\n    p5ExpireCoupon();\n    phase = 'battle';",'P5 coupon expiry')
 game=once(game,"resource < s.price;","resource < p5Price(s);",'P5 shop button affordability')
 game=once(game,"s.price + ' · 재고 '","p5Price(s) + (p5Price(s)<s.price?' (정가 '+s.price+' · 할인)':'') + ' · 재고 '",'P5 shop displayed price')
 return Path(__file__).with_name('p5-rewards.js').read_text()+'\n'+game
