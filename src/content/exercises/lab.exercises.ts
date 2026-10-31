import { CodeExercise } from '../../app/core/models/content.models';

/**
 * Code exercises of the Lab. Tests check behaviour (what the function returns or what the
 * page contains), never the exact text of the code, so different valid solutions pass.
 */
export const LAB_EXERCISES: readonly CodeExercise[] = [
  {
    id: 'lab-js-sum-even',
    kind: 'code',
    language: 'javascript',
    title: 'Some os números pares',
    difficulty: 'introductory',
    conceptIds: ['js-arrays'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Escreva a função somarPares(numeros), que recebe um array de números inteiros e retorna a soma apenas dos números pares.',
      },
    ],
    requirements: [
      'A função se chama somarPares e recebe um array.',
      'Retorna 0 para um array vazio.',
      'Números negativos pares também entram na soma.',
      'O array recebido não pode ser alterado.',
    ],
    examples: [
      { input: 'somarPares([1, 2, 3, 4])', output: '6' },
      { input: 'somarPares([])', output: '0' },
      { input: 'somarPares([-2, 3])', output: '-2' },
    ],
    starterCode: `function somarPares(numeros) {
  // Seu código aqui
}

console.log(somarPares([1, 2, 3, 4])); // esperado: 6
`,
    tests: [
      {
        id: 'basic',
        description: 'Soma os pares de [1, 2, 3, 4] (resultado 6)',
        source: 'expect(somarPares([1, 2, 3, 4])).toBe(6);',
      },
      {
        id: 'empty',
        description: 'Retorna 0 para um array vazio',
        source: 'expect(somarPares([])).toBe(0);',
      },
      {
        id: 'negative',
        description: 'Inclui pares negativos ([-2, 3, -4] resulta em -6)',
        source: 'expect(somarPares([-2, 3, -4])).toBe(-6);',
      },
      {
        id: 'no-even',
        description: 'Retorna 0 quando não há pares',
        source: 'expect(somarPares([1, 3, 5])).toBe(0);',
      },
      {
        id: 'immutable',
        description: 'Não altera o array recebido',
        source: 'const lista = [4, 1, 2]; somarPares(lista); expect(lista).toEqual([4, 1, 2]);',
      },
    ],
    hints: [
      'Um número é par quando o resto da divisão por 2 é zero: n % 2 === 0.',
      'Cuidado: em JavaScript, -3 % 2 é -1, não 1. Comparar com 0 evita esse problema.',
      'Você pode usar um for...of com um acumulador, ou combinar filter e reduce.',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        caption: 'Com filter e reduce',
        code: `function somarPares(numeros) {
  return numeros
    .filter((n) => n % 2 === 0) // cria um novo array só com os pares
    .reduce((soma, n) => soma + n, 0); // 0 é o valor inicial: array vazio soma 0
}`,
      },
      {
        type: 'paragraph',
        text: 'filter e reduce não alteram o array original. O valor inicial 0 no reduce é essencial: sem ele, reduce em um array vazio lança TypeError.',
      },
      {
        type: 'code',
        language: 'javascript',
        caption: 'Alternativa com laço',
        code: `function somarPares(numeros) {
  let soma = 0;
  for (const n of numeros) {
    if (n % 2 === 0) soma += n;
  }
  return soma;
}`,
      },
    ],
  },
  {
    id: 'lab-js-count-occurrences',
    kind: 'code',
    language: 'javascript',
    title: 'Conte as ocorrências',
    difficulty: 'intermediate',
    conceptIds: ['js-objects'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Escreva contarOcorrencias(itens), que recebe um array de strings e retorna um objeto em que cada chave é um item e o valor é quantas vezes ele aparece. Itens que diferem só em maiúsculas/minúsculas contam como o mesmo item, e as chaves ficam em minúsculas.',
      },
    ],
    requirements: [
      'Retorna um objeto simples, por exemplo { html: 2, css: 1 }.',
      'Ignora diferença entre maiúsculas e minúsculas e usa a chave em minúsculas.',
      'Retorna {} para um array vazio.',
    ],
    examples: [
      { input: "contarOcorrencias(['HTML', 'css', 'html'])", output: '{ html: 2, css: 1 }' },
      { input: 'contarOcorrencias([])', output: '{}' },
    ],
    starterCode: `function contarOcorrencias(itens) {
  // Seu código aqui
}

console.log(contarOcorrencias(['HTML', 'css', 'html']));
`,
    tests: [
      {
        id: 'basic',
        description: 'Conta itens repetidos',
        source: "expect(contarOcorrencias(['a', 'b', 'a'])).toEqual({ a: 2, b: 1 });",
      },
      {
        id: 'case',
        description: 'Trata maiúsculas e minúsculas como o mesmo item',
        source: "expect(contarOcorrencias(['HTML', 'css', 'html'])).toEqual({ html: 2, css: 1 });",
      },
      {
        id: 'empty',
        description: 'Retorna um objeto vazio para um array vazio',
        source: 'expect(contarOcorrencias([])).toEqual({});',
      },
      {
        id: 'proto',
        description: 'Funciona com nomes como "constructor" e "toString"',
        source:
          "expect(contarOcorrencias(['constructor', 'toString', 'constructor'])).toEqual({ constructor: 2, tostring: 1 });",
      },
    ],
    hints: [
      'Comece com um objeto vazio e percorra o array, somando 1 na chave de cada item.',
      'Use item.toLowerCase() para normalizar a chave.',
      'Cuidado com "constructor": em um objeto criado com {}, contagem["constructor"] já existe (vem do protótipo). Use Object.hasOwn para verificar se a chave é sua, ou crie o objeto com Object.create(null) e converta no final.',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `function contarOcorrencias(itens) {
  const contagem = {};
  for (const item of itens) {
    const chave = item.toLowerCase();
    // Object.hasOwn ignora propriedades herdadas como "constructor".
    contagem[chave] = Object.hasOwn(contagem, chave) ? contagem[chave] + 1 : 1;
  }
  return contagem;
}`,
      },
      {
        type: 'paragraph',
        text: 'A versão ingênua (contagem[chave] = (contagem[chave] || 0) + 1) falha com "constructor": contagem["constructor"] é a função Object herdada do protótipo, e somar 1 a ela gera uma string estranha. É um bug clássico de usar objetos como dicionário. Um Map também resolve, mas o exercício pede um objeto simples.',
      },
    ],
  },
  {
    id: 'lab-ts-order-status',
    kind: 'code',
    language: 'typescript',
    title: 'Descreva o pedido com narrowing',
    difficulty: 'intermediate',
    conceptIds: ['ts-narrowing'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O tipo Pedido é uma união discriminada pelo campo status. Implemente descreverPedido(pedido) retornando o texto de cada caso, exatamente como nos exemplos.',
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Sobre a verificação de tipos',
        text: 'No laboratório, o TypeScript é convertido para JavaScript antes de rodar: os tipos são removidos, não verificados. Os testes avaliam o comportamento. Use os tipos para pensar no problema, como faria no editor.',
      },
    ],
    requirements: [
      'Pendente: "Aguardando pagamento".',
      'Enviado: "Enviado (rastreio XYZ)", com o código de rastreio do pedido.',
      'Cancelado: "Cancelado: <motivo>".',
    ],
    examples: [
      { input: "descreverPedido({ status: 'pendente' })", output: '"Aguardando pagamento"' },
      {
        input: "descreverPedido({ status: 'enviado', codigoRastreio: 'BR123' })",
        output: '"Enviado (rastreio BR123)"',
      },
      {
        input: "descreverPedido({ status: 'cancelado', motivo: 'sem estoque' })",
        output: '"Cancelado: sem estoque"',
      },
    ],
    starterCode: `type Pedido =
  | { status: 'pendente' }
  | { status: 'enviado'; codigoRastreio: string }
  | { status: 'cancelado'; motivo: string };

function descreverPedido(pedido: Pedido): string {
  // Seu código aqui
  return '';
}

console.log(descreverPedido({ status: 'enviado', codigoRastreio: 'BR123' }));
`,
    tests: [
      {
        id: 'pending',
        description: 'Descreve um pedido pendente',
        source: "expect(descreverPedido({ status: 'pendente' })).toBe('Aguardando pagamento');",
      },
      {
        id: 'shipped',
        description: 'Inclui o código de rastreio de um pedido enviado',
        source:
          "expect(descreverPedido({ status: 'enviado', codigoRastreio: 'BR9' })).toBe('Enviado (rastreio BR9)');",
      },
      {
        id: 'cancelled',
        description: 'Inclui o motivo do cancelamento',
        source:
          "expect(descreverPedido({ status: 'cancelado', motivo: 'sem estoque' })).toBe('Cancelado: sem estoque');",
      },
    ],
    hints: [
      'Use um switch em pedido.status. Dentro de cada case, o TypeScript sabe quais campos existem.',
      'Template strings ajudam: `Enviado (rastreio ${pedido.codigoRastreio})`.',
      'Para garantir que todos os casos foram tratados, um default com uma variável do tipo never faz o compilador reclamar se um novo status for adicionado.',
    ],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `function descreverPedido(pedido: Pedido): string {
  switch (pedido.status) {
    case 'pendente':
      return 'Aguardando pagamento';
    case 'enviado':
      // Aqui o tipo foi estreitado: codigoRastreio existe.
      return \`Enviado (rastreio \${pedido.codigoRastreio})\`;
    case 'cancelado':
      return \`Cancelado: \${pedido.motivo}\`;
    default: {
      // Se um novo status for criado e esquecido aqui, esta linha não compila.
      const naoTratado: never = pedido;
      return naoTratado;
    }
  }
}`,
      },
      {
        type: 'paragraph',
        text: 'O campo status é o discriminante da união. Cada case estreita o tipo (narrowing) e libera os campos daquele formato. O default com never é a verificação de exaustividade: ela só existe em tempo de compilação, e por isso vale ter também testes de comportamento.',
      },
    ],
  },
  {
    id: 'lab-html-semantic-card',
    kind: 'code',
    language: 'html',
    title: 'Cartão de produto semântico',
    difficulty: 'introductory',
    conceptIds: ['html-semantic-elements'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Monte o cartão de um produto usando os elementos certos. A prévia ao lado mostra o resultado e os testes verificam a estrutura da página, não o texto exato do seu código.',
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Scripts ficam desligados na prévia',
        text: 'Este exercício é de HTML e CSS. Por segurança, a prévia bloqueia <script>, atributos como onclick e qualquer acesso à rede. Imagens externas não carregam.',
      },
    ],
    requirements: [
      'Um <article> envolvendo o cartão.',
      'Um título <h2> dentro do article com o nome do produto.',
      'Uma imagem <img> com texto alternativo (alt) descrevendo o produto.',
      'Um <button type="button"> com o texto "Adicionar ao carrinho".',
      'Um <style> que limite a largura do article (max-width).',
    ],
    examples: [],
    starterCode: `<style>
  article {
    /* limite a largura do cartão aqui */
  }
</style>

<div class="card">
  <div class="title">Teclado mecânico</div>
  <img src="teclado.png">
  <p>Switches silenciosos e layout ABNT2.</p>
  <div class="button">Adicionar ao carrinho</div>
</div>
`,
    tests: [
      {
        id: 'article',
        description: 'Usa um <article> para o cartão',
        source: "expect(document.querySelector('article')).toBeTruthy();",
      },
      {
        id: 'heading',
        description: 'Tem um <h2> com o nome do produto dentro do article',
        source:
          "const h2 = document.querySelector('article h2'); expect(h2).toBeTruthy(); expect(h2.textContent.trim().length > 0).toBe(true);",
      },
      {
        id: 'img-alt',
        description: 'A imagem tem texto alternativo (alt não vazio)',
        source:
          "const img = document.querySelector('article img'); expect(img).toBeTruthy(); expect((img.getAttribute('alt') || '').trim().length > 0).toBe(true);",
      },
      {
        id: 'button',
        description: 'O botão é um <button type="button"> com o texto "Adicionar ao carrinho"',
        source:
          "const b = Array.from(document.querySelectorAll('article button')).find((x) => x.textContent.trim() === 'Adicionar ao carrinho'); expect(b).toBeTruthy(); expect(b.type).toBe('button');",
      },
      {
        id: 'max-width',
        description: 'O article tem largura máxima definida no CSS',
        source:
          "expect(getComputedStyle(document.querySelector('article')).maxWidth !== 'none').toBe(true);",
      },
    ],
    hints: [
      'Troque a div externa por <article>, a div do título por <h2> e a div do botão por <button>.',
      'O alt descreve a imagem para quem não a vê, por exemplo alt="Teclado mecânico preto visto de cima".',
      'Sem type, um <button> dentro de um formulário vira botão de envio. Declare type="button" para deixar a intenção explícita.',
    ],
    solution: [
      {
        type: 'code',
        language: 'html',
        code: `<style>
  article {
    max-width: 20rem; /* cartão não estica em telas largas */
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
  }
  img { max-width: 100%; }
</style>

<article>
  <h2>Teclado mecânico</h2>
  <img src="teclado.png" alt="Teclado mecânico preto visto de cima">
  <p>Switches silenciosos e layout ABNT2.</p>
  <button type="button">Adicionar ao carrinho</button>
</article>`,
      },
      {
        type: 'paragraph',
        text: 'Um <div> com aparência de botão não recebe foco pelo teclado nem é anunciado como botão. O <button> faz isso sem nenhum código extra. O <article> indica um conteúdo independente, e o <h2> entra na estrutura de títulos que leitores de tela usam para navegar.',
      },
    ],
  },
];
