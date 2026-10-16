// Deterministic visual footprint of a spell's immediate affected cells.
// This mirrors the exact grid geometry in spells.js. Environmental propagation
// (fire spread, chain lightning over water) is conditional and called out.
import { bresenhamLine, inBounds } from './navigation.js';

const AREA_1 = new Set(['cleave','volley','frost','web','entangle','rain','grow','purify','faerie']);
const AREA_2 = new Set(['fireball','fog','spikes','sleet']);
const ALLY_RISK = new Set(['fireball','sleet','sunbeam','lightning']);
const CONFIRM = new Set(['fireball','sleet','sunbeam','lightning','volley','cleave']);

export function skillImpact(state, actor, skillId, x, y) {
  const tiles = [];
  const size = 12;
  const put = (px,py) => {
    if (inBounds(px,py,size) && !tiles.some(t=>t.x===px&&t.y===py)) tiles.push({x:px,y:py});
  };
  const square = (cx,cy,r,diamond=false) => {
    for(let yy=cy-r;yy<=cy+r;yy++)for(let xx=cx-r;xx<=cx+r;xx++)
      if(!diamond || Math.abs(xx-cx)+Math.abs(yy-cy)<=r)put(xx,yy);
  };
  let scope='single', note='';
  if (AREA_1.has(skillId)) { square(x,y,1); scope='square3'; }
  else if (AREA_2.has(skillId)) { square(x,y,2); scope='square5'; }
  else if(skillId==='gust') {square(actor.x,actor.y,2,true);scope='diamond';}
  else if(skillId==='icewall') {for(let xx=x-1;xx<=x+1;xx++)put(xx,y);scope='wall';}
  else if(skillId==='rally') {
    for(const unit of state.actors)if(unit.hp>0 && unit.side==='ally'&&Math.abs(unit.x-actor.x)+Math.abs(unit.y-actor.y)<=3)put(unit.x,unit.y);
    scope='allies';
  } else if(skillId==='bless') {
    for(const unit of state.actors)if(unit.hp>0&&unit.side==='ally')put(unit.x,unit.y);
    scope='allies';
  } else if(skillId==='sunbeam'||skillId==='lightning') {
    for(const point of bresenhamLine(actor.x,actor.y,x,y).slice(1)){
      put(point.x,point.y);
      const tile=state.board[point.y*size+point.x];
      if(skillId==='lightning'&&(tile.base==='rock'||tile.wall>0))break;
    }
    scope='line';
    if(skillId==='lightning')note='Descargas podem se propagar pela água além da linha exibida.';
  } else if(['guard','camouflage','self'].includes(skillId))put(actor.x,actor.y);
  else put(x,y);
  if(['fireball','firebolt','spark'].includes(skillId))
    note='O fogo também pode se espalhar em rodadas posteriores.';
  if(['web','entangle'].includes(skillId))
    note='Enraizamento tem componente aleatório, não previsto nesta marcação.';
  const risky=ALLY_RISK.has(skillId);
  const allyIds=risky ? state.actors
    .filter(u=>u.hp>0 && u.side==='ally' && tiles.some(t=>t.x===u.x && t.y===u.y))
    .map(u=>u.id) : [];
  return {tiles,scope,allyIds,confirm:CONFIRM.has(skillId),note};
}
