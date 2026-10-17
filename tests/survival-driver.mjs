// M4g: authentic fourth-mission defense, following three natural victories.
// No restoreSave(), edited actors, invented waves, forced victory or RNG resets.
import assert from 'node:assert/strict';
import { playThirdMission } from './totem-driver.mjs';
import { doAttack } from './playthrough-driver.mjs';

const alive=(s,side)=>s.actors.filter(a=>a.side===side&&a.hp>0);
const dist=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);

export function playFourthMission({seed=1,team=['guardian','ranger','mage'],difficulty='story',maxRounds=12}={}){
  const previous=playThirdMission({seed,team,difficulty,maxRounds:28});
  if(previous.phase!=='between')return {phase:'prior-'+previous.phase,previous,seed};
  const engine=previous.engine;
  engine.advanceMission('hp');
  engine.deployMission();
  const initial=engine.snapshot();
  assert.equal(initial.phase,'player');
  assert.equal(initial.mission,3);
  assert.equal(initial.wins,3);
  assert.equal(initial.round,1);
  assert.equal(initial.wave,0);
  const commands=[],trace=[],waveSpawns=[];
  for(const key of ['move','attack','useSkill','endTurn']){
    const fn=engine[key].bind(engine);
    engine[key]=(...args)=>{
      const was=engine.snapshot();
      const result=fn(...args);
      if(result){
        const updated=engine.snapshot();
        commands.push({command:key,args,checkpoint:updated});
        if(key==='endTurn'){
          const existing=new Set(was.actors.map(a=>a.id));
          waveSpawns.push({fromRound:was.round,toRound:updated.round,
            wave:updated.wave,spawned:updated.actors.filter(a=>!existing.has(a.id))
              .map(a=>({id:a.id,kind:a.kind,side:a.side,x:a.x,y:a.y}))});
        }
      }
      return result;
    };
  }
  let operations=0;
  while(engine.snapshot().phase==='player'&&engine.snapshot().round<=maxRounds&&operations<300){
    const party=alive(engine.snapshot(),'ally');
    for(const previousActor of party)while(engine.snapshot().phase==='player'){
      const state=engine.snapshot(),actor=state.actors.find(a=>a.id===previousActor.id);
      if(!actor||actor.hp<=0||actor.ap<=0)break;
      const foes=alive(state,'enemy'),friends=alive(state,'ally');
      let action=false;
      if(foes.length)action=doAttack(engine,actor,foes,friends);
      if(!action && actor.kind==='guardian'&&actor.guard===0&&
        engine.previewSkill(actor.id,'guard',actor.x,actor.y).allowed)
        action=engine.useSkill(actor.id,'guard',actor.x,actor.y);
      if(!action && actor.kind==='ranger'&&actor.guard===0&&
        engine.previewSkill(actor.id,'camouflage',actor.x,actor.y).allowed)
        action=engine.useSkill(actor.id,'camouflage',actor.x,actor.y);
      // Do not waste AP by advancing into enemies: this mission is survival.
      if(!action)break;
      operations++;
      const now=engine.snapshot();
      trace.push({round:state.round,hero:actor.kind,action:commands.at(-1)?.command,
        allies:alive(now,'ally').length,enemies:alive(now,'enemy').length,
        wave:now.wave,phase:now.phase});
    }
    if(engine.snapshot().phase!=='player')break;
    const was=engine.snapshot();
    assert.equal(engine.endTurn(),true);
    operations++;
    const now=engine.snapshot();
    trace.push({round:was.round,action:'endTurn',nextRound:now.round,
      wave:now.wave,allies:alive(now,'ally').length,
      enemies:alive(now,'enemy').length,phase:now.phase});
    assert.ok(now.round>was.round||now.phase!=='player',
      'enemy turn must advance the round or resolve outcome');
  }
  return {previous,engine,initial,state:engine.snapshot(),
    phase:engine.snapshot().phase,commands,trace,waveSpawns,operations,seed};
}
