import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { createSeededRng } from '../src/core/rng.js';
import { createIronwoodEngine } from '../src/core/engine.js';
import { HEROES, SKILLS, MISSIONS } from '../src/core/data.js';

// Differential tests against the real pre-Phaser file.
// DOM and rendering are replaced with inert adapters; game rule code is NOT rewritten.
const originalSource = readFileSync(new URL('../app.js', import.meta.url), 'utf8').replace(/\ninit\(\);\s*$/, '\n');

function legacy(seed, team = ['guardian', 'ranger', 'druid'], missionIndex = 0) {
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
      ver: 1, difficulty: 'normal', mission: ${missionIndex}, team: ${JSON.stringify(team)}, upgrades: {},
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
function current(seed, team, missionIndex = 0) {
  const engine = createIronwoodEngine({ seed });
  engine.startCampaign({ seed, team });
  if (missionIndex !== 0) {
    const state = engine.snapshot();
    state.mission = missionIndex;
    state.phase = 'brief';
    engine.restoreSave(state);
  }
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

test('all eight missions preserve generated maps, enemy rosters and objectives', () => {
  MISSIONS.forEach((mission, missionIndex) => {
    const seed = 11111 + missionIndex * 13;
    const old = legacy(seed, ['guardian','ranger','druid'], missionIndex);
    const fresh = current(seed, ['guardian','ranger','druid'], missionIndex);
    equivalent(old.state(), fresh.snapshot());
    assert.equal(fresh.snapshot().mission, missionIndex);
  });
});

test('all 32 spell/action effects preserve legacy battle state and random sequence', () => {
  for (const [index, key] of Object.keys(SKILLS).entries()) {
    const owner = Object.keys(HEROES).find(id => HEROES[id].skills.includes(key)) || 'guardian';
    const team = [owner, ...Object.keys(HEROES).filter(id => id !== owner).slice(0, 2)];
    const seed = 3800 + index;
    const old = legacy(seed, team);
    const fresh = current(seed, team);
    const state = fresh.snapshot();
    // Identical controlled laboratory arena around the caster.
    for (const tile of state.board) {
      if (tile.x >= 3 && tile.x <= 8 && tile.y >= 3 && tile.y <= 9) {
        Object.assign(tile, { base: 'grass', wall: 0, fire: 0, fog: 0, steam: 0, web: 0,
          ice: 0, wet: 0, corrupt: 0, objective: '', cleared: false });
      }
    }
    const caster = state.actors[0];
    Object.assign(caster, { x: 5, y: 6, mp: 99, maxmp: 99, ap: 2 });
    const friend = state.actors[1];
    Object.assign(friend, { x: 6, y: 6, hp: Math.max(1, friend.hp - 4) });
    const foes = state.actors.filter(actor => actor.side === 'enemy');
    foes.forEach((foe, i) => { foe.x = 1 + i; foe.y = 2; });
    Object.assign(foes[0], { x: 5, y: 5, hp: 100, maxhp: 100 });
    const objectiveTile = state.board[7 * 12 + 5];
    Object.assign(objectiveTile, { base: 'grass', objective: 'beacon', cleared: false });

    fresh.restoreSave(state);
    const legacyState = structuredClone(state);
    delete legacyState.rngState;
    old.act('G = ' + JSON.stringify(legacyState));

    const skill = SKILLS[key];
    const [x,y] = skill.target === 'self' ? [5,6] :
      skill.target === 'ally' ? [6,6] :
      skill.target === 'enemy' ? [5,5] :
      key === 'blink' || key === 'interact' ? [5,7] : [5,5];

    old.act(`cast(G.actors[0], ${JSON.stringify(key)}, ${x}, ${y})`);
    const executed = fresh.useSkill('a0', key, x, y);
    assert.equal(executed, true, `spell should be usable: ${key}`);
    try {
      equivalent(old.state(), fresh.snapshot());
    } catch (error) {
      error.message = `Mismatch for ${key}: ${error.message}`;
      throw error;
    }
  }
});
