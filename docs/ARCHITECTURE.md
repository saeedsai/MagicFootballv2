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

## Iteration 3 Classic primitives (isolated)

`src/classic/OriginalInput.js` is a pure JS serial-bit decoder plus stable-sample/rising-edge state updater. `src/classic/OriginalRandom.js` is a two-byte bitwise RNG update. Both are independent of `src/core/Match.js`, `src/core/Replay.js`, and `src/input/InputManager.js`; they do **not** turn on Classic Mode. The browser home screen exposes a separate controller research lab driven by synthetic serial-port samples; it cannot affect a development match or replay. The bundler now includes these two modules in modular and offline standalone outputs. See `ORIGINAL_CONTROLLER_TRACE.md` for source addresses and parity limitations.

## Iteration 4 isolated Classic source routines

`src/classic/OriginalScreenDispatch.js` exposes the four screen and thirteen match-subscreen jump table targets as immutable numeric lookup metadata. `src/classic/OriginalFieldLogic.js` ports only the source-local Start pause toggle and foul/cutscene timer branch, and exposes a **non-mutating kickoff gate classifier**; original audio commands are data, not playback. The interactive lab is separate from `src/core/Match.js` and from the versioned development replay. The standalone builder concatenates the two new modules after `OriginalInput.js`; no emulator, ROM, CHR or DPCM is packaged. See `ORIGINAL_FIELD_TRACE.md`.

## Iteration 5 — goal cutscene direct-write boundary

`src/classic/OriginalGoalCutscene.js` is a standalone source-derived byte-state projection. It separates `$C699` pre-call tile masking from `$C6C5–$C71B` post-call camera/timer/skip/brightness decisions, explicitly logging external routines as unexecuted. Browser UI creates synthetic research snapshots; it never drives `src/core/Match.js`, the original NES or a Classic match. The build includes the module in ESM and generated standalone output.

## Iteration 7 isolated RAM fixture

`OriginalPossessionControl.js` reads/writes a synthetic 2 KiB `Uint8Array` for `$B850` only; it never mutates `src/core/Match.js` state. The UI constructs a fresh byte image on every click. The `$B4C9` alternate is intentionally blocked; no original frame loop or action executor is claimed. `tools/build.mjs` now parses flattened standalone JavaScript to fail fast on duplicate bindings.

## Iteration 9: Classic action arbitration boundary

`OriginalAlternateController.js` produces numeric action IDs in `$0479` on a synthetic RAM fixture. `OriginalActionArbitration.js` consumes that pending ID using source metadata and may write a numeric movement ID to `$0459`; the UI chains these two modules only on a cloned RAM snapshot. The movement/animation/physics executor and Classic frame coordinator are still unimplemented; the Enhanced match is unchanged.
