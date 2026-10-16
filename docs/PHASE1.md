# Fase 1 — Motor tático independente

Implementação inicial do **Ironwood Core**. A versão Canvas original continua em `app.js` sem alterações. O objetivo deste estágio é uma migração verificável das regras, não mudar balanceamento ou interface.

## Código implementado

| Arquivo | Função |
|---|---|
| `src/core/data.js` | Personagens, inimigos, oito missões, habilidades e upgrades do app legado |
| `src/core/rng.js` | Gerador seeded Mulberry32 com leitura/restauração de estado |
| `src/core/navigation.js` | Caminhos, custo de terreno, bloqueios, linha de visão e cobertura sem estado global |
| `src/core/terrain.js` | Fogo, água e gelo como mutações isoladas de cada tile |
| `src/core/engine.js` | Fachada do jogo: campanha, deploy, ações, IA, turno, objetivos, eventos e save |
| `tests/core.test.mjs` | Testes de comportamento sem navegador |
| `tests/parity.test.mjs` | Testes diferenciais: mesmas decisões/RNG no legado e motor novo |

O motor usa um `GameState` interno por instância, exposto exclusivamente por `snapshot()` (cópia estrutural). As regras estão desacopladas de Canvas, DOM, localStorage, Phaser e timers. A extração das funções de combate, ambiente e IA preserva intencionalmente várias fórmulas legadas; a separação delas em submódulos menores ocorrerá em incrementos posteriores, sempre protegida por testes de paridade.

## API inicial

```js
import { createIronwoodEngine } from './src/core/engine.js';

const game = createIronwoodEngine({
  seed: 20261015,
  onEvent: event => console.log(event.type, event),
});

game.startCampaign({
  difficulty: 'normal',
  team: ['guardian','ranger','druid'],
  seed: 20261015,
});
game.deployMission();

const reachable = game.reachable('a0'); // casas alcançáveis
game.move('a0', 3, 10);
game.endTurn(); // processa IA e ambiente de forma síncrona

const current = game.snapshot(); // estado serializável
const restored = createIronwoodEngine();
restored.restoreSave(current);
```

Funções disponíveis: `startCampaign`, `deployMission`, `move`, `attack`, `useSkill`, `endTurn`, `reachable`, `lineOfSight`, `getActor`, `getOutcome`, `advanceMission`, `restoreSave`, `snapshot`, `drainEvents`.

### Eventos de apresentação

O motor emite eventos `campaign-started`, `view`, `render`, `log`, `message`, `checkpoint`, `result`, `mission-ready`, `restored`. Por enquanto estes são sinais de transição para a interface; não são ainda uma timeline completa de animações. Phaser irá consumir os estados e eventos e renderizar seus efeitos.

### Aleatoriedade e saves

O motor consome um PRNG reproduzível que controla tabuleiros, IA e efeitos ambientais. `snapshot()` inclui `rngState` para permitir continuação determinística após `restoreSave()`.

A compatibilidade com o JSON legado `ver:1` é **estrutural**. Um save anterior sem `rngState` pode ser aberto, mas não há como reconstruir a sequência aleatória histórica usada com `Math.random()`. Não prometer replay perfeito de saves pré-migração.

## Validação

```bash
npm test
npm run test:core
npm run test:parity
node examples/headless-mission.mjs
```

Os testes de paridade carregam o `app.js` real num contexto Node VM com Canvas/renderização neutralizados e substituem apenas `Math.random()` por um gerador com a mesma sequência da nova engine. Assim, comparam estados de jogo após criação da missão, movimento, turno, clima, magias e vitória.

## Acompanhamento

- [x] Conteúdo original extraído, sem alterar fontes.
- [x] RNG determinístico e retomada do estado.
- [x] Lógica de turnos e IA executável sem DOM.
- [x] Caminho/LOS/cobertura separados em módulo.
- [x] Magias elementais simples separadas por tile.
- [x] Testes de funcionamento e paridade com o legado.
- [ ] Extrair inteiramente combate, IA, objetivos e efeitos restantes para módulos menores.
- [ ] Definir esquema mais rigoroso para importação de save não confiável.
- [ ] Completar matrizes de regressão para todos os 32 comandos, cenários de terreno e oito missões.
- [ ] Adaptador de comandos/eventos orientado a animações Phaser (fase 2).

**Critério de avanço:** aumentar a cobertura de regressão e garantir que novos módulos preservem o comportamento do código original. A interface Phaser ainda não foi implementada nesta entrega.
