import { Lesson } from '../../app/core/models/content.models';

/**
 * The example page follows the rules the lesson teaches: checked in
 * `src/content/dom-examples.spec.ts` (structure) and in a real browser (layout).
 */
export const SEMANTIC_PAGE_HTML = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Receitas rápidas</title>
    <link rel="stylesheet" href="estilo.css" />
  </head>
  <body>
    <header>
      <a href="/">Receitas da Ana</a>
      <nav aria-label="Principal">
        <ul>
          <li><a href="/receitas">Receitas</a></li>
          <li><a href="/sobre">Sobre</a></li>
        </ul>
      </nav>
    </header>

    <main>
      <h1>Receitas rápidas</h1>

      <form role="search" action="/busca">
        <label for="busca">Buscar receita</label>
        <input id="busca" type="search" name="q" />
        <button type="submit">Buscar</button>
      </form>

      <div class="cards">
        <article>
          <img src="bolo.jpg" alt="Fatia de bolo de cenoura com cobertura de chocolate" />
          <h2>Bolo de cenoura</h2>
          <p>40 minutos · 8 porções</p>
        </article>
        <article>
          <img src="salada.jpg" alt="Tigela de salada de grão-de-bico com tomate" />
          <h2>Salada de grão-de-bico</h2>
          <p>15 minutos · 2 porções</p>
        </article>
      </div>
    </main>

    <footer>
      <p>Receitas da Ana · conteúdo livre para cozinhar em casa.</p>
    </footer>
  </body>
</html>`;

export const RESPONSIVE_CSS = `/* Base: celular. Nada aqui depende de largura fixa. */
img {
  max-width: 100%;
  height: auto;
}

main {
  max-width: 70rem;
  margin-inline: auto;
  padding: 1rem;
}

/* Quantas colunas couberem, cada uma com pelo menos 16rem
   (ou a largura toda, se a tela for menor que isso). */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(16rem, 100%), 1fr));
  gap: 1rem;
}

/* A partir de 48rem, logo e menu dividem a mesma linha. */
@media (min-width: 48rem) {
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}`;

export const HTML_SEMANTIC_RESPONSIVE_01: Lesson = {
  id: 'html-semantic-responsive-01',
  moduleId: 'html-semantic-responsive',
  title: 'Interface semântica e responsiva',
  summary:
    'Estruturar a página com os elementos certos, para teclado, leitor de tela e buscadores, e fazer o layout se adaptar do celular ao desktop sem larguras fixas.',
  estimatedMinutes: 45,
  difficulty: 'introductory',
  conceptIds: [
    'html-semantic-elements',
    'html-landmarks',
    'html-form-labels',
    'css-responsive-layout',
  ],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Uma página feita só de <div> pode ficar idêntica na tela a uma página bem estruturada. A diferença aparece para quem não usa mouse, para quem ouve a página com um leitor de tela, para os buscadores e para quem dá manutenção no código: uma "div com cara de botão" não recebe foco pelo teclado, e um título que é só texto grande não aparece na lista de títulos que o leitor de tela oferece.',
        },
        {
          type: 'paragraph',
          text: 'O mesmo vale para o tamanho da tela. Um cartão com width: 400px fica perfeito no notebook e vaza para fora num celular de 360px. Mais da metade do acesso à web vem de celulares: a página precisa funcionar neles desde o começo.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Escolher o elemento HTML pelo significado, não pela aparência.',
            'Organizar a página em regiões (cabeçalho, navegação, conteúdo principal, rodapé).',
            'Ligar cada campo de formulário ao seu rótulo.',
            'Construir layouts fluidos, sem larguras fixas, e usar media queries só onde o conteúdo pede.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'A planta da casa e os móveis',
      blocks: [
        {
          type: 'paragraph',
          text: 'Pense no HTML como a planta de uma casa: ela diz qual cômodo é a cozinha e qual é o quarto, independentemente da cor das paredes. Quem não enxerga a casa (um leitor de tela, um buscador) se orienta pela planta. O CSS é a decoração: muda a aparência, não o que cada cômodo é.',
        },
        {
          type: 'paragraph',
          text: 'Layout responsivo é mobiliar a casa com móveis que se ajustam ao cômodo. Em vez de medir cada cômodo e encomendar um móvel sob medida (uma media query para cada aparelho), você usa peças que esticam e se reorganizam sozinhas, e só faz um ajuste quando o conteúdo realmente deixa de caber.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Os elementos certos e o layout que se adapta',
      blocks: [
        {
          type: 'table',
          caption: 'Elementos que viram regiões (landmarks)',
          headers: ['Elemento', 'Região', 'Observação'],
          rows: [
            [
              '<header>',
              'banner',
              'Só quando é filho do body, fora de article, aside, main, nav e section.',
            ],
            ['<nav>', 'navigation', 'Com mais de um menu, diferencie com aria-label.'],
            ['<main>', 'main', 'Um por página, com o conteúdo principal.'],
            [
              '<aside>',
              'complementary',
              'Conteúdo relacionado, mas separável do principal. No nível da página ou dentro de main.',
            ],
            ['<footer>', 'contentinfo', 'Mesma regra do header: só no nível da página.'],
            ['<form role="search">', 'search', 'Busca do site.'],
            [
              '<section>',
              'region',
              'Só quando tem nome acessível (aria-label ou aria-labelledby).',
            ],
          ],
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Títulos (h1 a h6) formam o sumário da página: um h1 com o assunto da página e níveis que não pulam (h2 dentro de h1, h3 dentro de h2).',
            'Ação na página é <button>; ir para outro endereço é <a href>. Os dois já recebem foco e respondem ao teclado.',
            'Todo campo tem um <label> ligado a ele (for igual ao id do campo, ou o campo dentro do label). Placeholder não substitui rótulo: some quando a pessoa digita.',
            'Toda imagem tem alt. Se ela informa algo, o alt descreve; se é só decoração, use alt="" para o leitor de tela ignorá-la.',
            'Sem <meta name="viewport" content="width=device-width, initial-scale=1">, o navegador do celular desenha a página como se a tela tivesse cerca de 980px e reduz tudo.',
            'Comece pelo celular (mobile first): o CSS base serve para telas pequenas, e media queries com min-width acrescentam ajustes para telas maiores.',
            'Prefira medidas fluidas: max-width em vez de width, porcentagens, fr, minmax() e rem. Imagens com max-width: 100% nunca ficam mais largas que o contêiner.',
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Uma div clicável não é um botão',
          text: 'Uma <div> com evento de clique não recebe foco pelo Tab, não responde a Enter nem Espaço e é anunciada como texto. Recriar tudo isso com tabindex, role e eventos de teclado dá muito trabalho e costuma ficar incompleto. Use <button type="button">.',
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: página de receitas',
      blocks: [
        {
          type: 'paragraph',
          text: 'A página tem cabeçalho com logo e menu, conteúdo principal com título, busca e cartões, e rodapé. Repare que nenhuma classe foi necessária para descrever a estrutura: os elementos já dizem o que cada parte é.',
        },
        { type: 'code', language: 'html', caption: 'index.html', code: SEMANTIC_PAGE_HTML },
        {
          type: 'paragraph',
          text: 'O CSS começa pelo celular e não usa nenhuma largura fixa. A grade de cartões se reorganiza sozinha: uma coluna no celular, duas ou três em telas maiores, sem media query.',
        },
        { type: 'code', language: 'css', caption: 'estilo.css', code: RESPONSIVE_CSS },
        {
          type: 'list',
          ordered: false,
          items: [
            'repeat(auto-fill, minmax(16rem, 1fr)) cria quantas colunas de pelo menos 16rem couberem e divide a sobra entre elas.',
            'min(16rem, 100%) usa a largura toda quando sobra menos de 16rem (256px), como em telas muito estreitas ou com o zoom do navegador ampliado. Sem isso, a coluna mínima de 16rem forçaria a rolagem lateral.',
            'A única media query existe porque logo e menu lado a lado não cabem numa tela estreita, e não para atender um aparelho específico.',
          ],
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Investigue no navegador',
      blocks: [
        {
          type: 'paragraph',
          text: 'Salve os dois arquivos numa pasta e abra o index.html no Chrome ou no Edge. Com as ferramentas de desenvolvedor abertas (F12):',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Ative o modo de dispositivo (Ctrl+Shift+M) e arraste a largura de 320px até 1400px. Observe quantas colunas de cartões aparecem em cada faixa.',
            'Apague a meta viewport, recarregue no modo de dispositivo e compare o tamanho do texto.',
            'Em Elementos, abra o painel Acessibilidade e selecione o <nav>: veja o papel (role) e o nome. Faça o mesmo com uma <div>.',
            'Navegue a página só com Tab e Shift+Tab. Troque o <button> da busca por <div>Buscar</div> e tente de novo.',
            'Troque minmax(min(16rem, 100%), 1fr) por minmax(16rem, 1fr) e teste em 240px de largura: aparece rolagem lateral?',
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
          text: 'Primeiro, transforme uma página feita de <div> numa página semântica, no laboratório. Depois, responda sobre rótulos de formulário.',
        },
      ],
      exerciseIds: ['lab-html-semantic-page', 'semantic-01-label'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: o cartão que vaza no celular',
      blocks: [
        {
          type: 'code',
          language: 'css',
          caption: 'O cartão (um bloco comum) passa da borda numa tela de 360px',
          code: `.cartao {
  width: 400px;
  padding: 1rem;
}`,
        },
      ],
      exerciseIds: ['semantic-01-overflow'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Templates Angular são HTML: tudo desta lição vale igual. Um componente <app-cartao> não tem significado nenhum para o navegador; use <article>, <button> e companhia dentro dele.',
            'A Lei Brasileira de Inclusão (Lei 13.146/2015, art. 63) exige acessibilidade em sites de empresas com sede ou representação no Brasil e de órgãos de governo.',
            'Ferramentas como o Lighthouse (no DevTools) e o axe apontam regiões, rótulos e contrastes com problema. Elas acham parte dos erros, não todos: testar com teclado continua necessário.',
            'Buscadores usam títulos e estrutura para entender a página. Semântica correta ajuda o SEO sem nenhum truque.',
          ],
        },
      ],
    },
    {
      kind: 'assessment',
      title: 'Avaliação',
      blocks: [
        {
          type: 'paragraph',
          text: 'Para concluir a lição, acerte os três exercícios abaixo.',
        },
      ],
      exerciseIds: ['semantic-01-landmarks', 'semantic-01-mobile-first', 'semantic-01-clickable'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Escolha o elemento pelo significado: <button> para ação, <a href> para navegação, títulos em ordem.',
            'header, nav, main e footer dividem a página em regiões navegáveis; section só vira região com nome.',
            'Todo campo com <label>; toda imagem com alt (vazio quando decorativa).',
            'Meta viewport sempre; CSS base para o celular; min-width para telas maiores.',
            'Medidas fluidas (max-width, fr, minmax, min()) evitam a maioria das media queries.',
          ],
        },
        {
          type: 'paragraph',
          text: 'Na Biblioteca: "Flexbox ou Grid?" e "Checklist rápido de acessibilidade".',
        },
      ],
    },
  ],
};
