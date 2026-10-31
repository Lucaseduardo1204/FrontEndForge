import { Exercise } from '../../app/core/models/content.models';

export const WEB_URL_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-js-classify-link',
    kind: 'code',
    language: 'javascript',
    title: 'Para onde vai este link?',
    difficulty: 'introductory',
    conceptIds: ['web-urls', 'web-origin'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Escreva classificarLink(href, paginaAtual): href é o valor de um atributo href (pode ser relativo) e paginaAtual é a URL completa da página. Use a API URL.',
      },
    ],
    requirements: [
      '"bloqueado" para esquema javascript: (em qualquer combinação de maiúsculas e minúsculas).',
      '"outro" para esquemas que não são http: nem https: (como mailto: e tel:).',
      '"mesma-pagina" quando o destino é a mesma URL, mudando no máximo o fragmento.',
      '"interno" quando o destino tem a mesma origem da página.',
      '"externo" quando o destino é http(s) de outra origem.',
      '"invalido" quando não for possível montar a URL.',
    ],
    examples: [
      {
        input: "classificarLink('#avaliacoes', 'https://loja.com/produtos/cafe')",
        output: "'mesma-pagina'",
      },
      {
        input: "classificarLink('../conta', 'https://loja.com/produtos/cafe')",
        output: "'interno'",
      },
      {
        input: "classificarLink('http://loja.com/', 'https://loja.com/')",
        output: "'externo' (outro esquema, outra origem)",
      },
    ],
    starterCode: `function classificarLink(href, paginaAtual) {
  // Seu código aqui
}

console.log(classificarLink('#avaliacoes', 'https://loja.com/produtos/cafe'));
`,
    tests: [
      {
        id: 'same-page',
        description: 'Só fragmento, ou a mesma URL: mesma-pagina',
        source:
          "const p = 'https://loja.com/produtos/cafe?cor=preto'; expect(classificarLink('#avaliacoes', p)).toBe('mesma-pagina'); expect(classificarLink('https://loja.com/produtos/cafe?cor=preto#topo', p)).toBe('mesma-pagina'); expect(classificarLink('', p)).toBe('mesma-pagina');",
      },
      {
        id: 'internal',
        description: 'Relativos e absolutos da mesma origem: interno',
        source:
          "const p = 'https://loja.com/produtos/cafe'; for (const h of ['../conta', '/conta', 'torrado', '?cor=branco', 'https://loja.com:443/x']) expect(classificarLink(h, p)).toBe('interno');",
      },
      {
        id: 'external',
        description: 'Outro host, outra porta ou outro esquema http(s): externo',
        source:
          "const p = 'https://loja.com/'; for (const h of ['https://www.loja.com/', 'http://loja.com/', 'https://loja.com:8443/', '//cdn.exemplo.com/a.js']) expect(classificarLink(h, p)).toBe('externo');",
      },
      {
        id: 'blocked',
        description: 'javascript: é bloqueado, sem diferenciar caixa',
        source:
          "const p = 'https://loja.com/'; expect(classificarLink('javascript:alert(1)', p)).toBe('bloqueado'); expect(classificarLink('JavaScript:void(0)', p)).toBe('bloqueado');",
      },
      {
        id: 'other',
        description: 'mailto: e tel: são outro',
        source:
          "const p = 'https://loja.com/'; expect(classificarLink('mailto:contato@loja.com', p)).toBe('outro'); expect(classificarLink('tel:+5511999999999', p)).toBe('outro');",
      },
      {
        id: 'invalid',
        description: 'Endereço impossível de montar: invalido',
        source:
          "expect(classificarLink('https://', 'https://loja.com/')).toBe('invalido'); expect(classificarLink('x', 'não é url')).toBe('invalido');",
      },
    ],
    hints: [
      'new URL(href, paginaAtual) resolve relativos e lança erro quando não consegue: use try/catch.',
      'protocol já vem em minúsculas: "javascript:".',
      'Para "mesma página", compare as duas URLs sem o hash (url.hash = "").',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `function classificarLink(href, paginaAtual) {
  let destino;
  let atual;
  try {
    atual = new URL(paginaAtual);
    destino = new URL(href, atual); // resolve relativos a partir da página
  } catch {
    return 'invalido';
  }

  if (destino.protocol === 'javascript:') return 'bloqueado'; // protocol vem em minúsculas
  if (destino.protocol !== 'http:' && destino.protocol !== 'https:') return 'outro';

  const semFragmento = (u) => {
    const copia = new URL(u);
    copia.hash = '';
    return copia.href;
  };
  if (semFragmento(destino) === semFragmento(atual)) return 'mesma-pagina';
  return destino.origin === atual.origin ? 'interno' : 'externo';
}`,
      },
      {
        type: 'paragraph',
        text: 'A API URL faz o trabalho difícil: resolve relativos, normaliza o esquema para minúsculas e remove a porta padrão da origem. Comparar textos de href à mão erraria casos como "JavaScript:", "https://loja.com:443" e "//cdn.exemplo.com".',
      },
    ],
  },
  {
    id: 'url-01-relative',
    kind: 'multiple-choice',
    title: 'Para onde aponta o link?',
    difficulty: 'introductory',
    conceptIds: ['web-urls'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Na página https://loja.com/produtos/cafe (sem barra no fim), um link tem href="torrado". Para onde ele leva?',
      },
    ],
    options: [
      {
        id: 'sibling',
        text: 'https://loja.com/produtos/torrado',
        explanation:
          'Correto. Sem a barra final, "cafe" é tratado como um arquivo dentro de /produtos/, e o relativo substitui o último segmento. Os testes executam este caso.',
      },
      {
        id: 'child',
        text: 'https://loja.com/produtos/cafe/torrado',
        explanation: 'Seria assim se a página fosse /produtos/cafe/, com barra no fim.',
      },
      {
        id: 'root',
        text: 'https://loja.com/torrado',
        explanation: 'Seria assim com href="/torrado", que começa na raiz.',
      },
      {
        id: 'error',
        text: 'Erro: links relativos precisam começar com ./',
        explanation: 'Incorreto. "torrado" e "./torrado" são resolvidos do mesmo jeito.',
      },
    ],
    correctOptionIds: ['sibling'],
    hints: ['O último segmento da página termina com barra?'],
    solution: [
      { type: 'paragraph', text: 'Sem barra final, o relativo substitui o último segmento.' },
    ],
  },
  {
    id: 'url-01-broken-images',
    kind: 'multiple-choice',
    title: 'As imagens que somem',
    difficulty: 'introductory',
    conceptIds: ['web-urls'],
    prompt: [{ type: 'paragraph', text: 'Na etapa de depuração, qual é a causa e a correção?' }],
    options: [
      {
        id: 'root-relative',
        text: 'img/cafe.png é relativo à página: em /produtos/cafe/torrado vira /produtos/cafe/img/cafe.png. Use /img/cafe.png, relativo à raiz.',
        explanation:
          'Correto. Um caminho sem barra inicial depende de onde a página está; com barra inicial, aponta sempre para o mesmo lugar no site.',
      },
      {
        id: 'server',
        text: 'O servidor está bloqueando imagens em páginas internas.',
        explanation:
          'Incorreto. A aba Network mostraria um 404 numa URL que não existe, não um bloqueio.',
      },
      {
        id: 'cache',
        text: 'É cache: limpe o navegador.',
        explanation: 'Incorreto. A URL pedida é que está errada.',
      },
      {
        id: 'absolute-domain',
        text: 'Use sempre https://loja.com/img/cafe.png, com o domínio.',
        explanation:
          'Funciona em produção, mas quebra em outros ambientes (localhost, homologação). /img/cafe.png resolve sem fixar o domínio.',
      },
    ],
    correctOptionIds: ['root-relative'],
    hints: ['Resolva img/cafe.png a partir de cada uma das duas páginas.'],
    solution: [
      { type: 'code', language: 'html', code: `<img src="/img/cafe.png" alt="Café torrado" />` },
    ],
  },
  {
    id: 'url-01-hash',
    kind: 'multiple-choice',
    title: 'O que o servidor recebe?',
    difficulty: 'introductory',
    conceptIds: ['web-urls'],
    prompt: [
      {
        type: 'paragraph',
        text: 'A pessoa abre https://loja.com/pagina?busca=cafe#avaliacoes. Qual caminho chega ao servidor no pedido do documento?',
      },
    ],
    options: [
      {
        id: 'no-hash',
        text: '/pagina?busca=cafe',
        explanation:
          'Correto. Medido num Chromium com um servidor que registra os pedidos: o fragmento não foi enviado. Ele serve para o navegador (rolar até um elemento, rotas com #).',
      },
      {
        id: 'all',
        text: '/pagina?busca=cafe#avaliacoes',
        explanation: 'Incorreto. O navegador não envia o fragmento.',
      },
      {
        id: 'path-only',
        text: '/pagina',
        explanation: 'Incorreto. A query vai ao servidor.',
      },
      {
        id: 'hash-only',
        text: '#avaliacoes',
        explanation: 'Incorreto. É o contrário: o caminho e a query vão; o fragmento fica.',
      },
    ],
    correctOptionIds: ['no-hash'],
    hints: ['Qual parte da URL nunca sai do navegador?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Caminho e query vão ao servidor; o fragmento fica no navegador.',
      },
    ],
  },
  {
    id: 'url-01-origin',
    kind: 'multiple-choice',
    title: 'Mesma origem?',
    difficulty: 'introductory',
    conceptIds: ['web-origin'],
    prompt: [{ type: 'paragraph', text: 'Qual par tem a mesma origem?' }],
    options: [
      {
        id: 'default-port',
        text: 'https://loja.com/a e https://loja.com:443/b',
        explanation:
          'Correto. 443 é a porta padrão do https, então as duas têm a origem https://loja.com. Executado nos testes.',
      },
      {
        id: 'scheme',
        text: 'http://loja.com e https://loja.com',
        explanation: 'Incorreto. Esquemas diferentes, origens diferentes.',
      },
      {
        id: 'www',
        text: 'https://www.loja.com e https://loja.com',
        explanation: 'Incorreto. Hosts diferentes, origens diferentes.',
      },
      {
        id: 'dev',
        text: 'http://localhost:4200 e http://localhost:8080',
        explanation:
          'Incorreto. Portas diferentes, origens diferentes: por isso a API local precisa de CORS ou proxy.',
      },
    ],
    correctOptionIds: ['default-port'],
    hints: ['Origem = esquema + host + porta.'],
    solution: [{ type: 'paragraph', text: 'Só o primeiro par: a porta 443 é a padrão do https.' }],
  },
  {
    id: 'url-01-encode',
    kind: 'multiple-choice',
    title: 'Montando a busca',
    difficulty: 'introductory',
    conceptIds: ['web-urls'],
    prompt: [
      {
        type: 'paragraph',
        text: 'A busca digitada é "café com leite & pão". Qual é a forma certa de montar a URL?',
      },
    ],
    options: [
      {
        id: 'api',
        text: "const u = new URL('/busca', location.origin); u.searchParams.set('q', termo);",
        explanation:
          'Correto. A API codifica tudo: medido, o termo vira q=caf%C3%A9+com+leite+%26+p%C3%A3o. O & codificado não quebra a query em dois parâmetros.',
      },
      {
        id: 'concat',
        text: "'/busca?q=' + termo",
        explanation:
          'Incorreto. O & do texto encerraria o parâmetro: o servidor receberia q="café com leite " e um parâmetro " pão" sem valor.',
      },
      {
        id: 'encodeuri',
        text: "encodeURI('/busca?q=' + termo)",
        explanation:
          'Incorreto. encodeURI não codifica & nem =, porque são válidos numa URL: o problema continua.',
      },
      {
        id: 'replace',
        text: "'/busca?q=' + termo.replaceAll(' ', '+')",
        explanation: 'Trata os espaços, mas não o & nem os acentos.',
      },
    ],
    correctOptionIds: ['api'],
    hints: ['Qual caractere do termo tem significado especial numa query?'],
    solution: [{ type: 'paragraph', text: 'URLs se montam com URL e URLSearchParams.' }],
  },
];
