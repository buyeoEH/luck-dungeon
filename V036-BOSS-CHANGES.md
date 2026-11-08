# LUCK Dungeon 0.3.6-boss.1

## Requested corrections

- Replace the two separate growth rewards with ONE combined choice: **starting hand 8 + starting AP +1**. There are now five reward options (four existing + one combined).
- Hand size becomes 8, not +8 and not repeatedly +3. Re-selecting keeps hand size 8 and adds another AP. Temporary draw bonuses still stack; draws remain limited by available cards.
- Growth begins next combat, applies to every boss turn and normal round, continues into endless play, and resets on a new game.
- R5 core HP **36 → 24**. Shield stays 0; combo debuff stays 6. R1–4, carry HP, other bosses, damage/pierce/3-turn rules and R30 reward exclusion are unchanged.

## Basic-shop-only verification

`measure-basic-r5.cjs`, seeds 101–300, 200 runs per strategy. Only the six BASIC offers may be purchased; no random-shop purchases, promotions or boss-reward assistance. Runs stop after R5 clears or fails. Music/network are stubbed in headless real-engine QA.

| Purchase policy | Core 36 control | Core 24 candidate |
| --- | ---: | ---: |
| Attack first | 199/200 (99.5%) | 200/200 (100%) |
| Two draw cards, then attack investment | 199/200 (99.5%) | 200/200 (100%) |
| Draw-first stress policy | 123/200 (61.5%) | 158/200 (79%) |

The draw-first policy overbuys draw cards before investing in attack. Its remaining failures retain the consequence of delaying damage purchases. Completion rates are seeded AI measurements, not human win rates or a guarantee for arbitrary purchases. Results concern R5 only, not full R30 completion.

Reproduce after building:

```
P5_JSDOM_PATH=/path/to/jsdom node --expose-gc measure-basic-r5.cjs 36 200
P5_JSDOM_PATH=/path/to/jsdom node --expose-gc measure-basic-r5.cjs 24 200
```

The runner overrides only the R5 core in-memory for each control; it does not edit game files. Check `purchases_basic_only`, six-entry `basic_catalog`, zero `promotions`, and zero `growth_before_reward` in every candidate row.

Regression checks: test-boss.cjs, test-boss-growth.cjs, test-boss-audio.cjs. Deployment runs existing browser/mobile checks and live asset hash verification.
