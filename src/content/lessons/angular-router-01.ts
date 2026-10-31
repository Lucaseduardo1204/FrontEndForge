import { Lesson } from '../../app/core/models/content.models';

/** Executed with RouterTestingHarness in `src/content/angular-router.spec.ts` (drift guard). */
export const ROUTES_TS = `import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', component: ListaProdutos, title: 'Produtos' },
  { path: 'produtos/:id', component: DetalheProduto, title: 'Detalhe do produto' },
  {
    path: 'admin',
    // Sem sessão, redireciona para /login em vez de só bloquear.
    canActivate: [() => inject(SessaoService).logado() || inject(Router).parseUrl('/login')],
    loadChildren: () => import('./admin/admin.routes'), // baixado só ao entrar em /admin
  },
  { path: 'login', component: Login, title: 'Entrar' },
  { path: '**', component: NaoEncontrada, title: 'Página não encontrada' }, // sempre por último
];`;

export const APP_CONFIG_TS = `import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes, withComponentInputBinding())],
};`;

export const DETAIL_TS = `@Component({
  selector: 'app-detalhe-produto',
  imports: [RouterLink],
  template: \`
    @if (produto(); as p) {
      <h1>{{ p.nome }}</h1>
      <a [routerLink]="['/produtos', p.id + 1]">Próximo produto</a>
    } @else {
      <h1>Produto não encontrado</h1>
    }
  \`,
})
export class DetalheProduto {
  private readonly catalogo = inject(CatalogoService);

  /** Preenchido pelo parâmetro :id da rota (withComponentInputBinding). */
  readonly id = input.required<string>();
  readonly produto = computed(() => this.catalogo.porId(Number(this.id())));
}`;

export const NAV_HTML = `<nav aria-label="Principal">
  <a routerLink="/" routerLinkActive="ativo" [routerLinkActiveOptions]="{ exact: true }"
     ariaCurrentWhenActive="page">Produtos</a>
  <a routerLink="/admin" routerLinkActive="ativo" ariaCurrentWhenActive="page">Admin</a>
</nav>
<router-outlet />`;

export const STALE_DETAIL_TS = `export class DetalheProduto {
  private readonly rota = inject(ActivatedRoute);
  private readonly catalogo = inject(CatalogoService);

  // Lido uma vez, quando o componente é criado.
  readonly produto = this.catalogo.porId(Number(this.rota.snapshot.paramMap.get('id')));
}`;

export const ANGULAR_ROUTER_01: Lesson = {
  id: 'angular-router-01',
  moduleId: 'angular-routes-navigation',
  title: 'Rotas: parâmetros, lazy loading e guards',
  summary:
    'Organizar a aplicação em páginas com endereço próprio, receber parâmetros da URL como inputs, carregar áreas sob demanda e redirecionar quem não pode entrar.',
  estimatedMinutes: 45,
  difficulty: 'intermediate',
  conceptIds: ['angular-routing', 'angular-guards'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Numa aplicação de uma página só (SPA), o navegador não carrega uma página nova a cada clique: o roteador troca o componente na tela e atualiza a URL. Isso precisa continuar funcionando como a web espera: cada tela com seu endereço, o botão voltar funcionando, links que podem ser compartilhados e abertos em outra aba.',
        },
        {
          type: 'paragraph',
          text: 'Os problemas comuns: a tela de detalhe que não muda quando só o id da URL muda, a rota coringa que engole todas as outras, o painel administrativo baixado por quem nunca vai abri-lo e a crença de que um guard protege os dados.',
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'A recepção do prédio',
      blocks: [
        {
          type: 'paragraph',
          text: 'Pense no roteador como a recepção de um prédio comercial. Ele lê o endereço pedido (a URL), confere a lista de salas de cima para baixo e encaminha para a primeira que corresponde. Algumas salas exigem crachá (guards); a recepção pode mandar a pessoa ao balcão de cadastro (redirecionamento). Andares inteiros só têm a luz acesa quando alguém sobe (lazy loading).',
        },
        {
          type: 'paragraph',
          text: 'E o crachá da recepção não protege o cofre: quem pular a catraca chega na sala. A proteção dos dados fica no servidor.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Como o Router decide',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Routes é uma lista lida em ordem: a primeira rota que corresponde à URL vence. Por isso a rota coringa ** fica sempre por último.',
            'Segmentos com dois-pontos (produtos/:id) são parâmetros. Com withComponentInputBinding(), um input() com o mesmo nome do parâmetro recebe o valor, sempre como texto.',
            'Ao navegar para a mesma rota com outro parâmetro (de /produtos/1 para /produtos/2), o Angular reaproveita o componente em vez de recriá-lo. Ler o parâmetro uma vez no construtor (snapshot) deixa a tela desatualizada; com o input como signal, os computed acompanham.',
            'routerLink navega sem recarregar a página. Um <a href> comum faz o navegador pedir a página de novo ao servidor e reiniciar a aplicação, perdendo o estado em memória.',
            'routerLinkActive aplica uma classe ao link da rota atual, e ariaCurrentWhenActive="page" informa a página atual a leitores de tela.',
            'loadChildren e loadComponent com import() criam pedaços separados do bundle, baixados só quando a rota é acessada.',
            'Guards são funções. canActivate pode devolver true (entra), false (fica onde está) ou uma UrlTree, que redireciona. Elas rodam num contexto de injeção, então inject() funciona dentro delas.',
            'title na rota define o título da aba, importante para quem usa leitor de tela e para o histórico do navegador.',
          ],
        },
        {
          type: 'callout',
          tone: 'security',
          title: 'Guard é experiência, não segurança',
          text: 'Todo o código do frontend chega ao navegador e pode ser lido e alterado. Um guard evita que a pessoa caia numa tela que não vai funcionar, mas não impede ninguém de chamar a API diretamente. Quem decide se um dado pode ser lido ou alterado é o servidor, a cada requisição.',
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: catálogo com área administrativa',
      blocks: [
        { type: 'code', language: 'typescript', caption: 'app.routes.ts', code: ROUTES_TS },
        { type: 'code', language: 'typescript', caption: 'app.config.ts', code: APP_CONFIG_TS },
        {
          type: 'paragraph',
          text: 'O detalhe recebe o id da URL como input e deriva o produto com computed. Quando o link "Próximo produto" troca só o id, o mesmo componente continua na tela e o computed recalcula.',
        },
        { type: 'code', language: 'typescript', caption: 'detalhe-produto.ts', code: DETAIL_TS },
        {
          type: 'paragraph',
          text: 'No layout, o menu marca a página atual para quem enxerga (classe) e para quem usa leitor de tela (aria-current):',
        },
        { type: 'code', language: 'html', caption: 'app.html', code: NAV_HTML },
        {
          type: 'callout',
          tone: 'info',
          title: 'Este código é testado',
          text: 'As rotas e o componente de detalhe são executados nos testes da plataforma com o Router do Angular usado no projeto: parâmetro como input, reaproveitamento do componente, redirecionamento do guard, ordem da rota coringa e aria-current.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Monte no seu computador',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Num projeto Angular, crie as rotas do exemplo e abra /produtos/1. Clique em "Próximo produto" e observe a URL, o título e o botão voltar do navegador.',
            'Troque o detalhe pela versão com snapshot (etapa de depuração) e repita.',
            'Mova a rota ** para o início da lista e abra /produtos/1.',
            'Rode npx ng build e procure na saída o pedaço (chunk) separado da área admin. Abra a aba Rede do DevTools e veja quando ele é baixado.',
            'Troque um routerLink por href e clique com a aba Rede aberta: veja o documento ser baixado de novo.',
          ],
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Prática',
      blocks: [{ type: 'paragraph', text: 'Responda pensando no exemplo do catálogo.' }],
      exerciseIds: ['router-01-param', 'router-01-href', 'router-01-guard-security'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: o detalhe que não muda',
      blocks: [
        {
          type: 'paragraph',
          text: 'Nesta versão, clicar em "Próximo produto" muda a URL para /produtos/2, mas a tela continua mostrando o produto 1.',
        },
        { type: 'code', language: 'typescript', caption: 'Com bug', code: STALE_DETAIL_TS },
      ],
      exerciseIds: ['router-01-stale'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Esta plataforma usa exatamente esse modelo: cada área é carregada sob demanda (loadChildren), os ids de lição e exercício chegam como input() e cada rota define o título da aba.',
            'O modo foco fica fora do layout principal com uma rota de nível superior própria, e a rota ** mostra uma página de "não encontrada" com um link de volta para a central de comando.',
            'Resolvers carregam dados antes de a rota ativar; para telas que podem mostrar um estado de carregamento, carregar no componente costuma dar uma experiência melhor.',
            'Em aplicações grandes, cada área (admin, relatórios, configurações) tem seu próprio arquivo de rotas, carregado sob demanda.',
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
      exerciseIds: ['router-01-order', 'router-01-redirect', 'router-01-lazy'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Rotas são lidas em ordem; ** sempre por último.',
            'Parâmetros chegam como input() com withComponentInputBinding(); derive com computed.',
            'Trocar só o parâmetro reaproveita o componente: não leia o snapshot uma vez.',
            'routerLink em vez de href; ariaCurrentWhenActive para a página atual.',
            'Lazy loading separa áreas do bundle; guards orientam a navegação, e o servidor protege os dados.',
          ],
        },
      ],
    },
  ],
};
