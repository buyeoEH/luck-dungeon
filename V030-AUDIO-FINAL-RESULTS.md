# v0.3.0 audio closeout

Embedded audio is the approved default. External audio remains a separate web artifact. Runtime version remains 0.3.0-rc.1 until physical-device checks are complete. No main/merge/deployment/SQL/Actions dispatch or game-rule change was made in this phase.

Tested clean source: `1cf77b63f69347594fa8cbe2cdced05e66cfd069`; build `030-rc-ff8f468ed48e29de`. The subsequent results commit contains audit scripts, evidence, documentation and encoding-manifest approval metadata only. The seven protected game/audio/AI files match the previous closeout source byte for byte (see `audio-final-results/protected-game-files.json`).

| Distribution | HTML bytes | Complete package bytes | ZIP bytes |
|---|---:|---:|---:|
| Embedded default | 14505657 | 14505657 | 10778659 |
| External web | 9596255 | 13278381 | 10739732 |

Chromium observation passed for both packages: before activation, zero Audio objects and zero app decodeAudioData calls; activating BGM and starting the game creates only title/round tracks with preload=none, playback time advances, and BGM OFF pauses playback. Embedded audio uses data URIs, not HTTP streaming. External MP3 requests included Range: bytes=0-, but the local test server returned 200/full content; production 206 behavior is unverified. Browser internal PCM/cache/RSS and physical iOS/Android behavior were not measured.

Hypothetical resident float32 stereo PCM: all five BGM 72.08MB at 44.1kHz / 78.45MB at 48kHz; all 17 tracks 80.80MB / 87.94MB. This is not measured application memory. No whole-track WebAudio predecode occurs in product code. A BGM-only external/SFX-embedded hybrid is proposed conditionally in `V030-AUDIO-MEMORY-AUDIT.md`, not implemented.

`V030-DEVICE-CHECKLIST.md` now explicitly covers iOS first-touch activation, three-loop listening for each BGM, and return after background/lock. All physical-device rows remain unexecuted. `RELEASE-NOTES-v0.3.0-DRAFT.md` is the release-note draft. Previous 160-pair/15-functional/mobile Chromium results belong to the preceding closeout phase and were not rerun as new results in this packaging-only phase.

Downloads:

- [Report, checklist and release-note draft](https://chatgpt.com/library?file_id=libfile_e18d0079718c8191b5886d3058a97b00&account_id=personal)
- [Embedded offline ZIP](https://chatgpt.com/library?file_id=libfile_162dd0a44c8481918e0367229b8f971f&account_id=personal)
- [External web ZIP](https://chatgpt.com/library?file_id=libfile_8c92c0a02c848191828e4e6548193663&account_id=personal)
- [Audit evidence ZIP](https://chatgpt.com/library?file_id=libfile_318b7fbac794819197dc3cf772a4184a&account_id=personal)
