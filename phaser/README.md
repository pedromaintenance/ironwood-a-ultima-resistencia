# Ironwood — Phaser preview

Primeira visualização da batalha usando **Phaser 4.2.1 + Vite + TypeScript**, importando o motor headless da branch de desenvolvimento. O site Canvas publicado continua intacto.

## Testar localmente

```bash
cd phaser
npm install
npm run dev
```

Acesse a URL local exibida pelo Vite (geralmente `http://localhost:5173/`). Build de produção:

```bash
npm run build
npm run preview
```

O pacote é compilado para `phaser/dist/`, separado do aplicativo legado. O workflow `Ironwood Phaser preview` executa o build e um teste real em Chromium (abrir, andar, encerrar turno e lançar uma magia) e anexa capturas de tela como artefatos.

## O que está funcional

- Tabuleiro procedural **12×12** com todos os efeitos do terreno provenientes do motor.
- Lobby com **seis heróis, equipe de três, seleção de dificuldade** e nova campanha.
- Comandos de seleção, movimentação, ataque, habilidades e encerramento do turno.
- Inimigos, decisões da IA e condições de objetivos calculados pelo core.
- Barras de PV, mana, pontos de ação, clima, log e seleção de alvo.
- Autosave e retomada usando chave **`ironwood_phaser_preview_v1`**, isolada da versão Canvas.
- Exportação de JSON v1 e importação com validação e limite de 2 MB.
- **Três opções de upgrade** ao vencer, usando as mesmas opções do jogo original.
- Tween de deslocamento e feedback de dano, com respeito a preferência por movimento reduzido.
- **36 sprites pixel-art autorais** de 16×16: 24 texturas de terreno e 12 unidades com silhuetas individuais, registrados em `PixelAtlas.ts`.
- Prévia **precisa dos alvos legais** de habilidades (alcance, recursos e linha de visão), consultando as mesmas regras do core.
- Modo **INSPECIONAR** via botão ou atalho `I`, com leitura de terreno, efeitos e unidades sem gastar PA; `Esc` cancela.
- **144 sprites de terreno em cache**: o renderizador altera suas texturas somente quando os dados mudam, sem reconstruir o mapa em cada clique.
- Interface responsiva e controles touch para celular.

## O que ainda falta

- **Assets CC0 de terceiros:** ainda não incorporados. A arte autoral 16×16 já é renderizada, mas pode receber acabamento e substituição posterior por pacotes externos devidamente auditados.
- Sprites animados reais, efeitos de magia, som, transições e **prévia da área afetada (AOE)**. O alvo inicial já é verificado corretamente.
- Menus narrativos completos, seleção de upgrade com sprites, créditos e resultados finais.
- Importação de saves reais da versão Canvas testada com arquivos de usuário, sem afetar o jogo publicado.
- PWA da versão Phaser, instalação/offline, revisão completa da campanha e QA físico.

Veja o **[roadmap de produção e seus critérios](ROADMAP.md)** para acompanhar M1 a M5, e o [guia técnico M3a](../docs/M3_COMBAT_UX.md) para inspeção, cache e alvos precisos.

## Procedência de free-assets

O catálogo de recursos está em [free-asset-gallery.md](../free-asset-gallery.md). Para as próximas entregas, priorizar:

- [Kenney Roguelike/RPG](https://kenney.nl/assets/roguelike-rpg-pack) — tiles e objetos, licença CC0 conforme o pacote oficial.
- [Kenney UI Pack](https://kenney.nl/assets/ui-pack) — interface, licença CC0 conforme o pacote oficial.
- [Tiddybub 2D Assets](https://github.com/Tiddybub/2d-assets) — verificar licença e autoria específica de **cada pacote**.

O campo `assets` para terceiros em [docs/assets-manifest.json](../docs/assets-manifest.json) permanece vazio; `original_art` registra as 36 texturas originais geradas pelo projeto. Consulte o [guia de pixel-art M2](../docs/PIXEL_ART_M2.md). Não presumir permissão a partir de uma listagem de links.

## Arquitetura

`src/core/` mantém o estado e resolve as regras. `phaser/src/BattleScene.ts` apenas apresenta o snapshot do core e encaminha comandos (`move`, `attack`, `useSkill`, `endTurn`). Nenhuma regra tática deve ser reimplementada no Phaser.
