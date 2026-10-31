import { Exercise } from '../../app/core/models/content.models';

export const CAPSTONE_PLAN_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'plan-01-story',
    kind: 'multiple-choice',
    title: 'Um critério de aceitação verificável',
    difficulty: 'advanced',
    conceptIds: ['capstone-planning'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Qual destes critérios de aceitação para "cadastrar cliente" pode virar um teste?',
      },
    ],
    options: [
      {
        id: 'given-when-then',
        text: 'Dado um e-mail que já existe, quando salvo, então o campo de e-mail mostra "Este e-mail já tem uma conta" e nada é criado.',
        explanation:
          'Correto. Tem uma situação, uma ação e um resultado observável. Vira um teste de componente (com o 409 simulado) e um caso do servidor.',
      },
      {
        id: 'vague',
        text: 'O cadastro deve ser fácil de usar.',
        explanation:
          'Incorreto. Não diz como verificar; duas pessoas avaliariam de formas diferentes.',
      },
      {
        id: 'implementation',
        text: 'Usar Signal Forms no formulário.',
        explanation:
          'Incorreto. É uma decisão de implementação, não um comportamento esperado por quem usa.',
      },
      {
        id: 'fast',
        text: 'O cadastro deve ser rápido.',
        explanation:
          'Incompleto. "Rápido" precisa de um número e de uma condição para ser verificável.',
      },
    ],
    correctOptionIds: ['given-when-then'],
    hints: ['Qual deles diz exatamente o que observar e em que situação?'],
    solution: [
      { type: 'paragraph', text: 'Dado (situação), quando (ação), então (resultado observável).' },
    ],
  },
  {
    id: 'plan-01-permissions',
    kind: 'multiple-choice',
    title: 'De onde vêm as permissões da tela?',
    difficulty: 'advanced',
    conceptIds: ['capstone-planning', 'security-sessions'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O painel precisa esconder o botão "Excluir" para o papel de vendas. Qual desenho está correto?',
      },
    ],
    options: [
      {
        id: 'server-session',
        text: 'O servidor envia, com a sessão, as permissões da pessoa; o frontend esconde o botão com base nelas; e o endpoint de exclusão confere a permissão de novo e responde 403.',
        explanation:
          'Correto. Uma única fonte de verdade (o servidor), usada pela tela para a experiência e pelo próprio servidor para a segurança.',
      },
      {
        id: 'frontend-table',
        text: 'Uma tabela de permissões fixa no código do frontend, por papel.',
        explanation:
          'Incorreto. Duplica a regra (que vai divergir do servidor) e qualquer pessoa pode alterá-la no navegador.',
      },
      {
        id: 'hide-only',
        text: 'Esconder o botão basta, se o endpoint não estiver documentado.',
        explanation: 'Incorreto. Endpoints aparecem na aba Rede; esconder não é proteger.',
      },
      {
        id: 'role-in-localstorage',
        text: 'Guardar o papel no localStorage depois do login e conferir no guard.',
        explanation:
          'Incorreto. Qualquer pessoa edita o localStorage e vira "administração" na tela; e o servidor continua sem conferir.',
      },
    ],
    correctOptionIds: ['server-session'],
    hints: ['Quem é a fonte de verdade das permissões?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Servidor decide e confere; frontend só mostra o que a sessão permite.',
      },
    ],
  },
  {
    id: 'plan-01-slices',
    kind: 'multiple-choice',
    title: 'Dez telas pela metade',
    difficulty: 'advanced',
    conceptIds: ['capstone-planning'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O projeto da etapa de depuração tem todas as telas desenhadas e nada funcionando de ponta a ponta. O que o planejamento deveria ter feito diferente?',
      },
    ],
    options: [
      {
        id: 'vertical',
        text: 'Construir em fatias verticais, começando pela mais arriscada (login e sessão com o backend): a cada fatia, algo funcionando de verdade, do clique ao banco.',
        explanation:
          'Correto. Uma fatia completa revela cedo os problemas de integração, e sempre existe algo demonstrável. Telas sem backend escondem a parte difícil até o fim.',
      },
      {
        id: 'more-screens',
        text: 'Desenhar as telas ainda mais cedo.',
        explanation:
          'Incorreto. O problema não são as telas; é nenhuma delas funcionar de ponta a ponta.',
      },
      {
        id: 'backend-first',
        text: 'Fazer todo o backend primeiro e só depois todas as telas.',
        explanation:
          'Também horizontal: os problemas de integração aparecem só no fim, do mesmo jeito.',
      },
      {
        id: 'skip-auth',
        text: 'Deixar o login para o fim, porque é a parte mais chata.',
        explanation:
          'Incorreto. É a parte mais arriscada e a que afeta todas as outras (sessão, permissões, 401).',
      },
    ],
    correctOptionIds: ['vertical'],
    hints: ['Qual abordagem deixa algo funcionando de verdade a cada entrega?'],
    solution: [{ type: 'paragraph', text: 'Fatias verticais, mais arriscada primeiro.' }],
  },
  {
    id: 'plan-01-order',
    kind: 'order-steps',
    title: 'A ordem das fatias',
    difficulty: 'advanced',
    conceptIds: ['capstone-planning'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Ordene as fatias do painel administrativo, da primeira à última, seguindo "o mais arriscado primeiro".',
      },
    ],
    items: [
      {
        id: 'auth-list',
        text: 'Login, sessão e a lista de clientes (só leitura)',
        why: 'Prova a integração mais arriscada (backend, cookie, 401) com uma tela útil.',
      },
      {
        id: 'create',
        text: 'Cadastrar e editar (formulário, validação, 409)',
        why: 'Depende da sessão e da lista para mostrar o resultado.',
      },
      {
        id: 'roles',
        text: 'Excluir com confirmação; papéis e 403 provados pela API',
        why: 'Precisa das ações existirem para restringi-las.',
      },
      {
        id: 'table',
        text: 'Busca, filtro, paginação e dashboard',
        why: 'Melhora telas que já funcionam.',
      },
      {
        id: 'ship',
        text: 'Testes ponta a ponta, acessibilidade e publicação',
        why: 'Fecha a qualidade e a entrega sobre fluxos completos (testes e acessibilidade também acompanham cada fatia).',
      },
    ],
    explanation:
      'Cada fatia funciona de ponta a ponta e se apoia na anterior. O risco técnico maior (integração com o backend e sessão) vem primeiro.',
    hints: ['Qual fatia pode mudar o projeto inteiro se der errado?'],
    solution: [
      {
        type: 'list',
        ordered: true,
        items: [
          'Login e lista',
          'Cadastro e edição',
          'Exclusão e papéis',
          'Tabela e dashboard',
          'Testes e publicação',
        ],
      },
    ],
  },
  {
    id: 'plan-01-threat',
    kind: 'multiple-choice',
    title: 'O modelo de ameaças',
    difficulty: 'advanced',
    conceptIds: ['capstone-planning'],
    prompt: [
      {
        type: 'paragraph',
        text: 'No modelo de ameaças do painel, qual pergunta revela o risco mais importante?',
      },
    ],
    options: [
      {
        id: 'skip-ui',
        text: '"O que acontece se alguém chamar cada endpoint diretamente, sem passar pela tela, com uma sessão de leitura?"',
        explanation:
          'Correto. É o cenário que separa uma aplicação segura de uma que só parece segura: tudo o que a tela restringe precisa ser conferido também pelo servidor.',
      },
      {
        id: 'colors',
        text: '"As cores dos botões de exclusão são chamativas o bastante?"',
        explanation: 'É uma questão de usabilidade, não de ameaça.',
      },
      {
        id: 'framework',
        text: '"O Angular é seguro?"',
        explanation:
          'Ampla demais: o Angular protege contra parte dos problemas (como XSS na interpolação), mas não decide permissões.',
      },
      {
        id: 'password-length',
        text: '"Qual é o tamanho máximo do nome do cliente?"',
        explanation:
          'É validação de dados, importante, mas não o risco principal de um painel com papéis.',
      },
    ],
    correctOptionIds: ['skip-ui'],
    hints: ['A tela é o único caminho até os dados?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Para cada ação: quem pode? E o servidor confere, mesmo sem a tela?',
      },
    ],
  },
  {
    id: 'plan-01-done',
    kind: 'multiple-choice',
    title: 'Quando uma fatia está pronta?',
    difficulty: 'advanced',
    conceptIds: ['capstone-planning'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Qual definição de pronto é a mais adequada para cada fatia do projeto?',
      },
    ],
    options: [
      {
        id: 'full',
        text: 'Funciona no fluxo real contra o backend; tem testes nos pontos críticos; passa no lint e no build; funciona pelo teclado e a 320 px; está no README.',
        explanation:
          'Correto. É verificável item por item e cobre o que costuma ficar para depois (e nunca é feito). É a mesma definição usada nesta plataforma.',
      },
      {
        id: 'works-on-my-machine',
        text: 'Funciona no meu computador.',
        explanation:
          'Incorreto. Não diz nada sobre testes, acessibilidade ou se outra pessoa consegue rodar.',
      },
      {
        id: 'looks-done',
        text: 'A tela está igual ao desenho.',
        explanation:
          'Incorreto. Aparência não garante comportamento, segurança nem acessibilidade.',
      },
      {
        id: 'merged',
        text: 'O código foi enviado para a main.',
        explanation: 'Incorreto. Enviar não é o mesmo que estar verificado.',
      },
    ],
    correctOptionIds: ['full'],
    hints: ['Qual delas dá para conferir item por item?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Pronto = funcionando, testado, acessível, verificado e documentado.',
      },
    ],
  },
];
