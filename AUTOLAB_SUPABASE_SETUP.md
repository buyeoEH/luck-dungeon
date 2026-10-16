# LUCK Dungeon — AutoLab Supabase 진단 로그 v0.2

## 한 번만 설정할 것

1. **완료 (2026-10-13):** ChatGPT Supabase 앱을 통해 LUCK 프로젝트 `xkmfjutncwblfebgdmar` 연결, 기존 `bot_runs` 234건 확인.
2. **완료 (2026-10-13):** `autolab_batches`, `autolab_rounds`, `autolab_events` 생성 및 RLS/서버 키 권한 확인. **SQL Editor에서 다시 실행할 필요가 없습니다.**
3. GitHub 저장소 → **Settings → Secrets and variables → Actions**에서 다음 Secrets가 있는지 확인합니다(실제 값을 채팅이나 코드에 붙이지 마세요).
   - `SUPABASE_URL`: Supabase 프로젝트 URL
   - `SUPABASE_SECRET_KEY`: 권장되는 신형 서버용 `sb_secret_...` 키 (새 코드에서 우선 사용). 기존 키만 있으면 `SUPABASE_SERVICE_ROLE_KEY`도 호환됩니다. 유출되면 즉시 재발급. 클라이언트 JS/깃 커밋 금지.
4. 패치 ZIP의 **7개 파일을 GitHub 저장소의 동일 경로에 업로드**하여 커밋합니다. 이미 존재하는 파일은 덮어쓰고, `cloud/supabase_autolab.sql`은 이력을 위한 참고 파일입니다. 게임 규칙 파일 `game.js`는 교체하지 않습니다.
5. **Actions → AutoLab Cloud Runner → Run workflow**에서 `runs=17`, `strategies=random,economy,attack,aoe,link,survival`로 테스트. `runs`는 **전략당 실행 횟수**이므로 총 102회입니다.
6. 워크플로 완료 후 Actions의 artifact `autolab-results`에서 `analysis.md`, `analysis.json`, `events.jsonl`, `batch_id.txt`를 확인합니다.

## 저장 경로

- 기존 `public.bot_runs`: 완료 결과 (승리, 점수, 승급 횟수 등) — 기존 스키마 그대로 사용
- 신규 `public.autolab_rounds`: 라운드별 공격력, 적 HP, 덱 규모 및 피해
- 신규 `public.autolab_events`: 상점 입장/퇴장, 구매, 승급, 보스 보상, 재료/비용 부족 진단
- 신규 `public.autolab_batches`: 배치 식별자, GitHub 실행 ID 및 분석 JSON

**중요:** 현재까지 확인 가능한 옛 `autolab.js`에는 `promote()` 호출이 없어 0회 승급이 정상적으로 발생할 수 있습니다. v0.2에서는 상점에서 승급 가능한 조합이 있을 경우 실제 게임의 `canPromote()`/`promote()`를 실행하도록 수정했습니다. 기존 봇이 보스 상점 교체 보상 화면에서 멈추던 문제도 수정했습니다. 카드 생성/가격/전투 규칙은 수정하지 않았습니다. 이것은 봇 행동 변화이므로 구버전 테스트의 승률과 직접 비교할 때 주의하세요.

## 분석 해석

`analysis.json`의 `promotion_diagnosis.causes`:

- `promoted`: 적어도 1회 승급
- `missing_recipe_cards`: 진단한 상점 시점에 승급 재료가 부족
- `resource_shortage`, `gem_shortage`: 재료는 있지만 승급 비용 부족
- `affordable_but_no_promotion`: 승급 가능 조건이 나타났지만 승급되지 않음 (봇 또는 로깅 검토)
- `no_shop_diagnostics`: 진단 로그가 없어 판단 불가

`promotion_diagnosis.missing_ingredients`는 부족한 재료 카드와 그 재료가 **관측된 상점에 등장하지 않았던 경우**를 구분합니다. 실제 카드 등장 확률은 시드/상점 순환 정책을 별도 분석해야 합니다.

## 데이터 확인 SQL (읽기 전용)

```sql
SELECT batch_id,created_at,status,runs_ingested,rounds_ingested,events_ingested
FROM public.autolab_batches ORDER BY created_at DESC LIMIT 10;

SELECT strategy,count(*) AS runs,
 round(avg(round)::numeric,1) AS avg_round,
 round(avg(score)::numeric,1) AS avg_score,
 sum(promotions) AS promotions
FROM public.bot_runs
GROUP BY strategy ORDER BY strategy;

SELECT batch_id,strategy,seed,round,event_type,payload
FROM public.autolab_events WHERE event_type IN ('promotion','purchase')
ORDER BY batch_id DESC, strategy,seed,event_index LIMIT 100;
```

## 안전성과 제약

- Supabase Secret은 GitHub Actions의 서버 실행 환경에서만 읽습니다. 채팅·소스코드·artifact에 기록하지 않습니다.
- SQL은 신규 테이블에 RLS를 설정하며 익명 권한 정책을 생성하지 않습니다. `service_role`은 RLS를 우회할 수 있으므로 서버 비밀키 관리를 철저히 하세요.
- 분석은 GitHub Actions 실행 직후 자동 생성 및 저장됩니다. **ChatGPT가 실행 완료 직후 자동으로 읽고 답장을 보내는 것은 별도의 일정/연결 작업**이며, Supabase 연결 승인 후 설정해야 합니다.
- GitHub Actions의 `bot_runs` 기존 스키마가 코드와 다르면 저장 단계가 실패할 수 있으므로 연결 후 실제 테이블 스키마 검증이 필요합니다.
- GitHub 재시도로 인해 기존 `bot_runs`에 중복이 발생할 수 있습니다. 새 테이블에는 `(batch_id, strategy, seed, ...)` 기본 키를 사용해 중복을 방지합니다.

## 이번 버전의 실행 일정

수동 GitHub Actions 실행(`workflow_dispatch`)과 `feature/autolab-v0.2-supabase-analysis` 브랜치 push 시 실행합니다. 브랜치 push 검증은 6개 전략 × 17회 = 총 102회입니다. Actions 1회가 끝나면 분석·Supabase 업로드는 자동으로 수행됩니다. 이 변경은 main에 병합하기 전까지 main의 기존 실행 일정에 영향을 주지 않습니다.

## 이번 통합에서 보완한 사항

- `rounds.csv`의 `attack`은 해당 전투 공격력, `damage`/`aoeDamage`는 해당 전투 피해량입니다. 누적 최고치와 누적 피해량을 기록하던 구버전과 구분하세요. 적 HP와 수는 전투 직후, 다음 라운드 적 생성 이전 기준입니다.
- 상점 방문 및 구매 집계에 승급 성공 실행도 포함합니다.
- 시뮬레이션은 로컬 game.js와 autolab.js만 로드하고 외부 요청을 차단합니다.
- 지원하지 않는 전략, 중복 전략, 잘못된 실행 횟수 및 이전 결과 폴더 재사용을 거부합니다. 실행 오류나 단계 제한 도달 시 CI를 실패시키며 부분 결과는 artifact로 남깁니다.
- 업로드 HTTP 실패 시 응답 본문을 출력하지 않습니다. batch 완료 상태는 모든 업로드 성공 후에만 기록합니다.
- 신규 SQL은 참고용이며 현재 프로젝트에 재실행하지 않습니다. 기존 bot_runs 스키마와 게임 규칙을 변경하지 않습니다.

## 로컬 검증

```sh
python -m pip install playwright==1.51.0
python -m playwright install chromium
python -m unittest discover -s tests -v
python run_autolab.py --runs 17 --output results
python cloud/analyze_results.py results
```

`CHROMIUM_PATH`를 지정하면 별도로 설치한 Chromium을 사용할 수 있습니다. 기본값은 Playwright가 설치한 브라우저입니다. `results` 폴더가 이미 있다면 새로운 `--output` 경로를 지정하세요.
