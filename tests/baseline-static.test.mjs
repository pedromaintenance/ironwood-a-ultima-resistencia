import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Legacy Canvas app audit. Does not execute browser flows or Phaser code.
const source = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const fixture = JSON.parse(readFileSync(new URL('./fixtures/mission-01-baseline.json', import.meta.url), 'utf8'));

function objectKeys(name) {
  const rx = new RegExp(`const ${name}=\\{([\\s\\S]*?)\\n\\};`);
  const m = source.match(rx);
  assert.ok(m, `Missing ${name} definition`);
  return [...m[1].matchAll(/^\s*([A-Za-z_][A-Za-z_0-9]*)\s*:/gm)].map(x => x[1]);
}

function missions() {
  const m = source.match(/const MISSIONS=\[([\s\S]*?)\n\];/);
  assert.ok(m, 'Missing MISSIONS');
  return [...m[1].matchAll(/title:'([^']+)',act:'([^']+)',kind:'([^']+)'/g)]
    .map(x => ({ title:x[1], act:x[2], kind:x[3] }));
}

test('original content inventory is pinned', () => {
  assert.equal(objectKeys('HEROES').length, 6);
  assert.deepEqual(objectKeys('ENEMIES'), ['spear','archer','wolf','witch','shade','boss']);
  assert.equal(objectKeys('SKILLS').length, 32);
  assert.equal(objectKeys('SKILLS').at(-1), 'interact');
  assert.equal(missions().length, 8);
});

test('mission 1 fixture reflects original static configuration', () => {
  assert.equal(missions()[0].title, fixture.mission.title);
  assert.equal(missions()[0].kind, fixture.mission.kind);
  assert.match(source, /enemy:\['spear','spear','archer','wolf'\]/);
  assert.match(source, /selectedTeam=\['guardian','ranger','druid'\]/);
  assert.deepEqual(fixture.defaultTeam, ['guardian','ranger','druid']);
});

test('board and save legacy contract remain documented', () => {
  assert.match(source, /const N=12, KEY='ironwood_campaign_v1'/);
  assert.match(source, /ver:1/);
  assert.equal(fixture.board.width * fixture.board.height, 144);
  assert.equal(fixture.save.version, 1);
  assert.equal(fixture.save.storageKey, 'ironwood_campaign_v1');
});

test('legacy is not falsely characterized as deterministic', () => {
  assert.ok(source.includes('Math.random('));
  assert.equal(fixture.randomness.deterministic, false);
});
