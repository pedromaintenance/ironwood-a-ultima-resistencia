# M4a — Objetivos identificáveis e ataque físico a totens

**Estado:** implementação do marco inicial M4 no PR `feat/phaser-objective-attacks-m4a`, dependente da M3g. Não distribuir antes da CI verde.

## Bloqueio de progresso corrigido

No Canvas original, `app.js` expunha o comando `attackStructure(a, t)` ao selecionar ataque e clicar num totem. Essa função, com **1 PA por golpe**, alcance, linha de visão, dano `atk + 4` e verificação de vitória após a ação, já existia no núcleo modular, mas **não era exposta pela fachada `createIronwoodEngine`** nem pela cena Phaser.

Na prévia M3g, clicar numa casa de totem sem habilidade tentava mover o herói para essa casa, impossibilitando a conclusão por ataques físicos — um risco sobretudo para grupos sem magia ofensiva apropriada.

A M4a incorpora `engine.attackObjective(actorId, x, y)`, aceitando **somente totens ativos**, uma unidade aliada viva e turno do jogador, sem duplicar as fórmulas do Canvas. A cena reconhece o totem antes do comando de movimento. Se a unidade não estiver no alcance ou não tiver PA, a ação falha e o save não é regravado.

## Visibilidade e instruções

Cada tipo de objetivo não concluído agora recebe um **símbolo próprio** no mapa, também distinguível pela forma:
- **Totem:** losango, traço central e barra de integridade, atacável por toque;
- **Prisioneiro:** dois círculos ligados, exige **Interagir**;
- **Foco de corrupção:** círculo cortado, aceita **Interagir** ou **Purificar**;
- **Marco ancestral:** triângulo, exige **Interagir**.

O modo de inspeção apresenta o nome e a instrução em português; para o totem, também mostra a integridade restante. O progresso do objetivo do M3g usa o mesmo `cleared` da engine.

## Testes

- [x] Reutilizar `attackStructure` do núcleo sem alterar o balanceamento ou RNG.
- [x] Bloquear alvo inválido, fora da grade, inimigo agindo como aliado, totem destruído ou outra missão sem totem.
- [x] Teste de core para dano de Morna (5 + 4) e 1 PA por acerto: totem de 18 integridade cai em dois golpes; `missionProgress` passa de 0/3 para 1/3.
- [x] Teste Phaser por **dois cliques no próprio totem** após importar um save v1 válido da operação 3, com aliado em posição adjacente; verifica logs, dano, save, progressão e integridade.
- [x] Atualização do guia in-game com instruções de objetivos.
- [x] [26/26 testes do core, build Vite/Phaser e Chromium desktop/mobile aprovados](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38984312201), commit `8e1fdf77`.
- [ ] Workflow M4a acionado com SHA imutável `8e1fdf77`; confirmar conclusão da cópia e implantação Pages.
- [ ] QA humano em celular e playthrough normal da operação 3 desde o primeiro turno.

**Limite do teste:** a prova de clique usa uma fixture válida com um totem adjacente, para isolar a correção da ação. Não significa que a missão 3 ou a campanha inteira já tenham sido concluídas sem preparação.

## Próximo passo M4

Validar um playthrough completo da operação 1 a partir de uma campanha recém-criada, sem alterar ou importar atores/terreno; registrar desfecho, dificuldades e decisões. Depois avançar pelo ciclo de oito missões e três finais, com foco em objetivos não violentos.

O Canvas original permanece disponível no Pages principal, com chave de save distinta da beta Phaser.
