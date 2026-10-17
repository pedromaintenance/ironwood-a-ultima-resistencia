// M4j: seventh-operation beacons, after six authentically won missions.
// No restoreSave, forced HP/phase, edited snapshots, injected actors, or RNG resets.
import assert from 'node:assert/strict';
import { playSixthMission } from './ashes-driver.mjs';
import { doAttack } from './playthrough-driver.mjs';

const distance=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
const living=(s,side)=>s.actors.filter(a=>a.side===side&&a.hp>0);
const beacons=s=>s.board.filter(t=>t.objective==='beacon'&&!t.cleared);
const risk=t=>(t.fire?22:0)+(t.charge?14:0)+(t.thorns?12:0)+(t.trap?9:0)+(t.corrupt?5:0)+(t.vines?3:0);

function activate(engine,hero,targets){
  if(hero.ap<1)return false;
  for(const t of [...targets].sort((a,b)=>distance(hero,a)-distance(hero,b)||a.y-b.y||a.x-b.x)){
    if(distance(hero,t)<=1&&engine.previewSkill(hero.id,'interact',t.x,t.y).allowed)
      return engine.useSkill(hero.id,'interact',t.x,t.y);
  }
  return false;
}

function approach(engine,hero,targets,state){
  if(hero.ap<1||hero.root>0||targets.length===0)return false;
  const current=Math.min(...targets.map(t=>Math.max(0,distance(hero,t)-1)));
  const options=engine.reachable(hero.id).map(p=>{
    const d=Math.min(...targets.map(t=>Math.max(0,distance(p,t)-1)));
    const exposed=living(state,'enemy').filter(e=>distance(p,e)<=e.range).length;
    const terrain=p.path.reduce((sum,t)=>sum+risk(state.board[t.y*12+t.x]),0);
    return {...p,d,score:d*10+terrain+exposed*2+p.cost*.2};
  }).sort((a,b)=>a.score-b.score||a.d-b.d||a.cost-b.cost||a.y-b.y||a.x-b.x);
  const best=options[0];
  if(!best||best.d>=current)return false;
  return engine.move(hero.id,best.x,best.y);
}

export function playSeventhMission({
  seed=1,team=['guardian','ranger','mage'],difficulty='story',maxRounds=28,
}={}){
  const sixth=playSixthMission({seed,team,difficulty,maxRounds:36});
  if(sixth.phase!=='between')return {sixth,phase:'prior-'+sixth.phase,seed};
  const engine=sixth.engine;
  engine.advanceMission('hp');
  engine.deployMission();
  const initial=engine.snapshot();
  assert.equal(initial.mission,6);
  assert.equal(initial.wins,6);
  assert.equal(initial.phase,'player');
  assert.equal(beacons(initial).length,3);
  const commands=[],trace=[];
  for(const key of ['move','attack','useSkill','endTurn']){
    const original=engine[key].bind(engine);
    engine[key]=(...args)=>{
      const ok=original(...args);
      if(ok)commands.push({command:key,args,checkpoint:engine.snapshot()});
      return ok;
    };
  }
  let n=0;
  while(engine.snapshot().phase==='player'&&engine.snapshot().round<=maxRounds&&n<500){
    for(const original of living(engine.snapshot(),'ally')){
      while(engine.snapshot().phase==='player'){
        const state=engine.snapshot();
        const actor=state.actors.find(a=>a.id===original.id);
        if(!actor||actor.hp<=0||actor.ap<=0)break;
        const targets=beacons(state),foes=living(state,'enemy'),friends=living(state,'ally');
        if(targets.length===0)break;
        let ok=activate(engine,actor,targets);
        if(!ok)ok=approach(engine,actor,targets,state);
        if(!ok&&foes.length)ok=doAttack(engine,actor,foes,friends);
        if(!ok)break;
        n++;
        const updated=engine.snapshot();
        trace.push({round:state.round,hero:actor.kind,command:commands.at(-1)?.command,
          skill:commands.at(-1)?.command==='useSkill'?commands.at(-1)?.args[1]:null,
          remaining:beacons(updated).length,allies:living(updated,'ally').length,
          foes:living(updated,'enemy').length,phase:updated.phase});
      }
    }
    if(engine.snapshot().phase!=='player')break;
    const round=engine.snapshot().round;
    assert.equal(engine.endTurn(),true);
    n++;
    const updated=engine.snapshot();
    assert.ok(updated.round>round||updated.phase!=='player');
    trace.push({round,command:'endTurn',nextRound:updated.round,
      remaining:beacons(updated).length,phase:updated.phase});
  }
  return {sixth,engine,initial,state:engine.snapshot(),phase:engine.snapshot().phase,
    commands,trace,actions:n,seed};
}
