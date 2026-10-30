"""Complete-only P5 paired summaries. Does not modify game or input data."""
import csv,gzip,hashlib,itertools,json,math,random,statistics
from collections import defaultdict
from pathlib import Path
R=Path(__file__).resolve().parent;O=R/'p5-report';O.mkdir(exist_ok=True)
PROFILES=['aoe','economy','balanced','pierce','luck','link','attack'];REWARDS=['random3','reroll','restock','stone'];names={'aoe':'광역','economy':'경제','balanced':'균형','pierce':'관통','luck':'운빨','link':'연계','attack':'공격'}
def wilson(k,n):
 z=1.959963984540054;p=k/n;a=1+z*z/n;m=(p+z*z/(2*n))/a;d=z*math.sqrt(p*(1-p)/n+z*z/(4*n*n))/a;return m-d,m+d
def bootstrap(ds):
 rng=random.Random(20261030);v=sorted(sum(rng.choices(ds,k=len(ds)))/len(ds) for _ in range(2000));return v[49],v[1949]
def within(r):return any(b['round']==30 and b['within_limits'] for b in r['battles'])
def csvwrite(name,rows):
 with (O/name).open('w',encoding='utf-8-sig',newline='') as f:
  w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
def percent(x):return f'{x*100:.2f}%'
def main():
 rows=[]
 for w in range(4):
  p=R/f'p5-results/worker-{w}.jsonl';rows += [json.loads(x) for x in p.read_text().splitlines()]
  assert json.loads((p.parent/f'execution-{w}.json').read_text())['runs']==5400
 assert len(rows)==21600
 index={(r['experiment'],r['profile'],r['seed']):r for r in rows};assert len(index)==21600
 from p5_measure import configs
 assert set(index)=={(c['experiment'],c['profile'],c['seed']) for c in configs(range(101,501))}
 assert all(r['persistent_draw'] and not r['object_object_count'] for r in rows)
 # Independent reconciliation against previous 400-seed expanded P1 audit.
 expected={'reroll':{'aoe':91,'attack':2,'balanced':24,'economy':1,'link':92,'luck':55,'pierce':3},'random3':{'aoe':196,'attack':107,'balanced':144,'economy':20,'link':269,'luck':175,'pierce':153}}
 for e,ps in expected.items():
  for p,n in ps.items():assert sum(index[e,p,s]['clear'] for s in range(101,501))==n,(e,p,'previous result drift')

 assert len({r['policy_sha256'] for r in rows})==1 and len({r['observer_sha256'] for r in rows})==1
 for r in rows:
  assert len(r['battles'])==len(r['audit']['battles'])
  if r['variant']=='full':assert r['git_sha']=='15d136471bfc19e4cd21bb2e2dbf2218b7acc013' and not r['source_tree_dirty']
  if r['mode']=='no_effects':assert r['stats']['aoeDamage']==r['stats']['pierceDamage']==0 and all(b['aoe']==b['pierce']==0 for b in r['audit']['battles'])
 # Identical opening shop across reward, card-count and conversion interventions.
 for p in PROFILES:
  for seed in range(101,501):
   opening=index['random3',p,seed]['first_shop']
   assert all(index[e,p,seed]['first_shop']==opening for e in REWARDS+['random1','random2'])
 pairs_host=json.loads((R/'p5-controls/node-pairs.json').read_text());assert len(pairs_host)==160 and all(x['same'] for x in pairs_host)
 groups=defaultdict(list)
 for r in rows:groups[r['experiment'],r['profile']].append(r)
 completion=[];conv=[];cohorts=[]
 for (exp,p),g in sorted(groups.items()):
  n=len(g);assert n==400;k=sum(x['clear'] for x in g);lo,hi=wilson(k,n);w=sum(within(x) for x in g);wl,wh=wilson(w,n)
  for low in [101,201,301,401]:
   part=[r for r in g if low<=r['seed']<low+100];cohorts.append({'experiment':exp,'profile':p,'seeds':f'{low}-{low+99}','n':len(part),'completed':sum(r['clear'] for r in part),'within_r30':sum(within(r) for r in part)})
  completion.append({'experiment':exp,'profile':p,'n':n,'completed':k,'rate':k/n,'ci95_low':lo,'ci95_high':hi,'within_r30':w,'within_rate':w/n,'within_ci_low':wl,'within_ci_high':wh,'mean_round':statistics.mean(r['round'] for r in g),'death_r10_11':sum(not r['clear'] and 10<=r['round']<=11 for r in g),'death_r19_21':sum(not r['clear'] and 19<=r['round']<=21 for r in g),'death_r22_29':sum(not r['clear'] and 22<=r['round']<=29 for r in g)})
  bs=[b for r in g for b in r['audit']['battles']]
  conv.append({'experiment':exp,'profile':p,'runs':n,'battles':len(bs),'pure_displaced_battles':sum(b['pure_displaced'] for b in bs),'runs_pure_displaced':sum(any(b['pure_displaced'] for b in r['audit']['battles']) for r in g),'pure_eligible_battles':sum(b['pure_eligible'] for b in bs),'actual_pure_hits':sum(r['stats']['v0219PureHits'] for r in g),'actual_pure_damage':sum(r['stats']['v0219PureDamage'] for r in g),'conversion_kills':sum(b['conversion_kills'] for b in bs),'conversion_damage':sum(b['conversion_damage'] for b in bs),'aoe_damage':sum(r['stats']['aoeDamage'] for r in g),'pierce_damage':sum(r['stats']['pierceDamage'] for r in g),'effect_card_acquisitions':sum(len(r['audit']['acquiredEffects']) for r in g)})
 paired=[]
 def pair(a,b,p,label):
  aa=[index[a,p,s] for s in range(101,501)];bb=[index[b,p,s] for s in range(101,501)];ds=[int(y['clear'])-int(x['clear']) for x,y in zip(aa,bb)];lo,hi=bootstrap(ds)
  wd=[int(within(y))-int(within(x)) for x,y in zip(aa,bb)];wl,wh=bootstrap(wd)
  paired.append({'comparison':label,'reference':a,'candidate':b,'profile':p,'n':400,'reference_completed':sum(x['clear'] for x in aa),'candidate_completed':sum(x['clear'] for x in bb),'improved':sum(d==1 for d in ds),'worsened':sum(d==-1 for d in ds),'both_completed':sum(x['clear'] and y['clear'] for x,y in zip(aa,bb)),'both_failed':sum(not x['clear'] and not y['clear'] for x,y in zip(aa,bb)),'difference':sum(ds)/400,'ci95_low':lo,'ci95_high':hi,'round_improved':sum(y['round']>x['round'] for x,y in zip(aa,bb)),'round_worsened':sum(y['round']<x['round'] for x,y in zip(aa,bb)),'within_difference':sum(wd)/400,'within_ci_low':wl,'within_ci_high':wh})
 for p in PROFILES:
  for a,b in itertools.combinations(REWARDS,2):pair(a,b,p,'fixed_reward')
  for e in ['random1','random2']:pair('random3',e,p,'random_card_count')
 for e in REWARDS:pair(e,'ban_'+('random' if e=='random3' else e),'link','effect_ban')
 for p in ['attack','balanced']:
  for e in ['reroll','random']:
   normal='random3' if e=='random' else e
   pair('baseline_'+e,normal,p,'v220_to_p1');pair(normal,'noconv_'+e,p,'converted_pierce_ablation')
 relation=[];association=[]
 for p in ['attack','balanced']:
  for reward in ['reroll','random']:
   for seed in range(101,501):
    base=index['baseline_'+reward,p,seed];normal=index['random3' if reward=='random' else reward,p,seed];off=index['noconv_'+reward,p,seed];count=sum(b['pure_displaced'] for b in normal['audit']['battles'])
    relation.append({'reward':reward,'profile':p,'seed':seed,'baseline_completed':base['clear'],'p1_completed':normal['clear'],'without_conversion_completed':off['clear'],'p1_pure_displaced_battles':count,'baseline_round':base['round'],'p1_round':normal['round'],'without_conversion_round':off['round'],'baseline_to_p1_declined':base['clear'] and not normal['clear'],'restored_without_conversion':not normal['clear'] and off['clear'],'lost_without_conversion':normal['clear'] and not off['clear']})
   for exposed in [True,False]:
    g=[r for r in relation if r['profile']==p and r['reward']==reward and bool(r['p1_pure_displaced_battles'])==exposed];n=len(g)
    association.append({'reward':reward,'profile':p,'has_displacement':exposed,'runs':n,'baseline_to_p1_declined':sum(r['baseline_to_p1_declined'] for r in g),'decline_fraction':sum(r['baseline_to_p1_declined'] for r in g)/n if n else None,'restored_without_conversion':sum(r['restored_without_conversion'] for r in g),'lost_without_conversion':sum(r['lost_without_conversion'] for r in g)})
 dispersion=[];routes=[]
 lookup={(x['experiment'],x['profile']):x for x in completion}
 for p in PROFILES:
  rates=[lookup[e,p]['rate'] for e in REWARDS];mean=statistics.mean(rates);d=max(abs(x-mean) for x in rates)
  dispersion.append({'profile':p,'mean':mean,'max_minus_min':max(rates)-min(rates),'maximum_deviation_from_mean':d,'within_plus_minus_10pp':d<=.10+1e-12,'range_within_10pp':max(rates)-min(rates)<=.10+1e-12})
 for e in REWARDS:
  aoe=lookup[e,'aoe']['rate'];passing=[p for p in PROFILES if p!='aoe' and lookup[e,p]['rate']>=aoe*.8]
  routes.append({'reward':e,'aoe_rate':aoe,'threshold_80percent':aoe*.8,'passing_policies':','.join(passing),'at_least_two':len(passing)>=2})
 for name,data in [('completion',completion),('cohorts',cohorts),('paired',paired),('conversion',conv),('conversion_per_seed',relation),('association',association),('reward_dispersion',dispersion),('route_acceptance',routes)]:csvwrite(name+'.csv',data)
 summary={'runs':21600,'completion':completion,'paired':paired,'conversion':conv,'association':association,'dispersion':dispersion,'routes':routes,'control_pairs':160};(O/'summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2))
 text=['# LUCK Dungeon v0.3 P5 보상 균형: 변경 전 측정 보고서','','**게임·AI 정책 변경 없이 측정했다. 조정안은 아직 적용하지 않았다.**','', '시드 101–500, 모든 조건당 400판, 총 21,600판. 드로우 항상 ON. 기준 커밋 `15d1364`, 게임 빌드 `030-p1-5d62a9825cb6d2f9`, 고정 정책 `v030-reference-policy-v1`이다. 실행은 Node.js/jsdom이며 Chromium 예비 108판의 완료·라운드·통계·난수·첫 상점·보상·전투·계측이 일치하고, 전체 상태 추적 160쌍도 Chromium 원본→테스트 어댑터→Node 간 일치했다. GitHub Actions 실행으로 표기하지 않는다.','', '원본 tracked 게임·AI 파일 변경 0, 오브젝트 문자열 로그 0건. DB·웹 배포·R30·행동력·도박 카드·광역 카드 수치를 변경하지 않았다. AI 완료율은 사람 승률이 아니다.','', '## 보상 4종 고정 완료율','', '각 셀은 완료/400, 완료율, Wilson 95% 구간이다. R30 한계 이내 완료 및 사망 구간은 completion.csv에 따로 기재했다.','', '| AI | 랜덤카드 3장 | 상점 교체 | 재입고 | 만능승급석 |','|---|---|---|---|---|']
 for p in PROFILES:
  cells=[]
  for e in REWARDS:
   x=lookup[e,p];cells.append(f"{x['completed']}/400 · {percent(x['rate'])} [{percent(x['ci95_low'])}–{percent(x['ci95_high'])}]")
  text.append('| '+names[p]+' | '+' | '.join(cells)+' |')
 text += ['', '같은 정책·시드에서 보상끼리 짝 비교했다. 6개 보상 쌍 × 7정책의 개선/악화 수와 차이 95% 구간은 paired.csv에 있다. 95% 차이 구간은 시드 쌍을 유지한 2,000회 부트스트랩이다. 탐색적 비교이며 다중 검정 보정은 하지 않았다.','', '## 랜덤카드 1·2·3장 민감도','', '| AI | 1장 | 2장 | 3장 | 3→1 개선/악화 · 차이95% | 3→2 개선/악화 · 차이95% |','|---|---:|---:|---:|---|---|']
 for p in PROFILES:
  ps=[next(x for x in paired if x['profile']==p and x['candidate']==e and x['comparison']=='random_card_count') for e in ['random1','random2']];cells=[percent(lookup[e,p]['rate']) for e in ['random1','random2','random3']];cells += [f"{x['improved']}/{x['worsened']} · {100*x['ci95_low']:+.2f}~{100*x['ci95_high']:+.2f}%p" for x in ps];text.append('| '+names[p]+' | '+' | '.join(cells)+' |')
 text += ['', '장수 실험은 테스트 호스트에서만 원래 보상 처리의 slice 길이를 바꿨다. 2% 기본 카드 회수 규칙은 그대로다. 장수가 줄면 보상 이후 난수 소비·덱·전투 경로가 달라진다. 실험 로그의 기존 보상명에 “3장”이 남을 수 있으므로 actual 설정인 random_cards를 기준으로 판별한다. 선택제는 측정하지 않았으며 장수 결과로 선택제 효과를 단정하지 않는다.','', '## 변환 관통과 순수 연속타','', '| 보상 | AI | 조건 차단 전투 / 해당 판 | P1 완료율 | 변환 관통만 OFF 완료율 | OFF 개선/악화 · 차이95% |','|---|---|---:|---:|---:|---|']
 for p in ['attack','balanced']:
  for e in ['reroll','random']:
   normal='random3' if e=='random' else e;c=next(x for x in conv if x['experiment']==normal and x['profile']==p);q=next(x for x in paired if x['comparison']=='converted_pierce_ablation' and x['profile']==p and x['candidate']=='noconv_'+e)
   text.append(f"| {e} | {names[p]} | {c['pure_displaced_battles']} / {c['runs_pure_displaced']} | {percent(lookup[normal,p]['rate'])} | {percent(lookup['noconv_'+e,p]['rate'])} | {q['improved']}/{q['worsened']} · {100*q['ci95_low']:+.2f}~{100*q['ci95_high']:+.2f}%p |")
 text += ['', '차단 전투=단일 공격이 계산되고, 광역0·기존관통0·최종 공격≥55·덱 공격합≥35인데 변환 관통>0인 전투다. 조건 차단을 기회 손실 지표로 센 것이며 잃은 실제 피해량과 같지 않다. 첫 타격 후 추가타를 칠 적이 없을 수도 있다. conversion.csv에는 모든 정책·조건의 횟수, 실제 연속타 횟수·피해, 변환 관통 피해·처치를 포함했다.','', 'baseline→P1 하락 여부와 차단 노출별 관계는 association.csv, 시드별 3자 비교는 conversion_per_seed.csv에 있다. 차단을 경험한 판은 더 오래 살아 기회가 늘어나는 생존 편향이 있어 상관만으로 원인을 단정하지 않는다. 변환 관통만 OFF 실험은 P1의 카드 풀·게이지·공격 보너스·다음 라운드 보너스·기존 관통을 유지하므로 이 기전의 전체 플레이 효과를 더 직접 비교한다. 기존 v0.2.20과의 비교는 카드 풀·초기 상점도 달라 순수한 기전 비교가 아니다.','', '## 광역·관통 효과 금지: 연계 정책','', '| 보상 | 원래 완료율 | 효과 금지 완료율 | R30 한계 이내 | 금지 개선/악화 · 차이95% |','|---|---:|---:|---:|---|']
 for e in REWARDS:
  ban='ban_'+('random' if e=='random3' else e);x=lookup[ban,'link'];q=next(x for x in paired if x['candidate']==ban and x['comparison']=='effect_ban');text.append(f"| {e} | {percent(lookup[e,'link']['rate'])} | {percent(x['rate'])} | {percent(x['within_rate'])} | {q['improved']}/{q['worsened']} · {100*q['ci95_low']:+.2f}~{100*q['ci95_high']:+.2f}%p |")
 text += ['', '카드 획득·사용은 허용하고 전투의 실제 광역·기존 관통·변환 관통 효과만 0으로 제한했다. 보상 획득을 포함한 관련 카드 이력도 원본 audit.acquiredEffects에 있다. 모든 금지 판의 실제 광역·관통 피해는 0이다. 고정 AI가 쓸모 없어진 카드도 구매·승급할 수 있어 최적의 순수 연계 덱 가능성을 증명하거나 반증하는 실험은 아니다.','', '## 수용 기준 현황','', '| 보상 | 광역 완료율 | 80% 기준선 | 충족한 비광역 선호 정책 | 2개 이상 |','|---|---:|---:|---|---|']
 for x in routes:text.append(f"| {x['reward']} | {percent(x['aoe_rate'])} | {percent(x['threshold_80percent'])} | {x['passing_policies']} | {'예' if x['at_least_two'] else '아니오'} |")
 text += ['', '이는 선호 AI 정책 기준이다. 비광역 정책도 제약없는 실험에서는 광역을 사용할 수 있어, 광역 피해 없이 독립적인 루트 2개가 달성됐다는 뜻은 아니다.','', '| AI | 4보상 최대–최소 | 4보상 평균으로부터 최대 편차 | ±10%p 이내 |','|---|---:|---:|---|']
 for x in dispersion:text.append(f"| {names[x['profile']]} | {100*x['max_minus_min']:.2f}%p | {100*x['maximum_deviation_from_mean']:.2f}%p | {'예' if x['within_plus_minus_10pp'] else '아니오'} |")
 text += ['', '보상 편차의 ±10%p는 각 AI 내 4보상 평균을 기준으로 해석했다. 더 엄격한 최대–최소≤10%p 결과도 reward_dispersion.csv에 병기했다. 사전 기준을 바꿔 통과시키지 않는다.','', '## 다음 조정안: 승인 전 미적용','', '이번 결과에서 완료율이 낮은 보상·정책부터 한 항목씩 실험해야 한다. 랜덤카드 장수만 줄여 평균을 맞추는 방식은 대안 루트 하락 위험과 광역 선너프 금지 원칙을 함께 검토해야 한다. 선택제, 유지 카드 2장 잠금, 품절 랜덤 카드 1장 복구, 만능승급석 승급비 1회 면제는 별도 후보이며 이번 결과가 그 효과를 직접 측정한 것은 아니다. 다음 승인안의 우선순위와 이유는 아래 검토 메모에 기재한다.','', '원본 기록·실행 메타·회귀 검증·집계 CSV를 결과 ZIP에 제공한다. 게임/AI tracked diff는 0이며 main·기존 사용자 데이터·배포는 그대로다.']
 document='\n'.join(text)+'\n'
 document=document.replace('## 보상 4종 고정 완료율',(R/'P5-REVIEW-SUMMARY.md').read_text()+'## 보상 4종 고정 완료율',1)
 document=document.replace('이번 결과에서 완료율이 낮은 보상·정책부터 한 항목씩 실험해야 한다. 랜덤카드 장수만 줄여 평균을 맞추는 방식은 대안 루트 하락 위험과 광역 선너프 금지 원칙을 함께 검토해야 한다. 선택제, 유지 카드 2장 잠금, 품절 랜덤 카드 1장 복구, 만능승급석 승급비 1회 면제는 별도 후보이며 이번 결과가 그 효과를 직접 측정한 것은 아니다. 다음 승인안의 우선순위와 이유는 아래 검토 메모에 기재한다.',(R/'P5-REVIEW-PROPOSAL.md').read_text().strip(),1)
 document=document.replace('21,600판. 드로우','21,600판. 실행 중 메모리 한계로 중단된 프로세스는 작은 묶음으로 재개했으며, 최종 21,600개 고유 조합만 집계했다. 드로우')
 (O/'LUCK-v030-P5-measurement.md').write_text(document)
 with gzip.open(O/'runs.jsonl.gz','wt') as f:
  for r in rows:f.write(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n')
 print(json.dumps({'runs':len(rows),'groups':len(completion),'paired_comparisons':len(paired),'controls':160}))
if __name__=='__main__':main()
