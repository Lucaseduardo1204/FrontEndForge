import { Exercise } from '../../app/core/models/content.models';

/** Outputs claimed here are executed in `src/content/closures-examples.spec.ts`. */
export const STALE_JS = `const config = { tema: 'escuro' };
const { tema } = config;

const lerTema = () => tema;
const lerConfig = () => config.tema;

config.tema = 'claro';
console.log(lerTema(), lerConfig());`;

export const TDZ_JS = `let mensagem = 'fora';

function mostrar() {
  console.log(mensagem);
  let mensagem = 'dentro';
}

mostrar();`;

export const JS_CLOSURES_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-js-closures',
    kind: 'code',
    language: 'javascript',
    title: 'Estado privado e execução única',
    difficulty: 'introductory',
    conceptIds: ['js-closures'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Implemente duas funções que usam closures. criarCofre(senha) guarda um saldo que só pode ser lido e alterado por métodos. umaVez(fn) devolve uma nova função que chama fn só na primeira vez.',
      },
    ],
    requirements: [
      'criarCofre(senha) devolve { depositar(valor), saldo(senhaInformada) }.',
      'depositar soma o valor ao saldo e devolve o novo saldo.',
      'saldo(senhaInformada) devolve o saldo se a senha estiver certa e null se estiver errada.',
      'O saldo e a senha não ficam acessíveis como propriedades do objeto.',
      'Cofres diferentes têm saldos independentes.',
      'umaVez(fn) devolve uma função que chama fn (com os argumentos recebidos) só na primeira chamada e devolve sempre o resultado dessa primeira chamada.',
    ],
    examples: [
      { input: "const c = criarCofre('1234'); c.depositar(50); c.saldo('1234')", output: '50' },
      { input: "c.saldo('0000')", output: 'null' },
      {
        input: 'const iniciar = umaVez(() => 42); iniciar(); iniciar()',
        output: '42 (fn chamada uma vez)',
      },
    ],
    starterCode: `function criarCofre(senha) {
  // Seu código aqui
}

function umaVez(fn) {
  // Seu código aqui
}

const cofre = criarCofre('1234');
cofre.depositar(50);
console.log(cofre.saldo('1234')); // esperado: 50
`,
    tests: [
      {
        id: 'deposit',
        description: 'depositar soma e devolve o novo saldo',
        source:
          "const c = criarCofre('1234'); expect(c.depositar(50)).toBe(50); expect(c.depositar(25)).toBe(75); expect(c.saldo('1234')).toBe(75);",
      },
      {
        id: 'wrong-password',
        description: 'Senha errada devolve null',
        source:
          "const c = criarCofre('1234'); c.depositar(10); expect(c.saldo('0000')).toBe(null);",
      },
      {
        id: 'private',
        description: 'Saldo e senha não ficam expostos no objeto',
        source:
          "const c = criarCofre('1234'); c.depositar(10); const texto = JSON.stringify(c) + Object.values(c).filter((v) => typeof v !== 'function').join(); expect(texto.includes('1234')).toBe(false); expect(texto.includes('10')).toBe(false);",
      },
      {
        id: 'independent',
        description: 'Cofres diferentes não compartilham saldo',
        source:
          "const a = criarCofre('a'); const b = criarCofre('b'); a.depositar(100); b.depositar(1); expect(a.saldo('a')).toBe(100); expect(b.saldo('b')).toBe(1);",
      },
      {
        id: 'once-calls',
        description: 'umaVez chama fn só uma vez, com os argumentos da primeira chamada',
        source:
          'const chamadas = []; const f = umaVez((x, y) => { chamadas.push([x, y]); return x + y; }); f(1, 2); f(5, 5); expect(chamadas).toEqual([[1, 2]]);',
      },
      {
        id: 'once-result',
        description: 'umaVez devolve sempre o resultado da primeira chamada',
        source: 'const f = umaVez((x) => x * 2); expect(f(3)).toBe(6); expect(f(10)).toBe(6);',
      },
      {
        id: 'once-lazy',
        description: 'umaVez não chama fn antes da primeira chamada',
        source: 'let chamou = false; umaVez(() => { chamou = true; }); expect(chamou).toBe(false);',
      },
    ],
    hints: [
      'Declare let saldo = 0 dentro de criarCofre e devolva um objeto com funções que usam saldo e senha.',
      'Em umaVez, guarde numa variável da closure se fn já foi chamada e qual foi o resultado.',
      'Os argumentos chegam com rest: return function (...args) { ... fn(...args) ... }.',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `function criarCofre(senha) {
  let saldo = 0; // senha e saldo só existem dentro desta closure

  return {
    depositar(valor) {
      saldo += valor;
      return saldo;
    },
    saldo(senhaInformada) {
      return senhaInformada === senha ? saldo : null;
    },
  };
}

function umaVez(fn) {
  let chamada = false;
  let resultado;

  return function (...args) {
    if (!chamada) {
      chamada = true;
      resultado = fn(...args);
    }
    return resultado;
  };
}`,
      },
      {
        type: 'paragraph',
        text: 'Em criarCofre, senha e saldo não são propriedades: são variáveis que só os métodos enxergam. Em umaVez, chamada e resultado sobrevivem entre as chamadas porque a função devolvida as mantém na closure.',
      },
    ],
  },
  {
    id: 'closures-01-private',
    kind: 'multiple-choice',
    title: 'Como deixar o saldo privado?',
    difficulty: 'introductory',
    conceptIds: ['js-closures'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Em JavaScript puro, qual destas opções impede de fato que outro trecho do código altere o saldo diretamente?',
      },
    ],
    options: [
      {
        id: 'closure',
        text: 'Guardar o saldo numa variável dentro de uma função fábrica e expor só métodos.',
        explanation:
          'Correto. Uma variável local só pode ser acessada pelas funções criadas no mesmo escopo. Não existe caminho de fora até ela.',
      },
      {
        id: 'underscore',
        text: 'Chamar a propriedade de _saldo.',
        explanation:
          'Incorreto. O sublinhado é só uma convenção que pede para não mexer; conta._saldo = 0 funciona normalmente.',
      },
      {
        id: 'const',
        text: 'Declarar o objeto com const.',
        explanation:
          'Incorreto. const impede reatribuir a variável, não alterar as propriedades do objeto: conta.saldo = 0 continua funcionando.',
      },
      {
        id: 'freeze',
        text: 'Usar Object.freeze no objeto.',
        explanation:
          'Incorreto aqui. freeze impede alterações, inclusive as legítimas: o próprio depositar deixaria de conseguir mudar o saldo.',
      },
    ],
    correctOptionIds: ['closure'],
    hints: ['Qual das opções esconde o valor, em vez de só pedir para não mexer nele?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Closures dão privacidade real em funções fábrica. Em classes, o equivalente moderno são os campos privados com #, como #saldo.',
      },
    ],
  },
  {
    id: 'closures-01-stale',
    kind: 'predict-output',
    title: 'Escuro ou claro?',
    difficulty: 'introductory',
    conceptIds: ['js-closures'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Digite as duas palavras que aparecem no console, separadas por espaço.',
      },
    ],
    language: 'javascript',
    code: STALE_JS,
    acceptedAnswers: ['escuro claro'],
    explanation:
      'const { tema } = config copiou o texto "escuro" para uma variável nova, tema. lerTema enxerga essa variável, que nunca mudou. lerConfig lê config.tema na hora da chamada e vê "claro".',
    commonMistakes: [
      {
        answer: 'claro claro',
        explanation:
          'A closure vê mudanças na variável que ela usa, e tema nunca foi alterada. Quem mudou foi a propriedade config.tema, que é outra coisa.',
      },
      {
        answer: 'escuro escuro',
        explanation:
          'lerConfig não guarda o tema: ela guarda o objeto config e lê a propriedade a cada chamada, quando ela já vale "claro".',
      },
    ],
    wrongAnswerGuidance:
      'Não é isso. Pergunte-se qual variável cada função lê, e se essa variável mudou.',
    hints: [
      'O que a desestruturação faz com o valor de config.tema?',
      'Qual das funções lê o objeto no momento da chamada?',
    ],
    solution: [
      {
        type: 'paragraph',
        text: 'Saída: escuro claro. Para sempre ver o valor atual, leia do objeto na hora (config.tema) em vez de copiar para uma variável no início.',
      },
    ],
  },
  {
    id: 'closures-01-counters',
    kind: 'predict-output',
    title: 'Dois contadores',
    difficulty: 'introductory',
    conceptIds: ['js-closures'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Usando a função criarContador da lição, digite o que aparece no console (os dois números separados por espaço).',
      },
    ],
    language: 'javascript',
    code: `const a = criarContador();
const b = criarContador(5);
a.incrementar();
b.incrementar();
a.incrementar();
console.log(a.atual(), b.atual());`,
    acceptedAnswers: ['2 6'],
    explanation:
      'Cada chamada de criarContador cria a sua própria variável valor. a começa em 0 e foi incrementado duas vezes; b começa em 5 e foi incrementado uma vez.',
    commonMistakes: [
      {
        answer: '3 3',
        explanation:
          'Os contadores não compartilham o valor: cada chamada da fábrica cria uma variável nova.',
      },
      {
        answer: '3 8',
        explanation:
          'Os contadores não compartilham o valor: cada chamada da fábrica cria uma variável nova.',
      },
    ],
    wrongAnswerGuidance:
      'Não é isso. Acompanhe a e b separadamente: cada um tem sua própria variável valor.',
    hints: ['Quantas variáveis valor existem depois das duas chamadas de criarContador?'],
    solution: [{ type: 'paragraph', text: 'Saída: 2 6.' }],
  },
  {
    id: 'closures-01-loop',
    kind: 'multiple-choice',
    title: 'var e let no laço',
    difficulty: 'introductory',
    conceptIds: ['js-closures'],
    prompt: [
      {
        type: 'paragraph',
        text: 'No exemplo do laço da lição, por que as funções criadas com var devolvem 3, 3, 3?',
      },
    ],
    options: [
      {
        id: 'single-variable',
        text: 'Com var existe uma única variável i para o laço todo; quando as funções rodam, o laço já terminou e i vale 3.',
        explanation:
          'Correto. As três funções guardam acesso à mesma variável. Com let, cada volta do laço cria uma variável nova, e cada função fica com a sua.',
      },
      {
        id: 'copy-at-end',
        text: 'As funções copiam o valor de i no fim do laço.',
        explanation:
          'Incorreto. Closures não copiam valores; elas acessam a variável. O resultado é 3 porque é o valor dessa única variável quando as funções são chamadas.',
      },
      {
        id: 'async',
        text: 'Porque as funções são assíncronas.',
        explanation:
          'Incorreto. Elas são chamadas de forma síncrona pelo map, depois do laço. O que importa é quando são chamadas e qual variável enxergam.',
      },
      {
        id: 'bug',
        text: 'É um bug do JavaScript corrigido nas versões novas.',
        explanation:
          'Incorreto. É o comportamento especificado de var, que continua igual. let foi criado com o escopo de bloco que resolve o problema.',
      },
    ],
    correctOptionIds: ['single-variable'],
    hints: ['Quantas variáveis i existem com var? E quantas j com let?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Use let em laços. O Bestiário tem o mesmo bug com botões numa página real.',
      },
    ],
  },
  {
    id: 'closures-01-tdz',
    kind: 'multiple-choice',
    title: 'Fora ou dentro?',
    difficulty: 'intermediate',
    conceptIds: ['js-closures'],
    prompt: [
      { type: 'paragraph', text: 'O que acontece ao rodar este código?' },
      { type: 'code', language: 'javascript', code: TDZ_JS },
    ],
    options: [
      {
        id: 'reference-error',
        text: 'Lança ReferenceError: a mensagem de dentro da função existe desde o início dela, mas não pode ser usada antes da declaração.',
        explanation:
          'Correto. O let dentro de mostrar cria uma variável mensagem que vale para a função inteira e esconde a de fora. Até a linha do let, ela está na zona morta temporal, e usá-la lança ReferenceError.',
      },
      {
        id: 'outer',
        text: 'Mostra "fora", porque a variável de dentro ainda não foi declarada.',
        explanation:
          'Incorreto. O escopo é decidido antes de o código rodar: dentro de mostrar, mensagem sempre se refere à variável local, mesmo nas linhas antes do let.',
      },
      {
        id: 'undefined',
        text: 'Mostra undefined.',
        explanation:
          'Incorreto. Isso aconteceria com var, que vale undefined até a atribuição. let e const lançam erro.',
      },
      {
        id: 'inner',
        text: 'Mostra "dentro".',
        explanation: 'Incorreto. A atribuição de "dentro" só acontece depois do console.log.',
      },
    ],
    correctOptionIds: ['reference-error'],
    hints: [
      'Dentro de mostrar, a qual variável o nome mensagem se refere?',
      'O que acontece ao usar uma variável let antes da linha onde ela é declarada?',
    ],
    solution: [
      {
        type: 'paragraph',
        text: 'Evite reaproveitar o mesmo nome em escopos aninhados, e declare as variáveis no topo do bloco onde são usadas.',
      },
    ],
  },
];
