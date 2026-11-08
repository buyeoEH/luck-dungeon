# LUCK Dungeon 0.3.5-boss.1

- R5 only: shield 12 → 0; core HP 40 → 36; combo debuff 5 → 6. Other boss stats unchanged.
- Six reward choices: preserve the four existing rewards; append starting hand +1 and starting action points +1.
- Choose one reward. Growth starts next combat, stacks for this run, applies to normal rounds and every boss turn, and continues into endless play. New games reset growth.
- Hand reward increases the draw target (subject to available cards); temporary next-draw bonuses remain additive. AP resets to the new base each combat, never carries unused points.
- R30 still has no reward. Combat damage, pierce, AoE and 3-turn rules unchanged.
- Zero-shield bosses show “보호막 없음” in entry, combat and sticky HUD; no blue bar or divide-by-zero width.

Validation: test-boss.cjs (combat/forecast/R30), test-boss-growth.cjs (growth lifecycle, duplicate lock, real DOM), test-boss-audio.cjs. Deployment also runs the mobile browser suite.
