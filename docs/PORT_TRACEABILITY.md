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
