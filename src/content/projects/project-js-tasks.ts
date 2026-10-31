import { Project } from '../../app/core/models/content.models';

/** Introductory JavaScript project of phase 3. */
export const PROJECT_JS_TASKS: Project = {
  id: 'project-js-tasks',
  phaseId: 'phase-03-javascript',
  title: 'Aplicação de gerenciamento de tarefas',
  briefing: [
    {
      type: 'paragraph',
      text: 'Você vai construir uma lista de tarefas que funciona de verdade: adicionar, concluir, remover, filtrar e manter os dados ao recarregar a página. Parece simples, e é justamente por isso que é o lugar certo para aprender a separar regras de negócio da interface.',
    },
    {
      type: 'paragraph',
      text: 'O projeto tem duas camadas. A lógica (funções puras que recebem dados e devolvem dados novos) é verificada automaticamente pela plataforma. A interface (DOM, eventos, localStorage) você constrói no seu computador e avalia com o checklist e a rubrica.',
    },
  ],
  problem:
    'Em muitos projetos iniciantes, a lógica fica espalhada nos handlers de eventos e mexe direto no DOM. Fica impossível testar, e qualquer mudança quebra outra coisa.',
  requiredFeatures: [
    'Adicionar uma tarefa pelo formulário (título obrigatório, espaços nas pontas removidos).',
    'Marcar e desmarcar uma tarefa como concluída.',
    'Remover uma tarefa.',
    'Filtrar entre todas, pendentes e concluídas.',
    'Mostrar quantas tarefas estão pendentes.',
    'Manter as tarefas ao recarregar a página (localStorage).',
  ],
  optionalFeatures: [
    'Editar o título de uma tarefa.',
    'Remover todas as concluídas de uma vez (com confirmação).',
    'Reordenar tarefas.',
  ],
  suggestedArchitecture: [
    {
      type: 'list',
      ordered: false,
      items: [
        'tarefas.js: funções puras (adicionarTarefa, alternarConcluida, removerTarefa, filtrarTarefas, contarPendentes). Sem DOM e sem localStorage.',
        'armazenamento.js: carregar e salvar a lista no localStorage, com tratamento de erro.',
        'app.js: estado atual (lista + filtro), uma função render() que desenha a interface a partir do estado e os handlers de eventos.',
        'Fluxo: evento → função pura gera o novo estado → salvar → render().',
      ],
    },
  ],
  constraints: [
    'JavaScript puro, sem bibliotecas.',
    'As funções de tarefas.js não alteram os arrays nem os objetos recebidos: devolvem novos.',
    'Os títulos aparecem na tela com textContent, nunca com innerHTML.',
  ],
  accessibilityRequirements: [
    'O campo de título tem <label>.',
    'Cada tarefa tem um checkbox de verdade (<input type="checkbox">) com rótulo.',
    'Os filtros são botões, com aria-pressed indicando o filtro ativo.',
    'O contador de pendentes é anunciado ao mudar (região aria-live="polite").',
    'Tudo funciona pelo teclado.',
  ],
  securityRequirements: [
    'Títulos são texto digitado pelo usuário: renderizar com innerHTML permite injetar HTML e scripts (XSS). Use textContent ou crie os elementos com document.createElement.',
    'O localStorage é visível e editável por qualquer script da página: nunca guarde nele senha, token ou dado sensível. Para uma lista de tarefas, tudo bem.',
    'Ao ler o localStorage, trate JSON inválido com try/catch: os dados podem ter sido corrompidos ou editados manualmente.',
  ],
  testCases: [
    'Adicione uma tarefa só com espaços: nada deve ser adicionado e uma mensagem deve explicar o motivo.',
    'Adicione o título <img src=x onerror=alert(1)>: ele deve aparecer como texto, e nenhum alerta deve abrir.',
    'Adicione três tarefas, remova a segunda e adicione outra: nenhuma tarefa pode ficar com id repetido.',
    'Conclua uma tarefa, recarregue a página: ela continua concluída.',
    'Apague manualmente o valor salvo no localStorage e coloque um texto inválido: a aplicação deve abrir com lista vazia, sem quebrar.',
    'Use apenas o teclado para adicionar, concluir, filtrar e remover.',
  ],
  steps: [
    {
      id: 'model',
      title: 'Modele os dados',
      guidance: [
        {
          type: 'paragraph',
          text: 'Defina o formato de uma tarefa antes de qualquer tela. A sugestão é { id, titulo, concluida }. Decida como gerar ids únicos. Cuidado com a ideia de usar o tamanho da lista + 1: depois de uma remoção, ela gera ids repetidos.',
        },
      ],
      checklist: [
        { id: 'model-shape', text: 'Defini o formato da tarefa e do estado da aplicação.' },
        {
          id: 'model-ids',
          text: 'Escolhi uma forma de gerar ids que não se repete após remoções.',
        },
      ],
    },
    {
      id: 'logic',
      title: 'Implemente a lógica pura e verifique',
      guidance: [
        {
          type: 'paragraph',
          text: 'Escreva as funções de tarefas.js sem tocar no DOM. Cada uma recebe a lista e devolve uma lista nova. Map, filter e o spread (...) ajudam a não alterar o original. Depois, cole o arquivo na verificação automática.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Por que funções puras?',
          text: 'Porque dá para testá-las sem navegador, e elas sempre produzem o mesmo resultado para a mesma entrada. É o mesmo princípio que o Angular segue com signals e estado derivado.',
        },
      ],
      checklist: [
        { id: 'logic-pure', text: 'As funções não alteram os dados recebidos.' },
        { id: 'logic-validated', text: 'adicionarTarefa recusa títulos vazios com um erro claro.' },
        { id: 'logic-check', text: 'A verificação automática passou.' },
      ],
    },
    {
      id: 'ui',
      title: 'Monte a interface',
      guidance: [
        {
          type: 'paragraph',
          text: 'No HTML: um formulário com label e campo de texto, uma lista <ul> para as tarefas, três botões de filtro e o contador de pendentes. Cada item da lista tem um checkbox com rótulo e um botão de remover com nome acessível (por exemplo, "Remover tarefa Comprar pão").',
        },
      ],
      checklist: [
        { id: 'ui-form', text: 'O formulário tem label e o envio funciona com Enter.' },
        {
          id: 'ui-items',
          text: 'Cada tarefa tem checkbox com rótulo e botão de remover com nome acessível.',
        },
        { id: 'ui-filters', text: 'Os filtros indicam o estado ativo com aria-pressed.' },
      ],
    },
    {
      id: 'events',
      title: 'Ligue eventos e renderize',
      guidance: [
        {
          type: 'paragraph',
          text: 'Crie uma função render() que limpa a lista e a recria a partir do estado. Os handlers não mexem no DOM diretamente: chamam a função pura, atualizam o estado e chamam render(). Para os botões de cada item, considere delegação de eventos (um listener na <ul>).',
        },
        {
          type: 'callout',
          tone: 'security',
          title: 'innerHTML com texto do usuário é XSS',
          text: 'Com item.innerHTML = tarefa.titulo, um título como <img src=x onerror=alert(1)> executa código. Use item.textContent = tarefa.titulo, ou crie os elementos com createElement e atribua textContent. O caso de teste do projeto verifica exatamente isso.',
        },
      ],
      checklist: [
        { id: 'events-render', text: 'A interface é desenhada por uma função a partir do estado.' },
        {
          id: 'events-textcontent',
          text: 'Os títulos são renderizados com textContent (testei o título com <img onerror>).',
        },
        { id: 'events-live', text: 'O contador de pendentes fica numa região aria-live.' },
      ],
    },
    {
      id: 'storage',
      title: 'Persista no localStorage',
      guidance: [
        {
          type: 'paragraph',
          text: 'Salve a lista com JSON.stringify a cada mudança e carregue com JSON.parse ao abrir. Envolva a leitura em try/catch e confira se o resultado é mesmo um array; se não for, comece com uma lista vazia.',
        },
      ],
      checklist: [
        { id: 'storage-save', text: 'As tarefas continuam após recarregar a página.' },
        {
          id: 'storage-invalid',
          text: 'Testei um valor inválido no localStorage e a aplicação não quebrou.',
        },
      ],
    },
  ],
  autoCheck: {
    language: 'javascript',
    instructions: [
      {
        type: 'paragraph',
        text: 'Cole aqui as funções do seu tarefas.js (sem import/export). Os testes rodam num ambiente isolado e verificam o comportamento da lógica. A interface e o localStorage ficam com o checklist e a autoavaliação, porque o laboratório ainda não executa código que manipula o DOM.',
      },
      {
        type: 'list',
        ordered: false,
        items: [
          'adicionarTarefa(tarefas, titulo): nova lista com { id, titulo, concluida: false } no fim; título sem espaços nas pontas; lança um erro para título vazio.',
          'alternarConcluida(tarefas, id): nova lista com a tarefa invertida.',
          'removerTarefa(tarefas, id): nova lista sem a tarefa.',
          "filtrarTarefas(tarefas, filtro): filtro é 'todas', 'pendentes' ou 'concluidas'.",
          'contarPendentes(tarefas): número de tarefas não concluídas.',
        ],
      },
    ],
    starterCode: `function adicionarTarefa(tarefas, titulo) {
  // devolva uma NOVA lista
}

function alternarConcluida(tarefas, id) {}

function removerTarefa(tarefas, id) {}

function filtrarTarefas(tarefas, filtro) {}

function contarPendentes(tarefas) {}
`,
    tests: [
      {
        id: 'add',
        description:
          'adicionarTarefa inclui a tarefa no fim, sem concluir, com o título sem espaços nas pontas',
        source:
          "const lista = adicionarTarefa([], '  Estudar closures  '); expect(lista.length).toBe(1); expect(lista[0].titulo).toBe('Estudar closures'); expect(lista[0].concluida).toBe(false);",
      },
      {
        id: 'add-immutable',
        description: 'adicionarTarefa não altera a lista recebida',
        source:
          "const original = adicionarTarefa([], 'A'); const copia = JSON.stringify(original); const nova = adicionarTarefa(original, 'B'); expect(JSON.stringify(original)).toBe(copia); expect(nova === original).toBe(false); expect(nova.length).toBe(2);",
      },
      {
        id: 'add-empty',
        description: 'adicionarTarefa lança um erro para título vazio ou só com espaços',
        source:
          "expect(() => adicionarTarefa([], '')).toThrow(); expect(() => adicionarTarefa([], '   ')).toThrow();",
      },
      {
        id: 'unique-ids',
        description: 'Os ids continuam únicos depois de remover e adicionar',
        source:
          "let l = adicionarTarefa([], 'A'); l = adicionarTarefa(l, 'B'); l = adicionarTarefa(l, 'C'); l = removerTarefa(l, l[1].id); l = adicionarTarefa(l, 'D'); const ids = l.map((t) => t.id); expect(new Set(ids).size).toBe(ids.length);",
      },
      {
        id: 'toggle',
        description: 'alternarConcluida inverte só a tarefa indicada, sem alterar a original',
        source:
          "let l = adicionarTarefa(adicionarTarefa([], 'A'), 'B'); const antes = JSON.stringify(l); const depois = alternarConcluida(l, l[0].id); expect(JSON.stringify(l)).toBe(antes); expect(depois.map((t) => t.concluida)).toEqual([true, false]); expect(alternarConcluida(depois, l[0].id)[0].concluida).toBe(false);",
      },
      {
        id: 'remove',
        description: 'removerTarefa remove só a tarefa indicada, sem alterar a original',
        source:
          "let l = adicionarTarefa(adicionarTarefa([], 'A'), 'B'); const nova = removerTarefa(l, l[0].id); expect(nova.map((t) => t.titulo)).toEqual(['B']); expect(l.length).toBe(2);",
      },
      {
        id: 'filter',
        description: "filtrarTarefas trata 'todas', 'pendentes' e 'concluidas'",
        source:
          "let l = adicionarTarefa(adicionarTarefa(adicionarTarefa([], 'A'), 'B'), 'C'); l = alternarConcluida(l, l[1].id); expect(filtrarTarefas(l, 'todas').map((t) => t.titulo)).toEqual(['A', 'B', 'C']); expect(filtrarTarefas(l, 'pendentes').map((t) => t.titulo)).toEqual(['A', 'C']); expect(filtrarTarefas(l, 'concluidas').map((t) => t.titulo)).toEqual(['B']);",
      },
      {
        id: 'count',
        description: 'contarPendentes conta só as não concluídas',
        source:
          "let l = adicionarTarefa(adicionarTarefa([], 'A'), 'B'); expect(contarPendentes(l)).toBe(2); expect(contarPendentes(alternarConcluida(l, l[0].id))).toBe(1); expect(contarPendentes([])).toBe(0);",
      },
    ],
  },
  completionCriteria: [
    'A verificação automática da lógica passa em todos os testes.',
    'Todos os itens do checklist das etapas estão marcados (inclui os casos de teste da interface).',
    'A autoavaliação da rubrica está preenchida.',
  ],
  rubric: [
    {
      id: 'functionality',
      title: 'Funcionamento',
      description: 'Todas as funcionalidades obrigatórias funcionam, inclusive após recarregar.',
      levels: [
        {
          score: 1,
          description: 'Alguma funcionalidade obrigatória falha ou se perde ao recarregar.',
        },
        { score: 2, description: 'Tudo funciona no caminho feliz; casos de erro pouco tratados.' },
        {
          score: 3,
          description: 'Tudo funciona, incluindo título vazio e dados inválidos no localStorage.',
        },
      ],
    },
    {
      id: 'organization',
      title: 'Organização do código',
      description: 'Lógica, armazenamento e interface separados.',
      levels: [
        { score: 1, description: 'Lógica misturada com DOM nos handlers de eventos.' },
        {
          score: 2,
          description:
            'Funções puras separadas, mas a interface ainda altera o estado diretamente.',
        },
        {
          score: 3,
          description: 'Fluxo único: evento → função pura → salvar → render(), com nomes claros.',
        },
      ],
    },
    {
      id: 'accessibility',
      title: 'Acessibilidade',
      description: 'Utilizável por teclado e leitor de tela.',
      levels: [
        { score: 1, description: 'Elementos clicáveis que não são botões, ou campos sem rótulo.' },
        { score: 2, description: 'Rótulos e botões corretos; estado dos filtros não anunciado.' },
        {
          score: 3,
          description:
            'aria-pressed nos filtros, contador em aria-live e fluxo completo pelo teclado.',
        },
      ],
    },
    {
      id: 'security',
      title: 'Segurança',
      description: 'Dados do usuário tratados como texto e leitura defensiva do armazenamento.',
      levels: [
        { score: 1, description: 'Títulos renderizados com innerHTML.' },
        {
          score: 2,
          description: 'textContent para títulos; leitura do localStorage sem try/catch.',
        },
        {
          score: 3,
          description:
            'textContent em tudo, leitura defensiva e consigo explicar o ataque de XSS que isso evita.',
        },
      ],
    },
  ],
  nextSteps: [
    'Reescrever a lógica em TypeScript, tipando a tarefa e o filtro (fase 5).',
    'Escrever testes unitários para tarefas.js com Vitest (fase 4).',
    'Reconstruir a aplicação em Angular com signals (fase 6).',
  ],
  competencyIds: ['javascript', 'accessibility', 'security'],
};
