import { Exercise } from '../../app/core/models/content.models';

export const WEB_BROWSER_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'web-browser-01-pipeline-order',
    kind: 'order-steps',
    title: 'Ordene o caminho até os pixels',
    difficulty: 'introductory',
    conceptIds: ['web-rendering-pipeline'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Coloque as etapas na ordem em que o navegador as conclui para mostrar uma página pela primeira vez. Use os botões de mover para cima e para baixo.',
      },
    ],
    items: [
      {
        id: 'request',
        text: 'Resolver o domínio e pedir o documento ao servidor via HTTP',
        why: 'Nada pode ser processado antes de o documento chegar: a requisição vem primeiro.',
      },
      {
        id: 'dom',
        text: 'Ler o HTML e construir o DOM',
        why: 'O parser do HTML é quem descobre o CSS (nas tags <link> e <style>). O DOM começa antes do CSSOM.',
      },
      {
        id: 'cssom',
        text: 'Processar o CSS e construir o CSSOM',
        why: 'O CSS só é conhecido depois que o parser encontra a referência a ele no HTML, e o CSSOM precisa estar pronto antes da render tree.',
      },
      {
        id: 'render-tree',
        text: 'Combinar DOM e CSSOM na render tree',
        why: 'A render tree depende das duas árvores: estrutura (DOM) e estilos (CSSOM).',
      },
      {
        id: 'layout',
        text: 'Calcular tamanho e posição de cada caixa (layout)',
        why: 'O layout precisa saber quais elementos são exibidos e com que estilos, ou seja, precisa da render tree.',
      },
      {
        id: 'paint',
        text: 'Pintar e compor os pixels na tela',
        why: 'Só dá para desenhar uma caixa depois de saber onde ela fica e qual é o seu tamanho.',
      },
    ],
    explanation:
      'Cada etapa depende do resultado da anterior. Na prática, o navegador sobrepõe parte do trabalho (o DOM continua sendo construído enquanto o CSS baixa, por exemplo), mas a ordem de dependência é esta.',
    hints: [
      'Pergunte-se, para cada etapa: "do que ela precisa para começar?"',
      'O navegador só descobre que existe um arquivo CSS quando lê a tag <link> no HTML.',
      'Layout calcula geometria; paint desenha. Dá para desenhar algo sem saber onde fica?',
    ],
    solution: [
      {
        type: 'list',
        ordered: true,
        items: [
          'Requisição HTTP (com DNS e conexão antes).',
          'DOM: o parser lê o HTML e descobre os demais recursos.',
          'CSSOM: os estilos encontrados são processados.',
          'Render tree: DOM + CSSOM, só com o que é exibido.',
          'Layout: geometria de cada caixa.',
          'Paint e composição: pixels na tela.',
        ],
      },
    ],
  },
  {
    id: 'web-browser-01-display-none',
    kind: 'multiple-choice',
    title: 'display: none e visibility: hidden',
    difficulty: 'introductory',
    conceptIds: ['web-render-tree', 'web-dom'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Um elemento recebe display: none. Qual afirmação descreve corretamente a situação dele?',
      },
    ],
    options: [
      {
        id: 'in-dom-not-render',
        text: 'Continua no DOM, mas fica fora da render tree e não ocupa espaço na página.',
        explanation:
          'Correto. O CSS não remove nós do DOM: o JavaScript ainda encontra o elemento com querySelector. Como ele não será exibido, não entra na render tree e não participa do layout.',
      },
      {
        id: 'removed-from-dom',
        text: 'É removido do DOM, por isso o JavaScript não consegue mais encontrá-lo.',
        explanation:
          'Incorreto. CSS só muda como os elementos são exibidos; quem adiciona ou remove nós do DOM é o parser ou o JavaScript. document.querySelector continua encontrando o elemento.',
      },
      {
        id: 'keeps-space',
        text: 'Fica invisível, mas continua ocupando o mesmo espaço na página.',
        explanation:
          'Incorreto. Isso descreve visibility: hidden: o elemento continua na render tree e no layout, só não é pintado. Com display: none, o espaço é liberado.',
      },
      {
        id: 'painted-transparent',
        text: 'É pintado com opacidade zero, por isso continua recebendo cliques.',
        explanation:
          'Incorreto. Isso se parece com opacity: 0, em que o elemento é exibido (transparente) e pode receber eventos. Com display: none, ele não é exibido nem recebe cliques.',
      },
    ],
    correctOptionIds: ['in-dom-not-render'],
    hints: [
      'CSS consegue apagar um nó do DOM? Quem cria e remove nós?',
      'Lembre do experimento no DevTools: o que aconteceu com o espaço do elemento em cada um dos dois estilos?',
    ],
    solution: [
      {
        type: 'paragraph',
        text: 'display: none mantém o elemento no DOM e o tira da render tree, então ele não ocupa espaço. visibility: hidden mantém o elemento na render tree e no layout (ocupa espaço), só não pinta. opacity: 0 pinta o elemento transparente, e ele continua recebendo eventos.',
      },
    ],
  },
  {
    id: 'web-browser-01-script-null',
    kind: 'predict-output',
    title: 'O que o console mostra?',
    difficulty: 'introductory',
    conceptIds: ['web-dom', 'web-script-loading'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Este é o documento completo. Digite exatamente o que aparece no console quando a página carrega.',
      },
    ],
    language: 'html',
    code: `<!doctype html>
<html lang="pt-BR">
  <head>
    <script>
      const titulo = document.querySelector('h1');
      console.log(titulo);
    </script>
  </head>
  <body>
    <h1>Olá</h1>
  </body>
</html>`,
    acceptedAnswers: ['null'],
    explanation:
      'O script é comum e está no <head>. O parser para nele e o executa antes de ler o <body>. Nesse momento ainda não existe nenhum <h1> no DOM, e querySelector retorna null quando não encontra nada.',
    commonMistakes: [
      {
        answer: '<h1>Olá</h1>',
        explanation:
          'Isso aconteceria se o <h1> já estivesse no DOM. Mas o script executa enquanto o parser ainda está no <head>, antes de chegar ao <body>.',
      },
      {
        answer: 'undefined',
        explanation:
          'querySelector nunca retorna undefined. Quando nenhum elemento corresponde ao seletor, o retorno é null.',
      },
      {
        answer: 'Olá',
        explanation:
          'O console mostraria o elemento, não o texto dele. E, de qualquer forma, o elemento ainda não existe quando o script executa.',
      },
    ],
    wrongAnswerGuidance:
      'Não é isso. Pense em qual parte do documento o parser já leu no momento em que o script executa, e no que querySelector retorna quando não encontra nada.',
    hints: [
      'Onde o parser está quando encontra esse <script>?',
      'O <h1> vem antes ou depois do script no documento?',
      'Consulte o que document.querySelector retorna quando nenhum elemento corresponde.',
    ],
    solution: [
      {
        type: 'paragraph',
        text: 'A saída é null. O script executa no meio do parsing, quando só o <head> foi lido.',
      },
      {
        type: 'code',
        language: 'html',
        caption: 'Uma correção possível: script no fim do <body>',
        code: `<body>
  <h1>Olá</h1>
  <script>
    const titulo = document.querySelector('h1');
    console.log(titulo); // <h1>Olá</h1>
  </script>
</body>`,
      },
    ],
  },
  {
    id: 'web-browser-01-script-fix',
    kind: 'multiple-choice',
    title: 'Quais mudanças corrigem o bug?',
    difficulty: 'introductory',
    conceptIds: ['web-script-loading'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Considere o documento do exercício anterior. Marque todas as mudanças que, sozinhas, fazem o script encontrar o <h1> de forma confiável.',
      },
    ],
    options: [
      {
        id: 'end-of-body',
        text: 'Mover o <script> para o final do <body>, depois do <h1>.',
        explanation: 'Correto. Quando o parser chega ao script, o <h1> já foi lido e está no DOM.',
      },
      {
        id: 'external-defer',
        text: 'Mover o código para app.js e usar <script src="app.js" defer> no <head>.',
        explanation:
          'Correto. Scripts externos com defer executam depois que o HTML inteiro foi lido.',
      },
      {
        id: 'dom-content-loaded',
        text: "Envolver o código em document.addEventListener('DOMContentLoaded', () => { ... }).",
        explanation:
          'Correto. O evento DOMContentLoaded dispara quando o HTML foi completamente lido e o DOM está pronto.',
      },
      {
        id: 'inline-defer',
        text: 'Manter o script inline e apenas adicionar o atributo defer: <script defer>.',
        explanation:
          'Incorreto. defer é ignorado em scripts clássicos inline (sem src). O script continua executando no meio do parsing.',
      },
      {
        id: 'external-async',
        text: 'Mover o código para app.js e usar <script src="app.js" async> no <head>.',
        explanation:
          'Incorreto como solução confiável. async executa assim que o arquivo termina de baixar, o que pode acontecer antes de o parser chegar ao <h1>. Às vezes funciona, às vezes não: é o tipo de bug que aparece só em produção.',
      },
    ],
    correctOptionIds: ['end-of-body', 'external-defer', 'dom-content-loaded'],
    hints: [
      'Há mais de uma resposta correta.',
      'Para cada opção, pergunte: o código executa antes ou depois de o <h1> ser lido?',
      'Releia o alerta sobre defer em scripts inline na etapa de explicação técnica.',
    ],
    solution: [
      {
        type: 'paragraph',
        text: 'Funcionam: script no fim do <body>, script externo com defer e o código dentro de DOMContentLoaded. Não funcionam de forma confiável: defer em script inline (ignorado) e async (executa quando terminar de baixar, sem esperar o parser).',
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Qual escolher?',
        text: 'Em projetos atuais, o mais comum é um script externo com defer ou type="module" no <head>. O download começa cedo e a execução espera o DOM.',
      },
    ],
  },
  {
    id: 'web-browser-01-li-count',
    kind: 'predict-output',
    title: 'Quantos itens o script enxerga?',
    difficulty: 'introductory',
    conceptIds: ['web-dom', 'web-script-loading'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Qual número aparece no console? Digite apenas o número.',
      },
    ],
    language: 'html',
    code: `<body>
  <ul>
    <li>HTML</li>
    <li>CSS</li>
  </ul>
  <script>
    console.log(document.querySelectorAll('li').length);
  </script>
  <ul>
    <li>JavaScript</li>
  </ul>
</body>`,
    acceptedAnswers: ['2'],
    explanation:
      'O DOM é construído de forma incremental. Quando o parser executa o script, ele já leu os dois primeiros <li>, mas ainda não chegou à segunda lista. querySelectorAll retorna só o que existe no DOM naquele instante.',
    commonMistakes: [
      {
        answer: '3',
        explanation:
          'Três seria o total do documento, mas o script executa no meio do parsing. O terceiro <li> vem depois do script e ainda não está no DOM.',
      },
      {
        answer: '0',
        explanation:
          'Os dois primeiros <li> aparecem antes do script, então já foram lidos e estão no DOM quando ele executa.',
      },
    ],
    wrongAnswerGuidance:
      'Não é isso. Conte só os elementos que o parser já leu no momento em que chega ao <script>.',
    hints: [
      'O script executa no momento em que o parser o encontra.',
      'Quais <li> vêm antes do <script> no documento?',
    ],
    solution: [
      {
        type: 'paragraph',
        text: 'A saída é 2. O terceiro <li> só entra no DOM depois que o script já executou.',
      },
    ],
  },
  {
    id: 'web-browser-01-blocking-css',
    kind: 'multiple-choice',
    title: 'Por que o CSS bloqueia a renderização?',
    difficulty: 'introductory',
    conceptIds: ['web-render-blocking-css'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Por que o navegador espera o CSS do <head> antes de pintar a página pela primeira vez?',
      },
    ],
    options: [
      {
        id: 'avoid-fouc',
        text: 'Para não pintar o conteúdo sem estilo e, logo em seguida, ter de refazer layout e pintura com os estilos corretos.',
        explanation:
          'Correto. A render tree precisa do CSSOM. Pintar antes mostraria a página "crua" por um instante (o chamado FOUC, flash of unstyled content) e desperdiçaria trabalho.',
      },
      {
        id: 'css-builds-dom',
        text: 'Porque o DOM só pode ser construído depois que o CSS termina de carregar.',
        explanation:
          'Incorreto. O parser continua construindo o DOM enquanto o CSS baixa. O que espera é a renderização (render tree, layout e paint).',
      },
      {
        id: 'security',
        text: 'Por segurança: o CSS precisa ser verificado antes de o HTML ser exibido.',
        explanation:
          'Incorreto. O bloqueio não tem relação com segurança. É uma decisão de renderização, para evitar mostrar conteúdo sem estilo.',
      },
      {
        id: 'js-needs-it',
        text: 'Porque o JavaScript só pode começar a ser baixado depois do CSS.',
        explanation:
          'Incorreto. Os downloads acontecem em paralelo. O que existe é outra relação: um script comum espera o CSS anterior a ele antes de executar, mas não antes de baixar.',
      },
    ],
    correctOptionIds: ['avoid-fouc'],
    hints: [
      'O que a render tree combina?',
      'O que o usuário veria se a página fosse pintada antes de o CSS chegar?',
    ],
    solution: [
      {
        type: 'paragraph',
        text: 'Sem o CSSOM não existe render tree com estilos corretos. O navegador prefere esperar a pintar uma versão sem estilo e redesenhar tudo logo depois. Por isso CSS grande ou lento no <head> atrasa a primeira pintura.',
      },
    ],
  },
  {
    id: 'web-browser-01-layout-change',
    kind: 'multiple-choice',
    title: 'Qual mudança exige recalcular o layout?',
    difficulty: 'intermediate',
    conceptIds: ['web-render-tree'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Via JavaScript, você muda uma única propriedade de um elemento já visível. Qual das mudanças obriga o navegador a recalcular o layout?',
      },
    ],
    options: [
      {
        id: 'width',
        text: "elemento.style.width = '320px'",
        explanation:
          'Correto. A largura muda a geometria do elemento e pode empurrar os vizinhos. O navegador precisa refazer o layout e depois pintar de novo.',
      },
      {
        id: 'color',
        text: "elemento.style.color = 'tomato'",
        explanation:
          'Incorreto. Mudar a cor do texto não altera tamanho nem posição de nenhuma caixa. Exige nova pintura, mas não layout.',
      },
      {
        id: 'transform',
        text: "elemento.style.transform = 'translateX(40px)'",
        explanation:
          'Incorreto. transform move o elemento visualmente sem alterar o layout dos outros. Em geral o navegador resolve isso na etapa de composição, sem layout.',
      },
      {
        id: 'opacity',
        text: "elemento.style.opacity = '0.5'",
        explanation:
          'Incorreto. Opacidade não altera a geometria. Em geral é resolvida na composição, como o transform.',
      },
    ],
    correctOptionIds: ['width'],
    hints: [
      'Layout calcula tamanho e posição. Qual mudança altera um dos dois para o resto da página?',
      'transform desloca o elemento visualmente, mas o espaço que ele ocupa no fluxo continua o mesmo.',
    ],
    solution: [
      {
        type: 'paragraph',
        text: 'Mudar width força layout, depois paint e composição. color exige só paint e composição. transform e opacity normalmente ficam só na composição, por isso são as propriedades preferidas para animações.',
      },
    ],
  },
];
