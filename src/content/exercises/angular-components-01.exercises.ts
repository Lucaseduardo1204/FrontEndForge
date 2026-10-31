import { Exercise } from '../../app/core/models/content.models';

/** Claims made here are executed in `src/content/angular-examples.spec.ts`. */
export const COMPUTED_PREDICT_CODE = `const tarefas = signal([
  { titulo: 'A', feita: false },
  { titulo: 'B', feita: true },
]);
const pendentes = computed(() => tarefas().filter((t) => !t.feita).length);

console.log(pendentes());
tarefas.update((lista) => [...lista, { titulo: 'C', feita: false }]);
console.log(pendentes());`;

export const EFFECT_MISUSE_CODE = `export class ListaTarefas {
  readonly tarefas = signal<readonly Tarefa[]>([]);
  readonly pendentes = signal(0);

  constructor() {
    effect(() => {
      this.pendentes.set(this.tarefas().filter((t) => !t.feita).length);
    });
  }
}`;

export const ANGULAR_COMPONENTS_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'ng-input-output',
    kind: 'multiple-choice',
    title: 'Quem muda a tarefa?',
    difficulty: 'intermediate',
    conceptIds: ['angular-components'],
    prompt: [
      {
        type: 'paragraph',
        text: 'No exemplo da lição, o usuário marca a caixa de uma tarefa dentro de TarefaItem. O que acontece com o dado?',
      },
    ],
    options: [
      {
        id: 'emit-parent-updates',
        text: 'TarefaItem emite o id por output(); ListaTarefas recebe o evento e cria uma lista nova com update.',
        explanation:
          'Correto. O filho só avisa o que aconteceu. Quem é dono da lista (o pai, com o signal tarefas) decide como ela muda, e a tela acompanha porque o signal mudou.',
      },
      {
        id: 'checked-two-way',
        text: '[checked] liga a caixa à tarefa nos dois sentidos, então a lista do pai é atualizada automaticamente.',
        explanation:
          'Incorreto. [checked] é property binding: o dado vai do componente para o elemento, num sentido só. Marcar a caixa não altera nada no TypeScript; é o evento (change) que dispara o emit.',
      },
      {
        id: 'child-sets-input',
        text: 'TarefaItem altera tarefa().feita, e o pai percebe porque recebeu a tarefa por input().',
        explanation:
          'Incorreto. O exemplo não faz isso, e não deveria: o objeto pertence ao pai. Mudar uma propriedade por dentro não avisa nenhum signal, então pendentes não recalcula.',
      },
      {
        id: 'output-returns',
        text: 'emit devolve para o filho a tarefa já atualizada pelo pai.',
        explanation:
          'Incorreto. emit não tem retorno útil: é um aviso de mão única. O filho recebe a tarefa nova da forma de sempre, pelo input(), quando o pai redesenha a lista.',
      },
    ],
    correctOptionIds: ['emit-parent-updates'],
    hints: [
      'Procure, no template do filho, o que acontece no evento (change).',
      'Quem tem o signal que guarda a lista?',
    ],
    solution: [
      {
        type: 'paragraph',
        text: 'Dados descem por input() e eventos sobem por output(). O filho chama alternada.emit(tarefa().id); o pai escuta com (alternada)="alternar($event)" e atualiza o signal com update, gerando uma lista nova.',
      },
    ],
  },
  {
    id: 'ng-data-flow-order',
    kind: 'order-steps',
    title: 'Do clique à tela atualizada',
    difficulty: 'intermediate',
    conceptIds: ['angular-components', 'angular-signals'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Ordene o que acontece, no exemplo da lição, desde o clique na caixa até o contador de pendentes mudar.',
      },
    ],
    items: [
      {
        id: 'change',
        text: 'O navegador dispara o evento change na caixa de seleção',
        why: 'Tudo começa no DOM: sem o evento, o Angular não executa nada.',
      },
      {
        id: 'emit',
        text: 'TarefaItem executa alternada.emit(tarefa().id)',
        why: 'O handler (change) do template do filho é o que chama emit.',
      },
      {
        id: 'handler',
        text: 'ListaTarefas executa alternar(id), recebido em $event',
        why: 'O pai só reage depois que o filho emite: (alternada)="alternar($event)" escuta o output.',
      },
      {
        id: 'update',
        text: 'tarefas.update cria uma lista nova com a tarefa trocada',
        why: 'É dentro de alternar que o signal recebe o valor novo.',
      },
      {
        id: 'render',
        text: 'O Angular atualiza a tela: pendentes() é recalculado e o contador muda',
        why: 'computed só recalcula depois que um signal do qual ele depende mudou, e a tela é atualizada a partir dos signals.',
      },
    ],
    explanation:
      'O fluxo é sempre o mesmo: evento no DOM → output do filho → método do pai → novo valor no signal → computed e template acompanham.',
    hints: [
      'Comece pelo que o usuário faz no navegador.',
      'O pai consegue reagir antes de o filho emitir?',
      'computed depende de quê para recalcular?',
    ],
    solution: [
      {
        type: 'list',
        ordered: true,
        items: [
          'Evento change no DOM.',
          'Filho: alternada.emit(id).',
          'Pai: alternar(id).',
          'Pai: tarefas.update(...) com uma lista nova.',
          'Tela: pendentes() recalculado e contador atualizado.',
        ],
      },
    ],
  },
  {
    id: 'ng-input-readonly',
    kind: 'multiple-choice',
    title: 'Por que tarefa.set não compila?',
    difficulty: 'intermediate',
    conceptIds: ['angular-components', 'angular-signals'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Alguém adicionou ao TarefaItem um método que chama this.tarefa.set(...), e o código não compila. Qual é a explicação e a correção adequada?',
      },
    ],
    options: [
      {
        id: 'readonly-emit',
        text: 'O signal de input() é somente leitura no filho; o filho deve emitir um evento e deixar o pai atualizar a lista.',
        explanation:
          'Correto. input() devolve um InputSignal, que não tem set nem update: quem escreve nele é o Angular, com o valor que o pai passa. Para mudar o dado, o filho pede ao dono por output().',
      },
      {
        id: 'mutate-property',
        text: 'Basta trocar por this.tarefa().feita = true, que compila e resolve.',
        explanation:
          'Incorreto. Compila, mas altera por dentro um objeto que pertence à lista do pai sem avisar o signal tarefas. O computed pendentes continua com o valor antigo e a tela fica inconsistente.',
      },
      {
        id: 'not-required',
        text: 'O problema é o .required: com input() simples, set fica disponível.',
        explanation:
          'Incorreto. input() e input.required() criam o mesmo tipo de signal somente leitura. required só obriga o pai a informar o valor.',
      },
      {
        id: 'missing-import',
        text: 'Faltou importar set de @angular/core.',
        explanation:
          'Incorreto. set seria um método do signal, não uma função importada. O erro existe porque signals de input não têm esse método.',
      },
    ],
    correctOptionIds: ['readonly-emit'],
    hints: [
      'Quem fornece o valor de um input: o próprio componente ou o pai?',
      'Lembre o lema da lição: dados descem, eventos sobem.',
    ],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        caption: 'O filho pede; o pai decide',
        code: `// TarefaItem
readonly alternada = output<number>();

marcar() {
  this.alternada.emit(this.tarefa().id);
}`,
      },
    ],
  },
  {
    id: 'ng-computed-predict',
    kind: 'predict-output',
    title: 'O que o computed mostra?',
    difficulty: 'intermediate',
    conceptIds: ['angular-signals'],
    prompt: [
      {
        type: 'paragraph',
        text: 'signal e computed vêm de @angular/core. Digite os dois valores que aparecem no console, na ordem, separados por um espaço.',
      },
    ],
    language: 'typescript',
    code: COMPUTED_PREDICT_CODE,
    acceptedAnswers: ['1 2'],
    explanation:
      'Na primeira leitura, só A está pendente: 1. update cria uma lista nova com C (pendente); o signal avisa o computed, que recalcula na próxima leitura: 2.',
    commonMistakes: [
      {
        answer: '1 1',
        explanation:
          'computed guarda o resultado em cache, mas o cache é invalidado quando um signal lido dentro dele muda. Como update trocou o valor de tarefas, a segunda leitura recalcula.',
      },
      {
        answer: '2 3',
        explanation:
          'O filtro conta só as tarefas com feita: false. B já está feita, então não entra na conta.',
      },
    ],
    wrongAnswerGuidance:
      'Não é isso. Conte as tarefas pendentes antes e depois do update, e pense se o computed percebe a mudança.',
    hints: [
      'Quais tarefas têm feita: false no começo?',
      'update substitui o valor do signal. Quem depende dele é avisado?',
    ],
    solution: [
      {
        type: 'paragraph',
        text: 'A saída é 1 e depois 2. computed é preguiçoso e memoizado: só recalcula quando é lido e algum signal do qual depende mudou.',
      },
    ],
  },
  {
    id: 'ng-track',
    kind: 'multiple-choice',
    title: 'O que usar no track?',
    difficulty: 'intermediate',
    conceptIds: ['angular-control-flow'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Na lista de tarefas, cada atualização cria objetos novos para as tarefas alteradas. Qual expressão de track é a mais adequada no @for?',
      },
    ],
    options: [
      {
        id: 'by-id',
        text: 'track tarefa.id',
        explanation:
          'Correto. O id identifica a tarefa mesmo quando o objeto é recriado. O Angular reaproveita o elemento já existente na tela, e o checkbox que você acabou de clicar continua com o foco.',
      },
      {
        id: 'by-reference',
        text: 'track tarefa',
        explanation:
          'Incorreto aqui. Rastrear pela referência faz o Angular tratar o objeto recriado pelo update como outra tarefa: o elemento dela é destruído e criado de novo, e o foco do teclado se perde.',
      },
      {
        id: 'by-title',
        text: 'track tarefa.titulo',
        explanation:
          'Incorreto. Dois itens podem ter o mesmo título, e o título pode ser editado. track precisa de algo único e estável.',
      },
      {
        id: 'omit',
        text: 'Nenhuma: track é opcional e só serve para otimizar.',
        explanation:
          'Incorreto. No @for, track é obrigatório: sem ele o template não compila. Ele também define a identidade de cada item, não só o desempenho.',
      },
    ],
    correctOptionIds: ['by-id'],
    hints: [
      'O que acontece com o objeto de uma tarefa quando ela é marcada?',
      'O que continua igual numa tarefa mesmo quando o objeto é recriado?',
    ],
    solution: [
      {
        type: 'paragraph',
        text: 'Use uma identidade estável e única do domínio, como o id. track $index serve para listas estáticas; rastrear pela referência só funciona bem quando os objetos não são recriados.',
      },
    ],
  },
  {
    id: 'ng-effect-misuse',
    kind: 'multiple-choice',
    title: 'Estado derivado com effect',
    difficulty: 'intermediate',
    conceptIds: ['angular-signals'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Uma versão diferente da lista calcula o número de pendentes assim. O que você mudaria?',
      },
      { type: 'code', language: 'typescript', code: EFFECT_MISUSE_CODE },
    ],
    options: [
      {
        id: 'use-computed',
        text: 'Trocar o signal e o effect por computed: pendentes é derivado de tarefas.',
        explanation:
          'Correto. Com effect, existem duas fontes de verdade e pendentes fica desatualizado entre o update e a execução do effect, que acontece depois. computed é sempre coerente com tarefas e dispensa o effect.',
      },
      {
        id: 'compile-error',
        text: 'Nada a mudar no desenho, mas o código lança erro: effects não podem escrever em signals.',
        explanation:
          'Incorreto. Nas versões atuais do Angular, escrever em signals dentro de effect é permitido. O problema é de desenho, não de erro: effect não deve ser usado para copiar estado.',
      },
      {
        id: 'recommended',
        text: 'Nada: effect é a forma recomendada de manter um signal sincronizado com outro.',
        explanation:
          'Incorreto. A documentação do Angular recomenda computed para estado derivado e reserva effect para efeitos colaterais, como registrar logs, salvar no armazenamento ou integrar com APIs fora do Angular.',
      },
      {
        id: 'on-init',
        text: 'Calcular uma vez em ngOnInit, que é mais simples.',
        explanation:
          'Incorreto. Calculado uma vez, o valor nunca mais acompanha as mudanças da lista.',
      },
    ],
    correctOptionIds: ['use-computed'],
    hints: [
      'pendentes tem informação própria, ou só depende de tarefas?',
      'Logo depois de tarefas.update(...), quanto vale pendentes()? O effect já rodou?',
    ],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `readonly pendentes = computed(() => this.tarefas().filter((t) => !t.feita).length);`,
      },
    ],
  },
];
