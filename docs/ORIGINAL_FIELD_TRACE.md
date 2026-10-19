# Original NES match dispatch, Start/pause and kickoff/foul trace — iteration 4

**Upstream:** `cyneprepou4uk/NES-Games-Disassembly`, pinned commit `df2c8e55e7f13e5792482527db9e7c9e4a84c6e1`.

**Source:** [`Kunio-kun no Nekketsu Soccer League/bank_FF.asm`](https://github.com/cyneprepou4uk/NES-Games-Disassembly/blob/df2c8e55e7f13e5792482527db9e7c9e4a84c6e1/Kunio-kun%20no%20Nekketsu%20Soccer%20League/bank_FF.asm). Excerpts were retrieved from this exact revision using the connected GitHub reader. This document maps **individual source branches**, not a complete running NES game.

## Verified dispatch (data tables, no handlers ported)

| Source lines | NES CPU | Source observation | Native implementation |
|---|---|---|---|
| `1138–1151` | `$C492–$C4A9` | Screen ID `$0058` indexes four little-endian addresses in `tbl_C4A3`; entries 00 `$C4AB`, 01 `$C4B1`, 02 `$C4B7`, 03 `$C4BD` | `OriginalScreenDispatch.js:resolveOriginalScreenHandler` |
| `1223–1245` | `$C50E–$C537` | Match subscreen `$0059` indexes thirteen entries in `tbl_C51F`; 00 `$C539`, 01 `$C57D`, 02 `$C615`, 03 `$C699`, 04 `$C71E`, 05 `$C77D`, 06 `$C7D0`, 07 `$C743`, 08 `$C77D`, 09 `$C75D`, 0A `$C777`, 0B `$C743`, 0C `$C77D` | `OriginalScreenDispatch.js:resolveOriginalMatchSubscreenHandler` |

The native lookup throws on invalid indices. The original 6502 code indexes the table without a range check; this deliberate safe-host divergence prevents inventing behavior for invalid values. Resolving an address is **not** executing the original handler.

## Original field subscreen 02: Start toggles pause

| Source lines | NES CPU | Verified behavior |
|---|---|---|
| `1351–1357` | `$C615–$C620` | Read **new-press** byte `$0008`, mask `$10` (Start on logical channel 1). When set, XOR `$005C` (`ram_game_script`) with `$80`. |
| `1358–1361` | `$C622–$C62A` | If bit 7 was cleared by the XOR, load `$055A` (`ram_music_id`) and pass it to `sub_C2E4` as an audio command. |
| `1362–1369` | `$C62D–$C63A` | If bit 7 was set, clear `$06FD` and call `sub_C2E4` with accumulator values `$00` then `$2D`; then branch to paused/active frame processing. |

`src/classic/OriginalFieldLogic.js:stepOriginalFieldPause` ports the **pause bit and direct byte writes** and returns the observed audio-command *arguments*. It does **not** implement `sub_C2E4`, audio playback, `sub_DE47`, `sub_CAEE`, `loc_CB5F` or the full field loop. The original field handler reads channel 1 (`ram_btn_press`, not channel 2), so the browser lab only feeds `pressed[0]` to this routine. A held Start does not repeatedly toggle pause because `$EDCD` produces new-press edges. This is the first directly traced football-control action, but pass/shoot/dribble/tackle mappings are **not yet verified**.

## Original foul helper (`sub_C87B`) and kickoff branch

| Source lines | NES CPU | Verified behavior |
|---|---|---|
| `1675–1692` | `$C87B–$C89B` | If game-script bit `$20` is clear, return. Otherwise if ball-state `$0492` has either bit `$80` or `$40`, clear game-script bit `$20`, formation variant `$055B` and cutscene timer `$05E2`. If neither ball flag is set, increment the timer modulo 256; clear those fields only when the **new** timer's bit 7 is set. |
| `1288–1300` | `$C58F–$C5B0` | Kickoff processing calls unported subroutines and tests brightness flag `$05B2` sign bit; the source branch continues only when brightness bit `$80` is set. |
| `1301–1311` | `$C5B3–$C5C7` | If foul bit `$20` is set, call `sub_C87B`. If that call clears the foul bit, skip the ball-state bit `$40` test and enter the advance branch. If the foul remains, stay in kickoff. With no foul, ball-state bit `$40` holds kickoff. |
| `1312–1318+` | `$C5C9–$C5D5+` | When gate opens, the original increments screen subtype `$0059`, zeros game script `$005C` and both team possession flags `$052A–$052B`, then calls **unported** `sub_D01F` and `sub_D0D5` and continues extensive rendering/status initialization. |

`stepOriginalFoulFlag` ports **all directly observed byte operations and branching within `$C87B–$C89B`**. `evaluateOriginalKickoffGate` only reports the **gate decision**, using **post-`sub_C2AD`** state and an explicit `foulWasPending` flag to preserve the bypass of the ball check. It deliberately does **not** mutate subtype or call missing transition handlers; doing so would leave an inconsistent partial Classic state. The research UI allows a user to inspect both branches but never starts a Classic match.

## Tests and scope

- `tests/original-field-logic.test.js`: exact 4+13 dispatch entries, bounds checking, Start press/release/held behavior including controller edge integration, 256 Start mask combinations, full 256-value timer sign/wrap matrix, ball flags, pending foul clearing, brightness and kickoff branches.
- `tools/browser_smoke.py`: real Chromium standalone lab interactions, Start-to-pause/unpause, foul flag and kickoff branch, plus existing development match/replay/mobile tests.
- `tools/browser_modular_smoke.py`: real ESM module loading, Start-to-pause, development match.
- **No original NES runtime RAM/frame trace is available.** These tests check reconstructed assembly operations and integration, not original-game frame parity. No CHR/DPCM/ROM assets have been copied. Existing Enhanced development rules and replay golden fixture are unchanged.

## Next reverse-engineering targets

Trace `sub_C2AD` (kickoff precondition), `sub_D01F`/`sub_D0D5` (transition), the rest of field handler `$C63A+`, original player/ball movement and gameplay action masks in banks 00–06. Obtain lawful original frame-indexed controller/RAM snapshots to validate each port, including `ram_game_script` and screen subtype transitions. **Classic Mode remains locked** until a full match and original feature parity can be established.

## Iteration 5 follow-up

Goal subscreen 03 (`$C699`) now has an isolated, source-derived direct-write research module for timer, camera, skip and brightness branches. See `docs/ORIGINAL_GOAL_CUTSCENE_TRACE.md`. The kickoff transition itself (`$C5C9+`) remains unported; the banked dispatch target of `$C2AD` is now traced to bank04 `$B4B2`, but that routine is not decoded.
