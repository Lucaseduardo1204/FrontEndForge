import { Exercise } from '../../app/core/models/content.models';

export const TOOLING_CI_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-js-public-config',
    kind: 'code',
    language: 'javascript',
    title: 'O portão da configuração pública',
    difficulty: 'intermediate',
    conceptIds: ['tooling-ci', 'tooling-deploy'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Escreva validarConfig(config), que roda no pipeline antes do build e devolve a lista de problemas da configuração que vai para o frontend (lista vazia se estiver tudo certo).',
      },
    ],
    requirements: [
      'Sem apiUrl (ausente ou vazia): o problema "apiUrl é obrigatória".',
      'apiUrl que não começa com "https://": o problema "apiUrl precisa de https", exceto quando começa com "http://localhost".',
      'Toda chave cujo nome contém SECRET, TOKEN, PASSWORD ou PRIVATE (sem diferenciar maiúsculas e minúsculas): o problema "<nome> não pode ir para o frontend".',
      'Os problemas de segredo aparecem na ordem das chaves do objeto, depois dos problemas de apiUrl.',
    ],
    examples: [
      { input: "validarConfig({ apiUrl: 'https://api.loja.com' })", output: '[]' },
      {
        input: "validarConfig({ apiUrl: 'http://api.loja.com', stripeSecretKey: 'x' })",
        output: "['apiUrl precisa de https', 'stripeSecretKey não pode ir para o frontend']",
      },
    ],
    starterCode: `function validarConfig(config) {
  const problemas = [];
  // Seu código aqui
  return problemas;
}

console.log(validarConfig({ apiUrl: 'http://api.loja.com', authToken: 'abc' }));
`,
    tests: [
      {
        id: 'valid',
        description: 'Configuração correta não tem problemas',
        source:
          "expect(validarConfig({ apiUrl: 'https://api.loja.com', nivelLog: 'erro' })).toEqual([]);",
      },
      {
        id: 'missing',
        description: 'apiUrl ausente ou vazia é obrigatória',
        source:
          "expect(validarConfig({})).toEqual(['apiUrl é obrigatória']); expect(validarConfig({ apiUrl: '' })).toEqual(['apiUrl é obrigatória']);",
      },
      {
        id: 'https',
        description: 'apiUrl sem https é recusada',
        source:
          "expect(validarConfig({ apiUrl: 'http://api.loja.com' })).toEqual(['apiUrl precisa de https']);",
      },
      {
        id: 'localhost',
        description: 'http://localhost é aceito para desenvolvimento',
        source: "expect(validarConfig({ apiUrl: 'http://localhost:8080' })).toEqual([]);",
      },
      {
        id: 'secrets',
        description:
          'Chaves com SECRET, TOKEN, PASSWORD ou PRIVATE são recusadas, sem diferenciar caixa',
        source:
          "expect(validarConfig({ apiUrl: 'https://a.com', stripeSecretKey: 'x', authToken: 'y', DB_PASSWORD: 'z', privateKey: 'w', publicKey: 'ok' })).toEqual(['stripeSecretKey não pode ir para o frontend', 'authToken não pode ir para o frontend', 'DB_PASSWORD não pode ir para o frontend', 'privateKey não pode ir para o frontend']);",
      },
      {
        id: 'order',
        description: 'Problemas de apiUrl vêm antes dos de segredo',
        source:
          "expect(validarConfig({ apiToken: 'x' })).toEqual(['apiUrl é obrigatória', 'apiToken não pode ir para o frontend']);",
      },
    ],
    hints: [
      'Comece pela apiUrl: !config.apiUrl cobre ausente e vazia.',
      'Object.keys(config) devolve as chaves na ordem em que foram criadas.',
      'Para ignorar a caixa: chave.toUpperCase().includes("SECRET").',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `const PROIBIDAS = ['SECRET', 'TOKEN', 'PASSWORD', 'PRIVATE'];

function validarConfig(config) {
  const problemas = [];
  const url = config.apiUrl;

  if (!url) problemas.push('apiUrl é obrigatória');
  else if (!url.startsWith('https://') && !url.startsWith('http://localhost')) {
    problemas.push('apiUrl precisa de https');
  }

  for (const chave of Object.keys(config)) {
    const nome = chave.toUpperCase();
    if (PROIBIDAS.some((p) => nome.includes(p))) {
      problemas.push(\`\${chave} não pode ir para o frontend\`);
    }
  }
  return problemas;
}`,
      },
      {
        type: 'paragraph',
        text: 'Rodar isso no pipeline transforma "alguém colocou uma chave no frontend" numa falha de build, antes de qualquer publicação. É uma rede de segurança, não uma garantia: um segredo com nome inocente passaria. A regra de verdade continua sendo segredo só no servidor.',
      },
    ],
  },
  {
    id: 'ci-01-npm-ci',
    kind: 'multiple-choice',
    title: 'npm ci ou npm install?',
    difficulty: 'intermediate',
    conceptIds: ['tooling-ci'],
    prompt: [{ type: 'paragraph', text: 'Por que o pipeline usa npm ci em vez de npm install?' }],
    options: [
      {
        id: 'lockfile',
        text: 'npm ci instala exatamente o que está no package-lock.json e falha se ele não bate com o package.json; assim o servidor testa as mesmas versões que você.',
        explanation:
          'Correto. Medido: com uma dependência no package.json e fora do lockfile, npm ci terminou com código 1 e nada instalado. npm install teria resolvido e atualizado o lockfile, escondendo a diferença.',
      },
      {
        id: 'faster-only',
        text: 'Só porque é mais rápido.',
        explanation: 'Costuma ser mais rápido, mas o motivo principal é a reprodutibilidade.',
      },
      {
        id: 'latest',
        text: 'Porque instala as versões mais recentes de cada pacote.',
        explanation: 'Incorreto. É o oposto: ele instala exatamente as versões travadas.',
      },
      {
        id: 'no-diff',
        text: 'Não há diferença; é só costume.',
        explanation: 'Incorreto. O comportamento com o lockfile é diferente.',
      },
    ],
    correctOptionIds: ['lockfile'],
    hints: ['O que acontece com o lockfile em cada comando?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Pipeline: npm ci. Ao adicionar dependências na sua máquina: npm install, e commit do lockfile atualizado.',
      },
    ],
  },
  {
    id: 'ci-01-spa-404',
    kind: 'multiple-choice',
    title: 'O 404 depois do deploy',
    difficulty: 'intermediate',
    conceptIds: ['tooling-deploy'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Na etapa de depuração, por que o link direto dá 404, e como corrigir?',
      },
    ],
    options: [
      {
        id: 'rewrite',
        text: 'O servidor procura um arquivo /lessons/js-closures-01, que não existe. Configure uma reescrita: caminhos que não são arquivos respondem o index.html, e o Angular abre a rota.',
        explanation:
          'Correto. Navegando pelos links, o Angular troca a rota sem pedir nada ao servidor; no link direto e no F5, quem recebe o pedido é o servidor.',
      },
      {
        id: 'hash',
        text: 'O build esqueceu de gerar a página da lição; rode o build de novo.',
        explanation: 'Incorreto. Uma SPA tem um único index.html; as lições são rotas do Angular.',
      },
      {
        id: 'router-bug',
        text: 'É um erro no Router; troque para rotas com # (withHashLocation).',
        explanation:
          'Funciona, porque o servidor ignora o que vem depois do #, mas troca URLs limpas por um contorno. A correção é configurar o servidor.',
      },
      {
        id: 'cache',
        text: 'É cache: peça para as pessoas limparem o navegador.',
        explanation: 'Incorreto. O 404 vem do servidor, em qualquer navegador.',
      },
    ],
    correctOptionIds: ['rewrite'],
    hints: ['Quem responde ao pedido quando a pessoa aperta F5?'],
    solution: [
      {
        type: 'code',
        language: 'text',
        code: `# Nginx\nlocation / {\n  try_files $uri $uri/ /index.html;\n}`,
      },
    ],
  },
  {
    id: 'ci-01-secret',
    kind: 'multiple-choice',
    title: 'A chave no environment.ts',
    difficulty: 'intermediate',
    conceptIds: ['tooling-deploy'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Para chamar uma API paga, alguém coloca a chave privada num arquivo de configuração do Angular usado só no build de produção, "que não vai para o GitHub". Está seguro?',
      },
    ],
    options: [
      {
        id: 'public',
        text: 'Não: o valor vai para o JavaScript publicado, que qualquer pessoa baixa e lê. A chamada precisa passar por um backend que guarda a chave.',
        explanation:
          'Correto. Tirar do repositório não esconde do bundle. No build desta plataforma, os textos do conteúdo aparecem legíveis nos arquivos .js; com uma chave seria igual.',
      },
      {
        id: 'minified',
        text: 'Sim: o build de produção minifica e embaralha o código.',
        explanation:
          'Incorreto. Minificar encurta nomes de variáveis, mas strings continuam intactas.',
      },
      {
        id: 'gitignore',
        text: 'Sim, desde que o arquivo esteja no .gitignore.',
        explanation: 'Protege o repositório, não o site publicado.',
      },
      {
        id: 'https',
        text: 'Sim, porque o site usa HTTPS.',
        explanation: 'HTTPS protege o transporte, não o conteúdo que o navegador recebe e executa.',
      },
    ],
    correctOptionIds: ['public'],
    hints: ['Quem consegue ler o JavaScript que o navegador baixa?'],
    solution: [{ type: 'paragraph', text: 'Frontend → seu backend (com a chave) → API paga.' }],
  },
  {
    id: 'ci-01-order',
    kind: 'multiple-choice',
    title: 'A ordem das etapas',
    difficulty: 'intermediate',
    conceptIds: ['tooling-ci'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Qual ordem de etapas faz mais sentido num pipeline de pull request?',
      },
    ],
    options: [
      {
        id: 'cheap-first',
        text: 'npm ci → lint → testes → build.',
        explanation:
          'Correto. Instalação primeiro (as outras dependem dela); depois as etapas rápidas, que dão retorno em segundos; o build, mais lento, por último.',
      },
      {
        id: 'build-first',
        text: 'build → testes → lint → npm ci.',
        explanation:
          'Incorreto. Sem instalar, nada roda; e o lint, mais barato, esperaria o build.',
      },
      {
        id: 'deploy',
        text: 'npm ci → build → deploy em produção → testes.',
        explanation: 'Incorreto. Testar depois de publicar é deixar quem usa encontrar os erros.',
      },
      {
        id: 'only-build',
        text: 'Só npm ci e build: se compilou, está certo.',
        explanation:
          'Incorreto. Compilar não prova comportamento; testes e lint pegam outros erros.',
      },
    ],
    correctOptionIds: ['cheap-first'],
    hints: ['O que tem que vir antes de tudo, e o que dá retorno mais rápido?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Instalação, etapas baratas, etapas caras; deploy só depois de tudo verde.',
      },
    ],
  },
  {
    id: 'ci-01-budget',
    kind: 'multiple-choice',
    title: 'O orçamento estourou',
    difficulty: 'intermediate',
    conceptIds: ['tooling-ci'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Depois de adicionar uma biblioteca de gráficos, o build de produção falha porque o bundle inicial passou de 1MB (o maximumError). Qual é a melhor reação?',
      },
    ],
    options: [
      {
        id: 'lazy',
        text: 'Investigar o que cresceu e carregar a biblioteca só onde ela é usada (rota lazy ou @defer), em vez de no bundle inicial.',
        explanation:
          'Correto. O orçamento cumpriu o papel: avisou antes de quem usa sentir. A lição de carregamento da fase 11 mostra como medir e dividir.',
      },
      {
        id: 'raise',
        text: 'Aumentar o maximumError para 5MB.',
        explanation:
          'Desliga o alarme sem resolver o problema; às vezes é aceitável, mas só como decisão consciente e registrada.',
      },
      {
        id: 'remove-budget',
        text: 'Remover os orçamentos do angular.json.',
        explanation: 'Incorreto. Perde-se o portão para todos os crescimentos futuros.',
      },
      {
        id: 'dev-build',
        text: 'Publicar o build de desenvolvimento, que não tem orçamento.',
        explanation:
          'Incorreto. O build de desenvolvimento não é otimizado: o resultado seria muito maior.',
      },
    ],
    correctOptionIds: ['lazy'],
    hints: ['A biblioteca precisa estar no primeiro carregamento?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Meça, divida, carregue sob demanda; mude o orçamento só com uma decisão registrada.',
      },
    ],
  },
];
