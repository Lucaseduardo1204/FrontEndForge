import { Exercise } from '../../app/core/models/content.models';

/** Compile results and runtime outputs claimed here are checked in `ts-examples.spec.ts`. */
export const TRUTHINESS_TS = `function rotuloEstoque(quantidade: number | null): string {
  if (!quantidade) return 'Sem informação';
  return \`\${quantidade} em estoque\`;
}

console.log(rotuloEstoque(0));`;

export const COMPILE_OPTIONS_TS = {
  discriminant: `if (estado.status === 'erro') console.log(estado.mensagem);`,
  inOperator: `if ('produtos' in estado) console.log(estado.produtos.length);`,
  common: `const s: string = estado.status;`,
  noNarrowing: `console.log(estado.produtos.length);`,
} as const;

export const AS_TS = `const produto = JSON.parse('{"id": 1, "nome": "Café", "preco": "12"}') as Produto;
console.log(produto.preco.toFixed(2));`;

export const TS_NARROWING_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-ts-type-guard',
    kind: 'code',
    language: 'typescript',
    title: 'Valide o produto que veio da API',
    difficulty: 'intermediate',
    conceptIds: ['ts-runtime-validation', 'ts-narrowing'],
    prompt: [
      {
        type: 'paragraph',
        text: 'A API de produtos às vezes devolve dados quebrados. Escreva o type guard ehProduto e use-o em produtosValidos para descartar o que não for um Produto.',
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Sobre a verificação de tipos',
        text: 'No laboratório, o TypeScript é convertido para JavaScript antes de rodar: os tipos são removidos, não verificados. Isso deixa claro o ponto da lição: só as verificações que você escreve existem em runtime.',
      },
    ],
    requirements: [
      'ehProduto(valor) devolve true só para objetos com id (number), nome (string) e preco (number).',
      'Devolve false para null, textos, números e objetos com campos faltando ou de tipo errado.',
      'produtosValidos(lista) devolve um novo array só com os produtos válidos, na mesma ordem.',
    ],
    examples: [
      { input: "ehProduto({ id: 1, nome: 'Café', preco: 12 })", output: 'true' },
      { input: "ehProduto({ id: 1, nome: 'Café', preco: '12' })", output: 'false' },
      { input: 'ehProduto(null)', output: 'false' },
    ],
    starterCode: `interface Produto {
  id: number;
  nome: string;
  preco: number;
}

function ehProduto(valor: unknown): valor is Produto {
  // Seu código aqui
  return false;
}

function produtosValidos(lista: unknown[]): Produto[] {
  // Seu código aqui
  return [];
}

console.log(ehProduto({ id: 1, nome: 'Café', preco: 12 }));
`,
    tests: [
      {
        id: 'valid',
        description: 'Aceita um produto válido',
        source: "expect(ehProduto({ id: 1, nome: 'Café', preco: 12 })).toBe(true);",
      },
      {
        id: 'extra-fields',
        description: 'Aceita um produto com campos a mais',
        source: "expect(ehProduto({ id: 2, nome: 'Pão', preco: 5, estoque: 3 })).toBe(true);",
      },
      {
        id: 'not-objects',
        description: 'Recusa null, undefined, texto e número',
        source: "for (const v of [null, undefined, 'Café', 12]) expect(ehProduto(v)).toBe(false);",
      },
      {
        id: 'wrong-type',
        description: 'Recusa preço em texto e id em texto',
        source:
          "expect(ehProduto({ id: 1, nome: 'Café', preco: '12' })).toBe(false); expect(ehProduto({ id: '1', nome: 'Café', preco: 12 })).toBe(false);",
      },
      {
        id: 'missing',
        description: 'Recusa objeto sem nome',
        source: 'expect(ehProduto({ id: 1, preco: 12 })).toBe(false);',
      },
      {
        id: 'filter',
        description: 'produtosValidos mantém só os válidos, na ordem',
        source:
          "const a = { id: 1, nome: 'A', preco: 1 }; const c = { id: 3, nome: 'C', preco: 3 }; expect(produtosValidos([a, { id: 2 }, null, c, 'x'])).toEqual([a, c]);",
      },
    ],
    hints: [
      "Comece garantindo que é um objeto: typeof valor === 'object' && valor !== null.",
      "Para cada campo, verifique que ele existe ('id' in valor) e o tipo dele (typeof valor.id === 'number').",
      'produtosValidos é um filter com o type guard: lista.filter(ehProduto).',
    ],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `interface Produto {
  id: number;
  nome: string;
  preco: number;
}

function ehProduto(valor: unknown): valor is Produto {
  return (
    typeof valor === 'object' &&
    valor !== null && // typeof null também é 'object'
    'id' in valor && typeof valor.id === 'number' &&
    'nome' in valor && typeof valor.nome === 'string' &&
    'preco' in valor && typeof valor.preco === 'number'
  );
}

function produtosValidos(lista: unknown[]): Produto[] {
  return lista.filter(ehProduto); // o type guard também estreita o tipo do array
}`,
      },
      {
        type: 'paragraph',
        text: 'Cada typeof é uma verificação que continua existindo depois que os tipos são removidos. O retorno valor is Produto é o que permite ao compilador tratar o valor como Produto depois do if.',
      },
    ],
  },
  {
    id: 'ts-01-truthiness',
    kind: 'predict-output',
    title: 'O que aparece para estoque zero?',
    difficulty: 'introductory',
    conceptIds: ['ts-narrowing'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Digite o que aparece no console.',
      },
    ],
    language: 'typescript',
    code: TRUTHINESS_TS,
    acceptedAnswers: ['Sem informação'],
    explanation:
      '!quantidade é verdadeiro para null, mas também para 0, porque 0 é um valor "falso" em JavaScript. A função trata estoque zerado como dado ausente. Correção: if (quantidade === null).',
    commonMistakes: [
      {
        answer: '0 em estoque',
        explanation:
          'Seria o esperado, mas 0 é falsy: !0 é true, e a função retorna antes. O TypeScript não avisa, porque o código é válido; o bug é de lógica.',
      },
    ],
    wrongAnswerGuidance:
      'Não é isso. Calcule !0: em JavaScript, quais valores contam como "falsos"?',
    hints: ['Quanto vale !0?', 'Quais valores são falsy em JavaScript?'],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `function rotuloEstoque(quantidade: number | null): string {
  if (quantidade === null) return 'Sem informação';
  return \`\${quantidade} em estoque\`; // rotuloEstoque(0) → "0 em estoque"
}`,
      },
    ],
  },
  {
    id: 'ts-01-compile',
    kind: 'multiple-choice',
    title: 'Qual linha não compila?',
    difficulty: 'intermediate',
    conceptIds: ['ts-unions', 'ts-narrowing'],
    prompt: [
      {
        type: 'paragraph',
        text: 'estado é do tipo EstadoPedido da lição (carregando | sucesso com produtos | erro com mensagem). Qual destas linhas o compilador recusa?',
      },
    ],
    options: [
      {
        id: 'no-narrowing',
        text: COMPILE_OPTIONS_TS.noNarrowing,
        explanation:
          'Correto, esta não compila. produtos só existe no caso sucesso; sem verificar o status antes, estado pode estar carregando ou com erro.',
      },
      {
        id: 'discriminant',
        text: COMPILE_OPTIONS_TS.discriminant,
        explanation:
          'Compila. A comparação com o campo discriminante estreita estado para o caso erro, que tem mensagem.',
      },
      {
        id: 'in',
        text: COMPILE_OPTIONS_TS.inOperator,
        explanation:
          "Compila. 'produtos' in estado só é verdadeiro no caso sucesso, e o compilador entende isso.",
      },
      {
        id: 'common',
        text: COMPILE_OPTIONS_TS.common,
        explanation:
          'Compila. status existe em todos os casos da união, então pode ser lido sem narrowing.',
      },
    ],
    correctOptionIds: ['no-narrowing'],
    hints: [
      'Qual campo existe em todos os casos?',
      'Em qual linha nada foi verificado antes do acesso?',
    ],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `if (estado.status === 'sucesso') {
  console.log(estado.produtos.length);
}`,
      },
    ],
  },
  {
    id: 'ts-01-as',
    kind: 'multiple-choice',
    title: 'as Produto',
    difficulty: 'intermediate',
    conceptIds: ['ts-runtime-validation'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Com a interface Produto da lição (preco: number), o que acontece com este código?',
      },
      { type: 'code', language: 'typescript', code: AS_TS },
    ],
    options: [
      {
        id: 'runtime-error',
        text: 'Compila sem erro e, ao rodar, lança TypeError: produto.preco.toFixed is not a function.',
        explanation:
          'Correto. as não verifica nada nem gera código: só muda o que o compilador acredita. Em runtime, preco é o texto "12", que não tem toFixed. O erro aparece longe da causa, que é a resposta da API.',
      },
      {
        id: 'compile-error',
        text: 'Não compila, porque "12" não é number.',
        explanation:
          'Incorreto. O compilador não vê o conteúdo do JSON: JSON.parse devolve any, e as Produto é aceito sem questionamento.',
      },
      {
        id: 'converts',
        text: 'Imprime 12.00, porque as converte o preço para number.',
        explanation:
          'Incorreto. as não converte valores. Ele desaparece quando o TypeScript vira JavaScript.',
      },
      {
        id: 'undefined',
        text: 'Imprime undefined.',
        explanation:
          'Incorreto. preco existe (é o texto "12"); o problema é chamar toFixed, que textos não têm.',
      },
    ],
    correctOptionIds: ['runtime-error'],
    hints: [
      'O que sobra de as Produto depois que o código vira JavaScript?',
      'Textos têm o método toFixed?',
    ],
    solution: [
      {
        type: 'paragraph',
        text: 'Para dados externos, troque a afirmação por uma verificação: um type guard como ehProduto, que recusa o preço em texto antes de ele chegar ao resto do código.',
      },
    ],
  },
  {
    id: 'ts-01-exhaustive',
    kind: 'multiple-choice',
    title: 'O status novo',
    difficulty: 'intermediate',
    conceptIds: ['ts-unions', 'ts-narrowing'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Alguém acrescenta | { status: "vazio" } a EstadoPedido e não mexe na função descrever da lição (aquela com const impossivel: never = estado no default). O que acontece?',
      },
    ],
    options: [
      {
        id: 'compile-error-never',
        text: 'O código deixa de compilar na linha do never, apontando que o caso "vazio" não foi tratado.',
        explanation:
          'Correto. No default, estado agora pode ser o caso vazio, e ele não pode ser atribuído a never. O compilador mostra o esquecimento antes de alguém ver a tela.',
      },
      {
        id: 'undefined-runtime',
        text: 'Compila, e descrever devolve undefined para o status vazio.',
        explanation:
          'Incorreto. Isso aconteceria em JavaScript puro. Com a verificação por never, o código nem chega a rodar.',
      },
      {
        id: 'runtime-only',
        text: 'Só dá erro em runtime, quando o status vazio aparecer.',
        explanation:
          'Incorreto. O objetivo do never é justamente antecipar o erro para a compilação.',
      },
      {
        id: 'auto',
        text: 'O TypeScript trata o novo caso sozinho no default.',
        explanation:
          'Incorreto. O compilador não gera lógica; ele só verifica os tipos do que você escreveu.',
      },
    ],
    correctOptionIds: ['compile-error-never'],
    hints: [
      'No default, quais casos de estado ainda são possíveis depois da mudança?',
      'Que valores cabem no tipo never?',
    ],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `case 'vazio':
  return 'Nenhum produto encontrado';`,
      },
    ],
  },
];
