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

test('import rejects malformed v1 board, roster, RNG and phase without mutating existing campaign', () => {
  const e = deployed(991);
  const original = e.snapshot();
  const variations = [
    value => { value.board.pop(); },
    value => { value.board[0].x = 99; },
    value => { value.actors[0].x = -1; },
    value => { value.actors[1].id = value.actors[0].id; },
    value => { value.team = ['guardian','guardian','ranger']; },
    value => { value.difficulty = 'legendary'; },
    value => { value.phase = 'unknown'; },
    value => { value.rngState = -1; },
    value => { value.round = 0; },
    value => { value.upgrades = null; },
  ];
  for (const mutate of variations) {
    const value = structuredClone(original);
    mutate(value);
    assert.throws(() => e.restoreSave(value), TypeError);
    assert.deepEqual(e.snapshot(), original);
  }
});

test('unmodified legacy v1 save without rngState remains readable', () => {
  const e = deployed(1234);
  const legacy = e.snapshot();
  delete legacy.rngState;
  const restored = createIronwoodEngine();
  restored.restoreSave(legacy);
  const current = restored.snapshot();
  delete current.rngState;
  assert.deepEqual(current, legacy);
});

test('previewSkill shares cast target/line-of-sight gates without spending AP or RNG', () => {
  const engine = deployed(777);
  const state = engine.snapshot();
  const ranger = state.actors.find(a => a.id === 'a1');
  ranger.x = 5; ranger.y = 8; ranger.mp = 99; ranger.ap = 2;
  state.actors.find(a => a.id === 'a0').x = 7;
  state.actors.find(a => a.id === 'a0').y = 8;
  const enemies = state.actors.filter(a => a.side === 'enemy');
  enemies.forEach((a, i) => { a.x = i; a.y = 0; });
  enemies[0].x = 5; enemies[0].y = 5;
  for (const t of state.board) {
    if (t.x === 5 && t.y >= 5 && t.y <= 8) { t.base = 'grass'; t.wall = 0; t.fog = 0; }
  }
  tile(state.board, 5, 7).base = 'rock';
  engine.restoreSave(state);
  const initial = engine.snapshot();
  assert.deepEqual(engine.previewSkill('a1', 'mark', 5, 5), { allowed: false, reason: 'blocked-sight' });
  assert.deepEqual(engine.previewSkill('a1', 'mark', 5, 4), { allowed: false, reason: 'invalid-target' });
  assert.deepEqual(engine.previewSkill('a1', 'fireball', 5, 5), { allowed: false, reason: 'unknown-skill' });
  assert.deepEqual(engine.previewSkill('a1', 'mark', -1, 0), { allowed: false, reason: 'outside-board' });
  assert.deepEqual(engine.snapshot(), initial, 'preview does not alter state or RNG');
  assert.equal(engine.useSkill('a1', 'mark', 5, 5), false);
  assert.equal(engine.snapshot().actors.find(a => a.id === 'a1').ap, 2);

  const open = engine.snapshot();
  tile(open.board, 5, 7).base = 'grass';
  engine.restoreSave(open);
  const before = engine.snapshot();
  assert.deepEqual(engine.previewSkill('a1', 'mark', 5, 5), { allowed: true, reason: 'ready' });
  assert.deepEqual(engine.snapshot(), before, 'valid preview is also read-only');
  assert.equal(engine.useSkill('a1', 'mark', 5, 5), true);
  assert.equal(engine.snapshot().actors.find(a => a.id === 'a1').ap, 1);
  assert.equal(engine.snapshot().casts, before.casts + 1);
});

test('previewImpact matches fireball 5x5 footprint and reports friendly-fire without mutation', () => {
  const engine = deployed(77, ['guardian', 'mage', 'druid']);
  const before = engine.snapshot();
  const mage = before.actors.find(a => a.kind === 'mage');
  const preview = engine.previewImpact(mage.id, 'fireball', mage.x, mage.y - 1);
  assert.equal(preview.allowed, true);
  assert.equal(preview.scope, 'square5');
  assert.equal(preview.tiles.length, 25);
  assert.equal(preview.confirm, true);
  assert.ok(preview.allyIds.includes(mage.id), 'mage is caught in his own blast');
  assert.deepEqual(engine.snapshot(), before, 'preview cannot draw RNG or alter save state');
  const unknown = engine.previewImpact(mage.id, 'nonsense', mage.x, mage.y);
  assert.equal(unknown.allowed, false);
  assert.deepEqual(unknown.tiles, []);
});

test('spell footprints respect board edges and line stops without touching state', async () => {
  const { skillImpact } = await import('../src/core/targeting.js');
  const state = deployed(78, ['guardian','mage','runesmith']).snapshot();
  const rune = state.actors.find(a => a.kind === 'runesmith');
  const single = skillImpact(state, rune, 'icewall', 0, 0);
  assert.deepEqual(single.tiles, [{x:0,y:0},{x:1,y:0}]);
  const fire = skillImpact(state, rune, 'fireball', 0, 0);
  assert.equal(fire.tiles.length, 9, '5x5 square must clamp to 12x12 map');
  const line = skillImpact(state, rune, 'lightning', rune.x, 0);
  assert.equal(line.scope, 'line');
  assert.ok(line.note.includes('água'));
  assert.ok(line.tiles.every(({x,y}) => x >= 0 && y >= 0 && x < 12 && y < 12));
});

test('mission goal tracker follows every core missionOutcome gate without mutations', async () => {
  const { missionOutcome, missionProgress } = await import('../src/core/objectives.js');
  const actors = [
    { id: 'a0', side: 'ally', kind: 'guardian', hp: 30 },
    { id: 'e0', side: 'enemy', kind: 'spear', hp: 0, maxhp: 14 },
    { id: 'e1', side: 'enemy', kind: 'archer', hp: 11, maxhp: 11 },
  ];
  const goal = [{ objective: 'captive', cleared: true }, { objective: 'captive', cleared: false }];
  const original = structuredClone({ actors, goal });
  const kill = missionProgress('kill', [], actors, 1, 'player');
  assert.equal(kill.completed, 1);
  assert.equal(kill.total, 2);
  assert.equal(kill.remaining, 1);
  assert.equal(missionOutcome('kill', [], actors, 1), null);
  const allDead = actors.map(a => a.side === 'enemy' ? { ...a, hp: 0 } : a);
  assert.equal(missionProgress('kill', [], allDead, 1, 'between').status, 'victory');
  assert.equal(missionOutcome('kill', [], allDead, 1), 'victory');

  for (const [kind, type] of [
    ['rescue', 'captive'], ['totem', 'totem'],
    ['cleanse', 'shrine'], ['beacon', 'beacon'],
  ]) {
    const board = goal.map(t => ({ ...t, objective: type }));
    const p = missionProgress(kind, board, actors, 2, 'player');
    assert.equal(p.completed, 1, kind);
    assert.equal(p.total, 2, kind);
    assert.equal(missionOutcome(kind, board, actors, 2), null);
    board[1].cleared = true;
    assert.equal(missionProgress(kind, board, actors, 2, 'between').remaining, 0, kind);
    assert.equal(missionOutcome(kind, board, actors, 2), 'victory', kind);
  }
  assert.equal(missionProgress('survive', [], actors, 6).completed, 5);
  assert.equal(missionOutcome('survive', [], actors, 6), null);
  assert.equal(missionProgress('survive', [], actors, 7, 'between').completed, 6);
  assert.equal(missionOutcome('survive', [], actors, 7), 'victory');
  const boss = actors.concat({ id: 'e2', side: 'enemy', kind: 'boss', hp: 12, maxhp: 52 });
  assert.equal(missionProgress('boss', [], boss).completed, 40);
  assert.equal(missionOutcome('boss', [], boss, 1), null);
  const defeatedBoss = boss.map(a => a.kind === 'boss' ? { ...a, hp: 0 } : a);
  assert.equal(missionProgress('boss', [], defeatedBoss, 1, 'ending').completed, 52);
  assert.equal(missionOutcome('boss', [], defeatedBoss, 1), 'victory');
  assert.deepEqual({ actors, goal }, original, 'progress read cannot modify caller objects');
});
