import { Exercise } from '../../app/core/models/content.models';

export const PERF_RUNTIME_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-js-list-diff',
    kind: 'code',
    language: 'javascript',
    title: 'O plano de atualização de uma lista',
    difficulty: 'intermediate',
    conceptIds: ['perf-rendering'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Escreva planejarAtualizacao(anteriores, novos, chave), o cálculo que um @for faz a cada mudança: anteriores e novos são listas de itens, e chave(item) devolve a identidade de cada um (o track).',
      },
    ],
    requirements: [
      'criar: as chaves que estão em novos e não estavam em anteriores, na ordem de novos.',
      'remover: as chaves que estavam em anteriores e não estão em novos, na ordem de anteriores.',
      'reaproveitar: as chaves presentes nas duas, na ordem de novos.',
      'Se novos tiver duas vezes a mesma chave, lance um Error com a mensagem "Chave duplicada: X" (X é a chave).',
      'Com chave = (item, indice) => indice (o track $index), uma lista reordenada não cria nem remove nada: reaproveita todas as posições.',
    ],
    examples: [
      {
        input: 'planejarAtualizacao([{ id: 1 }, { id: 2 }], [{ id: 2 }, { id: 3 }], (t) => t.id)',
        output: '{ criar: [3], remover: [1], reaproveitar: [2] }',
      },
    ],
    starterCode: `function planejarAtualizacao(anteriores, novos, chave) {
  // Seu código aqui
}

console.log(planejarAtualizacao([{ id: 1 }, { id: 2 }], [{ id: 2 }, { id: 3 }], (t) => t.id));
`,
    tests: [
      {
        id: 'basic',
        description: 'Cria, remove e reaproveita pelas chaves',
        source:
          'expect(planejarAtualizacao([{ id: 1 }, { id: 2 }], [{ id: 2 }, { id: 3 }], (t) => t.id)).toEqual({ criar: [3], remover: [1], reaproveitar: [2] });',
      },
      {
        id: 'reorder',
        description: 'Reordenar só reaproveita, na nova ordem',
        source:
          'expect(planejarAtualizacao([{ id: 1 }, { id: 2 }, { id: 3 }], [{ id: 3 }, { id: 1 }, { id: 2 }], (t) => t.id)).toEqual({ criar: [], remover: [], reaproveitar: [3, 1, 2] });',
      },
      {
        id: 'copies',
        description: 'Cópias com as mesmas chaves são reaproveitadas',
        source:
          "const antes = [{ id: 1, n: 'a' }, { id: 2, n: 'b' }]; const copias = antes.map((t) => ({ ...t })); expect(planejarAtualizacao(antes, copias, (t) => t.id)).toEqual({ criar: [], remover: [], reaproveitar: [1, 2] });",
      },
      {
        id: 'by-object',
        description: 'Com a chave sendo o próprio objeto, cópias recriam tudo',
        source:
          'const antes = [{ id: 1 }, { id: 2 }]; const copias = antes.map((t) => ({ ...t })); const plano = planejarAtualizacao(antes, copias, (t) => t); expect(plano.criar.length).toBe(2); expect(plano.remover.length).toBe(2); expect(plano.reaproveitar.length).toBe(0);',
      },
      {
        id: 'by-index',
        description: 'Com a chave sendo o índice, reordenar reaproveita todas as posições',
        source:
          'expect(planejarAtualizacao([{ id: 1 }, { id: 2 }], [{ id: 2 }, { id: 1 }], (t, i) => i)).toEqual({ criar: [], remover: [], reaproveitar: [0, 1] });',
      },
      {
        id: 'duplicate',
        description: 'Chave duplicada em novos lança erro',
        source:
          "let mensagem = ''; try { planejarAtualizacao([], [{ id: 7 }, { id: 7 }], (t) => t.id); } catch (e) { mensagem = e.message; } expect(mensagem).toBe('Chave duplicada: 7');",
      },
    ],
    hints: [
      'Calcule as chaves de cada lista com map((item, i) => chave(item, i)).',
      'Um Set com as chaves anteriores responde "já existia?" de forma rápida.',
      'Detecte duplicatas enquanto monta o Set das chaves novas.',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `function planejarAtualizacao(anteriores, novos, chave) {
  const chavesAntes = new Set(anteriores.map((item, i) => chave(item, i)));
  const chavesNovas = new Set();
  const criar = [];
  const reaproveitar = [];

  novos.forEach((item, i) => {
    const k = chave(item, i);
    if (chavesNovas.has(k)) throw new Error(\`Chave duplicada: \${k}\`);
    chavesNovas.add(k);
    (chavesAntes.has(k) ? reaproveitar : criar).push(k);
  });

  const remover = [...chavesAntes].filter((k) => !chavesNovas.has(k));
  return { criar, remover, reaproveitar };
}`,
      },
      {
        type: 'paragraph',
        text: 'Os testes mostram as três formas de track: pela chave do dado, as cópias são reaproveitadas; pelo objeto, cópias nunca são "o mesmo", e tudo é recriado; pelo índice, a reordenação reaproveita posições, o que explica o estado do DOM ficar na linha errada. O Angular faz este cálculo de forma otimizada e ainda move os elementos para a nova ordem.',
      },
    ],
  },
  {
    id: 'runtime-01-choose-track',
    kind: 'multiple-choice',
    title: 'Qual track?',
    difficulty: 'intermediate',
    conceptIds: ['angular-control-flow'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Uma tabela de pedidos vem da API a cada 30 segundos, com seleção por checkbox em cada linha. Cada pedido tem um campo numero, único e estável. Qual track usar?',
      },
    ],
    options: [
      {
        id: 'numero',
        text: 'track pedido.numero',
        explanation:
          'Correto. A chave estável faz cada linha continuar sendo a mesma entre recargas: o elemento é reaproveitado e a seleção fica no pedido certo.',
      },
      {
        id: 'object',
        text: 'track pedido',
        explanation:
          'Cada recarga traz objetos novos: medido, nenhum elemento foi reaproveitado com cópias. A tabela inteira seria recriada a cada 30 segundos.',
      },
      {
        id: 'index',
        text: 'track $index',
        explanation:
          'Se um pedido novo entrar no topo, todas as seleções deslizam para a linha de baixo.',
      },
      {
        id: 'random',
        text: 'track Math.random()',
        explanation: 'Uma chave nova a cada vez: tudo seria recriado em toda atualização.',
      },
    ],
    correctOptionIds: ['numero'],
    hints: ['O que identifica o mesmo pedido entre duas respostas da API?'],
    solution: [
      {
        type: 'code',
        language: 'html',
        code: `@for (pedido of pedidos(); track pedido.numero) { … }`,
      },
    ],
  },
  {
    id: 'runtime-01-wrong-row',
    kind: 'multiple-choice',
    title: 'A anotação na linha errada',
    difficulty: 'intermediate',
    conceptIds: ['angular-control-flow'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Na etapa de depuração, por que a anotação muda de tarefa depois de ordenar?',
      },
    ],
    options: [
      {
        id: 'index',
        text: 'track $index liga cada elemento à posição: depois de ordenar, o Angular mantém os elementos (com o texto digitado) no lugar e só troca os títulos. A correção é track t.id.',
        explanation:
          'Correto. Medido: com track $index, o texto digitado no item A foi parar na linha do C depois de inverter a lista; com track t.id, ficou com o A.',
      },
      {
        id: 'binding',
        text: 'Falta um binding no input; o track não tem relação.',
        explanation:
          'Guardar a anotação no estado também resolve e é uma boa prática, mas o track errado continuaria perdendo foco e outros estados do DOM.',
      },
      {
        id: 'sort-mutation',
        text: 'A ordenação alterou o array original.',
        explanation:
          'Isso causaria outros problemas, mas o sintoma aqui é o elemento preso à posição.',
      },
      {
        id: 'browser',
        text: 'O navegador reaproveita inputs com o mesmo aria-label.',
        explanation: 'Incorreto. Quem decide reaproveitar elementos é o @for, pelo track.',
      },
    ],
    correctOptionIds: ['index'],
    hints: ['Com track $index, o que identifica cada linha?'],
    solution: [
      { type: 'code', language: 'html', code: `@for (t of tarefasOrdenadas(); track t.id) { … }` },
    ],
  },
  {
    id: 'runtime-01-copies',
    kind: 'multiple-choice',
    title: 'A lista que pisca',
    difficulty: 'intermediate',
    conceptIds: ['perf-rendering'],
    prompt: [
      {
        type: 'paragraph',
        text: 'A cada recarga da API, a lista inteira pisca e o foco do teclado sai do item atual. O template usa @for (p of produtos(); track p). Por quê?',
      },
    ],
    options: [
      {
        id: 'object-identity',
        text: 'A recarga traz objetos novos; com track p, nenhum é "o mesmo" que antes, e todos os elementos são recriados. track p.id resolve.',
        explanation:
          'Correto. Medido: trocando a lista por cópias, track pelo objeto reaproveitou 0 de 3 elementos, e track pelo id, 3 de 3.',
      },
      {
        id: 'zone',
        text: 'Falta o Zone.js.',
        explanation:
          'Incorreto. A recriação vem da chave do track, não do mecanismo de detecção de mudanças.',
      },
      {
        id: 'onpush',
        text: 'Falta ChangeDetectionStrategy.OnPush.',
        explanation:
          'OnPush reduz verificações, mas não muda a decisão do @for de recriar elementos.',
      },
      {
        id: 'api',
        text: 'A API deveria devolver os mesmos objetos.',
        explanation: 'Impossível: cada resposta HTTP é desserializada em objetos novos.',
      },
    ],
    correctOptionIds: ['object-identity'],
    hints: ['Objetos vindos de duas respostas diferentes são o mesmo objeto?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Track por um campo estável, nunca pelo objeto quando os dados são recarregados.',
      },
    ],
  },
  {
    id: 'runtime-01-method',
    kind: 'multiple-choice',
    title: 'Método ou computed?',
    difficulty: 'intermediate',
    conceptIds: ['perf-rendering'],
    prompt: [
      {
        type: 'paragraph',
        text: 'No exemplo do resumo, um outro signal do componente muda três vezes, sem alterar itens. Quantas vezes, no total, rodam totalMetodo() e o computed total, contando a primeira renderização?',
      },
    ],
    options: [
      {
        id: '4-1',
        text: 'totalMetodo: 4 vezes. total: 1 vez.',
        explanation:
          'Correto. Medido com o Angular deste projeto: o método roda a cada atualização da view (1 + 3), e o computed devolve o valor guardado porque itens não mudou.',
      },
      {
        id: '1-1',
        text: 'Os dois: 1 vez.',
        explanation: 'O método não tem memória: a cada atualização, o template o chama de novo.',
      },
      {
        id: '4-4',
        text: 'Os dois: 4 vezes.',
        explanation: 'O computed só recalcula quando um signal lido por ele muda.',
      },
      {
        id: '1-4',
        text: 'totalMetodo: 1 vez. total: 4 vezes.',
        explanation: 'É o contrário.',
      },
    ],
    correctOptionIds: ['4-1'],
    hints: ['Qual dos dois guarda o resultado?'],
    solution: [{ type: 'paragraph', text: 'Valores derivados no template: computed.' }],
  },
  {
    id: 'runtime-01-index-ok',
    kind: 'multiple-choice',
    title: 'Quando $index serve',
    difficulty: 'intermediate',
    conceptIds: ['angular-control-flow'],
    prompt: [{ type: 'paragraph', text: 'Em qual caso track $index é aceitável?' }],
    options: [
      {
        id: 'static',
        text: 'Uma lista fixa de dicas de texto, que nunca muda de ordem e não tem campos nem foco nas linhas.',
        explanation:
          'Correto. Sem reordenação e sem estado no DOM, ligar o elemento à posição não causa nenhum dos problemas medidos.',
      },
      {
        id: 'sortable',
        text: 'Uma tabela ordenável com edição em linha.',
        explanation: 'Incorreto. Ordenar com $index deixa o estado da edição na posição errada.',
      },
      {
        id: 'realtime',
        text: 'Um feed que recebe itens novos no topo.',
        explanation: 'Incorreto. Cada item novo desloca o estado de todas as linhas.',
      },
      {
        id: 'no-id',
        text: 'Qualquer lista em que os itens não têm id.',
        explanation:
          'Sem id, procure outra chave estável (um código, um slug); $index só se a lista também for estática.',
      },
    ],
    correctOptionIds: ['static'],
    hints: ['O que dá errado com $index, e quando isso não acontece?'],
    solution: [
      { type: 'paragraph', text: '$index só para listas estáticas sem estado nas linhas.' },
    ],
  },
];
