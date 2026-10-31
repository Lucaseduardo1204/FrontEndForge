import { Exercise } from '../../app/core/models/content.models';

/** Outputs claimed here are executed in `src/content/closures-examples.spec.ts`. */
export const PIPE_ORDER_JS = `const pipe = (...funcoes) => (valor) => funcoes.reduce((acc, f) => f(acc), valor);
const dobrar = (n) => n * 2;
const somarTres = (n) => n + 3;

console.log(pipe(dobrar, somarTres)(5), pipe(somarTres, dobrar)(5));`;

export const JS_FUNCTIONAL_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-js-pipe-memo',
    kind: 'code',
    language: 'javascript',
    title: 'pipe e memoizar',
    difficulty: 'intermediate',
    conceptIds: ['js-functional'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Implemente pipe(...funcoes), que devolve uma função que aplica cada uma em sequência, e memoizar(fn), que devolve uma versão de fn (de um argumento) que reaproveita resultados já calculados.',
      },
    ],
    requirements: [
      'pipe(f, g, h)(x) devolve h(g(f(x))).',
      'pipe() sem funções devolve o próprio valor.',
      'memoizar(fn) chama fn só uma vez para cada argumento diferente e devolve o resultado guardado nas repetições.',
      'Argumentos diferentes têm resultados diferentes guardados separadamente.',
      'Funções memoizadas diferentes não compartilham resultados.',
    ],
    examples: [
      { input: 'pipe((x) => x + 1, (x) => x * 2)(3)', output: '8' },
      {
        input: 'const quadrado = memoizar((n) => n * n); quadrado(4); quadrado(4)',
        output: '16 (fn chamada uma vez)',
      },
    ],
    starterCode: `function pipe(...funcoes) {
  // Seu código aqui
}

function memoizar(fn) {
  // Seu código aqui
}

console.log(pipe((x) => x + 1, (x) => x * 2)(3)); // esperado: 8
`,
    tests: [
      {
        id: 'pipe-order',
        description: 'pipe aplica da esquerda para a direita',
        source:
          'expect(pipe((x) => x + 1, (x) => x * 2)(3)).toBe(8); expect(pipe((x) => x * 2, (x) => x + 1)(3)).toBe(7);',
      },
      {
        id: 'pipe-empty',
        description: 'pipe() devolve o próprio valor',
        source: "expect(pipe()(42)).toBe(42); expect(pipe()('a')).toBe('a');",
      },
      {
        id: 'pipe-types',
        description: 'Funciona com qualquer tipo de valor',
        source: "expect(pipe((s) => s.trim(), (s) => s.toUpperCase())('  ana ')).toBe('ANA');",
      },
      {
        id: 'memo-cache',
        description: 'memoizar chama fn só uma vez por argumento',
        source:
          'let chamadas = 0; const q = memoizar((n) => { chamadas++; return n * n; }); expect(q(4)).toBe(16); expect(q(4)).toBe(16); expect(q(5)).toBe(25); expect(chamadas).toBe(2);',
      },
      {
        id: 'memo-falsy',
        description: 'Guarda também resultados como 0, false e undefined',
        source:
          'let chamadas = 0; const f = memoizar((n) => { chamadas++; return n === 0 ? 0 : undefined; }); f(0); f(0); f(1); f(1); expect(chamadas).toBe(2);',
      },
      {
        id: 'memo-separate',
        description: 'Funções memoizadas diferentes não compartilham resultados',
        source:
          'const a = memoizar((n) => n + 1); const b = memoizar((n) => n + 100); expect(a(1)).toBe(2); expect(b(1)).toBe(101);',
      },
    ],
    hints: [
      'pipe: devolva (valor) => funcoes.reduce((acc, f) => f(acc), valor).',
      'memoizar: guarde os resultados num Map dentro da closure.',
      'Use cache.has(arg) para saber se já calculou, e não o resultado: 0 e undefined também são resultados.',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `function pipe(...funcoes) {
  return (valor) => funcoes.reduce((acc, f) => f(acc), valor);
}

function memoizar(fn) {
  const cache = new Map(); // um cache por função memoizada
  return (arg) => {
    if (!cache.has(arg)) cache.set(arg, fn(arg)); // has: 0 e undefined também contam
    return cache.get(arg);
  };
}`,
      },
      {
        type: 'paragraph',
        text: 'O erro mais comum na memoização é testar o resultado (if (cache.get(arg))) em vez de testar se a chave existe: resultados como 0 ou undefined seriam recalculados sempre. E memoizar só faz sentido para funções puras: uma função que depende da hora ou de dados externos devolveria valores velhos.',
      },
    ],
  },
  {
    id: 'functional-01-shallow',
    kind: 'multiple-choice',
    title: 'A cópia que não copiou',
    difficulty: 'intermediate',
    conceptIds: ['js-mutability'],
    prompt: [
      {
        type: 'paragraph',
        text: 'No exemplo das cópias, por que mudar copiaRasa.cliente.nome também mudou pedido.cliente.nome?',
      },
    ],
    options: [
      {
        id: 'shallow',
        text: 'O spread copia só o primeiro nível: copiaRasa.cliente e pedido.cliente são o mesmo objeto.',
        explanation:
          'Correto. Os testes da plataforma executam o exemplo: depois da alteração, pedido.cliente.nome é "Bia". Para copiar tudo, structuredClone; para alterar um campo interno sem copiar tudo, crie um objeto novo só nesse caminho ({ ...pedido, cliente: { ...pedido.cliente, nome: "Bia" } }).',
      },
      {
        id: 'const',
        text: 'Porque pedido foi declarado com const.',
        explanation: 'Incorreto. const impede reatribuir a variável; não tem relação com cópias.',
      },
      {
        id: 'bug',
        text: 'É um erro do JavaScript com objetos aninhados.',
        explanation: 'Incorreto. É o comportamento especificado do spread.',
      },
      {
        id: 'strings',
        text: 'Porque strings são compartilhadas entre objetos.',
        explanation: 'Incorreto. Strings são imutáveis; o compartilhado é o objeto cliente.',
      },
    ],
    correctOptionIds: ['shallow'],
    hints: ['O spread copia os objetos internos ou só as referências a eles?'],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `const atualizado = { ...pedido, cliente: { ...pedido.cliente, nome: 'Bia' } };`,
      },
    ],
  },
  {
    id: 'functional-01-sort',
    kind: 'multiple-choice',
    title: 'O ranking que bagunça a lista',
    difficulty: 'intermediate',
    conceptIds: ['js-mutability', 'js-functional'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Na etapa de depuração, depois de chamar ranking(produtos), a lista principal aparece ordenada por vendas. Qual é a correção?',
      },
    ],
    options: [
      {
        id: 'tosorted',
        text: 'produtos.toSorted(...).slice(0, 3): toSorted devolve um array novo e não altera produtos.',
        explanation:
          'Correto. sort ordena o próprio array recebido, que é o mesmo da lista principal. Antes do ES2023: [...produtos].sort(...).',
      },
      {
        id: 'slice-after',
        text: 'Inverter a ordem: produtos.slice(0, 3).sort(...).',
        explanation:
          'Não altera mais o original, mas muda o resultado: pega os três primeiros da lista e só depois ordena, em vez dos três mais vendidos.',
      },
      {
        id: 'reverse',
        text: 'Chamar produtos.reverse() depois, para desfazer.',
        explanation: 'Incorreto. reverse também altera, e não desfaz uma ordenação.',
      },
      {
        id: 'freeze',
        text: 'Object.freeze(produtos) antes de chamar.',
        explanation:
          'Impede a alteração, mas o sort passa a lançar TypeError ao tentar ordenar o array congelado: o ranking quebra.',
      },
    ],
    correctOptionIds: ['tosorted'],
    hints: ['Qual método ordena sem alterar o array?'],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `function ranking(produtos) {
  return produtos.toSorted((a, b) => b.vendas - a.vendas).slice(0, 3);
}`,
      },
    ],
  },
  {
    id: 'functional-01-pure',
    kind: 'multiple-choice',
    title: 'Qual função é pura?',
    difficulty: 'intermediate',
    conceptIds: ['js-functional'],
    prompt: [{ type: 'paragraph', text: 'Qual destas funções é pura?' }],
    options: [
      {
        id: 'total',
        text: 'const total = (itens) => itens.reduce((s, i) => s + i.preco * i.quantidade, 0);',
        explanation:
          'Correto. Mesmos itens, mesmo total; não altera nada fora dela nem o argumento.',
      },
      {
        id: 'date',
        text: 'const vencida = (data) => data < new Date();',
        explanation:
          'Impura: o resultado depende da hora em que é chamada. Torne pura recebendo a data atual como parâmetro.',
      },
      {
        id: 'push',
        text: 'const adicionar = (lista, item) => { lista.push(item); return lista; };',
        explanation: 'Impura: altera o array recebido. Versão pura: [...lista, item].',
      },
      {
        id: 'log',
        text: 'const dobrarELogar = (n) => { console.log(n); return n * 2; };',
        explanation: 'Impura: escrever no console é um efeito colateral.',
      },
    ],
    correctOptionIds: ['total'],
    hints: ['Qual depende só dos argumentos e não altera nada?'],
    solution: [{ type: 'paragraph', text: 'Pura: depende só dos argumentos e não tem efeitos.' }],
  },
  {
    id: 'functional-01-pipe-order',
    kind: 'predict-output',
    title: 'A ordem do pipe',
    difficulty: 'intermediate',
    conceptIds: ['js-functional'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Digite os dois números que aparecem no console, separados por espaço.',
      },
    ],
    language: 'javascript',
    code: PIPE_ORDER_JS,
    acceptedAnswers: ['13 16'],
    explanation:
      'pipe aplica da esquerda para a direita. Primeiro: 5 × 2 = 10, depois + 3 = 13. Segundo: 5 + 3 = 8, depois × 2 = 16.',
    commonMistakes: [
      {
        answer: '16 13',
        explanation:
          'Isso seria compose, que aplica da direita para a esquerda. pipe aplica na ordem em que as funções aparecem.',
      },
      {
        answer: '13 13',
        explanation:
          'A ordem importa: multiplicar e depois somar não é o mesmo que somar e depois multiplicar.',
      },
    ],
    wrongAnswerGuidance:
      'Não é isso. Aplique as funções na ordem em que aparecem, uma de cada vez, para cada pipe.',
    hints: ['Em pipe(dobrar, somarTres), qual função recebe o 5?'],
    solution: [{ type: 'paragraph', text: 'Saída: 13 16.' }],
  },
  {
    id: 'functional-01-memo',
    kind: 'multiple-choice',
    title: 'Quando memoizar?',
    difficulty: 'intermediate',
    conceptIds: ['js-functional'],
    prompt: [{ type: 'paragraph', text: 'Em qual caso memoizar faz sentido?' }],
    options: [
      {
        id: 'pure-expensive',
        text: 'Calcular estatísticas pesadas de uma lista grande, que não muda, chamado várias vezes com a mesma lista.',
        explanation:
          'Correto. A função é pura e cara, e as entradas se repetem: reaproveitar o resultado economiza trabalho real. No Angular, computed() já faz isso para valores derivados de signals.',
      },
      {
        id: 'now',
        text: 'Uma função que devolve a hora atual formatada.',
        explanation: 'Incorreto. Não é pura: memoizar devolveria sempre a primeira hora calculada.',
      },
      {
        id: 'fetch',
        text: 'Uma função que busca o saldo da conta no servidor.',
        explanation:
          'Incorreto. O saldo muda; um cache permanente mostraria um valor velho. Cache de rede precisa de regras de expiração.',
      },
      {
        id: 'cheap',
        text: 'Somar dois números, chamada uma vez.',
        explanation: 'Desnecessário: o custo do cache supera o do cálculo.',
      },
    ],
    correctOptionIds: ['pure-expensive'],
    hints: ['Memoização exige quais duas características da função?'],
    solution: [{ type: 'paragraph', text: 'Pura e cara, com entradas que se repetem.' }],
  },
];
