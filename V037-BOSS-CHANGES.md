# 0.3.7-boss.1 — boss encounter pierce transfer

- Without pierce, killing a normal enemy still discards overkill; it cannot damage the boss behind it.
- With pierce, each point permits one boundary crossing after a kill, using the remaining raw attack. Applies to carry enemies and bosses alike.
- Shield-to-core overflow needs no pierce. Each pierce point also adds the existing 10% direct core strike based on the attack that reaches the boss.
- An enemy that survives blocks the next target. A depleted pierce allowance cannot cross another enemy.
- Forecast, combat, rule text and pierce statistics now agree. Core direct damage is not counted twice when it arrives as a transferred pierce hit.
- Tests include actual lance use (20 base +4 temp, carry HP5, remaining19 → boss shield -19/core -1), no-pierce control, limited pierce crossings, surviving enemy block, and 60 forecast/combat parity cases.
- Other combat rules, HP, rewards and early difficulty are unchanged from 0.3.6-boss.2.
