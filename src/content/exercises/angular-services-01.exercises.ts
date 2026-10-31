import { Exercise } from '../../app/core/models/content.models';

/** Executed against the real service in `src/content/angular-services.spec.ts`. */
export const CART_TOTAL_TS = `carrinho.adicionar({ id: 1, nome: 'Café', preco: 10 });
carrinho.adicionar({ id: 2, nome: 'Pão', preco: 5 });
carrinho.adicionar({ id: 1, nome: 'Café', preco: 10 });

console.log(carrinho.itens().length, carrinho.quantidade(), carrinho.total());`;

export const ANGULAR_SERVICES_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'services-01-total',
    kind: 'predict-output',
    title: 'O que o carrinho mostra?',
    difficulty: 'intermediate',
    conceptIds: ['angular-di', 'angular-signals'],
    prompt: [
      {
        type: 'paragraph',
        text: 'carrinho é o CarrinhoService da lição, começando vazio. Digite os três números que aparecem no console, separados por espaço.',
      },
    ],
    language: 'typescript',
    code: CART_TOTAL_TS,
    acceptedAnswers: ['2 3 25'],
    explanation:
      'O café adicionado duas vezes vira uma linha com quantidade 2, então há 2 linhas (café e pão), 3 unidades e total 2 × 10 + 5 = 25.',
    commonMistakes: [
      {
        answer: '3 3 25',
        explanation:
          'adicionar não duplica a linha de um produto que já está no carrinho: ele aumenta a quantidade. São 2 linhas.',
      },
      {
        answer: '2 2 15',
        explanation:
          'O segundo café não é ignorado: a quantidade dele passa para 2, e quantidade e total são recalculados pelos computed.',
      },
    ],
    wrongAnswerGuidance:
      'Não é isso. Releia adicionar: o que acontece quando o id já está no carrinho? Depois conte linhas, unidades e o total.',
    hints: [
      'Quantas linhas existem depois do terceiro adicionar?',
      'quantidade soma as quantidades de todas as linhas.',
    ],
    solution: [
      {
        type: 'paragraph',
        text: 'Saída: 2 3 25. itens tem as linhas, quantidade soma as unidades e total multiplica preço por quantidade.',
      },
    ],
  },
  {
    id: 'services-01-readonly',
    kind: 'multiple-choice',
    title: 'Por que asReadonly?',
    difficulty: 'intermediate',
    conceptIds: ['angular-signals', 'angular-di'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O service expõe itens = this._itens.asReadonly(). O que acontece se um componente tentar this.carrinho.itens.set([])?',
      },
    ],
    options: [
      {
        id: 'compile-error',
        text: 'Não compila: o signal devolvido por asReadonly() não tem set nem update. Para esvaziar o carrinho, o service precisa de um método, como limpar().',
        explanation:
          'Correto. asReadonly() devolve um Signal somente leitura ligado ao original. Toda mudança passa pelos métodos do service, o que mantém as regras (como somar quantidades) num lugar só.',
      },
      {
        id: 'copy',
        text: 'Compila e esvazia só a cópia do componente; o carrinho continua igual.',
        explanation:
          'Incorreto. asReadonly() não cria uma cópia: é uma vista do mesmo signal. E ela não tem set.',
      },
      {
        id: 'works',
        text: 'Compila e esvazia o carrinho para todos.',
        explanation:
          'Incorreto. É exatamente isso que asReadonly() impede: se qualquer componente pudesse escrever, as regras do service poderiam ser contornadas.',
      },
      {
        id: 'runtime-error',
        text: 'Compila, mas lança erro em runtime.',
        explanation:
          'Incorreto. O erro aparece antes: o tipo Signal não tem set, então o compilador recusa.',
      },
    ],
    correctOptionIds: ['compile-error'],
    hints: ['Qual é a diferença entre WritableSignal e Signal?'],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `// no service
limpar() {
  this._itens.set([]);
}`,
      },
    ],
  },
  {
    id: 'services-01-providers',
    kind: 'multiple-choice',
    title: 'O resumo sempre zerado',
    difficulty: 'intermediate',
    conceptIds: ['angular-di'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Com providers: [CarrinhoService] no ResumoCarrinho, o resumo mostra sempre 0 itens, mesmo depois de clicar em "Comprar". Por quê?',
      },
    ],
    options: [
      {
        id: 'own-instance',
        text: 'providers no componente cria uma instância nova só para ele. O resumo lê um carrinho próprio, vazio, enquanto os botões usam o da aplicação.',
        explanation:
          'Correto. O injetor do componente atende o pedido antes de chegar ao da aplicação. Removendo a linha, o resumo volta a receber a instância de providedIn: "root".',
      },
      {
        id: 'onpush',
        text: 'OnPush impede o resumo de atualizar quando outro componente muda o estado.',
        explanation:
          'Incorreto. OnPush atualiza o componente quando um signal lido no template muda. O problema é que o resumo lê outro signal, de outra instância.',
      },
      {
        id: 'needs-input',
        text: 'Faltou passar o carrinho para o resumo por input().',
        explanation:
          'Incorreto. A ideia do service é justamente não precisar disso: qualquer componente pode injetá-lo.',
      },
      {
        id: 'explicit-good',
        text: 'Nada a ver com providers; declarar a dependência explicitamente é boa prática.',
        explanation:
          'Incorreto. providers não declara uma dependência: ele cria um provedor novo. A dependência já está declarada no inject().',
      },
    ],
    correctOptionIds: ['own-instance'],
    hints: ['Quantas instâncias de CarrinhoService existem agora?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Remova providers do ResumoCarrinho. Use providers em componentes só quando cada instância do componente deve ter seu próprio estado.',
      },
    ],
  },
  {
    id: 'services-01-inject-context',
    kind: 'multiple-choice',
    title: 'Onde inject() funciona?',
    difficulty: 'intermediate',
    conceptIds: ['angular-di'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Num componente, marque todos os lugares onde inject(CarrinhoService) funciona.',
      },
    ],
    options: [
      {
        id: 'field',
        text: 'No inicializador de um campo: private readonly carrinho = inject(CarrinhoService);',
        explanation:
          'Correto. Campos são inicializados durante a criação do componente, dentro do contexto de injeção.',
      },
      {
        id: 'constructor',
        text: 'Dentro do constructor.',
        explanation: 'Correto. O construtor também roda durante a criação, no contexto de injeção.',
      },
      {
        id: 'click',
        text: 'Dentro de um método chamado por (click).',
        explanation:
          'Incorreto. O clique acontece depois que o componente foi criado, fora do contexto de injeção: o Angular lança NG0203. Injete no campo e use no método.',
      },
      {
        id: 'timeout',
        text: 'Dentro de um setTimeout criado no constructor.',
        explanation:
          'Incorreto. O callback roda depois, quando o construtor já terminou e o contexto de injeção não existe mais.',
      },
    ],
    correctOptionIds: ['field', 'constructor'],
    hints: [
      'O contexto de injeção existe enquanto o componente está sendo criado. Quando cada trecho roda?',
    ],
    solution: [
      {
        type: 'paragraph',
        text: 'Injete em campos (ou no construtor) e use o valor depois, em métodos e callbacks. Fora da criação, runInInjectionContext permite usar inject() quando realmente necessário.',
      },
    ],
  },
  {
    id: 'services-01-flow',
    kind: 'order-steps',
    title: 'Do clique ao resumo',
    difficulty: 'intermediate',
    conceptIds: ['angular-di', 'angular-signals'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Ordene o que acontece quando alguém clica em "Comprar" no exemplo da lição.',
      },
    ],
    items: [
      {
        id: 'click',
        text: 'O botão dispara (click) e BotaoComprar.comprar() roda',
        why: 'Tudo começa no evento do componente que a pessoa usou.',
      },
      {
        id: 'service',
        text: 'comprar() chama carrinho.adicionar(produto)',
        why: 'O componente não altera o estado: ele pede ao service.',
      },
      {
        id: 'update',
        text: '_itens.update cria uma lista nova',
        why: 'A regra (somar quantidade ou criar linha) roda dentro do service.',
      },
      {
        id: 'computed',
        text: 'quantidade e total passam a refletir a lista nova',
        why: 'computed depende de _itens e é recalculado quando lido depois da mudança.',
      },
      {
        id: 'render',
        text: 'ResumoCarrinho, em outra parte da tela, é atualizado',
        why: 'Ele lê os signals do mesmo service; a mudança chega sem input nem output.',
      },
    ],
    explanation:
      'Evento no componente → método do service → novo valor no signal → derivados → todos os componentes que leem o service. Os dois componentes nunca se comunicam diretamente.',
    hints: ['Quem altera o estado: o componente ou o service?'],
    solution: [
      {
        type: 'list',
        ordered: true,
        items: [
          'click e comprar()',
          'adicionar()',
          '_itens.update',
          'computed',
          'ResumoCarrinho atualizado',
        ],
      },
    ],
  },
  {
    id: 'services-01-where',
    kind: 'multiple-choice',
    title: 'Onde fica o cupom de desconto?',
    difficulty: 'intermediate',
    conceptIds: ['angular-di'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O carrinho vai ganhar cupons de desconto, e o valor com desconto aparece no resumo, no checkout e no e-mail de confirmação. Onde a regra deve ficar?',
      },
    ],
    options: [
      {
        id: 'service',
        text: 'No CarrinhoService: um signal para o cupom, um método aplicarCupom() e um computed totalComDesconto.',
        explanation:
          'Correto. A regra fica num lugar só, testável sem tela, e todos os componentes leem o mesmo valor derivado.',
      },
      {
        id: 'template',
        text: 'Na expressão do template de cada tela que mostra o total.',
        explanation:
          'Incorreto. A regra ficaria repetida em vários templates, difícil de testar e fácil de sair de sincronia.',
      },
      {
        id: 'resumo',
        text: 'No ResumoCarrinho, que é onde o total aparece primeiro.',
        explanation:
          'Incorreto. O checkout e o e-mail também precisam do valor; eles teriam de depender do componente de resumo ou repetir a conta.',
      },
      {
        id: 'global',
        text: 'Numa variável global do arquivo main.ts.',
        explanation:
          'Incorreto. Fica fora da injeção de dependências: não dá para substituir nos testes, e qualquer código pode alterá-la.',
      },
    ],
    correctOptionIds: ['service'],
    hints: ['Quantos lugares precisam do valor com desconto?'],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `private readonly _cupom = signal<number>(0); // percentual
readonly totalComDesconto = computed(() => this.total() * (1 - this._cupom() / 100));

aplicarCupom(percentual: number) {
  this._cupom.set(Math.min(Math.max(percentual, 0), 100));
}`,
      },
    ],
  },
];
