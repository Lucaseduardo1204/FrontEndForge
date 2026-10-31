import { Lesson } from '../../app/core/models/content.models';

/**
 * Measured in this project: HttpClient XSRF header rules (`security-examples.spec.ts`), and in
 * a real Chromium with two local origins (D-055): HttpOnly cookies hidden from document.cookie,
 * a simple cross-origin POST reaching the server without CORS, and a JSON POST stopped at the
 * preflight.
 */
export const SESSION_COOKIE_HTTP = `Set-Cookie: __Host-sessao=8f2c…; Path=/; Secure; HttpOnly; SameSite=Lax`;

export const XSRF_CONFIG_TS = `// app.config.ts: a proteção de XSRF já vem ligada com provideHttpClient().
// O servidor envia o cookie XSRF-TOKEN; o HttpClient o lê e manda o cabeçalho
// X-XSRF-TOKEN em POST, PUT, PATCH e DELETE para URLs relativas.
export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient()],
};

// Use URLs relativas para a sua API: com uma URL absoluta, mesmo do próprio site,
// o cabeçalho não é enviado.
this.http.post('/api/transferencias', dados); // leva X-XSRF-TOKEN
this.http.post('https://app.exemplo.com/api/transferencias', dados); // não leva`;

export const CORS_HTTP = `# Resposta da API que permite leitura só pelo frontend oficial, com cookies:
Access-Control-Allow-Origin: https://app.exemplo.com
Access-Control-Allow-Credentials: true
Vary: Origin`;

export const SECURITY_SESSION_01: Lesson = {
  id: 'security-session-01',
  moduleId: 'security-session',
  title: 'Sessões, cookies, CSRF e CORS',
  summary:
    'Quem é a pessoa e o que ela pode fazer, onde guardar a sessão, como outro site pode agir em nome dela e o que CORS realmente faz (e não faz).',
  estimatedMinutes: 50,
  difficulty: 'advanced',
  conceptIds: ['security-sessions', 'security-csrf', 'security-cors'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Depois do login, cada requisição precisa provar quem a pessoa é. Onde essa prova fica guardada decide o que um ataque consegue roubar. E como o navegador envia cookies automaticamente, outro site pode fazer o navegador da vítima pedir coisas ao seu servidor: é o CSRF.',
        },
        {
          type: 'paragraph',
          text: 'No meio disso aparece o CORS, provavelmente a regra mais mal entendida da web: muita gente acha que ele protege a API. Ele protege outra coisa.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Separar autenticação (quem é) de autorização (o que pode fazer).',
            'Comparar cookie HttpOnly e localStorage para guardar a sessão.',
            'Configurar as flags de um cookie de sessão.',
            'Entender o CSRF e as defesas: SameSite e token anti-CSRF.',
            'Saber o que o CORS bloqueia, o que ele deixa passar e o que não é papel dele.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'A pulseira do evento',
      blocks: [
        {
          type: 'paragraph',
          text: 'Num evento, a pulseira prova que você entrou (autenticação). A área VIP confere se a sua pulseira é VIP (autorização). Uma pulseira que não sai do pulso é o cookie HttpOnly: ninguém tira de você. Um ingresso de papel no bolso é o token no localStorage: quem enfiar a mão no bolso leva.',
        },
        {
          type: 'paragraph',
          text: 'CSRF é alguém empurrar você até o bar e pedir uma bebida apontando para a sua pulseira: você nem percebe, e a conta é sua. O garçom que pergunta "foi você que pediu?" (o token anti-CSRF) resolve.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Sessão, CSRF e CORS',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Autenticação confirma quem é; autorização decide se aquela pessoa pode fazer aquela ação naquele dado. As duas acontecem no servidor, a cada requisição. Guards no frontend só organizam a navegação.',
            'Cookie com HttpOnly não aparece em document.cookie: o JavaScript da página, inclusive um script injetado por XSS, não consegue lê-lo. O navegador continua enviando o cookie nas requisições.',
            'Token no localStorage pode ser lido por qualquer script da página: um XSS ou uma dependência comprometida leva o token, que continua valendo fora do navegador. Prefira cookie HttpOnly para a sessão. Ainda assim, um XSS consegue fazer requisições em nome da vítima enquanto ela está na página: HttpOnly reduz o estrago, não substitui a prevenção de XSS.',
            'Flags do cookie de sessão: Secure (só vai por HTTPS), HttpOnly (fora do alcance do JavaScript), SameSite=Lax ou Strict (não acompanha a maioria das requisições vindas de outros sites). O prefixo __Host- exige Secure, Path=/ e nenhum Domain. SameSite=None exige Secure.',
            'CSRF: um site malicioso faz o navegador da vítima enviar uma requisição ao seu servidor (um formulário que se envia sozinho, por exemplo), e o cookie vai junto. Defesas: SameSite no cookie e um token anti-CSRF que o servidor confere em toda ação que muda dados.',
            'O HttpClient do Angular já participa do padrão "cookie mais cabeçalho": lê o cookie XSRF-TOKEN e envia o cabeçalho X-XSRF-TOKEN em requisições que alteram dados (não em GET), só para URLs relativas. Quem cria o cookie e confere o cabeçalho é o servidor.',
            'CORS é uma regra do navegador: por padrão, uma página não consegue ler respostas de outra origem. O servidor libera com Access-Control-Allow-Origin. Requisições "simples" (um formulário, texto) chegam ao servidor mesmo sem essa liberação; o que fica bloqueado é a leitura da resposta. Requisições com JSON ou cabeçalhos próprios passam antes por uma consulta (preflight, OPTIONS), e sem liberação a requisição real nem é enviada.',
            'CORS não é autorização: curl, scripts e outros servidores ignoram CORS por completo. E também não é defesa contra CSRF, já que requisições simples chegam ao servidor.',
            'HTTPS em tudo: sem ele, cookies e tokens viajam legíveis pela rede. Secure no cookie garante que ele não vaze numa página http.',
          ],
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: configurando a sessão',
      blocks: [
        {
          type: 'paragraph',
          text: 'O cookie de sessão que o servidor envia depois do login:',
        },
        { type: 'code', language: 'text', caption: 'Resposta do login', code: SESSION_COOKIE_HTTP },
        {
          type: 'paragraph',
          text: 'No Angular, a parte do frontend da proteção contra CSRF:',
        },
        {
          type: 'code',
          language: 'typescript',
          caption: 'app.config.ts e chamadas',
          code: XSRF_CONFIG_TS,
        },
        {
          type: 'paragraph',
          text: 'E a liberação de CORS no servidor, quando o frontend fica em outra origem: uma origem específica, nunca * quando há cookies (o navegador recusa essa combinação).',
        },
        { type: 'code', language: 'text', caption: 'Cabeçalhos da API', code: CORS_HTTP },
        {
          type: 'callout',
          tone: 'info',
          title: 'Isto foi medido',
          text: 'Os testes da plataforma conferem as regras do cabeçalho X-XSRF-TOKEN no HttpClient do projeto. Num Chromium real com duas origens locais, foi medido que o cookie HttpOnly não aparece em document.cookie, que um POST simples de outra origem chega ao servidor e é processado sem CORS (só a leitura da resposta falha), e que um POST com JSON para no preflight.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Investigue no navegador',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Abra um site em que você está logado, vá em Aplicativo (Application) → Cookies no DevTools e veja as colunas HttpOnly, Secure e SameSite do cookie de sessão.',
            'No console desse site, rode document.cookie: o cookie de sessão aparece?',
            'Em dois servidores locais (portas diferentes), faça um fetch de um para o outro sem cabeçalhos de CORS, e registre no servidor o que chega. Repita com o cabeçalho Content-Type: application/json.',
            'Na aba Rede, encontre uma requisição OPTIONS de preflight e leia os cabeçalhos Access-Control-*.',
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
          text: 'No laboratório, escreva um revisor de cookies que aponta as flags que faltam. Depois, responda sobre onde guardar a sessão.',
        },
      ],
      exerciseIds: ['lab-js-cookie-review', 'session-01-storage'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: "o CORS protege a nossa API"',
      blocks: [
        {
          type: 'paragraph',
          text: 'A equipe configurou Access-Control-Allow-Origin só para o domínio oficial e concluiu que ninguém mais consegue chamar a API de transferências.',
        },
      ],
      exerciseIds: ['session-01-cors'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'O padrão mais simples para SPAs no mesmo domínio da API: sessão em cookie HttpOnly, Secure, SameSite=Lax, mais token anti-CSRF; o frontend nunca vê a sessão.',
            'Quando o frontend e a API ficam em domínios diferentes, um backend-for-frontend (BFF) no mesmo domínio do frontend guarda os tokens e repassa as chamadas.',
            'Logout de verdade invalida a sessão no servidor; apagar algo no navegador não basta.',
            'Esta plataforma não tem login: o progresso fica no localStorage justamente porque não é dado sensível, e a interface avisa que não é backup.',
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
      exerciseIds: ['session-01-csrf', 'session-01-xsrf-url', 'session-01-authz'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Autenticação e autorização no servidor, a cada requisição.',
            'Sessão em cookie Secure, HttpOnly, SameSite; localStorage fica exposto a qualquer script.',
            'CSRF: SameSite e token anti-CSRF conferido pelo servidor; HttpClient manda o cabeçalho em URLs relativas.',
            'CORS controla a leitura no navegador; não é autorização nem defesa contra CSRF.',
            'HTTPS em tudo.',
          ],
        },
        {
          type: 'paragraph',
          text: 'Na Biblioteca: "Segurança no frontend: o essencial".',
        },
      ],
    },
  ],
};
