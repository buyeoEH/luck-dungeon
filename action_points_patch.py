"""Strict experimental patches applied only after reproducing RC.3."""
from pathlib import Path
from v0219_patch import once
def patch(game):
 def change(old,new,label):
  nonlocal game
  game=once(game,old,new,'AP '+label)
 change('p1Catalog();','p1Catalog();\napCatalog();','catalog')
 change('function start() {','function start() {\n  apReset();','reset run')
 change('function drawStart() {','function drawStart() {\n  apRoundStart();','round budget')
 change("  // 선택형 카드는 선택 확정 전까지", "  if (!apCanUse(c)) { apSpend(apCost(c),'card',cardKey(c)); return; }\n  // 선택형 카드는 선택 확정 전까지",'deny before mutations')
 change("  actionFlash('🎴 '+c.name,", "  if(!apSpend(apCost(c),'card',cardKey(c)))return;\n  actionFlash('🎴 '+c.name,",'charge active card')
 change("  if (c.type !== 'oneuse') {","  apUsed(c);\n  if (c.type !== 'oneuse') {",'refill once after actual use')
 change("  if (resource < p5Cost) return log('자원 부족');", "  if (resource < p5Cost) return log('자원 부족');\n  if(!apSpend(1,'purchase',id))return;",'buy after validation')
 change('  return Object.keys(p.from).every',"  return (!apEnabled()||apState.points>=1) && Object.keys(p.from).every",'promotion eligibility')
 change('  const used = [];',"  if(!apSpend(1,'promotion',id))return;\n  const used = [];",'promotion once')
 change('function render() {','function render() {\n  apRender();','HUD')
 change("  if(c.type==='link') return 'link';", "  if(c.type==='actionPoint') return '';\n  if(c.type==='link') return 'link';",'supply has no extra link tag')
 change("let val = c.type==='link'", "let val = c.type==='actionPoint' ? '⚡ +'+c.apGain : c.type==='link'",'supply value')
 change("  if(c.type==='link') return '연계 게이지';", "  if(c.type==='actionPoint') return '행동력 보충';\n  if(c.type==='link') return '연계 게이지';",'supply catalog')
 change("resource < p5Price(s);", "resource < p5Price(s) || (apEnabled()&&apState.points<1);",'shop UI')
 change("(n >= s.limit ? '재고 소진' : '구매')", "(n >= s.limit ? '재고 소진' : apEnabled()&&apState.points<1?'행동력 부족':apEnabled()?'구매 ⚡1':'구매')",'visible purchase cost')
 change("(c.text || '') + '</div>'+dangerCardBadge(c)","(c.text || '') + apCardText(c) + '</div>'+dangerCardBadge(c)",'hand cost label')
 change("((a||curse) ? 'disabled' : '')", "((a||curse||!apCanUse(c)) ? 'disabled' : '')",'hand affordance')
 change("((a||curse) ? '사용 불가' : '사용')", "((a||curse) ? '사용 불가' : !apCanUse(c)?'행동력 부족':'사용'+(apCost(c)?' ⚡'+apCost(c):''))",'hand button label')
 change("s.text + '</p><span class=\"price\">💰 '", "s.text + (apEnabled()?' · 구매 ⚡1':'') + '</p><span class=\"price\">💰 '",'buy cost label')
 # Promotion requirements use costText everywhere, avoiding a misleading second price.
 change("const costText = cost => [", "const costText = cost => [apEnabled()?'⚡1':'',",'promotion cost label')
 return Path(__file__).with_name('action-points.js').read_text()+'\n'+game
