import { Project } from '../../app/core/models/content.models';

/**
 * Capstone of phase 13. The table logic is verified for real by the platform (auto check,
 * executed against the reference solution in `project-solutions.spec.ts`); the Angular app,
 * the demo backend and the deploy are built locally and assessed with checklist and rubric.
 */
export const PROJECT_CAPSTONE_ADMIN: Project = {
  id: 'project-capstone-admin',
  phaseId: 'phase-13-capstone',
  title: 'Painel administrativo de gestão',
  briefing: [
    {
      type: 'paragraph',
      text: 'O projeto final junta tudo: um painel administrativo em Angular, com login, dashboard, cadastro com tabela (busca, filtro e paginação), formulários validados, permissões vindas do servidor, testes, acessibilidade e publicação com integração contínua. É o tipo de aplicação que equipes constroem todos os dias, e um bom projeto de portfólio.',
    },
    {
      type: 'paragraph',
      text: 'Escolha um domínio que você entenda: clientes de uma pequena loja, inscrições de um evento, chamados de suporte, empréstimos de uma biblioteca. O exemplo das etapas usa "clientes", mas as regras valem para qualquer um.',
    },
    {
      type: 'paragraph',
      text: 'A plataforma verifica de verdade a lógica da tabela administrativa (busca, filtro e paginação), rodando testes no código que você colar. A aplicação Angular, o backend de demonstração e a publicação ficam no seu computador e são avaliados com o checklist e a rubrica: o laboratório desta plataforma não executa Angular nem servidores.',
    },
  ],
  problem:
    'Painéis administrativos concentram os erros mais caros: permissões checadas só na tela, tabelas que travam com muitos registros, formulários que deixam passar dados inválidos e erros que somem sem aviso. O objetivo é construir um que um time poderia manter e confiar.',
  requiredFeatures: [
    'Login contra um backend de demonstração que você controla; sessão em cookie HttpOnly.',
    'Dashboard com indicadores calculados pelo backend.',
    'Cadastro completo (listar, criar, editar, excluir) de uma entidade do seu domínio.',
    'Tabela com busca, filtro por status e paginação, com estados de carregamento, vazio e erro.',
    'Formulários com validação, mensagens acessíveis e erros do servidor no campo certo.',
    'Pelo menos dois papéis (por exemplo, administrador e leitura), com permissões vindas do servidor e aplicadas por ele.',
    'Testes: unitários das regras, de componentes principais com HTTP simulado e um ponta a ponta do fluxo crítico.',
    'README com como rodar, decisões de arquitetura e limitações; publicação com integração contínua.',
  ],
  optionalFeatures: [
    'Ordenação por coluna.',
    'Exportação da tabela em CSV.',
    'Tema escuro e claro com preferência salva.',
    'Integração com um backend em Spring Boot (prepara para a trilha full stack).',
  ],
  suggestedArchitecture: [
    {
      type: 'list',
      ordered: false,
      items: [
        'features/auth (login, sessão, guard de navegação), features/dashboard, features/clientes (lista, formulário), core (interceptors, ErrorHandler, configuração), shared (componentes de tabela, paginação, mensagens).',
        'Services por assunto: SessaoService (usuário atual e permissões recebidas do servidor), ClientesService (HttpClient para escrever), leitura com httpResource.',
        'Lógica pura e testável fora dos componentes: a consulta da tabela (verificada pela plataforma), a formatação de valores, as regras de exibição por permissão.',
        'Backend de demonstração (Spring Boot, Node ou outro que você conheça), tratado como fronteira de confiança: valida todos os dados e confere a permissão de cada requisição.',
        'Um registro de decisões (por quê, alternativas descartadas) desde o primeiro dia.',
      ],
    },
  ],
  constraints: [
    'Angular na versão estável atual, com componentes standalone, signals e controle de fluxo nativo.',
    'Nenhum segredo no frontend; configurações públicas só por ambiente.',
    'Toda permissão conferida no backend, a cada requisição; a interface só esconde o que a pessoa não pode usar.',
    'Sem dados reais de pessoas: use dados fictícios gerados para o projeto.',
  ],
  accessibilityRequirements: [
    'Tudo operável pelo teclado, com foco visível e link para pular ao conteúdo.',
    'Tabela com <table>, <caption> e cabeçalhos <th scope>; paginação com botões nomeados e a página atual indicada (aria-current).',
    'Mensagens de carregamento e confirmação em role="status"; erros de formulário ligados aos campos (aria-invalid, aria-describedby).',
    'Confirmação de exclusão com <dialog> e foco inicial na opção segura.',
    'Contraste AA nos dois temas e sem rolagem lateral a 320 px.',
  ],
  securityRequirements: [
    'Sessão em cookie HttpOnly, Secure, SameSite; nada de token no localStorage.',
    'Proteção contra CSRF nas requisições que alteram dados (HttpClient com URLs relativas e o servidor conferindo o token).',
    'Guards orientam a navegação; o backend recusa (403) o que a sessão não pode fazer. Teste chamando a API diretamente, sem a tela.',
    'Nada de bypassSecurityTrust nem innerHTML com dados do servidor.',
    'Mensagens de erro úteis para a pessoa, detalhes só nos logs do servidor, sem dados sensíveis.',
    'npm audit sem vulnerabilidades altas nas dependências de produção.',
  ],
  testCases: [
    'Entrar com o papel de leitura e tentar excluir um cliente chamando a API diretamente (curl ou a aba Rede): o servidor responde 403.',
    'Buscar "ANA" encontra "Ana Souza" e "ana@exemplo.com"; a busca ignora espaços nas pontas.',
    'Com 23 registros e 10 por página, a terceira página mostra 3 itens; pedir a página 9 mostra a última.',
    'Cadastrar um cliente com e-mail já existente: o erro do servidor aparece no campo de e-mail.',
    'Desligar o backend com a tabela aberta e clicar em "Tentar de novo": a mensagem de erro aparece e nada quebra.',
    'Fazer todo o fluxo de cadastro, edição e exclusão só pelo teclado.',
    'Abrir o painel a 320 px de largura e com zoom de 200%: nada vaza para o lado.',
  ],
  steps: [
    {
      id: 'plan',
      title: 'Planeje o escopo e as decisões',
      guidance: [
        {
          type: 'paragraph',
          text: 'Escreva as histórias principais (como administrador, quero...; como leitor, quero...), separe o essencial do opcional e desenhe a matriz de permissões: quais papéis fazem quais ações. Decida a stack do backend de demonstração e registre o porquê.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Comece pela lição da fase',
          text: 'A lição "Planejando o projeto final" desta fase mostra como fatiar o escopo e onde fica a fronteira de confiança.',
        },
      ],
      checklist: [
        { id: 'plan-stories', text: 'Escrevi as histórias e separei essencial de opcional.' },
        { id: 'plan-permissions', text: 'Tenho uma matriz de papéis e ações.' },
        {
          id: 'plan-decisions',
          text: 'Registrei as primeiras decisões (stack, estrutura) com o porquê.',
        },
      ],
    },
    {
      id: 'backend',
      title: 'Monte o backend de demonstração como fronteira de confiança',
      guidance: [
        {
          type: 'paragraph',
          text: 'Endpoints mínimos: login (que define o cookie de sessão), sessão atual com permissões, CRUD da entidade e os indicadores do dashboard. Cada endpoint de escrita valida os dados e confere a permissão da sessão. Dados fictícios bastam.',
        },
      ],
      checklist: [
        { id: 'backend-login', text: 'O login define um cookie HttpOnly, Secure e SameSite.' },
        {
          id: 'backend-authz',
          text: 'Cada endpoint de escrita confere a permissão e responde 403 quando falta.',
        },
        {
          id: 'backend-validation',
          text: 'O servidor valida os dados e responde 400 ou 409 com mensagens claras.',
        },
      ],
    },
    {
      id: 'auth',
      title: 'Login, sessão e navegação protegida',
      guidance: [
        {
          type: 'paragraph',
          text: 'Formulário de login com Signal Forms, SessaoService com o usuário e as permissões vindas do servidor, guard que redireciona para o login e um interceptor que trata 401 (sessão expirada) levando de volta ao login.',
        },
      ],
      checklist: [
        { id: 'auth-form', text: 'O login tem validação e mensagens acessíveis.' },
        { id: 'auth-guard', text: 'Rotas internas redirecionam para o login sem sessão.' },
        { id: 'auth-401', text: 'Uma resposta 401 em qualquer chamada leva de volta ao login.' },
      ],
    },
    {
      id: 'table',
      title: 'Tabela com busca, filtro e paginação, e verifique a lógica',
      guidance: [
        {
          type: 'paragraph',
          text: 'Escreva a consulta da tabela como função pura e cole-a na verificação automática. Com poucos registros, ela roda no navegador; com muitos, o mesmo contrato (busca, status, página, por página) vira parâmetros da API, e quem filtra e pagina é o servidor.',
        },
        {
          type: 'paragraph',
          text: 'Na tela: httpResource para ler, com estados de carregamento, vazio ("Nenhum cliente encontrado") e erro com "Tentar de novo"; a busca com debounce; a paginação com botões nomeados.',
        },
      ],
      checklist: [
        { id: 'table-check', text: 'A verificação automática da consulta passou.' },
        { id: 'table-states', text: 'A tabela mostra carregamento, vazio e erro.' },
        { id: 'table-a11y', text: 'A tabela tem caption e cabeçalhos; a página atual é indicada.' },
      ],
    },
    {
      id: 'forms',
      title: 'Criar, editar e excluir',
      guidance: [
        {
          type: 'paragraph',
          text: 'Formulário de cliente com Signal Forms, validação no cliente e no servidor, erros do servidor levados ao campo certo (o 409 de e-mail duplicado, por exemplo) e confirmação de exclusão com <dialog>. Envio com HttpClient; depois de salvar, recarregue a lista.',
        },
      ],
      checklist: [
        {
          id: 'forms-validation',
          text: 'Os erros aparecem depois do toque e ficam ligados aos campos.',
        },
        { id: 'forms-server', text: 'Erros do servidor aparecem no campo certo.' },
        { id: 'forms-delete', text: 'A exclusão pede confirmação num diálogo acessível.' },
      ],
    },
    {
      id: 'permissions',
      title: 'Permissões na interface e no servidor',
      guidance: [
        {
          type: 'paragraph',
          text: 'A interface esconde botões e rotas conforme as permissões recebidas do servidor; o servidor recusa o que a sessão não pode fazer. Prove o segundo: com o papel de leitura, chame a exclusão direto na API.',
        },
        {
          type: 'callout',
          tone: 'security',
          title: 'Esconder não é proteger',
          text: 'Um botão escondido ainda tem uma requisição por trás. Se o servidor não confere a permissão, qualquer pessoa logada faz a ação pelo console ou por curl.',
        },
      ],
      checklist: [
        { id: 'perm-ui', text: 'A interface mostra só o que cada papel pode usar.' },
        {
          id: 'perm-server',
          text: 'Testei a API direto: o papel de leitura recebe 403 ao tentar escrever.',
        },
      ],
    },
    {
      id: 'quality',
      title: 'Testes, acessibilidade e performance',
      guidance: [
        {
          type: 'paragraph',
          text: 'Testes unitários das regras, testes de componente com HttpTestingController (lista, erro, formulário com 409) e um teste ponta a ponta do fluxo login → cadastrar → ver na lista. Navegue só pelo teclado, rode o axe e o Lighthouse, confira 320 px e o tamanho do bundle.',
        },
      ],
      checklist: [
        {
          id: 'quality-tests',
          text: 'Os testes cobrem regras, componentes com HTTP e um fluxo ponta a ponta.',
        },
        { id: 'quality-a11y', text: 'Teclado, axe e 320 px conferidos, sem problemas pendentes.' },
        { id: 'quality-perf', text: 'Rotas lazy e orçamento de bundle configurados.' },
      ],
    },
    {
      id: 'ship',
      title: 'Documente e publique',
      guidance: [
        {
          type: 'paragraph',
          text: 'README com o que é, como rodar (frontend e backend), decisões e limitações. Integração contínua com lint, testes e build a cada pull request. Publique o frontend numa hospedagem estática com fallback de SPA e os cabeçalhos de segurança recomendados, e o backend num serviço que você controle.',
        },
      ],
      checklist: [
        { id: 'ship-readme', text: 'O README explica como rodar, as decisões e as limitações.' },
        { id: 'ship-ci', text: 'A integração contínua roda lint, testes e build.' },
        { id: 'ship-deploy', text: 'A aplicação está publicada, com HTTPS.' },
      ],
    },
  ],
  autoCheck: {
    language: 'javascript',
    instructions: [
      {
        type: 'paragraph',
        text: 'Cole aqui a sua função consultarTabela (sem import/export). Os testes rodam num ambiente isolado e verificam o comportamento.',
      },
      {
        type: 'list',
        ordered: false,
        items: [
          'consultarTabela(registros, consulta) devolve { itens, total, pagina, totalPaginas }.',
          'Cada registro tem { id, nome, email, status }, com status "ativo" ou "inativo".',
          'consulta tem busca (texto, padrão ""), status ("todos", "ativo" ou "inativo"; padrão "todos"), pagina (padrão 1) e porPagina (padrão 10).',
          'A busca ignora maiúsculas e espaços nas pontas e procura no nome e no e-mail.',
          'total é a quantidade depois da busca e do filtro; totalPaginas é pelo menos 1.',
          'A página pedida é ajustada para ficar entre 1 e totalPaginas.',
          'Os registros recebidos não são alterados.',
        ],
      },
    ],
    starterCode: `function consultarTabela(registros, consulta = {}) {
  // Seu código aqui
}
`,
    tests: [
      {
        id: 'defaults',
        description: 'Sem consulta, devolve a primeira página de tudo',
        source:
          "const r = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, nome: 'Pessoa ' + (i + 1), email: 'p' + (i + 1) + '@exemplo.com', status: 'ativo' })); const res = consultarTabela(r); expect(res.total).toBe(12); expect(res.pagina).toBe(1); expect(res.totalPaginas).toBe(2); expect(res.itens.map((x) => x.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);",
      },
      {
        id: 'search',
        description:
          'Busca no nome e no e-mail, sem diferenciar maiúsculas e ignorando espaços nas pontas',
        source:
          "const r = [{ id: 1, nome: 'Ana Souza', email: 'ana@exemplo.com', status: 'ativo' }, { id: 2, nome: 'Bruno Lima', email: 'bruno@exemplo.com', status: 'ativo' }, { id: 3, nome: 'Carla Dias', email: 'mariana@exemplo.com', status: 'inativo' }]; expect(consultarTabela(r, { busca: '  ANA ' }).itens.map((x) => x.id)).toEqual([1, 3]);",
      },
      {
        id: 'status',
        description: 'Filtra por status',
        source:
          "const r = [{ id: 1, nome: 'A', email: 'a@x.com', status: 'ativo' }, { id: 2, nome: 'B', email: 'b@x.com', status: 'inativo' }, { id: 3, nome: 'C', email: 'c@x.com', status: 'ativo' }]; expect(consultarTabela(r, { status: 'inativo' }).itens.map((x) => x.id)).toEqual([2]); expect(consultarTabela(r, { status: 'todos' }).total).toBe(3);",
      },
      {
        id: 'pagination',
        description: 'Com 23 registros e 10 por página, a terceira página tem 3 itens',
        source:
          "const r = Array.from({ length: 23 }, (_, i) => ({ id: i + 1, nome: 'P' + i, email: 'p' + i + '@x.com', status: 'ativo' })); const res = consultarTabela(r, { pagina: 3, porPagina: 10 }); expect(res.itens.map((x) => x.id)).toEqual([21, 22, 23]); expect(res.totalPaginas).toBe(3);",
      },
      {
        id: 'clamp',
        description: 'Ajusta a página para o intervalo válido',
        source:
          "const r = Array.from({ length: 23 }, (_, i) => ({ id: i + 1, nome: 'P' + i, email: 'p' + i + '@x.com', status: 'ativo' })); expect(consultarTabela(r, { pagina: 9, porPagina: 10 }).pagina).toBe(3); expect(consultarTabela(r, { pagina: 0, porPagina: 10 }).pagina).toBe(1);",
      },
      {
        id: 'empty',
        description: 'Sem resultados: lista vazia, total 0 e uma página',
        source:
          "const r = [{ id: 1, nome: 'Ana', email: 'ana@x.com', status: 'ativo' }]; expect(consultarTabela(r, { busca: 'zzz' })).toEqual({ itens: [], total: 0, pagina: 1, totalPaginas: 1 });",
      },
      {
        id: 'immutable',
        description: 'Não altera os registros recebidos',
        source:
          "const r = [{ id: 2, nome: 'B', email: 'b@x.com', status: 'ativo' }, { id: 1, nome: 'A', email: 'a@x.com', status: 'ativo' }]; const copia = JSON.parse(JSON.stringify(r)); consultarTabela(r, { busca: 'a' }); expect(r).toEqual(copia);",
      },
    ],
  },
  completionCriteria: [
    'A verificação automática da consulta da tabela passou.',
    'Todos os itens do checklist das oito etapas estão marcados.',
    'A autoavaliação da rubrica está preenchida.',
  ],
  rubric: [
    {
      id: 'functionality',
      title: 'Funcionalidade',
      description: 'O painel faz o que promete, inclusive nos casos de erro.',
      levels: [
        { score: 1, description: 'O caminho feliz funciona em parte; erros quebram telas.' },
        {
          score: 2,
          description:
            'Todas as funcionalidades obrigatórias funcionam; alguns estados de erro e vazio faltam.',
        },
        {
          score: 3,
          description: 'Tudo funciona, com carregamento, vazio e erro tratados em todas as telas.',
        },
      ],
    },
    {
      id: 'security',
      title: 'Segurança e fronteira de confiança',
      description: 'O backend decide; o frontend não guarda segredos.',
      levels: [
        { score: 1, description: 'Permissões checadas só na interface, ou token no localStorage.' },
        { score: 2, description: 'O servidor confere permissões; faltam CSRF ou flags de cookie.' },
        {
          score: 3,
          description:
            'Sessão segura, CSRF tratado, 403 provado chamando a API direto, nenhum segredo no bundle.',
        },
      ],
    },
    {
      id: 'architecture',
      title: 'Arquitetura e código',
      description: 'Responsabilidades claras, sem abstrações sem uso.',
      levels: [
        { score: 1, description: 'Componentes grandes misturando HTTP, regras e apresentação.' },
        { score: 2, description: 'Services e componentes separados; regras ainda espalhadas.' },
        {
          score: 3,
          description:
            'Organização por funcionalidade, regras em funções puras testadas, decisões registradas.',
        },
      ],
    },
    {
      id: 'accessibility',
      title: 'Acessibilidade',
      description: 'Teclado, leitores de tela, contraste e telas estreitas.',
      levels: [
        { score: 1, description: 'Partes inacessíveis pelo teclado ou sem rótulos.' },
        {
          score: 2,
          description: 'Teclado e rótulos corretos; anúncios e foco em diálogos incompletos.',
        },
        {
          score: 3,
          description:
            'Tudo pelo teclado, anúncios e foco corretos, contraste AA, 320 px sem rolagem lateral.',
        },
      ],
    },
    {
      id: 'tests',
      title: 'Testes e entrega',
      description: 'Confiança para mudar e publicar.',
      levels: [
        { score: 1, description: 'Poucos testes, publicação manual.' },
        { score: 2, description: 'Testes de regras e componentes; integração contínua parcial.' },
        {
          score: 3,
          description:
            'Regras, componentes com HTTP e um ponta a ponta; integração contínua e publicação automatizadas; README completo.',
        },
      ],
    },
  ],
  nextSteps: [
    'Trocar o backend de demonstração por um em Spring Boot, mantendo o mesmo contrato.',
    'Mover a busca e a paginação para o servidor e medir a diferença com muitos registros.',
    'Pedir a alguém que use o painel só com um leitor de tela e anotar o que atrapalhou.',
    'Apresentar o projeto: o problema, as decisões e o que você faria diferente.',
  ],
  competencyIds: [
    'angular',
    'api-consumption',
    'security',
    'accessibility',
    'testing',
    'frontend-architecture',
    'professional-tooling',
  ],
};
