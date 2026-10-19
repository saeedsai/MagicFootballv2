import {extractCHR,parseINes,isINes,decodeTile,colorizeTile,inspectOriginalCHR,ORIGINAL_CHR_GIT_BLOB,ORIGINAL_ROM_SHA1} from './classic/NesBinaryAssets.js';
import {createMatch,stepMatch,TICK_RATE} from './core/Match.js';
import {createRecorder,recordStep,exportReplay,createPlayback,playbackStep,MAX_REPLAY_FRAMES} from './core/Replay.js';
import {InputManager,defaults,ACTIONS} from './input/InputManager.js';
import {Renderer} from './rendering/Renderer.js';
import {NES_BUTTONS,NES_BUTTON_ORDER,createOriginalControllerState,encodeOriginalSerialRead,stepOriginalControllerInput} from './classic/OriginalInput.js';
import {createOriginalRandomState,stepOriginalRandom} from './classic/OriginalRandom.js';
import {createOriginalFieldResearchState,stepOriginalFieldPause,stepOriginalFoulFlag,evaluateOriginalKickoffGate} from './classic/OriginalFieldLogic.js';
import {resolveOriginalScreenHandler,resolveOriginalMatchSubscreenHandler} from './classic/OriginalScreenDispatch.js';
import {createOriginalGoalCutsceneState,prepareOriginalGoalCutsceneFrame,stepOriginalGoalCutscenePostUpdates} from './classic/OriginalGoalCutscene.js';
import {createOriginalPlayerActionState,evaluateOriginalPlayerActionEntry,stepOriginalPlayerActionPostHelper,scheduleOriginalKickoffControllerCalls} from './classic/OriginalPlayerAction.js';
import {createOriginalActionBufferState,stepOriginalActionBuffers} from './classic/OriginalActionBuffers.js';
import {createOriginalPossessionRam,stepOriginalScriptBit0ControlBranch} from './classic/OriginalPossessionControl.js';
import {createOriginalAlternateControllerRam,stepOriginalControllerDispatch} from './classic/OriginalAlternateController.js';
import {createOriginalActionArbitrationRam,stepOriginalActionArbitration} from './classic/OriginalActionArbitration.js';
import {stepOriginalMovementState,stepOriginalBallShotPriority} from './classic/OriginalMovementTransition.js';
import {createOriginalChrMapper,stepOriginalBackgroundChrBanks,stepOriginalSpriteChrBanks,resolveOriginalChrBank,originalPpuTileToChrIndex} from './classic/OriginalChrBanking.js';
import {createOriginalPpuTransferState,stepOriginalPaletteQueue,stepOriginalOamDma} from './classic/OriginalPpuTransfers.js';
import {stepOriginalWeatherSprites,ORIGINAL_WEATHER_SPRITES} from './classic/OriginalWeatherSprites.js';
import {sha1Hex} from './classic/OriginalRomSha1.js';
const $=id=>document.getElementById(id);
const input=new InputManager();input.attach();
const renderer=new Renderer($('field'));
let match=createMatch();let lastTime=0,accumulator=0,visible='home',lastPanel='home';
let recorder=null,playback=null,playbackPaused=false,recordingStopped=false;
const notice=message=>{$('replayNotice').textContent=message;};
function liveStep(frame){
 if(recorder&&!recordingStopped&&recorder.frames.length<MAX_REPLAY_FRAMES)recordStep(recorder,match,frame);
 else {if(recorder)recordingStopped=true;stepMatch(match,frame);}
}
function tapButton(action){
 // Capture release, press, release as reproducible input frames.
 liveStep({[action]:false});liveStep({[action]:true});liveStep({[action]:false});
}
const show=name=>{for(const n of ['home','game','settings','lab','graphicsLab'])$(n).classList.toggle('hidden',n!==name);visible=name;
 $('status').textContent=name==='game'?`${match.phase.toUpperCase()} | ${match.tick} TICKS`:'READY';
 if(name!=='game')input.release();};
const start=()=>{match=createMatch();recorder=createRecorder(match);playback=null;playbackPaused=false;recordingStopped=false;
 input.release();accumulator=0;lastTime=0;$('saveReplayBtn').disabled=false;notice('Recording deterministic inputs for replay.');show('game');renderer.draw(match);};
// Isolated, source-derived NES input research tool. Does not drive the development match.
let labState=createOriginalControllerState();let labSelected=[0,0,0,0];let labAttempts=0;
let labRandom=createOriginalRandomState(0x12,0x34); // demo seed, NOT original startup seed
let labField=createOriginalFieldResearchState({musicId:0x12}); // arbitrary research state
let labLastAudioCommands=[];let labLastKickoffDecision=null;
let labGoal=createOriginalGoalCutsceneState({tileUpdateFlag:0xff,cutsceneTimer:31,gameScript:0x42,ballOwner:0x1a});let labLastGoalDecision=null;
const labHex=value=>'0x'+value.toString(16).padStart(2,'0').toUpperCase();
function renderOriginalInputLab(){
 const container=$('labChannels');container.replaceChildren();
 for(let channel=0;channel<4;channel++){
  const card=document.createElement('article');card.className='lab-channel';
  const title=document.createElement('h3');title.textContent=`Channel ${channel+1} ($401${channel%2===0?'6':'7'} bit ${channel<2?0:1})`;
  const buttons=document.createElement('div');buttons.className='lab-buttons';
  for(const name of NES_BUTTON_ORDER){
   const button=document.createElement('button');button.type='button';
   button.textContent=name;button.dataset.channel=String(channel);button.dataset.nesButton=name;
   button.setAttribute('aria-pressed',String(!!(labSelected[channel]&NES_BUTTONS[name])));
   button.addEventListener('click',()=>{labSelected[channel]^=NES_BUTTONS[name];renderOriginalInputLab();});
   buttons.append(button);
  }
  const status=document.createElement('div');status.className='lab-bytes';
  status.textContent=`Selected ${labHex(labSelected[channel])} | Hold ${labHex(labState.held[channel])} | New press ${labHex(labState.pressed[channel])}`;
  card.append(title,buttons,status);container.append(card);
 }
 $('labStatus').textContent=`Scans ${labState.samples} • Last stable read ${labAttempts||'—'} attempts • Original RNG bytes ($0045,$0046) ${labHex(labRandom.byte45)},${labHex(labRandom.byte46)} • Press bits reflect the latest scan.`;
 $('labFieldStatus').textContent=`Field script $005C: ${labHex(labField.gameScript)} (${labField.gameScript&0x80?'PAUSED':'ACTIVE'}) • cutscene timer $05E2: ${labHex(labField.cutsceneTimer)} • last audio commands: ${labLastAudioCommands.length?labLastAudioCommands.map(labHex).join(', '):'none'}.`;
}
// Exact source-tile inspection (not a substitute sprite renderer or runtime ROM execution).
let graphicsCHR=null,graphicsPage=0,graphicsSelected=0;
let graphicsPRG=null,weatherRAM=null,weatherPPU=null;
const graphicsAtlas=$('graphicsAtlas'),graphicsTile=$('graphicsTile');
function graphicsPaint(){
 if(!graphicsCHR)return;
 const info=inspectOriginalCHR(graphicsCHR);
 const ctx=graphicsAtlas.getContext('2d');const image=ctx.createImageData(128,128);
 for(let local=0;local<256;local++){
  const global=graphicsPage*256+local;
  if(global>=info.tileCount)break;
  const rgba=colorizeTile(decodeTile(graphicsCHR,global));
  const sx=(local%16)*8,sy=Math.floor(local/16)*8;
  for(let y=0;y<8;y++)for(let x=0;x<8;x++){
   const dest=((sy+y)*128+sx+x)*4,from=(y*8+x)*4;
   image.data.set(rgba.subarray(from,from+4),dest);
  }
 }
 ctx.putImageData(image,0,0);
 $('graphicsPageLabel').textContent=`Page ${graphicsPage+1} / ${Math.ceil(info.tileCount/256)} • tile indices ${graphicsPage*256}–${Math.min(info.tileCount-1,graphicsPage*256+255)}`;
 $('graphicsPrev').disabled=graphicsPage===0;
 $('graphicsNext').disabled=(graphicsPage+1)*256>=info.tileCount;
 const global=Math.min(graphicsSelected,info.tileCount-1);
 const pixelIndices=decodeTile(graphicsCHR,global);
 const mini=graphicsTile.getContext('2d'),tileImage=mini.createImageData(8,8);
 tileImage.data.set(colorizeTile(pixelIndices));mini.putImageData(tileImage,0,0);
 $('graphicsTileLabel').textContent=`Tile ${global} ($${global.toString(16).toUpperCase().padStart(4,'0')}) • 16 exact pattern bytes • no palette/OAM composition`;
}
// Pinned bank FF $EE7D/$EE9A register write research, NOT a verified NES frame.
let graphicsMapper=createOriginalChrMapper();
const graphicsMappedAtlas=$('graphicsMappedAtlas');
function graphicsPaintMapper(){
 if(!graphicsCHR||graphicsCHR.length<8192||graphicsCHR.length%1024){
  $('graphicsMapperStatus').textContent='Mapped PPU preview requires at least 8 KiB of 1 KiB-aligned CHR data.';return;
 }
 const table=Number($('graphicsPpuTable').value),ctx=graphicsMappedAtlas.getContext('2d');
 const image=ctx.createImageData(128,128);
 for(let local=0;local<256;local++){
  const physical=originalPpuTileToChrIndex(graphicsMapper,table*256+local,graphicsCHR.length);
  const rgba=colorizeTile(decodeTile(graphicsCHR,physical));
  const sx=(local%16)*8,sy=Math.floor(local/16)*8;
  for(let y=0;y<8;y++)for(let x=0;x<8;x++){
   const dest=((sy+y)*128+sx+x)*4,from=(y*8+x)*4;
   image.data.set(rgba.subarray(from,from+4),dest);
  }
 }
 ctx.putImageData(image,0,0);
 const banks=Array.from({length:8},(_,i)=>resolveOriginalChrBank(graphicsMapper,i*1024,graphicsCHR.length));
 $('graphicsMapperStatus').textContent=`Source $EE7D/$EE9A RAM fixture → PPU 1 KiB banks: ${banks.join(', ')} • $004E shadow: $05 • PPU table ${table} displayed in neutral 2bpp colors. Not original character sprites.`;
}
function graphicsApplyMapper(){
 try{
  const r=new Uint8Array(0x600);
  for(const [id,address] of [['graphicsBg0',0x5bc],['graphicsBg1',0x5bd],['graphicsSp0',0x5b8],['graphicsSp1',0x5b9],['graphicsSp2',0x5ba],['graphicsSp3',0x5bb]]){
   const v=Number($(id).value);if(!Number.isInteger(v)||v<0||v>255)throw new RangeError(`${id}: enter a byte 0–255`);
   r[address]=v;
  }
  graphicsMapper=createOriginalChrMapper();
  stepOriginalBackgroundChrBanks(r,graphicsMapper);stepOriginalSpriteChrBanks(r,graphicsMapper);
  graphicsPaintMapper();
 }catch(error){$('graphicsMapperStatus').textContent=`Bank mapping rejected: ${error.message}`;}
}
// Original PPU transfer lab uses only synthetic RAM. It never labels those
// palette bytes or OAM entries as captured from the NES runtime.
$('ppuPaletteApply').addEventListener('click',()=>{
 try{
  const count=Number($('ppuPaletteCount').value),lo=Number($('ppuPaletteLow').value),ctrl=Number($('ppuPaletteCtrl').value);
  if(!Number.isInteger(count)||count<1||count>32||!Number.isInteger(lo)||lo<0||lo>255||!Number.isInteger(ctrl)||ctrl<0||ctrl>255)throw new RangeError('Count must be 1–32, address low and PPUCTRL 0–255');
  const ram=new Uint8Array(0x800),ppu=createOriginalPpuTransferState();
  ram[0x6d9]=0x3f;ram[0x6da]=lo;ram[0x6db]=count;ram[0x4c]=ctrl;
  for(let i=0;i<32;i++)ram[0x6dc+i]=i;
  const result=stepOriginalPaletteQueue(ram,ppu);
  $('ppuPaletteStatus').textContent=`Source $F05F: ${result.bytesWritten} PPU writes, $06D9 now $FF, PPUCTRL $${result.ppuCtrl.toString(16).padStart(2,'0')}, ${result.restoredAddress?'address restored to $0000':'address not restored'}. SYNTHETIC RAM; no original frame parity.`;
  $('ppuPaletteTrace').textContent=`PPU writes: ${ppu.dataTrace.map(x=>'$'+x.address.toString(16).padStart(4,'0')+'='+x.value.toString(16).padStart(2,'0')).join(' ')}\nMirrored 32-byte palette memory (hex): ${Array.from(ppu.palette,x=>x.toString(16).padStart(2,'0')).join(' ')}\nThese are palette INDEX BYTES, not verified original game colors.`;
 }catch(error){$('ppuPaletteStatus').textContent=`PPU palette fixture rejected: ${error.message}`;}
});
$('ppuOamApply').addEventListener('click',()=>{
 const ram=new Uint8Array(0x800),ppu=createOriginalPpuTransferState();
 for(let i=0;i<256;i++)ram[0x200+i]=i;
 const result=stepOriginalOamDma(ram,ppu);
 $('ppuPaletteStatus').textContent=`Source $EE5A: DMA page $02, ${result.bytesCopied} OAM bytes, OAM address 0. SYNTHETIC $0200–$02FF bytes, NOT original character metasprites.`;
 $('ppuPaletteTrace').textContent=`Register writes: ${ppu.registerTrace.map(([a,v])=>'$'+a.toString(16)+'=$'+v.toString(16).padStart(2,'0')).join(', ')}\nFirst 16 OAM bytes: ${Array.from(ppu.oam.slice(0,16),x=>x.toString(16).padStart(2,'0')).join(' ')}\nOAM entries are not yet interpreted into original poses.`;
});
// Source $D993-$DA45: weather effect sprite producer using only authenticated
// PRG bytes selected by the user in this browser. No PRG is embedded/exported.
const weatherHex=n=>'$'+n.toString(16).padStart(2,'0');
function weatherShow(result){
 const w=ORIGINAL_WEATHER_SPRITES;
 stepOriginalOamDma(weatherRAM,weatherPPU);
 const entries=Array.from({length:12},(_,i)=>{
  const off=i*4,o=weatherPPU.oam;
  return `#${i.toString().padStart(2,'0')}  Y=${weatherHex(o[off])}  tile=${weatherHex(o[off+1])}  attributes=${weatherHex(o[off+2])}  X=${weatherHex(o[off+3])}`;
 });
 $('weatherStatus').textContent=`Source $D993: ${result.mode} • 12 original-source OAM entries • effect $0466=${weatherHex(weatherRAM[w.effect])} • phase $03AE=${weatherHex(weatherRAM[w.phase])}. AUTHENTIC PRG TABLES, SYNTHETIC RAM. Not a captured original frame, composed character sprite, or verified original palette.`;
 $('weatherTrace').textContent=entries.join('\n')+'\nOAM DMA register writes: $2003=$00, $4014=$02';
}
$('weatherInitBtn').addEventListener('click',()=>{
 if(!graphicsPRG){$('weatherStatus').textContent='Select the verified original .nes file in the graphics file input first (CHR alone does not contain the PRG sprite tables).';return;}
 weatherRAM=new Uint8Array(0x800);weatherPPU=createOriginalPpuTransferState();
 weatherRAM[ORIGINAL_WEATHER_SPRITES.effect]=0x81;
 weatherRAM[ORIGINAL_WEATHER_SPRITES.offsetX]=0x20;
 weatherRAM[ORIGINAL_WEATHER_SPRITES.clipY]=0x80;
 weatherShow(stepOriginalWeatherSprites(weatherRAM,graphicsPRG));
});
$('weatherStepBtn').addEventListener('click',()=>{
 if(!graphicsPRG||!weatherRAM){$('weatherStatus').textContent='Load an authenticated .nes and run weather initialization first.';return;}
 weatherShow(stepOriginalWeatherSprites(weatherRAM,graphicsPRG));
});
async function importVerifiedOriginalPrg(bytes){
 graphicsPRG=null;weatherRAM=null;weatherPPU=null;
 if(!isINes(bytes))return;
 const header=parseINes(bytes);
 if(header.prgBytes!==0x20000)throw new Error('Weather source requires the 128 KiB original PRG');
 const normalized=bytes.slice();normalized.set([0x4e,0x45,0x53,0x1a,0x08,0x10,0x40,0,0,0,0,0,0,0,0,0],0);
 const sha=sha1Hex(normalized);
 if(sha!==ORIGINAL_ROM_SHA1)throw new Error('Original PRG verification failed; header-normalized SHA-1 differs from pinned source');
 graphicsPRG=bytes.slice(header.prgOffset,header.prgOffset+header.prgBytes);
 $('weatherStatus').textContent='Original PRG verified against pinned assembly by normalized whole-ROM SHA-1. Run source weather OAM initialization; synthetic RAM is not an original gameplay frame.';
}
$('graphicsMapperApply').addEventListener('click',graphicsApplyMapper);
$('graphicsPpuTable').addEventListener('change',graphicsPaintMapper);
$('classicGraphicsLabBtn').addEventListener('click',()=>show('graphicsLab'));
$('graphicsBackBtn').addEventListener('click',()=>show('home'));
$('graphicsPrev').addEventListener('click',()=>{if(graphicsCHR&&graphicsPage>0){graphicsPage--;graphicsSelected=graphicsPage*256;graphicsPaint()}});
$('graphicsNext').addEventListener('click',()=>{if(graphicsCHR&&(graphicsPage+1)*256<graphicsCHR.length/16){graphicsPage++;graphicsSelected=graphicsPage*256;graphicsPaint()}});
graphicsAtlas.addEventListener('click',event=>{
 if(!graphicsCHR)return;
 const rect=graphicsAtlas.getBoundingClientRect();
 const x=Math.min(15,Math.max(0,Math.floor((event.clientX-rect.left)/rect.width*16)));
 const y=Math.min(15,Math.max(0,Math.floor((event.clientY-rect.top)/rect.height*16)));
 const index=graphicsPage*256+y*16+x;
 if(index<graphicsCHR.length/16){graphicsSelected=index;graphicsPaint()}
});
async function loadOriginalGraphics(bytes,{raw=false,label='local selection'}={}){
 const {chr,source,header}=extractCHR(bytes,{raw});
 graphicsCHR=chr;graphicsPage=0;graphicsSelected=0;
 const info=inspectOriginalCHR(chr);
 let provenance='Original CHR identity unverified (SHA-1 not available on this page).';
 if(label.startsWith('Privately supplied original')&&globalThis.__kunioLocalCHRVerified===true)provenance='VERIFIED: CHR graphics exactly match pinned original binary (build-time SHA-1).';
 if(typeof crypto!=='undefined'&&crypto.subtle){
  const prefix=new TextEncoder().encode(`blob ${chr.length}\0`);
  const blob=new Uint8Array(prefix.length+chr.length);blob.set(prefix);blob.set(chr,prefix.length);
  const digest=await crypto.subtle.digest('SHA-1',blob);
  const sha=[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
  provenance=sha===ORIGINAL_CHR_GIT_BLOB?'VERIFIED: CHR graphics exactly match pinned original binary.':'NOT VERIFIED: CHR differs from pinned source.';
 }
 $('graphicsStatus').textContent=`${label} • ${source} • ${info.byteCount} CHR bytes • ${info.tileCount} decoded tile patterns • ${info.bankCount} full 8 KiB banks. ${header?`Mapper ${header.mapper}; ${header.format}; PRG ${header.prgBytes} bytes. `:''}${provenance} This is exact original tile data, NOT reconstructed player sprites/palettes/animation.`;
 graphicsPaint();graphicsApplyMapper();
}
$('graphicsFile').addEventListener('change',async event=>{
 const file=event.target.files?.[0];if(!file)return;
 graphicsCHR=null;$('graphicsPrev').disabled=true;$('graphicsNext').disabled=true;
 try{
  if(file.size>4_000_000)throw new Error('File larger than 4 MB; use a standard NES/CHR binary');
  const selectedBytes=new Uint8Array(await file.arrayBuffer());
  await loadOriginalGraphics(selectedBytes,{raw:/\.chr$/i.test(file.name),label:file.name});
  await importVerifiedOriginalPrg(selectedBytes);
 }catch(error){$('graphicsStatus').textContent=`Original graphics import rejected: ${error.message}`}
 event.target.value='';
});
// A private owner-supplied ROM import is bundled with this locally generated build,
// never in Git. Standalone HTML embeds only its verified CHR, not the NES ROM/PRG.
async function preloadPrivateOriginalCHR(){
 try{
  if(typeof globalThis.__kunioLocalCHRBase64==='string'){
   const binary=atob(globalThis.__kunioLocalCHRBase64);
   const bytes=Uint8Array.from(binary,x=>x.charCodeAt(0));
   await loadOriginalGraphics(bytes,{raw:true,label:'Privately supplied original NES graphics (offline)'});
  }else if(typeof globalThis.__kunioLocalCHRBase64==='undefined'){
   const response=await fetch('./local/original.chr');
   if(response.ok)await loadOriginalGraphics(new Uint8Array(await response.arrayBuffer()),{raw:true,label:'Privately supplied original NES graphics (local modular build)'});
  }
 }catch(error){$('graphicsStatus').textContent=`Private original-CHR preload failed: ${error.message}`;}
}
void preloadPrivateOriginalCHR();
$('classicInputLabBtn').addEventListener('click',()=>{show('lab');renderOriginalInputLab();});
$('labBackBtn').addEventListener('click',()=>show('home'));
$('labScanBtn').addEventListener('click',()=>{
 try{
  const raw=encodeOriginalSerialRead(labSelected);
  stepOriginalRandom(labRandom); // Source main loop $C48C precedes $C48F. Lab has no game state.
  const result=stepOriginalControllerInput(labState,()=>raw);
  labAttempts=result.attempts;
  const fieldResult=stepOriginalFieldPause(labField,labState.pressed[0]);
  if(fieldResult.changed)labLastAudioCommands=fieldResult.audioCommands;
  renderOriginalInputLab();
 }catch(err){$('labStatus').textContent=`Controller scan failed: ${err.message}`;}
});
$('labResetBtn').addEventListener('click',()=>{labState=createOriginalControllerState();labSelected=[0,0,0,0];labAttempts=0;labRandom=createOriginalRandomState(0x12,0x34);labField=createOriginalFieldResearchState({musicId:0x12});labLastAudioCommands=[];labLastKickoffDecision=null;$('labKickoffStatus').textContent='Kickoff trace not yet run. The downstream original state transition is not implemented.';renderOriginalInputLab();});
$('labFieldResetBtn').addEventListener('click',()=>{labField=createOriginalFieldResearchState({musicId:0x12});labLastAudioCommands=[];labLastKickoffDecision=null;$('labFoulPending').checked=false;$('labBallFlags').value='0';$('labBrightnessReady').checked=true;$('labKickoffStatus').textContent='Field bytes reset; no kickoff transition was executed.';renderOriginalInputLab();});
$('labKickoffTraceBtn').addEventListener('click',()=>{
 const brightnessFlag=$('labBrightnessReady').checked?0x80:0;
 labField.gameScript=labField.gameScript&~0x20|($('labFoulPending').checked?0x20:0);
 labField.ballState=Number($('labBallFlags').value);
 const hadFoul=!!(labField.gameScript&0x20);
 const foulResult=brightnessFlag&0x80&&hadFoul?stepOriginalFoulFlag(labField):null;
 const gate=evaluateOriginalKickoffGate({brightnessFlag,gameScript:labField.gameScript,ballState:labField.ballState},{foulWasPending:hadFoul});
 labLastKickoffDecision={...gate,foulResult};
 $('labFoulPending').checked=!!(labField.gameScript&0x20);
 $('labKickoffStatus').textContent=`$C5B3 kickoff branch: ${gate.advance?'ADVANCE BRANCH':'STAY IN KICKOFF'} (${gate.reason}); foul helper: ${foulResult?JSON.stringify(foulResult):'not called'}; downstream transition and calls remain unported.`;
 renderOriginalInputLab();
});

// Isolated $C699 goal-subscreeen direct RAM trace, never drives Classic gameplay.
$('labGoalTraceBtn').addEventListener('click',()=>{
 try{
  const timer=Number($('labGoalTimer').value);
  if(!Number.isInteger(timer)||timer<0||timer>255)throw new RangeError('timer must be 0..255');
  labGoal.cutsceneTimer=timer;
  labGoal.gameScript=labGoal.gameScript&~2|($('labGoalCameraFlag').checked?2:0);
  labGoal.brightnessFlag=Number($('labGoalBrightness').value);
  const prep=prepareOriginalGoalCutsceneFrame(labGoal);
  const result=stepOriginalGoalCutscenePostUpdates(labGoal,$('labGoalSkip').checked?NES_BUTTONS.START:0);
  labLastGoalDecision={prep,result};
  $('labGoalTimer').value=String(labGoal.cutsceneTimer);
  $('labGoalStatus').textContent=`$C699 / $C6C5: timer ${labHex(labGoal.cutsceneTimer)}, camera ${labHex(labGoal.cameraObject)}, script ${labHex(labGoal.gameScript)}. Skip ${result.skipTriggered?'YES':'NO'}, camera retarget ${result.cameraRetargeted?'YES':'NO'}, brightness complete ${result.brightnessComplete?'YES':'NO'}. ${prep.pendingExternalCalls.length} initial routines and ${result.externalCalls.length} later calls remain UNEXECUTED.`;
 }catch(err){$('labGoalStatus').textContent=`Goal cutscene trace rejected: ${err.message}`;}
});
$('labGoalResetBtn').addEventListener('click',()=>{
 labGoal=createOriginalGoalCutsceneState({tileUpdateFlag:0xff,cutsceneTimer:31,gameScript:0x42,ballOwner:0x1a});labLastGoalDecision=null;
 $('labGoalTimer').value='31';$('labGoalCameraFlag').checked=true;$('labGoalSkip').checked=false;$('labGoalBrightness').value='0';
 $('labGoalStatus').textContent='Goal cutscene research reset. No original match transitions are executed.';
});
// Original bank04 $B8AB action branch. Research snapshots are supplied AFTER
// the separately ported $C07A target; no action executes in the development match.
let labLastActionTrace=null;
let labActionBuffers=createOriginalActionBufferState();let labLastBufferTrace=null;
const ACTION_INPUT_DEFAULTS=Object.freeze({labActionPlayerId:0,labActionControlPosition:0,labActionInitialAction:128,labActionPlayerState:128,labActionHeld:0,labActionPressed:128,labActionBuffer20:0,labActionBuffer21:0,labActionFacing:0,labActionInitialAngle:255,labActionScript:0});
$('labBufferStepBtn').addEventListener('click',()=>{
 try{
  const held=Number($('labActionHeld').value),pressed=Number($('labActionPressed').value);
  // Validate first, so a malformed UI input cannot partially update persistent state.
  const next=createOriginalActionBufferState({...labActionBuffers,held,pressed});
  const result=stepOriginalActionBuffers(next);
  labActionBuffers=next;labLastBufferTrace=result;
  $('labActionBuffer20').value=String(next.buffer570);
  $('labActionBuffer21').value=String(next.buffer57c);
  $('labBufferStatus').textContent=`$FAEE action: ${result.actionPath}; $FB5F direction: ${result.directionPath}. $0570 ${labHex(next.buffer570)}, $057C ${labHex(next.buffer57c)}, $0574 ${labHex(next.buffer574)}, $0578 ${labHex(next.buffer578)}, $0580 ${labHex(next.buffer580)}, $0584 ${labHex(next.buffer584)}. Source-local buffer update only.`;
 }catch(err){$('labBufferStatus').textContent=`Original button buffer step rejected: ${err.message}`;}
});
$('labBufferResetBtn').addEventListener('click',()=>{
 labActionBuffers=createOriginalActionBufferState();labLastBufferTrace=null;
 $('labActionBuffer20').value='0';$('labActionBuffer21').value='0';
 $('labBufferStatus').textContent='Original button buffers reset. No original gameplay was executed.';
});
$('labActionTraceBtn').addEventListener('click',()=>{
 try{
  const get=id=>Number($(id).value);
  const state=createOriginalPlayerActionState({playerId:get('labActionPlayerId'),playerState:get('labActionPlayerState'),held:get('labActionHeld'),pressed:get('labActionPressed'),buffer20:get('labActionBuffer20'),buffer21:get('labActionBuffer21'),facing:get('labActionFacing'),action:get('labActionInitialAction'),angle:get('labActionInitialAngle')});
  const gate=evaluateOriginalPlayerActionEntry({controlPosition:get('labActionControlPosition'),action:state.action});
  const schedule=scheduleOriginalKickoffControllerCalls(get('labActionScript'));
  const result=gate.dispatch?stepOriginalPlayerActionPostHelper(state):null;
  labLastActionTrace={gate,result,state:{...state},schedule};
  $('labActionStatus').textContent=`$B8AB gate: ${gate.dispatch?'OPEN':'CLOSED'} (${gate.reason}); action ${labHex(state.action)}, angle ${labHex(state.angle)}; ${result?`branch ${result.path}`:'no post-helper action'}. Kickoff $B4B2 schedules ${schedule.length} UNEXECUTED calls. $FAEE helper may be stepped separately; the player action side effects remain UNEXECUTED.`;
 }catch(err){labLastActionTrace=null;$('labActionStatus').textContent=`Player action trace rejected: ${err.message}`;}
});
$('labActionResetBtn').addEventListener('click',()=>{
 for(const [id,value] of Object.entries(ACTION_INPUT_DEFAULTS))$(id).value=String(value);
 labLastActionTrace=null;labActionBuffers=createOriginalActionBufferState();labLastBufferTrace=null;$('labBufferStatus').textContent='Original button buffers reset.';$('labActionStatus').textContent='Player action research reset. No original gameplay was executed.';
});
// Isolated bank04 $B4B2 → $B850 source-local RAM projection. The $B4C9
// alternative is deliberately NOT run and Classic gameplay remains locked.
let labLastPossessionTrace=null;
const POSS_INPUT_DEFAULTS=Object.freeze({labPossScript:1,labPossOwner:2,labPossFrame:0,labPossSlot:'0',labPossHeld:0,labPossPressed:128,labPossPress0:0,labPossControl0:0,labPossControl1:0});
$('labPossTraceBtn').addEventListener('click',()=>{
 try{
  const get=id=>{const value=Number($(id).value);if(!Number.isInteger(value)||value<0||value>255)throw new RangeError(`${id} must be a byte (0–255)`);return value;};
  const owner=get('labPossOwner'),frame=get('labPossFrame'),gameScript=get('labPossScript');
  const selectedSlot=$('labPossSlot').value==='none'?null:Number($('labPossSlot').value);
  const other=owner===255?0:255;
  const selectedPlayers=[other,other,other,other],held=[0,0,0,0],pressed=[get('labPossPress0'),0,0,0];
  if(selectedSlot!==null){selectedPlayers[selectedSlot]=owner;held[selectedSlot]=get('labPossHeld');pressed[selectedSlot]=get('labPossPressed');}
  else {get('labPossHeld');get('labPossPressed');}
  const ram=createOriginalPossessionRam({gameScript,frame,owner,selectedPlayers,held,pressed,controlPositions:[get('labPossControl0'),get('labPossControl1')]});
  const result=stepOriginalScriptBit0ControlBranch(ram);
  labLastPossessionTrace={...result,ownerAction:ram[0x0479+owner],ownerAngle:ram[0x04b0+owner],ownerFlag:ram[0x067e+owner],matchedSlotAction:selectedSlot===null?null:ram[0x0479+selectedSlot]};
  $('labPossStatus').textContent=result.implemented
   ?`$B850: ${result.branch}; ${result.writes.length?result.writes.map(w=>`RAM $${w.address.toString(16).toUpperCase().padStart(4,'0')} ← ${labHex(w.value)}`).join('; '):'no RAM writes'}. No action execution or NES runtime parity.`
   :`$B4B2 dispatches four $B4C9 calls; all ${result.pendingCalls.length} remain unexecuted. RAM unchanged.`;
 }catch(err){labLastPossessionTrace=null;$('labPossStatus').textContent=`Possession trace rejected: ${err.message}`;}
});
$('labPossResetBtn').addEventListener('click',()=>{
 for(const [id,value] of Object.entries(POSS_INPUT_DEFAULTS))$(id).value=String(value);
 labLastPossessionTrace=null;$('labPossStatus').textContent='Possession trace reset. No original gameplay executed.';
});
// Full $B4B2 branch selector, still isolated from the Enhanced match and
// original action executor. The legacy $B850 preview above is preserved.
let labLastAlternateTrace=null,labLastAlternateRam=null;
const ALT_INPUT_DEFAULTS=Object.freeze({labAltScript:0,labAltSlot:'0',labAltPlayer:2,labAltState:128,labAltAction:128,labAltHeld:0,labAltPressed:128,labAltOwner:12,labAltMovement:0,labAltTimer:0,labAltTeam0:0,labAltTeam1:0,labAltPass0:15});
$('labAltTraceBtn').addEventListener('click',()=>{
 try{
  const get=id=>{const n=Number($(id).value);if(!Number.isInteger(n)||n<0||n>255)throw new RangeError(`${id} must be a byte (0–255)`);return n;};
  const slot=Number($('labAltSlot').value),player=get('labAltPlayer'),owner=get('labAltOwner');
  const ram=createOriginalAlternateControllerRam({slot,player,gameScript:get('labAltScript'),playerState:get('labAltState'),action:get('labAltAction'),held:get('labAltHeld'),pressed:get('labAltPressed'),owner,playerMovement:get('labAltMovement'),playerTimer:get('labAltTimer'),teamPossession:[get('labAltTeam0'),get('labAltTeam1')],passDirections:[get('labAltPass0'),15]});
  const result=stepOriginalControllerDispatch(ram);
  labLastAlternateRam=ram.slice();
  labLastAlternateTrace={...result,player,slot,playerAction:ram[0x0479+player],playerAngle:ram[0x04b0+player]};
  if(result.dispatch==='$B850'){
   $('labAltStatus').textContent=`$B850 branch ${result.branch}; ${result.writes.length} source-local writes. Action executor NOT run.`;
  }else{
   const selected=result.calls[slot];
   $('labAltStatus').textContent=`$B4C9: ${result.calls.length} slots processed; selected slot ${slot} → player ${player}, ${selected.reason}; ${selected.helperInvoked?`group ${selected.group}, class ${selected.classIndex}, table $${selected.tablePtr.toString(16).toUpperCase()}, raw action ${labHex(ram[0x0479+player])}, angle ${labHex(ram[0x04b0+player])}`:'gate closed'}; ${selected.changes.length} changed bytes. NO original match physics or runtime parity.`;
  }
 }catch(err){labLastAlternateTrace=null;labLastAlternateRam=null;$('labAltStatus').textContent=`Controller selector rejected: ${err.message}`;}
});
$('labAltResetBtn').addEventListener('click',()=>{
 for(const [id,value] of Object.entries(ALT_INPUT_DEFAULTS))$(id).value=String(value);
 labLastAlternateTrace=null;labLastAlternateRam=null;$('labAltStatus').textContent='Controller selector fixture reset. Classic Mode remains disabled.';
});
// Bank06 $AA14-$AAAB source-local arbitration, still NOT football physics.
let labLastArbitrationTrace=null;
const ARB_DEFAULTS=Object.freeze({labArbPlayer:2,labArbAction:53,labArbMovement:128,labArbState:128,labArbWeather:0,labArbSkill:1,labArbSurface:0,labArbVariant:0});
const labArbByte=id=>{const n=Number($(id).value);if(!Number.isInteger(n)||n<0||n>255)throw new RangeError(`${id} must be a byte (0–255)`);return n;};
const showArbTrace=(ram,player,tableVariant,origin)=>{
 const result=stepOriginalActionArbitration(ram,player,{tableVariant});
 labLastArbitrationTrace={...result,origin};
 $('labArbStatus').textContent=`${origin}: ${result.reason}; action ${labHex(result.actionBefore)} → ${labHex(result.actionAfter)}, movement ${labHex(result.movementBefore)} → ${labHex(result.movementAfter)}, ${result.writes.length} RAM writes. NO football physics or original NES frame parity.`;
};
$('labArbTraceBtn').addEventListener('click',()=>{
 try{
  const player=labArbByte('labArbPlayer');
  const ram=createOriginalActionArbitrationRam({player,action:labArbByte('labArbAction'),movement:labArbByte('labArbMovement'),playerState:labArbByte('labArbState'),weather:labArbByte('labArbWeather'),skill:labArbByte('labArbSkill'),surface:labArbByte('labArbSurface')});
  showArbTrace(ram,player,Number($('labArbVariant').value),'Independent synthetic RAM');
 }catch(err){labLastArbitrationTrace=null;$('labArbStatus').textContent=`Arbitration rejected: ${err.message}`;}
});
$('labArbChainBtn').addEventListener('click',()=>{
 try{
  if(!labLastAlternateRam||!labLastAlternateTrace)throw new Error('run the controller selector above first');
  const player=labLastAlternateTrace.player;
  if(player>11)throw new RangeError('controller selected a non-player object');
  showArbTrace(labLastAlternateRam.slice(),player,Number($('labArbVariant').value),'Controller → arbitration');
 }catch(err){labLastArbitrationTrace=null;$('labArbStatus').textContent=`Arbitration chain rejected: ${err.message}`;}
});
$('labArbResetBtn').addEventListener('click',()=>{
 for(const [id,value] of Object.entries(ARB_DEFAULTS))$(id).value=String(value);
 labLastArbitrationTrace=null;$('labArbStatus').textContent='Arbitration fixture reset. No original gameplay executed.';
});
// Source-local movement-state / pending ball-action branch fixture, NOT a NES frame.
let labLastMovementTrace=null;
function movementFixture(){
 const player=labArbByte('labMovePlayer');
 if(player>11)throw new RangeError('player slot must be 0–11');
 const ram=new Uint8Array(0x800);
 ram[0x0459+player]=labArbByte('labMoveId');
 ram[0x0486+player]=labArbByte('labMoveState');
 ram[0x0399+player]=labArbByte('labMoveZHi');
 ram[0x0386+player]=labArbByte('labMoveZLo');
 ram[0x0485]=labArbByte('labMoveShot');
 ram[0x0492]=labArbByte('labMoveBallState');
 return {ram,player};
}
$('labMoveStateBtn').addEventListener('click',()=>{
 try{
  const {ram,player}=movementFixture();
  const trace=stepOriginalMovementState(ram,player,{tableVariant:Number($('labMoveVariant').value)});
  labLastMovementTrace=trace;
  $('labMoveStatus').textContent=`$AACA: movement ${labHex(trace.movement)}, metadata $${trace.metadataAddress.toString(16).toUpperCase()}, state ${labHex(trace.stateBefore)} → ${labHex(trace.stateAfter)}. NO physics or NES reference parity.`;
 }catch(error){labLastMovementTrace=null;$('labMoveStatus').textContent=`Movement state rejected: ${error.message}`;}
});
$('labMoveShotBtn').addEventListener('click',()=>{
 try{
  const {ram,player}=movementFixture();
  const trace=stepOriginalBallShotPriority(ram,player);
  labLastMovementTrace=trace;
  $('labMoveStatus').textContent=`$AB2A: ${trace.reason}, pending ${labHex(trace.pendingBefore)} → ${labHex(trace.pendingAfter)}, movement ${labHex(trace.movementAfter)}. Weather callback and ball physics NOT implemented.`;
 }catch(error){labLastMovementTrace=null;$('labMoveStatus').textContent=`Ball-action branch rejected: ${error.message}`;}
});
$('playBtn').addEventListener('click',start);
$('restartBtn').addEventListener('click',start);
$('homeBtn').addEventListener('click',()=>show('home'));
function tapPause(){if(visible!=='game')return;
 if(playback)playbackPaused=!playbackPaused;
 else tapButton('pause');
 renderer.draw(match);
}
$('pauseBtn').addEventListener('click',tapPause);
$('gamePauseBtn').addEventListener('click',tapPause);
$('switchBtn').addEventListener('click',()=>{if(visible==='game'&&!playback){
  tapButton('switch');renderer.draw(match);
 }});
$('saveReplayBtn').addEventListener('click',()=>{
 try{const replay=recorder?exportReplay(recorder):playback?.replay;
  if(!replay)throw new Error('Start a match or load a replay first');
  const blob=new Blob([JSON.stringify(replay)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=`kunio-replay-${replay.seed}-${replay.frames.length}.json`;
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  notice(`Saved ${replay.frames.length} recorded input frames.`);
 }catch(err){notice(`Replay export failed: ${err.message}`);}
});
$('loadReplayBtn').addEventListener('click',()=>$('replayFile').click());
$('replayFile').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{if(file.size>4_000_000)throw new Error('Replay file exceeds 4 MB');
  const parsed=JSON.parse(await file.text());const loaded=createPlayback(parsed);
  playback=loaded;match=loaded.state;recorder=null;playbackPaused=false;recordingStopped=false;
  input.release();accumulator=0;lastTime=0;$('saveReplayBtn').disabled=false;
  show('game');renderer.draw(match);notice(`Playing verified-format replay: ${parsed.frames.length} input frames.`);
 }catch(err){notice(`Replay import rejected: ${err.message}`);}
 e.target.value='';
});
$('controlsBtn').addEventListener('click',()=>{lastPanel=visible;show('settings');renderSettings();});
$('closeSettings').addEventListener('click',()=>show(lastPanel));
function renderSettings(){
 const keyContainer=$('keyboardBindings');keyContainer.replaceChildren();
 for(const [a,code] of Object.entries(input.settings.keyboard)){
  const row=document.createElement('div');row.className='setting-row';
  const name=document.createElement('span');name.textContent=a;
  const b=document.createElement('button');b.textContent=code.replace(/^(Key|Digit)/,'');
  b.addEventListener('click',()=>{
    b.textContent='PRESS KEY…';const onKey=e=>{e.preventDefault();e.stopPropagation();window.removeEventListener('keydown',onKey,true);
      try{input.rebindKeyboard(a,e.code);$('settingsNotice').textContent=`${a} assigned to ${e.code}`;}
      catch(err){$('settingsNotice').textContent=err.message;}
      renderSettings();};window.addEventListener('keydown',onKey,true);});
  row.append(name,b);keyContainer.append(row);
 }
 const gp=$('gamepadBindings');gp.replaceChildren();
 for(const [a,val] of Object.entries(input.settings.gamepad)){
  const row=document.createElement('div');row.className='setting-row';
  const name=document.createElement('span');name.textContent=a;const sel=document.createElement('select');
  for(let i=0;i<=16;i++){const opt=document.createElement('option');opt.value=String(i);opt.textContent=`Button ${i}`;opt.selected=i===val;sel.append(opt);}
  sel.addEventListener('change',()=>input.setPadButton(a,Number(sel.value)));
  row.append(name,sel);gp.append(row);
 }
 const touch=$('touchBindings');touch.replaceChildren();
 for(const [button,val] of Object.entries(input.settings.touch)){
  const row=document.createElement('div');row.className='setting-row';const name=document.createElement('span');name.textContent=`Button ${button}`;
  const sel=document.createElement('select');for(const a of ACTIONS){const opt=document.createElement('option');opt.value=a;opt.textContent=a;opt.selected=a===val;sel.append(opt);}
  sel.addEventListener('change',()=>{input.setTouchAction(button,sel.value);renderSettings();renderTouchLabels();});
  row.append(name,sel);touch.append(row);
 }
}
$('resetControls').addEventListener('click',()=>{input.settings=defaults();input.save();renderSettings();renderTouchLabels();$('settingsNotice').textContent='Defaults restored';});
function renderTouchLabels(){for(const b of document.querySelectorAll('[data-touch]'))b.textContent=input.settings.touch[b.dataset.touch].toUpperCase();}
renderTouchLabels();
const joystick=$('joystick'),dot=$('joystickDot');let joystickPointer=null;
function joystickMove(e){const r=joystick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
 const x=(e.clientX-cx)/(r.width*.36),y=(e.clientY-cy)/(r.height*.36);
 input.setJoystick(x,y);dot.style.transform=`translate(${input.joystick.dx*r.width*.27}px,${input.joystick.dy*r.height*.27}px)`;}
function endStick(e){if(joystickPointer!==e.pointerId)return;joystickPointer=null;input.setJoystick(0,0);dot.style.transform='';}
joystick.addEventListener('pointerdown',e=>{e.preventDefault();if(joystickPointer!==null)return;joystickPointer=e.pointerId;joystick.setPointerCapture(e.pointerId);joystickMove(e);});
joystick.addEventListener('pointermove',e=>{if(e.pointerId===joystickPointer)joystickMove(e);});
joystick.addEventListener('pointerup',endStick);joystick.addEventListener('pointercancel',endStick);
for(const b of document.querySelectorAll('[data-touch]')){
 b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);input.pressTouch(e.pointerId,b.dataset.touch);b.classList.add('is-down');});
 const release=e=>{input.releaseTouch(e.pointerId);if(!Array.from(input.touchHeld.values()).includes(b.dataset.touch))b.classList.remove('is-down');};
 b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);
}
document.addEventListener('visibilitychange',()=>{if(document.hidden){
 input.release();accumulator=0;lastTime=0;
 if(playback)playbackPaused=true;
 else if(visible==='game'&&match.phase==='playing')tapButton('pause');
}});
function animate(now){requestAnimationFrame(animate);if(!lastTime)lastTime=now;
 const delta=Math.min(now-lastTime,150);lastTime=now;
 if(visible!=='game')return;
 accumulator+=delta;const fixed=1000/TICK_RATE;
 let updates=0;
 while(accumulator>=fixed&&updates<6){
  if(playback){
    if(!playbackPaused&&!playback.done){
      try{playbackStep(playback);if(playback.done)notice('Replay finished: checksum verified.');}
      catch(err){playbackPaused=true;notice(`Replay stopped: ${err.message}`);}
    }
  }else if(match.phase!=='ended'){
    const frame=input.frame();
    // Do not accumulate empty idle frames while paused. Record the release edge once.
    if(match.phase!=='paused'||frame.pause||match.previousButtons.pause)liveStep(frame);
  }
  accumulator-=fixed;updates++;
}
 if(updates===6)accumulator=0; // drop excess wall-time; never variable simulation steps.
 renderer.draw(match);
 $('status').textContent=playback
  ? `REPLAY ${playback.index}/${playback.replay.frames.length}${playbackPaused?' • PAUSED':''}${playback.done?' • VERIFIED':''}`
  : `${match.phase.toUpperCase()} • TICK ${match.tick}${recordingStopped?' • RECORDING LIMIT':''}`;
}
requestAnimationFrame(animate);
// Expose read-only test instrumentation with no production cheating or state mutation.
window.__kunioDebug=Object.freeze({getSnapshot:()=>({tick:match.tick,phase:match.phase,score:[...match.score],ball:{...match.ball},controlled:match.controlled,selectedPlayer:{...match.players.find(p=>p.id===match.controlled)}}),getPanel:()=>visible,getOriginalInputLab:()=>({selected:[...labSelected],held:[...labState.held],pressed:[...labState.pressed],samples:labState.samples,random:{...labRandom},field:{...labField},lastAudioCommands:[...labLastAudioCommands],kickoffDecision:labLastKickoffDecision?structuredClone(labLastKickoffDecision):null,goalCutscene:{...labGoal},goalCutsceneDecision:labLastGoalDecision?structuredClone(labLastGoalDecision):null,playerActionTrace:labLastActionTrace?structuredClone(labLastActionTrace):null,actionBuffers:{...labActionBuffers},bufferTrace:labLastBufferTrace?{...labLastBufferTrace}:null,possessionTrace:labLastPossessionTrace?structuredClone(labLastPossessionTrace):null,alternateTrace:labLastAlternateTrace?structuredClone(labLastAlternateTrace):null,arbitrationTrace:labLastArbitrationTrace?structuredClone(labLastArbitrationTrace):null,movementTrace:labLastMovementTrace?structuredClone(labLastMovementTrace):null,fieldHandler:resolveOriginalMatchSubscreenHandler(2),screenHandler:resolveOriginalScreenHandler(0)}),getInput:()=>({...input.frame()}),getReplayStatus:()=>({mode:playback?'playback':recorder?'recording':'none',frames:recorder?.frames.length??playback?.replay.frames.length??0,index:playback?.index??0,done:playback?.done??false,paused:playbackPaused,recordingStopped})});
