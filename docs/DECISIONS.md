# Decisions

1. **Mode isolation:** no verified original rules or assets = no playable Classic button. Launch provisional match as `enhanced-dev`, never claim Classic parity.
2. **Headless deterministic loop:** seeded LCG and simple state object tested in Node. Physics constants provisional until source verified.
3. **Canvas 2D:** simple independent, newly constructed geometry; no visual recreation claims.
4. **No copying upstream protected assets:** original graphics/audio binaries excluded pending permissions.
5. **No npm runtime dependencies:** Node built-in test runner plus zero-dependency build; standalone HTML ships for offline access.
6. **Dual output:** modular web source is authoritative; standalone build is generated, never hand edited. Browser test exercised generated single file.
7. **Original source access:** upstream GitHub pinned via connector SHA; shell DNS prevented local clone. Do not pretend full audit or independent upstream build.
8. **Networking intentionally deferred:** no server/online features before Classic parity and offline engine maturity.

9. **Input tape before parity:** introduce deterministic `enhanced-dev` recording/checkpoint infrastructure as a prerequisite for future reference parity, without claiming any NES gameplay was ported. Capture the exact quantized frame used in the simulation.
10. **Strict replay version gates:** incompatible mode/rules, malformed inputs and overlong files are rejected; no attempt to replay a Classic tape with provisional rules.
11. **Source identifier quarantine:** original RAM/screen/game-script numeric identifiers reside in `src/classic/OriginalStateIds.js` as immutable data only. They must not drive Classic behavior until corresponding ASM transitions are traced and tested.
12. **Protect maintained documentation:** archived the one-shot iteration-1 documentation generator in `tools/archive/` instead of deleting it, because rerunning it would overwrite iteration-2 source mapping and QA evidence.
13. **Port exact small routines first:** `OriginalInput.js` and `OriginalRandom.js` implement source-derived byte-level operations without coupling them to provisional Enhanced controls or claiming original gameplay parity.
14. **Source-faithful input with bounded browser guard:** the NES's stable serial-read loop can run indefinitely on unstable hardware; the browser implementation rejects after eight attempts without mutating controller state. This intentional deviation is explicitly tested.
15. **Research UI is not Classic Mode:** the four-channel controller lab uses toggle buttons and an arbitrary RNG seed, and never enables original gameplay or changes the Enhanced simulation.
16. **Do not regenerate Enhanced golden replay:** `enhanced-dev-0.1` rules and committed checksum fixture remain unchanged in this iteration.

## Iteration 4 decision — preserve original match-state boundaries

Port only source-local field Start/pause and foul/cutscene byte logic, with original audio-command arguments recorded as data; expose kickoff gate as a non-mutating decision until all original transition side effects and callees are traced. Keep Classic Mode locked and Enhanced development rules unchanged. Reject invalid jump-table indices in native JS instead of emulating unsafe original table overreads. See `ORIGINAL_FIELD_TRACE.md`.

## Iteration 5 decision — preserve unported call boundaries

The original goal subscreen executes twelve external routines before its timer branch, and further calls for cutscene completion/brightness. Implement the observable direct RAM operations as a **two-stage isolated research projection**, not as a falsely complete Classic frame. Log every external call as unexecuted; test all byte masks and thresholds. Keep the original player action dispatch routing as documentation until the target routines are actually decoded.

## Iteration 6 — source-local controller→action chain without gameplay claims

The original `$C07A` trampoline target `$FAEE–$FBA8` was traced and ported as an independent, byte-stateful buffer helper. The bank04 `$B8AB` entry gate and post-helper action selector are exposed as **separate** APIs so callers must acknowledge the helper boundary. No action IDs are translated to football move names before tracing their executors. The kickoff `$B4B2` schedule reports calls but does not run `$B850/$B4C9`. The browser lab can chain helper outputs into action selection, but the playable Enhanced simulation and replay are unchanged and Classic remains disabled. This is intentionally a partial native source conversion, not a hidden emulator or a full original match.

## Iteration 7 — preserve source quirks; never silently reinterpret action indices

The `$B850` port deliberately writes matched A/B action IDs to `$0479 + controllerSlot` (not ball owner) and preserves the `$B8A8` three-byte table's index-3 read of the following `$B8AB` opcode byte `$86`. These observations are directly supported by pinned bank04 disassembly, although their runtime significance is unverified. The `$B4C9` alternate is reported as unexecuted. This avoids inventing a corrected gameplay behavior before reference parity.

The standalone builder parses flattened JavaScript with `node:vm` before emission after a duplicate top-level identifier was caught during browser testing. A full ESM bundler remains a future architectural improvement.

## Iteration 8 decision — compose source-local branches without unlocking Classic

The new `OriginalAlternateController.js` executes `$B4C9` on synthetic RAM and composes the existing `$FAEE` helper and `$B850` branch. Retain the older preview's limited behavior for regression compatibility, while exposing the full dispatcher and an independent research UI. Preserve `$B83D` table overlap, `$B8A8` index3 opcode read, and raw action IDs without guessed football semantics. No original game loop or Classic Mode unlock before reference parity.

## Iteration 9: bounded original metadata, isolated arbitration

Keep the bank06 `$AA14–$AAAB` port isolated from the Enhanced development match and Classic frame loop until the actual movement executor and original NES RAM references are available. Preserve overlapping `$AC69/$AC87` metadata reads within the audited source region; reject out-of-audited-range IDs rather than synthesizing bytes. Document that state-checkpoint replay verification is not input-tape authenticity (KI-025); do not change the current golden fixture or rules version silently.
