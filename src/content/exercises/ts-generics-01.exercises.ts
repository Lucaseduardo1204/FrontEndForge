import { Exercise } from '../../app/core/models/content.models';

/** The inferred type claimed here is read from the TypeScript checker in `ts-examples.spec.ts`. */
export const INFER_PREDICT_TS = `// Com Cliente, porId e clientes do exemplo da lição:
const resultado = porId(clientes, 1);
// Qual é o tipo de resultado?`;

export const TS_GENERICS_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-ts-group-by',
    kind: 'code',
    language: 'typescript',
    title: 'Agrupe qualquer lista por uma chave',
    difficulty: 'intermediate',
    conceptIds: ['ts-generics'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Escreva agruparPor(itens, chave), genérica: recebe uma lista de objetos e o nome de uma chave, e devolve um objeto em que cada valor dessa chave aponta para a lista de itens com aquele valor.',
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Sobre a verificação de tipos',
        text: 'No laboratório, os tipos são removidos antes de rodar: os testes avaliam o comportamento. Escreva a assinatura genérica mesmo assim, <T, K extends keyof T>, como faria no editor.',
      },
    ],
    requirements: [
      'agruparPor(itens, chave) devolve um objeto: cada valor da chave (como texto) aponta para os itens com esse valor.',
      'A ordem dos itens dentro de cada grupo é a ordem original.',
      'Lista vazia devolve {}.',
      'Funciona com valores numéricos (viram chaves de texto, como em qualquer objeto).',
      'A lista recebida não é alterada.',
    ],
    examples: [
      {
        input:
          "agruparPor([{ n: 'Ana', s: 'ativo' }, { n: 'Bia', s: 'inativo' }, { n: 'Caio', s: 'ativo' }], 's')",
        output: '{ ativo: [Ana, Caio], inativo: [Bia] }',
      },
    ],
    starterCode: `function agruparPor<T, K extends keyof T>(itens: readonly T[], chave: K): Record<string, T[]> {
  // Seu código aqui
  return {};
}

console.log(agruparPor([{ nome: 'Ana', status: 'ativo' }], 'status'));
`,
    tests: [
      {
        id: 'groups',
        description: 'Agrupa pelo valor da chave, na ordem original',
        source:
          "const r = agruparPor([{ n: 'Ana', s: 'ativo' }, { n: 'Bia', s: 'inativo' }, { n: 'Caio', s: 'ativo' }], 's'); expect(r).toEqual({ ativo: [{ n: 'Ana', s: 'ativo' }, { n: 'Caio', s: 'ativo' }], inativo: [{ n: 'Bia', s: 'inativo' }] });",
      },
      {
        id: 'empty',
        description: 'Lista vazia devolve {}',
        source: "expect(agruparPor([], 'x')).toEqual({});",
      },
      {
        id: 'numbers',
        description: 'Valores numéricos viram chaves de texto',
        source:
          "const r = agruparPor([{ id: 1, nota: 10 }, { id: 2, nota: 7 }, { id: 3, nota: 10 }], 'nota'); expect(Object.keys(r).sort()).toEqual(['10', '7']); expect(r['10'].map((x) => x.id)).toEqual([1, 3]);",
      },
      {
        id: 'same-objects',
        description: 'Os grupos contêm os próprios objetos da lista',
        source: "const a = { k: 'x' }; expect(agruparPor([a], 'k')['x'][0] === a).toBe(true);",
      },
      {
        id: 'immutable',
        description: 'Não altera a lista recebida',
        source:
          "const lista = [{ k: 'b' }, { k: 'a' }]; agruparPor(lista, 'k'); expect(lista).toEqual([{ k: 'b' }, { k: 'a' }]);",
      },
    ],
    hints: [
      'Comece com const grupos: Record<string, T[]> = {}.',
      'Para cada item, a chave do grupo é String(item[chave]).',
      'Se o grupo ainda não existe, crie um array vazio antes de adicionar o item.',
    ],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `function agruparPor<T, K extends keyof T>(itens: readonly T[], chave: K): Record<string, T[]> {
  const grupos: Record<string, T[]> = {};
  for (const item of itens) {
    const grupo = String(item[chave]); // T[K] pode ser número, texto...
    (grupos[grupo] ??= []).push(item);
  }
  return grupos;
}`,
      },
      {
        type: 'paragraph',
        text: 'K extends keyof T garante, no editor, que só chaves existentes são aceitas: agruparPor(clientes, "idade") não compila se Cliente não tem idade. O resultado mantém o tipo dos itens (Record<string, Cliente[]>), sem any.',
      },
    ],
  },
  {
    id: 'generics-01-omit',
    kind: 'multiple-choice',
    title: 'Por que Omit<Cliente, "id">?',
    difficulty: 'intermediate',
    conceptIds: ['ts-utility-types'],
    prompt: [
      {
        type: 'paragraph',
        text: 'No exemplo, o formulário de cadastro usa type NovoCliente = Omit<Cliente, "id">. Qual é a vantagem em relação a escrever uma interface NovoCliente à mão, com nome, email e status?',
      },
    ],
    options: [
      {
        id: 'derived',
        text: 'NovoCliente acompanha Cliente: um campo novo em Cliente aparece no cadastro automaticamente, e o compilador aponta os formulários que precisam dele. E o id fica de fora, porque quem gera é o servidor.',
        explanation:
          'Correto. Tipos copiados à mão divergem em silêncio quando o modelo muda; tipos derivados mudam junto.',
      },
      {
        id: 'runtime',
        text: 'Omit remove o campo id dos objetos em runtime.',
        explanation:
          'Incorreto. Tipos não existem em runtime; Omit só muda o que o compilador aceita.',
      },
      {
        id: 'performance',
        text: 'O código fica mais rápido.',
        explanation: 'Incorreto. Tipos desaparecem na compilação; não há efeito em desempenho.',
      },
      {
        id: 'same',
        text: 'Nenhuma: são equivalentes para sempre.',
        explanation: 'Equivalentes só hoje. Quando Cliente mudar, a cópia manual fica para trás.',
      },
    ],
    correctOptionIds: ['derived'],
    hints: ['O que acontece com cada versão quando Cliente ganha um campo?'],
    solution: [
      { type: 'code', language: 'typescript', code: `type NovoCliente = Omit<Cliente, 'id'>;` },
    ],
  },
  {
    id: 'generics-01-any',
    kind: 'multiple-choice',
    title: 'O any que esconde o erro',
    difficulty: 'intermediate',
    conceptIds: ['ts-generics'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Na etapa de depuração, cliente.nmoe (erro de digitação) compila e quebra em runtime. Qual é a correção?',
      },
    ],
    options: [
      {
        id: 'generic',
        text: 'Tornar a função genérica: function primeiroItem<T>(lista: readonly T[]): T | undefined. O resultado passa a ser Cliente | undefined, e nmoe vira erro de compilação.',
        explanation:
          'Correto. Com o genérico, o tipo dos dados atravessa a função; com any, ele se perde e a verificação para ali.',
      },
      {
        id: 'unknown',
        text: 'Trocar any por unknown no retorno.',
        explanation:
          'Melhora a segurança (obriga a verificar antes de usar), mas joga fora a informação de que o item é um Cliente. O genérico preserva o tipo.',
      },
      {
        id: 'cast',
        text: 'Escrever primeiroItem(clientes) as Cliente.',
        explanation:
          'Resolve este uso, mas a função continua devolvendo any para todos os outros; e as é só uma afirmação.',
      },
      {
        id: 'lint-only',
        text: 'Nada: é só tomar cuidado ao digitar.',
        explanation: 'Incorreto. O objetivo do TypeScript é justamente pegar esse tipo de erro.',
      },
    ],
    correctOptionIds: ['generic'],
    hints: ['Qual opção preserva o tipo Cliente no resultado?'],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `function primeiroItem<T>(lista: readonly T[]): T | undefined {
  return lista[0];
}`,
      },
    ],
  },
  {
    id: 'generics-01-keyof',
    kind: 'multiple-choice',
    title: 'O que K extends keyof T garante?',
    difficulty: 'intermediate',
    conceptIds: ['ts-generics'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Em function ordenarPor<T, K extends keyof T>(itens: readonly T[], chave: K), o que acontece com ordenarPor(clientes, "idade"), se Cliente não tem idade?',
      },
    ],
    options: [
      {
        id: 'compile-error',
        text: 'Não compila (erro TS2345): "idade" não está em keyof Cliente.',
        explanation:
          'Correto. keyof Cliente é "id" | "nome" | "email" | "status"; qualquer outro texto é recusado antes de rodar.',
      },
      {
        id: 'runtime',
        text: 'Compila, e em runtime ordena por undefined.',
        explanation: 'Seria assim com chave: string. A restrição existe para evitar isso.',
      },
      {
        id: 'adds-key',
        text: 'O TypeScript acrescenta idade ao tipo Cliente.',
        explanation: 'Incorreto. Tipos não mudam por causa de uma chamada.',
      },
      {
        id: 'any',
        text: 'K vira any e a chamada passa.',
        explanation: 'Incorreto. K fica limitado às chaves de T.',
      },
    ],
    correctOptionIds: ['compile-error'],
    hints: ['Quais textos fazem parte de keyof Cliente?'],
    solution: [{ type: 'paragraph', text: 'Não compila: TS2345.' }],
  },
  {
    id: 'generics-01-record',
    kind: 'multiple-choice',
    title: 'O status novo e o Record',
    difficulty: 'intermediate',
    conceptIds: ['ts-utility-types'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O status de Cliente ganha "bloqueado". O que acontece com const rotulos: Record<Cliente["status"], string> = { ativo: "Ativo", inativo: "Inativo" }?',
      },
    ],
    options: [
      {
        id: 'error',
        text: 'Deixa de compilar (TS2741: falta a propriedade bloqueado), apontando o rótulo esquecido.',
        explanation:
          'Correto. Record com uma união de literais exige todas as chaves: o compilador encontra cada lugar que precisa tratar o novo status.',
      },
      {
        id: 'undefined',
        text: 'Compila; rotulos.bloqueado é undefined e a tela mostra vazio.',
        explanation: 'Seria assim com um objeto comum tipado como { [k: string]: string }.',
      },
      {
        id: 'default',
        text: 'O TypeScript preenche "bloqueado" com o nome da chave.',
        explanation: 'Incorreto. O compilador só verifica; não gera valores.',
      },
      {
        id: 'runtime-error',
        text: 'Compila e lança erro ao abrir a tela.',
        explanation: 'Incorreto. O erro aparece antes, na compilação.',
      },
    ],
    correctOptionIds: ['error'],
    hints: ['Record exige uma entrada para cada membro da união?'],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `const rotulos: Record<Cliente['status'], string> = {
  ativo: 'Ativo',
  inativo: 'Inativo',
  bloqueado: 'Bloqueado',
};`,
      },
    ],
  },
  {
    id: 'generics-01-infer',
    kind: 'predict-output',
    title: 'Qual é o tipo inferido?',
    difficulty: 'intermediate',
    conceptIds: ['ts-generics'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Digite o tipo de resultado, como o editor mostra ao passar o mouse.',
      },
    ],
    language: 'typescript',
    code: INFER_PREDICT_TS,
    acceptedAnswers: ['Cliente | undefined', 'undefined | Cliente'],
    explanation:
      'T é inferido como Cliente a partir da lista, e porId devolve T | undefined: find pode não encontrar nada.',
    commonMistakes: [
      {
        answer: 'Cliente',
        explanation: 'find pode não encontrar o id; por isso o retorno inclui undefined.',
      },
      { answer: 'any', explanation: 'O genérico preserva o tipo: T vira Cliente, não any.' },
      {
        answer: '{ id: number }',
        explanation:
          'A restrição limita o que T aceita, mas T continua sendo o tipo completo passado: Cliente.',
      },
    ],
    wrongAnswerGuidance:
      'Não é isso. Pense em que tipo T assume e no que find devolve quando não acha nada.',
    hints: ['A partir de qual argumento T é inferido?', 'find sempre encontra?'],
    solution: [{ type: 'paragraph', text: 'Cliente | undefined.' }],
  },
];
