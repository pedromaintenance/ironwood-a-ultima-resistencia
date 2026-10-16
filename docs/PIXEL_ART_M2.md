# Ironwood — guia de pixel-art original (M2)

**Escopo:** arte procedural **autorada no próprio projeto**, sem arquivos binários de terceiros. O objetivo é criar uma direção visual independente, legível e reproduzível enquanto o pipeline de importação de packs externos é desenvolvido.

## Entrega atual

A classe `phaser/src/PixelAtlas.ts` constrói **36 texturas de 16×16 pixels** e as registra no gerenciador de texturas do Phaser:

| Família | Quantidade | Chaves |
|---|---:|---|
| Chão/terreno | 24 | `ironwood-ground-{grass,bush,tree,rock,water,bones}-{0..3}` |
| Heróis | 6 | `ironwood-unit-{guardian,ranger,mage,druid,cleric,runesmith}` |
| Inimigos | 6 | `ironwood-unit-{spear,archer,wolf,witch,shade,boss}` |

Os ladrilhos variam por um hash determinístico derivado de `tile.texture`, valor fornecido pelo motor de campanha. Assim, a mesma missão reproduz a mesma variação visual; nenhuma chamada extra ao PRNG do jogo foi adicionada.

Cada personagem possui uma silhueta distinta. A facção continua indicada por contorno e barra de PV. O terreno muda de aparência conforme `tile.base`, e os efeitos dinâmicos existentes (fogo, gelo, água, corrupção etc.) são desenhados **sobre** os tiles, sem alterar dados do motor.

**Direção artística:** dark fantasy florestal, sombras frias verde-petróleo, ruínas em cinza opaco, metal bronzeado, vermelho/roxo para a Corte e destaques de luz controlados. Escala visual 16px→40px por célula na grade de 12×12.

## Fonte e licenças

- **Arte atual:** desenhada como código neste próprio projeto; nenhuma imagem de Kenney foi copiada, baixada, embutida ou referenciada remotamente.
- **Pacotes externos:** permanecem candidatos, **não incorporados**. Antes de adicionar quaisquer arquivos Kenney ou Tiddybub, verificar licença específica, origem, versões, compatibilidade estética e registrar a atribuição/termos no `docs/assets-manifest.json`.
- Manifesto: [docs/assets-manifest.json](../docs/assets-manifest.json), campo `original_art` e array `assets` para terceiros (vazio).

## Testes e critérios

```bash
cd phaser
npm install
npm run build
npm run preview
```

O smoke no Chromium verifica `#game[data-art="original-16px-pixel-atlas"][data-textures="36"]`, abertura do lobby, movimento, turno, magia, saves e tela mobile. O workflow gera screenshots e um build arquivado.

**Limitações:** a paleta/texturas são a primeira iteração; não são spritesheets animados por frames. Ainda é necessário validar contraste, legibilidade e estética em dispositivos físicos. Eventos de animação, feedback de magias e tempo de resposta devem ser evoluídos sem alterar as regras da engine.

## Próximos incrementos

1. Inspeção de terreno, seleção de alvos, projeção de AOE e legenda em celular.
2. Animações de golpes e magias, partículas da floresta, alterações de terreno.
3. Otimização do renderer: evitar destruir e recriar todos os objetos a cada clique.
4. Assets oficiais de terceiros com arquivo + licença auditada, quando de fato incorporados.
5. QA, playthrough da missão 1, depois campanha completa, offline/PWA.

Todos os critérios de produção estão organizados no [roadmap detalhado de Phaser](../phaser/ROADMAP.md).
