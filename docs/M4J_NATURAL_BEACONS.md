# Ironwood M4j — Os Faróis do Crepúsculo: sete missões legítimas

**Data:** 17/10/2026. **Branch:** `feat/phaser-beacons-m4j`.

## Critério do marco

Depois de seis vitórias legítimas (M4c–M4i), reativar os **três marcos ancestrais** da operação 7, sem editar snapshots ou RNG, e entrar normalmente na última operação, **O Espinho da Rainha**. Não é necessário eliminar todos os guardas na missão dos marcos.

## Entrega

1. `tests/beacons-driver.mjs`: continua `playSixthMission`, compra upgrade normal `hp`, inicia a missão 7 e age somente com as funções públicas `move`, `attack`, `useSkill('interact')` e `endTurn`. A aproximação considera terreno perigoso e ameaças inimigas. A ativação usa as regras oficiais de adjacência do motor, sem manipular estado.
2. `tests/beacons.test.mjs`: exige três marcos originalmente pendentes, **exatamente três interações em coordenadas distintas**, `wins=7`, `losses=0`, objetivo concluído, upgrade autêntico e implantação da missão 8 com a campeã `boss`.
3. `phaser/src/BattleScene.ts`: painel de objetivos expõe as coordenadas de cada marco (base 1–12) e seu estado **AGUARDANDO / ATIVADO**. Os dados vêm exclusivamente dos tiles autoritativos, sem regras replicadas no Phaser.
4. `phaser/tests/smoke.mjs`: obtém a abertura da missão 7 a partir de seis vitórias reais e a carrega no Phaser somente para focar o teste de interface. Reexecuta **a missão 7 completa por cliques**, confere cada snapshot após movimentos, habilidades, interações e turnos inimigos, compara os três marcos e valida o acesso à missão final.
5. Mantidos o motor original, a chave de save Phaser `ironwood_phaser_preview_v1`, saves legados Canvas e os arquivos Canvas na raiz.

## Prova fixture-free headless

**Semente `1` • Aprendiz • Morna, Arven e Vaelis • ordem de IA `portable-v2`.**

A campanha ganhou sete operações consecutivas. Na sétima, os marcos estavam nas coordenadas internas (6,3), (6,4) e (10,8), correspondentes a **(7,4), (7,5), (11,9)** na interface. As três ativações foram concluídas na rodada **4**, com Morna (27 PV), Arven (14 PV) e Vaelis (34 PV) sobreviventes. Dois guardas ainda estavam vivos no momento da vitória: objetivo independente de extermínio, conforme motor original.

A oitava operação iniciou com **a campeã Espinho de Sylara** e sua escolta de lança, arqueiro, bruxa e sombra (seis inimigos ao todo). Não houve edição de HP, personagens, tiles, saves, seed ou fase para produzir esse resultado.

## Gates de QA e limitações

- [x] Prova real de sete vitórias no motor, com 29 regressões originais e saves anteriores preservados.
- [x] Interface dos marcos e replay de sétima missão implementados.
- [ ] Build Vite e Chromium aprovados no mesmo SHA da release.
- [ ] GitHub Pages implantado em `/phaser-preview/` sem tocar o Canvas.
- [ ] M4k: batalha final concluída naturalmente, epílogo verdadeiro e campanha 1–8.
- [ ] QA de dispositivos físicos, dificuldades Normal/Implacável.

**Distinção importante:** sete vitórias consecutivas são demonstradas pelo motor. O navegador reexecuta a sétima missão a partir de um save inicial legítimo, e não representa sete missões jogadas sem interrupção por uma pessoa. Esta prova não garante os mesmos resultados com outros comandos, heróis ou dificuldades.
