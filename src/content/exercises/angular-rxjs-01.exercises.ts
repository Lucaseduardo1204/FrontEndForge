import { Exercise } from '../../app/core/models/content.models';

/** Behaviour claimed here is executed with RxJS and Angular in `src/content/angular-rxjs.spec.ts`. */
export const LEAK_TS = `export class Relogio {
  readonly agora = signal(new Date());

  constructor() {
    interval(1000).subscribe(() => this.agora.set(new Date()));
  }
}`;

export const ANGULAR_RXJS_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'rxjs-01-cold',
    kind: 'multiple-choice',
    title: 'Quantas vezes "buscando preços"?',
    difficulty: 'advanced',
    conceptIds: ['angular-rxjs'],
    prompt: [
      {
        type: 'paragraph',
        text: 'No exemplo "frio" da lição, o Observable precos$ é assinado duas vezes. O que aparece no console?',
      },
    ],
    options: [
      {
        id: 'twice-after',
        text: '"antes de assinar" primeiro; depois "buscando preços" duas vezes, uma por assinatura, cada uma seguida dos dois preços.',
        explanation:
          'Correto. Observables frios só executam ao serem assinados, e cada assinatura executa tudo de novo. Com o HttpClient é igual: duas assinaturas, duas requisições.',
      },
      {
        id: 'once-before',
        text: '"buscando preços" uma vez, antes de "antes de assinar".',
        explanation:
          'Incorreto. Esse seria o comportamento de uma Promise, que começa a executar na criação e executa uma vez só.',
      },
      {
        id: 'once-shared',
        text: '"buscando preços" uma vez; a segunda assinatura reaproveita os valores.',
        explanation:
          'Incorreto. Compartilhar exige operadores como shareReplay; por padrão, cada assinatura é independente.',
      },
      {
        id: 'never',
        text: 'Nada aparece: falta chamar precos$.start().',
        explanation: 'Incorreto. subscribe é o que dispara a execução.',
      },
    ],
    correctOptionIds: ['twice-after'],
    hints: ['Quando o código dentro de new Observable(...) roda?'],
    solution: [
      {
        type: 'list',
        ordered: true,
        items: [
          'antes de assinar',
          'buscando preços, preço 10, preço 12 (primeira assinatura)',
          'buscando preços, preço 10, preço 12 (segunda assinatura)',
        ],
      },
    ],
  },
  {
    id: 'rxjs-01-operators',
    kind: 'order-steps',
    title: 'As estações da busca',
    difficulty: 'advanced',
    conceptIds: ['angular-rxjs'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Ordene os operadores da busca de clientes na ordem do pipe, do termo digitado até o resultado.',
      },
    ],
    items: [
      {
        id: 'map',
        text: 'map: remove espaços das pontas',
        why: 'Normalizar primeiro faz " ca" e "ca" serem o mesmo termo para os operadores seguintes.',
      },
      {
        id: 'debounce',
        text: 'debounceTime(300): espera a pausa na digitação',
        why: 'Antes de comparar ou buscar, deixa passar só o termo final de cada rajada de teclas.',
      },
      {
        id: 'distinct',
        text: 'distinctUntilChanged: ignora termo repetido',
        why: 'Depois do debounce, compara o termo final com o anterior e evita a mesma busca duas vezes.',
      },
      {
        id: 'switch',
        text: 'switchMap: faz a requisição e cancela a anterior',
        why: 'Só os termos que passaram pelos filtros viram requisições, e a mais nova vence.',
      },
      {
        id: 'catch',
        text: 'catchError (dentro do switchMap): troca uma falha por lista vazia',
        why: 'Fica dentro da requisição, para que um erro não termine o fluxo inteiro.',
      },
    ],
    explanation:
      'Normalizar, esperar, descartar repetidos, buscar cancelando o anterior e se recuperar de falhas sem matar a busca.',
    hints: ['O que precisa acontecer antes de comparar termos?'],
    solution: [
      {
        type: 'list',
        ordered: true,
        items: ['map', 'debounceTime', 'distinctUntilChanged', 'switchMap', 'catchError (dentro)'],
      },
    ],
  },
  {
    id: 'rxjs-01-dead-stream',
    kind: 'multiple-choice',
    title: 'A busca que morreu',
    difficulty: 'advanced',
    conceptIds: ['angular-rxjs'],
    prompt: [
      {
        type: 'paragraph',
        text: 'No código da etapa de depuração, depois de um erro 500 a busca nunca mais faz requisições. Por quê?',
      },
    ],
    options: [
      {
        id: 'outside',
        text: 'O erro da requisição sobe pelo switchMap e termina o fluxo principal; o catchError de fora troca o fluxo inteiro por of([]), que completa. Mover o catchError para dentro do switchMap substitui só aquela requisição.',
        explanation:
          'Correto. Num Observable, erro é terminal. Recuperar dentro do fluxo interno mantém o externo (os termos digitados) vivo. Os testes da plataforma reproduzem os dois casos.',
      },
      {
        id: 'debounce',
        text: 'O debounceTime travou depois do erro.',
        explanation: 'Incorreto. O debounce não falha; o fluxo inteiro foi encerrado.',
      },
      {
        id: 'http-cache',
        text: 'O HttpClient guardou o erro em cache.',
        explanation: 'Incorreto. O HttpClient não tem cache; as novas requisições nem são feitas.',
      },
      {
        id: 'signal',
        text: 'O signal termo parou de mudar.',
        explanation: 'Incorreto. O signal muda, mas ninguém mais está ouvindo: o fluxo terminou.',
      },
    ],
    correctOptionIds: ['outside'],
    hints: ['O que acontece com um Observable depois de um erro?'],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `switchMap((t) =>
  this.http.get<Cliente[]>('/api/clientes', { params: { busca: t } }).pipe(
    catchError(() => of([])),
  ),
),`,
      },
    ],
  },
  {
    id: 'rxjs-01-switchmap',
    kind: 'multiple-choice',
    title: 'switchMap ou mergeMap?',
    difficulty: 'advanced',
    conceptIds: ['angular-rxjs', 'js-async-races'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Na busca, a pessoa digita "ca" e, antes da resposta, "café". Por que switchMap, e não mergeMap?',
      },
    ],
    options: [
      {
        id: 'cancels',
        text: 'switchMap cancela a requisição de "ca" quando chega "café"; com mergeMap as duas continuam, e a resposta atrasada de "ca" pode sobrescrever a de "café".',
        explanation:
          'Correto. É a corrida da lição de assincronismo, resolvida por um operador. Os testes da plataforma conferem que a requisição anterior é cancelada.',
      },
      {
        id: 'faster',
        text: 'switchMap é mais rápido.',
        explanation: 'Não é questão de velocidade, e sim de qual resposta vale.',
      },
      {
        id: 'same',
        text: 'São iguais para requisições HTTP.',
        explanation: 'Incorreto. mergeMap mantém todas as requisições em andamento.',
      },
      {
        id: 'queue',
        text: 'switchMap espera "ca" terminar para buscar "café".',
        explanation: 'Esse é o concatMap. switchMap cancela.',
      },
    ],
    correctOptionIds: ['cancels'],
    hints: ['O que acontece com a requisição antiga em cada operador?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Busca e filtros: switchMap. Salvar itens em sequência: concatMap. Várias independentes em paralelo: mergeMap.',
      },
    ],
  },
  {
    id: 'rxjs-01-choose',
    kind: 'multiple-choice',
    title: 'Signal, httpResource ou RxJS?',
    difficulty: 'advanced',
    conceptIds: ['angular-rxjs', 'angular-signals'],
    prompt: [{ type: 'paragraph', text: 'Qual combinação de escolhas está mais adequada?' }],
    options: [
      {
        id: 'right',
        text: 'Quantidade de itens no carrinho: computed. Dados de um produto pelo id da rota: httpResource. Busca com espera da digitação e nova tentativa em caso de falha: RxJS.',
        explanation:
          'Correto. Estado derivado é signal; leitura que acompanha um signal é httpResource; composição de eventos no tempo é onde RxJS brilha.',
      },
      {
        id: 'all-rxjs',
        text: 'RxJS para tudo, inclusive a quantidade do carrinho, com BehaviorSubject.',
        explanation:
          'Funciona, mas é mais código e mais assinaturas para gerenciar; signals resolvem estado de forma mais simples.',
      },
      {
        id: 'all-signals',
        text: 'Signals e effect para tudo, inclusive a espera da digitação, com setTimeout dentro do effect.',
        explanation:
          'Incorreto. Reimplementar debounce e cancelamento com effect é frágil; RxJS já resolve.',
      },
      {
        id: 'promises',
        text: 'Promises com async/await em todos os casos.',
        explanation: 'Promises não cancelam nem representam fluxos de vários valores.',
      },
    ],
    correctOptionIds: ['right'],
    hints: ['Qual caso é estado, qual é leitura e qual é evento no tempo?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Estado: signals. Leitura: httpResource. Eventos no tempo: RxJS.',
      },
    ],
  },
  {
    id: 'rxjs-01-leak',
    kind: 'multiple-choice',
    title: 'O relógio que nunca para',
    difficulty: 'advanced',
    conceptIds: ['angular-rxjs'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Este componente aparece e some várias vezes durante a navegação. Qual é o problema?',
      },
      { type: 'code', language: 'typescript', code: LEAK_TS },
    ],
    options: [
      {
        id: 'leak',
        text: 'A assinatura nunca é cancelada: cada vez que o componente é criado, um novo interval continua rodando depois que ele some. Usar interval(1000).pipe(takeUntilDestroyed()) ou toSignal(interval(1000).pipe(map(() => new Date()))).',
        explanation:
          'Correto. Assinaturas manuais vivem até alguém cancelá-las. takeUntilDestroyed (no construtor ou num campo) e toSignal cancelam quando o componente é destruído.',
      },
      {
        id: 'auto',
        text: 'Nenhum: o Angular cancela todas as assinaturas ao destruir o componente.',
        explanation:
          'Incorreto. Só as que passam por takeUntilDestroyed, toSignal ou pelo pipe async.',
      },
      {
        id: 'signal-set',
        text: 'agora.set dentro de subscribe não atualiza a tela.',
        explanation: 'Incorreto. Atualiza; o problema é a assinatura que sobra.',
      },
      {
        id: 'interval',
        text: 'interval só funciona com zone.js.',
        explanation: 'Incorreto. interval funciona sem zone.js; o signal cuida da atualização.',
      },
    ],
    correctOptionIds: ['leak'],
    hints: ['Quem cancela a assinatura quando o componente some?'],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `readonly agora = toSignal(interval(1000).pipe(map(() => new Date())), {
  initialValue: new Date(),
});`,
      },
    ],
  },
];
