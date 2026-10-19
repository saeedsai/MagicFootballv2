# Source integrity audit — 2026-10-19

Canonical base commit: `15b48d42b2efd8d80710fb6914719267e47ec3ca`.

The repository contains 22 of 22 archived JavaScript modules under `src/`.
`tools/import-audit.mjs` now verifies all 22 exact Git blob identities.
`tests/import-audit.test.mjs` asserts the expected module count and that
the overall migration remains incomplete.

The original archive contains 185 tracked files and 17 historical commits.
The complete tracked-file migration, original Git history, and source-derived
frame-level gameplay verification are **not complete**.

No original copyrighted binary or graphical asset was added in this increment.
Classic Mode remains disabled. The enhanced match is only a provisional testbed.

Next: restore missing safe development tooling and original modular entrypoint
without replacing the existing standalone HTML; verify generated output and CI.
