# Ironwood M4i — A Marcha das Cinzas: incêndio, sete inimigos e sexta vitória

**Data:** 17/10/2026. Branch: `feat/phaser-ashes-m4i`.

## Objetivo e risco do cenário

A sexta missão exige **derrotar sete soldados da Corte** (`spear ×3`, `archer ×2`, `witch`, `shade`) enquanto há focos de incêndio espalhados por uma floresta. A partida não termina quando a mata deixa de queimar: a vitória depende de eliminar todos os inimigos. Também não é necessário apagar o fogo para concluir o objetivo, mas heróis que pisam em casas em chamas podem receber dano.

## Implementação

- `tests/ashes-driver.mjs` utiliza as cinco vitórias genuínas da M4h, aplica upgrade `power` normalmente e inicia a missão 6 sem editar estados. Os únicos comandos táticos empregados são `move`, `attack`, `useSkill` e `endTurn`, com o RNG portátil da campanha.
- `tests/ashes.test.mjs` exige sete inimigos vivos no início, foco(s) de fogo realmente gerado(s) pelo motor, `wins=6`, `losses=0`, nenhum inimigo sobrevivente e entrada na missão 7 com três marcos `beacon`.
- `BattleScene.ts` passa a informar **quantas casas estão em chamas, quantos inimigos restam, quantos aliados estão sobre casas incendiadas e quantas árvores foram destruídas durante a campanha**. São contagens lidas do snapshot; não executam nem alteram regras do motor.
- `phaser/tests/smoke.mjs` usa o estado inicial legítimo da sexta missão, obtido das cinco vitórias anteriores, e executa toda a operação por cliques no Phaser. Compara exatamente cada checkpoint ao motor Node.js, incluindo o fogo, estados de atores, RNG e logs, e verifica a entrada em *Os Faróis do Crepúsculo*.
- Nada foi mudado nas regras de propagação do fogo, nos ataques, balanceamento, saves antigos e no Canvas legado.

## Prova headless reproduzível

**Semente 1** · Aprendiz · Morna/Arven/Vaelis · `portable-v2`.

| Missão | Rodada final | Resultado |
|---|---:|---|
| 1 — A Trilha Fechada | 4 | Patrulha expulsa |
| 2 — Os Nomes dos Desaparecidos | 1 | Dois prisioneiros libertados |
| 3 — Totens da Servidão | 3 | Três totens destruídos |
| 4 — A Noite Mais Longa | 7 | Seis rodadas, duas ondas de reforços |
| 5 — A Seiva Corrompida | 2 | Três focos purificados |
| 6 — A Marcha das Cinzas | 4 | Sete inimigos derrotados |

A missão 6 começou com **3 casas incendiadas** e terminou com **18 casas incendiadas**; houve maior propagação durante o confronto, inclusive efeitos de magia. Os três heróis sobreviveram. Essa é uma prova de alcançabilidade para uma única sequência de comandos: não demonstra vitória garantida em outros cenários nem uma sessão humana contínua por todas as seis missões.

## Gates

- [x] Vitória 1–6 genuína pelo core, sem fixtures, e três marcos da missão 7 preparados.
- [x] 29 regressões anteriores e compatibilidade de save/IA portátil preservadas em CI headless.
- [x] Indicador ambiental e replay de UI implementados.
- [ ] Aprovação do Chromium e build para o SHA final.
- [ ] Publicação de SHA imutável na pasta `phaser-preview/`, sem afetar a versão Canvas na raiz.
- [ ] QA físico, outras dificuldades e conclusão natural das missões 7 e 8 / epílogos.
