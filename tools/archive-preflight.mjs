// Read-only integrity and rights preflight for the exact Iteration 15 ZIP.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { inflateRawSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

export const EXPECTED_ARCHIVE_SHA256 = 'aa0b2e06caf54d3073d900439e7f015abacf754b407f805b3e0bc43cfa1e1f63';
const sha = (algorithm, bytes) => createHash(algorithm).update(bytes).digest('hex');
const gitBlob = bytes => createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
const read32 = (b, i) => b.readUInt32LE(i);
const within = (b, i, n) => Number.isSafeInteger(i) && i >= 0 && n >= 0 && i + n <= b.length;
const crc32 = bytes => {
  let c = 0xffffffff;
  for (const byte of bytes) {
    c ^= byte;
    for (let j = 0; j < 8; j++) c = (c >>> 1) ^ ((c & 1) ? 0xedb88320 : 0);
  }
  return (c ^ 0xffffffff) >>> 0;
};

export function classifyPath(path) {
  if (/(^|\/)\.git(\/|$)/.test(path) || /(^|\/)(?:local|private)(\/|$)/i.test(path)
      || /(^|\/)\.env(?:\.|$)/i.test(path) || /(^|\/)standalone-private\.html$/i.test(path)
      || /\.(?:nes|chr|prg|dpcm|nsf|bin|rom|zip|7z|rar)$/i.test(path)) return 'excluded';
  if (/\.(?:png|jpe?g|gif|webp|bmp|svg|wav|ogg|mp3|flac|mid|midi|mp4|webm)$/i.test(path)) return 'rights-review';
  return 'candidate';
}

function checkedName(raw) {
  const name = new TextDecoder('utf-8', { fatal: true }).decode(raw);
  if (!name || name.startsWith('/') || /^[a-z]:/i.test(name) || name.includes('\\')
      || /[\u0000-\u001f\u007f]/.test(name)) throw new Error('Unsafe ZIP entry name');
  const parts = name.replace(/\/$/, '').split('/');
  if (parts.some(p => !p || p === '.' || p === '..')) throw new Error('Unsafe ZIP entry path: ' + name);
  return name;
}

export function inspectArchive(bytes, { expectedSha256 = null, maxEntries = 10000,
  maxFileBytes = 32 * 1024 * 1024, maxTotalBytes = 256 * 1024 * 1024 } = {}) {
  const b = Buffer.from(bytes);
  const archiveSha256 = sha('sha256', b);
  if (expectedSha256 && archiveSha256 !== expectedSha256) throw new Error('Archive SHA-256 mismatch: refusing untrusted ZIP');
  let end = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 65557); i--) {
    if (read32(b, i) === 0x06054b50 && i + 22 + b.readUInt16LE(i + 20) === b.length) { end = i; break; }
  }
  if (end < 0) throw new Error('ZIP end-of-central-directory not found');
  if (b.readUInt16LE(end + 4) || b.readUInt16LE(end + 6)) throw new Error('Multi-disk ZIP unsupported');
  const count = b.readUInt16LE(end + 10);
  const size = read32(b, end + 12), offset = read32(b, end + 16);
  if (count !== b.readUInt16LE(end + 8) || count === 0xffff || count > maxEntries
      || size === 0xffffffff || offset === 0xffffffff || offset + size > end)
    throw new Error('Invalid or unsupported ZIP directory');
  const entries = [];
  const seen = new Set();
  let cursor = offset, totalBytes = 0;
  for (let i = 0; i < count; i++) {
    if (!within(b, cursor, 46) || read32(b, cursor) !== 0x02014b50) throw new Error('Invalid central ZIP entry');
    const flags = b.readUInt16LE(cursor + 8), method = b.readUInt16LE(cursor + 10);
    const crc = read32(b, cursor + 16), compressed = read32(b, cursor + 20);
    const length = read32(b, cursor + 24), nameLength = b.readUInt16LE(cursor + 28);
    const extra = b.readUInt16LE(cursor + 30), comment = b.readUInt16LE(cursor + 32);
    const mode = read32(b, cursor + 38) >>> 16, local = read32(b, cursor + 42);
    if (!within(b, cursor, 46 + nameLength + extra + comment) || cursor + 46 + nameLength + extra + comment > offset + size)
      throw new Error('Truncated ZIP central entry');
    const rawName = b.subarray(cursor + 46, cursor + 46 + nameLength);
    const name = checkedName(rawName);
    cursor += 46 + nameLength + extra + comment;
    if (seen.has(name)) throw new Error('Duplicate ZIP path: ' + name);
    seen.add(name);
    if (flags & 1 || (method !== 0 && method !== 8) || (mode & 0o170000) === 0o120000)
      throw new Error('Encrypted, unsupported or symlink ZIP entry: ' + name);
    if (compressed === 0xffffffff || length === 0xffffffff || local === 0xffffffff)
      throw new Error('ZIP64 entry unsupported');
    if (name.endsWith('/')) continue;
    totalBytes += length;
    if (length > maxFileBytes || totalBytes > maxTotalBytes) throw new Error('ZIP size safety limit exceeded');
    if (!within(b, local, 30) || read32(b, local) !== 0x04034b50) throw new Error('Invalid ZIP local header');
    const localNameLength = b.readUInt16LE(local + 26), localExtra = b.readUInt16LE(local + 28);
    const start = local + 30 + localNameLength + localExtra;
    if (!within(b, local + 30, localNameLength + localExtra) || !within(b, start, compressed)
        || start + compressed > offset || b.readUInt16LE(local + 8) !== method
        || !b.subarray(local + 30, local + 30 + localNameLength).equals(rawName))
      throw new Error('ZIP local/central mismatch: ' + name);
    const payload = b.subarray(start, start + compressed);
    const content = method === 0 ? payload : inflateRawSync(payload, { maxOutputLength: maxFileBytes });
    if (content.length !== length || crc32(content) !== crc) throw new Error('ZIP CRC/size mismatch: ' + name);
    entries.push({ name, bytes: length, sha256: sha('sha256', content), gitBlobSha: gitBlob(content) });
  }
  if (cursor !== offset + size) throw new Error('ZIP directory length mismatch');
  const first = entries[0]?.name.split('/')[0];
  const standard = new Set(['src', 'tests', 'tools', 'docs', 'reports', 'dist', '.git']);
  const stripRoot = first && !standard.has(first) && entries.every(e => e.name.startsWith(first + '/'));
  const files = entries.map(e => {
    const path = stripRoot ? e.name.slice(first.length + 1) : e.name;
    return { path, bytes: e.bytes, sha256: e.sha256, gitBlobSha: e.gitBlobSha, classification: classifyPath(path) };
  });
  if (new Set(files.map(e => e.path)).size !== files.length) throw new Error('Duplicate normalized ZIP path');
  return {
    archiveSha256, archiveBytes: b.length, zipFileCount: files.length,
    rootPrefix: stripRoot ? first + '/' : '',
    candidateCount: files.filter(e => e.classification === 'candidate').length,
    rightsReviewCount: files.filter(e => e.classification === 'rights-review').length,
    excludedCount: files.filter(e => e.classification === 'excluded').length,
    trackedFileCountVerified: false, historicalGitObjectsImported: false, migrationComplete: false, files
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    if (process.argv.length !== 3) throw new Error('Usage: node tools/archive-preflight.mjs /path/to/Kunio_Soccer_Iteration_15_Source.zip');
    const result = inspectArchive(readFileSync(process.argv[2]), { expectedSha256: EXPECTED_ARCHIVE_SHA256 });
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } catch (error) {
    process.stderr.write('ARCHIVE PREFLIGHT FAILED: ' + error.message + '\n');
    process.exitCode = 1;
  }
}
