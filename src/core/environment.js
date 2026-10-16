// Forest weather and status duration evolution, extracted from the legacy worldTick.
// Explicit adapters keep UI, persistence and campaign state outside this module.
export function createWorldSystem({
  getState, unitAt, damage, cell, random,
  ign, soak, log, updateObjectives,
}) {
function worldTick(){ const G = getState();let ignitions=[];let gale=G.round%4===0?'🌧 Chuva da serra':G.round%4===2?'〰 Ventos de Eldroth':'☁ Tempo estável';G.weather=gale;
 for(let t of G.board){let actor=unitAt(t.x,t.y);
   if(t.fire>0){if(actor){damage(actor,4,'fogo');actor.burn=1}if(t.base==='tree'||t.base==='bush'){if(t.fire<=2){t.base='bones';t.scorch=4;G.stats.trees++}}for(let [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){let tt=cell(t.x+dx,t.y+dy);if(tt&&!tt.wet&&!tt.ice&&['tree','bush','grass','bones'].includes(tt.base)&&random()<(.09+(tt.web? .26:0)))ignitions.push(tt)}t.fire--}
   if(t.ice>0)t.ice--;if(t.wet>0)t.wet--;if(t.web>0)t.web--;if(t.vines>0)t.vines--;if(t.thorns>0)t.thorns--;if(t.fog>0)t.fog--;if(t.steam>0)t.steam--;if(t.charge>0)t.charge--;if(t.glow>0)t.glow--;if(t.trap>0)t.trap--;if(t.scorch>0)t.scorch--;if(t.corrupt>0&&G.round%3===0){if(actor&&actor.side==='ally')damage(actor,2,'corrupção')}
 }
 ignitions.forEach(t=>ign(t,3));if(G.round%4===0){let rainCount=0;for(let t of G.board)if(random()<.28){soak(t);rainCount++}log(`A chuva atingiu ${rainCount} quadrados e reduziu incêndios.`)}else if(G.round%4===2){for(let t of G.board){if(t.fog>0&&random()<.45)t.fog=0;if(t.steam>0)t.steam=0}log('O vento abre clareiras entre as névoas.')}updateObjectives()
}

  return { worldTick };
}
