import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const blob = bytes => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');

test('pinned standalone yields the exact original modular HTML without publishing private assets', async () => {
 const standalone = await readFile(new URL('../index.html', import.meta.url));
 const css = await readFile(new URL('../styles.css', import.meta.url));
 assert.equal(blob(standalone), 'd051badfcb2311c0b6b66af09c9d87d32e04b534');
 assert.equal(blob(css), 'f37e291e2bb60974b0fed4be3f0044920227a808');
 const text = standalone.toString('utf8');
 assert.equal((text.match(/<style>/g) || []).length, 1);
 assert.equal((text.match(/<script>/g) || []).length, 1);
 const modular = text.replace(/<style>[\s\S]*?<\/style>/, '<link rel="stylesheet" href="./styles.css">')
   .replace(/<script>[\s\S]*?<\/script>/, '<script type="module" src="./src/main.js"></script>');
 assert.equal(blob(Buffer.from(modular)), 'ad09958a166c4ae5802b9f58c23fdf88e77d9e4e');
 assert.match(text, /Classic Mode is still disabled/);
});
