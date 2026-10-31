import { Lesson } from '../../app/core/models/content.models';

/** Values measured in a real Chromium (D-064). */
export const FLUID_TYPE_CSS = `/* Cresce com a viewport, sem passar dos limites:
   16px em 320px de largura, 24px em 600px, 32px em 1400px (medido no Chromium). */
h1 {
  font-size: clamp(1rem, 4vw, 2rem);
}`;

export const CONTAINER_QUERY_CSS = `/* 1. Declare quem é o contêiner. Sem isto, @container não se aplica. */
.slot {
  container-type: inline-size;
}

/* 2. O cartão muda de layout pelo espaço que tem, não pelo tamanho da tela. */
@container (min-width: 480px) {
  .card {
    display: flex;
    gap: 1rem;
  }
}`;

export const PREFERENCES_CSS = `.painel {
  transition: transform 300ms;
}

/* Quem pediu menos movimento no sistema operacional não recebe a animação. */
@media (prefers-reduced-motion: reduce) {
  .painel {
    transition-duration: 0.01ms;
  }
}`;

export const CSS_RESPONSIVE_01: Lesson = {
  id: 'css-responsive-01',
  moduleId: 'css-modern-responsive',
  title: 'Responsividade moderna: unidades, clamp, container queries e preferências',
  summary:
    'Componentes que se adaptam ao espaço onde são colocados, texto que cresce sem estourar e interfaces que respeitam as preferências de quem usa.',
  estimatedMinutes: 40,
  difficulty: 'intermediate',
  conceptIds: ['css-container-queries', 'css-fluid-units', 'css-user-preferences'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Media queries perguntam "qual é o tamanho da tela?". Mas um cartão de produto pode aparecer numa coluna estreita ao lado do filtro e, na mesma tela, numa área larga do destaque. O que o cartão precisa saber é quanto espaço ele tem. Além disso, tamanho de tela não é a única diferença entre pessoas: há quem aumente a fonte do navegador e quem peça menos movimento.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Escolher unidades: rem, em, %, vw e as de contêiner.',
            'Criar tipografia e espaçamentos fluidos com clamp.',
            'Fazer componentes responsivos ao contêiner com @container.',
            'Respeitar preferências: movimento reduzido, tema e tamanho de fonte.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'O móvel que mede a parede',
      blocks: [
        {
          type: 'paragraph',
          text: 'Um móvel modular bem projetado não pergunta o tamanho da casa: ele mede a parede onde vai ficar e se arranja. Media queries medem a casa; container queries medem a parede. E clamp é a regra "pelo menos isso, no máximo aquilo, de preferência proporcional".',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Unidades, clamp, contêineres e preferências',
      blocks: [
        {
          type: 'table',
          caption: 'Unidades mais usadas',
          headers: ['Unidade', 'Relativa a', 'Bom para'],
          rows: [
            [
              'rem',
              'Tamanho de fonte da raiz (preferência do navegador)',
              'Fonte, espaçamentos, larguras máximas',
            ],
            ['em', 'Fonte do próprio elemento', 'Espaços que acompanham o texto do componente'],
            ['%', 'O elemento pai', 'Larguras dentro de um contêiner'],
            ['vw / vh', '1% da viewport', 'Valores fluidos dentro de clamp'],
            ['cqi', '1% da largura do contêiner', 'Valores fluidos dentro de um componente'],
          ],
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Medido no Chromium: com a fonte padrão do navegador em 24px, uma caixa de 10rem passou a ter 240px; uma de 160px continuou com 160px. Tamanhos de texto em px ignoram a preferência de quem precisa de letras maiores.',
            'clamp(mínimo, preferido, máximo) devolve o valor preferido limitado pelos extremos. Com clamp(1rem, 4vw, 2rem), o texto foi 16px numa tela de 320px, 24px em 600px e 32px em 1400px.',
            'Use rem nos limites do clamp: assim, quem aumenta a fonte do navegador aumenta também o mínimo e o máximo.',
            'Container queries: o elemento pai recebe container-type: inline-size, e @container (min-width: 480px) se aplica conforme a largura dele. Medido: o mesmo cartão ficou em bloco num contêiner de 300px e em flex num de 640px; sem container-type, ficou em bloco mesmo com 640px.',
            'Media queries continuam sendo a ferramenta para o layout da página (menu lateral, número de colunas) e para preferências do sistema.',
            'prefers-reduced-motion: reduce indica quem pediu menos movimento (há pessoas que sentem tontura com animações). Medido: com a preferência emulada, a transição de 0,3s caiu para 0,01ms.',
            'prefers-color-scheme: dark indica o tema do sistema; esta plataforma usa o tema escuro por padrão e guarda a escolha da pessoa.',
          ],
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: título fluido, cartão adaptável e menos movimento',
      blocks: [
        { type: 'code', language: 'css', caption: 'titulo.css', code: FLUID_TYPE_CSS },
        { type: 'code', language: 'css', caption: 'cartao.css', code: CONTAINER_QUERY_CSS },
        { type: 'code', language: 'css', caption: 'preferencias.css', code: PREFERENCES_CSS },
        {
          type: 'callout',
          tone: 'info',
          title: 'Medido num Chromium',
          text: 'Os três trechos foram medidos com o navegador emulando larguras de tela, contêineres de 300px e 640px e a preferência de movimento reduzido. Os números da explicação são os resultados.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Teste no navegador',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Nas configurações do navegador, aumente o tamanho da fonte e abra um site que você usa: o texto cresceu?',
            'No DevTools, aba Rendering, emule prefers-reduced-motion: reduce e veja as animações de um site.',
            'Selecione um contêiner com container-type no painel Elementos: o Chrome mostra um selo "container" ao lado.',
            'Arraste a largura da janela com o título em clamp e veja o tamanho parar nos limites.',
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
          text: 'No laboratório, faça um cartão de produto que muda de layout pelo contêiner e tem título fluido dentro dele. Depois, responda sobre unidades.',
        },
      ],
      exerciseIds: ['lab-css-container', 'responsive-01-units'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: a container query que não funciona',
      blocks: [
        {
          type: 'code',
          language: 'css',
          caption: 'O cartão nunca muda de layout, mesmo em áreas largas',
          code: `.card {
  display: block;
}

@container (min-width: 480px) {
  .card {
    display: flex;
  }
}`,
        },
      ],
      exerciseIds: ['responsive-01-container-type'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Componentes de uma biblioteca de design ficam reutilizáveis de verdade com container queries: o mesmo cartão funciona numa barra lateral e numa área principal.',
            'Esta plataforma usa tokens de espaçamento e fonte em rem, e respeita prefers-reduced-motion nas transições.',
            'Escalas tipográficas fluidas com clamp substituem várias media queries de tamanho de fonte.',
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
      exerciseIds: [
        'responsive-01-clamp',
        'responsive-01-media-or-container',
        'responsive-01-motion',
      ],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'rem respeita a fonte escolhida por quem usa; px não.',
            'clamp: mínimo, preferido, máximo.',
            'container-type no pai; @container no filho.',
            'Media queries para a página e para preferências; container queries para componentes.',
            'prefers-reduced-motion: reduza ou remova animações.',
          ],
        },
      ],
    },
  ],
};
