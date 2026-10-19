import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

export const PINNED_HTML_BLOB = 'd051badfcb2311c0b6b66af09c9d87d32e04b534';
export const PINNED_UPSTREAM = 'df2c8e55e7f13e5792482527db9e7c9e4a84c6e1';
export const REQUIRED_MODULES = ['src/classic/OriginalWeatherSprites.js', 'src/classic/OriginalRomSha1.js', 'tests/original-weather-sprites.test.js'];
export const blobSha = bytes => createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
export const restricted = path => /\.(nes|chr|prg|dpcm|nsf|bin|zip)$/i.test(path) || /(^|\/)standalone-private\.html$/i.test(path);
export function assess(paths, html, status, readme) {
  const missingModules = REQUIRED_MODULES.filter(path => !paths.includes(path));
  const sourceCount = paths.filter(path => /^src\/.*\.(?:js|mjs)$/i.test(path)).length;
  const testCount = paths.filter(path => /^tests\/.*\.(?:js|mjs)$/i.test(path)).length;
  const sourceCandidate = paths.length >= 185 && sourceCount >= 100 && testCount >= 1 && missingModules.length === 0;
  const forbidden = paths.filter(restricted);
  const errors = [];
  if (forbidden.length) errors.push('Restricted asset/archive tracked');
  if (!sourceCandidate && blobSha(html) !== PINNED_HTML_BLOB) errors.push('Bootstrap HTML hash changed before source migration');
  if (!readme.includes(PINNED_UPSTREAM)) errors.push('Pinned upstream SHA absent');
  if (!html.toString().includes('Classic Mode is still disabled')) errors.push('Classic disabled marker absent');
  if (!sourceCandidate && /^\*\*Migration state:\*\* COMPLETE$/m.test(status)) errors.push('False migration-complete claim');
  return { trackedFiles: paths.length, sourceCount, testCount, missingModules, sourceCandidate, migrationVerifiedComplete: false, forbidden, errors };
}
export function audit(root = '.') {
  const paths = execFileSync('git', ['ls-files', '-z'], { cwd: root }).toString().split('\0').filter(Boolean);
  const read = name => readFileSync(root + '/' + name);
  return assess(paths, read('index.html'), read('MIGRATION_STATUS.md').toString(), read('README.md').toString());
}
if (process.argv[1]?.endsWith('/migration-audit.mjs')) {
  const result = audit(new URL('..', import.meta.url).pathname);
  if (process.argv.includes('--require-full-source') && !result.sourceCandidate) result.errors.push('Full modular source missing');
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  if (result.errors.length) process.exitCode = 1;
}
