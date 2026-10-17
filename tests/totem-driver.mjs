// M4e: no altered saves, spawned targets, or forced victories. The third
// operation follows two complete wins with real commands and original RNG.
import assert from 'node:assert/strict';
import { playSecondMission } from './rescue-driver.mjs';
import { doAttack } from './playthrough-driver.mjs';

const distance=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
const alive=(s,side)=>s.actors.filter(a=>a.hp>0&&a.side===side);
const pending=(s)=>s.board.filter(t=>t.objective==='totem'&&!t.cleared&&t.objhp>0);
const danger=t=>(t.fire>0?25:0)+(t.thorns>0?12:0)+(t.charge>0?12:0)+(t.corrupt>0?6:0)+(t.vines>0?2:0);
const cheb=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));

function fireball(engine, actor, targets, friends) {
  if(actor.kind!=='mage'||actor.ap<=0||actor.mp<4)return false;
  const candidates=[];
  for(const goal of targets)for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
    const x=goal.x+dx,y=goal.y+dy;
    if(x<0||y<0||x>=12||y>=12||!engine.previewSkill(actor.id,'fireball',x,y).allowed)continue;
    const hit=targets.filter(t=>cheb(t,{x,y})<=2);
    // AOE targets structures too; do not knowingly burn allies.
    if(friends.some(f=>cheb(f,{x,y})<=2))continue;
    const score=hit.reduce((sum,t)=>sum+Math.min(12,t.objhp),0);
    candidates.push({x,y,score});
  }
  candidates.sort((a,b)=>b.score-a.score||a.y-b.y||a.x-b.x);
  if(candidates[0]?.score>=12)return engine.useSkill(actor.id,'fireball',candidates[0].x,candidates[0].y);
  return false;
}
function hitTotem(engine,actor,targets,friends){
  const ordered=[...targets].sort((a,b)=>a.objhp-b.objhp||distance(a,actor)-distance(b,actor)||a.y-b.y||a.x-b.x);
  if(fireball(engine,actor,targets,friends))return true;
  for(const t of ordered) {
    if(actor.kind==='mage'&&engine.previewSkill(actor.id,'firebolt',t.x,t.y).allowed){
      // In the original rules Firebolt ignites and damages totems by 6.
      if(engine.useSkill(actor.id,'firebolt',t.x,t.y))return true;
    }
    if(actor.ap>0&&distance(actor,t)<=actor.range&&engine.lineOfSight(actor,t)&&
       engine.attackObjective(actor.id,t.x,t.y))return true;
  }
  return false;
}
function approachTotem(engine,actor,goals,state){
  if(actor.root>0||actor.ap<=0)return false;
  const initial=Math.min(...goals.map(g=>distance(actor,g)));
  const choices=engine.reachable(actor.id).map(p=>{
    const near=Math.min(...goals.map(g=>distance(p,g)));
    const visible=goals.some(g=>distance(p,g)<=actor.range&&engine.lineOfSight(p,g));
    const risky=p.path.reduce((acc,q)=>acc+danger(state.board[q.y*12+q.x]),0);
    const exposure=alive(state,'enemy').filter(e=>distance(p,e)<=e.range).length;
    return {...p,near,score:near*7-(visible?28:0)+risky+exposure*3+p.cost*.1};
  }).sort((a,b)=>a.score-b.score||a.y-b.y||a.x-b.x);
  const pick=choices[0];
  if(!pick)return false;
  const currentlyVisible=goals.some(g=>distance(actor,g)<=actor.range&&engine.lineOfSight(actor,g));
  if(pick.near>=initial&&!(!currentlyVisible&&pick.score<initial*7))return false;
  return engine.move(actor.id,pick.x,pick.y);
}
export function playThirdMission({seed=1,team=['guardian','ranger','mage'],difficulty='story',maxRounds=28}={}) {
  const second=playSecondMission({seed,team,difficulty,maxRounds:24});
  if(second.phase!=='between')return {phase:'previous-'+second.phase,second};
  const engine=second.engine;
  engine.advanceMission('defense');
  engine.deployMission();
  const initial=engine.snapshot();
  assert.equal(initial.mission,2);
  assert.equal(pending(initial).length,3);
  const commands=[],trace=[];
  for(const key of ['move','attack','attackObjective','useSkill','endTurn']){
    const fn=engine[key].bind(engine);
    engine[key]=(...args)=>{
      const result=fn(...args);
      if(result)commands.push({command:key,args,checkpoint:engine.snapshot()});
      return result;
    };
  }
  let actions=0;
  while(engine.snapshot().phase==='player'&&engine.snapshot().round<=maxRounds&&actions<400){
    const roster=alive(engine.snapshot(),'ally');
    for(const original of roster)while(engine.snapshot().phase==='player'){
      const state=engine.snapshot(),actor=state.actors.find(a=>a.id===original.id);
      if(!actor||actor.hp<=0||actor.ap<=0)break;
      const goals=pending(state),foes=alive(state,'enemy'),friends=alive(state,'ally');
      if(!goals.length)break;
      let acted=hitTotem(engine,actor,goals,friends);
      if(!acted)acted=approachTotem(engine,actor,goals,state);
      if(!acted&&foes.length)acted=doAttack(engine,actor,foes,friends);
      if(!acted)break;
      actions++;
      const latest=engine.snapshot();
      trace.push({round:state.round,hero:actor.kind,command:commands.at(-1)?.command,
        goals:pending(latest).map(t=>({x:t.x,y:t.y,hp:t.objhp})),
        allies:alive(latest,'ally').length,foes:alive(latest,'enemy').length,phase:latest.phase});
    }
    if(engine.snapshot().phase!=='player')break;
    const round=engine.snapshot().round;
    assert.equal(engine.endTurn(),true);
    actions++;
    assert.ok(engine.snapshot().round>round||engine.snapshot().phase!=='player');
  }
  return {second,engine,initial,state:engine.snapshot(),phase:engine.snapshot().phase,commands,trace,actions,seed};
}
