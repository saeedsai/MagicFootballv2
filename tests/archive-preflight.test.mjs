import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deflateRawSync } from 'node:zlib';
import { inspectArchive, classifyPath, EXPECTED_ARCHIVE_SHA256 } from '../tools/archive-preflight.mjs';

function crc32(bytes) {
  let c = 0xffffffff;
  for (const b of bytes) {
    c ^= b;
    for (let j = 0; j < 8; j++) c = (c >>> 1) ^ ((c & 1) ? 0xedb88320 : 0);
  }
  return (c ^ 0xffffffff) >>> 0;
}
function zip(specs) {
  const locals = [], centrals = [];
  let offset = 0;
  for (const item of specs) {
    const name = Buffer.from(item.name), data = Buffer.from(item.data ?? '');
    const method = item.deflate ? 8 : 0;
    const compressed = method ? deflateRawSync(data) : data;
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(method, 8);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(method, 10);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    if (item.mode) central.writeUInt32LE(item.mode << 16, 38);
    locals.push(local, name, compressed);
    centrals.push(central, name);
    offset += local.length + name.length + compressed.length;
  }
  const cd = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(specs.length, 8);
  end.writeUInt16LE(specs.length, 10);
  end.writeUInt32LE(cd.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, end]);
}
test('authentic Iteration 15 archive digest is pinned', () => {
  assert.equal(EXPECTED_ARCHIVE_SHA256, 'aa0b2e06caf54d3073d900439e7f015abacf754b407f805b3e0bc43cfa1e1f63');
});
test('ZIP preflight lists hashed source without pretending to verify Git history', () => {
  const result = inspectArchive(zip([
    { name: 'kunio-soccer/src/classic/OriginalRomSha1.js', data: 'export const ok = true;\n', deflate: true },
    { name: 'kunio-soccer/tests/fixture.test.js', data: 'test\n' }
  ]));
  assert.equal(result.zipFileCount, 2);
  assert.equal(result.candidateCount, 2);
  assert.equal(result.rootPrefix, 'kunio-soccer/');
  assert.match(result.files[0].gitBlobSha, /^[0-9a-f]{40}$/);
  assert.equal(result.migrationComplete, false);
  assert.equal(result.trackedFileCountVerified, false);
  assert.equal(result.historicalGitObjectsImported, false);
});
test('protected ROM, Git internals and derived art never become automatic candidates', () => {
  const result = inspectArchive(zip([
    { name: 'project/.git/objects/00/123', data: 'git' },
    { name: 'project/local/original.chr', data: 'private' },
    { name: 'project/assets/character.png', data: 'art' },
    { name: 'project/src/logic.js', data: 'js' }
  ]));
  assert.equal(result.excludedCount, 2);
  assert.equal(result.rightsReviewCount, 1);
  assert.equal(result.candidateCount, 1);
  assert.equal(classifyPath('dist/standalone-private.html'), 'excluded');
  assert.equal(classifyPath('audio/track.wav'), 'rights-review');
});
test('a different archive digest is rejected before inspecting contents', () => {
  assert.throws(() => inspectArchive(zip([{ name: 'src/main.js', data: 'x' }]),
    { expectedSha256: EXPECTED_ARCHIVE_SHA256 }), /SHA-256 mismatch/);
});
test('path traversal and Windows drive paths are rejected', () => {
  for (const name of ['../escape.js', 'src/../escape.js', 'C:/escape.js', 'src\\escape.js', '/absolute.js']) {
    assert.throws(() => inspectArchive(zip([{ name, data: 'x' }])), /Unsafe ZIP entry/);
  }
});
test('duplicate entry names are rejected', () => {
  assert.throws(() => inspectArchive(zip([
    { name: 'src/a.js', data: 'a' }, { name: 'src/a.js', data: 'b' }
  ])), /Duplicate ZIP path/);
});
test('corrupted entry data is rejected by CRC check', () => {
  const bytes = zip([{ name: 'src/a.js', data: 'good' }]);
  bytes[30 + Buffer.byteLength('src/a.js')] ^= 1;
  assert.throws(() => inspectArchive(bytes), /CRC\/size mismatch/);
});
test('symlinks are rejected even when their payload is valid', () => {
  assert.throws(() => inspectArchive(zip([
    { name: 'src/link', data: 'target', mode: 0o120777 }
  ])), /symlink ZIP entry/);
});
test('entry and archive size limits reject zip bombs', () => {
  assert.throws(() => inspectArchive(zip([{ name: 'src/a.js', data: '123456' }]),
    { maxFileBytes: 5 }), /size safety limit/);
});
