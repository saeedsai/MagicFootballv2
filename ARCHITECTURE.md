# Iteration 10: binary asset pipeline

External user-held iNES/CHR → `extractCHR` (read-only copy) → 16-byte/8×8 bitplane `decodeTile` → palette-independent indices → optional neutral inspection `colorizeTile` → Canvas 256-tile sheet. This is **build/research-side binary decode**, not an NES emulator or a complete classic art pipeline. Future PPU palette, CHR banking, original OAM/metasprite composition and animation systems must be separately verified against assembly and frame captures. Source: `src/classic/NesBinaryAssets.js`, details `docs/BINARY_TO_JS_PIPELINE.md`.

# Architecture

```
Input adapters (keyboard / pad / touch)
                   │ normalized InputFrame
                   ▼
   stepMatch(state, input)  ← deterministic seeded LCG
       │ state (plain JS)        (enhanced-dev only)
       ▼
 Canvas renderer (read-only)  ←─ HTML UI, controls and overlays
```

The app is ESM, framework-free. `src/core/Match.js` owns provisional game state, movement, ball, keeper logic, timers and goals. `src/input/InputManager.js` owns remapping, storage, active key/pointer/button sets and compositing multiple physical sources. `src/rendering/Renderer.js` owns Canvas art and HUD. `src/main.js` wires UI, input, fixed-step accumulator and rendering. The loop clamps accumulated wall-clock time and runs at most six simulation steps per paint, dropping excess accumulated time when backgrounded; this is a latency/stability decision for the provisional game, **not verified NES timing parity**. Classic must have its own verified update order and replay guarantees.

Future boundaries: immutable `classic/` source-derived rules, versioned content and asset import, customizable `enhanced/`, content schemas, data migration, offline replays, competition engine, server-authoritative networking. None of these future modules is falsely advertised as operational.


Iteration 2: `Replay.js` now wraps input consumption and records the **canonical** frame before `stepMatch`. It can reconstruct a match from the seed and validate periodic and final state checksums. The UI supports JSON export/import and replay playback at the same fixed rate. `classic/OriginalStateIds.js` contains verified upstream numeric identifiers but no active Classic rules. See `docs/REPLAY_FORMAT.md`.

## Iteration 3 source-derived Classic foundation

The isolated `src/classic/OriginalInput.js` implements stable serial reads and controller rising edges; `src/classic/OriginalRandom.js` implements the original two-byte random update. An interactive research lab drives these routines with explicit synthetic serial samples and an arbitrary seed. Neither module feeds the Enhanced match or claims original gameplay parity. The original main-loop call order and known intentional browser safety deviation are documented in `docs/ORIGINAL_CONTROLLER_TRACE.md`.

## Iteration 4 — source-derived field-state research

Two isolated modules, `src/classic/OriginalScreenDispatch.js` and `src/classic/OriginalFieldLogic.js`, expose verified original jump-table addresses, Start-to-pause state bytes and audio command arguments, and the foul helper and kickoff branch. They are not wired into the provisional `stepMatch` engine; the browser research lab explicitly displays their state without pretending to run Classic. Full original dispatch, audio, player/ball/AI and downstream transition are unported.

## Iteration 5 — goal cutscene research module

Added `src/classic/OriginalGoalCutscene.js` with a two-stage byte-level API for original goal subscreen 03. The browser lab supplies explicit post-external-call state, and external dependencies are logged, not executed. No coupling to Enhanced match or replay code; no emulator or ROM assets. See `docs/ORIGINAL_GOAL_CUTSCENE_TRACE.md`.

## Iteration 6 — source-derived controller buffer and action branch boundaries

`src/classic/OriginalActionBuffers.js` is an isolated, per-controller-slot state machine for `$FAEE–$FBA8`; `src/classic/OriginalPlayerAction.js` provides the pre-helper `$B8AB` entry gate and **separate** post-helper `$B8C3–$B9E2` player-action/angle selector. The original `$C07A` trampoline routes to `$FAEE`. The browser research UI can step the buffer state and then evaluate the action selector. This separation is deliberate: original frame ordering, `$B4C9/$B850` callers and downstream action execution are not reconstructed. `src/core/Match.js` and `Replay.js` remain entirely separate, with no Classic mode toggled on. Source trace: `docs/ORIGINAL_PLAYER_ACTION_TRACE.md`.

## Iteration 7 — byte-addressed source-local possession controller

`OriginalPossessionControl.js` operates on an isolated `Uint8Array(0x800)` CPU RAM fixture. It models `$B4B2`'s script-bit0 dispatch and direct `$B850` writes without executing assembly, using an emulator, or touching the Enhanced match. For script bit0 clear it reports four unexecuted `$B4C9` calls, not a guessed approximation. `src/main.js` exposes only a research panel. The standalone combiner now parses the flattened JS with `node:vm` before writing to catch duplicate top-level declarations (found and fixed this iteration). Original frame integration is blocked until the remaining controller branch, action executor and reference traces are verified.

## Iteration 8 — complete source-local controller selector, isolated from gameplay

`src/classic/OriginalAlternateController.js` operates on `Uint8Array(0x800)` and composes existing native `OriginalActionBuffers.js` and `OriginalPossessionControl.js`. It reproduces `$B4B2` dispatch, `$B4C9` per-slot gates and scratch bytes, pointer/table-driven raw action selection, and optional angle writes without interpreting any football action. Source tables are embedded as numeric bytes, including the `$B83D` overlap into `$B844`; there is no NES CPU interpreter or ROM. `src/main.js` offers an independent research form, not a game mode. `src/core/Match.js`, `Replay.js`, renderer and input adapters are unchanged. See `docs/ORIGINAL_ALTERNATE_CONTROLLER_TRACE.md`. The next architecture dependency is a source-verified action executor and frame scheduler with independent NES reference fixtures.

## Iteration 9 isolated Classic arbitration boundary

`OriginalAlternateController.js` writes a raw pending action byte (`$0479`); the new `OriginalActionArbitration.js` reads that byte plus player state and original metadata tables, optionally updates movement ID (`$0459`), and clears the pending action (`$FF`). Both operate on explicitly passed `Uint8Array(0x800)` synthetic fixtures. No global singleton, emulator, ROM, or import from `src/core/Match.js` is used. The research lab may chain the two ports on a cloned RAM snapshot. **There is still no source-backed movement executor, Classic game frame or original NES reference parity.**
