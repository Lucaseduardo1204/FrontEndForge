import { Lesson } from '../../app/core/models/content.models';

/** The rules below are checked against this repository in `src/content/arch-deps.spec.ts` (D-067). */
export const LAYER_RULES_TEXT = `core/      → não importa shared, layout nem features
shared/    → pode importar core
layout/    → pode importar core e shared
features/x → pode importar core e shared; outra feature só se for orquestradora (registrado em decisão)
ciclos     → nenhum`;

export const ARCH_TEST_TS = `it('core e shared nunca importam features', () => {
  const proibidos = imports.filter(
    ([de, para]) => /^(core|shared)\\//.test(de) && para.startsWith('features/'),
  );
  expect(proibidos).toEqual([]);
});

it('não há ciclos de importação', () => {
  expect(encontrarCiclo(grafo)).toBeNull();
});`;

export const ARCH_DEPS_01: Lesson = {
  id: 'arch-deps-01',
  moduleId: 'arch-dependency-rules',
  title: 'Dependências entre módulos: direção, ciclos e testes de arquitetura',
  summary:
    'Quem pode importar quem, por que ciclos tornam o código frágil e como transformar regras de arquitetura em testes que o CI confere.',
  estimatedMinutes: 35,
  difficulty: 'advanced',
  conceptIds: ['arch-dependencies'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Uma arquitetura não se perde de uma vez: ela se perde um import por vez. Um service do núcleo que importa um componente de tela "só desta vez", duas features que passam a depender uma da outra, um ciclo que faz um valor chegar undefined na inicialização. Regras escritas num documento são esquecidas; regras transformadas em teste continuam valendo.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Definir a direção das dependências entre camadas.',
            'Reconhecer e evitar ciclos de importação.',
            'Decidir quando uma feature pode depender de outra.',
            'Escrever testes de arquitetura que rodam no CI.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'A hierarquia de uma obra',
      blocks: [
        {
          type: 'paragraph',
          text: 'Numa obra, a fundação não depende das paredes, e as paredes não dependem dos quadros pendurados nelas. Se a fundação precisasse de um quadro para ficar de pé, trocar a decoração derrubaria a casa. Em código, o núcleo é a fundação, os componentes compartilhados são as paredes, e as features são o que se pendura nelas.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Direção, ciclos e exceções',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Dependências apontam do mais específico para o mais geral: features dependem de shared e core; core não conhece nenhuma tela. Assim, mudar uma feature nunca quebra o núcleo, e o núcleo pode ser testado sozinho.',
            'Features independentes podem ser carregadas sob demanda (lazy loading), removidas ou reescritas sem efeito nas outras.',
            'Ciclo de importação (a importa b, que importa a) deixa a ordem de inicialização frágil: um dos lados pode ler um valor ainda undefined. E impede separar os módulos: um não existe sem o outro.',
            'Quebra-se um ciclo movendo o que os dois usam para um terceiro módulo, mais geral, ou invertendo a dependência (o núcleo define uma interface, a feature a implementa, como o ProgressRepository desta plataforma).',
            'Exceções existem, mas são decididas e registradas. Uma feature que orquestra outras pode importá-las; o importante é que a dependência vá num sentido só.',
            'Testes de arquitetura leem o código-fonte, montam o grafo de imports e conferem as regras. Rodam no CI como qualquer teste.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Medido nesta plataforma',
          text: 'Medido no grafo de imports de src/app (sem os testes): nenhum ciclo. core e shared nunca importam features. Só uma feature importa outras: o modo foco, que exibe a lição, o laboratório e a revisão dentro de uma sessão, decisão registrada no projeto (D-043). Nenhuma delas importa o modo foco de volta.',
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: as regras desta plataforma, como teste',
      blocks: [
        {
          type: 'code',
          language: 'text',
          caption: 'Regras de dependência',
          code: LAYER_RULES_TEXT,
        },
        {
          type: 'code',
          language: 'typescript',
          caption: 'arquitetura.spec.ts',
          code: ARCH_TEST_TS,
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Estas regras são conferidas',
          text: 'A suíte desta plataforma lê os arquivos de src/app, monta o grafo de imports e confere cada regra acima, inclusive que a única feature que importa outras é o modo foco. Se alguém criar um import proibido, o teste falha no CI.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Analise um projeto seu',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Procure imports de features dentro de core ou shared: grep -rn "features/" src/app/core src/app/shared.',
            'Ferramentas como madge (npx madge --circular src) desenham o grafo e listam ciclos.',
            'Escolha uma feature e liste de quem ela depende. Daria para removê-la sem quebrar o resto?',
            'Escreva uma regra de dependência do seu projeto como teste.',
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
          text: 'No laboratório, escreva o detector de ciclos e o verificador de camadas de um teste de arquitetura. Depois, decida como quebrar um ciclo.',
        },
      ],
      exerciseIds: ['lab-js-dependency-rules', 'deps-01-break-cycle'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: o valor undefined na inicialização',
      blocks: [
        {
          type: 'code',
          language: 'typescript',
          caption:
            'Ao abrir a aplicação: "Cannot read properties of undefined (reading \'padrao\')"',
          code: `// core/precos.ts
import { DESCONTOS } from '../features/carrinho/descontos';
export const PRECO_MINIMO = 10;
export const descontoPadrao = DESCONTOS.padrao;

// features/carrinho/descontos.ts
import { PRECO_MINIMO } from '../../core/precos';
export const DESCONTOS = { padrao: 0.05, minimo: PRECO_MINIMO };`,
        },
      ],
      exerciseIds: ['deps-01-cycle-undefined'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Em monorepos, ferramentas como o Nx impõem fronteiras entre bibliotecas com regras de lint.',
            'O ESLint tem regras para restringir caminhos de import (no-restricted-imports) e detectar ciclos (import/no-cycle, do plugin de import).',
            'Revisões de código ficam mais curtas quando as regras de dependência são verificadas automaticamente.',
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
      exerciseIds: ['deps-01-direction', 'deps-01-feature-to-feature', 'deps-01-arch-test'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Dependências apontam para o mais geral: features → shared → core.',
            'Ciclos tornam a inicialização frágil e impedem separar módulos.',
            'Quebre ciclos com um módulo comum ou invertendo a dependência.',
            'Exceções são decididas, registradas e vão num sentido só.',
            'Regras de arquitetura viram testes.',
          ],
        },
      ],
    },
  ],
};
