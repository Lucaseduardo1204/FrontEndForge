import { Lesson } from '../../app/core/models/content.models';

/**
 * Every behaviour in this lesson was measured with this project's Angular and is asserted in
 * `src/content/angular-signals.spec.ts`, which also compiles and runs the component below.
 */
export const SIZE_PICKER_TS = `@Component({
  selector: 'app-seletor-tamanho',
  template: \`
    <fieldset>
      <legend>Tamanho</legend>
      @for (t of tamanhos(); track t) {
        <label>
          <input
            type="radio"
            name="tamanho"
            [checked]="t === selecionado()"
            (change)="selecionado.set(t)"
          />
          {{ t }}
        </label>
      }
    </fieldset>
    <p>Selecionado: {{ selecionado() }}</p>
  \`,
})
export class SeletorTamanho {
  readonly tamanhos = input.required<readonly string[]>();

  // Escolha local que acompanha a lista: mantém a escolha se ela
  // ainda existe; senão, volta para a primeira opção.
  readonly selecionado = linkedSignal<readonly string[], string>({
    source: this.tamanhos,
    computation: (novos, anterior) =>
      anterior && novos.includes(anterior.value) ? anterior.value : novos[0],
  });

  constructor() {
    // Efeito: sincroniza com algo fora dos signals (aqui, o título da aba).
    effect(() => {
      document.title = \`Tamanho \${this.selecionado()}\`;
    });
  }
}`;

export const COMPUTED_BEHAVIOUR_TS = `const preco = signal(100);
const quantidade = signal(2);
const total = computed(() => preco() * quantidade()); // ainda não calculou nada

total();          // calcula agora: 200
total();          // devolve o valor guardado, sem recalcular
preco.set(100);   // mesmo valor (Object.is): nada é invalidado
quantidade.set(3);
total();          // recalcula: 300`;

export const ANGULAR_SIGNALS_01: Lesson = {
  id: 'angular-signals-01',
  moduleId: 'angular-signals-depth',
  title: 'Signals a fundo: computed, effect, linkedSignal e untracked',
  summary:
    'Como o Angular decide o que recalcular: dependências automáticas, cálculo preguiçoso, quando um effect roda e como ter estado local que acompanha uma fonte.',
  estimatedMinutes: 45,
  difficulty: 'intermediate',
  conceptIds: ['angular-signals', 'angular-signal-effects'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Usar signal e computed é fácil; entender quando cada coisa roda é o que evita os bugs difíceis: o effect que "não rodou" ainda, o computed que não atualiza porque o array foi alterado no lugar, o NG0600 ao escrever num signal dentro de um computed, a seleção que fica apontando para uma opção que não existe mais.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Entender o rastreamento automático de dependências.',
            'Saber que computed é preguiçoso, memoizado e compara valores.',
            'Usar effect só para sincronizar com o mundo de fora, e saber quando ele roda.',
            'Ler um signal sem criar dependência (untracked).',
            'Criar estado local que acompanha uma fonte (linkedSignal).',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'A planilha',
      blocks: [
        {
          type: 'paragraph',
          text: 'Signals funcionam como uma planilha: células com valores (signal) e células com fórmulas (computed). A planilha sabe de quais células cada fórmula depende porque viu a fórmula lê-las, e só recalcula o que foi afetado. Um effect é uma macro que roda quando as células que ela lê mudam, por exemplo para mandar um e-mail: algo que acontece fora da planilha.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'O modelo de execução',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Dependências são registradas na leitura: o computed passa a depender dos signals que chamou na última execução. Se um if deixar de ler um signal, ele deixa de ser dependência (dependências dinâmicas).',
            'computed é preguiçoso: só calcula quando alguém lê. É memoizado: leituras seguidas devolvem o valor guardado. E compara com Object.is: se um computed intermediário produz o mesmo valor, quem depende dele não recalcula.',
            'set com um valor igual (Object.is) não invalida nada. Por isso alterar um array no lugar (push) não avisa ninguém: a referência é a mesma. Use update com um array novo.',
            'Escrever num signal dentro de um computed lança NG0600: computed deve ser uma fórmula pura.',
            'effect roda depois, não na hora do set: o Angular agenda a execução, e vários sets seguidos geram uma única execução, com o valor final. A função recebida em onCleanup roda antes da próxima execução e na destruição.',
            'effect é para sincronizar com o mundo de fora (título, armazenamento, uma biblioteca que não conhece signals, logs). Para derivar um valor de outros signals, computed.',
            'untracked(() => s()) ou untracked(s) lê sem criar dependência: a mudança não dispara recálculo, mas o próximo recálculo lê o valor atual.',
            'linkedSignal é um signal gravável cujo valor é recalculado quando a fonte muda. Na forma { source, computation }, a função recebe o valor anterior e pode preservar a escolha quando faz sentido.',
          ],
        },
        {
          type: 'code',
          language: 'typescript',
          caption: 'computed é preguiçoso e memoizado',
          code: COMPUTED_BEHAVIOUR_TS,
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: o seletor de tamanho',
      blocks: [
        {
          type: 'paragraph',
          text: 'A lista de tamanhos vem de fora (muda quando o produto muda). A escolha é local, mas não pode apontar para um tamanho que não existe mais:',
        },
        {
          type: 'code',
          language: 'typescript',
          caption: 'seletor-tamanho.ts',
          code: SIZE_PICKER_TS,
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Este código é executado',
          text: 'Os testes da plataforma montam o componente, escolhem G, trocam a lista para uma que ainda tem G (a escolha fica) e para uma sem G (volta à primeira opção), e conferem o título da aba depois que o effect roda.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Experimente',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Coloque um console.log dentro de um computed e leia-o três vezes seguidas. Quantos logs aparecem?',
            'Dentro de um effect, faça três sets seguidos num signal que ele lê. Quantas vezes ele roda?',
            'Troque o linkedSignal do exemplo pela forma curta, linkedSignal(() => this.tamanhos()[0]). O que acontece com a escolha quando a lista muda, mesmo contendo G?',
            'Escreva num signal dentro de um computed e leia a mensagem NG0600.',
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
          text: 'No laboratório, implemente uma versão mínima de signal e computed, com dependências automáticas e cálculo preguiçoso. Depois, responda sobre effects.',
        },
      ],
      exerciseIds: ['lab-js-mini-signals', 'signals-01-effect-timing'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: o NG0600',
      blocks: [
        {
          type: 'code',
          language: 'typescript',
          caption: 'Erro NG0600: Writing to signals is not allowed in a `computed`',
          code: `readonly itensFiltrados = computed(() => {
  const resultado = this.itens().filter((i) => i.nome.includes(this.busca()));
  this.semResultados.set(resultado.length === 0);
  return resultado;
});`,
        },
      ],
      exerciseIds: ['signals-01-ng0600'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Templates são consumidores de signals: o Angular atualiza só os componentes cujos signals lidos mudaram, o que viabiliza aplicações zoneless como esta plataforma.',
            'input() devolve um signal; com linkedSignal, um componente pode ter estado local que acompanha um input sem ngOnChanges.',
            'Nesta plataforma, o progresso é um signal num service, e XP, nível e recomendações são computed: nada é recalculado à mão.',
          ],
        },
      ],
    },
    {
      kind: 'assessment',
      title: 'Avaliação',
      blocks: [
        { type: 'paragraph', text: 'Para concluir a lição, acerte os três exercícios abaixo.' },
      ],
      exerciseIds: ['signals-01-lazy', 'signals-01-linked', 'signals-01-untracked'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Dependências são as leituras da última execução.',
            'computed: preguiçoso, memoizado, compara com Object.is, sem escrita.',
            'effect: depois, agrupado, com cleanup; só para o mundo de fora.',
            'untracked lê sem depender.',
            'linkedSignal: estado local que acompanha uma fonte.',
          ],
        },
      ],
    },
  ],
};
