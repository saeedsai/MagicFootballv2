/**
 * Pure lookup of original fixed-bank jump tables, NOT a 6502 interpreter.
 * Pinned upstream bank_FF.asm $C492-$C4C2 and $C50E-$C537.
 * Source table entries are CPU addresses of original subroutine handlers.
 * They are reference metadata; handlers are not yet ported to JavaScript.
 */
export const ORIGINAL_SCREEN_HANDLERS=Object.freeze([0xc4ab,0xc4b1,0xc4b7,0xc4bd]);
export const ORIGINAL_MATCH_SUBSCREEN_HANDLERS=Object.freeze([
 0xc539,0xc57d,0xc615,0xc699,0xc71e,0xc77d,0xc7d0,
 0xc743,0xc77d,0xc75d,0xc777,0xc743,0xc77d
]);
const lookup=(arr,id,label)=>{
 if(!Number.isInteger(id)||id<0||id>=arr.length)throw new RangeError(`unverified ${label} index: ${id}`);
 return arr[id];
};
export const resolveOriginalScreenHandler=id=>lookup(ORIGINAL_SCREEN_HANDLERS,id,'screen');
export const resolveOriginalMatchSubscreenHandler=id=>lookup(ORIGINAL_MATCH_SUBSCREEN_HANDLERS,id,'match subscreen');
