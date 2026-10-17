# M4b — Derrota persistente, nova tentativa e três finais do Canvas

**Branch:** `feat/phaser-retry-endings-m4b`, baseada na M4a. PR draft até avaliação de campanha completa.

## Correção de fluxo

Na M4a, ao selecionar **CONTINUAR SALVAMENTO**, `BattleScene.resumeCampaign()` chamava `deployMission()` automaticamente para `phase='defeat'`. O save da derrota era regravado imediatamente como um novo combate, escondendo a tela de resultado e eliminando a escolha de tentar novamente.

M4b **preserva a derrota após recarregar ou importar**. Um painel de resultado apresenta o texto da versão Canvas original, incluindo a explicação de que os upgrades permanecem. O novo botão **TENTAR NOVAMENTE — MESMA MISSÃO** só aparece em derrota e chama a função existente `engine.deployMission()`; a missão, companhia, melhorias, vitórias e número de derrotas permanecem. Rodada, terreno e inimigos são regenerados pelo motor, sem alterar as fórmulas de combate.

## Três finais canônicos

A função pura `campaignEnding(state)` em `src/core/ending.js` reproduz **exatamente** os limiares e títulos de `app.js/renderEnding()`:

| Resultado | Condição | Título |
| --- | --- | --- |
| Cicatrizes | `stats.trees > 25` (tem prioridade) | **A Vitória das Cinzas** |
| Solidariedade | `stats.trees <= 25`, `stats.rescued >= 5` e `losses <= 1` | **A Floresta de Todos** |
| Resistência | Qualquer outro resultado | **A Última Chama Livre** |

Os parágrafos narrativos são os originais do Canvas, não alternativas novas. A tela de encerramento mostra também as estatísticas usadas na escolha: 8 missões, magias utilizadas, árvores destruídas, reféns/focos libertados e derrotas. O painel aparece somente no estado `ending`; botões de combate ficam desativados. O save Phaser continua independente do save Canvas.

## Critérios de testes

- [x] Função sem DOM/RNG que resolve os três finais e preserva as fronteiras exatas (25 vs 26 árvores; 1 vs 2 derrotas).
- [x] Rodadas sem importar fixture para verificar determinismo de uma campanha nova nos primeiros turnos.
- [x] Teste core derrota resolvida pelo motor e deploy de nova missão a partir do save, mantendo progressão.
- [x] Teste Chromium desktop: importar derrota v1, mostrar resultado, salvar, recarregar, continuar **sem auto-retry**.
- [x] Botão de retry dispara recomeço da mesma operação sem perder upgrades, vitória/derrota acumulada ou equipe.
- [x] Teste Chromium dos três epílogos por importação de saves v1 válidos de campanha concluída; encerra turno desabilitado.
- [x] [29/29 testes core, build Vite/Phaser e Chromium desktop/mobile aprovados](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38988894146), SHA `74b0c154`.
- [x] [Publicação isolada M4b concluída](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38989071534); `main/phaser-preview/` identifica a beta M4b e o SHA aprovado, com Canvas original preservado.
- [ ] Playthrough integral das oito missões e dos três finais sem fixture, QA físico Android/iOS.

**Limite importante:** o teste dos três finais usa snapshots válidos de conclusão da campanha, não um playthrough inteiro. O teste de rodadas iniciais parte do zero e não simula uma vitória completa da primeira missão. Os testes não provam balanço final nem ritmo de campanha.

## Próximas melhorias M4c

- Teste de jogo da missão 1 inteira sem configurar derrotas/saves, incluindo ataque, magia, posicionamento e obtenção de melhoria.
- Revisão dos objetivos contextuais de todas as missões, especialmente interação com reféns e reinício após derrota real.
- Perfil de FPS e memória em dispositivos físicos.

**Nota de entrega:** workflow de compilação/publicação e [implantação final do GitHub Pages](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38989168527) concluídos com sucesso; QA humano em hardware físico é uma etapa independente. O teste de epílogos usa saves v1 válidos, não campanha integral jogada.
