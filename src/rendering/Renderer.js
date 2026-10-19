import {FIELD,MAX_TICKS,TICK_RATE} from '../core/Match.js';
const W=960,H=540;
function rounded(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
function label(ctx,text,x,y,font='700 16px system-ui',color='#fff',align='left'){
 ctx.font=font;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(text,x,y);
}
function player(ctx,p,owner,selected,tick){
 const team=p.side===0;
 const ink='#162329',shirt=team?'#49a7e2':'#ef6b78',stripe=team?'#e3f6ff':'#ffe2b8';
 ctx.save();ctx.translate(Math.round(p.x),Math.round(p.y));
 // One ground shadow and a three-piece original illustration. NOT traced original NES art.
 ctx.fillStyle='#073c30a8';ctx.beginPath();ctx.ellipse(0,16,14,5,0,0,Math.PI*2);ctx.fill();
 if(selected){ctx.strokeStyle='#f9e79c';ctx.lineWidth=3;ctx.setLineDash([5,4]);ctx.beginPath();ctx.ellipse(0,14,20,10,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}
 const stride=Math.abs(p.vx)+Math.abs(p.vy)>0.35 ?Math.sin(tick*.25+p.number)*4:0;
 ctx.fillStyle='#24313c';ctx.strokeStyle=ink;ctx.lineWidth=2;
 ctx.fillRect(-9,8+stride,7,10);ctx.fillRect(3,8-stride,7,10);
 ctx.fillStyle=shirt;ctx.fillRect(-12,-5,24,17);ctx.strokeRect(-12,-5,24,17);
 ctx.fillStyle=stripe;ctx.fillRect(-4,-5,8,17);
 ctx.fillStyle='#f8c794';ctx.fillRect(-17,0,5,10);ctx.fillRect(12,0,5,10);
 ctx.fillStyle='#f5c397';ctx.fillRect(-12,-22,24,19);ctx.strokeRect(-12,-22,24,19);
 ctx.fillStyle='#262c34';ctx.fillRect(-12,-24,24,7);ctx.fillRect(-11,-19,5,4);
 ctx.fillStyle='#20252e';ctx.fillRect(p.facing===1?3:-5,-15,3,3);ctx.fillRect(p.facing===1?8:0,-15,3,3);
 if(p.keeper){ctx.strokeStyle='#ffe78d';ctx.lineWidth=3;ctx.strokeRect(-15,-25,30,39);}
 if(p.stun>0){label(ctx,'✦',0,-33,'bold 15px system-ui','#fff38c','center');}
 if(owner){ctx.fillStyle='#f9dd6d';ctx.beginPath();ctx.moveTo(0,-35);ctx.lineTo(-6,-43);ctx.lineTo(6,-43);ctx.fill();}
 ctx.restore();
}
function crowd(ctx){
 ctx.fillStyle='#111d2a';ctx.fillRect(0,0,W,48);ctx.fillRect(0,492,W,48);
 for(let i=0;i<122;i++){
  const x=(i*53)%W,y=(i*29)%36;
  ctx.fillStyle=['#739eae','#d8b0a0','#f6d996','#476776'][i%4];ctx.fillRect(x,8+y,5,4);ctx.fillRect(x,502+y,5,4);
 }
}
export class Renderer {
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.ctx.imageSmoothingEnabled=false;
   this.resize=()=>{const ratio=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(W*ratio);canvas.height=Math.round(H*ratio);
     this.ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);this.ctx.imageSmoothingEnabled=false;};this.resize();window.addEventListener('resize',this.resize);}
 dispose(){window.removeEventListener('resize',this.resize);}
 draw(s){const c=this.ctx;
 c.fillStyle='#142333';c.fillRect(0,0,W,H);crowd(c);
 c.fillStyle='#3c9b73';c.fillRect(FIELD.left,FIELD.top,FIELD.right-FIELD.left,FIELD.bottom-FIELD.top);
 for(let i=0;i<10;i++){c.fillStyle=i%2?'#3c9b73':'#43a67c';c.fillRect(FIELD.left+i*87,FIELD.top,87,FIELD.bottom-FIELD.top);}
 c.strokeStyle='#cfefe0';c.lineWidth=3;c.strokeRect(FIELD.left,FIELD.top,870,414);
 c.beginPath();c.moveTo(480,FIELD.top);c.lineTo(480,FIELD.bottom);c.stroke();
 c.beginPath();c.arc(480,270,64,0,Math.PI*2);c.stroke();
 c.strokeRect(FIELD.left,170,123,200);c.strokeRect(FIELD.right-123,170,123,200);
 c.strokeRect(FIELD.left,211,48,118);c.strokeRect(FIELD.right-48,211,48,118);
 c.fillStyle='#f5f5ee';c.beginPath();c.arc(480,270,4,0,Math.PI*2);c.fill();
 c.fillStyle='#d9eae7';c.fillRect(FIELD.left-12,FIELD.goalTop,12,FIELD.goalBottom-FIELD.goalTop);
 c.fillRect(FIELD.right,FIELD.goalTop,12,FIELD.goalBottom-FIELD.goalTop);
 c.strokeStyle='#b8d0ca';c.lineWidth=1;
 for(let yy=FIELD.goalTop;yy<FIELD.goalBottom;yy+=12){c.beginPath();c.moveTo(FIELD.left-12,yy);c.lineTo(FIELD.left,yy);c.moveTo(FIELD.right,yy);c.lineTo(FIELD.right+12,yy);c.stroke();}
 for(const p of s.players.filter(x=>x.side===1))player(c,p,s.ball.owner===p.id,false,s.tick);
 for(const p of s.players.filter(x=>x.side===0))player(c,p,s.ball.owner===p.id,p.id===s.controlled,s.tick);
 const b=s.ball;
 c.fillStyle='#13243088';c.beginPath();c.ellipse(b.x+2,b.y+8,8,4,0,0,Math.PI*2);c.fill();
 c.fillStyle='#fff4dc';c.strokeStyle='#182f38';c.lineWidth=2;c.beginPath();c.arc(b.x,b.y,8,0,2*Math.PI);c.fill();c.stroke();
 c.fillStyle='#31353f';c.beginPath();c.arc(b.x,b.y,3,0,Math.PI*2);c.fill();
 // Scoreboard and status bar
 c.fillStyle='#0e182be9';rounded(c,312,8,336,47,10);c.fill();
 label(c,'BLUE',350,31,'800 15px system-ui','#94d9ff','center');
 label(c,String(s.score[0]),439,31,'900 29px system-ui','#fff','center');
 label(c,':',480,30,'800 25px system-ui','#b9cbd0','center');
 label(c,String(s.score[1]),521,31,'900 29px system-ui','#fff','center');
 label(c,'RED',604,31,'800 15px system-ui','#ffb2b9','center');
 label(c,`${Math.floor(s.remainingTicks/TICK_RATE/60)}:${String(Math.floor(s.remainingTicks/TICK_RATE)%60).padStart(2,'0')}`,902,30,'800 19px monospace','#fff','center');
 c.fillStyle='#0e182bbd';rounded(c,16,8,234,40,8);c.fill();
 label(c,'NATIVE DEVELOPMENT MATCH',27,22,'800 12px system-ui','#e5e6b4');
 label(c,'UNVERIFIED NES PARITY',27,37,'700 10px system-ui','#ffbdab');
 if(s.messageTicks>0){c.fillStyle='#102638cf';rounded(c,322,89,316,55,9);c.fill();
   label(c,s.message,480,116,'900 24px system-ui','#fff6c6','center');}
 if(s.phase==='paused'||s.phase==='ended'){
   c.fillStyle='#0a1325b8';c.fillRect(0,55,960,440);
   label(c,s.phase==='paused'?'PAUSED':'FULL TIME',480,222,'900 55px system-ui','#fff8cc','center');
   label(c,s.phase==='paused'?'Press Esc or Pause to resume':`${s.score[0]} : ${s.score[1]}  •  Press Restart for a new match`,480,280,'600 18px system-ui','#fff','center');
 }
 label(c,'Z SHOOT   X PASS   C TACKLE   SHIFT SPRINT   SPACE SWITCH   ESC PAUSE',480,511,'700 12px system-ui','#d4e8f1','center');
 }
}
