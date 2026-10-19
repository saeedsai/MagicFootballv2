/**
 * Source-derived two-byte random update, native JavaScript.
 * Pinned upstream bank_FF.asm sub_EE35 ($EE35-$EE59), RAM $0045/$0046.
 * Called in the main loop at $C48C immediately before input read $C48F.
 * Seed initialization and original distribution are NOT yet verified.
 */
export function createOriginalRandomState(byte45=0,byte46=0){
 if(![byte45,byte46].every(v=>Number.isInteger(v)&&v>=0&&v<=255))
  throw new TypeError('random state requires two 8-bit bytes');
 return {byte45,byte46};
}
/**
 * Original sequence: feedback = bit1($45) XOR bit1($46), clear/set carry;
 * ROR $45, then ROR $46 with carry from old bit0($45). Return new $45.
 */
export function stepOriginalRandom(state){
 if(!state||![state.byte45,state.byte46].every(v=>Number.isInteger(v)&&v>=0&&v<=255))
  throw new TypeError('invalid original random state');
 const a=state.byte45,b=state.byte46;
 const feedback=((a^b)>>1)&1;
 state.byte45=(a>>>1)|(feedback<<7);
 state.byte46=(b>>>1)|((a&1)<<7);
 return state.byte45;
}
