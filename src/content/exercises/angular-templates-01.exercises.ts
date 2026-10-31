import { Exercise } from '../../app/core/models/content.models';

export const ANGULAR_TEMPLATES_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-js-relative-time',
    kind: 'code',
    language: 'javascript',
    title: 'A lógica de um pipe de tempo relativo',
    difficulty: 'intermediate',
    conceptIds: ['angular-pipes'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Escreva tempoRelativo(data, agora), a função que um pipe "tempoRelativo" chamaria. Ela recebe duas datas e devolve o texto em português, usando Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" }).',
      },
    ],
    requirements: [
      'Calcule a diferença em segundos (data − agora): negativa é passado, positiva é futuro.',
      'Escolha a unidade pelo tamanho da diferença: menos de 60 s, segundos; menos de 60 min, minutos; menos de 24 h, horas; menos de 30 dias, dias; menos de 365 dias, meses (de 30 dias); senão, anos (de 365 dias).',
      'Arredonde o valor na unidade escolhida com Math.round.',
      'Receba agora como parâmetro: a função é pura e fácil de testar.',
    ],
    examples: [
      { input: 'tempoRelativo(new Date(agora - 3 * 60_000), agora)', output: "'há 3 minutos'" },
      { input: 'tempoRelativo(new Date(agora - 24 * 3600_000), agora)', output: "'ontem'" },
    ],
    starterCode: `function tempoRelativo(data, agora) {
  // Seu código aqui
}

const agora = new Date('2026-10-30T12:00:00Z');
console.log(tempoRelativo(new Date('2026-10-30T11:57:00Z'), agora)); // esperado: há 3 minutos
`,
    tests: [
      {
        id: 'now',
        description: 'Diferença zero é "agora"; 30 s atrás, "há 30 segundos"',
        source:
          "const a = new Date('2026-10-30T12:00:00Z'); expect(tempoRelativo(a, a)).toBe('agora'); expect(tempoRelativo(new Date(a.getTime() - 30_000), a)).toBe('há 30 segundos');",
      },
      {
        id: 'minutes-hours',
        description: 'Minutos e horas, no passado e no futuro',
        source:
          "const a = new Date('2026-10-30T12:00:00Z'); const t = (ms) => tempoRelativo(new Date(a.getTime() + ms), a); expect(t(-3 * 60_000)).toBe('há 3 minutos'); expect(t(3 * 60_000)).toBe('em 3 minutos'); expect(t(-5 * 3600_000)).toBe('há 5 horas');",
      },
      {
        id: 'days',
        description: 'Ontem, amanhã, depois de amanhã e há 3 dias',
        source:
          "const a = new Date('2026-10-30T12:00:00Z'); const d = 86_400_000; const t = (ms) => tempoRelativo(new Date(a.getTime() + ms), a); expect(t(-d)).toBe('ontem'); expect(t(d)).toBe('amanhã'); expect(t(2 * d)).toBe('depois de amanhã'); expect(t(-3 * d)).toBe('há 3 dias');",
      },
      {
        id: 'months-years',
        description: 'Meses e anos',
        source:
          "const a = new Date('2026-10-30T12:00:00Z'); const d = 86_400_000; const t = (ms) => tempoRelativo(new Date(a.getTime() + ms), a); expect(t(-60 * d)).toBe('há 2 meses'); expect(t(-400 * d)).toBe('ano passado');",
      },
      {
        id: 'boundaries',
        description: 'Limites: 59 s ainda é segundos; 60 s já é minuto',
        source:
          "const a = new Date('2026-10-30T12:00:00Z'); const t = (ms) => tempoRelativo(new Date(a.getTime() + ms), a); expect(t(-59_000)).toBe('há 59 segundos'); expect(t(-60_000)).toBe('há 1 minuto');",
      },
    ],
    hints: [
      'const segundos = (data - agora) / 1000; trabalhe com Math.abs(segundos) para escolher a unidade.',
      'Uma tabela [limite, unidade, divisor] percorrida em ordem deixa o código curto.',
      'Crie o Intl.RelativeTimeFormat uma vez, fora da função.',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `const FORMATO = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

// [até quantos segundos, unidade, segundos por unidade]
const UNIDADES = [
  [60, 'second', 1],
  [3600, 'minute', 60],
  [86_400, 'hour', 3600],
  [30 * 86_400, 'day', 86_400],
  [365 * 86_400, 'month', 30 * 86_400],
  [Infinity, 'year', 365 * 86_400],
];

function tempoRelativo(data, agora) {
  const segundos = (data - agora) / 1000;
  const [, unidade, divisor] = UNIDADES.find(([limite]) => Math.abs(segundos) < limite);
  return FORMATO.format(Math.round(segundos / divisor), unidade);
}`,
      },
      {
        type: 'paragraph',
        text: 'O Intl cuida do idioma ("ontem", "depois de amanhã", plurais); a função só escolhe a unidade. Como agora é um parâmetro, o pipe chama tempoRelativo(data, new Date()) e os testes passam uma data fixa. Num pipe puro, o texto só é recalculado quando a data muda: para "há 3 minutos" envelhecer na tela, é preciso um signal de relógio que mude de tempos em tempos.',
      },
    ],
  },
  {
    id: 'templates-01-attr',
    kind: 'multiple-choice',
    title: 'aria-expanded fechado',
    difficulty: 'intermediate',
    conceptIds: ['angular-templates'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Um botão de expandir usa [attr.aria-expanded]="aberto()". O que aparece no DOM quando aberto() é false?',
      },
    ],
    options: [
      {
        id: 'false-text',
        text: 'aria-expanded="false": o valor vira texto, e é exatamente o que o leitor de tela precisa para anunciar "recolhido".',
        explanation:
          'Correto. Medido nesta versão do Angular. Só null (ou undefined) remove o atributo.',
      },
      {
        id: 'removed',
        text: 'O atributo é removido.',
        explanation: 'Seria assim com null. false vira o texto "false".',
      },
      {
        id: 'empty',
        text: 'aria-expanded="" (vazio).',
        explanation:
          'Incorreto. Atributo vazio é o que [disabled]="true" gera, por ser uma propriedade booleana.',
      },
      {
        id: 'error',
        text: 'Erro: aria-expanded só aceita string.',
        explanation: 'Incorreto. O valor é convertido para texto.',
      },
    ],
    correctOptionIds: ['false-text'],
    hints: ['Qual valor remove um atributo no binding [attr.]?'],
    solution: [{ type: 'paragraph', text: 'false → "false"; null → atributo removido.' }],
  },
  {
    id: 'templates-01-stale-pipe',
    kind: 'multiple-choice',
    title: 'O total que não atualiza',
    difficulty: 'intermediate',
    conceptIds: ['angular-pipes'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Na etapa de depuração, por que o total do pipe não muda, e qual é a correção?',
      },
    ],
    options: [
      {
        id: 'reference',
        text: 'O pipe puro só roda quando a referência do argumento muda; push mantém o mesmo array. Use this.itens.update((l) => [...l, valor]).',
        explanation:
          'Correto. Medido: depois de um push e de outro signal mudar, o pipe não rodou e a tela mostrou o total velho; com um array novo, rodou e mostrou o certo. E o contador "para forçar" deixa de ser necessário.',
      },
      {
        id: 'impure',
        text: 'Marcar o pipe como pure: false.',
        explanation:
          'Funciona, mas o pipe passa a rodar a cada atualização da view, e o array continua sendo alterado no lugar.',
      },
      {
        id: 'cd',
        text: 'Chamar detectChanges depois do push.',
        explanation:
          'A view é verificada, mas o pipe puro vê a mesma referência e devolve o valor guardado.',
      },
      {
        id: 'async',
        text: 'Usar o pipe async.',
        explanation: 'Incorreto. Não há Observable aqui.',
      },
    ],
    correctOptionIds: ['reference'],
    hints: ['O que o pipe puro compara para decidir se roda?'],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `adicionar(valor: number) {\n  this.itens.update((lista) => [...lista, valor]);\n}`,
      },
    ],
  },
  {
    id: 'templates-01-escape',
    kind: 'multiple-choice',
    title: 'O comentário com HTML',
    difficulty: 'intermediate',
    conceptIds: ['angular-templates'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Um comentário de cliente contém "<b>ótimo</b>". O template exibe {{ comentario }}. O que aparece?',
      },
    ],
    options: [
      {
        id: 'text',
        text: 'O texto literal "<b>ótimo</b>", sem negrito: interpolação insere texto, não HTML.',
        explanation:
          'Correto. Medido: nenhum elemento <b> foi criado. É a proteção padrão contra HTML e scripts injetados.',
      },
      {
        id: 'bold',
        text: '"ótimo" em negrito.',
        explanation:
          'Isso só aconteceria com [innerHTML], e mesmo assim passando pela sanitização do Angular.',
      },
      {
        id: 'empty',
        text: 'Nada: o Angular remove o conteúdo perigoso.',
        explanation: 'Incorreto. Na interpolação nada é removido; tudo vira texto.',
      },
      {
        id: 'error',
        text: 'Um erro de segurança no console.',
        explanation: 'Incorreto. Não há erro; é o comportamento esperado.',
      },
    ],
    correctOptionIds: ['text'],
    hints: ['Interpolação insere texto ou HTML?'],
    solution: [{ type: 'paragraph', text: 'Interpolação: sempre texto.' }],
  },
  {
    id: 'templates-01-locale',
    kind: 'multiple-choice',
    title: 'R$1,234.50',
    difficulty: 'intermediate',
    conceptIds: ['angular-pipes'],
    prompt: [
      {
        type: 'paragraph',
        text: "Numa aplicação brasileira, {{ 1234.5 | currency: 'BRL' }} aparece como R$1,234.50. O que falta?",
      },
    ],
    options: [
      {
        id: 'locale',
        text: 'Registrar os dados do locale (registerLocaleData com o de pt) e definir LOCALE_ID como pt-BR.',
        explanation:
          'Correto. Medido: sem LOCALE_ID, o padrão é en-US e o resultado foi R$1,234.50; com LOCALE_ID pt-BR mas sem registrar os dados, o Angular lançou NG0701. As duas peças são necessárias.',
      },
      {
        id: 'currency-code',
        text: "Trocar 'BRL' por 'R$'.",
        explanation: 'Incorreto. O pipe recebe o código ISO da moeda; o formato vem do locale.',
      },
      {
        id: 'only-id',
        text: 'Só definir LOCALE_ID como pt-BR.',
        explanation: 'Sem os dados do locale, o resultado medido foi o erro NG0701.',
      },
      {
        id: 'intl',
        text: 'Não usar o pipe: o Angular não formata moeda brasileira.',
        explanation: 'Formata, desde que o locale esteja configurado.',
      },
    ],
    correctOptionIds: ['locale'],
    hints: ['De onde o pipe tira o separador decimal?'],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `registerLocaleData(localePt);\n// app.config.ts\n{ provide: LOCALE_ID, useValue: 'pt-BR' }`,
      },
    ],
  },
  {
    id: 'templates-01-disabled',
    kind: 'multiple-choice',
    title: '[disabled] ou [attr.disabled]?',
    difficulty: 'intermediate',
    conceptIds: ['angular-templates'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Para desabilitar um botão conforme um signal salvando(), qual binding é o adequado?',
      },
    ],
    options: [
      {
        id: 'prop',
        text: '[disabled]="salvando()": a propriedade booleana; com false, o botão fica habilitado e sem atributo.',
        explanation:
          'Correto. Medido: [disabled]="false" deixou o botão habilitado e sem o atributo; [disabled]="true" o desabilitou.',
      },
      {
        id: 'attr-false',
        text: '[attr.disabled]="salvando()".',
        explanation:
          'Com false, o atributo vira disabled="false", e qualquer atributo disabled desabilita o botão, mesmo com o texto "false".',
      },
      {
        id: 'class',
        text: '[class.desabilitado]="salvando()".',
        explanation:
          'Só muda a aparência: o botão continua clicável e não é anunciado como indisponível.',
      },
      {
        id: 'interpolation',
        text: 'disabled="{{ salvando() }}".',
        explanation: 'Gera um atributo com texto, que desabilita mesmo quando o texto é "false".',
      },
    ],
    correctOptionIds: ['prop'],
    hints: ['Atributos booleanos do HTML valem pela presença, não pelo texto.'],
    solution: [
      {
        type: 'code',
        language: 'html',
        code: `<button type="submit" [disabled]="salvando()">Salvar</button>`,
      },
    ],
  },
];
