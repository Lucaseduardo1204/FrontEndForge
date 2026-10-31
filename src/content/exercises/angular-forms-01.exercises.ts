import { Exercise } from '../../app/core/models/content.models';

/** Executed against the real Signal Forms API in `src/content/angular-forms.spec.ts`. */
export const ERRORS_PREDICT_TS = `// Num componente: form() precisa de um contexto de injeção, como um inicializador de campo.
readonly modelo = signal({ email: '' });
readonly f = form(this.modelo, (c) => {
  required(c.email);
  email(c.email);
});

verErros() {
  console.log(this.f.email().errors().map((e) => e.kind).join(','));
  this.modelo.set({ email: 'ana@' });
  console.log(this.f.email().errors().map((e) => e.kind).join(','));
}`;

export const ANGULAR_FORMS_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'forms-01-errors',
    kind: 'predict-output',
    title: 'Quais erros o campo tem?',
    difficulty: 'intermediate',
    conceptIds: ['angular-signal-forms'],
    prompt: [
      {
        type: 'paragraph',
        text: 'signal vem de @angular/core; form, required e email, de @angular/forms/signals. O que o método verErros() mostra no console? Digite as duas linhas separadas por espaço.',
      },
    ],
    language: 'typescript',
    code: ERRORS_PREDICT_TS,
    acceptedAnswers: ['required email'],
    explanation:
      'Vazio, o campo só tem o erro required: o validador email não acusa campo vazio (essa é a função do required). Com "ana@", o campo deixa de estar vazio e passa a ter só o erro email.',
    commonMistakes: [
      {
        answer: 'required,email email',
        explanation:
          'email não acusa campo vazio. Por isso os dois validadores costumam andar juntos: required cuida do vazio e email do formato.',
      },
      {
        answer: 'required required,email',
        explanation:
          'Com "ana@" o campo já não está vazio, então required é satisfeito. Sobra só o erro de formato.',
      },
    ],
    wrongAnswerGuidance:
      'Não é isso. Pense em cada validador separadamente: qual deles reclama de campo vazio e qual reclama de formato?',
    hints: ['O validador email acusa um campo vazio?', '"ana@" está vazio?'],
    solution: [{ type: 'paragraph', text: 'Saída: required, depois email.' }],
  },
  {
    id: 'forms-01-cross-field',
    kind: 'multiple-choice',
    title: 'Senha e confirmação',
    difficulty: 'intermediate',
    conceptIds: ['angular-signal-forms'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Como declarar a regra "a confirmação precisa ser igual à senha" para que a mensagem apareça no campo de confirmação?',
      },
    ],
    options: [
      {
        id: 'validate',
        text: 'validate(c.confirmacao, ({ value, valueOf }) => value() === valueOf(c.senha) ? undefined : { kind: "confirmacao", message: "..." })',
        explanation:
          'Correto. A regra fica no campo onde o erro deve aparecer, e valueOf lê o outro campo. Como tudo é signal, a regra é reavaliada quando qualquer um dos dois muda.',
      },
      {
        id: 'on-submit',
        text: 'Comparar os dois valores dentro da ação do submit e mostrar um alerta.',
        explanation:
          'Incorreto. A pessoa só descobre o problema depois de enviar, e a mensagem não fica ligada ao campo. Regras de validação pertencem ao esquema.',
      },
      {
        id: 'pattern',
        text: 'pattern(c.confirmacao, new RegExp(senha)).',
        explanation:
          'Incorreto. pattern serve para formatos fixos, como CEP. Usar a senha como expressão regular falha com caracteres especiais: um ponto ou um parêntese na senha mudam o sentido da expressão.',
      },
      {
        id: 'template',
        text: 'Uma condição no template: @if (senha !== confirmacao) { <p>As senhas não conferem.</p> }.',
        explanation:
          'Incorreto. O formulário continuaria válido e o submit enviaria os dados. A mensagem precisa vir de uma regra que torne o campo inválido.',
      },
    ],
    correctOptionIds: ['validate'],
    hints: ['Qual função do contexto lê o valor de outro campo?'],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `validate(c.confirmacao, ({ value, valueOf }) =>
  value() === valueOf(c.senha)
    ? undefined
    : { kind: 'confirmacao', message: 'As senhas não conferem.' },
);`,
      },
    ],
  },
  {
    id: 'forms-01-touched',
    kind: 'multiple-choice',
    title: 'Erros antes de digitar',
    difficulty: 'intermediate',
    conceptIds: ['angular-signal-forms'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Com a condição @if (cadastro.email().invalid()), a tela abre com mensagens de erro em todos os campos. Qual é a causa e a correção?',
      },
    ],
    options: [
      {
        id: 'touched',
        text: 'Campos obrigatórios vazios já são inválidos desde o início. Mostre o erro só quando o campo foi tocado: touched() && invalid().',
        explanation:
          'Correto. Validade e momento de mostrar são coisas diferentes. touched vira true quando a pessoa sai do campo, e submit marca todos os campos como tocados, então nada fica escondido na hora de enviar.',
      },
      {
        id: 'initial-value',
        text: 'Iniciar o modelo com null em vez de texto vazio.',
        explanation:
          'Incorreto. required também acusa null. O problema não é o valor inicial, é mostrar o erro antes de a pessoa ter interagido.',
      },
      {
        id: 'dirty',
        text: 'Trocar invalid() por dirty().',
        explanation:
          'Incorreto. dirty indica que o valor foi alterado, não que há erro. A mensagem apareceria em campos válidos e não apareceria em campos obrigatórios que a pessoa pulou.',
      },
      {
        id: 'remove-required',
        text: 'Remover required e validar só no envio.',
        explanation:
          'Incorreto. Perde-se a validação enquanto a pessoa preenche, e campos obrigatórios passam a aceitar vazio.',
      },
    ],
    correctOptionIds: ['touched'],
    hints: ['Um campo obrigatório vazio é válido ou inválido no primeiro instante?'],
    solution: [
      {
        type: 'code',
        language: 'html',
        code: `@if (cadastro.email().touched() && cadastro.email().invalid()) {
  <p id="email-erro" class="erro">{{ cadastro.email().errors()[0].message }}</p>
}`,
      },
    ],
  },
  {
    id: 'forms-01-submit',
    kind: 'multiple-choice',
    title: 'Enviar com erros',
    difficulty: 'intermediate',
    conceptIds: ['angular-signal-forms'],
    prompt: [
      {
        type: 'paragraph',
        text: 'A pessoa clica em "Criar conta" com o e-mail vazio. O que submit(this.cadastro, ação) faz?',
      },
    ],
    options: [
      {
        id: 'blocks',
        text: 'Não executa a ação, marca todos os campos como tocados (as mensagens aparecem) e a promise resolve com false.',
        explanation:
          'Correto. A ação só roda com o formulário válido. Marcar tudo como tocado faz o padrão touched() && invalid() mostrar todos os problemas de uma vez.',
      },
      {
        id: 'sends',
        text: 'Executa a ação mesmo assim; validar é responsabilidade do servidor.',
        explanation:
          'Incorreto. O servidor valida de novo, mas submit não envia um formulário inválido.',
      },
      {
        id: 'throws',
        text: 'Lança um erro que precisa ser tratado com try/catch.',
        explanation: 'Incorreto. Formulário inválido não é exceção: a promise resolve com false.',
      },
      {
        id: 'silent',
        text: 'Não faz nada visível; os campos continuam como estavam.',
        explanation:
          'Incorreto. Os campos são marcados como tocados, justamente para que as mensagens apareçam.',
      },
    ],
    correctOptionIds: ['blocks'],
    hints: ['O que acontece com touched quando se tenta enviar?'],
    solution: [
      {
        type: 'paragraph',
        text: 'submit faz o trabalho de bloquear o envio e revelar os erros; o template só precisa mostrar as mensagens dos campos tocados.',
      },
    ],
  },
  {
    id: 'forms-01-aria',
    kind: 'multiple-choice',
    title: 'O erro que o leitor de tela não anuncia',
    difficulty: 'intermediate',
    conceptIds: ['angular-signal-forms', 'html-form-labels'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O input tem [formField]="cadastro.email" e a mensagem de erro aparece em vermelho logo abaixo. Para quem usa leitor de tela, o que falta?',
      },
    ],
    options: [
      {
        id: 'aria',
        text: 'Marcar o campo com [attr.aria-invalid] e ligá-lo à mensagem com [attr.aria-describedby] apontando para o id dela.',
        explanation:
          'Correto. [formField] coloca o atributo required, mas não aria-invalid nem a ligação com a mensagem. Com os dois, o leitor anuncia que o campo é inválido e lê a mensagem ao focá-lo.',
      },
      {
        id: 'nothing',
        text: 'Nada: [formField] já informa o erro ao leitor de tela.',
        explanation:
          'Incorreto. A diretiva não define aria-invalid nem aria-describedby; é preciso fazer isso no template.',
      },
      {
        id: 'color',
        text: 'Usar um vermelho mais forte na mensagem.',
        explanation:
          'Incorreto. Cor não chega a quem não enxerga a tela, e cor sozinha não deve indicar erro para ninguém.',
      },
      {
        id: 'alert-everything',
        text: 'Colocar role="alert" em todas as mensagens.',
        explanation:
          'Incorreto aqui. Cada mensagem nova interromperia a leitura enquanto a pessoa navega, e o campo continuaria sem estado de inválido. Ligar a mensagem ao campo é o padrão.',
      },
    ],
    correctOptionIds: ['aria'],
    hints: ['Como o leitor de tela sabe que um texto descreve um campo?'],
    solution: [
      {
        type: 'code',
        language: 'html',
        code: `<input
  id="email"
  [formField]="cadastro.email"
  [attr.aria-invalid]="mostrarErro(cadastro.email) ? 'true' : null"
  [attr.aria-describedby]="mostrarErro(cadastro.email) ? 'email-erro' : null"
/>`,
      },
    ],
  },
  {
    id: 'forms-01-novalidate',
    kind: 'multiple-choice',
    title: 'Por que novalidate?',
    difficulty: 'intermediate',
    conceptIds: ['angular-signal-forms'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Sem o atributo novalidate no <form>, o que acontece quando a pessoa tenta enviar com o e-mail vazio?',
      },
    ],
    options: [
      {
        id: 'native',
        text: 'O navegador valida antes, por causa do atributo required que [formField] colocou: mostra o próprio balão de erro e nem dispara o evento submit.',
        explanation:
          'Correto. A validação nativa age antes do JavaScript. Com novalidate, ela é desligada e o formulário passa a ter um único conjunto de mensagens, as suas, ligadas aos campos.',
      },
      {
        id: 'same',
        text: 'Nada muda: o Angular sempre trata o envio.',
        explanation:
          'Incorreto. Com campos required e sem novalidate, o navegador bloqueia o envio antes de o Angular receber o evento.',
      },
      {
        id: 'sends-empty',
        text: 'O formulário é enviado vazio ao servidor.',
        explanation:
          'Incorreto. O navegador bloqueia, e mesmo que não bloqueasse, submit não executaria a ação com o formulário inválido.',
      },
      {
        id: 'reload',
        text: 'A página recarrega.',
        explanation:
          'Incorreto. O envio é bloqueado pelo navegador; e quando o evento chega, o preventDefault do exemplo impede o recarregamento.',
      },
    ],
    correctOptionIds: ['native'],
    hints: ['Qual atributo [formField] coloca no input quando o campo é obrigatório?'],
    solution: [
      {
        type: 'code',
        language: 'html',
        code: `<form (submit)="enviar($event)" novalidate>`,
      },
    ],
  },
];
