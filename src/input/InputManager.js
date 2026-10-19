/** Logical actions, independent of rendering and simulation. */
export const ACTIONS=['shoot','pass','tackle','sprint'];
export const KEY_DEFAULTS={up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight',
 shoot:'KeyZ',pass:'KeyX',tackle:'KeyC',sprint:'ShiftLeft',switch:'Space',pause:'Escape'};
export const PAD_DEFAULTS={shoot:0,pass:1,tackle:2,sprint:5,switch:3,pause:9};
const KEY='kunio-soccer-input-v1';
const copy=x=>JSON.parse(JSON.stringify(x));
export function validSettings(x){
  if(!x||typeof x!=='object')return false;
  if(!x.keyboard||!x.gamepad||!x.touch)return false;
  const keys=Object.values(x.keyboard);
  if(keys.some(k=>typeof k!=='string'||!k)||new Set(keys).size!==keys.length)return false;
  if(Object.values(x.gamepad).some(i=>!Number.isInteger(i)||i<0||i>20))return false;
  return ACTIONS.every(a=>ACTIONS.includes(x.touch[a])) && new Set(Object.values(x.touch)).size===4;
}
export function defaults(){return {keyboard:copy(KEY_DEFAULTS),gamepad:copy(PAD_DEFAULTS),touch:Object.fromEntries(ACTIONS.map(a=>[a,a])),deadZone:0.22};}
export function combineFrames(...frames) {
  const out={dx:0,dy:0,shoot:false,pass:false,tackle:false,sprint:false,switch:false,pause:false};
  for(const f of frames){if(!f)continue;
    out.dx+=Number(f.dx)||0;out.dy+=Number(f.dy)||0;
    for(const a of ['shoot','pass','tackle','sprint','switch','pause'])out[a] ||=!!f[a];
  }
  const n=Math.hypot(out.dx,out.dy);
  if(n>1){out.dx/=n;out.dy/=n;}
  return out;
}
export function keyboardFrame(pressed,map){
  const down=a=>pressed.has(map[a]);
  return {dx:Number(down('right'))-Number(down('left')),
    dy:Number(down('down'))-Number(down('up')),
    shoot:down('shoot'),pass:down('pass'),tackle:down('tackle'),
    sprint:down('sprint'),switch:down('switch'),pause:down('pause')};
}
export function gamepadFrame(gp,map,deadZone=.22) {
  if(!gp)return null;
  const x=gp.axes?.[0]||0,y=gp.axes?.[1]||0;
  const down=i=>!!gp.buttons?.[i]?.pressed;
  return {dx:(Math.abs(x)>deadZone?x:0)+Number(down(15))-Number(down(14)),
    dy:(Math.abs(y)>deadZone?y:0)+Number(down(13))-Number(down(12)),
    ...Object.fromEntries(Object.entries(map).map(([a,i])=>[a,down(i)]))};
}
export class InputManager{
  constructor(storage=null){
    try{this.storage=storage||globalThis.localStorage;}catch{this.storage=storage;}
    try{const saved=JSON.parse(this.storage?.getItem(KEY)||'null');this.settings=validSettings(saved)?saved:defaults();}
    catch{this.settings=defaults();}
    this.held=new Set();this.touchHeld=new Map();this.joystick={dx:0,dy:0};
    this.attached=false;
    this.onKeyDown=e=>{if(e.code==='Tab' || Object.values(this.settings.keyboard).includes(e.code))e.preventDefault();this.held.add(e.code);};
    this.onKeyUp=e=>{this.held.delete(e.code);};
    this.onBlur=()=>this.release();
  }
  attach(){if(this.attached)return;window.addEventListener('keydown',this.onKeyDown,{passive:false});
    window.addEventListener('keyup',this.onKeyUp);window.addEventListener('blur',this.onBlur);this.attached=true;}
  dispose(){if(!this.attached)return;window.removeEventListener('keydown',this.onKeyDown);
    window.removeEventListener('keyup',this.onKeyUp);window.removeEventListener('blur',this.onBlur);this.attached=false;}
  release(){this.held.clear();this.touchHeld.clear();this.joystick={dx:0,dy:0};}
  save(){if(!validSettings(this.settings))throw new Error('invalid input settings');
    try{this.storage?.setItem(KEY,JSON.stringify(this.settings));}catch{/* private browsing */}}
  rebindKeyboard(action,code){
    if(!(action in this.settings.keyboard))throw new Error('unknown keyboard action');
    const existing=Object.entries(this.settings.keyboard).find(([k,v])=>k!==action&&v===code);
    if(existing)throw new Error(`Key already bound to ${existing[0]}`);
    this.settings.keyboard[action]=code;this.save();this.release();
  }
  setPadButton(action,index){if(!(action in this.settings.gamepad))throw new Error('invalid action');
    if(!Number.isInteger(index)||index<0||index>20)throw new Error('invalid button');
    this.settings.gamepad[action]=index;this.save();}
  setTouchAction(button,action){if(!ACTIONS.includes(button)||!ACTIONS.includes(action))throw new Error('invalid touch action');
    const other=Object.entries(this.settings.touch).find(([,a])=>a===action)?.[0];
    if(other)this.settings.touch[other]=this.settings.touch[button];
    this.settings.touch[button]=action;this.save();}
  setJoystick(dx,dy){const len=Math.hypot(dx,dy);this.joystick={dx:len>1?dx/len:dx,dy:len>1?dy/len:dy};}
  pressTouch(pointer,button){this.touchHeld.set(pointer,button);}
  releaseTouch(pointer){this.touchHeld.delete(pointer);}
  frame(){
    const touch={...this.joystick};
    for(const button of this.touchHeld.values()) touch[this.settings.touch[button]||button]=true;
    const pads=[];try{for(const gp of navigator.getGamepads?.()||[])if(gp?.connected)pads.push(gamepadFrame(gp,this.settings.gamepad,this.settings.deadZone));}catch{/* unsupported */}
    return combineFrames(keyboardFrame(this.held,this.settings.keyboard),touch,...pads);
  }
}
