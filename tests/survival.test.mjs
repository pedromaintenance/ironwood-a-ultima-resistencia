import test from 'node:test';
import assert from 'node:assert/strict';
import { playFourthMission } from './survival-driver.mjs';
import { missionProgress } from '../src/core/objectives.js';

test('M4g: defend convoy through two reinforcement waves and begin mission five',()=>{
  const trials=[];
  let winner=null;
  for(let seed=1;seed<=48;seed++){
    const r=playFourthMission({seed,maxRounds:12});
    trials.push({seed,phase:r.phase,round:r.state?.round,
      wave:r.state?.wave,wins:r.state?.wins,allies:r.state?.actors?.filter(a=>a.side==='ally'&&a.hp>0).length});
    if(r.phase==='between'){winner=r;break;}
  }
  assert.ok(winner,'No natural four-mission success: '+JSON.stringify(trials));
  const {initial,state,commands,waveSpawns,engine,previous}=winner;
  assert.equal(previous.second.first.state.wins,1);
  assert.equal(previous.second.state.wins,2);
  assert.equal(previous.state.wins,3);
  assert.equal(initial.mission,3);
  assert.equal(initial.wave,0);
  assert.equal(state.wins,4);
  assert.equal(state.losses,0);
  assert.equal(state.mission,3);
  assert.equal(state.phase,'between');
  assert.equal(state.wave,2);
  assert.ok(state.round>=7,'Six defensive rounds must elapse, not instant victory');
  const waveOne=waveSpawns.find(x=>x.wave===1);
  const waveTwo=waveSpawns.find(x=>x.wave===2);
  assert.ok(waveOne&&waveTwo,'both reinforcement waves should spawn naturally');
  assert.equal(waveOne.toRound,4);
  assert.equal(waveTwo.toRound,6);
  assert.deepEqual(waveOne.spawned.map(a=>a.kind),['wolf','archer']);
  assert.deepEqual(waveTwo.spawned.map(a=>a.kind),['spear','wolf']);
  assert.ok(waveOne.spawned.every(a=>a.side==='enemy'));
  assert.ok(waveTwo.spawned.every(a=>a.side==='enemy'));
  assert.ok(commands.filter(c=>c.command==='endTurn').length>=6);
  assert.ok(state.actors.some(a=>a.side==='ally'&&a.hp>0));
  const p=missionProgress('survive',state.board,state.actors,state.round,state.phase);
  assert.deepEqual({total:p.total,completed:p.completed,status:p.status},
    {total:6,completed:6,status:'victory'});
  engine.advanceMission('mp');
  assert.equal(engine.snapshot().mission,4);
  engine.deployMission();
  assert.equal(engine.snapshot().phase,'player');
  assert.equal(engine.snapshot().mission,4);
  assert.equal(engine.snapshot().board.filter(t=>t.objective==='shrine'&&!t.cleared).length,3);
  console.log('M4g authentic four missions',JSON.stringify({
    seed:winner.seed,first:previous.second.first.state.round,
    second:previous.second.state.round,
    third:previous.state.round,fourth:state.round,
    waves:waveSpawns,actions:commands.length,
    remainingHeroes:state.actors.filter(a=>a.side==='ally'&&a.hp>0).map(a=>({name:a.name,hp:a.hp})),
    trace:winner.trace.slice(-13)}));
});
