import test from 'node:test';
import assert from 'node:assert/strict';
import { parseINes, decodeTile, colorizeTile } from '../src/classic/NesBinaryAssets.js';
import { createOriginalChrMapper, writeOriginalMmc3Chr, resolveOriginalChrBank } from '../src/classic/OriginalChrBanking.js';
import { stepOriginalWeatherSprites, ORIGINAL_WEATHER_SPRITES as W } from '../src/classic/OriginalWeatherSprites.js';

test('locally supplied ROM header and 2bpp pixels are decoded without embedded assets', () => {
 const nes=new Uint8Array(16+16384+8192);nes.set([78,69,83,26,1,1],0);
 const parsed=parseINes(nes);assert.equal(parsed.chrOffset,16+16384);
 nes.set([0x80,0,0,0,0,0,0,0,0x80],parsed.chrOffset);
 const pixels=decodeTile(nes.subarray(parsed.chrOffset),0);
 assert.equal(pixels[0],3);assert.equal(pixels[1],0);
 const rgba=colorizeTile(pixels);assert.equal(rgba.length,256);
});
test('original MMC3 CHR inversion and mirrored bank map are source-consistent',()=>{
 const map=createOriginalChrMapper();
 for(let i=0;i<6;i++){writeOriginalMmc3Chr(map,0x8000,i);writeOriginalMmc3Chr(map,0x8001,i*2+4);}
 assert.deepEqual(Array.from({length:8},(_,i)=>resolveOriginalChrBank(map,i*1024,131072)),[4,5,6,7,8,10,12,14]);
 writeOriginalMmc3Chr(map,0x8000,0x80);
 assert.deepEqual(Array.from({length:8},(_,i)=>resolveOriginalChrBank(map,i*1024,131072)),[8,10,12,14,4,5,6,7]);
});
test('weather OAM initializes from only caller supplied PRG table bytes',()=>{
 const ram=new Uint8Array(2048),prg=new Uint8Array(131072);
 const fixed=a=>0x1c000+a-0xc000;
 for(let i=0;i<12;i++){prg[fixed(W.tableY+i)]=i+5;prg[fixed(W.tableTile+i)]=0x20+i;prg[fixed(W.tableX+i)]=i+10;}
 ram[W.effect]=0x81;
 const result=stepOriginalWeatherSprites(ram,prg);
 assert.deepEqual([result.mode,result.entriesWritten,ram[W.effect]],['initialize',12,1]);
 assert.deepEqual(Array.from(ram.subarray(W.oam,W.oam+4)),[5,0x20,1,10]);
 assert.deepEqual(Array.from(ram.subarray(W.oam+44,W.oam+48)),[16,0x2b,1,21]);
});
