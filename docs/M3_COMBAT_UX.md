# M3a — Inspeção, alvos reais e renderer incremental

**Status:** implementado na branch `feat/phaser-combat-ux-m3`; requer smoke do Chromium, QA visual humano e validação física antes de release.  
**Dependência:** M2a, `feat/phaser-pixel-art-m2` / PR #8.  
**Escopo:** apresentação e consulta não mutante do motor; nenhum rebalanceamento.

## 1. Por que este incremento existe

A batalha anterior recriava todos os **144 sprites de terreno** depois de cada seleção, movimento, magia e turno; além disso, a prévia de alvos desenhava casas com base só em alcance e tipo de unidade, mas não conhecia barreiras de linha de visão. A inspeção exigia gastar uma ação ou interpretar apenas o desenho.

## 2. Entregas

| Funcionalidade | Implementação | Segurança mecânica |
|---|---|---|
| Cache de terreno | `BattleScene.terrainSprites` instancia 144 imagens uma única vez; só chama `setTexture` quando a chave de terreno muda | Mantém `tile.base` e `tile.texture` diretamente do snapshot |
| Camadas independentes | `worldOverlay` redesenha terreno dinâmico/realces; `unitsLayer` contém apenas combatentes, sem destruir os ladrilhos | O ciclo da engine não muda |
| Inspeção de casas | Botão **INSPECIONAR**, atalho **I**; detalhe da casa, terreno, objetivo, personagem e condições | Não chama `move`, `attack`, `useSkill` ou autosave; não consome PA/RNG |
| Cancelar modo | Botão para sair; **Esc** cancela inspeção e magia | Sem custo e sem mudança de turno |
| Alvo de magia preciso | `engine.previewSkill(id, skill, x, y)` reutiliza `spellAllowed` e `spellVisible` do `spells.js` | As regras são as mesmas usadas em `cast`, inclusive bloqueio visual |
| Dicas no celular | Exibe apenas casas válidas para magia (mana/PA, tipo de alvo, linha de visão e ocupação quando aplicável) | O motor ainda decide execução após o toque |
| CI de integração | Workflow do Phaser agora executa `npm test` do core e testes navegador antes de arquivar screenshots | Comparação com o Canvas original continua no gate |

## 3. Contrato de API

```js
const result = engine.previewSkill('a1', 'mark', 5, 5);
// { allowed: true, reason: 'ready' }
// ou blocked-sight, invalid-target, outside-board, unknown-skill, phase
```

A função é observacional: nem `state`, nem `rngState`, nem `events` são alterados. `spellVisible` é agora uma função compartilhada pelo caminho real de conjuração e pela prévia. O teste diferencial do legado confirma preservação do resultado das ações.

## 4. Testes esperados e critérios de aceite

- [x] Teste unitário de `previewSkill` com alvo bloqueado por rocha, inválido, desconhecido, fora do mapa e legal, verificando não mutação e execução real.
- [x] Smoke de navegador para botão de inspeção, personagem visível no relatório e save idêntico antes/depois.
- [x] Smoke assegurando que continuam existindo exatamente 144 imagens de terreno após movimento/seleções.
- [x] Smoke em viewport mobile simulada com inspeção por toque.
- [ ] Playthrough manual de uma missão inteira.
- [ ] QA em dispositivo físico; medição comparativa de FPS/memória em hardware modesto.
- [ ] Desenho preciso da **área de efeito** de magias de explosão, linha, cone e propagação elétrica (a validade do alvo já é precisa; a área afetada não é exibida).
- [ ] Otimizar também sprites/unidades e impedir ações durante tweens críticos.

Diagnóstico de renderer: `#game[data-terrain-objects="144"]` e `data-terrain-updates`. Na seleção comum não ocorre nova criação das 144 imagens. Mudanças reais de base do terreno ainda provocam `setTexture`.

## 5. Próximos incrementos de M3

1. Prévia **exata de AOE**, usando geometria compartilhada com o motor; diferenciar aliados sujeitos a dano amigo.
2. **Object pooling** de unidades e VFX; evitar destruir/recriar unidades a cada render, minimizar trabalho de overlay.
3. Fila de entrada durante animação e sincronização dos tweens com ações; botão de inspeção acessível em teclado e toque.
4. Feedback visual específico de erro de visão, terreno inacessível, habilidades sem recursos e vitória/derrota.
5. Testar em celular físico, gamepad/teclado, acessibilidade e primeira missão completa.

**Restrição de release:** esta etapa está em PR dependente, não publicada. O Canvas em `main` e seus saves permanecem intactos. O roadmap executivo está em [`phaser/ROADMAP.md`](../phaser/ROADMAP.md).
