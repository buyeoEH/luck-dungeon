# P5F Results — acceptance not fully met

Game source d7e49ad7a68025b23c1b4a2d7f41509afb5ff37c /030-p5-ce72b3283c2449f2. New measurements29768 forks+11200 fixed=40968. Draw ON, seeds101–500, seven frozen policies.

| Fixed reward variant | Clears/2800 | Completion95% CI |
|---|---:|---:|
| A | 420 | 15.00% [13.11%, 17.14%] |
| B | 220 | 7.86% [6.46%, 9.36%] |
| C | 217 | 7.75% [6.36%, 9.21%] |
| seed3 | 537 | 19.18% [17.32%, 21.07%] |

A is the stronger restock candidate; B is close to C. Seed3 includes game-RNG consumption, so improvement cannot be attributed solely to narrower choice. Pierce fixed reroll improves2→7/400; attack2→5/400 but absolute completion remains low.

A+seed3 fractional best:20.16/18.97/32.68/28.18% (reroll/restock/random/stone): all>=15%. However only random is highest in every predeclared policy/state stratum; no tested combination passes the each-reward-best-somewhere criterion. Do not tune quotas or ship as balanced. This is restricted to the declared aggregate strata, not proof about every possible state.

The target-reward fork changes one reward only, then returns to C/8. Prefix states reuse prior P1 mixed paths; not a fresh C mixed-path population. Fixed runs execute each candidate from the start. C control7442 fork continuations+2800 fixed rows fully reproduce prior outcomes/statistics/RNG/rewards.

Validation: ABC+legacy fixtures, seed3/8 uniqueness/reopen/offered-only/single grant; P5 OFF160 paired traces; legacy14 full-run pairs;24 Chromium/Node branch matches and9 mobile input flows360/390/430. UUIDs normalized; images/media blocked in input-flow checks. No real-device/Safari claim; object logs0.

**Correction to prior standalone report:**65,986,084-byte HTML contains64,855,220bytes of asset image base64. Audio22 payloads are not embedded; runtime builds dynamic assets/audio paths, confirmed offline ERR_FILE_NOT_FOUND. The previous embedded_assets63 field counted prepared dictionary entries, not actual embedded/playable assets. No image/audio originals or packaging code changed in this audit. Late rewards remain proposals only.

[Full Korean report](https://chatgpt.com/library?file_id=libfile_1f3f92f85c5c8191b05b7c69202d995b&account_id=personal)

[Raw evidence ZIP](https://chatgpt.com/library?file_id=libfile_55d531fb6e0c81919f85b2e540e34ff7&account_id=personal)

ZIP SHA256:08839d58d0b15968eb920c793dfaa9a4cbedc21de967603036f94bbe2c7c7068.

Default candidate C+seed3. Flags:restock=A/B/C/legacy,seeds=3/8,p5=0. A/B remain opt-in, not automatically adopted. No main/old-data changes, merge, deployment or direct Actions/Supabase execution. See P5F-PROTOCOL.md and P5F-REPRODUCTION.md.
