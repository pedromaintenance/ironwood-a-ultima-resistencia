import test from 'node:test';
import assert from 'node:assert/strict';
import { playSeventhMission } from './beacons-driver.mjs';
import { missionProgress } from '../src/core/objectives.js';

test('M4j: seven real victories, all beacons enabled and final mission unlocked',()=>{
  const trials=[];
  let result;
  for(let seed=1;seed<=48;seed++){
    const r=playSeventhMission({seed});
    trials.push({seed,phase:r.phase,round:r.state?.round,
      pending:r.state?.board?.filter(t=>t.objective==='beacon'&&!t.cleared).length,
      allies:r.state?.actors?.filter(a=>a.side==='ally'&&a.hp>0).length});
    if(r.phase==='between'){result=r;break;}
  }
  assert.ok(result,'No authentic seventh mission won: '+JSON.stringify(trials));
  const {sixth,engine,initial,state,commands}=result;
  assert.equal(sixth.state.wins,6);
  assert.equal(initial.mission,6);
  assert.equal(initial.wins,6);
  assert.equal(initial.board.filter(t=>t.objective==='beacon'&&!t.cleared).length,3);
  assert.equal(state.mission,6);
  assert.equal(state.wins,7);
  assert.equal(state.losses,0);
  assert.equal(state.phase,'between');
  assert.equal(state.board.filter(t=>t.objective==='beacon'&&!t.cleared).length,0);
  const activations=commands.filter(c=>c.command==='useSkill'&&c.args[1]==='interact');
  assert.equal(activations.length,3);
  assert.equal(new Set(activations.map(c=>c.args.slice(2).join(','))).size,3);
  assert.ok(state.actors.some(a=>a.side==='ally'&&a.hp>0));
  const progress=missionProgress('beacon',state.board,state.actors,state.round,state.phase);
  assert.equal(progress.total,3);
  assert.equal(progress.completed,3);
  assert.equal(progress.status,'victory');
  engine.advanceMission('defense');
  engine.deployMission();
  const final=engine.snapshot();
  assert.equal(final.mission,7);
  assert.equal(final.phase,'player');
  assert.equal(final.wins,7);
  assert.equal(final.actors.filter(a=>a.side==='enemy'&&a.kind==='boss').length,1);
  console.log('M4j seven real victories',JSON.stringify({
    seed:result.seed,round:state.round,commands:commands.length,
    beaconLocations:initial.board.filter(t=>t.objective==='beacon').map(t=>({x:t.x,y:t.y})),
    allies:state.actors.filter(a=>a.side==='ally'&&a.hp>0).map(a=>({name:a.name,hp:a.hp})),
    finalEnemies:final.actors.filter(a=>a.side==='enemy').map(a=>a.kind),
    tail:result.trace.slice(-12),
  }));
});
