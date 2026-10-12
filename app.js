'use strict';
/* A Última Resistência de Ironwood. Sistema original inspirado em magias e conceitos do D&D 5e;
   ações, distâncias, dano e interações são adaptações, não reprodução das regras oficiais. */
const N=12, KEY='ironwood_campaign_v1', $=id=>document.getElementById(id);
const HEROES={
 guardian:{name:'Morna',role:'Sentinela de Thargrid',glyph:'◆',color:'#dfb67e',hp:32,mp:4,atk:5,armor:4,move:3,range:1,skills:['bash','guard','cleave','rally']},
 ranger:{name:'Arven',role:'Patrulheiro de Ironwood',glyph:'➶',color:'#b0daa2',hp:24,mp:9,atk:6,armor:2,move:4,range:5,skills:['mark','volley','snare','camouflage']},
 mage:{name:'Vaelis',role:'Arcanista dos Ossos',glyph:'✧',color:'#b9b6fa',hp:20,mp:16,atk:3,armor:1,move:3,range:3,skills:['firebolt','fireball','frost','web','fog','blink']},
 druid:{name:'Tília',role:'Druida da Resistência',glyph:'❦',color:'#a7d9a3',hp:25,mp:15,atk:4,armor:2,move:3,range:3,skills:['entangle','spikes','rain','grow','sleet','purify']},
 cleric:{name:'Dara',role:'Clériga da Aurora',glyph:'✶',color:'#f6d994',hp:26,mp:14,atk:3,armor:2,move:3,range:3,skills:['heal','bless','faerie','sunbeam','sanctuary']},
 runesmith:{name:'Branik',role:'Ferreiro Rúnico',glyph:'⬡',color:'#e4aaa1',hp:28,mp:12,atk:4,armor:3,move:3,range:2,skills:['earthwall','lightning','gust','icewall','spark','mend']}
};
const MISSIONS=[
 {title:'A Trilha Fechada',act:'ATO I · OS REFUGIADOS',kind:'kill',desc:'Uma patrulha shadow fey bloqueou o caminho entre Ironwood e o Rio Ancestral. Expulse os ocupantes sem sacrificar o refúgio.',tip:'Use arbustos como cobertura. Fogo destrói árvores, mas também cria corredores.',enemy:['spear','spear','archer','wolf']},
 {title:'Os Nomes dos Desaparecidos',act:'ATO I · OS REFUGIADOS',kind:'rescue',desc:'Famílias capturadas foram deixadas como isca numa floresta de névoa. Alcance dois prisioneiros e liberte-os antes que a guarda os encontre.',tip:'Para libertar um prisioneiro, aproxime-se e use Interagir. Névoa bloqueia a linha de visão.',enemy:['spear','archer','archer','wolf','witch']},
 {title:'Totens da Servidão',act:'ATO II · GUERRA DE RAÍZES',kind:'totem',desc:'Três totens de ossos perpetuam o medo nas trilhas. Destrua os totens; os guardas são um obstáculo, não o objetivo.',tip:'Ataques e magias também atingem estruturas. Use Bola de Fogo ou Relâmpago para acertar vários alvos.',enemy:['spear','spear','archer','witch','wolf']},
 {title:'A Noite Mais Longa',act:'ATO II · GUERRA DE RAÍZES',kind:'survive',desc:'Ironwood abriu passagem aos refugiados. Segure o corredor durante seis rodadas enquanto o último comboio atravessa a floresta.',tip:'Enraize inimigos, erga muros e use terreno difícil: nem toda vitória depende de eliminar o inimigo.',enemy:['wolf','spear','spear','archer','witch']},
 {title:'A Seiva Corrompida',act:'ATO III · O CORAÇÃO FERIDO',kind:'cleanse',desc:'A feitiçaria de Lady Sylara contamina as árvores. Purifique três focos de corrupção antes que suas raízes engulam a trilha.',tip:'Interagir purifica um foco adjacente. A magia Purificar também limpa focos à distância.',enemy:['witch','spear','archer','wolf','wolf','shade']},
 {title:'A Marcha das Cinzas',act:'ATO III · O CORAÇÃO FERIDO',kind:'kill',desc:'Colunas de soldados avançam sob cobertura de um incêndio controlado. A própria mata é a primeira vítima da campanha.',tip:'Criar Água interrompe incêndios. Congele poças para criar obstáculos e eletrifique água contra grupos.',enemy:['spear','spear','spear','archer','archer','witch','shade']},
 {title:'Os Faróis do Crepúsculo',act:'ATO IV · CONTRA A CORTE',kind:'beacon',desc:'Reative os três marcos de sinalização ancestral que ligam Ironwood às forças de Thargrid. Sem eles, os aliados atacarão às cegas.',tip:'Use Interagir ao lado dos marcos. Se uma árvore bloquear o caminho, o fogo ou a terra podem mudar a rota.',enemy:['spear','archer','archer','witch','shade','spear']},
 {title:'O Espinho da Rainha',act:'ATO IV · CONTRA A CORTE',kind:'boss',desc:'A campeã de Sylara Nightwhisper penetrou no bosque sagrado. Vencê-la não derrubará a Corte, mas provará que Ironwood não se ajoelhou.',tip:'A campeã manipula raízes e fogo. Molhe as áreas de combate, use coberturas e proteja os membros frágeis.',enemy:['boss','spear','spear','archer','witch','shade']}
];
const ENEMIES={
 spear:{name:'Lanceiro da Corte',glyph:'♠',hp:14,atk:4,armor:2,range:1,move:3,color:'#db82a1'},
 archer:{name:'Arqueiro Sombreado',glyph:'➷',hp:11,atk:4,armor:1,range:5,move:3,color:'#d68e9c'},
 wolf:{name:'Lobo de Eldroth',glyph:'✶',hp:10,atk:4,armor:0,range:1,move:5,color:'#bb87a0'},
 witch:{name:'Tecelã da Corte',glyph:'✺',hp:13,atk:4,armor:1,range:4,move:3,color:'#e2a1cf'},
 shade:{name:'Sombra de Vandar',glyph:'◈',hp:13,atk:5,armor:1,range:1,move:4,color:'#c8a0ea'},
 boss:{name:'Espinho de Sylara',glyph:'♛',hp:52,atk:6,armor:4,range:5,move:3,color:'#f2a3bc'}
};
const SKILLS={
 bash:{name:'Golpe de Escudo',cost:1,range:1,target:'enemy',desc:'Dano e empurrão de 1 casa.',effect:'bash'},
 guard:{name:'Guarda de Ferro',cost:1,range:0,target:'self',desc:'Recebe proteção por 2 rodadas.',effect:'guard'},
 cleave:{name:'Arco de Aço',cost:2,range:1,target:'tile',desc:'Atinge inimigos em 3×3.',effect:'cleave'},
 rally:{name:'Grito de Resistência',cost:2,range:0,target:'self',desc:'Aliados próximos ganham escudo.',effect:'rally'},
 mark:{name:'Disparo Marcado',cost:2,range:6,target:'enemy',desc:'Dano e revela a presa.',effect:'mark'},
 volley:{name:'Chuva de Flechas',cost:3,range:5,target:'tile',desc:'Dano em 3×3, perfura arbustos.',effect:'volley'},
 snare:{name:'Armadilha de Caça',cost:2,range:4,target:'tile',desc:'Arma armadilha num quadrado.',effect:'snare'},
 camouflage:{name:'Manto da Folhagem',cost:2,range:0,target:'self',desc:'Ganha proteção entre árvores.',effect:'camouflage'},
 firebolt:{name:'Raio de Fogo',cost:1,range:5,target:'tile',desc:'Incendeia um quadrado e fere ocupantes.',effect:'firebolt'},
 fireball:{name:'Bola de Fogo',cost:4,range:5,target:'tile',desc:'Explosão 5×5: queima tudo, inclusive aliados.',effect:'fireball'},
 frost:{name:'Raio de Gelo',cost:2,range:5,target:'tile',desc:'Congela água e reduz movimento.',effect:'frost'},
 web:{name:'Teia',cost:2,range:5,target:'tile',desc:'3×3 de teias inflamáveis.',effect:'web'},
 fog:{name:'Névoa Obscurecente',cost:2,range:5,target:'tile',desc:'Névoa 5×5 bloqueia linha de visão.',effect:'fog'},
 blink:{name:'Passo Nebuloso',cost:2,range:5,target:'tile',desc:'Teletransporte para quadrado livre.',effect:'blink'},
 entangle:{name:'Emaranhar',cost:2,range:5,target:'tile',desc:'Raízes prendem quem estiver em 3×3.',effect:'entangle'},
 spikes:{name:'Crescer Espinhos',cost:3,range:5,target:'tile',desc:'5×5 de espinhos: pisar causa dano.',effect:'spikes'},
 rain:{name:'Criar Água',cost:2,range:5,target:'tile',desc:'Molha 3×3, apaga fogo e forma poças.',effect:'rain'},
 grow:{name:'Crescer Plantas',cost:2,range:4,target:'tile',desc:'Restaura árvores e arbustos no terreno.',effect:'grow'},
 sleet:{name:'Nevasca',cost:4,range:5,target:'tile',desc:'Congela e cobre de gelo 5×5.',effect:'sleet'},
 purify:{name:'Purificar',cost:2,range:4,target:'tile',desc:'Purifica foco ou dissolve corrupção.',effect:'purify'},
 heal:{name:'Palavra Curativa',cost:2,range:4,target:'ally',desc:'Recupera até 10 PV de um aliado.',effect:'heal'},
 bless:{name:'Bênção',cost:2,range:0,target:'self',desc:'Aumenta precisão de todo o grupo.',effect:'bless'},
 faerie:{name:'Fogo das Fadas',cost:2,range:5,target:'tile',desc:'Revela inimigos e nega cobertura.',effect:'faerie'},
 sunbeam:{name:'Raio Solar',cost:3,range:5,target:'tile',desc:'Linha de luz atravessa a floresta.',effect:'sunbeam'},
 sanctuary:{name:'Santuário',cost:2,range:4,target:'ally',desc:'Barreira que absorve danos.',effect:'sanctuary'},
 earthwall:{name:'Moldar Terra',cost:2,range:4,target:'tile',desc:'Ergue ou derruba rochas, um quadrado.',effect:'earthwall'},
 lightning:{name:'Relâmpago',cost:3,range:5,target:'tile',desc:'Linha elétrica; água propaga descarga.',effect:'lightning'},
 gust:{name:'Onda Trovejante',cost:2,range:0,target:'self',desc:'Empurra inimigos; dissipa névoa.',effect:'gust'},
 icewall:{name:'Muralha de Gelo',cost:3,range:4,target:'tile',desc:'Ergue três obstáculos quebráveis.',effect:'icewall'},
 spark:{name:'Runa de Brasas',cost:2,range:4,target:'tile',desc:'Marca quadrado com incêndio duradouro.',effect:'spark'},
 mend:{name:'Runa Reparadora',cost:2,range:4,target:'ally',desc:'Cura 6 PV e reforça armadura.',effect:'mend'},
 interact:{name:'Interagir',cost:0,range:1,target:'tile',desc:'Resgata, purifica ou ativa um objetivo.',effect:'interact'}
};
const UPGRADES=[
 {id:'hp',name:'Reforços de Thargrid',desc:'+5 PV máximos para a companhia.'},
 {id:'mp',name:'Reserva de Cristais',desc:'+3 mana máxima para cada aliado.'},
 {id:'power',name:'Runa de Golzdov',desc:'+1 dano em ataques e magias ofensivas.'},
 {id:'defense',name:'Escudos de Ironwood',desc:'+1 armadura de cada combatente.'},
 {id:'forest',name:'Filhos da Mata',desc:'+1 deslocamento para cada aliado.'},
 {id:'focus',name:'Disciplina dos Sábios',desc:'+1 precisão para todos os ataques.'}
];
const glyphs={grass:'',bush:'',tree:'',water:'',rock:'',bones:''};
let G=null, selectedTeam=['guardian','ranger','druid'], mode='move', pendingSkill=null, reachable=new Map(), firstTap=true;
const r=(a,b)=>Math.floor(Math.random()*(b-a+1))+a, clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
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
function show(which){document.querySelectorAll('.view').forEach(v=>v.classList.toggle('hidden',v.id!==which));window.scrollTo(0,0)}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.remove('hidden');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.add('hidden'),2600)}
function log(msg){if(!G)return;G.logs=G.logs||[];G.logs.unshift(msg);G.logs=G.logs.slice(0,36)}
function save(){try{if(G)localStorage.setItem(KEY,JSON.stringify(G))}catch(e){console.warn('Salvamento indisponível',e)}}
function load(){try{const q=JSON.parse(localStorage.getItem(KEY));if(q&&q.ver===1&&q.mission>=0&&q.mission<=8)return q}catch(e){}return null}
function reset(){G=null;localStorage.removeItem(KEY)}
function setHeader(){let q=load();$('continue').style.display=q?'block':'none';$('saveInfo').textContent=q?`Campanha salva • missão ${Math.min(8,q.mission+1)}/8 • ${q.wins} vitórias`:'Uma campanha de 8 missões. Salvo automaticamente neste aparelho.'}
function help(){openModal('COMO JOGAR',`<p><b>Combate por turnos:</b> escolha um combatente tocando nele; cada aliado tem <b>2 pontos de ação (PA)</b> por rodada. Mover e atacar custam 1 PA; magias também custam 1 PA e gastam mana.</p><p><b>Controles:</b> toque em <b>MOVER</b> e escolha uma casa azul; <b>ATACAR</b> e toque num alvo; ou escolha uma magia no painel horizontal e toque no alvo ou área. Toque em uma unidade aliada para selecioná-la. <b>INSPECIONAR</b> mostra os efeitos de qualquer quadrado.</p><p><b>Floresta viva:</b> chamas se espalham, água apaga fogo, fogo incendeia teias e matas, gelo congela poças, descarga viaja pela água, névoa bloqueia ataques e raízes tornam terrenos difíceis.</p><p><b>Áreas de magia:</b> algumas atingem aliados também; leia a descrição do feitiço antes de usar. Árvores e pedras bloqueiam tiros, arbustos concedem cobertura.</p><p><b>Vitória:</b> siga o objetivo de cada missão. Nem sempre precisa matar todos os inimigos. Complete 8 operações para encerrar a campanha.</p><p><b>Inspiração:</b> nomes e ideias de magia vêm de D&D 5E, com efeitos, alcance e números adaptados a este videogame. Não são regras oficiais completas.</p><p><b>Offline:</b> depois do status de cache pronto, instale pelo navegador. O progresso fica salvo no dispositivo; evite limpar dados do site.</p>`)}
function openModal(title,html){$('modalTitle').textContent=title;$('modalContent').innerHTML=html;$('modal').classList.remove('hidden')}
function closeModal(){$('modal').classList.add('hidden')}
function setupSquad(){show('squad');renderSquad()}
function renderSquad(){document.querySelectorAll('[data-diff]').forEach(b=>{b.classList.toggle('sel',b.dataset.diff===(G?.difficulty||'normal'));b.onclick=()=>{G.difficulty=b.dataset.diff;save();renderSquad()}});let html='';Object.entries(HEROES).forEach(([k,h])=>{let chosen=selectedTeam.includes(k);html+=`<button class="squadCard ${chosen?'sel':''}" data-hero="${k}"><span class="squadGlyph" style="color:${h.color}">${h.glyph} ${chosen?'✓':''}</span><strong>${h.name}</strong><small>${h.role}</small><small>PV ${h.hp} · Mana ${h.mp} · ${h.skills.length} habilidades</small></button>`});$('squadGrid').innerHTML=html;$('teamCount').textContent=`${selectedTeam.length}/3 selecionados`;$('startMission').disabled=selectedTeam.length!==3;document.querySelectorAll('[data-hero]').forEach(btn=>btn.onclick=()=>{const id=btn.dataset.hero;if(selectedTeam.includes(id))selectedTeam=selectedTeam.filter(h=>h!==id);else if(selectedTeam.length<3)selectedTeam.push(id);else {toast('Escolha apenas três combatentes.');return}renderSquad()})}
function newGame(){reset();selectedTeam=['guardian','ranger','druid'];G={ver:1,difficulty:'normal',mission:0,team:[...selectedTeam],upgrades:{},wins:0,losses:0,casts:0,round:1,seed:r(10000,999999),phase:'ready',logs:[],stats:{fires:0,trees:0,shocked:0,rescued:0}};save();setupSquad()}
function goBrief(){if(!G)newGame();G.team=[...selectedTeam];G.phase='brief';G.board=null;G.actors=null;save();renderBrief()}
function renderBrief(){let m=MISSIONS[G.mission];if(!m){renderEnding();return}show('brief');$('briefAct').textContent=m.act;$('briefTitle').textContent=m.title;$('briefDesc').textContent=m.desc;$('briefGoal').innerHTML='<b>MISSÃO '+(G.mission+1)+'/8</b> · '+goalLabel(m.kind);$('briefTip').textContent='✦ Conselho de Elara: '+m.tip;$('briefTeam').innerHTML='DIFICULDADE: '+({story:'APRENDIZ',normal:'RESISTÊNCIA',hard:'IMPLACÁVEL'}[G.difficulty||'normal'])+'<br>COMPANHIA<br>'+ G.team.map(id=>`<span style="color:${HEROES[id].color}">${HEROES[id].glyph} ${HEROES[id].name}</span>`).join(' · ')}
function goalLabel(kind){return({kill:'Elimine todas as patrulhas',rescue:'Liberte os dois reféns',totem:'Destrua três totens',survive:'Resista por seis rodadas',cleanse:'Purifique três focos de corrupção',beacon:'Ative três marcos ancestrais',boss:'Derrote o Espinho de Sylara'})[kind]}
function makeBoard(mission){let board=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++){
 const p=Math.random(),near=x>=3&&x<=8&&y>=4&&y<=9;
 let base=p<.13?'tree':p<.28?'bush':p<.35?'water':p<.42?'rock':p<.48?'bones':'grass';
 if(near&&p<.16)base='grass';if(y>=9||y<=1)if(Math.random()<.7)base='grass';
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
function terrainBlocked(t){return!t||t.wall>0||t.base==='tree'||t.base==='rock'}
function occupied(x,y,except){return living().some(a=>a.id!==except&&a.x===x&&a.y===y)}
function walkCost(t){return(t.base==='water'||t.base==='bush'||t.vines>0||t.web>0||t.thorns>0||t.ice>0)?2:1}
function pathsFrom(a){let best=new Map([[idx(a.x,a.y),{cost:0,path:[]}]]),todo=[{x:a.x,y:a.y,cost:0,path:[]}];while(todo.length){todo.sort((u,v)=>u.cost-v.cost);let q=todo.shift();if(q.cost> (best.get(idx(q.x,q.y))?.cost??Infinity))continue;for(let [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){let x=q.x+dx,y=q.y+dy,t=cell(x,y);if(!t||terrainBlocked(t)||occupied(x,y,a.id))continue;let cost=q.cost+walkCost(t);if(cost>a.move-(a.slowed?1:0))continue;let k=idx(x,y);if(!best.has(k)||best.get(k).cost>cost){let path=[...q.path,{x,y}];best.set(k,{cost,path});todo.push({x,y,cost,path})}}}best.delete(idx(a.x,a.y));return best}
function bresenham(ax,ay,bx,by){let out=[],dx=Math.abs(bx-ax),dy=Math.abs(by-ay),sx=ax<bx?1:-1,sy=ay<by?1:-1,e=dx-dy;for(;;){out.push({x:ax,y:ay});if(ax===bx&&ay===by)break;let e2=e*2;if(e2>-dy){e-=dy;ax+=sx}if(e2<dx){e+=dx;ay+=sy}}return out}
function los(a,b,ignoreCover=false){let line=bresenham(a.x,a.y,b.x,b.y);for(let j=1;j<line.length-1;j++){let t=cell(line[j].x,line[j].y);if(!t)continue;if((t.base==='tree'||t.base==='rock'||t.wall>0)&&!ignoreCover)return false;if(t.fog>0||t.steam>0)return false}return true}
function effectiveCover(t){if(!t)return 0;return(t.base==='bush'?2:0)+(t.base==='rock'?3:0)+(t.base==='tree'?3:0)+(t.fog>0?2:0)}
function aimTest(a,b,ignoreCover=false){const t=cell(b.x,b.y),cover=b.marked?0:effectiveCover(t);return dice(20)+a.aim+(a.bless?2:0)>=9+b.armor+(ignoreCover?0:cover)}
function damage(target,n,element='physical',caster=null){if(!target||target.hp<=0)return;let d=Math.max(1,Math.round(n)+(caster?.side==='ally'?up('power'):0));if(target.guard>0)d=Math.max(0,d-3);target.hp=Math.max(0,target.hp-d);if(d>0)log(`${target.name} sofre ${d} ${element==='physical'?'de dano':`de ${element}`}.`);if(target.hp===0){log(`☠ ${target.name} caiu.`);if(target.kind==='boss')G.stats.boss=true}}
function heal(u,n){if(!u||u.hp<=0)return;let q=Math.min(u.maxhp-u.hp,n);u.hp+=q;log(`✦ ${u.name} recupera ${q} PV.`)}
function push(u,from,steps){if(!u||u.hp<=0)return;let dx=Math.sign(u.x-from.x),dy=Math.sign(u.y-from.y);if(dx===0&&dy===0)dx=1;if(Math.abs(dx)+Math.abs(dy)===2){if(Math.abs(u.x-from.x)>=Math.abs(u.y-from.y))dy=0;else dx=0}for(let i=0;i<steps;i++){let x=u.x+dx,y=u.y+dy;if(!at(x,y)||terrainBlocked(cell(x,y))||occupied(x,y,u.id)){damage(u,2,'impacto');break}u.x=x;u.y=y;enterTile(u)}}
function enterTile(u){let t=cell(u.x,u.y);if(!t||u.hp<=0)return;if(t.fire>0){damage(u,4,'fogo');u.burn=Math.max(1,u.burn)}if(t.thorns>0)damage(u,3,'espinhos');if(t.charge>0){damage(u,4,'eletricidade');t.charge=0}if(t.trap>0){damage(u,4,'armadilha');u.root=1;t.trap=0}if(t.web>0||t.vines>0){if(dice(20)<12)u.root=1}if(t.corrupt>0&&u.side==='ally')damage(u,1,'corrupção')}
function coordsArea(x,y,radius,diamond=false){let arr=[];for(let yy=y-radius;yy<=y+radius;yy++)for(let xx=x-radius;xx<=x+radius;xx++)if(at(xx,yy)&&(!diamond||Math.abs(xx-x)+Math.abs(yy-y)<=radius))arr.push(cell(xx,yy));return arr}
function floodElectric(x,y){let queue=[{x,y}],seen=new Set(),hit=new Set();while(queue.length&&seen.size<70){let p=queue.shift(),k=idx(p.x,p.y);if(seen.has(k))continue;seen.add(k);let t=cell(p.x,p.y);if(!t||!(t.base==='water'||t.wet>0||k===idx(x,y)))continue;t.charge=Math.max(t.charge,2);t.glow=2;let u=unitAt(p.x,p.y);if(u&&!hit.has(u.id)){damage(u,6,'eletricidade');hit.add(u.id);G.stats.shocked++}for(let [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]])if(at(p.x+dx,p.y+dy))queue.push({x:p.x+dx,y:p.y+dy})}}
function ign(t,n=3){if(!t||t.base==='water'||t.wet>0||t.ice>0){if(t){t.ice=0;t.wet=Math.max(t.wet,2);t.steam=3;t.fire=0}return}t.web=0;t.vines=0;t.thorns=0;t.fire=Math.max(t.fire,n);t.glow=1;G.stats.fires++}
function soak(t,makePool=false){if(!t)return;let hadFire=t.fire>0;t.fire=0;t.wet=Math.max(t.wet,4);if(hadFire)t.steam=Math.max(t.steam,2);if(makePool&&t.base==='grass')t.base='water'}
function freeze(t){if(!t)return;t.fire=0;t.steam=0;t.ice=Math.max(t.ice,3);if(t.base==='water'||t.wet>0)t.ice=5}
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
function updateObjectives(){if(G.phase!=='player'&&G.phase!=='enemy')return;let kind=MISSIONS[G.mission].kind,items=G.board?.filter(t=>t.objective&&!t.cleared)||[];let done=(kind==='kill'&&hostiles().length===0)||(kind==='boss'&&!hostiles().some(a=>a.kind==='boss'))||(['rescue','totem','cleanse','beacon'].includes(kind)&&items.length===0)||(kind==='survive'&&G.round>6);if(done){victory();return}if(!heroes().length)defeat()}
function enemyAction(a){if(a.hp<=0)return;let list=heroes();if(!list.length)return;let moved=false;for(let turn=0;turn<2&&a.hp>0;turn++){
 let enemies=heroes();if(!enemies.length)break;
 let valid=enemies.filter(h=>man(h,a)<=a.range&&los(a,h));
 if(valid.length){valid.sort((u,v)=>(u.hp/u.maxhp)-(v.hp/v.maxhp));let tar=valid[0];
   if(['witch','boss'].includes(a.kind)&&turn===0&&G.round%2===0){let tc=cell(tar.x,tar.y);if(a.kind==='witch'){tc.vines=3;tar.root=1;damage(tar,3,'sombra');log(`${a.name} conjura raízes sombrias.`)}else{for(let t of coordsArea(tar.x,tar.y,1)){if(Math.random()<.6)ign(t,3);let victim=unitAt(t.x,t.y);if(victim)damage(victim,5,'fogo',a)}log('O Espinho de Sylara incendeia a mata!')}break}
   if(aimTest(a,tar)){damage(tar,a.atk+2+(a.kind==='boss'?2:0),'físico',a);if(a.kind==='shade'&&r(1,3)===1)tar.slowed=2}else log(`${a.name} erra ${tar.name}.`);break
 }
 if(a.root>0||moved)break;
 let candidates=pathsFrom(a);let scored=[];
 for(let [k,obj] of candidates){let x=k%N,y=Math.floor(k/N),t=cell(x,y),md=Math.min(...enemies.map(h=>man({x,y},h))),hasLos=enemies.some(h=>man({x,y},h)<=a.range&&los({x,y},h));let danger=(t.fire?14:0)+(t.charge?12:0)+(t.thorns?7:0)+(t.trap?7:0);let value=md*4+(hasLos?-6:0)+danger+obj.cost*.1+Math.random()*1.7;scored.push({x,y,value,path:obj.path})}
 scored.sort((p,q)=>p.value-q.value);if(scored.length){let next=scored[0];for(let st of next.path){a.x=st.x;a.y=st.y;enterTile(a);if(a.hp<=0||a.root>0)break}moved=true}else break;
 }
}
function enemyTurn(){if(!G||G.phase!=='enemy')return;
 const order=hostiles().sort(()=>Math.random()-.5);for(let a of order){if(a.hp>0)enemyAction(a);if(!heroes().length){defeat();return}}
 worldTick();if(G.phase!=='enemy')return;if(!heroes().length){defeat();return}
 G.round++;if(MISSIONS[G.mission].kind==='survive'&&G.round===4&&G.wave===0){spawnWave(['wolf','archer']);G.wave=1;log('⚠ Uma nova patrulha chega pela borda da mata.')}
 if(MISSIONS[G.mission].kind==='survive'&&G.round===6&&G.wave===1){spawnWave(['spear','wolf']);G.wave=2;log('⚠ Os últimos perseguidores avistam o comboio.')}
 for(let a of heroes()){a.ap=2;a.mp=Math.min(a.maxmp,a.mp+2);if(a.bless>0)a.bless--;if(a.guard>0)a.guard--;if(a.root>0)a.root--;if(a.slowed>0)a.slowed--;if(a.marked>0)a.marked--}
 for(let a of hostiles()){if(a.guard>0)a.guard--;if(a.root>0)a.root--;if(a.slowed>0)a.slowed--;if(a.marked>0)a.marked--}
 G.phase='player';let next=heroes().find(a=>a.ap>0);G.selected=next?.id||G.selected;mode='move';pendingSkill=null;updateObjectives();save();if(G.phase==='player')render()}
function spawnWave(kinds){let occ=new Set(living().map(a=>idx(a.x,a.y)));kinds.forEach(k=>{let p=findFreePoint(1,3,occ);G.actors.push(makeEnemy(k,G.uid++,p.x,p.y))})}
function worldTick(){let ignitions=[];let gale=G.round%4===0?'🌧 Chuva da serra':G.round%4===2?'〰 Ventos de Eldroth':'☁ Tempo estável';G.weather=gale;
 for(let t of G.board){let actor=unitAt(t.x,t.y);
   if(t.fire>0){if(actor){damage(actor,4,'fogo');actor.burn=1}if(t.base==='tree'||t.base==='bush'){if(t.fire<=2){t.base='bones';t.scorch=4;G.stats.trees++}}for(let [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){let tt=cell(t.x+dx,t.y+dy);if(tt&&!tt.wet&&!tt.ice&&['tree','bush','grass','bones'].includes(tt.base)&&Math.random()<(.09+(tt.web? .26:0)))ignitions.push(tt)}t.fire--}
   if(t.ice>0)t.ice--;if(t.wet>0)t.wet--;if(t.web>0)t.web--;if(t.vines>0)t.vines--;if(t.thorns>0)t.thorns--;if(t.fog>0)t.fog--;if(t.steam>0)t.steam--;if(t.charge>0)t.charge--;if(t.glow>0)t.glow--;if(t.trap>0)t.trap--;if(t.scorch>0)t.scorch--;if(t.corrupt>0&&G.round%3===0){if(actor&&actor.side==='ally')damage(actor,2,'corrupção')}
 }
 ignitions.forEach(t=>ign(t,3));if(G.round%4===0){let rainCount=0;for(let t of G.board)if(Math.random()<.28){soak(t);rainCount++}log(`A chuva atingiu ${rainCount} quadrados e reduziu incêndios.`)}else if(G.round%4===2){for(let t of G.board){if(t.fog>0&&Math.random()<.45)t.fog=0;if(t.steam>0)t.steam=0}log('O vento abre clareiras entre as névoas.')}updateObjectives()
}
function nextTurn(){if(!G||G.phase!=='player')return;G.phase='enemy';$('phaseText').textContent='TURNO INIMIGO';mode='inspect';pendingSkill=null;save();render();setTimeout(enemyTurn,180)}
function victory(){if(G.phase==='between'||G.phase==='ending')return;G.wins++;log('✓ Operação concluída. A floresta permanece livre por mais uma noite.');if(G.mission===7){G.phase='ending';save();renderEnding();return}G.phase='between';save();renderBetween()}
function defeat(){if(!G||G.phase==='defeat')return;G.phase='defeat';G.losses++;save();show('brief');renderBrief();openModal('A RESISTÊNCIA RECUA',`<p>Sua companhia foi derrotada. Ironwood ainda possui sobreviventes: você pode <b>tentar esta missão novamente</b> com uma nova floresta, sem perder as melhorias conquistadas.</p><p>Elara Stormoak reorganiza os destacamentos para a próxima incursão.</p><button id="retry" class="primary full">TENTAR NOVAMENTE</button>`);$('retry').onclick=()=>{closeModal();deploy()}}
function renderBetween(){show('between');$('victoryTitle').textContent=MISSIONS[G.mission].title;$('victoryDesc').textContent='A vitória abre uma nova trilha. Elara enviou suprimentos para fortalecer sua companhia antes do próximo ataque.';let indices=[(G.mission*2)%UPGRADES.length,(G.mission*2+3)%UPGRADES.length,(G.mission*2+5)%UPGRADES.length];$('upgradeList').innerHTML=indices.map(i=>{let x=UPGRADES[i];return `<button class="upgradeBtn" data-upgrade="${x.id}"><strong>✦ ${x.name}</strong><small>${x.desc}</small></button>`}).join('');document.querySelectorAll('[data-upgrade]').forEach(btn=>btn.onclick=()=>{G.upgrades[btn.dataset.upgrade]=(G.upgrades[btn.dataset.upgrade]||0)+1;G.mission++;G.board=null;G.actors=null;G.phase='brief';save();renderBrief()})}
function renderEnding(){show('ending');const n=G.stats.trees||0,p=G.stats.rescued||0;let kind=n>25?'cicatrizes':p>=5&&G.losses<=1?'solidariedade':'resistencia';let titles={cicatrizes:'A Vitória das Cinzas',solidariedade:'A Floresta de Todos',resistencia:'A Última Chama Livre'};let descs={cicatrizes:'A Corte recua, mas o preço queimou o coração do bosque. Os sobreviventes terão de aprender a reconstruir a natureza que usaram como arma.',solidariedade:'Os faróis reacendem e os refugiados encontram refúgio. Elara proclama: nenhuma floresta pertence aos senhores que apenas sabem cobrá-la.',resistencia:'A campeã caiu. Ironwood permanece de pé, embora a guerra ainda esteja longe de terminar. A resistência tornou-se uma possibilidade real.'};$('endingTitle').textContent=titles[kind];$('endingDesc').textContent=descs[kind];$('endingStats').innerHTML=`<p><b>Missões vencidas:</b> ${G.wins}/8</p><p><b>Recursos mágicos utilizados:</b> ${G.casts} habilidades</p><p><b>Árvores destruídas:</b> ${n}</p><p><b>Reféns e focos libertados:</b> ${p}</p><p><b>Derrotas da companhia:</b> ${G.losses}</p>`}
function displayObjective(){if(!G||!G.board)return;let m=MISSIONS[G.mission];let goal=goalLabel(m.kind);const remaining=G.board.filter(t=>t.objective&&!t.cleared).length;if(['rescue','totem','cleanse','beacon'].includes(m.kind))goal+=` (${remaining} restantes)`;if(m.kind==='kill')goal+=` (${hostiles().length} inimigos)`;if(m.kind==='survive')goal+=` (${Math.min(G.round,6)}/6)`;$('objectiveText').textContent=goal;$('worldWeather').textContent=G.weather||'☁ Tempo estável'}
function selectMode(m,skill=null){if(!G||G.phase!=='player')return;const u=getSelected();if(!u)return;if(skill){if(u.ap<=0||u.mp<SKILLS[skill].cost){toast('Mana ou pontos de ação insuficientes.');return}pendingSkill=skill;mode='cast'}else{pendingSkill=null;mode=m}render()}
function inspect(t){if(!t)return;let tags=[{tree:'Árvore sólida (bloqueia movimento e visão)',rock:'Pedras (bloqueiam passagem)',bush:'Arbustos (+2 cobertura, terreno difícil)',water:'Água (conduz eletricidade, terreno difícil)',bones:'Ossos antigos',grass:'Solo livre'}[t.base]];
 for(let [k,v] of Object.entries({fire:'🔥 Incêndio',ice:'❄ Gelo',wet:'💧 Molhado',web:'🕸 Teia inflamável',vines:'🌿 Raízes',thorns:'⚒ Espinhos',fog:'☁ Névoa',steam:'♨ Vapor',charge:'⚡ Eletrificado',corrupt:'☠ Corrupção',wall:'⬡ Muro',trap:'⚠ Armadilha'}))if(t[k]>0)tags.push(`${v} (${t[k]})`);
 if(t.objective)tags.push(`${t.objective}${t.cleared?' — concluído':''}${t.objhp?` PV ${t.objhp}`:''}`);let u=unitAt(t.x,t.y);if(u)tags.push(`${u.name}: ${u.hp}/${u.maxhp} PV, PA ${u.ap}`);
 openModal(`QUADRADO ${t.x+1}·${t.y+1}`,`<p>${tags.map(t=>`• ${t}`).join('<br>')}</p><p>Todo quadrado é modificável: água, fogo, névoa, gelo, eletricidade, terra, teias e plantas podem alterar suas condições. Alguns obstáculos naturais exigem magias específicas.</p>`)}
function onBoardTap(x,y){if(!G||G.phase!=='player')return;let t=cell(x,y);if(!t)return;const target=unitAt(x,y),sel=getSelected();if(mode==='inspect'){inspect(t);return}
 if(mode==='cast'&&pendingSkill){const k=pendingSkill,s=SKILLS[k];if(!sel)return;if(s.target==='self'){cast(sel,k,sel.x,sel.y);return}if(target?.side==='ally'&&s.target!=='ally'&&s.target!=='tile'){chooseHero(target);return}cast(sel,k,x,y);return}
 if(target?.side==='ally'){chooseHero(target);return}
 if(!sel){toast('Selecione um aliado primeiro.');return}
 if(mode==='attack'){if(target?.side==='enemy'){basicAttack(sel,target);return}if(t.objective==='totem'&&!t.cleared){attackStructure(sel,t);return}toast('Toque num inimigo ou totem no alcance.');return}
 if(mode==='move'){if(target?.side==='enemy'){if(man(sel,target)<=sel.range)basicAttack(sel,target);else toast('Use Mover para alcançar o inimigo.');return}if(t.objective==='captive'||t.objective==='shrine'||t.objective==='beacon'){if(!t.cleared&&man(sel,t)<=1){cast(sel,'interact',x,y);return}}
 if(!target)moveUnit(sel,{x,y});return}
}
const canvas=$('field'),ctx=canvas.getContext('2d'),S=40;
function rect(x,y,w,h,col){ctx.fillStyle=col;ctx.fillRect(x,y,w,h)}
function circ(x,y,r,color){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill()}
function line(ax,ay,bx,by,color,w=1){ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.lineWidth=w;ctx.strokeStyle=color;ctx.stroke()}
function textAt(text,x,y,color,font='bold 15px Georgia',align='center'){ctx.fillStyle=color;ctx.font=font;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(text,x,y)}
function drawForestCell(t){let x=t.x*S,y=t.y*S;
 const palette={grass:['#233b2b','#294334'],bush:['#1c392b','#214330'],tree:['#142920','#1a3225'],rock:['#343c35','#454a43'],water:['#163b40','#1b4650'],bones:['#342f29','#3c352e']};let pair=palette[t.base]||palette.grass;rect(x,y,S,S,pair[t.texture%2]);
 const noise=t.texture;for(let i=0;i<4;i++){let xx=x+((noise*i*23+9)%35)+3,yy=y+((noise*i*17+11)%31)+4;rect(xx,yy,2,2,t.base==='water'?'#346570':'#385342')}
 if(t.base==='bush'){circ(x+13,y+22,10,'#31573b');circ(x+26,y+14,12,'#376343');circ(x+30,y+29,8,'#2a4c34');circ(x+21,y+24,11,'#284834');circ(x+24,y+13,2,'#638568')}
 if(t.base==='tree'){rect(x+16,y+19,9,19,'#503e2e');circ(x+13,y+20,13,'#274e38');circ(x+27,y+20,14,'#244a34');circ(x+20,y+12,15,'#326447');circ(x+19,y+7,5,'#397751')}
 if(t.base==='rock'){rect(x+8,y+11,29,23,'#606661');line(x+9,y+12,x+20,y+5,'#8e9690');line(x+20,y+5,x+34,y+15,'#777d77');line(x+18,y+24,x+27,y+30,'#303f38')}
 if(t.base==='water'){for(let i=0;i<3;i++){let yy=y+10+i*10;line(x+6,yy,x+18,yy-3,'#4b9297',1.3);line(x+22,yy,x+35,yy+1,'#3c808a',1)}}
 if(t.base==='bones'){line(x+7,y+26,x+24,y+16,'#9b9581',3);line(x+21,y+18,x+32,y+31,'#bcb49c',3);circ(x+9,y+27,3,'#d4c6ab');circ(x+32,y+31,2,'#c6bcaa')}
 if(t.scorch>0)rect(x,y,S,S,'#26171099');
 if(t.corrupt>0){rect(x,y,S,S,'#643a7666');textAt('✣',x+20,y+21,'#c77be3','bold 24px Georgia')}
 if(t.wet>0&&t.base!=='water'){circ(x+6,y+33,3,'#55a7b7a0');circ(x+34,y+5,3,'#62abb8aa')}
 if(t.ice>0){rect(x,y,S,S,'#8cc6e46b');line(x+8,y+9,x+29,y+33,'#d3f6ff',2);line(x+22,y+11,x+13,y+30,'#b7eefa',1)}
 if(t.thorns>0){for(let i=0;i<5;i++){let xx=x+(i*7+3)%34+3;line(xx,y+27,xx+6,y+15,'#a4bf76',2);line(xx+6,y+15,xx+7,y+26,'#a2bf78',1)}}
 if(t.vines>0){for(let i=0;i<3;i++){let xx=x+5+i*10;line(xx,y+35,xx+8,y+14,'#78b65e',2);circ(xx+7,y+16,3,'#9ed26f')}}
 if(t.web>0){for(let i=0;i<3;i++)line(x+5,y+5+i*13,x+35,y+13+i*12,'#d2d2db',1);for(let i=0;i<3;i++)line(x+6+i*12,y+5,x+12+i*11,y+36,'#adbcc2',1)}
 if(t.fire>0){rect(x,y,S,S,'#cb6b2f33');for(let i=0;i<3;i++){let xx=x+7+i*12,yy=y+30-(t.texture%4);ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx+5,yy-16-i*3);ctx.lineTo(xx+12,yy);ctx.fillStyle=i%2?'#ecb44b':'#e06436';ctx.fill()}}
 if(t.charge>0){line(x+5,y+5,x+18,y+19,'#c1efff',2);line(x+18,y+19,x+11,y+24,'#b9f0ff',2);line(x+11,y+24,x+34,y+34,'#e6fcff',2)}
 if(t.fog>0||t.steam>0)rect(x,y,S,S,t.steam?'#d4dbdd85':'#b5c5b177');
 if(t.wall>0){rect(x+4,y+5,32,30,t.ice?'#8cdaf0':'#737b74');rect(x+7,y+8,25,22,t.ice?'#b1e8f5':'#929e90');textAt(t.ice?'❄':'⬡',x+20,y+21,'#283d39')}
 if(t.trap>0){textAt('✕',x+20,y+21,'#e4ba6d','bold 26px sans-serif')}
 if(t.glow>0)rect(x,y,S,S,'#e9cf7660');
 if(t.objective){if(!t.cleared){let label={captive:'◈',totem:'♜',shrine:'✥',beacon:'✦'}[t.objective];circ(x+20,y+20,13,'#171621');ctx.lineWidth=2;ctx.strokeStyle=t.objective==='totem'?'#dd8d82':'#ddc681';ctx.stroke();textAt(label,x+20,y+20,t.objective==='totem'?'#ed947a':'#f1d88e','bold 21px Georgia');if(t.objective==='totem')rect(x+7,y+35,clamp(t.objhp/18,0,1)*26,3,'#eb7b72')}else textAt('✓',x+20,y+21,'#9cce98','bold 24px sans-serif')}
 rect(x,y,S,1,'#90af7740');rect(x,y,1,S,'#90af7730')}
function drawActors(){for(let a of living()){
 let xx=a.x*S+20,yy=a.y*S+19,color=a.side==='ally'?'#d5bd7f':'#c76886';
 circ(xx,yy+3,16,'#070b09bb');circ(xx,yy,15,a.side==='ally'?'#264638':'#502337');ctx.beginPath();ctx.arc(xx,yy,14,0,2*Math.PI);ctx.lineWidth=3;ctx.strokeStyle=color;ctx.stroke();
 if(a.id===G.selected&&a.side==='ally'){ctx.beginPath();ctx.arc(xx,yy,19,0,2*Math.PI);ctx.strokeStyle='#ffe4a0';ctx.lineWidth=2;ctx.stroke()}
 textAt(a.glyph,xx,yy+1,a.color,'bold 21px Georgia');rect(a.x*S+5,a.y*S+35,30,4,'#220e10');rect(a.x*S+5,a.y*S+35,30*a.hp/a.maxhp,4,a.side==='ally'?'#8bd08f':'#ee7b8f');
 if(a.root>0)textAt('♧',xx+13,yy-13,'#b5e18d','bold 15px Georgia');if(a.guard>0)textAt('⬟',xx-13,yy-13,'#f4d181','bold 12px Georgia');if(a.marked>0)textAt('✧',xx,yy-19,'#ffecaa');
 }}
function drawHighlights(){let s=getSelected();if(!s||G.phase!=='player')return;
 if(mode==='move'&&s.ap>0&&s.root<=0){let paths=pathsFrom(s);for(let k of paths.keys()){let x=k%N,y=Math.floor(k/N);rect(x*S+2,y*S+2,S-4,S-4,'#74b7b435');ctx.strokeStyle='#72c0aeaa';ctx.lineWidth=1;ctx.strokeRect(x*S+2.5,y*S+2.5,S-5,S-5)}}
 if(mode==='cast'&&pendingSkill){let sk=SKILLS[pendingSkill];for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(man(s,{x,y})<=sk.range||sk.target==='self'&&x===s.x&&y===s.y){rect(x*S+2,y*S+2,S-4,S-4,'#dfb66718');if(sk.target==='tile'){ctx.strokeStyle='#d6b5786b';ctx.strokeRect(x*S+2,y*S+2,S-4,S-4)}}}
 if(mode==='attack'){for(let a of hostiles())if(man(s,a)<=s.range&&los(s,a)){ctx.strokeStyle='#f88c7f';ctx.lineWidth=3;ctx.strokeRect(a.x*S+3,a.y*S+3,S-6,S-6)}for(let t of G.board)if(t.objective==='totem'&&!t.cleared&&man(s,t)<=s.range){ctx.strokeStyle='#f88c7f';ctx.strokeRect(t.x*S+3,t.y*S+3,S-6,S-6)}}
}
function drawBoard(){if(!G?.board)return;ctx.clearRect(0,0,480,480);for(let t of G.board)drawForestCell(t);drawHighlights();drawActors();ctx.strokeStyle='#c5c194';ctx.strokeRect(.5,.5,479,479)}
function render(){if(!G?.board)return;
 $('missionLabel').textContent=MISSIONS[G.mission].act;$('missionName').textContent=MISSIONS[G.mission].title;$('roundValue').textContent=G.round;displayObjective();$('phaseText').textContent=G.phase==='player'?'✦ SEU TURNO':'⚔ TURNO ADVERSÁRIO';let s=getSelected();
 const tips={move:'Toque na casa azul para mover',attack:'Toque no inimigo ou no totem',inspect:'Toque na casa para inspecionar',cast:`Alvo: ${pendingSkill?SKILLS[pendingSkill].name:''}`};$('targetTip').textContent=tips[mode]||'';
 if(s){$('selectedPanel').innerHTML=`<div class="unitIcon" style="color:${s.color}">${s.glyph}</div><div class="unitDetails"><strong>${s.name} <span style="font-weight:400;color:#9fb39c">· ${HEROES[s.kind].role}</span></strong><div class="bar"><i style="width:${s.hp/s.maxhp*100}%"></i></div><small>PV ${s.hp}/${s.maxhp} · ✧ Mana ${s.mp}/${s.maxmp} · 🛡 ${s.armor}${s.root?' · ENRAIZADO':''}${s.guard?' · PROTEGIDO':''}</small></div><span class="apDots">${'◆'.repeat(clamp(s.ap,0,2))}${'◇'.repeat(clamp(2-s.ap,0,2))}</span>`;
 let skills=HEROES[s.kind].skills.concat('interact');$('skillList').innerHTML=skills.map(k=>{let z=SKILLS[k],disabled=G.phase!=='player'||s.mp<z.cost||s.ap<=0;return `<button class="skill ${mode==='cast'&&pendingSkill===k?'selected':''}" data-skill="${k}" ${disabled?'disabled':''}><div class="skTop"><span>${z.name}</span><span class="skCost">${z.cost===0?'PA':'✧'+z.cost}</span></div><small>${z.desc}</small></button>`}).join('');document.querySelectorAll('[data-skill]').forEach(b=>b.onclick=()=>{let k=b.dataset.skill,z=SKILLS[k];if(z.target==='self'){cast(getSelected(),k,s.x,s.y)}else selectMode('cast',k)})}
 else{$('selectedPanel').textContent='Selecione um aliado.';$('skillList').innerHTML=''}
 ['move','attack','inspect'].forEach(m=>$(m+'Btn').classList.toggle('active',mode===m));$('endTurn').disabled=G.phase!=='player';$('moveBtn').disabled=G.phase!=='player';$('attackBtn').disabled=G.phase!=='player';$('battleLog').innerHTML=(G.logs||[]).map(x=>`<div>${x}</div>`).join('');drawBoard()
}
function tapCanvas(ev){let b=canvas.getBoundingClientRect(),x=Math.floor((ev.clientX-b.left)/b.width*N),y=Math.floor((ev.clientY-b.top)/b.height*N);if(at(x,y))onBoardTap(x,y)}
function resume(){G=load();if(!G){newGame();return}selectedTeam=[...G.team];if(G.phase==='ending'){renderEnding();return}if(G.phase==='between'){renderBetween();return}if(G.phase==='brief'||G.phase==='defeat'||G.phase==='ready'){renderBrief();return}if(G.phase==='player'||G.phase==='enemy'){if(!G.board||!G.actors){renderBrief();return}show('battle');if(G.phase==='enemy'){G.phase='player';G.actors.filter(a=>a.side==='ally'&&a.hp>0).forEach(a=>a.ap=0);G.phase='enemy';render();setTimeout(enemyTurn,250)}else render();return}renderBrief()}
function offlineMsg(msg){$('offlineStatus').textContent=msg}
function exportSave(){const obj=load();if(!obj){toast('Nenhuma campanha salva.');return}const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ironwood-save.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);toast('Arquivo de campanha exportado.')}
async function importSave(file){if(!file)return;try{let obj=JSON.parse(await file.text());if(obj?.ver!==1||!Array.isArray(obj.team)||typeof obj.mission!=='number'||obj.mission<0||obj.mission>8)throw Error('Formato inválido');localStorage.setItem(KEY,JSON.stringify(obj));G=null;setHeader();toast('Campanha importada. Toque em Continuar.')}catch(e){toast('Não foi possível importar este arquivo.')} $('importFile').value=''}
function installGuide(){openModal('INSTALAÇÃO OFFLINE',`<p>1. Publique todos os arquivos do ZIP no <b>GitHub Pages</b>.</p><p>2. Abra o endereço HTTPS no celular e espere o indicador <b>PRONTO PARA JOGAR OFFLINE</b>.</p><p>3. No Chrome Android, use <b>Instalar aplicativo / Adicionar à tela inicial</b>; no Safari do iPhone, use <b>Compartilhar → Adicionar à Tela de Início</b>.</p><p>4. Abra o ícone instalado uma vez com rede; depois teste com modo avião. O mapa, as imagens e toda a lógica ficam disponíveis sem internet.</p><p><b>Salvamento:</b> automático no armazenamento local do navegador. Não apague os dados do site.</p>`)}
function init(){
 $('helpBtn').onclick=help;$('battleHelp').onclick=help;$('modalClose').onclick=closeModal;$('modal').onclick=e=>{if(e.target===$('modal'))closeModal()};
 $('newGame').onclick=()=>{if(load())openModal('RECOMEÇAR?',`<p>Isso substitui a campanha atualmente salva neste aparelho.</p><button id="confirmNew" class="primary full">SIM, NOVA CAMPANHA</button>`),$('confirmNew').onclick=()=>{closeModal();newGame()};else newGame()};
 $('continue').onclick=resume;$('menuInstall').onclick=installGuide;$('exportBtn').onclick=exportSave;$('importBtn').onclick=()=>$('importFile').click();$('importFile').onchange=e=>importSave(e.target.files[0]);
 $('squadBack').onclick=()=>{show('menu');setHeader()};$('startMission').onclick=goBrief;$('briefBack').onclick=()=>{selectedTeam=[...G.team];setupSquad()};$('launchBtn').onclick=deploy;
 $('moveBtn').onclick=()=>selectMode('move');$('attackBtn').onclick=()=>selectMode('attack');$('inspectBtn').onclick=()=>selectMode('inspect');$('endTurn').onclick=nextTurn;
 $('logToggle').onclick=()=>$('battleLog').classList.toggle('hidden');$('battleMenu').onclick=()=>{openModal('EXPEDIÇÃO SALVA',`<p>Seu progresso foi salvo automaticamente neste aparelho. Você pode voltar ao menu e continuar a qualquer momento.</p><button id="goMenu" class="primary full">VOLTAR AO MENU</button>`);$('goMenu').onclick=()=>{closeModal();save();show('menu');setHeader()}};
 $('newCampaign').onclick=newGame;$('backToMenu').onclick=()=>{show('menu');setHeader()};
 canvas.addEventListener('pointerup',tapCanvas);canvas.addEventListener('contextmenu',e=>e.preventDefault());document.addEventListener('keydown',e=>{if(!G||G.phase!=='player'||!G.board)return;if(e.key==='Escape'){closeModal();selectMode('move')}if(e.key.toLowerCase()==='e')nextTurn();if(e.key.toLowerCase()==='a')selectMode('attack');if(e.key.toLowerCase()==='m')selectMode('move')});
 setHeader();show('menu');
 if('serviceWorker'in navigator && location.protocol.startsWith('http')){
 navigator.serviceWorker.register('./sw.js').then(reg=>{if(reg.active&&navigator.serviceWorker.controller)offlineMsg('✓ PRONTO PARA JOGAR SEM INTERNET');const ask=()=>{navigator.serviceWorker.controller?.postMessage({type:'CHECK_CACHE'})};navigator.serviceWorker.addEventListener('message',e=>{if(e.data?.type==='CACHE_STATUS'&&e.data.ready)offlineMsg('✓ PRONTO PARA JOGAR SEM INTERNET')});navigator.serviceWorker.addEventListener('controllerchange',ask);if(reg.installing)reg.installing.addEventListener('statechange',ask);setTimeout(ask,1000);}).catch(()=>offlineMsg('Abra pelo GitHub Pages para instalar offline.'))
 }else offlineMsg('Abra pelo GitHub Pages (HTTPS) para instalar como app offline.');
}
init();
