import test from 'node:test';
import assert from 'node:assert/strict';
import { playSixthMission } from './ashes-driver.mjs';
import { missionProgress } from '../src/core/objectives.js';

test('M4i: win sixth operation with seven enemies, fire and access to beacons',()=>{
  const attempts=[];
  let victorious;
  for(let seed=1;seed<=48;seed++){
    const trial=playSixthMission({seed,maxRounds:36});
    attempts.push({seed,phase:trial.phase,round:trial.state?.round,
      enemies:trial.state?.actors?.filter(a=>a.side==='enemy'&&a.hp>0).length,
      allies:trial.state?.actors?.filter(a=>a.side==='ally'&&a.hp>0).length,
      fires:trial.initial?.board?.filter(t=>t.fire>0).length});
    if(trial.phase==='between'&&trial.initial.board.some(t=>t.fire>0)){
      victorious=trial;break;
    }
  }
  assert.ok(victorious,'No naturally won burning sixth mission: '+JSON.stringify(attempts));
  const {initial,state,commands,trace,engine,fifth}=victorious;
  assert.equal(fifth.state.wins,5);
  assert.equal(initial.mission,5);
  assert.equal(initial.wins,5);
  assert.equal(initial.actors.filter(a=>a.side==='enemy').length,7);
  assert.ok(initial.board.some(t=>t.fire>0),'fire must genuinely spawn in burning forest');
  assert.equal(state.mission,5);
  assert.equal(state.wins,6);
  assert.equal(state.losses,0);
  assert.equal(state.phase,'between');
  assert.equal(state.actors.filter(a=>a.side==='enemy'&&a.hp>0).length,0);
  assert.ok(state.actors.some(a=>a.side==='ally'&&a.hp>0));
  assert.ok(commands.filter(c=>c.command==='endTurn').length>=1);
  const progress=missionProgress('kill',state.board,state.actors,state.round,state.phase);
  assert.equal(progress.remaining,0);
  assert.equal(progress.completed,7);
  assert.equal(progress.status,'victory');
  engine.advanceMission('hp');
  engine.deployMission();
  const next=engine.snapshot();
  assert.equal(next.mission,6);
  assert.equal(next.wins,6);
  assert.equal(next.phase,'player');
  assert.equal(next.board.filter(t=>t.objective==='beacon'&&!t.cleared).length,3);
  console.log('M4i six natural victories',JSON.stringify({
    seed:victorious.seed,round:state.round,actions:commands.length,
    startFires:initial.board.filter(t=>t.fire>0).map(t=>({x:t.x,y:t.y,fire:t.fire})),
    finalFires:state.board.filter(t=>t.fire>0).length,
    heroes:state.actors.filter(a=>a.side==='ally'&&a.hp>0).map(a=>({name:a.name,hp:a.hp})),
    trace:trace.slice(-14)}));
});
