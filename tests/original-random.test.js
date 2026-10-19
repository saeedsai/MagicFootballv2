import test from 'node:test';
import assert from 'node:assert/strict';
import {createOriginalRandomState,stepOriginalRandom} from '../src/classic/OriginalRandom.js';
test('original RNG source $EE35 feedback bit 1 and ROR chain',()=>{
 const s=createOriginalRandomState(0x02,0x00);
 assert.equal(stepOriginalRandom(s),0x81);
 assert.deepEqual(s,{byte45:0x81,byte46:0});
 assert.equal(stepOriginalRandom(s),0x40);
 assert.deepEqual(s,{byte45:0x40,byte46:0x80});
});
test('RNG feedback can originate from second byte',()=>{
 const s=createOriginalRandomState(0,2);
 assert.equal(stepOriginalRandom(s),128);
 assert.equal(s.byte46,1);
});
test('RNG old bit 0 of byte45 propagates to byte46',()=>{
 const s=createOriginalRandomState(1,0);
 assert.equal(stepOriginalRandom(s),0);
 assert.equal(s.byte46,128);
});
test('zero RNG state remains zero (no invented reseed)',()=>{
 const s=createOriginalRandomState();
 for(let i=0;i<100;i++)assert.equal(stepOriginalRandom(s),0);
 assert.deepEqual(s,{byte45:0,byte46:0});
});
test('original RNG validation and full 16-bit state domain',()=>{
 assert.throws(()=>createOriginalRandomState(256,0),/8-bit/);
 assert.throws(()=>stepOriginalRandom({byte45:-1,byte46:0}),/invalid/);
 for(let n=0;n<65536;n+=97){
  const a=n&255,b=n>>8,s=createOriginalRandomState(a,b);
  const got=stepOriginalRandom(s);
  assert.equal(got,((a>>1)|(((a^b)&2)<<6))&255);
  assert.equal(s.byte46,(b>>1)|((a&1)<<7));
 }
});
