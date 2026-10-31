import { Exercise } from '../../app/core/models/content.models';

export const ANGULAR_SIGNALS_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-js-mini-signals',
    kind: 'code',
    language: 'javascript',
    title: 'Signals do zero',
    difficulty: 'advanced',
    conceptIds: ['angular-signals'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Implemente signal(inicial) e computed(fn) com a mesma ideia do Angular: o computed descobre sozinho de quais signals depende, lendo-os. Não é preciso implementar effect.',
      },
    ],
    requirements: [
      'signal(v) devolve uma função de leitura, com .set(novo) e .update(fn).',
      'set com um valor igual ao atual (Object.is) não invalida nada.',
      'computed(fn) devolve uma função de leitura; fn só roda quando alguém lê (preguiçoso).',
      'Leituras seguidas sem mudança devolvem o valor guardado, sem rodar fn (memoizado).',
      'Quando um signal lido na última execução muda, a próxima leitura recalcula; computed pode depender de computed.',
      'Dependências são dinâmicas: um signal que não foi lido na última execução não provoca recálculo.',
    ],
    examples: [
      {
        input:
          'const a = signal(2); const dobro = computed(() => a() * 2); dobro(); a.set(5); dobro();',
        output: '4, depois 10',
      },
    ],
    starterCode: `function signal(inicial) {
  // Seu código aqui
}

function computed(fn) {
  // Seu código aqui
}

const a = signal(2);
const dobro = computed(() => a() * 2);
console.log(dobro()); // esperado: 4
a.set(5);
console.log(dobro()); // esperado: 10
`,
    tests: [
      {
        id: 'signal',
        description: 'signal lê, set e update',
        source:
          'const s = signal(1); expect(s()).toBe(1); s.set(5); expect(s()).toBe(5); s.update((v) => v + 1); expect(s()).toBe(6);',
      },
      {
        id: 'lazy-memo',
        description: 'computed é preguiçoso e memoizado',
        source:
          'let execucoes = 0; const a = signal(2); const dobro = computed(() => { execucoes++; return a() * 2; }); expect(execucoes).toBe(0); expect(dobro()).toBe(4); expect(dobro()).toBe(4); expect(execucoes).toBe(1);',
      },
      {
        id: 'recompute',
        description: 'Recalcula depois de uma mudança, e só na leitura',
        source:
          'let execucoes = 0; const a = signal(2); const dobro = computed(() => { execucoes++; return a() * 2; }); dobro(); a.set(5); expect(execucoes).toBe(1); expect(dobro()).toBe(10); expect(execucoes).toBe(2);',
      },
      {
        id: 'same-value',
        description: 'set com o mesmo valor não provoca recálculo',
        source:
          'let execucoes = 0; const a = signal(2); const dobro = computed(() => { execucoes++; return a() * 2; }); dobro(); a.set(2); dobro(); expect(execucoes).toBe(1);',
      },
      {
        id: 'chain',
        description: 'computed pode depender de computed',
        source:
          'const preco = signal(10); const qtd = signal(2); const subtotal = computed(() => preco() * qtd()); const comFrete = computed(() => subtotal() + 5); expect(comFrete()).toBe(25); qtd.set(3); expect(comFrete()).toBe(35); preco.set(1); expect(comFrete()).toBe(8);',
      },
      {
        id: 'dynamic',
        description: 'Dependências são as da última execução',
        source:
          "let execucoes = 0; const usarA = signal(true); const a = signal('a'); const b = signal('b'); const escolhido = computed(() => { execucoes++; return usarA() ? a() : b(); }); expect(escolhido()).toBe('a'); usarA.set(false); expect(escolhido()).toBe('b'); a.set('A'); escolhido(); expect(execucoes).toBe(2); b.set('B'); expect(escolhido()).toBe('B'); expect(execucoes).toBe(3);",
      },
      {
        id: 'independent',
        description: 'Mudar um signal não recalcula computed que não o leu',
        source:
          'let execucoesX = 0; const x = signal(1); const y = signal(1); const usaX = computed(() => { execucoesX++; return x() + 1; }); usaX(); y.set(2); usaX(); expect(execucoesX).toBe(1);',
      },
    ],
    hints: [
      'Guarde numa variável de módulo "quem está calculando agora". Quando um signal é lido, ele registra esse calculador como dependente.',
      'O computed tem uma marca de "sujo". Um signal, ao mudar, marca seus dependentes como sujos (e eles marcam os deles). A leitura recalcula só se estiver sujo.',
      'Antes de recalcular, desligue o computed das fontes antigas; a execução nova registra as atuais (dependências dinâmicas).',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `let calculando = null; // o computed que está executando agora

function registrarLeitura(dependentes) {
  if (!calculando) return;
  dependentes.add(calculando);
  calculando.fontes.add(dependentes);
}

function signal(inicial) {
  let valor = inicial;
  const dependentes = new Set();
  const ler = () => {
    registrarLeitura(dependentes);
    return valor;
  };
  ler.set = (novo) => {
    if (Object.is(novo, valor)) return; // mesmo valor: ninguém é invalidado
    valor = novo;
    for (const d of [...dependentes]) d.sujar();
  };
  ler.update = (fn) => ler.set(fn(valor));
  return ler;
}

function computed(fn) {
  let valor;
  let sujo = true; // preguiçoso: nada foi calculado ainda
  const dependentes = new Set();
  const no = {
    fontes: new Set(),
    sujar() {
      if (sujo) return;
      sujo = true;
      for (const d of [...dependentes]) d.sujar(); // propaga para quem depende de mim
    },
  };
  const ler = () => {
    registrarLeitura(dependentes);
    if (sujo) {
      for (const fonte of no.fontes) fonte.delete(no); // esquece as dependências antigas
      no.fontes.clear();
      const anterior = calculando;
      calculando = no;
      try {
        valor = fn(); // cada leitura dentro de fn registra uma dependência nova
      } finally {
        calculando = anterior;
      }
      sujo = false;
    }
    return valor;
  };
  return ler;
}`,
      },
      {
        type: 'paragraph',
        text: 'É o mesmo modelo do Angular em versão mínima: ler registra dependência, mudar invalida, e o recálculo acontece na próxima leitura. O Angular faz mais: se um computed intermediário recalcula e chega ao mesmo valor, os dependentes dele não recalculam (corte por igualdade), e os effects são agendados em vez de rodar na hora.',
      },
    ],
  },
  {
    id: 'signals-01-effect-timing',
    kind: 'multiple-choice',
    title: 'Quando o effect roda?',
    difficulty: 'intermediate',
    conceptIds: ['angular-signal-effects'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Um effect registra num array cada valor de um signal contador (que começa em 0). Depois que o effect já rodou uma vez, o código faz contador.set(1), contador.set(2) e contador.set(3) seguidos, e logo depois o Angular executa os effects pendentes. O que o array contém?',
      },
    ],
    options: [
      {
        id: 'batched',
        text: '[0, 3]: os três sets geram uma única execução, que lê o valor final.',
        explanation:
          'Correto. Medido nesta versão do Angular: o effect não roda dentro do set, e sim depois, agendado; nada rodou entre os sets, e a única execução viu o 3.',
      },
      {
        id: 'each',
        text: '[0, 1, 2, 3]: uma execução por set.',
        explanation: 'Incorreto. Effects são agendados, não executados dentro do set.',
      },
      {
        id: 'sync-first',
        text: '[0, 1]: roda no primeiro set e ignora os seguintes.',
        explanation:
          'Incorreto. Não há execução no set; e mudanças posteriores nunca são ignoradas.',
      },
      {
        id: 'none',
        text: '[0]: effects só rodam uma vez.',
        explanation: 'Incorreto. O effect roda de novo sempre que um signal lido por ele muda.',
      },
    ],
    correctOptionIds: ['batched'],
    hints: ['O effect roda dentro do set ou depois?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Effects rodam depois e agrupam mudanças. Não use effect para algo que precisa acontecer em cada valor intermediário.',
      },
    ],
  },
  {
    id: 'signals-01-ng0600',
    kind: 'multiple-choice',
    title: 'O NG0600',
    difficulty: 'intermediate',
    conceptIds: ['angular-signals'],
    prompt: [{ type: 'paragraph', text: 'Na etapa de depuração, qual é a correção?' }],
    options: [
      {
        id: 'derive',
        text: 'Transformar semResultados num computed: computed(() => this.itensFiltrados().length === 0).',
        explanation:
          'Correto. Os testes da plataforma confirmam que escrever num signal dentro de um computed lança NG0600. E semResultados é derivado: não precisa ser guardado.',
      },
      {
        id: 'effect',
        text: 'Mover o set para um effect que observa itensFiltrados.',
        explanation:
          'Remove o erro, mas cria um estado duplicado sincronizado à mão (lição de estado); computed resolve sem cópia.',
      },
      {
        id: 'untracked',
        text: 'Envolver o set em untracked.',
        explanation:
          'Incorreto. untracked evita registrar uma leitura como dependência; não permite escrever dentro do computed.',
      },
      {
        id: 'settimeout',
        text: 'Fazer o set dentro de um setTimeout.',
        explanation: 'Esconde o erro com um atraso e deixa a tela um instante inconsistente.',
      },
    ],
    correctOptionIds: ['derive'],
    hints: ['semResultados pode ser calculado a partir de itensFiltrados?'],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `readonly itensFiltrados = computed(() =>
  this.itens().filter((i) => i.nome.includes(this.busca())),
);
readonly semResultados = computed(() => this.itensFiltrados().length === 0);`,
      },
    ],
  },
  {
    id: 'signals-01-lazy',
    kind: 'multiple-choice',
    title: 'Quantas vezes o computed calcula?',
    difficulty: 'intermediate',
    conceptIds: ['angular-signals'],
    prompt: [
      {
        type: 'paragraph',
        text: 'No exemplo de computed da explicação, quantas vezes a fórmula preco() * quantidade() executa, do início ao fim?',
      },
    ],
    options: [
      {
        id: 'two',
        text: 'Duas: na primeira leitura e na leitura depois de quantidade.set(3).',
        explanation:
          'Correto. Criar não calcula (preguiçoso), a segunda leitura usa o valor guardado (memoizado) e preco.set(100) não muda o valor (Object.is). Medido nesta versão do Angular.',
      },
      {
        id: 'four',
        text: 'Quatro: uma na criação, uma por leitura.',
        explanation:
          'Incorreto. computed não calcula na criação, e leituras sem mudança não recalculam.',
      },
      {
        id: 'three',
        text: 'Três: preco.set(100) também invalida.',
        explanation: 'Incorreto. set com o mesmo valor não invalida nada.',
      },
      {
        id: 'five',
        text: 'Cinco: cada linha do exemplo provoca uma execução.',
        explanation:
          'Incorreto. Sets não executam a fórmula; só leituras de um computed invalidado.',
      },
    ],
    correctOptionIds: ['two'],
    hints: ['O que acontece na criação? E num set com o mesmo valor?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Duas execuções: uma na primeira leitura, outra depois da mudança real.',
      },
    ],
  },
  {
    id: 'signals-01-linked',
    kind: 'multiple-choice',
    title: 'linkedSignal ou computed?',
    difficulty: 'intermediate',
    conceptIds: ['angular-signals'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Uma lista de endereços vem de um input. O componente precisa de "endereço selecionado": a pessoa pode escolher outro, e quando a lista muda a seleção volta para o endereço principal. Qual é a melhor opção?',
      },
    ],
    options: [
      {
        id: 'linked',
        text: 'linkedSignal(() => this.enderecos().find((e) => e.principal)): gravável pela pessoa, recalculado quando a lista muda.',
        explanation:
          'Correto. É exatamente o caso do linkedSignal: um valor local que a pessoa altera, mas que se reinicia a partir de uma fonte. Medido: depois de set, o valor local vale; quando a fonte muda, ele é recalculado.',
      },
      {
        id: 'computed',
        text: 'computed(() => this.enderecos().find((e) => e.principal)).',
        explanation:
          'Incorreto. computed não é gravável: a pessoa não conseguiria escolher outro endereço.',
      },
      {
        id: 'signal-effect',
        text: 'Um signal comum e um effect que o reinicia quando enderecos muda.',
        explanation:
          'Funciona, mas é o padrão que o linkedSignal substitui, com um momento em que o valor está desatualizado.',
      },
      {
        id: 'ngonchanges',
        text: 'Um campo comum atualizado em ngOnChanges.',
        explanation:
          'Funciona com inputs, mas mistura o modelo antigo com signals e não reage a outras fontes.',
      },
    ],
    correctOptionIds: ['linked'],
    hints: ['O valor precisa ser gravável e também seguir uma fonte.'],
    solution: [
      {
        type: 'paragraph',
        text: 'Gravável e derivado de uma fonte: linkedSignal. Só derivado: computed. Só gravável: signal.',
      },
    ],
  },
  {
    id: 'signals-01-untracked',
    kind: 'multiple-choice',
    title: 'O que untracked faz?',
    difficulty: 'intermediate',
    conceptIds: ['angular-signals'],
    prompt: [
      {
        type: 'paragraph',
        text: 'const soma = computed(() => x() + untracked(y)). x vale 1 e y vale 10. Depois de ler soma uma vez, o código faz y.set(20) e lê soma; depois faz x.set(2) e lê soma de novo. Quais valores são lidos?',
      },
    ],
    options: [
      {
        id: 'right',
        text: '11, 11 e 22: mudar y não recalcula, mas o recálculo provocado por x lê o y atual.',
        explanation:
          'Correto. Medido nesta versão do Angular. untracked impede que y vire dependência; não congela o valor de y.',
      },
      {
        id: 'frozen',
        text: '11, 11 e 12: untracked guarda o primeiro valor de y.',
        explanation: 'Incorreto. untracked não guarda nada; ele só não registra a dependência.',
      },
      {
        id: 'tracked',
        text: '11, 21 e 22: untracked só vale em effects.',
        explanation:
          'Incorreto. untracked funciona em qualquer contexto reativo, inclusive computed.',
      },
      {
        id: 'error',
        text: 'Erro: não é permitido ler signals com untracked dentro de computed.',
        explanation: 'Incorreto. O que é proibido em computed é escrever em signals (NG0600).',
      },
    ],
    correctOptionIds: ['right'],
    hints: ['untracked impede a dependência ou congela o valor?'],
    solution: [{ type: 'paragraph', text: '11, 11, 22.' }],
  },
];
