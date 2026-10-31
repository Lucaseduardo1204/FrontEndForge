import { Exercise } from '../../app/core/models/content.models';

/** Outputs and timings claimed here are executed in `src/content/async-examples.spec.ts`. */
export const ORDER_PREDICT_JS = `console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
(async () => {
  console.log('D');
  await null;
  console.log('E');
})();
console.log('F');`;

export const FINALLY_JS = `async function salvar(enviar, ui) {
  ui.carregando = true;
  try {
    await enviar();
    return 'salvo';
  } catch {
    return 'falhou';
  } finally {
    ui.carregando = false;
  }
}`;

export const JS_ASYNC_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-js-async-loading',
    kind: 'code',
    language: 'javascript',
    title: 'Carregando, sucesso ou erro',
    difficulty: 'intermediate',
    conceptIds: ['js-async'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Implemente carregarProdutos(buscar, mostrar). buscar funciona como o fetch: recebe a URL e devolve uma promise de resposta com ok, status e json(). mostrar recebe o estado da tela. Os testes passam um buscar simulado, porque o ambiente isolado não tem rede.',
      },
    ],
    requirements: [
      "Chama mostrar({ status: 'carregando' }) antes de buscar.",
      "Busca '/api/produtos'.",
      "Com resposta ok, chama mostrar({ status: 'sucesso', produtos }) com o resultado de json().",
      "Com resposta não ok, chama mostrar({ status: 'erro', mensagem: 'HTTP <status>' }), por exemplo 'HTTP 404'.",
      "Se buscar ou json() rejeitarem, chama mostrar({ status: 'erro', mensagem }) com a mensagem do erro.",
      'A promise devolvida só termina depois do último mostrar.',
    ],
    examples: [
      {
        input: 'resposta ok com json() → [{ id: 1 }]',
        output: "carregando, depois { status: 'sucesso', produtos: [{ id: 1 }] }",
      },
      {
        input: 'resposta com status 404',
        output: "carregando, depois { status: 'erro', mensagem: 'HTTP 404' }",
      },
    ],
    starterCode: `async function carregarProdutos(buscar, mostrar) {
  // Seu código aqui
}

// Um buscar de exemplo para testar no console:
const buscarFalso = async () => ({ ok: true, status: 200, json: async () => [{ id: 1 }] });
carregarProdutos(buscarFalso, (estado) => console.log(estado));
`,
    tests: [
      {
        id: 'success',
        description: 'Mostra carregando e depois sucesso com os produtos',
        source:
          "const estados = []; await carregarProdutos(async () => ({ ok: true, status: 200, json: async () => [{ id: 1 }] }), (e) => estados.push(e)); expect(estados).toEqual([{ status: 'carregando' }, { status: 'sucesso', produtos: [{ id: 1 }] }]);",
      },
      {
        id: 'url',
        description: "Busca '/api/produtos'",
        source:
          "const urls = []; await carregarProdutos(async (url) => { urls.push(url); return { ok: true, status: 200, json: async () => [] }; }, () => {}); expect(urls).toEqual(['/api/produtos']);",
      },
      {
        id: 'http-error',
        description: 'Trata resposta 404 como erro "HTTP 404"',
        source:
          "const estados = []; await carregarProdutos(async () => ({ ok: false, status: 404, json: async () => ({}) }), (e) => estados.push(e)); expect(estados).toEqual([{ status: 'carregando' }, { status: 'erro', mensagem: 'HTTP 404' }]);",
      },
      {
        id: 'network',
        description: 'Trata falha de rede (buscar rejeita) como erro com a mensagem',
        source:
          "const estados = []; await carregarProdutos(async () => { throw new Error('Falha de rede'); }, (e) => estados.push(e)); expect(estados.at(-1)).toEqual({ status: 'erro', mensagem: 'Falha de rede' });",
      },
      {
        id: 'bad-json',
        description: 'Trata JSON inválido (json() rejeita) como erro',
        source:
          "const estados = []; await carregarProdutos(async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('JSON inválido'); } }), (e) => estados.push(e)); expect(estados.at(-1)).toEqual({ status: 'erro', mensagem: 'JSON inválido' });",
      },
      {
        id: 'loading-first',
        description: 'Mostra carregando antes de a busca terminar',
        source:
          "const estados = []; let liberar; const pendente = new Promise((r) => (liberar = r)); const promessa = carregarProdutos(() => pendente, (e) => estados.push(e)); await null; expect(estados).toEqual([{ status: 'carregando' }]); liberar({ ok: true, status: 200, json: async () => [] }); await promessa; expect(estados.length).toBe(2);",
      },
    ],
    hints: [
      'Comece com mostrar carregando e envolva o resto num try/catch.',
      'Depois do await buscar(...), confira resposta.ok antes de chamar json().',
      'Para 404, lance um erro: throw new Error(`HTTP ${resposta.status}`). O catch já cuida de mostrar.',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `async function carregarProdutos(buscar, mostrar) {
  mostrar({ status: 'carregando' });
  try {
    const resposta = await buscar('/api/produtos');
    if (!resposta.ok) throw new Error(\`HTTP \${resposta.status}\`); // 404 e 500 não rejeitam sozinhos
    const produtos = await resposta.json(); // json() também pode rejeitar
    mostrar({ status: 'sucesso', produtos });
  } catch (erro) {
    mostrar({ status: 'erro', mensagem: erro.message }); // rede, HTTP ou JSON
  }
}`,
      },
      {
        type: 'paragraph',
        text: 'Um único catch trata as três falhas possíveis: rede, status HTTP e corpo inválido. Lançar o erro de HTTP faz o caso 404 seguir o mesmo caminho dos outros.',
      },
    ],
  },
  {
    id: 'js-async-01-fetch-404',
    kind: 'multiple-choice',
    title: 'fetch e o 404',
    difficulty: 'intermediate',
    conceptIds: ['js-async'],
    prompt: [
      {
        type: 'paragraph',
        text: 'const resposta = await fetch("/api/produtos/999") e o servidor responde 404. O que acontece?',
      },
    ],
    options: [
      {
        id: 'resolves',
        text: 'A promise resolve normalmente; resposta.ok é false e resposta.status é 404.',
        explanation:
          'Correto. Para o fetch, uma resposta HTTP, qualquer que seja o status, é uma requisição que deu certo. Ele só rejeita quando não há resposta (rede, CORS, abort). Tratar o status é responsabilidade do seu código.',
      },
      {
        id: 'rejects',
        text: 'A promise rejeita, e o erro cai no catch.',
        explanation:
          'Incorreto. Esse é o engano mais comum com fetch. Sem conferir resposta.ok, o código segue como se fosse sucesso.',
      },
      {
        id: 'null',
        text: 'A promise resolve com null.',
        explanation:
          'Incorreto. Ela resolve com um objeto Response completo, com status, cabeçalhos e corpo.',
      },
      {
        id: 'retries',
        text: 'O navegador tenta de novo automaticamente.',
        explanation: 'Incorreto. fetch não repete requisições sozinho.',
      },
    ],
    correctOptionIds: ['resolves'],
    hints: ['Um 404 é uma resposta do servidor ou uma falta de resposta?'],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `const resposta = await fetch('/api/produtos/999');
if (!resposta.ok) throw new Error(\`HTTP \${resposta.status}\`);`,
      },
    ],
  },
  {
    id: 'js-async-01-race',
    kind: 'multiple-choice',
    title: 'As sugestões do termo antigo',
    difficulty: 'intermediate',
    conceptIds: ['js-async-races'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Com a versão com bug de buscarSugestoes, quem digita "ca" e depois "café" às vezes vê as sugestões de "ca". Qual é a causa e a correção?',
      },
    ],
    options: [
      {
        id: 'out-of-order',
        text: 'As respostas podem chegar fora de ordem; a de "ca" chega por último e sobrescreve a de "café". Descartar respostas que não são da busca mais recente, ou cancelar a anterior com AbortController.',
        explanation:
          'Correto. Cada chamada espera a própria resposta e mostra o que recebe, sem saber se ainda é a busca atual. O contador de buscas da correção faz cada chamada conferir se ainda é a mais recente antes de mostrar.',
      },
      {
        id: 'single-thread',
        text: 'Impossível: JavaScript tem uma só thread, então as respostas chegam na ordem dos pedidos.',
        explanation:
          'Incorreto. Uma thread só garante que duas funções não rodam ao mesmo tempo. A ordem de chegada depende da rede e do servidor, e uma busca curta como "ca" pode ser mais lenta.',
      },
      {
        id: 'await-order',
        text: 'Faltou await na chamada de mostrar.',
        explanation:
          'Incorreto. mostrar é síncrona; o problema é mostrar uma resposta que já não corresponde ao que está digitado.',
      },
      {
        id: 'debounce',
        text: 'Basta esperar 300 ms depois da última tecla antes de buscar (debounce).',
        explanation:
          'Ajuda a fazer menos requisições, mas não resolve: com rede lenta, duas buscas ainda podem estar em andamento e voltar fora de ordem.',
      },
    ],
    correctOptionIds: ['out-of-order'],
    hints: [
      'O que garante que a resposta de "café" chega depois da de "ca"?',
      'Como uma chamada pode saber se ainda é a mais recente?',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `let ultimaBusca = 0;

async function buscarSugestoes(termo, buscar, mostrar) {
  const minhaBusca = ++ultimaBusca;
  const resultado = await buscar(termo);
  if (minhaBusca !== ultimaBusca) return; // chegou atrasada: descarta
  mostrar(resultado);
}`,
      },
    ],
  },
  {
    id: 'js-async-01-order',
    kind: 'predict-output',
    title: 'Em que ordem?',
    difficulty: 'intermediate',
    conceptIds: ['js-event-loop'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Digite as letras na ordem em que aparecem no console, separadas por espaço (exemplo: A B C D E F).',
      },
    ],
    language: 'javascript',
    code: ORDER_PREDICT_JS,
    acceptedAnswers: ['A D F C E B'],
    explanation:
      'Síncrono primeiro: A, D (a função async roda até o primeiro await) e F. Depois as microtarefas, na ordem em que foram agendadas: C (o then) e E (a continuação do await). Por último a tarefa do setTimeout: B.',
    commonMistakes: [
      {
        answer: 'A B C D E F',
        explanation:
          'Essa é a ordem do código, não da execução. setTimeout e then agendam para depois; só o código síncrono roda na hora.',
      },
      {
        answer: 'A F D C E B',
        explanation:
          'O corpo de uma função async roda de forma síncrona até o primeiro await. D aparece antes de F.',
      },
      {
        answer: 'A D F B C E',
        explanation:
          'setTimeout(..., 0) é uma tarefa, e todas as microtarefas (then e continuações de await) rodam antes da próxima tarefa.',
      },
      {
        answer: 'A D F E C B',
        explanation:
          'Microtarefas rodam na ordem em que foram agendadas. O then de C foi agendado antes de a função async chegar ao await.',
      },
    ],
    wrongAnswerGuidance:
      'Não é isso. Separe em três grupos: o que é síncrono, o que é microtarefa (then, depois de await) e o que é tarefa (setTimeout).',
    hints: [
      'Uma função async roda de forma síncrona até onde?',
      'Microtarefas ou tarefas: qual grupo roda primeiro depois do código síncrono?',
    ],
    solution: [
      {
        type: 'list',
        ordered: true,
        items: ['Síncrono: A, D, F.', 'Microtarefas, na ordem de agendamento: C, E.', 'Tarefa: B.'],
      },
    ],
  },
  {
    id: 'js-async-01-parallel',
    kind: 'multiple-choice',
    title: 'Sequência ou paralelo?',
    difficulty: 'intermediate',
    conceptIds: ['js-async'],
    prompt: [
      {
        type: 'paragraph',
        text: 'buscarUsuario() e buscarPedidos() são independentes e levam cerca de 1 segundo cada. Sobre as duas versões do exemplo (await em sequência e Promise.all), qual afirmação está correta?',
      },
    ],
    options: [
      {
        id: 'two-vs-one',
        text: 'A versão em sequência leva cerca de 2 s; com Promise.all, cerca de 1 s. Se uma das buscas falhar, Promise.all rejeita com esse erro.',
        explanation:
          'Correto. Em sequência, a segunda busca só começa quando a primeira termina. Com Promise.all as duas começam juntas e o tempo é o da mais lenta. Promise.all rejeita na primeira falha; use allSettled se precisar do resultado de cada uma.',
      },
      {
        id: 'same',
        text: 'As duas levam 1 s: await não bloqueia a página, então as buscas correm juntas.',
        explanation:
          'Incorreto. await não bloqueia a página, mas pausa a função: a linha seguinte, que inicia a segunda busca, só roda depois.',
      },
      {
        id: 'all-ignores-errors',
        text: 'Promise.all leva 1 s e ignora as buscas que falham.',
        explanation:
          'Incorreto. Quem informa sucesso e falha de cada uma é Promise.allSettled. Promise.all rejeita assim que uma falha.',
      },
      {
        id: 'all-sequential',
        text: 'Promise.all executa as buscas uma depois da outra, na ordem do array.',
        explanation:
          'Incorreto. As buscas já começaram quando buscarUsuario() e buscarPedidos() foram chamadas para montar o array; Promise.all só espera por elas.',
      },
    ],
    correctOptionIds: ['two-vs-one'],
    hints: [
      'Na versão em sequência, quando buscarPedidos() é chamada?',
      'O que Promise.all faz se uma das promises rejeitar?',
    ],
    solution: [
      {
        type: 'paragraph',
        text: 'Use await em sequência quando uma requisição depende da outra (por exemplo, precisa do id do usuário). Quando são independentes, inicie as duas e espere com Promise.all.',
      },
    ],
  },
  {
    id: 'js-async-01-finally',
    kind: 'multiple-choice',
    title: 'Quando o carregamento some?',
    difficulty: 'intermediate',
    conceptIds: ['js-async'],
    prompt: [
      { type: 'paragraph', text: 'Considere esta função:' },
      { type: 'code', language: 'javascript', code: FINALLY_JS },
      {
        type: 'paragraph',
        text: 'Em quais casos ui.carregando volta a ser false?',
      },
    ],
    options: [
      {
        id: 'always',
        text: 'Sempre: quando enviar resolve e quando rejeita.',
        explanation:
          'Correto. finally roda depois do try e do catch em qualquer caso, inclusive quando eles usam return. Por isso é o lugar certo para desfazer o estado de carregamento.',
      },
      {
        id: 'success-only',
        text: 'Só quando enviar resolve.',
        explanation: 'Incorreto. Essa seria a situação se a linha estivesse no fim do try.',
      },
      {
        id: 'never-return',
        text: 'Nunca, porque o return sai da função antes do finally.',
        explanation:
          'Incorreto. return dentro do try ou do catch não pula o finally: o valor fica guardado, o finally roda e só então a função termina.',
      },
      {
        id: 'error-only',
        text: 'Só quando enviar rejeita.',
        explanation: 'Incorreto. Essa seria a situação se a linha estivesse dentro do catch.',
      },
    ],
    correctOptionIds: ['always'],
    hints: ['O que finally garante?', 'return dentro de try impede o finally?'],
    solution: [
      {
        type: 'paragraph',
        text: 'finally roda em todos os caminhos. Coloque ali o que precisa acontecer independentemente do resultado: esconder o indicador, reabilitar o botão, liberar recursos.',
      },
    ],
  },
];
