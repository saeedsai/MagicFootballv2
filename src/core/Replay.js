/**
 * Deterministic input-tape infrastructure for the provisional development match.
 * This does NOT establish parity with the original NES game. No ROM data is used.
 * Replays are versioned and deliberately rejected if rules change.
 */
import {createMatch,stepMatch,TICK_RATE,RULES_VERSION} from './Match.js';

export const REPLAY_FORMAT='kunio-soccer-input-replay';
export const REPLAY_SCHEMA=1;
export const CHECKPOINT_INTERVAL=120;
export const MAX_REPLAY_FRAMES=24000;
const BUTTONS=['shoot','pass','tackle','sprint','switch','pause'];
const UINT32_MAX=4294967295;
const isUInt32=n=>Number.isInteger(n)&&n>=0&&n<=UINT32_MAX;
const hex=x=>x.toString(16).padStart(8,'0');

/** Stable, portable checksum of the entire simulation state, not just the score. */
export function stateDigest(state){
  const json=JSON.stringify(state);
  let hash=2166136261;
  for(let i=0;i<json.length;i++){
    hash^=json.charCodeAt(i);
    hash=Math.imul(hash,16777619)>>>0;
  }
  return hex(hash>>>0);
}

/** Canonicalize physical inputs before *both* simulation and recording. */
export function canonicalFrame(raw={}){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new TypeError('Input frame must be an object');
  const axis=key=>{
    const n=raw[key]??0;
    if(typeof n!=='number'||!Number.isFinite(n))throw new TypeError(`Invalid input axis ${key}`);
    const v=Math.round(Math.max(-1,Math.min(1,n))*1e6)/1e6;
    return v===0?0:v;
  };
  const out={dx:axis('dx'),dy:axis('dy')};
  for(const key of BUTTONS)out[key]=!!raw[key];
  return out;
}

function assertFrame(frame){
  if(!frame||typeof frame!=='object'||Array.isArray(frame))throw new Error('Invalid replay frame');
  if(Object.keys(frame).sort().join(',')!==['dx','dy',...BUTTONS].sort().join(','))throw new Error('Replay frame has missing/extra actions');
  for(const key of ['dx','dy'])if(typeof frame[key]!=='number'||!Number.isFinite(frame[key])||Math.abs(frame[key])>1)throw new Error('Replay axis out of range');
  for(const key of BUTTONS)if(typeof frame[key]!=='boolean')throw new Error('Replay action must be boolean');
}
function assertHash(hash){return typeof hash==='string'&&/^[a-f0-9]{8}$/.test(hash);}

export function createRecorder(initialState){
  if(!initialState||initialState.tick!==0||initialState.phase!=='ready'||initialState.mode!=='enhanced-dev'||initialState.rulesVersion!==RULES_VERSION)
    throw new Error('Recording must begin with a new development match');
  return {format:REPLAY_FORMAT,schemaVersion:REPLAY_SCHEMA,mode:initialState.mode,
    rulesVersion:initialState.rulesVersion,tickRate:TICK_RATE,seed:initialState.seed,
    frames:[],checkpoints:[],finalHash:stateDigest(initialState)};
}

/** Mutates the match and appends exactly the input consumed by that step. */
export function recordStep(recorder,state,raw={}){
  if(recorder.frames.length>=MAX_REPLAY_FRAMES)throw new Error('Replay frame limit reached');
  if(state.seed!==recorder.seed||state.mode!==recorder.mode||state.rulesVersion!==recorder.rulesVersion)
    throw new Error('Recording state does not match tape');
  const frame=canonicalFrame(raw);
  stepMatch(state,frame);
  recorder.frames.push(frame);
  recorder.finalHash=stateDigest(state);
  if(recorder.frames.length%CHECKPOINT_INTERVAL===0)
    recorder.checkpoints.push({frame:recorder.frames.length,hash:recorder.finalHash});
  return state;
}

/** A detached serializable snapshot: continued recording cannot mutate downloads. */
export function exportReplay(recorder){
  const replay={format:recorder.format,schemaVersion:recorder.schemaVersion,mode:recorder.mode,
    rulesVersion:recorder.rulesVersion,tickRate:recorder.tickRate,seed:recorder.seed,
    frames:recorder.frames.map(frame=>({...frame})),checkpoints:recorder.checkpoints.map(c=>({...c})),
    finalHash:recorder.finalHash};
  validateReplay(replay);
  return replay;
}

/** Reject incompatible, malformed and oversized user-supplied replay files. */
export function validateReplay(replay){
  if(!replay||typeof replay!=='object'||Array.isArray(replay))throw new Error('Invalid replay file');
  if(replay.format!==REPLAY_FORMAT||replay.schemaVersion!==REPLAY_SCHEMA)throw new Error('Unsupported replay format');
  if(replay.mode!=='enhanced-dev'||replay.rulesVersion!==RULES_VERSION||replay.tickRate!==TICK_RATE)
    throw new Error('Replay belongs to an incompatible mode or rules version');
  if(!isUInt32(replay.seed))throw new Error('Invalid replay seed');
  if(!Array.isArray(replay.frames)||replay.frames.length>MAX_REPLAY_FRAMES)throw new Error('Invalid replay length');
  for(const frame of replay.frames)assertFrame(frame);
  if(!Array.isArray(replay.checkpoints)||replay.checkpoints.length!==Math.floor(replay.frames.length/CHECKPOINT_INTERVAL))
    throw new Error('Invalid checkpoint count');
  for(let i=0;i<replay.checkpoints.length;i++){
    const c=replay.checkpoints[i];
    if(!c||c.frame!==(i+1)*CHECKPOINT_INTERVAL||!assertHash(c.hash))throw new Error('Invalid replay checkpoint');
  }
  if(!assertHash(replay.finalHash))throw new Error('Invalid final checksum');
  return replay;
}

export function createPlayback(replay){
  validateReplay(replay);
  return {replay,state:createMatch(replay.seed),index:0,done:false};
}

/** Returns true if a recorded input was consumed; throws on deterministic drift. */
export function playbackStep(player){
  if(player.done)return false;
  const {replay,state}=player;
  if(player.index===replay.frames.length){
    if(stateDigest(state)!==replay.finalHash)throw new Error('Replay desync at final checksum');
    player.done=true;
    return false;
  }
  stepMatch(state,replay.frames[player.index]);
  player.index++;
  if(player.index%CHECKPOINT_INTERVAL===0){
    const expected=replay.checkpoints[player.index/CHECKPOINT_INTERVAL-1];
    if(stateDigest(state)!==expected.hash)throw new Error(`Replay desync at frame ${player.index}`);
  }
  if(player.index===replay.frames.length){
    if(stateDigest(state)!==replay.finalHash)throw new Error('Replay desync at final checksum');
    player.done=true;
  }
  return true;
}

export function verifyReplay(replay){
  const player=createPlayback(replay);
  while(playbackStep(player)){}
  return {frames:player.index,tick:player.state.tick,score:[...player.state.score],finalHash:stateDigest(player.state)};
}
