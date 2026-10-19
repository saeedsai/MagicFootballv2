import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {sha1Hex} from '../src/classic/OriginalRomSha1.js';
const nodeSha=b=>createHash('sha1').update(b).digest('hex');
test('offline SHA-1 equals Node crypto for empty, standard, boundary, and large ROM-like inputs',()=>{
 for(const n of [0,1,3,55,56,63,64,65,127,128,1000,262160]){
  const b=Uint8Array.from({length:n},(_,i)=>(i*41+7)&255);
  assert.equal(sha1Hex(b),nodeSha(b),`length ${n}`);
 }
});
test('offline SHA-1 validates binary input size',()=>{
 assert.throws(()=>sha1Hex('abc'),TypeError);
 assert.throws(()=>sha1Hex(new Uint8Array(4*1024*1024+1)),RangeError);
});
