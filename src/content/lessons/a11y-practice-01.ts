import { Lesson } from '../../app/core/models/content.models';

/**
 * Dialog keyboard behaviour measured in a real Chromium; contrast ratios of this platform's
 * tokens computed with the WCAG formula and asserted in `perf-a11y-examples.spec.ts` (D-056).
 */
export const DIALOG_HTML = `<button #botaoAbrir type="button" (click)="dialogo.showModal()">Apagar progresso</button>

<dialog #dialogo aria-labelledby="titulo-apagar" (close)="botaoAbrir.focus()">
  <h2 id="titulo-apagar">Apagar todo o progresso?</h2>
  <p>Isso não pode ser desfeito.</p>
  <button type="button" autofocus (click)="dialogo.close()">Cancelar</button>
  <button type="button" class="perigo" (click)="apagar(); dialogo.close()">Apagar tudo</button>
</dialog>`;

export const LIVE_REGION_HTML = `<!-- A região existe desde o início; só o texto muda, e o leitor de tela anuncia. -->
<p role="status">{{ mensagem() }}</p>

<!-- Erro que exige atenção imediata: interrompe a leitura. Use com moderação. -->
@if (erroAoSalvar()) {
  <p role="alert">Não foi possível salvar. Verifique a conexão e tente de novo.</p>
}`;

export const FOCUS_STEP_TS = `// Ao trocar de etapa sem trocar de página, leve o foco para o novo título,
// para quem usa teclado ou leitor de tela saber que o conteúdo mudou.
private readonly titulo = viewChild.required<ElementRef<HTMLHeadingElement>>('titulo');

irPara(etapa: number) {
  this.etapaAtual.set(etapa);
  afterNextRender(() => this.titulo().nativeElement.focus(), { injector: this.injector });
}`;

export const A11Y_PRACTICE_01: Lesson = {
  id: 'a11y-practice-01',
  moduleId: 'a11y-practice',
  title: 'Acessibilidade na prática: teclado, foco, anúncios e contraste',
  summary:
    'O que separa uma interface que "passa no validador" de uma que funciona para todo mundo: teclado, gestão de foco, anúncios para leitores de tela, contraste e telas estreitas, com casos reais desta plataforma.',
  estimatedMinutes: 45,
  difficulty: 'intermediate',
  conceptIds: ['a11y-keyboard-focus', 'a11y-contrast', 'a11y-interactive-elements'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Pessoas usam a web com teclado, leitor de tela, ampliação de tela, comandos de voz, contraste alto, em celulares com sol batendo na tela. A WCAG 2.2 organiza o que é preciso em quatro princípios: perceptível, operável, compreensível e robusto. O nível AA é a referência comum de leis e contratos.',
        },
        {
          type: 'paragraph',
          text: 'A lição de HTML semântico cobriu a base (elementos certos, rótulos, alt). Aqui o foco é a aplicação viva: o que acontece quando a tela muda, um diálogo abre, uma mensagem aparece ou alguém amplia a página.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Garantir operação completa pelo teclado, com foco visível e sem armadilhas.',
            'Gerenciar o foco em diálogos e em mudanças de conteúdo.',
            'Anunciar mudanças com regiões vivas, sem exagero.',
            'Calcular e cumprir contraste mínimo.',
            'Funcionar em telas estreitas e com zoom (reflow).',
            'Saber o que ferramentas automáticas pegam e o que não pegam.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'Explicar o caminho por telefone',
      blocks: [
        {
          type: 'paragraph',
          text: 'Uma interface acessível é como explicar um caminho por telefone para quem não vê o mapa: você diz onde a pessoa está ("você está no formulário de cadastro"), o que mudou ("a conta foi criada") e não a deixa num beco sem saída. Se você muda o mapa sem avisar, ela se perde.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Teclado, foco, anúncios, contraste e reflow',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Teclado: tudo o que funciona com mouse funciona com Tab, Shift+Tab, Enter, Espaço e setas. A ordem de foco segue a leitura. :focus-visible mostra onde o foco está; nunca remova o contorno sem pôr outro no lugar.',
            'Sem armadilhas: o foco sempre consegue sair de um componente. Editores de código são o caso clássico; o editor desta plataforma usa Tab para indentar e Esc seguido de Tab para sair.',
            'Link para pular ao conteúdo: o primeiro elemento focável leva direto ao conteúdo principal, poupando dezenas de Tabs no menu.',
            'Mudança de conteúdo sem mudança de página (SPA): leve o foco para o novo título ou para a área principal, ou a pessoa fica "no lugar antigo".',
            'Diálogos: <dialog> com showModal() torna o fundo inerte, coloca o foco dentro (no elemento com autofocus), fecha com Esc. Ao fechar, devolva o foco a quem abriu. Em ações destrutivas, deixe o foco inicial na opção segura.',
            'Regiões vivas: role="status" (educado, espera a pessoa terminar o que está ouvindo) para confirmações e carregamentos; role="alert" (interrompe) só para erros urgentes. A região precisa existir antes de o texto mudar.',
            'Contraste mínimo (AA): 4,5:1 para texto comum; 3:1 para texto grande (a partir de 24 px, ou 18,66 px em negrito) e para bordas de campos, ícones e indicadores de foco.',
            'Reflow: o conteúdo precisa funcionar a 320 px de largura sem rolagem lateral (equivale a ampliar 400% numa tela de 1280 px).',
            'prefers-reduced-motion: reduza animações para quem pediu no sistema.',
            'Ferramentas automáticas (axe, Lighthouse) acham uma parte dos problemas. Teste também com teclado e com um leitor de tela (NVDA no Windows, VoiceOver no macOS e iOS, TalkBack no Android).',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Casos reais desta plataforma',
          text: 'Auditorias com axe nesta plataforma acharam regiões repetidas com o mesmo nome (um "Solução comentada" por exercício), um título que pulava de h1 para h4 e cabeçalhos de tabela vazios. E uma medição de rolagem lateral errada escondeu, por um tempo, dez páginas que vazavam a 320 px: a causa eram trechos de código sem espaço, como a.b.c(\'x\'), que impediam a coluna de encolher. A correção foi overflow-wrap: anywhere. Os registros estão nas decisões de arquitetura do projeto.',
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: confirmar, anunciar e guiar o foco',
      blocks: [
        {
          type: 'paragraph',
          text: 'Uma confirmação de ação destrutiva com o elemento nativo. Medido num Chromium real: o fundo fica inerte (Tab não alcança a página atrás), o foco abre em "Cancelar", Esc fecha e o foco volta para o botão que abriu.',
        },
        { type: 'code', language: 'html', caption: 'confirmar-apagar.html', code: DIALOG_HTML },
        {
          type: 'paragraph',
          text: 'Mensagens que aparecem depois de uma ação:',
        },
        { type: 'code', language: 'html', caption: 'regiões vivas', code: LIVE_REGION_HTML },
        {
          type: 'paragraph',
          text: 'E o foco numa troca de etapa, como nas lições desta plataforma:',
        },
        { type: 'code', language: 'typescript', caption: 'licao.ts (trecho)', code: FOCUS_STEP_TS },
        {
          type: 'paragraph',
          text: 'Contraste das cores desta plataforma no tema escuro, calculado com a fórmula da WCAG: texto principal 15,15:1, texto secundário 7,94:1 e o texto mais apagado 5,91:1, todos acima de 4,5:1. No limite: #767676 sobre branco dá 4,54:1 (passa), e #777777 dá 4,48:1 (não passa).',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Teste no seu computador',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Desconecte o mouse (ou não toque nele) e use um site do dia a dia só com o teclado por cinco minutos. Onde o foco some? Onde fica preso?',
            'Amplie a página para 400% (Ctrl e +) num site qualquer: aparece rolagem lateral?',
            'Ative o leitor de tela do seu sistema e envie um formulário com erro: o erro é anunciado?',
            'No DevTools, inspecione um texto e clique na amostra de cor: o Chrome mostra a razão de contraste e se passa em AA.',
            'Rode o Lighthouse na aba de acessibilidade e compare com o que você encontrou à mão.',
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
          text: 'No laboratório, implemente o cálculo de contraste da WCAG. Depois, responda sobre regiões vivas.',
        },
      ],
      exerciseIds: ['lab-js-contrast', 'a11y-01-live'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: o modal feito de div',
      blocks: [
        {
          type: 'code',
          language: 'html',
          caption: 'Funciona com mouse',
          code: `@if (aberto()) {
  <div class="modal-fundo">
    <div class="modal">
      <h2>Apagar todo o progresso?</h2>
      <div class="botao" (click)="apagar()">Apagar tudo</div>
    </div>
  </div>
}`,
        },
      ],
      exerciseIds: ['a11y-01-modal'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Inclua navegação por teclado no roteiro de testes de toda funcionalidade nova.',
            'axe pode rodar em testes ponta a ponta e na integração contínua; trate violações como bugs.',
            'Design systems resolvem acessibilidade uma vez para todos: botões, diálogos e campos acessíveis por padrão.',
            'O Angular CDK tem utilitários para foco (FocusTrap, LiveAnnouncer) quando o HTML nativo não basta.',
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
      exerciseIds: ['a11y-01-contrast-levels', 'a11y-01-focus-spa', 'a11y-01-tools'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Tudo pelo teclado, com foco visível e sem armadilhas.',
            'Conteúdo mudou sem trocar de página: mova o foco. Diálogo: <dialog> com showModal e foco de volta ao fechar.',
            'role="status" para avisos, role="alert" só para urgências; a região existe antes do texto.',
            'Contraste: 4,5:1 texto comum, 3:1 texto grande e componentes.',
            '320 px sem rolagem lateral; teste com teclado e leitor de tela, não só com ferramentas.',
          ],
        },
        {
          type: 'paragraph',
          text: 'Na Biblioteca: "Checklist rápido de acessibilidade".',
        },
      ],
    },
  ],
};
