import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyReplay} from '../src/core/Replay.js';
const fixture=JSON.parse(readFileSync(new URL('./fixtures/development-input-tape.json',import.meta.url),'utf8'));
test('committed development input fixture reproduces fixed golden checksum',()=>{
 assert.equal(fixture.frames.length,240);
 assert.equal(fixture.seed,20261019);
 assert.equal(fixture.finalHash,'e6a26591');
 assert.equal(verifyReplay(fixture).finalHash,'e6a26591');
});
