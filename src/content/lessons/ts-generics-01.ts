import { Lesson } from '../../app/core/models/content.models';

/**
 * Type-checked by the TypeScript compiler of this project in `src/content/ts-examples.spec.ts`:
 * the base compiles, and each "não compila" snippet fails with the error code it claims.
 */
export const GENERICS_BASE_TS = `interface Cliente {
  id: number;
  nome: string;
  email: string;
  status: 'ativo' | 'inativo';
}

/** Funciona com uma lista de qualquer tipo e devolve o mesmo tipo. */
function primeiro<T>(lista: readonly T[]): T | undefined {
  return lista[0];
}

/** Restrição: T precisa ter id numérico. */
function porId<T extends { id: number }>(itens: readonly T[], id: number): T | undefined {
  return itens.find((item) => item.id === id);
}

/** K só pode ser uma chave que existe em T. */
function ordenarPor<T, K extends keyof T>(itens: readonly T[], chave: K): T[] {
  return [...itens].sort((a, b) => (a[chave] < b[chave] ? -1 : a[chave] > b[chave] ? 1 : 0));
}

/** Utility types: tipos novos derivados de Cliente, sem repetir campos. */
type NovoCliente = Omit<Cliente, 'id'>;           // o servidor gera o id
type AlteracaoCliente = Partial<NovoCliente>;     // edição: qualquer subconjunto
type ResumoCliente = Pick<Cliente, 'id' | 'nome'>;
const rotulos: Record<Cliente['status'], string> = { ativo: 'Ativo', inativo: 'Inativo' };

/** Tipo genérico: o formato da resposta paginada vale para qualquer recurso. */
interface Pagina<T> {
  itens: T[];
  total: number;
}

const clientes: Cliente[] = [
  { id: 2, nome: 'Bruno', email: 'bruno@exemplo.com', status: 'ativo' },
  { id: 1, nome: 'Ana', email: 'ana@exemplo.com', status: 'inativo' },
];
const ana = porId(clientes, 1);                     // Cliente | undefined
const ordenados = ordenarPor(clientes, 'nome');     // Cliente[]
const novo: NovoCliente = { nome: 'Carla', email: 'carla@exemplo.com', status: 'ativo' };
const alteracao: AlteracaoCliente = { email: 'novo@exemplo.com' };
const resumo: ResumoCliente = { id: 1, nome: 'Ana' };
const pagina: Pagina<ResumoCliente> = { itens: [resumo], total: 1 };`;

/** Each snippet is appended to the base and must fail with the given TypeScript error code. */
export const GENERICS_ERRORS: readonly {
  readonly snippet: string;
  readonly code: number;
  readonly why: string;
}[] = [
  {
    snippet: `const nome: string | undefined = primeiro([1, 2, 3]);`,
    code: 2322,
    why: 'T foi inferido como number: o resultado é number | undefined, não string.',
  },
  {
    snippet: `porId(['a'], 1);`,
    code: 2322,
    why: 'O elemento "a" (string) não satisfaz a restrição { id: number }: o erro aponta para cada item da lista.',
  },
  {
    snippet: `ordenarPor(clientes, 'idade');`,
    code: 2345,
    why: '"idade" não é uma chave de Cliente (keyof Cliente).',
  },
  {
    snippet: `const errado: NovoCliente = { id: 3, nome: 'D', email: 'd@x.com', status: 'ativo' };`,
    code: 2353,
    why: 'NovoCliente não tem id: o campo foi removido com Omit.',
  },
  {
    snippet: `const incompleto: Record<Cliente['status'], string> = { ativo: 'Ativo' };`,
    code: 2741,
    why: 'Record exige uma entrada para cada status; falta inativo.',
  },
];

export const TS_GENERICS_01: Lesson = {
  id: 'ts-generics-01',
  moduleId: 'ts-generics-utilities',
  title: 'Generics e utility types',
  summary:
    'Funções e tipos que funcionam com qualquer dado sem perder a verificação, e tipos derivados que acompanham o modelo quando ele muda.',
  estimatedMinutes: 40,
  difficulty: 'intermediate',
  conceptIds: ['ts-generics', 'ts-utility-types'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Uma função que busca por id, uma resposta paginada da API, um formulário de edição: essas peças se repetem para clientes, produtos, pedidos. Sem generics, cada uma é reescrita para cada tipo, ou usa any e perde toda a verificação. E quando o modelo Cliente ganha um campo, tipos copiados à mão ficam desatualizados em silêncio.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Escrever funções e tipos genéricos que preservam o tipo dos dados.',
            'Restringir o que um genérico aceita (extends, keyof).',
            'Derivar tipos com Partial, Pick, Omit, Readonly e Record.',
            'Ler os erros que o compilador mostra quando a restrição não é cumprida.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'A caixa com etiqueta',
      blocks: [
        {
          type: 'paragraph',
          text: 'Uma caixa de mudança genérica serve para qualquer coisa, mas você escreve na etiqueta o que vai dentro: "louça". Quem abre sabe o que esperar. any é uma caixa sem etiqueta: cabe tudo, e ninguém sabe o que vai encontrar. Um genérico é a caixa com etiqueta que o próprio TypeScript preenche ao ver o que você colocou.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Parâmetros de tipo, restrições e tipos derivados',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'function primeiro<T>(lista: readonly T[]): T | undefined declara um parâmetro de tipo T. Ao chamar com números, T vira number; com clientes, Cliente. Normalmente o TypeScript infere T sozinho.',
            'Restrições: <T extends { id: number }> aceita qualquer tipo que tenha id numérico; o resto é recusado na compilação.',
            'keyof T é a união das chaves de T. <K extends keyof T> garante que só chaves existentes são aceitas, e T[K] é o tipo do valor daquela chave.',
            'Tipos genéricos: interface Pagina<T> { itens: T[]; total: number } descreve qualquer resposta paginada.',
            'Partial<T> deixa tudo opcional; Required<T>, tudo obrigatório; Readonly<T>, tudo somente leitura.',
            'Pick<T, "a" | "b"> escolhe campos; Omit<T, "id"> remove campos. Use para o formato de criação (sem id) e de resumo.',
            'Record<Chaves, Valor> cria um objeto com uma entrada para cada chave; com uma união de literais, esquecer uma chave é erro de compilação.',
            'Tipos derivados acompanham a origem: um campo novo em Cliente aparece em NovoCliente e em AlteracaoCliente sem você editar nada.',
            'Generics não existem em runtime, como todos os tipos: não validam dados externos (lição de narrowing).',
          ],
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: utilitários de um cadastro',
      blocks: [
        { type: 'code', language: 'typescript', caption: 'clientes.ts', code: GENERICS_BASE_TS },
        {
          type: 'paragraph',
          text: 'E os erros que o compilador mostra quando as regras não são cumpridas, cada um com o código de erro do TypeScript:',
        },
        {
          type: 'table',
          caption: 'Não compila',
          headers: ['Código', 'Erro', 'Por quê'],
          rows: GENERICS_ERRORS.map((e) => [e.snippet, `TS${e.code}`, e.why]),
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Este código é verificado',
          text: 'Os testes da plataforma passam o exemplo pelo compilador TypeScript do projeto (sem nenhum erro) e cada linha da tabela junto com ele (falhando exatamente com o código indicado).',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Teste no seu editor',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Cole o exemplo no VS Code ou no TypeScript Playground e passe o mouse sobre ana, ordenados e novo para ver os tipos inferidos.',
            'Acrescente o campo telefone: string a Cliente. Onde o compilador passa a reclamar? NovoCliente pede telefone sozinho?',
            'Troque primeiro<T> por uma versão com any e veja o tipo do resultado.',
            'Cole cada linha da tabela de erros e leia a mensagem completa.',
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
          text: 'No laboratório, escreva uma função genérica de agrupamento. Lá os tipos são removidos antes de rodar, então os testes conferem o comportamento. Depois, responda sobre Omit.',
        },
      ],
      exerciseIds: ['lab-ts-group-by', 'generics-01-omit'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: a função que devolve any',
      blocks: [
        {
          type: 'code',
          language: 'typescript',
          caption: 'Compila, mas o erro só aparece em runtime',
          code: `function primeiroItem(lista: any[]): any {
  return lista[0];
}

const cliente = primeiroItem(clientes);
console.log(cliente.nmoe.toUpperCase()); // erro de digitação: o compilador não avisa`,
        },
      ],
      exerciseIds: ['generics-01-any'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'O próprio Angular é genérico: signal<T>, input<T>(), HttpClient.get<T>(), httpResource<T>(), FormControl<T>.',
            'Um service genérico de CRUD costuma ser uma abstração prematura (lição de arquitetura); funções utilitárias genéricas pequenas, como porId, quase sempre valem a pena.',
            'Os modelos desta plataforma derivam tipos assim: o tipo Exercise é uma união de tipos com um campo kind, e as funções do motor de aprendizagem recebem o catálogo inteiro tipado.',
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
      exerciseIds: ['generics-01-keyof', 'generics-01-record', 'generics-01-infer'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Generics preservam o tipo; any o descarta.',
            'extends restringe o que é aceito; keyof limita a chaves existentes.',
            'Omit e Pick para formatos de criação e resumo; Partial para edição.',
            'Record com união de literais obriga a cobrir todos os casos.',
            'Tipos derivados acompanham o modelo; nenhum deles valida dados em runtime.',
          ],
        },
        { type: 'paragraph', text: 'Na Biblioteca: "Narrowing em TypeScript".' },
      ],
    },
  ],
};
