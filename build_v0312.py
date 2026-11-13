from pathlib import Path
import json,hashlib,re,shutil,subprocess
import build_boss
from tactics_v0312_patch import patch
R=Path(__file__).resolve().parent;P=build_boss.P
def build():
 meta=build_boss.build()
 source=(P/'game.js').read_text();game=patch(source).replace('메가턴','폭발의 기회')
 ids=['deck_call','hand_cycle','hand_salvage','last_reserve','ap_core','tactic_blade','tactic_drive','tactic_lance','tactic_link','tactic_blade2','tactic_drive2']
 paths=['<path d="M38 25a18 18 0 1 0 0 36 18 18 0 0 0 0-36Zm13 31 17 17"/>','<path d="M22 35a25 25 0 1 1-2 24M12 25l10 10 12-8"/>','<path d="m20 32 22-13 22 13-22 14Zm0 0v30l22 14 22-14V32M42 46v30"/>','<path d="M47 14 25 48h19l-4 30 25-39H47Z"/>','<path d="M30 18h28v60H30ZM21 30h9m28 0h9M38 31h12m-12 14h12m-12 14h12"/>']
 for i,id in enumerate(ids):
  (P/'assets/cards'/f'{id}.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88"><rect x="3" y="3" width="82" height="82" rx="16" fill="#14283d" stroke="#56d6c1" stroke-width="3"/><g fill="none" stroke="#f3d982" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">'+paths[i%5]+'</g></svg>')
 mapping='\n'.join("LUCK_CARD_ICONS["+json.dumps(id)+"]="+json.dumps('assets/cards/'+id+'.svg')+';' for id in ids)
 game=game.replace('const CARD_NAME = {};',mapping+'\nconst CARD_NAME = {};')
 meta.update(version='0.3.12-rewards.2',stage='rewards_tactics_playtest',source_tree_dirty=meta['source_tree_dirty'] or bool(subprocess.check_output(['git','status','--porcelain','--','build_v0312.py','tactics-v0312.js','tactics_v0312_patch.py','test-v0312-browser.cjs'],text=True).strip()),release_scope='public_web_playtest',reward_rules={'reroll_sold_out':True,'basic_restock':2,'random_restock':2,'extra_restock':False,'coupon':'50%, cap6, first successful purchase next shop','stone':'first-tier card toward second-tier recipe, immediate reward','mega_name':'폭발의 기회'},new_tactic_cards=ids[:5],new_tactic_promotions=ids[5:])
 meta['tactics_sources']={n:hashlib.sha256((R/n).read_bytes()).hexdigest() for n in ['build_v0312.py','tactics-v0312.js','tactics_v0312_patch.py','test-v0312.cjs','test-v0312-dom.cjs','test-v0312-browser.cjs','smoke-v0312.cjs','boss-ai-v312.cjs','V0312-REWARDS-TACTICS.md']}
 meta['build_id']='0312-'+hashlib.sha256((meta['build_id']+game+json.dumps(meta['tactics_sources'],sort_keys=True)).encode()).hexdigest()[:16]
 (P/'game.js').write_text(game)
 h=(P/'index.html').read_text();h=re.sub(r'window.LUCK_BUILD=\{[^<]+?\};',lambda _: 'window.LUCK_BUILD='+json.dumps(meta)+';',h,count=1)
 h=h.replace('v0.3.11 무한 보스·보호 이미지','v0.3.12 보상·전술 카드').replace('🔥 메가턴','🔥 폭발의 기회').replace('메가턴 보상','폭발의 기회 보상').replace('메가턴은','폭발의 기회는').replace('메가턴','폭발의 기회')
 for name in ['preview-ui.js','history.js','rankings.js']:
  f=P/name;f.write_text(f.read_text().replace('v0.3.11 무한 보스·보호 이미지','v0.3.12 보상·전술 카드').replace('메가턴','폭발의 기회'))
 guide=P/'v030-tutorial.js';text=guide.read_text()
 text=text.replace('재고가 남은 상품 중 유지할 카드','품절 상품을 포함해 유지할 카드').replace('재고가 남은 비잠금 상품 중 최대 3장이 교체됩니다.','품절을 포함한 비잠금 상품 중 최대 3장이 교체됩니다. 품절 슬롯의 새 상품은 기본 재고로 제공됩니다.')
 text=re.sub(r'<p>보스 보상에서 재입고를 선택하는 즉시.*?</p>','<p>재입고 선택 즉시 기본 상점과 현재 랜덤 상점의 재고가 각각 +2 됩니다. 별도의 품절 1종 추가 복구는 없습니다.</p>',text)
 text=text.replace('<h4>재입고 A','<h4>재입고')
 text=text.replace('<p>🔒 이 RC는 기기 저장 전용입니다. 운영 서버·정식 랭킹에는 전송하지 않으며 이전 버전 기록은 자동 이관하지 않습니다.</p>','<h4>만능승급석과 폭발의 기회</h4><p>만능승급석은 선택 즉시 2차 경로에 부족한 1차 승급 카드 1장을 덱에 지급합니다. 부족 재료와 현재 비용 부족분 기준으로 경로를 정렬하며 승급 비용은 별도입니다. 폭발의 기회는 다음 1턴만 시작 손패 8장·행동력 3이며 이후 5장·2로 복귀합니다.</p><h4>선택형 전술과 행동력 카드</h4><p>전술 검색은 이번 전투 미사용 카드 1장을 덱에서 손패로 옮깁니다. 결단의 순환은 다른 손패 여러 장을 영구 제거하고 같은 수만큼 드로우를 요청합니다. 회수와 투자는 다른 손패 1장을 영구 제거하고 정가만큼 자원을 얻습니다. 마지막 기회는 행동력 +1 후 다른 사용 카드가 없으면 드로우 +1, 행동의 원천은 행동력 +2입니다. 신규 승급 6종과 비용·전투당 사용 제한은 도감에서 확인하세요.</p><p>이 버전의 플레이 기록은 테스트 기록으로 구분합니다. 이전 버전의 기록은 자동 이관하지 않습니다.</p>')
 guide.write_text(text)
 h=h.replace('</head>','<style>#modalContent button{margin:4px;max-width:calc(100% - 8px);white-space:normal;overflow-wrap:anywhere}#modalContent p{line-height:1.6}</style></head>')
 (P/'index.html').write_text(h);(P/'build.json').write_text(json.dumps(meta,indent=2));return meta
if __name__=='__main__':print(json.dumps(build()))
