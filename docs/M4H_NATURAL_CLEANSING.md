# Ironwood M4h — Quinta operação: A Seiva Corrompida

**Data:** 17/10/2026. **Branch de QA:** `feat/phaser-cleanse-m4h`.

## Problema e escopo
O marco M4g comprovou a vitória legítima das quatro primeiras operações, mas a purificação dos três focos da quinta ainda não tinha teste de partida real. O objetivo desta entrega é demonstrar que se pode purificar sem editar snapshots, além de tornar a severidade e localização dos focos legíveis no Phaser.

## Implementação
- `tests/cleanse-driver.mjs`: continua a campanha após **quatro vitórias autênticas**, aplica a melhoria `mp` normalmente, inicia a quinta missão e utiliza apenas `move`, `attack`, `useSkill` e `endTurn`. Prioriza `interact` para heróis adjacentes e, quando presente, `purify` da druida em área. Avança respeitando terreno, AP, riscos e as regras originais do motor.
- `tests/cleanse.test.mjs`: exige três focos originalmente pendentes, `wins=5`, `losses=0`, nenhum foco restante, cinco resgates/purificações cumulativos, três interações normais no cenário de referência, melhoria real e entrada na sexta missão com sete inimigos.
- `BattleScene.ts`: painel de objetivos mostra **coordenadas (1–12), valor de corrupção e marcação PURIFICADO** para cada foco. Todos esses dados vêm do snapshot autoritativo.
- `phaser/tests/smoke.mjs`: importa **somente o início legítimo da quinta missão**, obtido após quatro vitórias reais do motor, para focar o replay da quinta. Executa cada comando via tabuleiro/controles, compara integralmente snapshots Chromium versus Node.js, confere as três interações, barra de progresso, painel, vitória, upgrade e entrada em *A Marcha das Cinzas*.
- O motor original, suas fórmulas, a versão de save `ver:1` e o Canvas em `main/` não sofreram modificações.

## Evidência reproduzível
**Semente:** `1` · **Dificuldade:** Aprendiz · **Equipe:** Morna, Arven e Vaelis · **IA:** `portable-v2`.

| Operação | Rodada final | Condição comprovada |
|---|---:|---|
| 1 · A Trilha Fechada | 4 | Patrulha derrotada |
| 2 · Os Nomes dos Desaparecidos | 1 | Dois reféns libertados |
| 3 · Totens da Servidão | 3 | Três totens destruídos |
| 4 · A Noite Mais Longa | 7 | Seis rodadas e ambas as ondas |
| 5 · A Seiva Corrompida | 2 | Três focos purificados |

Focos na prova: (7,7), (10,7), (8,8) em coordenadas de interface 1–12. O estado acumulado passa a cinco resgates/purificações após a missão 5. Todos os três heróis sobreviveram, e a missão 6 foi iniciada.

Essa execução **não equivale a uma sessão de jogo humana contínua** por toda a campanha; a prova de cinco operações é no motor, e a interface reproduz integralmente a quinta com abertura legítima. Não há garantias de mesma duração para outra estratégia, seed ou dificuldade.

## Critérios de publicação
- [x] Regressões antigas e prova headless de cinco vitórias consecutivas.
- [x] Interface e teste Chromium do quinto confronto implementados.
- [ ] CI final do Phaser/Chromium no mesmo SHA de release.
- [ ] Publicação imutável em `/phaser-preview/` e confirmação da implantação do Pages.
- [ ] QA em aparelhos físicos, dificuldade Normal/Implacável e operações 6–8 até os finais sem fixtures.
