// Headless Ironwood game rules, extracted from the original Canvas app.
// This transitional module intentionally preserves game formulas and interactions.
// No Canvas, DOM, localStorage, timers, Phaser, or service worker dependencies.
// Next refactor: split combat/terrain/AI modules behind this stable facade.
import { HEROES, MISSIONS, ENEMIES, SKILLS, UPGRADES } from './data.js';
import { createSeededRng } from './rng.js';
import { terrainBlocked as gridBlocked, walkCost as gridCost, reachablePaths, bresenhamLine, lineOfSight, effectiveCover as gridCover } from './navigation.js';
import { igniteTile, soakTile, freezeTile } from './terrain.js';
import { rollToHit, applyDamage, applyHealing } from './combat.js';
import { missionOutcome } from './objectives.js';
import { createEnemySystem } from './ai.js';
import { createSpellSystem } from './spells.js';
import { createWorldSystem } from './environment.js';
import { validateLegacySave } from './save.js';

export const BOARD_SIZE = 12;
export const LEGACY_SAVE_KEY = 'ironwood_campaign_v1';

export function createIronwoodEngine({ seed = 1, onEvent = null } = {}) {
  let G = null;
  let selectedTeam = ['guardian', 'ranger', 'druid'];
  let mode = 'move';
  let pendingSkill = null;
  let prng = createSeededRng(seed);
  const random = () => prng.next();
  const N = BOARD_SIZE;
  const r = (a,b) => Math.floor(random() * (b-a+1)) + a;
  const clamp = (v,lo,hi) => Math.max(lo,Math.min(hi,v));
  const events = [];

const at=(x,y)=>x>=0&&x<N&&y>=0&&y<N;
const idx=(x,y)=>y*N+x;
const cell=(x,y)=>G?.board?.[idx(x,y)];
const man=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const living=()=>G.actors.filter(a=>a.hp>0);
const heroes=()=>living().filter(a=>a.side==='ally');
const hostiles=()=>living().filter(a=>a.side==='enemy');
const unitAt=(x,y)=>living().find(a=>a.x===x&&a.y===y);
const heroById=id=>G.actors.find(a=>a.id===id);
const up=id=>G.upgrades?.[id]||0;
const dice=n=>r(1,n);
  function emit(type, payload = {}) {
    const event = { type, ...payload };
    events.push(event);
    if (typeof onEvent === 'function') onEvent(event);
  }
  function toast(message) { emit('message', { message }); }
  function log(message) {
    if (!G) return;
    G.logs = G.logs || [];
    G.logs.unshift(message);
    G.logs = G.logs.slice(0, 36);
    emit('log', { message });
  }
  function save() {
    if (!G) return;
    G.rngState = prng.getState();
    emit('checkpoint', { mission: G.mission, round: G.round, phase: G.phase });
  }
  function show(view) { emit('view', { view }); }
  function render() { emit('render', { phase: G?.phase }); }
  function renderBetween() { emit('result', { outcome: 'victory', phase: G.phase }); }
  function renderEnding() { emit('result', { outcome: 'campaign-ending', phase: G.phase }); }
  function defeat() {
    if (!G || G.phase === 'defeat') return;
    G.phase = 'defeat';
    G.losses++;
    save();
    emit('result', { outcome: 'defeat', phase: G.phase });
  }

const worldSystem = createWorldSystem({
  getState: () => G, unitAt, damage, cell, random,
  ign, soak, log, updateObjectives,
});

const spellSystem = createSpellSystem({
  getState: () => G, man, unitAt, terrainBlocked, cell, occupied,
  toast, los, log, damage, push, aoeDamage, heroes, coordsArea,
  ign, r, freeze, heal, clearCorrupt, hurtStructure, bresenham,
  floodElectric, soak, enterTile, updateObjectives, afterAction,
  resetCommandMode: () => { mode = 'move'; pendingSkill = null; },
});

const enemySystem = createEnemySystem({
  getState: () => G, heroes, hostiles, man, los, cell, coordsArea, random,
  ign, unitAt, damage, log, aimTest, r, pathsFrom, enterTile,
  N, idx, findFreePoint, makeEnemy, living, worldTick,
  defeat, updateObjectives, save, render,
  resetCommandMode: () => { mode = 'move'; pendingSkill = null; },
});

function goalLabel(kind){return({kill:'Elimine todas as patrulhas',rescue:'Liberte os dois reféns',totem:'Destrua três totens',survive:'Resista por seis rodadas',cleanse:'Purifique três focos de corrupção',beacon:'Ative três marcos ancestrais',boss:'Derrote o Espinho de Sylara'})[kind]}

function makeBoard(mission){let board=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++){
 const p=random(),near=x>=3&&x<=8&&y>=4&&y<=9;
 let base=p<.13?'tree':p<.28?'bush':p<.35?'water':p<.42?'rock':p<.48?'bones':'grass';
 if(near&&p<.16)base='grass';if(y>=9||y<=1)if(random()<.7)base='grass';
 board.push({x,y,base,fire:0,ice:0,wet:base==='water'?9:0,web:0,vines:0,thorns:0,fog:0,steam:0,charge:0,scorch:0,corrupt:0,wall:0,trap:0,glow:0,objective:'',objhp:0,cleared:false,texture:r(0,1000)})
 }return board}

function makeAlly(id,i){let d=HEROES[id],hp=d.hp+5*up('hp')+Math.floor(G.wins/2)*2,mp=d.mp+3*up('mp');return{id:'a'+i,kind:id,side:'ally',name:d.name,glyph:d.glyph,color:d.color,x:[2,5,9][i],y:10,hp,maxhp:hp,mp,maxmp:mp,atk:d.atk+up('power'),armor:d.armor+up('defense'),aim:d.atk+up('focus'),move:d.move+up('forest'),range:d.range,ap:2,guard:0,bless:0,root:0,slowed:0,burn:0,marked:0}}

function makeEnemy(kind,i,x,y){let d=ENEMIES[kind],t=Math.floor(G.mission/3),difficulty=G.difficulty||'normal',hp=Math.max(5,d.hp+t*3+(difficulty==='hard'?5:difficulty==='story'?-3:0));return{id:'e'+i,kind,side:'enemy',name:d.name,glyph:d.glyph,color:d.color,x,y,hp,maxhp:hp,mp:0,maxmp:0,atk:d.atk+t+(difficulty==='hard'?1:difficulty==='story'?-1:0),armor:d.armor+(G.mission===7&&kind==='boss'?1:0),aim:d.atk+1,move:d.move,range:d.range,ap:2,guard:0,bless:0,root:0,slowed:0,burn:0,marked:0}}

function findFreePoint(ymin,ymax,occ,avoid=0){for(let i=0;i<250;i++){let x=r(1,N-2),y=r(ymin,ymax),t=cell(x,y);if(!t||occ.has(idx(x,y)))continue;if(avoid>0&&G.actors?.some(a=>a.side==='ally'&&man(a,{x,y})<avoid))continue;t.base='grass';t.wall=0;occ.add(idx(x,y));return{x,y}}return{x:r(1,N-2),y:r(ymin,ymax)}}

function carveWalkways(){let row=10;for(let x=2;x<=9;x++){let t=cell(x,row);t.base='grass';t.wall=0}for(let y=1;y<=10;y++){let t=cell(5,y);t.base='grass';t.wall=0}let destinations=[...G.actors,...G.board.filter(t=>t.objective)];for(let pt of destinations){for(let x=Math.min(5,pt.x);x<=Math.max(5,pt.x);x++){let t=cell(x,pt.y);t.base='grass';t.wall=0}}}

function deploy(){let m=MISSIONS[G.mission];G.board=makeBoard(G.mission);G.actors=G.team.map(makeAlly);G.round=1;G.logs=[];G.phase='player';G.weather='clear';G.wave=0;G.events=0;G.uid=100;G.savedRound=1;
 for(let a of G.actors){let t=cell(a.x,a.y);t.base='grass';t.wall=0;t.fire=0;t.corrupt=0;t.ice=0}
 let occupied=new Set(G.actors.map(a=>idx(a.x,a.y)));m.enemy.forEach((kind,i)=>{let q=findFreePoint(1,4,occupied,3);G.actors.push(makeEnemy(kind,i,q.x,q.y))});
 const place=(type,count,hp=0)=>{for(let i=0;i<count;i++){let p=findFreePoint(3,8,occupied,2);let t=cell(p.x,p.y);t.objective=type;t.objhp=hp;t.base=type==='totem'?'bones':'grass';t.corrupt=type==='shrine'?5:0;t.cleared=false}};
 if(m.kind==='rescue')place('captive',2);if(m.kind==='totem')place('totem',3,18);if(m.kind==='cleanse')place('shrine',3);if(m.kind==='beacon')place('beacon',3);
 carveWalkways();
 if(G.mission===5){for(let i=0;i<13;i++){let t=G.board[r(12,N*N-26)];if(t?.base==='tree'||t?.base==='bush')t.fire=r(2,4)}}
 if(G.mission===4){for(let i=0;i<15;i++){let t=G.board[r(0,N*N-1)];t.corrupt=5}}
 selectedTeam=[...G.team];G.selected=G.actors[0].id;mode='move';pendingSkill=null;log(`Elara: ${m.desc}`);save();show('battle');render()}

function getSelected(){let u=G?.actors?.find(a=>a.id===G.selected);return u?.hp>0?u:null}

function chooseHero(a){if(a.side!=='ally'||a.hp<=0)return;G.selected=a.id;mode='move';pendingSkill=null;render()}

function terrainBlocked(t) { return gridBlocked(t); }

function occupied(x,y,except){return living().some(a=>a.id!==except&&a.x===x&&a.y===y)}

function walkCost(t) { return gridCost(t); }

function pathsFrom(a) { return reachablePaths(G.board, G.actors, a, N); }

function bresenham(ax, ay, bx, by) { return bresenhamLine(ax, ay, bx, by); }

function los(a, b, ignoreCover = false) { return lineOfSight(G.board, a, b, ignoreCover, N); }

function effectiveCover(t) { return gridCover(t); }

function aimTest(a, b, ignoreCover = false) { return rollToHit(a, b, cell(b.x, b.y), dice(20), ignoreCover); }

function damage(target, n, element = 'physical', caster = null) {
  return applyDamage(target, n, {element, caster, powerUpgrade: up('power'), onLog: log, onBossDefeat: () => {G.stats.boss = true;}});
}

function heal(unit, amount) { return applyHealing(unit, amount, log); }

function push(u,from,steps){if(!u||u.hp<=0)return;let dx=Math.sign(u.x-from.x),dy=Math.sign(u.y-from.y);if(dx===0&&dy===0)dx=1;if(Math.abs(dx)+Math.abs(dy)===2){if(Math.abs(u.x-from.x)>=Math.abs(u.y-from.y))dy=0;else dx=0}for(let i=0;i<steps;i++){let x=u.x+dx,y=u.y+dy;if(!at(x,y)||terrainBlocked(cell(x,y))||occupied(x,y,u.id)){damage(u,2,'impacto');break}u.x=x;u.y=y;enterTile(u)}}

function enterTile(u){let t=cell(u.x,u.y);if(!t||u.hp<=0)return;if(t.fire>0){damage(u,4,'fogo');u.burn=Math.max(1,u.burn)}if(t.thorns>0)damage(u,3,'espinhos');if(t.charge>0){damage(u,4,'eletricidade');t.charge=0}if(t.trap>0){damage(u,4,'armadilha');u.root=1;t.trap=0}if(t.web>0||t.vines>0){if(dice(20)<12)u.root=1}if(t.corrupt>0&&u.side==='ally')damage(u,1,'corrupção')}

function coordsArea(x,y,radius,diamond=false){let arr=[];for(let yy=y-radius;yy<=y+radius;yy++)for(let xx=x-radius;xx<=x+radius;xx++)if(at(xx,yy)&&(!diamond||Math.abs(xx-x)+Math.abs(yy-y)<=radius))arr.push(cell(xx,yy));return arr}

function floodElectric(x,y){let queue=[{x,y}],seen=new Set(),hit=new Set();while(queue.length&&seen.size<70){let p=queue.shift(),k=idx(p.x,p.y);if(seen.has(k))continue;seen.add(k);let t=cell(p.x,p.y);if(!t||!(t.base==='water'||t.wet>0||k===idx(x,y)))continue;t.charge=Math.max(t.charge,2);t.glow=2;let u=unitAt(p.x,p.y);if(u&&!hit.has(u.id)){damage(u,6,'eletricidade');hit.add(u.id);G.stats.shocked++}for(let [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]])if(at(p.x+dx,p.y+dy))queue.push({x:p.x+dx,y:p.y+dy})}}

function ign(t, n = 3) { if (igniteTile(t, n)) G.stats.fires++; }

function soak(t, makePool = false) { soakTile(t, makePool); }

function freeze(t) { freezeTile(t); }

function clearCorrupt(t){if(!t)return;t.corrupt=0;t.vines=0;if(t.objective==='shrine'&&!t.cleared){t.cleared=true;G.stats.rescued++;log('✦ Um foco de corrupção foi purificado.')}}

function hurtStructure(t,amount){if(t.objective==='totem'&&!t.cleared){t.objhp-=amount;if(t.objhp<=0){t.cleared=true;t.objhp=0;log('✦ Um totem de servidão foi destruído!')}}if(t.wall>0){t.wall-=amount;if(t.wall<=0){t.wall=0;t.base='bones'}}if(t.base==='tree'&&amount>=8){t.base='bones';t.scorch=3;G.stats.trees++}}

function aoeDamage(cx,cy,rad,dam,element,caster,{friends=true,structures=true}={}){for(let t of coordsArea(cx,cy,rad)){let u=unitAt(t.x,t.y);if(u&&(friends||u.side!==caster.side))damage(u,dam,element,caster);if(structures)hurtStructure(t,dam)}}

function spellInRange(unit, skill, x, y) { return spellSystem.spellInRange(unit, skill, x, y); }

function spellAllowed(unit, key, x, y) { return spellSystem.spellAllowed(unit, key, x, y); }

function cast(unit, key, x, y) { return spellSystem.cast(unit, key, x, y); }

function basicAttack(a,b){if(!a||!b||a.hp<=0||b.hp<=0||a.ap<1){toast('Sem pontos de ação.');return false}if(man(a,b)>a.range){toast('Fora do alcance do ataque.');return false}if(!los(a,b)){toast('Um obstáculo bloqueia o ataque.');return false}a.ap--;if(aimTest(a,b)){damage(b,a.atk+2+(a.kind==='ranger'?1:0),'físico',a)}else log(`${a.name} erra o ataque contra ${b.name}.`);afterAction();return true}

function attackStructure(a,t){if(a.ap<1||man(a,t)>a.range||!los(a,t)){toast('Aproxime-se da estrutura.');return false}a.ap--;hurtStructure(t,a.atk+4);log(`${a.name} ataca a estrutura.`);afterAction();return true}

function moveUnit(a,to){const paths=pathsFrom(a),p=paths.get(idx(to.x,to.y));if(!p||a.ap<1||a.root>0){toast(a.root?'Raízes impedem o movimento.':'Destino inalcançável ou sem PA.');return false}a.ap--;for(let step of p.path){a.x=step.x;a.y=step.y;enterTile(a);if(a.hp<=0||a.root>0)break}log(`${a.name} avança pela floresta.`);afterAction();return true}

function afterAction(){if(!G)return;let party=heroes();if(!party.length){defeat();return}updateObjectives();if(G.phase!=='player')return;let sel=getSelected();if(!sel||sel.ap<=0){let next=party.find(a=>a.ap>0);if(next)G.selected=next.id}save();render()}

function updateObjectives() {
  if (G.phase !== 'player' && G.phase !== 'enemy') return;
  const outcome = missionOutcome(MISSIONS[G.mission].kind, G.board, G.actors, G.round);
  if (outcome === 'victory') { victory(); return; }
  if (outcome === 'defeat') defeat();
}

function enemyAction(actor) { return enemySystem.enemyAction(actor); }

function enemyTurn() { return enemySystem.enemyTurn(); }

function spawnWave(kinds) { return enemySystem.spawnWave(kinds); }

function worldTick() { return worldSystem.worldTick(); }

function victory(){if(G.phase==='between'||G.phase==='ending')return;G.wins++;log('✓ Operação concluída. A floresta permanece livre por mais uma noite.');if(G.mission===7){G.phase='ending';save();renderEnding();return}G.phase='between';save();renderBetween()}

  function ensureGame() { if (!G) throw new Error('Start a campaign first'); }
  function getActor(id) { ensureGame(); return G.actors?.find(a => a.id === id) || null; }
  function snapshot() { return G ? structuredClone(G) : null; }
  function drainEvents() { return events.splice(0); }

  function startCampaign({ difficulty = 'normal', team = ['guardian','ranger','druid'], seed: campaignSeed = seed } = {}) {
    if (!['story','normal','hard'].includes(difficulty)) throw new RangeError('Invalid difficulty');
    if (!Array.isArray(team) || team.length !== 3 || new Set(team).size !== 3 || team.some(id => !HEROES[id])) {
      throw new RangeError('Select three distinct available heroes');
    }
    prng = createSeededRng(campaignSeed);
    selectedTeam = [...team];
    G = {
      ver: 1, difficulty, mission: 0, team: [...team], upgrades: {},
      wins: 0, losses: 0, casts: 0, round: 1,
      seed: Number(campaignSeed) >>> 0, phase: 'ready', logs: [],
      stats: { fires: 0, trees: 0, shocked: 0, rescued: 0 },
    };
    save();
    emit('campaign-started', { seed: G.seed });
    return snapshot();
  }
  function deployMission() {
    ensureGame();
    if (G.mission < 0 || G.mission >= MISSIONS.length) throw new RangeError('No mission remains');
    if (!['ready','brief','defeat'].includes(G.phase)) throw new Error('Cannot deploy in this phase');
    deploy();
    return snapshot();
  }
  function move(actorId, x, y) {
    ensureGame();
    if (G.phase !== 'player') return false;
    const actor = getActor(actorId);
    if (!actor || actor.side !== 'ally' || actor.hp <= 0) return false;
    return moveUnit(actor, { x, y });
  }
  function attack(actorId, targetId) {
    ensureGame();
    if (G.phase !== 'player') return false;
    const actor = getActor(actorId), target = getActor(targetId);
    if (!actor || !target || actor.side !== 'ally' || target.side !== 'enemy') return false;
    return basicAttack(actor, target);
  }
  function useSkill(actorId, skillId, x, y) {
    ensureGame();
    if (G.phase !== 'player') return false;
    const actor = getActor(actorId);
    if (!actor || actor.side !== 'ally' || !HEROES[actor.kind]?.skills.concat('interact').includes(skillId)) return false;
    return cast(actor, skillId, x, y);
  }
  // Pure observation: no state, RNG or event mutation. Same spellAllowed and
  // spellVisible gates used by cast in src/core/spells.js.
  function previewSkill(actorId, skillId, x, y) {
    ensureGame();
    if (G.phase !== 'player') return { allowed: false, reason: 'phase' };
    const actor = getActor(actorId);
    if (!actor || actor.side !== 'ally' || !HEROES[actor.kind]?.skills.concat('interact').includes(skillId)) {
      return { allowed: false, reason: 'unknown-skill' };
    }
    if (!Number.isInteger(x) || !Number.isInteger(y) || !at(x, y)) {
      return { allowed: false, reason: 'outside-board' };
    }
    if (!spellAllowed(actor, skillId, x, y)) return { allowed: false, reason: 'invalid-target' };
    if (!spellSystem.spellVisible(actor, skillId, x, y)) return { allowed: false, reason: 'blocked-sight' };
    return { allowed: true, reason: 'ready' };
  }
  function endTurn() {
    ensureGame();
    if (G.phase !== 'player') return false;
    G.phase = 'enemy';
    save();
    enemyTurn();
    return true;
  }
  function reachable(actorId) {
    const actor = getActor(actorId);
    if (!actor || actor.hp <= 0) return [];
    return [...pathsFrom(actor).entries()].map(([key, value]) => ({
      x: key % N, y: Math.floor(key / N), cost: value.cost, path: value.path,
    }));
  }
  function getOutcome() {
    ensureGame();
    if (G.phase === 'ending') return 'ending';
    if (G.phase === 'between') return 'victory';
    if (G.phase === 'defeat') return 'defeat';
    return null;
  }
  function advanceMission(upgradeId) {
    ensureGame();
    if (G.phase !== 'between') throw new Error('Victory required before upgrading');
    if (!UPGRADES.find(u => u.id === upgradeId)) throw new RangeError('Unknown upgrade');
    G.upgrades[upgradeId] = (G.upgrades[upgradeId] || 0) + 1;
    G.mission++;
    G.board = null;
    G.actors = null;
    G.phase = 'brief';
    save();
    emit('mission-ready', { mission: G.mission });
    return snapshot();
  }
  function restoreSave(value) {
    validateLegacySave(value);
    G = structuredClone(value);
    selectedTeam = [...G.team];
    prng = createSeededRng(G.seed || 1);
    if (Number.isInteger(G.rngState)) prng.setState(G.rngState);
    emit('restored', { mission: G.mission, phase: G.phase });
    return snapshot();
  }
  return {
    startCampaign, deployMission, move, attack, useSkill, previewSkill, endTurn,
    reachable, getOutcome, advanceMission, restoreSave,
    snapshot, drainEvents, getActor: id => structuredClone(getActor(id)),
    lineOfSight: (a,b) => { ensureGame(); return los(a,b); },
  };
}
