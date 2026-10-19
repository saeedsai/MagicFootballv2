# Iteration 15 archive preflight — 2026-10-19

**Status: source migration BLOCKED / NOT COMPLETE.** The exact Kunio_Soccer_Iteration_15_Source.zip was not accessible in this execution's mounted files or Library search. No modular source files or historical Git objects were imported.

## Implemented recovery gate

The new tools/archive-preflight.mjs is a read-only ZIP integrity and copyright preflight. It verifies the exact SHA-256 aa0b2e06caf54d3073d900439e7f015abacf754b407f805b3e0bc43cfa1e1f63 before inspection, validates ZIP32 directory records, entry CRCs and decompressed sizes, rejects path traversal, absolute paths, symlinks, duplicates, encryption and unsupported compression, and limits uncompressed sizes. It lists candidate file paths, SHA-256 and Git blob SHA-1 values without extracting or publishing anything. Private originals, archives and Git internals are excluded; graphics/audio require explicit rights review.

A ZIP inventory cannot establish which files were Git-tracked or restore history. Every report intentionally retains trackedFileCountVerified=false, historicalGitObjectsImported=false and migrationComplete=false. The historical baseline has 185 Git-tracked files, but this archive has not been examined in the current remote run.

## Future authorized recovery

Run the following on a computer with the exact source ZIP and Node 22:

    node tools/archive-preflight.mjs /path/to/Kunio_Soccer_Iteration_15_Source.zip > /tmp/iteration15-preflight.json

Review the manifest, compare against the original local git ls-files inventory, inspect any assets requiring rights clearance, then use a new branch based on the latest canonical main Git tree to import only approved files. Verify every remote Git blob SHA. Preserve the historical Git object graph separately; never force-push main or overwrite new remote work. Run the complete original test/check/build/browser suite before marking migration complete.

## Test evidence boundaries

Nine new synthetic ZIP preflight tests cover digest pinning, hashes, path and rights classification, traversal, duplicates, CRC, symlinks and size limits. The existing CI runs npm test and npm run check. CI pass/fail must be read from the actual GitHub Actions run; this document does not claim it in advance. The original 243-test modular suite, ROM-dependent tests, original graphics and gameplay parity, and phone/PC smoke tests were **not run** against this incomplete remote checkout.

Classic Mode remains disabled; the provisional browser football match is not an original-game conversion.
