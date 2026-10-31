import { Exercise } from '../../app/core/models/content.models';

const IMG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='400'><rect width='100%' height='100%' fill='%2334d399'/></svg>";
const ORNAMENTO =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><circle cx='20' cy='20' r='18' fill='%23fbbf24'/></svg>";

export const HTML_TABLES_MEDIA_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-html-orders-table',
    kind: 'code',
    language: 'html',
    title: 'Relatório de pedidos acessível',
    difficulty: 'introductory',
    conceptIds: ['html-tables', 'html-media'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O relatório usa divs no lugar de uma tabela, e as imagens não têm alt nem dimensões. Reescreva o HTML. Os testes verificam a estrutura, não o texto exato.',
      },
    ],
    requirements: [
      'Uma <table> com <caption> não vazia.',
      'Cabeçalhos de coluna em <thead>, com <th scope="col"> para Pedido, Cliente e Total.',
      'Cada linha de dados em <tbody>, com o número do pedido em <th scope="row">.',
      'Os 3 pedidos continuam na tabela.',
      'O ornamento (classe ornamento) é decorativo: alt vazio.',
      'O gráfico (classe grafico) tem alt que descreve o que ele mostra (pelo menos 15 caracteres, sem ser o nome de um arquivo) e está num <figure> com <figcaption>.',
      'Todas as imagens têm width e height.',
    ],
    examples: [],
    starterCode: `<h1>Relatório <img class="ornamento" src="${ORNAMENTO}"></h1>

<div class="tabela">
  <div class="linha cabecalho"><span>Pedido</span><span>Cliente</span><span>Total</span></div>
  <div class="linha"><span>#1042</span><span>Ana Souza</span><span>R$ 59,70</span></div>
  <div class="linha"><span>#1043</span><span>Bruno Lima</span><span>R$ 120,00</span></div>
  <div class="linha"><span>#1044</span><span>Carla Dias</span><span>R$ 35,90</span></div>
</div>

<img class="grafico" src="${IMG}">
<p>Vendas por semana em outubro.</p>
`,
    tests: [
      {
        id: 'caption',
        description: 'Uma tabela com caption não vazia',
        source:
          "const t = document.querySelector('table'); expect(t).toBeTruthy(); const c = t.querySelector('caption'); expect(c && c.textContent.trim().length > 0).toBe(true);",
      },
      {
        id: 'col-headers',
        description: 'thead com três th scope="col"',
        source:
          "const ths = Array.from(document.querySelectorAll('table thead th')); expect(ths.length).toBe(3); expect(ths.every((th) => th.getAttribute('scope') === 'col')).toBe(true); expect(ths.map((th) => th.textContent.trim())).toEqual(['Pedido', 'Cliente', 'Total']);",
      },
      {
        id: 'row-headers',
        description: 'Três linhas no tbody, cada uma com o pedido em th scope="row"',
        source:
          "const linhas = Array.from(document.querySelectorAll('table tbody tr')); expect(linhas.length).toBe(3); expect(linhas.every((tr) => { const th = tr.querySelector('th'); return th && th.getAttribute('scope') === 'row' && th.textContent.trim().startsWith('#'); })).toBe(true); expect(linhas.every((tr) => tr.querySelectorAll('td').length === 2)).toBe(true);",
      },
      {
        id: 'decorative',
        description: 'O ornamento tem alt vazio',
        source:
          "const o = document.querySelector('img.ornamento'); expect(o.hasAttribute('alt')).toBe(true); expect(o.getAttribute('alt')).toBe('');",
      },
      {
        id: 'informative',
        description: 'O gráfico tem alt descritivo e está num figure com figcaption',
        source:
          "const g = document.querySelector('img.grafico'); const alt = (g.getAttribute('alt') || '').trim(); expect(alt.length >= 15).toBe(true); expect(/\\.(png|jpe?g|svg|gif|webp)$/i.test(alt)).toBe(false); const fig = g.closest('figure'); expect(fig).toBeTruthy(); expect(fig.querySelector('figcaption') && fig.querySelector('figcaption').textContent.trim().length > 0).toBe(true);",
      },
      {
        id: 'dimensions',
        description: 'Todas as imagens têm width e height',
        source:
          "expect(Array.from(document.querySelectorAll('img')).every((i) => Number(i.getAttribute('width')) > 0 && Number(i.getAttribute('height')) > 0)).toBe(true);",
      },
    ],
    hints: [
      'A primeira linha da tabela de divs vira o thead; as outras, o tbody.',
      'O número do pedido identifica a linha: é um cabeçalho de linha (th scope="row").',
      'O alt do gráfico responde "o que este gráfico mostra?"; a legenda pode complementar.',
    ],
    solution: [
      {
        type: 'code',
        language: 'html',
        code: `<h1>Relatório <img class="ornamento" src="${ORNAMENTO}" width="40" height="40" alt=""></h1>

<table>
  <caption>Pedidos de outubro</caption>
  <thead>
    <tr><th scope="col">Pedido</th><th scope="col">Cliente</th><th scope="col">Total</th></tr>
  </thead>
  <tbody>
    <tr><th scope="row">#1042</th><td>Ana Souza</td><td>R$ 59,70</td></tr>
    <tr><th scope="row">#1043</th><td>Bruno Lima</td><td>R$ 120,00</td></tr>
    <tr><th scope="row">#1044</th><td>Carla Dias</td><td>R$ 35,90</td></tr>
  </tbody>
</table>

<figure>
  <img class="grafico" src="${IMG}" width="800" height="400"
       alt="Vendas semanais de outubro, com crescimento contínuo da primeira à última semana">
  <figcaption>Vendas por semana em outubro.</figcaption>
</figure>`,
      },
      {
        type: 'paragraph',
        text: 'Com caption, th e scope, um leitor de tela anuncia "Pedido #1043, Total, R$ 120,00" ao navegar pelas células. O ornamento sai da árvore de acessibilidade com alt="", e as dimensões reservam o espaço antes de as imagens chegarem.',
      },
    ],
  },
  {
    id: 'tables-01-alt',
    kind: 'multiple-choice',
    title: 'O alt do gráfico',
    difficulty: 'introductory',
    conceptIds: ['html-media'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Num relatório, um gráfico de barras mostra que as devoluções caíram de 8% para 3% depois da mudança na embalagem. Qual é o melhor alt?',
      },
    ],
    options: [
      {
        id: 'meaning',
        text: 'alt="Devoluções caíram de 8% para 3% depois da mudança na embalagem"',
        explanation:
          'Correto. Quem não vê o gráfico recebe a mesma informação que ele comunica. Se os números detalhados importarem, uma tabela ao lado ou abaixo serve a todos.',
      },
      {
        id: 'appearance',
        text: 'alt="Gráfico de barras azuis e verdes"',
        explanation:
          'Descreve a aparência, não a informação: quem ouve não fica sabendo o resultado.',
      },
      {
        id: 'filename',
        text: 'alt="grafico-devolucoes-final2.png"',
        explanation: 'Incorreto. O nome do arquivo não comunica nada.',
      },
      {
        id: 'empty',
        text: 'alt=""',
        explanation:
          'Incorreto. alt vazio é para imagens decorativas; esta carrega a conclusão do relatório.',
      },
    ],
    correctOptionIds: ['meaning'],
    hints: ['O que você diria a alguém pelo telefone sobre este gráfico?'],
    solution: [{ type: 'paragraph', text: 'O alt diz o que a imagem comunica naquele contexto.' }],
  },
  {
    id: 'tables-01-shift',
    kind: 'multiple-choice',
    title: 'O clique no lugar errado',
    difficulty: 'introductory',
    conceptIds: ['html-media'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Na etapa de depuração, por que as pessoas acertam o link errado, e qual é a correção?',
      },
    ],
    options: [
      {
        id: 'dimensions',
        text: 'Sem width e height, o banner tem altura 0 enquanto carrega; quando chega, empurra os links para baixo. Coloque width e height com as dimensões reais da imagem (e height: auto no CSS).',
        explanation:
          'Correto. Medido com uma imagem lenta: sem os atributos, o texto abaixo pulou 300px quando a imagem chegou; com eles, o espaço já estava reservado e nada se moveu.',
      },
      {
        id: 'lazy',
        text: 'Acrescentar loading="lazy" ao banner.',
        explanation:
          'Adia o carregamento, mas não reserva espaço: o salto continua, só acontece mais tarde. E o banner do topo não deveria ser lazy.',
      },
      {
        id: 'margin',
        text: 'Separar mais os links com margin.',
        explanation:
          'Os dois links continuam se movendo; só fica mais difícil acertar qualquer um.',
      },
      {
        id: 'alt',
        text: 'Mudar o alt do banner.',
        explanation: 'O alt não afeta o tamanho da imagem.',
      },
    ],
    correctOptionIds: ['dimensions'],
    hints: ['Qual é a altura da imagem antes de ela chegar?'],
    solution: [
      {
        type: 'code',
        language: 'html',
        code: `<img src="banner.jpg" width="1200" height="400" alt="Promoção de outubro" style="width: 100%; height: auto" />`,
      },
    ],
  },
  {
    id: 'tables-01-when',
    kind: 'multiple-choice',
    title: 'Tabela ou não?',
    difficulty: 'introductory',
    conceptIds: ['html-tables'],
    prompt: [{ type: 'paragraph', text: 'Em qual caso usar <table>?' }],
    options: [
      {
        id: 'data',
        text: 'Comparação de planos: linhas com recursos, colunas com planos, e cada célula diz se o plano tem o recurso.',
        explanation:
          'Correto. Cada célula só faz sentido com o cabeçalho da linha e o da coluna: é exatamente o que uma tabela expressa.',
      },
      {
        id: 'layout',
        text: 'Colocar a barra lateral ao lado do conteúdo principal.',
        explanation:
          'Incorreto. Isso é layout: CSS Grid ou Flexbox. Uma tabela de layout é anunciada como tabela de dados.',
      },
      {
        id: 'cards',
        text: 'Uma grade de cartões de produto.',
        explanation:
          'Os cartões não têm relação de linha e coluna; é uma lista em grade (ul com CSS Grid).',
      },
      {
        id: 'form',
        text: 'Alinhar rótulos e campos de um formulário.',
        explanation: 'Rótulos e campos se relacionam por label; o alinhamento é CSS.',
      },
    ],
    correctOptionIds: ['data'],
    hints: ['Cada valor depende de um cabeçalho de linha e de um de coluna?'],
    solution: [{ type: 'paragraph', text: 'Tabela para dados tabulares; CSS para layout.' }],
  },
  {
    id: 'tables-01-decorative',
    kind: 'multiple-choice',
    title: 'Sem alt ou alt vazio?',
    difficulty: 'introductory',
    conceptIds: ['html-media'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Qual é a diferença entre um img decorativo sem o atributo alt e um com alt=""?',
      },
    ],
    options: [
      {
        id: 'ignored',
        text: 'Com alt="", a imagem é ignorada por tecnologias assistivas; sem alt, ela continua como imagem sem nome, e leitores de tela costumam anunciar o nome do arquivo.',
        explanation:
          'Correto. Medido na árvore de acessibilidade do Chromium: com alt vazio, a imagem apareceu como ignorada; sem alt, como imagem com nome vazio.',
      },
      {
        id: 'same',
        text: 'Nenhuma: os dois são ignorados.',
        explanation: 'Incorreto. Só o alt vazio sinaliza "decorativa".',
      },
      {
        id: 'invalid',
        text: 'alt="" é inválido; o correto é alt=" ".',
        explanation: 'Incorreto. alt vazio é o valor correto para imagens decorativas.',
      },
      {
        id: 'css',
        text: 'A diferença é só no CSS.',
        explanation: 'Incorreto. A diferença é na acessibilidade.',
      },
    ],
    correctOptionIds: ['ignored'],
    hints: ['O que a ausência de alt sinaliza?'],
    solution: [{ type: 'paragraph', text: 'Decorativa: alt="". Nunca omitir o atributo.' }],
  },
  {
    id: 'tables-01-srcset',
    kind: 'multiple-choice',
    title: 'Qual arquivo o navegador baixa?',
    difficulty: 'introductory',
    conceptIds: ['html-media'],
    prompt: [
      {
        type: 'paragraph',
        text: 'srcset="foto-400.jpg 400w, foto-800.jpg 800w, foto-1600.jpg 1600w" e sizes="100vw". Numa tela de 1200px de largura, sem zoom e com densidade 1, qual arquivo o Chromium escolheu?',
      },
    ],
    options: [
      {
        id: '1600',
        text: 'foto-1600.jpg: a imagem ocupa 1200px, e o de 800w seria pequeno demais.',
        explanation:
          'Correto. Medido no Chromium: em 1200px, ele escolheu o de 1600w; em 400px, o de 400w. O navegador escolhe o menor arquivo que cobre a largura necessária.',
      },
      {
        id: '800',
        text: 'foto-800.jpg: o mais próximo de 1200.',
        explanation:
          'Incorreto. Um arquivo menor que a área ficaria borrado; o navegador pega o seguinte.',
      },
      {
        id: '400',
        text: 'foto-400.jpg: o primeiro da lista.',
        explanation: 'Incorreto. A ordem da lista não decide; a largura necessária decide.',
      },
      {
        id: 'all',
        text: 'Os três, e mostra o melhor.',
        explanation: 'Incorreto. O objetivo do srcset é baixar um só.',
      },
    ],
    correctOptionIds: ['1600'],
    hints: ['Qual é a largura necessária, e qual arquivo a cobre?'],
    solution: [
      {
        type: 'paragraph',
        text: 'O navegador escolhe pela largura que a imagem vai ocupar e pela densidade da tela.',
      },
    ],
  },
];
