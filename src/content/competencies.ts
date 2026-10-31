import { Competency } from '../app/core/models/content.models';

export const COMPETENCIES: readonly Competency[] = [
  {
    id: 'web-fundamentals',
    title: 'Fundamentos da web',
    description:
      'Entender o caminho de uma página do servidor até a tela: HTTP, DOM, CSSOM, renderização e carregamento de scripts.',
  },
  {
    id: 'html-semantics',
    title: 'HTML semântico',
    description:
      'Estruturar documentos com o elemento certo para cada conteúdo, formulários e metadados.',
  },
  {
    id: 'css-responsive',
    title: 'CSS responsivo',
    description: 'Cascata, layout com flexbox e grid, responsividade e organização de estilos.',
  },
  {
    id: 'javascript',
    title: 'JavaScript',
    description: 'Fundamentos da linguagem, DOM, eventos, assincronismo e depuração.',
  },
  {
    id: 'typescript',
    title: 'TypeScript',
    description:
      'Modelar dados com tipos, narrowing, generics e a fronteira entre compilação e runtime.',
  },
  {
    id: 'componentization',
    title: 'Componentização',
    description:
      'Dividir interfaces em componentes coesos, com entradas, saídas e responsabilidades claras.',
  },
  {
    id: 'angular',
    title: 'Angular',
    description:
      'Componentes standalone, signals, injeção de dependências, roteamento e formulários.',
  },
  {
    id: 'api-consumption',
    title: 'Consumo de APIs',
    description: 'HTTP, REST, estados de carregamento e erro, cancelamento e tipagem de respostas.',
  },
  {
    id: 'testing',
    title: 'Testes',
    description: 'Testes unitários, de componentes, de integração e end-to-end com estratégia.',
  },
  {
    id: 'accessibility',
    title: 'Acessibilidade',
    description: 'Semântica, teclado, leitores de tela, contraste e formulários acessíveis (WCAG).',
  },
  {
    id: 'security',
    title: 'Segurança',
    description: 'XSS, CSRF, CORS, CSP, sessões e por que o frontend não é fronteira de confiança.',
  },
  {
    id: 'performance',
    title: 'Performance',
    description: 'Core Web Vitals, carregamento, renderização, change detection e profiling.',
  },
  {
    id: 'frontend-architecture',
    title: 'Arquitetura frontend',
    description:
      'Organização por funcionalidade, coesão, acoplamento e decisões arquiteturais justificadas.',
  },
  {
    id: 'professional-tooling',
    title: 'Ferramentas e fluxo profissional',
    description: 'Git, code review, lint, build, CI/CD, deploy e trabalho em equipe.',
  },
];
