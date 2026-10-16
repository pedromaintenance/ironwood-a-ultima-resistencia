# M3e — HUD incremental e feedback de ações inválidas

**Estado:** implementação em `feat/phaser-hud-feedback-m3e`, baseada na M3d; **não publicar antes do CI verde**.

## Problema identificado

Na versão M3d, `drawHud()` chamava `skills.replaceChildren()` para **toda renderização**, reconstruindo cada botão e seu listener mesmo após inspecionar o mapa, mover ou escolher uma magia. Isso desperdiça trabalho do DOM e **interrompe o foco do teclado** ao clicar uma habilidade, porque o botão anterior é destruído.

A interface também não informava claramente por que um movimento, ataque ou magia era recusado. Além disso, o fluxo chamava `persist()` mesmo quando o comando falhava ou quando o jogador apenas selecionava outro herói.

## Mudanças implementadas

1. **HUD incremental por conjunto de habilidades:** `BattleScene.syncSkillButtons` mantém `skillButtons` indexado pela chave da magia e `skillLayout`. Botões e listeners são criados **apenas quando o conjunto muda** (por exemplo, selecionar uma classe diferente). Renderizações comuns atualizam os estados `disabled`, `active` e `aria-pressed` dos mesmos elementos.
2. **Foco persistente:** escolher uma habilidade e redesenhar o HUD preserva o foco do botão. Há indicação `focus-visible` para navegação por teclado.
3. **Feedback localizado:** `#actionFeedback` com `role=status` e `aria-live=polite` informa seleção, movimento realizado ou recusado, ataque indisponível, habilidades sem alvo válido e a confirmação de áreas perigosas.
4. **Mesma validação do motor:** mensagens de magia usam os códigos de `engine.previewImpact` (`blocked-sight`, `invalid-target`, `phase`, etc.) antes de tentar o comando; nenhuma regra de distância, mana ou LOS é reimplementada no HUD.
5. **Salvamento apenas após ação executada:** tentativas recusadas e trocas de seleção não sobrescrevem a entrada `ironwood_phaser_preview_v1`. Confirmar uma magia AOE continua exigindo dois toques e o primeiro não salva.
6. **Telemetria simples:** `#skills[data-builds]` conta quantas vezes o painel foi realmente reconstruído; `data-buttons` mostra a quantidade ativa de botões de habilidade. Inspecionar, mover e rejeitar comandos não devem incrementar `data-builds` enquanto a mesma classe permanecer selecionada.

## Roteiro de aceitação

- [x] Reuso de botões e handlers do HUD entre ações comuns.
- [x] Atualizar `disabled`, `active` e `aria-pressed` sem reconstruir a lista.
- [x] Feedback acessível e compreensível em português para movimentos, ataques e magias recusados.
- [x] Não sobrescrever o save em comando inválido, inspeção ou seleção de outro aliado.
- [x] Preservar os gates anteriores: proteção M3d durante tweens, cache M3c de unidades, mira M3b.
- [x] Ampliar smoke Playwright para `data-builds`, foco da magia e save intacto após alvo fora do alcance.
- [ ] CI completo verde do commit de publicação (24 testes headless + Vite + Chromium desktop/mobile).
- [ ] Publicação isolada em `main/phaser-preview/` com SHA exato validado.
- [ ] QA humano em desktop e Android/iOS físico.

## Fora deste incremento

A lista de eventos do combate e as opções de upgrade ainda são reconstruídas quando desenhadas; animações e overlays ainda requerem perfil de desempenho. O painel de HUD incremental **não é benchmark de FPS**, nem significa concluir a campanha ou oferecer PWA offline independente.

**Segurança:** manter o Canvas original em `main/index.html` e o SW legado fora de `/phaser-preview/`; PR dependente em draft até homologação.
