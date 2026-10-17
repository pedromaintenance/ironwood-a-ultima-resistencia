# Ironwood M4c — Primeira missão completa e semente reproduzível

Data: 16/10/2026 (BRT). Ramo de QA: `feat/phaser-playthrough-m4c`.

## Por que esta entrega existe
Na M4b, o motor e o Phaser tinham testes de ações isoladas, epílogos e
transições por saves válidos **editados para a condição de teste**. Não havia
prova automatizada de que alguém conseguiria derrotar quatro inimigos numa
campanha recém-criada, desde o primeiro turno, sem qualquer alteração de estado.

## Entregas da M4c
- `tests/playthrough-driver.mjs`: agente de teste que escolhe movimentos e
  ataques/feitiços com os comandos **públicos** `move`, `attack`,
  `useSkill` e `endTurn`. Não usa `restoreSave`, não altera snapshots,
  não mata oponentes artificialmente e não simula a vitória.
- `tests/playthrough.test.mjs`: execução completa da missão 1 para
  **duas equipes diferentes**; valida quatro inimigos derrotados,
  `wins=1`, fase `between`, upgrade, próxima missão e dois prisioneiros.
- `phaser/index.html` e `BattleScene.ts`: campo **opcional** de semente
  inteira de 1 a 4294967295. Vazio conserva a geração normal baseada no
  relógio; o valor escolhido é mostrado no HUD e permanece no save v1.
  Entradas inválidas são recusadas antes de substituir a campanha.
- `phaser/tests/smoke.mjs`: teste em navegador de semente inválida,
  reprodução idêntica e reload; reprodução da trajetória vitoriosa usando
  **cliques reais** em heróis, casas, habilidades e fim de turno.
  Cada comando é comparado a um checkpoint que foi produzido em execução
  real do motor, sem estados artificiais.
- Workflows separados para teste unitário de playthrough e build/Chromium
  da prévia Phaser.

## Cenários de referência (dificuldade Aprendiz, semente 1)

| Equipe | Resultado headless | Rodadas | Integrantes sobreviventes |
|---|---|---:|---:|
| Morna, Arven, Vaelis | Vitória e transição à missão 2 | 4 | 3 |
| Arven, Vaelis, Dara | Vitória e transição à missão 2 | 3 | 3 |

Esses cenários demonstram **alcançabilidade** com duas composições e uma
semente explícita. Não demonstram balanceamento geral ou que toda estratégia
seja vencedora. A execução automatizada é uma política de QA, não uma
funcionalidade de jogo nem inteligência assistente habilitada aos jogadores.

## Como testar manualmente
1. Abra a prévia Phaser; selecione `Aprendiz`.
2. Defina a **semente 1** e escolha Morna/Arven/Vaelis.
3. Inicie uma nova campanha. A semente é mostrada no painel de objetivo.
4. Conclua *A Trilha Fechada* usando movimentação, ataques e habilidades.
5. Confira o progresso de quatro inimigos, escolha um upgrade e observe
   *Os Nomes dos Desaparecidos* (dois prisioneiros).
6. Volte ao menu e repita com a mesma semente/equipe/dificuldade:
   posições, terrenos e inimigos de abertura devem coincidir.

**Importante:** usar a semente 1 não garante vitória se as ações forem
diferentes da política de teste. O objetivo é reproduzir o mapa e os eventos
sob a mesma sequência de comandos, não criar um modo de vitória automática.

## Limites e riscos
- Teste Chrome/Chromium automatizado não substitui Android e iOS reais.
- Vitória fixture-free **da missão 1** não equivale à campanha 1–8 completa.
- Teste de saves longos, PWA offline próprio e bateria/FPS físicos permanecem
  pendentes. Versão Canvas na raiz e save `ironwood_campaign_v1` intocados.
- Nenhuma nova habilidade, fórmula de dano, IA, dificuldade ou formato de
  save foi alterado nesta etapa.

## Links
- [CI do playthrough headless inicial](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38992270580)
- [GitHub Pages da beta, quando o gate de publicação passar](https://pedromaintenance.github.io/ironwood-a-ultima-resistencia/phaser-preview/)
- [Roadmap público](../ROADMAP_IRONWOOD_PHASER.md)
