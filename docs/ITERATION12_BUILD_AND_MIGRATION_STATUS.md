# Iteration 12 — public build command and migration gate (2026-10-20)

Canonical repository: `saeedsai/MagicFootballv2`. This record applies to development branch `migration/iteration12-build-command-20261020` and is not a claim of integration into `main`.

## Source and provenance

The latest `main` inspected at the start of the iteration was `f76b74657743a8e513283222c93bd5f270ca5042`. Its recursive tree contained 152 tracked blobs, including 22 original JavaScript modules, the restored `modular.html`, and `tools/build.mjs`. The original standalone `index.html` remains pinned to Git blob `d051badfcb2311c0b6b66af09c9d87d32e04b534`.

The complete `Kunio_Soccer_Iteration_15_Source.zip` was not accessible in this runtime. A previously generated recovery ZIP was accessible, but is **not** a substitute for the original 185-file archive. The required archive SHA-256 is `aa0b2e06caf54d3073d900439e7f015abacf754b407f805b3e0bc43cfa1e1f63`, and its original local HEAD was `274195e506b818fdd0957df980284aa08482735e`.

**Migration remains incomplete:** 152 remote tracked files is not 152/185 exact archived matches. The 17 original Git commit objects and ancestry have not been restored.

## Published increment

`package.json` now exposes `npm run build`, invoking the existing public-only `tools/build.mjs`. Git blob: `f8e8f9c40a633a9b90344b66e9e4ad218fe6a5f4`. This is a development convenience, not a gameplay feature or NES parity improvement.

The development branch commit is `5551d644e6d1e4fe03dd33785b548bd1cec03d13`. GitHub Actions reported success for Node workflow run 39345110415 and Java workflow run 39345110438. The existing CI workflow does not explicitly run `npm run build` as a separate step; its Node test suite includes a modular-build integrity test.

## Outstanding work

Restore the remaining safe original files from a verified archive, add exact archived tracked-tree reconciliation, and preserve original Git ancestry if feasible. Private ROM/CHR/PRG/DPCM/audio and extracted original character art must not be published. Classic Mode stays **disabled** until authentic frame-level reference parity is demonstrated; the provisional football match remains separate.
