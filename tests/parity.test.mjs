import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { createSeededRng } from '../src/core/rng.js';
import { createIronwoodEngine } from '../src/core/engine.js';

// Differential tests against the real pre-Phaser file.
// DOM and rendering are replaced with inert adapters; game rule code is NOT rewritten.
const originalSource = readFileSync(new URL('../app.js', import.meta.url), 'utf8').replace(/\ninit\(\);\s*$/, '\n');

function legacy(seed, team = ['guardian', 'ranger', 'druid']) {
  const rng = createSeededRng(seed);
  const math = Object.create(Math);
  math.random = () => rng.next();
  const sandbox = {
    Math: math,
    console,
    setTimeout: () => { throw new Error('Unexpected timer in headless parity run'); },
    document: { getElementById: () => ({ getContext: () => ({}) }) },
  };
  vm.createContext(sandbox);
  vm.runInContext(originalSource, sandbox, { filename: 'app.js' });
  const expression = `
    show = () => {};
    render = () => {};
    save = () => {};
    toast = () => {};
    renderBetween = () => {};
    renderEnding = () => {};
    G = {
      ver: 1, difficulty: 'normal', mission: 0, team: ${JSON.stringify(team)}, upgrades: {},
      wins: 0, losses: 0, casts: 0, round: 1, seed: ${seed >>> 0},
      phase: 'ready', logs: [],
      stats: { fires: 0, trees: 0, shocked: 0, rescued: 0 }
    };
    selectedTeam = [...G.team];
    deploy();
  `;
  vm.runInContext(expression, sandbox);
  return {
    act(js) { vm.runInContext(js, sandbox); },
    state() { return JSON.parse(vm.runInContext('JSON.stringify(G)', sandbox)); },
  };
}
function current(seed, team) {
  const engine = createIronwoodEngine({ seed });
  engine.startCampaign({ seed, team });
  engine.deployMission();
  return engine;
}
function equivalent(legacyState, newState) {
  const clone = structuredClone(newState);
  delete clone.rngState;
  assert.deepEqual(clone, legacyState);
}

test('original and new engine generate exactly the same seeded mission 1', () => {
  for (const seed of [1, 42, 20261015, 0x7FFFFFFF]) {
    const old = legacy(seed), fresh = current(seed);
    equivalent(old.state(), fresh.snapshot());
  }
});

test('movement, enemy turn and weather preserve legacy outcome', () => {
  const seed = 615;
  const old = legacy(seed), fresh = current(seed);
  old.act('moveUnit(G.actors[0], {x:3,y:10})');
  assert.equal(fresh.move('a0', 3, 10), true);
  equivalent(old.state(), fresh.snapshot());

  old.act("G.phase='enemy'; enemyTurn()");
  assert.equal(fresh.endTurn(), true);
  equivalent(old.state(), fresh.snapshot());
});

test('spellcasting and terrain mutation remain equivalent', () => {
  const seed = 41, team = ['mage','druid','guardian'];
  const old = legacy(seed, team), fresh = current(seed, team);
  old.act("cast(G.actors[0], 'firebolt', 2, 9)");
  assert.equal(fresh.useSkill('a0', 'firebolt', 2, 9), true);
  equivalent(old.state(), fresh.snapshot());

  old.act("cast(G.actors[1], 'rain', 5, 9)");
  assert.equal(fresh.useSkill('a1', 'rain', 5, 9), true);
  equivalent(old.state(), fresh.snapshot());
});

test('forced victory triggers identical mission/phase bookkeeping', () => {
  const old = legacy(90), fresh = current(90);
  old.act("G.actors.filter(a=>a.side==='enemy').forEach(a=>a.hp=0); moveUnit(G.actors[0], {x:3,y:10})");
  const next = fresh.snapshot();
  next.actors.filter(a => a.side === 'enemy').forEach(a => { a.hp = 0; });
  fresh.restoreSave(next);
  assert.equal(fresh.move('a0', 3, 10), true);
  equivalent(old.state(), fresh.snapshot());
});
