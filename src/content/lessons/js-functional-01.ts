import { Lesson } from '../../app/core/models/content.models';

/** Executed in `src/content/closures-examples.spec.ts`; the logged values are asserted there. */
export const SHALLOW_COPY_JS = `const pedido = { id: 1, cliente: { nome: 'Ana' }, itens: ['café'] };

const copiaRasa = { ...pedido };
copiaRasa.cliente.nome = 'Bia';          // altera o objeto compartilhado
console.log(pedido.cliente.nome);        // Bia

const copiaProfunda = structuredClone(pedido);
copiaProfunda.itens.push('pão');
console.log(pedido.itens.length);        // 1: a cópia profunda não compartilha nada`;

export const SORT_JS = `const precos = [30, 10, 20];

const ordenados = precos.toSorted((a, b) => a - b);  // devolve um array novo
console.log(precos, ordenados);                      // [30, 10, 20] [10, 20, 30]

precos.sort((a, b) => a - b);                        // ordena o próprio array
console.log(precos);                                 // [10, 20, 30]`;

export const PIPE_JS = `const pipe = (...funcoes) => (valor) => funcoes.reduce((acc, f) => f(acc), valor);

const normalizarBusca = pipe(
  (texto) => texto.trim(),
  (texto) => texto.toLowerCase(),
  (texto) => texto.normalize('NFD').replace(/[\\u0300-\\u036f]/g, ''), // remove acentos
);

console.log(normalizarBusca('  Café com PÃO '));   // cafe com pao`;

export const JS_FUNCTIONAL_01: Lesson = {
  id: 'js-functional-01',
  moduleId: 'js-functional-composition',
  title: 'Funções de ordem superior, composição e imutabilidade',
  summary:
    'Tratar funções como valores, compor transformações pequenas e trabalhar com dados sem alterá-los por acidente, a base de estado previsível em qualquer framework.',
  estimatedMinutes: 40,
  difficulty: 'intermediate',
  conceptIds: ['js-functional', 'js-mutability'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Muitos bugs de interface vêm de dados alterados por acidente: uma lista ordenada "só para exibir" que muda a ordem em outro lugar, uma cópia que compartilha um objeto com o original, um signal que não atualiza porque o array foi modificado no lugar. Programar com funções pequenas, puras e composíveis evita essa família inteira de problemas.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Usar funções como valores: recebê-las, devolvê-las e combiná-las.',
            'Compor transformações pequenas com pipe.',
            'Distinguir métodos que alteram o array dos que devolvem um novo.',
            'Diferenciar cópia rasa de cópia profunda.',
            'Memoizar funções puras, e saber quando não fazer isso.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'A linha de montagem',
      blocks: [
        {
          type: 'paragraph',
          text: 'Pense numa linha de montagem em que cada estação recebe uma peça, faz uma coisa e entrega uma peça nova para a próxima, sem mexer nas peças das outras estações. É fácil trocar uma estação, testar cada uma separadamente e entender o resultado. Funções puras compostas são essa linha.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Funções como valores e dados que não mudam por acidente',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Funções de ordem superior recebem ou devolvem funções: map, filter, reduce, addEventListener e as fábricas da lição de closures são exemplos.',
            'Função pura: mesma entrada, mesma saída, sem efeitos colaterais (não altera argumentos, não escreve em variáveis externas, não faz requisições). São fáceis de testar e de compor.',
            'pipe(f, g, h)(x) é h(g(f(x))): cada função faz uma coisa, e a sequência fica legível de cima para baixo.',
            'Alteram o array: sort, reverse, splice, push, pop. Devolvem um novo: map, filter, slice, concat, e, desde o ES2023, toSorted, toReversed, toSpliced e with.',
            'Spread ({ ...obj }, [...arr]) faz cópia rasa: o primeiro nível é novo, mas objetos internos continuam compartilhados. structuredClone faz cópia profunda.',
            'Para "alterar" um item imutavelmente: map devolvendo um objeto novo só para o item mudado ({ ...item, campo: novo }); os outros itens continuam os mesmos objetos, o que é desejável.',
            'Memoização guarda o resultado de chamadas anteriores. Só faz sentido para funções puras e caras; para funções com efeitos ou baratas, só gasta memória. computed() do Angular é uma memoização automática.',
          ],
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: pedidos, preços e busca',
      blocks: [
        {
          type: 'paragraph',
          text: 'A cópia rasa compartilha o objeto interno; a profunda não:',
        },
        { type: 'code', language: 'javascript', caption: 'copias.js', code: SHALLOW_COPY_JS },
        {
          type: 'paragraph',
          text: 'Ordenar para exibir sem mudar a lista original:',
        },
        { type: 'code', language: 'javascript', caption: 'ordenar.js', code: SORT_JS },
        {
          type: 'paragraph',
          text: 'E uma normalização de busca montada com pipe, que ignora espaços, maiúsculas e acentos:',
        },
        { type: 'code', language: 'javascript', caption: 'busca.js', code: PIPE_JS },
        {
          type: 'callout',
          tone: 'info',
          title: 'Este código é executado',
          text: 'Os testes da plataforma executam os três exemplos e conferem cada valor que os comentários mostram. O Bestiário tem o bug real do sort que altera a lista original.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Teste no console',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Rode o exemplo das cópias e troque o spread por structuredClone na primeira cópia.',
            'Crie um array, guarde uma referência a ele (const outro = lista) e chame lista.sort(). O que acontece com outro?',
            'Acrescente uma etapa ao pipe que troca vários espaços por um só.',
            'Escreva uma função impura (que soma num contador global) e tente prever o resultado de chamá-la duas vezes com o mesmo argumento.',
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
          text: 'No laboratório, implemente pipe e uma memoização. Depois, responda sobre cópias.',
        },
      ],
      exerciseIds: ['lab-js-pipe-memo', 'functional-01-shallow'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: o ranking que bagunça a lista',
      blocks: [
        {
          type: 'code',
          language: 'javascript',
          caption: 'Depois de abrir o ranking, a lista de produtos aparece fora de ordem',
          code: `function ranking(produtos) {
  return produtos.sort((a, b) => b.vendas - a.vendas).slice(0, 3);
}`,
        },
      ],
      exerciseIds: ['functional-01-sort'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Signals e change detection dependem de referências novas: signal.update(lista => [...lista, novo]) atualiza, lista.push(novo) não.',
            'As regras desta plataforma (próxima atividade, XP, revisão espaçada) são funções puras que recebem o progresso e devolvem um progresso novo: nada é alterado no lugar.',
            'RxJS é composição de funções: pipe(map(...), filter(...)) é a mesma ideia do pipe desta lição, aplicada a valores no tempo.',
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
      exerciseIds: ['functional-01-pure', 'functional-01-pipe-order', 'functional-01-memo'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Funções são valores: recebidas, devolvidas e compostas.',
            'Funções puras: mesma entrada, mesma saída, sem efeitos.',
            'sort e reverse alteram; toSorted e toReversed devolvem novos.',
            'Spread é cópia rasa; structuredClone é profunda.',
            'Memoize só funções puras e caras.',
          ],
        },
        { type: 'paragraph', text: 'No Bestiário: o sort que altera a lista original.' },
      ],
    },
  ],
};
