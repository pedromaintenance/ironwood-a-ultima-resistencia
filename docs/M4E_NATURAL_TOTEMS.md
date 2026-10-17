# Ironwood M4e — terceira operação real e integridade dos totens

Data: 17/10/2026. Fonte: `feat/phaser-totem-playthrough-m4e`.

## Problema e critério de aceite

M4d provou que as missões 1–2 podem ser concluídas sem alterar saves ou
forçar objetivos. Faltava demonstrar que os **três totens da missão 3** são
destrutíveis num percurso real e que a campanha efetivamente desbloqueia
**A Noite Mais Longa**. O painel informava apenas 0/3 sem detalhar o estado
individual das estruturas.

## O que foi implementado

1. `tests/totem-driver.mjs` continua `playSecondMission` após suas vitórias
   autênticas. Aplica um upgrade legítimo, entra na missão 3 e utiliza somente
   `move`, `attack`, `attackObjective`, `useSkill` e `endTurn`.
   O script não altera `G`, `board`, HP, PRNG, enemy roster ou saves.
2. `tests/totem.test.mjs` exige os **três totens de 18 de integridade**
   destruídos, `wins=3`, `losses=0`, e progressão à missão 4.
3. `phaser/src/BattleScene.ts` mostra o **HP exato de cada totem** e as
   coordenadas em um painel acessível; as informações derivam do mesmo
   snapshot que determina os objetivos e não estimam dano.
4. `phaser/tests/smoke.mjs` reexecuta **a terceira missão inteira pela
   interface Phaser**, usando o estado inicial oriundo de duas vitórias reais
   do motor. Cada checkpoint de movimento, ataque a objetivo, magia e turno
   é comparado ao core; verifica integridade, destruição, vitória, upgrade e
   entrada na quarta missão. O carregamento da missão 3 tem finalidade de
   focar o teste de UI, **não** representa um playthrough de três missões
   consecutivas feito inteiramente com cliques.
5. Interface identificada como Beta M4e, com instruções dentro do jogo.

## Evidência headless reproduzível

Semente `1`; dificuldade **Aprendiz**; Morna, Arven e Vaelis.

| Missão | Rodadas | Resultado |
|---|---:|---|
| 1. A Trilha Fechada | 4 | Vitória legítima contra quatro inimigos |
| 2. Os Nomes dos Desaparecidos | 1 | Dois prisioneiros libertados |
| 3. Totens da Servidão | 3 | Todos os três totens destruídos |

Posições dos totens na prova: (6,4), (2,5), (3,6) no sistema
1–12 exibido aos jogadores. O teste registrou **16 comandos**
e **5 ataques físicos a objetivos**, além de efeitos mágicos.

O teste não garante essa duração quando o jogador tomar decisões diferentes,
nem demonstra balanceamento geral ou vitória automática.

## Gates de publicação

- [x] 29 regressões do core mantidas.
- [x] Primeiras duas missões vencidas legitimamente.
- [x] Terceira missão vencida legitimamente e quarta desbloqueada;
  [CI inicial](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/39024644891).
- [ ] Chromium desktop/mobile, compilação Phaser e replay de estruturas,
  inclusive barra de integridade, aprovados no commit imutável da release.
- [ ] Publicação confirmada na subpasta `/phaser-preview/` e implantação
  GitHub Pages sem afetar os arquivos do Canvas.
- [ ] QA em celular físico, campanha 1–8 jogada de ponta a ponta no navegador.

O motor tático, saves `ver:1`, balanceamento e Canvas legado **não mudaram**.
