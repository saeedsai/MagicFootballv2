# Dependencies

Browser: `index.html` → `src/main.js` → `Match.js`, `InputManager.js`, `Renderer.js`; Canvas 2D; standard Gamepad API; Pointer Events; optional localStorage. No npm runtime packages, no framework, ROM, NES emulator or server required to play offline.

Build: `tools/build.mjs` copies modular sources and creates one self-contained `dist/standalone.html` by concatenating this revision's known ES modules in dependency order. **Adding exports/imports or renaming modules requires updating the build script.**

Testing: Node 20+ native `node:test`; optional Python Playwright and system Chromium for actual headless browser smoke tests. The standalone smoke suite does not verify actual physical devices or every browser engine.

Future: licensed CHR/audio importer and original parity fixtures feed Classic data, not the development gameplay module; separate Enhanced content validation; server and networking only after offline rules become stable.


Iteration 2: `src/main.js` additionally imports `src/core/Replay.js` (which imports `src/core/Match.js`). `src/classic/OriginalStateIds.js` contains only source-confirmed numeric metadata and is not used by gameplay. The standalone builder includes both modules; the recorder is integrated into the browser UI. `tools/verify_replay.mjs` runs the same verification headlessly. See `docs/REPLAY_FORMAT.md`.

Iteration 7: `src/main.js` imports `src/classic/OriginalPossessionControl.js` only for the research panel. `tools/build.mjs` copies it to `dist/src/classic/` and includes it in the offline standalone. No new npm runtime dependencies, network services or ROM assets.

### Iteration 9 — bank06 action arbitration (source-local only)
Pinned bank_06.asm `$AA14–$AAAB` and metadata `$AC65–$AD40` were inspected and ported into `src/classic/OriginalActionArbitration.js`. It can consume a pending `$0479` action and conditionally replace `$0459` movement on synthetic RAM, preserving weather and state gates and metadata-table overlap. See `docs/ORIGINAL_ACTION_ARBITRATION_TRACE.md`. This **does not** execute original movement, ball physics, animations or a Classic frame; original NES runtime parity remains blocked.
