# M4g — A Noite Mais Longa: campanha real, ondas inimigas e HUD de defesa

**Data:** 17/10/2026. **Fonte:** `feat/phaser-survival-m4g`.

## Objetivo

Após a M4f estabilizar o embaralhamento da IA entre navegadores e Node.js para novas campanhas, a M4g precisa provar que a quarta operação é vencível por ações reais: resistir **seis rodadas** e sobreviver a reforços que chegam nas rodadas **4 e 6**. Não é necessário matar todos os inimigos. A vitória requer chegar à rodada 7 com ao menos um herói vivo, desbloquear uma melhoria e entrar na quinta missão.

## Implementação

- `tests/survival-driver.mjs` inicia com o `playThirdMission` de M4e/M4f, após **três vitórias legítimas**; avança com upgrade normal `hp` e inicia operação 4. Ataques, magias defensivas e `endTurn` são exclusivamente chamadas públicas do core. Não modifica pontos de vida, round, ondas, RNG, posições, saves ou fase.
- O driver registra todos os comandos e snapshots e também compara os identificadores de inimigos antes/depois de cada turno. Assim, os novos reforços são observados **quando o próprio motor os gera**.
- `tests/survival.test.mjs` exige `wins=4`, `losses=0`, duas ondas (`wolf/archer` na rodada 4, `spear/wolf` na rodada 6), seis finais de turno, vitória só após `round >= 7`, sobreviventes e transição a *A Seiva Corrompida*, com três focos de corrupção.
- `BattleScene.ts` mostra em tempo real as rodadas defendidas e um texto acessível com o número de ondas, composição de reforços e momento previsto da chegada. A leitura provém apenas do estado autoritativo do motor; sem duplicar regras de progressão ou surgimento de inimigos.
- `phaser/tests/smoke.mjs` foca na operação 4 carregando **somente um estado inicial autenticado** por vitórias reais nas operações 1–3; executa o percurso completo da operação 4 com cliques nos controles do Phaser, comparando todos os checkpoints (incluindo as ondas) exatamente aos registros do Node.js, depois escolhe um upgrade e começa a quinta missão.

## Prova determinística

Semente `1`, dificuldade `Aprendiz`, equipe Morna/Arven/Vaelis, IA `portable-v2`:

| Operação | Rodada final | Objetivo |
|---|---:|---|
| 1. A Trilha Fechada | 4 | Patrulha derrotada |
| 2. Os Nomes dos Desaparecidos | 1 | Dois prisioneiros libertados |
| 3. Totens da Servidão | 3 | Três totens destruídos |
| 4. A Noite Mais Longa | 7 | Seis rodadas completas, duas ondas enfrentadas |

No cenário headless aprovado, as ondas chegaram exatamente ao entrar nas rodadas 4 e 6, os **três heróis sobreviveram** e a quinta missão foi iniciada. A existência desse percurso comprova alcançabilidade nesse cenário de teste, **não** vitória garantida para jogadores que escolhem outras ações.

## Critérios e pendências

- [x] Vitória legítima nas quatro operações e início da quinta — core.
- [x] Duas ondas e composição dos reforços conferidas.
- [x] HUD de sobrevivência implementado sem efeitos colaterais no core.
- [ ] Aprovar o replay por cliques no Chromium e build da versão final.
- [ ] Publicar o SHA final somente depois dos workflows verdes.
- [ ] QA em celular físico, dificuldade Normal/Implacável e quatro operações contínuas **exclusivamente** pela interface.
- [ ] Operações 5–8 e epílogos alcançados sem fixtures.

**Sem alteração de regras:** a correção é de observabilidade, documentação, automação de testes e interface. O Canvas original e seu save `ironwood_campaign_v1` ficam separados.
