# A Última Resistência de Ironwood

Jogo de estratégia por turnos e RPG tático para celular, ambientado no cenário **Carcaça**. **PWA instalável e jogável offline** em navegadores compatíveis. Não precisa de servidor, API ou bibliotecas externas.

## Como publicar no GitHub Pages

1. Crie um repositório público, por exemplo `a-ultima-resistencia-de-ironwood`.
2. Envie para a **raiz** do repositório os seguintes arquivos e diretório, mantendo seus nomes:

   ```
   index.html
   style.css
   app.js
   sw.js
   manifest.webmanifest
   .nojekyll
   icons/icon-192.png
   icons/icon-512.png
   README.md
   ```
3. Em **Settings → Pages**, escolha **Deploy from a branch** e **main / (root)**; clique em Save.
4. Abra `https://SEU-USUARIO.github.io/a-ultima-resistencia-de-ironwood/`.
5. Aguarde a confirmação **PRONTO PARA JOGAR SEM INTERNET** na tela de título.
6. Android / Chrome: menu → **Instalar aplicativo** ou **Adicionar à tela inicial**. iPhone / Safari: compartilhar → **Adicionar à Tela de Início**.
7. Abra o ícone instalado uma vez com internet e teste novamente usando modo avião.

**Importante:** o primeiro carregamento precisa de rede para transferir e guardar os arquivos. Repositórios do GitHub Pages são servidos por HTTPS. O cache local pode ser removido pelo sistema ou pelo usuário; o jogo possui **Exportar/Importar Save** para ajudar a preservar o progresso.

## Como jogar

- **Toque em um aliado** para selecioná-lo. Monte uma equipe com três dos seis heróis.
- Cada aliado recebe **2 pontos de ação por rodada**.
- **MOVER**: mostra casas alcançáveis (destaque azul); toque no destino.
- **ATACAR**: toque em um inimigo no alcance ou em um totem.
- **MAGIAS E MANOBRAS**: escolha uma habilidade, depois toque no alvo. Ações usam 1 ponto de ação e consomem mana; mana recupera 2 pontos por rodada.
- **INTERAGIR**: resgate reféns, purifique focos ou ative marcos quando estiver adjacente.
- **INSPECIONAR**: toque numa casa do mapa para ver condições de terreno e unidades.
- **FIM DO TURNO**: o inimigo age, o clima muda e efeitos ambientais evoluem.
- No computador use mouse; atalhos: **M** (Mover), **A** (Atacar), **E** (Encerrar turno).

## A floresta é a mecânica

Todos os 144 quadrados de um mapa (12×12) possuem estado próprio. As cartas de habilidades usam regras simplificadas de linha de visão, alcance, defesa, posicionamento e efeitos de área.

| Efeito | Interação no campo |
|---|---|
| Fogo | Fere ocupantes, destrói vegetação e pode se espalhar por árvores, arbustos e teias |
| Água/umidade | Apaga incêndios, cria poças e conduz eletricidade |
| Gelo | Congela áreas úmidas e cria terreno difícil |
| Teias | Prendem ocupantes e queimam com fogo |
| Raízes e espinhos | Imobilizam ou punem deslocamentos |
| Névoa e vapor | Impedem linhas de tiro através de suas casas |
| Muralhas | Alteram caminhos; podem ser derrubadas |
| Corrupção | Prejudica unidades aliadas e pode ser purificada |
| Clima | Vento dispersa névoa; chuva reduz incêndios |

Ao final de cada operação, você escolhe uma melhoria persistente para a campanha. A morte de toda a equipe provoca retirada; a mesma missão pode ser tentada novamente com mapa novo e melhorias anteriores preservadas.

## O que há nesta versão

- 8 missões e 4 atos, com história ambientada em Ironwood, Eldroth e Thargrid.
- 6 personagens jogáveis; escolha 3 por missão.
- 32 ações especiais no motor de combate, incluindo manobras e magias de terreno.
- 6 tipos comuns de inimigos e um chefe.
- 3 dificuldades (Aprendiz, Resistência, Implacável).
- Geração procedural das florestas e rotas acessíveis até os objetivos.
- 3 finais narrativos, de acordo com o uso do fogo e das operações de resgate/purificação.
- Salvamento automático local + exportação/importação em JSON.
- Visualização estreita e vertical também em monitores de desktop.

## Referências e adaptação

O conteúdo foi desenvolvido para o cenário autoral **Carcaça**, especialmente a resistência de Ironwood sob Elara Stormoak e a ocupação shadow fey. As habilidades tomam inspiração em nomes e princípios de magias encontrados no *Livro do Jogador de D&D 5ª edição*, incluindo Bola de Fogo, Teia, Crescer Espinhos, Névoa Obscurecente, Criar ou Destruir Água, Raio de Gelo e outras. **Valores, durações, ações e efeitos são adaptações para este jogo**; não são uma implementação oficial de D&D. Textos e ilustrações do livro não estão embutidos na distribuição.

## Arquitetura

HTML5, CSS, JavaScript vanilla e Canvas 2D. Service Worker com cache local dos recursos estáticos. Ícones originais gerados para a aplicação. Sem bibliotecas, CDN, trackers ou chamadas a servidor depois do primeiro download. O save permanece no armazenamento local do navegador e pode ser exportado para arquivo.
