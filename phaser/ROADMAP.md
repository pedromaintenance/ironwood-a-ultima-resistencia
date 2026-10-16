# Roadmap executivo — Ironwood Phaser

**Atualização:** 16 de outubro de 2026 — marco M3a  
**Jogo público:** `main` continua executando o Canvas legado.  
**Ramo da prévia:** `feat/phaser-pixel-art-m2` (baseado em `feat/phaser-battle-preview`), com PR dependente [#7](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/7).  
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
| Renderer incremental | M3a concluído parcialmente | 144 sprites estáticos reutilizados; layers separados para terreno/efeitos/unidades | Pool de unidades, culling e profiling físico |
| PWA e publicação | Não iniciada no Phaser | Legado mantém PWA atual | SW, manifest, instalação e offline do Vite |

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

### M3 — Combate legível e input robusto (**M3a publicado como beta; M3b implementado na branch de desenvolvimento**)
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
- [ ] **M3b:** validar o commit final no CI e revisar screenshots desktop/mobile, antes de integrar ao beta público.
- [ ] **M3b:** fila de ações durante tweens, hit/miss, objetivos, sprites de unidades em pool e feedback de custos.
- [ ] **M3b:** acessibilidade com anúncios descritivos, teclado completo, tablet, física de render e benchmark FPS/memória.
- [ ] Testar uma missão integral sem atalhos de QA, em Android/iOS físico.

**Aceite parcial:** motor e Phaser passaram em testes unitários/de paridade e smoke; o cache de terreno é real, porém o renderer **ainda recria unidades e overlays a cada ação**. A visualização de alvo e da **área geométrica inicial** existe. A propagação ambiental e danos finais continuam sendo resolvidos pelo motor no momento da ação. [Guia técnico M3a](../docs/M3_COMBAT_UX.md).

### M4 — Campanha 8 missões
- [ ] Telas de briefing, vitória, derrota, retry e progressão.
- [ ] Todas as condições de vitória e derrota; dificuldade completa.
- [ ] Três finais preservados, narrativa de Ironwood/Eldroth/Sylara.
- [ ] Importação de save legado real e validação de versão de schema.
- [ ] Simulações longas determinísticas com regressões do Canvas.

**Aceite:** concluir as 8 missões e atingir os três finais por escolhas/estatísticas correspondentes.

### M5 — PWA e release
- [x] Compilar e copiar o **beta M3a** do Phaser em `main/phaser-preview/` por GitHub Actions, preservando os arquivos da versão Canvas.
- [ ] Homologar disponibilidade pública no Pages, `base`, cache e compatibilidade de atualização em dispositivos físicos.
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

A nova interface de mira **M3b** está em `feat/phaser-impact-preview-m3b` e entra no beta público **somente após testes e uma nova execução da publicação**.

**Roteiro de teste:** escolher três heróis, inspecionar uma unidade, mover, atacar, conjurar, encerrar turno, salvar e recarregar. Problemas conhecidos: sem PWA offline independente, sem QA físico, sem playthrough integral e nenhuma garantia de balanceamento das oito missões.

## Histórico de entregas

| Incremento | Branch | Evidência |
|---|---|---|
| M1 — lobby + saves + mobile emulado | `feat/phaser-battle-preview` | [PR #7](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/7) |
| M2a — 36 texturas pixel originais; atlas e novo renderer | `feat/phaser-pixel-art-m2` | [Guia artístico](../docs/PIXEL_ART_M2.md), [CI](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38838968563) |
| M3a — inspeção, cache estático, previewSkill no core, smoke mobile | `feat/phaser-combat-ux-m3` | [Guia M3a](../docs/M3_COMBAT_UX.md), [CI](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38880712097) |

O compromisso de manter o jogo Canvas original publicado na `main` permanece. As novas texturas não fazem reivindicação de vínculo ou origem nos packs Kenney.

| M3b — área inicial de magias, risco a aliados e confirmação dupla | `feat/phaser-impact-preview-m3b` | [Especificação M3b](../docs/M3B_IMPACT_PREVIEW.md), CI aguardando validação |
