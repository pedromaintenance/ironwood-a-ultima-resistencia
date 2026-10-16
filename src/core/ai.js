// Enemy AI extracted from the Canvas engine without changing attack/movement formulas.
// All dependencies are injected; the module has no browser globals or campaign singleton.
import { MISSIONS } from './data.js';

export function createEnemySystem({
  getState, heroes, hostiles, man, los, cell, coordsArea, random,
  ign, unitAt, damage, log, aimTest, r, pathsFrom, enterTile,
  N, idx, findFreePoint, makeEnemy, living, worldTick,
  defeat, updateObjectives, save, render, resetCommandMode,
}) {
function enemyAction(a){const G = getState();if(a.hp<=0)return;let list=heroes();if(!list.length)return;let moved=false;for(let turn=0;turn<2&&a.hp>0;turn++){
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

function enemyTurn(){const G = getState();if(!G||G.phase!=='enemy')return;
 const order=hostiles().sort(()=>random()-.5);for(let a of order){if(a.hp>0)enemyAction(a);if(!heroes().length){defeat();return}}
 worldTick();if(G.phase!=='enemy')return;if(!heroes().length){defeat();return}
 G.round++;if(MISSIONS[G.mission].kind==='survive'&&G.round===4&&G.wave===0){spawnWave(['wolf','archer']);G.wave=1;log('⚠ Uma nova patrulha chega pela borda da mata.')}
 if(MISSIONS[G.mission].kind==='survive'&&G.round===6&&G.wave===1){spawnWave(['spear','wolf']);G.wave=2;log('⚠ Os últimos perseguidores avistam o comboio.')}
 for(let a of heroes()){a.ap=2;a.mp=Math.min(a.maxmp,a.mp+2);if(a.bless>0)a.bless--;if(a.guard>0)a.guard--;if(a.root>0)a.root--;if(a.slowed>0)a.slowed--;if(a.marked>0)a.marked--}
 for(let a of hostiles()){if(a.guard>0)a.guard--;if(a.root>0)a.root--;if(a.slowed>0)a.slowed--;if(a.marked>0)a.marked--}
 G.phase='player';let next=heroes().find(a=>a.ap>0);G.selected=next?.id||G.selected;resetCommandMode();updateObjectives();save();if(G.phase==='player')render()}

function spawnWave(kinds){const G = getState();let occ=new Set(living().map(a=>idx(a.x,a.y)));kinds.forEach(k=>{let p=findFreePoint(1,3,occ);G.actors.push(makeEnemy(k,G.uid++,p.x,p.y))})}

  return { enemyAction, enemyTurn, spawnWave };
}
