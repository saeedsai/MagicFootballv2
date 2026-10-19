# Bank 06 movement-state and pending ball-action conversion — v0.11.0

**Source:** `cyneprepou4uk/NES-Games-Disassembly`, pinned commit `df2c8e55e7f13e5792482527db9e7c9e4a84c6e1`, `Kunio-kun no Nekketsu Soccer League/bank_06.asm`. Inspected via GitHub's pinned text-file reader, blob `a59aba73692dd2b3775c158c03dafa2452f39f95` (not a full local checkout). **Source-local operations are not independently verified against a running NES.**

## A. `$AAC3/$AAC8` → `$AACA–$AB0A`: player movement state recomputation

- `$AAC3` selects pointer `$AC69`; `$AAC8` selects `$AC87` from the original pointer table at `$AC65`. The existing `OriginalActionArbitration.js` contains the audited `$AC69–$AD40` two-byte metadata records. Only the first byte of the selected record is used here.
- `$AAD8–$AAE6`: read player Z-high `$0399+X` and Z-low `$0386+X`; when Z-high is negative and Z-low is below `$F8`, set scratch `$001C=$20`; otherwise zero. No physics or jumping semantics are inferred from this condition.
- `$AAE8–$AAED`: extract old player state bit 3 from `$0486+X` into `$001D`.
- `$AAEF–$AAF4`: `ASL` movement ID `$0459+X` into an 8-bit index. The high bit is discarded; lookup uses the first byte of metadata at pointer + 2×(movement & `$7F`).
- `$AAF6–$AAFD`: `(flags & $04) << 1`, AND old state bit 3, XOR old bit 3; this clears bit 3 only when metadata flag 2 is set.
- `$AAFF–$AB07`: new player state is `(flags & $89) | scratch_Z | computed_bit3`. Scratch pointer `$002C/$002D`, `$001C` and `$001D` are mutated as in the source.
- `$AB0A`: return. **No position, speed, sprite, collision, ball physics, or animation execution.**

Implementation: `src/classic/OriginalMovementTransition.js:stepOriginalMovementState`. Inputs are synthetic 2 KiB RAM and player index 0–11. Out-of-audited-range metadata reads are **rejected**, rather than silently interpreted as source ROM bytes. `tableVariant=0` is `$AAC8`, `1` is `$AAC3`.

## B. `$AB2A–$AB51`: pending ball-shot priority branch

- Source literal `tbl_AC4D` at `$AC4D–$AC64` contains 24 bytes: `00 00 40 40 80 84 80 00 00 C0 80 00 00 80 80 48 48 50 50 40 C0 C0 84 00`.
- `$AB2A`: pending ball shot/action type `$0485` negative ⇒ return unchanged.
- `$AB2F–$AB39`: index the literal table by pending type (source masks `$7F` after the sign gate), store its low nibble in scratch `$001C`.
- `$AB3C–$AB49`: compare low nibble of current ball state `$0492` with pending type's low-nibble priority; when current <= pending, write pending numeric type to player movement `$0459+X`.
- `$AB4C–$AB51`: always consume a nonnegative pending type by setting `$0485=$FF`, including when its priority was insufficient.

Implementation: `stepOriginalBallShotPriority` is **only the post-weather branch**. The enclosing `$AB0B–$AB29` checks weather effect `$0466 & $7F == 1`, calls **unimplemented external routine `$9856`**, and can set electric-ball timer `$0525`. This is not claimed as a full `$AB0B` port. A pending type >=24 is rejected to avoid interpreting unaudited following ROM bytes as part of the table.

## Verification and limitations

`tests/original-movement-transition.test.js`: 16 synthetic-RAM tests cover exact table bytes, both metadata variants, bit 3 clearing, Z-high/Z-low boundary, 8-bit ASL wrapping, pending type negative/accepted/tied/rejected, low-nibble masking, rejection of out-of-audited table reads, invalid input, and composition with existing action arbitration. Chromium standalone/ESM and mobile-emulated browser research panel tests exercise both new functions. **These are branch/fixture tests, not original-game equivalence tests.** No original binary, sprite atlas, original RAM traces, or reference frame captures are included.

### Follow-on requirements

1. Audit source `$AB0B–$AB29` dependency `$9856` and the rest of the ball-action execution path, including `$AD41` movement-ID dispatch and table `$B097`.
2. Map the actual per-frame order of controller, arbitration, movement-state, ball action, physics, sprite selection, and audio updates; do not chain them speculatively as if it were an NES frame.
3. Compare original RAM state at `$001C/$001D/$002C/$002D/$0386/$0399/$0459/$0485/$0486/$0492` against lawful original execution traces before claiming parity.
4. Complete the authentic CHR/PPU/palette/OAM/metasprite/animation pipeline using verified, legally held original assets; neutral CHR tile inspector is not a sprite renderer.
