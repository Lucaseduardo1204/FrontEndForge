import { Exercise } from '../../app/core/models/content.models';

/** Navigation results claimed here are executed in `src/content/angular-router.spec.ts`. */
export const WILDCARD_FIRST_TS = `export const routes: Routes = [
  { path: '**', component: NaoEncontrada },
  { path: '', component: ListaProdutos },
  { path: 'produtos/:id', component: DetalheProduto },
];`;

export const REDIRECT_TS = `// SessaoService.logado() devolve false: ninguém entrou ainda.
await router.navigateByUrl('/admin');
console.log(router.url);`;

export const ANGULAR_ROUTER_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'router-01-param',
    kind: 'multiple-choice',
    title: 'Como o id chega ao componente?',
    difficulty: 'intermediate',
    conceptIds: ['angular-routing'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Com provideRouter(routes, withComponentInputBinding()) e a rota produtos/:id, como DetalheProduto recebe o id ao abrir /produtos/7?',
      },
    ],
    options: [
      {
        id: 'input',
        text: "Num input() chamado id, com o valor '7' em texto.",
        explanation:
          'Correto. O Router preenche inputs com o mesmo nome dos parâmetros. Parâmetros de URL são sempre texto, por isso o exemplo converte com Number(this.id()).',
      },
      {
        id: 'number',
        text: 'Num input() chamado id, já convertido para o número 7.',
        explanation:
          'Incorreto. URLs são texto. Converta você mesmo, ou use input.required({ transform: numberAttribute }).',
      },
      {
        id: 'constructor',
        text: 'Como argumento do construtor do componente.',
        explanation: 'Incorreto. Componentes não recebem parâmetros de rota pelo construtor.',
      },
      {
        id: 'global',
        text: 'Em window.location, que o componente precisa ler e interpretar.',
        explanation:
          'Incorreto. Funciona, mas ignora o Router: o componente não acompanha as navegações e fica difícil de testar.',
      },
    ],
    correctOptionIds: ['input'],
    hints: [
      'O que withComponentInputBinding() faz com os parâmetros?',
      'De que tipo é tudo o que vem de uma URL?',
    ],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `readonly id = input.required<string>();
readonly produto = computed(() => this.catalogo.porId(Number(this.id())));`,
      },
    ],
  },
  {
    id: 'router-01-href',
    kind: 'multiple-choice',
    title: 'routerLink ou href?',
    difficulty: 'intermediate',
    conceptIds: ['angular-routing'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Um link do menu foi escrito como <a href="/produtos/1">. Ele leva para a página certa. Qual é o problema?',
      },
    ],
    options: [
      {
        id: 'reload',
        text: 'O navegador recarrega a aplicação inteira: baixa o documento de novo, reinicia o Angular e perde o estado em memória, como o carrinho guardado num signal.',
        explanation:
          'Correto. routerLink intercepta o clique e só troca o componente. Com href, a navegação é do navegador, não do Angular.',
      },
      {
        id: 'no-problem',
        text: 'Nenhum: href e routerLink fazem a mesma coisa.',
        explanation: 'Incorreto. O destino é o mesmo, mas href recarrega a aplicação.',
      },
      {
        id: 'a11y',
        text: 'Leitores de tela não reconhecem o link.',
        explanation:
          'Incorreto. Um <a href> é o link mais acessível que existe. routerLink também gera um href no elemento, para que abrir em nova aba funcione.',
      },
      {
        id: 'broken',
        text: 'O link não funciona, porque o Angular bloqueia href.',
        explanation: 'Incorreto. Funciona; só que da forma lenta e com perda de estado.',
      },
    ],
    correctOptionIds: ['reload'],
    hints: ['Quem trata o clique em cada caso: o navegador ou o Router?'],
    solution: [
      {
        type: 'code',
        language: 'html',
        code: `<a [routerLink]="['/produtos', 1]">Café</a>`,
      },
    ],
  },
  {
    id: 'router-01-guard-security',
    kind: 'multiple-choice',
    title: 'O guard protege os dados?',
    difficulty: 'intermediate',
    conceptIds: ['angular-guards'],
    prompt: [
      {
        type: 'paragraph',
        text: 'A rota admin tem o guard do exemplo. A API /api/admin/usuarios não confere quem está chamando. Os dados dos usuários estão protegidos?',
      },
    ],
    options: [
      {
        id: 'no',
        text: 'Não. Qualquer pessoa pode chamar a API diretamente (pelo console ou por outra ferramenta). O servidor precisa verificar a autorização em cada requisição.',
        explanation:
          'Correto. O guard roda no navegador de quem acessa, que pode ser alterado. Ele melhora a experiência; a segurança está no servidor.',
      },
      {
        id: 'yes',
        text: 'Sim: sem passar pelo guard, ninguém chega na tela que lista os usuários.',
        explanation:
          'Incorreto. A tela não é o único caminho até os dados. A requisição pode ser feita sem a tela.',
      },
      {
        id: 'minified',
        text: 'Sim, desde que o código de produção esteja minificado.',
        explanation:
          'Incorreto. Minificar dificulta a leitura, mas não impede: o código e as chamadas de rede continuam visíveis no DevTools.',
      },
      {
        id: 'lazy',
        text: 'Sim, porque o lazy loading impede o download do código da área admin.',
        explanation:
          'Incorreto. O lazy loading adia o download, mas o pedaço continua público no servidor. E os dados vêm da API, não do código.',
      },
    ],
    correctOptionIds: ['no'],
    hints: ['Quem controla o código que roda no navegador?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Use guards para guiar a navegação e a API para proteger: cada requisição de dados sensíveis precisa de autenticação e autorização no servidor.',
      },
    ],
  },
  {
    id: 'router-01-stale',
    kind: 'multiple-choice',
    title: 'Por que a tela não muda?',
    difficulty: 'intermediate',
    conceptIds: ['angular-routing'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Na versão com bug do detalhe, a URL vai para /produtos/2, mas a tela continua no produto 1. Qual é a causa e a correção?',
      },
    ],
    options: [
      {
        id: 'reuse',
        text: 'O Angular reaproveita o componente ao trocar só o parâmetro, e produto foi calculado uma única vez, no construtor. Use o input id com computed (ou acompanhe paramMap).',
        explanation:
          'Correto. O componente não é recriado, então o campo inicializado com o snapshot nunca recalcula. Com o input como signal, cada navegação atualiza id, e o computed acompanha.',
      },
      {
        id: 'cache',
        text: 'O navegador guardou a página do produto 1 em cache.',
        explanation:
          'Incorreto. Não há nova página: a navegação é feita pelo Router, dentro da mesma página.',
      },
      {
        id: 'onpush',
        text: 'Falta ChangeDetectionStrategy.Default; com OnPush a tela não atualiza.',
        explanation:
          'Incorreto. Mesmo verificando a tela, o valor de produto continuaria o do produto 1: ele nunca é recalculado.',
      },
      {
        id: 'routerlink',
        text: 'O routerLink só muda a URL; é preciso recarregar a página para buscar o produto novo.',
        explanation:
          'Incorreto. O Router atualiza os parâmetros e os inputs. Recarregar esconderia o bug e perderia o estado da aplicação.',
      },
    ],
    correctOptionIds: ['reuse'],
    hints: [
      'Quantas vezes o construtor roda se o componente for reaproveitado?',
      'snapshot é uma foto de qual momento?',
    ],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `readonly id = input.required<string>();
readonly produto = computed(() => this.catalogo.porId(Number(this.id())));`,
      },
    ],
  },
  {
    id: 'router-01-order',
    kind: 'multiple-choice',
    title: 'A rota coringa primeiro',
    difficulty: 'intermediate',
    conceptIds: ['angular-routing'],
    prompt: [
      { type: 'paragraph', text: 'Com esta lista de rotas, o que aparece ao abrir /produtos/1?' },
      { type: 'code', language: 'typescript', code: WILDCARD_FIRST_TS },
    ],
    options: [
      {
        id: 'not-found',
        text: 'NaoEncontrada: ** corresponde a qualquer URL e vem primeiro.',
        explanation:
          'Correto. O Router usa a primeira rota que corresponde, na ordem da lista. Com ** no topo, nenhuma outra rota é alcançada.',
      },
      {
        id: 'detail',
        text: 'DetalheProduto: o Router escolhe a rota mais específica.',
        explanation:
          'Incorreto. O Router não procura a melhor correspondência; a ordem da lista decide.',
      },
      {
        id: 'error',
        text: 'Erro de configuração ao iniciar a aplicação.',
        explanation: 'Incorreto. A configuração é válida; ela só não faz o que se espera.',
      },
      {
        id: 'list',
        text: 'ListaProdutos, porque path vazio corresponde a tudo.',
        explanation:
          "Incorreto. Por padrão, path: '' só corresponde quando sobra uma URL vazia. E de qualquer forma ** vem antes.",
      },
    ],
    correctOptionIds: ['not-found'],
    hints: ['Em que ordem o Router confere as rotas?'],
    solution: [{ type: 'paragraph', text: 'Coloque ** sempre por último.' }],
  },
  {
    id: 'router-01-redirect',
    kind: 'predict-output',
    title: 'Para onde o guard manda?',
    difficulty: 'intermediate',
    conceptIds: ['angular-guards'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Com as rotas do exemplo da lição, digite o que aparece no console.',
      },
    ],
    language: 'typescript',
    code: REDIRECT_TS,
    acceptedAnswers: ['/login'],
    explanation:
      'O guard de admin devolve inject(Router).parseUrl("/login") quando não há sessão. Uma UrlTree devolvida por um guard cancela a navegação atual e inicia uma nova para aquele endereço.',
    commonMistakes: [
      {
        answer: '/admin',
        explanation:
          'O guard não deixou a navegação para /admin terminar: ele devolveu uma UrlTree, que redireciona.',
      },
      {
        answer: '/',
        explanation:
          'Seria o caso se o guard devolvesse false (a navegação é cancelada e a URL fica onde estava). Este devolve uma UrlTree para /login.',
      },
    ],
    wrongAnswerGuidance: 'Não é isso. Veja o que o guard de admin devolve quando logado() é false.',
    hints: ['O que significa um guard devolver uma UrlTree?'],
    solution: [{ type: 'paragraph', text: 'Saída: /login.' }],
  },
  {
    id: 'router-01-lazy',
    kind: 'multiple-choice',
    title: 'O que loadChildren faz?',
    difficulty: 'intermediate',
    conceptIds: ['angular-routing'],
    prompt: [
      {
        type: 'paragraph',
        text: "Sobre loadChildren: () => import('./admin/admin.routes'), qual afirmação está correta?",
      },
    ],
    options: [
      {
        id: 'on-demand',
        text: 'O código da área admin vai para um pedaço separado do bundle, baixado na primeira navegação para /admin.',
        explanation:
          'Correto. Quem nunca abre o admin não baixa esse código, e o carregamento inicial fica menor.',
      },
      {
        id: 'every-time',
        text: 'O código é baixado de novo a cada navegação para /admin.',
        explanation:
          'Incorreto. Depois de carregado, o módulo fica em memória; as próximas navegações não baixam de novo.',
      },
      {
        id: 'security',
        text: 'Impede que pessoas sem permissão vejam o código do admin.',
        explanation:
          'Incorreto. O pedaço continua disponível no servidor para quem pedir. Lazy loading é desempenho, não segurança.',
      },
      {
        id: 'prefetch-default',
        text: 'Faz o Angular baixar todas as áreas assim que a aplicação inicia.',
        explanation:
          'Incorreto. Esse é o comportamento de uma estratégia de pré-carregamento (como PreloadAllModules), que precisa ser configurada.',
      },
    ],
    correctOptionIds: ['on-demand'],
    hints: ['O import() dinâmico é executado quando?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Use lazy loading por área da aplicação. Se quiser deixar a próxima área pronta antes do clique, configure uma estratégia de pré-carregamento.',
      },
    ],
  },
];
