/**
 * Native, source-local port of bank_06.asm $AA14-$AAAB: pending player-action
 * arbitration and movement replacement. Source pinned at
 * df2c8e55e7f13e5792482527db9e7c9e4a84c6e1.
 *
 * The two metadata arrays are literal small source tables at $AC69-$AD40.
 * They are NOT sprites, gameplay physics, an NES emulator, or proof of parity.
 * The source table at $AC69 deliberately overlaps $AC87 when indexed past 14.
 */
const ARBITRATION_RAM_BYTES=0x800;
export const ORIGINAL_ACTION_METADATA_BASES=Object.freeze([0xac87,0xac69]);
const METADATA_START=0xac69;
const METADATA_END=0xad40;
const METADATA_HEX=[
 '00002400040324032405240524002802a004a004a004a004',
 '000f2405a0040000240004032403240f240f240f20042004',
 '600460046401240f040804042403400404032002240f0102',
 '000f000f000500052007000f000f000f0803000000002400',
 '280220070007400420050003240420062006240424072400',
 '240f240f4004a004a20582058205820580058005c205c205',
 'c005c0058005a40fa40fa005a005a007a00580058305a004',
 'a00782058305a0058205a0058205a0058205a0058205a005',
 'a005a004a005a006a40fa004a0048005a40fa40fa804a005'
].join('');
const metadataBytes=Uint8Array.from(METADATA_HEX.match(/../g),x=>parseInt(x,16));
if(metadataBytes.length!==METADATA_END-METADATA_START+1)throw new Error('Original metadata source table length mismatch');
const negative=value=>(value&0x80)!==0;
const validByte=(value,name)=>{if(!Number.isInteger(value)||value<0||value>255)throw new RangeError(`${name} must be an unsigned byte`);};
const validVariant=variant=>{if(variant!==0&&variant!==1)throw new RangeError('tableVariant must be 0 ($AC87) or 1 ($AC69)');};

/** Read the exact two-byte metadata record used by $AAAC/$AAB4/$AABD. */
export function readOriginalActionMetadata(actionId,tableVariant=0){
 validByte(actionId,'actionId');validVariant(tableVariant);
 const address=ORIGINAL_ACTION_METADATA_BASES[tableVariant]+2*actionId;
 if(address<METADATA_START||address+1>METADATA_END)
  throw new RangeError(`Action $${actionId.toString(16)} metadata extends outside audited source $AC69-$AD40`);
 return Object.freeze({address,flags:metadataBytes[address-METADATA_START],priority:metadataBytes[address+1-METADATA_START]});
}

/** Construct a minimal synthetic RAM fixture; not an original game save. */
export function createOriginalActionArbitrationRam({player=2,action=0x09,movement=0x80,playerState=0,weather=0,skill=1,surface=0}={}){
 if(!Number.isInteger(player)||player<0||player>11)throw new RangeError('player must be 0..11');
 for(const [name,value] of Object.entries({action,movement,playerState,weather,skill,surface}))validByte(value,name);
 const ram=new Uint8Array(ARBITRATION_RAM_BYTES);
 ram[0x0479+player]=action;ram[0x0459+player]=movement;ram[0x0486+player]=playerState;
 ram[0x0466]=weather;ram[0x04f1+player]=skill;ram[0x0130+player]=surface;
 return ram;
}

/**
 * Step $AA14 (variant 0) or $AA19 (variant 1) and $AA1B-$AAAB on one player.
 * Changes pending $0479 and, conditionally, movement $0459. This does not
 * run animation, collision, player physics, or any other original subroutine.
 */
export function stepOriginalActionArbitration(ram,player,{tableVariant=0}={}){
 if(!(ram instanceof Uint8Array)||ram.length<ARBITRATION_RAM_BYTES)throw new TypeError('RAM must contain at least $0800 bytes');
 if(!Number.isInteger(player)||player<0||player>11)throw new RangeError('player must be 0..11');
 validVariant(tableVariant);
 const before=ram.slice();
 const actionAddress=0x0479+player,movementAddress=0x0459+player,state=ram[0x0486+player];
 const base=ORIGINAL_ACTION_METADATA_BASES[tableVariant];
 ram[0x002c]=base&255;ram[0x002d]=base>>8; // $AA1B-$AA23
 let forcedWeatherAction=false;
 // $AA25-$AA44: weather effect 1 can force pending action $06.
 if((ram[0x0466]&0x7f)===1&&!negative(state)&&!(ram[0x04f1+player]&1)&&
    ram[0x0130+player]>=1&&ram[0x0130+player]<3){
  ram[actionAddress]=0x06;forcedWeatherAction=true;
 }
 const action=ram[actionAddress],movement=ram[movementAddress];
 const finish=(reason,extras={})=>({source:'bank06:$AA14-$AAAB',tableVariant,player,reason,forcedWeatherAction,
  actionBefore:before[actionAddress],movementBefore:before[movementAddress],actionAfter:ram[actionAddress],movementAfter:ram[movementAddress],
  writes:Array.from(ram.keys()).filter(address=>before[address]!==ram[address]).map(address=>({address,before:before[address],after:ram[address]})),...extras});
 if(negative(action))return finish('$AA4A-no-pending-action');
 if(!negative(movement))return finish('$AA50-movement-not-ready');
 const actionMeta=readOriginalActionMetadata(action,tableVariant);
 const consume=reason=>{ram[actionAddress]=0xff;return finish(reason,{actionMeta});};
 // $AA55-$AA72: action flags must be compatible with player state.
 if(!(state&0x40)&&(actionMeta.flags&0x40))return consume('$AA5F-action-flag6-gate');
 if((state&0x20)&&!(actionMeta.flags&0x20))return consume('$AA70-state-flag5-gate');
 if(negative(state)&&!negative(actionMeta.flags))return consume('$AA90-negative-state-flag7-gate');
 // $AA7A-$AA8A: compare priority byte (second table byte) for
 // the current movement and the candidate action. Movement high bit is
 // masked before lookup, as in $AA97.
 const currentId=movement&0x7f;
 const currentMeta=readOriginalActionMetadata(currentId,tableVariant);
 if(currentMeta.priority!==0&&actionMeta.priority<=currentMeta.priority)
  return consume('$AA84-existing-movement-priority');
 if(currentId!==action)ram[movementAddress]=action; // $AA94-$AAA1
 ram[actionAddress]=0xff; // $AAA4-$AAA9
 return finish('$AA94-accepted-action',{actionMeta,currentMeta});
}
