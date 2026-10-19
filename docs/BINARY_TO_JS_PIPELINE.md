# Iteration 12 update — authenticated original cartridge

The owner-provided NES2 ZIP is now verified against pinned source PRG **and** CHR. The old issue "no actual original binary available" is resolved for private analysis. See [`ORIGINAL_ROM_PROVENANCE.md`](ORIGINAL_ROM_PROVENANCE.md), bank SHA manifest and `tools/import_original_rom.mjs`. The verified graphics inspector automatically displays all original tiles when a user-specific private build exists, while original game sprites, actual PPU palettes, animations and frame-level parity remain unimplemented. Public source builds do not distribute original binary assets. The earlier iteration-10 discussion below remains as historical design/limitations rather than the current binary-access status.

---

# Binary-first original NES reconstruction — Iteration 10

## Governing objective and explicit separation

The final **Classic Mode** must be the authentic original Kunio-kun no Nekketsu Soccer League, reconstructed from game data and 6502 code in native JavaScript (no emulation in runtime). The existing `enhanced-dev-0.1` development match is an **unverified test harness**, not a shortcut to Classic Mode, and may not be labeled as converted NES gameplay. Enhanced Mode feature expansion remains subordinate to complete Classic implementation/parity.

## Source provenance

Pinned upstream repository `cyneprepou4uk/NES-Games-Disassembly`, commit `df2c8e55e7f13e5792482527db9e7c9e4a84c6e1`, target `Kunio-kun no Nekketsu Soccer League`. Source listing confirms `CHR_ROM.chr`, **131072 bytes**, Git blob SHA `e62db8eeaa386d65ff741847bd8d01cecdada00f`. Original ROM **SHA1 `EDF933EEE8D6B99B7743367EDA089B9850CE51EC`** is stated in upstream `assemble.sh`. No actual upstream CHR bytes, game ROM, DPCM, copyrighted graphics or music are bundled or reproduced in the build. Only metadata/expected hashes are retained.

## Implemented *binary* extraction and verification

The native source `src/classic/NesBinaryAssets.js`:

1. Recognizes the `4E 45 53 1A` iNES magic and reads a 16-byte **iNES 1** header; rejects NES 2.0 instead of making a wrong claim, recognizes optional 512-byte trainer, extracts PRG/CHR region boundaries and checks truncation.
2. Accepts an external CHR file as a 16-byte-aligned byte array, or extracts CHR from user-provided iNES ROM. Zero-CHR cartridges are rejected because there is no CHR-ROM data to inspect.
3. Converts each 16-byte planar 2bpp tile to **exact** 64 two-bit pixel indices (high bit of each plane byte is leftmost). A raw index palette is not original NES RGB; the inspector uses **four non-original neutral inspection tones** to distinguish indices 0, 1, 2, and 3.
4. Displays any 256-tile page and selected tile in a responsive Canvas lab (`index.html`, `src/main.js`). The pinned upstream CHR byte-count represents 8192 tiles in 16 × 8 KiB CHR banks, 32 pages of 256 tiles each.
5. The locally selected CHR can be compared with the pinned Git blob SHA-1 (header `blob <size>\0` + content). When WebCrypto SHA-1 is absent, the UI explicitly labels source identity as **unverified**. `tools/audit_nes_binary.mjs` computes this digest and, for ROMs, compares the entire file SHA-1 against the original build reference.
6. Import processing is local browser memory only; the binary is **not uploaded, stored in preferences or bundled** with the exported HTML/source. The audit CLI only reads and prints hashes, byte counts and boundary metadata.

## Not yet converted (critical; no claims of sprite fidelity)

- Original CHR tile-to-**character metasprite** maps, object arrangements, original OAM sprite ordering and priority, 8×16 sprite modes, PPU bank switching, nametables/background composition, CHR animation mapping, HUD graphics, and any compression/decompression routines.
- The original **NES palette indices**, their emphasis mappings, per-attribute palette selection and transparency semantics. Neutral inspection swatches are **not** the original game's colors.
- Original sprite poses, all faces/expressions/hair/animations, frame timing, original sound/music/DPCM; none are rendered by the development match.
- All 6502 routine/data-level coverage, deterministic runtime frame scheduler, original gameplay/menu/team/tournament completeness and NES-reference parity. A source-local branch implementation is not independent runtime equivalence.

## Next evidence-first milestones

1. Obtain lawful original CHR/ROM bytes for analysis and a lawfully runnable NES reference environment; compare Git blob/SHA-1, then examine real tile pages. Do **not** publish copied assets without distribution rights.
2. Trace `bank_FF.asm` PPU and mapper/CHR bank switching, `bank_00..06` tile/OAM/metasprite layout routines and name tables. Create address-level source-to-asset mapping records and known original frame examples.
3. Implement original metasprite assembly, palette decoding, frame selection and image-comparison fixtures, without inventing or redrawing original faces.
4. Trace the original `$0459` movement-ID handlers and per-frame update order, turn exact movement/action/ball/AI effects into native JavaScript, and compare frame-indexed RAM state with an original reference run.
5. Implement every original mode/team/player, audio and gameplay action. Only enable Classic Mode once end-to-end parity is objectively verified.

## QA evidence

`tests/nes-binary-assets.test.js` checks header/trainer/truncation/CHR-RAM/NES2 rejection, tile bit order and both planes, color-index mapping, tile boundaries and original-size arithmetic. `tools/browser_graphics_smoke.py` imports **synthetic** CHR in standalone and modular Chromium, tests exact decoded pixel colors, page navigation, malformed-file rejection, and asserts zero JavaScript errors. These tests establish decoder correctness on constructed inputs, **not fidelity of original faces/sprites**. There is no lawful input binary in this release for the latter.
