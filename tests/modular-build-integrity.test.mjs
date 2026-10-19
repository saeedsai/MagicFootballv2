import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const hash=b=>createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
test('public modular build reproduces pinned standalone without changing root',async()=>{
 const before=await readFile(new URL('../index.html',import.meta.url));
 const run=spawnSync(process.execPath,[new URL('../tools/build.mjs',import.meta.url).pathname],{encoding:'utf8'});
 assert.equal(run.status,0,run.stderr);
 const after=await readFile(new URL('../index.html',import.meta.url));
 const output=await readFile(new URL('../dist/standalone.html',import.meta.url));
 const modular=await readFile(new URL('../dist/index.html',import.meta.url));
 assert.equal(hash(before),'d051badfcb2311c0b6b66af09c9d87d32e04b534');
 assert.deepEqual(after,before);
 assert.deepEqual(output,before);
 assert.equal(hash(modular),'ad09958a166c4ae5802b9f58c23fdf88e77d9e4e');
});
