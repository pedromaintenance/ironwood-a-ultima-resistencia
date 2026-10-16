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
- Interface responsiva e controles touch para celular.

## O que ainda falta

- **Assets CC0 reais**. Os marcadores e terrenos atuais continuam vetoriais provisórios; o manifest não declara sprites incorporados.
- Sprites animados reais, efeitos de magia, som, transições e feedback preciso de alcance.
- Menus narrativos completos, seleção de upgrade com sprites, créditos e resultados finais.
- Importação de saves reais da versão Canvas testada com arquivos de usuário, sem afetar o jogo publicado.
- PWA da versão Phaser, instalação/offline, revisão completa da campanha e QA físico.

Veja o **[roadmap de produção e seus critérios](ROADMAP.md)** para acompanhar o progresso de M1 a M5.

## Procedência de free-assets

O catálogo de recursos está em [free-asset-gallery.md](../free-asset-gallery.md). Para as próximas entregas, priorizar:

- [Kenney Roguelike/RPG](https://kenney.nl/assets/roguelike-rpg-pack) — tiles e objetos, licença CC0 conforme o pacote oficial.
- [Kenney UI Pack](https://kenney.nl/assets/ui-pack) — interface, licença CC0 conforme o pacote oficial.
- [Tiddybub 2D Assets](https://github.com/Tiddybub/2d-assets) — verificar licença e autoria específica de **cada pacote**.

Até termos arquivos efetivamente incorporados, [docs/assets-manifest.json](../docs/assets-manifest.json) permanece sem entradas. Não presumir permissão a partir de uma listagem de links.

## Arquitetura

`src/core/` mantém o estado e resolve as regras. `phaser/src/BattleScene.ts` apenas apresenta o snapshot do core e encaminha comandos (`move`, `attack`, `useSkill`, `endTurn`). Nenhuma regra tática deve ser reimplementada no Phaser.
