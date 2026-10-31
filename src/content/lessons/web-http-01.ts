import { Lesson } from '../../app/core/models/content.models';

/** Caching behaviour measured in a real Chromium against a local server (D-061). */
export const REQUEST_RESPONSE_TEXT = `GET /api/produtos?busca=cafe HTTP/1.1
Host: loja.exemplo.com
Accept: application/json
Cookie: sessao=8f2c…

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Cache-Control: no-cache
ETag: "v42"

[{ "id": 1, "nome": "Café torrado", "preco": 2490 }]`;

export const CACHE_TEXT = `# Arquivos do build com hash no nome (main-7HAOWJWQ.js): nunca mudam.
Cache-Control: public, max-age=31536000, immutable

# index.html: sempre conferir se há versão nova.
Cache-Control: no-cache

# Dados que mudam e podem ser revalidados:
Cache-Control: no-cache
ETag: "v42"            # o navegador pergunta "mudou desde v42?" e recebe 304 se não

# Dados sensíveis (extrato, dados pessoais): não guardar.
Cache-Control: no-store`;

export const WEB_HTTP_01: Lesson = {
  id: 'web-http-01',
  moduleId: 'web-http-protocol',
  title: 'HTTP: métodos, status, cabeçalhos e cache',
  summary:
    'A conversa entre o navegador e o servidor: o que cada método significa, o que cada código de status pede da interface e como o cache economiza (ou atrapalha) carregamentos.',
  estimatedMinutes: 40,
  difficulty: 'introductory',
  conceptIds: ['web-http', 'web-caching'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Toda tela que mostra dados conversa com um servidor por HTTP. Entender essa conversa é o que separa "a API está quebrada" de "a API respondeu 401 porque a sessão expirou, então a interface precisa levar ao login". E o cache decide se a página abre em milissegundos ou baixa tudo de novo, e também se uma versão nova chega a quem já tinha a antiga.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Ler uma requisição e uma resposta HTTP.',
            'Escolher o método certo e saber quais são seguros e idempotentes.',
            'Decidir o que a interface faz para cada família de status.',
            'Entender cabeçalhos comuns e o cache (Cache-Control, ETag, 304).',
            'Investigar tudo isso na aba Rede do DevTools.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'O balcão de atendimento',
      blocks: [
        {
          type: 'paragraph',
          text: 'Uma requisição é um pedido no balcão: o que você quer fazer (o método: consultar, cadastrar, alterar, remover), sobre o quê (o endereço) e seus documentos (os cabeçalhos, como o cookie de sessão). A resposta vem com um código de resultado (o status) e, às vezes, um pacote (o corpo).',
        },
        {
          type: 'paragraph',
          text: 'O cache é a cópia que você guarda em casa. Para alguns papéis você confere no balcão se ainda valem (revalidação), para outros você confia na validade impressa (max-age), e documentos sigilosos você nem guarda (no-store).',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Métodos, status, cabeçalhos e cache',
      blocks: [
        {
          type: 'table',
          caption: 'Métodos mais usados',
          headers: ['Método', 'Uso', 'Seguro', 'Idempotente'],
          rows: [
            ['GET', 'Ler', 'Sim', 'Sim'],
            ['POST', 'Criar ou executar uma ação', 'Não', 'Não'],
            ['PUT', 'Substituir um recurso inteiro', 'Não', 'Sim'],
            ['PATCH', 'Alterar parte de um recurso', 'Não', 'Nem sempre'],
            ['DELETE', 'Remover', 'Não', 'Sim'],
          ],
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Seguro: não muda nada no servidor (GET não deve apagar nem criar). Idempotente: repetir dá o mesmo resultado final (apagar duas vezes deixa apagado). Por isso navegadores e proxies podem repetir um GET, mas nunca um POST sozinhos.',
            '2xx: deu certo (200 OK, 201 Created com o recurso criado, 204 No Content sem corpo).',
            '3xx: vá para outro lugar (301 e 302 redirecionam; 304 Not Modified diz "use a sua cópia").',
            '4xx: o problema está no pedido. 400 e 422: dados inválidos; 401: falta autenticação (sessão ausente ou expirada); 403: autenticado, mas sem permissão; 404: não existe; 409: conflito com o estado atual (e-mail já cadastrado); 429: pedidos demais.',
            '5xx: o problema está no servidor. 500: erro inesperado; 503: indisponível no momento (manutenção, sobrecarga).',
            'Status 0 no navegador não é HTTP: a requisição nem teve resposta (rede, CORS, cancelamento).',
            'Cabeçalhos comuns: Content-Type (formato do corpo), Accept (formato desejado), Authorization ou Cookie (quem pede), Cache-Control (regras de cache), ETag (versão do recurso), Retry-After (quando tentar de novo).',
            'Cache: max-age=N deixa o navegador reutilizar a cópia por N segundos sem perguntar nada. no-cache guarda, mas pergunta antes de usar (com If-None-Match e o ETag); se nada mudou, o servidor responde 304 sem corpo. no-store não guarda.',
            'Arquivos do build com hash no nome podem ter cache longo e immutable: quando o código muda, o nome muda. O index.html, que aponta para esses nomes, precisa de no-cache para que a versão nova chegue.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Medido num Chromium com um servidor local',
          text: 'Com ETag e no-cache, a segunda requisição chegou ao servidor, que respondeu 304; o fetch, mesmo assim, recebeu 200 com o corpo da cópia guardada: a revalidação é invisível para o JavaScript. Com max-age=60, a segunda requisição nem chegou ao servidor. Com no-store, as duas foram completas.',
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: uma busca de produtos',
      blocks: [
        {
          type: 'code',
          language: 'text',
          caption: 'Requisição e resposta',
          code: REQUEST_RESPONSE_TEXT,
        },
        {
          type: 'paragraph',
          text: 'Uma política de cache razoável para uma aplicação Angular publicada como site estático:',
        },
        { type: 'code', language: 'text', caption: 'Cabeçalhos de cache', code: CACHE_TEXT },
        {
          type: 'paragraph',
          text: 'Do lado da interface, cada família de status pede uma reação diferente; você vai escrever essa decisão no laboratório. Ela costuma morar num interceptor (lição de HTTP no Angular).',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Investigue na aba Rede',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Abra qualquer site, a aba Rede do DevTools e recarregue. Clique numa requisição e leia Cabeçalhos, Resposta e Tempo.',
            'Recarregue de novo: quais arquivos vieram "(memory cache)" ou "(disk cache)"? Quais vieram com 304?',
            'Marque "Desativar cache" e recarregue: compare o tempo total.',
            'Encontre uma requisição POST num formulário e veja o corpo enviado em Payload.',
            'Rode fetch("/nao-existe") no console e veja o status: a promise rejeitou?',
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
          text: 'No laboratório, escreva a função que decide a reação da interface para cada status. Depois, responda sobre métodos.',
        },
      ],
      exerciseIds: ['lab-js-http-status', 'http-01-methods'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: a versão nova que não chega',
      blocks: [
        {
          type: 'paragraph',
          text: 'Depois de publicar uma correção, várias pessoas continuam vendo a versão antiga por horas, até limparem o cache. O servidor envia Cache-Control: max-age=86400 para todos os arquivos, inclusive o index.html.',
        },
      ],
      exerciseIds: ['http-01-cache-bug'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'O build do Angular coloca hash no nome dos arquivos (outputHashing), justamente para permitir cache longo neles.',
            'Uma API bem desenhada usa os status certos: 201 ao criar, 409 no conflito, 422 na validação. Isso permite que o frontend reaja sem adivinhar.',
            'Ao investigar um bug, a aba Rede costuma responder mais rápido que o código: status, corpo e tempo de cada chamada.',
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
      exerciseIds: ['http-01-401-403', 'http-01-revalidation', 'http-01-idempotent'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'GET lê sem mudar nada; POST cria; PUT e DELETE são idempotentes.',
            '2xx certo, 4xx problema no pedido, 5xx problema no servidor, 0 sem resposta.',
            '401 é "quem é você?"; 403 é "sei quem você é, e não pode".',
            'max-age reutiliza sem perguntar; no-cache pergunta (304 se nada mudou); no-store não guarda.',
            'Arquivos com hash: cache longo. index.html: no-cache.',
          ],
        },
      ],
    },
  ],
};
