"""Luck rules and one-combat full reshuffle. Retain v0.3.14 targeting feedback."""
from pathlib import Path
import hashlib,json,re
import build_v0314
R=Path(__file__).resolve().parent
P=build_v0314.P
once=build_v0314.once
def build():
 meta=build_v0314.build()
 p=P/'game.js';g=p.read_text()
 g=once(g,"luck:new URLSearchParams(location.search).get('trialLuck')==='1'","luck:true")
 g=once(g,'let n = bossBaseHand() + nextDraw;','if(bossMega.pending)megaReshuffle315();\n  let n = bossBaseHand() + nextDraw;')
 # Incremented once for both normal rounds and multi-turn boss combats.
 g=once(g,'bossMega.active=mega;const out=draw0.apply(this,arguments);','bossMega.active=mega;prepareCombatLuck315();const out=draw0.apply(this,arguments);applyCombatLuck315();')
 # Remove obsolete luck-off comparison links; keep explicit targeting toggle.
 start=g.index(" document.addEventListener('DOMContentLoaded',()=>{const box=node313('section'")
 end=g.index('\n})();',start)
 g=g[:start]+" document.addEventListener('DOMContentLoaded',()=>{const box=node313('section',undefined,'ap-rules');box.append(node313('b','v0.3.15 운빨 개편 적용 · 수치는 검증용 초안'));box.append(node313('p','사용 효과 → 별도 파괴 → 파괴 결과 순서. 행운력은 첫 판정에만 적용하며 불운 최소 15%를 유지합니다.'));for(const on of [true,false]){const a=node313('a',on?'관통 지정 켜기':'관통 지정 끄기');const u=new URL(location.href);u.searchParams.set('trialPierce',Number(on));a.href=u.href;a.style.cssText='display:inline-block;margin:6px;padding:8px';box.append(a);}$('welcomeNormal')?.parentElement?.before(box);});"+g[end:]
 g=g.replace('메가턴','폭발의 기회').replace('다음 1턴','다음 1전투').replace('이번 1턴','이번 1전투').replace('그 다음 턴부터','그 다음 전투부터').replace('다음 턴','다음 전투').replace('직후 1턴만','직후 1전투만').replace('이번 턴만 손패','이번 전투만 손패')
 g=g.replace('다음 전투 1턴에만 시작 손패 8장·행동력 3을 함께 받습니다.','다음 1전투 첫 드로우 직전에 드로우 더미와 묘지를 모두 합쳐 리셔플합니다. 시작 손패 8장·행동력 3을 받습니다.')
 g=once(g,"  } else if (c.type === 'random') {", "  } else if (c.type === 'luckLegend315') {\n    const legendChanges315=[];applyEffect315(c.legendUse315,legendChanges315);changes.push(...legendChanges315.map(text=>({text,color:'#fde68a'})));luckEmit315('luck_legend_used',{card_id:cardKey(c),instance_id:c.id,effects:c.legendUse315});\n  } else if (c.type === 'random') {")
 g+='\n'+(R/'luck-v0315.js').read_text();p.write_text(g)
 core=P/'v0220-core.js';s=core.read_text();s=once(s,'action_point_cost:apCost(c)','action_point_cost:apCost(c),mutation315:c.mutation315||null,family315:c.family315||null,legend_start315:c.legendStart315||null,legend_use315:c.legendUse315||null');core.write_text(s)
 sources={name:hashlib.sha256((R/name).read_bytes()).hexdigest() for name in ['luck-v0315.js','build_v0315.py']}
 meta['source_tree_dirty']=meta['source_tree_dirty'] or any(__import__('subprocess').check_output(['git','status','--porcelain','--',name],text=True).strip() for name in sources)
 meta.update(version='0.3.15-luck.1',stage='luck_independent_destruction_mutation_mega_reshuffle',luck_sources=sources,experiments={'luck':'always_on','pierce':'?trialPierce=1'},balance_status='draft_starting_values',mega_rule='one_next_combat_full_reshuffle_8_cards_3_ap')
 meta['build_id']='0315-'+hashlib.sha256((g+json.dumps(sources,sort_keys=True)).encode()).hexdigest()[:16]
 (P/'build.json').write_text(json.dumps(meta,indent=2))
 h=(P/'index.html').read_text();h=re.sub(r'window.LUCK_BUILD=\{[^<]+?\};',lambda _:'window.LUCK_BUILD='+json.dumps(meta)+';',h,count=1)
 h=h.replace('v0.3.14 관통 피드백','v0.3.15 운빨 개편').replace('메가턴','폭발의 기회');(P/'index.html').write_text(h)
 return meta
if __name__=='__main__':print(json.dumps(build()))
