"""Frozen-strata fractional best, paired seed-cluster inference; no selector tuning."""
from pathlib import Path
from collections import defaultdict,Counter
import json,itertools,math
import numpy as np
R=Path(__file__).resolve().parent;E=R.parent/'p5-next-evidence';O=R/'p5f-report';O.mkdir(exist_ok=True)
P=['aoe','economy','balanced','pierce','luck','link','attack'];N=['상점교체','재입고','랜덤카드','승급석'];W=np.random.default_rng(20261031).multinomial(400,[1/400]*400,size=2000)
def read(p):
 for l in p.open():yield json.loads(l)
def ci(a,b):
 a=np.asarray(a);b=np.asarray(b);den=W@b;n=W@a;v=np.divide(n,den,out=np.zeros(len(den)),where=den>0)
 return {'value':float(a.sum()/b.sum()) if b.sum() else None,'low':float(np.quantile(v,.025)),'high':float(np.quantile(v,.975))}
def wilson(k,n):
 z=1.95996398454;p=k/n;d=1+z*z/n;m=(p+z*z/(2*n))/d;h=z*math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;return {'value':p,'low':m-h,'high':m+h}
def rank(x):return int(x['clear']),x['round']
def pct(x):return f"{100*x['value']:.2f}% [{100*x['low']:.2f}, {100*x['high']:.2f}]"
def delta(x):return f"{100*x['value']:+.2f}%p [{100*x['low']:.2f}, {100*x['high']:.2f}]"
def number(x):return f"{x['value']:.2f} [{x['low']:.2f}, {x['high']:.2f}]"
def pair(a,b):
 assert a.keys()==b.keys();den=np.zeros(400);dc=den.copy();dr=den.copy();up=down=tie=0
 for k,x in a.items():
  y=b[k];s=k[0]-101;den[s]+=1;dc[s]+=int(x['clear'])-int(y['clear']);dr[s]+=x['round']-y['round'];up+=rank(x)>rank(y);down+=rank(x)<rank(y);tie+=rank(x)==rank(y)
 return {'n':len(a),'improved':up,'worsened':down,'same':tie,'completion_delta':ci(dc,den),'round_delta':ci(dr,den)}
if __name__=='__main__':
 base=defaultdict(dict)
 for x in read(E/'approved/branches.jsonl'):base[x['seed'],x['profile'],x['target']][x['choice']]=x
 assert len(base)==7442 and all(len(x)==4 for x in base.values())
 forks=defaultdict(dict);seen=set()
 for p in (R/'p5f-fork').glob('worker*.jsonl'):
  for x in read(p):
   k=(x['seed'],x['profile'],x['target']);assert (*k,x['variant']) not in seen;seen.add((*k,x['variant']));forks[k][x['variant']]=x;assert x['state_sha256']==base[k][0]['state_sha256'] and not x['source_tree_dirty'] and x['object_object_count']==0
 assert len(seen)==29768 and all(len(v)==4 for v in forks.values()),len(seen)
 control=0
 for k,v in forks.items():
  for a in ['clear','round','stats','first_shop','random_calls','rewards']:assert v['C'][a]==base[k][1][a]
  control+=1
 refs={}
 for x in read(E/'reference/mixed.jsonl'):
  for i,d in enumerate(x['reward_decisions']):refs[x['seed'],x['profile'],i]=d['inputs']
 strata={p:[k for k in base if k[1]==p] for p in P}
 strata.update({'압박70%이상':[k for k in base if refs[k]['danger']],'압박70%미만':[k for k in base if not refs[k]['danger']],'고선호품절있음':[k for k in base if refs[k]['strong_random_sold_out']+refs[k]['strong_basic_sold_out']>0],'고선호품절없음':[k for k in base if refs[k]['strong_random_sold_out']+refs[k]['strong_basic_sold_out']==0]})
 for lo,hi in [(1,10),(11,20),(21,30)]:strata[f'R{lo}~{hi}']=[k for k in base if lo<=base[k][0]['moment_round']<=hi]
 strata={s:ks for s,ks in strata.items() if len(ks)>=100 and len({k[0] for k in ks})>=30}
 def matrix(mode,seeds,keys):
  den=np.zeros(400);frac=np.zeros((4,400));uniq=frac.copy();clear=frac.copy();rounds=frac.copy();within=frac.copy();ties=Counter()
  for k in keys:
   v=[forks[k]['seed3'] if seeds==3 else base[k][0],forks[k][mode],base[k][2],base[k][3]];s=k[0]-101;den[s]+=1;r=max(map(rank,v));win=[i for i,x in enumerate(v) if rank(x)==r];ties[len(win)]+=1
   for i,x in enumerate(v):
    clear[i,s]+=x['clear'];rounds[i,s]+=x['round'];within[i,s]+=any(b['round']==30 and b['within_limits'] for b in x.get('battles',[])) if 'battles' in x else x['within_r30']
    if i in win:frac[i,s]+=1/len(win);uniq[i,s]+=len(win)==1
  rows=[{'reward':N[i],'fractional':ci(frac[i],den),'unique':ci(uniq[i],den),'completion':ci(clear[i],den),'round':ci(rounds[i],den),'within_r30':ci(within[i],den)} for i in range(4)]
  highest=max(x['fractional']['value'] for x in rows);win=[N[i] for i in range(4) if abs(rows[i]['fractional']['value']-highest)<1e-12]
  return {'moments':len(keys),'seed_clusters':int((den>0).sum()),'rewards':rows,'highest':win,'ties':dict(ties),'fractional_pair_differences':[{ 'a':N[a],'b':N[b],'delta':ci(frac[a]-frac[b],den)} for a,b in itertools.combinations(range(4),2)]}
 matrices={}
 for mode in ['A','B','C']:
  for seed in [8,3]:
   key=mode+f'_seed{seed}';whole=matrix(mode,seed,list(base));sub={s:matrix(mode,seed,ks) for s,ks in strata.items()};best={n:[s for s,t in sub.items() if n in t['highest']] for n in N};matrices[key]={'overall':whole,'strata':sub,'acceptance':{'all_fractional_ge15':all(x['fractional']['value']>=.15 for x in whole['rewards']),'best_somewhere':best,'each_best_somewhere':all(best[n] for n in N)}}
 pairs={mode:pair({k:v[mode] for k,v in forks.items()},{k:v['C'] for k,v in forks.items()}) for mode in ['A','B']};pairs['seed3_vs8']=pair({k:v['seed3'] for k,v in forks.items()},{k:v[0] for k,v in base.items()})
 event_counts=Counter();b_n=b_aff=b_buy=0
 for v in forks.values():
  for e in v['B']['events']:
   event_counts[e['type']]+=1
   if e['type']=='boss_restock_immediate':b_n+=1;b_aff+=e['affordable'];b_buy+=e['purchased']
 fixed={}
 for p in (R/'p5f-fixed').glob('worker*.jsonl'):
  for x in read(p):
   k=(x['seed'],x['profile'],x['variant']);assert k not in fixed;fixed[k]=x;assert not x['source_tree_dirty'] and x['object_object_count']==0
 assert len(fixed)==11200,len(fixed)
 old_fixed={}
 for x in read(E/'approved/fixed.jsonl'):old_fixed[x['seed'],x['profile'],x['reward_policy']]=x
 for k,x in fixed.items():
  if k[2]=='C':
   y=old_fixed[k[0],k[1],'restock']
   for a in ['clear','round','stats','first_shop','random_calls','rewards']:assert x[a]==y[a]
 fixed_rows=[]
 for mode in ['A','B','C','seed3']:
  for p in P:
   a={ (s,p):fixed[s,p,mode] for s in range(101,501)};b={ (s,p):old_fixed[s,p,'reroll' if mode=='seed3' else 'restock'] for s in range(101,501)};k=sum(x['clear'] for x in a.values());row={'variant':mode,'profile':p,'clears':k,'n':400,'completion':wilson(k,400),'mean_round':sum(x['round'] for x in a.values())/400,'pair_vs_current':pair(a,b)};fixed_rows.append(row)
 fixed_all=[]
 for mode in ['A','B','C','seed3']:
  a=np.zeros(400)
  for s in range(101,501):a[s-101]=sum(fixed[s,p,mode]['clear'] for p in P)
  fixed_all.append({'variant':mode,'clears':int(a.sum()),'n':2800,'completion':ci(a,np.full(400,7))})
 diagnostics={}
 for mode in ['A','B','C','seed3']:
  ev=[e for (seed,profile,v),x in fixed.items() if v==mode for e in x['events']];buys=[e for e in ev if e['type']=='boss_restock_immediate'];coupons=[e for e in ev if e['type']=='purchase_coupon_used'];diagnostics[mode]={'immediate_restore_offers':len(buys),'immediate_affordable':sum(e['affordable'] for e in buys),'immediate_purchased':sum(e['purchased'] for e in buys),'discount8_hits':sum(e['purchased'] and e['regular_price']-e['price']==8 for e in buys),'coupons_used':len(coupons),'coupons_expired':sum(e['type']=='purchase_coupon_expired' for e in ev),'coupon_discount_mean':sum(e['discount'] for e in coupons)/len(coupons) if coupons else None,'coupon_cap_hits':sum(e['discount']==(6 if mode=='A' else 2) for e in coupons)}
 offers={p:{'moments':0,'offered':Counter(),'chosen':Counter()} for p in P}
 for k,v in forks.items():
  t=offers[k[1]];t['moments']+=1
  for e in v['seed3']['events']:
   if e['type']=='boss_seed_offer':t['offered'].update(e['cards'])
   if e['type']=='boss_seed_card':t['chosen'].update([e['card_id']])
 r={'controls':{'identical_C_forks':control,'identical_C_fixed':2800,'new_fork_runs':29768,'new_fixed_runs':11200},'matrices':matrices,'paired':pairs,'fixed':fixed_rows,'fixed_overall':fixed_all,'fixed_diagnostics':diagnostics,'seed_offer_by_policy':offers,'B_target_events':{'total_moments':7442,'restore_eligible':b_n,'affordable':b_aff,'purchased':b_buy,'event_counts':dict(event_counts)}}
 (O/'summary.json').write_text(json.dumps(r,ensure_ascii=False,indent=2));print('fixed',fixed_all);print('B',r['B_target_events']);print('acceptance',[(k,v['acceptance']) for k,v in matrices.items()])
 md=['# LUCK Dungeon P5 재입고 A/B/C 및 씨앗 3장 비교','', '본 결과는 시드101~500, 드로우 항상ON, 고정7정책으로 수행한 로컬 Node/jsdom + Chromium 실험이다. main/운영 DB/배포는 변경하지 않았다. AI 완료율은 사람 승률이 아니다.','', '## 고정 보상 완료율','', '| 정책 | A 일괄+추가+할인6 | B 즉시반값8 | C 현행 | 씨앗3 상점교체 |','|---|---:|---:|---:|---:|']
 for p in P:md.append('| '+p+' | '+' | '.join(pct(next(x['completion'] for x in fixed_rows if x['profile']==p and x['variant']==m)) for m in ['A','B','C','seed3'])+' |')
 md+=['','정책별은 Wilson95%, 통합은 시드 군집95% 구간. 고정 A/B/C는 재입고만 선택하고, 씨앗3 고정은 상점교체만 선택한다. 서로 다른 보상 종류를 같은 보상처럼 비교하지 않는다.','']
 for x in fixed_all:md.append(f"- {x['variant']}: {x['clears']}/2800 · {pct(x['completion'])}")
 md+=['','## 대상 보상 한 번만 바꾼 분기 결과','', '| 대상 | 조건부 완료율95% CI | 평균 도달R95% CI | 한계이내R30 95% CI |','|---|---:|---:|---:|']
 for mode in ['A','B','C']:
  x=matrices[mode+'_seed8']['overall']['rewards'][1];md.append('| 재입고'+mode+' | '+pct(x['completion'])+' | '+number(x['round'])+' | '+pct(x['within_r30'])+' |')
 for seed in [8,3]:
  x=matrices[f'C_seed{seed}']['overall']['rewards'][0];md.append('| 상점교체 씨앗'+str(seed)+' | '+pct(x['completion'])+' | '+number(x['round'])+' | '+pct(x['within_r30'])+' |')
 md+=['','## 같은 보상 순간의 짝 비교','', '| 변경 | 개선 / 악화 / 동일 | 완료율 차이95% CI (%p) |','|---|---:|---:|']
 for m,x in pairs.items():md.append(f"| {m} | {x['improved']} / {x['worsened']} / {x['same']} | {delta(x['completion_delta'])} |")
 md+=['','보상 직전 상태 모집단은 이전 P1 혼합 경로의 방문 상태를 그대로 재사용했다. 현재 C 혼합 경로를 새로 생성한 모집단이 아니다. 고정 실험은 이번 소스를 처음부터 실행했다. 분기 실험은 대상 보상 한 번만 변경하고 이후 보상은 C/씨앗8로 복귀한다. A/B를 지속 적용한 혼합 정책 성능으로 해석하지 않는다. 비교에 사용한 C의7442개 분기와2800개 고정 결과는 이전 C의 통계·난수·보상 경로와 모두 일치했다.','', f"B: 대상 순간7442개 중 품절 복구 가능{b_n}개, 즉시 구매 가능{b_aff}개, 실제 구매{b_buy}개. 자원 부족이면 복구 재고만 남기며 무료 카드/보석 자동 환전은 없다.",'']
 for k,x in matrices.items():
  md+=['## '+k+' 보상별 최선 분포','', '| 보상 | 동률 분할95% CI | 단독 최선95% CI | 조건부 완료율95% CI |','|---|---:|---:|---:|']
  for a in x['overall']['rewards']:md.append('| '+a['reward']+' | '+pct(a['fractional'])+' | '+pct(a['unique'])+' | '+pct(a['completion'])+' |')
  md+=['', '최소15% 전체 조건: '+str(x['acceptance']['all_fractional_ge15'])+'; 각 보상이 최소1개 사전 지정 상황/정책에서 최고: '+str(x['acceptance']['each_best_somewhere'])+'.','']
  for n,ss in x['acceptance']['best_somewhere'].items():md.append('- '+n+': '+(', '.join(ss) if ss else '해당 없음'))
 md+=['','## 재입고 작동 지표','', '아래는 고정 보상 실험의 실제 사용 기록이다. A의 효과는 일괄/추가/할인을 묶은 효과이며, 어느 한 요소의 단독 효과로 단정하지 않는다.','', '```json',json.dumps(diagnostics,ensure_ascii=False,indent=2),'```','']
 md+=['','## 해석과 제한','', '- 최고 순위는 공식완료, 다음으로 도달R. k개 동률이면1/k씩 분할하며 점수로 동률을 강제로 깨지 않는다.', '- 상태/정책 층은 결과 확인 전에 지정했다. 최소100순간·30시드 이상만 사용했다. 상세 층별95% 구간, 보상별 짝 차이, 평균 도달R/한계이내R30은 summary.json에 있다.', '- 구간은 시드 클러스터400개를2000회 재표집한 항목별95% 구간이다. 다중비교 보정은 하지 않았다. 점추정 최고가 통계적 우월을 확정하지는 않는다.', '- 씨앗3은 기존8종에서 균등 비복원 추출한다. 게임 시드 RNG를 소비하므로 이후 난수 진행이 바뀌는 효과도 포함한다. 루트별 등장 보장/선택기 비율 강제는 없다.', '- 후반 보상은 설계안만 작성했다. R30·행동력·랜덤카드·도박카드·광역 수치는 변경하지 않았다.','']
 (O/'P5F-report.md').write_text('\n'.join(md))
