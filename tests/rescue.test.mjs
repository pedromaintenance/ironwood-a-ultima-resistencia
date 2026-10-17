import test from 'node:test';
import assert from 'node:assert/strict';
import { playSecondMission } from './rescue-driver.mjs';

test('M4d: reach mission 3 by genuinely rescuing both captives in mission 2', () => {
  const team=['guardian','ranger','mage'], difficulty='story',attempts=[];
  let winningRun;
  for(let seed=1;seed<=32;seed++) {
    const run=playSecondMission({seed,team,difficulty,maxRounds:24});
    attempts.push({seed,phase:run.phase,round:run.state?.round,pending:run.state?.board?.filter(t=>t.objective==='captive'&&!t.cleared).length,
      losses:run.state?.losses,rescued:run.state?.stats.rescued});
    if(run.phase==='between'){winningRun=run;break;}
  }
  assert.ok(winningRun, 'No fully authentic rescue victory across evaluated seeds: '+JSON.stringify(attempts));
  const {engine,state,trace,commands,first,initial}=winningRun;
  assert.equal(first.state.wins,1,'mission 1 must be won without fixtures');
  assert.equal(initial.mission,1);
  assert.equal(initial.board.filter(t=>t.objective==='captive'&&!t.cleared).length,2);
  assert.equal(state.mission,1);
  assert.equal(state.phase,'between');
  assert.equal(state.wins,2);
  assert.equal(state.losses,0);
  assert.equal(state.board.filter(t=>t.objective==='captive'&&!t.cleared).length,0);
  assert.ok(state.stats.rescued>=2);
  assert.equal(commands.filter(c=>c.command==='useSkill'&&c.args[1]==='interact').length,2);
  engine.advanceMission('defense');
  assert.equal(engine.snapshot().mission,2);
  engine.deployMission();
  assert.equal(engine.snapshot().board.filter(t=>t.objective==='totem').length,3);
  console.log('M4d two real missions complete', JSON.stringify({seed:winningRun.first.seed,team,difficulty,
    firstRounds:first.state.round,rescueRounds:state.round,
    rescueActions:commands.filter(c=>c.command==='useSkill'&&c.args[1]==='interact').map(c=>({at:c.args.slice(2),round:c.checkpoint.round})),
    operationCount:winningRun.operations,trace}));
});
