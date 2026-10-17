// Validation at the untrusted save/import boundary.
// Accepts v1 Canvas saves and new v1 headless snapshots with an optional rngState.
// Does not silently rewrite legacy values or upgrade their version.
import { HEROES, MISSIONS } from './data.js';

const PHASES = new Set(['ready', 'brief', 'player', 'enemy', 'between', 'ending', 'defeat']);
const DIFFICULTIES = new Set(['story', 'normal', 'hard']);
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const integer = (n, min, max) => Number.isInteger(n) && n >= min && n <= max;

export function validateLegacySave(value) {
  const invalid = reason => { throw new TypeError('Invalid Ironwood v1 save: ' + reason); };
  if (!isObject(value) || value.ver !== 1) invalid('unsupported version');
  if (!DIFFICULTIES.has(value.difficulty)) invalid('difficulty');
  if (!PHASES.has(value.phase)) invalid('phase');
  if (!integer(value.mission, 0, MISSIONS.length)) invalid('mission');
  if (!integer(value.round, 1, 100000)) invalid('round');
  if (!Array.isArray(value.team) || value.team.length !== 3 ||
      new Set(value.team).size !== 3 || value.team.some(id => !Object.hasOwn(HEROES, id))) {
    invalid('team');
  }
  if (!isObject(value.upgrades)) invalid('upgrades');
  if (!isObject(value.stats)) invalid('statistics');
  if (!Number.isSafeInteger(value.seed) || value.seed < 0) invalid('seed');
  if (value.rngState !== undefined && !integer(value.rngState, 0, 0xffffffff)) invalid('rngState');
  // Optional new-campaign strategy; missing field must remain valid for all
  // historical Canvas/Phaser v1 saves. Never silently upgrade old saves.
  if (value.aiOrder !== undefined && value.aiOrder !== 'portable-v2') invalid('aiOrder');
  for (const key of ['wins','losses','casts']) {
    if (!integer(value[key], 0, 1000000)) invalid(key);
  }
  if (value.board != null) {
    if (!Array.isArray(value.board) || value.board.length !== 144) invalid('board dimensions');
    for (let index = 0; index < value.board.length; index++) {
      const tile = value.board[index];
      if (!isObject(tile) || tile.x !== index % 12 || tile.y !== Math.floor(index / 12) ||
          typeof tile.base !== 'string') invalid('board tile');
    }
  }
  if (value.actors != null) {
    if (!Array.isArray(value.actors) || value.actors.length > 100) invalid('actors');
    const ids = new Set();
    for (const actor of value.actors) {
      if (!isObject(actor) || typeof actor.id !== 'string' || ids.has(actor.id) ||
          !['ally', 'enemy'].includes(actor.side) || !integer(actor.x, 0, 11) ||
          !integer(actor.y, 0, 11) || !Number.isFinite(actor.hp) ||
          !Number.isFinite(actor.maxhp) || actor.maxhp <= 0) invalid('actor');
      ids.add(actor.id);
    }
  }
  if (['player','enemy'].includes(value.phase) && (!Array.isArray(value.board) || !Array.isArray(value.actors))) {
    invalid('active battle without board/actors');
  }
  return value;
}
