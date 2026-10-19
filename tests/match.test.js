import test from 'node:test';
import assert from 'node:assert/strict';
import {createMatch,stepMatch,stepMany,stateSnapshot,FIELD,MAX_TICKS,TICK_RATE,EMPTY_INPUT} from '../src/core/Match.js';
const advance=(s,n,frame={})=>{for(let i=0;i<n;i++)stepMatch(s,frame);return s;};
const kickoff=s=>{s.kickoffTicks=0;s.phase='playing';return s;};

test('schema separates development ruleset from classic',()=>{
 const s=createMatch(123);assert.equal(s.mode,'enhanced-dev');assert.notEqual(s.rulesVersion,'classic');
 assert.equal(s.players.length,12);assert.equal(s.players.filter(p=>p.keeper).length,2);
 assert.equal(s.players.filter(p=>!p.keeper).length,10);
});
test('60Hz deterministic replay produces identical snapshots',()=>{
 const seed=754;const seq=Array.from({length:300},(_,i)=>({dx:i%30<15?1:-1,dy:i%40<20?0.65:-0.6,
    sprint:i%40<10,shoot:i%47===3,pass:i%83===2,tackle:i%63===1}));
 const a=stepMany(createMatch(seed),seq),b=stepMany(createMatch(seed),seq);
 assert.equal(stateSnapshot(a),stateSnapshot(b));
});
test('simulation does not call Math.random',()=>{
 const old=Math.random;Math.random=()=>{throw Error('non-deterministic RNG')};
 try{advance(createMatch(22),420,{dx:1});}finally{Math.random=old;}
});
test('fixed step counts do not depend on render FPS',()=>{
 const s=createMatch();advance(s,120);assert.equal(s.tick,120);assert.equal(s.remainingTicks,MAX_TICKS-120);
});
test('human moves on diagonal at normalized speed',()=>{
 const s=kickoff(createMatch());const p=s.players.find(p=>p.id==='0-0');
 s.selectedUntil=Infinity;const start=[p.x,p.y];stepMatch(s,{dx:1,dy:1});
 assert.ok(p.x>start[0]&&p.y>start[1]);
 assert.ok(Math.hypot(p.x-start[0],p.y-start[1])<=2.66);
});
test('player cannot escape pitch',()=>{
 const s=kickoff(createMatch());const p=s.players.find(p=>p.id==='0-0');p.x=FIELD.left+10;p.y=FIELD.top+9;
 s.selectedUntil=Infinity;advance(s,100,{dx:-1,dy:-1});
 assert.ok(p.x>=FIELD.left+10&&p.y>=FIELD.top+9);
});
test('sprint moves farther than jog',()=>{
 const s=kickoff(createMatch()),f=kickoff(createMatch());
 s.selectedUntil=Infinity;f.selectedUntil=Infinity;
 const a=s.players[0].x,b=f.players[0].x;
 stepMatch(s,{dx:1,sprint:true});stepMatch(f,{dx:1});
 assert.ok(s.players[0].x-a>f.players[0].x-b);
});
test('paused state freezes physics, tick and match clock',()=>{
 const s=kickoff(createMatch());stepMatch(s,{pause:true});
 const snap=stateSnapshot(s);advance(s,170,{dx:1});assert.equal(stateSnapshot(s),snap);
 stepMatch(s,{pause:true}); // after key release, pause button resumes
 assert.equal(s.phase,'playing');
 stepMatch(s,{pause:true});assert.equal(s.phase,'playing'); // held key does not toggle again
 stepMatch(s,{pause:false});stepMatch(s,{pause:true});assert.equal(s.phase,'paused');
});
test('human can capture, shoot and release ball on edge',()=>{
 const s=kickoff(createMatch());const p=s.players[0];s.ball={x:p.x+8,y:p.y,vx:0,vy:0,owner:null,lastTouch:null};
 s.selectedUntil=Infinity;stepMatch(s,{});assert.equal(s.ball.owner,p.id);
 stepMatch(s,{shoot:true});assert.equal(s.ball.owner,null);assert.ok(s.ball.vx>0);
 assert.equal(s.lastEvent,'shot');
});
test('pass targets another blue field player and moves ball',()=>{
 const s=kickoff(createMatch());s.selectedUntil=Infinity;s.ball.owner='0-0';
 stepMatch(s,{pass:true});assert.equal(s.ball.owner,null);
 assert.ok(Math.hypot(s.ball.vx,s.ball.vy)>5);
 assert.equal(s.lastEvent,'pass');
});
test('tackle changes possession only from near defender',()=>{
 const s=kickoff(createMatch());s.selectedUntil=Infinity;
 const human=s.players[0],enemy=s.players.find(p=>p.id==='1-0');
 enemy.x=human.x+19;enemy.y=human.y;s.ball.owner=enemy.id;
 stepMatch(s,{tackle:true});assert.equal(s.ball.owner,human.id);assert.equal(s.lastEvent,'tackle');
});
test('goal detection increments score and resets kickoff',()=>{
 const s=kickoff(createMatch());s.ball={x:FIELD.right+8,y:270,vx:4,vy:0,owner:null,lastTouch:0};
 stepMatch(s,{});assert.deepEqual(s.score,[1,0]);assert.ok(s.kickoffTicks>0);
 assert.equal(s.lastEvent,'goal');
});
test('outside-goal touchline bounces instead of scoring',()=>{
 const s=kickoff(createMatch());s.ball={x:FIELD.right+5,y:180,vx:7,vy:0,owner:null,lastTouch:0};
 stepMatch(s,{});assert.deepEqual(s.score,[0,0]);assert.ok(s.ball.vx<0);
});
test('ball rebounds off top and bottom boundaries',()=>{
 const s=kickoff(createMatch());s.ball={x:480,y:FIELD.top+4,vx:0,vy:-6,owner:null,lastTouch:null};
 stepMatch(s,{});assert.ok(s.ball.vy>0);assert.ok(s.ball.y>=FIELD.top+7);
});
test('end-of-match clock stops at zero and phase ends',()=>{
 const s=kickoff(createMatch());s.remainingTicks=1;stepMatch(s,{});
 assert.equal(s.phase,'ended');assert.equal(s.remainingTicks,0);
 const t=s.tick;stepMatch(s,{});assert.equal(s.tick,t);
});
test('each team has a goalkeeper guarding its own goal',()=>{
 const s=kickoff(createMatch());
 const keepers=s.players.filter(p=>p.keeper);
 assert.deepEqual(keepers.map(p=>p.side),[0,1]);
 assert.ok(keepers[0].x<FIELD.left+70 && keepers[1].x>FIELD.right-70);
});
test('EMPTY_INPUT supports headless stepping',()=>{
 const s=createMatch();stepMatch(s,EMPTY_INPUT);assert.equal(s.phase,'playing');
});

test('goalkeeper eventually clears a caught ball instead of deadlocking possession',()=>{
 const s=kickoff(createMatch());const keeper=s.players.find(p=>p.id==='0-gk');
 s.ball.owner=keeper.id;keeper.cooldown=4;
 advance(s,5);assert.notEqual(s.ball.owner,keeper.id);assert.ok(Math.abs(s.ball.vx)>0);
});
test('ten thousand frames of CPU simulation complete without exceptions or invalid positions',()=>{
 const s=createMatch(1337);advance(s,10000,{});
 assert.equal(s.tick,10000);assert.ok(s.players.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));
 assert.ok(Number.isFinite(s.ball.x)&&Number.isFinite(s.ball.y));
});
