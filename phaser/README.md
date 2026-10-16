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

- Tabuleiro procedural **12×12**, gerado pelo motor real.
- Seleção de aliados, movimentação, ataque básico e encerramento do turno.
- Inimigos da missão, suas posições e IA real do motor.
- Barra de PV, aliados, estado de turno, clima, efeitos ambientais e logs.
- Habilidades selecionáveis no painel e aplicação de seus efeitos nas casas.
- Missões subsequentes acessíveis após vitória mediante upgrade de PV.
- Layout desktop/mobile com Phaser Scale.FIT e controles HTML.

## O que ainda falta

- Sprites/tilesets/efeitos **CC0** e manifest de origem. **As formas e cores atuais são provisórias**, geradas pelo renderer, não são assets obtidos externamente.
- Sprites animados, feedback por etapa de ação, efeitos, som e transições.
- Tela de seleção de heróis/dificuldade, narrativa, menus e save em browser.
- QA de todos os dispositivos, acessibilidade e publicação/instalação PWA.
- Validação manual das oito missões com progressão completa.

## Procedência de free-assets

O catálogo de recursos está em [free-asset-gallery.md](../free-asset-gallery.md). Para as próximas entregas, priorizar:

- [Kenney Roguelike/RPG](https://kenney.nl/assets/roguelike-rpg-pack) — tiles e objetos, licença CC0 conforme o pacote oficial.
- [Kenney UI Pack](https://kenney.nl/assets/ui-pack) — interface, licença CC0 conforme o pacote oficial.
- [Tiddybub 2D Assets](https://github.com/Tiddybub/2d-assets) — verificar licença e autoria específica de **cada pacote**.

Até termos arquivos efetivamente incorporados, [docs/assets-manifest.json](../docs/assets-manifest.json) permanece sem entradas. Não presumir permissão a partir de uma listagem de links.

## Arquitetura

`src/core/` mantém o estado e resolve as regras. `phaser/src/BattleScene.ts` apenas apresenta o snapshot do core e encaminha comandos (`move`, `attack`, `useSkill`, `endTurn`). Nenhuma regra tática deve ser reimplementada no Phaser.
