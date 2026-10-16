// Result resolution independent of the interface and campaign's global variables.
export function missionOutcome(kind, board, actors, round) {
  const living = actors.filter(actor => actor.hp > 0);
  const enemies = living.filter(actor => actor.side === 'enemy');
  const allies = living.filter(actor => actor.side === 'ally');
  const pending = (board || []).filter(tile => tile.objective && !tile.cleared);

  const complete =
    (kind === 'kill' && enemies.length === 0) ||
    (kind === 'boss' && !enemies.some(actor => actor.kind === 'boss')) ||
    (['rescue', 'totem', 'cleanse', 'beacon'].includes(kind) && pending.length === 0) ||
    (kind === 'survive' && round > 6);

  // Legacy behaviour deliberately checks victory before annihilation.
  if (complete) return 'victory';
  if (allies.length === 0) return 'defeat';
  return null;
}
