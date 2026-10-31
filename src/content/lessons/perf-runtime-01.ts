import { Lesson } from '../../app/core/models/content.models';

/** The three variants are rendered and measured in `src/content/perf-a11y-examples.spec.ts` (D-065). */
export const TRACK_VARIANTS_HTML = `<!-- 1. Pela identidade do dado: o recomendado -->
@for (t of tarefas(); track t.id) {
  <li><input /> {{ t.titulo }}</li>
}

<!-- 2. Pela posição: o estado do DOM fica preso à posição, não ao item -->
@for (t of tarefas(); track $index) {
  <li><input /> {{ t.titulo }}</li>
}

<!-- 3. Pelo objeto: cópias novas (vindas da API, ou de um map) recriam tudo -->
@for (t of tarefas(); track t) {
  <li><input /> {{ t.titulo }}</li>
}`;

export const TEMPLATE_WORK_TS = `@Component({
  template: \`<p>Total: {{ totalMetodo() }}</p> <p>Total: {{ total() }}</p>\`,
})
export class Resumo {
  readonly itens = signal<readonly Item[]>([]);

  // Método no template: roda a cada atualização da view, mesmo sem mudança nos itens.
  totalMetodo() {
    return this.itens().reduce((s, i) => s + i.preco, 0);
  }

  // computed: roda de novo só quando itens muda.
  readonly total = computed(() => this.itens().reduce((s, i) => s + i.preco, 0));
}`;

export const PERF_RUNTIME_01: Lesson = {
  id: 'perf-runtime-01',
  moduleId: 'performance-runtime',
  title: 'Performance em execução: listas, track e trabalho no template',
  summary:
    'O que acontece no DOM quando uma lista muda, por que a escolha do track decide entre mover, reaproveitar ou recriar elementos, e como manter o template barato.',
  estimatedMinutes: 35,
  difficulty: 'intermediate',
  conceptIds: ['perf-rendering', 'angular-control-flow'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Uma página pode carregar rápido e mesmo assim travar ao usar: a lista que pisca e perde o foco a cada atualização, o campo em que se digitou que aparece em outra linha depois de ordenar, a tela que fica lenta porque um cálculo pesado roda a cada clique em qualquer lugar. A lição de carregamento tratou do primeiro acesso; esta trata do que acontece depois.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Entender como o @for decide o que mover, reaproveitar ou recriar.',
            'Escolher o track certo e reconhecer os bugs dos errados.',
            'Tirar trabalho do template com computed.',
            'Investigar com o painel Performance e o Angular DevTools.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'Os crachás',
      blocks: [
        {
          type: 'paragraph',
          text: 'Imagine reorganizar as mesas de uma equipe. Se cada pessoa tem um crachá (track pelo id), basta mover as pessoas com suas coisas. Se você só conta as cadeiras (track pela posição), as coisas ficam nas cadeiras e as pessoas trocam de lugar sem elas. E se você não reconhece ninguém que trocou de roupa (track pelo objeto), manda todos embora e contrata de novo.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'O que o Angular faz com cada track',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'O @for compara a lista nova com a anterior usando a expressão de track: itens com a mesma chave reaproveitam o elemento do DOM (movido, se a posição mudou); chaves novas criam elementos; chaves que sumiram removem.',
            'Medido com o Angular deste projeto, invertendo uma lista de três itens com um campo de texto em cada linha: com track t.id, o texto digitado no item A continuou na linha do A (o elemento foi movido). Com track $index, o texto foi parar na linha do C: o elemento ficou na posição, e só o conteúdo mudou.',
            'Medido também: ao trocar a lista por cópias novas dos mesmos itens (o que acontece ao recarregar da API ou ao usar map), track t.id reaproveitou 3 de 3 elementos; track t, que compara objetos, reaproveitou 0 de 3 e recriou todos.',
            'Por isso: track pela identidade estável do dado (id). $index só é aceitável em listas que nunca reordenam nem inserem no meio (estáticas, ou que só crescem no fim) e não têm estado nas linhas.',
            'Recriar elementos custa trabalho e perde estado do DOM: foco, texto digitado sem binding, posição de rolagem, animações.',
            'Um método chamado no template roda a cada atualização da view. Medido: com outro signal do componente mudando três vezes, o método rodou 4 vezes (1 + 3); o computed equivalente rodou 1 vez, porque os itens não mudaram.',
            'Para investigar: o painel Performance do DevTools mostra tarefas longas (mais de 50 ms) no main thread; o Angular DevTools tem um profiler que mostra quanto tempo cada atualização levou e quais componentes foram verificados.',
          ],
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: as três formas de track e o template barato',
      blocks: [
        {
          type: 'code',
          language: 'html',
          caption: 'lista-tarefas.html',
          code: TRACK_VARIANTS_HTML,
        },
        { type: 'code', language: 'typescript', caption: 'resumo.ts', code: TEMPLATE_WORK_TS },
        {
          type: 'callout',
          tone: 'info',
          title: 'Este código é medido',
          text: 'Os testes da plataforma renderizam as três formas de track, digitam num campo, invertem a lista, trocam os itens por cópias e conferem quais elementos foram reaproveitados. E contam quantas vezes o método e o computed rodam.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Investigue',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'No DevTools, aba Elements, observe uma lista enquanto ela atualiza: os elementos que piscam em roxo foram alterados ou recriados.',
            'Grave uma interação no painel Performance e procure tarefas marcadas em vermelho (longas).',
            'Instale o Angular DevTools e use o Profiler enquanto interage com uma lista.',
            'Troque track t.id por track $index numa lista com campos, ordene e veja onde o texto digitado vai parar.',
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
          text: 'No laboratório, implemente o plano de atualização que um @for com track calcula: o que criar, remover e reaproveitar. Depois, escolha o track certo.',
        },
      ],
      exerciseIds: ['lab-js-list-diff', 'runtime-01-choose-track'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: a anotação na linha errada',
      blocks: [
        {
          type: 'code',
          language: 'html',
          caption: 'Depois de ordenar por prazo, a anotação digitada numa tarefa aparece em outra',
          code: `@for (t of tarefasOrdenadas(); track $index) {
  <li>
    {{ t.titulo }}
    <input aria-label="Anotação" />
  </li>
}`,
        },
      ],
      exerciseIds: ['runtime-01-wrong-row'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Tabelas administrativas com seleção, edição em linha ou foco precisam de track pelo id: senão, cada atualização da API embaralha o estado.',
            'Nesta plataforma, listas de lições, missões, projetos e laboratórios usam track pelo id do conteúdo; listas de textos usam o próprio texto (strings são valores); e $index só aparece em listas estáticas ou que só crescem no fim, como os blocos de uma lição e as linhas do console do laboratório.',
            'Listas muito longas (milhares de itens) pedem paginação ou virtualização (o CDK do Angular tem um viewport virtual); track bom não substitui renderizar menos.',
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
      exerciseIds: ['runtime-01-copies', 'runtime-01-method', 'runtime-01-index-ok'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'track decide o que é "o mesmo item" entre uma atualização e outra.',
            'id estável: move e reaproveita. $index: estado preso à posição. Objeto: recria com cópias.',
            'Métodos no template rodam a cada atualização; computed só quando a fonte muda.',
            'Meça com o painel Performance e o Angular DevTools antes de otimizar.',
          ],
        },
      ],
    },
  ],
};
