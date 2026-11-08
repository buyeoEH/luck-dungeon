from pathlib import Path
R=Path(__file__).resolve().parent

def patch(g):
 def change(a,b):
  nonlocal g
  assert g.count(a)==1,(a[:70],g.count(a))
  g=g.replace(a,b)
 change('boss:!!e.boss,shield:e.shield,core:e.coreHp}', 'boss:!!e.boss,shield:e.shield,core:e.coreHp,shieldMax:e.shieldMax,coreMax:e.coreMax}')
 change("<b>'+e.name+'</b><div class=\"cin-hp\">", "<b>'+e.name+'</b>'+bossCinematicVitals(e)+'<div class=\"cin-hp\">")
 g+='\n'+(R/'boss-presence.js').read_text()
 return g
