import { Exercise } from '../../app/core/models/content.models';

/** Executed with HttpTestingController in `src/content/angular-http.spec.ts`. */
export const IDLE_PREDICT_TS = `// Na BuscaProdutos da lição, logo depois de criada (busca = '')
console.log(produtos.status());
busca.set('c');
console.log(produtos.status());`;

export const ANGULAR_HTTP_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'http-01-idle',
    kind: 'predict-output',
    title: 'Busca com uma letra',
    difficulty: 'intermediate',
    conceptIds: ['angular-http'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Digite as duas linhas do console, separadas por espaço. Quantas requisições foram feitas?',
      },
    ],
    language: 'typescript',
    code: IDLE_PREDICT_TS,
    acceptedAnswers: ['idle idle'],
    explanation:
      'Com menos de 2 letras, a função do httpResource devolve undefined. Sem URL, nenhuma requisição é feita e o status fica idle. Nenhuma requisição foi feita.',
    commonMistakes: [
      {
        answer: 'idle loading',
        explanation:
          '"c" tem uma letra só; a função continua devolvendo undefined, então nada é pedido ao servidor.',
      },
      {
        answer: 'loading loading',
        explanation:
          'Uma função que devolve undefined não gera requisição: o recurso fica parado (idle) até haver uma URL.',
      },
    ],
    wrongAnswerGuidance:
      'Não é isso. Veja o que a função do httpResource devolve com busca vazia e com uma letra.',
    hints: ['Quanto vale this.busca().length < 2 nos dois momentos?'],
    solution: [{ type: 'paragraph', text: 'Saída: idle idle. Nenhuma requisição.' }],
  },
  {
    id: 'http-01-conflict',
    kind: 'multiple-choice',
    title: 'E-mail já cadastrado',
    difficulty: 'intermediate',
    conceptIds: ['angular-http', 'angular-signal-forms'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O servidor responde 409 porque o e-mail já tem conta. Como fazer a mensagem aparecer no campo de e-mail, como os outros erros de validação?',
      },
    ],
    options: [
      {
        id: 'field-tree',
        text: 'Na ação do submit, devolver { fieldTree: dados.email, kind: "server", message: "..." }.',
        explanation:
          'Correto. O erro devolvido pela ação é aplicado ao campo indicado em fieldTree. O template que já mostra os erros do campo mostra este também, com aria-invalid e aria-describedby.',
      },
      {
        id: 'alert',
        text: 'Chamar window.alert com a mensagem.',
        explanation:
          'Incorreto. O alerta interrompe, some ao ser fechado e não fica ligado ao campo que precisa ser corrigido.',
      },
      {
        id: 'throw',
        text: 'Relançar o erro para o ErrorHandler global.',
        explanation:
          'Incorreto. O erro é esperado e tem um campo responsável; tratá-lo como falha inesperada esconde da pessoa o que corrigir.',
      },
      {
        id: 'validator-call',
        text: 'Criar um validador que chama o servidor a cada tecla para conferir o e-mail.',
        explanation:
          'Pode complementar, mas não substitui: entre a conferência e o envio o e-mail pode ter sido cadastrado. O erro do envio precisa ser tratado de qualquer forma.',
      },
    ],
    correctOptionIds: ['field-tree'],
    hints: ['O que a ação do submit pode devolver além de undefined?'],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `if (erro instanceof HttpErrorResponse && erro.status === 409) {
  return { fieldTree: dados.email, kind: 'server', message: 'Este e-mail já tem uma conta.' };
}`,
      },
    ],
  },
  {
    id: 'http-01-value-error',
    kind: 'multiple-choice',
    title: 'A lista que derruba a tela',
    difficulty: 'intermediate',
    conceptIds: ['angular-http'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O template lê produtos.value() ?? [] direto, sem conferir o estado. Quando a API responde 500, a área da busca quebra e aparece um erro no console. Por quê?',
      },
    ],
    options: [
      {
        id: 'throws',
        text: 'Com o recurso em erro, ler value() lança uma exceção; o ?? [] nem chega a ser avaliado. Confira error() ou hasValue() antes de ler value().',
        explanation:
          'Correto. value() não devolve undefined em caso de erro: ele lança ("Resource is currently in an error state"). A ordem do exemplo (carregando, erro, valor) evita isso e ainda mostra uma mensagem útil.',
      },
      {
        id: 'undefined',
        text: 'value() devolve undefined e o @for não aceita undefined.',
        explanation:
          'Incorreto. Se devolvesse undefined, o ?? [] resolveria. O problema é que a leitura lança uma exceção.',
      },
      {
        id: 'retry',
        text: 'O httpResource tenta de novo sem parar e trava a página.',
        explanation: 'Incorreto. Ele não repete sozinho; reload() é chamado por você.',
      },
      {
        id: 'interceptor',
        text: 'Falta um interceptor que transforme o erro 500 em lista vazia.',
        explanation:
          'Incorreto. Esconder um erro como "nenhum produto" engana a pessoa. Mostre o erro e ofereça "Tentar de novo".',
      },
    ],
    correctOptionIds: ['throws'],
    hints: ['O que value() faz quando o recurso está em erro?'],
    solution: [
      {
        type: 'code',
        language: 'html',
        code: `@if (produtos.error()) {
  <p role="alert">Não foi possível carregar.
    <button type="button" (click)="produtos.reload()">Tentar de novo</button></p>
} @else if (produtos.hasValue()) {
  <!-- aqui value() é seguro -->
}`,
      },
    ],
  },
  {
    id: 'http-01-cancel',
    kind: 'multiple-choice',
    title: 'Digitando rápido',
    difficulty: 'intermediate',
    conceptIds: ['angular-http', 'js-async-races'],
    prompt: [
      {
        type: 'paragraph',
        text: 'A pessoa digita "caf" e logo depois "café", com a primeira requisição ainda em andamento. O que o httpResource faz?',
      },
    ],
    options: [
      {
        id: 'cancels',
        text: 'Cancela a requisição de "caf" e faz a de "café"; só a resposta de "café" chega à tela.',
        explanation:
          'Correto. Quando a função reativa muda a URL, a requisição pendente é cancelada antes da nova. É a correção da corrida da lição de assincronismo, sem código seu.',
      },
      {
        id: 'both',
        text: 'Faz as duas e mostra a que chegar por último.',
        explanation:
          'Incorreto. Esse é o bug da busca escrita à mão. O httpResource cancela a anterior.',
      },
      {
        id: 'queue',
        text: 'Espera a de "caf" terminar para então fazer a de "café".',
        explanation: 'Incorreto. Ele não enfileira: cancela a antiga e começa a nova na hora.',
      },
      {
        id: 'ignores',
        text: 'Ignora "café" até a primeira terminar.',
        explanation:
          'Incorreto. A tela mostraria o resultado de um termo que já não está no campo.',
      },
    ],
    correctOptionIds: ['cancels'],
    hints: ['O que a documentação diz sobre uma requisição pendente quando a URL muda?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Com httpResource, mudar o signal da busca basta: cancelamento e estado de carregamento já vêm prontos.',
      },
    ],
  },
  {
    id: 'http-01-mutation',
    kind: 'multiple-choice',
    title: 'httpResource para criar a conta?',
    difficulty: 'intermediate',
    conceptIds: ['angular-http'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Alguém sugere usar httpResource com method: "POST" para criar a conta. Qual é a melhor resposta?',
      },
    ],
    options: [
      {
        id: 'httpclient',
        text: 'Usar HttpClient no envio. httpResource é reativo e refaz a requisição quando os signals mudam, o que é perigoso para uma ação que deve acontecer uma vez; a documentação recomenda evitá-lo em mutações.',
        explanation:
          'Correto. Uma criação de conta é uma ação: acontece quando a pessoa envia, uma vez. httpResource foi feito para ler dados que acompanham o estado da tela.',
      },
      {
        id: 'fine',
        text: 'Tanto faz: os dois fazem requisições HTTP.',
        explanation:
          'Incorreto. A diferença é quando a requisição acontece. Um recurso reativo pode disparar de novo ao mudar o formulário, criando contas repetidas.',
      },
      {
        id: 'fetch',
        text: 'Usar fetch direto, para não depender do Angular.',
        explanation:
          'Funciona, mas perde os interceptors (como o token de sessão) e o HttpTestingController nos testes.',
      },
      {
        id: 'get',
        text: 'Trocar para GET com os dados na URL.',
        explanation:
          'Incorreto. GET não deve alterar dados, e a senha ficaria na URL, no histórico e nos registros do servidor.',
      },
    ],
    correctOptionIds: ['httpclient'],
    hints: ['Uma criação de conta deve acontecer quantas vezes?'],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `await firstValueFrom(this.http.post('/api/contas', dados().value()));`,
      },
    ],
  },
  {
    id: 'http-01-secret',
    kind: 'multiple-choice',
    title: 'A chave da API de pagamentos',
    difficulty: 'intermediate',
    conceptIds: ['angular-http'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Para cobrar uma assinatura, alguém propõe um interceptor que adiciona a chave secreta da API de pagamentos a toda requisição, lida de environment.ts. O que fazer?',
      },
    ],
    options: [
      {
        id: 'backend',
        text: 'Recusar: tudo que está no bundle é público. O frontend chama o seu backend, e só o backend guarda a chave e fala com a API de pagamentos.',
        explanation:
          'Correto. Qualquer pessoa vê a chave no DevTools (no código ou no cabeçalho das requisições) e pode usá-la em nome da empresa. Chaves secretas vivem no servidor.',
      },
      {
        id: 'minify',
        text: 'Aceitar, porque o build de produção minifica o código.',
        explanation:
          'Incorreto. Minificar não esconde strings, e a chave aparece no cabeçalho de cada requisição.',
      },
      {
        id: 'base64',
        text: 'Aceitar, guardando a chave em Base64.',
        explanation: 'Incorreto. Base64 é codificação, não criptografia: qualquer um decodifica.',
      },
      {
        id: 'gitignore',
        text: 'Aceitar, desde que environment.ts esteja no .gitignore.',
        explanation:
          'Incorreto. Isso tira a chave do repositório, mas ela continua indo no bundle para o navegador de cada visitante.',
      },
    ],
    correctOptionIds: ['backend'],
    hints: ['Quem consegue ler o código e as requisições do frontend?'],
    solution: [
      {
        type: 'paragraph',
        text: 'O token de sessão do próprio usuário pode ir num interceptor (ele identifica aquela pessoa). Chaves da empresa, nunca.',
      },
    ],
  },
];
