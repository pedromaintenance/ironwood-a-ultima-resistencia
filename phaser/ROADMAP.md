# Roadmap executivo — Ironwood Phaser

**Atualização:** 16 de outubro de 2026 — M3g em validação; M3f já publicada como compilado no Pages  
**Jogo público:** `main` continua executando o Canvas legado.  
**Ramo da prévia:** `feat/phaser-impact-preview-m3b` ([PR #13](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/13)); publicação pública independente compilada do commit `9ffc7029`.  
**Roadmap do projeto inteiro:** [ROADMAP_IRONWOOD_PHASER.md](../ROADMAP_IRONWOOD_PHASER.md) (versão canônica publicada em `main`).

Este roteiro diferencia funcionalidades **implementadas**, **validadas em CI**, **em revisão** e **ainda planejadas**. Os testes automatizados não substituem o playthrough humano em aparelho físico.

## Estado atual

| Sistema | Estado | Entrega verificável | Faltam |
|---|---|---|---|
| Motor tático independente | Implementado; testes diferenciais aprovados | `src/core`, [PR #5](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/5) | Paridade em sessões longas e outros cantos das regras |
| Primeira cena Phaser 4 | Implementada; build+Chromium aprovados | `phaser/src/BattleScene.ts`, [CI](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38835951063) | Gameplay manual real, renderizador com sprites |
| Seleção de equipe | Implementada | Lobby: 6 heróis, escolher exatamente 3 | Retratos e confirmação narrativa |
| Dificuldade | Implementada | `story`, `normal`, `hard` passadas para o motor | Balanceamento por dificuldade |
| Salvamento automático | Implementado | `phaser/src/PreviewSave.ts`, chave isolada `ironwood_phaser_preview_v1` | IndexedDB opcional, recuperação de exceções |
| Exportar/importar JSON | Implementado | Validação do formato v1 e limite de 2 MB | Testes com amostras legadas de usuários |
| Continuação de campanha | Implementada | Recupera batalha/estado e RNG no carregamento | Testar interrupções de sessões longas |
| Melhorias entre missões | Implementadas | Apresenta as 3 opções originais para escolha | UI e sprites dos upgrades |
| Feedback visual/inspeção | M3a implementado; smoke de navegador verde | Seleção de alvos pelo core, inspeção sem gastar recursos, movimento/dano | VFX precisos/AOE e fila de ações |
| Telas pequenas | **Smoke emulado aprovado** | Layout responsivo 390×844, seleção de equipe, toque para mover e retomada após reload | Android/iOS físico, acessibilidade e qualidade |
| Pixel-art original | **36 sprites/texturas 16×16 gerados localmente; teste Chromium aprovado** | `phaser/src/PixelAtlas.ts`, [guia artístico](../docs/PIXEL_ART_M2.md) | Refinar desenho, contraste e animações |
| Free-assets de terceiros | Nenhum arquivo externo incorporado; CC0 Kenney apenas candidato | [Manifest](../docs/assets-manifest.json), [Kenney Roguelike/RPG](https://kenney.nl/assets/roguelike-rpg-pack) | Baixar, inspecionar, selecionar, incorporar e registrar arquivos CC0 |
| Renderer incremental e comandos | **M3d implementada; validação CI pendente** | 144 tiles + unidades reutilizados; trava da ação mutante durante tweens com telemetria | Pool de VFX, benchmark físico, teclado de mira e QA humano |
| Publicação de beta no Pages | **M3b distribuída** em `/phaser-preview/`, sem substituir Canvas | [Jogar no Pages](https://pedromaintenance.github.io/ironwood-a-ultima-resistencia/phaser-preview/), [CI M3b](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38955658327) | QA físico e acessibilidade |
| PWA offline independente | Ainda não iniciada no Phaser | Legado mantém PWA atual; SW Canvas exclui a prévia de seu cache | SW próprio, web manifest, botão instalar e validação offline |

## Sequência de trabalho — próximos PRs

### M1 — Preview de campanha com estado persistente
- [x] Lobby com seleção de três combatentes e dificuldade.
- [x] Novo jogo e continuar jogo salvo.
- [x] Slot próprio para a prévia, sem sobrescrever `ironwood_campaign_v1`.
- [x] Autosave após movimento, ataque, magia, turno, vitória e escolha de upgrade.
- [x] Exportação do estado em JSON; importação de arquivo JSON v1 validado.
- [x] Opções reais de upgrade após vitória (não mais HP automática).
- [x] Feedback de movimentação/dano com tweens leves.
- [x] CI verde com importação válida/inválida, exportação, persistência, escolha de heróis, dificuldade e teste **touch mobile emulado** ([run 38837895074](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38837895074)).
- [ ] Playthrough de 1 missão sem intervenção artificial.

**Aceite:** conseguir começar a campanha, gastar PA, encerrar turno, salvar, recarregar, importar um JSON e retomar com o mesmo estado.

### M2 — Arte licenciada e direção visual (**em execução**)
- [x] Criar atlas de **pixel-art autoral**, com 24 tiles de terreno e 12 sprites de unidades distintos, em 16×16.
- [x] Renderizar terreno e personagens com imagens/texturas Phaser, preservando motor e efeitos.
- [x] Diferenciar facções por borda/HP e manter o mapa determinístico, com variantes de terreno.
- [x] Exibir destaque do alcance aproximado de habilidades e explicação para touch.
- [x] Documentar arte gerada vs. assets de terceiros no manifesto, sem alegar importação CC0 não feita.
- [x] CI com build, smoke Chromium, textura verificada por teste e screenshots.

- [ ] Obter **arquivos reais** dos packs oficiais Kenney CC0; registrar versão, arquivo, URL e licença por asset.
- [ ] Escolher uma perspectiva e escala coerentes. Tiles 16×16 exibidos como 32×32 ou 40×40 em grade lógica 12×12.
- [x] Implementar primeiro registro local de texturas para chão, água, vegetação, ruínas e paredes em `PixelAtlas.ts` (gerado em memória).
- [x] Trocar marcadores por sprites originais de 16×16 para todos os heróis e inimigos, preservando facções e barras de PV.
- [ ] VFX para fogo, gelo, névoa, raízes, corrupção e eletricidade.
- [x] Garantir arte sem URLs externas em runtime; textures locais geradas em memória. **PWA offline ainda não comprovado**.

**Aceite:** toda arte incorporada tem origem documentada, é carregada localmente e é legível no celular; nenhum pacote externo sem licença auditada. **Gate parcial:** arte autoral e renderização passaram no CI; revisão visual humana e assets externos continuam pendentes.

### M3 — Combate legível e input robusto (**M3a e M3b disponíveis para playtest**)
- [x] **M3a:** `previewSkill` no core consulta as mesmas verificações de alvo e linha de visão da magia executada; sem gastar PA/mana/RNG.
- [x] **M3a:** destacar apenas casas legalmente selecionáveis; mostrar nome, mana, alcance e descrição no celular.
- [x] **M3a:** botão INSPECIONAR e atalho `I`, cancelamento por `Esc`, relatório de terreno, efeitos, objetivos e personagens; inspeção não consome turno.
- [x] **M3a:** cache persistente dos 144 sprites de terreno; `setTexture` apenas quando o terreno muda.
- [x] **M3a:** separar overlay e unidades do terreno; preservar animação de deslocamento.
- [x] **M3a:** executar testes de paridade do core **no mesmo workflow** do build/smoke Phaser.
- [x] **M3a:** testes E2E de inspeção desktop e mobile emulado, preservação de save e cache de 144 tiles.
- [x] **M3b:** pré-visualizar a geometria **inicial** afetada (3×3, 5×5, linhas, paredes e rajadas) ao mirar, sem consumo de RNG. *A propagação secundária de fogo/eletricidade é condicional e ainda não previsível*.
- [x] **M3b:** avisar quando aliados estão na área de dano e exigir **segundo toque de confirmação** para magias de área ofensivas.
- [x] **M3b:** adicionar testes de AOE 5×5, bordas do mapa, risco a aliados e imutabilidade do estado, além de smoke de duplo toque.
- [x] **M3b:** CI do build + teste headless 24/24 + Chromium desktop/mobile aprovado no commit `9ffc7029` ([execução](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38955658327)).
- [x] **M3b:** versão identificada, guia de playtest e link de reporte de bugs na própria página; arquivos compilados enviados para `main/phaser-preview/` ([publicação](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38955934746)).
- [ ] **M3b:** fila de ações durante tweens, hit/miss, objetivos, sprites de unidades em pool e feedback de custos.
- [ ] **M3b:** acessibilidade com anúncios descritivos, teclado completo, tablet, física de render e benchmark FPS/memória.
- [ ] Testar uma missão integral sem atalhos de QA, em Android/iOS físico.

**Aceite parcial:** M3b passou em 24 testes de core/paridade, build e smoke Chromium (incluindo a mira e confirmação). o cache de terreno é real, porém o renderer **ainda recria unidades e overlays a cada ação**. A visualização de alvo e da **área geométrica inicial** existe. A propagação ambiental e danos finais continuam sendo resolvidos pelo motor no momento da ação. [Guia técnico M3a](../docs/M3_COMBAT_UX.md).

### M3c — Desempenho incremental (**pool de unidades testado e distribuído em beta**)
- [x] Reutilizar contêiner, gráficos e sprite de cada ator vivo entre seleções, movimentos e atualizações de HUD.
- [x] Atualizar textura e barra de vida em objetos existentes, sem destruir os sprites a cada render.
- [x] Criar somente novas unidades, remover mortos e limpar visualização ao carregar save, iniciar campanha e mudar de missão.
- [x] Manter as interpolações de movimento/dano sem cancelá-las em re-renderização de seleção.
- [x] Adicionar telemetria `data-unit-objects` e `data-unit-allocations`; smoke verifica contagem sem crescimento indevido.
- [x] Gate CI com **24/24 testes headless, build Vite e smoke Chromium** aprovado no commit `32cbfd7b` ([execução](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38957047595)); screenshots anexadas ao workflow.
- [x] [Publicação em beta](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38957277789), com versão M3c identificada e contador de unidades no roteiro de teste.
- [ ] Benchmark de FPS, memória e bateria em hardware real.
- [ ] Travar ou enfileirar ações conflitantes durante animações; pool de VFX e render incremental do HUD.
- [ ] Playthrough da primeira missão e da campanha inteira.

**Aceite parcial:** evita recriação de contêineres de aliados/inimigos vivos em ações normais, com identidade de sprites persistente. Ainda há recálculo das sobreposições e construção dos botões do HUD. [Especificação M3c](../docs/M3C_RENDER_POOL.md).

### M3d — Trava de comandos enquanto o Phaser anima (**CI aprovado e beta publicado**)
- [x] Rastrear movimentos e efeitos de dano em `motionTweens`; bloquear comandos mutantes sem usar relógios nem alterar a engine.
- [x] Desabilitar **ENCERRAR TURNO** durante tween, com verificação também no handler.
- [x] Permitir inspeção, seleção, hover de mira e cancelamento durante a animação.
- [x] Expor `data-input-locked`, `data-ignored-commands` e texto **ANIMANDO/PRONTO** acessível no celular.
- [x] Cancelar tweens pendentes quando mudar de campanha/voltar ao menu.
- [x] Teste Playwright de comando rápido duplicado sem alteração do save e trava do botão de turno.
- [x] CI **24/24 testes**, build e Chromium desktop/mobile verdes no commit `16c73ea5` ([execução](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38961163306)).
- [x] [Workflow de publicação da M3d](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38961411555) aprovou o SHA e compilou a prévia em `main/phaser-preview/`.
- [ ] Revisar resultado em dispositivo físico, incluindo toques rápidos e botão de turno.

**Aceite parcial:** não há fila de comandos; entradas mutantes são **recusadas** durante animações, para impedir aplicar ordens baseadas em posições desatualizadas. O motor determinístico e o save continuam sendo as fontes de verdade. [Detalhamento M3d](../docs/M3D_COMMAND_LOCK.md).

### M3e — HUD incremental e mensagens de combate (**CI aprovada, beta distribuída no Pages**)
- [x] Reusar botões e listeners por conjunto de habilidades, atualizando estado sem destruir o foco do teclado a cada render.
- [x] Expor `#skills[data-builds]` e `data-buttons` para aferir alocações e confirmar inspeção/movimento sem reconstrução.
- [x] Mostrar mensagens acessíveis para movimentos, ataques e habilidades recusados, incluindo os motivos retornados pelo motor.
- [x] Salvar somente após ação efetivamente executada; seleção e tentativas inválidas não alteram a entrada persistida.
- [x] Teste Playwright de foco do botão, rebuild estável e save intocado após comando e magia fora de alcance.
- [x] **24/24 testes**, Vite e Chromium desktop/mobile aprovados no commit `fd27434a` ([CI #38964097106](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38964097106)).
- [x] Publicação do build testado em `main/phaser-preview/` concluída ([workflow #38964449033](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38964449033)); Canvas preservado.
- [ ] Validar visualmente em dispositivos reais e medir consumo de memória/FPS.
- [ ] Revisar feedback em todas as habilidades, especialmente LOS e status de terreno.

**Escopo preciso:** o painel de habilidades passou a ser incremental. O log, as opções de upgrade e o overlay do mapa ainda possuem redesenho por ação, e FPS/memória precisam de benchmarks. [Guia M3e](../docs/M3E_HUD_FEEDBACK.md).

### M3f — Cache de overlays, registro e menu de melhorias (**implementado; CI pendente**)
- [x] Evitar redesenho completo de efeitos/alcance da grade quando missão, terreno, clima, turno, atores e seleção não mudarem.
- [x] Regenerar overlays em movimentos válidos, seleção diferente, mudança de magia, rodada ou ambiente; limpar assinatura ao trocar de campanha ou missão.
- [x] Atualizar o DOM do registro de combate só se as cinco mensagens atuais mudaram.
- [x] Reutilizar opções de upgrade enquanto permanecer na mesma tela de vitória.
- [x] Telemetria `data-overlay-draws`, `#battleLog[data-builds]` e `#upgradeOptions[data-builds]`, visível em “Como testar”.
- [x] Teste Playwright: inspeção e alvo inválido não redesenham; movimento real gera um novo overlay e log.
- [ ] Core, Vite e Chromium desktop/mobile verdes no commit final da publicação.
- [ ] Beta do Pages e QA manual, especialmente movimentos, alcance de magia e upgrades.

**Limite do incremento:** a assinatura ainda percorre o estado para detectar mudanças. Redução de operações Graphics/DOM não equivale a FPS aferido em dispositivo físico. [Guia M3f](../docs/M3F_RENDER_CACHE.md).

### M3g — Objetivos vivos e transição missão 1 → 2 (**implementado, validação em andamento**)
- [x] Compartilhar interpretação das sete modalidades de objetivo com `missionOutcome()` por uma função pura `missionProgress()`.
- [x] Exibir ato, número da operação, meta, andamento numérico e barra acessível de progresso durante a batalha.
- [x] Comunicar vitória/derrota com mensagem contextual e atualizar meta na mudança de missão.
- [x] Teste de core para eliminação, resgate, totens, seis rodadas, purificação, marcos e chefe sem mutação.
- [x] Smoke Chromium com importação de save válido próximo da vitória, ação real que conclui a missão, escolha de melhoria e início da missão 2.
- [ ] CI 24+ testes, compilação Phaser e Playwright desktop/mobile verde.
- [ ] Publicar novo beta com SHA aprovado e testar no Pages.
- [ ] Jogar a missão 1 por inteiro sem fixture; avançar até a missão 8 e os três finais.

**Limite:** teste de transição usa fixture próxima da vitória, não a resolução humana de todo o combate. [Guia técnico M3g](../docs/M3G_MISSION_GOALS.md).

### M4 — Campanha 8 missões
- [ ] Telas de briefing, vitória, derrota, retry e progressão.
- [ ] Todas as condições de vitória e derrota; dificuldade completa.
- [ ] Três finais preservados, narrativa de Ironwood/Eldroth/Sylara.
- [ ] Importação de save legado real e validação de versão de schema.
- [ ] Simulações longas determinísticas com regressões do Canvas.

**Aceite:** concluir as 8 missões e atingir os três finais por escolhas/estatísticas correspondentes.

### M5 — PWA e release
- [x] Compilar e copiar o **beta M3b** do Phaser em `main/phaser-preview/` por GitHub Actions, com commit de origem fixado em `9ffc7029`, preservando arquivos Canvas.
- [x] Publicar o build isolado no Pages e impedir cache obsoleto do beta pelo service worker Canvas.
- [ ] Homologar carregamento e atualização em dispositivos físicos (Android/iOS), desempenho e compatibilidade de saves de produção.
- [ ] Service Worker versionado, assets cacheados, limpeza de caches antigos.
- [ ] Web Manifest e botão manual de instalação onde for possível.
- [ ] Teste em modo avião e atualização sem perder saves.
- [ ] Revisão acessibilidade, performance, áudio, créditos e auditoria de licenças.
- [ ] Release versionada, notas, rollback pronto e merge só após gates.

**Aceite:** jogo completo instalável e offline, sem perda de progresso. A prévia não substitui `main` antes disso.

## Invariantes e riscos

1. **Preservação da regra:** nenhuma alteração de dano, alcance, clima ou IA dentro de `BattleScene.ts`; o renderizador apenas chama o core.
2. **Compatibilidade:** save `ver:1` do Canvas pode ser validado/importado, mas a sequência RNG do legado não é reproduzível retroativamente.
3. **Segregação:** nova chave `ironwood_phaser_preview_v1`, mantendo intacto o save do Canvas.
4. **Assets:** o manifesto **não autoriza** copiar qualquer material listado; cada arquivo precisa ter CC0/licença verificada.
5. **CI vs homologação:** build+smoke confirma funcionalidades amostradas, não todas as magias nem oito partidas reais.
6. **Branching:** PR #3 (baseline), #5 (core), #7 (Phaser); mudanças de arte e release em PRs menores.
7. **Entregas:** cada PR deve informar arquivos, testes, resultados, screenshots, riscos e pendências.

## Como executar a prévia

```bash
cd phaser
npm install
npm run dev
```

Para testar o pacote compilado, execute `npm run build` e `npm run preview`. [README](README.md) explica o fluxo. O workflow `Ironwood Phaser preview` publica o build e screenshots como artefatos de cada execução (não se trata de uma página pública).


## Playtest público — beta M3a

**URL:** [https://pedromaintenance.github.io/ironwood-a-ultima-resistencia/phaser-preview/](https://pedromaintenance.github.io/ironwood-a-ultima-resistencia/phaser-preview/)

O workflow `.github/workflows/publish-phaser-beta.yml`, presente na `main`, construiu a branch **M3a** testada e fez commit dos arquivos prontos na subpasta `phaser-preview/`. A versão antiga continua na raiz do Pages. Este **não** é um merge do novo motor com o Canvas: é um compilado independente e reversível.

A interface de mira **M3b** foi compilada do commit `9ffc7029`, validado pela CI, e enviada ao beta público via GitHub Actions. O PR #13 continua **draft** enquanto aguardamos homologação humana.

**Roteiro de teste:** escolher três heróis, inspecionar uma unidade, mover, atacar, conjurar, encerrar turno, salvar e recarregar. Problemas conhecidos: sem PWA offline independente, sem QA físico, sem playthrough integral e nenhuma garantia de balanceamento das oito missões.

## Próxima entrega e rastreamento

- **M3c — otimização de sprites:** [especificação](../docs/M3C_RENDER_POOL.md), [PR #14](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/14); **validada automaticamente** e compilada para o Pages com fonte fixa `32cbfd7b`. Revisão humana/física permanece pendente.
- **Sem merge no Canvas original:** o Pages testa compilados isolados em `/phaser-preview/`. Publicar não equivale a fechar revisão de código nem validar hardware físico.

## Histórico de entregas

| Incremento | Branch | Evidência |
|---|---|---|
| M1 — lobby + saves + mobile emulado | `feat/phaser-battle-preview` | [PR #7](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/7) |
| M2a — 36 texturas pixel originais; atlas e novo renderer | `feat/phaser-pixel-art-m2` | [Guia artístico](../docs/PIXEL_ART_M2.md), [CI](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38838968563) |
| M3a — inspeção, cache estático, previewSkill no core, smoke mobile | `feat/phaser-combat-ux-m3` | [Guia M3a](../docs/M3_COMBAT_UX.md), [CI](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38880712097) |

O compromisso de manter o jogo Canvas original publicado na `main` permanece. As novas texturas não fazem reivindicação de vínculo ou origem nos packs Kenney.

| M3b — área inicial de magias, risco a aliados e confirmação dupla | `feat/phaser-impact-preview-m3b` | [Especificação M3b](../docs/M3B_IMPACT_PREVIEW.md), [CI 24/24](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38955658327), [Pages](https://pedromaintenance.github.io/ironwood-a-ultima-resistencia/phaser-preview/) |
