/**
 * Native JavaScript port of the original controller sampling/edge transform.
 * Source: pinned upstream bank_FF.asm $EE06-$EE27 (serial reads),
 * $EDCD-$EE05 (stable reread and edge update), called at $C48F.
 * No 6502 emulator, NES ROM, original assets, or original gameplay logic.
 *
 * The four logical channels correspond to serial bits 0 and 1 from $4016
 * and $4017. Whether every channel is exposed by the original hardware is
 * NOT established. Inputs are low-two-bit read samples, not hardware access.
 */
export const NES_BUTTONS=Object.freeze({
  A:0x80,B:0x40,SELECT:0x20,START:0x10,
  UP:0x08,DOWN:0x04,LEFT:0x02,RIGHT:0x01
});
export const NES_BUTTON_ORDER=Object.freeze(Object.keys(NES_BUTTONS));
export const ORIGINAL_CONTROLLER_CHANNELS=4;
const BYTE_MAX=0xff;
const isByte=v=>Number.isInteger(v)&&v>=0&&v<=BYTE_MAX;
const checkHeld=held=>{
  if(!Array.isArray(held)||held.length!==4||!held.every(isByte))
    throw new TypeError('expected exactly four 8-bit controller values');
};
export function createOriginalControllerState(){return {held:[0,0,0,0],pressed:[0,0,0,0],samples:0};}

/**
 * Decode the eight successive $4016/$4017 reads used by sub_EE06.
 * The first serial read becomes bit 7 (A), the eighth bit 0 (Right),
 * exactly as eight 6502 ROL instructions build each byte.
 */
export function decodeOriginalSerialRead(sample){
  if(!sample||!Array.isArray(sample.port4016)||!Array.isArray(sample.port4017)||
     sample.port4016.length!==8||sample.port4017.length!==8||
     ![...sample.port4016,...sample.port4017].every(isByte))
    throw new TypeError('serial sample must contain eight byte reads from each port');
  const raw=[0,0,0,0];
  for(let i=0;i<8;i++){
    const a=sample.port4016[i],b=sample.port4017[i];
    raw[0]=((raw[0]<<1)|(a&1))&BYTE_MAX;
    raw[1]=((raw[1]<<1)|(b&1))&BYTE_MAX;
    raw[2]=((raw[2]<<1)|((a>>1)&1))&BYTE_MAX;
    raw[3]=((raw[3]<<1)|((b>>1)&1))&BYTE_MAX;
  }
  return raw;
}

/** Adapter for the interactive research lab and tests; not original hardware. */
export function encodeOriginalSerialRead(held){
  checkHeld(held);
  const port4016=[],port4017=[];
  for(let bit=7;bit>=0;bit--){
    port4016.push(((held[0]>>bit)&1)|(((held[2]>>bit)&1)<<1));
    port4017.push(((held[1]>>bit)&1)|(((held[3]>>bit)&1)<<1));
  }
  return {port4016,port4017};
}

/** Exact source-derived edge equation: pressed = new & (new XOR old). */
export function updateOriginalControllerEdges(state,raw){
  if(!state||!Array.isArray(state.held)||!Array.isArray(state.pressed))
    throw new TypeError('invalid controller state');
  checkHeld(state.held);checkHeld(state.pressed);checkHeld(raw);
  if(!Number.isSafeInteger(state.samples)||state.samples<0)throw new TypeError('invalid sample counter');
  for(let i=0;i<4;i++){
    state.pressed[i]=(raw[i]^(state.held[i]))&raw[i];
    state.held[i]=raw[i];
  }
  state.samples++;
  return {held:[...state.held],pressed:[...state.pressed]};
}

/**
 * The original $EDCD loop repeats $EE06 until two consecutive four-channel
 * snapshots agree. For browser safety we bound retries (the NES loop does not).
 * A failure is atomic: previous held/pressed values are preserved.
 * readPorts(attempt) supplies eight serial reads for each of two ports.
 */
export function stepOriginalControllerInput(state,readPorts,{maxAttempts=8}={}){
  if(typeof readPorts!=='function')throw new TypeError('readPorts must be a function');
  if(!Number.isInteger(maxAttempts)||maxAttempts<2||maxAttempts>64)
    throw new RangeError('maxAttempts must be an integer from 2 to 64');
  let previous=null;
  for(let attempt=0;attempt<maxAttempts;attempt++){
    const raw=decodeOriginalSerialRead(readPorts(attempt));
    if(previous&&raw.every((v,i)=>v===previous[i])){
      const next=updateOriginalControllerEdges(state,raw);
      return {...next,attempts:attempt+1,raw};
    }
    previous=raw;
  }
  throw new Error(`controller serial reads did not stabilize after ${maxAttempts} attempts`);
}
