import test from 'node:test';
import assert from 'node:assert/strict';
import { createIronwoodEngine } from '../src/core/engine.js';
import { validateLegacySave } from '../src/core/save.js';

function start(seed,aiOrder) {
  const engine=createIronwoodEngine({seed});
  engine.startCampaign({seed,team:['guardian','ranger','mage'],difficulty:'story',
    ...(aiOrder?{aiOrder}:{})});
  engine.deployMission();
  return engine;
}
test('M4f: portable-v2 is explicit, serializable and consumes reproducible turn RNG',()=>{
  const a=start(1,'portable-v2'),b=start(1,'portable-v2');
  assert.equal(a.snapshot().aiOrder,'portable-v2');
  assert.deepEqual(a.snapshot(),b.snapshot());
  for(let round=1;round<=4&&a.snapshot().phase==='player';round++){
    assert.equal(a.endTurn(),b.endTurn());
    assert.deepEqual(a.snapshot(),b.snapshot());
    const imported=createIronwoodEngine({seed:997});
    imported.restoreSave(a.snapshot());
    assert.deepEqual(imported.snapshot(),a.snapshot());
    if(a.snapshot().phase==='player'){
      a.endTurn(); imported.endTurn();
      assert.deepEqual(imported.snapshot(),a.snapshot(),
        'RNG must resume identically after importing the portable strategy');
      // Stop after one validation or both executions would be on different rounds.
      break;
    }
  }
});
test('M4f: a legacy Canvas/Phaser save does not acquire portable ordering',()=>{
  const legacy=start(12),state=legacy.snapshot();
  assert.equal(Object.hasOwn(state,'aiOrder'),false);
  const imported=createIronwoodEngine({seed:99});
  imported.restoreSave(structuredClone(state));
  assert.deepEqual(imported.snapshot(),state);
  legacy.endTurn();imported.endTurn();
  assert.deepEqual(imported.snapshot(),legacy.snapshot());
  assert.equal(Object.hasOwn(imported.snapshot(),'aiOrder'),false);
});
test('M4f: untrusted algorithm values are rejected before altering a campaign',()=>{
  const engine=start(12,'portable-v2'),old=engine.snapshot();
  for(const aiOrder of ['portable-v1','legacy',0,null,{},'sort-random']){
    assert.throws(()=>engine.restoreSave({...old,aiOrder}),/aiOrder/);
    assert.deepEqual(engine.snapshot(),old);
  }
  assert.throws(()=>engine.startCampaign({seed:1,aiOrder:'unknown'}),RangeError);
  assert.deepEqual(engine.snapshot(),old);
  assert.equal(validateLegacySave(old),old);
});
