# M3f — Renderização incremental de overlays e registro de combate

**Branch:** `feat/phaser-render-cache-m3f`, baseada na M3e. Esta etapa otimiza o renderizador Phaser, **sem alterar qualquer regra, turno, dado ou RNG do motor tático**.

## Problema observado

Apesar de 144 tiles de terreno já estarem em cache (M3a), unidades serem persistentes (M3c) e botões de habilidades terem HUD incremental (M3e), toda atualização ainda fazia:

- `worldOverlay.clear()` seguido de até 144 casas redesenhadas, marcando todos os efeitos de fogo, gelo, teia, névoa, corrupção e objetivos, mais os destinos de movimento ou magia.
- Avaliação de `engine.previewSkill()` em cada casa mesmo quando a única mudança foi inspecionar o terreno ou exibir uma mensagem.
- `battleLog.replaceChildren()` para recriar as últimas cinco linhas, mesmo se o conteúdo não mudasse.
- `upgradeOptions.replaceChildren()` para recriar botões de escolha ao redesenhar a tela de vitória.

## Mudanças M3f

1. **Assinatura da camada de efeitos/alcance.** Uma comparação determinística baseada em missão, rodada, fase, tempo, grade inteira, atores e seleção/habilidade permite pular o redesenho se as entradas do renderizador forem equivalentes. O snapshot é consultado somente em memória; não é alterado.
2. **Estado invalidado quando necessário.** Movimento real, troca de aliado selecionado, uso de magia, rodada, ambiente, estado da grade e habilidades forçam novo desenho. Importar/retomar campanha ou trocar de missão invalida explicitamente o cache.
3. **Registro de combate incremental.** A janela de cinco mensagens só altera o DOM quando a lista efetivamente mudou. Não há perda de eventos, e `aria-live` original permanece.
4. **Menu de melhorias sem reconstruções repetidas.** Os botões do upgrade são montados uma vez por combinação missão/opções e reaproveitados entre renders da tela de vitória. A transição para outra missão ou save invalida a assinatura.
5. **FPS de observação.** `BattleScene.update()` acumula o tempo entre 60 frames e atualiza `#game[data-render-fps]` e `#fpsReadout` com taxa aproximada; o valor depende de navegador, foco da aba, emulação e hardware. Não participa da simulação e não constitui benchmark comparável entre máquinas.
6. **Diagnóstico legível.** O guia de teste mostra a contagem de redesenhos, de reconstruções do registro e de menus de melhoria. Dados de auditoria: `#game[data-overlay-draws]`, `#battleLog[data-builds]`, `#upgradeOptions[data-builds]`.

**Observação técnica:** a assinatura ainda faz uma varredura/serialização dos dados do snapshot para manter a semântica; esta versão reduz chamadas ao Graphics e operações de DOM, **não** prova ganho de FPS ou memória real. O overlay de mira (hover), o desenho do frame dos personagens e parte do HUD ainda exigem otimizações posteriores.

## Gate de aceite

- [x] Implementar cache de efeitos de mapa e alcance utilizando o snapshot e seleção.
- [x] Invalidar cache em mudança de campanha/estado.
- [x] Atualizar mensagens do combate apenas quando novas entradas aparecem.
- [x] Reutilizar botões de escolha de upgrade na mesma tela de vitória.
- [x] Expor métricas legíveis na própria página de playtest e contador observacional de FPS em janelas de 60 frames.
- [x] Criar regressões Playwright: inspeção e movimento inválido não redesenham; movimento válido e log novo invalidam.
- [ ] CI verde do commit final: 24 testes de core, build TypeScript e navegador Chromium desktop/mobile.
- [ ] Publicar build validado sob `main/phaser-preview/` e confirmar deploy do Pages.
- [ ] Playtest manual em aparelho físico e missão completa.

## Próximas entregas

- Perfil de FPS/memória e revisão de gargalos reais em Android/iOS.
- Reduzir atualizações das barras de vida e overlays de mira por hover.
- Testar vitória, escolha de upgrade, próxima missão e os três finais em um playthrough integral.
- Teclado de mira em grade, melhorias de contraste e PWA independente/offline.

A aplicação Canvas original em `main/index.html` permanece intacta, com save separado `ironwood_campaign_v1`. O beta Phaser guarda `ironwood_phaser_preview_v1` e não faz merge automático em `main`.
