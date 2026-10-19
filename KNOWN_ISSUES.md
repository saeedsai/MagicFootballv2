# Iteration 13 outstanding issues

- **KI-030 / P0:** source-derived CHR bank register writes and PPU pattern mapping are implemented on synthetic RAM only. Original game CHR-bank update timing, PPUCTRL selection, palette, OAM/metasprites and animation are **not** verified or ported. Browser mapped atlas is **not** a complete original sprite renderer.
- **KI-031 / P0:** no executed original NES reference frame/RAM/PPU captures; the mapper tests prove source-local writes and authentic CHR bytes, not original runtime parity.
- **KI-029 / P0:** original graphics/audio redistribution rights still unestablished. User-private original CHR/ROM must remain out of public ZIP/Git.

---

# Iteration 12 blockers and resolved issues

- **KI-026 RESOLVED for private reverse engineering:** original ROM and all CHR bytes now available from owner upload. Full normalized original ROM and original Git CHR SHA-1 verified. A user-specific build may show exact original graphics patterns, without public redistribution rights.
- **KI-027 STILL OPEN / P0:** tile patterns are authentic but composed original faces, poses, objects, palettes, CHR/OAM bank switching and animations have not been implemented. Grayscale inspection tones are not original NES palettes.
- **KI-028 STILL OPEN / P0:** original NES runtime frames/RAM traces, original AI, physics, ball, team/menu and audio parity not available. Classic Mode disabled.
- **KI-029 / P0:** legal permission for public redistribution of game art/music/source beyond private user-supplied transformations unestablished. Keep original asset bytes out of Git/public builds.

---

# Iteration 10 blockers

- **KI-026 / P0 — Original binary unavailable in workspace:** SHA/size verified from upstream metadata, but no original `.nes` or `CHR_ROM.chr` bytes are in the project. Built-in importer/CLI can inspect a lawful local copy supplied by the project owner; no real graphics-source equivalence run yet.
- **KI-027 / P0 — Tile decode ≠ sprite parity:** Original PPU palettes, OAM and metasprite composition, tile bank switching, character faces, field/UI graphics, and animation are not ported. Grayscale pixels in inspector are only tile color indices.
- **KI-028 / P0 — Complete original conversion incomplete:** Original ROM runtime execution and frame-indexed RAM comparison unavailable; don't ship a lookalike as Classic. Existing development match isolated.

# Known issues and blockers

- **KI-001 Critical parity:** original input-to-action mapping, movement, ball, collisions, AI, keeper, state transitions, teams and menus not decoded; controller serial/edge and RNG primitives are source-derived but unverified against original execution; development ruleset is an unrelated approximation. Classic Mode disabled.
- **KI-002 Critical assets/legal:** no established redistribution permission for the game's original graphics/audio or original characters; packaged graphics are independent placeholders.
- **KI-003 High reference:** lawful reference ROM/emulator and deterministic original frame comparison not available in this environment; `.fm2` recordings identified but not replayed.
- **KI-004 Medium source access:** GitHub shell DNS failed, so a complete local source checkout, full automatic routine inventory and upstream assembly build were not performed. Full fixed-bank and bank-00 texts were read through the connector, and all eight bank texts were searched for relevant calls; complete semantic audit and local original checkout remain incomplete.
- **KI-005 Medium controls:** no physical phone, real hardware gamepad, or simultaneous multi-touch browser device test. Simulated viewport and pure input aggregation tested.
- **KI-006 Medium visual:** canvas characters are newly drawn schematic rectangles and not accurate faces or original sprites, by design.
- **KI-007 Medium gameplay:** no tactical formations, intentional team/player switching beyond nearest, original restarts/set pieces, offside, fouls, keeper animations or audio in development match.
- **KI-008 Low development UI:** UI graphics and match pause indicators use placeholder layouts; small landscape screens have limited field size.
- **KI-009 Medium portability:** `tools/build.mjs` is a small bespoke standalone combiner and must be revised if exports/imports change; complete Safari/Firefox/Edge matrix not run.
- **KI-010 Medium pause/resume state:** visibility auto-pauses gameplay; player must explicitly resume after tab restoration. Intentional provisional behavior but UX unreviewed.

- **KI-011 Medium replay UX:** no seeking/timeline; replay capped at 24,000 input frames and 4 MB file import.
- **KI-012 Medium parity:** replay checksums detect internal development-state drift only; no NES reference parity or cross-browser replay QA.

- **KI-013 Medium original-controller parity:** native port reproduces inspected assembly bit operations, but no original frame/RAM reference run verifies runtime parity, hardware accessory/channel assignments, startup RNG seed, or football button semantics. Browser retry is deliberately bounded rather than unbounded like original.

- **KI-014 High original gameplay:** the only confirmed original football button action so far is field-screen Start → pause. Pass/shoot/dribble/tackle/formation/player-select logic remains untraced; field handler `$C63A+` and gameplay banks remain unported.
- **KI-015 High transition completeness:** `$C87B` foul helper is source-derived and kickoff gate branch is mapped, but `$C5C9+` writes, `$C2AD`, `$D01F`, `$D0D5` and graphics/status initialization are not integrated. Browser lab does not advance an original match state.
- **KI-016 Medium audio:** pause trace returns original arguments passed to `$C2E4`, but does not implement the audio engine or produce original sound.

- **KI-017 High goal cutscene parity:** the isolated `$C699–$C71B` projection skips twelve upstream routines and `$D047/$D073/$C91A/$C2E4` behavior; source-derived branch tests do not establish original frame-level parity, animations, score handling or sound.
- **KI-018 High original bank04 action routines:** selector `$17` resolves to `$B4B2` and `$0F` to `$B8AB`, but those target routines, player-action button masks, and physics have not been decoded.

- **KI-019 High original action execution/parity:** the fixed-bank `$FAEE–$FBA8` input-buffer routine and bank04 `$B8AB–$B9E2` action/angle selector are source-locally ported, but their original frame-level timing, controller slot assignment, and numeric action IDs' actual football semantics have not been confirmed by NES execution. `$B850/$B4C9` are now source-locally ported in isolated modules; the actual action executor, frame scheduling and NES parity remain unported/unverified. Classic remains disabled.

- **KI-020 High original possession-controller parity:** `$B850–$B8AA` is source-locally ported but its matched A/B branch writes action at the **controller slot** (`$0479+X`), whereas its fallback writes at the **ball owner** (`$0479+owner`); the angle table has only three declared bytes and index 3 reads next opcode `$86`. Preserve these observed operations pending original-run verification; do not infer intended behavior or claim gameplay parity. `$B4C9` is now source-locally ported in a separate module; action execution and NES runtime parity remain unported/unverified.
- **KI-021 Low build fragility:** standalone module flattening previously allowed a duplicate top-level `byte` identifier to break the entire UI. Renamed the new helper and added a `vm.Script` parse gate to `tools/build.mjs`. Runtime ESM and standalone browser checks pass, but future cross-module bindings still require care; migrate to a robust bundler before major scale-up.

- **KI-022 High original alternate controller parity:** `$B4C9–$B724` with `$C07A/$FAEE` helper, 7×4 pointer groups and 12-entry raw action tables is now source-locally implemented and tested, but **not verified against original NES RAM frames**. The `$B83D` table's 12-byte indexed lookup crosses into `$B844` data; preserved as observed. Source group 6 table data is present but appears unreachable from this routine's group-selection branches. Raw action IDs have no proven football semantics; action executor and frame scheduler remain missing.
- **KI-023 Low research UI coexistence:** the earlier `stepOriginalScriptBit0ControlBranch` preview deliberately reports the script-bit0-clear path as unexecuted (compatibility with existing tests); the **new** `stepOriginalControllerDispatch` runs both source-local branches. Do not confuse the preview's report with project-wide implementation status.

- **KI-024 High original movement parity:** bank06 `$AA14–$AAAB` source-derived action-to-movement arbitration and `$AC69–$AD40` metadata tables now execute on synthetic RAM; downstream `$0459` movement execution, velocity, collision, animation and ball interactions remain unimplemented, as does original NES frame-level parity. Unsupported metadata reads are rejected, not guessed.
- **KI-025 Medium replay authenticity:** `verifyReplay` checks simulated-state checkpoint hashes, not a digest of the entire input tape. Changing a first-frame input that has no effect on state was accepted in iteration 9 (`reports/replay-inert-tamper-output.txt`), while changing frames 80–199 was rejected at frame 120 (`reports/replay-negative-output.txt`). Do not describe the current checksum as proof of tape integrity; add an input-content digest in a future versioned replay schema if required.

- **KI-026 High original movement/ball execution:** bank06 `$AAC3/$AAC8–$AB0A` state recomputation and `$AB2A–$AB51` pending ball-action priority are now source-locally ported and tested on synthetic RAM, but do not execute original movement, shot trajectory, sprite animations or an NES frame. The enclosing `$AB0B–$AB29` weather callback `$9856`, `$AD41` dispatch, and full game loop remain unported. Unsupported metadata/table overreads are deliberately rejected rather than guessed. No original runtime parity is verified.

- **KI-027 High original sprite/palette runtime parity:** `$EE5A` OAM DMA and `$F05F` palette queue now have source-derived JS and exact owner-ROM opcode tests, but original CPU RAM producers, original palette-index values, metasprite tables, PPUCTRL sprite mode, animation frames and reference NES screenshots are not known. Browser lab values are synthetic. `$F070` count >= $21 loops forever in source; JS rejects it to avoid browser hangs. Zero count writes 256 bytes.
- **KI-028 Low standalone HTML build corruption (fixed):** `String.replace` interpreted `$'` inside newly bundled JS as a replacement token, injecting trailing HTML into a JS string and breaking the browser. Replaced with function callback and added final embedded-script syntax verification. New and existing Chromium suites passed.

- **KI-026 (open):** Original `$D993` weather-effect OAM producer now matches original machine-code execution on synthetic RAM, but its actual original per-frame call order, source RAM inputs, palette/CHR bank and rendered frame are not captured. No original NES runtime visual parity claim.
- **KI-027 (open):** Original player-character OAM/metasprite/animation producers remain unported. Weather effect sprites must not be mistaken for players or original complete character graphics.
