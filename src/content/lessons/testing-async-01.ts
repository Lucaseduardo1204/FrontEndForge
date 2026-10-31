import { Lesson } from '../../app/core/models/content.models';

/**
 * The tests shown here run as they are in `src/content/testing-async.spec.ts` (drift guard
 * included). Behaviours measured with this project's Vitest (D-066).
 */
export const DEBOUNCE_TEST_TS = `it('chama a busca uma vez, 300 ms depois da última tecla', () => {
  vi.useFakeTimers();
  const buscar = vi.fn();
  const digitar = debounce(buscar, 300);

  digitar('a');
  vi.advanceTimersByTime(100);
  digitar('ab');
  vi.advanceTimersByTime(100);
  digitar('abc');

  vi.advanceTimersByTime(299);
  expect(buscar).not.toHaveBeenCalled(); // ainda não

  vi.advanceTimersByTime(1);
  expect(buscar).toHaveBeenCalledTimes(1);
  expect(buscar).toHaveBeenCalledWith('abc');
  vi.useRealTimers();
});`;

export const ASYNC_TIMER_TEST_TS = `it('salva o rascunho depois de 2 s, inclusive o que vem depois do await', async () => {
  vi.useFakeTimers();
  const salvos: string[] = [];
  agendarRascunho('texto', async (t) => {
    await Promise.resolve(); // como uma gravação assíncrona
    salvos.push(t);
  });

  vi.advanceTimersByTime(2000);
  expect(salvos).toEqual([]); // o timer rodou, o que vem depois do await ainda não

  await vi.advanceTimersByTimeAsync(0);
  expect(salvos).toEqual(['texto']);
  vi.useRealTimers();
});`;

export const SYSTEM_TIME_TEST_TS = `it('marca a revisão como vencida no dia seguinte', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-01-31T12:00:00Z'));
  const revisao = { venceEm: new Date('2026-02-01T00:00:00Z') };

  expect(estaVencida(revisao)).toBe(false);
  vi.advanceTimersByTime(24 * 60 * 60 * 1000); // Date.now() avança junto
  expect(estaVencida(revisao)).toBe(true);
  vi.useRealTimers();
});`;

export const TESTING_ASYNC_01: Lesson = {
  id: 'testing-async-01',
  moduleId: 'testing-async-time',
  title: 'Testando código assíncrono e tempo',
  summary:
    'Testes que esperam o que precisam esperar, controlam o relógio em vez de dormir e não passam sem ter testado nada.',
  estimatedMinutes: 40,
  difficulty: 'intermediate',
  conceptIds: ['testing-async', 'testing-doubles'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Os testes mais traiçoeiros são os assíncronos: os que passam sem ter conferido nada, os que falham "às vezes" no CI e os que demoram porque esperam segundos de verdade. Debounce, timeouts, revisões que vencem amanhã e gravações em segundo plano estão em toda aplicação, e precisam de testes rápidos e determinísticos.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Fazer o teste esperar a promise (await ou return).',
            'Controlar o tempo com timers falsos em vez de esperar.',
            'Avançar timers que contêm promises.',
            'Fixar a data atual em testes que dependem do relógio.',
            'Reconhecer asserções que rodam depois do fim do teste.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'O controle remoto do tempo',
      blocks: [
        {
          type: 'paragraph',
          text: 'Um teste que espera 300 ms de verdade é como assistir a um filme inteiro para conferir uma cena. Timers falsos são o controle remoto: o tempo só anda quando o teste aperta o botão, e anda exatamente quanto ele pediu. Nada acontece "sozinho" entre uma linha e outra.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Como o Vitest lida com tempo e promises',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'O teste termina quando a função termina, ou quando a promise que ela devolve se resolve. Uma asserção dentro de um setTimeout que o teste não espera roda depois. Medido no Vitest deste projeto: o teste passou, e o erro apareceu depois como "unhandled error", atribuído a outro teste que estava rodando naquele momento.',
            'expect(promise).resolves e .rejects são assíncronos: precisam de await. Medido: sem await, o Vitest 5 reprovou o teste com a mensagem "was not awaited".',
            'vi.useFakeTimers() substitui setTimeout, setInterval e Date. vi.advanceTimersByTime(ms) avança o relógio e executa os timers vencidos, na ordem. Medido: um debounce de 300 ms não chamou nada em 299 ms e chamou exatamente uma vez em 300 ms.',
            'Timers com promises: advanceTimersByTime roda o callback, mas não o que vem depois de um await dentro dele. Medido: só vi.advanceTimersByTimeAsync executou essa continuação.',
            'vi.setSystemTime(data) fixa o "agora"; com timers falsos, Date.now() avança junto com advanceTimersByTime (medido: 60 000 ms depois de avançar um minuto).',
            'setInterval continua agendado depois do teste: medido, vi.getTimerCount() mostrou 1 timer pendente depois de 3 execuções. Sempre volte com vi.useRealTimers() (ou num afterEach), e pare intervalos no código que os cria.',
            'Esperar de verdade custa: um await de 300 ms levou 301 ms. Multiplique por centenas de testes, e some a instabilidade em máquinas lentas do CI.',
          ],
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: debounce, rascunho e revisão vencida',
      blocks: [
        { type: 'code', language: 'typescript', caption: 'busca.spec.ts', code: DEBOUNCE_TEST_TS },
        {
          type: 'code',
          language: 'typescript',
          caption: 'rascunho.spec.ts',
          code: ASYNC_TIMER_TEST_TS,
        },
        {
          type: 'code',
          language: 'typescript',
          caption: 'revisao.spec.ts',
          code: SYSTEM_TIME_TEST_TS,
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Estes testes rodam',
          text: 'Os três testes acima rodam como estão na suíte desta plataforma, com o Vitest do projeto, junto com as medições da explicação.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Experimente no seu projeto',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Num teste, coloque expect(1).toBe(2) dentro de um setTimeout de 0 ms e rode a suíte: onde o erro é atribuído?',
            'Remova o await de um expect(...).resolves e veja a mensagem.',
            'No teste do debounce, troque 299 por 300 e veja qual asserção falha.',
            'Remova vi.useRealTimers() de um teste e veja se o seguinte, que usa tempo real, ainda funciona.',
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
          text: 'No laboratório, implemente um relógio falso, o mesmo mecanismo que vi.useFakeTimers usa. Depois, responda sobre timers com promises.',
        },
      ],
      exerciseIds: ['lab-js-fake-clock', 'async-tests-01-async-advance'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: o teste que passa errado',
      blocks: [
        {
          type: 'code',
          language: 'typescript',
          caption: 'O teste passa, mas a suíte termina com um erro atribuído a outro teste',
          code: `it('mostra o aviso depois de 1 s', () => {
  mostrarAvisoComAtraso('Salvo!', 1000);
  setTimeout(() => {
    expect(document.body.textContent).toContain('Salvo!');
  }, 1000);
});`,
        },
      ],
      exerciseIds: ['async-tests-01-late-assertion'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Os testes da revisão espaçada desta plataforma recebem a data atual como parâmetro, o que dispensa até os timers falsos: funções puras são as mais fáceis de testar no tempo.',
            'No Angular com zoneless, os testes usam await fixture.whenStable() para esperar a atualização da view; o mesmo princípio: esperar o que é assíncrono.',
            'Testes instáveis ("flaky") quase sempre vêm de tempo real, ordem não garantida ou estado que vaza de um teste para outro.',
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
      exerciseIds: [
        'async-tests-01-resolves',
        'async-tests-01-system-time',
        'async-tests-01-cleanup',
      ],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Espere o que é assíncrono: await ou return.',
            'resolves e rejects precisam de await.',
            'Tempo: timers falsos, nunca espera real.',
            'Promise dentro de timer: advanceTimersByTimeAsync.',
            'Data atual: setSystemTime, ou receba a data como parâmetro.',
            'Volte aos timers reais e pare intervalos no fim.',
          ],
        },
      ],
    },
  ],
};
