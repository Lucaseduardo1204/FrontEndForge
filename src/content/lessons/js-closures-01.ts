import { Lesson } from '../../app/core/models/content.models';

/** Executed in `src/content/closures-examples.spec.ts`; the logged values are asserted there. */
export const COUNTER_FACTORY_JS = `function criarContador(inicial = 0) {
  let valor = inicial; // privado: só as funções abaixo enxergam

  return {
    incrementar() {
      valor += 1;
      return valor;
    },
    atual() {
      return valor;
    },
  };
}

const visitas = criarContador();
const curtidas = criarContador(10);
visitas.incrementar();
visitas.incrementar();
curtidas.incrementar();

console.log(visitas.atual(), curtidas.atual()); // 2 11
console.log(visitas.valor); // undefined: não existe fora da closure`;

export const LIVE_BINDING_JS = `let saudacao = 'olá';
const dizer = () => saudacao;

saudacao = 'tchau';
console.log(dizer()); // tchau: a função guarda a variável, não uma cópia do valor`;

export const LOOP_JS = `const comVar = [];
for (var i = 0; i < 3; i++) comVar.push(() => i);

const comLet = [];
for (let j = 0; j < 3; j++) comLet.push(() => j);

console.log(comVar.map((f) => f()).join(','), comLet.map((f) => f()).join(','));`;

export const JS_CLOSURES_01: Lesson = {
  id: 'js-closures-01',
  moduleId: 'js-functions-scope',
  title: 'Escopo e closures',
  summary:
    'Onde cada variável existe e por que uma função continua enxergando as variáveis do lugar onde foi criada, mesmo depois que esse lugar terminou.',
  estimatedMinutes: 40,
  difficulty: 'introductory',
  conceptIds: ['js-closures'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Toda vez que você passa uma função para addEventListener, setTimeout, map ou um then, está usando closures: a função roda depois, em outro momento, e ainda assim usa variáveis de onde foi escrita. Quando isso não está claro, aparecem bugs que parecem aleatórios: o laço em que todos os botões mostram o mesmo número, o valor "congelado" que não atualiza, a variável que "ainda não existe".',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Distinguir escopo global, de função e de bloco.',
            'Explicar por que let e const se comportam diferente de var.',
            'Usar closures para guardar estado privado.',
            'Saber quando a função enxerga o valor atual e quando ficou com um valor antigo.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'A mochila da função',
      blocks: [
        {
          type: 'paragraph',
          text: 'Quando uma função é criada, ela sai levando uma mochila com acesso às variáveis do lugar onde nasceu. Não é uma foto das variáveis: é uma chave para elas. Se alguém muda a variável depois, a função vê a mudança. E se o lugar de origem terminou (a função externa já retornou), as variáveis continuam vivas enquanto alguma mochila guardar a chave.',
        },
        {
          type: 'paragraph',
          text: 'Cada chamada da função externa cria variáveis novas, então duas funções criadas em chamadas diferentes carregam mochilas diferentes. É assim que dois contadores criados pela mesma fábrica não interferem um no outro.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Escopo, hoisting e closure',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Escopo é a região do código onde um nome existe. let e const valem dentro do bloco { } em que foram declaradas; var vale na função inteira (ou no global), ignorando blocos.',
            'Uma variável é procurada de dentro para fora: primeiro no escopo atual, depois nos que o envolvem. É o lugar onde a função foi escrita que define isso, não o lugar onde ela é chamada.',
            'Hoisting: declarações com var existem desde o início da função, valendo undefined até a linha da atribuição. let e const também são registradas no início do bloco, mas ficam inacessíveis até a declaração (a "zona morta temporal"): usá-las antes lança ReferenceError.',
            'Closure é a combinação de uma função com as variáveis do escopo em que ela foi criada. A função acessa a variável em si, então vê alterações feitas depois.',
            'No for com let, cada volta do laço tem sua própria variável; com var, todas as voltas compartilham a mesma.',
            'Desestruturar (const { tema } = config) copia o valor naquele momento para uma variável nova. A closure enxerga essa variável, que não acompanha mudanças posteriores em config.tema.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Closures guardam memória',
          text: 'Enquanto uma função existir, as variáveis que ela usa também existem. Um ouvinte de evento que nunca é removido mantém vivo tudo o que ele referencia. Remova ouvintes e cancele temporizadores quando não precisar mais deles (no Angular, DestroyRef e takeUntilDestroyed fazem isso).',
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: contadores independentes',
      blocks: [
        {
          type: 'paragraph',
          text: 'criarContador é uma fábrica: cada chamada cria uma variável valor nova e devolve funções que a enxergam. Ninguém de fora consegue alterar valor diretamente.',
        },
        { type: 'code', language: 'javascript', caption: 'contador.js', code: COUNTER_FACTORY_JS },
        {
          type: 'paragraph',
          text: 'A closure guarda a variável, não o valor do momento em que foi criada:',
        },
        { type: 'code', language: 'javascript', caption: 'referencia.js', code: LIVE_BINDING_JS },
        {
          type: 'paragraph',
          text: 'E é por isso que var e let dão resultados diferentes num laço:',
        },
        { type: 'code', language: 'javascript', caption: 'laco.js', code: LOOP_JS },
        {
          type: 'paragraph',
          text: 'O console mostra 3,3,3 0,1,2. Com var existe uma única variável i, que vale 3 quando as funções rodam; com let, cada volta tem a sua. O Bestiário tem esse bug num caso real, com botões.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Teste no console do navegador',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Cole o contador no console e crie um terceiro contador. Ele começa do zero ou do valor dos outros?',
            'Digite console.dir(visitas.incrementar), expanda a função e depois [[Scopes]]: um dos escopos guarda a variável valor, com o valor atual. O rótulo costuma ser Closure; nesta função aparece Block, porque o parâmetro inicial tem valor padrão.',
            'Rode o exemplo do laço e depois troque var por let na primeira linha do for.',
            'Escreva console.log(x); let x = 1; e depois console.log(y); var y = 1;. Compare os dois resultados.',
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
          text: 'No laboratório, use closures para criar estado privado e uma função que só executa uma vez. Depois, responda sobre privacidade.',
        },
      ],
      exerciseIds: ['lab-js-closures', 'closures-01-private'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: o tema que não muda',
      blocks: [
        {
          type: 'paragraph',
          text: 'Uma função criada no início da página sempre devolve o tema antigo, mesmo depois que a configuração mudou.',
        },
      ],
      exerciseIds: ['closures-01-stale'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Ouvintes de evento, callbacks de setTimeout e funções passadas a map e filter são closures o tempo todo.',
            'Em Angular, um computed(() => this.itens().length) é uma closure sobre this, e um effect que usa uma variável local a mantém viva enquanto o effect existir.',
            'Fábricas com estado privado são a base de muitos padrões: debounce e throttle guardam o temporizador numa closure, e memoização guarda resultados anteriores.',
            'Módulos JavaScript (import/export) também criam um escopo próprio: o que não é exportado é privado do arquivo, sem precisar de closures.',
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
          text: 'Para concluir a lição, acerte os três exercícios abaixo.',
        },
      ],
      exerciseIds: ['closures-01-counters', 'closures-01-loop', 'closures-01-tdz'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'let e const: escopo de bloco. var: escopo de função.',
            'O escopo de uma função é definido onde ela foi escrita.',
            'Closure: a função leva acesso às variáveis de onde nasceu, e vê mudanças nelas.',
            'Cada chamada de uma fábrica cria variáveis novas: estados independentes e privados.',
            'Desestruturar copia o valor do momento; para ver mudanças, leia do objeto na hora.',
          ],
        },
        {
          type: 'paragraph',
          text: 'Na Biblioteca: "Closure", "Hoisting" e "let, const e var". No Bestiário: o laço com var.',
        },
      ],
    },
  ],
};
