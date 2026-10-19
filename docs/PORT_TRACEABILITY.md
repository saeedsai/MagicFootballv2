# Native JavaScript + Java reconstruction traceability

Pinned upstream: `df2c8e55e7f13e5792482527db9e7c9e4a84c6e1`

| Original source | JS destination | Java destination | Verification | Limits |
|---|---|---|---|---|
| `bank_FF.asm` `sub_EE35`, `$EE35–$EE59`, RAM `$0045/$0046` | `src/classic/OriginalRandom.js` | `java/src/org/magicfootball/classic/OriginalRandom.java` | Archived Node RNG tests; Java exhaustive 65,536 initial-state transitions | Seed init, frame ordering, actual in-game distribution remain unverified |
| `bank_ram.inc`, `bank_val.inc` constants | `src/classic/OriginalStateIds.js` | not yet ported | Exact blob match with archived JS | Metadata only, not screen behavior |
| `bank_FF.asm` dispatch `$C492–$C4C2`, `$C50E–$C537` | `src/classic/OriginalScreenDispatch.js` | not yet ported | Exact blob match with archived JS | Handler CPU addresses only; original handlers unported |
| Offline ROM hash utility | `src/classic/OriginalRomSha1.js` | not yet ported | Archived SHA-1 regression test vs Node crypto | Validates locally supplied data, does not supply original ROM |
| Original CHR/sprite palette/PPU composite | modular import pending | pending | no verified original frames | Classic disabled |

The exact original ROM, extracted graphics and sound bytes must be supplied locally by the owner rather than embedded or uploaded to the public repository. This document tracks implementation progress, not a 1:1 fidelity certification.

The full original 185-file archive and its historical Git commits are not yet imported. Every recovered JS blob above has been verified individually using GitHub Git object SHA.

| `CHR_ROM.chr` graphics format; iNES header inspection | `src/classic/NesBinaryAssets.js` | `java/src/org/magicfootball/classic/OriginalChrDecoder.java` | Exact original archived JS blob; 2bpp synthetic Node test; exhaustive 65,536 Java plane-byte pairs | No original CHR bytes distributed, no verified palette |
| `bank_FF.asm` `$EE7D–$EED2`, MMC3 CHR select | `src/classic/OriginalChrBanking.js` | pending | Exact original archived JS blob, synthetic mapper inversion test | No full sprite composition |
| `bank_FF.asm` `$D993–$DA45`, weather OAM | `src/classic/OriginalWeatherSprites.js` | pending | Exact original archived JS blob, synthetic twelve-sprite initialisation test | Actual weather frames and palette unverified |

| `bank_FF.asm` `$EE5A`, `$F05F–$F0B3` PPU writes | `src/classic/OriginalPpuTransfers.js` | pending | Archived blob exact; synthetic DMA + palette queue tests | No verified original frame |
| `bank_FF.asm` `$EE06`, `$EDCD` input/edge reads | `src/classic/OriginalInput.js` | pending | Archived blob exact; synthetic serial edge test | Hardware/controller channels unverified |
| `bank_FF.asm` `$FAEE–$FBA8` hold/repeat buffers | `src/classic/OriginalActionBuffers.js` | pending | Archived blob exact; synthetic buffer clearing test | Action execution not yet ported |
| `bank_04.asm` `$B850–$B8AA` possession branch | `src/classic/OriginalPossessionControl.js` | pending | Archived blob exact; synthetic controller-slot test | Not full match mechanics |

## 2026-10-19 archive-verified field and goal restoration

| Pinned disassembly | Archived JavaScript | Original archived tests | Status |
| --- | --- | --- | --- |
| bank_FF.asm $C615-$C63A, $C87B-$C89B, $C5B3-$C5C9 | `src/classic/OriginalFieldLogic.js` | `tests/original-field-logic.test.js` (17 tests) | Exact source restored; isolated RAM-branch tests only; no full-frame parity |
| bank_FF.asm $C699-$C71B | `src/classic/OriginalGoalCutscene.js` | `tests/original-goal-cutscene.test.js` (10 tests) | Exact source restored; 12 external routines still unported; no full-frame parity |

Upstream pinned SHA: `df2c8e55e7f13e5792482527db9e7c9e4a84c6e1`. Source baseline: `274195e506b818fdd0957df980284aa08482735e`. No ROM, CHR, PRG, DPCM or derived sprite art distributed.

## 2026-10-19 batch 5 — bank06 action arbitration and movement

| Pinned disassembly | Archived JavaScript | Test evidence | Status |
| --- | --- | --- | --- |
| bank_06.asm $AA14-$AAAB, $AC69-$AD40 | `src/classic/OriginalActionArbitration.js` | `tests/action-arbitration-import.test.mjs` (4 synthetic tests); archived full test deferred pending alternate-controller source | Exact JS blob restored; isolated RAM/action metadata checks only |
| bank_06.asm $AAC3-$AB51, $AC4D-$AC64 | `src/classic/OriginalMovementTransition.js` | `tests/original-movement-transition.test.js` (16 exact archived tests) | Exact JS blob restored; synthetic RAM chain, not NES frame parity |


## 2026-10-19 verified archive source import (feature branch)

Archive `Kunio_Soccer_Iteration_15_Source.zip` independently passed SHA-256 `aa0b2e06caf54d3073d900439e7f015abacf754b407f805b3e0bc43cfa1e1f63` and ZIP CRC checks. Local original Git HEAD: `274195e506b818fdd0957df980284aa08482735e` (185 tracked paths, 17 original commits). The source restoration branch `source/iteration15-archive-bulk-20261019` points to `b0af6cf644381af524c413da018b369e8ab176d0`, based on canonical main `c0b8bc7b4bb159e5bd36fbaf84486c3275247396`. GitHub's remote tree contains all **22/22 original src/ JS files with Git blob hashes identical to local baseline**. 106/185 archived tracked paths match byte-for-byte, four tracked paths differ intentionally (README.md, index.html standalone, package.json bootstrap, .gitignore), and 75 tracked paths are still missing, largely dist outputs, test logs and screenshots, plus several tools and documents. Therefore the complete 185-file migration and 17-commit history are **NOT complete**. The main branch has NOT been advanced; ref-update and pull-request creation were blocked by connected-app safety checks. No protected original ROM/CHR/PRG/DPCM/audio or derived original art was published.

GitHub Actions on the restoration branch: Node 266 total / 260 pass / 0 fail / 6 skipped; Java original-routine CI passed. Local full archived source: 243 total / 237 pass / 0 fail / 6 skipped; `npm run check` and `npm run build` passed locally, but remote build is **not** claimed (archived `tools/build.mjs` still missing). The six skipped Node tests need a locally authorized original ROM. Classic Mode remains disabled and no original NES frame-level parity is claimed. Prioritize safely merging the branch into main, restoring missing tooling and traceability, then addressing original game fidelity.
