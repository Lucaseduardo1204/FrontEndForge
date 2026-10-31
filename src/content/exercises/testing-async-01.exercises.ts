import { Exercise } from '../../app/core/models/content.models';

export const TESTING_ASYNC_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-js-fake-clock',
    kind: 'code',
    language: 'javascript',
    title: 'Um relógio falso',
    difficulty: 'advanced',
    conceptIds: ['testing-async', 'testing-doubles'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Escreva criarRelogio(), que devolve um relógio controlado pelo teste: o tempo só anda quando alguém chama avancar. É o que vi.useFakeTimers faz por baixo.',
      },
    ],
    requirements: [
      'agora() começa em 0.',
      'agendar(fn, ms) agenda fn para agora() + ms e devolve um id; repetir(fn, ms) agenda fn a cada ms, como setInterval.',
      'cancelar(id) remove um agendamento (inclusive um repetir).',
      'avancar(ms) executa, em ordem de horário, tudo que vence até agora() + ms; empates seguem a ordem em que foram agendados. Durante cada callback, agora() é o horário daquele callback.',
      'Callbacks agendados durante o avancar também rodam, se vencerem dentro do intervalo.',
      'No fim do avancar, agora() é o horário inicial + ms.',
      'pendentes() devolve quantos agendamentos ainda existem.',
    ],
    examples: [
      {
        input:
          'const r = criarRelogio(); r.agendar(() => console.log(r.agora()), 100); r.avancar(250);',
        output: 'imprime 100; depois, r.agora() é 250',
      },
    ],
    starterCode: `function criarRelogio() {
  // Seu código aqui
}

const relogio = criarRelogio();
relogio.agendar(() => console.log('rodou em', relogio.agora()), 100);
relogio.avancar(250);
console.log('agora', relogio.agora()); // esperado: rodou em 100, agora 250
`,
    tests: [
      {
        id: 'basic',
        description: 'Executa no horário certo, só quando o tempo avança',
        source:
          'const r = criarRelogio(); const log = []; r.agendar(() => log.push(r.agora()), 100); expect(r.agora()).toBe(0); r.avancar(99); expect(log).toEqual([]); r.avancar(1); expect(log).toEqual([100]); r.avancar(50); expect(r.agora()).toBe(150);',
      },
      {
        id: 'order',
        description: 'Ordem por horário; empates na ordem de agendamento',
        source:
          "const r = criarRelogio(); const log = []; r.agendar(() => log.push('c'), 300); r.agendar(() => log.push('a'), 100); r.agendar(() => log.push('b1'), 200); r.agendar(() => log.push('b2'), 200); r.avancar(1000); expect(log).toEqual(['a', 'b1', 'b2', 'c']); expect(r.agora()).toBe(1000);",
      },
      {
        id: 'nested',
        description: 'Agendamentos feitos durante o avancar rodam se vencerem no intervalo',
        source:
          "const r = criarRelogio(); const log = []; r.agendar(() => { log.push('primeiro ' + r.agora()); r.agendar(() => log.push('segundo ' + r.agora()), 50); }, 100); r.avancar(120); expect(log).toEqual(['primeiro 100']); r.avancar(30); expect(log).toEqual(['primeiro 100', 'segundo 150']);",
      },
      {
        id: 'cancel',
        description: 'cancelar remove o agendamento',
        source:
          "const r = criarRelogio(); const log = []; const id = r.agendar(() => log.push('x'), 100); r.agendar(() => log.push('y'), 100); r.cancelar(id); r.avancar(100); expect(log).toEqual(['y']); expect(r.pendentes()).toBe(0);",
      },
      {
        id: 'repeat',
        description: 'repetir funciona como setInterval: 3 vezes em 3500 ms, e continua pendente',
        source:
          'const r = criarRelogio(); const horarios = []; const id = r.repetir(() => horarios.push(r.agora()), 1000); r.avancar(3500); expect(horarios).toEqual([1000, 2000, 3000]); expect(r.pendentes()).toBe(1); r.cancelar(id); expect(r.pendentes()).toBe(0); r.avancar(5000); expect(horarios.length).toBe(3);',
      },
      {
        id: 'debounce',
        description: 'Um debounce testado com o relógio: uma chamada, 300 ms depois da última',
        source:
          "const r = criarRelogio(); const chamadas = []; let id; const digitar = (t) => { r.cancelar(id); id = r.agendar(() => chamadas.push(t), 300); }; digitar('a'); r.avancar(100); digitar('ab'); r.avancar(100); digitar('abc'); r.avancar(299); expect(chamadas).toEqual([]); r.avancar(1); expect(chamadas).toEqual(['abc']);",
      },
    ],
    hints: [
      'Guarde os agendamentos numa lista com { id, quando, ordem, fn, intervalo }.',
      'No avancar, repita: encontre o agendamento com menor quando (e menor ordem) que vence até o fim; remova, ajuste agora, execute.',
      'Para repetir, depois de executar, agende de novo para quando + intervalo, mantendo o mesmo id.',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `function criarRelogio() {
  let agora = 0;
  let proximoId = 1;
  let ordem = 0; // desempata horários iguais pela ordem de agendamento
  let agenda = [];

  const incluir = (id, fn, quando, intervalo) =>
    agenda.push({ id, fn, quando, intervalo, ordem: ordem++ });

  return {
    agora: () => agora,
    agendar(fn, ms) {
      const id = proximoId++;
      incluir(id, fn, agora + ms, null);
      return id;
    },
    repetir(fn, ms) {
      const id = proximoId++;
      incluir(id, fn, agora + ms, ms);
      return id;
    },
    cancelar(id) {
      agenda = agenda.filter((a) => a.id !== id);
    },
    pendentes: () => agenda.length,
    avancar(ms) {
      const fim = agora + ms;
      for (;;) {
        const vencidos = agenda.filter((a) => a.quando <= fim);
        if (vencidos.length === 0) break;
        const proximo = vencidos.reduce((m, a) =>
          a.quando < m.quando || (a.quando === m.quando && a.ordem < m.ordem) ? a : m,
        );
        agenda = agenda.filter((a) => a !== proximo);
        agora = proximo.quando;
        if (proximo.intervalo !== null) {
          incluir(proximo.id, proximo.fn, proximo.quando + proximo.intervalo, proximo.intervalo);
        }
        proximo.fn(); // pode agendar ou cancelar outros
      }
      agora = fim;
    },
  };
}`,
      },
      {
        type: 'paragraph',
        text: 'O laço procura sempre o próximo vencido, em vez de percorrer uma lista fixa: assim, callbacks que agendam outros dentro do intervalo também rodam, como no Vitest. O intervalo é reagendado antes de executar, para que um cancelar dentro do próprio callback funcione.',
      },
    ],
  },
  {
    id: 'async-tests-01-async-advance',
    kind: 'multiple-choice',
    title: 'O que vem depois do await',
    difficulty: 'intermediate',
    conceptIds: ['testing-async'],
    prompt: [
      {
        type: 'paragraph',
        text: 'No exemplo do rascunho, por que salvos ainda está vazio logo depois de vi.advanceTimersByTime(2000)?',
      },
    ],
    options: [
      {
        id: 'microtask',
        text: 'O callback do timer rodou até o await; a continuação é uma microtarefa, que só roda quando o teste também cede a vez. vi.advanceTimersByTimeAsync faz isso.',
        explanation:
          'Correto. Medido com o Vitest deste projeto: depois do avanço síncrono, a lista estava vazia; depois de await vi.advanceTimersByTimeAsync(0), continha o texto.',
      },
      {
        id: 'not-run',
        text: 'O timer não rodou: 2000 ms não foram suficientes.',
        explanation: 'Incorreto. O timer de 2000 ms vence exatamente em 2000.',
      },
      {
        id: 'real',
        text: 'Timers falsos não funcionam com funções async.',
        explanation: 'Funcionam; só é preciso deixar as promises andarem, com a versão Async.',
      },
      {
        id: 'mock',
        text: 'Falta vi.fn() na função de gravação.',
        explanation: 'Um mock não muda quando a continuação do await roda.',
      },
    ],
    correctOptionIds: ['microtask'],
    hints: ['Quando roda o código que vem depois de um await?'],
    solution: [
      { type: 'paragraph', text: 'Timers com promises: await vi.advanceTimersByTimeAsync(ms).' },
    ],
  },
  {
    id: 'async-tests-01-late-assertion',
    kind: 'multiple-choice',
    title: 'O teste que passa errado',
    difficulty: 'intermediate',
    conceptIds: ['testing-async'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Na etapa de depuração, o que está acontecendo, e qual é a correção?',
      },
    ],
    options: [
      {
        id: 'fake-timers',
        text: 'O teste termina antes do setTimeout; a asserção roda depois, fora dele. Use timers falsos: chame a função, avance 1000 ms e confira em seguida, sem setTimeout no teste.',
        explanation:
          'Correto. Medido: um teste assim passou, e o erro apareceu depois como "unhandled error", atribuído a outro teste. Com timers falsos, a asserção roda dentro do teste, e sem esperar 1 s de verdade.',
      },
      {
        id: 'longer',
        text: 'Aumentar o setTimeout do teste para 1100 ms, para dar folga.',
        explanation: 'Incorreto. O teste continua terminando antes de qualquer setTimeout.',
      },
      {
        id: 'async-it',
        text: 'Só marcar a função do teste como async.',
        explanation: 'Uma função async que não espera nada termina na hora do mesmo jeito.',
      },
      {
        id: 'retry',
        text: 'Configurar o Vitest para repetir testes que falham.',
        explanation: 'Repetir esconde o problema; aqui o teste nem falha onde deveria.',
      },
    ],
    correctOptionIds: ['fake-timers'],
    hints: ['Quando o teste termina, e quando a asserção roda?'],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `it('mostra o aviso depois de 1 s', () => {
  vi.useFakeTimers();
  mostrarAvisoComAtraso('Salvo!', 1000);
  vi.advanceTimersByTime(1000);
  expect(document.body.textContent).toContain('Salvo!');
  vi.useRealTimers();
});`,
      },
    ],
  },
  {
    id: 'async-tests-01-resolves',
    kind: 'multiple-choice',
    title: 'resolves sem await',
    difficulty: 'intermediate',
    conceptIds: ['testing-async'],
    prompt: [
      {
        type: 'paragraph',
        text: "it('carrega', () => { expect(carregar()).resolves.toEqual([...]); }); O que acontece nesta versão do Vitest?",
      },
    ],
    options: [
      {
        id: 'fails',
        text: 'O Vitest reprova o teste com a mensagem de que a asserção assíncrona não foi aguardada. A correção é await expect(carregar()).resolves... dentro de um teste async.',
        explanation:
          'Correto. Medido com o Vitest 5 deste projeto: o teste foi reprovado com "was not awaited". Versões mais antigas só avisavam, e o teste podia passar.',
      },
      {
        id: 'passes',
        text: 'O teste passa sempre, sem conferir nada.',
        explanation:
          'Já foi assim em versões antigas; o Vitest atual detecta a asserção não aguardada.',
      },
      {
        id: 'waits',
        text: 'O Vitest espera a promise sozinho.',
        explanation: 'Incorreto. Ele detecta o esquecimento, mas não espera: o teste é reprovado.',
      },
      {
        id: 'syntax',
        text: 'Erro de sintaxe: resolves só existe dentro de async.',
        explanation: 'Incorreto. A sintaxe é válida; o problema é de execução.',
      },
    ],
    correctOptionIds: ['fails'],
    hints: ['resolves devolve uma promise.'],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `it('carrega', async () => {\n  await expect(carregar()).resolves.toEqual([]);\n});`,
      },
    ],
  },
  {
    id: 'async-tests-01-system-time',
    kind: 'multiple-choice',
    title: 'O teste que falha no fim do mês',
    difficulty: 'intermediate',
    conceptIds: ['testing-async'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Um teste de "vence amanhã" usa new Date() e passa quase sempre, mas falha no último dia de cada mês. Qual é a melhor correção?',
      },
    ],
    options: [
      {
        id: 'fixed',
        text: 'Fixar o agora com vi.setSystemTime (ou receber a data como parâmetro) e incluir de propósito um caso de virada de mês.',
        explanation:
          'Correto. O teste passa a ser determinístico, e o caso de borda que só aparecia no fim do mês vira um teste explícito. Medido: com timers falsos, setSystemTime fixou a data e Date.now() avançou junto com os timers.',
      },
      {
        id: 'skip',
        text: 'Pular o teste no último dia do mês.',
        explanation: 'Esconde exatamente o caso que tem um bug.',
      },
      {
        id: 'tolerance',
        text: 'Aceitar resultados com um dia de diferença.',
        explanation: 'O teste deixa de conferir a regra.',
      },
      {
        id: 'utc',
        text: 'Trocar new Date() por Date.now().',
        explanation: 'É o mesmo relógio real; o teste continua dependendo do dia em que roda.',
      },
    ],
    correctOptionIds: ['fixed'],
    hints: ['O que muda entre uma execução e outra deste teste?'],
    solution: [
      { type: 'paragraph', text: 'Tempo nos testes: sempre controlado, nunca o relógio real.' },
    ],
  },
  {
    id: 'async-tests-01-cleanup',
    kind: 'multiple-choice',
    title: 'O teste seguinte travou',
    difficulty: 'intermediate',
    conceptIds: ['testing-async'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Depois de acrescentar um teste com vi.useFakeTimers() e um componente que usa setInterval, o teste seguinte, que espera 50 ms de verdade, passou a estourar o tempo limite. Por quê?',
      },
    ],
    options: [
      {
        id: 'leak',
        text: 'O teste novo não voltou aos timers reais: o seguinte espera um setTimeout falso que nunca anda. E o intervalo continua agendado. Use vi.useRealTimers() num afterEach e pare o intervalo no destroy.',
        explanation:
          'Correto. Estado que vaza de um teste para outro é uma causa clássica de instabilidade. Medido: depois de 3 execuções de um setInterval, vi.getTimerCount() ainda mostrava 1 timer pendente.',
      },
      {
        id: 'slow',
        text: 'A máquina ficou lenta; aumente o tempo limite.',
        explanation: 'Com timers falsos, nenhum tempo limite seria suficiente: o relógio não anda.',
      },
      {
        id: 'order',
        text: 'Os testes precisam rodar em ordem alfabética.',
        explanation: 'Incorreto. Testes não devem depender da ordem.',
      },
      {
        id: 'interval',
        text: 'setInterval não funciona em testes.',
        explanation: 'Funciona; precisa ser parado e controlado.',
      },
    ],
    correctOptionIds: ['leak'],
    hints: ['O que o teste novo deixou ligado?'],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `afterEach(() => {\n  vi.useRealTimers();\n});`,
      },
    ],
  },
];
