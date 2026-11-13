from pathlib import Path
import json,hashlib,re,shutil
import build_boss
from tactics_v0312_patch import patch
R=Path(__file__).resolve().parent;P=build_boss.P
def build():
 meta=build_boss.build()
 source=(P/'game.js').read_text();game=patch(source)
 ids=['deck_call','hand_cycle','hand_salvage','last_reserve','ap_core','tactic_blade','tactic_drive','tactic_lance','tactic_link','tactic_blade2','tactic_drive2']
 paths=['<path d="M38 25a18 18 0 1 0 0 36 18 18 0 0 0 0-36Zm13 31 17 17"/>','<path d="M22 35a25 25 0 1 1-2 24M12 25l10 10 12-8"/>','<path d="m20 32 22-13 22 13-22 14Zm0 0v30l22 14 22-14V32M42 46v30"/>','<path d="M47 14 25 48h19l-4 30 25-39H47Z"/>','<path d="M30 18h28v60H30ZM21 30h9m28 0h9M38 31h12m-12 14h12m-12 14h12"/>']
 for i,id in enumerate(ids):
  (P/'assets/cards'/f'{id}.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88"><rect x="3" y="3" width="82" height="82" rx="16" fill="#14283d" stroke="#56d6c1" stroke-width="3"/><g fill="none" stroke="#f3d982" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">'+paths[i%5]+'</g></svg>')
 mapping='\n'.join("LUCK_CARD_ICONS["+json.dumps(id)+"]="+json.dumps('assets/cards/'+id+'.svg')+';' for id in ids)
 game=game.replace('const CARD_NAME = {};',mapping+'\nconst CARD_NAME = {};')
 meta.update(version='0.3.12-rewards.1',stage='rewards_tactics_playtest',source_tree_dirty=True,release_scope='isolated_playtest',reward_rules={'reroll_sold_out':True,'basic_restock':2,'random_restock':2,'extra_restock':False,'coupon':'50%, cap6, first successful purchase next shop','stone':'first-tier card toward second-tier recipe, immediate reward','mega_name':'폭발의 기회'},new_tactic_cards=ids[:5],new_tactic_promotions=ids[5:])
 meta['build_id']='0312-'+hashlib.sha256((meta['build_id']+game).encode()).hexdigest()[:16]
 (P/'game.js').write_text(game)
 h=(P/'index.html').read_text();h=re.sub(r'window.LUCK_BUILD=\{[^<]+?\};',lambda _: 'window.LUCK_BUILD='+json.dumps(meta)+';',h,count=1)
 h=h.replace('v0.3.11 무한 보스·보호 이미지','v0.3.12 보상·전술 카드').replace('🔥 메가턴','🔥 폭발의 기회').replace('메가턴 보상','폭발의 기회 보상').replace('메가턴은','폭발의 기회는')
 h=h.replace('</head>','<style>#modalContent button{margin:4px;max-width:calc(100% - 8px);white-space:normal;overflow-wrap:anywhere}#modalContent p{line-height:1.6}</style></head>')
 (P/'index.html').write_text(h);(P/'build.json').write_text(json.dumps(meta,indent=2));return meta
if __name__=='__main__':print(json.dumps(build()))
