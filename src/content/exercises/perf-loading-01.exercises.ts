import { Exercise } from '../../app/core/models/content.models';

export const PERF_LOADING_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-js-debounce',
    kind: 'code',
    language: 'javascript',
    title: 'Debounce: espere a pessoa terminar de digitar',
    difficulty: 'intermediate',
    conceptIds: ['perf-loading', 'js-closures'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Uma busca que consulta o servidor a cada tecla faz dezenas de requisições inúteis. Implemente debounce(fn, esperaMs): devolve uma nova função que só chama fn depois de esperaMs milissegundos sem novas chamadas, com os argumentos da última chamada.',
      },
    ],
    requirements: [
      'Várias chamadas em sequência rápida resultam em uma única chamada de fn, com os argumentos da última.',
      'fn não é chamada antes de passar esperaMs desde a última chamada.',
      'Chamadas separadas por mais de esperaMs resultam em chamadas separadas.',
      'Todos os argumentos são repassados a fn.',
      'Duas funções criadas por debounce não interferem uma na outra.',
    ],
    examples: [
      {
        input:
          "const buscar = debounce(console.log, 300); buscar('c'); buscar('ca'); buscar('café');",
        output: 'depois de 300 ms sem novas chamadas: café',
      },
    ],
    starterCode: `function debounce(fn, esperaMs) {
  // Versão sem debounce: chama fn na hora, toda vez.
  return (...args) => fn(...args);
}

const buscar = debounce((termo) => console.log('buscando', termo), 300);
buscar('c');
buscar('ca');
buscar('café');
`,
    tests: [
      {
        id: 'burst',
        description: 'Uma sequência rápida vira uma chamada, com os últimos argumentos',
        source:
          'const chamadas = []; const f = debounce((x) => chamadas.push(x), 30); f(1); f(2); f(3); await new Promise((r) => setTimeout(r, 120)); expect(chamadas).toEqual([3]);',
      },
      {
        id: 'waits',
        description: 'Não chama antes do tempo de espera',
        source:
          'const chamadas = []; const f = debounce((x) => chamadas.push(x), 60); f(1); expect(chamadas).toEqual([]); await new Promise((r) => setTimeout(r, 10)); expect(chamadas).toEqual([]); await new Promise((r) => setTimeout(r, 200)); expect(chamadas).toEqual([1]);',
      },
      {
        id: 'restarts',
        description: 'Cada nova chamada reinicia a espera',
        source:
          "const chamadas = []; const f = debounce((x) => chamadas.push(x), 60); f('a'); await new Promise((r) => setTimeout(r, 30)); f('b'); await new Promise((r) => setTimeout(r, 40)); expect(chamadas).toEqual([]); await new Promise((r) => setTimeout(r, 200)); expect(chamadas).toEqual(['b']);",
      },
      {
        id: 'separate',
        description: 'Chamadas bem separadas resultam em chamadas separadas',
        source:
          "const chamadas = []; const f = debounce((x) => chamadas.push(x), 20); f('a'); await new Promise((r) => setTimeout(r, 100)); f('b'); await new Promise((r) => setTimeout(r, 100)); expect(chamadas).toEqual(['a', 'b']);",
      },
      {
        id: 'args',
        description: 'Repassa todos os argumentos',
        source:
          "const chamadas = []; const f = debounce((...a) => chamadas.push(a), 20); f('café', 2, { x: 1 }); await new Promise((r) => setTimeout(r, 100)); expect(chamadas).toEqual([['café', 2, { x: 1 }]]);",
      },
      {
        id: 'independent',
        description: 'Funções diferentes não interferem',
        source:
          "const chamadas = []; const f = debounce((x) => chamadas.push(x), 20); const g = debounce((x) => chamadas.push(x), 20); f('f'); g('g'); await new Promise((r) => setTimeout(r, 100)); expect(chamadas.sort()).toEqual(['f', 'g']);",
      },
    ],
    hints: [
      'Guarde o identificador do temporizador numa variável da closure.',
      'A cada chamada, cancele o temporizador anterior com clearTimeout e agende um novo.',
      'O novo temporizador chama fn(...args) com os argumentos da chamada atual.',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `function debounce(fn, esperaMs) {
  let temporizador; // vive na closure, separado para cada função criada

  return (...args) => {
    clearTimeout(temporizador); // nova chamada: desiste da anterior
    temporizador = setTimeout(() => fn(...args), esperaMs);
  };
}`,
      },
      {
        type: 'paragraph',
        text: 'É a lição de closures aplicada: cada função criada por debounce tem o seu próprio temporizador. Numa busca, isso reduz as requisições de uma por tecla para uma por pausa na digitação.',
      },
    ],
  },
  {
    id: 'perf-01-metrics',
    kind: 'multiple-choice',
    title: 'Qual métrica piorou?',
    difficulty: 'intermediate',
    conceptIds: ['perf-web-vitals'],
    prompt: [
      {
        type: 'paragraph',
        text: 'A página carrega rápido, mas ao clicar em "Filtrar" a tela congela por quase um segundo antes de mostrar a lista filtrada. Qual Core Web Vital reflete esse problema?',
      },
    ],
    options: [
      {
        id: 'inp',
        text: 'INP: o tempo entre a interação e a próxima atualização visual.',
        explanation:
          'Correto. INP mede a resposta a cliques, toques e teclas. Um filtro que bloqueia a thread principal por quase um segundo fica muito acima dos 200 ms considerados bons.',
      },
      {
        id: 'lcp',
        text: 'LCP: o maior elemento demorou a aparecer.',
        explanation: 'Incorreto. LCP é sobre o carregamento inicial, que neste caso está rápido.',
      },
      {
        id: 'cls',
        text: 'CLS: o conteúdo se deslocou.',
        explanation: 'Incorreto. Nada se deslocou; a tela parou de responder.',
      },
      {
        id: 'bundle',
        text: 'Nenhuma: é só o tamanho do bundle.',
        explanation:
          'Incorreto. O bundle já foi carregado; o problema é trabalho demais durante a interação.',
      },
    ],
    correctOptionIds: ['inp'],
    hints: ['A demora acontece no carregamento ou depois de um clique?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Para melhorar o INP: faça menos trabalho por interação (listas com track, OnPush e signals), divida tarefas longas ou mova o cálculo pesado para um Web Worker.',
      },
    ],
  },
  {
    id: 'perf-01-cls',
    kind: 'multiple-choice',
    title: 'O banner que empurra o texto',
    difficulty: 'intermediate',
    conceptIds: ['perf-web-vitals'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Na etapa de depuração, o título desce quando o banner termina de carregar. Qual é a correção?',
      },
    ],
    options: [
      {
        id: 'dimensions',
        text: 'Dar dimensões à imagem (width e height, ou ngSrc com width e height), para o navegador reservar o espaço antes de ela chegar.',
        explanation:
          'Correto. Com as dimensões, o navegador calcula a proporção e reserva a área desde o início; nada se desloca quando a imagem chega. Isso reduz o CLS.',
      },
      {
        id: 'lazy',
        text: 'Adicionar loading="lazy" ao banner.',
        explanation:
          'Incorreto. A imagem chegaria ainda mais tarde, e sem dimensões continuaria empurrando o texto. Para o banner do topo, lazy também piora o LCP.',
      },
      {
        id: 'hide',
        text: 'Esconder o título até a imagem carregar.',
        explanation: 'Incorreto. Atrasa o conteúdo mais importante para esconder o sintoma.',
      },
      {
        id: 'smaller',
        text: 'Comprimir a imagem.',
        explanation:
          'Ajuda o tempo de carregamento, mas o deslocamento continua: ele acontece por falta de espaço reservado, não pelo peso.',
      },
    ],
    correctOptionIds: ['dimensions'],
    hints: ['O que o navegador precisa saber para reservar o espaço da imagem?'],
    solution: [
      {
        type: 'code',
        language: 'html',
        code: `<img ngSrc="/banner-promocao.jpg" width="1200" height="400" priority alt="Promoção de café">`,
      },
    ],
  },
  {
    id: 'perf-01-defer',
    kind: 'multiple-choice',
    title: 'O que @defer (on viewport) faz?',
    difficulty: 'intermediate',
    conceptIds: ['perf-loading'],
    prompt: [
      {
        type: 'paragraph',
        text: 'No painel do exemplo, o gráfico está em @defer (on viewport) com um @placeholder. O que acontece quando a página abre?',
      },
    ],
    options: [
      {
        id: 'placeholder-then-load',
        text: 'Aparece o placeholder; o código do gráfico, que fica num chunk separado, só é baixado quando a área entra na tela, e então o gráfico substitui o placeholder.',
        explanation:
          'Correto. O componente e as dependências usadas só por ele saem do bundle inicial. Quem nunca rola até o gráfico nunca baixa esse código.',
      },
      {
        id: 'hidden',
        text: 'O gráfico é carregado junto com a página, mas fica escondido até a área entrar na tela.',
        explanation:
          'Incorreto. Isso seria só esconder com CSS: o custo de download continuaria no início.',
      },
      {
        id: 'never',
        text: 'O gráfico nunca carrega sem um clique.',
        explanation:
          'Incorreto. Isso seria on interaction. on viewport dispara quando a área fica visível.',
      },
      {
        id: 'server',
        text: 'O gráfico é desenhado no servidor.',
        explanation:
          '@defer é sobre quando carregar o código no navegador, não sobre onde renderizar.',
      },
    ],
    correctOptionIds: ['placeholder-then-load'],
    hints: ['O que fica no bundle inicial e o que vai para um chunk separado?'],
    solution: [
      {
        type: 'paragraph',
        text: '@defer é lazy loading dentro de uma tela, com gatilhos como on viewport, on interaction e on idle.',
      },
    ],
  },
  {
    id: 'perf-01-priority',
    kind: 'multiple-choice',
    title: 'Qual imagem leva priority?',
    difficulty: 'intermediate',
    conceptIds: ['perf-web-vitals', 'perf-loading'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Uma página de produto tem uma foto grande no topo e 20 fotos pequenas mais abaixo, todas com ngSrc. Onde usar priority?',
      },
    ],
    options: [
      {
        id: 'hero',
        text: 'Só na foto grande do topo, que provavelmente é o elemento do LCP.',
        explanation:
          'Correto. priority faz essa imagem carregar cedo e com prioridade alta (loading="eager", fetchpriority="high"); as outras ficam preguiçosas e não disputam a rede no início.',
      },
      {
        id: 'all',
        text: 'Em todas, para tudo carregar rápido.',
        explanation:
          'Incorreto. Se tudo é prioridade, nada é: as 21 imagens disputam a rede e a principal demora mais.',
      },
      {
        id: 'none',
        text: 'Em nenhuma; o navegador decide sozinho.',
        explanation:
          'Incorreto aqui. Sem priority, ngSrc carrega de forma preguiçosa, o que atrasa justamente a imagem do topo.',
      },
      {
        id: 'small',
        text: 'Nas pequenas, que são a maioria.',
        explanation:
          'Incorreto. Elas estão abaixo da dobra; carregar cedo só atrapalha a principal.',
      },
    ],
    correctOptionIds: ['hero'],
    hints: ['Qual imagem a pessoa vê primeiro?'],
    solution: [
      {
        type: 'code',
        language: 'html',
        code: `<img ngSrc="/produto.jpg" width="800" height="600" priority alt="…" />`,
      },
    ],
  },
  {
    id: 'perf-01-measure',
    kind: 'order-steps',
    title: 'O ciclo de otimização',
    difficulty: 'intermediate',
    conceptIds: ['perf-web-vitals'],
    prompt: [{ type: 'paragraph', text: 'Ordene o ciclo de otimização de performance.' }],
    items: [
      {
        id: 'measure',
        text: 'Medir a situação atual (Lighthouse, dados reais, tamanho do bundle)',
        why: 'Sem medida inicial não dá para saber se a mudança ajudou.',
      },
      {
        id: 'find',
        text: 'Identificar o maior custo (o elemento do LCP, o maior chunk, a interação mais lenta)',
        why: 'Atacar o maior problema primeiro rende mais do que micro-otimizações.',
      },
      {
        id: 'change',
        text: 'Fazer uma mudança de cada vez',
        why: 'Várias mudanças juntas impedem saber qual ajudou ou atrapalhou.',
      },
      {
        id: 'remeasure',
        text: 'Medir de novo, nas mesmas condições',
        why: 'Confirma o ganho real, e não a impressão.',
      },
      {
        id: 'guard',
        text: 'Proteger o ganho com orçamento ou verificação na integração contínua',
        why: 'Sem isso, o problema volta na próxima dependência adicionada.',
      },
    ],
    explanation:
      'Medir, atacar o maior custo, mudar uma coisa, medir de novo e proteger. Otimizar sem medir é chute.',
    hints: ['O que vem antes de qualquer mudança?'],
    solution: [
      {
        type: 'list',
        ordered: true,
        items: ['Medir', 'Identificar o maior custo', 'Uma mudança', 'Medir de novo', 'Proteger'],
      },
    ],
  },
];
