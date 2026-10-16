import test from 'node:test';
import assert from 'node:assert/strict';
import { createIronwoodEngine } from '../src/core/engine.js';
import { createSeededRng } from '../src/core/rng.js';
import { HEROES, MISSIONS, SKILLS, ENEMIES } from '../src/core/data.js';

function deployed(seed = 321, team = ['guardian','ranger','druid']) {
  const engine = createIronwoodEngine({ seed });
  engine.startCampaign({ seed, team });
  engine.deployMission();
  return engine;
}
function tile(board, x, y) { return board[y * 12 + x]; }

test('legacy content and headless runtime are available without a browser', () => {
  assert.equal(Object.keys(HEROES).length, 6);
  assert.equal(Object.keys(ENEMIES).length, 6);
  assert.equal(Object.keys(SKILLS).length, 32);
  assert.equal(MISSIONS.length, 8);
  const engine = deployed();
  const state = engine.snapshot();
  assert.equal(state.board.length, 144);
  assert.equal(state.actors.filter(a => a.side === 'ally').length, 3);
  assert.equal(state.actors.filter(a => a.side === 'enemy').length, 4);
  assert.equal(state.phase, 'player');
  assert.equal(state.actors[0].ap, 2);
});

test('same seed, same mission, same map and enemy deployment', () => {
  const a = deployed(20261015).snapshot();
  const b = deployed(20261015).snapshot();
  assert.deepEqual(a.board, b.board);
  assert.deepEqual(a.actors, b.actors);
  assert.equal(a.rngState, b.rngState);
  const c = deployed(20261016).snapshot();
  assert.notDeepEqual(a.board, c.board);
});

test('RNG snapshot resumes at the next draw', () => {
  const a = createSeededRng(42), b = createSeededRng(7);
  a.next();
  b.setState(a.getState());
  assert.equal(a.next(), b.next());
});

test('movement is orthogonal, respects action points and blocks terrain', () => {
  const e = deployed();
  const reachable = e.reachable('a0');
  assert.ok(reachable.some(t => t.x === 3 && t.y === 10 && t.cost === 1));
  assert.equal(e.move('a0', 3, 10), true);
  assert.equal(e.getActor('a0').ap, 1);
  assert.equal(e.getActor('a0').x, 3);
  assert.equal(e.getActor('a0').y, 10);
  const before = e.snapshot();
  const blocked = structuredClone(before);
  tile(blocked.board, 4, 10).base = 'tree';
  e.restoreSave(blocked);
  assert.equal(e.reachable('a0').some(t => t.x === 4 && t.y === 10), false);
  assert.equal(e.move('a0', 4, 10), false);
  assert.equal(e.getActor('a0').ap, 1);
});

test('fire consumes webs and water magic extinguishes flames', () => {
  const e = deployed(24, ['mage','druid','guardian']);
  let state = e.snapshot();
  const target = tile(state.board, 2, 9);
  Object.assign(target, { base: 'grass', fire: 0, ice: 0, wet: 0, web: 3, fog: 0, steam: 0 });
  e.restoreSave(state);
  assert.equal(e.useSkill('a0', 'firebolt', 2, 9), true);
  const burned = tile(e.snapshot().board, 2, 9);
  assert.ok(burned.fire > 0);
  assert.equal(burned.web, 0);

  state = e.snapshot();
  const wetTile = tile(state.board, 5, 9);
  Object.assign(wetTile, { base: 'grass', fire: 4, wet: 0, ice: 0, steam: 0 });
  e.restoreSave(state);
  assert.equal(e.useSkill('a1', 'rain', 5, 9), true);
  const soaked = tile(e.snapshot().board, 5, 9);
  assert.equal(soaked.fire, 0);
  assert.ok(soaked.wet > 0);
  assert.ok(soaked.steam > 0);
});

test('end turn processes enemies and restores ally AP/mana', () => {
  const e = deployed(517);
  const before = e.snapshot();
  assert.equal(e.endTurn(), true);
  const after = e.snapshot();
  assert.equal(after.phase, 'player');
  assert.equal(after.round, 2);
  for (const a of after.actors.filter(a => a.side === 'ally' && a.hp > 0)) {
    assert.equal(a.ap, 2);
    assert.ok(a.mp >= before.actors.find(b => b.id === a.id).mp);
  }
});

test('save restoration preserves next deterministic enemy round', () => {
  const a = deployed(9001), b = createIronwoodEngine();
  b.restoreSave(a.snapshot());
  a.endTurn();
  b.endTurn();
  assert.deepEqual(a.snapshot(), b.snapshot());
});

test('forced mission-1 victory transitions to upgrade screen in state machine', () => {
  const e = deployed(303);
  const state = e.snapshot();
  state.actors.filter(a => a.side === 'enemy').forEach(a => { a.hp = 0; });
  e.restoreSave(state);
  assert.equal(e.move('a0', 3, 10), true);
  assert.equal(e.getOutcome(), 'victory');
  assert.equal(e.snapshot().wins, 1);
  assert.equal(e.advanceMission('hp').mission, 1);
  assert.equal(e.snapshot().upgrades.hp, 1);
  assert.equal(e.snapshot().phase, 'brief');
  e.deployMission();
  assert.equal(e.snapshot().actors.filter(a => a.side === 'ally').length, 3);
  assert.equal(e.snapshot().actors[0].maxhp, HEROES.guardian.hp + 5 + Math.floor(1/2)*2);
});

test('invalid teams, skills and save versions do not mutate gameplay', () => {
  const e = createIronwoodEngine();
  assert.throws(() => e.startCampaign({ team: ['mage', 'mage', 'druid'] }), RangeError);
  e.startCampaign({ seed: 5 });
  e.deployMission();
  const before = e.snapshot();
  assert.equal(e.useSkill('a0', 'fireball', 3, 10), false);
  assert.equal(e.attack('a0','a1'), false);
  assert.deepEqual(e.snapshot(), before);
  assert.throws(() => e.restoreSave({ ver: 2 }), TypeError);
});
