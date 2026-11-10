"""Deterministic SVG card symbols for the five protection promotions."""
from pathlib import Path
GLYPHS={
 'guard_sword':'<path d="m51 73 31-37 10 2-1 11-33 32m-13-9 20 17m-12-1-10 13"/>',
 'guard_miner':'<path d="m48 83 32-40m-20-1q24-12 34 11M70 37l20 17"/>',
 'guard_vault':'<path d="m44 58 12-14h22l12 14-23 27Z"/><path d="m44 58h46M56 44l11 41 11-41"/>',
 'guard_cycle':'<path d="M43 45q13-5 24 3 11-8 24-3v35q-13-6-24 2-11-8-24-2Zm24 3v34M48 55h12m-12 8h12m14-8h11m-11 8h11"/>',
 'guard_link':'<path d="m59 66-6 6a11 11 0 0 1-16-16l12-12a11 11 0 0 1 16 0m9 12 6-6a11 11 0 0 1 16 16L84 78a11 11 0 0 1-16 0M55 67l24-19"/>'
}
def build(folder):
 folder=Path(folder);folder.mkdir(parents=True,exist_ok=True)
 for name,glyph in GLYPHS.items():
  (folder/(name+'.svg')).write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="a" x2="1" y2="1"><stop stop-color="#164e63"/><stop offset="1" stop-color="#111c37"/></linearGradient><linearGradient id="b" x2="1" y2="1"><stop stop-color="#d9f99d"/><stop offset="1" stop-color="#38bdf8"/></linearGradient></defs><path d="M64 7 110 24v34c0 30-21 50-46 63C39 108 18 88 18 58V24Z" fill="url(#a)" stroke="url(#b)" stroke-width="5"/><g stroke="#e0f2fe" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round">'+glyph+'</g></svg>')
