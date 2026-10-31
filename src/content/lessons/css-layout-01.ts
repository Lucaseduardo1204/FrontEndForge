import { Lesson } from '../../app/core/models/content.models';

/** Layout claims measured in a real Chromium (D-060); jsdom has no layout engine. */
export const BAR_CSS = `.barra {
  display: flex;
  align-items: center;   /* centraliza no eixo cruzado (vertical) */
  gap: 1rem;
}

.barra .sair {
  margin-left: auto;     /* ocupa a sobra à esquerda: empurra para a direita */
}`;

export const CARDS_CSS = `.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(12rem, 100%), 1fr));
  gap: 1rem;
}`;

export const PAGE_CSS = `.pagina {
  display: grid;
  grid-template-areas:
    'topo'
    'conteudo'
    'rodape';
  min-height: 100dvh;
  grid-template-rows: auto 1fr auto;
}

@media (min-width: 64rem) {
  .pagina {
    grid-template-columns: 16rem 1fr;
    grid-template-areas:
      'topo topo'
      'menu conteudo'
      'rodape rodape';
  }
}

.pagina > header { grid-area: topo; }
.pagina > nav    { grid-area: menu; }
.pagina > main   { grid-area: conteudo; }
.pagina > footer { grid-area: rodape; }`;

export const MIN_WIDTH_CSS = `.linha {
  display: flex;
  gap: 0.5rem;
}

.linha > .texto {
  flex: 1;
  min-width: 0;            /* deixa o item encolher abaixo do conteúdo */
  overflow-wrap: anywhere; /* e permite quebrar o texto sem espaços */
}`;

export const CSS_LAYOUT_01: Lesson = {
  id: 'css-layout-01',
  moduleId: 'css-flex-grid',
  title: 'Layout com Flexbox e Grid',
  summary:
    'Alinhar, distribuir e organizar elementos em uma ou duas dimensões, com layouts que se ajustam ao espaço sem medidas fixas, e os detalhes que fazem conteúdo vazar.',
  estimatedMinutes: 45,
  difficulty: 'introductory',
  conceptIds: ['css-flexbox', 'css-grid', 'css-responsive-layout'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Quase toda interface é uma combinação de duas coisas: linhas de elementos alinhados (uma barra de navegação, um campo com botão) e grades (cartões, painéis, o esqueleto da página). Flexbox e Grid resolvem isso sem floats, sem posições absolutas e sem contas de largura.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Escolher entre Flexbox (uma dimensão) e Grid (duas).',
            'Alinhar e distribuir itens nos dois eixos.',
            'Criar grades que mudam o número de colunas sozinhas.',
            'Montar o esqueleto da página com áreas nomeadas.',
            'Entender por que um item flex não encolhe e vaza.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'Uma prateleira e um tabuleiro',
      blocks: [
        {
          type: 'paragraph',
          text: 'Flexbox é uma prateleira: os objetos ficam lado a lado numa direção, e você decide como dividir o espaço que sobra e como alinhá-los na altura. Grid é um tabuleiro: você desenha linhas e colunas primeiro e encaixa cada peça numa casa, ou numa área de várias casas.',
        },
        {
          type: 'paragraph',
          text: 'Na prateleira, o tamanho dos objetos manda (o conteúdo define o layout). No tabuleiro, o desenho manda (o layout define onde o conteúdo vai).',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Eixos, frações e áreas',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'display: flex cria um contêiner flexível. Os filhos se alinham no eixo principal (por padrão, a linha); flex-direction: column troca o eixo.',
            'justify-content distribui no eixo principal (início, centro, space-between...); align-items alinha no eixo cruzado; gap espaça os itens sem margens.',
            'flex: 1 faz o item ocupar a sobra; margin-left: auto em um item empurra ele (e os seguintes) para o fim.',
            'Itens flex não encolhem abaixo do tamanho mínimo do conteúdo (min-width: auto). Um texto sem pontos de quebra, como um token ou URL sem hífens, faz a linha vazar. min-width: 0 libera o encolhimento; overflow-wrap: anywhere deixa o texto quebrar.',
            'display: grid cria colunas e linhas. fr divide o espaço disponível; repeat(n, ...) repete; minmax(mín, máx) define limites.',
            'repeat(auto-fill, minmax(12rem, 1fr)) cria quantas colunas couberem. Com poucos itens, auto-fill mantém as colunas vazias (os itens ficam do tamanho mínimo); auto-fit colapsa as vazias e estica os itens.',
            'grid-template-areas desenha o esqueleto com nomes, e uma media query redesenha as áreas para telas maiores, sem mudar o HTML.',
            'Centralizar no Grid: place-items: center. No Flexbox: justify-content e align-items em center.',
            'A ordem visual deve seguir a ordem do HTML: order e grid-area podem mudar a posição na tela, mas o teclado e o leitor de tela seguem o código.',
          ],
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: barra, cartões e esqueleto da página',
      blocks: [
        {
          type: 'paragraph',
          text: 'Uma barra com logo, links e um botão de sair na ponta direita, tudo centralizado na vertical:',
        },
        { type: 'code', language: 'css', caption: 'barra.css', code: BAR_CSS },
        {
          type: 'paragraph',
          text: 'Uma grade de cartões que ajusta o número de colunas sozinha (min() evita rolagem lateral em telas estreitas, como na lição de responsividade):',
        },
        { type: 'code', language: 'css', caption: 'cartoes.css', code: CARDS_CSS },
        {
          type: 'paragraph',
          text: 'O esqueleto da página: uma coluna no celular; menu lateral a partir de 64rem.',
        },
        { type: 'code', language: 'css', caption: 'pagina.css', code: PAGE_CSS },
        {
          type: 'paragraph',
          text: 'E a correção do item que vaza. Medido num Chromium real: numa linha de 300px com um texto sem pontos de quebra e um botão, sem min-width: 0 a linha passou a ocupar 592px e o botão saiu da área; com a correção, coube nos 300px. Com uma URL cheia de hífens, o problema não aparece, porque o navegador quebra nos hífens: ele surge com tokens, hashes e códigos.',
        },
        { type: 'code', language: 'css', caption: 'linha.css', code: MIN_WIDTH_CSS },
        {
          type: 'callout',
          tone: 'info',
          title: 'Medido no navegador',
          text: 'Num contêiner de 800px com dois itens e minmax(150px, 1fr): auto-fill criou cinco colunas de 160px (três vazias); auto-fit colapsou as vazias e deixou os dois itens com 400px cada. Esta plataforma teve um bug real da mesma família do min-width (registrado nas decisões do projeto): trechos de código sem espaço impediam colunas de encolher a 320px.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Investigue no navegador',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'No DevTools, selecione um contêiner flex ou grid: o Chrome mostra um selo "flex" ou "grid" ao lado do elemento. Clique nele para ver as linhas e os espaços.',
            'Monte a grade de cartões com dois cartões e troque auto-fill por auto-fit. Compare a largura dos cartões.',
            'Coloque um texto sem espaços longo num item flex e veja a linha vazar; acrescente min-width: 0.',
            'Mude o tamanho da janela com o esqueleto da página e veja as áreas se reorganizarem.',
          ],
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Prática',
      blocks: [
        {
          type: 'paragraph',
          text: 'No laboratório, monte a barra e a grade de cartões. Os testes medem o layout de verdade na prévia: alinhamento, posição e espaçamento. Depois, responda sobre auto-fill e auto-fit.',
        },
      ],
      exerciseIds: ['lab-css-layout', 'layout-01-autofit'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: o botão que sai da tela',
      blocks: [
        {
          type: 'code',
          language: 'html',
          caption: 'Num celular, o botão Copiar some à direita',
          code: `<div class="linha">
  <span class="texto">token_de_acesso_abcdefghijklmnopqrstuvwxyz0123456789</span>
  <button type="button">Copiar</button>
</div>
<style>
  .linha { display: flex; gap: 0.5rem; }
  .linha > .texto { flex: 1; }
</style>`,
        },
      ],
      exerciseIds: ['layout-01-min-width'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Esta plataforma usa Grid para o esqueleto (barra lateral e conteúdo) e para as grades de cartões, e Flexbox para barras, linhas de botões e campos com ícone.',
            'Componentes reutilizáveis ficam mais robustos com flex-wrap e gap do que com larguras fixas.',
            'Container queries (@container) permitem que um componente se adapte ao espaço do próprio contêiner, e não da tela inteira.',
          ],
        },
      ],
    },
    {
      kind: 'assessment',
      title: 'Avaliação',
      blocks: [
        { type: 'paragraph', text: 'Para concluir a lição, acerte os três exercícios abaixo.' },
      ],
      exerciseIds: ['layout-01-choose', 'layout-01-push', 'layout-01-order'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Flexbox: uma dimensão, o conteúdo manda. Grid: duas dimensões, o desenho manda.',
            'justify-content no eixo principal, align-items no cruzado, gap entre itens.',
            'margin-left: auto empurra; flex: 1 ocupa a sobra.',
            'auto-fill mantém colunas vazias; auto-fit estica os itens.',
            'Item flex que vaza: min-width: 0 e overflow-wrap.',
            'A ordem visual segue a ordem do HTML.',
          ],
        },
        { type: 'paragraph', text: 'Na Biblioteca: "Flexbox ou Grid?".' },
      ],
    },
  ],
};
