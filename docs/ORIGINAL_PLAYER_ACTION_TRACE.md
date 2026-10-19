# Original NES player-action and controller-buffer trace — iteration 6

**Pinned upstream:** `cyneprepou4uk/NES-Games-Disassembly`, commit `df2c8e55e7f13e5792482527db9e7c9e4a84c6e1`. Source files `Kunio-kun no Nekketsu Soccer League/bank_04.asm` and `bank_FF.asm`. Inspected via the connected GitHub reader, not inferred from game descriptions. This is a *native JavaScript byte-level port of selected source-local routines*, not a complete NES game and not verified original-runtime parity.

## Call graph and source boundaries

| Upstream source and lines | CPU range | Original behavior | Native code | Scope |
|---|---|---|---|---|
| `bank_04.asm:12653–12666` | `$B4B2–$B4C8` | If game-script `$005C` bit 0 is set, call `$B850`; otherwise call `$B4C9` with X=0,1,2,3 | `OriginalPlayerAction.js:scheduleOriginalKickoffControllerCalls` | **Call schedule only**; none executed |
| `bank_04.asm:13337–13349` | `$B8AB–$B8BE` | Selected player `$0568[X]`, control position `$0650[player]`, existing action `$0479[player]` sign gates | `evaluateOriginalPlayerActionEntry` | Gate only, before helper |
| `bank_04.asm:13350–13498` | `$B8C0–$B9E2` | Call `$C07A`, read controller bytes and select player action/angle from state and lookup tables | `stepOriginalPlayerActionPostHelper` | Branches **after helper**; not action execution |
| `bank_04.asm:13501–13565` | `$B9E5–$BA1A` | 16 angle values and action tables | `ORIGINAL_ACTION_ANGLES`, `ORIGINAL_ACTION_LOOKUP` | Relevant tables copied as numeric constants only |
| `bank_FF.asm:300–303` | `$C07A` | Trampoline jumps to `$FAEE` | Source call graph | Trampoline not emulated |
| `bank_FF.asm:10532–10589` | `$FAEE–$FB5C` | Transform held A/B into action-delay/edge buffers | `OriginalActionBuffers.js:stepOriginalActionBuffers` | Complete local byte writes for this region |
| `bank_FF.asm:10590–10630` | `$FB5F–$FBAA` | Directional new-press/repeat buffers; thresholds `$02` and `$06` | Same function | Complete local byte writes for this region |

The original call path is `bank04 $B8AB` → entry gate → `JSR $C07A` → `JMP $FAEE` → `JSR $FB5F` → return → `$B8C3` snapshot/branch selection. The port exposes these pieces separately so callers cannot mistake a synthetic snapshot for a real NES frame. The kickoff scheduler `$B4B2` calls `$B4C9` or `$B850`, whose full behaviors are **not** implemented.

## NES button masks and action codes

`OriginalInput.js` previously verified NES A=`$80`, B=`$40`, Start=`$10`, Select=`$20`, Up=`$08`, Down=`$04`, Left=`$02`, Right=`$01`. At `$B913–$B919`, **when player-state bit 7 is set**, the action branch uses new-press byte `$0008[X]` (not held state). The `$B94F` and `$B96B` sign tests prioritize A then B: A selects raw action byte `$04`, B selects raw action byte `$05`. At `$B91C–$B94C`, **when player-state bit 7 is clear**, auxiliary `$0570[X]` can select `$08/$09/$0A` or `$04/$05` depending on its bits and direction/facing. These bytes are **internal action IDs**, not yet verified names such as shoot/pass. They must not be remapped to English football actions without tracing the downstream action executor.

The fallback at `$B9AD–$B9CD` sets `$0479[player]` to `$01`, `$06`, `$0D` or `$07` based on `$057C[X]` low nibble and held direction. The `$B9D0` branch sets `$04B0[player]` from the 16-byte `$B9E5` table. When player-state bit 7 is set and neither A nor B is newly pressed, the existing action is **preserved** and only the new angle is updated. Immediate action branches leave the angle unchanged. The state-class index can be 0–3 in this routine; those classes use the same `$BA05` lookup. The alternate `$BA10` table is present in source but is not reachable from the inspected class selection logic.

## Fixed-bank action buffer semantics (`$FAEE–$FBA8`)

`$FAEE` starts with `held >> 1` and keeps state in `$056C/$0570/$0574/$0578`. For A or B held alone, the first frame records a pending byte, the second increments a delay counter to 1, and the third (counter >= 2) emits a transformed new-press in `$0570`. A+B simultaneously held takes a special branch that ORs `$80` into the transformed held byte and computes its edge immediately. Releasing pending A/B triggers a final edge calculation; the following no-action frame clears the buffers. The counter wraps as a byte.

`$FB5F` resets `$057C` every invocation. A new direction press from `$0008[X] & $0F` is compared against the previous direction `$0580[X]`; an overlapping direction within `<6` idle-frame increments produces a quick-repeat flag in `$057C`. Otherwise it updates `$0580` low nibble and resets timer `$0584`. Without directional presses, the timer increments and saturates at `$7F`. These semantics were ported from the observed byte operations, not inferred from button labels.

**Important distinction:** `$0570` and `$057C` are not simply the raw A/B or direction buttons. A conversion that directly maps keyboard/gamepad A/B to action IDs would skip this original timing layer and break fidelity. The new research lab can step `$FAEE`, observe buffers, then feed the resulting `$0570/$057C` values into the `$B8AB` post-helper branch.

## Testing and explicit gaps

`tests/original-action-buffers.test.js` contains 13 tests covering A/B delay, simultaneous press, release, counter wrap, quick-direction repeat, all 256 timer inputs, 15×15 directional overlap combinations, deterministic 4000-frame tape and buffer→action integration. `tests/original-player-action.test.js` contains 14 tests covering entry gate, tables, A/B priority, player-state sign, horizontal facing, fallback codes, 256 state classes, input edges, and deterministic snapshots. Chromium desktop/mobile-emulated and modular ESM smoke tests exercise both research panels; the existing Enhanced match and replay are regression-tested unchanged.

**Not verified:** real original-game RAM/frame equivalence; semantics of internal action IDs; per-player assignments, ball physics, move animation or execution; full `$B4C9/$B850` calls; entire NES gameplay loop, graphics/audio or menus. Source-local tests alone are not a valid Classic parity gate. Original ROM/CHR/DPCM binaries and source copies are not distributed with this build.

## Iteration 7 follow-up: `$B850` now source-locally ported

`$B4B2` script-bit0 branch invokes `$B850` (now implemented as isolated direct RAM operations in `OriginalPossessionControl.js`). This **does not** complete `$B4C9`, the four-slot alternative, or any actual football action. Note source-specific matched action writes at controller slot, not ball-owner index, and the three-byte angle table's index3 read into opcode `$86`. See `ORIGINAL_POSSESSION_CONTROL_TRACE.md`.
