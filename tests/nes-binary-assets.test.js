import test from 'node:test';
import assert from 'node:assert/strict';
import {isINes,parseINes,extractCHR,decodeTile,colorizeTile,inspectOriginalCHR,chrTileCount,ORIGINAL_CHR_BYTES,INSPECTION_GRAY} from '../src/classic/NesBinaryAssets.js';
function nes({prg=1,chr=1,trainer=false}={}){
 const head=new Uint8Array(16);head.set([0x4e,0x45,0x53,0x1a,prg,chr,trainer?0x14:0x10,0]);
 const image=new Uint8Array(16+(trainer?512:0)+prg*16384+chr*8192);
 image.set(head);image.fill(0xfe,16,16+(trainer?512:0)+prg*16384);
 for(let j=0;j<chr*8192;j++)image[image.length-chr*8192+j]=j%256;
 return image;
}
test('NES magic identifies iNES but rejects other files',()=>{
 assert.equal(isINes(nes()),true);assert.equal(isINes(new Uint8Array(16)),false);
 assert.equal(isINes(new Uint8Array(2)),false);
});
test('iNES v1 header bounds and mapper are decoded',()=>{
 const header=parseINes(nes({prg:2,chr:2}));
 assert.equal(header.prgBytes,32768);assert.equal(header.chrBytes,16384);
 assert.equal(header.mapper,1);assert.equal(header.chrOffset,32784);
 assert.equal(header.trailingBytes,0);assert.equal(header.trainer,false);
});
test('512-byte trainer is skipped before PRG and CHR',()=>{
 const image=nes({trainer:true}),ex=extractCHR(image);
 assert.equal(ex.header.chrOffset,16+512+16384);
 assert.equal(ex.chr[0],0);assert.equal(ex.chr[1],1);
});
test('trailing padding does not enter extracted CHR',()=>{
 const base=nes(),b=new Uint8Array(base.length+7);b.set(base);b.fill(44,base.length);
 assert.equal(parseINes(b).trailingBytes,7);
 assert.equal(extractCHR(b).chr.length,8192);
});
test('truncated ROM is rejected',()=>assert.throws(()=>parseINes(nes().slice(0,-1)),/Truncated/));
test('bad header and short buffers are rejected',()=>{
 assert.throws(()=>parseINes(new Uint8Array([1,2])),/header/);
 assert.throws(()=>extractCHR(new Uint8Array([0x4e,0x45,0x53,0x1a])),/header/);
});
test('NES 2.0 linear CHR/PRG sizes and submapper parse correctly',()=>{
 const rom=nes({prg:2,chr:2});rom[7]=0x08;rom[8]=0x30;
 const info=parseINes(rom);
 assert.equal(info.format,'NES 2.0');assert.equal(info.prgBytes,32768);
 assert.equal(info.chrBytes,16384);assert.equal(info.mapper,1);
 assert.equal(info.submapper,3);
 assert.equal(extractCHR(rom).chr.length,16384);
});
test('NES 2.0 exponent/multiplier sizes validated against file extent',()=>{
 const rom=nes({prg:1,chr:1});rom[7]=0x08;rom[4]=(14<<2)|0;rom[9]=0x0f;
 assert.equal(parseINes(rom).prgBytes,16384);
 rom[4]=(31<<2)|3;
 assert.throws(()=>parseINes(rom),/safe bounds|Truncated/);
});
test('CHR-RAM declaration is rejected',()=>assert.throws(()=>extractCHR(nes({chr:0})),/CHR-RAM/));
test('raw CHR tile alignment and range verified',()=>{
 assert.throws(()=>extractCHR(new Uint8Array(0)),/multiple of 16/);
 assert.throws(()=>extractCHR(new Uint8Array(17)),/multiple of 16/);
 assert.equal(extractCHR(new Uint8Array(32)).chr.length,32);
});
test('extracted CHR is copied to isolate input mutation',()=>{
 const raw=new Uint8Array(16);raw[0]=42;
 const {chr}=extractCHR(raw);raw[0]=99;assert.equal(chr[0],42);
});
test('low plane bit 7 maps to first pixel (index 1)',()=>{
 const tile=new Uint8Array(16);tile[0]=0x80;
 const p=decodeTile(tile,0);assert.equal(p[0],1);assert.equal(p[1],0);
});
test('high plane bit 0 maps to bottom-right (index 2)',()=>{
 const tile=new Uint8Array(16);tile[15]=1;
 const p=decodeTile(tile,0);assert.equal(p[63],2);assert.equal(p[62],0);
});
test('combined planes produce index 3 without reversing rows',()=>{
 const tile=new Uint8Array(16);tile[4]=0x10;tile[12]=0x10;
 const p=decodeTile(tile,0);assert.equal(p[4*8+3],3);assert.equal(p[4*8+4],0);
});
test('decoder handles tiles at nonzero offsets',()=>{
 const tile=new Uint8Array(32);tile[16]=0xff;tile[24]=0xff;
 assert.deepEqual([...decodeTile(tile,1)].slice(0,8),Array(8).fill(3));
 assert.deepEqual([...decodeTile(tile,0)],Array(64).fill(0));
});
test('tile index and malformed buffers fail strictly',()=>{
 assert.throws(()=>decodeTile(new Uint8Array(15),0),/multiple of 16/);
 assert.throws(()=>decodeTile(new Uint8Array(16),1),/index/);
 assert.throws(()=>decodeTile(new Uint8Array(16),-1),/index/);
 assert.throws(()=>decodeTile(new Uint8Array(16),0.5),/index/);
});
test('chosen grayscale inspection palette maps exact RGBA bytes',()=>{
 const pixels=new Uint8Array(64);pixels.set([0,1,2,3]);
 const rgba=colorizeTile(pixels);
 assert.deepEqual([...rgba.slice(0,16)],INSPECTION_GRAY.flat());
});
test('invalid palettes and pixel buffers rejected',()=>{
 assert.throws(()=>colorizeTile(new Uint8Array(63)),/64/);
 assert.throws(()=>colorizeTile(new Uint8Array(64),[[1,2,3,4]]),/four/);
});
test('original CHR source size is 8192 tiles in sixteen 8 KiB banks',()=>{
 const info=inspectOriginalCHR(new Uint8Array(ORIGINAL_CHR_BYTES));
 assert.equal(info.tileCount,8192);assert.equal(info.bankCount,16);
 assert.equal(info.expectedSourceSize,true);assert.equal(chrTileCount(new Uint8Array(8192)),512);
});
test('original-size shape is not a proof of original binary identity',()=>{
 assert.equal(inspectOriginalCHR(new Uint8Array(8192)).expectedSourceSize,false);
 assert.throws(()=>inspectOriginalCHR(new Uint8Array(19)),/not tile-aligned/);
});
