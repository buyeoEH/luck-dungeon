from pathlib import Path
R=Path(__file__).resolve().parent
def patch(game):
 start=game.index("  const atkBox = $('atkContainer');")
 end=game.index('  // Show mode selection before the first run;',start)
 game=game[:start]+'  window.LuckMobileUI.bindAttackDetails();\n\n'+game[end:]
 old="function focusSection(id) { const el=$(id); if(el) el.scrollIntoView({behavior:'smooth',block:'center'}); }"
 assert game.count(old)==1
 game=game.replace(old,"function focusSection(id) { const el=$(id); window.LuckMobileUI?.refreshLayout(); if(el) el.scrollIntoView({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches?'instant':'smooth',block:'start'}); }")
 return game+'\n'+(R/'mobile-ui.js').read_text()
