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
