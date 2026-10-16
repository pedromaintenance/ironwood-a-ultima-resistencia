// Pure grid navigation. No global game state, random numbers or presentation code.
// Formulas copied from the legacy game to preserve exact path and sight behavior.
export const BOARD_SIZE = 12;
export const inBounds = (x, y, size = BOARD_SIZE) => x >= 0 && y >= 0 && x < size && y < size;
export const tileAt = (board, x, y, size = BOARD_SIZE) => inBounds(x, y, size) ? board[y * size + x] : undefined;
export const terrainBlocked = t => !t || t.wall > 0 || t.base === 'tree' || t.base === 'rock';
export const walkCost = t =>
  (t.base === 'water' || t.base === 'bush' || t.vines > 0 || t.web > 0 ||
    t.thorns > 0 || t.ice > 0) ? 2 : 1;

export function reachablePaths(board, actors, unit, size = BOARD_SIZE) {
  const idx = (x, y) => y * size + x;
  const cell = (x, y) => tileAt(board, x, y, size);
  const occupied = (x, y) => actors.some(a =>
    a.hp > 0 && a.id !== unit.id && a.x === x && a.y === y);
  const best = new Map([[idx(unit.x, unit.y), { cost: 0, path: [] }]]);
  const todo = [{ x: unit.x, y: unit.y, cost: 0, path: [] }];
  while (todo.length) {
    todo.sort((u, v) => u.cost - v.cost);
    const q = todo.shift();
    if (q.cost > (best.get(idx(q.x, q.y))?.cost ?? Infinity)) continue;
    for (const [dx, dy] of [[1,0], [-1,0], [0,1], [0,-1]]) {
      const x = q.x + dx, y = q.y + dy, t = cell(x, y);
      if (!t || terrainBlocked(t) || occupied(x, y)) continue;
      const cost = q.cost + walkCost(t);
      if (cost > unit.move - (unit.slowed ? 1 : 0)) continue;
      const k = idx(x, y);
      if (!best.has(k) || best.get(k).cost > cost) {
        const path = [...q.path, { x, y }];
        best.set(k, { cost, path });
        todo.push({ x, y, cost, path });
      }
    }
  }
  best.delete(idx(unit.x, unit.y));
  return best;
}

export function bresenhamLine(ax, ay, bx, by) {
  const out = [], dx = Math.abs(bx - ax), dy = Math.abs(by - ay);
  const sx = ax < bx ? 1 : -1, sy = ay < by ? 1 : -1;
  let e = dx - dy;
  for (;;) {
    out.push({ x: ax, y: ay });
    if (ax === bx && ay === by) break;
    const e2 = e * 2;
    if (e2 > -dy) { e -= dy; ax += sx; }
    if (e2 < dx) { e += dx; ay += sy; }
  }
  return out;
}

export function lineOfSight(board, a, b, ignoreCover = false, size = BOARD_SIZE) {
  const line = bresenhamLine(a.x, a.y, b.x, b.y);
  for (let j = 1; j < line.length - 1; j++) {
    const t = tileAt(board, line[j].x, line[j].y, size);
    if (!t) continue;
    if ((t.base === 'tree' || t.base === 'rock' || t.wall > 0) && !ignoreCover) return false;
    if (t.fog > 0 || t.steam > 0) return false;
  }
  return true;
}
export function effectiveCover(t) {
  if (!t) return 0;
  return (t.base === 'bush' ? 2 : 0) +
    (t.base === 'rock' ? 3 : 0) +
    (t.base === 'tree' ? 3 : 0) +
    (t.fog > 0 ? 2 : 0);
}
