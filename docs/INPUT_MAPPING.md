# Input and UI mapping — development ruleset only

| Logical action | Default key | Standard gamepad | Touch button |
|---|---|---|---|
| Up/down/left/right | Arrow keys | Left analog / D-pad | Virtual analog joystick |
| Shoot | Z | 0 | SHOOT |
| Pass | X | 1 | PASS |
| Tackle/contest | C | 2 | TACKLE |
| Sprint | Left Shift | 5 | SPRINT |
| Switch field player | Space | 3 | On-screen switch button below field |
| Pause | Esc | 9 | On-screen pause |

Simultaneous touch pointers map to four independently tracked contact IDs; keyboard and gamepad frames compose to one normalized vector and button set. The touch and keyboard mappings persist via localStorage, if permitted. The four touch buttons form a permutation of the four mapped actions; assigning an occupied action swaps two buttons. Controller axes use a 0.22 dead zone by default; gamepad actions are remapped using indexed buttons 0–16 in Settings.

**Known gap:** The original NES buttons, context-sensitive combos, hold windows and extra touch actions are not yet reconstructed. The development controls must not be shipped as Classic controls without source/reference verification. Chromium two-contact emulation confirmed joystick + shoot and release; physical multi-touch device and gamepad QA remain pending.


## Replay capture (iteration 2)

The `InputManager` composes keyboard, gamepad and touch controls as before. `src/core/Replay.js` canonicalizes this frame (axis clamping/6-decimal quantization) and passes the same frame to `stepMatch` that is stored in the input tape. Pause and Switch UI buttons also emit recorded press/release edges. The 60 Hz playback ignores live match controls; UI Pause suspends the tape player. No NES controller masks or hold timing have been inferred from this feature.

## Source-derived original NES input mapping (iteration 4)

**Verified local field handler only:** original match subscreen 02, `bank_FF.asm` `$C615–$C63A`, checks new-press channel 1 (`ram_btn_press` at `$0008`) mask `$10` (NES Start) to XOR pause bit `$80` in `ram_game_script` (`$005C`). This does **not** establish original pass/shoot/jump/dribble/tackle mappings. It is implemented in isolated `src/classic/OriginalFieldLogic.js`, not mapped onto the provisional Enhanced development controls. See `docs/ORIGINAL_FIELD_TRACE.md`.

## Iteration 7 original script-bit0 controller branch

Original `$B850` reads **new-press** A `$80`, B `$40` from the matched controller slot, then new-press Start/Select `$30` from channel zero, and otherwise held bits 2–3 for an angle lookup. The numeric action outputs `$09/$0A` have no verified football names and are **not** the provisional Enhanced input mapping. See `ORIGINAL_POSSESSION_CONTROL_TRACE.md`.
