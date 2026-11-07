"""Report observed P1 results; balance gates can fail without hiding test evidence."""
import gzip,json,os,zipfile
from pathlib import Path
R=Path(__file__).resolve().parent;O=R/'results-v030-p1'
execution=json.loads((O/'execution.json').read_text());assert execution['pairs']==160 and execution['runs']==2940 and execution['object_object_count']==0
pairs=json.loads((O/'paired-regression.json').read_text());assert len(pairs)==160 and all(x['same'] for x in pairs)
ui=(O/'ui-regression.log').read_text();assert 'Ran 15 tests' in ui and '\nOK\n' in ui and 'FAILED' not in ui
with gzip.open(O/'runs.jsonl.gz','rt') as f:rows=[json.loads(s) for s in f]
assert len(rows)==2940
if os.getenv('GITHUB_ACTIONS')=='true':
 for r in rows:
  if r['variant']!='baseline':assert r['git_sha']==os.environ['GITHUB_SHA'] and not r['source_tree_dirty']
summary=json.loads((O/'summary.json').read_text());lookup={(x['variant'],x['profile'],x['cohort']):x for x in summary}
table=['| AI 선호 | 시드 | 완료율 전→후 | R30 한계 이내 전→후 | R10–11 사망 전→후 | R19–21 사망 전→후 | R22–29 사망 전→후 |','|---|---|---:|---:|---:|---:|---:|']
for p in sorted({x['profile'] for x in rows}):
 for c in ['101-200','201-300']:
  a,b=[lookup[v,p,c] for v in ['baseline','full']]
  table.append(f"| {p} | {c} | {a['clear_rate']:.0%} → {b['clear_rate']:.0%} | {a['within_rate']:.0%} → {b['within_rate']:.0%} | {a['deaths_r10_11']} → {b['deaths_r10_11']} | {a['deaths_r19_21']} → {b['deaths_r19_21']} | {a['deaths_r22_29']} → {b['deaths_r22_29']} |")
gates={c:lookup['full','aoe',c]['clear_rate']<=lookup['baseline','aoe',c]['clear_rate'] for c in ['101-200','201-300']}
baseline_shops={(r['profile'],r['seed']):r['first_shop'] for r in rows if r['variant']=='baseline'}
assert all(r['first_shop']==baseline_shops[r['profile'],r['seed']] for r in rows if r['variant']=='core')
changed=sum(r['first_shop']!=baseline_shops[r['profile'],r['seed']] for r in rows if r['variant']=='full')
build=json.loads((R/'v030-build-report.json').read_text())['meta']
report=f'''# v0.3 P1 검토판 결과

빌드 `{build['build_id']}`, 실행 커밋 `{build['git_sha']}`. 드로우 항상 ON, AI `v030-reference-policy-v1`, 보상 `reroll` 고정. **AI 완료율은 사람 승률이 아니다.** 과거 38%/58%를 만든 정책 코드가 없어 그 결과와 직접 비교하지 않는다.

## 기능과 검증

- 연계 게이지의 디버프 후 확정, 20/40/60/80 관통·공격 변환, 신규 변환 관통만 상한4.
- 관통창 개량, 증폭 문장, 꿰뚫는 정점, 연계 관통창 승급. 상세 수치·반올림·중첩 규칙은 V030-P1-DESIGN.md.
- 50+ 다음 라운드 콤보 보호+1, 70+ 다음 드로우+1. 전투당 중복 지급 차단.
- P1 비활성 회귀 **160쌍 모두 일치**. 기능 활성 후 결과 변화는 의도한 변화이며 불변이라고 주장하지 않는다.
- 기준 1,400회 + P1 full 1,400회 + core/cards 각70회 = **2,940회**, 로그 `[object Object]` 0건.
- 기능·모바일·오프라인 테스트 **15개 통과**. 모바일 360/390/430px, 기존 비주얼/모션 12조합과 신규 카드 실제 사용 검사.
- 실제 단일 공격 전에 관통 수치를 고정해 디버프 소진 뒤 재계산되는 오류를 방지. 광역 전멸 시 게이지 실측0·추가 보상 없음.
- R30 공식 기록은 무한모드에서도 고정. 기존 점수 가중치·도박 확률·광역 수치·상점 재입고·R30 위험 판정을 바꾸지 않았다.
- main, v0.2.20, 운영 Supabase 기록 유지. 신규 DB `luck-v030-p1`, 클라우드 업로드 차단.

## 같은 정책·시드의 전후 비교

{chr(10).join(table)}

각 행 분모100. 사망은 절대 건수. 한계 이내는 전체100회 중 R30 전투 후 적 수·HP 모두 한계 이내인 비율이다. AI는 선호만 다르며 광역 사용을 금지하지 않는다.

## 단계별 원인 분리와 수용 기준

core는 기존 32종 카드 풀에서 기본 변환만, cards는 카드·승급 포함, full은 추가 보상까지 적용했다. core/cards는 집단별5시드×7정책의 소규모 확인이며 정밀 완료율 추정이 아니다. 원본 `summary.json`에 모든 단계가 있다.

core의 최초 상점은 baseline와 전부 일치했다. 신규 카드 추가로 full의 첫 상점은 1,400회 중 {changed}회 달랐다. 따라서 full의 전후 변화에는 카드 풀 변경 영향이 포함된다. 첫 상점 루트 씨앗 보장은 아직 P6 범위다.

광역 AI 완료율 비상승 게이트(이번 재현 가능한 기준 정책): {json.dumps(gates,ensure_ascii=False)}.
{'광역 AI가 상승한 집단이 있어 최종 밸런스 수용 기준은 미충족이다. P1 구현·회귀 검증은 완료했지만 v0.3 안정화 완료로 확정하지 않는다.' if not all(gates.values()) else '광역 비상승 조건은 이번 표본에서 통과했다. 나머지 v0.3 전체 수용 기준은 후속 단계까지 검증해야 한다.'}

기존 관통을 포함한 전체4 상한은 적용하지 않았다. 변환 관통이 생기면 기존 순수 연속타가 꺼지므로 순수 공격 선호 AI가 불리해질 위험이 있다. P3/P4에서 기본 무기 성장·승급 재료 충돌을 별도로 다룬다. P11 행동력, 보상 정책 개편, 신규 루트 AI는 미구현이다.

## 실행과 롤백

`LUCK-v0.3.0-dev.1.zip`을 풀고 HTML을 브라우저로 열면 플레이할 수 있다. 기존 음원·이미지를 포함한 독립 HTML이며 인터넷 없이 동작한다. 공개 테스트 URL은 이 워크플로에서 배포하지 않는다.

이전 단계는 커밋 d0b082b12a1101ca01ffa6c8d85d1be4f9e26434로 보존했다. P1 커밋을 revert하면 계측 단계로 돌아간다. 현재 서비스와 기존 기록에 대한 롤백 작업은 필요 없다.
'''
(R/'V030-P1-REPORT.md').write_text(report)
with zipfile.ZipFile(R/'v030-p1-evidence.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in O.iterdir():
  if p.is_file():z.write(p,'results-v030-p1/'+p.name)
 for name in ['V030-P1-REPORT.md','V030-P1-DESIGN.md','v030-build-report.json','v030-standalone-report.json']:z.write(R/name,name)
print(json.dumps({'pairs':160,'runs':2940,'tests':15,'aoe_nonincrease':gates}))
