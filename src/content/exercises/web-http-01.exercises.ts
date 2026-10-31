import { Exercise } from '../../app/core/models/content.models';

export const WEB_HTTP_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-js-http-status',
    kind: 'code',
    language: 'javascript',
    title: 'O que a interface faz com cada status?',
    difficulty: 'introductory',
    conceptIds: ['web-http'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Escreva proximaAcao(status), que recebe o status de uma resposta e devolve a reação da interface. É o tipo de decisão que um interceptor de HTTP toma para a aplicação inteira.',
      },
    ],
    requirements: [
      '0 (sem resposta): "sem-conexao".',
      'De 200 a 299: "sucesso".',
      '401: "entrar-de-novo".',
      '403: "sem-permissao".',
      '404: "nao-encontrado".',
      '409: "conflito".',
      '429 e 503: "tentar-mais-tarde".',
      'Outros de 400 a 499 (como 400 e 422): "corrigir-dados".',
      'Outros de 500 a 599: "erro-servidor".',
      'Qualquer outro valor: "desconhecido".',
    ],
    examples: [
      { input: 'proximaAcao(201)', output: "'sucesso'" },
      { input: 'proximaAcao(401)', output: "'entrar-de-novo'" },
      { input: 'proximaAcao(503)', output: "'tentar-mais-tarde'" },
    ],
    starterCode: `function proximaAcao(status) {
  // Seu código aqui
}

console.log(proximaAcao(404)); // esperado: nao-encontrado
`,
    tests: [
      {
        id: 'success',
        description: 'Toda a faixa 2xx é sucesso',
        source: "for (const s of [200, 201, 204, 299]) expect(proximaAcao(s)).toBe('sucesso');",
      },
      {
        id: 'auth',
        description: '401 pede login; 403 é falta de permissão',
        source:
          "expect(proximaAcao(401)).toBe('entrar-de-novo'); expect(proximaAcao(403)).toBe('sem-permissao');",
      },
      {
        id: 'specific-4xx',
        description: '404 e 409 têm reações próprias',
        source:
          "expect(proximaAcao(404)).toBe('nao-encontrado'); expect(proximaAcao(409)).toBe('conflito');",
      },
      {
        id: 'retry',
        description: '429 e 503 pedem para tentar mais tarde',
        source:
          "expect(proximaAcao(429)).toBe('tentar-mais-tarde'); expect(proximaAcao(503)).toBe('tentar-mais-tarde');",
      },
      {
        id: 'other-4xx',
        description: 'Outros 4xx pedem para corrigir os dados',
        source: "for (const s of [400, 422, 413]) expect(proximaAcao(s)).toBe('corrigir-dados');",
      },
      {
        id: 'other-5xx',
        description: 'Outros 5xx são erro do servidor',
        source: "for (const s of [500, 502, 599]) expect(proximaAcao(s)).toBe('erro-servidor');",
      },
      {
        id: 'edges',
        description: '0 é sem conexão; valores fora das faixas são desconhecidos',
        source:
          "expect(proximaAcao(0)).toBe('sem-conexao'); expect(proximaAcao(302)).toBe('desconhecido'); expect(proximaAcao(600)).toBe('desconhecido');",
      },
    ],
    hints: [
      'Trate primeiro os casos específicos (401, 403, 404, 409, 429, 503) e depois as faixas.',
      'Uma faixa: status >= 400 && status <= 499.',
      'Termine com return "desconhecido" para o que sobrar.',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `const ESPECIFICOS = {
  0: 'sem-conexao',
  401: 'entrar-de-novo',
  403: 'sem-permissao',
  404: 'nao-encontrado',
  409: 'conflito',
  429: 'tentar-mais-tarde',
  503: 'tentar-mais-tarde',
};

function proximaAcao(status) {
  if (status in ESPECIFICOS) return ESPECIFICOS[status]; // casos específicos antes das faixas
  if (status >= 200 && status <= 299) return 'sucesso';
  if (status >= 400 && status <= 499) return 'corrigir-dados';
  if (status >= 500 && status <= 599) return 'erro-servidor';
  return 'desconhecido';
}`,
      },
      {
        type: 'paragraph',
        text: 'A ordem importa: 503 está na faixa 5xx, mas pede outra reação, então os casos específicos vêm antes. Num interceptor, "entrar-de-novo" levaria ao login e "tentar-mais-tarde" poderia respeitar o cabeçalho Retry-After.',
      },
    ],
  },
  {
    id: 'http-01-methods',
    kind: 'multiple-choice',
    title: 'Qual método?',
    difficulty: 'introductory',
    conceptIds: ['web-http'],
    prompt: [{ type: 'paragraph', text: 'Qual combinação de métodos está correta?' }],
    options: [
      {
        id: 'right',
        text: 'Listar produtos: GET. Cadastrar produto: POST. Alterar só o preço: PATCH. Remover: DELETE.',
        explanation:
          'Correto. Cada método comunica a intenção, e intermediários (navegador, proxies, cache) se comportam de acordo.',
      },
      {
        id: 'get-delete',
        text: 'Remover com GET /api/produtos/7/remover, que é mais simples de chamar.',
        explanation:
          'Incorreto. GET deve ser seguro: navegadores pré-carregam links e robôs seguem GETs, e um deles apagaria dados.',
      },
      {
        id: 'post-all',
        text: 'POST para tudo, inclusive leitura.',
        explanation:
          'Incorreto. Leituras com POST não aproveitam cache e escondem a intenção da requisição.',
      },
      {
        id: 'put-partial',
        text: 'PUT só com o novo preço, para alterar só ele.',
        explanation: 'Incorreto. PUT substitui o recurso inteiro; para parte dele, PATCH.',
      },
    ],
    correctOptionIds: ['right'],
    hints: ['Qual método nunca deve alterar dados?'],
    solution: [
      {
        type: 'paragraph',
        text: 'GET lê, POST cria, PUT substitui, PATCH altera parte, DELETE remove.',
      },
    ],
  },
  {
    id: 'http-01-cache-bug',
    kind: 'multiple-choice',
    title: 'A versão nova que não chega',
    difficulty: 'introductory',
    conceptIds: ['web-caching'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Na etapa de depuração, max-age=86400 vale para todos os arquivos, inclusive o index.html. Qual é a correção?',
      },
    ],
    options: [
      {
        id: 'split',
        text: 'index.html com no-cache (sempre revalida); os arquivos com hash no nome com cache longo e immutable.',
        explanation:
          'Correto. O index.html aponta para os arquivos do build; se ele fica em cache por um dia, as pessoas continuam carregando os nomes antigos. Os arquivos com hash podem ficar em cache para sempre, porque uma versão nova tem nome novo.',
      },
      {
        id: 'nostore-all',
        text: 'no-store em tudo, para nunca ter versão velha.',
        explanation:
          'Resolve o sintoma, mas obriga a baixar todo o JavaScript a cada visita: a aplicação fica lenta para sempre.',
      },
      {
        id: 'ask-users',
        text: 'Pedir para as pessoas limparem o cache.',
        explanation:
          'Incorreto. O problema é de configuração; a maioria das pessoas nem verá o aviso.',
      },
      {
        id: 'query-string',
        text: 'Acrescentar ?v=2 manualmente nos links do index.html a cada publicação.',
        explanation:
          'Incorreto. O próprio index.html continua em cache com os links antigos; e o hash do build já faz isso automaticamente.',
      },
    ],
    correctOptionIds: ['split'],
    hints: ['Qual arquivo diz ao navegador quais outros arquivos carregar?'],
    solution: [
      {
        type: 'code',
        language: 'text',
        code: `index.html: Cache-Control: no-cache\nmain-*.js, chunk-*.js, styles-*.css: Cache-Control: public, max-age=31536000, immutable`,
      },
    ],
  },
  {
    id: 'http-01-401-403',
    kind: 'multiple-choice',
    title: '401 ou 403?',
    difficulty: 'introductory',
    conceptIds: ['web-http'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Uma pessoa logada com o papel de leitura tenta excluir um cliente. Qual status o servidor deve devolver, e o que a interface deve fazer?',
      },
    ],
    options: [
      {
        id: '403',
        text: '403: ela está autenticada, mas não tem permissão. A interface explica que a ação não é permitida para o papel dela, sem mandar para o login.',
        explanation:
          'Correto. 401 seria para quem não está autenticado (ou com sessão expirada), e a reação seria levar ao login.',
      },
      {
        id: '401',
        text: '401, e a interface leva ao login.',
        explanation:
          'Incorreto. Entrar de novo não muda o papel: a pessoa voltaria ao mesmo ponto e receberia o mesmo erro.',
      },
      {
        id: '404',
        text: '404, para esconder que o recurso existe.',
        explanation:
          'Alguns sistemas fazem isso para recursos privados de outras pessoas, mas aqui a pessoa já vê o cliente na lista; 403 comunica o motivo real.',
      },
      {
        id: '500',
        text: '500, porque a operação falhou.',
        explanation:
          'Incorreto. 5xx é problema no servidor; aqui o servidor funcionou e recusou corretamente.',
      },
    ],
    correctOptionIds: ['403'],
    hints: ['O servidor sabe quem é a pessoa?'],
    solution: [{ type: 'paragraph', text: '401: quem é você? 403: sei quem você é, e não pode.' }],
  },
  {
    id: 'http-01-revalidation',
    kind: 'multiple-choice',
    title: 'O 304 que o fetch não vê',
    difficulty: 'introductory',
    conceptIds: ['web-caching'],
    prompt: [
      {
        type: 'paragraph',
        text: 'A API responde com ETag e Cache-Control: no-cache. Na segunda chamada a fetch para o mesmo endereço, o servidor responde 304. O que o seu código JavaScript recebe?',
      },
    ],
    options: [
      {
        id: '200-cached',
        text: 'Uma resposta com status 200 e o corpo da cópia guardada: a revalidação é feita pelo navegador, sem aparecer para o JavaScript.',
        explanation:
          'Correto. Medido num Chromium com um servidor local: o servidor contou a revalidação e respondeu 304, e o fetch recebeu 200 com o corpo completo.',
      },
      {
        id: '304-empty',
        text: 'Uma resposta com status 304 e corpo vazio, que o código precisa tratar.',
        explanation:
          'Incorreto para o fetch comum: o navegador resolve o 304 com a cópia em cache e entrega 200.',
      },
      {
        id: 'error',
        text: 'Uma rejeição da promise, porque 304 não é sucesso.',
        explanation: 'Incorreto. fetch só rejeita sem resposta; e aqui o código nem vê o 304.',
      },
      {
        id: 'no-request',
        text: 'Nada chega ao servidor: no-cache significa não perguntar.',
        explanation:
          'Incorreto. no-cache significa guardar, mas perguntar antes de usar. Quem não pergunta é max-age.',
      },
    ],
    correctOptionIds: ['200-cached'],
    hints: ['Quem lida com o 304: o seu código ou o navegador?'],
    solution: [
      {
        type: 'paragraph',
        text: 'A revalidação é transparente: o JavaScript recebe 200 com o corpo guardado.',
      },
    ],
  },
  {
    id: 'http-01-idempotent',
    kind: 'multiple-choice',
    title: 'Repetir é seguro?',
    difficulty: 'introductory',
    conceptIds: ['web-http'],
    prompt: [
      {
        type: 'paragraph',
        text: 'A conexão cai depois de enviar uma requisição, sem resposta. Em qual caso é seguro a aplicação repetir automaticamente?',
      },
    ],
    options: [
      {
        id: 'delete',
        text: 'DELETE /api/clientes/7: repetir deixa o cliente apagado do mesmo jeito.',
        explanation:
          'Correto. DELETE é idempotente: o resultado final é o mesmo com uma ou várias execuções (a segunda pode responder 404, mas o estado é o mesmo).',
      },
      {
        id: 'post-payment',
        text: 'POST /api/pagamentos: repetir garante que o pagamento aconteça.',
        explanation:
          'Incorreto. POST não é idempotente: o primeiro pode ter sido processado, e repetir cobraria duas vezes. Para isso existem chaves de idempotência enviadas pelo cliente.',
      },
      {
        id: 'post-create',
        text: 'POST /api/clientes: o servidor ignora duplicados.',
        explanation: 'Só se o servidor foi feito para isso; por padrão, cria dois clientes.',
      },
      {
        id: 'none',
        text: 'Nenhum: nunca se repete uma requisição.',
        explanation:
          'Incorreto. Repetir GET, PUT e DELETE é seguro, e é o que muitos clientes HTTP fazem.',
      },
    ],
    correctOptionIds: ['delete'],
    hints: ['Qual método dá o mesmo resultado final se executado duas vezes?'],
    solution: [
      {
        type: 'paragraph',
        text: 'GET, PUT e DELETE: idempotentes. POST: não, a menos que a API ofereça chave de idempotência.',
      },
    ],
  },
];
