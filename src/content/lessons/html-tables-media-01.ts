import { Lesson } from '../../app/core/models/content.models';

/** Accessibility tree and layout measured in a real Chromium (D-066). */
export const ORDERS_TABLE_HTML = `<table>
  <caption>Pedidos de outubro</caption>
  <thead>
    <tr>
      <th scope="col">Pedido</th>
      <th scope="col">Cliente</th>
      <th scope="col">Total</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">#1042</th>
      <td>Ana Souza</td>
      <td>R$ 59,70</td>
    </tr>
  </tbody>
</table>`;

export const MEDIA_HTML = `<!-- Informativa: o alt diz o que a imagem comunica -->
<img src="vendas.png" width="800" height="600"
     alt="Gráfico de vendas: alta de 20% em outubro" />

<!-- Decorativa: alt vazio, para ser ignorada -->
<img src="ornamento.svg" width="40" height="40" alt="" />

<!-- Responsiva: o navegador escolhe o arquivo pela largura -->
<img srcset="foto-400.jpg 400w, foto-800.jpg 800w, foto-1600.jpg 1600w"
     sizes="100vw" src="foto-800.jpg" width="1600" height="1200"
     alt="Fachada da loja do centro" />

<!-- Legenda visível ligada à imagem -->
<figure>
  <img src="loja.jpg" width="800" height="600" alt="Fachada da loja do centro" />
  <figcaption>Loja do centro, reformada em 2025.</figcaption>
</figure>`;

export const HTML_TABLES_MEDIA_01: Lesson = {
  id: 'html-tables-media-01',
  moduleId: 'html-tables-media',
  title: 'Tabelas de dados e mídia acessível',
  summary:
    'Tabelas que leitores de tela conseguem navegar, imagens com o texto alternativo certo e mídia que não empurra a página enquanto carrega.',
  estimatedMinutes: 35,
  difficulty: 'introductory',
  conceptIds: ['html-tables', 'html-media'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Uma tabela feita com divs parece igual na tela, mas para quem usa leitor de tela vira uma sequência solta de textos: ouvir "R$ 59,70" sem saber de qual pedido nem de qual coluna. Uma imagem sem alt pode ser anunciada pelo nome do arquivo. E uma imagem sem dimensões faz o texto pular quando ela termina de carregar, justo quando a pessoa ia clicar.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Montar tabelas de dados com caption, cabeçalhos e scope.',
            'Saber quando uma tabela é a escolha certa.',
            'Escrever alt para imagens informativas e decorativas.',
            'Reservar espaço para imagens e servir o tamanho certo com srcset.',
            'Legendar mídia com figure, figcaption e legendas de vídeo.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'A planilha lida em voz alta',
      blocks: [
        {
          type: 'paragraph',
          text: 'Imagine alguém lendo uma planilha para você pelo telefone. Se a pessoa disser "linha do pedido 1042, coluna Total: 59,70", você entende. Se disser só "59,70", não. Os cabeçalhos de uma tabela são o que permite ao leitor de tela dizer a primeira frase. O alt é a mesma coisa para imagens: o que você diria a quem não pode ver.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Tabelas, imagens e mídia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Tabela é para dados com linhas e colunas que se relacionam (pedidos, horários, comparações). Para layout, use CSS Grid ou Flexbox.',
            'caption dá nome à tabela; th marca cabeçalhos; scope="col" e scope="row" dizem se o cabeçalho vale para a coluna ou para a linha. Medido na árvore de acessibilidade do Chromium: a tabela recebeu o nome da caption, os th viraram columnheader e rowheader, e os td viraram cell. A mesma informação feita com divs apareceu como generic, sem nenhuma relação.',
            'thead e tbody agrupam as linhas; em tabelas largas, um contêiner com overflow-x: auto evita que a página inteira role para o lado.',
            'alt de imagem informativa descreve o que ela comunica no contexto ("alta de 20% em outubro"), não a aparência ("gráfico azul") nem o nome do arquivo. Não comece com "imagem de": o leitor já anuncia que é uma imagem.',
            'Imagem decorativa recebe alt="" (vazio, mas presente). Medido: com alt vazio, a imagem foi ignorada pela árvore de acessibilidade; sem alt, continuou lá como imagem sem nome, que leitores de tela costumam anunciar pelo nome do arquivo.',
            'width e height no img reservam o espaço antes de a imagem chegar (o CSS com width: 100% e height: auto mantém a proporção). Medido com uma imagem lenta: com os atributos, a área de 300px já estava reservada; sem eles, a imagem tinha 0px enquanto carregava, e o texto abaixo pulou 300px quando ela chegou.',
            'srcset com descritores de largura (400w, 800w) e sizes deixam o navegador escolher o arquivo. Medido: numa tela de 400px, o Chromium escolheu o de 400w; numa de 1200px, o de 1600w.',
            'figure com figcaption liga uma legenda visível à imagem. Medido: o Chromium expôs o figure como "figure", mas a legenda não virou o nome dele; o alt da imagem continua necessário.',
            'Vídeo: legendas com <track kind="captions">, controles nativos (controls) e nunca autoplay com som.',
          ],
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: pedidos e mídia de uma loja',
      blocks: [
        { type: 'code', language: 'html', caption: 'pedidos.html', code: ORDERS_TABLE_HTML },
        { type: 'code', language: 'html', caption: 'midia.html', code: MEDIA_HTML },
        {
          type: 'callout',
          tone: 'info',
          title: 'Medido num Chromium',
          text: 'A árvore de acessibilidade, a reserva de espaço e a escolha do srcset foram medidas com o navegador real; os resultados estão na explicação.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Teste com as ferramentas do navegador',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'No DevTools, aba Elements → Accessibility, selecione uma célula de tabela e veja o papel e o nome.',
            'Ative o leitor de tela do sistema (NVDA, VoiceOver ou TalkBack) e navegue por uma tabela com as teclas de tabela.',
            'Na aba Network, limite a velocidade (Slow 4G) e recarregue uma página com imagens sem width e height: o texto pula?',
            'Em Network, filtre por imagens e veja qual arquivo de um srcset foi baixado em larguras diferentes.',
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
          text: 'No laboratório, transforme uma tabela de divs e imagens sem cuidado numa página acessível. Depois, escolha o alt certo.',
        },
      ],
      exerciseIds: ['lab-html-orders-table', 'tables-01-alt'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: o clique no lugar errado',
      blocks: [
        {
          type: 'code',
          language: 'html',
          caption:
            'Ao abrir a página no celular, as pessoas clicam em "Comprar" e acertam o link de baixo',
          code: `<img src="banner.jpg" alt="Promoção de outubro" style="width: 100%" />
<a href="/comprar">Comprar</a>
<a href="/termos">Termos da promoção</a>`,
        },
      ],
      exerciseIds: ['tables-01-shift'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'O NgOptimizedImage do Angular exige width e height (ou fill) justamente para evitar o deslocamento (lição de carregamento).',
            'Tabelas administrativas com ordenação usam aria-sort no th da coluna ordenada para anunciar a ordem.',
            'O deslocamento de layout entra no CLS, uma das Core Web Vitals.',
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
      exerciseIds: ['tables-01-when', 'tables-01-decorative', 'tables-01-srcset'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Tabela para dados; caption, th e scope dão as relações.',
            'alt informativo descreve o que importa; decorativo é alt="".',
            'width e height reservam espaço; sem eles, a página pula.',
            'srcset e sizes deixam o navegador escolher o arquivo.',
            'figcaption é legenda visível; não substitui o alt.',
          ],
        },
      ],
    },
  ],
};
