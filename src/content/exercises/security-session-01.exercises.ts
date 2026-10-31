import { Exercise } from '../../app/core/models/content.models';

/** The XSRF header rules claimed here are executed in `src/content/security-examples.spec.ts`. */
export const XSRF_PREDICT_TS = `// O servidor enviou o cookie XSRF-TOKEN=abc123; a aplicação está em https://app.exemplo.com
const a = http.post('/api/transferencias', dados);
const b = http.post('https://app.exemplo.com/api/transferencias', dados);
// Cabeçalho X-XSRF-TOKEN de cada requisição:
console.log(cabecalho(a), cabecalho(b));`;

export const SECURITY_SESSION_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-js-cookie-review',
    kind: 'code',
    language: 'javascript',
    title: 'Revisor de cookies de sessão',
    difficulty: 'intermediate',
    conceptIds: ['security-sessions'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Escreva revisarCookie(setCookie), que recebe o valor de um cabeçalho Set-Cookie e devolve { nome, problemas }. É o tipo de verificação que uma ferramenta de revisão de segurança faz.',
      },
    ],
    requirements: [
      'nome é o texto antes do primeiro "=".',
      'problemas lista, nesta ordem, o que faltar: "falta Secure", "falta HttpOnly", "falta SameSite".',
      'SameSite=None conta como problema: "SameSite=None envia o cookie para outros sites".',
      'Os nomes dos atributos não diferenciam maiúsculas e minúsculas, e espaços em volta são ignorados.',
      'Só os atributos (depois do primeiro ";") contam: o valor do cookie pode conter qualquer texto.',
    ],
    examples: [
      {
        input: "revisarCookie('__Host-sessao=8f2c; Path=/; Secure; HttpOnly; SameSite=Lax')",
        output: "{ nome: '__Host-sessao', problemas: [] }",
      },
      {
        input: "revisarCookie('sessao=abc')",
        output:
          "{ nome: 'sessao', problemas: ['falta Secure', 'falta HttpOnly', 'falta SameSite'] }",
      },
    ],
    starterCode: `function revisarCookie(setCookie) {
  // Seu código aqui
}

console.log(revisarCookie('sessao=abc; Secure'));
`,
    tests: [
      {
        id: 'good',
        description: 'Cookie bem configurado não tem problemas',
        source:
          "expect(revisarCookie('__Host-sessao=8f2c; Path=/; Secure; HttpOnly; SameSite=Lax')).toEqual({ nome: '__Host-sessao', problemas: [] });",
      },
      {
        id: 'bare',
        description: 'Sem atributos, aponta os três problemas, na ordem',
        source:
          "expect(revisarCookie('sessao=abc')).toEqual({ nome: 'sessao', problemas: ['falta Secure', 'falta HttpOnly', 'falta SameSite'] });",
      },
      {
        id: 'case',
        description: 'Ignora maiúsculas e espaços nos atributos',
        source:
          "expect(revisarCookie('sessao=abc;  secure ;HTTPONLY; samesite=strict').problemas).toEqual([]);",
      },
      {
        id: 'none',
        description: 'Aponta SameSite=None',
        source:
          "expect(revisarCookie('sessao=abc; Secure; HttpOnly; SameSite=None').problemas).toEqual(['SameSite=None envia o cookie para outros sites']);",
      },
      {
        id: 'equals-in-value',
        description: 'O nome é o que vem antes do primeiro "="',
        source:
          "expect(revisarCookie('token=a=b; Secure; HttpOnly; SameSite=Lax')).toEqual({ nome: 'token', problemas: [] });",
      },
      {
        id: 'value-text',
        description: 'Texto no valor do cookie não conta como atributo',
        source:
          "expect(revisarCookie('nota=HttpOnly; Secure; SameSite=Lax').problemas).toEqual(['falta HttpOnly']);",
      },
    ],
    hints: [
      'Separe por ";": a primeira parte é nome=valor, as outras são atributos.',
      'Normalize cada atributo com trim() e toLowerCase() antes de comparar.',
      'Para SameSite, separe o nome do valor do atributo pelo "=".',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `function revisarCookie(setCookie) {
  const [par, ...atributos] = setCookie.split(';');
  const nome = par.slice(0, par.indexOf('=')).trim();
  // Só os atributos: o valor do cookie pode conter qualquer texto.
  const attrs = atributos.map((a) => a.trim().toLowerCase());
  const sameSite = attrs.find((a) => a.startsWith('samesite='))?.split('=')[1];

  const problemas = [];
  if (!attrs.includes('secure')) problemas.push('falta Secure');
  if (!attrs.includes('httponly')) problemas.push('falta HttpOnly');
  if (!sameSite) problemas.push('falta SameSite');
  else if (sameSite === 'none') problemas.push('SameSite=None envia o cookie para outros sites');
  return { nome, problemas };
}`,
      },
      {
        type: 'paragraph',
        text: 'Separar o par nome=valor dos atributos antes de procurar as flags é o que evita o falso positivo do cookie cujo valor é "HttpOnly".',
      },
    ],
  },
  {
    id: 'session-01-storage',
    kind: 'multiple-choice',
    title: 'Onde guardar a sessão?',
    difficulty: 'advanced',
    conceptIds: ['security-sessions'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Uma dependência do frontend é comprometida e passa a rodar um script na página. Qual forma de guardar a sessão limita mais o estrago?',
      },
    ],
    options: [
      {
        id: 'httponly',
        text: 'Cookie de sessão com HttpOnly, Secure e SameSite: o script não consegue ler a sessão para levá-la embora.',
        explanation:
          'Correto. O script ainda pode fazer requisições enquanto a vítima está na página, mas não consegue copiar a sessão para usar depois, de outro lugar. É por isso que HttpOnly reduz o estrago e não substitui a prevenção.',
      },
      {
        id: 'localstorage',
        text: 'Token no localStorage, porque só a própria origem tem acesso.',
        explanation:
          'Incorreto. O script comprometido roda na própria origem: localStorage.getItem lê o token na hora.',
      },
      {
        id: 'session-storage',
        text: 'Token no sessionStorage, que é apagado ao fechar a aba.',
        explanation:
          'Incorreto. Enquanto a aba está aberta, qualquer script da página lê o sessionStorage tão facilmente quanto o localStorage.',
      },
      {
        id: 'memory',
        text: 'Token numa variável JavaScript, que não fica salva em lugar nenhum.',
        explanation:
          'Melhora em relação ao localStorage, mas um script na mesma página pode interceptar chamadas e capturar o token. HttpOnly tira a sessão do alcance do JavaScript.',
      },
    ],
    correctOptionIds: ['httponly'],
    hints: ['Qual das opções o JavaScript da página não consegue ler?'],
    solution: [
      {
        type: 'code',
        language: 'text',
        code: `Set-Cookie: __Host-sessao=…; Path=/; Secure; HttpOnly; SameSite=Lax`,
      },
    ],
  },
  {
    id: 'session-01-cors',
    kind: 'multiple-choice',
    title: '"O CORS protege a nossa API"',
    difficulty: 'advanced',
    conceptIds: ['security-cors'],
    prompt: [
      {
        type: 'paragraph',
        text: 'A API de transferências libera CORS só para o domínio oficial. O que isso garante?',
      },
    ],
    options: [
      {
        id: 'only-reading',
        text: 'Só que páginas de outros sites, no navegador, não leem as respostas. Requisições simples ainda chegam ao servidor, e ferramentas fora do navegador ignoram CORS. A autorização tem de ser feita pelo servidor, e o CSRF precisa de defesa própria.',
        explanation:
          'Correto. Foi medido nesta plataforma: um POST de formulário vindo de outra origem chegou ao servidor e foi processado, mesmo sem liberação de CORS; só a leitura da resposta falhou.',
      },
      {
        id: 'nobody',
        text: 'Que ninguém além do frontend oficial consegue chamar a API.',
        explanation:
          'Incorreto. curl, scripts e outros servidores não aplicam CORS. CORS é uma regra do navegador para proteger quem navega, não a API.',
      },
      {
        id: 'csrf',
        text: 'Que a API está protegida contra CSRF.',
        explanation:
          'Incorreto. Um formulário de outro site envia um POST simples, que chega ao servidor com os cookies da vítima. O CORS só impede que o site malicioso leia a resposta.',
      },
      {
        id: 'nothing',
        text: 'Nada: CORS não tem efeito nenhum.',
        explanation:
          'Incorreto. Ele impede que páginas de outras origens leiam respostas, o que protege dados de quem está logado contra sites maliciosos.',
      },
    ],
    correctOptionIds: ['only-reading'],
    hints: ['Quem aplica a regra de CORS: o servidor ou o navegador?'],
    solution: [
      {
        type: 'paragraph',
        text: 'CORS decide quem pode ler, no navegador. Autorização decide quem pode fazer, no servidor.',
      },
    ],
  },
  {
    id: 'session-01-csrf',
    kind: 'multiple-choice',
    title: 'Como o CSRF acontece',
    difficulty: 'advanced',
    conceptIds: ['security-csrf'],
    prompt: [
      {
        type: 'paragraph',
        text: 'A vítima está logada no banco (cookie de sessão sem SameSite) e abre um site malicioso, que tem um formulário escondido que se envia sozinho para o banco. O que acontece, e qual defesa resolve?',
      },
    ],
    options: [
      {
        id: 'cookie-goes',
        text: 'O navegador envia o formulário com o cookie da vítima e o banco executa a ação. Defesa: SameSite=Lax ou Strict no cookie e um token anti-CSRF conferido pelo servidor.',
        explanation:
          'Correto. O servidor não tem como saber que a ação partiu de outro site, a menos que exija algo que o site malicioso não consegue obter (o token) ou que o cookie nem seja enviado (SameSite).',
      },
      {
        id: 'cors-blocks',
        text: 'Nada: o CORS bloqueia o envio para outra origem.',
        explanation:
          'Incorreto. Um formulário comum é uma requisição simples: chega ao servidor. CORS só bloquearia a leitura da resposta.',
      },
      {
        id: 'https',
        text: 'Nada, se o banco usa HTTPS.',
        explanation:
          'Incorreto. HTTPS protege o caminho, não a origem da intenção: a requisição chega íntegra e autenticada.',
      },
      {
        id: 'logout',
        text: 'A sessão é encerrada por segurança.',
        explanation: 'Incorreto. Nada avisa o servidor de que algo está errado.',
      },
    ],
    correctOptionIds: ['cookie-goes'],
    hints: ['O navegador envia cookies em requisições iniciadas por outros sites?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Cookie com SameSite e token anti-CSRF em toda ação que muda dados. No Angular, o HttpClient envia o cabeçalho do token para URLs relativas; o servidor confere.',
      },
    ],
  },
  {
    id: 'session-01-xsrf-url',
    kind: 'predict-output',
    title: 'URL relativa ou absoluta?',
    difficulty: 'advanced',
    conceptIds: ['security-csrf'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Com provideHttpClient() e o cookie XSRF-TOKEN=abc123, o que aparece no console? Digite os dois valores separados por espaço (null se não houver cabeçalho).',
      },
    ],
    language: 'typescript',
    code: XSRF_PREDICT_TS,
    acceptedAnswers: ['abc123 null'],
    explanation:
      'O HttpClient só acrescenta X-XSRF-TOKEN em requisições que alteram dados com URL relativa. Uma URL absoluta não recebe o cabeçalho, mesmo apontando para o próprio site. Use URLs relativas para a sua API.',
    commonMistakes: [
      {
        answer: 'abc123 abc123',
        explanation:
          'Parece o mesmo destino, mas o HttpClient decide pela forma da URL: absoluta não recebe o cabeçalho.',
      },
      {
        answer: 'null null',
        explanation:
          'A proteção vem ligada por padrão com provideHttpClient(): o POST com URL relativa recebe o cabeçalho.',
      },
    ],
    wrongAnswerGuidance:
      'Não é isso. Pense em qual das duas URLs o HttpClient considera segura para receber o token.',
    hints: ['Qual das duas URLs é relativa?'],
    solution: [{ type: 'paragraph', text: 'Saída: abc123 null.' }],
  },
  {
    id: 'session-01-authz',
    kind: 'multiple-choice',
    title: 'Esconder o botão basta?',
    difficulty: 'advanced',
    conceptIds: ['security-sessions'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Só administradores podem excluir usuários. O frontend esconde o botão "Excluir" para quem não é admin, e a rota /admin tem um guard. O que mais é necessário?',
      },
    ],
    options: [
      {
        id: 'server',
        text: 'O servidor conferir, na própria requisição DELETE, se a sessão pertence a um administrador.',
        explanation:
          'Correto. Qualquer pessoa logada pode enviar o DELETE direto, sem o botão e sem passar pelo guard. A autorização vale onde a ação acontece.',
      },
      {
        id: 'nothing',
        text: 'Nada: sem o botão, ninguém consegue excluir.',
        explanation: 'Incorreto. O botão é só uma forma de fazer a requisição; há muitas outras.',
      },
      {
        id: 'obfuscate',
        text: 'Ofuscar o código do frontend para esconder o endereço da API.',
        explanation:
          'Incorreto. O endereço aparece na aba Rede assim que qualquer chamada é feita.',
      },
      {
        id: 'disabled',
        text: 'Deixar o botão visível, mas desabilitado.',
        explanation: 'Incorreto. Muda a interface, não a permissão.',
      },
    ],
    correctOptionIds: ['server'],
    hints: ['Onde a exclusão acontece de fato?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Frontend: esconder o que a pessoa não pode usar (experiência). Backend: recusar o que a pessoa não pode fazer (segurança).',
      },
    ],
  },
];
