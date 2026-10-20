# LUCK Dungeon v0.2.18 · online + latest audio

Approved v0.2.18 game rules and original UI are preserved. Runtime game.js is extracted from the approved single-file build; CSS remains inline. Latest original BGM/SFX plus MP3 fallbacks are included. BGM starts OFF and effects ON.

- Finish a game or R30 official run, then select **이니셜 등록**. Initials accept 2–6 Korean/Latin/digit characters. Duplicate initials are allowed; no user-visible unique number or account feature is implemented.
- **온라인 랭킹** reads player-submitted v0.2.18 records from Supabase. Daily/weekly/monthly periods use KST. These client-submitted scores are not server-verified competitive scores.
- Full manual logs remain private to the anonymous browser session. Only explicit initials registration publishes initials, score, round, result, play time and endless maximum. Browser storage carries session ownership; clearing it loses access to private history. It is not an account recovery system.
- Failed sync stays queued locally; retry from online records or reconnect. New revisions replace queued old records. One official run remains one row while endless maximum advances.
- **온라인 기록·AI 활동** shows the current browser's manual records and latest completed v0.2.18 AutoLab batch. These AI tests use rule-based strategy bots, not a language model. Purchases, promotion blockers, stone choices, card actions and battle rounds are logged. Old-version batches are not mixed into this screen.

## Reproduce and publish

`python prepare_site.py` verifies SHA-256 and unpacks three original asset archives, then copies a runtime-only `_site` directory. Archives preserve the original images/audio without web upload filename/path loss. `assets-v0218-manifest.json` records each asset checksum.

The `release-v0218.yml` workflow tests the actual UI with Playwright, runs 17 seeds × 6 strategies (102 simulations), validates/analyzes logs, uploads them using server-only GitHub Actions secrets, and publishes the tested site through GitHub Pages. Public config contains only a publishable key. Never add server keys to source or site artifacts.

The additive SQL migration `cloud/v0218_online.sql` adds initials/endless metadata and a separate safe public leaderboard. RLS keeps manual runs owner-only; public bot logs contain generated gameplay diagnostics. No existing rows are migrated/deleted. Main is unchanged; this branch is submitted as a draft PR and is not automatically merged.

Browser verification: `python -m unittest discover -s tests -p 'test_v0218_browser.py' -v` (mock cloud for deterministic UI and failure tests). Production REST/RLS and deployed URL are additionally checked during release verification. See Actions artifacts for UI screenshots and full AutoLab data.

## Five adventurers (appearance only)

The start screen offers 별빛 기사, 쌍검 모험가, 새벽 사제, 황혼 마법사 and 숲의 궁수. Their original transparent PNGs are included without changing stats, decks or rules. Select before starting; the chosen appearance appears in the preview and battle scenes and is locked for play. Reload starts with 별빛 기사.

The existing personal image picker remains available before play (PNG/JPG/WebP/GIF, 1.5 MB, 4096px). Personal image bytes remain in page memory and are never added to GitHub, browser storage, rankings or Supabase logs. Reload discards the personal image. Persistent custom-image rewards remain a future design item.
