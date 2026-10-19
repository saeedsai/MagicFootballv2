/** Dependency-free SHA-1 for local, offline original ROM provenance checks.
 * Used solely to compare user-supplied bytes with the pinned assembly hash.
 * SHA-1 is NOT a collision-resistant signature or licensing proof.
 */
export function sha1Hex(bytes){
 if(!(bytes instanceof Uint8Array))throw new TypeError('Expected binary bytes');
 if(bytes.length>4*1024*1024)throw new RangeError('ROM larger than 4 MiB research limit');
 const n=bytes.length,paddedLength=Math.ceil((n+9)/64)*64;
 const msg=new Uint8Array(paddedLength);msg.set(bytes);msg[n]=0x80;
 const view=new DataView(msg.buffer);const bits=n*8;
 view.setUint32(paddedLength-8,Math.floor(bits/0x100000000));view.setUint32(paddedLength-4,bits>>>0);
 let h0=0x67452301,h1=0xefcdab89,h2=0x98badcfe,h3=0x10325476,h4=0xc3d2e1f0;
 const w=new Uint32Array(80),rot=(x,n)=>(x<<n)|(x>>>(32-n));
 for(let start=0;start<paddedLength;start+=64){
  for(let i=0;i<16;i++)w[i]=view.getUint32(start+i*4);
  for(let i=16;i<80;i++)w[i]=rot(w[i-3]^w[i-8]^w[i-14]^w[i-16],1);
  let a=h0,b=h1,c=h2,d=h3,e=h4;
  for(let i=0;i<80;i++){
   let f,k;
   if(i<20){f=(b&c)|(~b&d);k=0x5a827999;}
   else if(i<40){f=b^c^d;k=0x6ed9eba1;}
   else if(i<60){f=(b&c)|(b&d)|(c&d);k=0x8f1bbcdc;}
   else{f=b^c^d;k=0xca62c1d6;}
   const t=(rot(a,5)+f+e+k+w[i])>>>0;
   e=d;d=c;c=rot(b,30);b=a;a=t;
  }
  h0=(h0+a)>>>0;h1=(h1+b)>>>0;h2=(h2+c)>>>0;h3=(h3+d)>>>0;h4=(h4+e)>>>0;
 }
 return [h0,h1,h2,h3,h4].map(x=>x.toString(16).padStart(8,'0')).join('');
}
