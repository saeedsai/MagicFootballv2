import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
test('bootstrapped Iteration 15 browser entry point is nonempty', () => {
  assert.ok(html.length > 160_000);
  assert.match(html, /<canvas id="field"/);
  assert.match(html, /<script>/);
  assert.match(html, /<\/script><\/body><\/html>/);
});
test('Classic Mode remains marked unverified', () => {
  assert.match(html, /Classic Mode is still disabled/);
  assert.match(html, /separate development match is provisional/);
});
test('original research and ROM import are present', () => {
  assert.match(html, /stepOriginalWeatherSprites/);
  assert.match(html, /Original NES CHR binary graphics laboratory/);
  assert.match(html, /df2c8e55/);
});
test('protected binary source files are not committed in bootstrap root', async () => {
  const files = await readdir(new URL('../', import.meta.url));
  assert.ok(!files.some(f => /\.(nes|chr|bin|zip)$/i.test(f)));
});
