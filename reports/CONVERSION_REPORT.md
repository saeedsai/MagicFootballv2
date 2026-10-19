# Conversion report — iteration 6 (v0.6.0)

**Partial original-source reverse engineering only.** New source-local native JavaScript ports: fixed-bank `$FAEE–$FBA8` A/B action-delay and directional quick-repeat buffers, and bank04 `$B8AB–$B9E2` selected-player gate/action/angle selector. The `$B4B2` kickoff controller call schedule is recorded without running its callees. Previous isolated source-derived components remain: controller input, RNG, screen dispatch metadata, field pause/foul/kickoff gate and goal cutscene byte branches. No emulator, 6502 interpreter, original ROM, CHR or DPCM data is shipped. **Full original Classic conversion is incomplete and original runtime parity has not been tested.** See `../docs/ORIGINAL_PLAYER_ACTION_TRACE.md`.

## Iteration 7

The source-local bank04 `$B850` script-bit0 controller branch now executes byte-level RAM operations in `OriginalPossessionControl.js`. This is not the original action executor or a Classic gameplay loop; `$B4C9` remains blocked. 131 Node tests and browser QA passed. See `docs/ORIGINAL_POSSESSION_CONTROL_TRACE.md`.
