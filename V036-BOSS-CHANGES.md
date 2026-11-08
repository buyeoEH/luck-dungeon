# LUCK Dungeon 0.3.6-boss.1

## Requested corrections

- Replace the two separate growth rewards with ONE combined choice: **starting hand 8 + starting AP +1**. There are now five reward options (four existing + one combined).
- Hand size becomes 8, not +8 and not repeatedly +3. Re-selecting keeps hand size 8 and adds another AP. Temporary draw bonuses still stack; draws remain limited by available cards.
- Growth begins next combat, applies to every boss turn and normal round, continues into endless play, and resets on a new game.
- R5 core HP remains **36**, shield 0, combo debuff 6. The proposed core 24 candidate was rejected and its deployment cancelled before any Pages deployment.
- Ease the first approach instead: R1–4 normal enemy spawn HP ×0.75, rounded once (9 / 14 / 18 / 23). Existing carry HP is never reset or scaled at boss entry.
- Other bosses, card stats/prices, damage/pierce/3-turn rules and R30 reward exclusion remain unchanged.

## Basic-shop-only verification

`measure-basic-r5.cjs`, seeds 101–300, 200 runs per strategy. Only the six BASIC offers may be purchased; no random-shop purchases, promotions or boss-reward assistance. Runs stop after R5 clears or fails. Music/network are stubbed in headless real-engine QA.

| Purchase policy | Original early enemies / boss core 36 | Early HP ×0.75 / boss core 36 |
| --- | ---: | ---: |
| Attack first | 199/200 (99.5%) | 200/200 (100%) |
| Two draw cards, then attack investment | 199/200 (99.5%) | 200/200 (100%) |
| Draw-first stress policy | 123/200 (61.5%) | 169/200 (84.5%) |

The draw-first policy overbuys draw cards before investing in attack. Its remaining failures retain the consequence of delaying damage purchases. Completion rates are seeded AI measurements, not human win rates or a guarantee for arbitrary purchases. Results concern R5 only, not full R30 completion.

Reproduce after building:

```
P5_JSDOM_PATH=/path/to/jsdom node --expose-gc measure-basic-r5.cjs 36 200
P5_JSDOM_PATH=/path/to/jsdom node --expose-gc measure-basic-r5.cjs 36 200
```

The runner sets the R5 core in-memory to its supplied value; it does not edit game files. To reproduce the original early-enemy control use source 6594a233b7cb75280138e992cc6f8d56f1cf2a8f with the same runner. Final candidate source uses the compiled early-HP adjustment. Check `purchases_basic_only`, six-entry `basic_catalog`, zero `promotions`, and zero `growth_before_reward` in every candidate row.

Regression checks: test-boss.cjs, test-boss-growth.cjs, test-boss-audio.cjs. Deployment runs existing browser/mobile checks and live asset hash verification.
