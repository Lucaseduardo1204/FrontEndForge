import { Exercise } from '../../app/core/models/content.models';

export const ARCH_BOUNDARIES_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-js-order-summary',
    kind: 'code',
    language: 'javascript',
    title: 'Extraia a regra do resumo do pedido',
    difficulty: 'intermediate',
    conceptIds: ['arch-boundaries'],
    prompt: [
      {
        type: 'paragraph',
        text: 'A regra do total do carrinho estava dentro de um componente, misturada com leitura do localStorage. Escreva-a como função pura: resumoDoPedido(itens, cupomPercentual) recebe os itens (preço em centavos e quantidade) e o percentual de desconto, e devolve { subtotal, desconto, total }, em centavos.',
      },
    ],
    requirements: [
      'subtotal é a soma de preco × quantidade.',
      'desconto é o percentual aplicado ao subtotal, arredondado para o centavo mais próximo.',
      'total é subtotal menos desconto.',
      'Sem itens, tudo é zero.',
      'cupomPercentual fora de 0 a 100 lança RangeError.',
      'Os itens recebidos não são alterados.',
    ],
    examples: [
      {
        input:
          'resumoDoPedido([{ preco: 1000, quantidade: 2 }, { preco: 500, quantidade: 1 }], 10)',
        output: '{ subtotal: 2500, desconto: 250, total: 2250 }',
      },
      { input: 'resumoDoPedido([], 0)', output: '{ subtotal: 0, desconto: 0, total: 0 }' },
    ],
    starterCode: `function resumoDoPedido(itens, cupomPercentual) {
  // Seu código aqui
}

console.log(resumoDoPedido([{ preco: 1000, quantidade: 2 }], 10));
`,
    tests: [
      {
        id: 'basic',
        description: 'Calcula subtotal, desconto e total',
        source:
          'expect(resumoDoPedido([{ preco: 1000, quantidade: 2 }, { preco: 500, quantidade: 1 }], 10)).toEqual({ subtotal: 2500, desconto: 250, total: 2250 });',
      },
      {
        id: 'empty',
        description: 'Sem itens, tudo é zero',
        source: 'expect(resumoDoPedido([], 15)).toEqual({ subtotal: 0, desconto: 0, total: 0 });',
      },
      {
        id: 'rounding',
        description: 'Arredonda o desconto para o centavo mais próximo',
        source:
          'expect(resumoDoPedido([{ preco: 999, quantidade: 1 }], 15)).toEqual({ subtotal: 999, desconto: 150, total: 849 }); expect(resumoDoPedido([{ preco: 333, quantidade: 1 }], 10)).toEqual({ subtotal: 333, desconto: 33, total: 300 });',
      },
      {
        id: 'no-coupon',
        description: 'Cupom 0 não dá desconto; cupom 100 zera o total',
        source:
          'expect(resumoDoPedido([{ preco: 700, quantidade: 3 }], 0).total).toBe(2100); expect(resumoDoPedido([{ preco: 700, quantidade: 3 }], 100).total).toBe(0);',
      },
      {
        id: 'invalid-coupon',
        description: 'Recusa cupom fora de 0 a 100',
        source:
          'expect(() => resumoDoPedido([], -5)).toThrow(); expect(() => resumoDoPedido([], 101)).toThrow();',
      },
      {
        id: 'immutable',
        description: 'Não altera os itens recebidos',
        source:
          'const itens = [{ preco: 100, quantidade: 1 }]; resumoDoPedido(itens, 50); expect(itens).toEqual([{ preco: 100, quantidade: 1 }]);',
      },
    ],
    hints: [
      'reduce soma preco × quantidade de todos os itens.',
      'Math.round(subtotal * cupomPercentual / 100) dá o desconto em centavos.',
      'Valide o cupom antes de qualquer conta e lance new RangeError(...).',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `function resumoDoPedido(itens, cupomPercentual) {
  if (cupomPercentual < 0 || cupomPercentual > 100) {
    throw new RangeError('O cupom precisa estar entre 0 e 100%.');
  }
  const subtotal = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
  const desconto = Math.round((subtotal * cupomPercentual) / 100);
  return { subtotal, desconto, total: subtotal - desconto };
}`,
      },
      {
        type: 'paragraph',
        text: 'A função não sabe de tela, de localStorage nem de Angular: recebe dados e devolve dados. O componente só lê o carrinho (por um service) e mostra o resultado; a regra é testada sozinha, com qualquer combinação de itens e cupons.',
      },
    ],
  },
  {
    id: 'arch-01-abstraction',
    kind: 'multiple-choice',
    title: 'Criar a interface agora?',
    difficulty: 'advanced',
    conceptIds: ['arch-yagni'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Uma aplicação busca produtos de uma única API, sem nenhum plano de outra fonte. Alguém propõe criar ProdutosRepository (abstrato), ProdutosHttpRepository, ProdutosFacade e ProdutosStore antes do primeiro componente. O que fazer?',
      },
    ],
    options: [
      {
        id: 'service',
        text: 'Começar com um ProdutosService que chama a API e expõe signals. Criar abstrações quando surgir uma razão concreta (outra fonte, estado compartilhado complexo), e registrar a decisão.',
        explanation:
          'Correto. Um service já separa os componentes do acesso a dados e pode ser substituído nos testes. As outras camadas teriam uma implementação cada e nenhum ganho hoje; criá-las depois, quando houver razão, é barato.',
      },
      {
        id: 'all-layers',
        text: 'Criar todas as camadas: assim o projeto já nasce preparado.',
        explanation:
          'Incorreto. Cada camada sem uso custa código, indireção e manutenção, e as necessidades reais costumam ser diferentes das imaginadas.',
      },
      {
        id: 'http-in-component',
        text: 'Chamar o HttpClient direto em cada componente, sem service.',
        explanation:
          'Incorreto. Espalha a URL, o tratamento de erros e o formato dos dados por várias telas: o extremo oposto.',
      },
      {
        id: 'store-only',
        text: 'Só a store, porque toda aplicação precisa de gerenciamento de estado global.',
        explanation:
          'Incorreto. Muitas aplicações resolvem com signals em services; store é para estado compartilhado complexo.',
      },
    ],
    correctOptionIds: ['service'],
    hints: ['Existe hoje uma segunda implementação para justificar a interface?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Comece simples, com fronteiras onde há troca concreta. Esta plataforma criou uma única abstração de persistência porque o backend estava no plano (e ele veio, sem mudar nenhuma página); o resto são services e funções.',
      },
    ],
  },
  {
    id: 'arch-01-refactor',
    kind: 'order-steps',
    title: 'Refatorando o componente que faz tudo',
    difficulty: 'advanced',
    conceptIds: ['arch-boundaries'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O componente da etapa de depuração lê o localStorage e calcula o total. Ordene uma refatoração segura.',
      },
    ],
    items: [
      {
        id: 'tests',
        text: 'Escrever testes do comportamento atual (o total com e sem cupom)',
        why: 'Sem eles, não há como saber se a refatoração mudou algo.',
      },
      {
        id: 'pure',
        text: 'Extrair o cálculo para uma função pura e cobri-la com testes de casos de borda',
        why: 'É a parte mais fácil de isolar e a que mais se beneficia de testes diretos.',
      },
      {
        id: 'service',
        text: 'Mover a leitura do carrinho para um CarrinhoService',
        why: 'O componente deixa de saber onde os dados ficam.',
      },
      {
        id: 'component',
        text: 'Deixar o componente só ler do service e mostrar o resultado da função',
        why: 'Com as peças prontas, o componente vira só apresentação.',
      },
      {
        id: 'verify',
        text: 'Rodar todos os testes e conferir a tela',
        why: 'Confirma que o comportamento continua igual.',
      },
    ],
    explanation:
      'Testes primeiro, passos pequenos, um de cada vez, e o comportamento igual no fim. Mudar estrutura e comportamento juntos esconde onde um erro entrou.',
    hints: ['O que garante que nada mudou para quem usa?'],
    solution: [
      {
        type: 'list',
        ordered: true,
        items: ['Testes', 'Função pura', 'Service', 'Componente', 'Verificar'],
      },
    ],
  },
  {
    id: 'arch-01-dependency',
    kind: 'multiple-choice',
    title: 'Para onde aponta a dependência?',
    difficulty: 'advanced',
    conceptIds: ['arch-boundaries', 'angular-di'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Nesta plataforma, as páginas usam o ProgressService, que depende de ProgressRepository (abstrato). Ao acrescentar o backend, o que precisou mudar?',
      },
    ],
    options: [
      {
        id: 'config',
        text: 'Uma nova classe que estende ProgressRepository e fala com a API, e o ponto da configuração que escolhe a implementação. Páginas e regras não mudam.',
        explanation:
          'Correto. Como as páginas dependem da abstração, e não do localStorage, trocar a implementação é uma mudança localizada. Foi o que aconteceu nesta plataforma: o HttpProgressRepository entrou sem mudar nenhuma página. É a inversão de dependência na prática.',
      },
      {
        id: 'all-pages',
        text: 'Todas as páginas que leem ou salvam progresso.',
        explanation:
          'Incorreto. Isso aconteceria se cada página falasse com o localStorage direto. A fronteira existe para evitar isso.',
      },
      {
        id: 'rules',
        text: 'As funções de core/learning, que calculam a próxima atividade.',
        explanation: 'Incorreto. Elas recebem o progresso como dado e não sabem de onde ele veio.',
      },
      {
        id: 'everything',
        text: 'Nada é possível sem reescrever a aplicação.',
        explanation: 'Incorreto. É exatamente o cenário que a abstração prepara.',
      },
    ],
    correctOptionIds: ['config'],
    hints: ['Quem conhece o localStorage hoje?'],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `{
  provide: ProgressRepository,
  useFactory: () =>
    inject(StorageModeService).mode === 'server'
      ? new HttpProgressRepository()
      : new LocalStorageProgressRepository(),
},`,
      },
    ],
  },
  {
    id: 'arch-01-errors',
    kind: 'multiple-choice',
    title: 'Onde tratar o erro?',
    difficulty: 'advanced',
    conceptIds: ['arch-boundaries'],
    prompt: [
      {
        type: 'paragraph',
        text: 'A busca de produtos recebe 404 quando o termo não existe. Onde esse caso deve ser tratado?',
      },
    ],
    options: [
      {
        id: 'local',
        text: 'Na própria busca (no service ou no componente), mostrando "Nenhum produto encontrado". O ErrorHandler global fica para o inesperado.',
        explanation:
          'Correto. Um 404 aqui é um resultado esperado, com uma resposta clara para a pessoa. O tratamento global serve de rede de segurança para erros que ninguém previu.',
      },
      {
        id: 'global',
        text: 'No ErrorHandler global, para centralizar todos os erros.',
        explanation:
          'Incorreto. O global não sabe o contexto ("estava buscando produtos") e só consegue dar uma mensagem genérica.',
      },
      {
        id: 'ignore',
        text: 'Em lugar nenhum: o console já mostra o erro.',
        explanation: 'Incorreto. Quem usa a aplicação não vê o console; a tela fica sem resposta.',
      },
      {
        id: 'interceptor',
        text: 'Num interceptor que transforma todo 404 em lista vazia.',
        explanation:
          'Incorreto. Outras chamadas com 404 (um recurso que deveria existir) também virariam "vazio", escondendo problemas reais.',
      },
    ],
    correctOptionIds: ['local'],
    hints: ['Esse erro é esperado ou inesperado?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Esperado: trate onde acontece, com uma mensagem útil. Inesperado: ErrorHandler global registra e avisa.',
      },
    ],
  },
  {
    id: 'arch-01-adr',
    kind: 'multiple-choice',
    title: 'O que um registro de decisão precisa ter?',
    difficulty: 'advanced',
    conceptIds: ['arch-yagni'],
    prompt: [
      {
        type: 'paragraph',
        text: 'A equipe decidiu guardar o progresso no navegador, atrás de uma interface, até o backend existir. O que o registro dessa decisão precisa conter para ser útil daqui a um ano?',
      },
    ],
    options: [
      {
        id: 'why-alternatives',
        text: 'O que foi decidido, por quê (o contexto e as restrições daquele momento) e quais alternativas foram descartadas, e por quê.',
        explanation:
          'Correto. O porquê e as alternativas permitem saber quando a decisão deixou de valer, sem refazer a investigação. É o formato usado nas decisões desta plataforma.',
      },
      {
        id: 'what-only',
        text: 'Só o que foi decidido: "progresso no localStorage".',
        explanation:
          'Incorreto. Sem o porquê, ninguém sabe se a decisão ainda vale, e a discussão recomeça do zero.',
      },
      {
        id: 'code',
        text: 'O código completo da implementação.',
        explanation:
          'Incorreto. O código já está no repositório; o registro explica o que o código não diz.',
      },
      {
        id: 'author',
        text: 'Quem tomou a decisão, para saber a quem perguntar.',
        explanation: 'Insuficiente. Pessoas mudam de equipe; o raciocínio precisa estar escrito.',
      },
    ],
    correctOptionIds: ['why-alternatives'],
    hints: ['O que você precisaria saber para decidir se a decisão ainda vale?'],
    solution: [
      { type: 'paragraph', text: 'O quê, por quê, alternativas descartadas. Curto e datado.' },
    ],
  },
];
