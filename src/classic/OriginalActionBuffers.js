/**
 * Native, source-local port of fixed bank $FAEE-$FBA8 (including $FB5F).
 * Upstream: bank_FF.asm, pinned df2c8e55e7f13e5792482527db9e7c9e4a84c6e1.
 * This routine is called by bank04 $B8AB and $B4C9 through trampoline $C07A.
 * It transforms raw NES held/new-press bytes into delayed button and
 * directional-repeat buffers; it does NOT perform football actions.
 * No original runtime frame trace has verified the result yet.
 */
const isBufferByte=n=>Number.isInteger(n)&&n>=0&&n<=255;
const ACTION_BUFFER_FIELDS=['held','pressed','buffer56c','buffer570','buffer574','buffer578','buffer57c','buffer580','buffer584'];
function validateBuffer(s){
 if(!s||typeof s!=='object')throw new TypeError('action buffer state is required');
 for(const key of ACTION_BUFFER_FIELDS){
  if(!isBufferByte(s[key]))throw new TypeError(`${key} must be a byte (0..255)`);
 }
}
export function createOriginalActionBufferState(options={}){
 const s=Object.fromEntries(ACTION_BUFFER_FIELDS.map(key=>[key,options[key]??0]));
 validateBuffer(s);return s;
}
/**
 * $FAEE-$FBA8 for ONE controller slot X; values are the slot's RAM bytes.
 * 0570: transformed action press, 057C: repeated directional press,
 * 056C/0574/0578/0580/0584: persistent timing and edge buffers.
 * $001C is temporary scratch. The source uses 8-bit wrap and a 127 cap.
 */
export function stepOriginalActionBuffers(s){
 validateBuffer(s);
 let scratch=s.held>>1;
 let actionPath='';
 // $FAEE-$FB5C: action-button hold/delay/edge logic.
 if(!(scratch&0xe0)){
  if(s.buffer574){
   scratch=s.buffer574;
   s.buffer574=0;
   s.buffer570=(scratch^s.buffer56c)&scratch;
   s.buffer56c=scratch;
   actionPath='released-pending-action';
  }else{
   s.buffer574=0;s.buffer578=0;s.buffer56c=0;s.buffer570=0;
   actionPath='no-action-hold';
  }
 }else if(((((scratch&0xe0)<<2)&0xff)&s.held)&0x80){
  scratch|=0x80;
  s.buffer570=(scratch^s.buffer56c)&scratch;
  s.buffer56c=scratch;
  actionPath='simultaneous-A-B';
 }else if(scratch&s.buffer574){
  s.buffer578=(s.buffer578+1)&0xff;
  if(s.buffer578>=2){
   scratch=s.buffer574&scratch;
   s.buffer570=(scratch^s.buffer56c)&scratch;
   s.buffer56c=scratch;
   actionPath='held-action-delay-complete';
  }else actionPath='held-action-delay-pending';
 }else{
  s.buffer574=scratch;
  s.buffer578=0;
  actionPath='new-action-hold';
 }
 // $FB5F-$FBA8: directional new-press and rapid repeat detection.
 s.buffer57c=0;
 const direction=s.pressed&0x0f;
 let directionPath='';
 if(!direction){
  s.buffer584=(s.buffer584+1)&0xff;
  if(s.buffer584&0x80)s.buffer584=0x7f;
  directionPath='direction-timer';
 }else{
  const repeat=direction&s.buffer580;
  if(repeat&&s.buffer584<6){
   s.buffer57c=repeat; // $FB7C-$FB83, high nibble is zero after entry clear.
   directionPath='quick-direction-repeat';
  }else{
   s.buffer584=0;
   s.buffer580=(s.buffer580&0xf0)|direction;
   directionPath='new-direction-edge';
  }
 }
 return {actionPath,directionPath,buffer20:s.buffer570,buffer21:s.buffer57c};
}
