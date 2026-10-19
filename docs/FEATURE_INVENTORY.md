# Feature inventory

## Original — source-confirmed at identifier/comment level, **behavior unverified**

- Field-player and goalkeeper object indices; ball and weather object indices (`bank_ram.inc:1-8`).
- Input hold/press buffers (`bank_ram.inc:13-25`).
- Game-script state labels including kickoff, normal play, goal, out, corner/goal kick, penalty and pause (`bank_ram.inc:174-182`).
- Screen/scene index variables (`bank_ram.inc:164-172`).
- CHR graphic data, DPCM data and three input movie files (`SOURCE_MANIFEST.json`).

All original team names/counts, content, button combos, menus, tournament topology and mechanics still require verification. No claim of a verified NES mode is made.

## Native development match — independently implemented

5 outfield + goalkeeper per side; movement, sprint, shooting, passes, tackles, pursuer AI, goalie movement and clearing, possession, scoring, basic rebounds, scoreboard/clock, restart, pause, remappable keyboard/gamepad/touch and Canvas rendering. These are provisional *Enhanced development* behaviors, not converted NES rules.

## Development milestone 2 additions (not Classic)

- Deterministic, versioned input-frame recorder, replay playback, mode/rules compatibility validation and periodic state drift checkpoints.
- Download/import of JSON replay files in the browser and headless replay verifier CLI.
- Source-confirmed RAM/screen/game-script numeric IDs stored separately as immutable Classic metadata; no Classic simulation logic yet.

## Iteration 7 verified source-local fragment

Bank04 `$B850–$B8AA` direct RAM writes are implemented in an isolated research module with 16 tests. The alternate `$B4C9` four-slot path and actual action executor remain unported. No Classic gameplay or NES runtime parity is claimed.

## Iteration 8 addition

The previously unported `$B4C9` four-slot controller path now executes source-local native JavaScript, including `$FAEE` buffer calls, 7×4 pointers and 12-entry raw action tables, in a synthetic research RAM fixture. The earlier limited `$B850` preview still reports its own alternate path as unexecuted, while the new full dispatcher executes both branches. **No Classic football action executor, full frame, original NES parity or original sprites/audio are implemented.**

## Iteration 9 verified source inventory addition

Bank06 `$AA14/$AA19–$AAAB` selects metadata table `$AC87/$AC69`, conditionally forces action `$06` under weather/surface/skill flags, gates pending action against state, compares metadata priorities, and transfers accepted action ID `$0479` into movement ID `$0459`, clearing the pending action to `$FF`. This **does not establish any English football action names or execute actual movement**. See `ORIGINAL_ACTION_ARBITRATION_TRACE.md`.
