import { LibraryEntry } from '../app/core/models/content.models';

const MDN = 'https://developer.mozilla.org';

/**
 * Technical library: quick reference. Every reference URL was checked to resolve (HTTP 200)
 * when added; code examples were executed to confirm their output.
 */
export const LIBRARY: readonly LibraryEntry[] = [
  // ---------- Concepts ----------
  {
    id: 'lib-critical-rendering-path',
    title: 'Caminho crítico de renderização',
    kind: 'concept',
    technology: 'web',
    difficulty: 'introductory',
    summary: 'As etapas entre receber o HTML e pintar os primeiros pixels.',
    body: [
      {
        type: 'code',
        language: 'text',
        caption: 'Diagrama do fluxo',
        code: `HTML ──parse──▶ DOM ─┐
                     ├──▶ Render tree ──▶ Layout ──▶ Paint ──▶ Composição
CSS  ──parse──▶ CSSOM┘
         ▲
         └── CSS bloqueia a renderização; <script> comum bloqueia o parser`,
      },
      {
        type: 'list',
        ordered: false,
        items: [
          'display: none tira o elemento da render tree; visibility: hidden mantém o espaço.',
          'Mudar geometria (width, top) força layout; transform e opacity costumam ficar só na composição.',
        ],
      },
    ],
    references: [
      {
        title: 'MDN: Critical rendering path',
        url: `${MDN}/en-US/docs/Web/Performance/Guides/Critical_rendering_path`,
        language: 'en',
      },
    ],
    related: [{ type: 'lesson', id: 'web-browser-01' }],
  },
  {
    id: 'lib-event-loop',
    title: 'Event loop: tarefas e microtarefas',
    kind: 'concept',
    technology: 'javascript',
    difficulty: 'intermediate',
    summary: 'Por que um setTimeout de 0 ms roda depois de uma Promise já resolvida.',
    body: [
      {
        type: 'paragraph',
        text: 'O JavaScript executa uma coisa de cada vez. Quando o código síncrono atual termina, o motor esvazia a fila de microtarefas (callbacks de Promises, queueMicrotask) e só então pega a próxima tarefa (timers, eventos). Por isso uma Promise resolvida passa à frente de um setTimeout de 0 ms.',
      },
      {
        type: 'code',
        language: 'javascript',
        caption: 'Saída: 1 5 3 4 2',
        code: `console.log('1');
setTimeout(() => console.log('2'), 0);         // tarefa
Promise.resolve().then(() => console.log('3')); // microtarefa
queueMicrotask(() => console.log('4'));        // microtarefa
console.log('5');`,
      },
      {
        type: 'callout',
        tone: 'warning',
        title: 'Consequência prática',
        text: 'Um laço longo e síncrono bloqueia tudo: cliques, renderização e timers esperam. Trabalho pesado deve ser dividido em partes ou levado para um Web Worker.',
      },
    ],
    references: [
      {
        title: 'MDN: Modelo de execução do JavaScript',
        url: `${MDN}/pt-BR/docs/Web/JavaScript/Reference/Execution_model`,
        language: 'pt-BR',
      },
      {
        title: 'MDN: Microtask guide',
        url: `${MDN}/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide`,
        language: 'en',
      },
    ],
    related: [{ type: 'bug', id: 'bug-async-foreach' }],
  },
  {
    id: 'lib-signals',
    title: 'Signals no Angular',
    kind: 'concept',
    technology: 'angular',
    difficulty: 'intermediate',
    summary: 'signal, computed e effect: estado reativo síncrono, com dependências rastreadas.',
    body: [
      {
        type: 'code',
        language: 'typescript',
        code: `readonly tarefas = signal<readonly Tarefa[]>([]);
readonly pendentes = computed(() => this.tarefas().filter((t) => !t.concluida).length);

adicionar(tarefa: Tarefa) {
  this.tarefas.update((lista) => [...lista, tarefa]); // novo array: notifica dependentes
}`,
      },
      {
        type: 'list',
        ordered: false,
        items: [
          'signal guarda um valor; set e update o substituem e notificam quem depende dele.',
          'computed deriva valores e só recalcula quando uma dependência muda.',
          'effect executa efeitos colaterais (log, sincronização com APIs fora do Angular). Não use effect para copiar estado de um signal para outro: use computed.',
          'Trate o valor como imutável: alterar um array por dentro (push) não notifica ninguém.',
        ],
      },
    ],
    references: [
      { title: 'Angular: Signals', url: 'https://angular.dev/guide/signals', language: 'en' },
    ],
    related: [{ type: 'bug', id: 'bug-signal-mutation' }],
  },
  {
    id: 'lib-narrowing',
    title: 'Narrowing em TypeScript',
    kind: 'concept',
    technology: 'typescript',
    difficulty: 'intermediate',
    summary: 'Como o compilador estreita uniões com typeof, in, checagens e campos discriminantes.',
    body: [
      {
        type: 'code',
        language: 'typescript',
        code: `type Resultado = { ok: true; valor: number } | { ok: false; erro: string };

function mostrar(r: Resultado): string {
  if (r.ok) return \`Valor: \${r.valor}\`; // aqui r é { ok: true; valor: number }
  return \`Erro: \${r.erro}\`;             // aqui r é { ok: false; erro: string }
}`,
      },
      {
        type: 'paragraph',
        text: 'Narrowing acontece em tempo de compilação. Para dados externos, receba unknown e faça as checagens que provam o formato: elas existem em runtime e, ao mesmo tempo, estreitam o tipo.',
      },
    ],
    references: [
      {
        title: 'TypeScript Handbook: Narrowing',
        url: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html',
        language: 'en',
      },
    ],
    related: [
      { type: 'lab', id: 'lab-ts-order-status' },
      { type: 'mission', id: 'mission-typing-bug' },
    ],
  },

  // ---------- Comparisons ----------
  {
    id: 'lib-script-loading',
    title: 'Script comum, defer, async e module',
    kind: 'comparison',
    technology: 'html',
    difficulty: 'introductory',
    summary: 'Quando cada forma de carregar scripts executa, e se respeita a ordem.',
    body: [
      {
        type: 'table',
        caption: 'Comparação das formas de carregar <script src>',
        headers: ['Forma', 'Bloqueia o parser?', 'Quando executa', 'Ordem entre scripts'],
        rows: [
          ['<script>', 'Sim', 'Assim que é baixado, no meio do parsing', 'Na ordem do documento'],
          [
            '<script defer>',
            'Não',
            'Depois do HTML inteiro, antes do DOMContentLoaded',
            'Na ordem do documento',
          ],
          ['<script async>', 'Não para baixar', 'Assim que termina de baixar', 'Sem garantia'],
          ['<script type="module">', 'Não', 'Adiado, como defer', 'Na ordem do documento'],
        ],
      },
      {
        type: 'callout',
        tone: 'warning',
        title: 'Só para scripts externos',
        text: 'Em scripts clássicos inline (sem src), defer e async são ignorados.',
      },
    ],
    references: [
      {
        title: 'MDN: O elemento <script>',
        url: `${MDN}/pt-BR/docs/Web/HTML/Reference/Elements/script`,
        language: 'pt-BR',
      },
    ],
    related: [{ type: 'lesson', id: 'web-browser-01' }],
  },
  {
    id: 'lib-flex-vs-grid',
    title: 'Flexbox ou Grid?',
    kind: 'comparison',
    technology: 'css',
    difficulty: 'introductory',
    summary: 'Uma dimensão a partir do conteúdo, ou duas dimensões a partir do layout.',
    body: [
      {
        type: 'table',
        caption: 'Flexbox e Grid',
        headers: ['Critério', 'Flexbox', 'Grid'],
        rows: [
          ['Dimensões', 'Uma (linha ou coluna)', 'Duas (linhas e colunas)'],
          ['Ponto de partida', 'O tamanho do conteúdo', 'A estrutura definida no contêiner'],
          [
            'Bom para',
            'Barras de ferramentas, alinhar itens, distribuir espaço',
            'Layouts de página, galerias, formulários alinhados',
          ],
          ['Responsivo sem @media', 'flex-wrap + flex: 1 1 <base>', 'repeat(auto-fit, minmax(…))'],
        ],
      },
      {
        type: 'paragraph',
        text: 'Não é uma escolha exclusiva: é comum usar Grid para a estrutura da página e Flexbox dentro de cada componente.',
      },
    ],
    references: [
      {
        title: 'MDN: Flexbox',
        url: `${MDN}/pt-BR/docs/Learn_web_development/Core/CSS_layout/Flexbox`,
        language: 'pt-BR',
      },
      {
        title: 'MDN: Grid layout',
        url: `${MDN}/pt-BR/docs/Web/CSS/Guides/Grid_layout`,
        language: 'pt-BR',
      },
    ],
    related: [{ type: 'mission', id: 'mission-responsive-layout' }],
  },
  {
    id: 'lib-signals-vs-rxjs',
    title: 'Signals ou RxJS?',
    kind: 'comparison',
    technology: 'angular',
    difficulty: 'intermediate',
    summary: 'Estado síncrono e derivado com signals; fluxos assíncronos com RxJS.',
    body: [
      {
        type: 'table',
        caption: 'Quando usar cada abordagem',
        headers: ['Situação', 'Use', 'Por quê'],
        rows: [
          [
            'Estado de um componente (filtro, item selecionado)',
            'signal',
            'Valor atual, síncrono, lido no template',
          ],
          ['Valor derivado de outros', 'computed', 'Recalcula só quando as dependências mudam'],
          ['Requisição HTTP', 'Observable (HttpClient)', 'Assíncrono, cancelável'],
          [
            'Busca enquanto digita',
            'RxJS (debounceTime, switchMap)',
            'Tempo, cancelamento de requisições anteriores',
          ],
          [
            'Usar um Observable no template',
            'toSignal',
            'Converte para valor atual, com inscrição gerenciada',
          ],
        ],
      },
    ],
    references: [
      { title: 'Angular: Signals', url: 'https://angular.dev/guide/signals', language: 'en' },
      {
        title: 'Angular: RxJS interop',
        url: 'https://angular.dev/ecosystem/rxjs-interop',
        language: 'en',
      },
    ],
    related: [],
  },
  {
    id: 'lib-let-const-var',
    title: 'let, const e var',
    kind: 'comparison',
    technology: 'javascript',
    difficulty: 'introductory',
    summary: 'Escopo, reatribuição e hoisting das três formas de declarar.',
    body: [
      {
        type: 'table',
        caption: 'Diferenças entre as declarações',
        headers: ['Característica', 'var', 'let', 'const'],
        rows: [
          ['Escopo', 'Função', 'Bloco', 'Bloco'],
          ['Reatribuir', 'Sim', 'Sim', 'Não'],
          [
            'Usar antes da declaração',
            'undefined (hoisting)',
            'Erro (zona morta temporal)',
            'Erro (zona morta temporal)',
          ],
          ['Nova variável a cada volta do for', 'Não', 'Sim', 'Sim (em for...of)'],
        ],
      },
      {
        type: 'paragraph',
        text: 'Regra prática: const por padrão, let quando precisar reatribuir, nunca var. const impede reatribuir a variável, não alterar o objeto ou array que ela referencia.',
      },
    ],
    references: [
      {
        title: 'MDN: let',
        url: `${MDN}/pt-BR/docs/Web/JavaScript/Reference/Statements/let`,
        language: 'pt-BR',
      },
      {
        title: 'MDN: var',
        url: `${MDN}/pt-BR/docs/Web/JavaScript/Reference/Statements/var`,
        language: 'pt-BR',
      },
    ],
    related: [{ type: 'bug', id: 'bug-closure-var-loop' }],
  },
  {
    id: 'lib-textcontent-innerhtml',
    title: 'textContent ou innerHTML?',
    kind: 'comparison',
    technology: 'security',
    difficulty: 'introductory',
    summary: 'Texto é texto; HTML vindo de usuário é uma porta para XSS.',
    body: [
      {
        type: 'table',
        caption: 'Formas de colocar conteúdo no DOM',
        headers: ['Propriedade', 'Interpreta HTML?', 'Seguro com texto do usuário?'],
        rows: [
          ['textContent', 'Não', 'Sim'],
          ['innerHTML', 'Sim', 'Não: permite XSS (por exemplo, <img onerror>)'],
          ['Interpolação {{ }} no Angular', 'Não (escapa)', 'Sim'],
          [
            '[innerHTML] no Angular',
            'Sim, com sanitização',
            'Sanitizado; nunca use bypassSecurityTrustHtml com dado do usuário',
          ],
        ],
      },
    ],
    references: [
      {
        title: 'MDN: Node.textContent',
        url: `${MDN}/pt-BR/docs/Web/API/Node/textContent`,
        language: 'pt-BR',
      },
      {
        title: 'MDN: Element.innerHTML',
        url: `${MDN}/pt-BR/docs/Web/API/Element/innerHTML`,
        language: 'pt-BR',
      },
      {
        title: 'Angular: Security',
        url: 'https://angular.dev/best-practices/security',
        language: 'en',
      },
    ],
    related: [{ type: 'mission', id: 'mission-xss' }],
  },

  // ---------- Glossary ----------
  {
    id: 'lib-glossary-dom',
    title: 'DOM',
    kind: 'glossary',
    technology: 'web',
    difficulty: 'introductory',
    summary: 'Document Object Model: a árvore de objetos que o navegador cria a partir do HTML.',
    body: [
      {
        type: 'paragraph',
        text: 'O DOM é a representação viva da página, que o JavaScript lê e altera. Ele pode diferir do código-fonte: o navegador corrige marcação inválida e os scripts mudam a árvore depois do carregamento.',
      },
    ],
    references: [
      { title: 'MDN: DOM (glossário)', url: `${MDN}/pt-BR/docs/Glossary/DOM`, language: 'pt-BR' },
    ],
    related: [{ type: 'lesson', id: 'web-browser-01' }],
  },
  {
    id: 'lib-glossary-closure',
    title: 'Closure',
    kind: 'glossary',
    technology: 'javascript',
    difficulty: 'intermediate',
    summary: 'Uma função junto com as variáveis do escopo onde foi criada.',
    body: [
      {
        type: 'code',
        language: 'javascript',
        code: `function contador() {
  let total = 0;
  return () => ++total; // a função lembra de total
}
const proximo = contador();
proximo(); // 1
proximo(); // 2`,
      },
      {
        type: 'paragraph',
        text: 'A closure captura a variável, não o valor do momento: se a variável mudar, a função vê o valor novo.',
      },
    ],
    references: [
      {
        title: 'MDN: Closures',
        url: `${MDN}/pt-BR/docs/Web/JavaScript/Guide/Closures`,
        language: 'pt-BR',
      },
    ],
    related: [{ type: 'bug', id: 'bug-closure-var-loop' }],
  },
  {
    id: 'lib-glossary-xss',
    title: 'XSS (Cross-Site Scripting)',
    kind: 'glossary',
    technology: 'security',
    difficulty: 'intermediate',
    summary: 'Quando dados controlados por um atacante são executados como código na página.',
    body: [
      {
        type: 'paragraph',
        text: 'No XSS armazenado, o código malicioso fica salvo (num comentário, por exemplo) e roda no navegador de cada visitante. A defesa principal é tratar dados como texto ao renderizar; Content Security Policy é uma segunda camada.',
      },
    ],
    references: [
      {
        title: 'MDN: Cross-site scripting',
        url: `${MDN}/en-US/docs/Web/Security/Attacks/XSS`,
        language: 'en',
      },
      {
        title: 'OWASP: XSS Prevention Cheat Sheet',
        url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html',
        language: 'en',
      },
      {
        title: 'MDN: Content Security Policy',
        url: `${MDN}/pt-BR/docs/Web/HTTP/Guides/CSP`,
        language: 'pt-BR',
      },
    ],
    related: [{ type: 'mission', id: 'mission-xss' }],
  },
  {
    id: 'lib-glossary-hoisting',
    title: 'Hoisting',
    kind: 'glossary',
    technology: 'javascript',
    difficulty: 'introductory',
    summary: 'Declarações são registradas antes de o código do escopo executar.',
    body: [
      {
        type: 'paragraph',
        text: 'Funções declaradas com function podem ser chamadas antes da linha em que aparecem. Variáveis com var existem desde o início do escopo, valendo undefined. let e const também são registradas, mas acessá-las antes da declaração lança ReferenceError (zona morta temporal).',
      },
    ],
    references: [
      { title: 'MDN: Hoisting', url: `${MDN}/pt-BR/docs/Glossary/Hoisting`, language: 'pt-BR' },
    ],
    related: [],
  },

  // ---------- Shortcuts ----------
  {
    id: 'lib-devtools-shortcuts',
    title: 'Atalhos do DevTools (Chrome e Edge)',
    kind: 'shortcuts',
    technology: 'tools',
    difficulty: 'introductory',
    summary: 'Os atalhos que mais economizam tempo ao depurar.',
    body: [
      {
        type: 'table',
        caption:
          'Atalhos no Windows e Linux. No macOS, os equivalentes usam Cmd e Option (por exemplo, Cmd+Option+I para abrir).',
        headers: ['Ação', 'Atalho'],
        rows: [
          ['Abrir o DevTools', 'F12 ou Ctrl+Shift+I'],
          ['Inspecionar um elemento', 'Ctrl+Shift+C'],
          ['Abrir direto no Console', 'Ctrl+Shift+J'],
          ['Modo responsivo (dispositivos)', 'Ctrl+Shift+M (com o DevTools aberto)'],
          ['Menu de comandos', 'Ctrl+Shift+P'],
          ['Abrir arquivo (Sources)', 'Ctrl+P'],
          ['Mostrar/ocultar o Console na parte de baixo', 'Esc'],
        ],
      },
    ],
    references: [
      {
        title: 'Chrome DevTools: Keyboard shortcuts',
        url: 'https://developer.chrome.com/docs/devtools/shortcuts',
        language: 'en',
      },
    ],
    related: [],
  },
  {
    id: 'lib-vscode-shortcuts',
    title: 'Atalhos do VS Code',
    kind: 'shortcuts',
    technology: 'tools',
    difficulty: 'introductory',
    summary: 'Navegar, editar e refatorar sem tirar as mãos do teclado.',
    body: [
      {
        type: 'table',
        caption:
          'Atalhos padrão no Windows e Linux. No macOS, a maioria troca Ctrl por Cmd e Alt por Option.',
        headers: ['Ação', 'Atalho'],
        rows: [
          ['Abrir arquivo pelo nome', 'Ctrl+P'],
          ['Paleta de comandos', 'Ctrl+Shift+P'],
          ['Ir para a definição', 'F12'],
          ['Renomear símbolo em todo o projeto', 'F2'],
          ['Selecionar a próxima ocorrência', 'Ctrl+D'],
          ['Mover linha para cima/baixo', 'Alt+↑ / Alt+↓'],
          ['Abrir o terminal integrado', 'Ctrl+`'],
        ],
      },
    ],
    references: [
      {
        title: 'VS Code: Key Bindings',
        url: 'https://code.visualstudio.com/docs/getstarted/keybindings',
        language: 'en',
      },
    ],
    related: [],
  },

  // ---------- Patterns and practices ----------
  {
    id: 'lib-presentational-components',
    title: 'Componentes de apresentação e de contêiner',
    kind: 'pattern',
    technology: 'angular',
    difficulty: 'intermediate',
    summary: 'Separar quem mostra dados de quem busca e altera dados.',
    body: [
      {
        type: 'paragraph',
        text: 'Um componente de apresentação recebe dados por input() e avisa ações por output(): não injeta services nem conhece de onde os dados vêm. O contêiner (geralmente a página) injeta services, guarda o estado e conecta tudo. Os de apresentação ficam fáceis de reutilizar e de testar.',
      },
      {
        type: 'code',
        language: 'typescript',
        code: `@Component({ selector: 'app-tarefa-item', template: '…' })
export class TarefaItem {
  readonly tarefa = input.required<Tarefa>();
  readonly alternada = output<string>(); // emite o id
}`,
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Quando não separar',
        text: 'Num componente pequeno e usado em um só lugar, separar pode ser abstração sem retorno. Separe quando houver reuso, testes difíceis ou responsabilidades misturadas.',
      },
    ],
    references: [
      {
        title: 'Angular: Inputs',
        url: 'https://angular.dev/guide/components/inputs',
        language: 'en',
      },
      {
        title: 'Angular: Outputs',
        url: 'https://angular.dev/guide/components/outputs',
        language: 'en',
      },
    ],
    related: [{ type: 'project', id: 'project-js-tasks' }],
  },
  {
    id: 'lib-a11y-checklist',
    title: 'Checklist rápido de acessibilidade',
    kind: 'practice',
    technology: 'accessibility',
    difficulty: 'introductory',
    summary: 'O mínimo para que uma tela funcione com teclado, leitor de tela e zoom.',
    body: [
      {
        type: 'list',
        ordered: false,
        items: [
          'Idioma declarado em <html lang> e um único h1 por página.',
          'Ações são <button>, navegação é <a href>; nada clicável que não seja um controle.',
          'Todo campo tem <label>; erros são associados ao campo e anunciados.',
          'Foco sempre visível e ordem de foco igual à ordem de leitura.',
          'Contraste mínimo AA: 4,5:1 para texto normal, 3:1 para texto grande.',
          'Imagens com alt (alt="" para decorativas).',
          'Use ARIA só quando o HTML nativo não resolve.',
        ],
      },
    ],
    references: [
      {
        title: 'W3C: WCAG 2.2 Quick Reference',
        url: 'https://www.w3.org/WAI/WCAG22/quickref/',
        language: 'en',
      },
      { title: 'MDN: ARIA', url: `${MDN}/pt-BR/docs/Web/Accessibility/ARIA`, language: 'pt-BR' },
    ],
    related: [
      { type: 'bug', id: 'bug-div-button' },
      { type: 'project', id: 'project-html-profile' },
    ],
  },
  {
    id: 'lib-frontend-security',
    title: 'Segurança no frontend: o essencial',
    kind: 'practice',
    technology: 'security',
    difficulty: 'intermediate',
    summary: 'O que o frontend pode e não pode proteger.',
    body: [
      {
        type: 'list',
        ordered: false,
        items: [
          'O frontend não é fronteira de confiança: guards e botões escondidos melhoram a experiência, mas a autorização acontece no backend.',
          'Nada de segredo no bundle: tudo que vai para o navegador pode ser lido.',
          'Renderize dados do usuário como texto (textContent, {{ }}).',
          'localStorage é legível por qualquer script da página: não guarde tokens sensíveis nele.',
          'Links com target="_blank" precisam de rel="noopener noreferrer".',
          'Content Security Policy sem unsafe-inline reduz o impacto de um XSS.',
        ],
      },
    ],
    references: [
      {
        title: 'Angular: Security',
        url: 'https://angular.dev/best-practices/security',
        language: 'en',
      },
      {
        title: 'MDN: Window.localStorage',
        url: `${MDN}/pt-BR/docs/Web/API/Window/localStorage`,
        language: 'pt-BR',
      },
    ],
    related: [{ type: 'mission', id: 'mission-xss' }],
  },
];
