import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assess, blobSha, restricted, PINNED_UPSTREAM, REQUIRED_MODULES } from '../tools/migration-audit.mjs';

const sample = (paths = []) => assess(paths, Buffer.from('Classic Mode is still disabled'), '**Migration state:** INCOMPLETE', PINNED_UPSTREAM);

test('Git blob hash follows canonical Git framing', () => {
  assert.equal(blobSha(Buffer.from('test content\n')), 'd670460b4b4aece5915caf5c68d12f560a9fe3e4');
});
test('private binaries and archives are not valid tracked files', () => {
  assert.equal(restricted('fixtures/private.chr'), true);
  assert.equal(restricted('local/private.zip'), true);
  assert.equal(restricted('src/main.js'), false);
});
test('missing modular source cannot count as completed migration', () => {
  const report = sample(['index.html', 'README.md']);
  assert.equal(report.sourceCandidate, false);
  assert.deepEqual(report.missingModules, REQUIRED_MODULES);
  assert.equal(report.migrationVerifiedComplete, false);
});
test('185 documentation files are not a substitute for modules', () => {
  const report = sample(Array.from({ length: 185 }, (_, i) => 'docs/' + i + '.md'));
  assert.equal(report.sourceCandidate, false);
});
test('a false COMPLETE status is reported as a failure', () => {
  const report = assess([], Buffer.from('Classic Mode is still disabled'), '**Migration state:** COMPLETE', PINNED_UPSTREAM);
  assert.ok(report.errors.some(error => error.includes('False migration')));
});
test('candidate module presence never automatically establishes verified parity', () => {
  const paths = [...REQUIRED_MODULES, ...Array.from({ length: 182 }, (_, i) => i < 21 ? 'tests/fixture' + i + '.test.js' : 'src/fixture' + i + '.js')];
  const report = sample(paths);
  assert.equal(report.sourceCandidate, true);
  assert.equal(report.migrationVerifiedComplete, false);
});
