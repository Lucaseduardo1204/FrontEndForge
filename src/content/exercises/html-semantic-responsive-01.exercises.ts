import { Exercise } from '../../app/core/models/content.models';

/** Claims that depend on layout or keyboard handling are checked in a real browser (D-049). */
export const MOBILE_FIRST_CSS = `.cards {
  display: grid;
  grid-template-columns: 1fr;
}

@media (min-width: 40rem) {
  .cards {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 64rem) {
  .cards {
    grid-template-columns: repeat(3, 1fr);
  }
}`;

export const HTML_SEMANTIC_RESPONSIVE_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-html-semantic-page',
    kind: 'code',
    language: 'html',
    title: 'De divs a uma página semântica',
    difficulty: 'introductory',
    conceptIds: ['html-landmarks', 'html-form-labels', 'html-semantic-elements'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Esta página funciona com mouse, mas é só um amontoado de <div>. Reescreva com os elementos certos. Os testes verificam a estrutura e o comportamento dos elementos, não o texto exato do seu código.',
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Scripts ficam desligados na prévia',
        text: 'Por segurança, a prévia bloqueia <script>, atributos como onclick e qualquer acesso à rede. Por isso a "busca" do código inicial não faz nada nem com mouse.',
      },
    ],
    requirements: [
      'Um <header> com um <nav> contendo pelo menos dois links <a href>.',
      'Um único <main>, com o único <h1> da página.',
      'Um <footer> fora do <main>.',
      'O campo de busca dentro de um <form>, com um <label> ligado a ele e um <button> de envio.',
      'Toda <img> com atributo alt.',
      'Imagens que nunca ficam mais largas que o contêiner (max-width ou width de 100%).',
    ],
    examples: [],
    starterCode: `<style>
  .foto { width: 600px; }
</style>

<div class="topo">
  <div class="logo">Receitas da Ana</div>
  <div class="menu">
    <span class="link">Receitas</span>
    <span class="link">Sobre</span>
  </div>
</div>

<div class="conteudo">
  <div class="titulo-grande">Receitas rápidas</div>
  <input placeholder="Buscar receita">
  <div class="botao" onclick="buscar()">Buscar</div>

  <div class="cartao">
    <img class="foto" src="bolo.jpg">
    <div class="titulo-cartao">Bolo de cenoura</div>
  </div>
</div>

<div class="rodape">Receitas da Ana</div>
`,
    tests: [
      {
        id: 'header-nav',
        description: 'Tem um <header> com um <nav> dentro',
        source: "expect(document.querySelector('header nav')).toBeTruthy();",
      },
      {
        id: 'nav-links',
        description: 'O <nav> tem pelo menos dois links com href',
        source: "expect(document.querySelectorAll('nav a[href]').length >= 2).toBe(true);",
      },
      {
        id: 'main-h1',
        description: 'Há um único <main> e um único <h1>, dentro dele',
        source:
          "expect(document.querySelectorAll('main').length).toBe(1); expect(document.querySelectorAll('h1').length).toBe(1); expect(document.querySelector('main h1')).toBeTruthy();",
      },
      {
        id: 'footer',
        description: 'Tem um <footer> fora do <main>',
        source:
          "const footer = document.querySelector('footer'); expect(footer).toBeTruthy(); expect(footer.closest('main')).toBe(null);",
      },
      {
        id: 'labels',
        description: 'Todo campo de texto tem um <label> ligado a ele',
        source:
          "const fields = Array.from(document.querySelectorAll('input')).filter((i) => !['hidden', 'submit', 'button', 'reset'].includes(i.type)); expect(fields.length > 0).toBe(true); expect(fields.every((i) => i.labels && i.labels.length > 0)).toBe(true);",
      },
      {
        id: 'search-button',
        description: 'A busca é um <form> com um <button> de envio',
        source:
          "const b = document.querySelector('form button'); expect(b).toBeTruthy(); expect(b.type).toBe('submit'); expect(b.closest('form').querySelector('input')).toBeTruthy();",
      },
      {
        id: 'img-alt',
        description: 'Toda imagem tem atributo alt',
        source:
          "const imgs = Array.from(document.querySelectorAll('img')); expect(imgs.length > 0).toBe(true); expect(imgs.every((img) => img.hasAttribute('alt'))).toBe(true);",
      },
      {
        id: 'fluid-img',
        description: 'As imagens nunca ficam mais largas que o contêiner',
        source:
          "const s = getComputedStyle(document.querySelector('img')); expect(s.maxWidth === '100%' || s.width === '100%').toBe(true);",
      },
    ],
    hints: [
      'Comece pelo esqueleto: header (com o logo e o nav), main (com o conteúdo) e footer.',
      'Os links do menu precisam de href, mesmo que seja "/receitas". Sem href, um <a> não recebe foco.',
      'Ligue o rótulo ao campo com <label for="busca"> e <input id="busca">. Para a imagem, troque width: 600px por max-width: 100%.',
    ],
    solution: [
      {
        type: 'code',
        language: 'html',
        code: `<style>
  img { max-width: 100%; height: auto; }
</style>

<header>
  <a href="/">Receitas da Ana</a>
  <nav aria-label="Principal">
    <a href="/receitas">Receitas</a>
    <a href="/sobre">Sobre</a>
  </nav>
</header>

<main>
  <h1>Receitas rápidas</h1>

  <form role="search" action="/busca">
    <label for="busca">Buscar receita</label>
    <input id="busca" type="search" name="q">
    <button type="submit">Buscar</button>
  </form>

  <article>
    <img src="bolo.jpg" alt="Fatia de bolo de cenoura com cobertura de chocolate">
    <h2>Bolo de cenoura</h2>
  </article>
</main>

<footer>
  <p>Receitas da Ana</p>
</footer>`,
      },
      {
        type: 'paragraph',
        text: 'Cada troca acrescenta um comportamento sem nenhuma linha de JavaScript: os links e o botão passam a receber foco, o formulário envia com Enter, o leitor de tela anuncia o rótulo do campo e oferece as regiões e os títulos para navegação. max-width: 100% deixa a imagem encolher em telas estreitas sem esticar além do tamanho original.',
      },
    ],
  },
  {
    id: 'semantic-01-label',
    kind: 'multiple-choice',
    title: 'Placeholder é rótulo?',
    difficulty: 'introductory',
    conceptIds: ['html-form-labels'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Um formulário tem só isto para o e-mail: <input type="email" placeholder="E-mail">. Qual é a melhor correção?',
      },
    ],
    options: [
      {
        id: 'label',
        text: 'Adicionar <label for="email">E-mail</label> e id="email" no campo.',
        explanation:
          'Correto. O rótulo fica visível o tempo todo, é anunciado pelo leitor de tela e aumenta a área de clique: clicar no texto foca o campo.',
      },
      {
        id: 'placeholder-ok',
        text: 'Nada: o placeholder já informa o que digitar.',
        explanation:
          'Incorreto. O placeholder some assim que a pessoa começa a digitar, então quem se distrai perde a referência. Ele costuma ter contraste baixo, e os navegadores só o usam como nome do campo em último caso.',
      },
      {
        id: 'aria-label',
        text: 'Adicionar aria-label="E-mail" no campo.',
        explanation:
          'Incorreto aqui. Resolve para quem usa leitor de tela, mas continua sem rótulo visível para todas as outras pessoas. aria-label é para quando não há texto visível possível, e aqui há.',
      },
      {
        id: 'title',
        text: 'Adicionar title="E-mail" no campo.',
        explanation:
          'Incorreto. O title aparece só ao passar o mouse e esperar; não existe no toque nem no teclado.',
      },
    ],
    correctOptionIds: ['label'],
    hints: [
      'O que a pessoa vê depois de digitar a primeira letra?',
      'Qual das opções ajuda quem enxerga e quem usa leitor de tela ao mesmo tempo?',
    ],
    solution: [
      {
        type: 'code',
        language: 'html',
        code: `<label for="email">E-mail</label>
<input id="email" type="email" name="email" autocomplete="email">`,
      },
    ],
  },
  {
    id: 'semantic-01-overflow',
    kind: 'multiple-choice',
    title: 'Conserte o cartão sem quebrar o desktop',
    difficulty: 'introductory',
    conceptIds: ['css-responsive-layout'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O .cartao (um bloco comum, display: block) tem width: 400px e vaza em celulares. Qual mudança resolve em qualquer largura de tela, mantendo o cartão com até 400px no desktop?',
      },
    ],
    options: [
      {
        id: 'max-width',
        text: 'Trocar width: 400px por max-width: 400px.',
        explanation:
          'Correto. Um bloco ocupa a largura disponível; max-width só define o limite. Em telas largas ele para em 400px, em telas estreitas ele encolhe junto. Uma linha, sem media query.',
      },
      {
        id: 'media-query',
        text: 'Adicionar @media (max-width: 400px) { .cartao { width: 340px; } }.',
        explanation:
          'Incorreto. Continua sendo largura fixa: numa tela de 320px, 340px ainda vaza. Media query com um número para cada aparelho sempre deixa alguma largura de fora.',
      },
      {
        id: 'overflow-hidden',
        text: 'Adicionar body { overflow-x: hidden; }.',
        explanation:
          'Incorreto. A barra de rolagem some, mas o pedaço do cartão que passa da tela fica cortado e inacessível. O problema é escondido, não resolvido.',
      },
      {
        id: 'vw',
        text: 'Trocar width: 400px por width: 90vw.',
        explanation:
          'Incorreto. No desktop o cartão estica até quase a tela toda, muito além dos 400px. E nem no celular resolve: 90vw mais o padding de 1rem e a margem da página passam da largura de uma tela de 320px.',
      },
    ],
    correctOptionIds: ['max-width'],
    hints: [
      'O que um bloco faz com a largura quando nenhum width é definido?',
      'Qual propriedade define só um limite, sem impor um tamanho?',
    ],
    solution: [
      {
        type: 'code',
        language: 'css',
        code: `.cartao {
  max-width: 400px; /* limite, não tamanho fixo */
  padding: 1rem;
}`,
      },
    ],
  },
  {
    id: 'semantic-01-landmarks',
    kind: 'multiple-choice',
    title: 'O que vira região da página?',
    difficulty: 'introductory',
    conceptIds: ['html-landmarks'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Leitores de tela oferecem uma lista de regiões (landmarks) para saltar pela página. Marque todos os elementos que viram região, considerando que nenhum tem aria-label.',
      },
    ],
    options: [
      {
        id: 'main',
        text: '<main>',
        explanation: 'Correto. Vira a região "main", o conteúdo principal.',
      },
      {
        id: 'nav',
        text: '<nav>',
        explanation: 'Correto. Vira a região "navigation".',
      },
      {
        id: 'header-body',
        text: '<header> como filho direto do <body>',
        explanation:
          'Correto. No nível da página, o header vira a região "banner". Dentro de um article ou section, ele é só um agrupamento.',
      },
      {
        id: 'section',
        text: '<section> sem nome acessível',
        explanation:
          'Incorreto. section só vira região ("region") quando tem nome, por aria-label ou aria-labelledby. Sem nome, não aparece na lista.',
      },
      {
        id: 'article',
        text: '<article>',
        explanation:
          'Incorreto. article tem o papel "article", que indica conteúdo independente, mas não é uma região de navegação.',
      },
      {
        id: 'div',
        text: '<div class="menu">',
        explanation:
          'Incorreto. A classe não tem significado para o navegador: uma div é só um agrupamento genérico.',
      },
    ],
    correctOptionIds: ['main', 'nav', 'header-body'],
    hints: [
      'Uma classe CSS muda a aparência. Ela muda o que o elemento é?',
      'Releia a tabela da explicação: section tem uma condição.',
    ],
    solution: [
      {
        type: 'paragraph',
        text: 'Viram região: main, nav e o header da página (banner). section precisa de nome; article e div não são regiões.',
      },
    ],
  },
  {
    id: 'semantic-01-mobile-first',
    kind: 'predict-output',
    title: 'Quantas colunas?',
    difficulty: 'introductory',
    conceptIds: ['css-responsive-layout'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Com este CSS e a fonte padrão do navegador (16px), quantas colunas a grade .cards tem numa janela de 800px de largura? Digite só o número.',
      },
    ],
    language: 'css',
    code: MOBILE_FIRST_CSS,
    acceptedAnswers: ['2'],
    explanation:
      'Em media queries, 1rem vale o tamanho de fonte inicial do navegador, 16px. 40rem é 640px e 64rem é 1024px. Com 800px, a primeira condição vale e a segunda não: ficam duas colunas.',
    commonMistakes: [
      {
        answer: '3',
        explanation:
          '64rem são 1024px. Uma janela de 800px não chega lá, então a regra de três colunas não se aplica.',
      },
      {
        answer: '1',
        explanation:
          'A regra de uma coluna é a base, mas min-width: 40rem (640px) é verdadeira em 800px e acrescenta a segunda coluna. Com min-width, as regras se somam conforme a tela cresce.',
      },
    ],
    wrongAnswerGuidance:
      'Não é isso. Converta cada rem para pixels (16px cada) e veja quais condições de min-width valem para 800px.',
    hints: [
      'Quantos pixels são 40rem? E 64rem?',
      'min-width: X vale quando a janela tem X ou mais.',
    ],
    solution: [
      {
        type: 'paragraph',
        text: 'Duas colunas. Mobile first: a base serve para o celular, e cada min-width acrescenta ajustes quando a tela cresce.',
      },
    ],
  },
  {
    id: 'semantic-01-clickable',
    kind: 'multiple-choice',
    title: 'A div que salva',
    difficulty: 'introductory',
    conceptIds: ['a11y-interactive-elements', 'html-semantic-elements'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Um "botão" foi feito assim: <div class="botao" onclick="salvar()">Salvar</div>. Funciona com mouse. Qual é a correção mais adequada?',
      },
    ],
    options: [
      {
        id: 'button',
        text: 'Trocar por <button type="button" class="botao">Salvar</button>, com o mesmo evento de clique.',
        explanation:
          'Correto. O button já recebe foco pelo Tab, dispara o clique com Enter e com Espaço e é anunciado como botão. O visual continua o mesmo com a classe.',
      },
      {
        id: 'tabindex',
        text: 'Adicionar tabindex="0" na div.',
        explanation:
          'Incorreto. A div passa a receber foco, mas Enter e Espaço continuam sem disparar o clique, e o leitor de tela não a anuncia como botão.',
      },
      {
        id: 'role',
        text: 'Adicionar role="button" na div.',
        explanation:
          'Incorreto. Ela passa a ser anunciada como botão, mas continua sem foco pelo Tab e sem resposta ao teclado: promete algo que não cumpre.',
      },
      {
        id: 'nothing',
        text: 'Nada: quase todo mundo usa mouse.',
        explanation:
          'Incorreto. Teclado é usado por pessoas com deficiência motora, por quem usa leitor de tela e por muita gente que prefere atalhos. E a lei brasileira exige acessibilidade.',
      },
    ],
    correctOptionIds: ['button'],
    hints: [
      'Que comportamentos um botão de verdade tem além de responder ao clique?',
      'Alguma das opções entrega foco, teclado e anúncio ao mesmo tempo?',
    ],
    solution: [
      {
        type: 'code',
        language: 'html',
        code: `<button type="button" class="botao">Salvar</button>`,
      },
    ],
  },
];
