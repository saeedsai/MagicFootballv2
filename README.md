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

The previous local Iteration 15 source archive contains the full modular source tree, tests, plans, reports, and local Git history. This GitHub repository was initially empty. The browser build and the core handover/report records are being migrated here first through the connected GitHub API because direct Git transport is unavailable in the current runtime. **The modular tree and its historical commits must be imported before claiming the full source migration is complete.** See [MIGRATION_STATUS_CURRENT.md](MIGRATION_STATUS_CURRENT.md) for the latest verified 22/22 source count on the restoration branch (not yet merged into main) and [MIGRATION_STATUS.md](MIGRATION_STATUS.md) for the historical migration log.

Do not commit original ROM/CHR/audio, extracted proprietary assets, secrets, or private reference fixtures. Do not claim 100% parity from passing synthetic tests.

## Immediate priorities

1. Migrate full original native-JavaScript modules, unit tests, traceability matrix and documents without losing previous history.
2. Reconstruct and independently verify original player OAM/metasprite production, attributes, palettes, and animation.
3. Establish reference frame-by-frame NES comparisons.
4. Only then expand original movement, ball physics, AI, audio, modes and menu parity; defer Enhanced Mode work.

Project documentation is tracked in [MIGRATION_STATUS.md](MIGRATION_STATUS.md) and [HANDOVER.md](HANDOVER.md).

## Incremental native Java reference port

`java/src/org/magicfootball/classic/OriginalRandom.java` mirrors the source-derived `$EE35` routine in the recovered `src/classic/OriginalRandom.js`. Its dependency-free Java test enumerates all 65,536 two-byte states, without emulating a CPU. Build and run with `javac -d build/java java/src/org/magicfootball/classic/OriginalRandom.java java/test/org/magicfootball/classic/OriginalRandomTest.java` and `java -cp build/java org.magicfootball.classic.OriginalRandomTest`. This does **not** demonstrate full original-game equivalence. Java is a reference / future platform port; HTML5 JavaScript remains the web client. Original art is not bundled: authenticated locally imported graphics can be processed without being published.


## 2026-10-19 verified archive source import (feature branch)

Archive `Kunio_Soccer_Iteration_15_Source.zip` independently passed SHA-256 `aa0b2e06caf54d3073d900439e7f015abacf754b407f805b3e0bc43cfa1e1f63` and ZIP CRC checks. Local original Git HEAD: `274195e506b818fdd0957df980284aa08482735e` (185 tracked paths, 17 original commits). The source restoration branch `source/iteration15-archive-bulk-20261019` points to `b0af6cf644381af524c413da018b369e8ab176d0`, based on canonical main `c0b8bc7b4bb159e5bd36fbaf84486c3275247396`. GitHub's remote tree contains all **22/22 original src/ JS files with Git blob hashes identical to local baseline**. 106/185 archived tracked paths match byte-for-byte, four tracked paths differ intentionally (README.md, index.html standalone, package.json bootstrap, .gitignore), and 75 tracked paths are still missing, largely dist outputs, test logs and screenshots, plus several tools and documents. Therefore the complete 185-file migration and 17-commit history are **NOT complete**. The main branch has NOT been advanced; ref-update and pull-request creation were blocked by connected-app safety checks. No protected original ROM/CHR/PRG/DPCM/audio or derived original art was published.

GitHub Actions on the restoration branch: Node 266 total / 260 pass / 0 fail / 6 skipped; Java original-routine CI passed. Local full archived source: 243 total / 237 pass / 0 fail / 6 skipped; `npm run check` and `npm run build` passed locally, but remote build is **not** claimed (archived `tools/build.mjs` still missing). The six skipped Node tests need a locally authorized original ROM. Classic Mode remains disabled and no original NES frame-level parity is claimed. Prioritize safely merging the branch into main, restoring missing tooling and traceability, then addressing original game fidelity.
