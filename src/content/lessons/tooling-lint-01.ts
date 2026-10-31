import { Lesson } from '../../app/core/models/content.models';

/** Linted with this project's ESLint configuration; the findings table is the measured output (D-067). */
export const LINT_SAMPLE_TS = `import { Component, Input } from '@angular/core';

@Component({ selector: 'cartao-produto', template: '' })
export class CartaoProduto {
  @Input() nome = '';
  dados: any;
  total = 0;

  calcular(itens: number[]) {
    let soma = 0;
    for (const i of itens) soma += i;
    const naoUsada = 1;
    if (soma == 0) return;
    this.total = soma;
  }
}`;

export const LINT_SAMPLE_HTML = `<div (click)="abrir()">Abrir</div>
<img src="foto.png">
<input type="text">
<button>Salvar</button>
<div *ngIf="visivel">Texto</div>
<a href="#" (click)="sair()">Sair</a>`;

/** [line, rule, what it means] for each finding, in the order ESLint reported them. */
export const LINT_FINDINGS: readonly (readonly [string, string, string])[] = [
  ['TS 3', '@angular-eslint/component-selector', 'Seletor sem o prefixo app do projeto.'],
  ['TS 5', '@angular-eslint/prefer-signals', '@Input() em vez de input().'],
  ['TS 6', '@typescript-eslint/no-explicit-any', 'any desliga a verificação de tipos.'],
  ['TS 12', '@typescript-eslint/no-unused-vars', 'Variável criada e nunca usada.'],
  ['TS 13', 'eqeqeq', '== em vez de ===.'],
  [
    'HTML 1',
    '@angular-eslint/template/click-events-have-key-events',
    'Clique sem equivalente no teclado.',
  ],
  [
    'HTML 1',
    '@angular-eslint/template/interactive-supports-focus',
    'Elemento clicável que não recebe foco.',
  ],
  ['HTML 2', '@angular-eslint/template/alt-text', 'Imagem sem alt.'],
  ['HTML 4', '@angular-eslint/template/button-has-type', 'Botão sem type.'],
  ['HTML 5', '@angular-eslint/template/prefer-control-flow', '*ngIf em vez de @if.'],
];

export const PRETTIER_BEFORE = `const   x = {a:1,b:"dois"}
function f( a,b ){return a+b}`;

export const PRETTIER_AFTER = `const x = { a: 1, b: 'dois' };
function f(a, b) {
  return a + b;
}`;

export const TOOLING_LINT_01: Lesson = {
  id: 'tooling-lint-01',
  moduleId: 'tooling-code-quality',
  title: 'Qualidade automatizada: lint, formatação e o que cada ferramenta pega',
  summary:
    'O que o formatador, o linter, o compilador e os testes verificam, o que cada um deixa passar, e como escolher e ligar regras com critério.',
  estimatedMinutes: 35,
  difficulty: 'intermediate',
  conceptIds: ['tooling-lint'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Revisões de código gastam tempo demais com espaços, aspas e "faltou o alt aqui". Ferramentas automáticas tiram esse trabalho das pessoas e deixam a revisão para o que importa: a lógica, os nomes, as decisões. Mas cada ferramenta só confere o que foi configurada para conferir; saber o que fica de fora é tão importante quanto ligar as regras.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Separar formatação (Prettier), lint (ESLint), tipos (TypeScript) e comportamento (testes).',
            'Ler um relatório de lint e entender cada regra.',
            'Ligar regras além das recomendadas, com critério.',
            'Desativar uma regra pontualmente, com justificativa.',
            'Saber o que nenhuma dessas ferramentas pega.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'O corretor e o revisor',
      blocks: [
        {
          type: 'paragraph',
          text: 'Num jornal, o corretor ortográfico arruma vírgulas sem discutir (formatação); o revisor de estilo aponta frases ambíguas e termos proibidos (lint); o checador confere se os fatos batem (tipos e testes); e o editor decide se a matéria faz sentido (revisão humana). Ninguém pede ao editor para contar vírgulas.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Cada ferramenta no seu papel',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Prettier formata: não aponta problemas, reescreve o código num estilo único. Medido com a configuração deste projeto: a entrada da etapa seguinte saiu com espaços, aspas simples e ponto e vírgula padronizados. Discussões de estilo acabam.',
            'ESLint analisa o código e aponta padrões problemáticos, cada um com uma regra nomeada. angular-eslint acrescenta regras para componentes e templates, inclusive de acessibilidade.',
            'Medido: com a configuração deste projeto, o exemplo de TypeScript teve 5 problemas e o de template, 5. A tabela abaixo é a saída real.',
            'O que nenhuma regra apontou, no mesmo exemplo: o campo sem rótulo e o link com href="#" usado como botão. Ferramentas como o axe (usado nas auditorias desta plataforma), testes de componente e a revisão cobrem o resto.',
            'Os conjuntos recomendados são um ponto de partida. Este projeto acrescentou eqeqeq, prefer-signals e button-has-type depois de medir que o código já os seguia: ligar uma regra que gera centenas de erros de uma vez costuma acabar com a regra desligada.',
            'Desativar pontualmente é aceitável com motivo: // eslint-disable-next-line nome-da-regra -- motivo. Desativar sem motivo esconde dívida.',
            'TypeScript strict pega erros de tipo que o lint não vê; testes pegam comportamento errado com código bem formatado e bem tipado. As quatro camadas rodam juntas no CI (lição de CI/CD).',
          ],
        },
        {
          type: 'table',
          caption: 'Saída real do ESLint deste projeto para os exemplos',
          headers: ['Linha', 'Regra', 'Significado'],
          rows: LINT_FINDINGS.map(([linha, regra, significado]) => [linha, regra, significado]),
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: o que o lint e o Prettier dizem',
      blocks: [
        {
          type: 'code',
          language: 'typescript',
          caption: 'cartao-produto.ts (com problemas)',
          code: LINT_SAMPLE_TS,
        },
        {
          type: 'code',
          language: 'html',
          caption: 'template.html (com problemas)',
          code: LINT_SAMPLE_HTML,
        },
        {
          type: 'code',
          language: 'typescript',
          caption: 'Antes do Prettier',
          code: PRETTIER_BEFORE,
        },
        {
          type: 'code',
          language: 'typescript',
          caption: 'Depois do Prettier',
          code: PRETTIER_AFTER,
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Medido com as ferramentas do projeto',
          text: 'Os dois exemplos passaram pelo ESLint e o trecho de formatação pelo Prettier, com as configurações deste repositório. A suíte de testes confere que as regras citadas continuam configuradas.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Experimente no seu projeto',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Rode npx eslint . --format json e conte os problemas por regra.',
            'Ligue uma regra nova no eslint.config.js e veja quantos problemas aparecem antes de decidir.',
            'Configure o editor para formatar ao salvar com o Prettier do projeto.',
            'Escreva um eslint-disable-next-line com motivo e peça a alguém para revisar se o motivo convence.',
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
          text: 'No laboratório, escreva o script que resume o relatório JSON do ESLint para o CI e decide se a etapa falha. Depois, decida sobre uma regra nova.',
        },
      ],
      exerciseIds: ['lab-js-lint-report', 'lint-01-new-rule'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: o lint verde e o botão inacessível',
      blocks: [
        {
          type: 'code',
          language: 'html',
          caption: 'npm run lint passa, mas quem usa leitor de tela não sabe o que este link faz',
          code: `<a href="#" (click)="sair()"><svg aria-hidden="true">…</svg></a>`,
        },
      ],
      exerciseIds: ['lint-01-green-not-enough'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Ganchos de pre-commit (com ferramentas como husky e lint-staged) rodam lint e formatação só nos arquivos alterados, antes do commit.',
            'O CI roda as mesmas verificações e bloqueia o merge; o gancho local é conveniência, o CI é a garantia.',
            'Regras com correção automática (eslint --fix) resolvem a maioria dos problemas de estilo sem esforço.',
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
      exerciseIds: ['lint-01-which-tool', 'lint-01-disable', 'lint-01-prettier-vs-eslint'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Prettier formata; ESLint aponta padrões; TypeScript confere tipos; testes conferem comportamento.',
            'Cada ferramenta só pega o que foi configurada para pegar.',
            'Ligue regras medindo o impacto antes.',
            'Desativar só com motivo escrito.',
            'Lint verde não é acessibilidade garantida.',
          ],
        },
      ],
    },
  ],
};
