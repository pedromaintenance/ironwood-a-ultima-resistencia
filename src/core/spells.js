// Ironwood spell commands. Rules and spell effects are copied from app.js.
// External game context is injected, keeping the module independent of DOM and Phaser.
import { SKILLS } from './data.js';

export function createSpellSystem({
  getState, man, unitAt, terrainBlocked, cell, occupied,
  toast, los, log, damage, push, aoeDamage, heroes, coordsArea,
  ign, r, freeze, heal, clearCorrupt, hurtStructure, bresenham,
  floodElectric, soak, updateObjectives, afterAction, resetCommandMode,
}) {
function spellInRange(u,s,x,y){if(s.target==='self')return true;return man(u,{x,y})<=s.range}

function spellAllowed(u,key,x,y){const s=SKILLS[key];if(!s||!u||u.side!=='ally'||u.hp<=0||u.ap<1||u.mp<s.cost)return false;if(!spellInRange(u,s,x,y))return false;const q=unitAt(x,y);if(s.target==='ally'&&(!q||q.side!=='ally'))return false;if(s.target==='enemy'&&(!q||q.side!=='enemy'))return false;if(s.target==='self')return x===u.x&&y===u.y;if(s.effect==='blink'&&(terrainBlocked(cell(x,y))||occupied(x,y,u.id)))return false;if(s.effect==='interact'){let t=cell(x,y);return !!(t?.objective&&!t.cleared)}return true}

function cast(u,key,x,y){const G = getState();let s=SKILLS[key];if(!spellAllowed(u,key,x,y)){toast('Alvo inválido, fora de alcance ou mana/PA insuficientes.');return false}let p={x,y},t=cell(x,y),target=unitAt(x,y);if(s.target!=='self'&&key!=='blink'&&key!=='interact'&&!los(u,p, ['fireball','fog','spikes','entangle','sleet','rain','grow','sunbeam','lightning','volley','faerie','web','earthwall','icewall'].includes(key))){toast('Linha de visão bloqueada.');return false}
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
 resetCommandMode();updateObjectives();afterAction();return true
}

  return { spellInRange, spellAllowed, cast };
}
