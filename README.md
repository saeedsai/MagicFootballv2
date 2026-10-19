# MagicFootball v2 — Kunio Soccer Original-NES Reconstruction

**Status: research / incomplete Classic Mode.** This project is a native JavaScript reconstruction of *Kunio-kun no Nekketsu Soccer League*, not an emulator. The immediate goal is byte-traceable fidelity to the original NES program and CHR graphics. The provisional football match is a separate engineering testbed and **must not be mistaken for Classic Mode**.

## Current browser build

Open [index.html](index.html) directly or through a local static server. This self-contained Iteration 15 browser build includes the existing development match, original-controller/action research labs, ROM-import and weather-OAM research. Original gameplay parity has **not** been established. Source graphics, music, ROM/CHR/PRG, and other protected data are **not** included. Import an authorized original NES file locally where prompted.

## Source provenance and scope

- Reference disassembly pinned at `df2c8e55e7f13e5792482527db9e7c9e4a84c6e1`: https://github.com/cyneprepou4uk/NES-Games-Disassembly/tree/df2c8e55e7f13e5792482527db9e7c9e4a84c6e1/Kunio-kun%20no%20Nekketsu%20Soccer%20League
- Last verified local source baseline: Iteration 15, `274195e506b818fdd0957df980284aa08482735e`.
- Binary SHA-1 after reference-header normalization: `edf933eee8d6b99b7743367eda089b9850ce51ec`.
- Original-source graphics blob Git SHA-1: `e62db8eeaa386d65ff741847bd8d01cecdada00f`.
- Only isolated original routines have source-derived JavaScript implementations. **Classic Mode is disabled** until complete behavior and reference-frame tests are in place.

## Migration status

The previous local Iteration 15 source archive contains the full modular source tree, tests, plans, reports, and local Git history. This GitHub repository was initially empty. The browser build and the core handover/report records are being migrated here first through the connected GitHub API because direct Git transport is unavailable in the current runtime. **The modular tree and its historical commits must be imported before claiming the full source migration is complete.** See [MIGRATION_STATUS.md](MIGRATION_STATUS.md).

Do not commit original ROM/CHR/audio, extracted proprietary assets, secrets, or private reference fixtures. Do not claim 100% parity from passing synthetic tests.

## Immediate priorities

1. Migrate full original native-JavaScript modules, unit tests, traceability matrix and documents without losing previous history.
2. Reconstruct and independently verify original player OAM/metasprite production, attributes, palettes, and animation.
3. Establish reference frame-by-frame NES comparisons.
4. Only then expand original movement, ball physics, AI, audio, modes and menu parity; defer Enhanced Mode work.

Project documentation is tracked in [MIGRATION_STATUS.md](MIGRATION_STATUS.md) and [HANDOVER.md](HANDOVER.md).
