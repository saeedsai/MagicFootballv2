import test from 'node:test';
import assert from 'node:assert/strict';
import {defaults,validSettings,keyboardFrame,gamepadFrame,combineFrames,InputManager,ACTIONS} from '../src/input/InputManager.js';
const storage=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};};
test('default bindings have no conflicting keys and four touch buttons',()=>{
 const s=defaults();assert.ok(validSettings(s));assert.equal(ACTIONS.length,4);
 assert.equal(new Set(Object.values(s.keyboard)).size,Object.values(s.keyboard).length);
});
test('keyboard supports diagonal plus simultaneous actions',()=>{
 const f=keyboardFrame(new Set(['ArrowUp','ArrowRight','KeyZ','ShiftLeft']),defaults().keyboard);
 assert.equal(f.dx,1);assert.equal(f.dy,-1);assert.ok(f.shoot&&f.sprint);
});
test('different sources combine with normalized diagonal',()=>{
 const f=combineFrames({dx:1,dy:1,shoot:true},{dx:1,dy:0,pass:true});
 assert.ok(Math.hypot(f.dx,f.dy)<=1.00001);assert.ok(f.shoot&&f.pass);
});
test('gamepad deadzone and digital D-pad are supported',()=>{
 const gp={axes:[.1,.3],buttons:Array.from({length:17},()=>({pressed:false}))};
 gp.buttons[14].pressed=true;gp.buttons[0].pressed=true;
 const f=gamepadFrame(gp,defaults().gamepad,.22);
 assert.equal(f.dx,-1);assert.equal(f.dy,.3);assert.equal(f.shoot,true);
});
test('keyboard rebind persists and conflict is rejected',()=>{
 const mem=storage(),m=new InputManager(mem);m.rebindKeyboard('shoot','KeyK');
 assert.equal(new InputManager(mem).settings.keyboard.shoot,'KeyK');
 assert.throws(()=>m.rebindKeyboard('pass','KeyK'),/already bound/);
});
test('touch remapping swaps, rather than duplicates, actions',()=>{
 const m=new InputManager(storage());m.setTouchAction('shoot','pass');
 assert.equal(m.settings.touch.shoot,'pass');assert.equal(m.settings.touch.pass,'shoot');
 assert.ok(validSettings(m.settings));
});
test('two concurrent pointers and joystick are independent',()=>{
 const m=new InputManager(storage());m.pressTouch(7,'shoot');m.pressTouch(8,'pass');m.setJoystick(.6,-.8);
 const f=m.frame();assert.ok(f.shoot&&f.pass);assert.equal(f.dx,.6);assert.equal(f.dy,-.8);
 m.releaseTouch(7);assert.equal(m.frame().shoot,false);assert.equal(m.frame().pass,true);
});
test('invalid saved profile resets cleanly to defaults',()=>{
 const mem=storage();mem.setItem('kunio-soccer-input-v1','{"keyboard":{"shoot":"KeyQ"}}');
 const m=new InputManager(mem);assert.deepEqual(m.settings,defaults());
});
test('touch held state cleans up after input release',()=>{
 const m=new InputManager(storage());m.pressTouch(1,'tackle');m.setJoystick(1,0);m.release();
 assert.equal(m.frame().tackle,false);assert.equal(m.frame().dx,0);
});
