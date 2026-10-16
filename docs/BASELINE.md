# Baseline estático — Ironwood original

> **Objetivo:** documentar a versão **pré-Phaser** para comparar comportamento com o motor extraído. Gerado por auditoria do repositório, **não equivale a um teste visual nem a uma partida executada**.

## Origem e preservação

- Repositório: [Ironwood](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia)
- Código original auditado: [app.js](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/blob/main/app.js)
- Blob SHA registrado para `app.js`: `62b621e7ce70fef88ccddfe6eda35918b9ce6555`
- Branch de migração: `feat/phaser-migration`; a branch `main` conserva o jogo em Canvas.
- Arquivos originais: `README.md`, `app.js`, `index.html`, `style.css`, `sw.js`, `manifest.webmanifest`, `free-asset-gallery.md`, `icons/icon-192.png`, `icons/icon-512.png`.

## Inventário de sistemas

| Sistema | Evidência extraída do código |
|---|---|
| Heróis | 6: guardian, ranger, mage, druid, cleric, runesmith |
| Inimigos | 6: spear, archer, wolf, witch, shade, boss (5 comuns e 1 chefe) |
| Missões | 8, agrupadas em 4 atos |
| Tipos de objetivo | kill, rescue, totem, survive, cleanse, beacon, boss |
| Habilidades em `SKILLS` | 32 incluindo `interact`; portanto **31 magias/manobras** + interação |
| Melhorias persistentes | hp, mp, power, defense, forest, focus |
| Casas | 12 × 12 = 144; canvas 480 × 480 no HTML; desenho atual 40 px/casa |
| Equipe | seleção de 3 dos 6 heróis |
| Ações | 2 PA/aliado/rodada, habilidade consome 1 PA + custo de mana |
| Mana | recuperação de 2 por rodada (limitada ao máximo) |
| Save | chave `ironwood_campaign_v1`, formato `ver:1`, `localStorage` com exportação/importação JSON |
| Aleatoriedade | `Math.random()` aparece 9 vezes; `seed` existe, mas não governa as escolhas |
| PWA | `sw.js`, `manifest.webmanifest`; cache deve continuar funcional |

### Missões

| # | Missão | Tipo |
|---:|---|---|
| 1 | A Trilha Fechada | `kill` |
| 2 | Os Nomes dos Desaparecidos | `rescue` |
| 3 | Totens da Servidão | `totem` |
| 4 | A Noite Mais Longa | `survive` |
| 5 | A Seiva Corrompida | `cleanse` |
| 6 | A Marcha das Cinzas | `kill` |
| 7 | Os Faróis do Crepúsculo | `beacon` |
| 8 | O Espinho da Rainha | `boss` |

### Habilidades (IDs canônicos)

```text
bash, guard, cleave, rally, mark, volley, snare, camouflage, firebolt, fireball, frost, web, fog, blink, entangle, spikes, rain, grow, sleet, purify, heal, bless, faerie, sunbeam, sanctuary, earthwall, lightning, gust, icewall, spark, mend, interact
```

### Classes de terreno e condições

- Terrenos-base: `grass`, `bush`, `tree`, `water`, `rock`, `bones`.
- Estados por casa em `makeBoard`: `fire`, `ice`, `wet`, `web`, `vines`, `thorns`, `fog`, `steam`, `charge`, `scorch`, `corrupt`, `wall`, `trap`, `glow`, `objective`, `objhp`, `cleared`, `texture`.
- Estados relevantes nas unidades: `ap`, `guard`, `bless`, `root`, `slowed`, `burn`, `marked`.
- `pathsFrom`: deslocamento ortogonal, custo 2 em terreno difícil e bloqueio por árvore, pedra, muralha ou outra unidade.
- `los`: linha de visão com Bresenham; árvores, pedras, muralhas, névoa e vapor podem bloquear.
- `worldTick`: avanço de duração de condições, incêndios, propagação, chuva e vento.
- Efeitos interativos: fogo se espalha e consome vegetação/teias; água apaga incêndios; gelo modifica área molhada; descargas propagam em água; teias e raízes limitam movimento; névoa afeta visão; corrupção causa dano/pode ser purificada.

### Condições de conclusão (do código)

- `kill`: nenhum inimigo vivo.
- `boss`: nenhum chefe vivo.
- `rescue`, `totem`, `cleanse`, `beacon`: nenhum objeto da missão ainda pendente.
- `survive`: rodada > 6.
- Derrota: todos os aliados mortos; é possível repetir a missão mantendo melhorias anteriores.
- Finais: dependem de árvores destruídas, ações de resgate/purificação e número de derrotas.

## Achados para revisão, sem alterar regras neste estágio

1. README menciona **32 ações especiais**, enquanto `SKILLS` contém **32 entradas incluindo `interact`**. Há portanto 31 magias/manobras e 1 ação de interação.
2. README informa 6 inimigos comuns mais chefe, mas `ENEMIES` contém 5 comuns mais chefe.
3. A `seed` salva não reproduz o tabuleiro porque o código ainda usa `Math.random()`.
4. A lógica tática, os toasts, o salvamento e a renderização compartilham variáveis globais/DOM em `app.js`, exigindo extração cuidadosa.

## Validação prática — ainda pendente

- [ ] Abrir o jogo original em desktop e capturar menu/equipe/combate/resultado.
- [ ] Concluir missão 1, verificando objetivo, vitória e salvamento.
- [ ] Exportar save **de teste**, anonimizado, como fixture de compatibilidade.
- [ ] Validar partida por toque em celular e modo offline.
- [ ] Rodar a matriz em [REGRESSION_CASES.md](REGRESSION_CASES.md).

**Gate G0:** a documentação está pronta; os itens de execução visual/manual acima precisam ser confirmados antes de declarar o baseline totalmente homologado.
