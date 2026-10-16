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

// Read-only mission progress using precisely the same goal categories as missionOutcome.
// It never mutates snapshots, consumes RNG or resolves a turn.
export function missionProgress(kind, board = [], actors = [], round = 1, phase = 'player') {
  const all = Array.isArray(actors) ? actors : [];
  const tiles = Array.isArray(board) ? board : [];
  const names = {
    kill: 'Expulsar a patrulha',
    rescue: 'Libertar os prisioneiros',
    totem: 'Destruir os totens',
    survive: 'Proteger a passagem por 6 rodadas',
    cleanse: 'Purificar os focos',
    beacon: 'Reativar os marcos',
    boss: 'Derrotar o Espinho de Sylara',
  };
  let total = 0, completed = 0, detail = '';
  if (kind === 'kill') {
    const enemies = all.filter(a => a.side === 'enemy');
    total = enemies.length;
    completed = enemies.filter(a => a.hp <= 0).length;
    detail = `${Math.max(0, total - completed)} inimigo(s) restante(s)`;
  } else if (kind === 'boss') {
    const boss = all.find(a => a.side === 'enemy' && a.kind === 'boss');
    total = Math.max(1, boss?.maxhp || 1);
    completed = Math.min(total, Math.max(0, total - Math.max(0, boss?.hp || 0)));
    detail = boss ? `Espinho: ${Math.max(0, boss.hp)}/${total} PV` : 'Campeã derrotada';
  } else if (kind === 'survive') {
    total = 6;
    completed = Math.min(total, Math.max(0, (Number(round) || 1) - 1));
    detail = `${Math.min(Math.max(1, round), 6)}ª de 6 rodadas`;
  } else {
    const objectiveType = { rescue: 'captive', totem: 'totem', cleanse: 'shrine', beacon: 'beacon' }[kind];
    const goals = tiles.filter(t => t.objective === objectiveType);
    total = goals.length;
    completed = goals.filter(t => t.cleared).length;
    detail = `${completed}/${total} objetivo(s) concluído(s)`;
  }
  const status = ['between', 'ending'].includes(phase) ? 'victory' :
    phase === 'defeat' ? 'defeat' : 'in-progress';
  return {
    label: names[kind] || 'Concluir missão',
    kind, total, completed, remaining: Math.max(0, total - completed),
    detail, status,
  };
}
