import { Exercise } from '../../app/core/models/content.models';

export const ARCH_STATE_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-js-url-filters',
    kind: 'code',
    language: 'javascript',
    title: 'Filtros na URL, ida e volta',
    difficulty: 'advanced',
    conceptIds: ['arch-state'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Uma lista tem três filtros: busca (texto, padrão ""), pagina (número inteiro a partir de 1, padrão 1) e ordem ("nome" ou "preco", padrão "nome"). Escreva paraQuery(filtros), que gera a query string, e daQuery(texto), que lê de volta, sempre com valores válidos.',
      },
    ],
    requirements: [
      'paraQuery omite os valores padrão: paraQuery({ busca: "", pagina: 1, ordem: "nome" }) devolve "".',
      'paraQuery gera os outros na ordem busca, pagina, ordem, com o texto codificado (use URLSearchParams).',
      'daQuery aceita o texto com ou sem "?" no início.',
      'daQuery devolve os padrões para parâmetros ausentes ou inválidos: pagina não inteira ou menor que 1, ordem fora das duas opções.',
      'Ida e volta preservam os filtros: daQuery(paraQuery(f)) é igual a f para filtros válidos.',
    ],
    examples: [
      {
        input: "paraQuery({ busca: 'café', pagina: 2, ordem: 'nome' })",
        output: "'busca=caf%C3%A9&pagina=2'",
      },
      {
        input: "daQuery('?pagina=abc&ordem=preco')",
        output: "{ busca: '', pagina: 1, ordem: 'preco' }",
      },
    ],
    starterCode: `function paraQuery(filtros) {
  // Seu código aqui
}

function daQuery(texto) {
  // Seu código aqui
}

console.log(paraQuery({ busca: 'café', pagina: 2, ordem: 'nome' }));
`,
    tests: [
      {
        id: 'defaults-omitted',
        description: 'Valores padrão não aparecem na URL',
        source: "expect(paraQuery({ busca: '', pagina: 1, ordem: 'nome' })).toBe('');",
      },
      {
        id: 'encode',
        description: 'Gera busca, pagina e ordem nessa ordem, com o texto codificado',
        source:
          "expect(paraQuery({ busca: 'café com leite', pagina: 3, ordem: 'preco' })).toBe('busca=caf%C3%A9+com+leite&pagina=3&ordem=preco');",
      },
      {
        id: 'parse',
        description: 'Lê a query, com ou sem "?"',
        source:
          "expect(daQuery('?busca=p%C3%A3o&pagina=2&ordem=preco')).toEqual({ busca: 'pão', pagina: 2, ordem: 'preco' }); expect(daQuery('pagina=4')).toEqual({ busca: '', pagina: 4, ordem: 'nome' });",
      },
      {
        id: 'empty',
        description: 'Query vazia devolve os padrões',
        source: "expect(daQuery('')).toEqual({ busca: '', pagina: 1, ordem: 'nome' });",
      },
      {
        id: 'invalid',
        description: 'Valores inválidos voltam ao padrão',
        source:
          "expect(daQuery('pagina=abc&ordem=data')).toEqual({ busca: '', pagina: 1, ordem: 'nome' }); expect(daQuery('pagina=0')).toEqual({ busca: '', pagina: 1, ordem: 'nome' }); expect(daQuery('pagina=2.5')).toEqual({ busca: '', pagina: 1, ordem: 'nome' });",
      },
      {
        id: 'round-trip',
        description: 'Ida e volta preservam os filtros',
        source:
          "for (const f of [{ busca: 'a&b=c', pagina: 7, ordem: 'preco' }, { busca: '', pagina: 1, ordem: 'nome' }, { busca: '100%', pagina: 1, ordem: 'nome' }]) expect(daQuery(paraQuery(f))).toEqual(f);",
      },
    ],
    hints: [
      'new URLSearchParams() e .set(nome, valor) só para os valores diferentes do padrão; .toString() gera o texto.',
      'new URLSearchParams(texto) já ignora o "?" inicial.',
      'Number.isInteger(Number(valor)) && Number(valor) >= 1 valida a página.',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `const PADRAO = { busca: '', pagina: 1, ordem: 'nome' };
const ORDENS = ['nome', 'preco'];

function paraQuery(filtros) {
  const params = new URLSearchParams();
  for (const chave of ['busca', 'pagina', 'ordem']) {
    if (filtros[chave] !== PADRAO[chave]) params.set(chave, String(filtros[chave]));
  }
  return params.toString(); // codifica acentos, espaços, & e =
}

function daQuery(texto) {
  const params = new URLSearchParams(texto); // ignora o "?" inicial
  const pagina = Number(params.get('pagina'));
  const ordem = params.get('ordem');
  return {
    busca: params.get('busca') ?? PADRAO.busca,
    pagina: Number.isInteger(pagina) && pagina >= 1 ? pagina : PADRAO.pagina,
    ordem: ORDENS.includes(ordem) ? ordem : PADRAO.ordem,
  };
}`,
      },
      {
        type: 'paragraph',
        text: 'A URL é uma entrada que qualquer pessoa pode editar: daQuery nunca confia nela, sempre valida e cai no padrão. Omitir os padrões mantém os links curtos. No Angular, o Router faz a codificação, mas a validação dos valores continua sendo sua.',
      },
    ],
  },
  {
    id: 'arch-state-01-classify',
    kind: 'multiple-choice',
    title: 'Cada estado no seu lugar',
    difficulty: 'advanced',
    conceptIds: ['arch-state'],
    prompt: [{ type: 'paragraph', text: 'Qual classificação está correta?' }],
    options: [
      {
        id: 'right',
        text: 'Aba selecionada nos detalhes de um pedido: URL. Dropdown aberto: signal no componente. Usuário logado: service compartilhado. Tema: persistido.',
        explanation:
          'Correto. A aba deve sobreviver ao link compartilhado; o dropdown não interessa a mais ninguém; o usuário é usado em toda a aplicação; o tema deve sobreviver a fechar o navegador.',
      },
      {
        id: 'all-global',
        text: 'Tudo num store global, para ficar em um lugar só.',
        explanation:
          'Incorreto. Estado local em lugar global cria dependências desnecessárias e torna os componentes mais difíceis de reutilizar e testar.',
      },
      {
        id: 'dropdown-url',
        text: 'Dropdown aberto: URL, para o botão voltar fechar o menu.',
        explanation:
          'Incorreto na maioria dos casos: encheria o histórico de entradas. A URL é para o que vale compartilhar ou recarregar.',
      },
      {
        id: 'user-localstorage',
        text: 'Usuário logado com token: localStorage, lido direto pelos componentes.',
        explanation:
          'Incorreto. Token em localStorage fica exposto a XSS (lição de sessão), e componentes não acessam armazenamento direto.',
      },
    ],
    correctOptionIds: ['right'],
    hints: ['Para cada estado: quem precisa dele, e ele deve sobreviver a quê?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Pergunte: quem usa? Deve sobreviver a recarregar, a compartilhar, a fechar o navegador?',
      },
    ],
  },
  {
    id: 'arch-state-01-duplicated',
    kind: 'multiple-choice',
    title: 'O total que não bate',
    difficulty: 'advanced',
    conceptIds: ['arch-derived-state'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Na etapa de depuração, qual é a correção que evita essa família de bugs?',
      },
    ],
    options: [
      {
        id: 'computed',
        text: 'Trocar o signal total por computed(() => this.itens().reduce((s, i) => s + i.preco, 0)).',
        explanation:
          'Correto. O total passa a ser derivado da única fonte de verdade: nenhum método novo (limpar, alterar quantidade) consegue esquecer de atualizá-lo.',
      },
      {
        id: 'fix-remove',
        text: 'Atualizar o total em remover também.',
        explanation:
          'Corrige este caso, mas o próximo método que mexer nos itens pode esquecer de novo. A causa é a duplicação.',
      },
      {
        id: 'effect',
        text: 'Um effect que copia o total calculado para o signal total sempre que itens mudar.',
        explanation:
          'Funciona, mas é um computed disfarçado, com um momento em que os dois discordam e mais código para manter.',
      },
      {
        id: 'recalc-template',
        text: 'Calcular o total no template com um método chamado a cada verificação.',
        explanation:
          'Funciona, mas recalcula sem memoização e põe lógica no template; computed faz o mesmo melhor.',
      },
    ],
    correctOptionIds: ['computed'],
    hints: ['O total precisa ser guardado, ou pode ser calculado?'],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `readonly total = computed(() => this.itens().reduce((s, i) => s + i.preco, 0));`,
      },
    ],
  },
  {
    id: 'arch-state-01-url',
    kind: 'multiple-choice',
    title: 'O filtro que some',
    difficulty: 'advanced',
    conceptIds: ['arch-state'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Numa tela de pedidos, a pessoa filtra por "pendentes", abre um pedido e clica em voltar no navegador. O filtro sumiu. O filtro está num signal do componente. Qual é a melhor correção?',
      },
    ],
    options: [
      {
        id: 'url',
        text: 'Guardar o filtro na URL (?status=pendente): voltar, recarregar e compartilhar o link restauram a mesma tela.',
        explanation:
          'Correto. Quando o componente é destruído na navegação, o signal local vai junto. A URL é o estado que o navegador já sabe guardar e restaurar.',
      },
      {
        id: 'service',
        text: 'Mover o filtro para um service singleton.',
        explanation:
          'Resolve o voltar, mas não o recarregar nem o link compartilhado, e o filtro passa a aparecer em outras visitas à tela, sem a pessoa ter pedido.',
      },
      {
        id: 'localstorage',
        text: 'Salvar o filtro no localStorage.',
        explanation: 'Mesmos problemas do service, e ainda vaza entre abas.',
      },
      {
        id: 'keep-alive',
        text: 'Impedir que o componente seja destruído.',
        explanation:
          'Incorreto. Mantém memória e listeners vivos e não resolve recarregar nem compartilhar.',
      },
    ],
    correctOptionIds: ['url'],
    hints: ['Qual lugar sobrevive a voltar, recarregar e mandar o link?'],
    solution: [{ type: 'paragraph', text: 'Filtros, página, ordenação e abas: URL.' }],
  },
  {
    id: 'arch-state-01-effect',
    kind: 'multiple-choice',
    title: 'O effect que copia',
    difficulty: 'advanced',
    conceptIds: ['arch-derived-state'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Um componente tem effect(() => this.filtrados.set(this.produtos().filter((p) => p.ativo))). O que isso indica?',
      },
    ],
    options: [
      {
        id: 'derived',
        text: 'Estado duplicado: filtrados deveria ser computed(() => this.produtos().filter((p) => p.ativo)).',
        explanation:
          'Correto. Um effect que escreve num signal a partir de outros signals é a definição de um valor derivado, feito do jeito mais frágil. A documentação do Angular recomenda computed para isso.',
      },
      {
        id: 'fine',
        text: 'Nada: é o uso típico de effect.',
        explanation:
          'Incorreto. effect é para sincronizar com o mundo de fora (DOM manual, armazenamento, logs), não entre signals.',
      },
      {
        id: 'rxjs',
        text: 'Que deveria ser um Observable com map.',
        explanation: 'Troca um problema por outro; o valor é síncrono e derivado.',
      },
      {
        id: 'perf',
        text: 'Só um problema de desempenho.',
        explanation: 'O problema maior é a duplicação: dois signals que podem discordar.',
      },
    ],
    correctOptionIds: ['derived'],
    hints: ['filtrados pode ser calculado a partir de produtos?'],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `readonly filtrados = computed(() => this.produtos().filter((p) => p.ativo));`,
      },
    ],
  },
  {
    id: 'arch-state-01-lift',
    kind: 'multiple-choice',
    title: 'Quando subir o estado',
    difficulty: 'advanced',
    conceptIds: ['arch-state'],
    prompt: [
      {
        type: 'paragraph',
        text: 'A contagem de notificações não lidas começou num componente do cabeçalho. Agora a página de notificações também precisa dela, e marca itens como lidos. O que fazer?',
      },
    ],
    options: [
      {
        id: 'service',
        text: 'Mover o estado para um service com signals, dono das notificações; cabeçalho e página leem dele, e a contagem é um computed.',
        explanation:
          'Correto. Agora há dois consumidores e uma ação que muda o estado: é o momento de subir, e não antes.',
      },
      {
        id: 'copy',
        text: 'Cada componente busca as notificações e mantém a própria contagem.',
        explanation:
          'Incorreto. Duas fontes de verdade: marcar como lido na página não atualiza o cabeçalho.',
      },
      {
        id: 'output',
        text: 'A página emite um output até o cabeçalho, passando pelo componente raiz.',
        explanation:
          'Funciona, mas acopla componentes distantes por uma cadeia frágil de inputs e outputs.',
      },
      {
        id: 'store',
        text: 'Instalar uma biblioteca de store global.',
        explanation: 'Exagero para um estado com um dono claro; um service com signals resolve.',
      },
    ],
    correctOptionIds: ['service'],
    hints: ['Quantos lugares leem e quantos alteram o estado agora?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Suba o estado quando houver mais de um consumidor, e só até o ponto comum mais próximo.',
      },
    ],
  },
];
