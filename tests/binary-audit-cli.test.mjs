import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const script = new URL('../tools/audit_nes_binary.mjs', import.meta.url);
const run = args => spawnSync(process.execPath, [script.pathname, ...args], { encoding: 'utf8' });

test('restored original binary audit tool is byte-identical', async () => {
 const bytes = await readFile(script);
 const sha = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
 assert.equal(sha, '1c5129c786bbe3e974d9b68552e2d5a81c465285');
});

test('binary audit refuses missing argument without reading files', () => {
 const result = run([]);
 assert.equal(result.status, 2);
 assert.match(result.stderr, /Usage:/);
});

test('binary audit reports synthetic raw CHR without embedding its contents', async () => {
 const dir = await mkdtemp(join(tmpdir(), 'mfv2-chr-'));
 try {
  const file = join(dir, 'synthetic.chr');
  await writeFile(file, Buffer.alloc(16));
  const result = run([file]);
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.source, 'raw CHR');
  assert.equal(report.chr.tileCount, 1);
  assert.equal(report.chr.expectedSourceSize, false);
  assert.equal(report.reference.matchesPinnedCHRBlob, false);
  assert.equal(report.reference.matchesPinnedOriginalROM, false);
 } finally { await rm(dir, { recursive: true, force: true }); }
});

test('binary audit refuses malformed CHR without exposing file bytes', async () => {
 const dir = await mkdtemp(join(tmpdir(), 'mfv2-invalid-'));
 try {
  const file = join(dir, 'invalid.chr');
  await writeFile(file, Buffer.alloc(15, 0x41));
  const result = run([file]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Raw CHR length/);
  assert.equal(result.stdout, '');
 } finally { await rm(dir, { recursive: true, force: true }); }
});
