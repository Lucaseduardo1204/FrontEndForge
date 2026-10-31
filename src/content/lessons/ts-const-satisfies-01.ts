import { Lesson } from '../../app/core/models/content.models';

/** Type-checked and executed in `src/content/ts-examples.spec.ts` (D-065). */
export const STATUS_TS = `const STATUS = ['pendente', 'pago', 'cancelado'] as const;
type Status = (typeof STATUS)[number]; // 'pendente' | 'pago' | 'cancelado'

// A lista serve para o tipo e para a validação em tempo de execução.
function ehStatus(valor: unknown): valor is Status {
  return typeof valor === 'string' && (STATUS as readonly string[]).includes(valor);
}

const ROTULOS = {
  pendente: 'Aguardando pagamento',
  pago: 'Pago',
  cancelado: 'Cancelado',
} satisfies Record<Status, string>; // esquecer um status é erro de compilação`;

export const ROUTES_TS = `// Anotação: o tipo declarado vence. Qualquer chave é aceita.
const rotasAnotadas: Record<string, string> = { inicio: '/', perfil: '/perfil' };

// as const + satisfies: confere o formato e mantém as chaves e valores exatos.
const ROTAS = {
  inicio: '/',
  perfil: '/perfil',
} as const satisfies Record<string, \`/\${string}\`>;

type NomeRota = keyof typeof ROTAS; // 'inicio' | 'perfil'`;

/** Each row is compiled after STATUS_TS + ROUTES_TS; the code column is asserted. */
export const TYPE_ERROR_ROWS: readonly (readonly [string, string, string])[] = [
  ["STATUS.push('estornado');", 'TS2339', 'Tupla readonly: push não existe.'],
  [
    "const r = { pendente: 'A', pago: 'P' } satisfies Record<Status, string>;",
    'TS1360',
    'Falta cancelado.',
  ],
  [
    "const r: Record<Status, string> = { pendente: 'A', pago: 'P', cancelado: 'C', estornado: 'E' };",
    'TS2353',
    'estornado não é um Status.',
  ],
  ['const url = ROTAS.perifl;', 'TS2551', 'Chave com erro de digitação, com sugestão de perfil.'],
  ["const url = rotasAnotadas['perifl'];", '—', 'Compila: a anotação aceita qualquer chave.'],
];

export const TS_CONST_SATISFIES_01: Lesson = {
  id: 'ts-const-satisfies-01',
  moduleId: 'ts-types-from-data',
  title: 'Tipos a partir dos dados: as const, satisfies e keyof typeof',
  summary:
    'Escrever a lista de valores uma vez e derivar dela o tipo, a validação e os rótulos, com o compilador avisando quando algo fica de fora.',
  estimatedMinutes: 35,
  difficulty: 'intermediate',
  conceptIds: ['ts-const-satisfies'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Um novo status "estornado" entra no sistema. Alguém atualiza o tipo, esquece a lista de validação, esquece os rótulos da tela, e a interface mostra "undefined" no lugar do nome. Quando tipo, lista e mapa são escritos separadamente, eles divergem. O TypeScript permite escrever os valores uma vez e derivar o resto, e reclamar quando algo fica incompleto.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Preservar valores exatos com as const.',
            'Derivar tipos de valores com typeof, keyof e [number].',
            'Conferir um objeto contra um tipo sem perder a inferência, com satisfies.',
            'Saber quando a anotação de tipo esconde erros.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'O cadastro único',
      blocks: [
        {
          type: 'paragraph',
          text: 'Numa empresa organizada, a lista de produtos existe num só cadastro, e o catálogo, o estoque e a nota fiscal leem dele. Ninguém mantém três listas à mão. as const e typeof fazem o código ler o tipo do cadastro; satisfies é o conferente que verifica se cada departamento cobriu todos os itens.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Como cada recurso se comporta',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Sem as const, ["pendente", "pago"] é string[]: os valores exatos se perdem. Com as const, vira readonly ["pendente", "pago"] (uma tupla somente leitura).',
            '(typeof LISTA)[number] é a união dos itens: o tipo nasce da lista, e a lista continua disponível em tempo de execução para validar dados de fora.',
            'keyof typeof OBJETO é a união das chaves de um objeto.',
            'Anotar (const x: Tipo = ...) faz o tipo declarado vencer: o valor perde os detalhes. Com Record<string, string>, qualquer chave é aceita, inclusive as escritas errado.',
            'satisfies Tipo confere o valor contra o tipo (chaves faltando, chaves a mais, formato) e mantém o tipo inferido. Medido: com Record<Status, string>, os valores ficaram string; com um tipo de template como `/${string}`, os literais "/" e "/perfil" foram mantidos.',
            'as const satisfies Tipo combina as duas coisas: valores exatos e somente leitura, conferidos contra o formato.',
            'Tipos de template (`on${Capitalize<"click" | "focus">}`) geram uniões de strings: medido, "onClick" | "onFocus".',
          ],
        },
        {
          type: 'table',
          caption: 'Erros medidos pelo compilador (strict) com o código da etapa seguinte',
          headers: ['Código', 'Resultado', 'Por quê'],
          rows: TYPE_ERROR_ROWS.map(([codigo, resultado, motivo]) => [codigo, resultado, motivo]),
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: status de pedido e rotas',
      blocks: [
        { type: 'code', language: 'typescript', caption: 'status.ts', code: STATUS_TS },
        { type: 'code', language: 'typescript', caption: 'rotas.ts', code: ROUTES_TS },
        {
          type: 'callout',
          tone: 'info',
          title: 'Este código é verificado',
          text: 'Os testes da plataforma compilam os dois trechos em modo strict, leem os tipos inferidos (Status, NomeRota, ROTAS) do próprio compilador, compilam cada linha da tabela de erros e executam ehStatus com dados válidos e inválidos.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Experimente no editor',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Acrescente "estornado" à lista STATUS: em quais linhas o editor passa a apontar erro?',
            'Troque satisfies por uma anotação (const ROTULOS: Record<Status, string>) e passe o mouse sobre ROTULOS.pago.',
            'Remova o as const da lista e veja o que acontece com o tipo Status.',
            'Digite ROTAS. e veja o autocompletar com e sem satisfies.',
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
          text: 'No laboratório, use uma lista com as const como fonte única para validar e contar status vindos de uma API. Depois, responda sobre o tipo derivado.',
        },
      ],
      exerciseIds: ['lab-ts-status-source', 'const-01-derived'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: o status sem nome',
      blocks: [
        {
          type: 'code',
          language: 'typescript',
          caption:
            'Depois de acrescentar "estornado" a STATUS, a tela mostra "undefined" no lugar do nome',
          code: `const ROTULOS: Record<string, string> = {
  pendente: 'Aguardando pagamento',
  pago: 'Pago',
  cancelado: 'Cancelado',
};

const rotulo = (s: Status) => ROTULOS[s]; // compila; em tempo de execução, undefined para "estornado"`,
        },
      ],
      exerciseIds: ['const-01-missing-label'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Mapas de rotas, chaves de tradução, cores de status e permissões ficam completos e com autocompletar quando definidos com as const satisfies.',
            'A lista em tempo de execução permite validar respostas de API (lição de narrowing) com o mesmo valor que gera o tipo.',
            'Nesta plataforma, os tipos de etapa de lição e de exercício são uniões; mapas como os ícones por tipo de etapa podem ser conferidos com satisfies.',
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
      exerciseIds: ['const-01-annotation', 'const-01-satisfies-error', 'const-01-keyof'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'as const: valores exatos e somente leitura.',
            '(typeof LISTA)[number] e keyof typeof OBJETO derivam tipos de valores.',
            'Anotação: o tipo declarado vence e pode esconder erros.',
            'satisfies: confere sem perder a inferência.',
            'Uma fonte única para tipo, validação e rótulos.',
          ],
        },
      ],
    },
  ],
};
