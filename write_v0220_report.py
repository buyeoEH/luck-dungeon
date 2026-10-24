"""Build the review report from real test output; do not turn failed survival probes into passes."""
import csv,json,zipfile
from pathlib import Path
R=Path(__file__).resolve().parent;O=R/'results-v0220'
summary=json.loads((O/'comparison-summary.json').read_text());effects=json.loads((O/'effect-ablation.json').read_text());build=json.loads((R/'v0220-build-report.json').read_text());standalone=json.loads((R/'v0220-standalone-report.json').read_text())
logs=(O/'regression.log').read_text();assert 'OK' in logs and 'FAILED' not in logs
rows=[]
for p in summary:rows.append('|'+p['profile']+'|'+str(p['runs'])+'|'+str(p['clears'])+'|'+str(round(p['mean_round'],2))+'|'+str(round(p['mean_max_attack'],2))+'|'+str(round(p['mean_debuff_loss'],2))+'|'+str(round(p['mean_promotions'],2))+'|')
negative=[p for p in effects['promotions'] if p['damage_delta']<0]
zero=sum(e['event_type']=='zero_draw_link' for p in O.glob('bot-*.json') for e in json.loads(p.read_text())['events'])
cloud=json.loads((O/'cloud-live.json').read_text()) if (O/'cloud-live.json').exists() else {'status':'pending live verification'}
report=f'''# LUCK Dungeon v0.2.20 안정화 검증 보고서

상태: **검토용 안정화 후보**. 순수 공격의 R30 클리어는 아직 재현하지 못했습니다. 정식 안정화 확정·main 병합은 하지 않습니다.

빌드: `{build['build']['build_id']}`. 기준: `567a22bb3d2da107e7553232a2096afd96ecd6f5`.

## 1. 기준 및 보존

작업 시작 시 배포 중인 v0.2.19의 73개 파일을 고정 GitHub 코드로 재조립한 결과와 대조했고 모두 일치했습니다. v0.2.20은 별도 경로로 생성합니다. 빌더는 기존 런타임 {build['preserved_files']}개 파일이 바뀌지 않았는지 해시로 검사합니다. 카드·승급·연계 수치, HP·스폰·가격은 임의 조정하지 않았습니다.

기존 사용자 기록 15건의 지문 `565174926f65a83430bf90d822aa7600`은 SQL 검사에서 유지됐습니다. 기존 테이블을 삭제·백필하지 않았습니다. QA 테스트 레코드는 `source=qa`로 구분하며 사용자 분석과 공개 순위에 포함하지 않습니다.

## 2. 기능 비교와 변경 함수

| 영역 | v0.2.19 | v0.2.20 |
|---|---|---|
| 일회용 | 손패에서는 빠지지만 전체 덱에 남는 경로 존재 | 효과 전 인스턴스 제거, 전체 활성 더미·승급 후보 잔존 검사 |
| 로그 버전 | 로그 복사 제목에 0.2.18 고정 문자열 | 공통 버전·빌드 ID·run_id·점수 규칙 버전 |
| 공식 최고 공격력 | 광역 전/적 처치 후 측정 시점 혼재 | 광역 후 실제 타격 스냅샷을 기준으로 집계 |
| 공식 기록 | 클라이언트 값 보관 | R30 스냅샷 고정 + 서버 변경 거부 |
| 상점 | 잔여 재고 슬롯만 교체하는 기존 규칙 | 같은 규칙 유지, 경계값 검사·사유 표시 |
| 개인 기록 | 종료 시 브라우저 저장, 서버 전송 없음 | 시작부터 IndexedDB 저장, 개인 인증 후 이벤트 동기화 |
| 이미지 | 현재 페이지의 외형 | 게임 당시 원본·축소본·지문, 개인 기록 및 종료 화면, 비공개 저장 |
| 모바일 | 기존 접이식 UI | 기존 화면 + 재고 교체·DANGER 한계 정보, 3개 너비 검사 |

`build_v0220.py`는 원본 파일을 덮어쓰지 않고 `use`, `commitChoiceCard`, `battle`, `freezeOfficialRecord`, `showOfficialCompleteModal`, `copyDevLog`의 필요한 부분만 별도 빌드에서 수정합니다.

`v0220-core.js`는 `start`, `addNewCard`, `use`, `commitChoiceCard`, `purgeCard`, `buy`, `promote`, `drawCards`, `triggerLink`, `battle`, `reward`, `render`를 감싸 실제 엔진 결과를 기록합니다. `Luck220.emit/persist/patchCloud/finish`가 순번·내구 저장·동기화 상태·공식 확정을 맡습니다. 통신 중 새 플레이 이벤트가 저장되어도 동기화 상태 갱신이 최신 기록을 덮어쓰지 않도록 IndexedDB 트랜잭션을 사용합니다.

`v0220-history.js`는 개인 보기·TXT/JSON 내보내기·이니셜을, `v0220-cloud.js`는 익명 인증·재시도·서버 동기화·개인 이미지 업로드를 처리합니다. 서버 비밀키는 브라우저에 넣지 않습니다.

## 3. 일회용 및 점수 검증

일반 일회용 5종, 전설 일회용, 만능승급석의 개별 인스턴스를 검사했습니다. 동명 카드 두 장 중 사용한 인스턴스만 사라지고 나머지 인스턴스는 유지됩니다. 일회용 이력 보너스·사용 횟수는 유지하며 소멸은 일반 제거 횟수에 더하지 않습니다. 모든 승급 조합의 재료 제거도 검증했습니다.

공식 점수의 항목 합계, 광역 후 실제 공격력, 무한모드 진입 후 공식 점수 불변 검사를 통과했습니다. 측정표는 `V0220-SCORE-RULES.md`에 있습니다. 구 규칙으로 계산된 기존 기록은 소급 수정하지 않습니다.

## 4. Supabase 검증

`v0220-schema.sql`, `v0220-hardening.sql`, `v0220-indexes.sql`을 적용했습니다. 신규 테이블 3개에 RLS를 켜고 소유자에게 필요한 작업만 허용합니다. 이벤트 PK는 `(run_id, seq)`이며 동일 일회용의 소멸 이벤트에는 추가 유일성 검사가 있습니다. 이미지 버킷은 비공개이며 원본·축소본은 소유자 경로에만 올립니다. 사용자가 스스로 승인 상태를 바꾸거나 미승인 이미지를 공개하는 경로는 제공하지 않습니다. 향후 공개에는 승인과 동의가 모두 필요합니다.

`v0220-verification.sql`의 13개 SELECT를 실제 실행했습니다. 결과는 `sql-execution-results.json`, `sql-preservation.json`, `sql-final-validation.json`에 있습니다. 사용·최종 덱 인스턴스 대조의 잔존 및 이벤트 순번 누락은 0건이었습니다. 과거 기록에는 신규 상세 이벤트를 소급 생성하지 않으므로 신규 사용자 통계는 배포 후 표본이 쌓여야 의미가 생깁니다.

실제 연결 시험 결과:

```json
{json.dumps(cloud,ensure_ascii=False,indent=2)}
```

분석 SQL에는 구매·사용, 최종 덱 보유와 클리어, 획득 라운드별 5라운드 생존, 최초 상점, 카드 쌍, 승급 트리, 피해 기여 조회가 포함됩니다. 카드 쌍과 덱 보유의 클리어율은 상관관계이며 인과효과가 아닙니다.

## 5. 공통 시드 자동 플레이

공통 10개 시드로 5개 정책을 검사하고 순수 공격은 10개 시드를 더 검사했습니다. 순수 공격은 카드 사용뿐 아니라 획득 카드·패시브·각 전투의 광역/관통 값이 0인지 검사했습니다. 보스 보상은 재입고로 통일했습니다. 봇은 화면 렌더링만 생략하며 실제 게임 함수를 호출합니다. HP·스폰·가격은 바꾸지 않습니다.

| 정책 | 실행 | 클리어 | 평균 도달 R | 평균 최고 공격력 | 평균 디버프 손실 누계 | 평균 승급 |
|---|---:|---:|---:|---:|---:|---:|
{chr(10).join(rows)}

**이번 정책에서의 실패를 게임 자체의 클리어 불가능 증명으로 해석하면 안 됩니다.** 구매·승급 우선순위가 제한적인 규칙 기반 봇입니다. 순수 공격의 실전 생존 가능성은 미확인 상태로 남깁니다. 후속 실험은 자원 투자 종료 시점, 승급 재료 구매 계획, 기본 연속타 임계치 도달 전략을 먼저 바꾸고 같은 시드를 재생해야 합니다. 그 뒤에도 재현이 안 될 때 연속타 조건·누적 적 정리 효율을 밸런스 후보로 검토합니다.

각 실행의 최초 상점·구매·사용·획득·승급·라운드별 적 HP·공격·디버프·자원·패배 사유는 `bot-정책-시드.json`에 있습니다.

## 6. 승급·연계 효과

승급 조합 {len(effects['promotions'])}개와 연계 {len(effects['links'])}개를 검사했습니다. `promotions-effect-table.csv`는 비용·단계·최종 승급 여부·덱 압축·재료 대비 공격 차이·동일 조건 실전 피해 차이를 비교합니다. `links-effect-table.csv`는 보너스를 적용한 경우와 하지 않은 경우의 실제 전투 피해를 비교합니다. 조건 발동·중복 방지는 별도 테스트를 통과했습니다.

비교는 같은 시드, 중립 적 HP 20/100/300, 즉시 손패 사용과 전투라는 제한된 실험입니다. 추가 드로우 공급이 없어 드로우/경제 카드의 장기 가치를 평가하지 못합니다. 즉시 피해가 재료보다 낮은 조합은 {len(negative)}개였으며 이를 곧바로 약한 카드로 확정하지 않습니다. 원본 효과·실험 조건·전후 결과는 `effect-ablation.json`에 남깁니다.

자동 플레이에서 실제 드로우 0장과 연계 보너스가 동시에 기록된 사건은 {zero}건입니다. 현재 연계는 성공한 드로우 장수가 아니라 카드 행동 순서를 기준으로 하므로 규칙을 임의 변경하지 않고 `zero_draw_link`로 구분했습니다. '드로우 성공 시에만 연계'로 바꿀지는 별도 설계 결정입니다.

전투의 원시 콤보, 디버프 후 콤보, 콤보 손실, 공격 손실, 최종 공격과 실제 피해를 각각 남깁니다. 카드별 피해는 실제 피해 총량을 기여 원천의 가중치로 나눈 **배분 추정치**입니다. `_combo_link`와 미귀속 항목은 카드에 억지로 귀속하지 않습니다. 인과적 카드 피해와 혼동하면 안 됩니다. 배분합=실제 피해 검사는 통과했습니다.

## 7. 모바일·단독 실행

실제 Chromium에서 기능 회귀 검사 10개를 실행했습니다. 360/390/430px × 전투 모션 ON/OFF, 캐릭터 선택, 단계 진행, 덱 모달, 공식 종료와 이니셜 입력을 포함합니다. 커스텀 이미지와 비공개 동기화도 별도 실제 연결 시험으로 확인했습니다.

단독 HTML은 {standalone['embedded_assets']}개 이미지·음원 자산을 포함하며 {standalone['bytes']:,}바이트입니다. 인터넷을 끊은 상태에서 실제 시작→상점→전투→다음 라운드와 개인 저장을 확인했습니다. 파일이 커서 모바일에서는 웹 URL을 우선 권장합니다. 단독 HTML의 브라우저 저장 공간은 웹 URL과 별개일 수 있습니다.

## 남은 제한과 확정 조건

- 순수 공격 R30 클리어 재현 미완료. 자동 플레이의 낮은 성과만으로 카드 수치를 조정하지 않았습니다.
- iOS Safari와 Android 실제 기기 검증은 아직 수행하지 않았습니다. 모바일 너비의 Chromium 검사와 실제 기기 검증을 구분합니다.
- 브라우저 데이터 삭제·저장 용량 초과·앱 강제 종료 상황의 영구 보존은 보장할 수 없습니다. 저장 실패는 상태로 알리고 개인 JSON/TXT 내보내기를 제공합니다.
- 익명 저장 연결을 잃으면 다른 기기에서 본인 기록에 접근할 수 없습니다. 로그인 기반 계정 이전은 이번 범위에 추가하지 않았습니다.
- 커스텀 이미지 공개 승인 화면은 제공하지 않습니다. 비공개 보관 및 향후 승인·동의 메타데이터까지만 준비했습니다.
- 모든 검증을 통과한 최종 안정판이라고 확정하지 않습니다. 현재는 위 결과와 제한을 공개한 플레이 가능한 검증 후보입니다.

## 재현 및 롤백

```sh
python prepare_site.py
python build_v0219_preview.py
python build_v0220.py
python build_v0220_standalone.py
python -m unittest test_v0220 -v
python run_v0220_comparison.py
python evaluate_v0220_effects.py
python write_v0220_report.py
```

GitHub Actions는 같은 순서로 새 빌드를 검사합니다. 기존 root URL과 `/preview/v0.2.19/`는 바꾸지 않습니다. 롤백은 기준 브랜치의 기존 워크플로를 다시 배포하면 됩니다. 새 테이블·이미지는 삭제하지 않고 보존합니다. 새 공식 기록 보호 트리거는 v0.2.20에만 적용되므로 기존 버전 동작을 바꾸지 않습니다. main과 기준 브랜치는 병합하지 않습니다.
'''
(R/'V0220-STABILIZATION-REPORT.md').write_text(report)
with zipfile.ZipFile(R/'v0220-validation-results.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in O.glob('*'):
  if p.is_file():z.write(p,p.name)
 for name in ['v0220-build-report.json','v0220-standalone-report.json','V0220-STABILIZATION-REPORT.md','V0220-SCORE-RULES.md']:z.write(R/name,name)
print('Review report and test evidence archive created')
