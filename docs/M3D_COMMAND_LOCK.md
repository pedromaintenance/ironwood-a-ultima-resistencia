# M3d — Sincronização de comandos e animações

**Situação:** implementado em `feat/phaser-command-lock-m3d`. É um PR dependente da M3c, validado antes de qualquer distribuição no Pages.

## Problema

A engine é determinística e executa ações em tempo lógico instantâneo, enquanto o Phaser interpola movimentos e danos na tela. Na M3c, um jogador podia tocar repetidamente em casas, atacar ou encerrar o turno **antes de terminar a interpolação visual**. A engine continuava recebendo comandos válidos, criando discrepância entre aquilo que era mostrado e aquilo que tinha ocorrido.

## Solução M3d

- Uma coleção de animações críticas em andamento (`motionTweens`) é a única origem da trava de comando; nenhuma duração arbitrária é usada para desbloquear.
- A própria conclusão ou interrupção de cada tween remove a trava. Movimentos agora têm interpolação de **300 ms**; feedback de dano também contribui para a trava.
- Enquanto houver animação, cliques de **combate que modificam estado** (andar, atacar ou conjurar) são recusados, sem enfileirar alvos potencialmente desatualizados.
- **Inspeção de terreno, seleção de aliados, mira por hover e cancelamento** continuam disponíveis enquanto animações acontecem.
- O botão de fim de turno fica **desabilitado** durante a animação, e o respectivo handler verifica a trava independentemente do estado visual do botão.
- Abrir menu ou trocar de campanha encerra tweens antigos e libera a trava. Nenhum comando recusado chama `engine.move`, `engine.attack`, `engine.useSkill`, `persist` ou altera o RNG.
- Um status **ANIMANDO / PRONTO** aparece logo abaixo do tabuleiro, inclusive no celular, sem depender apenas da cor.

## Diagnóstico

`#game[data-input-locked]` é `true` enquanto há tweens críticos, e `false` depois da conclusão. `#game[data-ignored-commands]` é contador de comandos mutantes descartados durante a trava. Não é uma fila, portanto nenhum comando antigo será executado quando a animação terminar.

O painel `#commandStatus` anuncia o estado e explica que seleção/inspeção permanecem disponíveis. As métricas anteriores de reutilização continuam: 144 tiles em cache e `data-unit-allocations`.

## Testes e critérios

- [x] Implementar trava vinculada ao ciclo de vida dos tweens, não a um timeout estimado.
- [x] Preservar seleção e inspeção read-only durante animação.
- [x] Prevenir fim de turno e comandos mutantes enquanto o tween estiver ativo.
- [x] Limpar animações ao voltar ao menu, carregar outro save ou iniciar missão.
- [x] Expor travamento e comandos descartados para verificação de navegador.
- [x] Teste Playwright de dois comandos rápidos: o segundo não altera o save, e fim de turno fica desabilitado.
- [ ] **Gate:** 24 testes headless, build Vite/Phaser e smoke Chromium desktop/mobile aprovados no commit de publicação.
- [ ] Playtest real no Pages: toque rápido, movimento, dano, magia 5×5, save/reload e encerramento de turno.
- [ ] Validar em Android/iOS físicos (latência de toque, teclado e GPU modestos).

## Pendências futuras

1. Testar uma missão completa manualmente e reproduzir a campanha de oito missões com três finais.
2. Medir FPS e memória e otimizar a reconstrução do HUD e os VFX.
3. Suportar teclado para mira em cada casa e mensagens de habilidade inválida mais acessíveis.
4. PWA próprio do Phaser, com manifesto, instalação e offline testados.
5. Validar importação de um save real da versão Canvas.

**Política de publicação:** o beta é compilado de SHA aprovado na CI para `main/phaser-preview/` via workflow. Os arquivos Canvas em `main` permanecem intactos. O PR da M3d fica em draft enquanto faltam QA humano e teste físico.
