import { Lesson } from '../../app/core/models/content.models';

/** Executed in `src/content/closures-examples.spec.ts`; every value in the comments is asserted. */
export const URL_PARTS_JS = `const url = new URL('https://loja.com:443/produtos/cafe?busca=caf%C3%A9&p=2#avaliacoes');

console.log(url.protocol, url.hostname, url.pathname); // https: loja.com /produtos/cafe
console.log(url.search, url.hash);                     // ?busca=caf%C3%A9&p=2 #avaliacoes
console.log(url.searchParams.get('busca'));            // café (já decodificado)
console.log(url.origin);                               // https://loja.com (a porta 443 é a padrão)`;

export const RELATIVE_JS = `const pagina = 'https://loja.com/produtos/cafe/';

console.log(new URL('torrado', pagina).href);             // https://loja.com/produtos/cafe/torrado
console.log(new URL('../cha', pagina).href);              // https://loja.com/produtos/cha
console.log(new URL('/conta', pagina).href);              // https://loja.com/conta
console.log(new URL('//cdn.loja.com/a.js', pagina).href); // https://cdn.loja.com/a.js
console.log(new URL('?ordem=preco', pagina).href);        // https://loja.com/produtos/cafe/?ordem=preco
console.log(new URL('torrado', 'https://loja.com/produtos/cafe').href); // https://loja.com/produtos/torrado`;

export const ORIGIN_JS = `const origem = (endereco) => new URL(endereco).origin;

console.log(origem('https://loja.com/a') === origem('https://loja.com:443/b')); // true
console.log(origem('http://loja.com') === origem('https://loja.com'));          // false: esquema
console.log(origem('https://www.loja.com') === origem('https://loja.com'));     // false: host
console.log(origem('https://loja.com:8443') === origem('https://loja.com'));    // false: porta`;

export const WEB_URL_01: Lesson = {
  id: 'web-url-01',
  moduleId: 'web-urls-origins',
  title: 'URLs e origens: o que o endereço decide',
  summary:
    'As partes de uma URL, como links relativos são resolvidos, o que chega ao servidor e por que a origem (esquema, host e porta) é a fronteira de segurança do navegador.',
  estimatedMinutes: 30,
  difficulty: 'introductory',
  conceptIds: ['web-urls', 'web-origin'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Uma barra a mais no fim de um endereço muda para onde um link relativo aponta. Um # muda o que chega ao servidor. Trocar http por https, ou acrescentar www, cria outra origem, com outros cookies, outro localStorage e outras regras de CORS. Quase todo bug de "funciona aqui e não ali" envolvendo links, cookies ou APIs passa por entender URLs e origens.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Ler as partes de uma URL e manipulá-las com a API URL.',
            'Prever como um link relativo é resolvido.',
            'Saber o que vai ao servidor e o que fica no navegador.',
            'Identificar a origem e entender por que ela importa.',
            'Acompanhar a jornada de uma navegação no painel de rede.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'O endereço de correspondência',
      blocks: [
        {
          type: 'paragraph',
          text: 'Uma URL é um endereço completo: o meio de entrega (https), o prédio (host e porta), o apartamento (caminho), um bilhete para o porteiro (query) e um post-it que você mesmo guarda para lembrar em que página parou (o fragmento, depois do #, que nunca sai do seu bolso). A origem é o prédio: moradores do mesmo prédio compartilham a portaria; os de outro prédio, não.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Partes, resolução e origem',
      blocks: [
        {
          type: 'table',
          caption: 'As partes de https://loja.com:443/produtos/cafe?busca=caf%C3%A9#avaliacoes',
          headers: ['Parte', 'Valor', 'Vai ao servidor?'],
          rows: [
            ['Esquema', 'https:', 'Define o protocolo'],
            ['Host', 'loja.com', 'Sim'],
            ['Porta', '443 (padrão do https, por isso omitida)', 'Sim'],
            ['Caminho', '/produtos/cafe', 'Sim'],
            ['Query', '?busca=caf%C3%A9', 'Sim'],
            ['Fragmento', '#avaliacoes', 'Não: fica no navegador'],
          ],
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Medido num Chromium com um servidor local que registra cada pedido: ao abrir /pagina?busca=caf%C3%A9#avaliacoes, o servidor recebeu /pagina?busca=caf%C3%A9, sem o fragmento. (E recebeu também um pedido automático de /favicon.ico.)',
            'Caracteres especiais vão codificados: "café com leite & pão" vira busca=caf%C3%A9+com+leite+%26+p%C3%A3o com URLSearchParams. Monte URLs com a API, nunca concatenando texto.',
            'Links relativos são resolvidos a partir da URL da página. A barra final importa: a partir de /produtos/cafe/, "torrado" vira /produtos/cafe/torrado; a partir de /produtos/cafe, vira /produtos/torrado.',
            '"/conta" começa na raiz; "//cdn.loja.com/a.js" mantém só o esquema; "?ordem=preco" troca a query; "#topo" só troca o fragmento.',
            'A origem é esquema + host + porta. Mesma origem: compartilham cookies (com regras próprias), localStorage, e podem ler respostas uma da outra. Origens diferentes dependem de CORS (lição de sessões e CORS).',
            'http e https, www e sem www, e portas diferentes são origens diferentes. Endereços como mailto: têm origem "null".',
            'A jornada de uma navegação: resolver o nome (DNS), conectar (TCP e TLS), enviar o pedido, receber a resposta, montar o DOM, carregar o resto. A Navigation Timing API mede cada fase: no servidor local, a resposta começou em 32 ms e o DOM estava interativo em 62 ms.',
          ],
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: a API URL',
      blocks: [
        { type: 'code', language: 'javascript', caption: 'partes.js', code: URL_PARTS_JS },
        { type: 'code', language: 'javascript', caption: 'relativos.js', code: RELATIVE_JS },
        { type: 'code', language: 'javascript', caption: 'origens.js', code: ORIGIN_JS },
        {
          type: 'callout',
          tone: 'info',
          title: 'Este código é executado',
          text: 'Os testes da plataforma executam os três exemplos e conferem cada valor dos comentários.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Investigue no navegador',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Abra a aba Network, navegue para uma página com # no endereço e veja a URL do pedido do documento.',
            'Clique no pedido do documento e abra a aba Timing: identifique DNS, conexão, espera e download.',
            'No console, rode performance.getEntriesByType("navigation")[0] e compare com a aba Timing.',
            'Rode new URL("../a", location.href).href em páginas com e sem barra no fim do endereço.',
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
          text: 'No laboratório, classifique links a partir da página atual: mesma página, interno, externo, bloqueado ou outro. Depois, resolva um link relativo.',
        },
      ],
      exerciseIds: ['lab-js-classify-link', 'url-01-relative'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: as imagens que somem em algumas páginas',
      blocks: [
        {
          type: 'paragraph',
          text: 'As imagens aparecem em /produtos/ mas quebram em /produtos/cafe/torrado. O HTML usa <img src="img/cafe.png">, e as imagens ficam em /img/.',
        },
      ],
      exerciseIds: ['url-01-broken-images'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'O Angular usa <base href="/"> no index.html para resolver os caminhos dos arquivos a partir da raiz, em qualquer rota.',
            'O estado em query params (lição de estado) vai ao servidor e aparece em logs: nada de dados sensíveis na URL.',
            'Rodar o frontend em localhost:4200 e a API em localhost:8080 já são origens diferentes: por isso o CORS (ou um proxy) aparece no desenvolvimento.',
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
      exerciseIds: ['url-01-hash', 'url-01-origin', 'url-01-encode'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Esquema, host, porta, caminho, query, fragmento.',
            'O fragmento não vai ao servidor.',
            'Relativos dependem da URL atual, inclusive da barra final.',
            'Origem = esquema + host + porta.',
            'Monte URLs com URL e URLSearchParams.',
          ],
        },
      ],
    },
  ],
};
