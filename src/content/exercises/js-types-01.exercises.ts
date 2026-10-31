import { Exercise } from '../../app/core/models/content.models';

/** Executed in `src/content/closures-examples.spec.ts`. */
export const TYPES_PREDICT_JS = `const desconto = 0;
const quantidade = '';

console.log(desconto || 10, desconto ?? 10, Number(quantidade), '5' + 3 - 2);`;

export const JS_TYPES_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-js-money',
    kind: 'code',
    language: 'javascript',
    title: 'Dinheiro em centavos',
    difficulty: 'introductory',
    conceptIds: ['js-numbers', 'js-coercion'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Escreva três funções para um carrinho: paraCentavos(texto) lê o valor que a pessoa digitou, totalEmCentavos(itens) soma o pedido e formatarBRL(centavos) prepara para exibir.',
      },
    ],
    requirements: [
      'paraCentavos aceita "10", "10,5", "10,50", "1.234,56" e "R$ 1.234,56" (com espaços em volta), e devolve o valor em centavos (inteiro): 1000, 1050, 1050, 123456, 123456.',
      'paraCentavos devolve null para texto vazio, letras, mais de duas casas decimais ("10,555") ou separador de milhar mal posicionado ("1.23,00").',
      'totalEmCentavos recebe [{ precoCentavos, quantidade }] e devolve a soma inteira.',
      'formatarBRL usa Intl.NumberFormat em pt-BR com moeda BRL.',
    ],
    examples: [
      { input: "paraCentavos('R$ 1.234,56')", output: '123456' },
      { input: 'totalEmCentavos([{ precoCentavos: 1990, quantidade: 3 }])', output: '5970' },
      { input: 'formatarBRL(5970)', output: "'R$ 59,70' (com espaço não separável)" },
    ],
    starterCode: `function paraCentavos(texto) {
  // Seu código aqui
}

function totalEmCentavos(itens) {
  // Seu código aqui
}

function formatarBRL(centavos) {
  // Seu código aqui
}

console.log(paraCentavos('1.234,56'), formatarBRL(5970));
`,
    tests: [
      {
        id: 'parse-simple',
        description: 'Lê inteiros e decimais com vírgula',
        source:
          "expect(paraCentavos('10')).toBe(1000); expect(paraCentavos('10,5')).toBe(1050); expect(paraCentavos('10,50')).toBe(1050); expect(paraCentavos('0,07')).toBe(7);",
      },
      {
        id: 'parse-thousands',
        description: 'Lê separador de milhar, prefixo R$ e espaços',
        source:
          "expect(paraCentavos('1.234,56')).toBe(123456); expect(paraCentavos('  R$ 1.234,56 ')).toBe(123456); expect(paraCentavos('1234,56')).toBe(123456);",
      },
      {
        id: 'parse-exact',
        description: 'Valores que o ponto flutuante erraria saem exatos',
        source:
          "expect(paraCentavos('19,90')).toBe(1990); expect(paraCentavos('1,005')).toBe(null); expect(paraCentavos('0,29')).toBe(29);",
      },
      {
        id: 'parse-invalid',
        description: 'Vazio, letras e formatos errados devolvem null',
        source:
          "for (const t of ['', '   ', 'abc', '10,555', '1.23,00', '12px', '-5']) expect(paraCentavos(t)).toBe(null);",
      },
      {
        id: 'total',
        description: 'A soma é inteira, sem erro de ponto flutuante',
        source:
          'expect(totalEmCentavos([{ precoCentavos: 1990, quantidade: 3 }, { precoCentavos: 10, quantidade: 1 }])).toBe(5980); expect(totalEmCentavos([])).toBe(0);',
      },
      {
        id: 'format',
        description: 'Formata com Intl em pt-BR',
        source:
          "expect(formatarBRL(5970)).toBe(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(59.7)); expect(formatarBRL(123456).replace(/\\u00a0/g, ' ')).toBe('R$ 1.234,56');",
      },
    ],
    hints: [
      'Valide o formato com uma expressão regular antes de converter qualquer coisa.',
      'Sem float: separe a parte inteira e os centavos como texto, e complete os centavos com padEnd(2, "0").',
      'Formato: /^(\\d{1,3}(\\.\\d{3})+|\\d+)(,\\d{1,2})?$/ depois de tirar o "R$" e os espaços.',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `const FORMATO = /^(\\d{1,3}(\\.\\d{3})+|\\d+)(,\\d{1,2})?$/;
const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function paraCentavos(texto) {
  const limpo = texto.trim().replace(/^R\\$\\s*/, '');
  if (!FORMATO.test(limpo)) return null;
  const [inteiro, decimais = ''] = limpo.replaceAll('.', '').split(',');
  // tudo em inteiros: nenhum valor passa por float
  return Number(inteiro) * 100 + Number(decimais.padEnd(2, '0'));
}

function totalEmCentavos(itens) {
  return itens.reduce((soma, i) => soma + i.precoCentavos * i.quantidade, 0);
}

function formatarBRL(centavos) {
  return BRL.format(centavos / 100); // a divisão só acontece para exibir
}`,
      },
      {
        type: 'paragraph',
        text: 'A expressão regular recusa tudo que não for um valor brasileiro bem formado, e a conversão trabalha com as partes como texto: "19,90" vira 19 * 100 + 90, exatamente 1990. A única divisão fica na formatação, onde um erro de ponto flutuante na última casa não chega à tela.',
      },
    ],
  },
  {
    id: 'types-01-predict',
    kind: 'predict-output',
    title: 'Padrões e conversões',
    difficulty: 'introductory',
    conceptIds: ['js-coercion'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Digite os quatro valores que aparecem no console, separados por espaço.',
      },
    ],
    language: 'javascript',
    code: TYPES_PREDICT_JS,
    acceptedAnswers: ['10 0 0 51'],
    explanation:
      'desconto || 10 troca o 0 (falsy) por 10; desconto ?? 10 mantém o 0, que não é null nem undefined. Number("") é 0. "5" + 3 concatena para "53", e o - converte para número: 53 - 2 = 51.',
    commonMistakes: [
      {
        answer: '0 0 0 51',
        explanation: '|| troca qualquer valor falsy, inclusive 0. Só o ?? mantém o zero.',
      },
      { answer: '10 0 NaN 51', explanation: 'Number("") é 0, não NaN: a string vazia vira zero.' },
      {
        answer: '10 0 0 6',
        explanation:
          '"5" + 3 concatena ("53") porque um dos lados é string; só depois o - converte.',
      },
    ],
    wrongAnswerGuidance:
      'Não é isso. Resolva um valor por vez: o que é falsy, o que é nulo, e o que o + faz com uma string.',
    hints: ['0 é falsy, mas não é null nem undefined.'],
    solution: [{ type: 'paragraph', text: 'Saída: 10 0 0 51.' }],
  },
  {
    id: 'types-01-empty',
    kind: 'multiple-choice',
    title: 'A quantidade vazia',
    difficulty: 'introductory',
    conceptIds: ['js-coercion'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Na etapa de depuração, por que o campo vazio passa pela validação, e qual é a correção?',
      },
    ],
    options: [
      {
        id: 'empty-zero',
        text: 'Number("") é 0, e isNaN(0) é false. Trate o vazio antes de converter e valide o resultado com Number.isInteger e um mínimo.',
        explanation:
          'Correto. Medido: Number("") é 0 e isNaN("") é false. Validar "é um número" não basta: a regra de negócio é "inteiro, pelo menos 1".',
      },
      {
        id: 'parseint',
        text: 'Trocar Number por parseInt resolve tudo.',
        explanation:
          'parseInt("") é NaN, o que pega o vazio, mas parseInt("2abc") é 2 e parseInt("1.5") é 1: aceita entradas inválidas em silêncio.',
      },
      {
        id: 'equals',
        text: 'Trocar isNaN(quantidade) por quantidade == NaN.',
        explanation:
          'Incorreto. NaN não é igual a nada, nem a si mesmo: a comparação é sempre false.',
      },
      {
        id: 'html',
        text: 'Basta colocar required no campo.',
        explanation:
          'Ajuda quem preenche, mas a função continua aceitando "" de qualquer outra origem; e o servidor precisa validar de novo.',
      },
    ],
    correctOptionIds: ['empty-zero'],
    hints: ['Quanto vale Number("")?'],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `function lerQuantidade(texto) {
  if (texto.trim() === '') throw new Error('Informe a quantidade');
  const quantidade = Number(texto);
  if (!Number.isInteger(quantidade) || quantidade < 1) throw new Error('Quantidade inválida');
  return quantidade;
}`,
      },
    ],
  },
  {
    id: 'types-01-equality',
    kind: 'multiple-choice',
    title: '== ou ===?',
    difficulty: 'introductory',
    conceptIds: ['js-coercion'],
    prompt: [{ type: 'paragraph', text: 'Qual afirmação está correta?' }],
    options: [
      {
        id: 'strict',
        text: 'Use === por padrão; valor == null é a exceção aceitável, porque pega null e undefined juntos.',
        explanation:
          'Correto. Fora isso, == aplica conversões que surpreendem: 0 == "" é true e null == 0 é false, como os testes da plataforma confirmam.',
      },
      {
        id: 'loose-faster',
        text: '== é melhor porque converte e evita erros de tipo.',
        explanation: 'Incorreto. Converter em silêncio esconde erros de tipo em vez de evitá-los.',
      },
      {
        id: 'nan',
        text: 'NaN === NaN é true.',
        explanation: 'Incorreto. NaN não é igual a nada; use Number.isNaN.',
      },
      {
        id: 'objects',
        text: '=== compara o conteúdo de objetos e arrays.',
        explanation: 'Incorreto. Para objetos, compara a referência: [1] === [1] é false.',
      },
    ],
    correctOptionIds: ['strict'],
    hints: ['Quais pares iguais com == surpreendem?'],
    solution: [
      { type: 'paragraph', text: '=== sempre; == null quando quiser pegar null e undefined.' },
    ],
  },
  {
    id: 'types-01-nullish',
    kind: 'multiple-choice',
    title: 'O desconto que sumiu',
    difficulty: 'introductory',
    conceptIds: ['js-coercion'],
    prompt: [
      {
        type: 'paragraph',
        text: 'const desconto = config.desconto || 10. Quando a configuração define desconto 0 (sem desconto), a loja aplica 10%. Qual é a correção?',
      },
    ],
    options: [
      {
        id: 'nullish',
        text: 'config.desconto ?? 10: só troca pelo padrão quando o valor é null ou undefined.',
        explanation:
          'Correto. 0 é um valor válido aqui; || o trata como "falta de valor" porque 0 é falsy.',
      },
      {
        id: 'ternary-truthy',
        text: 'config.desconto ? config.desconto : 10.',
        explanation: 'Incorreto. É o mesmo teste de truthy do ||: o 0 continua virando 10.',
      },
      {
        id: 'number',
        text: 'Number(config.desconto) || 10.',
        explanation: 'Incorreto. Number(0) é 0, que continua falsy.',
      },
      {
        id: 'string',
        text: 'Guardar o desconto como string "0", que é truthy.',
        explanation: 'Funciona por acidente e espalha strings onde deveria haver números.',
      },
    ],
    correctOptionIds: ['nullish'],
    hints: ['0 é falsy?'],
    solution: [
      { type: 'code', language: 'javascript', code: `const desconto = config.desconto ?? 10;` },
    ],
  },
  {
    id: 'types-01-money',
    kind: 'multiple-choice',
    title: 'O total de R$ 59,699999999999996',
    difficulty: 'introductory',
    conceptIds: ['js-numbers'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O carrinho calcula preco * quantidade com o preço em reais (19.9) e mostra 59.699999999999996. Qual é a melhor correção?',
      },
    ],
    options: [
      {
        id: 'cents',
        text: 'Guardar e calcular em centavos (1990 * 3 = 5970) e formatar só para exibir, com Intl.NumberFormat.',
        explanation:
          'Correto. Inteiros são exatos até 2^53; o erro de 19.9 * 3 vem de 19.9 não ter representação exata em binário.',
      },
      {
        id: 'tofixed',
        text: 'Usar total.toFixed(2) no cálculo.',
        explanation:
          'Esconde o sintoma na tela, mas o erro continua nos cálculos seguintes, e toFixed arredonda de formas inesperadas: (1.005).toFixed(2) é "1.00".',
      },
      {
        id: 'round',
        text: 'Math.round(total * 100) / 100 depois de cada operação.',
        explanation:
          'Reduz o problema, mas espalha arredondamentos pelo código e ainda falha em casos de borda.',
      },
      {
        id: 'bug',
        text: 'É um erro do navegador; em outro navegador dá certo.',
        explanation: 'Incorreto. Todo motor JavaScript segue o mesmo padrão (IEEE 754).',
      },
    ],
    correctOptionIds: ['cents'],
    hints: ['Qual tipo de número é sempre exato em JavaScript?'],
    solution: [{ type: 'paragraph', text: 'Centavos para guardar e calcular; Intl para exibir.' }],
  },
];
