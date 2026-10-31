import { Lesson } from '../../app/core/models/content.models';

/** Compiled and executed in `src/content/angular-services.spec.ts` (with a drift guard). */
export const CART_SERVICE_TS = `import { computed, Injectable, signal } from '@angular/core';

export interface ItemCarrinho {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
}

@Injectable({ providedIn: 'root' })
export class CarrinhoService {
  private readonly _itens = signal<readonly ItemCarrinho[]>([]);

  /** Leitura para quem usa o service; só os métodos abaixo alteram. */
  readonly itens = this._itens.asReadonly();
  readonly quantidade = computed(() => this._itens().reduce((n, i) => n + i.quantidade, 0));
  readonly total = computed(() => this._itens().reduce((s, i) => s + i.preco * i.quantidade, 0));

  adicionar(produto: { id: number; nome: string; preco: number }) {
    this._itens.update((itens) =>
      itens.some((i) => i.id === produto.id)
        ? itens.map((i) => (i.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i))
        : [...itens, { ...produto, quantidade: 1 }],
    );
  }
}`;

export const CART_COMPONENTS_TS = `import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CarrinhoService } from './carrinho.service';

@Component({
  selector: 'app-botao-comprar',
  template: \`<button type="button" (click)="comprar()">Comprar {{ nome() }}</button>\`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BotaoComprar {
  private readonly carrinho = inject(CarrinhoService);
  readonly id = input.required<number>();
  readonly nome = input.required<string>();
  readonly preco = input.required<number>();

  comprar() {
    this.carrinho.adicionar({ id: this.id(), nome: this.nome(), preco: this.preco() });
  }
}

@Component({
  selector: 'app-resumo-carrinho',
  imports: [CurrencyPipe],
  template: \`<p>Itens: {{ carrinho.quantidade() }} · Total: {{ carrinho.total() | currency: 'BRL' }}</p>\`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResumoCarrinho {
  protected readonly carrinho = inject(CarrinhoService);
}`;

export const COMPONENT_PROVIDER_TS = `@Component({
  selector: 'app-resumo-carrinho',
  providers: [CarrinhoService], // cada ResumoCarrinho ganha um carrinho próprio
  // ...
})`;

export const ANGULAR_SERVICES_01: Lesson = {
  id: 'angular-services-01',
  moduleId: 'angular-services-di',
  title: 'Services, injeção de dependências e estado compartilhado',
  summary:
    'Tirar a lógica e o estado dos componentes, compartilhar dados entre partes distantes da tela e entender de onde vem cada instância de um service.',
  estimatedMinutes: 40,
  difficulty: 'intermediate',
  conceptIds: ['angular-di', 'angular-signals'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'input() e output() resolvem a comunicação entre pai e filho. Mas o botão "Comprar" de um card e o resumo do carrinho no cabeçalho estão longe um do outro na árvore. Passar dados de componente em componente até eles se encontrarem (prop drilling) acopla tudo e torna cada mudança cara.',
        },
        {
          type: 'paragraph',
          text: 'Um service guarda o estado e as regras num lugar só, e a injeção de dependências entrega a mesma instância a quem pedir. Os componentes ficam responsáveis apenas por mostrar e reagir.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Criar um service com estado em signals e expor só leitura.',
            'Injetar o service com inject() e saber onde isso é permitido.',
            'Entender quando duas partes recebem a mesma instância e quando recebem instâncias diferentes.',
            'Trocar o service por uma versão falsa nos testes.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'O almoxarifado',
      blocks: [
        {
          type: 'paragraph',
          text: 'Numa empresa, ninguém fabrica a própria impressora: pede ao almoxarifado, que entrega a que existe. Se a impressora fica no andar todo (providedIn: "root"), todo mundo usa a mesma e vê a mesma fila de impressão. Se uma sala pede uma impressora só para ela (providers no componente), aquela sala tem a sua, separada das outras.',
        },
        {
          type: 'paragraph',
          text: 'O componente só diz do que precisa (inject(CarrinhoService)); quem decide qual instância entregar é o injetor. Por isso, num teste, dá para trocar a impressora de verdade por uma de mentira sem mudar o componente.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Services, injetores e instâncias',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            '@Injectable({ providedIn: "root" }) registra o service no injetor da aplicação: uma única instância, criada na primeira vez que alguém a pede, e removida do bundle se ninguém a usar.',
            'inject(Classe) pede a instância ao injetor. Só funciona num contexto de injeção: inicializadores de campos, construtor, fábricas de providers e funções como guards. Chamar inject() dentro de um método disparado por clique lança o erro NG0203.',
            'providers: [Classe] em um componente cria uma instância nova para aquele componente e seus filhos, que deixa de ser compartilhada com o resto da aplicação.',
            'Guarde o estado num signal privado e exponha asReadonly(): quem usa o service lê, mas só os métodos dele alteram. Valores derivados ficam em computed.',
            'Lógica de negócio (regras do carrinho, cálculos, chamadas HTTP) vai para o service; o componente cuida da apresentação.',
            'Em testes, TestBed.inject(Service) testa o service sozinho, e { provide: Service, useValue: falso } substitui o service ao testar um componente.',
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Service não é lugar para tudo',
          text: 'Um service "global" com o estado de todas as telas vira um ponto único de acoplamento. Crie services por assunto (carrinho, sessão, catálogo) e prefira estado local no componente quando só ele usa.',
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: carrinho compartilhado',
      blocks: [
        {
          type: 'paragraph',
          text: 'O service guarda os itens num signal privado e expõe leitura e valores derivados. Adicionar um produto que já está no carrinho aumenta a quantidade em vez de duplicar a linha.',
        },
        {
          type: 'code',
          language: 'typescript',
          caption: 'carrinho.service.ts',
          code: CART_SERVICE_TS,
        },
        {
          type: 'paragraph',
          text: 'Dois componentes que não se conhecem: o botão de um card e o resumo do cabeçalho. Ambos injetam o mesmo service e, por isso, enxergam o mesmo estado.',
        },
        {
          type: 'code',
          language: 'typescript',
          caption: 'componentes.ts',
          code: CART_COMPONENTS_TS,
        },
        {
          type: 'paragraph',
          text: 'Com providers no componente, cada instância dele tem um carrinho próprio. Isso é útil para estado que pertence a um pedaço da tela (um assistente de várias etapas, por exemplo), e é um bug quando a intenção era compartilhar:',
        },
        {
          type: 'code',
          language: 'typescript',
          caption: 'Instância por componente',
          code: COMPONENT_PROVIDER_TS,
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Este código é testado',
          text: 'O service e os dois componentes são compilados e executados pelos testes da plataforma: clicar no botão atualiza o resumo, providers no componente separa as instâncias e inject() fora de contexto lança NG0203.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Monte no seu computador',
      blocks: [
        {
          type: 'code',
          language: 'shell',
          caption: 'Terminal (dentro de um projeto Angular)',
          code: `npx ng generate service carrinho
npx ng generate component botao-comprar
npx ng generate component resumo-carrinho`,
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Coloque dois <app-botao-comprar> e um <app-resumo-carrinho> em lugares diferentes da página e confira que o resumo acompanha os dois botões.',
            'Adicione providers: [CarrinhoService] ao ResumoCarrinho. O resumo ainda atualiza? Por quê?',
            'Mova o inject(CarrinhoService) do campo para dentro de comprar() e clique: leia o erro no console.',
            'Tente this.carrinho.itens.set([]) num componente. O que o compilador diz?',
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
          text: 'Responda pensando no carrinho da lição.',
        },
      ],
      exerciseIds: ['services-01-total', 'services-01-readonly'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: o resumo que não atualiza',
      blocks: [
        {
          type: 'paragraph',
          text: 'Alguém acrescentou providers: [CarrinhoService] ao ResumoCarrinho "para deixar a dependência explícita". Agora o resumo fica sempre em 0 itens.',
        },
      ],
      exerciseIds: ['services-01-providers'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'O próprio Angular entrega serviços por injeção: Router, HttpClient, DestroyRef, Title.',
            'Esta plataforma tem um ProgressService com o progresso num signal, injetado pelas páginas que precisam dele; a gravação fica atrás de uma interface (ProgressRepository), que pode ser trocada por um backend sem mudar as páginas.',
            'InjectionToken permite injetar valores que não são classes, como configurações; a plataforma usa um para o catálogo de conteúdo.',
            'Testes de componente ficam rápidos e determinísticos com services falsos: nada de rede, relógio ou armazenamento real.',
          ],
        },
      ],
    },
    {
      kind: 'assessment',
      title: 'Avaliação',
      blocks: [
        {
          type: 'paragraph',
          text: 'Para concluir a lição, acerte os três exercícios abaixo.',
        },
      ],
      exerciseIds: ['services-01-inject-context', 'services-01-flow', 'services-01-where'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'providedIn: "root": uma instância para a aplicação inteira.',
            'providers no componente: uma instância nova para ele e seus filhos.',
            'inject() só em contexto de injeção; fora dele, NG0203.',
            'Estado em signal privado, leitura com asReadonly(), derivados com computed.',
            'Lógica no service, apresentação no componente; nos testes, troque o service por um falso.',
          ],
        },
        {
          type: 'paragraph',
          text: 'Na Biblioteca: "Signals no Angular" e "Componentes de apresentação e de contêiner".',
        },
      ],
    },
  ],
};
