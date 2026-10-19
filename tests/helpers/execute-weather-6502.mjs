/** TEST-ONLY isolated 6502 opcode interpreter for source $D993-$DA45.
 * Reads the user's actual PRG instruction bytes and tables, independently
 * of the native JavaScript translation. NOT an NES emulator or frame trace.
 * Supports only opcodes encountered in this source routine.
 */
export function executeOriginalWeather6502(prg,initialRam,{limit=12000}={}){
 if(!(prg instanceof Uint8Array)||prg.length!==0x20000||!(initialRam instanceof Uint8Array)||initialRam.length!==0x800)throw new TypeError('PRG/RAM shape');
 const ram=initialRam.slice();let pc=0xd993,a=0,x=0,y=0,c=0,z=0,n=0,steps=0;
 const read=addr=>addr<0x2000?ram[addr&0x7ff]:addr>=0xc000?prg[0x1c000+addr-0xc000]:(()=>{throw new Error('Unmapped read '+addr.toString(16))})();
 const write=(addr,v)=>{if(addr>=0x2000)throw new Error('Unmapped write '+addr.toString(16));ram[addr&0x7ff]=v&255;};
 const next=()=>{const v=read(pc);pc=(pc+1)&65535;return v;};
 const word=()=>{const lo=next();return lo+(next()<<8);};
 const nz=v=>{z=(v&255)===0?1:0;n=(v>>7)&1;return v&255;};
 const cmp=(v,b)=>{const diff=(v-b)&255;c=v>=b?1:0;nz(diff);};
 const adc=b=>{const sum=a+b+c;c=sum>255?1:0;a=nz(sum);};
 const sbc=b=>{const diff=a-b-(1-c);c=diff>=0?1:0;a=nz(diff);};
 const branch=condition=>{const displacement=next();if(condition)pc=(pc+(displacement<128?displacement:displacement-256))&65535;};
 while(steps++<limit){
  const addr=pc,op=next();
  switch(op){
   case 0xad:a=nz(read(word()));break;
   case 0xac:y=nz(read(word()));break;
   case 0xb9:{const base=word();a=nz(read((base+y)&65535));break;}
   case 0xbd:{const base=word();a=nz(read((base+x)&65535));break;}
   case 0xa5:a=nz(read(next()));break;
   case 0xa9:a=nz(next());break;
   case 0x8d:write(word(),a);break;
   case 0x9d:{const base=word();write((base+x)&65535,a);break;}
   case 0x99:{const base=word();write((base+y)&65535,a);break;}
   case 0x85:write(next(),a);break;
   case 0xa2:x=nz(next());break;
   case 0x8a:a=nz(x);break;
   case 0xa8:y=nz(a);break;
   case 0xaa:x=nz(a);break;
   case 0x0a:c=(a>>7)&1;a=nz(a<<1);break;
   case 0x18:c=0;break;
   case 0x38:c=1;break;
   case 0x69:adc(next());break;
   case 0x6d:adc(read(word()));break;
   case 0x7d:{const base=word();adc(read((base+x)&65535));break;}
   case 0x79:{const base=word();adc(read((base+y)&65535));break;}
   case 0xe9:sbc(next());break;
   case 0xc9:cmp(a,next());break;
   case 0xcd:cmp(a,read(word()));break;
   case 0xe0:cmp(x,next());break;
   case 0xc0:cmp(y,next());break;
   case 0xf0:branch(z===1);break;
   case 0xd0:branch(z===0);break;
   case 0x90:branch(c===0);break;
   case 0xb0:branch(c===1);break;
   case 0x10:branch(n===0);break;
   case 0xee:{const target=word();write(target,nz((read(target)+1)&255));break;}
   case 0xe6:{const target=next();write(target,nz((read(target)+1)&255));break;}
   case 0xc8:y=nz(y+1);break;
   case 0xe8:x=nz(x+1);break;
   case 0x4c:pc=word();break;
   case 0x60:return {ram,steps:steps-1,pc:addr};
   default:throw new Error(`Unexpected source opcode $${op.toString(16)} at $${addr.toString(16)}`);
  }
 }
 throw new Error(`Original routine did not RTS within ${limit} steps`);
}
