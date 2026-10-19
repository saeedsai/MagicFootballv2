# Verified original asset inventory (2026-10-19, iteration 12)

Authenticated user-uploaded ROM matches pinned original `assemble.sh` SHA-1 after header normalization; see [`ORIGINAL_ROM_PROVENANCE.md`](ORIGINAL_ROM_PROVENANCE.md).

- **PRG-ROM:** 8 × 16,384 bytes = 131,072, matched by normalized complete-ROM SHA-1; routine-to-feature inventory still incomplete.
- **CHR-ROM:** 16 × 8,192 bytes = 131,072, or **8,192 original 8×8 2bpp patterns**, matched by exact Git blob `e62db8eeaa386d65ff741847bd8d01cecdada00f`.
- **Original sprite palette/OAM/metasprite and animation data:** contained in ROM as code/data as appropriate, but **not extracted/identified or verified** yet. The neutral-colored tile atlas is **not** a faithful colored sprite image.
- **Original DPCM/audio:** upstream separately lists `DPCM.bin` (385 B); audio parsing/playback parity not implemented.
- Original `CHR_ROM.chr`, complete ROM and private converted CHR are **not tracked** in Git. The private, owner-specific standalone offline browser build includes verified CHR only; no raw ROM/PRG is bundled.

Bank-level SHA-256, byte offsets and tile ranges: [`ORIGINAL_ROM_BANK_MANIFEST.json`](ORIGINAL_ROM_BANK_MANIFEST.json).

Iteration 15: Five weather-effect OAM data tables (`$DA46/$DA52/$DA5E/$DA6A/$DA76`) are read directly from the private authenticated PRG in browser memory. No original PRG/CHR/audio data is embedded in public JS or the public standalone HTML. Weather OAM entries are not complete player character sprites.
