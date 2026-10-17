// M4c end-to-end, fixture-free core playthrough.
// Every action below is a public player command on a freshly deployed battle;
// this test never mutates a snapshot, spawns actors, changes RNG, or forces victory.
import assert from 'node:assert/strict';
import { createIronwoodEngine } from '../src/core/engine.js';

const distance = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
const alive = (s, side) => s.actors.filter(a => a.side === side && a.hp > 0);
const terrainRisk = t => (t.fire ? 20 : 0) + (t.charge ? 16 : 0) +
  (t.thorns ? 9 : 0) + (t.trap ? 9 : 0) + (t.corrupt ? 3 : 0);

function available(engine, actor, key, x, y) {
  return engine.previewSkill(actor.id, key, x, y).allowed;
}

export function doAttack(engine, actor, foes, friends) {
  const sorted = [...foes].sort((a, b) =>
    a.hp - b.hp || distance(actor, a) - distance(actor, b) || a.id.localeCompare(b.id));
  if (actor.kind === 'cleric') {
    for (const friend of friends.filter(f => f.hp <= f.maxhp - 9).sort((a,b) => a.hp - b.hp)) {
      if (available(engine, actor, 'heal', friend.x, friend.y))
        return engine.useSkill(actor.id, 'heal', friend.x, friend.y);
    }
  }
  if (actor.kind === 'mage' && actor.mp >= 4) {
    const options = [];
    for (const enemy of foes) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const x = enemy.x + dx, y = enemy.y + dy;
      if (x < 0 || y < 0 || x > 11 || y > 11 ||
          !available(engine, actor, 'fireball', x, y)) continue;
      const hit = foes.filter(e => Math.max(Math.abs(e.x-x),Math.abs(e.y-y)) <= 2);
      const friendly = friends.filter(f => Math.max(Math.abs(f.x-x),Math.abs(f.y-y)) <= 2);
      if (friendly.length || hit.length < 2) continue;
      options.push({x,y,score:hit.reduce((v,e)=>v+Math.min(12,e.hp),0)});
    }
    options.sort((a,b)=>b.score-a.score);
    if (options.length) return engine.useSkill(actor.id,'fireball',options[0].x,options[0].y);
  }
  if (actor.kind === 'ranger' && actor.mp >= 3) {
    const options = foes.filter(e => available(engine,actor,'volley',e.x,e.y))
      .map(e => ({x:e.x,y:e.y,hits:foes.filter(f => Math.max(Math.abs(f.x-e.x),Math.abs(f.y-e.y))<=1).length}));
    options.sort((a,b)=>b.hits-a.hits);
    if (options[0]?.hits >= 2) return engine.useSkill(actor.id,'volley',options[0].x,options[0].y);
  }
  for (const foe of sorted) {
    const skill = {ranger:'mark',mage:'firebolt',guardian:'bash',runesmith:'lightning',cleric:'sunbeam'}[actor.kind];
    if (skill && available(engine, actor, skill, foe.x, foe.y)) {
      // Avoid long line spells crossing friends.
      if (['lightning','sunbeam'].includes(skill)) continue;
      return engine.useSkill(actor.id,skill,foe.x,foe.y);
    }
    if (distance(actor, foe) <= actor.range && engine.lineOfSight(actor,foe))
      return engine.attack(actor.id,foe.id);
  }
  return false;
}

export function doMove(engine, actor, foes, friends, state) {
  const options = engine.reachable(actor.id);
  const tile = (x,y) => state.board[y*12+x];
  const skillRange = actor.kind === 'ranger' ? 6 : actor.kind === 'mage' ? 5 : actor.range;
  const avoid = actor.kind === 'guardian' ? 1 : actor.kind === 'mage' ? 4 : 3;
  const candidates = options.map(p => {
    const closest = Math.min(...foes.map(f=>distance(p,f)));
    const targetable = foes.some(f => distance(p,f) <= skillRange &&
      engine.lineOfSight(p,f));
    const nearThreats = foes.filter(f => distance(p,f) <= f.range).length;
    const risk = p.path.reduce((s,point)=>s+terrainRisk(tile(point.x,point.y)),0);
    return {...p,score: (targetable ? -32 : 0) + closest * 2 +
      Math.max(0,avoid-closest)*3 + nearThreats*2 + risk +
      (p.cost / Math.max(1,actor.move))};
  });
  candidates.sort((a,b)=>a.score-b.score || a.y-b.y || a.x-b.x);
  const chosen = candidates[0];
  if (!chosen) return false;
  // Only spend AP if it actually improves positioning or opens a new shot.
  const currentMin = Math.min(...foes.map(f=>distance(actor,f)));
  if (chosen.score > currentMin*2 + 2) return false;
  return engine.move(actor.id,chosen.x,chosen.y);
}

export function playFreshMission({seed,team,difficulty,maxRounds=35}) {
  const engine = createIronwoodEngine({seed});
  engine.startCampaign({seed,team,difficulty});
  engine.deployMission();
  // Collect authenticated player commands and immutable-after-command snapshots
  // so Chromium can replay the exact same path through the public UI.
  const commands = [];
  for (const key of ['move','attack','useSkill','endTurn']) {
    const original = engine[key].bind(engine);
    engine[key] = (...args) => {
      const done = original(...args);
      if (done) commands.push({ command:key, args, checkpoint:engine.snapshot() });
      return done;
    };
  }
  const trace = [];
  let count=0;
  while (engine.snapshot().phase === 'player' && engine.snapshot().round <= maxRounds && count < 450) {
    let previous = engine.snapshot();
    for (const original of alive(previous,'ally')) {
      while (engine.snapshot().phase === 'player') {
        const state = engine.snapshot();
        const actor = state.actors.find(a=>a.id===original.id);
        if (!actor || actor.hp<=0 || actor.ap<=0) break;
        const foes = alive(state,'enemy'), friends=alive(state,'ally');
        if (!foes.length) break;
        const before = engine.snapshot();
        let action = doAttack(engine,actor,foes,friends);
        if (!action) action = doMove(engine,actor,foes,friends,state);
        if (!action) break;
        count++;
        const after = engine.snapshot();
        assert.ok(after.rngState >= 0);
        trace.push({
          round:before.round,actor:actor.kind,
          from:[actor.x,actor.y],to:[after.actors.find(a=>a.id===actor.id)?.x,after.actors.find(a=>a.id===actor.id)?.y],
          ap:actor.ap,foes:alive(after,'enemy').length,phase:after.phase
        });
      }
    }
    if (engine.snapshot().phase !== 'player') break;
    const round = engine.snapshot().round;
    assert.equal(engine.endTurn(),true);
    count++;
    trace.push({round,command:'endTurn',phase:engine.snapshot().phase});
    const next = engine.snapshot();
    assert.ok(next.round > round || next.phase !== 'player','time must advance or battle must end');
    previous=next;
  }
  const state=engine.snapshot();
  return {engine,state,trace,commands,count,seed,team,difficulty};
}
