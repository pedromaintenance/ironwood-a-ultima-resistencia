// M4d: unmodified second mission, following a naturally won first mission.
// No injected saves, actor teleportation, RNG overrides or manufactured victories.
import assert from 'node:assert/strict';
import { playFreshMission, doAttack, doMove } from './playthrough-driver.mjs';

const dist = (a,b) => Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
const alive = (s,side) => s.actors.filter(a=>a.side===side&&a.hp>0);
const risk = tile => (tile.fire?16:0)+(tile.charge?14:0)+(tile.thorns?6:0)+(tile.trap?6:0)+(tile.corrupt?3:0);

export function playSecondMission({seed=1,team=['guardian','ranger','mage'],difficulty='story',maxRounds=30}={}) {
  const first = playFreshMission({seed,team,difficulty});
  if (first.state.phase !== 'between') return {first,phase:'mission1-'+first.state.phase,trace:[]};
  const engine = first.engine;
  engine.advanceMission('hp');
  engine.deployMission();
  const initial = engine.snapshot();
  assert.equal(initial.mission,1);
  assert.equal(initial.board.filter(t=>t.objective==='captive'&&!t.cleared).length,2);
  const trace = [];
  const commands = [];
  for (const key of ['move','attack','useSkill','endTurn']) {
    const fn=engine[key].bind(engine);
    engine[key]=(...args)=>{
      const result=fn(...args);
      if(result) commands.push({command:key,args,checkpoint:engine.snapshot()});
      return result;
    };
  }
  let operations=0;
  while(engine.snapshot().phase==='player'&&engine.snapshot().round<=maxRounds&&operations<360) {
    const roster=alive(engine.snapshot(),'ally');
    for(const identity of roster) {
      while(engine.snapshot().phase==='player') {
        const state=engine.snapshot(),actor=state.actors.find(a=>a.id===identity.id);
        if(!actor||actor.hp<=0||actor.ap<=0)break;
        const goals=state.board.filter(t=>t.objective==='captive'&&!t.cleared);
        if(!goals.length)break;
        const foes=alive(state,'enemy'),friends=alive(state,'ally');
        const before=engine.snapshot();
        let action=false;
        // The rescue mission's objective is the people, not killing every enemy.
        const adjacent=goals.find(g=>dist(actor,g)<=1);
        if(adjacent) action=engine.useSkill(actor.id,'interact',adjacent.x,adjacent.y);
        if(!action && foes.length) action=doAttack(engine,actor,foes,friends);
        if(!action) {
          const reachable=engine.reachable(actor.id);
          const score=(p)=>Math.min(...goals.map(g=>dist(p,g)))*6+
            (p.path||[]).reduce((n,step)=>n+risk(state.board[step.y*12+step.x]),0);
          const originalScore=Math.min(...goals.map(g=>dist(actor,g)))*6;
          const options=reachable.map(p=>({...p,score:score(p)}))
            .sort((a,b)=>a.score-b.score||a.cost-b.cost||a.y-b.y||a.x-b.x);
          const pick=options[0];
          if(pick&&pick.score<originalScore) action=engine.move(actor.id,pick.x,pick.y);
        }
        if(!action&&foes.length) action=doMove(engine,actor,foes,friends,state);
        if(!action)break;
        operations++;
        const updated=engine.snapshot();
        trace.push({round:state.round,actor:actor.kind,action:commands.at(-1)?.command,
          rescued:updated.stats.rescued,pending:updated.board.filter(t=>t.objective==='captive'&&!t.cleared).length,
          foes:alive(updated,'enemy').length,phase:updated.phase});
      }
    }
    if(engine.snapshot().phase!=='player')break;
    const round=engine.snapshot().round;
    assert.equal(engine.endTurn(),true);
    operations++;
    assert.ok(engine.snapshot().round>round||engine.snapshot().phase!=='player');
  }
  return {first,engine,state:engine.snapshot(),initial,trace,commands,operations,phase:engine.snapshot().phase};
}
