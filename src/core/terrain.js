// Environmental tile mutations extracted from the legacy code.
// They modify only the supplied tile; campaign stats/logs remain at the engine boundary.

export function igniteTile(t, intensity = 3) {
  if (!t || t.base === 'water' || t.wet > 0 || t.ice > 0) {
    if (t) {
      t.ice = 0;
      t.wet = Math.max(t.wet, 2);
      t.steam = 3;
      t.fire = 0;
    }
    return false;
  }
  t.web = 0;
  t.vines = 0;
  t.thorns = 0;
  t.fire = Math.max(t.fire, intensity);
  t.glow = 1;
  return true;
}

export function soakTile(t, makePool = false) {
  if (!t) return;
  const hadFire = t.fire > 0;
  t.fire = 0;
  t.wet = Math.max(t.wet, 4);
  if (hadFire) t.steam = Math.max(t.steam, 2);
  if (makePool && t.base === 'grass') t.base = 'water';
}

export function freezeTile(t) {
  if (!t) return;
  t.fire = 0;
  t.steam = 0;
  t.ice = Math.max(t.ice, 3);
  if (t.base === 'water' || t.wet > 0) t.ice = 5;
}
