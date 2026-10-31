import { Exercise } from '../../app/core/models/content.models';

/** Executed in `src/content/closures-examples.spec.ts`. */
export const FINALLY_PREDICT_JS = `function status() {
  try {
    return 'try';
  } finally {
    console.log('limpando');
    return 'finally';
  }
}

console.log(status());`;

const ERROR_CLASSES = `class ErroValidacao extends Error {
  constructor(mensagem, campo) {
    super(mensagem);
    this.name = 'ErroValidacao';
    this.campo = campo;
  }
}

class ErroHttp extends Error {
  constructor(status) {
    super('HTTP ' + status);
    this.name = 'ErroHttp';
    this.status = status;
  }
}

class ErroRede extends Error {
  constructor() {
    super('Falha de rede');
    this.name = 'ErroRede';
  }
}
`;

export const JS_ERRORS_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-js-error-message',
    kind: 'code',
    language: 'javascript',
    title: 'Do erro à mensagem',
    difficulty: 'intermediate',
    conceptIds: ['js-errors'],
    prompt: [
      {
        type: 'paragraph',
        text: 'As classes de erro já estão no editor. Escreva paraMensagem(erro), que recebe qualquer valor capturado num catch e devolve o texto para mostrar na interface.',
      },
    ],
    requirements: [
      'ErroValidacao: a própria mensagem do erro.',
      'ErroHttp 401: "Sua sessão expirou. Entre novamente."',
      'ErroHttp 403: "Você não tem permissão para esta ação."',
      'ErroHttp 404: "Não encontramos o que você procurava."',
      'ErroHttp de 500 em diante: "O serviço está instável. Tente de novo em instantes."',
      'ErroRede: "Sem conexão. Verifique sua internet."',
      'Se o erro não for de um tipo conhecido mas tiver cause, procure na cadeia de causas.',
      'Qualquer outra coisa (inclusive strings, null e outros ErroHttp): "Algo deu errado. Tente de novo." A mensagem interna nunca é mostrada.',
      'Uma cadeia de causas circular não pode travar a função.',
    ],
    examples: [
      {
        input: "paraMensagem(new ErroValidacao('E-mail inválido', 'email'))",
        output: "'E-mail inválido'",
      },
      {
        input: "paraMensagem(new Error('Falha ao salvar', { cause: new ErroHttp(503) }))",
        output: "'O serviço está instável. Tente de novo em instantes.'",
      },
    ],
    starterCode: `${ERROR_CLASSES}
function paraMensagem(erro) {
  // Seu código aqui
}

console.log(paraMensagem(new ErroHttp(401)));
`,
    tests: [
      {
        id: 'validation',
        description: 'ErroValidacao mostra a própria mensagem',
        source:
          "expect(paraMensagem(new ErroValidacao('E-mail inválido', 'email'))).toBe('E-mail inválido');",
      },
      {
        id: 'http',
        description: 'ErroHttp 401, 403, 404 e 5xx têm mensagens próprias',
        source:
          "expect(paraMensagem(new ErroHttp(401))).toBe('Sua sessão expirou. Entre novamente.'); expect(paraMensagem(new ErroHttp(403))).toBe('Você não tem permissão para esta ação.'); expect(paraMensagem(new ErroHttp(404))).toBe('Não encontramos o que você procurava.'); for (const s of [500, 503]) expect(paraMensagem(new ErroHttp(s))).toBe('O serviço está instável. Tente de novo em instantes.');",
      },
      {
        id: 'network',
        description: 'ErroRede pede para verificar a conexão',
        source:
          "expect(paraMensagem(new ErroRede())).toBe('Sem conexão. Verifique sua internet.');",
      },
      {
        id: 'cause',
        description: 'Procura na cadeia de causas',
        source:
          "expect(paraMensagem(new Error('Falha ao salvar', { cause: new ErroHttp(503) }))).toBe('O serviço está instável. Tente de novo em instantes.'); expect(paraMensagem(new Error('a', { cause: new Error('b', { cause: new ErroRede() }) }))).toBe('Sem conexão. Verifique sua internet.');",
      },
      {
        id: 'generic',
        description: 'Desconhecidos recebem a mensagem genérica, sem expor o texto interno',
        source:
          "const generica = 'Algo deu errado. Tente de novo.'; for (const e of [new TypeError('x is undefined'), 'texto', null, undefined, 42, new ErroHttp(418)]) expect(paraMensagem(e)).toBe(generica);",
      },
      {
        id: 'cycle',
        description: 'Uma cadeia de causas circular não trava',
        source:
          "const a = new Error('a'); const b = new Error('b', { cause: a }); a.cause = b; expect(paraMensagem(a)).toBe('Algo deu errado. Tente de novo.');",
      },
    ],
    hints: [
      'Escreva uma função que traduz um único erro e devolve null quando não reconhece o tipo.',
      'Depois percorra erro, erro.cause, erro.cause.cause… enquanto o valor existir.',
      'Guarde os erros já visitados num Set para não entrar em ciclo.',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `${ERROR_CLASSES}
const GENERICA = 'Algo deu errado. Tente de novo.';

function traduzir(erro) {
  if (erro instanceof ErroValidacao) return erro.message;
  if (erro instanceof ErroRede) return 'Sem conexão. Verifique sua internet.';
  if (erro instanceof ErroHttp) {
    if (erro.status === 401) return 'Sua sessão expirou. Entre novamente.';
    if (erro.status === 403) return 'Você não tem permissão para esta ação.';
    if (erro.status === 404) return 'Não encontramos o que você procurava.';
    if (erro.status >= 500) return 'O serviço está instável. Tente de novo em instantes.';
  }
  return null; // tipo desconhecido (ou status sem mensagem própria)
}

function paraMensagem(erro) {
  const vistos = new Set();
  for (let atual = erro; atual != null && !vistos.has(atual); atual = atual.cause) {
    vistos.add(atual); // protege contra cadeias circulares
    const mensagem = traduzir(atual);
    if (mensagem) return mensagem;
  }
  return GENERICA; // nunca mostra a mensagem interna
}`,
      },
      {
        type: 'paragraph',
        text: 'Separar "traduzir um erro" de "percorrer a cadeia" deixa cada parte simples. A mensagem interna (como "x is undefined") nunca chega à tela: ela é útil para quem investiga, no registro, e confusa ou até perigosa para quem usa.',
      },
    ],
  },
  {
    id: 'errors-01-finally',
    kind: 'predict-output',
    title: 'O return no finally',
    difficulty: 'intermediate',
    conceptIds: ['js-errors'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Digite as duas linhas que aparecem no console, separadas por espaço.',
      },
    ],
    language: 'javascript',
    code: FINALLY_PREDICT_JS,
    acceptedAnswers: ['limpando finally'],
    explanation:
      'O finally roda antes de a função realmente devolver o valor do try, e o return de dentro dele substitui o anterior. Por isso a saída é "limpando" e depois "finally". Medido no Node e nos testes da plataforma.',
    commonMistakes: [
      {
        answer: 'limpando try',
        explanation: 'O return do finally substitui o do try: o valor devolvido é "finally".',
      },
      {
        answer: 'try',
        explanation: 'O finally roda mesmo depois do return do try, então "limpando" aparece.',
      },
    ],
    wrongAnswerGuidance:
      'Não é isso. Lembre que o finally sempre roda, e veja qual return acontece por último.',
    hints: ['O finally roda depois do return do try?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Saída: limpando, depois finally. Por isso finally não deve ter return.',
      },
    ],
  },
  {
    id: 'errors-01-no-await',
    kind: 'multiple-choice',
    title: 'O pedido que "foi salvo"',
    difficulty: 'intermediate',
    conceptIds: ['js-errors', 'js-async'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Na etapa de depuração, por que a mensagem de sucesso aparece mesmo com o servidor fora do ar?',
      },
    ],
    options: [
      {
        id: 'await',
        text: 'Falta await: salvarPedido devolve uma promise, a linha seguinte roda na hora, e a rejeição acontece depois, fora do try. A correção é await salvarPedido(pedido).',
        explanation:
          'Correto. Medido: try { falha() } não capturou a rejeição, e try { await falha() } capturou. Sem await, a rejeição fica sem tratamento e o console mostra um aviso de promise rejeitada.',
      },
      {
        id: 'catch-order',
        text: 'O catch precisa vir antes do try.',
        explanation: 'Incorreto. A sintaxe é sempre try, depois catch.',
      },
      {
        id: 'server',
        text: 'O servidor responde 200 mesmo fora do ar.',
        explanation:
          'Um servidor fora do ar não responde nada; a falha acontece, só não é capturada.',
      },
      {
        id: 'then',
        text: 'Falta um .then depois de salvarPedido.',
        explanation:
          '.then sem .catch continua sem tratar a rejeição; e mostrar o sucesso continuaria fora dele.',
      },
    ],
    correctOptionIds: ['await'],
    hints: ['Quando a rejeição acontece em relação ao fim do try?'],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `async function aoClicarSalvar() {
  try {
    await salvarPedido(pedido);
    mostrar('Pedido salvo!');
  } catch (erro) {
    mostrar(paraMensagem(erro));
  }
}`,
      },
    ],
  },
  {
    id: 'errors-01-rethrow',
    kind: 'multiple-choice',
    title: 'Capturar o quê?',
    difficulty: 'intermediate',
    conceptIds: ['js-errors'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Uma função de importação captura erros assim: catch (erro) { return []; }. Às vezes a lista importada aparece vazia sem motivo. Qual é a melhor correção?',
      },
    ],
    options: [
      {
        id: 'specific',
        text: 'Tratar só o erro esperado (por exemplo, instanceof ErroValidacao para um arquivo inválido) e relançar o resto com throw erro.',
        explanation:
          'Correto. O catch genérico também engolia bugs (um TypeError, por exemplo) e os transformava em "lista vazia". Relançando, eles chegam ao handler global e aparecem no monitoramento.',
      },
      {
        id: 'log',
        text: 'Manter o catch e acrescentar console.log(erro).',
        explanation:
          'Ajuda a investigar, mas o comportamento continua errado: a pessoa vê uma lista vazia como se estivesse tudo certo.',
      },
      {
        id: 'remove-try',
        text: 'Remover o try/catch.',
        explanation:
          'Os erros esperados (arquivo inválido) também passariam a quebrar a tela, sem mensagem útil.',
      },
      {
        id: 'finally',
        text: 'Trocar o catch por finally.',
        explanation:
          'finally não trata erros; o erro continuaria subindo, e um return no finally o esconderia de novo.',
      },
    ],
    correctOptionIds: ['specific'],
    hints: ['Quais erros essa função sabe tratar de verdade?'],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `catch (erro) {
  if (erro instanceof ErroValidacao) return { itens: [], aviso: erro.message };
  throw erro;
}`,
      },
    ],
  },
  {
    id: 'errors-01-throw-string',
    kind: 'multiple-choice',
    title: 'throw "texto"',
    difficulty: 'intermediate',
    conceptIds: ['js-errors'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Por que throw "Saldo insuficiente" é pior que throw new Error("Saldo insuficiente")?',
      },
    ],
    options: [
      {
        id: 'stack',
        text: 'A string não tem stack (o caminho até o erro), não é instanceof Error e não aceita cause: fica impossível saber de onde veio.',
        explanation:
          'Correto. Medido: o valor capturado de throw "texto" é uma string, instanceof Error é false e stack é undefined.',
      },
      {
        id: 'syntax',
        text: 'throw com string é erro de sintaxe.',
        explanation:
          'Incorreto. JavaScript permite lançar qualquer valor; o problema é o que se perde.',
      },
      {
        id: 'catch',
        text: 'O catch não captura strings.',
        explanation: 'Incorreto. O catch captura qualquer valor lançado.',
      },
      {
        id: 'same',
        text: 'Não há diferença.',
        explanation: 'Incorreto. Faltam stack, tipo e cause.',
      },
    ],
    correctOptionIds: ['stack'],
    hints: ['O que um Error carrega além da mensagem?'],
    solution: [{ type: 'paragraph', text: 'Lance sempre Error ou subclasses.' }],
  },
  {
    id: 'errors-01-allsettled',
    kind: 'multiple-choice',
    title: 'all ou allSettled?',
    difficulty: 'intermediate',
    conceptIds: ['js-errors', 'js-async'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O painel carrega cinco widgets independentes. Se um falhar, os outros quatro devem aparecer mesmo assim, e o que falhou mostra um aviso. Qual combinação usar?',
      },
    ],
    options: [
      {
        id: 'allsettled',
        text: 'Promise.allSettled: espera todos e informa, para cada um, fulfilled com o valor ou rejected com o motivo.',
        explanation:
          'Correto. Medido: com uma promise resolvida e outra rejeitada, allSettled devolveu fulfilled e rejected, enquanto Promise.all rejeitou com o primeiro erro.',
      },
      {
        id: 'all',
        text: 'Promise.all com um catch em volta.',
        explanation:
          'Promise.all rejeita no primeiro erro e descarta os resultados que deram certo.',
      },
      {
        id: 'race',
        text: 'Promise.race.',
        explanation: 'Incorreto. race resolve com o primeiro que terminar, e ignora os demais.',
      },
      {
        id: 'sequence',
        text: 'Um await por vez, em sequência.',
        explanation:
          'Funciona com try por widget, mas soma os tempos de espera em vez de carregar em paralelo.',
      },
    ],
    correctOptionIds: ['allsettled'],
    hints: ['Qual método não para no primeiro erro?'],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `const resultados = await Promise.allSettled(widgets.map((w) => w.carregar()));
resultados.forEach((r, i) =>
  r.status === 'fulfilled' ? widgets[i].mostrar(r.value) : widgets[i].avisar(paraMensagem(r.reason)),
);`,
      },
    ],
  },
];
