import test from 'node:test';
import assert from 'node:assert/strict';
import {createOriginalControllerState,encodeOriginalSerialRead,stepOriginalControllerInput,NES_BUTTONS} from '../src/classic/OriginalInput.js';
import {createOriginalActionBufferState,stepOriginalActionBuffers} from '../src/classic/OriginalActionBuffers.js';
import {createOriginalPossessionRam,stepOriginalPossessionControl} from '../src/classic/OriginalPossessionControl.js';
import {createOriginalPpuTransferState,stepOriginalOamDma,stepOriginalPaletteQueue} from '../src/classic/OriginalPpuTransfers.js';

test('controller serial bit ordering and original rising edges are source-derived',()=>{
 const state=createOriginalControllerState();
 const read=()=>encodeOriginalSerialRead([NES_BUTTONS.A|NES_BUTTONS.RIGHT,0,0,0]);
 assert.deepEqual(stepOriginalControllerInput(state,read).pressed,[0x81,0,0,0]);
 assert.deepEqual(stepOriginalControllerInput(state,read).pressed,[0,0,0,0]);
});
test('action buffers preserve no-held-button clearing path',()=>{
 const state=createOriginalActionBufferState({held:0x0f,buffer56c:0x40,buffer570:0x40,buffer578:20,buffer57c:0xff});
 const result=stepOriginalActionBuffers(state);
 assert.equal(result.actionPath,'no-action-hold');
 assert.equal(state.buffer570,0);
 assert.equal(state.buffer56c,0);
});
test('source possession A edge updates selected controller-slot action',()=>{
 const ram=createOriginalPossessionRam({owner:7,selectedPlayers:[255,255,7,255],pressed:[0,0,0x80,0]});
 const result=stepOriginalPossessionControl(ram);
 assert.equal(result.controllerSlot,2);
 assert.equal(ram[0x479+2],0x0a);
});
test('source PPU OAM DMA preserves 256-byte OAM order without ROM data',()=>{
 const ram=new Uint8Array(2048), ppu=createOriginalPpuTransferState();
 for(let i=0;i<256;i++)ram[0x200+i]=(i*17)&255;
 const result=stepOriginalOamDma(ram,ppu);
 assert.equal(result.bytesCopied,256);
 assert.deepEqual(ppu.oam,ram.subarray(0x200,0x300));
});
test('source palette queue writes 2 bytes and completes queue',()=>{
 const ram=new Uint8Array(2048),ppu=createOriginalPpuTransferState();
 ram[0x6d9]=0x3f;ram[0x6da]=0;ram[0x6db]=2;ram.set([0x12,0x2f],0x6dc);
 const result=stepOriginalPaletteQueue(ram,ppu);
 assert.equal(result.bytesWritten,2);
 assert.deepEqual(Array.from(ppu.palette.subarray(0,2)),[0x12,0x2f]);
 assert.equal(ram[0x6d9],0xff);
});
