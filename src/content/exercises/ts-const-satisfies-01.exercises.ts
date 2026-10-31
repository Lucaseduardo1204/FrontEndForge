import { Exercise } from '../../app/core/models/content.models';

export const TS_CONST_SATISFIES_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-ts-status-source',
    kind: 'code',
    language: 'typescript',
    title: 'Uma lista, três usos',
    difficulty: 'intermediate',
    conceptIds: ['ts-const-satisfies'],
    prompt: [
      {
        type: 'paragraph',
        text: 'A lista STATUS já está no editor. Use-a como fonte única: o tipo Status, a validação ehStatus, os rótulos e a contagem saem dela.',
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Como o laboratório avalia TypeScript',
        text: 'Os tipos são removidos antes de rodar: os testes avaliam o comportamento. A conferência dos tipos fica com o seu editor, como no projeto real.',
      },
    ],
    requirements: [
      'ehStatus(valor) devolve true só para os textos exatos da lista STATUS ("PAGO" é inválido).',
      'rotulo(status) devolve o rótulo de ROTULOS, que deve cobrir todos os status (use satisfies).',
      'contarPorStatus(pedidos) recebe uma lista desconhecida (unknown[]) e devolve a contagem de cada status, mais invalidos para itens sem um status válido (inclusive null e itens que não são objetos).',
      'Todos os status aparecem na contagem, mesmo com zero.',
    ],
    examples: [
      {
        input: "contarPorStatus([{ status: 'pago' }, { status: 'x' }, null])",
        output: '{ pendente: 0, pago: 1, cancelado: 0, invalidos: 2 }',
      },
    ],
    starterCode: `const STATUS = ['pendente', 'pago', 'cancelado'] as const;
type Status = (typeof STATUS)[number];

const ROTULOS = {
  pendente: 'Aguardando pagamento',
  pago: 'Pago',
  cancelado: 'Cancelado',
} satisfies Record<Status, string>;

function ehStatus(valor: unknown): valor is Status {
  // Seu código aqui
  return false;
}

function rotulo(status: Status): string {
  // Seu código aqui
  return '';
}

function contarPorStatus(pedidos: unknown[]): Record<Status | 'invalidos', number> {
  // Seu código aqui
  return { pendente: 0, pago: 0, cancelado: 0, invalidos: 0 };
}

console.log(contarPorStatus([{ status: 'pago' }, { status: 'x' }, null]));
`,
    tests: [
      {
        id: 'guard',
        description: 'ehStatus aceita só os textos exatos da lista',
        source:
          "expect(ehStatus('pago')).toBe(true); expect(ehStatus('cancelado')).toBe(true); for (const v of ['PAGO', 'estornado', '', 1, null, undefined, {}]) expect(ehStatus(v)).toBe(false);",
      },
      {
        id: 'label',
        description: 'rotulo devolve o rótulo de cada status',
        source:
          "expect(rotulo('pendente')).toBe('Aguardando pagamento'); expect(rotulo('pago')).toBe('Pago'); expect(rotulo('cancelado')).toBe('Cancelado');",
      },
      {
        id: 'count',
        description: 'Conta cada status e os inválidos',
        source:
          "expect(contarPorStatus([{ status: 'pago' }, { status: 'pago' }, { status: 'cancelado' }, { status: 'x' }, null, 'pago', { outro: 1 }])).toEqual({ pendente: 0, pago: 2, cancelado: 1, invalidos: 4 });",
      },
      {
        id: 'zeros',
        description: 'Lista vazia tem todos os status com zero',
        source:
          'expect(contarPorStatus([])).toEqual({ pendente: 0, pago: 0, cancelado: 0, invalidos: 0 });',
      },
      {
        id: 'source',
        description: 'A contagem acompanha a lista STATUS (fonte única)',
        source:
          'const chaves = Object.keys(contarPorStatus([])); expect(chaves.length).toBe(STATUS.length + 1); expect(STATUS.every((s) => chaves.includes(s))).toBe(true);',
      },
    ],
    hints: [
      'ehStatus: typeof valor === "string" e STATUS.includes (com um cast para readonly string[]).',
      'Para iniciar a contagem a partir da lista: Object.fromEntries(STATUS.map((s) => [s, 0])).',
      'Um item é válido se for um objeto não nulo cujo campo status passa em ehStatus.',
    ],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `const STATUS = ['pendente', 'pago', 'cancelado'] as const;
type Status = (typeof STATUS)[number];

const ROTULOS = {
  pendente: 'Aguardando pagamento',
  pago: 'Pago',
  cancelado: 'Cancelado',
} satisfies Record<Status, string>;

function ehStatus(valor: unknown): valor is Status {
  return typeof valor === 'string' && (STATUS as readonly string[]).includes(valor);
}

function rotulo(status: Status): string {
  return ROTULOS[status];
}

function contarPorStatus(pedidos: unknown[]): Record<Status | 'invalidos', number> {
  // a contagem nasce da lista: um status novo aparece sozinho
  const contagem = {
    ...(Object.fromEntries(STATUS.map((s) => [s, 0])) as Record<Status, number>),
    invalidos: 0,
  };
  for (const pedido of pedidos) {
    const status =
      typeof pedido === 'object' && pedido !== null && 'status' in pedido ? pedido.status : undefined;
    if (ehStatus(status)) contagem[status]++;
    else contagem.invalidos++;
  }
  return contagem;
}`,
      },
      {
        type: 'paragraph',
        text: 'Acrescentar "estornado" a STATUS agora muda o tipo, a validação e a contagem de uma vez, e o satisfies aponta o rótulo que falta. O cast em ehStatus é necessário porque includes de uma tupla readonly só aceita os próprios literais; o in narrowing no laço é a lição de narrowing aplicada a dados unknown.',
      },
    ],
  },
  {
    id: 'const-01-derived',
    kind: 'multiple-choice',
    title: 'Qual é o tipo?',
    difficulty: 'intermediate',
    conceptIds: ['ts-const-satisfies'],
    prompt: [
      {
        type: 'paragraph',
        text: "const TAMANHOS = ['P', 'M', 'G']; type Tamanho = (typeof TAMANHOS)[number]; Qual é o tipo Tamanho?",
      },
    ],
    options: [
      {
        id: 'string',
        text: 'string: sem as const, a lista é string[] e os valores exatos se perdem.',
        explanation:
          'Correto. Medido com o compilador: sem as const, a lista é string[]; com as const, vira readonly ["P", "M", "G"] e o tipo derivado é "P" | "M" | "G".',
      },
      {
        id: 'union',
        text: '"P" | "M" | "G".',
        explanation:
          'Seria assim com as const. Sem ele, o TypeScript amplia os literais para string, porque o array pode mudar.',
      },
      {
        id: 'tuple',
        text: 'readonly ["P", "M", "G"].',
        explanation: 'Esse seria o tipo da lista com as const, não de um item dela.',
      },
      {
        id: 'number',
        text: 'number, por causa do [number].',
        explanation:
          '[number] significa "o tipo dos itens acessados por índice numérico", não o tipo number.',
      },
    ],
    correctOptionIds: ['string'],
    hints: ['A lista foi declarada com as const?'],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `const TAMANHOS = ['P', 'M', 'G'] as const; // Tamanho = 'P' | 'M' | 'G'`,
      },
    ],
  },
  {
    id: 'const-01-missing-label',
    kind: 'multiple-choice',
    title: 'O status sem nome',
    difficulty: 'intermediate',
    conceptIds: ['ts-const-satisfies'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Na etapa de depuração, qual mudança faz o compilador apontar o rótulo que falta?',
      },
    ],
    options: [
      {
        id: 'satisfies',
        text: 'Trocar a anotação por satisfies Record<Status, string>.',
        explanation:
          'Correto. Medido: com satisfies Record<Status, string>, um objeto sem uma das chaves dá TS1360. Com Record<string, string>, qualquer chave é aceita, e a leitura de uma ausente compila.',
      },
      {
        id: 'keep',
        text: 'Manter Record<string, string> e acrescentar ?? "" na leitura.',
        explanation:
          'Troca "undefined" por um nome vazio; o rótulo continua faltando, agora sem nenhum aviso.',
      },
      {
        id: 'any',
        text: 'Tipar como any.',
        explanation: 'Desliga a verificação de vez.',
      },
      {
        id: 'test',
        text: 'Só um teste resolve; o compilador não tem como saber.',
        explanation:
          'Testes ajudam, mas aqui o compilador consegue apontar o erro antes, com o tipo certo.',
      },
    ],
    correctOptionIds: ['satisfies'],
    hints: ['Qual forma confere que todas as chaves de Status existem?'],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `const ROTULOS = {
  pendente: 'Aguardando pagamento',
  pago: 'Pago',
  cancelado: 'Cancelado',
} satisfies Record<Status, string>; // TS1360 enquanto faltar "estornado"`,
      },
    ],
  },
  {
    id: 'const-01-annotation',
    kind: 'multiple-choice',
    title: 'Anotação ou satisfies?',
    difficulty: 'intermediate',
    conceptIds: ['ts-const-satisfies'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Qual é a diferença entre const ROTAS: Record<string, string> = {...} e {...} satisfies Record<string, string>?',
      },
    ],
    options: [
      {
        id: 'inference',
        text: 'Com a anotação, o tipo de ROTAS passa a ser Record<string, string> e as chaves somem do tipo; com satisfies, o formato é conferido e o tipo inferido (com as chaves) é mantido.',
        explanation:
          'Correto. Medido: com a anotação, rotasAnotadas["perifl"] compila; com as const satisfies, ROTAS.perifl dá TS2551 com a sugestão de "perfil".',
      },
      {
        id: 'runtime',
        text: 'satisfies valida o objeto em tempo de execução.',
        explanation: 'Incorreto. satisfies é só de compilação; não gera código.',
      },
      {
        id: 'same',
        text: 'Nenhuma: são duas sintaxes para o mesmo resultado.',
        explanation: 'Incorreto. O tipo resultante é diferente.',
      },
      {
        id: 'readonly',
        text: 'satisfies torna o objeto somente leitura.',
        explanation: 'Incorreto. Quem torna somente leitura é as const.',
      },
    ],
    correctOptionIds: ['inference'],
    hints: ['Qual é o tipo de ROTAS em cada caso?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Anotação: o tipo declarado vence. satisfies: confere e mantém o inferido.',
      },
    ],
  },
  {
    id: 'const-01-satisfies-error',
    kind: 'multiple-choice',
    title: 'O que satisfies pega?',
    difficulty: 'intermediate',
    conceptIds: ['ts-const-satisfies'],
    prompt: [
      {
        type: 'paragraph',
        text: "type Status = 'pendente' | 'pago' | 'cancelado'. Qual destas linhas o compilador recusa?",
      },
    ],
    options: [
      {
        id: 'missing',
        text: "const r = { pendente: 'A', pago: 'P' } satisfies Record<Status, string>;",
        explanation:
          'Correto. Falta cancelado: o compilador acusou TS1360 (o valor não satisfaz o tipo).',
      },
      {
        id: 'complete',
        text: "const r = { pendente: 'A', pago: 'P', cancelado: 'C' } satisfies Record<Status, string>;",
        explanation: 'Compila: todas as chaves estão presentes.',
      },
      {
        id: 'complete-const',
        text: "const r = { pendente: 'A', pago: 'P', cancelado: 'C' } as const satisfies Record<Status, string>;",
        explanation: 'Compila, e mantém os valores exatos como literais somente leitura.',
      },
      {
        id: 'annotation-complete',
        text: "const r: Record<Status, string> = { pendente: 'A', pago: 'P', cancelado: 'C' };",
        explanation:
          'Compila. A anotação também exige todas as chaves; a diferença é que o tipo de r passa a ser o declarado.',
      },
    ],
    correctOptionIds: ['missing'],
    hints: ['Em qual delas falta uma chave de Status?'],
    solution: [{ type: 'paragraph', text: 'Só a primeira: falta cancelado.' }],
  },
  {
    id: 'const-01-keyof',
    kind: 'multiple-choice',
    title: 'keyof typeof',
    difficulty: 'intermediate',
    conceptIds: ['ts-const-satisfies'],
    prompt: [{ type: 'paragraph', text: 'No exemplo de rotas, qual é o tipo NomeRota?' }],
    options: [
      {
        id: 'keys',
        text: "'inicio' | 'perfil'",
        explanation:
          'Correto. typeof ROTAS é o tipo do objeto, e keyof devolve a união das chaves. Lido do compilador pelos testes.',
      },
      {
        id: 'values',
        text: "'/' | '/perfil'",
        explanation: 'Esses são os valores. Para eles: (typeof ROTAS)[keyof typeof ROTAS].',
      },
      {
        id: 'string',
        text: 'string',
        explanation: 'Seria assim com a anotação Record<string, string>, que apaga as chaves.',
      },
      {
        id: 'object',
        text: '{ inicio: string; perfil: string }',
        explanation: 'Esse é um tipo de objeto, não de chave.',
      },
    ],
    correctOptionIds: ['keys'],
    hints: ['keyof devolve chaves ou valores?'],
    solution: [{ type: 'paragraph', text: "NomeRota = 'inicio' | 'perfil'." }],
  },
];
