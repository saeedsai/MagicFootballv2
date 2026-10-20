import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareArchivedTree } from '../tools/archive-diff.mjs';

const sha = 'a'.repeat(40);
const original = {trackedFileCount:1, files:[{path:'src/a.js', blobSha:sha}]};

test('rejects duplicate remote paths rather than silently replacing Git metadata', () => {
  assert.throws(() => compareArchivedTree(original, [['src/a.js',sha],['src/a.js',sha]]), /duplicate remote/);
});

test('rejects malformed remote blob identifiers', () => {
  assert.throws(() => compareArchivedTree(original, [['src/a.js','not-a-sha']]), /Invalid or duplicate remote/);
});

test('rejects invalid remote entries and missing metadata', () => {
  assert.throws(() => compareArchivedTree(original, [['src/a.js']]), /Invalid or duplicate remote/);
  assert.throws(() => compareArchivedTree(original, null), /iterable/);
});

test('extra remote files do not change exact archived file count or imply history restoration', () => {
  const result = compareArchivedTree(original, [['src/a.js',sha],['new-test.js',sha]]);
  assert.equal(result.completeTreeMatch, true);
  assert.deepEqual(result.added, ['new-test.js']);
  assert.equal(result.originalGitAncestryRestored, false);
});
