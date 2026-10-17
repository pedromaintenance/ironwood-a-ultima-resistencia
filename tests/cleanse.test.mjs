import test from 'node:test';
import assert from 'node:assert/strict';
import { playFifthMission } from './cleanse-driver.mjs';
import { missionProgress } from '../src/core/objectives.js';

test('M4h: five consecutive legitimate wins and sixth mission unlocked',()=>{
  const attempts=[];
  let run;
  for(let seed=1;seed<=48;seed++){
    const current=playFifthMission({seed});
    attempts.push({seed,phase:current.phase,round:current.state?.round,
      shrines:current.state?.board?.filter(t=>t.objective==='shrine'&&!t.cleared).length,
      allies:current.state?.actors?.filter(a=>a.side==='ally'&&a.hp>0).length});
    if(current.phase==='between'){run=current;break;}
  }
  assert.ok(run,'No real five-mission victory: '+JSON.stringify(attempts));
  const {initial,state,commands,engine,fourth}=run;
  assert.equal(fourth.state.wins,4);
  assert.equal(initial.mission,4);
  assert.equal(initial.wins,4);
  assert.equal(initial.board.filter(t=>t.objective==='shrine'&&!t.cleared).length,3);
  assert.equal(state.mission,4);
  assert.equal(state.wins,5);
  assert.equal(state.losses,0);
  assert.equal(state.phase,'between');
  assert.equal(state.board.filter(t=>t.objective==='shrine'&&!t.cleared).length,0);
  assert.ok(state.stats.rescued>=5);
  assert.equal(commands.filter(c=>c.command==='useSkill'&&c.args[1]==='interact').length,3);
  const p=missionProgress('cleanse',state.board,state.actors,state.round,state.phase);
  assert.deepEqual({completed:p.completed,total:p.total,status:p.status},
    {completed:3,total:3,status:'victory'});
  engine.advanceMission('focus');
  engine.deployMission();
  const sixth=engine.snapshot();
  assert.equal(sixth.mission,5);
  assert.equal(sixth.phase,'player');
  assert.equal(sixth.wins,5);
  assert.equal(sixth.actors.filter(a=>a.side==='enemy').length,7);
  console.log('M4h five legit missions',JSON.stringify({
    seed:run.seed,round:state.round,commands:commands.length,
    shrines:initial.board.filter(t=>t.objective==='shrine').map(t=>({x:t.x,y:t.y})),
    surviving:state.actors.filter(a=>a.side==='ally'&&a.hp>0).map(a=>({name:a.name,hp:a.hp})),
    trace:run.trace.slice(-15)
  }));
});
