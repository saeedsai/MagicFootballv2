/**
 * Headless development ruleset. This is NOT an NES physics conversion.
 * Inspired by the verified *object count* in bank_ram.inc only.
 * All gameplay constants here are provisional Enhanced development values.
 */
export const TICK_RATE = 60;
export const FIELD = Object.freeze({left: 45, right: 915, top: 63, bottom: 477, midY: 270,
  goalTop: 211, goalBottom: 329});
export const RULES_VERSION = 'enhanced-dev-0.1';
export const MAX_TICKS = TICK_RATE * 180;
const PLAYER_SPEED = 2.65;
const SPRINT_MULTIPLIER = 1.48;
const BALL_DRAG = 0.987;
const rngStep = s => (Math.imul(1664525, s) + 1013904223) >>> 0;
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const distance = (a,b) => Math.hypot(a.x-b.x, a.y-b.y);
const vector = (dx,dy) => { const d=Math.hypot(dx,dy); return d > 0 ? {x:dx/d,y:dy/d} : {x:0,y:0}; };
const newInput = () => ({dx:0,dy:0,shoot:false,pass:false,tackle:false,sprint:false,switch:false,pause:false});
export const EMPTY_INPUT = Object.freeze(newInput());

export function createMatch(seed = 2026) {
  const players=[];
  const rows = [ [230,270], [350,143], [350,396], [493,193], [493,347] ];
  for(let side=0;side<2;side++) {
    for(let i=0;i<5;i++) {
      const [x,y]=rows[i];
      players.push({id:`${side}-${i}`, side, number:i+1, keeper:false,
        x:side===0?x:960-x, y, vx:0, vy:0, facing:side===0?1:-1, cooldown:0, stun:0});
    }
    players.push({id:`${side}-gk`,side,number:0,keeper:true,
      x:side===0?79:881,y:270,vx:0,vy:0,facing:side===0?1:-1,cooldown:0,stun:0});
  }
  return {schemaVersion:1, mode:'enhanced-dev', rulesVersion:RULES_VERSION,
    seed:seed>>>0,rng:seed>>>0,tick:0,remainingTicks:MAX_TICKS,phase:'ready',
    score:[0,0], players,ball:{x:480,y:270,vx:0,vy:0,owner:null,lastTouch:null},
    controlled:'0-0', selectedUntil:0, kickoffTicks:45, message:'KICKOFF',messageTicks:75,
    lastEvent:'match-created', previousButtons:{shoot:false,pass:false,tackle:false,switch:false,pause:false}};
}
function random(state) {state.rng = rngStep(state.rng); return state.rng/4294967296;}
function findPlayer(state,id) {return state.players.find(p=>p.id===id) || null;}
function nearest(state,side,pt,includeKeeper=false) {
  let answer=null,best=Infinity;
  for(const p of state.players) {
    if(p.side!==side || (!includeKeeper&&p.keeper)) continue;
    const d=distance(p,pt);
    if(d<best) {best=d;answer=p;}
  }
  return answer;
}
function pushPlayer(p,dx,dy,speed) {
  const d=vector(dx,dy);
  p.vx = d.x*speed;
  p.vy = d.y*speed;
  p.x = clamp(p.x+p.vx, FIELD.left+10, FIELD.right-10);
  p.y = clamp(p.y+p.vy, FIELD.top+9, FIELD.bottom-9);
  if(Math.abs(d.x)>0.1)p.facing=Math.sign(d.x);
}
function givePossession(s,p) {
  s.ball.owner=p.id;s.ball.x=p.x+p.facing*15;s.ball.y=p.y+5;
  s.ball.vx=0;s.ball.vy=0;s.ball.lastTouch=p.side;
}
function kick(s,p,type,aim) {
  if(s.ball.owner!==p.id || p.cooldown>0) return false;
  let d, speed;
  if(type==='pass') {
    const mates=s.players.filter(q=>q.side===p.side&&!q.keeper&&q.id!==p.id);
    let target=mates[0],score=-Infinity;
    for(const q of mates) {
      const ahead=(q.x-p.x)*(p.side===0?1:-1), dist=distance(p,q);
      const quality=ahead*1.1-dist*0.38+(aim.dy||0)*(q.y-p.y)*0.5;
      if(quality>score){score=quality;target=q;}
    }
    d=vector(target.x-p.x,target.y-p.y);speed=7.8;
  } else {
    const tx=p.side===0?FIELD.right+40:FIELD.left-40;
    const ty=FIELD.midY+(aim.dy||0)*70+(p.y-FIELD.midY)*0.18;
    d=vector(tx-p.x,ty-p.y);speed=12.8;
  }
  s.ball.owner=null;s.ball.x=p.x+p.facing*17;s.ball.y=p.y+3;
  s.ball.vx=d.x*speed;s.ball.vy=d.y*speed;s.ball.lastTouch=p.side;
  p.cooldown=type==='pass'?15:26;
  s.lastEvent=type;
  s.message=type==='pass'?'PASS!':'SHOT!'; s.messageTicks=22;
  return true;
}
function resetKickoff(s,scoringSide) {
  const all=createMatch(s.seed);s.players=all.players;
  s.ball={x:480,y:270,vx:0,vy:0,owner:null,lastTouch:null};
  s.controlled='0-0';s.kickoffTicks=72;
  s.message=scoringSide===null?'KICKOFF':`GOAL! ${scoringSide===0?'BLUE':'RED'} SCORES`;
  s.messageTicks=100;s.lastEvent=scoringSide===null?'kickoff':'goal';
}
export function togglePause(s) {
  if(s.phase==='playing') {s.phase='paused';s.lastEvent='paused';}
  else if(s.phase==='paused') {s.phase='playing';s.lastEvent='resumed';}
  return s;
}
function buttonEdges(s,input) {
  const edges={};for(const k of ['shoot','pass','tackle','switch','pause']) {
    edges[k]=!!input[k]&&!s.previousButtons[k];s.previousButtons[k]=!!input[k];
  }
  return edges;
}
export function stepMatch(s, raw=EMPTY_INPUT) {
  const input={...EMPTY_INPUT,...raw};
  const edges=buttonEdges(s,input);
  if(edges.pause)togglePause(s);
  if(s.phase==='paused'||s.phase==='ended')return s;
  if(s.phase==='ready'){s.phase='playing';s.lastEvent='kickoff';}
  s.tick++;
  s.remainingTicks=Math.max(0,s.remainingTicks-1);
  if(s.messageTicks>0)s.messageTicks--;
  for(const p of s.players){p.cooldown=Math.max(0,p.cooldown-1);p.stun=Math.max(0,p.stun-1);}
  if(s.kickoffTicks>0){s.kickoffTicks--;if(s.remainingTicks===0)s.phase='ended';return s;}
  if(edges.switch) {
    const candidate=nearest(s,0,s.ball.owner?findPlayer(s,s.ball.owner):s.ball);
    if(candidate)s.controlled=candidate.id;
    s.selectedUntil=s.tick+110;
  }
  // Auto-switch to current owner or closest field player, unless recent manual selection.
  const humanOwner=s.ball.owner?findPlayer(s,s.ball.owner):null;
  if(humanOwner?.side===0&&!humanOwner.keeper)s.controlled=humanOwner.id;
  else if(s.tick>s.selectedUntil) {
    const selected=nearest(s,0,s.ball);
    if(selected)s.controlled=selected.id;
  }
  for(const p of s.players) {
    if(p.stun>0)continue;
    if(p.id===s.controlled){
      const speed=PLAYER_SPEED*(input.sprint?SPRINT_MULTIPLIER:1);
      pushPlayer(p,clamp(input.dx,-1,1),clamp(input.dy,-1,1),speed);
    } else if(p.keeper) {
      const targetY=clamp(s.ball.y,FIELD.goalTop+10,FIELD.goalBottom-10);
      const anchor=p.side===0?80:880;
      pushPlayer(p,(anchor-p.x)*0.1,(targetY-p.y)*0.16,1.6);
    } else {
      const teammateHasBall=s.ball.owner&&findPlayer(s,s.ball.owner)?.side===p.side;
      const nearestChaser=nearest(s,p.side,s.ball);
      const shouldChase=nearestChaser?.id===p.id && !teammateHasBall;
      let target;
      if(shouldChase)target=s.ball;
      else if(teammateHasBall){
        const dir=p.side===0?1:-1;
        target={x:clamp(p.x+dir*20,100,860),y:p.y+(270-p.y)*0.04};
      }else {
        const shift=clamp((s.ball.x-480)*0.24,-85,85);
        const own=(p.side===0?1:-1);
        const formation=[ [230,270], [350,143], [350,396], [493,193], [493,347] ][p.number-1];
        target={x:(p.side===0?formation[0]:960-formation[0])+shift,y:formation[1]+(s.ball.y-270)*0.16};
      }
      pushPlayer(p,target.x-p.x,target.y-p.y,shouldChase?2.15:1.36);
    }
  }
  const controlled=findPlayer(s,s.controlled);
  if(controlled){
    if(edges.tackle && s.ball.owner!==controlled.id){
      const holder=findPlayer(s,s.ball.owner);
      if(holder?.side===1&&distance(holder,controlled)<34){
        holder.stun=25;givePossession(s,controlled);s.lastEvent='tackle';
      } else if(!holder && distance(s.ball,controlled)<27){givePossession(s,controlled);}
    }
    if(edges.shoot)kick(s,controlled,'shot',input);
    if(edges.pass)kick(s,controlled,'pass',input);
  }
  // Possession is evaluated after movement and deliberate kicks.
  if(s.ball.owner){
    const owner=findPlayer(s,s.ball.owner);
    if(owner){s.ball.x=owner.x+owner.facing*15;s.ball.y=owner.y+4;}
    // CPU dribbler occasionally passes or shoots; seeded and therefore replayable.
    if(owner?.keeper&&owner.cooldown===0){
      // Provisional clearing behavior. A keeper must not freeze possession indefinitely.
      kick(s,owner,'shot',{dy:(random(s)-0.5)*0.9});
    }else if(owner?.side===1&&owner.cooldown===0){
      const nearGoal=owner.x<FIELD.left+250;
      if(nearGoal && (s.tick%35===0))kick(s,owner,'shot',{dy:(random(s)-0.5)*1.2});
      else if(s.tick%115===0&&random(s)>0.35)kick(s,owner,'pass',{dy:0});
    }
  } else {
    s.ball.x+=s.ball.vx;s.ball.y+=s.ball.vy;
    s.ball.vx*=BALL_DRAG;s.ball.vy*=BALL_DRAG;
    if(s.ball.y<FIELD.top+7){s.ball.y=FIELD.top+7;s.ball.vy=Math.abs(s.ball.vy)*0.64;}
    if(s.ball.y>FIELD.bottom-7){s.ball.y=FIELD.bottom-7;s.ball.vy=-Math.abs(s.ball.vy)*0.64;}
    const inGoalMouth=s.ball.y>=FIELD.goalTop&&s.ball.y<=FIELD.goalBottom;
    if(s.ball.x>FIELD.right+9&&inGoalMouth){s.score[0]++;resetKickoff(s,0);}
    else if(s.ball.x<FIELD.left-9&&inGoalMouth){s.score[1]++;resetKickoff(s,1);}
    else {
      if(s.ball.x<FIELD.left+6){s.ball.x=FIELD.left+6;s.ball.vx=Math.abs(s.ball.vx)*0.55;}
      if(s.ball.x>FIELD.right-6){s.ball.x=FIELD.right-6;s.ball.vx=-Math.abs(s.ball.vx)*0.55;}
      // Recently kicked ball can't be recaptured by the kicker until cooldown elapses.
      const candidates=s.players.filter(p=>distance(p,s.ball)<(p.keeper?24:18)&&p.cooldown===0&&p.stun===0);
      candidates.sort((a,b)=>distance(a,s.ball)-distance(b,s.ball)||a.id.localeCompare(b.id));
      if(candidates[0]){
        const p=candidates[0];givePossession(s,p);
        if(p.keeper){p.cooldown=22;s.lastEvent='keeper-claim';}
      }
    }
  }
  // Keeper may intercept a held ball near own goal; eliminates unstoppable walk-ins.
  if(s.ball.owner){
    const holder=findPlayer(s,s.ball.owner);
    if(holder&&!holder.keeper){
      const keeper=s.players.find(p=>p.side!==holder.side&&p.keeper);
      if(distance(holder,keeper)<26){holder.stun=12;givePossession(s,keeper);keeper.cooldown=25;s.lastEvent='keeper-save';}
    }
  }
  if(s.remainingTicks===0){s.phase='ended';s.message='FULL TIME';s.lastEvent='full-time';s.messageTicks=Infinity;}
  return s;
}
export function stepMany(s,inputs) {for(const input of inputs)stepMatch(s,input);return s;}
export function stateSnapshot(s) {
  return JSON.stringify({rulesVersion:s.rulesVersion,rng:s.rng,tick:s.tick,phase:s.phase,remainingTicks:s.remainingTicks,
    score:s.score,ball:s.ball,controlled:s.controlled,kickoffTicks:s.kickoffTicks,
    players:s.players.map(p=>[p.id,p.x,p.y,p.cooldown,p.stun])});
}
