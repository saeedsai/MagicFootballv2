# Input tape / replay contract — iteration 2 (development ruleset only)

This implementation adds **deterministic input-frame capture and verification** to the *independent* `enhanced-dev` simulation. It is not a reconstruction of the NES replay, input polling or frame order. The original NES parity test suite still requires a lawful reference execution and source-derived Classic implementation.

## Format and reproducibility

`src/core/Replay.js` records the exact normalized input consumed by `stepMatch` at each call. Every frame contains `{dx,dy,shoot,pass,tackle,sprint,switch,pause}`; axes are clamped to [-1,1] and rounded to six decimals **before** being simulated and stored. Every replay has `format`, `schemaVersion`, `mode`, `rulesVersion`, `tickRate`, `seed`, `frames`, `checkpoints` and `finalHash`. It refuses mode/rules mismatches and malformed, oversized or incompatible files. `mode='enhanced-dev'` and `rulesVersion='enhanced-dev-0.1'` are mandatory; Classic recordings are not accepted or invented.

The entire simulation object is serialized in a stable property order and hashed using 32-bit FNV-1a at every 120 input frames and at the end. The hash is a **non-cryptographic drift detector**, not a security signature or proof of NES parity. A malicious actor can edit frames and recompute hashes. Browser import is limited to 4 MB and at most 24,000 input frames. The match itself remains the previous 180-second development game; paused idle frames are not recorded when they do not change state.

## Use

1. Press **Play Development Match**. A fresh match starts recording automatically, including input edges and menu Pause/Switch actions.
2. Press **Save Replay** to download a versioned JSON input tape. Saving does not end the match; the file represents the state when the button was clicked.
3. Press **Load Replay** to import the JSON. The game restarts from the recorded seed and plays the recorded input sequence at 60 Hz. Pause/Resume controls *playback*, not the original recorded input. Final checksum validation is shown when playback completes; mismatches stop playback.
4. Run `npm run replay:verify -- tests/fixtures/development-input-tape.json` to verify a replay headlessly, with nonzero exit code on failure.

`tests/fixtures/development-input-tape.json` is a 240-frame **development** golden fixture. Its checksum is pinned by `tests/replay-fixture.test.js`; do not regenerate it silently when changing rules. If rules intentionally change, bump the rules version, add a new fixture, and document the migration rather than changing the expected checksum to hide a regression.

## Known limitations

- No seek/scrub, highlights, instant replay, frame visualization or audio; playback is sequential.
- Original NES frame, controller bit masks and state traces have not been reconstructed. The `.fm2` upstream files have not been decoded/replayed.
- Gamepad and phone tests are emulated in Chromium only, not verified on physical devices.
- Paused browser tabs trigger a recorded pause input. Playback of a saved file does not reproduce real-world idle duration, only the exact sequence of recorded simulation input frames.
- FNV checksum comparison requires identical JS numerical behavior and state serialization; cross-engine browser parity and independent devices remain to be tested.

## Iteration 9 integrity clarification

Replay checkpoint and final hashes are hashes of simulated development-match state. They can detect state divergence but **do not authenticate every input byte**: a change to first-frame `dx` that leaves state unchanged passes validation (KI-025), while gameplay-changing edits are rejected. A future versioned schema should include a digest of the serialized input tape if exact input-content integrity is required.
