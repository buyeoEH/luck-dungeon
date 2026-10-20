#!/usr/bin/env python3
"""Non-AI, reproducible root-cause analysis for AutoLab; no external dependencies."""
import csv,json,sys,statistics
from pathlib import Path
from collections import defaultdict,Counter

def read_csv(path):
 if not path.exists():return []
 with path.open(encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f))

def num(x):
 try:return float(x or 0)
 except (ValueError,TypeError):return 0.0

def main():
 out=Path(sys.argv[1]) if len(sys.argv)>1 else Path('results')
 runs=read_csv(out/'runs.csv');rounds=read_csv(out/'rounds.csv')
 if not runs:raise SystemExit('No runs.csv to analyze')
 events=[]
 if (out/'events.jsonl').exists():
  with (out/'events.jsonl').open(encoding='utf-8') as f:
   for line in f:
    if line.strip():events.append(json.loads(line))
 byrun=defaultdict(list)
 for e in events:byrun[(e['strategy'],str(e['seed']))].append(e)
 strategies=defaultdict(list)
 causes=Counter();observations=Counter();ingredient_notes=Counter();shop_info=Counter()
 run_details=[]
 for r in runs:
  strategies[r['strategy']].append(r)
  key=(r['strategy'],str(r['seed']))
  snapshots=[x for x in byrun[key] if x.get('type')=='shop_snapshot']
  promos=int(num(r['promotions']))
  if promos:
   cause='promoted'
  elif not snapshots:
   cause='no_shop_diagnostics'
  else:
   all_recipes=[p for e in snapshots for p in e.get('recipes',[])]
   material_ready=[p for p in all_recipes if not p.get('missingCount',99)]
   affordable=[p for p in material_ready if p.get('ready')]
   if affordable:cause='affordable_but_no_promotion'
   elif material_ready:
    if any(p.get('gemShort',0) for p in material_ready) and not any(p.get('resourceShort',0) and not p.get('gemShort',0) for p in material_ready):cause='gem_shortage'
    else:cause='resource_shortage'
   else:cause='missing_recipe_cards'
   if all_recipes:
    closest=min(all_recipes,key=lambda p:(p.get('missingCount',99),p.get('resourceShort',0)+p.get('gemShort',0)))
    offered={c['id'] for e in snapshots for c in e.get('offers',[]) if c.get('left',0)>0}
    for card,amount in closest.get('missing',{}).items():
     ingredient_notes['missing:'+card]+=amount
     if card not in offered:ingredient_notes['not_offered_during_run:'+card]+=1
  for e in snapshots:
   if e.get('stage')=='entry':
    shop_info['visits']+=1
    if any(p.get('ready') for p in e.get('recipes',[])):shop_info['promotion_ready_visits']+=1
  shop_info['purchases']+=sum(1 for e in byrun[key] if e.get('type')=='purchase')
  causes[cause]+=1
  run_details.append({'strategy':r['strategy'],'seed':int(num(r['seed'])),'round':int(num(r['round'])),'promotions':promos,'classification':cause,'shop_visits':sum(1 for e in snapshots if e.get('stage')=='entry')})
 for e in events:observations[e.get('type','unknown')]+=1
 summaries=[]
 for name,group in sorted(strategies.items()):
  n=len(group)
  summaries.append({'strategy':name,'runs':n,'clear_rate':sum(num(r['cleared']) for r in group)/n,'avg_round':round(statistics.mean(num(r['round']) for r in group),2),'avg_score':round(statistics.mean(num(r['score']) for r in group),1),'avg_promotions':round(statistics.mean(num(r['promotions']) for r in group),3),'avg_cards_bought':round(statistics.mean(num(r['cardsBought']) for r in group),2),'avg_aoe_damage':round(statistics.mean(num(r['aoeDamage']) for r in group),2),'error_runs':sum(bool(r.get('error')) for r in group)})
 analysis={'game_version':'0.2.18','total_runs':len(runs),'total_round_rows':len(rounds),'total_events':len(events),'strategies':summaries,'promotion_diagnosis':{'causes':dict(causes),'missing_ingredients':dict(ingredient_notes),'shop':dict(shop_info)},'event_counts':dict(observations),'runs':run_details,'limitations':['Classification describes the sampled bot policy and logged shop states, not a proof of game design balance.','Missing/not offered refers to observed offers; event history does not prove an exact spawn probability.','Before schema migration/database connection, report is produced locally only.']}
 (out/'analysis.json').write_text(json.dumps(analysis,ensure_ascii=False,indent=2),encoding='utf-8')
 lines=['# AutoLab 자동 분석','',f'- 총 시뮬레이션: **{len(runs)}회**',f'- 상세 로그 이벤트: **{len(events)}건**',f'- 라운드 기록: **{len(rounds)}건**','','## 전략별 결과','','| 전략 | 실행 | R30 클리어율 | 평균 종료 라운드 | 평균 승급 | 평균 구매 | 평균 광역 피해 |','|---|---:|---:|---:|---:|---:|---:|']
 for s in summaries:lines.append(f"| {s['strategy']} | {s['runs']} | {100*s['clear_rate']:.1f}% | {s['avg_round']:.1f} | {s['avg_promotions']:.2f} | {s['avg_cards_bought']:.1f} | {s['avg_aoe_damage']:.1f} |")
 labels={'promoted':'정상 승급 실행','affordable_but_no_promotion':'조건 충족, 봇이 승급하지 않음','resource_shortage':'재료 보유, 자원 부족','gem_shortage':'재료 보유, 보석 부족','missing_recipe_cards':'승급 재료 카드 부족','no_shop_diagnostics':'승급 진단 로그 없음'}
 lines+=['','## 승급 원인 분류','']
 for k,v in causes.most_common():lines.append(f'- {labels.get(k,k)}: **{v}회**')
 lines+=['','## 승급 재료 확인 기록','']
 for k,v in ingredient_notes.most_common(15):lines.append(f'- `{k}`: {v}')
 if not ingredient_notes:lines.append('- 승급 재료 데이터 없음')
 lines+=['','## 분석시 주의사항','','- 상점 출현 여부는 실제 관측된 카드만 기준이며, 등장 확률 계산은 별도 실험이 필요합니다.','- 봇 의사결정의 한계와 게임 설계의 난이도를 구분하세요.','- `promotion_diagnosis.causes`는 해당 실행에서 승급이 없었던 이유를 최종적으로 분류한 것입니다.','']
 (out/'analysis.md').write_text('\n'.join(lines),encoding='utf-8')
 print(json.dumps({'total_runs':len(runs),'events':len(events),'causes':dict(causes),'strategies':summaries},ensure_ascii=False))

if __name__=='__main__':main()
