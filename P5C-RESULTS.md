# P5 same-state reward forks: measured, not release-ready

Seeds101–500, draw always ON, 7 frozen AI policies. 7,442 reference reward moments × 4 actions × before/after =59,536 continuations, plus8,400 final fixed-policy runs. No selection quotas or weight tuning.

| Reward | Before unique-best | Approved unique-best | Approved fractional-best |
|---|---:|---:|---:|
| 상점교체 | 2.73% | 4.69% | 19.84% |
| 재입고 | 3.79% | 1.69% | 15.55% |
| 랜덤카드 | 18.26% | 17.56% | 34.52% |
| 승급석 | 13.24% | 12.81% | 30.08% |

Rank is completion then reached round; no score tie breaker. Fractional ties are not strict superiority. Both interpretations of the draft15% criterion are disclosed; strict unique-best passes only random cards. The report provides seed-cluster95% CIs, equal-run sensitivity, state/policy/ordinal strata, and paired improved/worsened counts.

| Fixed reward | Clears /2800 | Completion, cluster95% CI |
|---|---:|---:|
| random | 1064 | 38.00% [35.61%, 40.54%] |
| reroll | 464 | 16.57% [14.93%, 18.25%] |
| restock | 217 | 7.75% [6.36%, 9.21%] |

**Acceptance not met.** Both modified fixed rewards fall below half of random38% (threshold19%) overall. Reroll meets policy-specific50% only for aoe/link; restock meets none. Do not release this as balanced or retune the selector to force reward ratios.

Approved stages are in Draft [PR9](https://github.com/buyeoEH/luck-dungeon/pull/9), candidate source `d276fbc8bd3a484b9431ef39b5b072835e6e0f5d`, build `030-p5-2ae18b163156e902`. Stone description only; reroll locks<=2 plus one chosen free seed; one sold-out current slot restored tostock1 plus next-shop one-purchase50% coupon (cap2, min price1). New interface adapter resolves choices/prices, frozen preference weights unchanged.

Validation: each stage feature-OFF160 normalized state/trace pairs; final160 repassed; before/after native Chromium versus Node24 branches each; final mobile touch and embedded offline HTML flows360/390/430px. Random fixed2800 complete normalized statistics/RNG/reward paths unchanged. Reroll fixed2800 unchanged between reroll-only and final stages. `[object Object]` zero. Chromium simulation does not replace real-device Safari tests.

[Full Korean report with95% CIs](https://chatgpt.com/library?file_id=libfile_e229aa94a34881918cec0749a76e16b2&account_id=personal)

[Raw evidence ZIP,29.7MB](https://chatgpt.com/library?file_id=libfile_9afe53172de0819186fa8cf6ffda6219&account_id=personal)

Evidence ZIP SHA256: `2b31f0723e4789995c8fa9d5759426218d45b5b97f279110f2f343a73b738dc5`.

Baseline engine/source `15d136471bfc19e4cd21bb2e2dbf2218b7acc013` remains unchanged. main remains `f6fa0c0a9bbcdcbac1fbf8324630106e2e1ab0a2`. No deployment, merge, Actions dispatch, SQL execution or existing-record changes. R30, action points, gambling outcomes, AoE values, and random-card reward untouched. See `P5C-REPRODUCTION.md` for exact setup.
