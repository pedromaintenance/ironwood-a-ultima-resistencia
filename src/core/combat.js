// Formulae copied from the original Ironwood; no rendering or global campaign state.
import { effectiveCover } from './navigation.js';

export function rollToHit(attacker, defender, targetTile, roll, ignoreCover = false) {
  const cover = defender.marked ? 0 : effectiveCover(targetTile);
  return roll + attacker.aim + (attacker.bless ? 2 : 0) >=
    9 + defender.armor + (ignoreCover ? 0 : cover);
}

export function applyDamage(target, amount, { element = 'physical', caster = null, powerUpgrade = 0, onLog = () => {}, onBossDefeat = () => {} } = {}) {
  if (!target || target.hp <= 0) return 0;
  let damage = Math.max(1, Math.round(amount) + (caster?.side === 'ally' ? powerUpgrade : 0));
  if (target.guard > 0) damage = Math.max(0, damage - 3);
  target.hp = Math.max(0, target.hp - damage);
  if (damage > 0) onLog(`${target.name} sofre ${damage} ${element === 'physical' ? 'de dano' : `de ${element}`}.`);
  if (target.hp === 0) {
    onLog(`☠ ${target.name} caiu.`);
    if (target.kind === 'boss') onBossDefeat();
  }
  return damage;
}

export function applyHealing(unit, amount, onLog = () => {}) {
  if (!unit || unit.hp <= 0) return 0;
  const healed = Math.min(unit.maxhp - unit.hp, amount);
  unit.hp += healed;
  onLog(`✦ ${unit.name} recupera ${healed} PV.`);
  return healed;
}
