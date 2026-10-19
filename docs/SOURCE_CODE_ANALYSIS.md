# Source code audit — partial, pinned df2c8e55e7f13e5792482527db9e7c9e4a84c6e1

**Inspected source:** https://github.com/cyneprepou4uk/NES-Games-Disassembly/tree/df2c8e55e7f13e5792482527db9e7c9e4a84c6e1/Kunio-kun%20no%20Nekketsu%20Soccer%20League

## Observations verified from original source excerpts

- `bank_00.asm` to `bank_06.asm`, `bank_FF.asm` are present; their opening source declares 6502 segments, includes `copy_bank_ram.inc` and `copy_bank_val.inc`, uses `$8000` for banks 00–06 and `$C000` for FF, and exports dispatch labels / trampoline jumps. **Their full routines were not read.**
- `bank_ram.inc:1-8`: comments explicitly map object slots `00–09` to field players, `0A–0B` to keepers and `0C` to the ball, plus `0D` for weather and `0E–12` for minimap/numeric markers.
- `bank_ram.inc:13-25`: RAM keyboard/controller buffers named `ram_btn_hold = $0004` and `ram_btn_press = $0008`. NES input masks/timing have not been reconstructed.
- `bank_val.inc:8-10`: `con_gk_id = $0A`, `con_ball_id = $0C`; `con_prg_bank = $00` annotated todo. This agrees with the RAM object-slot notes.
- `bank_ram.inc:164-182`: screen ID at `$0058`, screen subtype at `$0059`, game script at `$005C`. Source comments enumerate normal play, kickoff, foul, time-up, goal, out, corner/goal kick, shootout and pause states. This verifies *names and documented values only*, not state-transition or rule equivalence.
- `preparations.lua:1-39`: lists the eight ASM banks plus RAM/constants includes and describes temporary `copy_` files needed by `ca65`.
- `assemble.sh`: declares target 262,160-byte ROM size and expected SHA-1 `EDF933EEE8D6B99B7743367EDA089B9850CE51EC`, and invokes common scripts from `../_scripts`. The ROM was **not built** and this expected hash was **not independently checked**.
- `_misc` contains `.cdl` coverage data, Russian-language alternative disassembly, debug log archive and three `.fm2` movie recordings (`goal3_misc`, `goal3_playoff`, `goal3_walkthrough`). **These were inventoried, not replayed.**

## Inventory and uncertainty

`SOURCE_MANIFEST.json` records 21 confirmed top-level files and six misc files, their GitHub-reported sizes, and available blob hashes. The original ROM/disassembly binary files are **not included** in this project archive. We checked the upstream root listing for an explicit license file; no license grant was established. Avoid assuming that publicly readable source equals a redistribution license.

The following analyses remain **NOT ANALYZED**: boot and initialization; NMI/IRQ, frame scheduling and bank transitions; buttons and combo masks; menus, teams, rosters and AI; movement/shot/ball physics; keepers; collision and goal rules; animation/CHR layout/palettes; audio/sequencer/DPCM; 100% routine and data coverage. The first development match uses new provisional constants and behavior.

## Next reverse engineering method

Acquire a lawful local source/reference fixture. Enumerate each ASM label and `.byte`/`.word` table with file:line:address and cross-references; identify hardware-only vs game-logic sites; decode RAM writers/readers; trace per-frame controller and match update order; generate actual comparable input-frame fixtures using upstream movies; then port individual verified functions behind immutable Classic configuration with test evidence. Never claim complete routine coverage from this initial file inventory.

## Iteration 2 — pinned-source reinspection (2026-10-19)

Re-fetched `bank_ram.inc:1-35,160-185` and `bank_val.inc:1-14` at SHA `df2c8e55e7f13e5792482527db9e7c9e4a84c6e1` using the GitHub connector. Verified that the original source comments annotate the screen IDs `00` match, `01` intro, `02` menu, `03` cup, and match subscreens `01` kickoff, `02` field, `03` goal, `06` out. `ram_game_script = $005C` has annotated state bytes `00,01,20,40,42,44,48,60,80`. These identifier/comment observations are represented as immutable **metadata only** in `src/classic/OriginalStateIds.js`, covered by `tests/replay.test.js`. No source-derived transition behavior has been implemented; the comment labels may be incomplete or misleading and require call-site analysis. Direct Git clone again failed (DNS resolution), so full routine inventory remains blocked. The source repository GitHub connection grants read access, not push access.

## Iteration 3 — active fixed-bank routine audit (2026-10-19)

Read the **complete text** of `bank_FF.asm` and `bank_00.asm` through the GitHub connector (not a full semantic analysis), plus targeted `bank_ram.inc` and `bank_FF.asm` line ranges, all at the pinned SHA. Confirmed the main-loop input and RNG call sites at CPU `$C48C/$C48F`, the controller serial sampling routine `$EE06–$EE27`, the stable reread and rising-edge calculation `$EDCD–$EE05`, and the two-byte RNG update `$EE35–$EE59`. See `ORIGINAL_CONTROLLER_TRACE.md` for exact source addresses, implementation mapping and verified-vs-unverified scope. The remaining banks have been accessed for call-site searches, **not** fully reverse engineered. A full local original-source checkout and authorized NES execution/reference trace remain unavailable; the shell's direct GitHub network access still fails.

## Iteration 4 — original screen/field state branch audit (2026-10-19)

Pinned fixed-bank `bank_FF.asm` was re-inspected at source lines `1138–1151`, `1223–1245`, `1301–1318`, `1351–1369` and `1675–1692`. These confirm the screen/subscreen jump tables, field-screen Start-to-pause mapping, foul/cutscene helper and kickoff gate branch. Isolated native JavaScript implementations and a browser research UI are recorded in `docs/ORIGINAL_FIELD_TRACE.md`. Original football pass/shoot/tackle, the full kickoff transition, original runtime RAM/frame parity and the complete source audit remain outstanding.

## Iteration 5 — original goal-cutscene and banked-dispatch trace

Re-read pinned `bank_FF.asm` around `$C699–$C71B`, `$C2AD`, and `$C370`, plus `bank_04.asm` opening jump entries. Ported isolated goal-subscreen timer/camera/skip/brightness direct byte operations in `OriginalGoalCutscene.js`; 12 entry calls and subsequent `$D047/$D073/$C91A`/audio remain unported. Identified kickoff bank dispatch selector `$17` -> bank04 `$B4B2` and button-action selector `$0F` -> bank04 `$B8AB`, plus shot/super selectors `$20–$24`. No bank04 action routine behavior or NES runtime parity claimed. Details: `ORIGINAL_GOAL_CUTSCENE_TRACE.md`.

## Iteration 6: new original-source inspection (pinned SHA)

Retrieved full `bank_04.asm` and `bank_FF.asm` through the connected GitHub reader and inspected the exact target ranges. `bank_04.asm:12653–12666` confirms `$B4B2` dispatch on game-script bit 0; `13337–13565` confirms `$B8AB` selected-player gate, `$C07A` call, action/angle selection and byte tables. `bank_FF.asm:300–303` shows `$C07A` jumping to `$FAEE`; `10532–10630` contains the self-contained `$FAEE–$FBA8` action buffer helper and `$02/$06` thresholds. Native implementations and tests are recorded as `SRC-030–032` in `ASSEMBLY_TO_JS_MAPPING.csv`. This is a targeted source audit, **not** a full bank semantic audit or original runtime verification. See `ORIGINAL_PLAYER_ACTION_TRACE.md`.

## Iteration 7 source inspection

Re-read pinned `bank_04.asm` lines 12650–12950, 12951–13100 and 13265–13338. Verified `$B4B2` bit0 call routing and the full direct branch at `$B850–$B8AA`; inspected `$B4C9` gating, `$C07A` call and seven-group `$B737` pointer table but did not port the alternate routine. No source binary, ROM, CHR or DPCM was copied. See `ORIGINAL_POSSESSION_CONTROL_TRACE.md`.

### Iteration 9 — bank06 action arbitration (source-local only)
Pinned bank_06.asm `$AA14–$AAAB` and metadata `$AC65–$AD40` were inspected and ported into `src/classic/OriginalActionArbitration.js`. It can consume a pending `$0479` action and conditionally replace `$0459` movement on synthetic RAM, preserving weather and state gates and metadata-table overlap. See `docs/ORIGINAL_ACTION_ARBITRATION_TRACE.md`. This **does not** execute original movement, ball physics, animations or a Classic frame; original NES runtime parity remains blocked.

### Bank06 movement-state and pending ball-action branches (iteration 11)

Pinned `bank_06.asm` source lines 7064–7105 (`$AAC3/$AAC8–$AB0A`) recompute player state `$0486+X` from metadata selected via `$AC65`, movement ID `$0459+X`, signed Z-high `$0399+X`, Z-low `$0386+X`, and old state bit 3. Pinned lines 7123–7144 (`$AB2A–$AB51`) use literal `$AC4D–$AC64` bytes to compare pending ball action `$0485` against ball state `$0492` and optionally write `$0459+X`. Both are now source-locally implemented in `src/classic/OriginalMovementTransition.js`, with synthetic RAM tests. This is **not** full `$AB0B` weather handling, `$AD41` dispatch, actual physics, original sprite animation, or NES frame parity. See `docs/ORIGINAL_MOVEMENT_TRANSITION_TRACE.md`.

### Iteration 15 — first source-backed original OAM producer

Pinned bank_FF `$D993–$DA45` and data tables `$DA46/$DA52/$DA5E/$DA6A/$DA76` have now been inspected directly. Original weather effect `$81` initializes 12 OAM entries and switches to `$01`, whose update branch computes Y/X positions, clipping and OAM tile/attributes. See `ORIGINAL_WEATHER_OAM_TRACE.md`. Isolated 6502 machine-code execution differential tests pass; original gameplay frame parity and player OAM builder remain missing.
