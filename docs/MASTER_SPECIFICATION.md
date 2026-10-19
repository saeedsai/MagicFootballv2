# MASTER AI DEVELOPMENT PROMPT
## Kunio-kun no Nekketsu Soccer League — Complete Native JavaScript Conversion and Extensible Football Game Platform

> **Use this entire document as the governing development instruction for an AI coding agent with source-file, terminal, browser-testing, and version-control capabilities.**
>
> **Primary goal:** Port the entire original NES game faithfully to native JavaScript/HTML5 for PC and mobile. **Second goal:** Evolve the port into a larger, customizable, multiplayer arcade football game, without changing or breaking the preserved original experience.
>
> **Instructions to the agent:** This document is a specification and implementation mandate, not a request to write another plan and stop. Inspect the actual source, maintain a traceable implementation backlog, write the software, test it, fix defects, and deliver verified playable builds at successive milestones. Do not invent test results or claim unverified progress.

**Original source repository:** https://github.com/cyneprepou4uk/NES-Games-Disassembly/tree/main/Kunio-kun%20no%20Nekketsu%20Soccer%20League  
**Parent repository:** https://github.com/cyneprepou4uk/NES-Games-Disassembly  
**Project working title:** Kunio Soccer — Classic & Expanded (renameable)  
**Primary output:** HTML5, JavaScript/TypeScript-optional, CSS, browser-native assets, test suites, documentation, and (in later phases) a separate multiplayer backend.  
**Reference date for this master specification:** 2026-10-18.

---

# PART I — PROJECT CONTRACT, BOUNDARIES, AND PRIORITIES

## 1. Your role and mission

Act as a senior game-engine architect, 6502/NES reverse engineer, JavaScript/HTML5 developer, pixel-art rendering engineer, network engineer, gameplay designer, build/release engineer, and automated QA lead.

Deliver a complete, playable, source-maintainable, native web implementation of **Kunio-kun no Nekketsu Soccer League**. Subsequently make it an extensible football game with additional player customization, clubs and national teams, abilities, tournaments, club-manager career, local multiplayer, LAN multiplayer, and internet multiplayer.

**The original game is the reference for Classic Mode. New functionality belongs in separate Enhanced Mode configurations and modules.**

## 2. Inviolable requirements — inherited from the original conversion request

1. Convert all **relevant original-game logic** from 6502 assembly into native JavaScript. Account for every routine and data region; explicitly classify hardware-only and build-only material.
2. Replicate the complete original game: mechanics, physics, AI, animation, player/team information, menus, modes, competitions, audio, and meaningful timing as verified from code and reference runs.
3. **No NES ROM execution, NES emulator, generic 6502 CPU interpreter, or assembly runtime** in the distributed game. Deliver maintainable game logic rather than a web wrapper around an emulator. Assembly may be inspected or used in build-time analysis and dev-only reference testing.
4. Preserve original player faces, eyes, expressions, hairstyles, silhouettes, body proportions, poses, ball and object shapes, palettes, and animations in Classic Mode. Do not “improve” by redesigning the sprites.
5. Increase display clarity with correct high-DPI, aspect ratio, crisp scaling, and stable rendering. Better *rendering* is not permission to alter shapes or add imaginary face details.
6. Run on desktop/laptop and mobile browsers. Provide responsive landscape orientation, mobile virtual joystick, **four configurable gameplay action buttons**, plus Start/Pause/Select as needed.
7. Support remappable keyboard and gamepad input, multiple simultaneous gamepads, touch combinations, and stored control profiles.
8. Use a deterministic fixed-step game simulation whose behavior does not vary with display FPS.
9. Do not remove, fake, simplify, or silently drop features. A prototype is an intermediate milestone, not the finished product.
10. Maintain documented, independently tested, version-controlled software with gameplay regression suites and visual checks.
11. Provide playable HTML, complete source, downloadable packaged distribution, test evidence, setup instructions, and a full handover for future AI developers.
12. **Do not change Classic Mode behavior when developing new features.** Classic Mode remains the unmodified reference experience except for device compatibility and optional presentation settings.

## 3. The two-mode product architecture — mandatory

### 3.1 Classic / Original NES Mode

- Original rosters, players, game modes, AI, physics, abilities, collisions, sprites, UI behavior, audio, and timing.
- Native web input adapters may differ in how buttons are physically presented, but their simulated original inputs must be equivalent.
- A high-resolution *fidelity-preserving* rendering option; pixel-accurate scaling should be the default.
- Immutable or versioned classic gameplay configuration, with complete deterministic reference regression tests.
- No new teams, customized faces, new special powers, or balance adjustments inserted into classic rules.

### 3.2 Enhanced / Expanded Mode

- Reuse the proven underlying simulation architecture and original visual design language, while supporting additions and adjustments through configuration, content data, and modular systems.
- Additional clubs, national teams, rosters, custom players, abilities, animations, league and cup modes, career, and multiplayer.
- New game settings, balancing, graphical effects, formations, rules, difficulty, and quality-of-life features are **opt-in** and cannot silently affect Classic Mode.
- User-custom content uses a separate namespace, versioned schema, and migration strategy.

Provide a visible mode selector. Every save, settings profile, replay, test fixture, and multiplayer room must declare its mode and content version.

## 4. Definition of success and honest reporting

Do not report “100% parity” because a game boots or several matches work. Parity requires a complete source traceability matrix and objective evidence. Mark unknowns honestly as **Not analyzed**, **Unimplemented**, **Partial**, **Implemented unverified**, **Passed**, **Failed**, or **Blocked**. Do not hide blockers, and never invent test counts, FPS, current repository paths, browser results, or deployment status.

## 5. Legal, licensing, and distribution gate

The GitHub repository is source material, not automatic permission to distribute copyrighted code, characters, graphics, songs, real-world team badges, or likenesses. Before publicly distributing any copied assets or real player identities, establish applicable permissions. Keep an asset-import path for user-supplied, legally obtained material where distribution rights are absent. Avoid unauthorized official team logos, likenesses, music, or branding in release packages. Record provenance and license for every added asset. Legal risk must not be masked by using an emulator or asset extractor.

---

# PART II — COMPLETE ORIGINAL NES CONVERSION

## 6. Phase A: inspect, classify, and trace the original source

Clone the original repository and pin the **exact commit SHA**. Read all relevant source directories and build scripts, not merely the main ASM files. Inspect and confirm whether the following candidate source items are present at the pinned commit (do not assume an item exists if it does not):

- `bank_00.asm` through `bank_06.asm` and `bank_FF.asm`
- `bank_ram.inc`, `bank_val.inc`
- `CHR_ROM.chr`, `DPCM.bin`, `header.bin`
- `_misc/`, graphics, palettes, sound tables, and any further data/include files
- Repository build scripts (`assemble.bat`, `assemble.sh`, preparations and tooling as applicable)

Build a **function-level and data-level** inventory:

1. Startup, initialization, resets, input polling, interrupts, main loop, bank transitions, and frame scheduling.
2. Main menu, submenus, team selection, formation, match setup, difficulty, passwords/saves if actually present.
3. Player data, teams, appearance, orientation, animations, sprite tile maps, palettes, environments.
4. Input processing, context-dependent button logic, button combinations, timing windows.
5. Player movement, running, inertia, jumping, landing, recovery, tackling, passing, shooting, special shots.
6. Ball trajectory, gravity, bounces, possession, collisions, spin, interactions, goal detection.
7. Goalkeeper actions, AI decision states, teammate behavior, opponent strategies, difficulty variation.
8. Match rules, scoreboard, timers, stoppages, replays if original, match end, tournaments, progression.
9. Sound synthesis/data, music sequencing, sound priorities, effects, DPCM sample usage.
10. Hardware-specific PPU/APU behavior and runtime asset representations, distinguished from gameplay semantics.

**Important:** Do not invent a feature just because a soccer game typically has it. Ground the original feature inventory in the actual disassembly and reference runs.

Create these exact documents:

- `docs/SOURCE_CODE_ANALYSIS.md`
- `docs/ASSEMBLY_TO_JS_MAPPING.md`
- `docs/FEATURE_INVENTORY.md`
- `docs/GAME_STATE_ARCHITECTURE.md`
- `docs/DEPENDENCY_MAP.md`
- `docs/ASSET_INVENTORY.md`
- `docs/ORIGINAL_BEHAVIOR_SPEC.md`

For each original routine, table, or asset region, record: original file/line/address, responsible system, JavaScript destination, verified behavior, implementation state, unit/integration/reference test IDs, and unresolved questions.

## 7. Phase B: implement native browser architecture

Use JavaScript ES modules (TypeScript may be used if compiled to browser JavaScript), HTML5 and CSS. Canvas 2D is preferred for precise NES sprites; WebGL may be optional if it demonstrably maintains fidelity.

Suggested initial structure (adapt to actual findings):

```text
kunio-soccer/
  index.html
  package.json
  vite.config.js                  # optional build tool
  public/
    favicon.ico
  src/
    main.js
    app/
      App.js
      ModeRegistry.js
      Navigation.js
    core/
      Game.js
      FixedStepLoop.js
      StateMachine.js
      DeterministicRng.js
      Snapshot.js
      EventBus.js
      Ruleset.js
    simulation/
      PlayerSystem.js
      BallSystem.js
      Physics.js
      CollisionSystem.js
      AnimationStateSystem.js
      AIController.js
      GoalkeeperAI.js
      MatchState.js
      Referee.js
      SpecialMoveSystem.js
    classic/
      ClassicRules.js
      ClassicData.js
      OriginalMechanicsAdapters.js
    enhanced/
      EnhancedRules.js
      ContentRegistry.js
      AbilitySystem.js
      CustomizationSystem.js
    rendering/
      Renderer.js
      Camera.js
      Palette.js
      SpriteAtlas.js
      LayerRenderer.js
      EffectsRenderer.js
    input/
      InputManager.js
      ActionRegistry.js
      KeyboardAdapter.js
      GamepadAdapter.js
      TouchAdapter.js
      InputProfiles.js
    audio/
      AudioManager.js
      MusicSequencer.js
      SoundEffects.js
    ui/
      MenuRouter.js
      HUD.js
      Settings.js
      TeamSelection.js
      ControlsScreen.js
    persistence/
      SaveManager.js
      SchemaMigrations.js
    data/
      classic/
      enhanced/
      schemas/
    assets/
      classic/                      # only legally distributable assets
      enhanced/
      atlases/
  server/                           # later LAN/online; never bundled in client-only build
  tools/
    source-analysis/
    asset-conversion/
    reference-comparison/
  tests/
    unit/
    integration/
    parity/
    visual/
    e2e/
    network/
    fixtures/
  docs/
  reports/
  dist/
```

Technical design rules:

- **Deterministic fixed-step simulation**: preserve original step/update ordering and integer/rounding semantics where required; render separately from simulation.
- **Headless game state**: gameplay logic runs without DOM/canvas or audio. It must be testable in Node and reusable in an authoritative server.
- **One input abstraction**: physical keyboard/gamepad/touch buttons map to logical original actions; separate menu actions from gameplay actions.
- **Data-driven content**: define stable identifiers for teams, players, animations, powers, tournaments, and seasons; use schemas and validators.
- **No embedded emulator**: game rules must be expressed as meaningful systems and functions, not emulated CPU opcodes.
- **Reproducible seed**: random behavior must be replayable in deterministic tests.
- **Asset pipelines**: source-to-tile/sprite/palette conversion at build time; no NES hardware dependency in production runtime.
- **State versioning**: saves/replays/network packets must include schema/game/rules version.
- **Separate modules**: render, UI, sound, input, save and online transport must not change simulation outcomes.

## 8. Phase C: replicate complete original gameplay

### 8.1 Player and match interaction

Match the original movement model and animation transitions. Port all behaviors verified in the original, including directional movement, stopping, running, jumping, landing, possession, tackles, tackles/recovery, shots, passes, headers, aerial plays, special moves, scorekeeping, match restarts, and goalkeeping.

Port original time windows and contextual button combinations precisely. Avoid simplifying mechanics into a generic soccer model. All changes to original physics require written evidence and explicit owner approval; they may only be enabled in Enhanced Mode.

### 8.2 Ball mechanics and collisions

Reproduce ball positions, velocities, acceleration, gravity, bounces, spin/curve if supported, collisions, possession selection, shots and special trajectories. Preserve collision and gameplay event ordering, fixed-tick determinism, game boundaries, goal detection, and original animation/physics interactions.

### 8.3 AI, tactics, and goalkeeper

Reconstruct the actual original AI decision state machines, reaction conditions, teammate assignment, pursuit, defensive responses, goalkeeper movement/dive/catch logic, positional behavior, team-specific patterns and any difficulty logic present. Every AI enhancement belongs in Enhanced Mode, never silently in Classic Mode.

### 8.4 All original content and modes

Include all genuine original teams, players, modes, menus, settings, stages, tournaments and progression—not only Quick Match. Verify features against source and gameplay before listing them as implemented.

## 9. Phase D: faithful graphics with better presentation

**Classic Mode visual invariant: no changed faces or shapes.**

Preserve all original character faces, eye positions, expressions, head-to-body ratio, skin colors/palettes, hairstyles, clothing, sprite silhouettes, ball, goals, field, backgrounds, animations and orientation-specific frames. Do not use AI-generated replacements for original sprites.

Extract and reconstruct original graphics from CHR/palettes/OAM/layout/animation logic or other source data as verified. Keep sprite outlines, pixel placement, and tile composition unchanged.

Improve only display and user-configurable presentation:

- Accurate aspect ratio and camera boundaries.
- Crisp integer/nearest-neighbor scaling and correct transparency.
- High-DPI canvas output without jagged coordinate transforms or gaps.
- Correct palette/emphasis mapping and layering.
- Fullscreen where available; stable portrait/landscape and resizing behavior.
- Optional independent post-processing filters (clearly labeled, off by default), without shape alteration.

Visual QA must compare original and port scenes: screen captures, sprite sheets, frame sequences, silhouettes, tile identities, outlines, animation timing, side/back/front frames, palettes and positioning. Differences must be classified, not ignored.

## 10. Phase E: original music and sound

Inspect DPCM and source audio routines. Reproduce original triggers, melody/rhythm, loop points, effects, channels/voice priorities, pitch and timing using Web Audio or legally permitted converted samples. No NES audio emulator at runtime. Handle browser audio-unlock rules and pause/resume. Keep Enhanced soundtracks/effects in separate asset packs.

## 11. Phase F: mobile, keyboard, and gamepad input

### 11.1 Touchscreen

Provide a **left-side virtual directional joystick** and **four right-side action buttons**, with separately visible Start/Pause/Select if needed. Support:

- Eight-direction input, press/hold/release, diagonal movement.
- Input buffering and original timing windows where required.
- Multiple simultaneous contacts: joystick + two or more buttons.
- Adjustable joystick sensitivity/dead zone, button size, position, transparency.
- Device-appropriate landscape composition; safe area insets; resizing.
- No accidental scroll/zoom/context menu while playing.
- Per-player touch input if same-device multiplayer enables it, within practical screen layout constraints.
- Custom and default mapping profiles persisted locally.

The original NES controls may have fewer gameplay action buttons than the requested four touch buttons. Map additional buttons to valid original actions, original button combinations, or configurable shortcuts; **do not invent new Classic Mode mechanics**. Enhanced Mode may assign all four to new, explicitly documented actions.

### 11.2 Keyboard

Remappable movement, gameplay, pause and menus. Support multiple profiles, local co-op player assignment, conflict detection, reset defaults, simultaneous inputs and persistent mappings. Define reasonable initial bindings but always allow customization.

### 11.3 Gamepad

Gamepad API with Xbox/PlayStation/generic supported mappings, digital/analog movement, dead zones, multiple controllers, connect/disconnect, reconnect, vibration where supported, per-player assignment, action remapping and test/calibration screen.

All physical inputs must map to one canonical `InputFrame` consumed by deterministic simulation. Input-frame recording must be available for replay and multiplayer.

## 12. Phase G: original-game parity verification

A reference emulator is permitted **only as a development comparison environment** when a lawfully available original game reference exists; it must never run in the delivered game.

Create repeatable comparison fixtures for menus, player positions, ticks, ball physics, AI actions, animation frames, scores, triggers, and transitions. Compare same starting state, same PRNG seed when appropriate, and same input sequence. Provide frame-by-frame comparison where feasible; otherwise set tolerances with justification and report mismatches.

The original game conversion is **not complete** until all identified original features are represented and tested or explicitly blocked with evidence, with no hidden unimplemented features.

---

# PART III — THE EXPANDED GAME: LONG-TERM FEATURE SPECIFICATION

## 13. Expansion design principles

1. Implement improvements as modular features, not ad-hoc patches to classic code.
2. Preserve the classic cartoon/pixel-art identity and proportions as the default artistic direction.
3. Enhanced Mode may include **new original** face shapes and animations, but not distort or alter existing original characters. Clearly distinguish classic assets, new compatible-style assets, and optional graphical themes.
4. Every new player, team, ability, animation and competition must be data-driven and validated.
5. Ship in tested, playable vertical slices; keep the previous stable build available.
6. Avoid changing the four-button mobile UI requirement. Implement context-sensitive actions, configurable combinations, hold/double-tap only after testing usability. Offer layouts if the feature set genuinely exceeds four button slots.
7. Support offline single-player first; build local multiplayer on the same deterministic engine; LAN next; internet multiplayer last.
8. Never describe planned content as implemented, and never compromise original parity for velocity.

## 14. Expansion A — More teams, players, rosters and football content

Build a scalable content system with **no hardcoded team-count, player-count, tournament-count or season-count limit in the engine** (practical UI/performance constraints can be documented).

Support:

- Original preserved teams.
- New fictional club teams and national teams.
- Custom user-created teams and clubs.
- Importable/replaceable team packs.
- Team kits, home/away/third variants, badges, country, league association, stadium, colors and style.
- Player metadata: stable ID, display name, position(s), preferred foot if relevant, nationality, age, height, physical traits, squad number, team/contract status, appearance ID, animation and ability sets.
- Player stats: configurable schema with at least movement speed, agility, stamina, strength, technique, dribbling, passing, shooting, accuracy, tackling/defense, aerial skill, goalkeeper attributes and special ability power; adjust the exact model to the gameplay design.
- Stat ranges/definitions documented and balanced; overall-rating calculation should be role-specific and testable.
- Formation and starting lineup selection, substitution/bench rules, reserves and injury/fatigue if enabled.
- Ability to add/update/remove teams and players without touching core engine logic.
- CSV/JSON import-export with JSON Schema validation, deduplication and error reports.
- Editable roster database with migration tools, admin/editor interfaces and content provenance.

**Do not claim real-world rosters or ratings are current without actually checking primary sources; do not distribute protected likenesses, logos or licensed club data without rights.** Provide fictional content defaults and optional authorized packs.

## 15. Expansion B — Player face, hair, body and uniform customization

Create a comprehensive player and manager character editor matching the game's style.

Support independently configurable:

- Face templates, head silhouettes, jaw/chin, cheek/forehead shapes, facial expressions.
- Eyes, eyebrows, nose, mouth/lips, ears.
- Hairstyles, lengths, fringe, hair colors, hairlines, facial hair and beard/mustache styles.
- Natural skin-tone palettes and sensible natural hair-color palettes; optional fantasy colors only if explicitly selectable.
- Body proportions/presets: slim, average, muscular, heavy, height/build within gameplay-supported ranges.
- Kits, shirt/pants/socks, boots, wrist/arm accessories, headwear, optional tattoos or cosmetic marks.
- Optional unique player signature features, body outlines, animations, voice/celebration where supported.
- Saved templates, randomize, presets, clone player, reset, preview, undo/redo.
- Rotatable player preview where practical: **front, back, left/right side and 3/4 views only when consistent art exists**.

**Graphics combinatorics and QA:**

- Every allowed face × hair × beard × body × palette combination must render without distortion, missing segments, shifted eyes, misplaced beard edges, overlapping layers or color bleeding.
- Use layer masks and/or compatible variants for combinations where a universal overlay fails.
- For each view and major action animation, validate offsets, anchor points, clip boxes, facial consistency and gear collisions.
- Use deterministic composite sprites/atlases and caching to keep the web game efficient.
- A customization option must not appear selectable unless it can render correctly in game and in the preview.
- Ensure appearance is correctly serialized, transferred in multiplayer and preserved by save migrations.
- New customization is **Enhanced Mode only**; original character sprites remain unchanged in Classic Mode.

## 16. Expansion C — Animations and animation system

Expand animation without changing original characters or action timing in Classic Mode. Enhanced Mode can support:

- Additional movement cycles, stop/turn/start/idle poses.
- Improved collision reactions, stun/knockdown/recovery, goalkeeper saves, headers and aerial play.
- More shot, pass, tackle, dribble, jump and celebration animations.
- Player-specific signature animations.
- Reactions to weather and surface conditions, optional injuries/fatigue, crowd/stadium reactions.
- Animation blending/state transitions appropriate for pixel-art sprite sequences without deformation.
- Direction-specific versions of actions; no mirroring if it misplaces unique facial features or equipment.
- Animation event markers for exact physics/contact frame, SFX and visual effects triggers.

The animation pipeline must store frame list, timing/ticks, pivot, hitbox, collision shapes, interaction markers, sprite view and layering metadata. Test each animation in all relevant views and gameplay states.

## 17. Expansion D — Special shots, powers and visual effects

Build a configurable **Ability / Special Power Framework**:

- Normal, charged, aerial and special actions where consistent with chosen Enhanced Mode controls.
- Super shots with distinct speed/power/trajectory behavior; super goalkeeper saves; defensive specials; dribble abilities; aerial specials; team combos if designed.
- Ability tiers, mastery levels, unlock requirements and cooldowns.
- Stamina/energy costs, knockback/stun, interception and counterplay.
- Power balancing via explicit formulas/data rather than unexplained magic numbers.
- Distinct effects: trails, particles, shockwaves, controlled glow, hit sparks, camera shake, slow motion and screen effects.
- Optional intensity settings for photosensitivity/accessibility and low-power devices.
- Always preserve ball visibility, player silhouettes, readable gameplay, hitbox alignment and physics determinism.
- Effects run in presentation code and must not accidentally change simulation outcomes.
- Signature moves may have custom animation/FX but must use a documented shared gameplay contract.

Establish the ability input scheme using the existing movement joystick + four main buttons, with context-sensitive, hold or combination actions. Provide an input-action matrix covering offense, defense, aerial states, goalkeeper, menu and remappable shortcuts. **No new action is approved until combinations are checked for collisions with existing controls.**

## 18. Expansion E — More cups, leagues, tournaments and seasons

Implement a flexible **Competition Engine**, able to define:

- Quick Match / Exhibition.
- Custom Cup.
- Knockout cups (single/double legs when enabled).
- Round-robin league and home-away league.
- Group stage followed by knockout stage.
- National and international cups, fictional or appropriately licensed.
- Championship points, wins/draws/losses, goal difference, standings, tie breakers.
- Scheduling/calendar, fixtures, match results, qualification, promotions/relegations as configured.
- Extra time, penalty shootouts, away-goals rules only when explicitly configured (do not assume current real-world rules).
- Competition history, brackets, trophies, past winners, records and statistics.
- Saving/resuming a tournament after closing the browser.
- CPU vs CPU simulation or accelerated/offscreen result generation, if added, tested for correctness and statistical plausibility.

Competition parameters must be pure validated data. Add sample fixtures proving round robin fairness, bye logic, scheduling constraints, tie breakers and bracket transitions.

## 19. Expansion F — Career Mode: Club Manager

Build a robust **manager career** as a progressively delivered system, not a static menu.

Career fundamentals:

1. Choose/create a club and manager avatar.
2. Manage squad, formations, tactics, lineup, captain, reserves and substitutions.
3. Schedule league and cup fixtures, training and rest.
4. Track player form, stamina, morale, injuries and progression if enabled.
5. Sign/release players and negotiate transfers/contracts with a transparent budget model.
6. Scout players, develop academy/youth prospects, promote to first team.
7. Manage finances: salary budget, transfer budget, income and expenses.
8. Set training plans, attributes, ability development and team chemistry/tactics.
9. Make lineup and tactical decisions before matches and at permitted in-game interruptions.
10. Play the actual match using the same native match engine, or simulate matches with documented methods.
11. Progress multiple seasons with league tables, qualifications, awards and club history.
12. Persist saves and autosaves across device sessions using versioned local storage; optional account/cloud sync later.

Future optional career systems: coaching staff, training facilities, club upgrades, board goals, sponsorships, fan support, reputation, scouting regions, manager progression, player retirement, dynamic transfer markets, more detailed injuries and contract negotiation.

**Prioritize playable vertical slices:** first one club, one league, a schedule, working match results and a persistent season; then tactics and roster management; then economy/transfers; then academy and multi-season depth.

Career is available offline first. Multiplayer career is a distinct future backlog item; do not casually promise it before network persistence and authority are solved.

## 20. Expansion G — Same-device multiplayer

Support **local simultaneous multiplayer** using any practical combination of:

- Two or more gamepads.
- Keyboard + gamepad.
- Multiple separate keyboard mapping profiles where physical keyboard rollover permits.
- Touch + gamepad.
- Multiple players on one touch device only if a viable tested layout exists.

Requirements:

- Player/controller assignment lobby, teams/sides, join/leave, ready/pause.
- 1v1 as an initial release target; expandable team controller assignment and co-op later.
- Independent input profiles and no player-control ownership conflicts.
- Appropriate camera behavior for same-screen play.
- Shared game state and match clock, with deterministic input arbitration.
- Full gamepad disconnect/reconnect handling.
- Tests of simultaneous button combinations, collision-heavy scenarios and pause/quit flow.

Use the verified Classic multiplayer features in Classic Mode only to the extent the original supports them. Any new local configurations reside in Enhanced Mode.

## 21. Expansion H — LAN multiplayer

A browser on a LAN cannot reliably discover arbitrary nearby peers by itself. Implement a realistic discovery/session mechanism, for example a **user-run Node.js local signaling/game server** or a small LAN lobby service, with WebSocket or WebRTC as appropriate. Do not claim LAN play works from a standalone `file://` HTML file without networking setup.

Requirements:

- Host/join room by local address, code or discovered room via an installed helper service if provided.
- Controller/side/team assignment, ready checks, deterministic match start.
- Two players/clients for the first vertical slice; extensibility for more.
- Synchronization model explicitly chosen and justified (authoritative server with state snapshots/inputs, or proven deterministic rollback).
- Prediction/interpolation and latency compensation only if needed and appropriately tested.
- Detect stale connections, disconnects, reconnection, paused matches, desync.
- Versioned messages and content compatibility checks.
- No duplicated physics implementations drifting between client and server.
- Device-independent parity across desktop and mobile on the same LAN.

Provide instructions and scripts to start LAN hosting and connect other devices. Test on two independently instantiated clients, not merely two tabs sharing mutable globals.

## 22. Expansion I — Internet multiplayer

Build an online architecture after local/LAN gameplay and deterministic tests are stable.

### 22.1 Server/backend

- Separate Node.js server (or equivalently justified platform), WebSocket transport, authoritative simulation or validated deterministic networking architecture.
- Matchmaking/lobby/room management, server region/environment configuration, and room invite codes.
- Authentication as appropriate: optional guest first, secure identity/account later.
- Server-side validation of input rate, commands, positions, scores and game state to prevent basic cheating.
- Private games initially; later public matchmaking, ranking and parties if desired.
- Network heartbeat, reconnect, abandon/timeout/forfeit rules, version compatibility.
- Server logs, metrics, capacity limits, cost monitoring and safe error handling.
- Secure transport for publicly deployed services (HTTPS/WSS), secrets stored outside client bundles.
- Document privacy, user data handling and moderation requirements before public accounts/chat.

### 22.2 Gameplay quality

- Quantify target tick rate, snapshots/bandwidth, latency, jitter and packet loss tolerance.
- Measure input-to-action latency and divergence on desktop/mobile with network impairment tests.
- Add interpolation/prediction or rollback only according to actual measured needs.
- Keep animation and visual FX on clients but decisions and scoring authoritative under selected architecture.
- Handle version upgrades without cross-version gameplay corruption.

### 22.3 Deployment truth

**GitHub Pages can host the static client but cannot host the required persistent multiplayer server.** Document and deploy the backend separately. A successful static page load is not proof that LAN or online multiplayer works. Provide independently verified client and backend endpoints (only if actually deployed), test accounts/rooms where appropriate, and repeatable server startup commands.

## 23. Expansion J — Additional desirable future capabilities

Keep these in an **Ideas / Optional** backlog, separate from committed scope until approved:

- Replay recorder, match highlights, instant replay, photo/spectator mode.
- Tournament editor, club/team editor, player creator and content-sharing formats.
- New arenas, weather, field surfaces and lighting themes.
- Unlockable cosmetic content, achievements, statistics and leaderboards.
- Advanced team tactics, formations, AI difficulty and custom strategies.
- Accessibility options: colorblind-safe cues, visual effects reduction, scalable UI, customizable controls.
- Single-player tutorials, practice/drill area, training challenges and challenge modes.
- Game localization and language selection.
- Content mod/extension API and controlled import/export.
- Cloud saves, account profiles, cross-device progression and privacy controls.
- Spectator support, tournament broadcasting, anti-cheat improvements and online ranking.
- PWA installation/offline caching for offline features (not offline internet multiplayer).
- Improved editor tools for character, face and animation previews.

For each proposed feature, document value, dependencies, estimated complexity **relative to other work** (not guaranteed calendar estimates), architecture impact and acceptance tests.

---

# PART IV — DATA MODELS, INTEGRATION CONTRACTS, AND QUALITY GATES

## 24. Content schemas and validation

Use stable `id`, `schemaVersion`, and `contentPackId` fields for players, teams, appearances, animations, abilities, formations, cups, leagues, career saves and replay inputs.

Illustrative structures, to be adapted after architecture work:

```json
{
  "schemaVersion": 1,
  "id": "player.example.001",
  "displayName": "Example Player",
  "teamId": "team.example.001",
  "roles": ["FW"],
  "stats": {"speed": 75, "shotPower": 82, "passing": 62},
  "appearanceId": "appearance.example.001",
  "animationSetId": "animset.compatible.001",
  "abilityIds": ["ability.specialshot.example"],
  "contentPackId": "pack.example.001"
}
```

Validate referential integrity, stat limits, sprite-appearance compatibility, lineup sizes under the selected ruleset, competition membership, unique IDs, save upgrades, and network content versions. Store source/provenance for licensed/real content, if any.

## 25. Save game and migration requirements

Save independently:

- Global settings and per-user control profiles.
- Enhanced content database and customization presets.
- Career and tournament progression.
- Local match/replay data where supported.
- Optional network account/cloud state in later releases.

Use IndexedDB for larger browser persistence with a clearly versioned serialization format; localStorage is acceptable for small preferences. Implement backups/export/import, autosave consistency, corruption handling, migrations and explicit reset. Never allow a new feature to silently destroy or reinterpret existing saves.

## 26. Testing strategy: layered, automated and evidence-based

### 26.1 Required tests in every iteration

- Unit tests for pure rules, state machines, calculations and schemas.
- Integration tests for match flow, inputs, UI transitions and saving.
- Original parity tests where original behavior exists.
- Visual golden-image comparisons for classic sprite silhouettes and new character combinations.
- End-to-end browser tests in representative phone and PC viewports.
- Performance smoke tests and long-session stability tests.
- Regression suite for all completed features before release.
- Static type/lint/build checks if tooling exists.

### 26.2 Important new-feature test suites

**Customization:** face × hair × beard × body × skin × view × animation permutation tests; sample/exhaust all permitted combinations using automated capture and geometry validation, with visual review of representative cases.

**Teams/rosters:** unique IDs; squad eligibility; role distribution; stat limits; correct appearance/ability refs; valid save/import/export roundtrip.

**Special abilities:** input combination collisions; cooldown/energy; cancellation; hitbox/animation synchronization; consistent network replay; no classic regression.

**Leagues/cups:** round-robin correctness; bracket transitions; draws, draws/tiebreakers, penalties; fixture scheduling; promotion and standings.

**Career:** multiple-season simulation, finance invariants, transfers, persistence, save migrations, roster changes across seasons.

**Same-device multiplayer:** independent controller mapping, two simultaneous moves/actions, pause, reconnect, teams/ownership assignment.

**LAN and internet:** two-device clients, jitter/latency/disconnect/reconnect, desync detection, server authority, packet replay/reordering, invalid input and compatibility mismatch.

### 26.3 Test result policy

For each test report state: environment, revision SHA, fixture, preconditions, command, expected, actual, PASS/FAIL/BLOCKED/NOT RUN, evidence link/path and defect issue ID. A test not run is not a pass. For failures, fix/root-cause/retest wherever possible and rerun affected regressions.

**Definition of Done for any feature:** implementation, UI integration, content validation, unit/integration tests, updated docs, regression pass, playable demonstration, and no critical known defects.

## 27. Graphics/animation asset quality standards

- Original sprites and objects must remain unchanged in Classic Mode, verified via image diff or source-tile equivalence where feasible.
- Enhanced custom characters should inherit proportions and readability of the same established visual universe, while allowing configurable shapes.
- No AI-created artwork is automatically accepted: QA checks for face identity, physical proportions, silhouette, color consistency, animation contact frames and object overlap.
- Sprite/animation editor exports validated manifests with anchors, masks, layers, states, views and per-frame timing.
- Quality controls must separately test front, back, left, right, and 3/4 where supported, not rely on a single frontal image.
- Keep high-contrast, understandable gameplay and configurable intensity of effects.

## 28. Performance and target devices

Support current Chrome, Firefox, Edge, and Safari on modern desktop and phone hardware. Target stable original simulation timing and 60 FPS render where device/display support it; use performance measurement, not unsupported promises. Minimize draw calls, cache sprite composites, pool effects, limit memory churn, handle visibility changes and pause properly. Report measured FPS, long-frame counts, memory behavior and input latency by tested device/browser.

## 29. User experience and proposed menu architecture

Suggested **Enhanced Mode** menus (adjust after design/UX testing):

```text
Start
├── Classic NES Mode
│   └── Original game menus and functionality
├── Enhanced Mode
│   ├── Quick Match
│   │   ├── Solo vs CPU
│   │   ├── Same-device Multiplayer
│   │   └── Custom Match
│   ├── Multiplayer
│   │   ├── Same Device
│   │   ├── LAN Host / Join
│   │   └── Internet Online / Private Match / Matchmaking [when implemented]
│   ├── Career
│   │   └── Club Manager / Continue / New Career
│   ├── Cups & Leagues
│   │   ├── League
│   │   ├── Cup
│   │   ├── Custom Tournament
│   │   └── Season History
│   ├── Customization
│   │   ├── Create/Edit Player
│   │   ├── Player Appearance
│   │   ├── Teams and Rosters
│   │   ├── Kits / Club Editor
│   │   └── Abilities / Animations (when available)
│   ├── Practice / Tutorial [later]
│   └── Settings
│       ├── Gameplay / Rules / Difficulty
│       ├── Video / Graphics / Effects
│       ├── Sound / Music
│       ├── Touch Controls
│       ├── Keyboard / Gamepad Mapping
│       ├── Accessibility / Language
│       └── Save / Data / Content Packs
└── About / Credits / Legal
```

Disabled future menus must be visibly marked as **Coming Later**; do not present dead buttons as working functionality.

---

# PART V — ORDERED DEVELOPMENT ROADMAP AND DEPENDENCIES

## 30. Mandatory delivery order

The complete feature set is ambitious. **Do not attempt to build the entire future game in one untested code dump.** Develop it through dependency-ordered milestones with a playable artifact at every reasonable point. Within each milestone first repair critical defects, then implement the scoped functionality, tests, docs and builds. Do not start risky online features before the offline engine is stable.

| Stage | Name | Priority | Main outcome | Exit gate |
|---|---|---|---|---|
| 0 | Source & feasibility audit | Critical | Complete source/asset inventory, license gate, original reference fixtures | Source traceability established |
| 1 | Browser game foundation | Critical | Native loop, state, menus, asset pipeline, basic rendering | Boots in desktop and phone browser |
| 2 | Classic core gameplay | Critical | Player/ball movement, actions, collisions and AI | Repeatable playable match |
| 3 | Classic complete feature parity | Critical | Full original modes, teams, audio, sprites and behavior | Feature mapping verified, regressions pass |
| 4 | Classic multiplatform controls & QA | Critical | Touch joystick + 4 actions; remappable keyboard/gamepad; visual fidelity | PC/mobile verified and Classic release candidate |
| 5 | Enhanced mode framework | High | Rulesets, data schemas, content registries, migration | Enhanced mode isolated; Classic unchanged |
| 6 | More teams & player database | High | Configurable teams, rosters, editor, import/export | Data and match tests pass |
| 7 | Character/face/body customization | High | Compatible sprite system, presets, multi-view QA | Valid appearances persist and play |
| 8 | New animation/power systems | High | Animation pipeline, abilities, effects and balancing | Inputs and gameplay/replay tests pass |
| 9 | Cups, leagues and tournaments | High | Configurable competitions and persistent seasons | Full tournament completes and saves |
| 10 | Same-device multiplayer | High | Independent input assignment and multiplayer match | Two local players complete a match |
| 11 | Career Manager MVP | High | Club, schedule, lineup, matches, standings, save | Complete persistent season |
| 12 | Career deeper simulation | Medium | Transfers, finances, scouting, training, multiple seasons | Career progression/invariants validated |
| 13 | LAN multiplayer | High after engine stable | Host/join and sync with two separate devices | Verified real LAN match |
| 14 | Internet multiplayer | High after LAN stable | Server-hosted rooms, authoritative matches | Verified internet match and reconnect |
| 15 | Expansion polish and optional features | Continuous | Replay, localization, effects, mod API, cloud features | Individually tested releases |

The agent may parallelize **independent** work only when merge and QA ownership is clear. Never let parallel branches mutate the central match simulation in incompatible ways.

## 31. Per-iteration operating procedure

At the beginning of every iteration:

1. Inspect current repository, last commits, working tree and latest handover/progress reports.
2. Identify current milestone and check unmet exit criteria.
3. Check defects first; prioritize broken core controls, crashes, save corruption, physics/parity regressions and multiplayer authority failures.
4. Choose **one achievable vertical slice** with implementation, a user-visible result, tests and documentation.
5. List impacted modules, risks and expected regressions.

During the iteration:

6. Implement in source, use small commits, run format/lint/type/build checks.
7. Add tests and expand parity/visual regression fixtures.
8. Run the relevant tests and then the full available regression suite.
9. Reproduce, fix and retest any failure when possible.
10. Update release notes, tracking docs and unresolved issues.
11. Commit with a meaningful change summary; only push when authorization and repository access allow. Never pretend a remote push succeeded.
12. Build and open the playable output; verify actual controls where the environment allows.

At the end of every iteration report:

- Revision/branch and changed files.
- Features implemented and demo entry points.
- Defects fixed and defects still open.
- Test command, test totals (pass/fail/skipped) and evidence.
- Classic parity impact and regression status.
- Milestone completion percentage based on **requirements passed**, not subjective guesswork.
- Blockers/permissions needed from the project owner.
- Next three highest-priority tasks.

If access to a device, protected asset, credential, hosting provider or reference ROM is not available, document the block, continue on independently feasible tasks, and do not invent a result.

## 32. Development continuity, handover and context management

Long-running AI development must survive context-window limits or agent changes. Every iteration must maintain:

```text
docs/HANDOVER.md            # current state, what works, where to resume
docs/DEVELOPMENT_PLAN.md    # milestones and scope
docs/FEATURE_MATRIX.md      # original + expanded feature status
docs/ASSEMBLY_TO_JS_MAPPING.md
docs/ARCHITECTURE.md
docs/KNOWN_ISSUES.md
docs/DECISIONS.md           # architecture decisions and reasons
docs/CONTENT_SCHEMA.md
docs/INPUT_MAPPING.md
reports/LATEST_TEST_REPORT.md
reports/LATEST_GRAPHICS_QA.md
CHANGELOG.md
```

`HANDOVER.md` must contain exact run/build/test commands, branch and SHA, relevant dependencies, known bugs, in-progress files, next actions and whether the last deployment was **actually verified**. Do not wipe old files until verifying no active dependency relies on them; archive/remove obsolete generated files cautiously.

On each new AI session: **read HANDOVER, FEATURE_MATRIX, DEVELOPMENT_PLAN, latest tests and source state before writing code**. Continue from the last verified commit, not from an invented memory.

## 33. Repository and deployment practices

- Maintain `main` as stable/releasable and `dev` for active work if the project owner chooses this branching policy.
- Use feature branches for high-risk work where useful, with review/test gate before merging.
- Keep secrets/credentials out of Git history.
- Check in source and small legally distributable assets; avoid committed giant transient build outputs unless deliberately used for static deployment.
- Automate unit, integration, build and smoke tests through CI.
- Publish static client to GitHub Pages or equivalent; keep LAN/online server deployed and tested separately.
- Offer standalone single-file HTML **only if feasible**, with clear limitations around assets/server; the normal modular web app is the authoritative maintainable source.
- Include source ZIP, runnable web build, a QA report, latest handover and a verified play link only when a valid link is actually deployed.

---

# PART VI — ACCEPTANCE MATRIX AND DELIVERABLES

## 34. Original port completion checklist

- [ ] All relevant assembly code and assets analyzed and accounted for.
- [ ] Original menus/modes/progression implemented and verified.
- [ ] Original players/teams/AI/physics/controls behave equivalently.
- [ ] Original faces/object shapes/animations/palettes preserved in Classic Mode.
- [ ] Original sound/music behavior verified.
- [ ] Native browser JavaScript game, not ROM execution or emulator.
- [ ] Phone touch joystick plus four configurable actions works with simultaneous input.
- [ ] Keyboard remapping and gamepad remapping work.
- [ ] Supported PC and mobile browsers tested with evidence.
- [ ] Complete unit/integration/parity/visual/regression suites run and documented.
- [ ] Complete HTML/build/source/docs package delivered; no critical bugs.

## 35. Expanded version completion checklist (each feature independently gated)

- [ ] Enhanced Mode isolated from immutable Classic Mode.
- [ ] Arbitrary additional teams and players via validated schemas.
- [ ] Creation/editing of players, faces, bodies, hairstyles, beards, kits and colors.
- [ ] All permitted appearance combinations render correctly from supported views and animations.
- [ ] Additional verified gameplay animations, VFX and powers with balanced rules.
- [ ] Full configurable league/cup/tournament scheduler and persistence.
- [ ] Same-device local multiplayer completes a match with independent controls.
- [ ] Club Manager career supports a complete persistent season; later transfers, finances and growth.
- [ ] LAN room hosting and gameplay verified on at least two distinct network clients.
- [ ] Internet gameplay verified across networks with server authority and reconnect behavior.
- [ ] No new regression in Classic Mode caused by any expansion.
- [ ] All delivered features have tests, documentation, working demo and known-issue status.

## 36. Required final and milestone artifacts

**A. Native source code:** browser game, JS modules, HTML, CSS, data schemas, conversion tools and actual content/asset provenance.

**B. Playable game:** launchable client build, with original/Enhanced mode separation and device-responsive input. If single HTML is feasible, provide it separately from normal modular source.

**C. Network stack:** when LAN/internet stages are reached, provide separate backend source, server setup, transport protocol and deployment instructions.

**D. Tests:** automated unit, integration, original parity, visual, end-to-end, performance, career/competition, input and networking tests as applicable.

**E. Reports and documentation:**

- `README.md`
- `docs/SOURCE_CODE_ANALYSIS.md`
- `docs/ASSEMBLY_TO_JS_MAPPING.md`
- `docs/FEATURE_INVENTORY.md`
- `docs/FEATURE_MATRIX.md`
- `docs/ARCHITECTURE.md`
- `docs/GAME_STATE_ARCHITECTURE.md`
- `docs/DEPENDENCY_MAP.md`
- `docs/ASSET_INVENTORY.md`
- `docs/ORIGINAL_BEHAVIOR_SPEC.md`
- `docs/INPUT_MAPPING.md`
- `docs/CONTENT_SCHEMA.md`
- `docs/DEVELOPMENT_PLAN.md`
- `docs/HANDOVER.md`
- `docs/KNOWN_ISSUES.md`
- `docs/DECISIONS.md`
- `reports/CONVERSION_REPORT.md`
- `reports/FEATURE_PARITY_REPORT.md`
- `reports/GRAPHICS_QA_REPORT.md`
- `reports/LATEST_TEST_REPORT.md`
- `reports/REGRESSION_REPORT.md`
- `reports/NETWORK_TEST_REPORT.md` (when relevant)
- `CHANGELOG.md`

**F. Full, versioned deliverable archive:** complete source/assets permitted for distribution, tests, docs, and build instructions, excluding unnecessary temp files, emulator/ROM runtime payloads and unlicensed copyrighted material.

## 37. Source-to-code traceability table — enforceable requirement

Maintain this table as a real machine-readable CSV/JSON record and a human-readable Markdown summary:

| Original file:line/address | Classification | Discovered behavior | JS module/function or data artifact | Reference test | Status | Notes |
|---|---|---|---|---|---|---|
| Fill after analysis | Gameplay / Hardware / Build / Data | Verified detail | Exact destination | Test ID / evidence | Not analyzed / Partial / Passed | Uncertainties |

“Hardware-only” is not an excuse to omit visible behaviors. Every hardware interaction affecting visuals, timing, inputs or sound needs an equivalent browser-facing implementation. Unused padding/debug data may be omitted if properly justified.

## 38. First response and immediate actions required of the coding agent

**Start doing actual work immediately.** Your first response must include a concise high-level action plan and then proceed with tools/code rather than stopping at a plan. Specifically:

1. Obtain and inspect the complete target source directory, record commit SHA and source license status.
2. Inventory files and establish the source-to-JavaScript traceability framework.
3. Determine the original simulation/input architecture and produce verified feature/routine findings.
4. Initialize native browser app, deterministic loop, source/data conversion pipeline and tests.
5. Create a first executable/visible game foundation and run its initial smoke tests.
6. Record implemented vs planned features honestly and commit if authorized.
7. Complete the **Classic Mode first** before making sweeping changes for Enhanced Mode; prepare expansion-friendly interfaces from the beginning.
8. Advance through the milestones, prioritizing fixes before new features and preserving regression coverage.

If the source is incomplete or legal access to required copyrighted assets is unavailable, state this precisely and still implement all independently achievable architecture, conversion, test, and gameplay tasks. Do not claim to have completed original parity when key reference assets or behavior remain unverified.

**Final mandate:** Deliver the complete original NES experience as a native, high-fidelity HTML5/JavaScript game, then develop it step by step into a richer football platform with new characters/teams, face and body customization, animations, powers, leagues/cups, Club Manager career, same-device multiplayer, LAN and internet online play—**without ever sacrificing the authenticity or stability of Classic Mode.**

---

## Optional reusable prompt for the NEXT AI SESSION

> Read this entire master specification, then read `docs/HANDOVER.md`, `docs/FEATURE_MATRIX.md`, `docs/DEVELOPMENT_PLAN.md`, `reports/LATEST_TEST_REPORT.md`, and the exact Git commit state. Do not begin from scratch. Confirm the current milestone and next unresolved critical issue. Implement the highest-priority feasible vertical slice now, including source changes, tests, defect fixing, regression testing, documentation and a playable build. Protect Classic Mode from Enhanced Mode regressions. Report the actual files changed, test pass/fail/not-run totals, known gaps, artifacts, blockers and next tasks. Update HANDOVER and commit if repository permissions allow. Do not claim deployment or features without verification.
