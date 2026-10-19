import test from 'node:test';
import assert from 'node:assert/strict';
import {createMatch,RULES_VERSION} from '../src/core/Match.js';
import {REPLAY_FORMAT,REPLAY_SCHEMA,CHECKPOINT_INTERVAL,MAX_REPLAY_FRAMES,
  canonicalFrame,createRecorder,recordStep,exportReplay,validateReplay,
  createPlayback,playbackStep,verifyReplay,stateDigest} from '../src/core/Replay.js';
import {SOURCE_SHA,ORIGINAL_RAM,ORIGINAL_OBJECT_SLOTS,ORIGINAL_SCREEN,
  ORIGINAL_MATCH_SUBSCREEN,ORIGINAL_GAME_SCRIPT} from '../src/classic/OriginalStateIds.js';
const record=(seed,inputs)=>{const s=createMatch(seed),r=createRecorder(s);for(const frame of inputs)recordStep(r,s,frame);return {s,r,replay:exportReplay(r)};};
const clone=x=>structuredClone(x);

test('source-backed original RAM, object and scene identifiers are distinct from gameplay implementation',()=>{
 assert.equal(SOURCE_SHA,'df2c8e55e7f13e5792482527db9e7c9e4a84c6e1');
 assert.deepEqual([ORIGINAL_RAM.BUTTON_HOLD,ORIGINAL_RAM.BUTTON_PRESS,ORIGINAL_RAM.GAME_SCRIPT],[4,8,0x5c]);
 assert.deepEqual([ORIGINAL_OBJECT_SLOTS.LAST_FIELD_PLAYER,ORIGINAL_OBJECT_SLOTS.FIRST_KEEPER,ORIGINAL_OBJECT_SLOTS.BALL],[9,10,12]);
 assert.deepEqual([ORIGINAL_SCREEN.MATCH,ORIGINAL_SCREEN.MENU,ORIGINAL_MATCH_SUBSCREEN.GOAL],[0,2,3]);
 assert.deepEqual([ORIGINAL_GAME_SCRIPT.NORMAL,ORIGINAL_GAME_SCRIPT.GOAL,ORIGINAL_GAME_SCRIPT.PAUSE],[0,0x42,0x80]);
 assert.ok(Object.isFrozen(ORIGINAL_GAME_SCRIPT));
});
test('recording starts only from a fresh development match',()=>{
 const s=createMatch();s.tick=1;assert.throws(()=>createRecorder(s),/new development match/);
 s.tick=0;s.mode='classic';assert.throws(()=>createRecorder(s),/new development match/);
});
test('canonical inputs are finite, bounded, and quantized before simulation',()=>{
 assert.deepEqual(canonicalFrame({dx:1.5,dy:-.12345678,shoot:1}),
  {dx:1,dy:-.123457,shoot:true,pass:false,tackle:false,sprint:false,switch:false,pause:false});
 assert.throws(()=>canonicalFrame({dx:Infinity}),/Invalid input axis/);
 assert.throws(()=>canonicalFrame({dy:NaN}),/Invalid input axis/);
 assert.throws(()=>canonicalFrame(null),/Input frame/);
});
test('empty recording verifies the initial state checksum',()=>{
 const {replay}=record(123,[]);assert.equal(replay.frames.length,0);
 assert.equal(verifyReplay(replay).finalHash,stateDigest(createMatch(123)));
});
test('replay serializes mode, seed, rules version, tick rate and format',()=>{
 const {replay}=record(42,[{dx:1,shoot:true}]);
 assert.equal(replay.format,REPLAY_FORMAT);assert.equal(replay.schemaVersion,REPLAY_SCHEMA);
 assert.equal(replay.mode,'enhanced-dev');assert.equal(replay.rulesVersion,RULES_VERSION);
 assert.equal(replay.seed,42);assert.equal(replay.tickRate,60);
});
test('recorded 800-frame input tape reproduces complete state and checksum',()=>{
 const inputs=Array.from({length:800},(_,i)=>({dx:Math.sin(i*.07),dy:Math.cos(i*.09),
  shoot:i%43===3,pass:i%57===4,tackle:i%61===5,sprint:i%2===0,switch:i%47===7}));
 const {s,replay}=record(321,inputs);
 const player=createPlayback(JSON.parse(JSON.stringify(replay)));
 while(playbackStep(player)){}
 assert.equal(player.done,true);assert.equal(player.index,800);
 assert.deepEqual(player.state,s);assert.equal(verifyReplay(replay).finalHash,replay.finalHash);
 assert.equal(replay.checkpoints.length,Math.floor(800/CHECKPOINT_INTERVAL));
});
test('pause/resume frames replay even when paused steps do not advance tick',()=>{
 const inputs=[{},...Array.from({length:55},()=>({dx:1})),{pause:true},{pause:false},
  ...Array.from({length:25},()=>({})),{pause:true},{pause:false},...Array.from({length:25},()=>({dx:-1}))];
 const {s,replay}=record(42,inputs);assert.equal(s.phase,'playing');
 assert.equal(verifyReplay(replay).tick,s.tick);
});
test('replay snapshots are detached from continued recording',()=>{
 const s=createMatch(123),r=createRecorder(s);recordStep(r,s,{dx:1});
 const first=exportReplay(r);recordStep(r,s,{dx:0,pass:true});
 assert.equal(first.frames.length,1);assert.equal(first.frames[0].pass,false);
 assert.equal(verifyReplay(first).frames,1);
});
test('checkpoint tampering is detected exactly at its frame',()=>{
 const {replay}=record(5,Array.from({length:240},()=>({dx:1})));
 replay.frames[80].dx=-1;
 assert.throws(()=>verifyReplay(replay),/Replay desync at frame 120/);
});
test('tail tampering is detected by final checksum',()=>{
 const {replay}=record(6,Array.from({length:121},()=>({dx:1})));
 replay.frames[120].dx=-1;
 assert.throws(()=>verifyReplay(replay),/Replay desync at final checksum/);
});
test('incompatible Classic mode and rules version are rejected',()=>{
 const {replay}=record(1,[{}]);const classic=clone(replay);classic.mode='classic';
 assert.throws(()=>validateReplay(classic),/incompatible/);
 const bad=clone(replay);bad.rulesVersion='enhanced-dev-999';
 assert.throws(()=>validateReplay(bad),/incompatible/);
});
test('malformed frame, axes, action type and unknown keys are rejected',()=>{
 const {replay}=record(2,[{dx:1}]);
 for(const mutate of [r=>{r.frames[0].dx=2;},r=>{r.frames[0].shoot=1;},
  r=>{delete r.frames[0].pass;},r=>{r.frames[0].attack=true;}]){
  const bad=clone(replay);mutate(bad);assert.throws(()=>validateReplay(bad),/Replay/);
 }
});
test('replay rejects bad seed, invalid checksum, wrong checkpoint count and invalid format',()=>{
 const {replay}=record(3,[{}]);
 for(const mutate of [r=>{r.seed=-1;},r=>{r.finalHash='zzzzzzzz';},
  r=>{r.checkpoints.push({frame:120,hash:'12345678'});},r=>{r.format='emulator-rom';}]){
  const bad=clone(replay);mutate(bad);assert.throws(()=>validateReplay(bad));
 }
});
test('oversized tapes are rejected before playback',()=>{
 const {replay}=record(4,[]);replay.frames=new Array(MAX_REPLAY_FRAMES+1);
 assert.throws(()=>validateReplay(replay),/Invalid replay length/);
});
test('recording rejects mismatched seeds and versions',()=>{
 const s=createMatch(1),r=createRecorder(s);
 assert.throws(()=>recordStep(r,createMatch(2),{}),/does not match tape/);
});
test('playbackStep returns false after finishing without mutating final state',()=>{
 const {replay}=record(8,[{},{}]);const p=createPlayback(replay);
 assert.equal(playbackStep(p),true);assert.equal(playbackStep(p),true);
 const digest=stateDigest(p.state);assert.equal(playbackStep(p),false);
 assert.equal(stateDigest(p.state),digest);
});
test('different seeds produce different replay checksums',()=>{
 const a=record(101,[{},{}]).replay,b=record(102,[{},{}]).replay;
 assert.notEqual(a.finalHash,b.finalHash);
});
