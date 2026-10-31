# v0.3.0 closeout review results

Superseding audio decision: embedded audio is now approved as the default; external audio is a separate web artifact. The historical comparison and pending-approval statements below describe the preceding phase. Current build sizes, runtime checks and downloads are in [V030-AUDIO-FINAL-RESULTS.md](V030-AUDIO-FINAL-RESULTS.md). Physical-device checks remain pending.

Default restock A + seed3 is implemented. B/C/legacy, seeds8 and p5=0 rollback flags remain. No random-card/R30/action-point/reward-quota changes. Main and existing player data remain unchanged; no merge/deployment/direct Actions batch/SQL execution.

Actual tested game source: ae9900a379da4ee933adf0ff4f95ff8a22ea2e27, build030-rc-b29b0fd152e741c8, source_tree_dirty=false. Candidate remains0.3.0-rc.1 while audio strategy approval and real-device checks are pending.

39 PNG assets48,641,386bytes→lossless WebP6,345,198bytes. Cards/icons max384px, enemies/players max512px. All resized RGBA pixels and alpha match the resized original exactly. Representative5-asset/88px and image-loaded mobile views were inspected. Original assets/archives remain intact.

| Audio review candidate | HTML | Complete uncompressed package | ZIP |
|---|---:|---:|---:|
| Embedded |14,505,528bytes|14,505,528bytes|10,778,609bytes|
| External |9,596,117bytes|13,278,243bytes|10,739,610bytes|

Both satisfy15,000,000-byte budget. Logical17tracks compressed toMP3 128kbps stereo44.1kHz, mapped through22source aliases. Original22files retained. No audio policy selected automatically; explicit --audio embedded/external required. Both decoded17tracks and actual playback, embedded offline reload, and actual file/offline playback in both modes passed in desktop Chromium. Human listening, loop boundaries and real iOS/Android behavior are NOT claimed tested. For standalone mobile/offline convenience embedded is the proposed choice, pending user approval.

Regression160pairs: parent86f711f with explicit A/seed3 versus new defaults, same normalized turn trace/final state/RNG/reward path, object logs0. Fifteen existing core/P1 UI tests passed. Full image loading allowed for360/390/430px DPR2 flows;39WebP decode;B/C/legacy/full-OFF flags passed. Old R30 and official-score freeze behavior preserved. CI definition updated to build both review candidates and run these commands, not dispatched/reported as a server run.

Late rewards are proposals only in V030-LATE-REWARD-SUMMARY.md. All real-device checklist rows in V030-DEVICE-CHECKLIST.md remain not executed.

[Full report and device checklist](https://chatgpt.com/library?file_id=libfile_e80fc557424081919edb993bddefe73d&account_id=personal)

[Embedded review ZIP](https://chatgpt.com/library?file_id=libfile_40a0a1eadcd08191b57d7886b767748e&account_id=personal)

[External review ZIP](https://chatgpt.com/library?file_id=libfile_5354c40e6de08191967125e2b1051bac&account_id=personal)

[Validation evidence](https://chatgpt.com/library?file_id=libfile_80f2feaf7b048191a557e12cc91ff330&account_id=personal)

Embedded ZIP SHA256:35087c6930ee2d929ce094cb8acbd576c3314430f24d6600e5da8e2a048f2892.
External ZIP SHA256:52e54d65ae4b17bc3b7c4f35f152ddf5009e45f09398ca5630717df80d549710.
