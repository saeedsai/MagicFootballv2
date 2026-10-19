# Archive recovery checkpoint — 2026-10-19

The source ZIP `Kunio_Soccer_Iteration_15_Source.zip` was located in the user's Library (30,803,938 bytes). Materialization reported `/mnt/data/files/Kunio_Soccer_Iteration_15_Source.zip`, but independent SHA-256 verification and ZIP inspection could not proceed because the container service returned `ServiceUnavailableError`. The expected digest is `aa0b2e06caf54d3073d900439e7f015abacf754b407f805b3e0bc43cfa1e1f63`, but it was **not measured in this run**.

This increment adds the previously tested archive integrity preflight and nine synthetic regression tests, without importing the remaining original source modules. The canonical main branch had 11 of 22 original JS modules before this increment; the full 185-file source and 17-commit local history remain missing. Classic Mode is disabled and original gameplay frame parity is not established. No original ROM, CHR, PRG, DPCM, audio or derived character art is included.

Next: restore container execution; verify archive SHA-256; run `node tools/archive-preflight.mjs <zip>`; inspect candidate paths and local tracked inventory; import approved source and tests without overwriting concurrent remote work; verify Git blob hashes and CI.
