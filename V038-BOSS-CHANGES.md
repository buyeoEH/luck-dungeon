# 0.3.8-boss.1 — clear stale link gauge on combat transition

- Clear per-combat link gauge state and the view's settled result/ledger when the player advances into the next combat, before its introduction modal appears.
- Applies to normal rounds, boss repeat turns, and advancing after choosing a boss reward.
- Retain final combat points on cinematic results, reward choice, gameover and official completion screens.
- Cancel stale gain/loss animation timers/classes during reset so the next combat starts without a previous pulse.
- Preserve pending combo protection and next-draw rewards; these are still granted exactly once when the new hand is drawn.
- Damage formulas, gain thresholds, rewards, HP and pierce rules unchanged.

Validation: test-link-transition.cjs with real DOM, existing boss/growth/audio suites, mobile boss transition assertion, and 40 paired seeded games checking unchanged combat results, damage, statistics and RNG counts.
