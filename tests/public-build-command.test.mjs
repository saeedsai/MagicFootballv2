import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

test('npm build command invokes the public modular builder', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.scripts.build, 'node tools/build.mjs');
  const source = readFileSync(new URL('../tools/build.mjs', import.meta.url), 'utf8');
  assert.match(source, /new URL\('\.\.\/dist\/'/);
  assert.match(source, /copyFile\(new URL\('modular\.html'/);
  assert.doesNotMatch(source, /standalone-private\.html|original\.chr/);
});
test('original standalone remains pinned and Classic Mode stays disabled', () => {
  const data = readFileSync(new URL('../index.html', import.meta.url));
  const sha = createHash('sha1').update('blob ' + data.length + '\0').update(data).digest('hex');
  assert.equal(sha, 'd051badfcb2311c0b6b66af09c9d87d32e04b534');
  assert.match(data.toString(), /Classic Mode is still disabled/);
});
