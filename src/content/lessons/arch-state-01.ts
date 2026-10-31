import { Lesson } from '../../app/core/models/content.models';

/**
 * Compiled and executed with this project's Angular in `src/content/arch-state.spec.ts`
 * (drift guard included). The undefined input behaviour was measured there (D-062).
 */
export const URL_STATE_TS = `@Component({
  selector: 'app-lista-produtos',
  template: \`
    <label for="busca">Buscar</label>
    <input id="busca" type="search" [value]="termo()" (input)="buscar($any($event.target).value)" />
    <p>{{ filtrados().length }} de {{ produtos.length }} produtos</p>
    <ul>
      @for (p of filtrados(); track p.id) {
        <li>{{ p.nome }}</li>
      }
    </ul>
  \`,
})
export class ListaProdutos {
  private readonly router = inject(Router);
  readonly produtos = PRODUTOS;

  // Vem de ?busca= (withComponentInputBinding). Sem o parâmetro, chega undefined.
  readonly busca = input<string | undefined>();
  readonly termo = computed(() => this.busca() ?? '');

  // Derivado: calculado a partir da fonte, nunca guardado à parte.
  readonly filtrados = computed(() => {
    const t = this.termo().toLowerCase();
    return this.produtos.filter((p) => p.nome.toLowerCase().includes(t));
  });

  buscar(termo: string) {
    this.router.navigate([], {
      queryParams: { busca: termo || null },
      queryParamsHandling: 'merge',
    });
  }
}`;

export const DUPLICATED_TOTAL_TS = `export class Carrinho {
  readonly itens = signal<readonly Item[]>([]);
  readonly total = signal(0); // cópia do que já dá para calcular

  adicionar(item: Item) {
    this.itens.update((l) => [...l, item]);
    this.total.update((t) => t + item.preco);
  }

  remover(id: number) {
    this.itens.update((l) => l.filter((i) => i.id !== id));
    // esqueceu de atualizar o total
  }
}`;

export const ARCH_STATE_01: Lesson = {
  id: 'arch-state-01',
  moduleId: 'arch-state-placement',
  title: 'Estado: onde cada dado mora',
  summary:
    'Classificar o estado da aplicação (local, compartilhado, na URL, do servidor, persistido), manter uma única fonte de verdade e derivar o resto em vez de duplicar.',
  estimatedMinutes: 40,
  difficulty: 'advanced',
  conceptIds: ['arch-state', 'arch-derived-state'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Boa parte dos bugs difíceis de uma interface são dois lugares discordando sobre o mesmo dado: o total que não bate com os itens, o filtro que some ao recarregar, a lista que mostra um registro já apagado. A pergunta "onde este dado mora?" resolve a maioria deles antes de existirem, e evita o extremo oposto: um store global para tudo.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Classificar cada estado pelo tipo e pelo alcance.',
            'Colocar na URL o que deve sobreviver a recarregar e compartilhar.',
            'Derivar com computed em vez de guardar cópias.',
            'Tratar dados do servidor como cache, com carregamento e erro.',
            'Decidir quando um estado sobe de um componente para um service.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'Cada coisa na sua gaveta',
      blocks: [
        {
          type: 'paragraph',
          text: 'Numa casa organizada, cada objeto tem um lugar: o que você usa num cômodo fica nele, o que todos usam fica na sala, documentos importantes ficam no cofre. E ninguém guarda duas cópias do mesmo documento em gavetas diferentes, porque um dia uma delas fica desatualizada.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Os tipos de estado',
      blocks: [
        {
          type: 'table',
          caption: 'Onde cada estado mora',
          headers: ['Tipo', 'Exemplo', 'Onde mora'],
          rows: [
            ['Local de interface', 'Menu aberto, campo em edição', 'signal no componente'],
            ['Compartilhado no cliente', 'Carrinho, usuário logado', 'service com signals'],
            ['Na URL', 'Busca, página, aba, item selecionado', 'rota e query params'],
            [
              'Do servidor',
              'Lista de produtos, pedidos',
              'cache de requisições (httpResource, service)',
            ],
            ['Persistido no navegador', 'Tema, rascunho', 'repositório atrás de uma interface'],
          ],
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Comece no menor alcance possível (o componente) e suba só quando outro componente precisar. Subir cedo demais espalha dependências; nunca subir gera repasses de input por cinco níveis.',
            'URL: se a pessoa deveria conseguir recarregar, voltar com o botão do navegador ou mandar o link e ver a mesma tela, o estado pertence à URL. Com withComponentInputBinding, query params chegam como inputs.',
            'Medido nesta versão do Angular: sem o query param, o input recebe undefined, e o valor padrão de input("") é ignorado, tanto ao abrir a rota quanto ao remover o parâmetro. Declare input<string | undefined>() e normalize num computed.',
            'Fonte única de verdade: cada dado tem um dono. Total, contagem, lista filtrada e "está vazio" são derivados: computed, nunca um signal à parte atualizado à mão.',
            'Sincronizar dois signals com effect é sinal de estado duplicado; quase sempre a resposta é um computed.',
            'Dados do servidor são uma cópia que pode estar velha: tenha estados de carregamento e erro, e recarregue depois de alterar (lição de HTTP no Angular).',
            'Store global (NgRx e similares) resolve problemas reais de aplicações grandes, mas começa com custo. Com signals e services, a maioria das aplicações não precisa dele: decida quando a dor aparecer e registre a decisão.',
          ],
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: a busca que sobrevive ao F5',
      blocks: [
        {
          type: 'paragraph',
          text: 'A busca mora na URL (/produtos?busca=cafe); a lista filtrada é derivada. Recarregar, voltar e compartilhar o link funcionam sem nenhum código extra:',
        },
        { type: 'code', language: 'typescript', caption: 'lista-produtos.ts', code: URL_STATE_TS },
        {
          type: 'callout',
          tone: 'info',
          title: 'Este código é executado',
          text: 'Os testes da plataforma navegam para /produtos?busca=cafe e conferem a lista filtrada, digitam no campo e conferem a URL, e removem o parâmetro para confirmar que o input chega como undefined.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Experimente',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Escolha uma tela com filtros num site que você usa. Filtre, recarregue e copie o link para outra aba: o filtro sobreviveu?',
            'No exemplo, troque input<string | undefined>() por input("") e remova o ?busca= da URL. O que acontece com termo()?',
            'Liste os estados de uma tela sua e classifique cada um na tabela. Algum está guardado em dois lugares?',
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
          text: 'No laboratório, escreva as funções que levam os filtros de uma lista para a URL e de volta. Depois, classifique estados.',
        },
      ],
      exerciseIds: ['lab-js-url-filters', 'arch-state-01-classify'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: o total que não bate',
      blocks: [
        {
          type: 'paragraph',
          text: 'Depois de remover itens do carrinho, o total continua mostrando o valor antigo.',
        },
        { type: 'code', language: 'typescript', caption: 'carrinho.ts', code: DUPLICATED_TOTAL_TS },
      ],
      exerciseIds: ['arch-state-01-duplicated'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Nesta plataforma, o progresso tem um dono (ProgressService), é persistido atrás do ProgressRepository, e XP, nível e recomendações são derivados dele, nunca guardados à parte.',
            'A etapa atual de uma lição está na URL (?step=3): recarregar ou mandar o link abre a mesma etapa.',
            'Telas administrativas com filtros, ordenação e página na URL são muito mais fáceis de compartilhar e de testar.',
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
      exerciseIds: ['arch-state-01-url', 'arch-state-01-effect', 'arch-state-01-lift'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Local, compartilhado, URL, servidor, persistido: cada um tem seu lugar.',
            'Comece local e suba só quando precisar.',
            'Recarregar e compartilhar devem funcionar? URL.',
            'Derivado é computed; effect sincronizando signals é cheiro de duplicação.',
            'Sem o query param, o input chega undefined: tipe e normalize.',
          ],
        },
      ],
    },
  ],
};
