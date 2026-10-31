import { Exercise } from '../../app/core/models/content.models';

/** Angular behaviour claimed here is executed in `src/content/security-examples.spec.ts`. */
export const HREF_PREDICT_HTML = `<a id="perfil" [href]="site">Site do autor</a>

<!-- No componente: site = 'javascript:alert(1)'; -->
<!-- Depois de renderizar: -->
<!-- console.log(document.querySelector('#perfil').getAttribute('href')); -->`;

export const SECURITY_XSS_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-js-safe-url',
    kind: 'code',
    language: 'javascript',
    title: 'Links seguros vindos de usuários',
    difficulty: 'intermediate',
    conceptIds: ['web-xss'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Perfis têm um campo "site", preenchido por quem se cadastra, que vira um link na página. Escreva urlSegura(entrada): devolva o link (sem espaços nas pontas) se ele for seguro, ou null se não for.',
      },
    ],
    requirements: [
      'Aceita links http:, https: e mailto:.',
      'Aceita caminhos do próprio site, como /perfil/ana.',
      'Recusa (null) javascript:, data: e qualquer outro esquema, em maiúsculas ou minúsculas.',
      'Recusa entradas que o navegador interpretaria como javascript: mesmo com espaços ou tabulações escondidos.',
      'Recusa entradas que não formam uma URL válida.',
    ],
    examples: [
      { input: "urlSegura('https://ana.dev')", output: "'https://ana.dev'" },
      { input: "urlSegura('javascript:alert(1)')", output: 'null' },
      { input: "urlSegura(' /perfil/ana ')", output: "'/perfil/ana'" },
    ],
    starterCode: `function urlSegura(entrada) {
  // Versão ingênua: deixa passar vários ataques. Melhore.
  if (entrada.startsWith('javascript:')) return null;
  return entrada;
}

console.log(urlSegura('https://ana.dev'));
`,
    tests: [
      {
        id: 'http',
        description: 'Aceita http, https e mailto',
        source:
          "expect(urlSegura('https://ana.dev')).toBe('https://ana.dev'); expect(urlSegura('http://ana.dev/blog')).toBe('http://ana.dev/blog'); expect(urlSegura('mailto:ana@exemplo.com')).toBe('mailto:ana@exemplo.com');",
      },
      {
        id: 'relative',
        description: 'Aceita caminhos do próprio site, sem os espaços das pontas',
        source: "expect(urlSegura('  /perfil/ana ')).toBe('/perfil/ana');",
      },
      {
        id: 'javascript',
        description: 'Recusa javascript:, em qualquer combinação de maiúsculas',
        source:
          "expect(urlSegura('javascript:alert(1)')).toBe(null); expect(urlSegura('JavaScript:alert(1)')).toBe(null);",
      },
      {
        id: 'hidden',
        description: 'Recusa javascript: escondido com espaços ou tabulação',
        source:
          "expect(urlSegura('  javascript:alert(1)')).toBe(null); expect(urlSegura('java\\tscript:alert(1)')).toBe(null);",
      },
      {
        id: 'data',
        description: 'Recusa data: e outros esquemas',
        source:
          "expect(urlSegura('data:text/html,<script>alert(1)</script>')).toBe(null); expect(urlSegura('vbscript:msgbox(1)')).toBe(null);",
      },
      {
        id: 'invalid',
        description: 'Recusa entradas que não formam uma URL válida',
        source: "expect(urlSegura('http://')).toBe(null);",
      },
    ],
    hints: [
      'Uma lista de esquemas permitidos é mais segura que uma lista de proibidos: ataques novos não estão na lista.',
      "new URL(entrada, 'https://exemplo.invalid') interpreta a entrada como o navegador faria, inclusive caminhos relativos, e url.protocol já vem em minúsculas.",
      'new URL lança erro para entradas inválidas: use try/catch e devolva null.',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `function urlSegura(entrada) {
  try {
    // A base resolve caminhos relativos; o parser remove tabulações e quebras de linha
    // como o navegador faria, então "java\\tscript:" também é reconhecido.
    const url = new URL(entrada.trim(), 'https://exemplo.invalid');
    return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? entrada.trim() : null;
  } catch {
    return null; // não é uma URL válida
  }
}`,
      },
      {
        type: 'paragraph',
        text: 'A versão ingênua falha porque compara texto: o navegador ignora maiúsculas no esquema e remove tabulações e quebras de linha antes de interpretar a URL. Interpretar com new URL e conferir o resultado contra uma lista de permitidos evita essas diferenças.',
      },
    ],
  },
  {
    id: 'xss-01-sanitizer',
    kind: 'multiple-choice',
    title: 'O que [innerHTML] deixa passar?',
    difficulty: 'intermediate',
    conceptIds: ['angular-sanitization'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O texto do exemplo (<img src="x" onerror="alert(1)"><b>negrito</b><script>alert(2)</script>) é exibido com [innerHTML]. O que chega ao DOM?',
      },
    ],
    options: [
      {
        id: 'sanitized',
        text: '<img src="x"><b>negrito</b>: sem onerror e sem script; o Angular avisa no console.',
        explanation:
          'Correto. O sanitizador mantém a formatação segura e remove o que executa código: atributos de evento e o elemento script inteiro.',
      },
      {
        id: 'literal',
        text: 'O texto aparece literalmente, com os sinais < e > visíveis.',
        explanation:
          'Incorreto. Isso é o que a interpolação {{ }} faz. [innerHTML] interpreta HTML, mas sanitizado.',
      },
      {
        id: 'everything',
        text: 'Tudo, inclusive o onerror, que executa.',
        explanation:
          'Incorreto. Só aconteceria com bypassSecurityTrustHtml, ou com element.innerHTML fora do Angular.',
      },
      {
        id: 'nothing',
        text: 'Nada: o Angular recusa qualquer HTML com script e mostra um erro.',
        explanation: 'Incorreto. Ele remove as partes perigosas e mantém o resto.',
      },
    ],
    correctOptionIds: ['sanitized'],
    hints: ['O sanitizador remove o quê: tudo ou só o que executa código?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Interpolação mostra texto; [innerHTML] mostra HTML sanitizado; bypass mostra tudo.',
      },
    ],
  },
  {
    id: 'xss-01-bypass',
    kind: 'multiple-choice',
    title: 'O bypass da formatação',
    difficulty: 'intermediate',
    conceptIds: ['angular-sanitization', 'web-xss'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O código com bypassSecurityTrustHtml foi escrito porque "o negrito dos comentários não aparecia". Qual é o risco e a correção?',
      },
    ],
    options: [
      {
        id: 'xss',
        text: 'Qualquer pessoa que comente pode executar código no navegador de quem lê. Usar [innerHTML] sem bypass, que já mantém o negrito e remove o que é perigoso.',
        explanation:
          'Correto. O bypass desliga a única barreira entre o texto do comentário e a página. O sanitizador já preserva formatação simples como <b>.',
      },
      {
        id: 'ok-trusted',
        text: 'Nenhum risco: o texto vem da nossa própria API.',
        explanation:
          'Incorreto. A API só guarda o que alguém digitou. "Vem do nosso servidor" não significa "foi escrito por nós".',
      },
      {
        id: 'escape-server',
        text: 'Basta o servidor remover a palavra "script" dos comentários.',
        explanation:
          'Incorreto. onerror, onload, javascript: e muitas outras formas executam código sem a palavra "script". Filtros por palavra sempre deixam algo passar.',
      },
      {
        id: 'csp-enough',
        text: 'Manter o bypass e confiar na CSP.',
        explanation:
          'Incorreto. A CSP é a segunda barreira, e muitas aplicações nem conseguem usar uma CSP estrita. Não remova a primeira.',
      },
    ],
    correctOptionIds: ['xss'],
    hints: ['Quem escreve o texto do comentário?'],
    solution: [
      {
        type: 'code',
        language: 'html',
        code: `<div [innerHTML]="comentario().texto"></div>`,
      },
    ],
  },
  {
    id: 'xss-01-href',
    kind: 'predict-output',
    title: 'O link javascript:',
    difficulty: 'intermediate',
    conceptIds: ['angular-sanitization'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O que aparece no console? Digite o valor exato do atributo href.',
      },
    ],
    language: 'html',
    code: HREF_PREDICT_HTML,
    acceptedAnswers: ['unsafe:javascript:alert(1)'],
    explanation:
      'O Angular sanitiza URLs em bindings como [href]: um esquema perigoso recebe o prefixo unsafe:, o navegador não reconhece o esquema e nada executa. Um aviso aparece no console.',
    commonMistakes: [
      {
        answer: 'javascript:alert(1)',
        explanation:
          'Seria assim com um atributo estático escrito no template ou com bypassSecurityTrustUrl. No binding [href], o Angular sanitiza o valor.',
      },
      {
        answer: 'null',
        explanation: 'O atributo não é removido: o valor recebe o prefixo unsafe:.',
      },
    ],
    wrongAnswerGuidance:
      'Não é isso. O Angular não remove o link: ele altera o valor para que o navegador não o execute.',
    hints: ['O Angular deixa um prefixo no valor perigoso.'],
    solution: [{ type: 'paragraph', text: 'Saída: unsafe:javascript:alert(1).' }],
  },
  {
    id: 'xss-01-outside-angular',
    kind: 'multiple-choice',
    title: 'Onde o Angular não protege',
    difficulty: 'intermediate',
    conceptIds: ['web-xss'],
    prompt: [
      {
        type: 'paragraph',
        text: 'nome veio de um formulário de cadastro. Marque todas as linhas que criam risco de XSS.',
      },
    ],
    options: [
      {
        id: 'innerhtml-dom',
        text: 'elemento.innerHTML = `Olá, ${nome}`; (num componente, via ElementRef)',
        explanation:
          'Correto, é risco. Mexer direto no DOM pula o template e o sanitizador do Angular.',
      },
      {
        id: 'adjacent',
        text: "elemento.insertAdjacentHTML('beforeend', nome);",
        explanation: 'Correto, é risco. Também interpreta o texto como HTML, sem sanitização.',
      },
      {
        id: 'function',
        text: 'new Function(nome)();',
        explanation: 'Correto, é risco. Executa o texto como código JavaScript.',
      },
      {
        id: 'interp',
        text: '<p>Olá, {{ nome }}</p>',
        explanation: 'Seguro. A interpolação trata o valor como texto.',
      },
      {
        id: 'textcontent',
        text: 'elemento.textContent = nome;',
        explanation: 'Seguro. textContent nunca interpreta HTML.',
      },
    ],
    correctOptionIds: ['innerhtml-dom', 'adjacent', 'function'],
    hints: ['Quais linhas interpretam o texto como HTML ou como código?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Use o template (interpolação ou [innerHTML]) ou textContent. Se precisar mexer no DOM direto, nunca interprete dados de usuário como HTML.',
      },
    ],
  },
  {
    id: 'xss-01-csp',
    kind: 'multiple-choice',
    title: 'Qual é o papel da CSP?',
    difficulty: 'intermediate',
    conceptIds: ['web-csp'],
    prompt: [
      { type: 'paragraph', text: 'Qual afirmação sobre Content Security Policy está correta?' },
    ],
    options: [
      {
        id: 'second-layer',
        text: 'É uma segunda barreira, enviada pelo servidor, que limita de onde scripts e outros recursos podem vir; precisa ser testada com a aplicação, porque uma política errada pode quebrar funcionalidades ou não proteger nada.',
        explanation:
          'Correto. Ela reduz o estrago de uma falha de XSS, mas não substitui tratar dados como texto. E políticas precisam ser medidas: esta plataforma descobriu que uma política estrita quebrava o próprio laboratório.',
      },
      {
        id: 'replaces',
        text: 'Com CSP, não é mais preciso se preocupar com innerHTML.',
        explanation:
          'Incorreto. Muitas formas de injeção continuam possíveis, e nem toda aplicação consegue uma política estrita.',
      },
      {
        id: 'frontend-config',
        text: 'É configurada no angular.json e vale para qualquer servidor.',
        explanation:
          'Incorreto. A política vem do servidor (cabeçalho HTTP) ou de uma meta tag no HTML; quem hospeda decide.',
      },
      {
        id: 'cors',
        text: 'É o mesmo que CORS.',
        explanation:
          'Incorreto. CORS controla quais origens podem ler respostas de uma API; CSP controla o que a sua página pode carregar e executar.',
      },
    ],
    correctOptionIds: ['second-layer'],
    hints: ['A CSP age antes ou depois de o dado chegar à página?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Primeira barreira: tratar dados como texto. Segunda: CSP testada.',
      },
    ],
  },
];
