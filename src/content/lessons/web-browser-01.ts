import { Lesson } from '../../app/core/models/content.models';

export const WEB_BROWSER_01: Lesson = {
  id: 'web-browser-01',
  moduleId: 'web-browser-rendering',
  title: 'Como o navegador interpreta HTML, CSS e JavaScript',
  summary:
    'O caminho de uma página desde os bytes recebidos até os pixels na tela, e por que a ordem das tags muda o comportamento do seu código.',
  estimatedMinutes: 35,
  difficulty: 'introductory',
  conceptIds: [
    'web-rendering-pipeline',
    'web-dom',
    'web-render-tree',
    'web-render-blocking-css',
    'web-script-loading',
  ],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Você escreve um script que busca um botão com document.querySelector e recebe null. O CSS está certo, mas a página aparece sem estilo por um instante. Uma animação simples deixa a rolagem travando. Esses três problemas têm a mesma raiz: o que o navegador faz, e em que ordem, quando recebe o seu código.',
        },
        {
          type: 'paragraph',
          text: 'Frameworks como o Angular não mudam esse processo. Eles rodam em cima dele. Entender o caminho do HTML até os pixels é o que permite diagnosticar esses bugs em vez de tentar soluções aleatórias.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Descrever as etapas que o navegador percorre para mostrar uma página.',
            'Diferenciar o código-fonte HTML do DOM.',
            'Prever se um script consegue acessar um elemento.',
            'Escolher entre script no fim do body, defer e async.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'Uma leitura de cima para baixo',
      blocks: [
        {
          type: 'paragraph',
          text: 'Imagine alguém montando uma maquete a partir de instruções escritas, lendo linha por linha. Cada instrução vira uma peça na maquete. Essa pessoa não espera ler o documento inteiro para começar a montar: ela monta enquanto lê.',
        },
        {
          type: 'paragraph',
          text: 'O navegador faz o mesmo com o HTML. Ele lê o documento de cima para baixo e vai criando uma estrutura em memória, o DOM. Quando encontra uma instrução especial, como um <script> comum, ele para a montagem, executa o script e só depois continua lendo.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'A consequência mais importante',
          text: 'Um script só enxerga as partes do documento que já foram lidas quando ele executa. O que vem depois dele no HTML ainda não existe no DOM.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'O caminho crítico de renderização',
      blocks: [
        {
          type: 'paragraph',
          text: 'Chamamos de caminho crítico de renderização (critical rendering path) a sequência de trabalho entre receber o HTML e mostrar os primeiros pixels. Em linhas gerais:',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Requisição: o navegador resolve o domínio (DNS), abre a conexão (com TLS, no caso de HTTPS) e pede o documento ao servidor via HTTP.',
            'Parsing do HTML: os bytes recebidos são decodificados em caracteres, quebrados em tokens e transformados em nós. Os nós formam a árvore do DOM (Document Object Model).',
            'CSSOM: cada CSS encontrado (em <link rel="stylesheet"> ou <style>) é baixado e processado em outra árvore, o CSSOM, com as regras de estilo.',
            'Render tree: DOM e CSSOM são combinados. Entram só os elementos que serão exibidos, cada um com seus estilos calculados. Elementos com display: none e o conteúdo do <head> ficam de fora.',
            'Layout (ou reflow): o navegador calcula o tamanho e a posição de cada caixa na tela.',
            'Paint e composição: as caixas viram pixels, desenhados em camadas que são combinadas na imagem final.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'O DOM não é o seu arquivo HTML',
          text: 'O DOM é a estrutura viva que o navegador construiu. Ele corrige marcação inválida (por exemplo, fecha tags esquecidas e cria um <tbody> dentro de <table>), e o JavaScript pode alterá-lo a qualquer momento. Por isso o "Exibir código-fonte" e o painel Elements do DevTools podem mostrar coisas diferentes.',
        },
        {
          type: 'paragraph',
          text: 'Dois tipos de recurso interferem nesse fluxo. O CSS bloqueia a renderização: o navegador evita pintar a página antes de ter o CSSOM, para não mostrar conteúdo sem estilo e logo depois redesenhar tudo. Um <script> comum (sem defer, async ou type="module") bloqueia o parser: a leitura do HTML para até o script ser baixado e executado, porque ele pode alterar o documento.',
        },
        {
          type: 'paragraph',
          text: 'Existe ainda uma interação entre os dois: um script comum espera o CSS declarado antes dele terminar de carregar, já que o script pode consultar estilos calculados. Um CSS lento no <head> pode, portanto, atrasar também os scripts.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '<script src="app.js"> (comum): para o parser, baixa, executa e só então continua.',
            '<script src="app.js" defer>: baixa em paralelo e executa depois que o HTML inteiro foi lido, na ordem em que aparece no documento.',
            '<script src="app.js" async>: baixa em paralelo e executa assim que termina de baixar, podendo interromper o parser e sem ordem garantida entre scripts async.',
            '<script type="module" src="app.js">: módulos são adiados por padrão, como defer.',
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'defer e async só valem para scripts externos',
          text: 'Em um script inline (com o código escrito dentro da tag, sem src), os atributos defer e async são ignorados em scripts clássicos. Escrever <script defer>código</script> não adia nada.',
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Lendo um documento como o navegador lê',
      blocks: [
        {
          type: 'paragraph',
          text: 'Acompanhe o documento abaixo do ponto de vista do parser:',
        },
        {
          type: 'code',
          language: 'html',
          caption: 'index.html',
          code: `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Tarefas</title>
    <link rel="stylesheet" href="styles.css" />
    <script src="app.js" defer></script>
  </head>
  <body>
    <h1>Minhas tarefas</h1>
    <ul id="lista"></ul>
  </body>
</html>`,
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'O parser lê o <head>. Ao encontrar o <link>, o navegador começa a baixar styles.css. A primeira pintura vai esperar esse CSS.',
            'Ao encontrar o script com defer, o download de app.js começa em paralelo, mas a execução fica para depois. O parser continua lendo.',
            'O <body> é lido e o <h1> e o <ul> entram no DOM.',
            'Com o HTML inteiro lido, os scripts defer executam em ordem. Nesse momento, document.querySelector("#lista") encontra o elemento.',
            'Logo depois, o evento DOMContentLoaded é disparado.',
          ],
        },
        {
          type: 'code',
          language: 'javascript',
          caption: 'app.js',
          code: `const lista = document.querySelector('#lista');
// Com defer, o HTML já foi lido por completo quando este código roda.
// Sem defer (e com o script no <head>), lista seria null aqui.
const item = document.createElement('li');
item.textContent = 'Estudar o caminho crítico de renderização';
lista.append(item);`,
        },
        {
          type: 'paragraph',
          text: 'Repare que o app.js altera o DOM depois do parsing. A partir daí, o DOM tem um <li> que não existe no arquivo HTML. É a diferença entre código-fonte e DOM na prática.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Investigue no seu navegador',
      blocks: [
        {
          type: 'paragraph',
          text: 'Faça estes experimentos em qualquer site, no seu próprio navegador, com o DevTools (F12 ou Ctrl+Shift+I). Eles dependem do carregamento real de uma página pela rede, algo que o laboratório da plataforma bloqueia de propósito por segurança.',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Abra "Exibir código-fonte" (Ctrl+U) e, ao lado, o painel Elements do DevTools. Procure diferenças: elementos criados por JavaScript aparecem só no Elements.',
            'No painel Network, recarregue a página e observe a ordem dos downloads. Passe o mouse sobre a barra de cada recurso para ver quanto tempo ele levou.',
            'No painel Elements, selecione um elemento e aplique display: none no painel Styles. Depois troque por visibility: hidden. Compare o que acontece com o espaço que ele ocupava.',
            'No painel Performance, grave o carregamento da página e procure as atividades "Parse HTML", "Layout" e "Paint" na linha do tempo.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'O que observar',
          text: 'Anote uma diferença entre o código-fonte e o DOM, e o que aconteceu com o espaço do elemento em cada um dos dois estilos. Você vai precisar disso nos exercícios.',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Prática',
      blocks: [
        {
          type: 'paragraph',
          text: 'Responda sem pressa. Se errar, leia a explicação e tente de novo: as tentativas ficam registradas no seu progresso, mas errar faz parte do processo.',
        },
      ],
      exerciseIds: ['web-browser-01-pipeline-order', 'web-browser-01-display-none'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: o elemento que não existe',
      blocks: [
        {
          type: 'paragraph',
          text: 'Uma pessoa do time relata: "o querySelector está quebrado, ele não encontra o meu título". O código está abaixo, no primeiro exercício. Primeiro preveja o que acontece; depois escolha as correções válidas.',
        },
      ],
      exerciseIds: ['web-browser-01-script-null', 'web-browser-01-script-fix'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia com Angular',
      blocks: [
        {
          type: 'paragraph',
          text: 'Em um projeto Angular, o index.html tem um elemento como <app-root></app-root> vazio. O build gera scripts com type="module", que são adiados por padrão. O Angular só inicializa e preenche <app-root> depois que o HTML foi lido. É o mesmo mecanismo do defer que você acabou de estudar.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'CSS global grande no <head> atrasa a primeira pintura. Por isso o build de produção do Angular minimiza o CSS e a ferramenta Lighthouse aponta "recursos que bloqueiam a renderização".',
            'Alterar propriedades que mudam geometria (width, height, top) força layout. Animar transform e opacity costuma ser mais barato, porque em geral não exige layout nem nova pintura.',
            'Ler medidas do DOM (offsetHeight, getBoundingClientRect) logo depois de alterar estilos obriga o navegador a recalcular o layout na hora. Repetir isso em um laço causa o "layout thrashing".',
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
          text: 'Para concluir a lição, acerte os três exercícios abaixo. Pode tentar quantas vezes precisar; o que conta é entender o motivo da resposta.',
        },
      ],
      exerciseIds: [
        'web-browser-01-li-count',
        'web-browser-01-blocking-css',
        'web-browser-01-layout-change',
      ],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'O navegador lê o HTML de cima para baixo e constrói o DOM incrementalmente.',
            'Um script só enxerga os elementos já lidos quando ele executa.',
            'DOM + CSSOM formam a render tree; depois vêm layout, paint e composição.',
            'display: none tira o elemento da render tree; visibility: hidden mantém o espaço.',
            'CSS bloqueia a renderização; scripts comuns bloqueiam o parser.',
            'defer executa após o parsing, em ordem; async executa quando baixar, sem ordem; módulos são adiados por padrão.',
            'defer e async não têm efeito em scripts clássicos inline.',
          ],
        },
        {
          type: 'paragraph',
          text: 'Para aprofundar, procure no MDN Web Docs (developer.mozilla.org) o guia "How browsers work" e a página de referência do elemento <script>, que detalha defer, async e type="module".',
        },
      ],
    },
  ],
};
