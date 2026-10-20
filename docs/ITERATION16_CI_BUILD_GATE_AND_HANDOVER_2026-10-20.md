# Iteration 16 — explicit CI build gate and handover (2026-10-20)

Canonical repository: saeedsai/MagicFootballv2. This increment is on branch `migration/iteration16-ci-build-artifacts-20261020`, based on main `56a1d8da3813059c2621020c99f21781d53f1f4c`. The branch's code/CI commit is `89b940184ad13a26678a1a9465739be2fc302294`. Do not describe it as merged until main moves.

## Implemented and source traceability

- `tests/ci-build-artifacts.test.mjs`: archived recovery-package test with exact Git blob SHA `a73e0f3fbeac22cf060f0585304f954d8971cbd7`. Invokes the public builder, verifies the published root `index.html` Git blob stays `d051badfcb2311c0b6b66af09c9d87d32e04b534`, confirms generated modular and standalone files, and checks `classicParity: NOT VERIFIED` and `privateOriginalChrIncluded: false`.
- `.github/workflows/bootstrap-ci.yml`: explicitly runs `npm run build` and Python syntax-checks the already migrated weather browser smoke script, while retaining Node tests, source checks, migration audit and import audit.
- These changes are guardrails for the public modular build; they do not reconstruct any additional NES instructions, graphics, audio, or original gameplay frames.

## Verified remote results

On commit `89b940184ad13a26678a1a9465739be2fc302294`:
- Node workflow `39367630598`: SUCCESS, 275 tests / 269 pass / 0 fail / 6 skip. Explicit `npm run build` SUCCESS; `python -m py_compile tools/browser_weather_sprites_smoke.py` SUCCESS; both source audits SUCCESS.
- Java workflow `39367630702`: SUCCESS.
- No authorized private ROM was supplied to remote CI; six skips are not passed tests.

## Remaining migration and fidelity blockers

- Complete original Iteration 15 archive SHA-256: `aa0b2e06caf54d3073d900439e7f015abacf754b407f805b3e0bc43cfa1e1f63`. It was not mounted in this run. Available partial recovery ZIPs do not establish the full 185-file migration.
- The original 185-file tracked tree and 17-commit ancestry are not fully restored. Source audit reports 22/22 JS modules but explicitly reports `complete: false`.
- Classic Mode stays disabled. The provisional enhanced football match is not NES gameplay parity; frame-level reference comparisons remain absent.
- No original ROM/CHR/PRG/DPCM/audio or derived protected character artwork was published.
- Direct `main` fast-forward and pull-request creation were blocked by connected-app safety checks. The branch is the published increment; do not claim a main merge.

## Next actions

1. Integrate the tested branch into main using a non-forced fast-forward after verifying main's latest SHA.
2. Recover and hash-reconcile the remaining safe original files against the archived 185-file manifest; do not treat generated screenshots, logs or private assets as required public source.
3. Restore historical Git ancestry only without overwriting current canonical history; keep a manifest if a safe ancestry merge is unavailable.
4. After migration, implement original metasprite/OAM, palette, animation, physics and AI with source-address traceability and frame-level NES reference tests before enabling Classic Mode.
