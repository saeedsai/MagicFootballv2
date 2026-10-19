/**
 * Two isolated native JavaScript conversions from pinned bank_06.asm:
 *   $AAC3/$AAC8/$AACA-$AB0A: movement-ID metadata -> player-state byte
 *   $AB2A-$AB51: pending ball-shot priority -> player movement ID
 * Pinned source: df2c8e55e7f13e5792482527db9e7c9e4a84c6e1
 *
 * These do NOT run player motion, ball physics, sprite animations, weather
 * callback $9856, or an original NES frame. They accept synthetic RAM and
 * refuse source reads beyond the audited literal tables.
 */
import {ORIGINAL_ACTION_METADATA_BASES,readOriginalActionMetadata} from './OriginalActionArbitration.js';

// bank_06.asm $AC4D-$AC64, exactly 24 raw bytes; not image/audio assets.
export const ORIGINAL_BALL_MOVEMENT_FLAGS=Object.freeze([
 0x00,0x00,0x40,0x40,0x80,0x84,0x80,0x00,
 0x00,0xc0,0x80,0x00,0x00,0x80,0x80,0x48,
 0x48,0x50,0x50,0x40,0xc0,0xc0,0x84,0x00,
]);
const MOVEMENT_TRANSITION_RAM_SIZE=0x800;
function validateMovementRam(ram,player){
 if(!(ram instanceof Uint8Array)||ram.length<MOVEMENT_TRANSITION_RAM_SIZE)
  throw new TypeError('Expected at least $0800 bytes of NES RAM');
 if(!Number.isInteger(player)||player<0||player>11)
  throw new RangeError('Player slot must be an integer 0..11');
}
function movementChanges(before,ram){
 const writes=[];
 for(let i=0;i<before.length;i++)if(before[i]!==ram[i])writes.push({address:i,before:before[i],after:ram[i]});
 return writes;
}

/** Source $AAC3/$AAC8 -> $AACA. Recalculate state flags for movement ID.
 * $0459 is ASL'd as an 8-bit byte; the high bit is discarded by the 6502.
 * tableVariant 0 chooses $AC87, 1 chooses $AC69.
 */
export function stepOriginalMovementState(ram,player,{tableVariant=0}={}){
 validateMovementRam(ram,player);
 if(tableVariant!==0&&tableVariant!==1)throw new RangeError('tableVariant must be 0 or 1');
 const movement=ram[0x0459+player];
 const metadata=readOriginalActionMetadata(movement&0x7f,tableVariant);
 const before=ram.slice();
 const base=ORIGINAL_ACTION_METADATA_BASES[tableVariant];
 ram[0x002c]=base&0xff;ram[0x002d]=base>>>8; // $AACA-$AAD2
 ram[0x001c]=0;
 if((ram[0x0399+player]&0x80)!==0 && ram[0x0386+player]<0xf8)ram[0x001c]=0x20;
 const oldState=ram[0x0486+player];
 ram[0x001d]=oldState&0x08;
 ram[0x001d]=(((metadata.flags&0x04)<<1)&ram[0x001d])^ram[0x001d];
 ram[0x0486+player]=(metadata.flags&0x89)|ram[0x001c]|ram[0x001d];
 return {source:'bank06:$AAC3/$AAC8-$AB0A',player,tableVariant,
  movement,metadataAddress:metadata.address,metadataFlags:metadata.flags,
  stateBefore:oldState,stateAfter:ram[0x0486+player],
  writes:movementChanges(before,ram)};
}

/** Source $AB2A-$AB51 only: process pending ball-shot type $0485.
 * The caller MUST separately execute/verify $AB0B-$AB29 (including the
 * external weather helper $9856) before treating this as part of a frame.
 * In particular this function does not pretend to implement electric-ball
 * weather effects. $AC4D table indices >= 24 are deliberately rejected.
 */
export function stepOriginalBallShotPriority(ram,player){
 validateMovementRam(ram,player);
 const pending=ram[0x0485];
 const before=ram.slice();
 if(pending&0x80)return {source:'bank06:$AB2A-$AB51',player,
  reason:'$AB2D-negative-pending-shot',pendingBefore:pending,pendingAfter:pending,
  movementAfter:ram[0x0459+player],writes:[]};
 if(pending>=ORIGINAL_BALL_MOVEMENT_FLAGS.length)
  throw new RangeError(`Ball shot type $${pending.toString(16)} is outside audited $AC4D-$AC64 table`);
 const incoming=ORIGINAL_BALL_MOVEMENT_FLAGS[pending]&0x0f;
 const current=ram[0x0492]&0x0f;
 ram[0x001c]=incoming;
 const accepted=current<=incoming; // $AB40 BCC / $AB42 BEQ
 if(accepted)ram[0x0459+player]=pending;
 ram[0x0485]=0xff; // $AB4C, even if priority rejected
 return {source:'bank06:$AB2A-$AB51',player,
  reason:accepted?'$AB46-shot-movement-selected':'$AB4C-shot-movement-rejected',
  incomingPriority:incoming,currentPriority:current,
  pendingBefore:pending,pendingAfter:ram[0x0485],
  movementAfter:ram[0x0459+player],writes:movementChanges(before,ram)};
}
