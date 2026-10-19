# Iteration 14 — original fixed-bank PPU palette queue and OAM DMA

**Pinned source:** `cyneprepou4uk/NES-Games-Disassembly`, commit `df2c8e55e7f13e5792482527db9e7c9e4a84c6e1`, `bank_FF.asm` blob `d9b5307a83f022c17deb0cec82b2bea2249c5484`. The source file was read directly at the pinned commit and the exact machine-code sequences below were compared to the user's verified original ROM. No ROM bytes are distributed.

| Source | Pinned source lines | ROM offset | Native implementation |
|---|---|---|---|
| `$EE5A–$EE64` (`sub_EE5A`) | `bank_FF.asm:8465–8470` (around `$EE5A`) | `$1EE6A–$1EE74` | `stepOriginalOamDma` |
| `$F05F–$F0B3` (palette continuation of PPU update routine) | `bank_FF.asm:8785–8824` | `$1F06F–$1F0C3` | `stepOriginalPaletteQueue` |

`$EE5A`: `LDA #0; STA $2003; LDA #2; STA $4014; RTS`. This DMA copies exactly CPU RAM `$0200–$02FF` into 256 OAM bytes, starting at OAM index 0. This does **not** identify or compose the game's sprites.

`$F05F`: the sign bit of RAM `$06D9` gates the transfer. If clear, `(RAM[$004C] & $FB) | RAM[$0692]` is written to `$004C` and `$2000`; `$0692` is cleared; a read of `$2002` resets the `$2006` address latch; `$06D9/$06DA` are written to `$2006`. The byte count is read from `$06DB`; `$21` or above branches to `$F070` indefinitely (the research port throws instead of hanging). Otherwise bytes from `$06DC+X` are written to `$2007`, using 8-bit `DEY`/`BNE`: a count of zero writes **256 bytes**. The routine sets `$06D9=$FF`. When its original high address byte was `$3F`, it additionally writes `$3F00` then `$0000` to `$2006`, restoring PPU address `$0000`.

The native transfer state implements the NES palette mirror indices `$3F10/$3F14/$3F18/$3F1C` and `$3F20+` modulo 32, and the PPUCTRL bit-2 address increment (1 or 32). It records nonpalette `$2007` writes but does **not** reconstruct CHR/nametable VRAM, PPU cycles, sprite evaluation, RGB output, or actual NES frame order. Palette bytes are 6-bit **indices**, not original screenshot colors. The browser lab uses synthetic CPU RAM only.

**Verification:** `tests/original-ppu-transfers.test.js` (9 tests), including exact original ROM opcodes, OAM DMA, PPU register sequence, 32-byte queue, 256-byte zero-count behavior, palette mirroring, increment-by-32, skip gate, invalid count and input rejection. `tools/browser_ppu_transfers_smoke.py` covers standalone/modular/mobile Chromium. Existing private CHR and development replay regressions were rerun. **No emulator-derived PPU/OAM/RAM reference frame was available, so runtime parity is NOT verified.**

**Remaining blockers:** Original RAM producers for `$06D9–$06FB` and `$0200–$02FF`; original OAM sprite/animation builder and 8×8/8×16 mode; source PPU palette values during real gameplay; NMI timing; actual PPU screenshots and reference RAM traces. Classic Mode remains disabled. Source attribution and owner ROM access do not establish permission to redistribute original assets.
