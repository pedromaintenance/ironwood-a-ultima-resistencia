// M4h: fifth operation after four authentic victories, no save injection.
import assert from 'node:assert/strict';
import { playFourthMission } from './survival-driver.mjs';
import { doAttack } from './playthrough-driver.mjs';

const man=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
const near=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));
const living=(s,side)=>s.actors.filter(a=>a.side===side&&a.hp>0);
const pending=s=>s.board.filter(t=>t.objective==='shrine'&&!t.cleared);
const hazard=t=>(t.fire?26:0)+(t.charge?16:0)+(t.thorns?12:0)+(t.trap?10:0)+(t.corrupt?5:0)+(t.vines?3:0);

function cleanse(engine,actor,goals){
  if(actor.ap<1||!goals.length)return false;
  if(actor.kind==='druid'&&actor.mp>=2){
    const choices=[];
    for(const g of goals)for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      const x=g.x+dx,y=g.y+dy;
      if(x<0||y<0||x>11||y>11||!engine.previewSkill(actor.id,'purify',x,y).allowed)continue;
      const n=goals.filter(t=>near(t,{x,y})<=1).length;
      choices.push({x,y,n,range:man(actor,{x,y})});
    }
    choices.sort((a,b)=>b.n-a.n||a.range-b.range||a.y-b.y||a.x-b.x);
    if(choices[0])return engine.useSkill(actor.id,'purify',choices[0].x,choices[0].y);
  }
  const adj=goals.filter(t=>man(t,actor)<=1).sort((a,b)=>a.y-b.y||a.x-b.x)[0];
  return adj?engine.useSkill(actor.id,'interact',adj.x,adj.y):false;
}
function advance(engine,actor,goals,state){
  if(actor.ap<1||actor.root>0||!goals.length)return false;
  const range=actor.kind==='druid'&&actor.mp>=2?4:1;
  const current=Math.min(...goals.map(g=>Math.max(0,man(actor,g)-range)));
  const options=engine.reachable(actor.id).map(p=>{
    const d=Math.min(...goals.map(g=>Math.max(0,man(p,g)-range)));
    const tileCost=p.path.reduce((s,t)=>s+hazard(state.board[t.y*12+t.x]),0);
    const nearby=living(state,'enemy').filter(e=>man(e,p)<=e.range).length;
    return {...p,d,score:d*10+tileCost+nearby*2+p.cost*.2};
  }).sort((a,b)=>a.score-b.score||a.cost-b.cost||a.y-b.y||a.x-b.x);
  const best=options[0];
  if(!best||best.d>=current)return false;
  return engine.move(actor.id,best.x,best.y);
}

export function playFifthMission({seed=1,team=['guardian','ranger','mage'],difficulty='story',maxRounds=32}={}){
  const fourth=playFourthMission({seed,team,difficulty,maxRounds:12});
  if(fourth.phase!=='between')return {fourth,phase:'prior-'+fourth.phase,seed};
  const engine=fourth.engine;
  engine.advanceMission('mp');
  engine.deployMission();
  const initial=engine.snapshot();
  assert.equal(initial.mission,4);
  assert.equal(initial.wins,4);
  assert.equal(pending(initial).length,3);
  const commands=[],trace=[];
  for(const command of ['move','attack','useSkill','endTurn']){
    const original=engine[command].bind(engine);
    engine[command]=(...args)=>{
      const ok=original(...args);
      if(ok)commands.push({command,args,checkpoint:engine.snapshot()});
      return ok;
    };
  }
  let count=0;
  while(engine.snapshot().phase==='player'&&engine.snapshot().round<=maxRounds&&count<450){
    for(const member of living(engine.snapshot(),'ally')){
      while(engine.snapshot().phase==='player'){
        const before=engine.snapshot(),actor=before.actors.find(a=>a.id===member.id);
        if(!actor||actor.ap<=0||actor.hp<=0)break;
        const goals=pending(before);
        if(!goals.length)break;
        const foes=living(before,'enemy'),friends=living(before,'ally');
        let ok=cleanse(engine,actor,goals);
        if(!ok)ok=advance(engine,actor,goals,before);
        if(!ok&&foes.length)ok=doAttack(engine,actor,foes,friends);
        if(!ok)break;
        count++;
        const after=engine.snapshot();
        trace.push({round:before.round,hero:actor.kind,command:commands.at(-1)?.command,
          skill:commands.at(-1)?.args?.[1],remaining:pending(after).length,
          rescued:after.stats.rescued,allies:living(after,'ally').length,
          phase:after.phase});
      }
    }
    if(engine.snapshot().phase!=='player')break;
    const round=engine.snapshot().round;
    assert.equal(engine.endTurn(),true);
    count++;
    const after=engine.snapshot();
    assert.ok(after.round>round||after.phase!=='player');
  }
  return {fourth,engine,initial,state:engine.snapshot(),phase:engine.snapshot().phase,
    trace,commands,count,seed};
}
