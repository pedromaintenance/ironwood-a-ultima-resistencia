# M3g — Objetivos vivos e transição entre missões

**Escopo:** mostrar progresso real dos objetivos das oito missões e testar, no navegador, o ciclo vitória → escolha de melhoria → segunda missão. Implementado na branch `feat/phaser-mission-goals-m3g`, baseada na M3f.

## Fonte de verdade

O progresso vem de `missionProgress()` em `src/core/objectives.js`: função pura, sem alteração de estado, sem RNG e sem cálculo paralelo de vitória. O resultado real da operação continua sendo determinado exclusivamente por `missionOutcome()`, usado por `engine.js`.

| Tipo de missão | Progresso apresentado | Critério de vitória existente |
| --- | --- | --- |
| `kill` — A Trilha Fechada / A Marcha das Cinzas | Inimigos derrotados / total conhecido | Não há inimigos vivos |
| `rescue` — Os Nomes dos Desaparecidos | Prisioneiros libertos / total | Todos os prisioneiros marcados `cleared` |
| `totem` — Totens da Servidão | Totens destruídos / total | Todos os totens marcados `cleared` |
| `survive` — A Noite Mais Longa | Até 6 rodadas completas | `round > 6` |
| `cleanse` — A Seiva Corrompida | Focos purificados / total | Todos os focos marcados `cleared` |
| `beacon` — Os Faróis do Crepúsculo | Marcos ativados / total | Todos os marcos marcados `cleared` |
| `boss` — O Espinho da Rainha | PV retirados da campeã / PV máximos | Campeã não está viva |

O painel usa elementos `<progress>` com rótulo de acessibilidade, descrição contextual e indicação explícita de vitória ou derrota. O layout mantém a ordem da missão/ato e apresenta uma barra legível no celular.

Os dados de teste em `#goalPanel`: `data-goal-kind`, `data-goal-status`, `data-goal-completed` e `data-goal-total`. Todas as alterações do painel derivam do snapshot e não chamam nenhuma ação do jogo.

## Regressões adicionadas

- [x] Testar todas as modalidades de objetivo contra os limiares de `missionOutcome()`.
- [x] Provar que a leitura do progresso não altera estado, objetos recebidos ou RNG.
- [x] Testar o início da missão 1 com 4 inimigos vivos.
- [x] Criar fixture v1 válido próximo da vitória, importá-lo e comprovar que importar não concede vitória automaticamente.
- [x] Realizar **uma ação real através da cena Phaser** para forçar o motor a concluir a missão.
- [x] Conferir fase `between`, `wins=1`, três opções de melhoria e painel com objetivo concluído.
- [x] Escolher melhoria usando o botão real, verificar entrada na missão 2 com dois reféns pendentes e upgrade registrado.
- [ ] CI 24+ testes do core + compilação Vite/Phaser + smoke Chromium desktop/mobile verde.
- [ ] Publicar o SHA exato aprovado, preservando `main/index.html`, `app.js`, `sw.js` e saves Canvas.
- [ ] Playthrough manual completo em hardware físico, sem fixture de preparação.

## Limites do teste

O teste automático usa um save válido *próximo* da vitória com inimigos já derrotados, para testar de forma determinística o fluxo entre cenas sem simular dezenas de rodadas. Portanto, ele **não equivale a concluir toda a primeira missão jogando normalmente**. As oito missões e três finais ainda requerem playthrough, sobretudo os objetivos ambientais e sobrevivência.

## Publicação

Beta isolado em https://pedromaintenance.github.io/ironwood-a-ultima-resistencia/phaser-preview/ somente após CI verde. O código-fonte continua em PR dependente/draft; o Canvas original e seu salvamento permanecem inalterados.
