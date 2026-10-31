import { Lesson } from '../../app/core/models/content.models';

/** Executed with real timers in `src/content/async-examples.spec.ts`. */
export const EVENT_LOOP_JS = `console.log('1: síncrono');
setTimeout(() => console.log('4: tarefa (setTimeout)'), 0);
Promise.resolve().then(() => console.log('3: microtarefa (then)'));
console.log('2: síncrono');`;

export const LOAD_PRODUCTS_JS = `// buscar é o fetch (ou um substituto nos testes); mostrar atualiza a tela.
async function carregarProdutos(buscar, mostrar) {
  mostrar({ status: 'carregando' });
  try {
    const resposta = await buscar('/api/produtos');
    // fetch só rejeita em falha de rede: 404 e 500 chegam aqui com ok = false.
    if (!resposta.ok) throw new Error(\`HTTP \${resposta.status}\`);
    const produtos = await resposta.json();
    mostrar({ status: 'sucesso', produtos });
  } catch (erro) {
    mostrar({ status: 'erro', mensagem: erro.message });
  }
}`;

export const PARALLEL_JS = `// Em sequência: a segunda só começa quando a primeira termina.
const usuario = await buscarUsuario();
const pedidos = await buscarPedidos();

// Em paralelo: as duas começam juntas; o tempo total é o da mais lenta.
const [usuario2, pedidos2] = await Promise.all([buscarUsuario(), buscarPedidos()]);`;

export const RACE_BUG_JS = `async function buscarSugestoes(termo, buscar, mostrar) {
  const resultado = await buscar(termo);
  mostrar(resultado); // pode ser a resposta de um termo antigo
}`;

export const RACE_FIX_JS = `let ultimaBusca = 0;

async function buscarSugestoes(termo, buscar, mostrar) {
  const minhaBusca = ++ultimaBusca;
  const resultado = await buscar(termo);
  if (minhaBusca !== ultimaBusca) return; // chegou atrasada: descarta
  mostrar(resultado);
}`;

export const JS_ASYNC_01: Lesson = {
  id: 'js-async-01',
  moduleId: 'js-async-engineering',
  title: 'Assincronismo na prática: promises, async/await e corridas',
  summary:
    'Como o navegador agenda o que é assíncrono, como tratar carregamento e erro de uma requisição e como evitar que respostas fora de ordem mostrem dados errados.',
  estimatedMinutes: 50,
  difficulty: 'intermediate',
  conceptIds: ['js-event-loop', 'js-async', 'js-async-races'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Toda interface que conversa com um servidor espera respostas que chegam depois, às vezes com erro, às vezes fora de ordem. Os bugs típicos: o indicador de carregamento que nunca some quando a API falha, o erro 404 tratado como sucesso, a página que demora o dobro porque as requisições esperam umas pelas outras sem motivo, e a busca que mostra o resultado do que você digitou antes.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Prever a ordem de execução de código síncrono, microtarefas e tarefas.',
            'Tratar carregamento, sucesso e erro com async/await, try/catch e finally.',
            'Saber quando fetch rejeita e quando não.',
            'Rodar requisições independentes em paralelo com Promise.all.',
            'Descartar respostas atrasadas em buscas e filtros.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'A cozinha com um cozinheiro só',
      blocks: [
        {
          type: 'paragraph',
          text: 'O JavaScript da página é uma cozinha com um único cozinheiro. Ele termina o prato que está fazendo antes de olhar qualquer outra coisa. Quando algo precisa esperar (o forno, a entrega de um ingrediente), ele anota um lembrete e segue com outro prato.',
        },
        {
          type: 'paragraph',
          text: 'Há dois quadros de lembretes. O das microtarefas (continuações de promises) é urgente: sempre que termina um prato, o cozinheiro esvazia esse quadro inteiro. O das tarefas (setTimeout, eventos, respostas de rede) é atendido um lembrete por vez, depois do urgente. E como ninguém garante a ordem em que os entregadores chegam, a resposta pedida primeiro pode chegar por último.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Event loop, promises e async/await',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'O código síncrono roda até o fim sem interrupção. Só então o event loop executa todas as microtarefas pendentes e, depois, uma tarefa; a cada tarefa, as microtarefas são esvaziadas de novo.',
            'Microtarefas: callbacks de then/catch/finally e as continuações depois de um await. Tarefas: setTimeout, eventos do DOM, mensagens. setTimeout(fn, 0) significa "o quanto antes, como tarefa", ou seja, depois das microtarefas.',
            'Uma promise representa um valor que ainda vai chegar: fica pendente e depois é resolvida (com valor) ou rejeitada (com erro).',
            'async faz a função devolver sempre uma promise. await pausa só aquela função até a promise terminar; o resto da página continua respondendo.',
            'try/catch em volta de await captura rejeições; finally roda em qualquer caso, ideal para esconder o indicador de carregamento.',
            'fetch rejeita apenas quando a requisição não acontece (rede, CORS, abortada). Respostas 404 ou 500 resolvem normalmente, com resposta.ok igual a false: é você quem decide tratá-las como erro.',
            'Promise.all espera todas e rejeita na primeira falha; Promise.allSettled espera todas e informa o resultado de cada uma.',
            'Para cancelar um fetch, passe { signal } de um AbortController e chame abort(). A promise rejeita com um erro de nome AbortError.',
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'await dentro de forEach não espera',
          text: 'forEach ignora a promise devolvida por uma função async: o loop termina na hora e o código seguinte roda antes das esperas. Use for...of para esperar uma por uma, ou Promise.all com map para esperar todas em paralelo. O Bestiário tem esse bug com detalhes.',
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: carregar, mostrar, falhar bem',
      blocks: [
        {
          type: 'paragraph',
          text: 'Primeiro, a ordem do event loop. Os números mostram a ordem em que as linhas aparecem no console:',
        },
        { type: 'code', language: 'javascript', caption: 'ordem.js', code: EVENT_LOOP_JS },
        {
          type: 'paragraph',
          text: 'Agora, carregar produtos com os três estados. A função recebe buscar como parâmetro: na aplicação é o fetch; nos testes, um substituto que simula respostas e falhas.',
        },
        {
          type: 'code',
          language: 'javascript',
          caption: 'carregar-produtos.js',
          code: LOAD_PRODUCTS_JS,
        },
        {
          type: 'paragraph',
          text: 'Duas requisições que não dependem uma da outra não precisam esperar uma pela outra:',
        },
        { type: 'code', language: 'javascript', caption: 'paralelo.js', code: PARALLEL_JS },
        {
          type: 'callout',
          tone: 'info',
          title: 'Este código é testado',
          text: 'Os testes da plataforma executam estes exemplos com temporizadores reais: conferem a ordem do console, os estados de carregamento e erro, o tempo das versões em sequência e em paralelo e a corrida da busca.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Teste no console do navegador',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Cole o exemplo do event loop no console e confira a ordem. Troque setTimeout(..., 0) por setTimeout(..., 100): algo muda na ordem?',
            'Rode await fetch("https://httpbin.org/status/404") e inspecione ok e status: a promise rejeitou?',
            'Compare o tempo de duas esperas em sequência e em paralelo: const espera = (ms) => new Promise((r) => setTimeout(r, ms)); console.time("s"); await espera(500); await espera(500); console.timeEnd("s");. Repita com Promise.all.',
            'No DevTools, aba Rede, use a limitação "3G lenta" e digite rápido numa busca de um site real: as respostas chegam na ordem dos pedidos?',
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
          text: 'No laboratório, implemente carregarProdutos com os três estados. Os testes usam respostas e falhas simuladas, porque o ambiente isolado não tem acesso à rede. Depois, responda sobre o fetch.',
        },
      ],
      exerciseIds: ['lab-js-async-loading', 'js-async-01-fetch-404'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: a busca que mostra o termo antigo',
      blocks: [
        {
          type: 'paragraph',
          text: 'Uma busca com sugestões chama a API a cada letra. Quem digita "café" rápido às vezes vê as sugestões de "ca".',
        },
        { type: 'code', language: 'javascript', caption: 'Com bug', code: RACE_BUG_JS },
      ],
      exerciseIds: ['js-async-01-race'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Em Angular, o HttpClient devolve Observables, e o operador switchMap do RxJS cancela a requisição anterior quando chega um termo novo: a mesma solução da corrida, pronta.',
            'Os três estados (carregando, sucesso, erro) são a união discriminada da lição de TypeScript: modele-os assim e o compilador garante que a tela trata todos.',
            'Mostre o erro com uma ação possível ("Tentar de novo"), não só "Algo deu errado".',
            'Receber buscar como parâmetro (injeção de dependência) é o que permite testar código assíncrono sem rede. O Angular faz isso com inject().',
          ],
        },
      ],
    },
    {
      kind: 'assessment',
      title: 'Avaliação',
      blocks: [
        {
          type: 'paragraph',
          text: 'Para concluir a lição, acerte os três exercícios abaixo.',
        },
      ],
      exerciseIds: ['js-async-01-order', 'js-async-01-parallel', 'js-async-01-finally'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Síncrono → todas as microtarefas (then, await) → uma tarefa (setTimeout, eventos) → microtarefas de novo.',
            'async/await com try/catch para erros e finally para limpar o estado de carregamento.',
            'fetch não rejeita em 404/500: confira resposta.ok.',
            'Requisições independentes em paralelo com Promise.all; allSettled quando cada resultado importa.',
            'Respostas podem chegar fora de ordem: descarte as atrasadas ou cancele com AbortController.',
          ],
        },
        {
          type: 'paragraph',
          text: 'Na Biblioteca: "Event loop: tarefas e microtarefas".',
        },
      ],
    },
  ],
};
