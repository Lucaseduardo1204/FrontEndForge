import { Lesson } from '../../app/core/models/content.models';

export const STORY_TEXT = `História: como administradora, quero cadastrar um cliente
para que a equipe de vendas possa contatá-lo.

Critérios de aceitação:
- Dado que estou logada como administradora,
  quando preencho nome e e-mail válidos e salvo,
  então o cliente aparece na lista e vejo "Cliente cadastrado".
- Dado um e-mail que já existe,
  quando salvo,
  então o campo de e-mail mostra "Este e-mail já tem uma conta" e nada é criado.
- Dado que estou logada como leitora,
  quando tento cadastrar pela API,
  então recebo 403.`;

export const SLICES_TEXT = `Fatia 1: login → sessão → lista de clientes (só leitura)
Fatia 2: cadastrar e editar cliente (formulário, validação, 409)
Fatia 3: excluir com confirmação; papéis e 403 provados pela API
Fatia 4: busca, filtro e paginação; dashboard
Fatia 5: testes ponta a ponta, acessibilidade, publicação`;

export const CAPSTONE_PLAN_01: Lesson = {
  id: 'capstone-plan-01',
  moduleId: 'capstone-project-plan',
  title: 'Planejando o projeto final: escopo, fronteira de confiança e entregas',
  summary:
    'Antes de escrever código: decidir o que entra, quem pode fazer o quê (e quem confere), em que ordem construir e quando cada parte está pronta.',
  estimatedMinutes: 35,
  difficulty: 'advanced',
  conceptIds: ['capstone-planning', 'security-sessions'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Projetos grandes raramente falham por falta de habilidade técnica. Falham porque tentam tudo de uma vez, descobrem tarde que a parte mais difícil (login, permissões, o backend) não funciona, ou terminam com várias telas pela metade e nenhuma completa.',
        },
        {
          type: 'paragraph',
          text: 'Esta lição prepara o projeto final da trilha: um painel administrativo com login, cadastro, tabela, permissões, testes e publicação.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Separar o essencial do desejável.',
            'Escrever histórias com critérios de aceitação verificáveis.',
            'Desenhar a matriz de permissões e decidir quem confere.',
            'Planejar em fatias verticais, com o mais arriscado primeiro.',
            'Definir quando uma parte está pronta.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'Construir uma casa de cômodo em cômodo',
      blocks: [
        {
          type: 'paragraph',
          text: 'Dá para construir uma casa levantando todas as paredes, depois todo o telhado, depois toda a elétrica, e só no fim descobrir que nada funciona junto. Ou dá para terminar um cômodo por vez, com parede, telhado, luz e porta, e já usá-lo enquanto o próximo é feito.',
        },
        {
          type: 'paragraph',
          text: 'A segunda forma é a fatia vertical: cada entrega atravessa todas as camadas (tela, regras, API, banco) e funciona de verdade. E começa pelo cômodo mais difícil, porque é ele que pode mudar o projeto inteiro.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Escopo, histórias, permissões e pronto',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Escopo: liste tudo o que gostaria de ter e classifique em essencial, importante e desejável. Comece só com o essencial; o resto entra se sobrar tempo.',
            'Histórias de usuário dizem quem quer o quê e por quê. Os critérios de aceitação (Dado... quando... então...) tornam a história verificável: viram casos de teste.',
            'Matriz de permissões: papéis nas linhas, ações nas colunas. Ela vale para o servidor, que confere cada requisição; o frontend recebe as permissões da sessão e só decide o que mostrar.',
            'Modelo de ameaças em uma página: que dados existem, quem pode vê-los e alterá-los, e o que daria errado se alguém pulasse a tela (chamando a API direto, alterando o JavaScript, reenviando uma requisição).',
            'Fatias verticais: cada entrega funciona de ponta a ponta. Coloque o mais arriscado primeiro (login e sessão com o backend, normalmente).',
            'Definição de pronto: uma parte só está pronta quando funciona no fluxo real, tem testes nos pontos críticos, passa no lint e no build, funciona pelo teclado e em tela pequena, e está documentada.',
            'Registre decisões desde o início: stack do backend, onde a sessão fica, como a paginação é feita. Você vai precisar explicá-las numa entrevista.',
          ],
        },
        {
          type: 'table',
          caption: 'Matriz de permissões do exemplo (conferida pelo servidor)',
          headers: ['Papel', 'Ver clientes', 'Cadastrar e editar', 'Excluir', 'Ver dashboard'],
          rows: [
            ['Administração', 'Sim', 'Sim', 'Sim', 'Sim'],
            ['Vendas', 'Sim', 'Sim', 'Não', 'Sim'],
            ['Leitura', 'Sim', 'Não', 'Não', 'Não'],
          ],
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: uma história e o plano de fatias',
      blocks: [
        {
          type: 'paragraph',
          text: 'Uma história com critérios que já indicam os testes, inclusive o de segurança:',
        },
        { type: 'code', language: 'text', caption: 'historia-cadastro.md', code: STORY_TEXT },
        {
          type: 'paragraph',
          text: 'E o plano em fatias, do mais arriscado para o menos:',
        },
        { type: 'code', language: 'text', caption: 'plano.md', code: SLICES_TEXT },
        {
          type: 'callout',
          tone: 'info',
          title: 'Como esta plataforma foi construída',
          text: 'Esta própria plataforma seguiu esse método: a primeira fatia obrigatória foi central de comando → lição → exercício → avaliação → feedback → progresso salvo, de ponta a ponta, antes de qualquer outra área. Cada decisão foi registrada com o porquê e as alternativas, e nenhuma parte foi dada como pronta sem testes, lint, build e verificação no navegador.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Planeje o seu',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Escolha o domínio do seu painel e escreva cinco histórias, com critérios de aceitação.',
            'Monte a matriz de permissões com pelo menos dois papéis.',
            'Escreva o modelo de ameaças em uma página: dados, quem acessa, o que daria errado.',
            'Divida o projeto em quatro a seis fatias verticais e marque a mais arriscada.',
            'Escreva a sua definição de pronto e cole no README do projeto.',
          ],
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Prática',
      blocks: [{ type: 'paragraph', text: 'Responda pensando no painel administrativo.' }],
      exerciseIds: ['plan-01-story', 'plan-01-permissions'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: o projeto com dez telas pela metade',
      blocks: [
        {
          type: 'paragraph',
          text: 'Na semana final, o projeto tem todas as telas desenhadas, nenhum login funcionando e o backend com metade dos endpoints. Nada pode ser demonstrado.',
        },
      ],
      exerciseIds: ['plan-01-slices'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Times trabalham assim: histórias com critérios, fatias pequenas, definição de pronto combinada.',
            'Numa entrevista, o projeto que você explica bem (por que essa stack, como as permissões funcionam, o que faria diferente) vale mais do que um com mais telas.',
            'O projeto guiado desta fase traz as oito etapas, o checklist e a rubrica para acompanhar o seu.',
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
      exerciseIds: ['plan-01-order', 'plan-01-threat', 'plan-01-done'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Essencial primeiro; o resto, se sobrar tempo.',
            'Histórias com critérios verificáveis viram testes.',
            'Matriz de permissões conferida pelo servidor; a tela só mostra.',
            'Fatias verticais, o mais arriscado primeiro.',
            'Pronto é testado, acessível, documentado e funcionando no fluxo real.',
          ],
        },
      ],
    },
  ],
};
