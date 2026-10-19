# Iteration 13 — original MMC3 CHR register writes and source-mapped pattern tables

**Pinned disassembly:** `cyneprepou4uk/NES-Games-Disassembly`, commit `df2c8e55e7f13e5792482527db9e7c9e4a84c6e1`; `bank_FF.asm` Git blob `d9b5307a83f022c17deb0cec82b2bea2249c5484`. The source text for the fixed bank was retrieved and inspected directly; owner-supplied ROM PRG bytes were independently checked at the exact offsets below.

| Fixed-bank routine | Assembly lines (pinned) | ROM offset | Exact effect (ordered writes) |
|---|---|---|---|
| `sub_EE7D` `$EE7D–$EE99` | `bank_FF.asm:8499–8510` | `$1EE8D–$1EEA9` | `LDA #0; STA $004E; STA $8000; LDA $05BC; STA $8001; LDA #1; STA $004E; STA $8000; LDA $05BD; STA $8001; RTS` |
| `sub_EE9A` `$EE9A–$EED2` | `bank_FF.asm:8514–8536` | `$1EEAA–$1EEE2` | For R2–R5, write register ID to `$004E`, write same ID to `$8000`, then write byte from `$05B8–$05BB` to `$8001`, then RTS. |

**Native JS:** `src/classic/OriginalChrBanking.js`. `stepOriginalBackgroundChrBanks` and `stepOriginalSpriteChrBanks` reproduce the CPU write order, shadow `$004E`, and source RAM reads. `writeOriginalMmc3Chr` models the relevant Mapper 4 `$8000/$8001` CHR register effects. Registers R0/R1 are 2 KiB aligned (`value & $FE`); R2–R5 are 1 KiB. The 8 PPU slots each cover 1 KiB. For CHR mode 0: `[R0,R0+1,R1,R1+1,R2,R3,R4,R5]`; mode 1 swaps the two halves: `[R2,R3,R4,R5,R0,R0+1,R1,R1+1]`. Original 128 KiB CHR contains 128 physical 1 KiB banks, so address resolution mirrors by 128. Writes to PRG registers R6/R7 are explicitly rejected rather than silently simulated. This mapper subset does **not** implement PRG register effects, IRQ, nametable mirroring, scanline timing or PPU rendering.

**Direct binary verification:** `tests/original-chr-banking.test.js` compares the full byte sequences for both routines against the owner-supplied authenticated ROM (fixed-bank CPU `$C000` corresponds to ROM file offset `$1C010`). No original ROM bytes are committed or bundled. The test also verifies synthetic RAM write order, register alignment, bank mirroring, inversion, and exact PPU-tile-to-CHR index mapping. The browser test `tools/browser_chr_banking_smoke.py` loads the private source-verified 128 KiB CHR, sets synthetic RAM, applies both source routines, and checks actual displayed pixels against independently decoded original CHR bytes on desktop/modular/mobile Chromium.

**New research UI:** Graphics Inspector → **Original MMC3 CHR bank switch**. Its 256-tile PPU pattern-table preview shows original CHR tile data *selected by the native source-derived bank writes*, in neutral grayscale index colors. User inputs are **synthetic RAM fixtures**, not verified NES runtime values. A tile atlas is **not** a player face, assembled metasprite, OAM frame, authentic palette, or animation.

## Still unverified / P0

1. The original game-frame schedule that writes RAM `$05B8–$05BD` and calls `$EE7D/$EE9A`, including PPUCTRL sprite/background table selection and CHR inversion state at each frame.
2. Exact palette RAM (`$3F00–$3F1F`) writes and OAM/metasprite construction, sprite 8×8/8×16 mode, flips, per-character animation data and scanline rendering.
3. Emulator-derived legal original frame/RAM/PPU snapshots and native-to-original pixel comparison; original gameplay/graphics parity is **NOT verified**.
4. All other Mapper 4 registers, PRG mapping, IRQ, sound, input timing, game modes and original physics/AI remain outside this slice.

## Reproduce

```bash
KUNIO_ORIGINAL_ZIP='/path/to/your/original.zip' npm test
npm run check && npm run build
python tools/browser_chr_banking_smoke.py  # private local/original.chr required
```

The private ROM and CHR are excluded from Git and the public distributable. This research is not a Classic Mode release.
