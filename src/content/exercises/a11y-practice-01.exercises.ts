import { Exercise } from '../../app/core/models/content.models';

export const A11Y_PRACTICE_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-js-contrast',
    kind: 'code',
    language: 'javascript',
    title: 'Calcule o contraste da WCAG',
    difficulty: 'intermediate',
    conceptIds: ['a11y-contrast'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Implemente razaoDeContraste(cor1, cor2) com a fórmula da WCAG e atendeAA(razao, textoGrande), que diz se a razão cumpre o nível AA.',
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'Cada canal (r, g, b) de 0 a 255 vira c = canal / 255.',
          'Linearize: se c <= 0,04045, use c / 12,92; senão, ((c + 0,055) / 1,055) elevado a 2,4.',
          'Luminância relativa: L = 0,2126 × R + 0,7152 × G + 0,0722 × B (com os canais linearizados).',
          'Razão: (L da cor mais clara + 0,05) / (L da cor mais escura + 0,05).',
        ],
      },
    ],
    requirements: [
      'As cores chegam como "#rrggbb" ou "#rgb", em maiúsculas ou minúsculas.',
      'A ordem das cores não importa.',
      'atendeAA exige 4,5 para texto comum e 3 para texto grande.',
    ],
    examples: [
      { input: "razaoDeContraste('#000000', '#ffffff')", output: '21' },
      { input: "razaoDeContraste('#767676', '#fff')", output: 'cerca de 4,54' },
      { input: 'atendeAA(4.48, false)', output: 'false' },
    ],
    starterCode: `function razaoDeContraste(cor1, cor2) {
  // Seu código aqui
}

function atendeAA(razao, textoGrande) {
  // Seu código aqui
}

console.log(razaoDeContraste('#000000', '#ffffff')); // esperado: 21
`,
    tests: [
      {
        id: 'extremes',
        description: 'Preto e branco dão 21; cores iguais dão 1',
        source:
          "expect(razaoDeContraste('#000000', '#ffffff')).toBeCloseTo(21, 2); expect(razaoDeContraste('#336699', '#336699')).toBeCloseTo(1, 2);",
      },
      {
        id: 'order',
        description: 'A ordem das cores não importa',
        source:
          "expect(razaoDeContraste('#ffffff', '#767676')).toBeCloseTo(razaoDeContraste('#767676', '#ffffff'), 6);",
      },
      {
        id: 'threshold',
        description: '#767676 sobre branco dá cerca de 4,54; #777777 dá cerca de 4,48',
        source:
          "expect(razaoDeContraste('#767676', '#ffffff')).toBeCloseTo(4.54, 2); expect(razaoDeContraste('#777777', '#ffffff')).toBeCloseTo(4.48, 2);",
      },
      {
        id: 'short-hex',
        description: 'Aceita "#rgb" e maiúsculas',
        source:
          "expect(razaoDeContraste('#FFF', '#000')).toBeCloseTo(21, 2); expect(razaoDeContraste('#abc', '#AABBCC')).toBeCloseTo(1, 2);",
      },
      {
        id: 'platform',
        description: 'Texto secundário desta plataforma sobre o fundo escuro: cerca de 7,94',
        source: "expect(razaoDeContraste('#a3aab4', '#111317')).toBeCloseTo(7.94, 2);",
      },
      {
        id: 'aa',
        description: 'atendeAA: 4,5 para texto comum, 3 para texto grande',
        source:
          'expect(atendeAA(4.5, false)).toBe(true); expect(atendeAA(4.48, false)).toBe(false); expect(atendeAA(3, true)).toBe(true); expect(atendeAA(2.99, true)).toBe(false);',
      },
    ],
    hints: [
      'Para "#rgb", repita cada dígito: "#abc" vira "#aabbcc".',
      'parseInt(trecho, 16) converte "ff" em 255.',
      'Calcule as duas luminâncias e use Math.max e Math.min para saber qual é a mais clara.',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `function luminancia(cor) {
  let hex = cor.replace('#', '');
  if (hex.length === 3) hex = [...hex].map((d) => d + d).join(''); // #abc -> #aabbcc
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function razaoDeContraste(cor1, cor2) {
  const a = luminancia(cor1);
  const b = luminancia(cor2);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function atendeAA(razao, textoGrande) {
  return razao >= (textoGrande ? 3 : 4.5);
}`,
      },
      {
        type: 'paragraph',
        text: 'A linearização existe porque o olho humano não percebe o brilho de forma linear; o verde pesa mais que o vermelho e o azul pelo mesmo motivo. É a mesma conta que o DevTools e o axe fazem.',
      },
    ],
  },
  {
    id: 'a11y-01-live',
    kind: 'multiple-choice',
    title: 'Como anunciar "Progresso salvo"?',
    difficulty: 'intermediate',
    conceptIds: ['a11y-keyboard-focus'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Depois de salvar, aparece o texto "Progresso salvo." perto do botão. Como fazer o leitor de tela anunciar, sem atrapalhar?',
      },
    ],
    options: [
      {
        id: 'status',
        text: 'Ter na página, desde o início, um <p role="status"> vazio, e só trocar o texto dele depois de salvar.',
        explanation:
          'Correto. role="status" é uma região viva educada: o leitor anuncia quando terminar o que está lendo. Ela precisa existir antes da mudança, senão alguns leitores não percebem o texto novo.',
      },
      {
        id: 'alert',
        text: 'Usar role="alert" na mensagem.',
        explanation:
          'Incorreto aqui. alert interrompe o que estiver sendo lido; é para erros urgentes, não para confirmações.',
      },
      {
        id: 'focus',
        text: 'Mover o foco para a mensagem.',
        explanation:
          'Incorreto. A pessoa perde o lugar onde estava (o botão) só para ouvir uma confirmação. Mover o foco é para mudanças de contexto.',
      },
      {
        id: 'color',
        text: 'Mostrar a mensagem em verde, que já indica sucesso.',
        explanation:
          'Incorreto. Cor não chega a quem não enxerga a tela, e cor sozinha não deve transmitir informação.',
      },
    ],
    correctOptionIds: ['status'],
    hints: ['Qual tipo de região viva espera a pessoa terminar de ouvir?'],
    solution: [
      {
        type: 'code',
        language: 'html',
        code: `<p role="status">{{ mensagem() }}</p>`,
      },
    ],
  },
  {
    id: 'a11y-01-modal',
    kind: 'multiple-choice',
    title: 'O modal feito de div',
    difficulty: 'intermediate',
    conceptIds: ['a11y-keyboard-focus', 'a11y-interactive-elements'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O modal da etapa de depuração funciona com mouse. O que falta para quem usa teclado ou leitor de tela, e qual é a correção mais simples?',
      },
    ],
    options: [
      {
        id: 'native-dialog',
        text: 'O foco não entra no modal, o Tab continua andando pela página atrás, Esc não fecha e o "botão" não é um botão. Trocar por <dialog> com showModal(), botões de verdade e foco devolvido ao fechar.',
        explanation:
          'Correto. O elemento nativo resolve fundo inerte, foco inicial e Esc de uma vez (medido no Chromium); os <button> resolvem foco e teclado das ações.',
      },
      {
        id: 'zindex',
        text: 'Aumentar o z-index do fundo para bloquear a página.',
        explanation:
          'Incorreto. Isso bloqueia o mouse; o Tab continua chegando aos elementos atrás.',
      },
      {
        id: 'aria-modal',
        text: 'Adicionar aria-modal="true" ao div.',
        explanation:
          'Incorreto sozinho. Informa o leitor de tela, mas não move o foco, não prende o Tab nem fecha com Esc; tudo isso continuaria por sua conta.',
      },
      {
        id: 'nothing',
        text: 'Nada: modais não precisam funcionar com teclado.',
        explanation:
          'Incorreto. Uma ação destrutiva inacessível pelo teclado é uma barreira completa para quem não usa mouse.',
      },
    ],
    correctOptionIds: ['native-dialog'],
    hints: ['O que o elemento <dialog> faz sozinho quando aberto com showModal()?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Use o exemplo de confirmação da lição: <dialog>, showModal(), autofocus na opção segura e foco de volta ao botão que abriu.',
      },
    ],
  },
  {
    id: 'a11y-01-contrast-levels',
    kind: 'multiple-choice',
    title: 'Qual combinação passa em AA?',
    difficulty: 'intermediate',
    conceptIds: ['a11y-contrast'],
    prompt: [
      { type: 'paragraph', text: 'Qual destes casos cumpre o contraste mínimo do nível AA?' },
    ],
    options: [
      {
        id: 'large',
        text: 'Título de 28 px com razão de 3,2:1.',
        explanation:
          'Correto. Texto grande (a partir de 24 px, ou 18,66 px em negrito) precisa de 3:1. 3,2 passa.',
      },
      {
        id: 'small',
        text: 'Texto de 14 px com razão de 4,48:1.',
        explanation: 'Incorreto. Texto comum precisa de 4,5:1; 4,48 fica abaixo, por pouco.',
      },
      {
        id: 'border',
        text: 'Borda de campo de formulário com razão de 1,8:1 em relação ao fundo.',
        explanation:
          'Incorreto. Componentes de interface, como a borda que mostra onde o campo está, precisam de 3:1.',
      },
      {
        id: 'placeholder',
        text: 'Placeholder de 16 px com razão de 2,5:1, porque é só uma dica.',
        explanation:
          'Incorreto. Texto é texto: placeholders também precisam de 4,5:1 (e não substituem o rótulo).',
      },
    ],
    correctOptionIds: ['large'],
    hints: ['Qual é o mínimo para texto grande? E para componentes?'],
    solution: [
      {
        type: 'list',
        ordered: false,
        items: [
          'Texto comum: 4,5:1',
          'Texto grande: 3:1',
          'Componentes e indicadores de foco: 3:1',
        ],
      },
    ],
  },
  {
    id: 'a11y-01-focus-spa',
    kind: 'multiple-choice',
    title: 'A etapa mudou, e o foco?',
    difficulty: 'intermediate',
    conceptIds: ['a11y-keyboard-focus'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Numa lição em etapas, a pessoa clica em "Próxima" (pelo teclado). O conteúdo troca, mas o foco continua no botão, que agora está no fim da página nova. O que fazer?',
      },
    ],
    options: [
      {
        id: 'heading',
        text: 'Depois de renderizar a etapa nova, mover o foco para o título dela (com tabindex="-1").',
        explanation:
          'Correto. O leitor de tela anuncia o título e a pessoa continua a leitura do começo da etapa, como numa página nova. É o que esta plataforma faz.',
      },
      {
        id: 'nothing',
        text: 'Nada: a pessoa pode voltar com Shift+Tab até o começo.',
        explanation:
          'Incorreto. Quem usa leitor de tela nem sabe que o conteúdo mudou, e quem usa teclado precisa voltar por todos os elementos.',
      },
      {
        id: 'reload',
        text: 'Recarregar a página a cada etapa.',
        explanation: 'Incorreto. Perde o estado e fica lento; mover o foco resolve sem isso.',
      },
      {
        id: 'alert',
        text: 'Anunciar "Etapa mudou" com role="alert".',
        explanation:
          'Incompleto. Avisa, mas deixa o foco no lugar errado, e alert interrompe sem necessidade.',
      },
    ],
    correctOptionIds: ['heading'],
    hints: ['Onde a pessoa deveria continuar a leitura?'],
    solution: [
      {
        type: 'code',
        language: 'html',
        code: `<h2 #titulo tabindex="-1">{{ etapa().titulo }}</h2>`,
      },
    ],
  },
  {
    id: 'a11y-01-tools',
    kind: 'multiple-choice',
    title: 'O axe não encontrou nada',
    difficulty: 'intermediate',
    conceptIds: ['a11y-keyboard-focus', 'a11y-contrast'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Uma auditoria com axe em todas as páginas retornou zero violações. O que se pode concluir?',
      },
    ],
    options: [
      {
        id: 'partial',
        text: 'Que os problemas detectáveis automaticamente não foram encontrados. Ainda é preciso testar com teclado, leitor de tela, zoom e pessoas reais.',
        explanation:
          'Correto. Ferramentas não sabem se a ordem de foco faz sentido, se um alt descreve bem a imagem ou se uma mensagem é anunciada na hora certa. Esta plataforma tem zero violações do axe e mesmo assim registra que ainda não foi testada com leitor de tela real.',
      },
      {
        id: 'done',
        text: 'Que a aplicação está totalmente acessível.',
        explanation: 'Incorreto. Boa parte dos critérios da WCAG exige julgamento humano.',
      },
      {
        id: 'useless',
        text: 'Que ferramentas automáticas não servem para nada.',
        explanation:
          'Incorreto. Elas pegam muitos erros comuns de forma rápida e repetível; só não pegam tudo.',
      },
      {
        id: 'wcag-certified',
        text: 'Que a aplicação pode declarar conformidade WCAG AA.',
        explanation:
          'Incorreto. Conformidade exige avaliar todos os critérios, inclusive os manuais.',
      },
    ],
    correctOptionIds: ['partial'],
    hints: ['Uma ferramenta consegue avaliar se um texto alternativo descreve bem a imagem?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Automático para o que é repetível; manual para o resto. Os dois, sempre.',
      },
    ],
  },
];
