// M4i: six real mission wins through the public engine, no state injection.
// The mission itself is a 'kill all' scenario with terrain fires at deployment.
import assert from 'node:assert/strict';
import { playFifthMission } from './cleanse-driver.mjs';
import { doAttack, doMove } from './playthrough-driver.mjs';

const alive=(state,side)=>state.actors.filter(a=>a.side===side&&a.hp>0);
const fireTiles=state=>state.board.filter(t=>t.fire>0);
const safe=(s,actor)=>s.board[actor.y*12+actor.x];

export function playSixthMission({
  seed=1,team=['guardian','ranger','mage'],difficulty='story',maxRounds=36,
}={}){
  const fifth=playFifthMission({seed,team,difficulty,maxRounds:32});
  if(fifth.phase!=='between')return {fifth,phase:'prior-'+fifth.phase,seed};
  const engine=fifth.engine;
  engine.advanceMission('power');
  engine.deployMission();
  const initial=engine.snapshot();
  assert.equal(initial.mission,5);
  assert.equal(initial.wins,5);
  assert.equal(initial.phase,'player');
  assert.equal(alive(initial,'enemy').length,7);
  const commands=[],trace=[];
  for(const key of ['move','attack','useSkill','endTurn']){
    const original=engine[key].bind(engine);
    engine[key]=(...args)=>{
      const done=original(...args);
      if(done)commands.push({command:key,args,checkpoint:engine.snapshot()});
      return done;
    };
  }
  let actions=0;
  while(engine.snapshot().phase==='player'&&engine.snapshot().round<=maxRounds&&actions<560){
    const party=alive(engine.snapshot(),'ally');
    for(const previous of party){
      while(engine.snapshot().phase==='player'){
        const state=engine.snapshot(),actor=state.actors.find(a=>a.id===previous.id);
        if(!actor||actor.hp<=0||actor.ap<=0)break;
        const foes=alive(state,'enemy'),friends=alive(state,'ally');
        if(!foes.length)break;
        let action=doAttack(engine,actor,foes,friends);
        if(!action)action=doMove(engine,actor,foes,friends,state);
        if(!action&&actor.kind==='guardian'&&actor.guard===0&&
          engine.previewSkill(actor.id,'guard',actor.x,actor.y).allowed)
          action=engine.useSkill(actor.id,'guard',actor.x,actor.y);
        if(!action)break;
        actions++;
        const now=engine.snapshot();
        trace.push({round:state.round,actor:actor.kind,
          command:commands.at(-1)?.command,skill:commands.at(-1)?.command==='useSkill'?commands.at(-1)?.args[1]:null,
          foes:alive(now,'enemy').length,allies:alive(now,'ally').length,
          burning:fireTiles(now).length,phase:now.phase});
      }
    }
    if(engine.snapshot().phase!=='player')break;
    const previous=engine.snapshot();
    assert.equal(engine.endTurn(),true);
    actions++;
    const next=engine.snapshot();
    trace.push({round:previous.round,command:'endTurn',nextRound:next.round,
      burning:fireTiles(next).length,foes:alive(next,'enemy').length,
      allies:alive(next,'ally').length,phase:next.phase});
    assert.ok(next.round>previous.round||next.phase!=='player');
  }
  return {fifth,engine,initial,state:engine.snapshot(),commands,trace,
    phase:engine.snapshot().phase,actions,seed};
}
