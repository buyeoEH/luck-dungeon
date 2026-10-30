"""Reward fork analysis. Seed-cluster CIs, tie-aware rank; no selector tuning."""
import json, gzip, collections, itertools, math, sys
from pathlib import Path
import numpy as np
BASE=Path(__file__).resolve().parent
CAND=BASE.parent/'p5-live'
OUT=BASE/'p5c-report';OUT.mkdir(exist_ok=True)
NAMES=['상점교체','재입고','랜덤카드','승급석'];PROFILES=['aoe','economy','balanced','pierce','luck','link','attack']
W=np.random.default_rng(20261030).multinomial(400,[1/400]*400,size=2000)
def lines(p):
 for f in sorted(p.glob('worker-*.jsonl')):
  for l in f.open():yield json.loads(l)
def ci(num,den):
 a=np.asarray(num);b=np.asarray(den);total=a.sum()/b.sum() if b.sum() else 0
 aa=W@a;bb=W@b;q=np.divide(aa,bb,out=np.zeros_like(aa,dtype=float),where=bb!=0)
 return {'value':float(total),'low':float(np.quantile(q,.025)),'high':float(np.quantile(q,.975))}
def wilson(k,n):
 z=1.95996398454;p=k/n;d=1+z*z/n;m=(p+z*z/(2*n))/d;h=z*math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d
 return {'value':p,'low':m-h,'high':m+h}
def load_forks(path):
 groups=collections.defaultdict(dict);seen=set()
 for x in lines(path):
  k=(x['seed'],x['profile'],x['target']);assert (*k,x['choice']) not in seen;seen.add((*k,x['choice']))
  assert x['object_object_count']==0;groups[k][x['choice']]={a:x[a] for a in ['clear','round','within_r30','state_sha256','moment_round','reference_choice']}
 assert len(groups)==7442 and len(seen)==29768,(len(groups),len(seen))
 for v in groups.values():assert len(v)==4 and len({r['state_sha256'] for r in v.values()})==1
 return groups

def summarize(groups):
 sizes=collections.Counter((k[0],k[1]) for k in groups)
 def table(keys,run_equal=False):
  den=np.zeros(400); clear=np.zeros((4,400)); rounds=clear.copy();within=clear.copy();unique=clear.copy();inclusive=clear.copy();fractional=clear.copy();ties=collections.Counter()
  for k in keys:
   v=groups[k];s=k[0]-101;weight=1/sizes[k[:2]] if run_equal else 1;den[s]+=weight
   rank=max((int(x['clear']),x['round']) for x in v.values());wins=[c for c,x in v.items() if (int(x['clear']),x['round'])==rank];ties[len(wins)]+=1
   for c,x in v.items():
    clear[c,s]+=weight*x['clear'];rounds[c,s]+=weight*x['round'];within[c,s]+=weight*x['within_r30']
    if c in wins:unique[c,s]+=weight*(len(wins)==1);inclusive[c,s]+=weight;fractional[c,s]+=weight/len(wins)
  return {'moments':len(keys),'ties':dict(ties),'all_four_clear':sum(all(x['clear'] for x in groups[k].values()) for k in keys),'all_four_fail_same_round':sum(not any(x['clear'] for x in groups[k].values()) and len({x['round'] for x in groups[k].values()})==1 for k in keys),'rewards':[{**{'reward':NAMES[c]},**{n:ci(a[c],den) for n,a in [('completion',clear),('round',rounds),('within_r30',within),('unique_best',unique),('inclusive_best',inclusive),('fractional_best',fractional)]}} for c in range(4)]}
 refs={}
 for p in (BASE/'p5b-results').glob('worker-*.jsonl'):
  for l in p.open():
   x=json.loads(l)
   if x['experiment']=='mixed':
    for i,d in enumerate(x['reward_decisions']):refs[x['seed'],x['profile'],i]=d['inputs']
 strata={'위험 압박(한계70% 이상)':lambda k:refs[k]['danger'],'안전(한계70% 미만)':lambda k:not refs[k]['danger'],'고선호 품절 상품 있음':lambda k:refs[k]['strong_random_sold_out']+refs[k]['strong_basic_sold_out']>0,'승급석 근접 레시피 있음':lambda k:refs[k]['near_recipes']>0,'교체 가능 재고 없음':lambda k:refs[k]['active_slots']==0,'새 미등장 상품 없음':lambda k:refs[k]['unseen']==0,'보상 라운드1~10':lambda k:groups[k][0]['moment_round']<=10,'보상 라운드11~20':lambda k:10<groups[k][0]['moment_round']<=20,'보상 라운드21~30':lambda k:groups[k][0]['moment_round']>20}
 state_tables={name:table([k for k in groups if pred(k)]) for name,pred in strata.items() if any(pred(k) for k in groups)}
 out={'state_strata':state_tables,'overall':table(list(groups)),'run_equal':table(list(groups),True),'policy':{p:table([k for k in groups if k[1]==p]) for p in PROFILES},'ordinal':{a:table([k for k in groups if (k[2]==0)==(a=='first')]) for a in ['first','later']}}
 pairs=[]
 for a,b in itertools.combinations(range(4),2):
  den=np.zeros(400);dc=den.copy();dr=den.copy();improved=worsened=tied=0
  for k,v in groups.items():
   s=k[0]-101;den[s]+=1;ra=(int(v[a]['clear']),v[a]['round']);rb=(int(v[b]['clear']),v[b]['round']);improved+=ra>rb;worsened+=ra<rb;tied+=ra==rb;dc[s]+=int(v[a]['clear'])-int(v[b]['clear']);dr[s]+=v[a]['round']-v[b]['round']
  pairs.append({'a':NAMES[a],'b':NAMES[b],'a_better':improved,'b_better':worsened,'tied':tied,'completion_difference':ci(dc,den),'round_difference':ci(dr,den)})
 out['paired_rewards']=pairs;return out

def fmt(x,pct=True):
 m=100 if pct else 1;return f"{x['value']*m:.2f} [{x['low']*m:.2f}, {x['high']*m:.2f}]"+('%' if pct else '')
def md_table(s):
 rows=['| 보상 | 완료율(95% CI) | 평균 도달 R(95% CI) | 한계 이내 R30(95% CI) | 단독 최선(95% CI) | 동률 분할(95% CI) | 동률 포함(95% CI) |','|---|---:|---:|---:|---:|---:|---:|']
 for r in s['rewards']:rows.append('| '+' | '.join([r['reward'],fmt(r['completion']),fmt(r['round'],False),fmt(r['within_r30']),fmt(r['unique_best']),fmt(r['fractional_best']),fmt(r['inclusive_best'])])+' |')
 return '\n'.join(rows)

if __name__=='__main__':
 old=load_forks(BASE/'p5c-results');res={'baseline':summarize(old)}
 new=None
 if '--final' in sys.argv:
  new=load_forks(CAND/'p5e-results');assert old.keys()==new.keys()
  for k in old:assert old[k][0]['state_sha256']==new[k][0]['state_sha256']
  res['approved']=summarize(new)
  pairs=[]
  for c in range(4):
   den=np.zeros(400);dc=den.copy();dr=den.copy();up=down=tie=0
   for k,v in old.items():
    a=new[k][c];b=v[c];s=k[0]-101;den[s]+=1;dc[s]+=int(a['clear'])-int(b['clear']);dr[s]+=a['round']-b['round'];ra=(int(a['clear']),a['round']);rb=(int(b['clear']),b['round']);up+=ra>rb;down+=ra<rb;tie+=ra==rb
   pairs.append({'reward':NAMES[c],'improved':up,'worsened':down,'same':tie,'completion_difference':ci(dc,den),'round_difference':ci(dr,den)})
  res['before_after']=pairs
 (OUT/'oracle-summary.json').write_text(json.dumps(res,ensure_ascii=False,indent=2))
 report=['# LUCK Dungeon v0.3 P5 보상 순간 분기 실험','', '같은 보상 직전 상태와 실제 PRNG 상태를 재현하고 네 보상을 각각 선택해 공식전 종료까지 실행했다. 선택기 비율 맞추기 및 게임 수치 재조정은 하지 않았다.','', '## 조건과 판정','', '- 시드 101~500, 고정된 7개 AI 정책, 드로우 항상 ON. 기존 혼합 선택 정책 state-reward-v1의 2,800개 경로에서 실제 방문한 7,442개 보상 순간. 단계별 29,768회 재실행.', '- 최선 판정은 공식 완료 우선, 다음으로 도달 라운드. 점수·잔여 적 HP로 동률을 강제로 깨지 않았다. 단독 최선, 동률 포함, 동률 분할(1/동률 수)을 구분한다.', '- 95% 구간: 동일 시드의 7개 정책과 반복 보상 순간을 함께 재표집하는 시드 군집 부트스트랩 2,000회. 시드 클러스터 400개. 정책별 완료율 고정 실험은 Wilson 구간. 구간은 항목별이며 다중 비교 보정 구간이 아니다.', '- 완료율은 해당 보상 순간까지 생존한 상태를 대상으로 하므로, 시작부터 보상을 고정한 완료율과 직접 비교하면 안 된다. 이는 AI 정책에 상대적인 방문 상태 실험이다. 사람 승률이나 전체 게임 상태의 최적 정책을 뜻하지 않는다. 이후 모든 보상을 최적으로 고르는 재귀적 오라클이 아니다. 긴 경로의 반복 보상을 고려한 run-equal 민감도도 JSON에 제공한다.','', '## 변경 전: 게임 변경 없는 측정','', '엔진 `15d136471bfc19e4cd21bb2e2dbf2218b7acc013`, 빌드 `030-p1-5d62a9825cb6d2f9`. 네 분기의 사전 상태 해시가 전부 일치하며, 기준 경로의 실제 보상을 재선택한 7,442개 분기는 원본 통계·난수 호출 수·보상 경로까지 일치했다.','',md_table(res['baseline']['overall']),'', '동률 수 분포: '+str(res['baseline']['overall']['ties'])+' (키는 최선 동률 보상 수).','']
 if new:
  report+=['## 승인 변경 후: 동일한 7,442개 순간','', '빌드 `030-p5-2ae18b163156e902`, 실제 소스 `d276fbc8bd3a484b9431ef39b5b072835e6e0f5d`. 대상 보상 직전까지는 이전 규칙으로 원래 경로를 재현하고, 그 순간부터 승인된 보상 규칙을 적용했다. 사전 상태 해시는 변경 전과 전부 일치한다. 이후 선택기는 동일한 state-reward-v1이며 선호 가중치를 조정하지 않았다. 새 선택 UI와 실지불 가격을 처리하는 기계적 AI 어댑터만 추가했다.','',md_table(res['approved']['overall']),'','변경 후 동률 수 분포: '+str(res['approved']['overall']['ties'])+'; 네 분기 모두 완료 '+str(res['approved']['overall']['all_four_clear'])+'; 네 분기 모두 실패/동일 R '+str(res['approved']['overall']['all_four_fail_same_round'])+'.','', '### 같은 순간·같은 보상의 전후 비교','', '| 보상 | 개선 / 악화 / 동일 | 완료율 차이 95% CI | 평균 R 차이 95% CI |','|---|---:|---:|---:|']
  for r in res['before_after']:report.append(f"| {r['reward']} | {r['improved']} / {r['worsened']} / {r['same']} | {fmt(r['completion_difference'])} | {fmt(r['round_difference'],False)} |")
  report+=['','랜덤카드 분기도 이후 다른 보상을 선택하면 새 규칙의 영향을 받는다. 랜덤카드 자체의 불변성은 별도의 랜덤카드 단독 고정 2,800회 전후 완전 일치 검사로 판정한다.','']
 for stage in res:
  if stage not in ['baseline','approved']:continue
  report+=['## '+('변경 전' if stage=='baseline' else '변경 후')+' 정책별 단독 최선 / 동률 분할 비율','', '| AI | 상점교체 | 재입고 | 랜덤카드 | 승급석 |','|---|---:|---:|---:|---:|']
  for p,s in res[stage]['policy'].items():report.append('| '+p+' | '+' | '.join(f"{r['unique_best']['value']*100:.1f}% / {r['fractional_best']['value']*100:.1f}%" for r in s['rewards'])+' |')
 for stage in ['baseline','approved']:
  if stage not in res:continue
  report+=['', '## '+('변경 전' if stage=='baseline' else '변경 후')+' 상황별 최선 비율(동률 분할, 95% CI)','', '아래 상황은 기준 경로의 보상 직전 조건이다. 서로 겹치는 층이며 각 보상의 선택 비율을 강제하는 규칙이 아니다. 위험 압박은 적 수 또는 적 HP가 그 라운드 한계의 70% 이상인 경우다.','', '| 상황 / 순간 수 | 상점교체 | 재입고 | 랜덤카드 | 승급석 |','|---|---:|---:|---:|---:|']
  for label,t in res[stage]['state_strata'].items():report.append('| '+label+' / '+str(t['moments'])+' | '+' | '.join(fmt(r['fractional_best']) for r in t['rewards'])+' |')
 report+=['','정책별·첫 보상/후속 보상별 상세 95% CI, run-equal 민감도 및 네 보상 간 6개 짝 비교는 `oracle-summary.json`에 수록했다. 모든 원본 분기는 JSONL로 제공한다.','']
 (OUT/'P5-REWARD-FORK-REPORT.md').write_text('\n'.join(report))
 print(md_table(res['baseline']['overall']))
 if new:print(md_table(res['approved']['overall']))
 if new:
  import gzip
  fixed={}
  for x in lines(CAND/'p5-final-fixed'):
   k=(x['reward_policy'],x['profile'],x['seed']);assert k not in fixed;fixed[k]=x
  assert len(fixed)==8400,len(fixed)
  prior={}
  with gzip.open(BASE.parent/'p5b-prior/runs.jsonl.gz','rt') as f:
   for l in f:
    x=json.loads(l)
    if x['variant']=='full' and x['experiment'] in ['random3','reroll','restock']:prior[x['reward_policy'],x['profile'],x['seed']]=x
  random_matches=0
  for k,x in fixed.items():
   assert not x['source_tree_dirty'] and x['object_object_count']==0 and x['git_sha']=='d276fbc8bd3a484b9431ef39b5b072835e6e0f5d'
   if k[0]=='random':
    y=prior[k]
    for a in ['stats','clear','round','first_shop','rewards','random_calls']:assert x[a]==y[a],(k,a)
    random_matches+=1
  stats=[]
  for p in PROFILES:
   for reward in ['random','reroll','restock']:
    a=[fixed[reward,p,s] for s in range(101,501)];b=[prior[reward,p,s] for s in range(101,501)]
    dc=np.array([int(x['clear'])-int(y['clear']) for x,y in zip(a,b)]);den=np.ones(400)
    rank=lambda x:(int(x['clear']),x['round'])
    k=sum(x['clear'] for x in a);oldk=sum(x['clear'] for x in b)
    stats.append({'profile':p,'reward':reward,'n':400,'clears':k,'old_clears':oldk,'completion':wilson(k,400),'delta':ci(dc,den),'improved':sum(rank(x)>rank(y) for x,y in zip(a,b)),'worsened':sum(rank(x)<rank(y) for x,y in zip(a,b)),'same':sum(rank(x)==rank(y) for x,y in zip(a,b)),'mean_round':sum(x['round'] for x in a)/400,'within_r30':sum(any(y['round']==30 and y['within_limits'] for y in x['battles']) for x in a)/400})
  agg=[]
  for reward in ['random','reroll','restock']:
   den=np.full(400,7);a=np.array([sum(fixed[reward,p,s]['clear'] for p in PROFILES) for s in range(101,501)])
   agg.append({'reward':reward,'clears':int(a.sum()),'n':2800,'completion':ci(a,den)})
  acceptance={p:{reward:fixed_rate>=.5*random_rate for reward,fixed_rate in [(r,sum(fixed[r,p,s]['clear'] for s in range(101,501))) for r in ['reroll','restock']]} for p in PROFILES for random_rate in [sum(fixed['random',p,s]['clear'] for s in range(101,501))]}
  result={'fixed':stats,'aggregate':agg,'random_exact_matches':random_matches,'fixed_threshold_per_policy':acceptance,'oracle_15pct_unique':{r['reward']:r['unique_best']['value']>=.15 for r in res['approved']['overall']['rewards']},'oracle_15pct_fractional':{r['reward']:r['fractional_best']['value']>=.15 for r in res['approved']['overall']['rewards']}}
  (OUT/'fixed-summary.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
  report+=['## 単独固定 보상: 동일 시드 400회 × 7정책 × 3보상','', '변경 후 8,400회. 아래 구간은 정책별 Wilson 95% CI. 괄호의 기존 횟수는 승인 변경 전 같은 400시드 고정 보상 실험이다.','', '| AI | 랜덤카드 완료율 | 상점교체 완료율(기존 완료 수) | 재입고 완료율(기존 완료 수) | 상점교체 / 재입고 각각 랜덤카드 50% 이상 |','|---|---:|---:|---:|---|']
  for p in PROFILES:
   rows={r['reward']:r for r in stats if r['profile']==p};report.append('| '+p+' | '+fmt(rows['random']['completion'])+' | '+fmt(rows['reroll']['completion'])+f" ({rows['reroll']['old_clears']}/400) | "+fmt(rows['restock']['completion'])+f" ({rows['restock']['old_clears']}/400) | "+str(acceptance[p])+' |')
  report+=['','7정책 통합(정책 동등 가중, 시드 군집 95% CI): '+ '; '.join(r['reward']+' '+fmt(r['completion']) for r in agg)+'.','', '### 고정 보상의 전후 짝 비교','', '| AI / 보상 | 개선 / 악화 / 동일 | 완료율 차이 95% CI |','|---|---:|---:|']
  for r in stats:
   if r['reward']!='random':report.append(f"| {r['profile']} / {r['reward']} | {r['improved']} / {r['worsened']} / {r['same']} | {fmt(r['delta'])} |")
  report+=['','랜덤카드 고정 2,800회는 기존 최종 통계, 완료 여부, 도달 라운드, 최초 상점, 보상 경로, 난수 호출 수와 전부 일치했다. 랜덤카드 보상은 변경하지 않았다.','', '## 수용 기준 판단','', '- 상점교체·재입고 단독 고정 ≥ 랜덤카드 50%: 위 정책별 표로 판정하며, 전 정책 통과를 요구하면 미달이다. 통합 값만으로 정책별 실패를 숨기지 않는다.', '- 각 보상이 최선 ≥15%: 단독 최선과 동률 분할 두 해석을 JSON에 명시했다. 동률 포함 비율을 단독 우수성으로 해석하지 않는다. 이 초안 기준은 동일 결과가 많은 후반 상태에서 정의에 민감하다.', '- 의도 외 회귀: 각 단계 P5 OFF 160쌍의 전체 상태 해시 일치. 이후 단계에서 이전 상점교체 고정 결과도 별도 완전 일치 확인. 이는 승인된 보상 변경 자체의 결과 불변을 뜻하지 않는다.', '- 오브젝트 로그: 모든 완료 데이터에서 `[object Object]` 0건.','', '## 승인 변경과 검증','', '1. 승급석은 **설명만 수정**했다. 1차 승급의 부족한 비전설 랜덤 재료 1종 카드 1장을 보충하며, 후보가 없으면 미소모 취소한다. 자원 할인·자동 승급 기능은 추가하지 않았다.', '2. 상점교체는 재고가 남은 카드 최대 2장을 잠근 뒤 기존 방식으로 최대 3장 교체한다. 이후 별도 루트 씨앗 8종 중 1장을 무료 선택한다. 상점 재고/유료 구매 횟수를 소모하거나 늘리지 않으며 중복 지급을 막았다.', '3. 재입고는 현재 상점의 품절 기본/랜덤 카드 **1종을 재고1로 복구**한다. 예전 기본+3/랜덤+1 일괄 추가를 대체한다. 다음 상점 성공 구매 1회 50% 할인(최대 자원2, 최종가격 최소1), 중첩 불가. 구매 실패에는 남고, 상점 종료·새 게임에는 소멸한다. 소실된 이전 상점 카드를 부활시키지는 않는다.', '4. 실제 구매 이벤트의 가격은 할인 후 지불액, 정가는 별도 필드로 남긴다. 새 보상 이벤트는 기존 기록 경로에만 추가했다. 기존 사용자 기록은 수정하지 않았다.', '', '## 실행 증거 및 제한','', '- 기존 분기 Chromium/Node 24쌍, 변경 후 분기 Chromium/Node 24쌍: 사전 상태 해시·난수 호출·최종 통계·보상 경로 일치.', '- 모바일 Chromium 터치: 360/390/430px에서 잠금 상한, 씨앗 선택, 다음 라운드, 품절 복구, 할인 가격/구매를 검증했다. 실제 Android/iOS 기기 및 Safari 검증은 하지 않았다.', '- 단일 HTML은 모든 이미지/음원을 내장했다. 외부 요청 차단 및 오프라인에서 위 두 보상 흐름을 세 화면 폭 모두 통과했다. 약66MB이므로 저사양 휴대폰 로딩 비용은 남는다.', '- 테스트는 로컬 Node/jsdom 및 Chromium에서 실행했다. GitHub Actions 실행이나 Supabase SQL 실행으로 표기하지 않는다. 배포·DB 마이그레이션·기존 기록 수정은 수행하지 않았다.', '- R30 판정, 행동력, 도박 카드, 광역 카드 수치, 게임 이름, 드로우 항상 ON 원칙은 유지했다.','', '## 코드와 롤백','', '별도 `feature/p5-approved-rewards` 브랜치. 단계 커밋: 설명 `1ead9bffb379e98ecd580fcf04b8d73d893434d3`, 상점교체 `afca511838c5d84792fadf16467be0ad168ea85a`, 재입고 `a9fffd5518cd6685dfe238865a65656ec6abc925`, 독립 HTML 파일명 `d276fbc8bd3a484b9431ef39b5b072835e6e0f5d`.', '', '원본 측정 기준은 `15d136471bfc19e4cd21bb2e2dbf2218b7acc013`에 보존했다. 미병합 Draft PR이므로 닫으면 운영 버전에 영향이 없다. 단계 롤백은 해당 커밋을 역순으로 revert하며, 원본 파일 덮어쓰기나 기존 기록 소급 변경을 하지 않는다.', '', '변경 함수: `p5InstallOptions`, `p5BeginReroll`, `p5ToggleLock`, `p5ConfirmLocks`, `p5PickSeed`, `p5Bot`, `p5BeginRestock`, `p5PickRestock`, `p5Price`, `p5Bought`, `p5ExpireCoupon`, `p5Reset`. 파일: `p5-rewards.js`, `p5_rewards_patch.py`, `build_v030.py`, `build_v030_standalone.py`, 측정용 `p5-node.cjs` 및 단계별 테스트. 전체 변경은 Draft PR에서 확인할 수 있다.','']
  (OUT/'P5-REWARD-FORK-REPORT.md').write_text('\n'.join(report).replace('単独固定','단독 고정'))
  print('fixed',agg,'acceptance',acceptance)
