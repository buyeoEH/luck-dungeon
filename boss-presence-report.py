from pathlib import Path
import json,csv,io,zipfile,statistics
R=Path(__file__).resolve().parent
old=json.loads((R/'boss-validation-results.json').read_text());new=json.loads((R/'boss-presence-validation.json').read_text())
summary={'version':'0.3.3-boss.2','carry_damage_multiplier':3,'free_overflow_after_normal_kill':True,'target_clear_rates_not_certified':True,'before_table':old['base'],'after_table':new['base'],'provenance':new['provenance'],'candidate_runs':450,'paired_runs_per_version':600,'policies':{}}
labels={'novice':'기본 구매','skilled':'승급·보석 활용','expert':'순서 연계·광역 우선'}
for sk,label in labels.items():
 a={r['seed']:r for r in old['rows'] if r['skill']==sk};b={r['seed']:r for r in new['rows'] if r['skill']==sk};assert a.keys()==b.keys()
 summary['policies'][sk]={'label':label,'n':len(a),'before_clear':sum(r['clear'] for r in a.values()),'after_clear':sum(r['clear'] for r in b.values()),'before_median_round':statistics.median(r['round'] for r in a.values()),'after_median_round':statistics.median(r['round'] for r in b.values()),'gained':sum(not a[s]['clear'] and b[s]['clear'] for s in a),'lost':sum(a[s]['clear'] and not b[s]['clear'] for s in a)}
md=['# LUCK Dungeon 보스전 체감·보호막 시각화·밸런스 2차 보고서','','버전: 0.3.3-boss.2. 이번 조정은 보스의 존재감을 높이면서 누적 일반 적 정리에 쓰이던 부담을 분리하는 검증안입니다. 사람의 숙련도별 70%·95% 클리어율을 확정한 결과가 아닙니다.','','## 변경 내용','','- 첫 보스전 진입에 BOSS ENCOUNTER 경고·보스 확대 표시·3회 제한과 전장 규칙 안내.','- 보스전 내 손패·상점·전투 준비 전체에서 전투 BGM 유지. 사용자 BGM ON/OFF 설정 유지.','- 상단 ROUND 옆 작은 파란 보호막/빨간 진체력 게이지. 기존 연계 HUD처럼 큰 고정 패널을 추가하지 않음.','- 전투 재생 화면의 보스 카드에 두 게이지를 별도 표시. 파란 보호막 피해 → SHIELD BREAK → 빨간 진체력 피해 → 보스 격파를 실제 피해 기록으로 재생.','- 이전 적 HP는 그대로 인계. 보스전에 한해 일반 적 대상 피해 ×3, 일반 적 처치 후 남은 원시 일반 공격을 다음 적에게 전달하는 전장 돌파 보정 추가.','- 전장 돌파는 준비 관통 수치나 관통 1당 진체력 +10%를 추가하지 않으며, 별도 sweep 이벤트로 기록. 보스 대상 기존 100%/70% 피해 규칙과 관통 보너스 유지.','- 보스전 3회, 매 전투 행동력 2/기본 손패 5, 상점·승급, 전원 처치 조건, 동일 보상, 서버 자동 저장 유지.','','## 보스 수치 비교','','| R | 기존 보호막/진체력 | 변경 보호막/진체력 |','|---:|---:|---:|']
for a,b in zip(old['base'],new['base']):md.append(f"| {a['round']} | {a['shield']} / {a['core']} | {b['shield']} / {b['core']} |")
md+=['','## 동일 시드 비교','','정책별 시드 101~300, 각 200쌍. 비교 정책과 보상(random)은 동일합니다. 새 수치 후보 0.8/1.0/1.2배를 각 정책 50런씩 총 450런 탐색한 뒤, 1.0배를 600런 비교했습니다.','','| 정책 | 기존 완료 | 변경 완료 | 완료율 기존→변경 | 종료 R 중앙값 기존→변경 |','|---|---:|---:|---:|---:|']
for p in summary['policies'].values():md.append(f"| {p['label']} | {p['before_clear']}/{p['n']} | {p['after_clear']}/{p['n']} | {p['before_clear']/p['n']*100:.1f}% → {p['after_clear']/p['n']*100:.1f}% | {p['before_median_round']} → {p['after_median_round']} |")
md+=['','보스의 절대 HP는 높아졌으나, 숙련 전략 정책의 완료율은 대체로 기존 수준입니다. 작은 완료율 차이를 유의미한 개선으로 단정하지 않습니다. 기본 구매 정책의 종료 중앙값은 R15로 이동했으나 이것도 실제 초보자 표본을 뜻하지 않습니다. 기존 목표인 사람 숙련자 70%/고숙련자 95%와 운이 나쁜 5%의 자연 패배 비율은 여전히 검증되지 않았으며 강제 패배 처리는 없습니다.','','## 검증','','- 기존 보스 기능 검사와 60개 전투 예측/실제 남은 HP 일치 검사.','- 일반 라운드에서는 피해 ×3/무료 전달이 적용되지 않음을 검사. 전장 돌파가 관통 적중 수를 부풀리지 않도록 검사.','- 모바일 진입 연출, 상단 보호막 가시성, 실전 재생의 보호막 감소/파괴/진체력 감소/격파는 test-boss-browser.cjs에서 확인.','- 3회 연전·행동력/손패 재지급·3회 실패와 턴별 서버 로그 저장 검사 유지.','- 실기기 iOS/Android의 장시간 플레이, 실제 사람의 숙련도별 승률은 미검사.','','## 분석 자료','','BOSS-BALANCE-DATA.zip에 구버전/변경판의 판별 CSV와 보스 전투별 CSV, 요약과 수치표를 제공합니다. 사람이 플레이한 로그는 포함하지 않습니다.']
(R/'BOSS-BALANCE-REPORT.md').write_text('\n'.join(md)+'\n');(R/'boss-balance-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2))
with zipfile.ZipFile(R/'BOSS-BALANCE-DATA.zip','w',zipfile.ZIP_DEFLATED) as z:
 for tag,data in [('before',old),('after',new)]:
  a=io.StringIO();fields=['skill','seed','profile','clear','round','boss_failure','steps'];w=csv.DictWriter(a,fieldnames=fields);w.writeheader();w.writerows({k:r[k] for k in fields} for r in data['rows']);z.writestr(tag+'-runs.csv',a.getvalue())
  a=io.StringIO();fields=['skill','seed','round','turn','remaining_count','remaining_hp','boss_shield','boss_core','attack','aoe','pierce','damage','sweep_hits','sweep_damage','clear'];w=csv.DictWriter(a,fieldnames=fields);w.writeheader()
  for r in data['rows']:
   for t in r['boss_timeline']:w.writerow({**{k:t.get(k) for k in fields},'skill':r['skill'],'seed':r['seed']})
  z.writestr(tag+'-boss-turns.csv',a.getvalue())
 z.writestr('summary.json',json.dumps(summary,ensure_ascii=False,indent=2))
print(json.dumps(summary['policies'],ensure_ascii=False))
