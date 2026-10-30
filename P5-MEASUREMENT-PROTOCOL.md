# P5 reward measurement protocol

Pinned game: `15d136471bfc19e4cd21bb2e2dbf2218b7acc013`; runtime `030-p1-5d62a9825cb6d2f9`. This commit adds only the expanded P1 report to game commit `358ce42`. Frozen AI: `v030-reference-policy-v1`, SHA256 `21547704592e343597911df7c8551f3b5019dc895eceb12c8c3db35627e63098`. Persistent draw is always ON.

No shipped game, AI weights, R30 decision, action points, gambling outcomes, AoE cards, database or deployment settings are changed. The following interventions exist only inside measurement hosts:

- Seven policies × 400 common seeds (101–500) × four fixed boss rewards = 11,200 runs.
- Random reward 1 and 2 cards, against current 3 cards: 5,600 additional runs. The shuffle algorithm, pool, 2% base-card recovery and random calls per retained card remain native. Fewer retained cards consume fewer random calls, so later random paths can diverge. Existing UI/log strings may still say “3 cards”; `random_cards` identifies the actual experimental count.
- Link policy with AoE and Pierce effects suppressed, four rewards × 400 = 1,600 runs. Acquisition/use of those cards remains allowed and is recorded. AoE resolution is zeroed; P1 converted Pierce and existing Pierce are zeroed at combat capture. Gauge, attack conversion and next-round bonuses remain enabled. This is an effect-ban stress test of the frozen policy, not an optimized restricted deck policy.
- Attack and balanced policies: converted Pierce alone disabled, reroll and random3 rewards, 400 seeds = 1,600 runs. Gauge, attack bonus and native Pierce are preserved.
- Native v0.2.20 controls for attack and balanced, reroll and random3, 400 seeds = 1,600 runs, to analyze previous declines.

Total: **21,600 unique runs**. All full and baseline pair comparisons preserve profile, seed and reward unless that reward is the explicit intervention.

Validation: 108 experimental smoke runs must match Chromium and Node/jsdom on completion, round, RNG calls, stats, first shop, rewards, battles and audit. Additionally 160 complete-state trace pairs compare native Chromium, the passive test adapter and Node host. All original tracked files must remain unchanged. AoE/Pierce-ban runs must have exactly zero actual AoE and Pierce damage. Every run must finish and have zero `[object Object]` log entries.

Outputs: run-level JSONL, completion rate with Wilson 95% intervals, paired improvements/worsenings and paired bootstrap 95% intervals, reward sensitivity, `conversion.csv`, per-seed associations, and explicit distinction between association and converted-Pierce ablation. R30 “within limits” is always separate from official completion. AI completion is not human win rate.

Acceptance is evaluated without redefining the user criteria: at least two non-AoE preference policies reach 80% of AoE policy completion under the same reward. Reward dispersion is reported as both deviation from the four-reward mean (±10 percentage points) and max–min range, avoiding an ambiguous single pass label. No balance adjustment will be implemented before the user reviews and approves proposals.
