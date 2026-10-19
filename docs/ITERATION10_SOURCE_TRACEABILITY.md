# Iteration 10 source traceability

| Artifact | Provenance | Integrity | Meaning |
| --- | --- | --- | --- |
| `modular.html` | Original Iteration 15 `index.html`, local HEAD `274195e506b818fdd0957df980284aa08482735e` | Git blob `ad09958a166c4ae5802b9f58c23fdf88e77d9e4e` | Original browser ES-module entrypoint |
| `index.html` | Existing published Iteration 15 standalone | Git blob `d051badfcb2311c0b6b66af09c9d87d32e04b534` | Preserved deployment; not overwritten |
| `tools/build.mjs` | New adaptation of archived `tools/build.mjs` | Local synthetic build and syntax test | Public-only modular/standalone builder; not original byte match |
| `tests/modular-build-integrity.test.mjs` | New deterministic regression test | Local pass | Verifies output bytes and root immutability |

All 22 archived JavaScript source modules remain present on the restoration branch with previously verified original Git blob identities. This is NOT proof of original NES gameplay parity. Private ROM-dependent reference tests remain skipped until authorized local fixtures are available. Source migration and historical Git ancestry remain incomplete.
