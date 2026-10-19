# Original Iteration 15 local Git ancestry (metadata only)

Recovered ZIP SHA-256: `aa0b2e06caf54d3073d900439e7f015abacf754b407f805b3e0bc43cfa1e1f63`
Recovered local HEAD: `274195e506b818fdd0957df980284aa08482735e`
Original local history: 17 commits, oldest to newest.

| Local commit | Parent | Subject |
| --- | --- | --- |
| e24a4c9a2e8c46518a2ae288fdfa7d19c9d77e21 | root | Native deterministic soccer development match, input and QA |
| df14306ef2e28adccfd68c832127dfe88b72b12f | e24a4c9 | Deterministic input replay and classic state IDs |
| abd233f05ffb72525ed1cba65f803705ded46b6d | df14306 | Original controller and RNG research |
| d6a8dea2dd87c162204e86dbbdffc8fa2e27af65 | abd233f | Original field pause and kickoff branch |
| 3c7d81790e581d82d278745ada6a22181de03429 | d6a8dea | Original goal cutscene branch research |
| 98229c0053cb8838a126e7e848e03b6bed19e3b0 | 3c7d817 | Original action buffers and player-action branch |
| 893ca3fca9d06f66a380cbd72e03ee480cb50742 | 98229c0 | Original possession controller branch |
| 1827fcdfc9341b1265722c9316f026033840c6ec | 893ca3f | Original four-controller selector |
| 1adb44a7f9f2e6326228e84c4a740065579f8c48 | 1827fcd | Original action arbitration |
| 92f23fb87a881a37fc4d16467dff3d0cf0debdf1 | 1adb44a | Binary-first CHR decoder and provenance audit |
| df5baaa7509ab446a1c0dcab26384d1a98e3f242 | 92f23fb | CHR preview and bank-count correction |
| 83a5ea1d8cd37b6c17a4a11c67d28eb1e29575b1 | df5baaa | Movement-state and ball-action priority |
| 2400e91c05838c2423499c1fe8234d3e0f0b5028 | 83a5ea | Private binary identity verification |
| 21a7a769103a38c58bca92770aab7548bb874d6e | 2400e91 | Private original CHR viewer documentation |
| 709fc1fb8e126433fad06c1770736754a501214e | 21a7a76 | MMC3 CHR banking and PPU mapping |
| a5e6c9dedaa7701cab153130b4818e46475c2104 | 709fc1f | PPU palette queue and OAM DMA |
| 274195e506b818fdd0957df980284aa08482735e | a5e6c9d | Original weather OAM producer |

This document preserves historical identifiers and chronology but does **not**
recreate the 17 Git commit objects or attach them as ancestors of canonical
`main`. No original ROM, graphics or audio data is included. The full
source migration and original-game parity remain incomplete.
