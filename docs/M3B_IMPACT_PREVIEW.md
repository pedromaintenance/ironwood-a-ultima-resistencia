# M3b — Prévia da área de impacto e confirmação de magias

**Situação:** M3b implementada em `feat/phaser-impact-preview-m3b` e publicada em beta a partir do commit **`9ffc7029`**. [CI 24/24, build e navegador aprovados](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38955658327); [Playtest no Pages](https://pedromaintenance.github.io/ironwood-a-ultima-resistencia/phaser-preview/). O PR #13 segue em draft até revisão em dispositivo físico.

## Mudanças entregues no código-fonte

1. **`src/core/targeting.js`**: calculadora determinística da **área inicial** de uma magia, sem executar conjuração, alterar o estado ou consumir RNG. Reusa as coordenadas, geometrias quadradas 3×3 e 5×5, a linha de Bresenham, a parede de gelo horizontal, o losango de Rajada de Vento e os aliados na área de gritos/bençãos. Para Relâmpago, a linha para em rocha/parede como a execução original.
2. **`engine.previewImpact`**: consulta `previewSkill` para assegurar que o alvo é válido, antes de devolver `tiles`, `allyIds`, `confirm`, `scope` e `note`. Nenhum dado do jogo é alterado pela consulta.
3. **`BattleScene`**: sobreposição independente `aimLayer`, mostrando **área inicial do efeito ao passar o cursor**, sem reconstruir o mapa. Os combatentes aliados em risco aparecem marcados em vermelho.
4. **Proteção de toque**: magias com dano de área/linha (Bola de Fogo, Nevasca, Linha Solar, Relâmpago, Rajada de Flechas e Golpe Circular) exigem **dois toques na mesma casa**. O primeiro mostra o risco e não grava nem executa a conjuração; o segundo confirma. Magias direcionadas simples permanecem com um toque.
5. **Interface móvel**: painel textual acessível com número de casas afetadas e aviso de aliados atingíveis, além das observações sobre propagação ambiental.
6. **Testes**: cobertura de footprint 5×5, bordas do mapa, risco a aliados e imutabilidade do estado; Playwright simula o fluxo de dois toques e verifica que o save não muda até o segundo.

## Limites importantes e honestidade da prévia

A área mostrada é a **geometria imediata da magia**, não uma previsão determinística de todas as consequências. Em especial:
- **Fogo** pode se espalhar nas rodadas seguintes conforme vento, material, chuva e sorte;
- **Relâmpago** pode propagar eletricidade para além da linha inicial através de água;
- **Teia/Emaranhar** apresentam efeitos aleatórios de enraizamento, e a prévia não prevê a rolagem;
- **Linha de visão e validade do alvo** são verificadas pela mesma regra usada em `cast`.

O aviso de fogo amigo se limita às habilidades que afetam aliados diretamente (`fireball`, `sleet`, `sunbeam` e `lightning`). A faixa pode sinalizar um aliado vulnerável à geometria do efeito, mas a natureza exata do dano/armadura ainda é resolvida pelo core em jogo.

## Critérios de aceite e validação

- [x] Geometria sem RNG e função no core independente do Phaser.
- [x] Confirmação de duas etapas para magias perigosas.
- [x] Destaque das casas de efeito e aliados em risco.
- [x] Texto legível no celular e sobreposição sem destruir 144 tiles.
- [x] Testes do core (24/24), build e Chromium do commit distribuído `9ffc7029` aprovados.
- [ ] Revisão manual e playthrough, inclusive em Android/iOS físico.
- [ ] Consequências secundárias de propagação animadas (fase seguinte).
- [ ] Acessibilidade por teclado para escolha de casa sem mouse (fase seguinte).

## Publicação e segurança

O [workflow de beta](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/workflows/publish-phaser-beta.yml) verifica o **SHA testado** `9ffc7029`, compila o código e copia o resultado para `main/phaser-preview/`, sem trocar `index.html`, `app.js` ou o `sw.js` da versão Canvas. O SW do Canvas agora **ignora a subpasta do beta** para evitar HTML/JS obsoleto. A chave de save também é separada: `ironwood_phaser_preview_v1`.

O Pages beta não tem PWA autônomo homologado. Não anunciar suporte offline pleno nem substituir a versão original antes dos gates de campanha, performance e aparelhos físicos.
