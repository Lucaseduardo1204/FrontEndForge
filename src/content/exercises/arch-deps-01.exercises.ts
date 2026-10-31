import { Exercise } from '../../app/core/models/content.models';

export const ARCH_DEPS_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-js-dependency-rules',
    kind: 'code',
    language: 'javascript',
    title: 'O teste de arquitetura',
    difficulty: 'advanced',
    conceptIds: ['arch-dependencies'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Escreva as duas funções que um teste de arquitetura usa. O grafo é um objeto em que cada chave é um arquivo e o valor é a lista de arquivos que ele importa.',
      },
    ],
    requirements: [
      'encontrarCiclo(grafo) devolve null se não houver ciclo; senão, um caminho que começa e termina no mesmo arquivo, em que cada passo é um import que existe no grafo (por exemplo, ["a", "b", "a"]).',
      'Arquivos que aparecem só como destino (sem chave própria) não importam nada.',
      'camada(arquivo): "features/x" para arquivos em features/x/…; senão, o primeiro segmento (core, shared, layout).',
      'violacoes(grafo, permitido) devolve, na ordem do grafo, as importações "de -> para" proibidas. permitido é um objeto: camada de origem (core, shared, layout ou features) → lista de camadas de destino permitidas. Importar a própria camada (ou a própria feature) é sempre permitido; uma feature importar outra só é permitido se a lista de features incluir "features".',
    ],
    examples: [
      {
        input: "encontrarCiclo({ a: ['b'], b: ['c'], c: ['a'] })",
        output: "['a', 'b', 'c', 'a'] (ou outra rotação válida)",
      },
      {
        input:
          "violacoes({ 'core/a.ts': ['features/x/b.ts'] }, { core: [], features: ['core', 'shared'] })",
        output: "['core/a.ts -> features/x/b.ts']",
      },
    ],
    starterCode: `function encontrarCiclo(grafo) {
  // Seu código aqui
}

function camada(arquivo) {
  // Seu código aqui
}

function violacoes(grafo, permitido) {
  // Seu código aqui
}

console.log(encontrarCiclo({ a: ['b'], b: ['c'], c: ['a'] }));
`,
    tests: [
      {
        id: 'no-cycle',
        description: 'Sem ciclo: null',
        source:
          "expect(encontrarCiclo({ a: ['b', 'c'], b: ['c'], c: [] })).toBe(null); expect(encontrarCiclo({})).toBe(null); expect(encontrarCiclo({ a: ['externo'] })).toBe(null);",
      },
      {
        id: 'cycle-valid',
        description: 'Com ciclo: um caminho válido que fecha no início',
        source:
          "const valido = (g, c) => Array.isArray(c) && c.length >= 2 && c[0] === c[c.length - 1] && c.slice(1).every((v, i) => (g[c[i]] || []).includes(v)); const g1 = { a: ['b'], b: ['c'], c: ['a'], d: ['a'] }; expect(valido(g1, encontrarCiclo(g1))).toBe(true); const g2 = { x: ['y'], y: [], z: ['w'], w: ['z'] }; expect(valido(g2, encontrarCiclo(g2))).toBe(true);",
      },
      {
        id: 'self',
        description: 'Um arquivo que importa a si mesmo é um ciclo',
        source: "expect(encontrarCiclo({ a: ['a'] })).toEqual(['a', 'a']);",
      },
      {
        id: 'layer',
        description: 'camada reconhece core, shared, layout e cada feature',
        source:
          "expect(camada('core/progress/progress.service.ts')).toBe('core'); expect(camada('shared/ui/botao.ts')).toBe('shared'); expect(camada('features/lessons/lesson-page/lesson-page.ts')).toBe('features/lessons');",
      },
      {
        id: 'violations',
        description: 'Lista as importações proibidas, na ordem',
        source:
          "const grafo = { 'core/a.ts': ['core/b.ts', 'features/x/v.ts'], 'shared/s.ts': ['core/a.ts'], 'features/x/v.ts': ['shared/s.ts', 'features/x/w.ts', 'features/y/z.ts'], 'features/y/z.ts': ['core/a.ts'] }; const permitido = { core: [], shared: ['core'], layout: ['core', 'shared'], features: ['core', 'shared'] }; expect(violacoes(grafo, permitido)).toEqual(['core/a.ts -> features/x/v.ts', 'features/x/v.ts -> features/y/z.ts']);",
      },
      {
        id: 'orchestrator',
        description: 'Com "features" permitido, uma feature pode importar outra',
        source:
          "const grafo = { 'features/focus/f.ts': ['features/lessons/l.ts'] }; expect(violacoes(grafo, { features: ['core', 'shared', 'features'] })).toEqual([]); expect(violacoes(grafo, { features: ['core', 'shared'] })).toEqual(['features/focus/f.ts -> features/lessons/l.ts']);",
      },
    ],
    hints: [
      'Busca em profundidade: mantenha a pilha do caminho atual; encontrar um vizinho que está na pilha é um ciclo.',
      'O ciclo é o trecho da pilha a partir desse vizinho, mais ele de novo no fim.',
      'Para as regras, a camada usada como chave de permitido é "features" (sem o nome) quando a camada começa com "features/".',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `function encontrarCiclo(grafo) {
  const visitados = new Set();
  const pilha = [];
  const naPilha = new Set();

  function visitar(no) {
    visitados.add(no);
    pilha.push(no);
    naPilha.add(no);
    for (const vizinho of grafo[no] || []) {
      if (naPilha.has(vizinho)) return [...pilha.slice(pilha.indexOf(vizinho)), vizinho];
      if (!visitados.has(vizinho)) {
        const ciclo = visitar(vizinho);
        if (ciclo) return ciclo;
      }
    }
    pilha.pop();
    naPilha.delete(no);
    return null;
  }

  for (const no of Object.keys(grafo)) {
    if (!visitados.has(no)) {
      const ciclo = visitar(no);
      if (ciclo) return ciclo;
    }
  }
  return null;
}

function camada(arquivo) {
  const [primeiro, segundo] = arquivo.split('/');
  return primeiro === 'features' ? \`features/\${segundo}\` : primeiro;
}

function violacoes(grafo, permitido) {
  const grupo = (c) => (c.startsWith('features/') ? 'features' : c);
  const resultado = [];
  for (const [de, destinos] of Object.entries(grafo)) {
    for (const para of destinos) {
      const origem = camada(de);
      const destino = camada(para);
      if (origem === destino) continue; // a própria camada ou a própria feature
      if (!(permitido[grupo(origem)] || []).includes(grupo(destino))) resultado.push(\`\${de} -> \${para}\`);
    }
  }
  return resultado;
}`,
      },
      {
        type: 'paragraph',
        text: 'A busca em profundidade com a pilha do caminho atual é o algoritmo clássico para achar ciclos: um vizinho que ainda está na pilha fecha um ciclo. As regras de camada viram uma tabela de dados, fácil de revisar e de mudar com uma decisão registrada. É o que a suíte desta plataforma faz com o próprio código.',
      },
    ],
  },
  {
    id: 'deps-01-break-cycle',
    kind: 'multiple-choice',
    title: 'Como quebrar o ciclo?',
    difficulty: 'advanced',
    conceptIds: ['arch-dependencies'],
    prompt: [
      {
        type: 'paragraph',
        text: 'features/pedidos usa formatarMoeda de features/carrinho, e features/carrinho usa StatusPedido de features/pedidos. Qual é a melhor saída?',
      },
    ],
    options: [
      {
        id: 'extract',
        text: 'Mover formatarMoeda para shared e StatusPedido para um modelo comum (core/models), que as duas features importam.',
        explanation:
          'Correto. O que as duas usam é mais geral que as duas; movido para baixo, cada feature depende só de core e shared, e o ciclo some.',
      },
      {
        id: 'merge',
        text: 'Juntar as duas features numa só.',
        explanation: 'Elimina o ciclo criando uma feature grande com duas responsabilidades.',
      },
      {
        id: 'copy',
        text: 'Copiar o código de formatarMoeda para pedidos.',
        explanation: 'Remove o import, mas duplica a regra: um dia as duas cópias divergem.',
      },
      {
        id: 'any',
        text: 'Trocar o tipo StatusPedido por any no carrinho.',
        explanation: 'Remove o import do tipo e a verificação junto; a dependência real continua.',
      },
    ],
    correctOptionIds: ['extract'],
    hints: ['O que as duas features compartilham pertence a qual camada?'],
    solution: [{ type: 'paragraph', text: 'O que é comum desce de camada.' }],
  },
  {
    id: 'deps-01-cycle-undefined',
    kind: 'multiple-choice',
    title: 'O undefined na inicialização',
    difficulty: 'advanced',
    conceptIds: ['arch-dependencies'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Na etapa de depuração, por que DESCONTOS pode estar undefined em core/precos.ts?',
      },
    ],
    options: [
      {
        id: 'cycle',
        text: 'Há um ciclo: os dois módulos importam um do outro. Dependendo de qual é carregado primeiro, um deles executa antes de o outro terminar, e lê a variável ainda sem valor. Além disso, core importando uma feature viola a direção.',
        explanation:
          'Correto. A correção é a direção: o núcleo não conhece o carrinho. descontoPadrao pertence à feature, ou DESCONTOS desce para o núcleo.',
      },
      {
        id: 'typo',
        text: 'Erro de digitação no nome DESCONTOS.',
        explanation: 'O nome está igual nos dois lados; o problema é a ordem de execução.',
      },
      {
        id: 'const',
        text: 'const não pode ser exportado.',
        explanation: 'Incorreto. Exportar const é comum.',
      },
      {
        id: 'lazy',
        text: 'Falta lazy loading na rota do carrinho.',
        explanation:
          'O lazy loading não resolve um ciclo; pode até mudar o momento em que ele aparece.',
      },
    ],
    correctOptionIds: ['cycle'],
    hints: ['Quem importa quem?'],
    solution: [{ type: 'paragraph', text: 'Ciclo + direção errada. Corrija a direção.' }],
  },
  {
    id: 'deps-01-direction',
    kind: 'multiple-choice',
    title: 'A direção certa',
    difficulty: 'advanced',
    conceptIds: ['arch-dependencies'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O ProgressService (core) precisa mostrar uma mensagem quando o progresso não pode ser salvo. A mensagem aparece num componente de aviso que mora em shared. Qual é a melhor solução?',
      },
    ],
    options: [
      {
        id: 'signal',
        text: 'O service expõe o estado do erro (por exemplo, um signal loadError) e o componente de aviso, ou a tela, lê esse estado.',
        explanation:
          'Correto. O núcleo informa; a interface decide como mostrar. É o que esta plataforma faz com o progresso: o service expõe o estado e as telas reagem.',
      },
      {
        id: 'import-component',
        text: 'O service importa o componente de aviso e o cria.',
        explanation: 'Inverte a direção: o núcleo passa a depender da interface.',
      },
      {
        id: 'alert',
        text: 'O service chama window.alert.',
        explanation: 'Acopla o núcleo ao navegador e a uma interface ruim; e não dá para testar.',
      },
      {
        id: 'event',
        text: 'Mover o ProgressService para shared.',
        explanation: 'Muda a pasta sem resolver a dependência de um service em um componente.',
      },
    ],
    correctOptionIds: ['signal'],
    hints: ['Quem deve conhecer quem: o núcleo ou a interface?'],
    solution: [{ type: 'paragraph', text: 'O núcleo expõe estado; a interface o consome.' }],
  },
  {
    id: 'deps-01-feature-to-feature',
    kind: 'multiple-choice',
    title: 'Quando uma feature pode importar outra?',
    difficulty: 'advanced',
    conceptIds: ['arch-dependencies'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Nesta plataforma, o modo foco importa as páginas de lição, laboratório e revisão. Por que isso é aceitável?',
      },
    ],
    options: [
      {
        id: 'orchestrator',
        text: 'O modo foco é um orquestrador: exibe as outras atividades dentro de uma sessão. A dependência vai num sentido só (nenhuma delas importa o modo foco), e a decisão está registrada.',
        explanation:
          'Correto. Medido no grafo de imports desta plataforma: é a única feature que importa outras, não há ciclos, e a suíte confere que continua assim.',
      },
      {
        id: 'always',
        text: 'Features sempre podem importar umas às outras.',
        explanation:
          'Sem regra, as features viram um emaranhado em que nenhuma pode mudar sozinha.',
      },
      {
        id: 'never',
        text: 'Não é aceitável: o modo foco deveria copiar as páginas.',
        explanation:
          'Copiar duplicaria telas inteiras; reaproveitar com uma dependência controlada é melhor.',
      },
      {
        id: 'shared',
        text: 'É aceitável porque as páginas estão em shared.',
        explanation: 'Incorreto. As páginas estão nas próprias features.',
      },
    ],
    correctOptionIds: ['orchestrator'],
    hints: ['Em que sentido vai a dependência?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Exceção decidida, registrada, num sentido só e verificada por teste.',
      },
    ],
  },
  {
    id: 'deps-01-arch-test',
    kind: 'multiple-choice',
    title: 'Por que um teste?',
    difficulty: 'advanced',
    conceptIds: ['arch-dependencies'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Qual é a principal vantagem de verificar regras de dependência com um teste em vez de só documentá-las?',
      },
    ],
    options: [
      {
        id: 'ci',
        text: 'O teste roda no CI a cada mudança: um import proibido falha antes do merge, sem depender de alguém lembrar a regra na revisão.',
        explanation: 'Correto. Documentação explica o porquê; o teste garante o quê.',
      },
      {
        id: 'speed',
        text: 'O código fica mais rápido.',
        explanation: 'Incorreto. O teste não muda o código em produção.',
      },
      {
        id: 'replace-docs',
        text: 'Dispensa registrar as decisões.',
        explanation:
          'Incorreto. O teste diz o que vale, não por quê; a decisão continua sendo registrada.',
      },
      {
        id: 'types',
        text: 'O TypeScript passa a verificar as camadas.',
        explanation: 'O compilador não conhece camadas; quem confere é o teste.',
      },
    ],
    correctOptionIds: ['ci'],
    hints: ['Quem lembra a regra no dia a dia?'],
    solution: [{ type: 'paragraph', text: 'Regras importantes viram verificações automáticas.' }],
  },
];
