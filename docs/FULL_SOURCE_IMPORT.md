# Restoring the authoritative modular source tree

The bootstrap GitHub `main` branch contains a byte-identical Iteration 15 HTML build, plus source handover and manifest references, **but not yet the full modular 185-file Git tree**.

The source archive is named `Kunio_Soccer_Iteration_15_Source.zip` and has SHA-256:
`aa0b2e06caf54d3073d900439e7f015abacf754b407f805b3e0bc43cfa1e1f63`.

Do this in a computer/runner with Git network access and the authorized archive:

```bash
git clone https://github.com/saeedsai/MagicFootballv2.git
cd MagicFootballv2
git switch -c source/import-iteration15
unzip -q /path/to/Kunio_Soccer_Iteration_15_Source.zip -d /tmp/kunio-v15
# Copy files (not the old .git object store) into this checkout:
rsync -av --exclude=.git --exclude=local/ --exclude='*.nes' --exclude='*.chr' \
  --exclude='*.bin' --exclude='*.zip' --exclude='standalone-private.html' \
  /tmp/kunio-v15/kunio-soccer/ ./
# Preserve/merge GitHub migration docs & CI as needed.
git status --short
npm test
npm run check
npm run build
git add -A
git commit -m 'feat: migrate complete iteration-15 modular source'
git push -u origin source/import-iteration15
```

Open a pull request into main, review differences, and merge only after tests and source provenance are checked. The ZIP contains previous Git history as well; preserve a separate archival Git bundle/tag if preserving full ancestry is required (rather than force-pushing main). Original binary data remains local-only. Never silently remove functionality or claim the original game is finished.
