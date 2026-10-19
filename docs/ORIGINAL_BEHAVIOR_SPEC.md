# Original behavior specification — discovery draft

**No original gameplay behavior has been sufficiently traced to assert gameplay parity.** Identified original RAM script states (`$005C`) are source annotations, not implementations or validated transitions. The original appears to distinguish at least normal play (`$00`), kickoff (`$01`), foul (`$20`), time-up (`$40`), goal (`$42`), out (`$44`), corner/goal kick (`$48`), post-match penalty (`$60`) and pause (`$80`); these values appear in disassembly comments and still require logic and reference-run verification.

Formal target: for each confirmed original feature, define exact entry conditions, memory variables, frame order, input mask, integer quantization, state transitions, AI branch conditions, sprite frame and audio event and parity fixture. Do not use the 60 Hz development ruleset as a source of those numbers.

## 2026-10-19 clarification

The original disassembly annotates `ram_game_script` ($005C) with `NORMAL=00`, `KICKOFF=01`, `FOUL=20`, `TIME_EXPIRED=40`, `GOAL=42`, `OUT=44`, `CORNER_OR_GOAL_KICK=48`, `PENALTIES=60`, `PAUSE=80`. Screen number at $0058 and subtype at $0059 have additional labels. These values are now **documented** in `src/classic/OriginalStateIds.js` but no original transition/dispatch behavior has been ported or verified. A state name in a comment is not proof of original timing or rules. The replay infrastructure tests only `enhanced-dev` state.

## Iteration 3: verified original fixed-bank primitives

`sub_EDCD` ($EDCD–$EE05) accepts a stable reread of four serial input bytes and calculates `press = current & (current XOR previous)` while updating `hold = current`; `sub_EE06` ($EE06–$EE27) reads eight bits from each of two hardware ports into four logical bytes; `sub_EE35` ($EE35–$EE59) updates a two-byte RNG using bit-1 XOR feedback and chained right rotations. These **specific arithmetic/bit operations** are now implemented in `src/classic/` with independent unit tests. The original frame loop calls RNG at $C48C before input at $C48F. Details and intentional browser retry limit in `ORIGINAL_CONTROLLER_TRACE.md`. No original gameplay action mapping, game-state transitions or frame-level reference parity has been established.

## Iteration 4: first traced football-control and match-state branches

The field handler for match subscreen 02 (`$C615`) checks new-press controller byte `$0008` for Start bit `$10`, toggles game-script pause bit `$80` and passes original audio-command bytes to an unported dispatcher. The foul helper (`$C87B`) clears pending bit `$20` when ball-state bits `$C0` are set or the incremented cutscene timer's sign bit becomes set. The kickoff handler (`$C5B3`) uses these conditions to choose the branch that advances to field subscreen. Only the local pause/foul byte operations and kickoff gate decision have been ported; the actual transition side effects and remaining match code are not. See `docs/ORIGINAL_FIELD_TRACE.md`.

## Iteration 5: goal-subscreen isolated byte behavior

The original goal subscreen 03 (`$C699`) masks `$05AB` tile flags, uses timer `$05E2` thresholds `$20/$40/$FF`, a new Start/Select press mask `$30` to skip, camera retargeting from ball owner `$04D6`, and brightness `$05B2` bits `$C0` to reset script/timer after unported calls. `OriginalGoalCutscene.js` implements only these direct byte writes at explicit source boundaries, with automated and browser branch tests. It is not integrated into Classic gameplay; see `docs/ORIGINAL_GOAL_CUTSCENE_TRACE.md`.

## Iteration 7 — source-local possession-control byte behavior

Bank04 `$B850` (called by `$B4B2` when game-script bit0 is set) scans four controller slots for the ball owner, then checks A/B new-press bytes, channel-zero Start/Select, or held direction bits. Matched A/B writes raw action `$09/$0A` at `$0479+controllerSlot`; no-press writes an angle at `$04B0+ballOwner`. The angle lookup's index3 crosses its three-byte table into opcode `$86`. Without a match (or with both control-position sign bits set), a frame-counter low-five-bits zero condition writes a flag and action at ball-owner index. This is source-derived, not original runtime parity. See `ORIGINAL_POSSESSION_CONTROL_TRACE.md`.

### Iteration 9 — bank06 action arbitration (source-local only)
Pinned bank_06.asm `$AA14–$AAAB` and metadata `$AC65–$AD40` were inspected and ported into `src/classic/OriginalActionArbitration.js`. It can consume a pending `$0479` action and conditionally replace `$0459` movement on synthetic RAM, preserving weather and state gates and metadata-table overlap. See `docs/ORIGINAL_ACTION_ARBITRATION_TRACE.md`. This **does not** execute original movement, ball physics, animations or a Classic frame; original NES runtime parity remains blocked.
