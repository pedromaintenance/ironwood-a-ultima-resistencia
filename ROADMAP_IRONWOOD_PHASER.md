# Ironwood — A Última Resistência
## Roadmap de migração para Phaser 4.2.1

**Projeto:** RPG tático por turnos ambientado na Carcaça  
**Repositório:** https://github.com/pedromaintenance/ironwood-a-ultima-resistencia  
**Planejamento:** 15/10/2026  
**Estado:** execução sequencial; não substituir o jogo publicado antes de validar a nova versão.

## M4h — A Seiva Corrompida e acesso à operação 6 (17/10/2026)

**[JOGAR IRONWOOD — BETA M4h NO GITHUB PAGES](https://pedromaintenance.github.io/ironwood-a-ultima-resistencia/phaser-preview/)** — commit imutável `92284b1517cf086ad9cc0780df24b67212acfd72`. [CI de cinco vitórias naturais](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/39035280267), [build e Chromium com replay completo da quinta missão](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/39035280274), [publicação segura](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/39035589684), [implantação GitHub Pages concluída](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/39035805814). [PR #33](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/33) permanece draft até QA físico. [Guia M4h](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/blob/feat/phaser-cleanse-m4h/docs/M4H_NATURAL_CLEANSING.md).

- [x] **Cinco missões consecutivas vencidas legitimamente:** seed `1`, Aprendiz, Morna/Arven/Vaelis, IA `portable-v2`, rodadas finais `4 / 1 / 3 / 7 / 2`. Quinta operação: três focos purificados por interações reais, `wins=5`, `losses=0`, sem alterar HP, turnos, saves ou RNG artificialmente.
- [x] **Progressão confirmada no motor:** os resgates e focos purificados acumulam cinco nas estatísticas; melhoria aplicada e `A Marcha das Cinzas` iniciada com sete inimigos.
- [x] **HUD de corrupção:** os três focos têm coordenadas, intensidade de corrupção e marcação PURIFICADO lidas diretamente do estado do core; versão Canvas original e save `ironwood_campaign_v1` intocados.
- [x] **Teste de navegador escrito:** replay da quinta missão por cliques reais com checkpoints da partida headless, importando apenas a abertura natural depois de quatro vitórias, sem reinjetar dados entre turnos.
- [x] **CI e publicação M4h confirmados:** regras, saves, cinco missões naturais, replay por toques no Chromium, build Vite e GitHub Pages aprovados para o mesmo SHA `92284b15`. A atualização ficou isolada em `main/phaser-preview/`; Canvas original preservado.
- [ ] **M4i:** vencer naturalmente a sexta operação (*A Marcha das Cinzas*), confrontar os sete inimigos, observar incêndios e recuperação da floresta; validar entrada em *Os Faróis do Crepúsculo*.
- [ ] QA em aparelhos físicos, dificuldade Normal/Implacável, campanha inteira 1–8 e finais obtidos sem fixtures.

## M4g — A Noite Mais Longa, duas ondas e acesso à quinta missão (17/10/2026)

**[BETA M4g — MARCO HISTÓRICO, substituída pela M4h](https://pedromaintenance.github.io/ironwood-a-ultima-resistencia/phaser-preview/)** — código testado no SHA `0fe53347a3a2f2d6d02ce77dcbc879a93e4bd030`; [teste headless de quatro missões naturais](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/39033125469), [build + Chromium com replay integral da defesa](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/39033125530), [publicação segura aprovada](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/39033324095) e [implantação GitHub Pages concluída](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/39033345760). [PR #32](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/32) continua draft até QA humano.

- [x] **Quatro missões completadas naturalmente:** semente `1`, Aprendiz, Morna/Arven/Vaelis, IA portátil `portable-v2`. Finais das missões 1–4: rodadas `4 / 1 / 3 / 7`. Nenhum inimigo, HP, objetivo, fase, PRNG, turno ou save foi manipulado para forçar resultado. A defesa exige **seis rodadas completas**; os três heróis sobreviveram com `wins=4`, `losses=0`.
- [x] **Ondas reais do motor verificadas:** na entrada da rodada 4, `Lobo + Arqueiro` (`wave=1`); na entrada da rodada 6, `Lanceiro + Lobo` (`wave=2`), com IDs novos observados e composição correta. A vitória ocorre ao entrar na rodada 7 mesmo com inimigos restantes; não é obrigatório eliminá-los.
- [x] **HUD de sobrevivência:** aviso textual de composição e rodada da próxima onda, `0/2`, `1/2` e `2/2`, juntamente com o progresso das seis rodadas, sem novos efeitos no motor. Legibilidade e rastreabilidade melhores em celular.
- [x] **Replay pela interface do Phaser:** começa a quarta missão de um snapshot inicial legítimo obtido depois de três vitórias no motor; executa todos os comandos de jogador, ataques, habilidades e seis `endTurn` via interface. Compara cada checkpoint completo a Node.js (inclusive inimigos e RNG), verifica o painel e as duas ondas, a vitória, a escolha de melhoria e o início de *A Seiva Corrompida* com três focos de corrupção. Não injeta nem corrige estados entre turnos.
- [x] **Publicação isolada:** versão M4g instalada em `main/phaser-preview/` com implantação final do GitHub Pages aprovada, sem substituir o Canvas na raiz nem a chave `ironwood_campaign_v1`.
- [ ] **M4h:** completar naturalmente a operação 5 (*A Seiva Corrompida*), validar purificação dos três focos, efeitos ambientais, progressão para operação 6 e legibilidade do objetivo no Phaser.
- [ ] QA Android/iOS em aparelhos físicos, Normal/Implacável, operação 1–8 numa sessão real de UI e os três finais alcançados sem fixtures.

**Escopo dos testes:** a prova de quatro vitórias é integral no **motor**; o smoke de navegador demonstra a quarta operação inteira usando uma abertura legítima, mas não substitui playtest humano ininterrupto das quatro operações. Detalhes no [guia M4g](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/blob/feat/phaser-survival-m4g/docs/M4G_NATURAL_SURVIVAL.md).

## M4f — Determinismo portátil da IA com saves antigos preservados (17/10/2026)

**[BETA M4f — MARCO HISTÓRICO, substituída pela M4g](https://pedromaintenance.github.io/ironwood-a-ultima-resistencia/phaser-preview/)** — commit imutável `00db07d4c7bdbbfc20d51ca3635c97154b3e808a`. [CI de regras, três missões e saves](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/39025948327), [build + Chromium com comparação exata de turnos entre runtimes](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/39025948340), [publicação segura](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/39026111867), [deploy GitHub Pages concluído](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/39026138236), [PR #31](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/31) em draft por QA físico/campanha longa.

- [x] **Causa raiz tratada:** o comparador aleatório `hostiles().sort(() => random() - .5)` era dependente da quantidade e da ordem de chamadas de `Array.sort` de cada runtime. Em **campanhas novas da prévia Phaser** foi substituído por Fisher–Yates explícito, com `n-1` sorteios para `n` inimigos e ordem reproduzível entre Node e Chromium.
- [x] **Compatibilidade de save v1 sem migração automática:** novas campanhas Phaser recebem o campo opcional `aiOrder: 'portable-v2'`; snapshots legados, sem esse campo, continuam selecionando o algoritmo anterior. Saves do Canvas, saves Phaser antigos e arquivos JSON v1 existentes não são reescritos silenciosamente. Valores desconhecidos são recusados na importação antes de substituir o estado atual.
- [x] **Comparação cruzada completa:** o smoke Chromium deixou de contornar a divergência importando um checkpoint depois de cada turno inimigo. Para jogos `portable-v2`, exige agora igualdade exata entre Node e navegador para posição, logs, RNG, cenário, atores, PA e demais campos após `endTurn`. Ainda verifica a repetibilidade de cada turno por exportação e importação **dentro do navegador**.
- [x] **Regressões preservadas:** 29 testes originais, bateria específica de ordem/compatibilidade/validação de saves, vitórias naturais das missões 1–3 e progressão à quarta aprovados no mesmo SHA. A alteração não modifica dano, ataques, mana, alcance, movimentação, condições ou o comportamento de ordenação das campanhas antigas.
- [x] **Publicação isolada:** só `main/phaser-preview/` foi atualizada; arquivos da versão Canvas original (`index.html`, `app.js`, `sw.js`) e save `ironwood_campaign_v1` preservados.
- [ ] **M4g:** demonstrar *A Noite Mais Longa* (sobrevivência por 6 rodadas) em um playthrough natural; validar ondas inimigas, contagem de rodadas, recuperação/reimportação, fase seguinte e desempenho de UI.
- [ ] QA com Android/iOS físicos, outras dificuldades e campanha 1–8 sem preparação de estado; reproduzir eventual limitação de browser mais antigo.

**Observação sobre compatibilidade:** importar um save antigo mantém sua ordem histórica, mas não promete determinismo entre **diferentes** runtimes para esses saves sem `aiOrder`. O novo algoritmo foi ativado **apenas para novas campanhas**, sem substituir o motor legado já publicado.

## M4e — Totens da Servidão e três vitórias consecutivas (17/10/2026)

**[BETA M4e — HISTÓRICO (substituída pela M4f)](https://pedromaintenance.github.io/ironwood-a-ultima-resistencia/phaser-preview/)** — commit-fonte imutável `4c9d6a95317691e05d227064510c8c82718bcabd`; [CI de três missões naturais](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/39025198589), [build + Chromium aprovados](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/39025198586), [workflow de publicação concluído](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/39025349334), [implantação do Pages aprovada](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/39025375079). [PR #30](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/30) mantido em draft aguardando QA humano completo.

- [x] **Três operações reais sem fixtures:** seed `1`, Aprendiz, Morna/Arven/Vaelis, 4/1/3 rodadas nas missões 1–3. As três estruturas originais de **18 integridade** foram destruídas via `attackObjective` e magia, vitória `wins=3`, `losses=0`, upgrade legítimo e entrada na missão 4 (*A Noite Mais Longa*).
- [x] **HUD dos totens:** localização e integridade exata de cada estrutura, incluindo marcador DESTRUÍDO, diretamente do snapshot; nenhum cálculo de dano separado no Phaser.
- [x] **Teste da terceira missão no Phaser:** reinicia a missão 3 de um save inicial **legítimo**, obtido depois de duas vitórias headless, e reexecuta ações reais do jogador por cliques, com comparação exata de HP, custos, PA, salvamento e estado do tabuleiro. Valida a terceira vitória e o avanço à quarta.
- [x] **Teste de save/reload no Chromium:** refaz cada turno inimigo após restaurar o mesmo checkpoint **no mesmo navegador**, exigindo igualdade exata.
- [x] **Distribuição M4e:** publicada exclusivamente em `main/phaser-preview/`, sem alterar a versão Canvas na raiz nem seus arquivos `index.html`, `app.js`, `sw.js` ou a chave de save `ironwood_campaign_v1`.
- [ ] **Débito técnico de determinismo entre runtimes (prioridade M4f):** a IA original embaralha inimigos com `hostiles().sort(() => random() - .5)`. Comparadores aleatórios não têm ordenação bem definida no JavaScript. Nos testes, depois de um turno inimigo da missão 3, **Node.js e Chromium produziram ordem, consumo de RNG e posições diferentes**, embora os estados antes do turno fossem iguais. Não alegar paridade cruzada de turnos nem exigir igualdade Node–Chromium neste cenário. Projetar embaralhamento estável, medir impacto na paridade com o Canvas e definir migração compatível de saves antes de alterar regras; **não foi mudado silenciosamente nesta release**.
- [ ] Teste manual em aparelhos Android/iOS físicos; validar dificuldade Normal/Implacável, missão 4–8 e todos os finais por campanhas jogadas integralmente sem fixtures.
- [ ] Teste 1–3 contínuo **inteiramente pela UI**: o gate desta entrega comprova as três vitórias no motor e replay da terceira missão em blocos de ações de jogador com checkpoints reais entre turnos; não equivale a jogatina humana sem recarga da primeira à terceira missão.

**Detalhamento:** [documentação técnica M4e](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/blob/feat/phaser-totem-playthrough-m4e/docs/M4E_NATURAL_TOTEMS.md) e [PR #30](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/30).

## M4d — Dois resgates reais e interação contextual (16/10/2026)

**[BETA M4d — MARCO HISTÓRICO, substituída pela M4e](https://pedromaintenance.github.io/ironwood-a-ultima-resistencia/phaser-preview/)** — commit imutável `73883e7036948bfcfd7f2048da41cab8051e7c2a`; [CI Chromium desktop/mobile + build aprovados](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38994062904), [CI de duas missões reais aprovada](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38994062943), [workflow de publicação aprovado](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38994226762), [implantação final do Pages concluída](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38994261296). [PR #29](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/29) segue draft enquanto aguardamos QA físico e da campanha completa.

- [x] Missão 1 vencida desde campanha recém-criada, upgrade aplicado e missão 2 concluída com **dois comandos reais `interact`**, sem salvar snapshots artificiais ou importar fixtures. Na semente `1`, dificuldade Aprendiz, equipe Morna/Arven/Vaelis, a missão 1 foi concluída em 4 rodadas e a missão 2 em 1 rodada; avanço da campanha para a missão 3 confirmado pelo motor.
- [x] [CI headless M4d](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38993831155) aprovou 29 regressões prévias, prova real da missão 1 e prova real das missões 1–2 seguidas.
- [x] Adicionado toque contextual para `captive` (resgate), `shrine` (purificação) e `beacon` (ativação), **apenas ao alcance do herói selecionado**. A execução permanece no motor `useSkill('interact')`, com os mesmos custos e travas; totens continuam usando ataques.
- [x] Teste Chromium identifica falha de interação quando o herói ocupa a própria casa do prisioneiro: o toque selecionava o herói em vez de resgatar. Fluxo de cliques corrigido para contemplar esse caso, mantendo seleção de outros aliados.
- [x] **CI de navegador aprovado:** o Chromium confirmou o toque contextual sobre a casa ocupada pelo herói, duas interações com prisioneiros oriundas de checkpoints reais, preservação de RNG/PA/save, upgrade e missão 3, mantendo todas as regressões da M4c.
- [x] **Publicação concluída:** apenas `main/phaser-preview/` recebeu o build testado (rótulo BETA M4d); `index.html`, `app.js` e `sw.js` do Canvas original e a chave `ironwood_campaign_v1` permanecem preservados. GitHub Pages implantado com sucesso.
- [ ] QA em dispositivos reais, balanço em Normal/Implacável e missões 3–8 concluídas sem fixtures.

**Evidência técnica:** [branch M4d](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/tree/feat/phaser-rescue-m4d) e [PR #29](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/29). Testes no core não são equivalentes à comprovação de toda a campanha pela interface do Phaser.

## M4c — Playthrough autêntico e sementes reproduzíveis (16/10/2026)

**[BETA M4c — HISTÓRICO (substituída pela M4d)](https://pedromaintenance.github.io/ironwood-a-ultima-resistencia/phaser-preview/)** — candidate imutável `c830e7df`, [29 regressões e Chromium desktop/mobile, replay de vitória natural aprovados](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38992611371), [playthrough headless aprovado](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38992611378), [build publicado em main/phaser-preview/](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38992859321), [implantação GitHub Pages concluída](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38992879404). [PR #28](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/28) segue draft por QA físico e campanha completa pendentes.

- [x] **Missão 1 vencida sem fixtures nem snapshots alterados**: o agente de QA inicia campanha normal e usa somente `move`, `attack`, `useSkill` e `endTurn`; duas equipes diferentes vencem no modo Aprendiz com seed 1 — Morna/Arven/Vaelis em 4 rodadas e Arven/Vaelis/Dara em 3 rodadas.
- [x] Regressão automatizada comprova vitória, upgrade e entrada na missão 2 com seus dois prisioneiros; [CI da prova inicial](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38992270580) passou.
- [x] Campo opcional de semente inteira na interface Phaser; se vazio, partida aleatória como antes. A semente é exibida durante combate para reprodução de bugs. Formato de save `ver:1` e versão Canvas intocados.
- [x] Driver de QA e teste Chromium escritos para reproduzir a trajetória vencedora por **cliques reais** e comparar o save a cada ação.
- [x] **CI M4c e publicação:** build Phaser, regressões, Chromium desktop/mobile emulado, replay vitorioso por cliques reais e implantação do GitHub Pages confirmados para o SHA imutável `c830e7df`; publicada **somente** a pasta `phaser-preview/`, mantendo Canvas e saves legados intactos.
- [ ] QA físico e continuidade real das missões 2–8 e dos três finais sem fixtures.

**Detalhes:** [guia M4c no ramo de desenvolvimento](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/blob/feat/phaser-playthrough-m4c/docs/M4C_FULL_PLAYTHROUGH.md).
A prova do motor é um ganho real de cobertura, mas **não é prova de campanha inteira** nem de balanceamento geral por semente e dificuldade.

## M4b — Derrota e epílogos canônicos (16/10/2026)

**[BETA M4b — MARCO HISTÓRICO (substituída no Pages pela M4c)](https://pedromaintenance.github.io/ironwood-a-ultima-resistencia/phaser-preview/)** — fonte `74b0c154`, 29/29 testes, [CI](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38988894146), [publicação concluída](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38989071534). [Implantação final do Pages aprovada](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38989168527); URL pública confirmada como beta M4b pela pasta de release.


**CI 29/29 e compilação pública aprovadas:** [PR #26](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/26) · [Issue #27](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/issues/27) · [Guia técnico](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/blob/feat/phaser-retry-endings-m4b/docs/M4B_RETRY_ENDINGS.md).

- [x] **Derrota persistente:** ao continuar um save com `phase=defeat`, a cena mantém o resultado em vez de iniciar uma partida automaticamente.
- [x] **Nova tentativa consciente:** botão `TENTAR NOVAMENTE — MESMA MISSÃO` chama `engine.deployMission()` e preserva equipe, upgrades e derrotas acumuladas.
- [x] **Três finais originais:** exibir títulos, parágrafos e estatísticas de `A Vitória das Cinzas` (mais de 25 árvores destruídas), `A Floresta de Todos` (ao menos cinco resgates e no máximo uma derrota, sem ultrapassar limiar de árvores) e `A Última Chama Livre` (restante).
- [x] **Regressões escritas:** testes puros dos três finais, retry após derrota resolvida pelo motor e rodadas iniciais determinísticas de uma campanha nova; smoke Chromium de derrota, reload, retry e três epílogos por saves v1 válidos.
- [x] **[29/29 testes de core, build Vite e Chromium desktop/mobile aprovados](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38988894146)** no commit `74b0c154`.
- [x] **[Publicação M4b concluída](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38989071534)**: somente `main/phaser-preview/`, contendo `BETA M4b`, botão de retry e epílogos. [Implantação final do Pages concluída](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38989168527) — pasta pública confirmada com painel de resultado, botão de retry e rótulo BETA M4b.
- [ ] Testar em aparelhos reais e concluir integralmente as oito missões e três finais **sem fixtures**.

**Limites:** este incremento valida o comportamento dos epílogos e do retry usando snapshots importados; os testes de turnos iniciais partem de campanha nova, mas ainda não provam que a primeira missão foi vencida em uma execução completa. A versão Canvas e seu save permanecem preservados.


### Próxima validação — M4c: primeira missão integral sem fixtures
- [ ] Executar uma campanha nova do início da missão 1 até a vitória **somente com comandos reais do motor**, sem importar ou alterar snapshots; registrar ações, rodadas, personagens e resultado.
- [ ] Reproduzir o mesmo teste pela interface Phaser desktop e toque emulado, verificando salvamento e retorno após recarregar.
- [ ] Conferir transição real para a missão 2 e upgrades, sob pelo menos duas equipes e dificuldades.
- [ ] Se a simulação revelar bloqueio de mapa, IA, LOS, economia de PA ou balanceamento, corrigir e criar regressão determinística antes de publicar.
- [ ] Repetir para as oito missões e os três finais, sem inferir jogabilidade completa a partir de saves próximos de vitória.

**Contexto:** M4b validou retry e epílogos por saves válidos preparados, além de turnos iniciais normais; o playthrough completo ainda **não** foi testado. Os tempos de FPS emulado não substituem medição física.

## M4a — Ataques físicos a totens e objetivos legíveis (16/10/2026)

**Implementado no [PR #24](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/24), com CI 26/26 aprovada.** A M3g deixava uma lacuna frente ao Canvas original: tocar num totem sem magia tentava mover para a casa. A M4a reutiliza a função legada `attackStructure` por uma fachada validada `attackObjective`, recuperando o ataque básico a totens da missão 3, com as mesmas regras de PA, alcance, visão e dano. A ação inválida não grava save.

**Melhorias visuais:** prisioneiro, totem, foco de corrupção e marco ancestral ganharam símbolos próprios, também distintos pela forma. Totens mostram a integridade e o modo Inspecionar explica como concluir cada objetivo. Testes cobrem dois golpes físicos, dano e progresso do totem sem alterar balanceamento.

- [x] Implementação do ataque a estruturas e marcadores por tipo, com [documentação M4a](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/blob/feat/phaser-objective-attacks-m4a/docs/M4A_OBJECTIVE_ATTACKS.md).
- [x] Testes de core e smoke Chromium adicionados para clique, PA, integridade, persistência e progresso.
- [x] [CI M4a — 26/26 testes, build e Chromium desktop/mobile aprovados](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38984312201) para o SHA imutável `8e1fdf77`.
- [ ] [Workflow de publicação M4a disparado](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38984544789); confirmar a cópia do build e a implantação do GitHub Pages; [Issue #25](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/issues/25).
- [ ] Playthrough completo da missão 1 sem fixture, campanha integral de 8 missões/3 finais e aparelhos físicos.

**Beta anterior:** [M3g no Pages](https://pedromaintenance.github.io/ironwood-a-ultima-resistencia/phaser-preview/). A versão Canvas original na raiz e os respectivos saves permanecem preservados.

## Beta M3g — objetivos e transição entre missões (16/10/2026)

**[JOGAR IRONWOOD — BETA PHASER M3g](https://pedromaintenance.github.io/ironwood-a-ultima-resistencia/phaser-preview/)**

O artefato foi compilado do SHA **`bfffb911`**, aprovado em [25/25 testes de core, build Vite/Phaser e smoke Chromium desktop/mobile](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38969025016). O [workflow seguro de publicação](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38969342926) verificou o resultado do CI e gravou o build em `main/phaser-preview/`. **A verificação de implantação final do GitHub Pages é separada da gravação do build.**

**Novidade M3g:** o painel da batalha agora mostra o ato, operação 1–8, nome do objetivo, barra acessível e quantos inimigos, prisioneiros, totens, focos ou faróis faltam; para sobrevivência, exibe as rodadas, e para o chefe, os PV restantes. A função pura `missionProgress()` lê o mesmo estado usado por `missionOutcome()` — **nenhuma regra ou save foi alterado**.

**Validação de transição:** o Playwright importou uma fixture v1 válida **próxima da vitória**, executou uma ação real do motor, verificou vitória e três opções de upgrade, selecionou uma melhoria e iniciou a segunda missão com **2 prisioneiros pendentes**. Isso **não equivale a um playthrough completo** do primeiro combate. O teste de core cobre as sete categorias de objetivos, totalizando agora 25 testes.

**O que testar no Pages:** comece uma campanha; acompanhe “Expulsar a patrulha” e a contagem de 4 inimigos, inspecione/mova a equipe, confira a evolução do objetivo, os efeitos do terreno, avisos de habilidades e o contador aproximado de FPS no guia de testes. Tente concluir a missão 1 e escolha uma melhoria para observar a meta da missão 2.

**Garantia de integridade:** o [Canvas original](https://pedromaintenance.github.io/ironwood-a-ultima-resistencia/) permanece na raiz. O Phaser roda somente em `/phaser-preview/`, com save próprio `ironwood_phaser_preview_v1`; `ironwood_campaign_v1`, `app.js` e `sw.js` não foram substituídos.

**Estado:** implementação e CI concluídas, beta compilada; [PR #22](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/22) permanece draft para QA humano, hardware físico, primeira missão integral, oito missões/três finais e PWA offline independente. [Guia técnico M3g](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/blob/feat/phaser-mission-goals-m3g/docs/M3G_MISSION_GOALS.md) · [Issue #23](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/issues/23).

## Painel de execução — atualização de 16/10/2026

| Marco | Status verificável | Links |
|---|---|---|
| Fase 0 — Preservação Canvas | Baseline e browser emulado aprovados; teste em aparelho físico pendente | [PR #3](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/3) |
| Fase 1 — Core sem navegador | Regras extraídas, RNG reprodutível, saves verificados; testes diferenciais das 8 missões e 32 ações | [PR #5](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/5) |
| Fase 2 / M1 — Batalha Phaser e campanha | Phaser 4.2.1, lobby de seis heróis/equipe de três, dificuldades, autosave, importar/exportar, upgrades; Chromium desktop/mobile emulado | [PR #7](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/7) |
| Fase 3 / M2a — Identidade pixel-art | 36 texturas originais 16×16, tiles/figuras Phaser, efeitos do terreno sobrepostos; testes aprovados | [PR #8](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/8) |
| **M3a — Inspeção e renderização incremental** | **Implementado e validado automaticamente:** preview de magia compartilha LOS e validação com o core, inspeção de tile/unidade sem custo, cache permanente dos 144 tiles, layers de overlay/unidades, atalhos `I`/`Esc`; workflow roda testes core+Phaser | [PR #11](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/11) · [Issue #10](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/issues/10) · [CI](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38880712097) |
| M2b — Assets de terceiros | **Pendente**: Kenney/Tiddybub não incorporados; manifest de terceiros vazio. Arte atual é autoral local | [Manifest](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/blob/feat/phaser-combat-ux-m3/docs/assets-manifest.json) |
| **M3b — Mira de área e proteção contra fogo amigo** | **Publicada em beta:** AOE inicial, avisos de aliados atingíveis, duplo toque, guia de playtest, save protegido no primeiro toque; 24 testes e Chromium aprovados | [PR #13](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/13) · [CI](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38955658327) · [Pages](https://pedromaintenance.github.io/ironwood-a-ultima-resistencia/phaser-preview/) |
| **M5 parcial — Distribuição segura no Pages** | Build testado compilado de SHA fixo, pasta independente `phaser-preview/`, limpeza de assets obsoletos e SW Canvas não intercepta preview | [Deploy](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38955974230) · [Workflow](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/blob/main/.github/workflows/publish-phaser-beta.yml) |
| **M3c — Pool de sprites dos combatentes** | **Implementado, testado e distribuído como beta:** sprite e contêiner persistentes, cache de terreno, contadores de alocação e testes de estabilidade | [PR #14](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/14) · [CI 24/24](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38957047595) |
| **M3d — Travamento seguro de comandos durante animações** | **Implementado, 24/24 testes e CI/browser aprovados, build beta publicado:** o jogador não gasta PA ou RNG em clique repetido durante movimento; inspeção e seleção continuam | [PR #16](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/16) · [CI](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38961163306) · [publicação](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38961411555) |
| **M3e — HUD incremental e feedback** | **CI verde e beta compilada no Pages:** botões/foco persistentes, mensagens de comandos recusados e saves preservados; 24/24 core + smoke Chromium | [PR #18](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/18) · [CI](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38964097106) · [Beta](https://pedromaintenance.github.io/ironwood-a-ultima-resistencia/phaser-preview/) |
| **M3f — overlays/log incrementais e FPS** | **Publicado em beta:** cache de overlay, registro e upgrades, contagem passiva de FPS; core 24/24 e Chromium aprovados | [PR #20](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/20) · [CI](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38966907392) · [publicação](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38967434066) |
| **M3g — objetivos e fluxo até a próxima missão** | **25/25 testes e workflow de publicação aprovados:** sete tipos de objetivo, progresso acessível, vitória real por fixture e escolha de melhoria | [PR #22](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/22) · [CI](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38969025016) · [publicação](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38969342926) |
| **M4a — totems físicos e marcadores de objetivos** | **CI 26/26 e Chromium aprovados; publicação aguardando:** ataque físico a totem e símbolos de objetivos, com teste de dois golpes | [PR #24](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/24) · [Issue #25](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/issues/25) |
| **M4b — derrota, retry e três finais** | **29/29 testes, Chromium e build publicados:** derrota persistente, retry explícito e 3 epílogos originais; implantação Pages/QA físico independentes | [PR #26](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/26) · [Issue #27](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/issues/27) |
| Próximos M4–M5 — campanha integral, QA e distribuição | Pendente: jogar missão 1 sem fixture, oito missões e três finais, medir FPS/memória em hardware real, PWA instalável e offline | [Issue #23](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/issues/23) |

### M3e — HUD incremental e feedback (CI e publicação concluídas)

**[JOGAR BETA M3e NO PAGES](https://pedromaintenance.github.io/ironwood-a-ultima-resistencia/phaser-preview/)** · [PR #18](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/pull/18) · [Issue #19](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/issues/19) · [Guia técnico](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/blob/feat/phaser-hud-feedback-m3e/docs/M3E_HUD_FEEDBACK.md).

O commit **`fd27434a`** passou em [24/24 testes do core e smoke Chromium desktop/mobile](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38964097106). O [workflow de publicação](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia/actions/runs/38964449033) concluiu com sucesso, compilando somente `main/phaser-preview/` e preservando o Canvas em `main/index.html`. O job do Pages é uma validação separada do upload dos arquivos.

- [x] **HUD persistente:** reaproveitar os botões/listeners de habilidades enquanto o conjunto de magias não muda; atualizar somente `disabled`, `active` e `aria-pressed`.
- [x] **Foco e teclado:** preservar o foco do botão ao escolher uma magia e reforçar `focus-visible`.
- [x] **Feedback acessível:** informar ataques/movimentos/magias indisponíveis, usando motivos retornados pela prévia do motor e um painel `aria-live`.
- [x] **Saves:** comandos inválidos e simples seleção de aliados não sobrescrevem o save separado do Phaser.
- [x] **Telemetria e regressão:** `#skills[data-builds]`, foco de habilidade e save estável verificados no Chromium; 24/24 testes de core.
- [ ] **QA humano:** validar em desktop e Android/iOS reais; completar missão 1 e as oito missões, testar FPS/memória, orientar PWA/offline.

**Como testar:** escolha três heróis, abra o combate e use o botão de uma magia. A seleção deve manter o foco de teclado. Escolha uma casa distante/impossível e observe a mensagem de recusa sem gastar mana ou alterar o save; depois faça uma ação válida, encerre o turno e continue a campanha após recarregar.

**Integridade:** a [versão Canvas original](https://pedromaintenance.github.io/ironwood-a-ultima-resistencia/) continua independente; os saves seguem em `ironwood_campaign_v1` (Canvas) e `ironwood_phaser_preview_v1` (Phaser).

### Próximas entregas — M3f, M4 e M5

**M3d concluída nos testes automatizados:** o combate agora recusa ordens mutantes durante os tweens e expõe o motivo; nenhuma ação é enfileirada para execução futura, evitando alvo obsoleto. O código permanece em PR draft; o beta foi distribuído somente como artefato isolado.

**M3e — UX e desempenho:**
- [x] M3c: cache de 144 tiles e objetos persistentes de personagens.
- [x] M3d: bloquear movimentos, ataques, magias e encerramento de turno durante animações, mantendo inspeção e seleção.
- [ ] Reduzir reconstrução de botões do HUD e redesenho de overlays; realizar pooling de VFX.
- [ ] Melhorar feedback de alvo inválido, erro/dano, visualização de cobertura e teclado para mira em grade.
- [ ] Medir FPS/memória/bateria em hardware real e validar opção de movimento reduzido.

**M4/M5 — campanha e release:**
- [ ] Jogar a missão 1 inteira com objetivos reais, depois oito missões e três finais.
- [ ] Validar saves reais de Canvas e casos de corrupção/interrupção.
- [ ] Testar Android/iOS físico (incluindo toques rápidos) e acessibilidade.
- [ ] Instalação do beta como PWA próprio e teste offline seguro.
- [ ] Preparar critérios de substituição da versão Canvas somente após homologação.

**Regra:** `main` continua hospedando o Canvas original; publicar betas Phaser na subpasta não equivale a mesclar os PRs ou concluir QA físico.

## 1. Objetivo

Migrar Ironwood de Canvas 2D artesanal para **Phaser + TypeScript + Vite**, preservando o sistema de combate por turnos e a operação offline (PWA). A floresta continua sendo a mecânica central: clima, fogo, água, gelo, teias, raízes, névoa, eletricidade e corrupção devem continuar interagindo com combate, caminhos e objetivos.

### Base existente

- 8 missões e 4 atos, com 3 finais narrativos.
- 6 heróis, equipes de 3, 2 pontos de ação por turno.
- 12×12 casas procedurais, IA, terreno dinâmico e clima.
- Magias/manobras definidas em `SKILLS`; verificar divergência de contagem editorial (README menciona 32).
- `ENEMIES` declara cinco inimigos comuns e um chefe; o README menciona seis tipos comuns e um chefe. Corrigir somente após auditoria.
- Saves JSON e localStorage (chave `ironwood_campaign_v1`, formato `ver:1`).
- PWA instalável com `sw.js` e `manifest.webmanifest`.
- Arquivos: `index.html`, `style.css`, `app.js`, `sw.js`, `manifest.webmanifest`, `free-asset-gallery.md`, `icons/`.

**Princípio:** preservar toda a mecânica antes de qualquer mudança de balanceamento ou expansão narrativa.

## 2. Stack e arquitetura proposta

- Phaser (versão fixada no lockfile, confirmar compatibilidade na fase de scaffolding).
- TypeScript, Vite, Vitest e Playwright.
- Renderização por Tilemaps, Sprites, Tweens, Particles e cenas.
- GitHub Pages com `base: '/ironwood-a-ultima-resistencia/'`.
- HUD HTML/CSS inicialmente reaproveitado, favorecendo acessibilidade e toque.
- Sem engine de física: combate, IA, alcance, terreno e caminhos ficam no core.
- Saves: leitor `ver:1`, futura gravação `ver:2` somente após migração e testes.
- Build e recursos disponíveis offline sem CDN obrigatória.

### Organização-alvo

```text
src/
  main.ts
  game/
    scenes/BootScene.ts MenuScene.ts SquadScene.ts BattleScene.ts ResultScene.ts
    render/BoardRenderer.ts UnitRenderer.ts EffectRenderer.ts
    input/GridInput.ts
  core/
    data/heroes.ts enemies.ts missions.ts skills.ts upgrades.ts
    combat/turns.ts actions.ts damage.ts targeting.ts
    terrain/board.ts rules.ts climate.ts
    ai/enemyAI.ts
    campaign/state.ts objectives.ts progression.ts
    rng/seededRandom.ts
  ui/
  services/SaveManager.ts AssetRegistry.ts
public/
  assets/tiles/ characters/ enemies/ effects/ ui/ audio/
  manifest.webmanifest
  icons/
tests/
docs/assets-manifest.json
```

## 3. Roadmap — executar uma fase por vez

### Fase 0 — Preservação, inventário e baseline [P0]
- [ ] Criar a branch `feat/phaser-migration` partindo da `main`, mantendo o jogo publicado intacto.
- [ ] Registrar versão original e inventário de arquivos, heróis, inimigos, habilidades, objetivos, terrenos e saves.
- [ ] Documentar comportamento observável de alcance, movimento, ataque, turno, IA, ambiente e vitória/derrota.
- [ ] Criar fixtures com mapa, grupo e sequência de ações de referência; preservar saves de teste sem informações pessoais.
- [ ] Definir casos de regressão para comparar jogo original e futuro core.

**Gate G0:** versão original preservada, inventário verificável e casos comparativos definidos.

### Fase 1 — Extrair motor de regras e testes [P0]
- [ ] Separar `HEROES`, `MISSIONS`, `ENEMIES`, `SKILLS` e `UPGRADES` de DOM e Canvas.
- [ ] Extrair tabuleiro, pathfinding, linha de visão, combate, IA, clima e objetivos.
- [ ] Substituir `G` global em regras por `GameState` explícito.
- [ ] Core deve devolver estado e eventos semânticos, e não manipular interface.
- [ ] Injetar PRNG determinístico (a seed já é persistida, mas `Math.random()` ainda é usado).
- [ ] Testar fogo+água, gelo+água, teia+fogo, eletricidade+água, névoa+linha de visão, raízes+movimento e corrupção+purificação.

**Gate G1:** resolução de missão sem interface; testes repetíveis; regras principais equivalentes ao original.

### Fase 2 — Primeira missão em Phaser [P0] — MVP
- [ ] Criar app Phaser + Vite + TypeScript, BootScene e BattleScene.
- [ ] Renderizar tabuleiro 12×12 com terreno e efeitos do core.
- [ ] Exibir três aliados e inimigos com sprites temporários autorizados.
- [ ] Seleção, alcance, caminho, ataque, magia, turno adversário e objetivo com pointer/touch.
- [ ] Animar movimento, dano, morte e mudança de turno; HUD HTML inicialmente.
- [ ] Concluir *A Trilha Fechada* até vitória/derrota e retornar ao menu.

**Gate G2 — MVP:** missão 1 jogável em desktop e celular sem regressão aparente.

### Fase 3 — Pipeline de free-assets [P0]
- [ ] Usar `free-asset-gallery.md` como catálogo, não como licença global.
- [ ] Priorizar Kenney Roguelike/RPG e Characters; explorar Tiddybub `fantasy`, `nature`, `effects` e `ui`.
- [ ] Escolher família visual-base, mesma perspectiva, grade, escala e paleta.
- [ ] Usar tiles de 16×16 ampliados 2× quando necessário, grade lógica 32×32.
- [ ] Mapear `tree`, `bush`, `water`, `rock`, `bones`, `fire`, `web`, `fog`, `corrupt` etc. para atlas e efeitos.
- [ ] Criar `docs/assets-manifest.json`: caminho, URL, autor, licença, atribuição, alterações e uso.
- [ ] Produzir sprites personalizados para heróis e antagonistas principais.

**Aceite:** todas as unidades e terrenos do MVP são legíveis; 100% dos assets importados têm procedência/licença.

### Fase 4 — Paridade completa de combate [P0]
- [ ] Integrar seis heróis e todas as habilidades presentes em `SKILLS`.
- [ ] IA, condições, dano em estruturas, obstáculos, objetivos e clima.
- [ ] VFX refletem o estado do core, sem alterá-lo.
- [ ] Otimizar camadas/dirty tiles e isolar input durante animações críticas.
- [ ] Testes para friendly fire, empurrões, line-of-sight, cobertura e interação ambiental.

**Gate G3:** matriz de paridade aprovada para o conjunto de regras do jogo original.

### Fase 5 — Experiência audiovisual e mobile [P1]
- [ ] Animações de movimento, ataques, feitiços, clima e feedback de impactos.
- [ ] HUD responsivo e controles grandes, inclusive telas de 360×800.
- [ ] Teclado, mouse e touch; zoom opcional; legibilidade do tabuleiro.
- [ ] Audio/mute/volume e política mobile de autoplay.
- [ ] Opção de movimento reduzido, contraste e feedback além da cor.

**Aceite:** jogabilidade fluida e acessível em celular e desktop.

### Fase 6 — Campanha integral [P1]
- [ ] 8 missões, 4 atos; objetivos `kill`, `rescue`, `totem`, `survive`, `cleanse`, `beacon`, `boss`.
- [ ] Três finais, progressão persistente, três dificuldades e equipe.
- [ ] Briefings, diálogos, tela entre missões, diário e resultado.
- [ ] Saves antigos importados e retomada após fechar/reabrir.

**Gate G4:** campanha inteira concluível, resultados e estatísticas consistentes.

### Fase 7 — PWA e publicação [P0 para release]
- [ ] CI: testes, build, deploy de GitHub Pages.
- [ ] Configuração correta de base Vite.
- [ ] Cache versionado de bundles e assets, sem depender de CDN.
- [ ] Atualizar/substituir com segurança o SW antigo (`sw.js` com lista manual).
- [ ] Instalação no Android/desktop, instruções para iOS e controle manual de instalação quando aplicável.
- [ ] Modo avião após primeiro acesso e upgrade sem perda de save.

**Gate G5:** instalável, jogável offline e atualizável de forma segura.

### Fase 8 — QA e lançamento [P1]
- [ ] Testes unitários e E2E em browsers representativos.
- [ ] Saves antigos/inválidos, tela pequena, interrupções e cache.
- [ ] Conferir desempenho, tamanho do download, paleta, alinhamento, áudio e créditos.
- [ ] Publicar release estável e conservar rollback da versão anterior.

**Aceite:** zero bugs bloqueantes conhecidos; gates e testes aprovados.

## 4. MVP: checklist

- [ ] Mapa 12×12 com sprites e geração procedural.
- [ ] Três combatentes selecionáveis.
- [ ] Movimento com alcance e custo.
- [ ] Ataque básico e IA adversária.
- [ ] Pelo menos três magias interagindo com terreno.
- [ ] Vitória e derrota da missão 1.
- [ ] Save/retomada.
- [ ] Toque e mouse.

## 5. Riscos

1. Acoplamento de regras, DOM e Canvas no `app.js`: refatoração incremental com cenários de comparação.
2. `Math.random()` apesar da `seed` registrada: PRNG explícito e reproduzibilidade de testes.
3. Licenças heterogêneas em repositórios de assets: conferir pacote/arquivo e registrar proveniência.
4. Perspectiva/escala inconsistentes: uma família artística como base, demais mediante adaptação.
5. `ver:1` quebrar: leitor legado, versão nova somente após migração e backup.
6. Cache obsoleto de PWA: troca segura do Service Worker e estratégia de atualização versionada.
7. Performance mobile: limitar VFX e medir em dispositivos reais.
8. Aumento prematuro de escopo: nenhuma nova campanha/multiplayer/editor antes da paridade.

## 6. Prioridades

**P0:** baseline, core, testes, MVP da missão 1, todos os estados de terreno, licenças, saves, offline.  
**P1:** campanha completa, sprites finais, áudio, acessibilidade, polimento e release.  
**P2 (pós-lançamento):** editor de mapas, missões novas, coop, novos sistemas políticos.

## 7. Próxima ação

**Executar a Fase 0**, registrar seu resultado em `docs/BASELINE.md` e `docs/REGRESSION_CASES.md` na branch de migração. Somente após gate G0 aprovado, abrir o desenvolvimento do core. Manter o `main` jogável durante todo o trabalho.

## Referências

- [Código original](https://github.com/pedromaintenance/ironwood-a-ultima-resistencia)
- [Biblioteca de free-assets](free-asset-gallery.md)
- [Phaser](https://phaser.io/)
- [Kenney Roguelike/RPG](https://kenney.nl/assets/roguelike-rpg-pack)
- [Kenney Characters](https://kenney.nl/assets/roguelike-characters)
- [Tiddybub 2D assets](https://github.com/Tiddybub/2d-assets)
