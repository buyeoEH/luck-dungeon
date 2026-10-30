"""Fail-closed P5 changes restricted to v0.3 runtime."""
from pathlib import Path
from v0219_patch import once
def patch(game):
 game=once(game,".filter(z=>z.remain>0);",".filter(z=>z.remain>0 && !p5IsLocked(z.idx));",'P5 exclude locked slots')
 game=once(game,'function start() {','function start() {\n  p5Reset();','P5 reset reward flow')
 return Path(__file__).with_name('p5-rewards.js').read_text()+'\n'+game
