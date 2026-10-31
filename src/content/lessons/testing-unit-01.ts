import { Lesson } from '../../app/core/models/content.models';

/** The function and its tests run in `src/content/testing-examples.spec.ts` (drift guard). */
export const SPLIT_BILL_TS = `/** Divide um total em centavos entre pessoas. A soma das partes é sempre o total. */
export function dividirConta(totalCentavos: number, pessoas: number): number[] {
  if (!Number.isInteger(pessoas) || pessoas < 1) {
    throw new RangeError('É preciso pelo menos uma pessoa.');
  }
  const base = Math.floor(totalCentavos / pessoas);
  const resto = totalCentavos - base * pessoas;
  // Os centavos que sobram vão, um a um, para as primeiras pessoas.
  return Array.from({ length: pessoas }, (_, i) => (i < resto ? base + 1 : base));
}`;

export const SPLIT_BILL_SPEC_TS = `import { dividirConta } from './dividir-conta';

// No Angular CLI com Vitest, describe, it, expect e vi já estão disponíveis.
describe('dividirConta', () => {
  it('divide igualmente quando o total é divisível', () => {
    expect(dividirConta(10000, 4)).toEqual([2500, 2500, 2500, 2500]);
  });

  it('dá os centavos que sobram às primeiras pessoas', () => {
    expect(dividirConta(1000, 3)).toEqual([334, 333, 333]);
  });

  it('a soma das partes é sempre o total', () => {
    for (const [total, pessoas] of [[1000, 3], [1, 7], [99999, 13]]) {
      const soma = dividirConta(total, pessoas).reduce((a, b) => a + b, 0);
      expect(soma).toBe(total);
    }
  });

  it('recusa menos de uma pessoa', () => {
    expect(() => dividirConta(1000, 0)).toThrow(RangeError);
  });
});`;

export const SPY_AND_TIME_TS = `// Dublê: uma função espiã no lugar do registro real.
it('registra cada divisão uma vez', () => {
  const registrar = vi.fn();

  dividirERegistrar(1000, 2, registrar);

  expect(registrar).toHaveBeenCalledOnce();
  expect(registrar).toHaveBeenCalledWith({ total: 1000, partes: [500, 500] });
});

// Tempo como parâmetro: o teste não depende do dia em que roda.
it('considera vencida a conta depois do vencimento', () => {
  const vencimento = new Date('2026-10-30T23:59:59');

  expect(estaVencida(vencimento, new Date('2026-10-31T00:00:00'))).toBe(true);
  expect(estaVencida(vencimento, new Date('2026-10-30T12:00:00'))).toBe(false);
});`;

/** Executed in `testing-examples.spec.ts`: it passes although its expectation is wrong. */
export const VACUOUS_TEST_TS = `it('divide a conta ao clicar em Dividir', () => {
  const botao = document.createElement('button');
  botao.addEventListener('click', () => {
    expect(dividirConta(1000, 3)).toEqual([0, 0, 0]); // valor errado
  });
});`;

export const TESTING_UNIT_01: Lesson = {
  id: 'testing-unit-01',
  moduleId: 'testing-foundations',
  title: 'Testes unitários: comportamento, casos de borda e dublês',
  summary:
    'Escrever testes que pegam bugs de verdade: verificar comportamento em vez de implementação, cobrir os casos de borda, isolar dependências e evitar testes que passam sem testar nada.',
  estimatedMinutes: 45,
  difficulty: 'intermediate',
  conceptIds: ['testing-unit', 'testing-doubles'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Um teste existe para falhar quando o código quebra. Parece óbvio, mas muitos testes não fazem isso: passam com o código errado, quebram quando ninguém mudou o comportamento, ou falham em alguns dias e passam em outros. Esses testes custam tempo e não dão segurança.',
        },
        {
          type: 'paragraph',
          text: 'Uma boa suíte de testes deixa você mudar o código com confiança: se algo quebrar, um teste avisa, com uma mensagem que diz o quê.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Organizar testes em preparar, agir e verificar.',
            'Testar o comportamento pela interface pública.',
            'Encontrar casos de borda que costumam esconder bugs.',
            'Usar dublês (espiões, valores fixos) para isolar dependências.',
            'Reconhecer testes que nunca falham e testes instáveis.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'O detector de fumaça',
      blocks: [
        {
          type: 'paragraph',
          text: 'Um detector de fumaça só tem valor se apita quando há fumaça. Você testa apertando o botão de teste ou aproximando fumaça de verdade, e não acreditando que ele funciona. Um detector que nunca apita é pior do que nenhum: dá uma segurança falsa.',
        },
        {
          type: 'paragraph',
          text: 'Com testes é igual. Antes de confiar num teste, veja ele falhar com o código errado. E um detector que apita toda vez que alguém cozinha, sem fumaça nenhuma, acaba desligado: é o teste instável, que todo mundo aprende a ignorar.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'O que torna um teste útil',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Pirâmide de testes: muitos testes unitários (rápidos, de funções e services), alguns de integração e componentes (partes trabalhando juntas) e poucos ponta a ponta (o navegador fazendo o fluxo inteiro). Quanto mais alto, mais lento e frágil.',
            'Estrutura de cada teste: preparar os dados, agir (chamar o que está sendo testado) e verificar o resultado. Um comportamento por teste, com um nome que o descreve.',
            'Teste pela interface pública e verifique resultados observáveis. Um teste que confere detalhes internos (qual função auxiliar foi chamada, o nome de uma variável) quebra em refatorações que não mudaram nada para quem usa.',
            'Casos de borda: vazio, zero, um, negativo, limites, arredondamento, valores repetidos e entradas inválidas. É onde os bugs moram.',
            'Dublês substituem dependências: um valor fixo (stub), uma implementação simples (fake) ou uma função que registra como foi chamada (spy, como vi.fn()).',
            'Testes determinísticos: nada de data atual, número aleatório, rede ou ordem entre testes. Receba a data como parâmetro, ou use os relógios falsos do Vitest (vi.useFakeTimers).',
            'Vermelho primeiro: escreva o teste, veja ele falhar pelo motivo certo, e só então faça passar. Um teste que nunca foi visto falhando pode estar testando nada.',
            'Cobertura mostra quais linhas os testes executaram, não se eles verificam algo. É um mapa do que falta, não uma nota de qualidade.',
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'O teste que passa sem verificar',
          text: 'Um expect dentro de um laço sobre uma lista vazia, ou dentro de um callback que nunca roda, não executa nenhuma verificação, e o teste passa. expect.hasAssertions() no início do teste faz o Vitest falhar quando nenhum expect foi executado.',
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: dividir a conta',
      blocks: [
        {
          type: 'paragraph',
          text: 'Dinheiro em centavos inteiros evita os erros de ponto flutuante (0,1 + 0,2 não é 0,3 em JavaScript). A regra difícil é o resto: 10 reais para 3 pessoas não divide igualmente.',
        },
        { type: 'code', language: 'typescript', caption: 'dividir-conta.ts', code: SPLIT_BILL_TS },
        {
          type: 'paragraph',
          text: 'Cada teste descreve um comportamento. O terceiro verifica uma propriedade que vale para qualquer entrada (a soma), o que pega erros que um exemplo isolado deixaria passar.',
        },
        {
          type: 'code',
          language: 'typescript',
          caption: 'dividir-conta.spec.ts',
          code: SPLIT_BILL_SPEC_TS,
        },
        {
          type: 'paragraph',
          text: 'Dependências e tempo entram como parâmetros, e os testes controlam os dois:',
        },
        { type: 'code', language: 'typescript', caption: 'dublês e tempo', code: SPY_AND_TIME_TS },
        {
          type: 'callout',
          tone: 'info',
          title: 'Estes testes são executados',
          text: 'A função e os testes acima rodam na suíte da plataforma. Ela também confere que esses testes falham contra cinco versões erradas da função (o resto ignorado, o resto no fim, a validação removida, partes com fração e arredondamento): é isso que mostra que eles protegem alguma coisa.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Monte no seu computador',
      blocks: [
        {
          type: 'code',
          language: 'shell',
          caption: 'Terminal (num projeto Angular 22)',
          code: `npx ng test
npx ng test --coverage   # na primeira vez, pede: npm install -D @vitest/coverage-v8`,
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Crie dividir-conta.ts e o spec ao lado e rode npx ng test.',
            'Quebre a função de propósito (troque i < resto por i >= resto) e veja quais testes falham e o que dizem.',
            'Apague o teste da soma e quebre a função com Math.round: algum teste ainda falha?',
            'Rode com --coverage e abra o relatório: 100% de linhas cobertas garante que os testes pegariam o erro anterior?',
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
          text: 'No laboratório, você escreve os testes. Eles são avaliados contra a função correta (precisam passar) e contra versões com bugs (precisam falhar).',
        },
      ],
      exerciseIds: ['lab-js-write-tests', 'unit-01-behavior'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: o teste que passa à toa',
      blocks: [
        {
          type: 'code',
          language: 'typescript',
          caption: 'Passa, apesar de o valor esperado estar errado',
          code: VACUOUS_TEST_TS,
        },
      ],
      exerciseIds: ['unit-01-vacuous'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Quando um bug aparece, escreva primeiro o teste que o reproduz (e falha); depois corrija. O teste fica como proteção contra a volta do bug: é o teste de regressão.',
            'Esta plataforma tem mais de 350 testes; muitos verificam o próprio conteúdo das lições (as soluções passam, o código inicial falha, os exemplos fazem o que o texto diz).',
            'O Angular CLI usa Vitest por padrão nas versões atuais; projetos mais antigos usam Karma com Jasmine. A forma de escrever (describe, it, expect) é praticamente a mesma.',
            'Mutation testing (como o Stryker) automatiza o que o exercício faz: cria versões com bugs do seu código e conta quantas os testes pegam.',
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
      exerciseIds: ['unit-01-flaky', 'unit-01-spy', 'unit-01-pyramid'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Um teste só vale se falhar com o código errado: veja ele falhar.',
            'Preparar, agir, verificar; um comportamento por teste.',
            'Comportamento pela interface pública, não detalhes internos.',
            'Casos de borda e propriedades (como a soma) pegam o que exemplos isolados deixam passar.',
            'Tempo, aleatoriedade e rede entram como parâmetros ou dublês.',
          ],
        },
      ],
    },
  ],
};
