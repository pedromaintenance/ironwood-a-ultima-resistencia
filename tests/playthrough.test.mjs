import test from 'node:test';
import assert from 'node:assert/strict';
import { playFreshMission } from './playthrough-driver.mjs';
const alive = (state, side) => state.actors.filter(a => a.side === side && a.hp > 0);

test('M4c: a primeira missão é vencível do início ao fim com comandos reais, por duas equipes', () => {
  for (const [team,difficulty] of [
    [['guardian','ranger','mage'],'story'],
    [['ranger','mage','cleric'],'story'],
  ]) {
    let success;
    const records=[];
    for (let seed=1;seed<=40;seed++) {
      const run=playFreshMission({seed,team,difficulty});
      records.push({seed,phase:run.state.phase,round:run.state.round,
        enemies:alive(run.state,'enemy').length,allies:alive(run.state,'ally').length});
      if (run.state.phase === 'between') {success=run;break;}
    }
    assert.ok(success, 'No fresh, unmodified, naturally-won mission 1; results: '+
      JSON.stringify({team,difficulty,records}));
    assert.equal(success.state.mission,0);
    assert.equal(success.state.wins,1);
    assert.equal(success.state.losses,0);
    assert.ok(success.trace.some(t=>t.command==='endTurn'),'must survive a real enemy turn');
    assert.ok(success.trace.some(t=>t.actor),'must issue real actor commands');
    // A genuine victory must grant an upgrade and unlock actual mission 2.
    success.engine.advanceMission('hp');
    assert.equal(success.engine.snapshot().phase,'brief');
    assert.equal(success.engine.snapshot().mission,1);
    success.engine.deployMission();
    assert.equal(success.engine.snapshot().phase,'player');
    assert.equal(success.engine.snapshot().board.filter(t=>t.objective==='captive').length,2);
    console.log('M4c authentic playthrough',JSON.stringify({seed:success.seed,team,difficulty,
      rounds:success.state.round,commands:success.count,remainingAllies:alive(success.state,'ally').length,
      trace:success.trace}));
  }
});
