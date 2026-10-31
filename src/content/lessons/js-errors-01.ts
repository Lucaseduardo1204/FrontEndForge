import { Lesson } from '../../app/core/models/content.models';

/** Executed in `src/content/closures-examples.spec.ts`; the logged values are asserted there. */
export const FINALLY_JS = `function salvar() {
  const passos = [];
  try {
    passos.push('tentar');
    throw new Error('disco cheio');
  } catch (erro) {
    passos.push('tratar: ' + erro.message);
    return passos;
  } finally {
    passos.push('liberar'); // roda mesmo depois do return
  }
}

console.log(salvar().join(' → ')); // tentar → tratar: disco cheio → liberar`;

export const CUSTOM_ERROR_JS = `class ErroValidacao extends Error {
  constructor(mensagem, campo) {
    super(mensagem);
    this.name = 'ErroValidacao'; // sem isto, o nome mostrado seria "Error"
    this.campo = campo;
  }
}

function lerIdade(texto) {
  const idade = Number(texto);
  if (texto.trim() === '' || !Number.isInteger(idade)) {
    throw new ErroValidacao('Informe a idade em anos', 'idade');
  }
  return idade;
}

try {
  lerIdade('vinte');
} catch (erro) {
  if (erro instanceof ErroValidacao) console.log(erro.campo, '|', erro.message);
  else throw erro; // o que não sabemos tratar continua subindo
}
// idade | Informe a idade em anos`;

export const CAUSE_JS = `try {
  try {
    JSON.parse('{nome:');
  } catch (erro) {
    throw new Error('O rascunho salvo está corrompido', { cause: erro });
  }
} catch (erro) {
  console.log(erro.message, '|', erro.cause.name);
}
// O rascunho salvo está corrompido | SyntaxError`;

export const JS_ERRORS_01: Lesson = {
  id: 'js-errors-01',
  moduleId: 'js-errors-debugging',
  title: 'Erros: lançar, capturar, classificar e investigar',
  summary:
    'Tratar falhas como parte do programa: erros com significado, captura no lugar certo, contexto preservado com cause e a armadilha do try sem await.',
  estimatedMinutes: 40,
  difficulty: 'intermediate',
  conceptIds: ['js-errors', 'js-async'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Toda aplicação real falha: a rede cai, o servidor responde 500, o dado salvo está corrompido, a pessoa digita algo inesperado. A diferença entre uma aplicação confiável e uma frágil não é falhar menos, e sim falhar bem: mostrar a mensagem certa, não perder a causa original e não esconder erros que deveriam aparecer.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Entender throw, try, catch e finally, inclusive as ordens surpreendentes.',
            'Criar erros com significado (classes) e decidir pelo tipo.',
            'Preservar a causa original ao transformar um erro (cause).',
            'Capturar erros de código assíncrono.',
            'Investigar com a pilha de chamadas e o depurador.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'O alarme de incêndio',
      blocks: [
        {
          type: 'paragraph',
          text: 'Um erro é um alarme: ele interrompe o que estava acontecendo e sobe pelo prédio até alguém responsável atender. Desligar o alarme sem olhar (catch vazio) é perigoso. Atender no andar errado (capturar onde não se sabe o que fazer) também. E quem repassa o alarme deve dizer onde começou o fogo (cause).',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Como erros se comportam',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'throw interrompe a função e sobe pela pilha de chamadas até o primeiro catch. Sem nenhum, o erro chega ao ambiente (console, handler global).',
            'finally roda sempre: depois do try, depois do catch e até depois de um return. Medido: um return dentro de finally substitui o return do try. Use finally para liberar recursos (fechar, esconder o carregando), nunca para devolver valores.',
            'Lance instâncias de Error (ou subclasses), não strings: medido, throw "texto" chega ao catch sem stack, o que impede saber de onde veio.',
            'Subclasses dão significado: erro instanceof ErroValidacao permite tratar cada tipo de um jeito. Defina this.name, senão o nome mostrado continua "Error".',
            'Capture só o que sabe tratar e relance o resto (throw erro). Um catch que engole tudo transforma bugs em comportamentos silenciosamente errados.',
            'new Error("mensagem", { cause: erroOriginal }) transforma o erro em algo que faz sentido para quem está acima, sem perder o original para investigar.',
            'Assíncrono: try/catch só captura a rejeição de uma promise se houver await dentro do try. Medido: try { falha() } não capturou nada; try { await falha() } capturou. Promise.all rejeita no primeiro erro; Promise.allSettled espera todas e informa o resultado de cada uma.',
            'Investigar: a pilha (stack) mostra o caminho até o erro; no DevTools, "Pause on exceptions" para na linha que lançou, com as variáveis à vista.',
          ],
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: validação, rascunho corrompido e limpeza',
      blocks: [
        { type: 'code', language: 'javascript', caption: 'finally.js', code: FINALLY_JS },
        { type: 'code', language: 'javascript', caption: 'validacao.js', code: CUSTOM_ERROR_JS },
        { type: 'code', language: 'javascript', caption: 'rascunho.js', code: CAUSE_JS },
        {
          type: 'callout',
          tone: 'info',
          title: 'Este código é executado',
          text: 'Os testes da plataforma executam os três exemplos e conferem as saídas, além das afirmações sobre finally, throw de string, try sem await e Promise.allSettled.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Investigue no DevTools',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Na aba Sources, ative "Pause on uncaught exceptions" e rode código que lança um erro: veja a pilha de chamadas e as variáveis no ponto da falha.',
            'Rode console.log(new Error("teste").stack) dentro de duas funções aninhadas e leia o caminho.',
            'Rode throw "texto" e throw new Error("texto") no console e compare o que aparece.',
            'Crie uma promise rejeitada sem catch: que aviso o console mostra?',
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
          text: 'No laboratório, escreva a função que transforma qualquer erro numa mensagem adequada para a interface. Depois, preveja a saída de um finally.',
        },
      ],
      exerciseIds: ['lab-js-error-message', 'errors-01-finally'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: o pedido que "foi salvo"',
      blocks: [
        {
          type: 'code',
          language: 'javascript',
          caption: 'A tela mostra "Pedido salvo!" mesmo quando o servidor está fora do ar',
          code: `async function aoClicarSalvar() {
  try {
    salvarPedido(pedido); // devolve uma promise
    mostrar('Pedido salvo!');
  } catch (erro) {
    mostrar('Não foi possível salvar.');
  }
}`,
        },
      ],
      exerciseIds: ['errors-01-no-await'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'No Angular, um ErrorHandler global recebe os erros não tratados; é o lugar para registrar no monitoramento (lição de arquitetura e de CI/CD).',
            'HttpClient entrega um HttpErrorResponse com status: o mesmo papel do ErroHttp do laboratório.',
            'Mensagens para a pessoa e detalhes para quem investiga são coisas diferentes: a interface nunca mostra a mensagem interna, e o registro nunca perde a causa.',
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
      exerciseIds: ['errors-01-rethrow', 'errors-01-throw-string', 'errors-01-allsettled'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Lance Error (ou subclasses com name), nunca strings.',
            'Capture só o que sabe tratar; relance o resto.',
            'finally para limpeza, nunca para return.',
            'cause preserva o erro original.',
            'Sem await, o try não vê a rejeição.',
          ],
        },
      ],
    },
  ],
};
