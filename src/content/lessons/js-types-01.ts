import { Lesson } from '../../app/core/models/content.models';

/** Every value in the comments is asserted in `src/content/closures-examples.spec.ts`. */
export const COERCION_JS = `console.log(1 + '2', '3' * '4', true + 1);    // 12 12 2
console.log(0 == '', null == undefined, null == 0); // true true false
console.log(NaN === NaN, Number.isNaN(NaN));         // false true
console.log(typeof null, typeof [], Array.isArray([])); // object object true`;

export const NUMBERS_JS = `console.log(0.1 + 0.2);            // 0.30000000000000004
console.log(19.9 * 3);             // 59.699999999999996
console.log((1990 * 3) / 100);     // 59.7: em centavos, a conta é inteira
console.log((1.005).toFixed(2));   // 1.00: 1.005 não existe exatamente em binário`;

export const PARSING_JS = `console.log(Number(''), Number(' 12 '), Number('12px'));  // 0 12 NaN
console.log(parseInt('12px'), parseFloat('1,5'));        // 12 1
console.log(0 || 10, 0 ?? 10);                           // 10 0
console.log('' || 'padrão', null ?? 'padrão');           // padrão padrão`;

export const JS_TYPES_01: Lesson = {
  id: 'js-types-01',
  moduleId: 'js-types-numbers',
  title: 'Tipos, coerção e números em JavaScript',
  summary:
    'Como o JavaScript converte valores sozinho, por que 0.1 + 0.2 não é 0.3 e como lidar com dinheiro, entradas de formulário e valores padrão sem surpresas.',
  estimatedMinutes: 35,
  difficulty: 'introductory',
  conceptIds: ['js-coercion', 'js-numbers'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Um total de R$ 59,699999999999996, uma quantidade vazia aceita como zero, um desconto de 0% trocado pelo padrão de 10%: são bugs reais, e todos vêm de regras do JavaScript que convertem valores sem avisar. Conhecer essas regras é o que permite escrever validações que funcionam.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Prever conversões automáticas (coerção) em operadores e comparações.',
            'Usar === e Number.isNaN em vez de == e isNaN.',
            'Entender os limites dos números de ponto flutuante.',
            'Trabalhar com dinheiro em centavos e formatar com Intl.',
            'Escolher entre || e ?? para valores padrão.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'O atendente que interpreta demais',
      blocks: [
        {
          type: 'paragraph',
          text: 'Imagine um atendente que, quando você entrega algo no formato errado, em vez de devolver, tenta adivinhar o que você quis dizer. Às vezes acerta; às vezes transforma "nada" em "zero" e segue em frente. A coerção do JavaScript é esse atendente. Seu trabalho é entregar as coisas no formato certo e conferir o que voltou.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Coerção, números e valores padrão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'O + com uma string concatena: 1 + "2" é "12". Os outros operadores aritméticos convertem para número: "3" * "4" é 12.',
            '== converte antes de comparar, com regras difíceis de lembrar (0 == "" é true, null == 0 é false). Use === sempre; a exceção aceitável é valor == null, que pega null e undefined juntos.',
            'NaN não é igual a nada, nem a si mesmo. Number.isNaN(x) testa sem converter; isNaN(x) converte antes, e isNaN("") é false porque "" vira 0.',
            'typeof null é "object" (um erro histórico mantido por compatibilidade) e typeof [] também. Para arrays, Array.isArray.',
            'Números são ponto flutuante binário (IEEE 754): 0.1, 0.2 e 19.9 não têm representação exata. Somas e multiplicações acumulam pequenos erros.',
            'Dinheiro: guarde e calcule em centavos (inteiros) e converta só para exibir. Para exibir, Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).',
            'Number("") é 0 e Number(" 12 ") é 12: espaços e string vazia viram número. Number("12px") é NaN; parseInt("12px") lê até onde dá e devolve 12. Nenhum dos dois entende vírgula decimal.',
            '|| troca qualquer valor falsy (0, "", false, NaN, null, undefined) pelo padrão; ?? troca só null e undefined. Para quantidades e porcentagens, em que 0 é válido, use ??.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Um detalhe que quebra testes',
          text: 'O Intl.NumberFormat em pt-BR separa "R$" do número com um espaço não separável (U+00A0), não com um espaço comum. Comparar com "R$ 1.234,50" digitado no teclado falha. Medido no Node e no Chromium.',
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: o que o console mostra',
      blocks: [
        { type: 'code', language: 'javascript', caption: 'coercao.js', code: COERCION_JS },
        { type: 'code', language: 'javascript', caption: 'numeros.js', code: NUMBERS_JS },
        { type: 'code', language: 'javascript', caption: 'entradas.js', code: PARSING_JS },
        {
          type: 'callout',
          tone: 'info',
          title: 'Este código é executado',
          text: 'Os testes da plataforma executam os três exemplos e conferem cada valor dos comentários.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Teste no console',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Rode 0.1 + 0.2 e depois (0.1 * 10 + 0.2 * 10) / 10. Por que o segundo dá 0.3?',
            'Formate 1234.5 com Intl.NumberFormat em pt-BR, en-US e de-DE e compare.',
            'Rode JSON.stringify(new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(1)) e procure o \\u00a0.',
            'Compare Number, parseInt e parseFloat com "  42  ", "4.2e1", "" e "abc".',
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
          text: 'No laboratório, escreva as funções de dinheiro de um carrinho: ler o que a pessoa digita, somar em centavos e formatar. Depois, preveja uma saída.',
        },
      ],
      exerciseIds: ['lab-js-money', 'types-01-predict'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: a quantidade vazia',
      blocks: [
        {
          type: 'code',
          language: 'javascript',
          caption: 'Pedidos chegam com quantidade 0 quando o campo fica vazio',
          code: `function lerQuantidade(texto) {
  const quantidade = Number(texto);
  if (isNaN(quantidade)) throw new Error('Quantidade inválida');
  return quantidade;
}`,
        },
      ],
      exerciseIds: ['types-01-empty'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'APIs de pagamento costumam receber valores em centavos (inteiros) justamente por causa do ponto flutuante.',
            'No Angular, o CurrencyPipe usa o Intl por baixo; o projeto precisa registrar o locale pt.',
            'TypeScript pega parte desses erros (somar string com número quando o tipo é number), mas não os que vêm de entradas: o valor de um campo é sempre string.',
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
      exerciseIds: ['types-01-equality', 'types-01-nullish', 'types-01-money'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            '=== sempre; Number.isNaN em vez de isNaN.',
            '+ com string concatena; o resto converte para número.',
            'Ponto flutuante não é exato: dinheiro em centavos.',
            'Number("") é 0: trate o vazio antes de converter.',
            '|| troca qualquer falsy; ?? só null e undefined.',
          ],
        },
      ],
    },
  ],
};
