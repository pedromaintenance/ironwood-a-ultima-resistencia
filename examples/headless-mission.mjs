import { createIronwoodEngine } from '../src/core/index.js';

const game = createIronwoodEngine({ seed: 20261015 });
game.startCampaign({ seed: 20261015 });
game.deployMission();

const first = game.snapshot().actors[0];
const next = game.reachable(first.id).find(p => p.x === 3 && p.y === 10);
if (!next) throw new Error('Expected original corridor is blocked');
game.move(first.id, next.x, next.y);
game.endTurn();

const state = game.snapshot();
console.log(JSON.stringify({
  mission: state.mission + 1,
  round: state.round,
  phase: state.phase,
  boardTiles: state.board.length,
  livingAllies: state.actors.filter(a => a.side === 'ally' && a.hp > 0).length,
  log: state.logs.slice(0, 3),
  rngState: state.rngState,
}, null, 2));
