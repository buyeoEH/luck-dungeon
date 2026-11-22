"""Growth, direct-removal rewards and all-attack coexistence on the existing screen."""
from pathlib import Path
import hashlib,json,re,subprocess
import build_v0317
R=Path(__file__).resolve().parent;P=build_v0317.P;once=build_v0317.once
def build():
 meta=build_v0317.build();p=P/'game.js';g=p.read_text()
 g=once(g,"trialState313[k]=Math.min(3,trialState313[k]+1);log(","trialState313[k]=Math.min(3,trialState313[k]+1);seedUsed318(c,k);log(")
 g=once(g,"let a = c.type === 'attack' || c.type === 'specialAttack',","let a = c.type === 'attack' || c.type === 'specialAttack' || c.type==='breakReward318',")
 g=once(g,"let val = c.type==='luckStrength' ?", "let val = c.type==='breakReward318' ? '직접 제거 전용' : c.type==='luckStrength' ?")
 g=g.replace("(a ? 'ATTACK' : aoe ?", "(c.type==='breakReward318'?'BREAK ONLY':a ? 'ATTACK' : aoe ?")
 g=g.replace('광역0일 때 관통과 함께 발동하는','광역·관통과 함께 발동하는').replace('광역0이면 연속타가 발동합니다.','광역 유무와 관계없이 연속타가 발동합니다.').replace('광역0·공격55·덱 공격35 이상이면','공격55·덱 공격35 이상이면')
 g=g.replace('v0.3.17 카드 관통·연속타 공존','v0.3.18 발아·파괴 보상 검증').replace('관통이 있어도 연속타 유지.','광역·관통이 있어도 연속타 유지. 첫 상점에 파괴 카드와 제거 수단을 각1종 보장(검증용).')
 g+='\n'+(R/'growth-destruction-v0318.js').read_text();p.write_text(g)
 (P/'growth-destruction-v0318.css').write_text((R/'growth-destruction-v0318.css').read_text())
 core=P/'v0220-core.js';s=core.read_text();s=once(s,'mutation315:c.mutation315||null,','mutation315:c.mutation315||null,seed_uses318:c.seedUses318||0,break_reward318:c.break318||null,')
 s=once(s,"emit('attack_stages317',", "emit('attack_contributions318',scene.damage318);\n emit('attack_stages317',")
 core.write_text(s)
 for name in ['autolab.js','v030-reference-ai.js','v0220-bots.js']:
  f=P/name
  if f.exists():f.write_text(f.read_text().replace("'specialAttack','curse'","'specialAttack','curse','breakReward318'").replace("'specialAttack', 'curse'","'specialAttack', 'curse', 'breakReward318'"))
 names=['build_v0318.py','growth-destruction-v0318.js','growth-destruction-v0318.css'];sources={n:hashlib.sha256((R/n).read_bytes()).hexdigest() for n in names}
 meta['source_tree_dirty']=meta['source_tree_dirty'] or bool(subprocess.check_output(['git','status','--porcelain','--',*names],text=True).strip())
 meta.update(version='0.3.18-growth.1',stage='seed_sprout_direct_removal_all_attack_coexistence',growth_sources=sources,combat_rules='aoe > base_card > pooled_link > followups; only attack55/deck35 thresholds',destruction_rules='direct_selection_only; remove_all > each_result_mutation > base_reward',initial_shop_access='one break card and one remover guaranteed; other slots retained; ?destructionAccess=0 comparison')
 meta['build_id']='0318-'+hashlib.sha256((g+json.dumps(sources,sort_keys=True)).encode()).hexdigest()[:16];(P/'build.json').write_text(json.dumps(meta,indent=2))
 h=(P/'index.html').read_text();h=re.sub(r'window.LUCK_BUILD=\{[^<]+?\};',lambda _:'window.LUCK_BUILD='+json.dumps(meta)+';',h,count=1);h=h.replace('v0.3.17 관통·연속타 공존','v0.3.18 발아·파괴 보상').replace('</head>','<link rel="stylesheet" href="growth-destruction-v0318.css"></head>');(P/'index.html').write_text(h)
 return meta
if __name__=='__main__':print(json.dumps(build()))
