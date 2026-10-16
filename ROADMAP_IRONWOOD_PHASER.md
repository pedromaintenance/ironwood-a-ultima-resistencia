# Ironwood — A Última Resistência
## Roadmap de migração para Phaser 4.2.1

**Projeto:** RPG tático por turnos ambientado na Carcaça  
**Repositório:** https://github.com/pedromaintenance/ironwood-a-ultima-resistencia  
**Planejamento:** 15/10/2026  
**Estado:** execução sequencial; não substituir o jogo publicado antes de validar a nova versão.

## Prévia pública de testes — 16/10/2026

**[Jogar o Ironwood Phaser no Pages](https://pedromaintenance.github.io/ironwood-a-ultima-resistencia/phaser-preview/)** — build independente de `feat/phaser-combat-ux-m3`, publicado em `phaser-preview/`, sem substituir `/index.html`, `app.js` ou `sw.js` da versão Canvas. O processo de CI compilou o Phaser e publicou os arquivos com sucesso. A implantação do Pages deve estar verde antes da homologação no navegador do jogador.

**Teste rápido sugerido:** selecionar equipe, mover personagens, usar magia, inspecionar terreno, encerrar turno, salvar, recarregar e continuar. **Não é release final:** dispositivos físicos, oito missões e PWA offline do Phaser ainda pendentes. A chave de save `ironwood_phaser_preview_v1` permanece diferente da versão original.

**Publicação:** [workflow automatizado](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/workflows/publish-phaser-beta.yml) · [código da prévia](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/tree/main/phaser-preview) · [PR #11 (fonte)](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/11).

## Painel de execução — atualização de 16/10/2026

| Marco | Status verificável | Links |
|---|---|---|
| Fase 0 — Preservação Canvas | Baseline e browser emulado aprovados; teste em aparelho físico pendente | [PR #3](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/3) |
| Fase 1 — Core sem navegador | Regras extraídas, RNG reprodutível, saves verificados; testes diferenciais das 8 missões e 32 ações | [PR #5](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/5) |
| Fase 2 / M1 — Batalha Phaser e campanha | Phaser 4.2.1, lobby de seis heróis/equipe de três, dificuldades, autosave, importar/exportar, upgrades; Chromium desktop/mobile emulado | [PR #7](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/7) |
| Fase 3 / M2a — Identidade pixel-art | 36 texturas originais 16×16, tiles/figuras Phaser, efeitos do terreno sobrepostos; testes aprovados | [PR #8](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/8) |
| **M3a — Inspeção e renderização incremental** | **Implementado e validado automaticamente:** preview de magia compartilha LOS e validação com o core, inspeção de tile/unidade sem custo, cache permanente dos 144 tiles, layers de overlay/unidades, atalhos `I`/`Esc`; workflow roda testes core+Phaser | [PR #11](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/11) · [Issue #10](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/issues/10) · [CI](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38880712097) |
| M2b — Assets de terceiros | **Pendente**: Kenney/Tiddybub não incorporados; manifest de terceiros vazio. Arte atual é autoral local | [Manifest](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/blob/feat/phaser-combat-ux-m3/docs/assets-manifest.json) |
| M3b–M5 — AOE, animações, campanha integral, PWA | Pendentes: prévia de área inteira, pool de unidades, animação com trava de input, playthrough, saves físicos, offline e QA real | [Roadmap detalhado](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/blob/feat/phaser-combat-ux-m3/phaser/ROADMAP.md) |

### M3b — prévia de impacto (desenvolvimento isolado)

- **Branch:** `feat/phaser-impact-preview-m3b`.
- **[PR #13](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/13)** / **[Issue #12](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/issues/12)**.
- Implementados: área geométrica inicial 3×3/5×5/linha da magia, aviso de aliados em risco, hover de impacto sem gastar recursos, **dois toques para confirmar** magias ofensivas de área, testes específicos de 5×5/limites/salvamento.
- A propagação ambiental de fogo e de eletricidade continua sujeita às regras/aleatoriedade do motor, não é predita pelo indicador.
- **Status:** código implementado; CI de cobertura ampliada na fila. **Ainda não substituiu o beta M3a do Pages**. Só publicar M3b após build e smoke específicos aprovados.
- [Roadmap detalhado da branch](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/blob/feat/phaser-impact-preview-m3b/phaser/ROADMAP.md) · [documentação de limites](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/blob/feat/phaser-impact-preview-m3b/docs/M3B_IMPACT_PREVIEW.md).

### Prioridade seguinte — M3b

O caminho recomendado é **prévia fiel da área afetada por magias**, reutilizando a geometria do motor; depois, pool de personagens/efeitos e fila de comandos durante os tweens. O marco só pode ser concluído após playthrough real da missão 1, testes de performance e dispositivos físicos. A camada de terreno já é persistente, mas a camada dos atores **ainda é reconstruída** em cada ação. Os sprites externos ainda dependem de auditoria individual de licença.

**Proteção:** `main` segue com o jogo Canvas original publicado e com seus saves. Pull requests #3, #5, #7, #8 e #11 continuam independentes/em revisão; o Phaser usa `ironwood_phaser_preview_v1`. Testes emulados não equivalem à homologação física.

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
