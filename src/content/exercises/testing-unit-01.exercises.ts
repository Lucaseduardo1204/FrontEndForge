import { Exercise } from '../../app/core/models/content.models';

/**
 * The lab exercise evaluates the student's tests: they must pass against the correct function
 * and fail against each mutant. Mutants and checks are verified in `lab-solutions.spec.ts`.
 */
const CORRECT = `(total, pessoas) => {
  if (!Number.isInteger(pessoas) || pessoas < 1) throw new RangeError('É preciso pelo menos uma pessoa.');
  const base = Math.floor(total / pessoas);
  const resto = total - base * pessoas;
  return Array.from({ length: pessoas }, (_, i) => (i < resto ? base + 1 : base));
}`;

export const SPLIT_BILL_MUTANTS: readonly {
  readonly id: string;
  readonly description: string;
  readonly code: string;
}[] = [
  {
    id: 'ignores-remainder',
    description: 'ignora os centavos que sobram',
    code: `(total, pessoas) => {
  if (!Number.isInteger(pessoas) || pessoas < 1) throw new RangeError('x');
  return Array.from({ length: pessoas }, () => Math.floor(total / pessoas));
}`,
  },
  {
    id: 'remainder-at-end',
    description: 'dá os centavos que sobram às últimas pessoas',
    code: `(total, pessoas) => {
  if (!Number.isInteger(pessoas) || pessoas < 1) throw new RangeError('x');
  const base = Math.floor(total / pessoas);
  const resto = total - base * pessoas;
  return Array.from({ length: pessoas }, (_, i) => (i >= pessoas - resto ? base + 1 : base));
}`,
  },
  {
    id: 'no-validation',
    description: 'aceita zero pessoas sem erro',
    code: `(total, pessoas) => {
  const base = Math.floor(total / pessoas);
  const resto = total - base * pessoas;
  return Array.from({ length: Math.max(pessoas, 0) }, (_, i) => (i < resto ? base + 1 : base));
}`,
  },
  {
    id: 'fractions',
    description: 'devolve partes com fração de centavo',
    code: `(total, pessoas) => {
  if (!Number.isInteger(pessoas) || pessoas < 1) throw new RangeError('x');
  return Array.from({ length: pessoas }, () => total / pessoas);
}`,
  },
  {
    id: 'rounds',
    description: 'arredonda cada parte (a soma pode passar do total)',
    code: `(total, pessoas) => {
  if (!Number.isInteger(pessoas) || pessoas < 1) throw new RangeError('x');
  return Array.from({ length: pessoas }, () => Math.round(total / pessoas));
}`,
  },
];

const mutantTest = (m: (typeof SPLIT_BILL_MUTANTS)[number]) => ({
  id: `kills-${m.id}`,
  description: `Seus testes falham com uma versão que ${m.description}`,
  source: `const comBug = ${m.code};
let falhou = false;
try { testar(comBug, expect); } catch { falhou = true; }
if (!falhou) {
  expect.fail('Seus testes passaram com uma versão que ${m.description}. Acrescente uma verificação que pegue esse bug.');
}`,
});

export const TESTING_UNIT_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-js-write-tests',
    kind: 'code',
    language: 'javascript',
    title: 'Escreva os testes de dividirConta',
    difficulty: 'intermediate',
    conceptIds: ['testing-unit'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Desta vez a função está pronta e você escreve os testes. Complete testar(dividirConta, expect): use expect para verificar o comportamento descrito nos requisitos. A avaliação roda os seus testes contra a função correta, onde precisam passar, e contra cinco versões com bugs, onde precisam falhar.',
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'expect disponível',
        text: 'expect funciona como no Vitest, com toBe, toEqual, toBeTruthy, toBeFalsy, toContain, toBeCloseTo e toThrow (este recebe uma função: expect(() => ...).toThrow()).',
      },
    ],
    requirements: [
      'dividirConta(totalCentavos, pessoas) devolve um array com uma parte por pessoa, em centavos inteiros.',
      'A soma das partes é sempre igual ao total.',
      'Quando a divisão não é exata, os centavos que sobram vão, um a um, para as primeiras pessoas: dividirConta(1000, 3) é [334, 333, 333].',
      'Com menos de uma pessoa, lança um erro.',
      'Seus testes precisam passar com a função correta e falhar com cada versão com bug.',
    ],
    examples: [
      { input: 'dividirConta(10000, 4)', output: '[2500, 2500, 2500, 2500]' },
      { input: 'dividirConta(1000, 3)', output: '[334, 333, 333]' },
      { input: 'dividirConta(1000, 0)', output: 'lança RangeError' },
    ],
    starterCode: `function testar(dividirConta, expect) {
  expect(dividirConta(10000, 4)).toEqual([2500, 2500, 2500, 2500]);
  // Acrescente aqui os testes que pegam os bugs mais prováveis.
}
`,
    tests: [
      {
        id: 'passes-correct',
        description: 'Seus testes passam com a função correta',
        source: `testar(${CORRECT}, expect);`,
      },
      ...SPLIT_BILL_MUTANTS.map(mutantTest),
    ],
    hints: [
      'Pense nos casos de borda: uma divisão com resto, um total menor que o número de pessoas, zero pessoas.',
      'Um teste da soma (reduce) em vários casos pega qualquer erro de arredondamento.',
      'Para o erro: expect(() => dividirConta(1000, 0)).toThrow().',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `function testar(dividirConta, expect) {
  // Divisão exata.
  expect(dividirConta(10000, 4)).toEqual([2500, 2500, 2500, 2500]);
  // Resto nas primeiras pessoas (pega "ignora o resto" e "resto no fim").
  expect(dividirConta(1000, 3)).toEqual([334, 333, 333]);
  // Propriedade: a soma é sempre o total (pega fração e arredondamento).
  for (const [total, pessoas] of [[1000, 3], [2000, 3], [1, 7]]) {
    expect(dividirConta(total, pessoas).reduce((a, b) => a + b, 0)).toBe(total);
  }
  // Entrada inválida.
  expect(() => dividirConta(1000, 0)).toThrow();
}`,
      },
      {
        type: 'paragraph',
        text: 'Cada verificação existe para pegar um tipo de erro. O exemplo [334, 333, 333] pega dois bugs sozinho; a soma em vários casos pega qualquer arredondamento; o toThrow pega a falta de validação.',
      },
    ],
  },
  {
    id: 'unit-01-behavior',
    kind: 'multiple-choice',
    title: 'Que teste escrever?',
    difficulty: 'intermediate',
    conceptIds: ['testing-unit'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Alguém vai refatorar dividirConta para usar um laço em vez de Array.from. Qual destes testes continua útil depois da refatoração?',
      },
    ],
    options: [
      {
        id: 'result',
        text: 'expect(dividirConta(1000, 3)).toEqual([334, 333, 333]);',
        explanation:
          'Correto. Ele verifica o resultado, que não muda com a refatoração. Se a nova versão errar, ele falha; se acertar, ele passa.',
      },
      {
        id: 'spy-internal',
        text: 'vi.spyOn(Array, "from") e conferir que foi chamado uma vez.',
        explanation:
          'Incorreto. Ele testa como a função foi escrita, não o que ela faz. Quebra com a refatoração mesmo que o resultado continue certo.',
      },
      {
        id: 'source-text',
        text: 'Conferir que o código-fonte da função contém Math.floor.',
        explanation:
          'Incorreto. Uma solução correta pode usar outra forma de calcular, e uma errada pode conter Math.floor.',
      },
      {
        id: 'no-throw',
        text: 'expect(() => dividirConta(1000, 3)).not.toThrow();',
        explanation: 'Pouco útil: passa com qualquer versão que devolva algo, inclusive [0, 0, 0].',
      },
    ],
    correctOptionIds: ['result'],
    hints: ['Qual teste depende só do que a função devolve?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Teste o comportamento observável. Detalhes de implementação mudam; o resultado esperado, não.',
      },
    ],
  },
  {
    id: 'unit-01-vacuous',
    kind: 'multiple-choice',
    title: 'Por que esse teste passa?',
    difficulty: 'intermediate',
    conceptIds: ['testing-unit'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O teste da etapa de depuração espera [0, 0, 0], um valor claramente errado, e mesmo assim passa. Por quê, e o que fazer?',
      },
    ],
    options: [
      {
        id: 'never-runs',
        text: 'O expect está dentro de um ouvinte de clique que nunca é disparado; nenhuma verificação roda. Disparar o clique e usar expect.hasAssertions() para o Vitest falhar se nenhum expect executar.',
        explanation:
          'Correto. Um teste sem nenhuma verificação executada passa. hasAssertions transforma esse silêncio em falha, e disparar o clique (botao.click()) faz a verificação acontecer.',
      },
      {
        id: 'vitest-bug',
        text: 'É um erro do Vitest com funções dentro de testes.',
        explanation: 'Incorreto. O Vitest só avalia os expect que de fato executam.',
      },
      {
        id: 'toequal',
        text: 'toEqual compara de forma frouxa; trocar por toBe.',
        explanation:
          'Incorreto. toBe falharia de qualquer jeito com arrays diferentes, se a linha rodasse. Ela não roda.',
      },
      {
        id: 'async',
        text: 'Falta async no teste.',
        explanation:
          'Incorreto. O problema não é esperar: o clique nunca acontece, então não há nada para esperar.',
      },
    ],
    correctOptionIds: ['never-runs'],
    hints: ['Quem chama a função passada ao addEventListener?'],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `it('divide a conta ao clicar em Dividir', () => {
  expect.hasAssertions();
  const botao = document.createElement('button');
  botao.addEventListener('click', () => {
    expect(dividirConta(1000, 3)).toEqual([334, 333, 333]);
  });
  botao.click();
});`,
      },
    ],
  },
  {
    id: 'unit-01-flaky',
    kind: 'multiple-choice',
    title: 'O teste que falha no dia 31',
    difficulty: 'intermediate',
    conceptIds: ['testing-unit', 'testing-doubles'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Um teste de estaVencida usa new Date() dentro da função e passa quase sempre, mas falha em alguns dias do mês. Qual é a melhor correção?',
      },
    ],
    options: [
      {
        id: 'inject',
        text: 'Receber a data atual como parâmetro (com new Date() como padrão) e passar datas fixas no teste.',
        explanation:
          'Correto. O teste passa a controlar o tempo e dá o mesmo resultado em qualquer dia. vi.useFakeTimers com vi.setSystemTime é a alternativa quando não dá para mudar a assinatura.',
      },
      {
        id: 'retry',
        text: 'Configurar o teste para tentar de novo quando falhar.',
        explanation:
          'Incorreto. Repetir esconde o problema: o teste continua dependendo do dia e pode passar por sorte.',
      },
      {
        id: 'skip',
        text: 'Marcar o teste como skip nos dias em que falha.',
        explanation:
          'Incorreto. O comportamento nesses dias deixa de ser testado, e são justamente os casos de borda.',
      },
      {
        id: 'range',
        text: 'Afrouxar a verificação para aceitar true ou false.',
        explanation: 'Incorreto. Um teste que aceita qualquer resultado não testa nada.',
      },
    ],
    correctOptionIds: ['inject'],
    hints: ['O que muda entre um dia e outro na execução do teste?'],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `function estaVencida(vencimento: Date, agora = new Date()): boolean {
  return agora > vencimento;
}`,
      },
    ],
  },
  {
    id: 'unit-01-spy',
    kind: 'multiple-choice',
    title: 'O que o espião verifica?',
    difficulty: 'intermediate',
    conceptIds: ['testing-doubles'],
    prompt: [
      {
        type: 'paragraph',
        text: 'No teste "registra cada divisão uma vez" da lição, por que usar vi.fn() no lugar do registro real?',
      },
    ],
    options: [
      {
        id: 'isolate',
        text: 'Para isolar a função do registro real (que poderia gravar em arquivo ou chamar a rede) e verificar exatamente como ele foi chamado: quantas vezes e com quais dados.',
        explanation:
          'Correto. O espião grava as chamadas, e toHaveBeenCalledOnce e toHaveBeenCalledWith verificam a interação que importa, sem efeitos colaterais.',
      },
      {
        id: 'faster-only',
        text: 'Só para o teste ficar mais rápido; a verificação seria a mesma.',
        explanation:
          'Incorreto. Sem o espião não daria para verificar com que dados o registro foi chamado.',
      },
      {
        id: 'mock-everything',
        text: 'Porque todo teste unitário deve substituir todas as funções por espiões.',
        explanation:
          'Incorreto. Substituir demais faz o teste verificar só a própria configuração. Use dublês nas fronteiras: rede, tempo, armazenamento, serviços externos.',
      },
      {
        id: 'coverage',
        text: 'Para aumentar a cobertura do registro.',
        explanation: 'Incorreto. O registro real nem é executado; o objetivo é o oposto.',
      },
    ],
    correctOptionIds: ['isolate'],
    hints: ['O que o espião permite verificar que o registro real não permitiria?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Dublês nas fronteiras do sistema; lógica de verdade no meio.',
      },
    ],
  },
  {
    id: 'unit-01-pyramid',
    kind: 'multiple-choice',
    title: 'A pirâmide de testes',
    difficulty: 'intermediate',
    conceptIds: ['testing-unit'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Uma equipe testa tudo com testes ponta a ponta no navegador: a suíte leva 40 minutos e falha de vez em quando sem motivo. O que a pirâmide de testes sugere?',
      },
    ],
    options: [
      {
        id: 'base',
        text: 'Mover a maior parte das verificações para testes unitários e de componentes, rápidos e estáveis, e manter poucos testes ponta a ponta para os fluxos críticos.',
        explanation:
          'Correto. Regras de negócio e casos de borda ficam na base, onde rodam em milissegundos. Os ponta a ponta confirmam que as partes funcionam juntas no navegador de verdade.',
      },
      {
        id: 'delete-e2e',
        text: 'Apagar todos os testes ponta a ponta.',
        explanation:
          'Incorreto. Eles pegam problemas que nenhum teste unitário pega (configuração, integração, navegador). São poucos, não zero.',
      },
      {
        id: 'more-e2e',
        text: 'Escrever mais testes ponta a ponta para compensar os instáveis.',
        explanation: 'Incorreto. Aumenta o tempo e a instabilidade.',
      },
      {
        id: 'nightly',
        text: 'Rodar a suíte só de madrugada.',
        explanation:
          'Incorreto. Os erros passam a ser descobertos um dia depois, longe da mudança que os causou.',
      },
    ],
    correctOptionIds: ['base'],
    hints: ['Qual tipo de teste é mais rápido e mais estável?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Muitos unitários, alguns de integração e componentes, poucos ponta a ponta.',
      },
    ],
  },
];
