# LUCK Dungeon 0.3.9-boss.1 — debuff/protection prototype

## Implemented contract

- All living enemies remain active until killed; all matching debuffs stack. Every combat's hand draw reactivates each surviving debuff independently. Resource loss consumes only resource effects on the first positive gain, including resource passives, luck payouts and gem-resource exchanges. Zero gain does not trigger it.
- Boss percentages: R5 link20%; R10 resource20%; R15 attack20%; R20 link20/resource10%; R25 resource20/attack10%; R30 attack20/link10/resource10%. Each effect depletes independently. Ordinary enemy spawn counts, individual debuff values and hunter theft values unchanged.
- Protection spending uses a deterministic pure allocator: maximize actual preserved result, then choose the least-cost equivalent allocation. Kind-specific protection is always used before universal protection. Rounding/floor plateaus that cannot be improved cost nothing. When several distributions give the same result/cost, flat reduction is considered first; no card stats change.
- Link protection considers resulting final firepower, converted pierce, attack-percent/peak bonuses and 50/70-point rewards, so useful gauge effects remain protectable even if integer final attack is unchanged. The displayed raw point count alone does not justify spending that preserves no combat effect.
- Shared protection is allocated link → attack. Preview uses the same planner against survivors of forecast AoE. Actual commit consumes the exact planned balances.
- Universal protection scope: balanced(default), combat(link/attack), economy(resource/gems). Choose on welcome or combat introduction. Kind-specific protection remains independent of this scope.
- Hunter rolls remain 60% per surviving hunter. A failed probability roll and having no gems consume no protection. A success uses gem then allowed universal protection, capped to actual possible loss.
- Log/telemetry distinguish preserved firepower/resources/gems, cost, probability failure, blocking and theft. Result cards, grouped theft animations, status cues, and forecast remaining balances are included. Existing SFX switches apply; reduced-motion is respected.
- UI label “콤보 보호” becomes “연계 보호”; this protects hand-combo and action-link reductions together.

## Promotion scope

No new unapproved protection cards or numeric buffs. Existing promotions/recipes retain their values. Explicit `guardLink` support permits only designated guard-economy/guard-draw conditions; it never records a second action. Tests verify this; no existing card is silently assigned that benefit. Protection-stack attack/gauge bonuses remain deferred.

## Verification

- Boss table and independent depletion/reactivation; living carry enemies remain active across zones.
- Zero/rounding/floor conservation; gauge-threshold benefit with unchanged final attack; own-first and scope/sharing rules.
- 1,575 exhaustive resource allocation cases against an independent maximum-result/minimum-spend enumeration.
- 40 mixed real-engine forecast/actual cases, including AoE removal and all three scopes; no preview mutation.
- Real DOM startup and per-combat settings, multi-debuff entry labels, forecast output, and no NaN values.
- Existing boss damage/pierce, growth, gauge-transition, audio and feedback feature suites.
- 120 fixed-policy seeded runs: 60 with protection and 60 disabling protection effects while retaining other card effects. Three expert purchase profiles × seeds101–120, no AI retuning, random-card rewards. All measured ineffective-spend counters zero. Protected condition: preserved firepower2439, resources23, gems9, protection867. Clears4/60; disabled2/60. Small AI samples are diagnostics, not human win rates or proof that every strategy can clear without protection.

Human feel testing and protection promotion compression/cycling evaluation remain next. Player strategy outcomes alone do not imply a balance defect.
