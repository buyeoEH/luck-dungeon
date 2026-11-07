"""Create a report from completed artifacts only; reject partial/stale output."""
import csv,gzip,hashlib,json,re,zipfile,os
from pathlib import Path
R=Path(__file__).resolve().parent;O=R/'results-v030'
execution=json.loads((O/'execution.json').read_text());pairs=json.loads((O/'paired-regression.json').read_text());summary=json.loads((O/'summary.json').read_text());catalog=json.loads((O/'source-catalog.json').read_text());rows=list(csv.DictReader((O/'benchmark.csv').open()))
assert execution['pairs_passed']==160 and execution['benchmark_runs']==1400
assert len(pairs)==160 and all(p['same'] for p in pairs)
ui=(O/'ui-regression.log').read_text();assert 'OK' in ui and 'FAILED' not in ui
shops={};bad_text=0;actual_builds=set();actual_commits=set();records=0;unmeasured_text=0
with gzip.open(O/'benchmark-runs.jsonl.gz','rt',encoding='utf-8') as f:
 for line in f:
  r=json.loads(line);records+=1;unmeasured_text+=int('object_object_count' not in r)
  if os.getenv('GITHUB_ACTIONS')=='true':assert r['git_sha']==os.environ['GITHUB_SHA'] and not r['source_tree_dirty']
  if r['seed'] in shops:assert shops[r['seed']]==r['first_shop'],'Seeded first shop changed by policy'
  else:shops[r['seed']]=r['first_shop']
  actual_builds.add(r['build_id']);actual_commits.add(r['git_sha']);bad_text+=r.get('object_object_count',0)
assert records==1400 and bad_text==0 and unmeasured_text==0
table=['| 정책 | 시드 | AI 완료율 | R30 한계 이내 | R10~11 사망 | R19~21 사망 | R22~29 사망 |','|---|---|---:|---:|---:|---:|---:|']
for s in summary:table.append(f"| {s['profile']} | {s['cohort']} | {s['clear_rate']:.0%} | {s['within_limits_r30_rate']:.0%} | {s['deaths_r10_11']} | {s['deaths_r19_21']} | {s['deaths_r22_29']} |")
report=f'''# LUCK Dungeon v0.3 1차 작업 결과

범위: 계측·메타 보강과 이어가기 드로우 ON 고정. P1 전투 변환, 행동력, 이름 변경은 아직 적용하지 않았다. v0.2.20과 main을 보존했다.

실행 빌드: {', '.join(sorted(actual_builds))}  
실행 git_sha: {', '.join(sorted(actual_commits))}  
비교 기준: 110d54876a121909b9bd6074cf682b6d99944083 / 0220-a347dc8fc9ed146d. ON 조건만 비교했다.

## 검증

- 160쌍 단계별 상태·난수 호출 수: 160쌍 일치. UUID·실제 시각·추가 관측 메타만 제외했다.
- 7정책 × 200시드 = 1,400회 완료. 시드 101~200과 201~300을 따로 집계했다.
- 최초 랜덤 상점 200개 시드에 대해 정책 간 일치를 검사했다.
- 모바일 360/390/430px × 비주얼 ON/OFF × 전투 모션 스킵 ON/OFF 12조합 및 계측·독립 HTML 오프라인 테스트 6개 통과.
- 승급 레시피 실제 {len(catalog['promotions'])}종, 랜덤 카드 풀 {len(catalog['random_pool'])}종. 모든 승급의 덱 공격 합·기본 무기 공격 합 변화를 기록한다.
- 과거 기록 DB 및 Supabase 운영 데이터는 변경하지 않았다. 개발판은 별도 IndexedDB와 업로드 차단을 사용한다.

## 신규 공통 기준값

**AI 완료율은 사람 승률이 아니다.** 아래는 새 `v030-reference-policy-v1`, 보상 `reroll` 고정의 기준값이다. 과거 38%/58%를 생성한 정책 코드는 확보되지 않아 그 결과와 직접 전후 비교하지 않는다. P1 이후에는 이 코드·정책 해시·시드를 그대로 사용한다.

{chr(10).join(table)}

각 정책은 선호만 다르며 카드 구매·승급에 별도 금지 제약이 없다. 따라서 연계 선호 AI의 완료를 순수 연계 빌드의 완료로 해석하지 않는다. 광역 피해 비중은 원본 CSV에서 함께 확인한다.

각 행의 분모는 100회다. ‘R30 한계 이내’는 전체 100회 중 R30 전투 후 적 수·HP가 모두 한계 이내인 비율이다. R30에 도달하지 못한 판은 0으로 센다. 사망 분포는 절대 건수로 표시했다.

## 확인된 소스 차이와 다음 단계

- 이어가기 드로우는 ‘추가 드로우 보너스’가 아니라 더미 유지·셔플 시점 규칙이다. 이제 항상 ON이다.
- 현행 관통 합산에는 상한 4가 없다. 전체 합산에 새로 4 상한을 적용하면 기존 관통 너프가 된다.
- 관통 또는 광역이 생기면 기존 순수 추가타 조건이 꺼진다.
- R30 최초 한계 초과 공식 완료는 그대로이며, 한계 이내 지표를 항상 병기한다.
- P1 승인용 상세안은 V030-P1-DESIGN.md에 있다. 추천 추가 효과는 다음 라운드 콤보 보호+1, 다음 라운드 드로우+1이다. 승인 전 구현하지 않는다.
- P11은 P1 검증 후 사용자 확인을 받은 시점에 단계적으로 도입한다.

전체 원본은 results-v030/benchmark-runs.jsonl.gz, 회귀 근거는 paired-regression.json, 배치·정책 식별자는 execution.json과 각 run metadata에 있다. 로컬 사전검증 결과와 최종 GitHub Actions 결과를 구분하며, 배포에 사용하는 근거는 해당 커밋에서 실행한 Actions 산출물이다.
'''
(R/'V030-STAGE0-REPORT.md').write_text(report)
source=['# v0.3 소스 확인표','', '| 라운드 | 등장 수 | 적 수 한계 | HP 한계 |','|---:|---:|---:|---:|']
source += [f"| {x['round']} | {x['spawns']} | {x['count']} | {x['hp']} |" for x in catalog['limits']]
source += ['',f"## 실제 승급 {len(catalog['promotions'])}종",'', '| ID | 단계 | 재료 | 비용 | 결과 |','|---|---:|---|---|---|']
source += [f"| {p['id']} | {p['tier']} | {' + '.join(k+'×'+str(v) for k,v in p['from'].items())} | 자원 {p['cost'].get('res',0)} / 보석 {p['cost'].get('gem',0)} | {p['card']['name']} |" for p in catalog['promotions']]
(R/'V030-SOURCE-AUDIT.md').write_text('\n'.join(source)+'\n')
with zipfile.ZipFile(R/'v030-stage0-evidence.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in O.iterdir():
  if p.is_file():z.write(p,'results-v030/'+p.name)
 for name in ['V030-STAGE0-REPORT.md','V030-SOURCE-AUDIT.md','V030-P1-DESIGN.md','V030-ROADMAP.md','v030-build-report.json']:z.write(R/name,name)
print(json.dumps({'report':'V030-STAGE0-REPORT.md','pairs':160,'benchmark_runs':1400,'object_object_count':bad_text}))
