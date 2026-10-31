import { Exercise } from '../../app/core/models/content.models';

export const JS_COLLECTIONS_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-js-contacts',
    kind: 'code',
    language: 'javascript',
    title: 'Contatos sem duplicados',
    difficulty: 'introductory',
    conceptIds: ['js-collections'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Uma lista de contatos veio de três planilhas diferentes. Escreva deduplicar(contatos) e contarPorDominio(contatos).',
      },
    ],
    requirements: [
      'deduplicar mantém o primeiro contato de cada e-mail, na ordem original; e-mails iguais ignorando maiúsculas e espaços em volta são o mesmo.',
      'deduplicar devolve os contatos com o e-mail normalizado (minúsculas, sem espaços em volta), sem alterar a lista original.',
      'Contatos sem e-mail (ausente ou vazio) são descartados por deduplicar.',
      'contarPorDominio devolve uma lista de [dominio, total] (o domínio é o que vem depois do @, em minúsculas), do maior total para o menor; empates em ordem alfabética. Use a lista já deduplicada.',
    ],
    examples: [
      {
        input:
          "deduplicar([{ nome: 'Ana', email: 'ANA@x.com ' }, { nome: 'Ana 2', email: 'ana@x.com' }])",
        output: "[{ nome: 'Ana', email: 'ana@x.com' }]",
      },
    ],
    starterCode: `function deduplicar(contatos) {
  // Seu código aqui
}

function contarPorDominio(contatos) {
  // Seu código aqui
}

console.log(deduplicar([{ nome: 'Ana', email: 'ANA@x.com ' }, { nome: 'Ana 2', email: 'ana@x.com' }]));
`,
    tests: [
      {
        id: 'first-wins',
        description: 'Mantém o primeiro de cada e-mail, ignorando caixa e espaços',
        source:
          "const r = deduplicar([{ nome: 'Ana', email: 'ANA@x.com ' }, { nome: 'Bia', email: 'bia@y.com' }, { nome: 'Ana 2', email: 'ana@x.com' }]); expect(r).toEqual([{ nome: 'Ana', email: 'ana@x.com' }, { nome: 'Bia', email: 'bia@y.com' }]);",
      },
      {
        id: 'no-mutation',
        description: 'Não altera a lista original',
        source:
          "const original = [{ nome: 'Ana', email: ' ANA@x.com' }]; deduplicar(original); expect(original[0].email).toBe(' ANA@x.com');",
      },
      {
        id: 'no-email',
        description: 'Descarta contatos sem e-mail',
        source:
          "expect(deduplicar([{ nome: 'Sem' }, { nome: 'Vazio', email: '  ' }, { nome: 'Ok', email: 'ok@z.com' }]).map((c) => c.nome)).toEqual(['Ok']);",
      },
      {
        id: 'domains',
        description: 'Conta por domínio, do maior para o menor, empates em ordem alfabética',
        source:
          "const contatos = [{ email: 'a@Loja.com' }, { email: 'b@loja.com' }, { email: 'c@beta.org' }, { email: 'd@alfa.org' }, { email: 'A@LOJA.COM' }]; expect(contarPorDominio(contatos)).toEqual([['loja.com', 2], ['alfa.org', 1], ['beta.org', 1]]);",
      },
      {
        id: 'empty',
        description: 'Listas vazias',
        source: 'expect(deduplicar([])).toEqual([]); expect(contarPorDominio([])).toEqual([]);',
      },
    ],
    hints: [
      'Um Set de e-mails normalizados responde "já vi este?".',
      'Copie cada contato com spread antes de trocar o e-mail.',
      'Map para a contagem: get(dominio) ?? 0, depois [...mapa].sort(...).',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `const normalizar = (email) => (email ?? '').trim().toLowerCase();

function deduplicar(contatos) {
  const vistos = new Set();
  const resultado = [];
  for (const contato of contatos) {
    const email = normalizar(contato.email);
    if (!email || vistos.has(email)) continue;
    vistos.add(email);
    resultado.push({ ...contato, email }); // cópia: a lista original não muda
  }
  return resultado;
}

function contarPorDominio(contatos) {
  const contagem = new Map();
  for (const { email } of deduplicar(contatos)) {
    const dominio = email.split('@')[1];
    contagem.set(dominio, (contagem.get(dominio) ?? 0) + 1);
  }
  return [...contagem].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}`,
      },
      {
        type: 'paragraph',
        text: 'O Set responde em tempo constante se um e-mail já apareceu, e o Map conta sem os riscos de um objeto como dicionário: domínios como "__proto__" ou numéricos não alteram nada. A normalização num só lugar garante que deduplicar e contar usem a mesma regra.',
      },
    ],
  },
  {
    id: 'collections-01-choose',
    kind: 'multiple-choice',
    title: 'Qual coleção?',
    difficulty: 'introductory',
    conceptIds: ['js-collections'],
    prompt: [{ type: 'paragraph', text: 'Qual associação está correta?' }],
    options: [
      {
        id: 'right',
        text: 'Ids de itens já selecionados: Set. Cache de respostas por objeto de requisição: Map. Dados de um usuário (nome, e-mail): objeto.',
        explanation:
          'Correto. Set para pertinência sem repetição; Map quando a chave não é texto (ou é arbitrária); objeto para registros com campos conhecidos.',
      },
      {
        id: 'object-cache',
        text: 'Cache por objeto de requisição: objeto comum.',
        explanation:
          'Incorreto. Objetos como chave viram "[object Object]": todas as requisições colidem.',
      },
      {
        id: 'array-selected',
        text: 'Ids selecionados: array, verificando com includes.',
        explanation:
          'Funciona, mas permite repetições e fica lento em listas grandes; Set expressa a intenção.',
      },
      {
        id: 'map-user',
        text: 'Dados de um usuário: Map.',
        explanation:
          'Possível, mas um registro de campos conhecidos é mais claro (e tipável) como objeto.',
      },
    ],
    correctOptionIds: ['right'],
    hints: ['Que tipo de chave cada caso usa?'],
    solution: [{ type: 'paragraph', text: 'Set: pertinência. Map: dicionário. Objeto: registro.' }],
  },
  {
    id: 'collections-01-order',
    kind: 'multiple-choice',
    title: 'O catálogo fora de ordem',
    difficulty: 'introductory',
    conceptIds: ['js-objects', 'js-collections'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Na etapa de depuração, por que a ordem mudou, e qual é a correção?',
      },
    ],
    options: [
      {
        id: 'integer-keys',
        text: 'Chaves de objeto que parecem inteiros são listadas em ordem crescente, não na de inserção. Use um Map (ou mantenha o array para a ordem).',
        explanation:
          'Correto. Medido no Node: { b, 2, a, 1, "-1", "10" } listou 1 2 10 b a -1. Um Map mantém a ordem de inserção para qualquer chave.',
      },
      {
        id: 'sort',
        text: 'Object.keys ordena as chaves alfabeticamente.',
        explanation:
          'Incorreto. Chaves de texto comuns ficam na ordem de inserção; só as inteiras são ordenadas.',
      },
      {
        id: 'random',
        text: 'A ordem de objetos é aleatória.',
        explanation: 'Incorreto. A ordem é definida pela especificação, só não é a que se espera.',
      },
      {
        id: 'string',
        text: 'Converter os códigos com String() resolve.',
        explanation: 'Incorreto. As chaves já são texto; o que conta é parecerem inteiros.',
      },
    ],
    correctOptionIds: ['integer-keys'],
    hints: ['Os códigos são números.'],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `const catalogo = new Map(produtosNaOrdemCadastrada.map((p) => [p.codigo, p]));
for (const p of catalogo.values()) render(p);`,
      },
    ],
  },
  {
    id: 'collections-01-default',
    kind: 'multiple-choice',
    title: 'Quando o padrão vale?',
    difficulty: 'introductory',
    conceptIds: ['js-objects'],
    prompt: [
      {
        type: 'paragraph',
        text: 'function abrir({ zoom = 100 } = {}) { return zoom; } Quanto valem abrir({ zoom: 0 }), abrir({ zoom: null }) e abrir({})?',
      },
    ],
    options: [
      {
        id: 'right',
        text: '0, null e 100.',
        explanation:
          'Correto. O padrão só entra quando o valor é undefined. Medido nos exemplos da lição: null e "" passaram direto, e só undefined virou o padrão.',
      },
      {
        id: 'falsy',
        text: '100, 100 e 100.',
        explanation:
          'Isso seria o comportamento de ||, que troca qualquer falsy. O padrão da desestruturação é como ??, só que apenas para undefined.',
      },
      {
        id: 'null-default',
        text: '0, 100 e 100.',
        explanation: 'null não aciona o padrão da desestruturação (embora acione o ??).',
      },
      {
        id: 'error',
        text: 'Erro em abrir({}).',
        explanation: 'Incorreto. A propriedade ausente é undefined, e o padrão se aplica.',
      },
    ],
    correctOptionIds: ['right'],
    hints: ['Qual valor exato aciona o padrão?'],
    solution: [{ type: 'paragraph', text: 'Só undefined usa o padrão.' }],
  },
  {
    id: 'collections-01-set',
    kind: 'multiple-choice',
    title: 'Quantos itens no Set?',
    difficulty: 'introductory',
    conceptIds: ['js-collections'],
    prompt: [{ type: 'paragraph', text: "Qual é o size de new Set([1, '1', NaN, NaN, 0, -0])?" }],
    options: [
      {
        id: '4',
        text: '4: 1, "1", NaN e 0.',
        explanation:
          'Correto. 1 e "1" são diferentes (sem conversão), NaN é igual a NaN dentro de um Set, e 0 e -0 são iguais. Executado nos testes.',
      },
      {
        id: '3',
        text: '3: 1, NaN e 0.',
        explanation: 'Set não converte tipos: 1 e "1" são valores diferentes.',
      },
      {
        id: '5',
        text: '5: NaN não é igual a NaN.',
        explanation:
          'Fora do Set, NaN !== NaN; dentro, a comparação SameValueZero trata NaN como igual.',
      },
      {
        id: '6',
        text: '6: Set não remove nada que não seja idêntico.',
        explanation: 'Incorreto. Os dois NaN e o 0/-0 se juntam.',
      },
    ],
    correctOptionIds: ['4'],
    hints: ['Set usa SameValueZero.'],
    solution: [{ type: 'paragraph', text: 'size 4.' }],
  },
  {
    id: 'collections-01-object-key',
    kind: 'multiple-choice',
    title: 'O cache que nunca acerta',
    difficulty: 'introductory',
    conceptIds: ['js-objects', 'js-collections'],
    prompt: [
      {
        type: 'paragraph',
        text: 'const cache = {}; cache[filtros] = resultado; (filtros é um objeto). Depois de várias buscas diferentes, a tela mostra o resultado de outra busca. Por quê?',
      },
    ],
    options: [
      {
        id: 'string-key',
        text: 'Todo objeto usado como chave vira o texto "[object Object]": todas as buscas gravam e leem a mesma chave.',
        explanation:
          'Correto. Medido: Object.keys mostrou "[object Object]". Com Map, a chave é o próprio objeto (pela referência); para buscas iguais com objetos diferentes, use uma chave de texto estável, como JSON.stringify de um objeto com campos em ordem fixa.',
      },
      {
        id: 'ref',
        text: 'O cache guarda a referência e o resultado muda depois.',
        explanation: 'O problema acontece antes: todas as buscas usam a mesma chave.',
      },
      {
        id: 'size',
        text: 'O objeto atingiu o limite de chaves.',
        explanation: 'Incorreto. Não há limite prático aqui; há uma só chave.',
      },
      {
        id: 'async',
        text: 'Respostas fora de ordem.',
        explanation:
          'Pode acontecer em buscas, mas aqui a colisão de chaves explica o sintoma mesmo sem concorrência.',
      },
    ],
    correctOptionIds: ['string-key'],
    hints: ['Qual é a chave que de fato foi gravada?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Chaves arbitrárias: Map. Chave de objeto por valor: um texto estável.',
      },
    ],
  },
];
