"""Complete-only follow-up analysis; no game modification or policy tuning."""
import csv,gzip,hashlib,json,math,random,statistics
from collections import Counter,defaultdict
from pathlib import Path
R=Path(__file__).resolve().parent;O=R/'p5b-report';O.mkdir(exist_ok=True);PROFILES=['aoe','economy','balanced','pierce','luck','link','attack'];REWARDS=['random','reroll','restock','stone'];names={'aoe':'광역','economy':'경제','balanced':'균형','pierce':'관통','luck':'운빨','link':'연계','attack':'공격'}
def ci(ds):
 rng=random.Random(20261030);n=len(ds);samples=sorted(sum(rng.choices(ds,k=n))/n for _ in range(2000));return samples[49],samples[1949]
def wilson(k,n):
 if not n:return None,None
 z=1.959963984540054;p=k/n;a=1+z*z/n;m=(p+z*z/(2*n))/a;d=z*math.sqrt(p*(1-p)/n+z*z/(4*n*n))/a;return m-d,m+d
def within(r):return any(b['round']==30 and b['within_limits'] for b in r['battles'])
def rate(v):return '—' if v is None else f'{100*v:.2f}%'
def interval(a,b):return f'{100*a:+.2f}~{100*b:+.2f}%p'
def csvout(name,rows):
 with (O/name).open('w',encoding='utf-8-sig',newline='') as f:w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
def main():
 rows=[]
 for w in range(4):
  rows.extend(json.loads(l) for l in (R/f'p5b-results/worker-{w}.jsonl').read_text().splitlines());assert json.loads((R/f'p5b-results/execution-{w}.json').read_text())['runs']==1700
 assert len(rows)==6800;idx={(r['experiment'],r['profile'],r['seed']):r for r in rows};assert len(idx)==6800
 expected={('mixed',p,s) for p in PROFILES for s in range(101,501)}|{('ban_conv_'+on+'_'+reward,'link',s) for on in ['on','off'] for reward in REWARDS+['mixed'] for s in range(101,501)};assert set(idx)==expected
 assert all(r['persistent_draw'] and not r['object_object_count'] and r['git_sha']=='15d136471bfc19e4cd21bb2e2dbf2218b7acc013' and not r['source_tree_dirty'] for r in rows)
 assert len({json.dumps(r['hashes'],sort_keys=True) for r in rows})==1
 control=json.loads((R/'p5-controls/node-pairs.json').read_text());smoke=json.loads((R/'p5b-smoke/browser-parity.json').read_text());assert len(control)==160 and all(x['same'] for x in control);assert len(smoke)==34 and all(x['same'] for x in smoke)
 prior={};prior_shop={};offmatches=0
 with gzip.open(R.parent/'p5b-prior/runs.jsonl.gz','rt') as f:
  for l in f:
   r=json.loads(l)
   if r['variant']=='full':
    if r['seed'] in prior_shop:assert prior_shop[r['seed']]==r['first_shop']
    prior_shop[r['seed']]=r['first_shop']
   if r['experiment'] in ['random3','reroll','restock','stone'] or r['experiment'] in ['ban_random','ban_reroll','ban_restock','ban_stone']:prior[r['experiment'],r['profile'],r['seed']]=r
 for r in rows:
  assert r['first_shop']==prior_shop[r['seed']]
  if r['reward_policy']=='mixed':
   assert len(r['reward_decisions'])==len(r['rewards'])
   for d,q in zip(r['reward_decisions'],r['rewards']):assert d['round']==q['round'] and d['chosen']==['reroll','restock','random','stone'][q['choice']]
  if r['mode']=='no_effects':
   assert r['stats']['aoeDamage']==0 and all(b['aoe']==0 and b['existing_pierce']==0 for b in r['audit']['battles'])
   assert r['stats']['pierceDamage']==sum(b['conversion_damage'] for b in r['audit']['battles'])
   if not r['conversion_on']:
    assert r['stats']['pierceDamage']==0
    if r['reward_policy']!='mixed':
     old=prior['ban_'+r['reward_policy'],'link',r['seed']]
     for k in ['clear','round','stats','first_shop','random_calls','rewards','battles','audit']:assert r[k]==old[k],(r['experiment'],r['seed'],k)
     offmatches+=1
 assert offmatches==1600
 def get(e,p,s):return idx.get((e,p,s)) or prior[e,p,s]
 paired=[]
 def pair(a,b,p,kind):
  aa=[get(a,p,s) for s in range(101,501)];bb=[get(b,p,s) for s in range(101,501)];ds=[int(y['clear'])-int(x['clear']) for x,y in zip(aa,bb)];lo,hi=ci(ds);wd=[int(within(y))-int(within(x)) for x,y in zip(aa,bb)];wl,wh=ci(wd)
  out={'kind':kind,'profile':p,'reference':a,'candidate':b,'n':400,'reference_completed':sum(r['clear'] for r in aa),'candidate_completed':sum(r['clear'] for r in bb),'improved':sum(d==1 for d in ds),'worsened':sum(d==-1 for d in ds),'difference':sum(ds)/400,'ci95_low':lo,'ci95_high':hi,'within_difference':sum(wd)/400,'within_ci95_low':wl,'within_ci95_high':wh};paired.append(out);return out
 bans=[]
 for reward in REWARDS+['mixed']:
  off='ban_conv_off_'+reward;on='ban_conv_on_'+reward;q=pair(off,on,'link','converted_pierce_under_native_ban')
  for e in [off,on]:
   g=[idx[e,'link',s] for s in range(101,501)];k=sum(r['clear'] for r in g);lo,hi=wilson(k,400);bs=[b for r in g for b in r['audit']['battles']]
   bans.append({'reward':reward,'converted_pierce':e==on,'n':400,'completed':k,'rate':k/400,'ci95_low':lo,'ci95_high':hi,'within_r30':sum(within(r) for r in g),'pierce_damage':sum(r['stats']['pierceDamage'] for r in g),'converted_kills':sum(b['conversion_kills'] for b in bs),'pure_displaced_battles':sum(b['pure_displaced'] for b in bs),'pure_hits':sum(r['stats']['v0219PureHits'] for r in g),'aoe_damage':sum(r['stats']['aoeDamage'] for r in g)})
 completion=[]
 for p in PROFILES:
  g=[idx['mixed',p,s] for s in range(101,501)];k=sum(r['clear'] for r in g);lo,hi=wilson(k,400)
  completion.append({'profile':p,'n':400,'completed':k,'rate':k/400,'ci95_low':lo,'ci95_high':hi,'within_r30':sum(within(r) for r in g),'no_boss_reward_runs':sum(not r['reward_decisions'] for r in g),'decisions':sum(len(r['reward_decisions']) for r in g),'aoe_damage_share':sum(r['stats']['aoeDamage'] for r in g)/sum(r['stats']['damageDealt'] for r in g)})
  for e in ['random3','reroll','restock','stone']:pair(e,'mixed',p,'mixed_vs_fixed')
 # Choice shares: bootstrap seed clusters, keeping all decisions in a run and
 # all seven AI profiles under the same seed together in the pooled view.
 selection=[];acceptance=[]
 for scope in ['all']+PROFILES:
  g=[r for r in rows if r['experiment']=='mixed' and (scope=='all' or r['profile']==scope)];byseed={s:Counter(d['chosen'] for r in g if r['seed']==s for d in r['reward_decisions']) for s in range(101,501)};total=sum(sum(c.values()) for c in byseed.values());counts=sum(byseed.values(),Counter());samples={reward:[] for reward in REWARDS};rng=random.Random(20261030)
  for _ in range(2000):
   ss=rng.choices(range(101,501),k=400);n=sum(sum(byseed[s].values()) for s in ss)
   for reward in REWARDS:samples[reward].append(sum(byseed[s][reward] for s in ss)/n if n else 0)
  for reward in REWARDS:
   v=sorted(samples[reward]);chosen=[r for r in g if any(d['chosen']==reward for d in r['reward_decisions'])];n=len(chosen);k=sum(r['clear'] for r in chosen)
   selection.append({'scope':scope,'reward':reward,'choices':counts[reward],'all_choices':total,'share':counts[reward]/total if total else None,'ci95_low':v[49],'ci95_high':v[1949],'runs_selecting':n,'completed_runs_selecting':k,'conditional_clear_rate':k/n if n else None})
  acceptance.append({'scope':scope,'each_reward_15_to_45':all(total and .15<=counts[r]/total<=.45 for r in REWARDS)})
 openings=[json.loads(x) for x in (R/'p5b-openings/openings.jsonl').read_text().splitlines()];assert len(openings)==800;oi={(x['pool_size'],x['seed']):x for x in openings};assert len(oi)==800
 old=oi[32,101]['pool'];assert len(old)==32 and len(oi[34,101]['pool'])==34
 for s in range(101,501):assert oi[34,s]['first_shop']==prior_shop[s] and len(set(oi[32,s]['first_shop']))==len(set(oi[34,s]['first_shop']))==8
 exposure=[]
 for card in oi[34,101]['pool']:
  a=[card in oi[32,s]['first_shop'] for s in range(101,501)];b=[card in oi[34,s]['first_shop'] for s in range(101,501)];ds=[int(y)-int(x) for x,y in zip(a,b)];lo,hi=ci(ds)
  exposure.append({'card_id':card,'existing_card':card in old,'n':400,'seen_32':sum(a),'seen_34':sum(b),'rate_32':sum(a)/400,'rate_34':sum(b)/400,'increased_seeds':sum(d==1 for d in ds),'decreased_seeds':sum(d==-1 for d in ds),'difference':sum(ds)/400,'ci95_low':lo,'ci95_high':hi,'theoretical_32':8/32 if card in old else 0,'theoretical_34':8/34})
 oldslots=[sum(c in old for c in oi[34,s]['first_shop']) for s in range(101,501)];ds=[(n-8)/32 for n in oldslots];pl,ph=ci(ds);dilution={'old_mean_exposure_32':.25,'old_mean_exposure_34':statistics.mean(oldslots)/32,'empirical_change':statistics.mean(ds),'paired_ci_low':pl,'paired_ci_high':ph,'theoretical_change':8/34-8/32,'theoretical_relative_change':(8/34)/(8/32)-1,'new_card_slots_mean':8-statistics.mean(oldslots)}
 for name,data in [('conversion',bans),('mixed_completion',completion),('reward_selection',selection),('paired',paired),('pool_exposure',exposure),('selection_acceptance',acceptance)]:csvout(name+'.csv',data)
 timing=[]
 for reward in REWARDS:
  rs=[d['round'] for r in rows if r['experiment']=='mixed' for d in r['reward_decisions'] if d['chosen']==reward]
  timing.append({'reward':reward,'decisions':len(rs),'mean_round':statistics.mean(rs),'r1_10':sum(n<=10 for n in rs),'r11_15':sum(11<=n<=15 for n in rs),'r16_20':sum(16<=n<=20 for n in rs),'r21_30':sum(n>=21 for n in rs)})
 csvout('reward_timing.csv',timing)
 summary={'new_full_runs':6800,'openings':800,'prior_reference_rows':21600,'regression_pairs':160,'active_cross_host_cases':34,'previous_off_rows_exact':offmatches,'conversion':bans,'mixed_completion':completion,'selection':selection,'paired':paired,'dilution':dilution,'selection_acceptance':acceptance};(O/'summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2))
 doc=['# LUCK Dungeon P5 추가 측정 보고서','','게임과 보상 기능은 변경하지 않았다. **신규 6,800판 + 첫 상점 800회**, 시드 101–500, 드로우 항상 ON. 고정 엔진 `15d1364` / 빌드 `030-p1-5d62a9825cb6d2f9`. 카드 사용·구매·승급 AI는 기존 7정책을 그대로 유지하고, 혼합 실험에서만 보상 선택기를 state-reward-v1로 대체했다. 선택기 점수·동률 순서를 사전에 고정했고 할당량 강제나 결과 후 조정은 하지 않았다. 전체 정책 정의와 모든 선택의 당시 점수·입력은 소스/원본에 있다.','','## 1. 기존 광역·관통 금지 + 변환 관통 ON/OFF','','ON은 변환 관통만 예외적으로 허용한다. OFF는 광역·기존 관통·변환 관통이 모두 0인 엄격 조건이다. 카드 획득/사용·태그 연계·게이지의 공격 보너스·다음 라운드 보너스는 유지된다. 최적의 제한 덱을 만드는 AI로 교체한 실험은 아니다.','','| 보상 | OFF 완료율 [95%] | ON 완료율 [95%] | ON 개선/악화 | ON−OFF 차이95% | R30 한계 이내 OFF→ON |','|---|---|---|---:|---|---|']
 for reward in REWARDS+['mixed']:
  a=next(x for x in bans if x['reward']==reward and not x['converted_pierce']);b=next(x for x in bans if x['reward']==reward and x['converted_pierce']);q=next(x for x in paired if x['reference']=='ban_conv_off_'+reward)
  doc.append(f"| {reward} | {rate(a['rate'])} [{rate(a['ci95_low'])}–{rate(a['ci95_high'])}] | {rate(b['rate'])} [{rate(b['ci95_low'])}–{rate(b['ci95_high'])}] | {q['improved']}/{q['worsened']} | {interval(q['ci95_low'],q['ci95_high'])} | {a['within_r30']}/400→{b['within_r30']}/400 |")
 doc += ['', '조건별 실제 변환 피해·처치·순수 연속타 차단 횟수는 conversion.csv에 있다. OFF 1,600판은 이전 원본의 완료·라운드·통계·난수·첫 상점·보상·전투·계측과 모두 일치했다. 이번 비교는 카드 풀과 공격 변환을 고정하고 변환 관통만 달리한 전체 플레이 효과이며, 경로가 갈린 뒤의 후속 난수/선택 변화도 포함한다.','','## 2. 신규 카드 풀 희석','','균등 Fisher–Yates, 8개 중복 없는 첫 상점에서 기존 카드 한 종의 이론 포함 확률은 **8/32=25.00% → 8/34=23.5294%**다. 절대 −1.4706%p, 상대 −5.8824%이며, 기존 카드 평균 슬롯은 8→7.5294개다. 신규 2종을 추가하고 슬롯 수를 유지한 결과다.','',f"400시드의 기존 32종 평균 노출은 {rate(dilution['old_mean_exposure_32'])}→{rate(dilution['old_mean_exposure_34'])}; 차이 {100*dilution['empirical_change']:+.4f}%p, 시드 짝 95% {interval(pl,ph)}다. 신규 2종은 첫 상점에서 평균 {dilution['new_card_slots_mean']:.4f}슬롯을 차지했다.",'', '| 카드 | 32종 노출/400 | 34종 노출/400 | 증가/감소 시드 | 차이95% |','|---|---:|---:|---:|---|']
 for id in ['chainblast','aoe','pike','lance','d5','linkseal','linkpeak']:
  x=next(x for x in exposure if x['card_id']==id);doc.append(f"| {id} | {x['seen_32']} | {x['seen_34']} | {x['increased_seeds']}/{x['decreased_seeds']} | {interval(x['ci95_low'],x['ci95_high'])} |")
 doc += ['', '32종 조건은 v0.2.20으로 되돌리지 않고 P1의 동일 카탈로그에서 신규 2종(linkseal/linkpeak)만 초기화 직전에 제외했다. 기존 관통창/승급은 그대로다. 34종은 이전 모든 첫 상점과 일치했다. 동일 시드여도 셔플 난수 소비가 2회 달라 카드별 짝 결과가 크게 바뀔 수 있고, 400표본에서 일부 기존 카드 노출이 증가할 수도 있다. 희석의 수학적 사실과 개별 카드의 표본 변동을 구분해야 한다. 이번 결과는 첫 상점 노출 검증이며 희석 때문에 완료율이 떨어졌다는 인과 검증은 아니다. 전체 34종의 결과는 pool_exposure.csv에 있다.','','## 3. 혼합 보상 선택','','| AI | 완료/400 | 완료율 [95%] | R30 한계 이내 | 보상 선택 없이 종료한 판 | 실제 피해 중 광역 비중 |','|---|---:|---|---:|---:|---:|']
 for x in completion:doc.append(f"| {names[x['profile']]} | {x['completed']} | {rate(x['rate'])} [{rate(x['ci95_low'])}–{rate(x['ci95_high'])}] | {x['within_r30']}/400 | {x['no_boss_reward_runs']} | {rate(x['aoe_damage_share'])} |")
 doc += ['', '선택 비율의 분모는 판 수가 아니라 실제 보스 보상 선택 횟수다. 전체 집계는 같은 시드의 7정책을 함께, 정책별은 한 판의 모든 선택을 함께 묶어 시드 400개를 2,000회 재표집한 95% 구간이다.','','| 범위 | 랜덤카드 | 상점교체 | 재입고 | 만능승급석 | 각 15–45% |','|---|---|---|---|---|---|']
 for scope in ['all']+PROFILES:
  cells=[]
  for reward in REWARDS:
   x=next(x for x in selection if x['scope']==scope and x['reward']==reward);cells.append(f"{rate(x['share'])} [{rate(x['ci95_low'])}–{rate(x['ci95_high'])}]")
  ok=next(x for x in acceptance if x['scope']==scope)['each_reward_15_to_45'];doc.append('| '+scope+' | '+' | '.join(cells)+f" | {'통과' if ok else '미달'} |")
 doc += ['', 'reward_selection.csv에는 보상을 한 번 이상 선택한 판의 조건부 완료율도 포함한다. 선택 당시 상황·생존 단계가 다르므로 이는 보상 효과의 인과적 승률이 아니다. 초기 사망 판은 선택 비율 분모에 들어가지 않지만 전체 완료율에는 포함된다. 고정 보상 4종과의 같은 시드 비교는 다음과 같다.','','| AI | 비교 고정 보상 | 고정→혼합 완료율 | 혼합 개선/악화 | 혼합−고정 차이95% |','|---|---|---|---:|---|']
 for q in paired:
  if q['kind']=='mixed_vs_fixed':doc.append(f"| {names[q['profile']]} | {q['reference']} | {rate(q['reference_completed']/400)}→{rate(q['candidate_completed']/400)} | {q['improved']}/{q['worsened']} | {interval(q['ci95_low'],q['ci95_high'])} |")
 aoe=next(x['rate'] for x in completion if x['profile']=='aoe');passing=[x['profile'] for x in completion if x['profile']!='aoe' and x['rate']>=aoe*.8]
 doc += ['', '## 수용 기준과 제한','',f"혼합 보상의 광역 AI 완료율 {rate(aoe)}, 80% 기준선 {rate(aoe*.8)}. 이 이상인 비광역 선호 정책은 {', '.join(passing) or '없음'} ({len(passing)}개)다. 비광역 선호 정책도 광역 카드를 사용하므로 독립적인 비광역 루트 2개 달성을 확정하는 결과는 아니다.",'', '신규 실행은 Node.js/jsdom, 능동 조건 34판은 Chromium과 완료·통계·난수·첫 상점·보상·전투·선택 점수까지 일치했다. 새 어댑터를 사용한 전체 상태 160쌍은 이전에 보존한 동일 엔진의 native Chromium 상태 해시와 일치했다. 이를 이번에 Chromium 원본을 새로 160회 실행한 것으로 표기하지 않는다. 이전 ZIP 체크섬과 21,600개 참조 행은 검증했다. 원본 게임/기존 AI 파일 diff는 0이다. 오브젝트 로그·필수 조합 누락·중복·금지된 원래 피해 채널 누출은 0이다.','', '95% 완료율 구간은 Wilson, 효과 차이는 같은 시드 쌍을 유지한 2,000회 부트스트랩이다. 다중 비교 보정 없는 탐색 실험이다. AI 완료율은 사람 승률이 아니다. 선택 비율 목표를 맞추기 위해 선택기를 사후 조정하지 않았다.','','## 승인 전 미적용 항목','','상점교체 잠금 2장+새 카드 1장 무료, 재입고 복구+다음 구매 할인, 만능승급석 설명 수정은 아직 구현하지 않았다. 랜덤카드·R30·행동력도 변경하지 않았다. 다음 적용은 결과 검토와 구체적인 보상 사양 승인 후 한 항목씩 진행한다.']
 document='\n'.join(doc)+'\n'
 document=document.replace('## 1. 기존 광역·관통 금지',(R/'P5B-REVIEW.md').read_text()+'## 1. 기존 광역·관통 금지',1)
 document=document.replace('## 수용 기준과 제한',(R/'P5B-CONDITIONAL-REVIEW.md').read_text()+'\n## 수용 기준과 제한',1)
 document+='\n\n'+(R/'P5B-CANDIDATES.md').read_text()
 (O/'LUCK-P5-followup-report.md').write_text(document)
 with gzip.open(O/'new-runs.jsonl.gz','wt') as f:
  for r in rows:f.write(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n')
 print(json.dumps({'full_runs':6800,'opening_runs':800,'regression_pairs':160,'browser_parity':34,'prior_off_matches':1600,'paired_comparisons':len(paired),'mixed_acceptance':acceptance,'passing_profiles':passing}))
if __name__=='__main__':main()
