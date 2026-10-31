import { Exercise } from '../../app/core/models/content.models';

/**
 * lab-css-layout measures real layout (getBoundingClientRect), which jsdom does not compute:
 * its reference solution is verified in a real browser instead (D-060).
 */
export const LAYOUT_LAB_SOLUTION = `<style>
  .barra {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 1rem;
    background: #1e293b;
    color: white;
  }
  .barra a { color: white; }
  .barra .sair { margin-left: auto; }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(10rem, 100%), 1fr));
    gap: 1rem;
  }
  .card { border: 1px solid #ccc; padding: 1rem; }
</style>

<header class="barra">
  <strong class="logo">Receitas</strong>
  <a href="/receitas">Receitas</a>
  <a href="/sobre">Sobre</a>
  <button type="button" class="sair">Sair</button>
</header>

<main class="cards">
  <article class="card">Bolo de cenoura</article>
  <article class="card">Salada de grão-de-bico</article>
  <article class="card">Pão de fermentação natural</article>
  <article class="card">Sopa de abóbora</article>
</main>`;

export const CSS_LAYOUT_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-css-layout',
    kind: 'code',
    language: 'html',
    title: 'Barra alinhada e grade de cartões',
    difficulty: 'introductory',
    conceptIds: ['css-flexbox', 'css-grid'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Ajuste o CSS para que a barra e os cartões fiquem como no requisito. Os testes medem a posição real dos elementos na prévia, então qualquer solução que produza o layout passa, com Flexbox ou Grid.',
      },
    ],
    requirements: [
      'Na barra, o logo e o botão "Sair" ficam centralizados na vertical, um em relação ao outro.',
      'O botão "Sair" fica encostado na ponta direita da barra (respeitando o padding).',
      'Os cartões têm todos a mesma largura e nenhum passa da borda do contêiner.',
      'Há pelo menos 1rem (16px) de espaço entre cartões vizinhos.',
      'Não mude o HTML: só o CSS.',
    ],
    examples: [],
    starterCode: `<style>
  .barra { padding: 0.5rem 1rem; background: #1e293b; color: white; }
  .barra a { color: white; }
  .sair { padding: 0.75rem 1rem; }
  .card { border: 1px solid #ccc; padding: 1rem; }
</style>

<header class="barra">
  <strong class="logo">Receitas</strong>
  <a href="/receitas">Receitas</a>
  <a href="/sobre">Sobre</a>
  <button type="button" class="sair">Sair</button>
</header>

<main class="cards">
  <article class="card">Bolo de cenoura</article>
  <article class="card">Salada de grão-de-bico</article>
  <article class="card">Pão de fermentação natural</article>
  <article class="card">Sopa de abóbora</article>
</main>
`,
    tests: [
      {
        id: 'centered',
        description:
          'Logo e botão centralizados na vertical (diferença de até 1px entre os centros)',
        source:
          "const c = (el) => { const r = el.getBoundingClientRect(); return r.top + r.height / 2; }; expect(Math.abs(c(document.querySelector('.logo')) - c(document.querySelector('.sair'))) <= 1).toBe(true);",
      },
      {
        id: 'right',
        description: 'O botão "Sair" encosta na ponta direita da barra, respeitando o padding',
        source:
          "const barra = document.querySelector('.barra'); const fim = barra.getBoundingClientRect().right - parseFloat(getComputedStyle(barra).paddingRight) - parseFloat(getComputedStyle(barra).borderRightWidth); expect(Math.abs(document.querySelector('.sair').getBoundingClientRect().right - fim) <= 1).toBe(true);",
      },
      {
        id: 'one-line',
        description: 'Logo, links e botão ficam na mesma linha',
        source:
          "const tops = ['.logo', '.barra a', '.sair'].map((s) => { const r = document.querySelector(s).getBoundingClientRect(); return [r.top, r.bottom]; }); const sobrepoem = tops.every(([t, b]) => tops.every(([t2, b2]) => t < b2 && t2 < b)); expect(sobrepoem).toBe(true);",
      },
      {
        id: 'same-width',
        description: 'Todos os cartões têm a mesma largura',
        source:
          "const w = Array.from(document.querySelectorAll('.card')).map((c) => c.getBoundingClientRect().width); expect(Math.max(...w) - Math.min(...w) <= 1).toBe(true);",
      },
      {
        id: 'gap',
        description: 'Pelo menos 16px entre cartões vizinhos',
        source:
          "const r = Array.from(document.querySelectorAll('.card')).map((c) => c.getBoundingClientRect()); const espacos = r.slice(1).map((b, i) => { const a = r[i]; return Math.abs(a.top - b.top) < 1 ? b.left - a.right : b.top - a.bottom; }); expect(Math.min(...espacos) >= 15.5).toBe(true);",
      },
      {
        id: 'inside',
        description: 'Nenhum cartão passa da borda do contêiner',
        source:
          "const limite = document.querySelector('.cards').getBoundingClientRect().right; expect(Array.from(document.querySelectorAll('.card')).every((c) => c.getBoundingClientRect().right <= limite + 1)).toBe(true);",
      },
    ],
    hints: [
      'A barra é uma linha de itens: display: flex com align-items: center.',
      'margin-left: auto no botão ocupa todo o espaço livre à esquerda dele.',
      'Para os cartões: display: grid com gap e colunas com repeat(auto-fill, minmax(...)).',
    ],
    solution: [
      { type: 'code', language: 'html', code: LAYOUT_LAB_SOLUTION },
      {
        type: 'paragraph',
        text: 'A barra é uma dimensão (Flexbox): align-items centraliza, margin-left: auto empurra o botão. Os cartões são uma grade (Grid): auto-fill cria quantas colunas couberem, com a mesma largura, e gap cuida do espaço.',
      },
    ],
  },
  {
    id: 'layout-01-autofit',
    kind: 'multiple-choice',
    title: 'auto-fill ou auto-fit?',
    difficulty: 'introductory',
    conceptIds: ['css-grid'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Um contêiner de 800px tem só dois cartões e grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)). Qual é a largura de cada cartão?',
      },
    ],
    options: [
      {
        id: 'fit-400',
        text: '400px: auto-fit colapsa as colunas vazias, e os dois cartões dividem o espaço.',
        explanation:
          'Correto. Medido no Chromium: com auto-fit, as colunas ficaram 400px 400px 0 0 0. Com auto-fill seriam cinco colunas de 160px, e os cartões ficariam com 160px.',
      },
      {
        id: 'fill-160',
        text: '160px: o navegador cria cinco colunas e deixa três vazias.',
        explanation: 'Esse é o comportamento de auto-fill. auto-fit colapsa as colunas vazias.',
      },
      {
        id: 'min-150',
        text: '150px: o mínimo do minmax.',
        explanation: 'Incorreto. 1fr divide a sobra; os cartões crescem além do mínimo.',
      },
      {
        id: 'full',
        text: '800px cada: um por linha.',
        explanation: 'Incorreto. Cabem dois lado a lado, já que cada um precisa só de 150px.',
      },
    ],
    correctOptionIds: ['fit-400'],
    hints: ['O que acontece com as colunas vazias em cada palavra-chave?'],
    solution: [
      {
        type: 'paragraph',
        text: 'auto-fill: colunas vazias ficam reservadas (bom para grades que vão crescer com itens do mesmo tamanho). auto-fit: vazias colapsam e os itens esticam.',
      },
    ],
  },
  {
    id: 'layout-01-min-width',
    kind: 'multiple-choice',
    title: 'O botão que some',
    difficulty: 'introductory',
    conceptIds: ['css-flexbox'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Na etapa de depuração, o texto sem espaços empurra o botão "Copiar" para fora da tela, mesmo com flex: 1. Por quê, e como corrigir?',
      },
    ],
    options: [
      {
        id: 'min-width',
        text: 'Itens flex não encolhem abaixo do tamanho mínimo do conteúdo (min-width: auto), e um texto sem pontos de quebra tem um mínimo enorme. min-width: 0 no texto, com overflow-wrap: anywhere para ele quebrar.',
        explanation:
          'Correto. Medido: sem a correção, a linha de 300px ocupou 592px; com ela, coube. flex: 1 só distribui a sobra, não reduz o mínimo.',
      },
      {
        id: 'shrink',
        text: 'Falta flex-shrink: 1.',
        explanation: 'Incorreto. flex-shrink já é 1 por padrão; o limite é o min-width: auto.',
      },
      {
        id: 'nowrap',
        text: 'Trocar o display: flex por display: block.',
        explanation: 'Resolve o vazamento, mas desfaz o layout em linha que se queria.',
      },
      {
        id: 'overflow-hidden-body',
        text: 'body { overflow-x: hidden }.',
        explanation: 'Incorreto. Esconde o botão cortado; ele continua inacessível.',
      },
    ],
    correctOptionIds: ['min-width'],
    hints: ['Qual é o valor padrão de min-width para itens flex?'],
    solution: [
      {
        type: 'code',
        language: 'css',
        code: `.linha > .texto { flex: 1; min-width: 0; overflow-wrap: anywhere; }`,
      },
    ],
  },
  {
    id: 'layout-01-choose',
    kind: 'multiple-choice',
    title: 'Flexbox ou Grid?',
    difficulty: 'introductory',
    conceptIds: ['css-flexbox', 'css-grid'],
    prompt: [{ type: 'paragraph', text: 'Qual combinação de escolhas está mais adequada?' }],
    options: [
      {
        id: 'right-tools',
        text: 'Flexbox para a fila de botões de um formulário; Grid para o esqueleto da página com cabeçalho, menu, conteúdo e rodapé.',
        explanation:
          'Correto. Botões em fila: uma dimensão, tamanho vindo do conteúdo. Esqueleto: duas dimensões, desenho definido pelo layout.',
      },
      {
        id: 'grid-buttons',
        text: 'Grid com colunas fixas para os botões; Flexbox aninhado para o esqueleto da página.',
        explanation:
          'Funciona com esforço, mas inverte as ferramentas: colunas fixas quebram com textos de tamanhos diferentes, e o esqueleto em flex aninhado é difícil de reorganizar.',
      },
      {
        id: 'floats',
        text: 'float para tudo, que funciona em qualquer navegador.',
        explanation:
          'Incorreto. Floats foram feitos para texto ao redor de imagens; Flexbox e Grid funcionam em todos os navegadores atuais.',
      },
      {
        id: 'absolute',
        text: 'position: absolute com medidas calculadas.',
        explanation: 'Incorreto. Quebra com qualquer mudança de conteúdo ou de tela.',
      },
    ],
    correctOptionIds: ['right-tools'],
    hints: ['O conteúdo manda ou o desenho manda em cada caso?'],
    solution: [{ type: 'paragraph', text: 'Uma dimensão: Flexbox. Duas dimensões: Grid.' }],
  },
  {
    id: 'layout-01-push',
    kind: 'multiple-choice',
    title: 'Empurrar só o último',
    difficulty: 'introductory',
    conceptIds: ['css-flexbox'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Numa barra flex com logo, dois links e o botão "Sair", você quer logo e links juntos à esquerda e só o botão à direita. Qual CSS faz isso?',
      },
    ],
    options: [
      {
        id: 'margin-auto',
        text: '.sair { margin-left: auto; }',
        explanation:
          'Correto. A margem automática ocupa toda a sobra antes do botão, empurrando só ele (medido: o botão encostou na borda direita).',
      },
      {
        id: 'space-between',
        text: '.barra { justify-content: space-between; }',
        explanation:
          'Incorreto aqui. space-between espalha os quatro itens pela barra inteira, separando também logo e links.',
      },
      {
        id: 'float',
        text: '.sair { float: right; }',
        explanation: 'Incorreto. float não tem efeito em itens flex.',
      },
      {
        id: 'text-align',
        text: '.sair { text-align: right; }',
        explanation: 'Incorreto. Alinha o texto dentro do botão, não o botão na barra.',
      },
    ],
    correctOptionIds: ['margin-auto'],
    hints: ['Margens automáticas em flex ocupam o espaço livre.'],
    solution: [{ type: 'code', language: 'css', code: `.barra .sair { margin-left: auto; }` }],
  },
  {
    id: 'layout-01-order',
    kind: 'multiple-choice',
    title: 'Reordenar só no visual',
    difficulty: 'introductory',
    conceptIds: ['css-grid', 'a11y-keyboard-focus'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Para mostrar o formulário de busca antes da lista no celular, alguém usou order: -1 no formulário, que no HTML vem depois da lista. Qual é o problema?',
      },
    ],
    options: [
      {
        id: 'focus-order',
        text: 'Quem usa teclado ou leitor de tela segue a ordem do HTML: passa por toda a lista antes de chegar à busca que aparece no topo. O certo é mudar a ordem no HTML.',
        explanation:
          'Correto. order e grid-area mudam só a posição visual; a ordem de foco e de leitura continua a do código. Ordens diferentes confundem quem navega sem mouse.',
      },
      {
        id: 'none',
        text: 'Nenhum: order existe para isso.',
        explanation:
          'Incorreto. order serve para ajustes visuais que não mudam o sentido de leitura.',
      },
      {
        id: 'performance',
        text: 'order deixa a página mais lenta.',
        explanation: 'Incorreto. O problema é de acessibilidade, não de desempenho.',
      },
      {
        id: 'support',
        text: 'order não funciona em celulares.',
        explanation: 'Incorreto. Funciona; o problema é a ordem de foco.',
      },
    ],
    correctOptionIds: ['focus-order'],
    hints: ['O teclado segue a tela ou o código?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Coloque no HTML a ordem em que o conteúdo deve ser lido; use o CSS só para ajustes visuais.',
      },
    ],
  },
];
