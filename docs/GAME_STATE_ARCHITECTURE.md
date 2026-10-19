# Game state and simulation

`createMatch(seed)` returns a plain JavaScript object with `schemaVersion`, `mode=enhanced-dev`, `rulesVersion`, deterministic `rng` and tick count, phase, remaining ticks, two score entries, 12 players, ball position/velocity/owner, selection/interaction cooldowns, kickoff and status indicators, and held-button history.

`stepMatch(state, inputFrame)` advances one logical 1/60-second step. Input edges are computed once per tick; pause gates updates; kickoff delays active play; players and CPU move; actions resolve; owner follows its player or free ball advances; collision/goal and new possession checks run; game ends when remaining ticks reach zero. `stateSnapshot` exposes deterministic replay data to tests. The renderer consumes but never mutates the simulation.

These semantics are only for the **enhanced-dev** ruleset. A genuine Classic state/rules implementation must be separately verified against original memory, integer precision and update order. Never equate arbitrary JavaScript game-state transitions with verified NES state transitions.

## Deterministic replay boundary

`src/core/Replay.js` normalizes every physical input to a canonical frame **before** simulation and appends the frame to a versioned tape. Checkpoints hash the entire simulation state every 120 input frames. Playback creates a new match from the recorded seed, advances exactly one input per step and rejects any checksum drift. Browser replay playback runs on the same fixed-step accumulator; it does not read live gameplay controls. UI Pause during replay only suspends playback. The replay is `enhanced-dev`-only and cannot be loaded into Classic. The canonical frame adapter is a prerequisite for future original input trace comparisons, not itself a port.

## Iteration 4 — original dispatcher/field fragment

The original fixed bank's four screen and thirteen match-subscreen jump table addresses are now represented as immutable lookup metadata in `src/classic/OriginalScreenDispatch.js`. The field Start pause toggle and foul/cutscene helper are isolated in `OriginalFieldLogic.js`; the kickoff branch is **classification only**, not a transition. Original handler dispatch, field frame update and full kickoff initialization are not yet integrated; the playable development engine remains independent.

## Iteration 7 isolated research RAM

`OriginalPossessionControl.js` uses a synthetic `Uint8Array(0x800)` CPU RAM fixture to exercise only `$B850` direct writes. It is intentionally not the Enhanced match state and not a complete original NES RAM/frame simulation. Its script-bit0 wrapper blocks unported `$B4C9` rather than returning a simulated success.
