# P5 follow-up measurement

This branch changes measurement code only. The shipped game and original seven AI card/shop/promotion policies stay unchanged. Review `P5B-PROTOCOL.md` for the frozen selector and intervention definitions. `P5B-REVIEW.md` contains reviewed interpretation, not policy tuning.

## Reproduction

- Use engine checkout `15d136471bfc19e4cd21bb2e2dbf2218b7acc013` and copy the measurement scripts from this branch into it. Keep the engine HEAD pinned so `build_v030.py` emits the same engine metadata. There are no AGENTS.md files in the checkout.
- Install Python Playwright 1.51.0 and Pillow 11.1.0, Chromium build1161, Node24.22.1, and `npm install --prefix ../p5-runtime jsdom@26.1.0`. `P5_JSDOM_PATH` can instead point to an existing jsdom module. Build with prepare_site.py, build_v0219_preview.py, build_v0220.py, build_v030.py in that order.
- Previous evidence ZIP SHA256: `e9c2c93b6001c24ef7fbe75afddbf63e40909c2db906379c8a25d6f352561ef7`. Extract its p5-report/runs.jsonl.gz to ../p5b-prior/runs.jsonl.gz and p5-controls/chromium.jsonl to both ../p5b-prior/chromium.jsonl and p5-controls/chromium.jsonl. Prior measurements are reused, not counted as new executions.
- Smoke: `node --expose-gc --max-old-space-size=512 p5b-run.cjs 0 1 --smoke`, then `python p5b-browser-smoke.py`. This compares 34 active cases across Chromium and Node. Re-running the browser checker skips previously verified cases.
- Controls: `node --expose-gc --max-old-space-size=512 p5-node-controls.cjs`. This checks 160 full-state hashes against the preserved original Chromium controls. New test hooks and selector are present but inactive for fixed normal rewards. Undefined properties are serialized to null to match Playwright.
- Intervention checks: `node --expose-gc --max-old-space-size=512 test-p5b.cjs`.
- Openings: `node --expose-gc --max-old-space-size=512 p5b-openings.cjs` (800 starts).
- Full execution: `python p5b-batches.py` (4 workers, 1,700 complete cases each, at most250 new runs per process, resumable). Do not edit runtime sources while sampling.
- Complete-only analysis: `python p5b-report.py`. It rejects incomplete/duplicate sets, non-identical sources, illegal native damage, and mismatched prior 1,600 strict-ban cases. Outputs include all reward decisions/scores/inputs, completion and choice proportions, seed-clustered 95% intervals, conversion and opening-shop exposure.

No live Supabase or GitHub Actions execution is involved. All browser requests are served locally or aborted; Node fetch rejects network access. This is not mobile UI testing. No candidate reward changes or auto-merge are authorized by this measurement.
