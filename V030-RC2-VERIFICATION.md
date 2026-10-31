# v0.3.0-rc.2 verification contract

Scope A: web-ready artifacts and device-only records. No deployment, main merge, database or workflow changes.

The four review commits isolate ranking storage, in-game documentation, release notes and RC.2 build identity. Game rules, R30 decisions, P5 reward mechanics and action points remain unchanged.

Rebuild from a clean checkout using prepare_site.py, build_v0219_preview.py, build_v0220.py and build_v030.py. Audio preparation plus build_v030_standalone.py generates the default embedded HTML; --audio external generates the separate web package. The runtime remains at preview/v0.3.0/ without modifying earlier version paths.

Version: 0.3.0-rc.2. Build IDs use 030-rc2- followed by a content hash including the build script, existing P1/P5 code, v030-local-cloud.js and v030-tutorial.js. v030-build-report.json records actual git_sha, source_tree_dirty, source manifest SHA256 and every generated file SHA256. close-audio-embedded/external.json record the standalone HTML hashes. Keep the exact source SHA together with the build ID; a generated report is not a promise that a later checkout has the same SHA.

Checks: node test_rc2_local_rankings.cjs; python -m unittest test_rc2 test_v030 test_v030_p1 -v. test_rc2 expects ../rc2-baseline to contain the clean cabf91b source with its generated preview. It covers legacy/RC.1 row rejection, all five ranking views, old-key preservation, guide/catalog navigation at 360/390/430px, clean identity, byte-identical combat rules, and unchanged workflows/SQL. Same-seed 160-pair regression compares normalized trace/final/RNG/rewards separately from version/time labels.

Actual measurements and artifact hashes belong in the generated RC.2 delivery report, not placeholders in this contract. Physical iOS/audio checks remain pending. No online upload or official leaderboard support is claimed.
