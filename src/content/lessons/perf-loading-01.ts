import { Lesson } from '../../app/core/models/content.models';

/**
 * Behaviour of @defer and NgOptimizedImage is executed in `src/content/perf-a11y-examples.spec.ts`.
 * Bundle numbers were measured on this project's production build (D-056).
 */
export const DEFER_HTML = `<h2>Vendas do mês</h2>
<p>{{ resumo() }}</p>

<!-- O componente do gráfico (e a biblioteca que ele usa) só é baixado
     quando a área entra na tela. -->
@defer (on viewport) {
  <app-grafico-vendas [dados]="vendas()" />
} @placeholder {
  <p>Gráfico de vendas</p>
} @loading (minimum 300ms) {
  <p>Carregando o gráfico…</p>
}`;

export const IMAGE_HTML = `<!-- Imagem principal da página (provável LCP): carregar cedo e com prioridade -->
<img ngSrc="/produtos/cafe.jpg" width="800" height="600" priority alt="Pacote de café torrado" />

<!-- Imagens abaixo da dobra: carregamento preguiçoso (o padrão da diretiva) -->
<img ngSrc="/produtos/pao.jpg" width="400" height="300" alt="Pão de fermentação natural" />`;

export const BUDGETS_JSON = `"budgets": [
  { "type": "initial", "maximumWarning": "500kB", "maximumError": "1MB" },
  { "type": "anyComponentStyle", "maximumWarning": "4kB", "maximumError": "8kB" }
]`;

export const PERF_LOADING_01: Lesson = {
  id: 'perf-loading-01',
  moduleId: 'performance-loading',
  title: 'Performance: Core Web Vitals, bundle e carregamento sob demanda',
  summary:
    'Medir antes de otimizar: as métricas que representam a experiência real, o que pesa no carregamento de uma aplicação Angular e as ferramentas para baixar só o necessário.',
  estimatedMinutes: 45,
  difficulty: 'intermediate',
  conceptIds: ['perf-web-vitals', 'perf-loading'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Uma página lenta perde pessoas antes de mostrar qualquer coisa, e quem mais sofre usa celulares modestos e conexões instáveis. Ao mesmo tempo, otimizar sem medir é chute: muita gente gasta dias em algo que não muda a experiência e ignora a imagem de 3 MB no topo da página.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Conhecer as métricas Core Web Vitals e o que cada uma mede.',
            'Ler o tamanho do bundle e entender o que é carregado no início.',
            'Carregar rotas e partes pesadas da tela sob demanda.',
            'Otimizar imagens e evitar que a página "pule" enquanto carrega.',
            'Usar orçamentos de tamanho para que o bundle não cresça sem ninguém perceber.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'A mudança de casa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Mudar de casa levando tudo de uma vez num caminhão só é lento: nada pode ser usado até o último móvel chegar. Uma mudança bem planejada leva primeiro a cama, o fogão e o que se usa no primeiro dia; o resto vem quando for preciso. E ninguém quer tropeçar numa caixa que apareceu do nada no meio do corredor.',
        },
        {
          type: 'paragraph',
          text: 'Na web, o primeiro caminhão é o bundle inicial; as entregas seguintes são os chunks carregados sob demanda; e a caixa no corredor é o conteúdo que empurra a página quando chega (CLS).',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Métricas e ferramentas',
      blocks: [
        {
          type: 'table',
          caption: 'Core Web Vitals (bom no 75º percentil das visitas)',
          headers: ['Métrica', 'O que mede', 'Bom'],
          rows: [
            [
              'LCP (Largest Contentful Paint)',
              'Quando o maior elemento visível (imagem ou bloco de texto) aparece',
              'Até 2,5 s',
            ],
            [
              'INP (Interaction to Next Paint)',
              'Quanto a página demora para responder visualmente a cliques e teclas',
              'Até 200 ms',
            ],
            [
              'CLS (Cumulative Layout Shift)',
              'Quanto o conteúdo se desloca sozinho enquanto a página carrega',
              'Até 0,1',
            ],
          ],
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Meça em condições reais: o Lighthouse e o painel Performance do DevTools simulam celular e rede lenta; dados de campo (de visitantes reais) mostram o que o laboratório não vê.',
            'O build de produção mostra o tamanho do bundle inicial e dos chunks sob demanda. O que está no inicial é baixado e executado antes de qualquer coisa aparecer.',
            'Rotas com loadComponent/loadChildren viram chunks separados (lição de rotas).',
            '@defer faz o mesmo dentro de uma tela: o conteúdo do bloco e as dependências que só ele usa vão para um chunk separado, carregado quando o gatilho acontece (on viewport, on interaction, on idle...). @placeholder aparece antes; @loading, durante o download.',
            'Imagens costumam ser o maior peso. NgOptimizedImage (ngSrc) exige width e height, o que reserva o espaço e evita CLS; priority marca a imagem principal para carregar cedo (ajuda o LCP); as outras carregam de forma preguiçosa.',
            'Orçamentos (budgets) no angular.json fazem o build avisar ou falhar quando o bundle passa de um limite.',
            'Na interação (INP): com signals e OnPush, o Angular atualiza só o que mudou; listas com track por id reaproveitam elementos; trabalho pesado sai da thread principal (Web Worker) ou é dividido.',
            'Conexão lenta: compressão (o servidor envia gzip ou brotli), cache dos arquivos com hash no nome e um estado de carregamento claro valem mais do que micro-otimizações.',
          ],
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: esta plataforma e um painel de vendas',
      blocks: [
        {
          type: 'paragraph',
          text: 'Medido no build de produção desta plataforma: o bundle inicial tem 479 kB, que viram cerca de 92 kB transferidos com compressão; o main.js sozinho tem 314 kB (43 kB comprimido). O resto do código, mais de 60 arquivos, são chunks das áreas e das lições, baixados só quando a pessoa abre cada uma. O orçamento configurado avisa em 500 kB:',
        },
        { type: 'code', language: 'json', caption: 'angular.json (trecho)', code: BUDGETS_JSON },
        {
          type: 'paragraph',
          text: 'Num painel com um gráfico pesado abaixo da dobra, @defer tira o gráfico do carregamento inicial:',
        },
        { type: 'code', language: 'html', caption: 'painel.html', code: DEFER_HTML },
        {
          type: 'paragraph',
          text: 'E as imagens de um catálogo, com espaço reservado e prioridade só para a principal:',
        },
        { type: 'code', language: 'html', caption: 'catalogo.html', code: IMAGE_HTML },
        {
          type: 'callout',
          tone: 'info',
          title: 'Este comportamento é testado',
          text: 'Os testes da plataforma conferem, com o Angular do projeto, que o @defer mostra o placeholder e depois o conteúdo, que NgOptimizedImage recusa imagem sem width e height (erro NG02954) e que priority produz loading="eager" e fetchpriority="high", enquanto as outras imagens ficam com loading="lazy".',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Meça no seu computador',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Rode npx ng build num projeto Angular e leia a tabela: o que está em Initial e o que está em Lazy chunk files?',
            'Abra o build no Chrome, rode o Lighthouse no modo celular e anote LCP e CLS. Qual é o elemento do LCP?',
            'No painel Rede, ative a limitação "4G lenta", recarregue e navegue para uma rota lazy: veja o chunk ser baixado nesse momento.',
            'Remova width e height de uma imagem comum (sem ngSrc) e meça o CLS de novo.',
            'Envolva um componente pesado em @defer (on viewport) e compare o bundle inicial antes e depois.',
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
          text: 'No laboratório, implemente um debounce, a técnica que evita trabalho repetido enquanto a pessoa ainda está digitando. Depois, responda sobre as métricas.',
        },
      ],
      exerciseIds: ['lab-js-debounce', 'perf-01-metrics'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: a página que pula',
      blocks: [
        {
          type: 'code',
          language: 'html',
          caption: 'O texto desce quando o banner carrega',
          code: `<img src="/banner-promocao.jpg" alt="Promoção de café">
<h1>Cafés especiais</h1>`,
        },
      ],
      exerciseIds: ['perf-01-cls'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Coloque o Lighthouse ou uma checagem de orçamento na integração contínua para pegar regressões cedo.',
            'Bibliotecas grandes (gráficos, editores, mapas) são as melhores candidatas a @defer.',
            'Antes de adicionar uma dependência, veja quanto ela pesa; às vezes a plataforma já resolve (Intl para formatar datas e números, por exemplo).',
            'Esta plataforma carrega cada área sob demanda e o transpilador de TypeScript do laboratório só quando o primeiro exercício de TS é aberto.',
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
      exerciseIds: ['perf-01-defer', 'perf-01-priority', 'perf-01-measure'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'LCP até 2,5 s, INP até 200 ms, CLS até 0,1.',
            'Meça antes e depois; o bundle inicial é o primeiro suspeito.',
            'Rotas lazy e @defer separam o que não é necessário no início.',
            'Imagens com dimensões reservadas; priority só para a principal.',
            'Orçamentos impedem que o bundle cresça sem aviso.',
          ],
        },
      ],
    },
  ],
};
