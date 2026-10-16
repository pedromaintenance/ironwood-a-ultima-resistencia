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

function spellInRange(u,s,x,y){if(s.target==='self')return true;return man(u,{x,y})<=s.range}

function spellAllowed(u,key,x,y){const s=SKILLS[key];if(!s||!u||u.side!=='ally'||u.hp<=0||u.ap<1||u.mp<s.cost)return false;if(!spellInRange(u,s,x,y))return false;const q=unitAt(x,y);if(s.target==='ally'&&(!q||q.side!=='ally'))return false;if(s.target==='enemy'&&(!q||q.side!=='enemy'))return false;if(s.target==='self')return x===u.x&&y===u.y;if(s.effect==='blink'&&(terrainBlocked(cell(x,y))||occupied(x,y,u.id)))return false;if(s.effect==='interact'){let t=cell(x,y);return !!(t?.objective&&!t.cleared)}return true}

function cast(u,key,x,y){let s=SKILLS[key];if(!spellAllowed(u,key,x,y)){toast('Alvo inválido, fora de alcance ou mana/PA insuficientes.');return false}let p={x,y},t=cell(x,y),target=unitAt(x,y);if(s.target!=='self'&&key!=='blink'&&key!=='interact'&&!los(u,p, ['fireball','fog','spikes','entangle','sleet','rain','grow','sunbeam','lightning','volley','faerie','web','earthwall','icewall'].includes(key))){toast('Linha de visão bloqueada.');return false}
 u.ap--;u.mp-=s.cost;G.casts++;log(`${u.name} usa ${s.name}.`);
 switch(s.effect){
 case'bash':damage(target,8,'impacto',u);push(target,u,1);break;
 case'guard':u.guard=3;break;
 case'cleave':aoeDamage(x,y,1,7,'aço',u,{friends:false});break;
 case'rally':for(let a of heroes())if(man(u,a)<=3)a.guard=Math.max(a.guard,2);break;
 case'mark':damage(target,9,'flecha',u);target.marked=3;break;
 case'volley':aoeDamage(x,y,1,6,'flechas',u,{friends:false,structures:true});break;
 case'snare':t.trap=5;break;
 case'camouflage':u.guard=4;break;
 case'firebolt':ign(t,4);if(target)damage(target,6,'fogo',u);hurtStructure(t,6);break;
 case'fireball':aoeDamage(x,y,2,12,'fogo',u);for(let a of coordsArea(x,y,2))ign(a,r(2,4));break;
 case'frost':for(let a of coordsArea(x,y,1))freeze(a);if(target){damage(target,6,'frio',u);target.slowed=2}break;
 case'web':for(let a of coordsArea(x,y,1)){a.web=4;a.vines=0;let f=unitAt(a.x,a.y);if(f&&r(1,3)!==1)f.root=1}break;
 case'fog':for(let a of coordsArea(x,y,2)){a.fog=3;if(a.fire>0)a.steam=2}break;
 case'blink':u.x=x;u.y=y;enterTile(u);break;
 case'entangle':for(let a of coordsArea(x,y,1)){a.vines=4;let f=unitAt(a.x,a.y);if(f&&r(1,3)!==1)f.root=2}break;
 case'spikes':for(let a of coordsArea(x,y,2))a.thorns=4;break;
 case'rain':for(let a of coordsArea(x,y,1))soak(a,true);break;
 case'grow':for(let a of coordsArea(x,y,1)){if(['bones','grass','bush'].includes(a.base)&&!a.objective&&a.wall<=0)a.base=(a.x+a.y)%3===0?'tree':'bush';a.fire=0;a.scorch=0;a.corrupt=0}break;
 case'sleet':for(let a of coordsArea(x,y,2)){freeze(a);let f=unitAt(a.x,a.y);if(f){damage(f,4,'frio',u);f.slowed=2}}break;
 case'purify':for(let a of coordsArea(x,y,1))clearCorrupt(a);break;
 case'heal':heal(target,10);break;
 case'bless':heroes().forEach(a=>a.bless=3);break;
 case'faerie':for(let a of coordsArea(x,y,1)){a.fog=0;a.glow=3;let f=unitAt(a.x,a.y);if(f&&f.side==='enemy')f.marked=3}break;
 case'sunbeam':for(let a of bresenham(u.x,u.y,x,y).slice(1)){let w=cell(a.x,a.y);w.glow=4;w.corrupt=0;w.fog=0;let f=unitAt(a.x,a.y);if(f)damage(f,8,'radiante',u);hurtStructure(w,8)}break;
 case'sanctuary':target.guard=Math.max(target.guard,4);break;
 case'earthwall':if(t.wall>0||t.base==='rock'){t.wall=0;t.base='grass'}else{if(!target&&!t.objective){t.wall=10;t.base='grass'}}break;
 case'lightning':{let chained=false;for(let a of bresenham(u.x,u.y,x,y).slice(1)){let w=cell(a.x,a.y);w.glow=3;let f=unitAt(a.x,a.y);if(f)damage(f,10,'raio',u);hurtStructure(w,10);if((w.wet||w.base==='water')&&!chained){floodElectric(a.x,a.y);chained=true}if(w.base==='rock'||w.wall>0)break}break;}
 case'gust':for(let a of coordsArea(u.x,u.y,2,true)){a.fog=0;a.steam=0;a.web=Math.max(0,a.web-2);let f=unitAt(a.x,a.y);if(f&&f.side==='enemy'){damage(f,4,'trovejante',u);push(f,u,1)}}break;
 case'icewall':for(let a of coordsArea(x,y,1,true).filter(q=>q.y===y)){if(!unitAt(a.x,a.y)&&!a.objective){a.wall=8;a.ice=4;a.base='grass'}}break;
 case'spark':ign(t,6);t.glow=4;if(target)damage(target,5,'fogo',u);break;
 case'mend':heal(target,6);target.guard=Math.max(target.guard,2);break;
 case'interact':if(t.objective==='captive'){t.cleared=true;G.stats.rescued++;log('✦ Um prisioneiro foi libertado.')}else if(t.objective==='shrine')clearCorrupt(t);else if(t.objective==='beacon'){t.cleared=true;log('✦ Um marco ancestral despertou!')}else{u.ap++;u.mp+=s.cost;toast('Este objetivo precisa ser destruído com ataques.');return false}break;
 }
 if(key==='fireball'||key==='firebolt'||key==='spark')G.stats.fires++;
 mode='move';pendingSkill=null;updateObjectives();afterAction();return true
}

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

function enemyAction(a){if(a.hp<=0)return;let list=heroes();if(!list.length)return;let moved=false;for(let turn=0;turn<2&&a.hp>0;turn++){
 let enemies=heroes();if(!enemies.length)break;
 let valid=enemies.filter(h=>man(h,a)<=a.range&&los(a,h));
 if(valid.length){valid.sort((u,v)=>(u.hp/u.maxhp)-(v.hp/v.maxhp));let tar=valid[0];
   if(['witch','boss'].includes(a.kind)&&turn===0&&G.round%2===0){let tc=cell(tar.x,tar.y);if(a.kind==='witch'){tc.vines=3;tar.root=1;damage(tar,3,'sombra');log(`${a.name} conjura raízes sombrias.`)}else{for(let t of coordsArea(tar.x,tar.y,1)){if(random()<.6)ign(t,3);let victim=unitAt(t.x,t.y);if(victim)damage(victim,5,'fogo',a)}log('O Espinho de Sylara incendeia a mata!')}break}
   if(aimTest(a,tar)){damage(tar,a.atk+2+(a.kind==='boss'?2:0),'físico',a);if(a.kind==='shade'&&r(1,3)===1)tar.slowed=2}else log(`${a.name} erra ${tar.name}.`);break
 }
 if(a.root>0||moved)break;
 let candidates=pathsFrom(a);let scored=[];
 for(let [k,obj] of candidates){let x=k%N,y=Math.floor(k/N),t=cell(x,y),md=Math.min(...enemies.map(h=>man({x,y},h))),hasLos=enemies.some(h=>man({x,y},h)<=a.range&&los({x,y},h));let danger=(t.fire?14:0)+(t.charge?12:0)+(t.thorns?7:0)+(t.trap?7:0);let value=md*4+(hasLos?-6:0)+danger+obj.cost*.1+random()*1.7;scored.push({x,y,value,path:obj.path})}
 scored.sort((p,q)=>p.value-q.value);if(scored.length){let next=scored[0];for(let st of next.path){a.x=st.x;a.y=st.y;enterTile(a);if(a.hp<=0||a.root>0)break}moved=true}else break;
 }
}

function enemyTurn(){if(!G||G.phase!=='enemy')return;
 const order=hostiles().sort(()=>random()-.5);for(let a of order){if(a.hp>0)enemyAction(a);if(!heroes().length){defeat();return}}
 worldTick();if(G.phase!=='enemy')return;if(!heroes().length){defeat();return}
 G.round++;if(MISSIONS[G.mission].kind==='survive'&&G.round===4&&G.wave===0){spawnWave(['wolf','archer']);G.wave=1;log('⚠ Uma nova patrulha chega pela borda da mata.')}
 if(MISSIONS[G.mission].kind==='survive'&&G.round===6&&G.wave===1){spawnWave(['spear','wolf']);G.wave=2;log('⚠ Os últimos perseguidores avistam o comboio.')}
 for(let a of heroes()){a.ap=2;a.mp=Math.min(a.maxmp,a.mp+2);if(a.bless>0)a.bless--;if(a.guard>0)a.guard--;if(a.root>0)a.root--;if(a.slowed>0)a.slowed--;if(a.marked>0)a.marked--}
 for(let a of hostiles()){if(a.guard>0)a.guard--;if(a.root>0)a.root--;if(a.slowed>0)a.slowed--;if(a.marked>0)a.marked--}
 G.phase='player';let next=heroes().find(a=>a.ap>0);G.selected=next?.id||G.selected;mode='move';pendingSkill=null;updateObjectives();save();if(G.phase==='player')render()}

function spawnWave(kinds){let occ=new Set(living().map(a=>idx(a.x,a.y)));kinds.forEach(k=>{let p=findFreePoint(1,3,occ);G.actors.push(makeEnemy(k,G.uid++,p.x,p.y))})}

function worldTick(){let ignitions=[];let gale=G.round%4===0?'🌧 Chuva da serra':G.round%4===2?'〰 Ventos de Eldroth':'☁ Tempo estável';G.weather=gale;
 for(let t of G.board){let actor=unitAt(t.x,t.y);
   if(t.fire>0){if(actor){damage(actor,4,'fogo');actor.burn=1}if(t.base==='tree'||t.base==='bush'){if(t.fire<=2){t.base='bones';t.scorch=4;G.stats.trees++}}for(let [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){let tt=cell(t.x+dx,t.y+dy);if(tt&&!tt.wet&&!tt.ice&&['tree','bush','grass','bones'].includes(tt.base)&&random()<(.09+(tt.web? .26:0)))ignitions.push(tt)}t.fire--}
   if(t.ice>0)t.ice--;if(t.wet>0)t.wet--;if(t.web>0)t.web--;if(t.vines>0)t.vines--;if(t.thorns>0)t.thorns--;if(t.fog>0)t.fog--;if(t.steam>0)t.steam--;if(t.charge>0)t.charge--;if(t.glow>0)t.glow--;if(t.trap>0)t.trap--;if(t.scorch>0)t.scorch--;if(t.corrupt>0&&G.round%3===0){if(actor&&actor.side==='ally')damage(actor,2,'corrupção')}
 }
 ignitions.forEach(t=>ign(t,3));if(G.round%4===0){let rainCount=0;for(let t of G.board)if(random()<.28){soak(t);rainCount++}log(`A chuva atingiu ${rainCount} quadrados e reduziu incêndios.`)}else if(G.round%4===2){for(let t of G.board){if(t.fog>0&&random()<.45)t.fog=0;if(t.steam>0)t.steam=0}log('O vento abre clareiras entre as névoas.')}updateObjectives()
}

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
    if (!value || value.ver !== 1 || !Array.isArray(value.team) ||
        value.team.length !== 3 || !Number.isInteger(value.mission) ||
        value.mission < 0 || value.mission > MISSIONS.length) {
      throw new TypeError('Invalid v1 save');
    }
    G = structuredClone(value);
    selectedTeam = [...G.team];
    prng = createSeededRng(G.seed || 1);
    if (Number.isInteger(G.rngState)) prng.setState(G.rngState);
    emit('restored', { mission: G.mission, phase: G.phase });
    return snapshot();
  }
  return {
    startCampaign, deployMission, move, attack, useSkill, endTurn,
    reachable, getOutcome, advanceMission, restoreSave,
    snapshot, drainEvents, getActor: id => structuredClone(getActor(id)),
    lineOfSight: (a,b) => { ensureGame(); return los(a,b); },
  };
}
