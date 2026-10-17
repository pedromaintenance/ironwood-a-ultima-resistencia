# Ironwood — A Última Resistência
## Roadmap de migração para Phaser 4.2.1

**Projeto:** RPG tático por turnos ambientado na Carcaça  
**Repositório:** https://github.com/pedromaintenance/ironwood-a-ultima-resistencia  
**Planejamento:** 15/10/2026  
**Estado:** execução sequencial; não substituir o jogo publicado antes de validar a nova versão.

## M4a — Ataques físicos a totens e objetivos legíveis (16/10/2026)

**Implementado no [PR #24](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/24), com CI 26/26 aprovada.** A M3g deixava uma lacuna frente ao Canvas original: tocar num totem sem magia tentava mover para a casa. A M4a reutiliza a função legada `attackStructure` por uma fachada validada `attackObjective`, recuperando o ataque básico a totens da missão 3, com as mesmas regras de PA, alcance, visão e dano. A ação inválida não grava save.

**Melhorias visuais:** prisioneiro, totem, foco de corrupção e marco ancestral ganharam símbolos próprios, também distintos pela forma. Totens mostram a integridade e o modo Inspecionar explica como concluir cada objetivo. Testes cobrem dois golpes físicos, dano e progresso do totem sem alterar balanceamento.

- [x] Implementação do ataque a estruturas e marcadores por tipo, com [documentação M4a](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/blob/feat/phaser-objective-attacks-m4a/docs/M4A_OBJECTIVE_ATTACKS.md).
- [x] Testes de core e smoke Chromium adicionados para clique, PA, integridade, persistência e progresso.
- [x] [CI M4a — 26/26 testes, build e Chromium desktop/mobile aprovados](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38984312201) para o SHA imutável `8e1fdf77`.
- [ ] [Workflow de publicação M4a disparado](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38984544789); confirmar a cópia do build e a implantação do GitHub Pages; [Issue #25](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/issues/25).
- [ ] Playthrough completo da missão 1 sem fixture, campanha integral de 8 missões/3 finais e aparelhos físicos.

**Beta confirmada até a aprovação:** [M3g no Pages](https://pedromaintenance.github.io/ironwood-a-ultima-resistencia/phaser-preview/). A versão Canvas original na raiz e os respectivos saves permanecem preservados.

## Beta M3g — objetivos e transição entre missões (16/10/2026)

**[JOGAR IRONWOOD — BETA PHASER M3g](https://pedromaintenance.github.io/ironwood-a-ultima-resistencia/phaser-preview/)**

O artefato foi compilado do SHA **`bfffb911`**, aprovado em [25/25 testes de core, build Vite/Phaser e smoke Chromium desktop/mobile](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38969025016). O [workflow seguro de publicação](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38969342926) verificou o resultado do CI e gravou o build em `main/phaser-preview/`. **A verificação de implantação final do GitHub Pages é separada da gravação do build.**

**Novidade M3g:** o painel da batalha agora mostra o ato, operação 1–8, nome do objetivo, barra acessível e quantos inimigos, prisioneiros, totens, focos ou faróis faltam; para sobrevivência, exibe as rodadas, e para o chefe, os PV restantes. A função pura `missionProgress()` lê o mesmo estado usado por `missionOutcome()` — **nenhuma regra ou save foi alterado**.

**Validação de transição:** o Playwright importou uma fixture v1 válida **próxima da vitória**, executou uma ação real do motor, verificou vitória e três opções de upgrade, selecionou uma melhoria e iniciou a segunda missão com **2 prisioneiros pendentes**. Isso **não equivale a um playthrough completo** do primeiro combate. O teste de core cobre as sete categorias de objetivos, totalizando agora 25 testes.

**O que testar no Pages:** comece uma campanha; acompanhe “Expulsar a patrulha” e a contagem de 4 inimigos, inspecione/mova a equipe, confira a evolução do objetivo, os efeitos do terreno, avisos de habilidades e o contador aproximado de FPS no guia de testes. Tente concluir a missão 1 e escolha uma melhoria para observar a meta da missão 2.

**Garantia de integridade:** o [Canvas original](https://pedromaintenance.github.io/ironwood-a-ultima-resistencia/) permanece na raiz. O Phaser roda somente em `/phaser-preview/`, com save próprio `ironwood_phaser_preview_v1`; `ironwood_campaign_v1`, `app.js` e `sw.js` não foram substituídos.

**Estado:** implementação e CI concluídas, beta compilada; [PR #22](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/22) permanece draft para QA humano, hardware físico, primeira missão integral, oito missões/três finais e PWA offline independente. [Guia técnico M3g](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/blob/feat/phaser-mission-goals-m3g/docs/M3G_MISSION_GOALS.md) · [Issue #23](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/issues/23).

## Painel de execução — atualização de 16/10/2026

| Marco | Status verificável | Links |
|---|---|---|
| Fase 0 — Preservação Canvas | Baseline e browser emulado aprovados; teste em aparelho físico pendente | [PR #3](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/3) |
| Fase 1 — Core sem navegador | Regras extraídas, RNG reprodutível, saves verificados; testes diferenciais das 8 missões e 32 ações | [PR #5](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/5) |
| Fase 2 / M1 — Batalha Phaser e campanha | Phaser 4.2.1, lobby de seis heróis/equipe de três, dificuldades, autosave, importar/exportar, upgrades; Chromium desktop/mobile emulado | [PR #7](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/7) |
| Fase 3 / M2a — Identidade pixel-art | 36 texturas originais 16×16, tiles/figuras Phaser, efeitos do terreno sobrepostos; testes aprovados | [PR #8](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/8) |
| **M3a — Inspeção e renderização incremental** | **Implementado e validado automaticamente:** preview de magia compartilha LOS e validação com o core, inspeção de tile/unidade sem custo, cache permanente dos 144 tiles, layers de overlay/unidades, atalhos `I`/`Esc`; workflow roda testes core+Phaser | [PR #11](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/11) · [Issue #10](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/issues/10) · [CI](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38880712097) |
| M2b — Assets de terceiros | **Pendente**: Kenney/Tiddybub não incorporados; manifest de terceiros vazio. Arte atual é autoral local | [Manifest](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/blob/feat/phaser-combat-ux-m3/docs/assets-manifest.json) |
| **M3b — Mira de área e proteção contra fogo amigo** | **Publicada em beta:** AOE inicial, avisos de aliados atingíveis, duplo toque, guia de playtest, save protegido no primeiro toque; 24 testes e Chromium aprovados | [PR #13](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/13) · [CI](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38955658327) · [Pages](https://pedromaintenance.github.io/ironwood-a-ultima-resistencia/phaser-preview/) |
| **M5 parcial — Distribuição segura no Pages** | Build testado compilado de SHA fixo, pasta independente `phaser-preview/`, limpeza de assets obsoletos e SW Canvas não intercepta preview | [Deploy](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38955974230) · [Workflow](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/blob/main/.github/workflows/publish-phaser-beta.yml) |
| **M3c — Pool de sprites dos combatentes** | **Implementado, testado e distribuído como beta:** sprite e contêiner persistentes, cache de terreno, contadores de alocação e testes de estabilidade | [PR #14](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/14) · [CI 24/24](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38957047595) |
| **M3d — Travamento seguro de comandos durante animações** | **Implementado, 24/24 testes e CI/browser aprovados, build beta publicado:** o jogador não gasta PA ou RNG em clique repetido durante movimento; inspeção e seleção continuam | [PR #16](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/16) · [CI](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38961163306) · [publicação](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38961411555) |
| **M3e — HUD incremental e feedback** | **CI verde e beta compilada no Pages:** botões/foco persistentes, mensagens de comandos recusados e saves preservados; 24/24 core + smoke Chromium | [PR #18](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/18) · [CI](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38964097106) · [Beta](https://pedromaintenance.github.io/ironwood-a-ultima-resistencia/phaser-preview/) |
| **M3f — overlays/log incrementais e FPS** | **Publicado em beta:** cache de overlay, registro e upgrades, contagem passiva de FPS; core 24/24 e Chromium aprovados | [PR #20](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/20) · [CI](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38966907392) · [publicação](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38967434066) |
| **M3g — objetivos e fluxo até a próxima missão** | **25/25 testes e workflow de publicação aprovados:** sete tipos de objetivo, progresso acessível, vitória real por fixture e escolha de melhoria | [PR #22](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/22) · [CI](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38969025016) · [publicação](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38969342926) |
| **M4a — totems físicos e marcadores de objetivos** | **CI 26/26 e Chromium aprovados; publicação aguardando:** ataque físico a totem e símbolos de objetivos, com teste de dois golpes | [PR #24](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/24) · [Issue #25](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/issues/25) |
| Próximos M4–M5 — campanha integral, QA e distribuição | Pendente: jogar missão 1 sem fixture, oito missões e três finais, medir FPS/memória em hardware real, PWA instalável e offline | [Issue #23](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/issues/23) |

### M3e — HUD incremental e feedback (CI e publicação concluídas)

**[JOGAR BETA M3e NO PAGES](https://pedromaintenance.github.io/ironwood-a-ultima-resistencia/phaser-preview/)** · [PR #18](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/18) · [Issue #19](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/issues/19) · [Guia técnico](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/blob/feat/phaser-hud-feedback-m3e/docs/M3E_HUD_FEEDBACK.md).

O commit **`fd27434a`** passou em [24/24 testes do core e smoke Chromium desktop/mobile](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38964097106). O [workflow de publicação](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38964449033) concluiu com sucesso, compilando somente `main/phaser-preview/` e preservando o Canvas em `main/index.html`. O job do Pages é uma validação separada do upload dos arquivos.

- [x] **HUD persistente:** reaproveitar os botões/listeners de habilidades enquanto o conjunto de magias não muda; atualizar somente `disabled`, `active` e `aria-pressed`.
- [x] **Foco e teclado:** preservar o foco do botão ao escolher uma magia e reforçar `focus-visible`.
- [x] **Feedback acessível:** informar ataques/movimentos/magias indisponíveis, usando motivos retornados pela prévia do motor e um painel `aria-live`.
- [x] **Saves:** comandos inválidos e simples seleção de aliados não sobrescrevem o save separado do Phaser.
- [x] **Telemetria e regressão:** `#skills[data-builds]`, foco de habilidade e save estável verificados no Chromium; 24/24 testes de core.
- [ ] **QA humano:** validar em desktop e Android/iOS reais; completar missão 1 e as oito missões, testar FPS/memória, orientar PWA/offline.

**Como testar:** escolha três heróis, abra o combate e use o botão de uma magia. A seleção deve manter o foco de teclado. Escolha uma casa distante/impossível e observe a mensagem de recusa sem gastar mana ou alterar o save; depois faça uma ação válida, encerre o turno e continue a campanha após recarregar.

**Integridade:** a [versão Canvas original](https://pedromaintenance.github.io/ironwood-a-ultima-resistencia/) continua independente; os saves seguem em `ironwood_campaign_v1` (Canvas) e `ironwood_phaser_preview_v1` (Phaser).

### Próximas entregas — M3f, M4 e M5

**M3d concluída nos testes automatizados:** o combate agora recusa ordens mutantes durante os tweens e expõe o motivo; nenhuma ação é enfileirada para execução futura, evitando alvo obsoleto. O código permanece em PR draft; o beta foi distribuído somente como artefato isolado.

**M3e — UX e desempenho:**
- [x] M3c: cache de 144 tiles e objetos persistentes de personagens.
- [x] M3d: bloquear movimentos, ataques, magias e encerramento de turno durante animações, mantendo inspeção e seleção.
- [ ] Reduzir reconstrução de botões do HUD e redesenho de overlays; realizar pooling de VFX.
- [ ] Melhorar feedback de alvo inválido, erro/dano, visualização de cobertura e teclado para mira em grade.
- [ ] Medir FPS/memória/bateria em hardware real e validar opção de movimento reduzido.

**M4/M5 — campanha e release:**
- [ ] Jogar a missão 1 inteira com objetivos reais, depois oito missões e três finais.
- [ ] Validar saves reais de Canvas e casos de corrupção/interrupção.
- [ ] Testar Android/iOS físico (incluindo toques rápidos) e acessibilidade.
- [ ] Instalação do beta como PWA próprio e teste offline seguro.
- [ ] Preparar critérios de substituição da versão Canvas somente após homologação.

**Regra:** `main` continua hospedando o Canvas original; publicar betas Phaser na subpasta não equivale a mesclar os PRs ou concluir QA físico.

## 1. Objetivo

Migrar Ironwood de Canvas 2D artesanal para **Phaser + TypeScript + Vite**, preservando o sistema de combate por turnos e a operação offline (PWA). A floresta continua sendo a mecânica central: clima, fogo, água, gelo, teias, raízes, névoa, eletricidade e corrupção devem continuar interagindo com combate, caminhos e objetivos.

### Base existente

- 8 missões e 4 atos, com 3 finais narrativos.
- 6 heróis, equipes de 3, 2 pontos de ação por turno.
- 12×12 casas procedurais, IA, terreno dinâmico e clima.
- Magias/manobras definidas em `SKILLS`; verificar divergência de contagem editorial (README menciona 32).
- `ENEMIES` declara cinco inimigos comuns e um chefe; o README menciona seis tipos comuns e um chefe. Corrigir somente após auditoria.
- Saves JSON e localStorage (chave `ironwood_campaign_v1`, formato `ver:1`).
- PWA instalável com `sw.js` e `manifest.webmanifest`.
- Arquivos: `index.html`, `style.css`, `app.js`, `sw.js`, `manifest.webmanifest`, `free-asset-gallery.md`, `icons/`.

**Princípio:** preservar toda a mecânica antes de qualquer mudança de balanceamento ou expansão narrativa.

## 2. Stack e arquitetura proposta

- Phaser (versão fixada no lockfile, confirmar compatibilidade na fase de scaffolding).
- TypeScript, Vite, Vitest e Playwright.
- Renderização por Tilemaps, Sprites, Tweens, Particles e cenas.
- GitHub Pages com `base: '/ironwood-a-ultima-resistencia/'`.
- HUD HTML/CSS inicialmente reaproveitado, favorecendo acessibilidade e toque.
- Sem engine de física: combate, IA, alcance, terreno e caminhos ficam no core.
- Saves: leitor `ver:1`, futura gravação `ver:2` somente após migração e testes.
- Build e recursos disponíveis offline sem CDN obrigatória.

### Organização-alvo

```text
src/
  main.ts
  game/
    scenes/BootScene.ts MenuScene.ts SquadScene.ts BattleScene.ts ResultScene.ts
    render/BoardRenderer.ts UnitRenderer.ts EffectRenderer.ts
    input/GridInput.ts
  core/
    data/heroes.ts enemies.ts missions.ts skills.ts upgrades.ts
    combat/turns.ts actions.ts damage.ts targeting.ts
    terrain/board.ts rules.ts climate.ts
    ai/enemyAI.ts
    campaign/state.ts objectives.ts progression.ts
    rng/seededRandom.ts
  ui/
  services/SaveManager.ts AssetRegistry.ts
public/
  assets/tiles/ characters/ enemies/ effects/ ui/ audio/
  manifest.webmanifest
  icons/
tests/
docs/assets-manifest.json
```

## 3. Roadmap — executar uma fase por vez

### Fase 0 — Preservação, inventário e baseline [P0]
- [ ] Criar a branch `feat/phaser-migration` partindo da `main`, mantendo o jogo publicado intacto.
- [ ] Registrar versão original e inventário de arquivos, heróis, inimigos, habilidades, objetivos, terrenos e saves.
- [ ] Documentar comportamento observável de alcance, movimento, ataque, turno, IA, ambiente e vitória/derrota.
- [ ] Criar fixtures com mapa, grupo e sequência de ações de referência; preservar saves de teste sem informações pessoais.
- [ ] Definir casos de regressão para comparar jogo original e futuro core.

**Gate G0:** versão original preservada, inventário verificável e casos comparativos definidos.

### Fase 1 — Extrair motor de regras e testes [P0]
- [ ] Separar `HEROES`, `MISSIONS`, `ENEMIES`, `SKILLS` e `UPGRADES` de DOM e Canvas.
- [ ] Extrair tabuleiro, pathfinding, linha de visão, combate, IA, clima e objetivos.
- [ ] Substituir `G` global em regras por `GameState` explícito.
- [ ] Core deve devolver estado e eventos semânticos, e não manipular interface.
- [ ] Injetar PRNG determinístico (a seed já é persistida, mas `Math.random()` ainda é usado).
- [ ] Testar fogo+água, gelo+água, teia+fogo, eletricidade+água, névoa+linha de visão, raízes+movimento e corrupção+purificação.

**Gate G1:** resolução de missão sem interface; testes repetíveis; regras principais equivalentes ao original.

### Fase 2 — Primeira missão em Phaser [P0] — MVP
- [ ] Criar app Phaser + Vite + TypeScript, BootScene e BattleScene.
- [ ] Renderizar tabuleiro 12×12 com terreno e efeitos do core.
- [ ] Exibir três aliados e inimigos com sprites temporários autorizados.
- [ ] Seleção, alcance, caminho, ataque, magia, turno adversário e objetivo com pointer/touch.
- [ ] Animar movimento, dano, morte e mudança de turno; HUD HTML inicialmente.
- [ ] Concluir *A Trilha Fechada* até vitória/derrota e retornar ao menu.

**Gate G2 — MVP:** missão 1 jogável em desktop e celular sem regressão aparente.

### Fase 3 — Pipeline de free-assets [P0]
- [ ] Usar `free-asset-gallery.md` como catálogo, não como licença global.
- [ ] Priorizar Kenney Roguelike/RPG e Characters; explorar Tiddybub `fantasy`, `nature`, `effects` e `ui`.
- [ ] Escolher família visual-base, mesma perspectiva, grade, escala e paleta.
- [ ] Usar tiles de 16×16 ampliados 2× quando necessário, grade lógica 32×32.
- [ ] Mapear `tree`, `bush`, `water`, `rock`, `bones`, `fire`, `web`, `fog`, `corrupt` etc. para atlas e efeitos.
- [ ] Criar `docs/assets-manifest.json`: caminho, URL, autor, licença, atribuição, alterações e uso.
- [ ] Produzir sprites personalizados para heróis e antagonistas principais.

**Aceite:** todas as unidades e terrenos do MVP são legíveis; 100% dos assets importados têm procedência/licença.

### Fase 4 — Paridade completa de combate [P0]
- [ ] Integrar seis heróis e todas as habilidades presentes em `SKILLS`.
- [ ] IA, condições, dano em estruturas, obstáculos, objetivos e clima.
- [ ] VFX refletem o estado do core, sem alterá-lo.
- [ ] Otimizar camadas/dirty tiles e isolar input durante animações críticas.
- [ ] Testes para friendly fire, empurrões, line-of-sight, cobertura e interação ambiental.

**Gate G3:** matriz de paridade aprovada para o conjunto de regras do jogo original.

### Fase 5 — Experiência audiovisual e mobile [P1]
- [ ] Animações de movimento, ataques, feitiços, clima e feedback de impactos.
- [ ] HUD responsivo e controles grandes, inclusive telas de 360×800.
- [ ] Teclado, mouse e touch; zoom opcional; legibilidade do tabuleiro.
- [ ] Audio/mute/volume e política mobile de autoplay.
- [ ] Opção de movimento reduzido, contraste e feedback além da cor.

**Aceite:** jogabilidade fluida e acessível em celular e desktop.

### Fase 6 — Campanha integral [P1]
- [ ] 8 missões, 4 atos; objetivos `kill`, `rescue`, `totem`, `survive`, `cleanse`, `beacon`, `boss`.
- [ ] Três finais, progressão persistente, três dificuldades e equipe.
- [ ] Briefings, diálogos, tela entre missões, diário e resultado.
- [ ] Saves antigos importados e retomada após fechar/reabrir.

**Gate G4:** campanha inteira concluível, resultados e estatísticas consistentes.

### Fase 7 — PWA e publicação [P0 para release]
- [ ] CI: testes, build, deploy de GitHub Pages.
- [ ] Configuração correta de base Vite.
- [ ] Cache versionado de bundles e assets, sem depender de CDN.
- [ ] Atualizar/substituir com segurança o SW antigo (`sw.js` com lista manual).
- [ ] Instalação no Android/desktop, instruções para iOS e controle manual de instalação quando aplicável.
- [ ] Modo avião após primeiro acesso e upgrade sem perda de save.

**Gate G5:** instalável, jogável offline e atualizável de forma segura.

### Fase 8 — QA e lançamento [P1]
- [ ] Testes unitários e E2E em browsers representativos.
- [ ] Saves antigos/inválidos, tela pequena, interrupções e cache.
- [ ] Conferir desempenho, tamanho do download, paleta, alinhamento, áudio e créditos.
- [ ] Publicar release estável e conservar rollback da versão anterior.

**Aceite:** zero bugs bloqueantes conhecidos; gates e testes aprovados.

## 4. MVP: checklist

- [ ] Mapa 12×12 com sprites e geração procedural.
- [ ] Três combatentes selecionáveis.
- [ ] Movimento com alcance e custo.
- [ ] Ataque básico e IA adversária.
- [ ] Pelo menos três magias interagindo com terreno.
- [ ] Vitória e derrota da missão 1.
- [ ] Save/retomada.
- [ ] Toque e mouse.

## 5. Riscos

1. Acoplamento de regras, DOM e Canvas no `app.js`: refatoração incremental com cenários de comparação.
2. `Math.random()` apesar da `seed` registrada: PRNG explícito e reproduzibilidade de testes.
3. Licenças heterogêneas em repositórios de assets: conferir pacote/arquivo e registrar proveniência.
4. Perspectiva/escala inconsistentes: uma família artística como base, demais mediante adaptação.
5. `ver:1` quebrar: leitor legado, versão nova somente após migração e backup.
6. Cache obsoleto de PWA: troca segura do Service Worker e estratégia de atualização versionada.
7. Performance mobile: limitar VFX e medir em dispositivos reais.
8. Aumento prematuro de escopo: nenhuma nova campanha/multiplayer/editor antes da paridade.

## 6. Prioridades

**P0:** baseline, core, testes, MVP da missão 1, todos os estados de terreno, licenças, saves, offline.  
**P1:** campanha completa, sprites finais, áudio, acessibilidade, polimento e release.  
**P2 (pós-lançamento):** editor de mapas, missões novas, coop, novos sistemas políticos.

## 7. Próxima ação

**Executar a Fase 0**, registrar seu resultado em `docs/BASELINE.md` e `docs/REGRESSION_CASES.md` na branch de migração. Somente após gate G0 aprovado, abrir o desenvolvimento do core. Manter o `main` jogável durante todo o trabalho.

## Referências

- [Código original](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia)
- [Biblioteca de free-assets](free-asset-gallery.md)
- [Phaser](https://phaser.io/)
- [Kenney Roguelike/RPG](https://kenney.nl/assets/roguelike-rpg-pack)
- [Kenney Characters](https://kenney.nl/assets/roguelike-characters)
- [Tiddybub 2D assets](https://github.com/Tiddybub/2d-assets)
