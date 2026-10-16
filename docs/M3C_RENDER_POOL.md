# M3c — Reutilização de personagens no renderizador Phaser

**Entrega:** primeiro incremento de desempenho da M3c, sem alterações no motor tático.  
**Origem:** `feat/phaser-impact-preview-m3b` e beta M3b já disponibilizado no Pages.  
**Branch:** `feat/phaser-unit-pooling-m3c`.

## Problema verificado no código

Na M3b, `renderBattle()` preservava 144 imagens de terreno, mas invocava `unitsLayer.removeAll(true)` e destruía todas as unidades **em toda chamada de renderização**: inspeção, seleção de habilidade, movimentação, término de turno e alteração da mira. Isso gerava novas imagens, gráficos e contêineres constantemente, além de interromper tweens anteriores.

## Solução implementada

`BattleScene` mantém um mapa `actorViews` de objetos `ActorView`, indexado por ID de ator:

- `container`: contêiner Phaser preservado entre atualizações;
- `frame`: gráfico reutilizável com contorno da facção, destaque de seleção e barra de PV;
- `sprite`: textura 16×16 autoral, atualizada com `setTexture` caso o tipo do ator mude;
- `x, y, hp`: último estado exibido, para determinar quando animar movimento ou perda de vida.

O mapa de unidades recebe apenas **novos atores vivos**, atualiza os existentes e remove os que morreram. Um novo jogo, um save importado/retomado ou a transição de missão limpa os objetos anteriores. A camada de 144 tiles, os overlays ambientais e o impacto de magia continuam independentes.

A atualização de uma seleção **não deve aumentar** o número de unidades criadas. Movimento reusa o contêiner original e anima sua posição. O render não encerra mais todos os tweens, evitando quebrar uma animação pela simples mudança de informação no HUD.

## Métricas de diagnóstico (DOM)

- `#game[data-terrain-objects]`: deve continuar igual a **144** em combate.
- `#game[data-unit-objects]`: número atual de contêineres de unidades vivas. Na primeira missão com equipe de 3 e 4 inimigos, inicial **7**.
- `#game[data-unit-allocations]`: contador cumulativo de contêineres criados desde que a cena iniciou. Não cresce ao inspecionar, selecionar outros aliados ou mover a mesma unidade.
- `#game[data-terrain-updates]`: contador cumulativo de texturas de terreno realmente alteradas.

Esses valores mostram **reutilização de objetos**, mas não são medições completas de FPS, memória, GPU ou consumo de bateria.

## Critérios de aceite

- [x] Implementar `actorViews` sem duplicar regras de combate no Phaser.
- [x] Reutilizar gráficos, imagens e contêineres de atores vivos entre frames.
- [x] Preservar interpolação de movimento e efeito de dano enquanto o objeto é reutilizado.
- [x] Descartar sprites de mortos e recriar corretamente ao trocar de campanha/missão.
- [x] Adicionar teste Playwright para verificar alocações constantes em inspeção, movimento e seleção.
- [ ] **Gate CI da branch:** 24 testes headless, TypeScript/Vite e Playwright desktop/mobile aprovados.
- [ ] **QA manual no Pages:** aparência dos personagens, barra de vida, movimentação rápida, batalha após salvar/carregar e fases com ondas de inimigos.
- [ ] Benchmark de FPS e memória em telefone físico, em cenas com fogo/fumaça e muitos inimigos.
- [ ] Fila de entrada/trava das ações durante tweens críticos (ainda pendente).
- [ ] Pool de overlays e VFX, separação do HUD que atualmente é reconstruído para cada ação.
- [ ] Campanha completa de oito missões com três finais, PWA próprio do Phaser e offline.

## Publicação segura

A publicação utiliza `.github/workflows/publish-phaser-beta.yml` na `main`, apontando para o **SHA exato aprovado no CI**. O workflow executa novamente `npm test` e `npm run build` e substitui **somente** `main/phaser-preview/`, preservando `/index.html`, `/app.js` e o salvamento original. Quando a M3c passar, o beta poderá ser atualizado em:

https://pedromaintenance.github.io/ironwood-a-ultima-resistencia/phaser-preview/

O código-fonte segue em PR dependente/draft e não deve ser mesclado à versão Canvas automaticamente.
