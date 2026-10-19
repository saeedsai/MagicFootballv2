import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {deflateRawSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {readNesFromZip,crc32,inspectOriginalRom,REFERENCE_HEADER} from '../tools/rom_archive.mjs';
import {parseINes,decodeTile,ORIGINAL_CHR_GIT_BLOB,ORIGINAL_ROM_SHA1} from '../src/classic/NesBinaryAssets.js';
function makeZip(name,payload,{method=8,corruptCRC=false}={}){
 const raw=Buffer.from(payload),encoded=method===8?deflateRawSync(raw):raw;
 const fn=Buffer.from(name,'utf8'),crc=(crc32(raw)+(corruptCRC?1:0))>>>0;
 const local=Buffer.alloc(30);local.writeUInt32LE(0x04034b50);local.writeUInt16LE(20,4);local.writeUInt16LE(method,8);
 local.writeUInt32LE(crc,14);local.writeUInt32LE(encoded.length,18);local.writeUInt32LE(raw.length,22);local.writeUInt16LE(fn.length,26);
 const central=Buffer.alloc(46);central.writeUInt32LE(0x02014b50);central.writeUInt16LE(20,4);central.writeUInt16LE(20,6);
 central.writeUInt16LE(method,10);central.writeUInt32LE(crc,16);central.writeUInt32LE(encoded.length,20);central.writeUInt32LE(raw.length,24);
 central.writeUInt16LE(fn.length,28);
 const cdOffset=local.length+fn.length+encoded.length,cdSize=central.length+fn.length;
 const end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(1,8);end.writeUInt16LE(1,10);
 end.writeUInt32LE(cdSize,12);end.writeUInt32LE(cdOffset,16);
 return Buffer.concat([local,fn,encoded,central,fn,end]);
}
const romFixture=()=>{
 const rom=Buffer.alloc(16+16384+8192);REFERENCE_HEADER.copy(rom);rom[4]=1;rom[5]=1;rom[6]=0x40;
 rom[16+16384]=0x80;rom[16+16384+8]=0x80;return rom;
};
test('ZIP ROM reader decompresses a single Deflate NES without touching disk',()=>{
 const zip=makeZip('folder/sample.NES',romFixture());
 assert.deepEqual(readNesFromZip(zip).rom,romFixture());
});
test('ZIP ROM reader handles stored (uncompressed) entries',()=>{
 const zip=makeZip('game.nes',romFixture(),{method:0});
 assert.deepEqual(readNesFromZip(zip).rom,romFixture());
});
test('ZIP reader rejects wrong CRC without accepting altered ROM',()=>{
 assert.throws(()=>readNesFromZip(makeZip('game.nes',romFixture(),{corruptCRC:true})),/CRC-32/);
});
test('ZIP reader rejects missing NES and truncated archive',()=>{
 assert.throws(()=>readNesFromZip(makeZip('doc.txt',Buffer.from('txt'))),/one .nes/);
 assert.throws(()=>readNesFromZip(Buffer.from('abc')),/truncated/);
});
test('ZIP reader rejects archives containing two NES ROMs',()=>{
 const a=makeZip('one.nes',romFixture()),b=makeZip('two.nes',romFixture());
 const ea=a.length-22,eb=b.length-22,oa=a.readUInt32LE(ea+16),ob=b.readUInt32LE(eb+16);
 const localA=a.subarray(0,oa),localB=b.subarray(0,ob),centA=a.subarray(oa,ea),centB=Buffer.from(b.subarray(ob,eb));
 centB.writeUInt32LE(localA.length,42);
 const end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(2,8);end.writeUInt16LE(2,10);
 end.writeUInt32LE(centA.length+centB.length,12);end.writeUInt32LE(localA.length+localB.length,16);
 const double=Buffer.concat([localA,localB,centA,centB,end]);
 assert.throws(()=>readNesFromZip(double),/found 2/);
});
test('NES 2.0 matching header offset produces identical CHR layout to iNES1',()=>{
 const i=romFixture();const j=Buffer.from(i);j[7]=0x08;j[15]=0x03;
 assert.equal(parseINes(i).format,'iNES 1.0');assert.equal(parseINes(j).format,'NES 2.0');
 assert.equal(parseINes(j).chrOffset,parseINes(i).chrOffset);
});
test('Original CHR importer checks the full Git blob, not only size',async t=>{
 let bytes;try{bytes=await readFile(new URL('../local/original.chr',import.meta.url));}catch(e){if(e.code==='ENOENT'){t.skip('Private user ROM not imported');return;}throw e;}
 assert.equal(bytes.length,131072);
 const gitHash=createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
 assert.equal(gitHash,ORIGINAL_CHR_GIT_BLOB);
 assert.equal(decodeTile(bytes,0).length,64);
});
test('Header normalization reproduces exact upstream complete-ROM SHA1',async t=>{
 const originalPath=process.env.KUNIO_ORIGINAL_ZIP;
 if(!originalPath){t.skip('Provide KUNIO_ORIGINAL_ZIP to run private binary fixture');return;}
 const {rom}=readNesFromZip(await readFile(originalPath));
 const result=inspectOriginalRom(rom);
 assert.equal(result.matchesReferenceBinary,true);
 assert.deepEqual(result.headerDifferences,[7,15]);
 assert.equal(result.normalizedSHA1,ORIGINAL_ROM_SHA1);
 assert.equal(result.chrMatchesPinned,true);
 assert.equal(result.header.format,'NES 2.0');
});
