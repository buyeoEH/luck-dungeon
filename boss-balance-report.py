from pathlib import Path
import json,csv,io,zipfile,statistics,hashlib
R=Path(__file__).resolve().parent
src=json.loads((R/'boss-validation-results.json').read_text());rows=src['rows'];table=src['base'];goals=json.loads((R/'BOSS-BALANCE-GOALS.json').read_text())
summary={'status':'targets_not_met_by_policies','goals':goals,'provenance':src.get('provenance'),'table':table,'policies':{},'pilot_runs':0,'validation_runs':len(rows)}
for name in ['boss-pilot.json','boss-low-pilot.json','boss-selected-results.json','boss-final-results.json']:
 summary['pilot_runs']+=len(json.loads((R/name).read_text())['rows'])
labels={'novice':'기본 구매 정책','skilled':'승급·보석 활용 정책','expert':'순서 연계·광역 우선 정책'}
for sk in labels:
 group=[x for x in rows if x['skill']==sk];failed=[x['round'] for x in group if not x['clear']]
 splits={}
 for key,lo,hi in [('101-200',101,200),('201-300',201,300)]:
  g=[x for x in group if lo<=x['seed']<=hi];splits[key]={'n':len(g),'clear':sum(x['clear'] for x in g),'clear_rate':sum(x['clear'] for x in g)/len(g) if g else None}
 summary['policies'][sk]={'label':labels[sk],'n':len(group),'clear':sum(x['clear'] for x in group),'clear_rate':sum(x['clear'] for x in group)/len(group),'median_end_round':statistics.median(x['round'] for x in group),'median_loss_round':statistics.median(failed) if failed else None,'boss_timeouts':sum(bool(x['boss_failure']) for x in group),'seed_groups':splits}
md=['# LUCK Dungeon 0.3.3 보스전 검증 보고서','','## 결론','', '요청한 보스전 규칙을 적용했습니다. 다음 수치는 초기 검증용 제안이며 실제 사람의 초보/숙련/고숙련 클리어율을 확정하는 수치가 아닙니다. 70%·95% 목표는 현재 자동 정책에서 미달입니다. 5% 강제 패배나 승패 보정은 구현하지 않았습니다.','','## 적용 규칙','','- R5/10/15/20/25/30에 보스 1체가 등장하며 이전 4개 라운드의 살아 있는 적과 HP를 유지합니다.','- 보스전은 동일 메인 라운드 내 최대 3회 전투. 추가 전투에 새 적은 등장하지 않습니다.','- 매 전투 행동력 2, 기본 손패 5장. 기존 추가 드로우·다음 자원·카드·상점·승급·보석 교환 유지.','- 보호막: 모든 피해 100%. 진체력: 광역 70%, 일반/연계 100%, 관통 1당 일반 공격 +10%.','- 보호막을 뚫은 공격의 남은 원시 피해에 진체력 배율을 적용합니다. 관통 보너스는 보호막에 적용하지 않습니다.','- 관통으로 다음 적에게 넘기는 양은 강화된 실제 피해가 아니라 남은 원시 피해입니다.','- 이전 적과 보스를 전부 처치해야 동일한 기존 4종 보상에 진입. 보상은 1/2/3회 클리어에 따라 바뀌지 않습니다.','- R30도 세 번째 전투까지 허용. 적이 남으면 클리어 기록을 확정하지 않습니다. R30 보상 처리를 마친 뒤 공식 기록 확정.','- 일반 라운드의 적 수/누적 HP 위험 판정은 유지. 보스전 내에서는 3회 전멸 조건으로 판정합니다.','','## 초기 검증용 보호막·진체력','','| 진입 라운드 | 보호막 | 진체력 | 합계 |','|---:|---:|---:|---:|']
for t in table:md.append(f"| {t['round']} | {t['shield']} | {t['core']} | {t['shield']+t['core']} |")
md+=['','## 고정 정책 결과','','| 자동 정책 | 런 | 클리어 | 완료율 | 종료 R 중앙값 | 패배 R 중앙값 |','|---|---:|---:|---:|---:|---:|']
for sk,p in summary['policies'].items():md.append(f"| {p['label']} | {p['n']} | {p['clear']} | {100*p['clear_rate']:.2f}% | {p['median_end_round']} | {p['median_loss_round']} |")
md+=['',f"후보 탐색 {summary['pilot_runs']}런과 최종 비교 {summary['validation_runs']}런을 구분했습니다. 최종 비교는 시드 101~200과 201~300을 각각 100개 사용합니다.",'','### 정책 범위','','- 기본 구매: 승급·보석 교환을 하지 않고 정해진 구매 우선순위와 손패 순서 사용.','- 승급·보석 활용: 기본 승급 우선, 보석을 필요한 자원/행동력으로 교환, 균형 구매.','- 순서 연계·광역 우선: 보이는 손패의 순서 연계와 행동력 보충을 우선, 덱 경제 비율과 광역 보유량을 고려. 미래 상점·난수는 보지 않음.','- 셋 모두 최적 인간 플레이를 대표하거나 상한선을 증명하지 않습니다. 전략 개발과 플레이테스트 없이 사람 승률 70/95%로 환산할 수 없습니다.','','## 분석과 목표 차이','','보스 보호막·체력을 매우 낮춘 후보에서도 남은 일반 적을 3회 안에 모두 정리해야 하는 조건에서 실패가 이어졌습니다. 현재 표만으로 요청한 목표를 달성했다고 볼 수 없습니다. R15 전후 탈락 목표 역시 정책의 패배 분포와 실제 초보 플레이로 추가 검증해야 합니다. 다음 조정은 보스 HP를 계속 낮추기보다 구간별 누적 적 HP, 일반 공격의 다중 처치/관통 지원, 행동력과 광역 카드의 접근성을 함께 분리 실험하는 편이 타당합니다. 이번 검증판에는 그 추가 변경을 몰래 적용하지 않았습니다.','','## 검증 범위','','- 보호막/진체력 경계, 광역 70%, 관통 가산과 원시 초과 피해 소모, 누적 적 인계·신규 적 금지, 행동력 재설정, 3회 실패와 R30 전멸/보상 게이트 검사.','- 보호막·광역·관통·일반 공격을 섞은 60개 전투에서 준비 화면 예측과 실제 남은 HP 일치.','- 모바일 화면, 기본 손패 5장, 연속 전투와 서버의 보스 턴별 저장은 배포 워크플로의 boss-browser-results.json에 기록.','- UI 및 데이터 버전은 기존 0.3.2와 분리한 검증판. 실제 iOS/Android 장시간 플레이와 사람 숙련도별 표본 수집은 미실시.','- R31 이후 기존 무한모드 보스는 이번 공식 R1~30 보스전 설계 검증 범위 밖입니다.','','## 원시 자료','','`BOSS-BALANCE-DATA.zip`에는 판별 요약 CSV, 보스 전투별 CSV, 요약 JSON, 정책 및 엔진 해시가 포함됩니다. 사람이 플레이한 서버 기록은 포함하지 않습니다.']
(R/'BOSS-BALANCE-REPORT.md').write_text('\n'.join(md)+'\n')
(R/'boss-balance-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2))
a=io.StringIO();wa=csv.DictWriter(a,fieldnames=['skill','seed','profile','clear','round','boss_failure','steps']);wa.writeheader();wa.writerows({k:r[k] for k in wa.fieldnames} for r in rows)
b=io.StringIO();fields=['skill','seed','round','turn','remaining_count','remaining_hp','boss_shield','boss_core','attack','aoe','pierce','damage','clear'];wb=csv.DictWriter(b,fieldnames=fields);wb.writeheader()
for r in rows:
 for t in r['boss_timeline']:wb.writerow({**{k:t.get(k) for k in fields},'skill':r['skill'],'seed':r['seed']})
with zipfile.ZipFile(R/'BOSS-BALANCE-DATA.zip','w',zipfile.ZIP_DEFLATED) as z:
 z.writestr('runs.csv',a.getvalue());z.writestr('boss_turns.csv',b.getvalue());z.writestr('summary.json',json.dumps(summary,ensure_ascii=False,indent=2));z.write(R/'boss-table.json','boss-table.json');z.write(R/'BOSS-BALANCE-GOALS.json','goals.json')
print(json.dumps(summary['policies'],ensure_ascii=False))
