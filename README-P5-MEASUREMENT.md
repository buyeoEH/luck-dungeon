# Reproduce P5 measurement (no shipped game changes)

Start from commit `15d136471bfc19e4cd21bb2e2dbf2218b7acc013` and copy only these measurement files into that checkout. The builder reads the pinned HEAD; changing game HEAD changes the expected metadata and is intentionally rejected. To reproduce from this measurement branch, use a separate pinned checkout and copy the `p5*` files and protocol into it.

1. Install Python dependencies: `python -m pip install playwright==1.51.0 pillow==11.1.0`.
2. Install Chromium: `python -m playwright install chromium`.
3. Install the Node measurement dependency: `npm install --prefix ../p5-runtime jsdom@26.1.0 --no-audit --no-fund`. Node used for the recorded batch: 24.22.1. Alternatively set `P5_JSDOM_PATH` to an existing jsdom module directory.
4. Build in order: `python prepare_site.py`, `python build_v0219_preview.py`, `python build_v0220.py`, `python build_v030.py`.
5. Generate configs with `from p5_measure import configs` and write `list(configs(range(101,501)))` as JSON to `p5-configs.json`.
6. Browser controls: `python p5_controls.py` (160 pairs). Then `node p5-node-controls.cjs` (complete-state cross-host verification).
7. Optional Chromium smoke: `python p5_measure.py --smoke --workers 1`; Node smoke: `node --expose-gc --max-old-space-size=512 p5-node-run.cjs 0 1 --smoke`. Compare 108 runs on stats, completion, round, RNG, opening shop, rewards, battles, audit.
8. Full resumable batch: `python p5_batches.py`. Each Node process handles at most 250 new runs to bound host memory; four workers each produce 5,400 unique rows. Do not modify sources during an active batch.
9. Complete-only report: `python p5_report.py`. Missing/duplicate cases, effect leaks, control mismatch and object logs reject the report.

No secrets or live Supabase access are required. All browser requests are served from the built local tree or aborted. jsdom does not fetch resources and its fetch implementation rejects network access. DOM presentation writes are suppressed in the Node host; full-state/RNG controls verify gameplay equivalence. This measurement does not validate mobile UI.

See `P5-MEASUREMENT-PROTOCOL.md` for intervention definitions and statistical limits. AI completion rates are policy comparisons, not human win rates.

Serialization note: cross-host stable traces normalize JavaScript undefined properties to null, matching Playwright serialization. Two initial batching versions appear in row hashes; gameplay host/probe behavior remained fixed. The final coordinator uses 512 MiB heap and at most 250 new runs per process; partial runs are excluded.
