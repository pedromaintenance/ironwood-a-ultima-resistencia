import test from 'node:test';
import assert from 'node:assert/strict';
import { playThirdMission } from './totem-driver.mjs';

test('M4e: three genuinely completed missions, all three 18-HP totems destroyed',()=>{
  const trials=[];
  let successful=null;
  for(let seed=1;seed<=30;seed++){
    const r=playThirdMission({seed,maxRounds:28});
    trials.push({seed,phase:r.phase,round:r.state?.round,remaining:r.state?.board?.filter(t=>t.objective==='totem'&&!t.cleared).length,allies:r.state?.actors?.filter(a=>a.side==='ally'&&a.hp>0).length});
    if(r.phase==='between'){successful=r;break;}
  }
  assert.ok(successful, 'No valid M4e natural win: '+JSON.stringify(trials));
  const {engine,initial,state,commands}=successful;
  assert.equal(successful.second.first.state.wins,1);
  assert.equal(successful.second.state.wins,2);
  assert.equal(initial.mission,2);
  assert.equal(initial.board.filter(t=>t.objective==='totem'&&!t.cleared).length,3);
  assert.equal(state.phase,'between');
  assert.equal(state.mission,2);
  assert.equal(state.wins,3);
  assert.equal(state.losses,0);
  assert.equal(state.board.filter(t=>t.objective==='totem'&&!t.cleared).length,0);
  assert.ok(commands.some(c=>c.command==='attackObjective'||(c.command==='useSkill'&&['firebolt','fireball','volley'].includes(c.args[1]))));
  engine.advanceMission('power');
  assert.equal(engine.snapshot().mission,3);
  engine.deployMission();
  assert.equal(engine.snapshot().mission,3);
  assert.equal(engine.snapshot().phase,'player');
  console.log('M4e real campaign through mission four',JSON.stringify({
    seed:successful.seed,firstRounds:successful.second.first.state.round,
    secondRounds:successful.second.state.round,thirdRounds:state.round,
    totemPositions:initial.board.filter(t=>t.objective==='totem').map(t=>({x:t.x,y:t.y})),
    actions:commands.length,successfulActions:commands.filter(c=>c.command==='attackObjective').length,
    latest:successful.trace.slice(-12)
  }));
});
