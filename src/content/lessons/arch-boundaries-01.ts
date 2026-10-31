import { Lesson } from '../../app/core/models/content.models';

/**
 * The repository and configuration snippets are this platform's real code (drift guard in
 * `src/content/arch-examples.spec.ts`, which also executes the error-handler and swap claims).
 */
export const REPOSITORY_TS = `/**
 * Persistence boundary for student progress. Features depend on this abstraction only,
 * so the local implementation could be replaced by the HTTP one (backend/) without changes.
 */
export abstract class ProgressRepository {
  /** Resolves to \`null\` when nothing was saved yet. Rejects with \`ProgressDataError\` on bad data. */
  abstract load(): Promise<Progress | null>;
  abstract save(progress: Progress): Promise<void>;
  abstract clear(): Promise<void>;
}`;

export const APP_CONFIG_TS = `// O único lugar que escolhe onde o progresso fica (core/persistence/progress-storage.providers.ts).
{
  provide: ProgressRepository,
  useFactory: () =>
    inject(StorageModeService).mode === 'server'
      ? new HttpProgressRepository()
      : new LocalStorageProgressRepository(),
},`;

export const TEST_SWAP_TS = `// Nos testes: um repositório em memória, sem localStorage e sem rede.
let salvo: Progress | null = null;
TestBed.configureTestingModule({
  providers: [
    {
      provide: ProgressRepository,
      useValue: {
        load: async () => salvo,
        save: async (p: Progress) => void (salvo = p),
        clear: async () => undefined,
      },
    },
  ],
});`;

export const ERROR_HANDLER_TS = `@Injectable()
export class RegistroGlobalDeErros implements ErrorHandler {
  private readonly avisos = inject(AvisosService);

  handleError(erro: unknown): void {
    // Último recurso: erros esperados (HTTP 404, validação) são tratados onde acontecem.
    console.error(erro); // ou uma ferramenta de monitoramento, sem dados sensíveis
    this.avisos.mostrar('Algo deu errado. Tente de novo; se continuar, recarregue a página.');
  }
}

// app.config.ts
{ provide: ErrorHandler, useClass: RegistroGlobalDeErros },`;

export const ARCH_BOUNDARIES_01: Lesson = {
  id: 'arch-boundaries-01',
  moduleId: 'arch-responsibilities',
  title: 'Arquitetura: responsabilidades, fronteiras e quando não abstrair',
  summary:
    'Decidir onde cada parte do código mora, criar fronteiras que permitem trocar peças sem reescrever tudo e reconhecer a abstração que só atrapalha, usando esta própria plataforma como estudo de caso.',
  estimatedMinutes: 45,
  difficulty: 'advanced',
  conceptIds: ['arch-boundaries', 'arch-yagni', 'angular-di'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Aplicações crescem. Sem decisões de arquitetura, o crescimento vira um emaranhado: regras de negócio espalhadas em templates, componentes que sabem de localStorage, HTTP e formatação ao mesmo tempo, e qualquer mudança quebra três telas. No extremo oposto, há projetos com camadas, facades e interfaces "para o futuro" que nunca chegou, em que adicionar um campo exige mexer em sete arquivos.',
        },
        {
          type: 'paragraph',
          text: 'Arquitetura boa é a que torna a próxima mudança provável barata, e nada além disso.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Separar apresentação, regras de negócio e acesso a dados.',
            'Organizar por funcionalidade.',
            'Criar fronteiras (abstrações) onde existe uma razão concreta para trocar a implementação.',
            'Tratar erros inesperados num lugar só.',
            'Registrar decisões e evitar abstrações desnecessárias.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'Tomadas e fios soldados',
      blocks: [
        {
          type: 'paragraph',
          text: 'Uma casa tem tomadas onde se espera trocar aparelhos: ninguém solda a geladeira na parede. Mas também ninguém põe uma tomada no meio do fio do chuveiro "caso um dia queiram trocar a resistência por outra coisa". Tomadas têm custo; fazem sentido onde a troca é real.',
        },
        {
          type: 'paragraph',
          text: 'Abstrações são tomadas. A pergunta não é "e se um dia...?", e sim "existe hoje, ou de forma concreta no plano, uma segunda implementação?".',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Responsabilidades, fronteiras e decisões',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Componentes de apresentação recebem dados (input) e emitem eventos (output). Contêineres (geralmente as páginas) injetam services e conectam as peças.',
            'Regras de negócio em funções puras ou services, não em templates: ficam testáveis sem tela e reutilizáveis.',
            'Acesso a dados (HTTP, armazenamento) atrás de um service ou repositório: os componentes não sabem de onde os dados vêm.',
            'Organização por funcionalidade (features/carrinho, features/catalogo) em vez de por tipo (components, services): o que muda junto fica junto, e cada área pode ser carregada sob demanda.',
            'Coesão alta (cada módulo tem um assunto) e acoplamento baixo (módulos dependem pouco uns dos outros, e de abstrações estáveis).',
            'SOLID no frontend, sem dogma: responsabilidade única (um componente não faz tudo), inversão de dependência (depender de ProgressRepository, não do localStorage), aberto para extensão (uma nova implementação sem mexer nas features).',
            'Facades, stores e camadas extras só quando resolvem um problema que existe: estado compartilhado complexo, várias fontes de dados, uma equipe grande precisando de contratos claros. Antes disso, são custo.',
            'Tratamento global de erros: um ErrorHandler próprio é o último recurso para erros inesperados (registrar e avisar com calma). Erros esperados, como um 404 ou uma validação, são tratados onde acontecem.',
            'Configuração por ambiente: valores públicos em environment ou num InjectionToken com um provider por ambiente; segredos, nunca (lição de segurança).',
            'Registre decisões: o que foi decidido, por quê e quais alternativas foram descartadas (Architecture Decision Records). Daqui a seis meses, alguém, talvez você, vai perguntar "por que é assim?".',
            'Monorepos (como um workspace do Angular ou o Nx) juntam várias aplicações e bibliotecas num repositório, com fronteiras explícitas entre elas. Fazem sentido quando há várias aplicações compartilhando código de verdade.',
            'Refatoração segura: testes antes, passos pequenos, comportamento igual. Mudar estrutura e comportamento ao mesmo tempo esconde onde o erro entrou.',
          ],
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Estudo de caso: esta plataforma',
      blocks: [
        {
          type: 'paragraph',
          text: 'O progresso de quem estuda precisa ser salvo. Começou no navegador, com um backend planejado; como a troca era concreta, nasceu uma fronteira: as funcionalidades dependem só deste contrato (código real da plataforma):',
        },
        {
          type: 'code',
          language: 'typescript',
          caption: 'core/persistence/progress-repository.ts',
          code: REPOSITORY_TS,
        },
        {
          type: 'paragraph',
          text: 'Quando o backend chegou, ele entrou como uma segunda implementação do mesmo contrato, e a escolha virou uma fábrica que lê a preferência de quem estuda (em Configurações). Nenhuma página que lê ou salva progresso precisou mudar:',
        },
        {
          type: 'code',
          language: 'typescript',
          caption: 'progress-storage.providers.ts',
          code: APP_CONFIG_TS,
        },
        {
          type: 'paragraph',
          text: 'E os testes ganham de presente uma segunda implementação, em memória, sem tocar em nenhuma página:',
        },
        { type: 'code', language: 'typescript', caption: 'Nos testes', code: TEST_SWAP_TS },
        {
          type: 'paragraph',
          text: 'Do outro lado, as regras (próxima atividade e revisão espaçada em core/learning; XP e sequência de dias em core/gamification) são funções puras: recebem o progresso e o catálogo e devolvem decisões. Nenhuma sabe de tela ou de armazenamento, e todas são testadas sem montar componente; um service fino as conecta ao Angular. E não há facade nem store: o ProgressService com um signal resolveu, então nada mais foi criado. Cada uma dessas escolhas está registrada, com as alternativas descartadas, no arquivo de decisões do projeto.',
        },
        {
          type: 'paragraph',
          text: 'Para erros inesperados, um ponto central:',
        },
        { type: 'code', language: 'typescript', caption: 'erros.ts', code: ERROR_HANDLER_TS },
        {
          type: 'callout',
          tone: 'info',
          title: 'Este código é verificado',
          text: 'Os testes da plataforma conferem que o contrato mostrado é o do código real, que trocar o repositório nos testes não exige mudar nenhuma página e que um ErrorHandler próprio recebe um erro lançado num clique.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Analise um projeto seu',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Escolha um componente grande e liste tudo o que ele faz. Quais itens são apresentação, quais são regra de negócio e quais são acesso a dados?',
            'Procure chamadas a localStorage, fetch ou HttpClient direto em componentes. O que mudaria se a fonte de dados mudasse?',
            'Procure uma interface ou classe abstrata com uma única implementação e nenhum plano concreto de outra. Ela ajuda ou só adiciona um arquivo?',
            'Escreva um registro de decisão (o quê, por quê, alternativas) para uma escolha que você fez sem documentar.',
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
          text: 'No laboratório, extraia a regra de um resumo de pedido para uma função pura, testável sem tela. Depois, responda sobre abstrações.',
        },
      ],
      exerciseIds: ['lab-js-order-summary', 'arch-01-abstraction'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: o componente que faz tudo',
      blocks: [
        {
          type: 'code',
          language: 'typescript',
          caption: 'carrinho-pagina.ts (trecho)',
          code: `ngOnInit() {
  const salvo = localStorage.getItem('carrinho');
  this.itens = salvo ? JSON.parse(salvo) : [];
}

get total() {
  const subtotal = this.itens.reduce((s, i) => s + i.preco * i.quantidade, 0);
  return this.cupom ? subtotal * (1 - this.cupom / 100) : subtotal;
}`,
        },
      ],
      exerciseIds: ['arch-01-refactor'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Revisões de código pegam acoplamento cedo: "por que este componente conhece o formato do localStorage?".',
            'Regras de lint podem impor fronteiras, por exemplo proibindo que features importem umas das outras.',
            'Arquitetura muda com o produto: o que era exagero com duas telas pode ser necessário com cinquenta. Registre o porquê para saber quando revisitar.',
            'Este projeto segue a regra "sem facades, stores ou abstrações para quando precisar", escrita nas instruções do repositório, e cada abstração que existe tem uma razão registrada.',
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
      exerciseIds: ['arch-01-dependency', 'arch-01-errors', 'arch-01-adr'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Apresentação, regras e dados em lugares diferentes.',
            'Organização por funcionalidade.',
            'Abstração onde há troca concreta; o resto é custo.',
            'ErrorHandler para o inesperado; erros esperados tratados no lugar.',
            'Decisões registradas com o porquê e as alternativas.',
          ],
        },
        {
          type: 'paragraph',
          text: 'Na Biblioteca: "Componentes de apresentação e de contêiner".',
        },
      ],
    },
  ],
};
