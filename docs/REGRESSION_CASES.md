# Matriz de regressão — versão Canvas → Phaser

Esta matriz registra o **comportamento esperado segundo o código original**, sem declarar que os casos já foram executados. Cada caso deverá ser automatizado contra o core e comparado com o build legado. Mantenha as mesmas condições iniciais e, quando houver aleatoriedade, use RNG controlado após a extração.

| ID | Subsistema | Preparação | Resultado esperado (comportamento atual) | Evidência |
|---|---|---|---|---|
| R01 | Grade | Deploy missão 1 | Board com 144 casas; coordenadas inteiras 0–11; três aliados iniciam em (2,10), (5,10), (9,10) | `N`, `makeBoard`, `makeAlly`, `deploy` |
| R02 | Equipe | Montagem do grupo | Exatamente 3 dos 6 personagens e 2 PA para cada um | `renderSquad`, `makeAlly` |
| R03 | Movimento | Aliado com PA, destino livre alcançável | Consome 1 PA; percorre caminho ortogonal; aplica `enterTile` em cada casa | `moveUnit` |
| R04 | Bloqueios | Árvore, pedra, muralha ou unidade na rota | Não atravessa bloqueio; terreno difícil custa 2 unidades de deslocamento | `pathsFrom`, `walkCost` |
| R05 | Raízes | Aliado com `root>0` tenta mover | Movimento recusado; PA não diminui | `moveUnit` |
| R06 | Alcance | Ataque básico fora do alcance | Recusado; não perde PA | `basicAttack` |
| R07 | Visão | Árvore ou névoa entre agressor e alvo | Ataque básico bloqueado; não gasta PA | `los`, `basicAttack` |
| R08 | Combate | Ataque básico válido | 1 PA consumido; acerto por d20 + precisão contra defesa/cobertura | `aimTest`, `basicAttack` |
| R09 | Fogo | `ign` em casa seca com teia | Teia/raiz/espinhos eliminados; fogo ativo | `ign` |
| R10 | Água + fogo | `soak` em casa incendiada | Fogo zerado; umidade > 0; vapor criado | `soak` |
| R11 | Água + fogo mágico | `ign` em casa molhada ou com água | Sem incêndio persistente; umidade/vapor no lugar | `ign` |
| R12 | Gelo + água | `freeze` em água/área molhada | Fogo/vapor zerados e gelo criado; duração maior quando molhada | `freeze` |
| R13 | Água + eletricidade | `floodElectric` em região conectada molhada | Descarga propaga por células vizinhas ortogonais molhadas, aplica dano às unidades atingidas | `floodElectric` |
| R14 | Teia e raízes | Unidade entra em casa com `web` ou `vines` | Pode ficar enraizada (resultado controlado pelo RNG) | `enterTile` |
| R15 | Espinhos | Unidade entra em casa com `thorns>0` | Sofre 3 de dano | `enterTile` |
| R16 | Corrupção | Aliado entra em casa com `corrupt>0` | Sofre 1 de dano na entrada | `enterTile` |
| R17 | Purificação | `clearCorrupt` em foco ainda pendente | Corrupção/raiz zeradas; objetivo marcado como concluído e estatística incrementada | `clearCorrupt` |
| R18 | Bola de Fogo | Área 5×5 com aliado, inimigo, estrutura e floresta | Causa dano também em aliados; atinge estruturas; incendeia casas aplicáveis | `cast/fireball` |
| R19 | Interação | Interagir adjacente com refém/marco/foco | Marca como concluído; objetivo correspondente progride | `cast/interact` |
| R20 | Objetivos | Exterminar inimigos em missão `kill` | Vitória; fase `between` e melhoria disponível (ou `ending` na missão 8) | `updateObjectives`, `victory` |
| R21 | Sobrevivência | Missão `survive` avançar rodadas | Reforços nas rodadas 4 e 6; vitória ao passar da rodada 6 | `enemyTurn`, `updateObjectives` |
| R22 | Turnos | Encerrar turno do jogador | IA inimiga, `worldTick`, incremento de rodada, +2 mana por aliado, PA restabelecido em 2 | `enemyTurn` |
| R23 | Clima | Rodada % 4 == 0 | Chuva molha parte do tabuleiro e reduz fogo | `worldTick` |
| R24 | Clima | Rodada % 4 == 2 | Ventos podem dissipar névoa e removem vapor | `worldTick` |
| R25 | Derrota | Todos os aliados mortos | Estado `defeat`; repetir sem zerar melhorias | `defeat` |
| R26 | Save | Gravar/carregar `ver:1` | Missão, equipe, progressão, atores e tabuleiro são restaurados | `save`, `load`, `resume` |
| R27 | Finais | Concluir missão 8 com estatísticas variantes | Escolhe entre 3 finais: `cicatrizes`, `solidariedade` e `resistencia` | `renderEnding` |
| R28 | PWA | Instalar e iniciar sem rede após cache | Jogo e assets essenciais permanecem disponíveis offline | `sw.js`, `manifest.webmanifest` |

## Roteiro manual mínimo da Fase 0 (ainda não executado)

- [ ] Abrir jogo na `main` e registrar captura de tela do menu inicial.
- [ ] Iniciar nova campanha, escolher os 3 combatentes e dificuldade normal.
- [ ] Executar a missão 1 com movimentação, ataque e ao menos um feitiço ambiental.
- [ ] Encerrar turno e registrar reação inimiga.
- [ ] Confirmar vitória/derrota e tela de progressão.
- [ ] Exportar JSON do save de **teste** (não inserir dados reais/privados no repositório).
- [ ] Importar save exportado e verificar retomada.
- [ ] Confirmar instalação/funcionamento offline em ambiente compatível.
- [ ] Registrar dispositivo, navegador, build testado e resultado para cada caso.

## Caso de referência para a próxima fase

O contrato de cenário `tests/fixtures/mission-01-baseline.json` identifica entradas e invariantes da missão 1 **sem fingir que houve replay determinístico**. A geração procedural atual usa `Math.random()`; não é correto armazenar uma seed e afirmar que o mesmo mapa será recriado. A execução determinística será adicionada na Fase 1.

## Política de aceite

Cada teste deverá ter: configuração inicial, ação, resultado observado e conclusão **passou/falhou**. Não reclassificar diferenças de regra como \"mudança cosmética\". As correções de balanceamento ficam fora do escopo da migração até aprovação da paridade.
