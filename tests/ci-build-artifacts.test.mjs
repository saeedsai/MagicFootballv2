import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const gitBlob = data => createHash('sha1')
  .update('blob ' + data.length + '\0').update(data).digest('hex');

test('CI executes the public build and preserves both entrypoints', () => {
  const before = readFileSync(new URL('../index.html', import.meta.url));
  assert.equal(gitBlob(before), 'd051badfcb2311c0b6b66af09c9d87d32e04b534');
  const output = execFileSync(process.execPath, ['tools/build.mjs'], {
    cwd: root, encoding: 'utf8', timeout: 30000
  });
  assert.match(output, /Built public modular and standalone outputs/);
  const after = readFileSync(new URL('../index.html', import.meta.url));
  assert.deepEqual(after, before, 'the published standalone entrypoint must not change');
  const modular = readFileSync(new URL('../modular.html', import.meta.url));
  assert.deepEqual(readFileSync(new URL('../dist/index.html', import.meta.url)), modular);
  assert.deepEqual(readFileSync(new URL('../dist/modular.html', import.meta.url)), modular);
  const standalone = readFileSync(new URL('../dist/standalone.html', import.meta.url), 'utf8');
  assert.match(standalone, /window\.__kunioLocalCHRVerified=false/);
  const info = JSON.parse(readFileSync(new URL('../dist/BUILD_INFO.json', import.meta.url), 'utf8'));
  assert.equal(info.classicParity, 'NOT VERIFIED');
  assert.equal(info.privateOriginalChrIncluded, false);
  assert.equal(info.files.length, 22);
});
