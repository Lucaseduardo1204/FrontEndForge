import { Exercise } from '../../app/core/models/content.models';

/** Answers here are computed in jsdom (`css-examples.spec.ts`) and in a real browser (D-051). */
export const PREDICT_CASCADE_CODE = `<style>
  p { color: black; }
  .aviso { color: orange; }
  :where(.caixa) .aviso { color: green; }
  div p { color: purple; }
</style>

<div class="caixa">
  <p class="aviso">Atenção</p>
</div>`;

export const IMPORTANT_WAR_CSS = `.botao { background: blue !important; }
.formulario .botao { background: green !important; }
#salvar { background: red; }`;

export const CSS_CASCADE_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-css-cascade-fix',
    kind: 'code',
    language: 'html',
    title: 'O botão de perigo que não fica vermelho',
    difficulty: 'introductory',
    conceptIds: ['css-cascade'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O botão "Excluir conta" deveria ser vermelho, mas aparece azul como o outro. Conserte o CSS sem usar !important. Os testes conferem as cores calculadas pelo navegador, então qualquer solução correta passa.',
      },
    ],
    requirements: [
      'O botão com a classe botao--perigo tem fundo #b91c1c (vermelho).',
      'O outro botão continua com fundo #1d4ed8 (azul).',
      'Os dois botões têm texto branco.',
      'Sem !important.',
    ],
    examples: [],
    starterCode: `<style>
  #acoes button {
    background: #1d4ed8;
    color: white;
  }

  .botao--perigo {
    background: #b91c1c;
  }
</style>

<div id="acoes">
  <button type="button" class="botao">Salvar</button>
  <button type="button" class="botao botao--perigo">Excluir conta</button>
</div>
`,
    tests: [
      {
        id: 'danger-red',
        description: 'O botão de perigo tem fundo vermelho (#b91c1c)',
        source:
          "expect(getComputedStyle(document.querySelector('.botao--perigo')).backgroundColor).toBe('rgb(185, 28, 28)');",
      },
      {
        id: 'normal-blue',
        description: 'O outro botão continua azul (#1d4ed8)',
        source:
          "expect(getComputedStyle(document.querySelector('.botao:not(.botao--perigo)')).backgroundColor).toBe('rgb(29, 78, 216)');",
      },
      {
        id: 'white-text',
        description: 'Os dois botões têm texto branco',
        source:
          "for (const b of document.querySelectorAll('button')) expect(getComputedStyle(b).color).toBe('rgb(255, 255, 255)');",
      },
      {
        id: 'no-important',
        description: 'O CSS não usa !important',
        source:
          "expect(Array.from(document.querySelectorAll('style')).some((s) => s.textContent.includes('!important'))).toBe(false);",
      },
    ],
    hints: [
      'Calcule a especificidade de #acoes button e de .botao--perigo. Qual coluna decide?',
      'Você pode baixar a especificidade da regra base em vez de subir a da regra de perigo.',
      'Se as duas regras tiverem uma única classe, a que vier depois vence.',
    ],
    solution: [
      {
        type: 'code',
        language: 'html',
        code: `<style>
  .botao {
    background: #1d4ed8; /* (0, 1, 0) */
    color: white;
  }

  .botao--perigo {
    background: #b91c1c; /* (0, 1, 0), vem depois: vence */
  }
</style>

<div id="acoes">
  <button type="button" class="botao">Salvar</button>
  <button type="button" class="botao botao--perigo">Excluir conta</button>
</div>`,
      },
      {
        type: 'paragraph',
        text: '#acoes button tinha especificidade (1, 0, 1) e vencia .botao--perigo (0, 1, 0) mesmo vindo antes. Com as duas regras em uma classe cada, a ordem desempata. #acoes .botao--perigo também passaria nos testes, mas aumenta a especificidade e torna o próximo ajuste mais difícil.',
      },
    ],
  },
  {
    id: 'css-01-specificity',
    kind: 'multiple-choice',
    title: 'Qual seletor é mais específico?',
    difficulty: 'introductory',
    conceptIds: ['css-cascade'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Todos os seletores abaixo atingem <p id="aviso" class="texto destaque"> dentro do body. Qual tem a maior especificidade?',
      },
    ],
    options: [
      {
        id: 'id',
        text: '#aviso',
        explanation:
          'Correto. (1, 0, 0). Um id vence qualquer quantidade de classes, porque a coluna A é comparada antes da B.',
      },
      {
        id: 'two-classes',
        text: 'body .texto.destaque',
        explanation: 'Incorreto. (0, 2, 1): duas classes e um elemento, mas nenhum id.',
      },
      {
        id: 'pseudo',
        text: 'p.texto:first-child',
        explanation:
          'Incorreto. (0, 2, 1): a pseudo-classe :first-child conta como classe. Ainda perde para um id.',
      },
      {
        id: 'many-elements',
        text: 'html body p.destaque',
        explanation:
          'Incorreto. (0, 1, 3): três elementos e uma classe. Elementos só desempatam quando ids e classes empatam.',
      },
    ],
    correctOptionIds: ['id'],
    hints: [
      'Escreva os três números (ids, classes, elementos) de cada seletor.',
      'Compare primeiro a coluna dos ids.',
    ],
    solution: [
      {
        type: 'list',
        ordered: false,
        items: [
          '#aviso → (1, 0, 0)',
          'body .texto.destaque → (0, 2, 1)',
          'p.texto:first-child → (0, 2, 1)',
          'html body p.destaque → (0, 1, 3)',
        ],
      },
    ],
  },
  {
    id: 'css-01-important',
    kind: 'multiple-choice',
    title: 'Por que o vermelho não pega?',
    difficulty: 'introductory',
    conceptIds: ['css-cascade'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O botão é <button id="salvar" class="botao"> dentro de .formulario. Com o CSS abaixo, ele fica verde. O que está acontecendo e qual é a melhor saída?',
      },
      { type: 'code', language: 'css', code: IMPORTANT_WAR_CSS },
    ],
    options: [
      {
        id: 'importance-first',
        text: 'Declarações com !important vencem as normais antes de a especificidade ser comparada. Melhor remover os !important e organizar os seletores.',
        explanation:
          'Correto. A importância é o primeiro critério: #salvar, mesmo com id, não disputa contra declarações importantes. Entre as duas importantes, .formulario .botao (0, 2, 0) vence .botao (0, 1, 0), por isso verde.',
      },
      {
        id: 'browser-bug',
        text: 'É um erro do navegador: o id tem a maior especificidade e deveria vencer.',
        explanation:
          'Incorreto. Especificidade só desempata declarações de mesma importância. Uma normal nunca vence uma !important da mesma origem.',
      },
      {
        id: 'add-important',
        text: 'Acrescentar !important também em #salvar.',
        explanation:
          'Funciona hoje (entre importantes, o id vence), mas é exatamente a escalada que torna o CSS impossível de manter: a próxima mudança vai precisar de algo ainda mais forte.',
      },
      {
        id: 'move-up',
        text: 'Mover #salvar para o topo do arquivo.',
        explanation:
          'Incorreto. A ordem é o último critério; nada muda enquanto as outras regras forem !important.',
      },
    ],
    correctOptionIds: ['importance-first'],
    hints: [
      'Qual é o primeiro critério da cascata?',
      'Entre as duas regras com !important, qual tem maior especificidade?',
    ],
    solution: [
      {
        type: 'code',
        language: 'css',
        code: `.botao { background: blue; }
.botao--sucesso { background: green; }
.botao--perigo { background: red; }`,
      },
      {
        type: 'paragraph',
        text: 'Sem !important e com uma classe por variante, cada botão escolhe a cor pela classe que recebe, e nenhuma regra precisa vencer a outra pela força.',
      },
    ],
  },
  {
    id: 'css-01-predict',
    kind: 'predict-output',
    title: 'De que cor fica o texto?',
    difficulty: 'introductory',
    conceptIds: ['css-cascade'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Qual é a cor final do texto "Atenção"? Responda com o nome da cor como está no CSS (em inglês) ou em português.',
      },
    ],
    language: 'html',
    code: PREDICT_CASCADE_CODE,
    acceptedAnswers: ['green', 'verde'],
    explanation:
      ':where(.caixa) não conta, então :where(.caixa) .aviso vale (0, 1, 0), igual a .aviso. Empate: vence a que vem depois, green. div p vale (0, 0, 2) e perde para qualquer seletor com uma classe.',
    commonMistakes: [
      {
        answer: 'purple',
        explanation:
          'div p tem dois elementos, (0, 0, 2). Uma classe, (0, 1, 0), vence qualquer quantidade de elementos, mesmo que div p venha por último.',
      },
      {
        answer: 'roxo',
        explanation:
          'div p tem dois elementos, (0, 0, 2). Uma classe, (0, 1, 0), vence qualquer quantidade de elementos, mesmo que div p venha por último.',
      },
      {
        answer: 'orange',
        explanation:
          ':where(...) tem especificidade zero, mas o .aviso fora dele conta. As duas regras empatam em (0, 1, 0) e a que vem depois vence.',
      },
      {
        answer: 'laranja',
        explanation:
          ':where(...) tem especificidade zero, mas o .aviso fora dele conta. As duas regras empatam em (0, 1, 0) e a que vem depois vence.',
      },
    ],
    wrongAnswerGuidance:
      'Não é isso. Calcule a especificidade de cada regra (lembrando que :where não conta) e, em caso de empate, veja qual vem por último.',
    hints: [
      'Quais regras atingem o <p>? Todas.',
      'Quanto vale :where(.caixa)?',
      'Empate de especificidade: o que decide?',
    ],
    solution: [
      {
        type: 'list',
        ordered: false,
        items: [
          'p → (0, 0, 1)',
          '.aviso → (0, 1, 0)',
          ':where(.caixa) .aviso → (0, 1, 0), depois de .aviso: vence',
          'div p → (0, 0, 2)',
        ],
      },
    ],
  },
  {
    id: 'css-01-inheritance',
    kind: 'multiple-choice',
    title: 'O que o parágrafo herda?',
    difficulty: 'introductory',
    conceptIds: ['css-inheritance'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Um <p> sem estilo próprio está dentro de um elemento com a classe cartao, estilizado assim. Marque todas as propriedades que o <p> recebe por herança.',
      },
      {
        type: 'code',
        language: 'css',
        code: `.cartao {
  color: #1d4ed8;
  font-family: Georgia, serif;
  border: 2px solid #1d4ed8;
  padding: 1rem;
}`,
      },
    ],
    options: [
      {
        id: 'color',
        text: 'color',
        explanation: 'Correto. color é herdada: o texto do parágrafo fica azul.',
      },
      {
        id: 'font-family',
        text: 'font-family',
        explanation: 'Correto. Propriedades de fonte são herdadas.',
      },
      {
        id: 'border',
        text: 'border',
        explanation:
          'Incorreto. border não é herdada; se fosse, cada elemento dentro do cartão ganharia sua própria borda.',
      },
      {
        id: 'padding',
        text: 'padding',
        explanation:
          'Incorreto. padding não é herdado: o do parágrafo continua no valor inicial, 0. O espaço que você vê é o do cartão, em volta dele.',
      },
    ],
    correctOptionIds: ['color', 'font-family'],
    hints: [
      'Se border fosse herdada, como ficaria um cartão com vários parágrafos?',
      'Propriedades de texto costumam herdar; propriedades de caixa, não.',
    ],
    solution: [
      {
        type: 'paragraph',
        text: 'color e font-family passam para o parágrafo; border e padding ficam só no cartão.',
      },
    ],
  },
  {
    id: 'css-01-order-criteria',
    kind: 'order-steps',
    title: 'A ordem dos critérios',
    difficulty: 'introductory',
    conceptIds: ['css-cascade'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Duas declarações da sua folha de estilos disputam a mesma propriedade do mesmo elemento. Ordene os critérios do primeiro ao último a ser comparado.',
      },
    ],
    items: [
      {
        id: 'importance',
        text: 'Importância (!important)',
        why: 'Uma declaração importante vence as normais sem que nada mais seja comparado.',
      },
      {
        id: 'style-attribute',
        text: 'Estilo no atributo style do elemento',
        why: 'Entre declarações de mesma importância, o atributo style vence qualquer seletor, antes de camadas e especificidade.',
      },
      {
        id: 'layers',
        text: 'Camada (@layer)',
        why: 'Camadas são comparadas antes da especificidade: um seletor fraco numa camada posterior vence um forte numa anterior.',
      },
      {
        id: 'specificity',
        text: 'Especificidade do seletor',
        why: 'Só decide quando importância, atributo style e camada empatam.',
      },
      {
        id: 'order',
        text: 'Ordem em que aparecem no código',
        why: 'É o último desempate: só conta quando tudo o mais é igual.',
      },
    ],
    explanation:
      'Cada critério só é usado quando os anteriores empatam. É por isso que mudar a ordem não resolve um conflito de especificidade, e que especificidade não vence !important.',
    hints: [
      'Qual critério faz um id perder?',
      'Qual é o desempate final, usado quando tudo é igual?',
    ],
    solution: [
      {
        type: 'list',
        ordered: true,
        items: ['!important', 'Atributo style', '@layer', 'Especificidade', 'Ordem'],
      },
    ],
  },
];
