# Graphics QA — iteration 2

Headless Chromium captured `desktop-home.png`, `desktop-match.png`, and `mobile-landscape-match.png`. Desktop 1280×850 and simulated mobile landscape 844×390 show the existing procedural field, provisional characters and four touch buttons. The replay controls fit in the top navigation at both tested sizes. No JavaScript page errors. Visual QA remains limited: **original NES faces, bodies, sprites and animation are not included and cannot be parity-tested**; real device and high-DPI testing pending. The development artwork is intentionally not claimed to match the original.

## Iteration 7 graphics regression note

No graphics assets, player silhouettes, animation or renderer code were changed. Existing schematic Enhanced match rendering was exercised in desktop Chromium and mobile landscape emulation with zero page errors. This is **not** original NES graphics fidelity or visual golden parity; no physical-device screenshot comparison was run. New original possession research panel is visible in `screenshots/original-possession-control-lab.png`.
