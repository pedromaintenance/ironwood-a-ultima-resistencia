// Data transcribed directly from the legacy Canvas app; preserve balancing for migration.
export const HEROES={
 guardian:{name:'Morna',role:'Sentinela de Thargrid',glyph:'◆',color:'#dfb67e',hp:32,mp:4,atk:5,armor:4,move:3,range:1,skills:['bash','guard','cleave','rally']},
 ranger:{name:'Arven',role:'Patrulheiro de Ironwood',glyph:'➶',color:'#b0daa2',hp:24,mp:9,atk:6,armor:2,move:4,range:5,skills:['mark','volley','snare','camouflage']},
 mage:{name:'Vaelis',role:'Arcanista dos Ossos',glyph:'✧',color:'#b9b6fa',hp:20,mp:16,atk:3,armor:1,move:3,range:3,skills:['firebolt','fireball','frost','web','fog','blink']},
 druid:{name:'Tília',role:'Druida da Resistência',glyph:'❦',color:'#a7d9a3',hp:25,mp:15,atk:4,armor:2,move:3,range:3,skills:['entangle','spikes','rain','grow','sleet','purify']},
 cleric:{name:'Dara',role:'Clériga da Aurora',glyph:'✶',color:'#f6d994',hp:26,mp:14,atk:3,armor:2,move:3,range:3,skills:['heal','bless','faerie','sunbeam','sanctuary']},
 runesmith:{name:'Branik',role:'Ferreiro Rúnico',glyph:'⬡',color:'#e4aaa1',hp:28,mp:12,atk:4,armor:3,move:3,range:2,skills:['earthwall','lightning','gust','icewall','spark','mend']}
};
export const MISSIONS=[
 {title:'A Trilha Fechada',act:'ATO I · OS REFUGIADOS',kind:'kill',desc:'Uma patrulha shadow fey bloqueou o caminho entre Ironwood e o Rio Ancestral. Expulse os ocupantes sem sacrificar o refúgio.',tip:'Use arbustos como cobertura. Fogo destrói árvores, mas também cria corredores.',enemy:['spear','spear','archer','wolf']},
 {title:'Os Nomes dos Desaparecidos',act:'ATO I · OS REFUGIADOS',kind:'rescue',desc:'Famílias capturadas foram deixadas como isca numa floresta de névoa. Alcance dois prisioneiros e liberte-os antes que a guarda os encontre.',tip:'Para libertar um prisioneiro, aproxime-se e use Interagir. Névoa bloqueia a linha de visão.',enemy:['spear','archer','archer','wolf','witch']},
 {title:'Totens da Servidão',act:'ATO II · GUERRA DE RAÍZES',kind:'totem',desc:'Três totens de ossos perpetuam o medo nas trilhas. Destrua os totens; os guardas são um obstáculo, não o objetivo.',tip:'Ataques e magias também atingem estruturas. Use Bola de Fogo ou Relâmpago para acertar vários alvos.',enemy:['spear','spear','archer','witch','wolf']},
 {title:'A Noite Mais Longa',act:'ATO II · GUERRA DE RAÍZES',kind:'survive',desc:'Ironwood abriu passagem aos refugiados. Segure o corredor durante seis rodadas enquanto o último comboio atravessa a floresta.',tip:'Enraize inimigos, erga muros e use terreno difícil: nem toda vitória depende de eliminar o inimigo.',enemy:['wolf','spear','spear','archer','witch']},
 {title:'A Seiva Corrompida',act:'ATO III · O CORAÇÃO FERIDO',kind:'cleanse',desc:'A feitiçaria de Lady Sylara contamina as árvores. Purifique três focos de corrupção antes que suas raízes engulam a trilha.',tip:'Interagir purifica um foco adjacente. A magia Purificar também limpa focos à distância.',enemy:['witch','spear','archer','wolf','wolf','shade']},
 {title:'A Marcha das Cinzas',act:'ATO III · O CORAÇÃO FERIDO',kind:'kill',desc:'Colunas de soldados avançam sob cobertura de um incêndio controlado. A própria mata é a primeira vítima da campanha.',tip:'Criar Água interrompe incêndios. Congele poças para criar obstáculos e eletrifique água contra grupos.',enemy:['spear','spear','spear','archer','archer','witch','shade']},
 {title:'Os Faróis do Crepúsculo',act:'ATO IV · CONTRA A CORTE',kind:'beacon',desc:'Reative os três marcos de sinalização ancestral que ligam Ironwood às forças de Thargrid. Sem eles, os aliados atacarão às cegas.',tip:'Use Interagir ao lado dos marcos. Se uma árvore bloquear o caminho, o fogo ou a terra podem mudar a rota.',enemy:['spear','archer','archer','witch','shade','spear']},
 {title:'O Espinho da Rainha',act:'ATO IV · CONTRA A CORTE',kind:'boss',desc:'A campeã de Sylara Nightwhisper penetrou no bosque sagrado. Vencê-la não derrubará a Corte, mas provará que Ironwood não se ajoelhou.',tip:'A campeã manipula raízes e fogo. Molhe as áreas de combate, use coberturas e proteja os membros frágeis.',enemy:['boss','spear','spear','archer','witch','shade']}
];
export const ENEMIES={
 spear:{name:'Lanceiro da Corte',glyph:'♠',hp:14,atk:4,armor:2,range:1,move:3,color:'#db82a1'},
 archer:{name:'Arqueiro Sombreado',glyph:'➷',hp:11,atk:4,armor:1,range:5,move:3,color:'#d68e9c'},
 wolf:{name:'Lobo de Eldroth',glyph:'✶',hp:10,atk:4,armor:0,range:1,move:5,color:'#bb87a0'},
 witch:{name:'Tecelã da Corte',glyph:'✺',hp:13,atk:4,armor:1,range:4,move:3,color:'#e2a1cf'},
 shade:{name:'Sombra de Vandar',glyph:'◈',hp:13,atk:5,armor:1,range:1,move:4,color:'#c8a0ea'},
 boss:{name:'Espinho de Sylara',glyph:'♛',hp:52,atk:6,armor:4,range:5,move:3,color:'#f2a3bc'}
};
export const SKILLS={
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
export const UPGRADES=[
 {id:'hp',name:'Reforços de Thargrid',desc:'+5 PV máximos para a companhia.'},
 {id:'mp',name:'Reserva de Cristais',desc:'+3 mana máxima para cada aliado.'},
 {id:'power',name:'Runa de Golzdov',desc:'+1 dano em ataques e magias ofensivas.'},
 {id:'defense',name:'Escudos de Ironwood',desc:'+1 armadura de cada combatente.'},
 {id:'forest',name:'Filhos da Mata',desc:'+1 deslocamento para cada aliado.'},
 {id:'focus',name:'Disciplina dos Sábios',desc:'+1 precisão para todos os ataques.'}
];

