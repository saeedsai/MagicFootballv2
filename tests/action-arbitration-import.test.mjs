import test from 'node:test';
import assert from 'node:assert/strict';
import {ORIGINAL_ACTION_METADATA_BASES,readOriginalActionMetadata,createOriginalActionArbitrationRam,stepOriginalActionArbitration} from '../src/classic/OriginalActionArbitration.js';

test('pinned action table pointers and source record bytes',()=>{
 assert.deepEqual(ORIGINAL_ACTION_METADATA_BASES,[0xac87,0xac69]);
 assert.deepEqual(readOriginalActionMetadata(1),{address:0xac89,flags:0x24,priority:0});
});
test('pinned source metadata 216-byte FNV-1a checksum',()=>{
 let hash=2166136261>>>0;
 for(let action=0;action<108;action++){
  const {flags,priority}=readOriginalActionMetadata(action,1);
  hash=Math.imul(hash^flags,16777619)>>>0;
  hash=Math.imul(hash^priority,16777619)>>>0;
 }
 assert.equal(hash.toString(16).padStart(8,'0'),'842d899c');
});
test('source action arbitration accepts a higher-priority movement',()=>{
 const ram=createOriginalActionArbitrationRam({player:2,action:4,movement:0x82});
 const result=stepOriginalActionArbitration(ram,2);
 assert.equal(result.reason,'$AA94-accepted-action');
 assert.equal(ram[0x459+2],4);
 assert.equal(ram[0x479+2],0xff);
});
test('reject out-of-source metadata bounds rather than invent bytes',()=>{
 assert.throws(()=>readOriginalActionMetadata(93),/outside audited/);
 assert.throws(()=>readOriginalActionMetadata(108,1),/outside audited/);
});
