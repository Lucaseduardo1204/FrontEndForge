import { Exercise } from '../../app/core/models/content.models';

export const HTML_FORMS_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-html-signup-form',
    kind: 'code',
    language: 'html',
    title: 'Um formulário de cadastro nativo e correto',
    difficulty: 'introductory',
    conceptIds: ['html-forms', 'html-form-labels'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Reescreva o formulário com os tipos, atributos e agrupamentos certos. Os testes verificam a estrutura e os atributos, não o texto exato.',
      },
    ],
    requirements: [
      'Um campo de e-mail do tipo email, obrigatório, com autocomplete="email" e rótulo ligado.',
      'Um campo de telefone do tipo tel, com autocomplete="tel" e rótulo ligado.',
      'Um campo de senha do tipo password, obrigatório, com pelo menos 8 caracteres (minlength) e autocomplete="new-password".',
      'As opções de plano (mensal e anual) como radios com o mesmo name, dentro de um fieldset com legend.',
      'Um botão de envio (type="submit") dentro do form.',
    ],
    examples: [],
    starterCode: `<form>
  E-mail: <input name="email">
  Telefone: <input name="telefone">
  Senha: <input name="senha">
  <div>Plano</div>
  <input type="checkbox" name="mensal"> Mensal
  <input type="checkbox" name="anual"> Anual
  <div class="botao">Criar conta</div>
</form>
`,
    tests: [
      {
        id: 'email',
        description: 'E-mail: type email, obrigatório, autocomplete email e com rótulo',
        source:
          "const e = document.querySelector('input[type=email]'); expect(e).toBeTruthy(); expect(e.required).toBe(true); expect(e.getAttribute('autocomplete')).toBe('email'); expect(e.labels.length > 0).toBe(true);",
      },
      {
        id: 'tel',
        description: 'Telefone: type tel, autocomplete tel e com rótulo',
        source:
          "const t = document.querySelector('input[type=tel]'); expect(t).toBeTruthy(); expect(t.getAttribute('autocomplete')).toBe('tel'); expect(t.labels.length > 0).toBe(true);",
      },
      {
        id: 'password',
        description:
          'Senha: type password, obrigatória, minlength 8 ou mais, autocomplete new-password',
        source:
          "const s = document.querySelector('input[type=password]'); expect(s).toBeTruthy(); expect(s.required).toBe(true); expect(Number(s.getAttribute('minlength')) >= 8).toBe(true); expect(s.getAttribute('autocomplete')).toBe('new-password'); expect(s.labels.length > 0).toBe(true);",
      },
      {
        id: 'radios',
        description: 'Planos como radios de mesmo name, dentro de fieldset com legend',
        source:
          "const radios = Array.from(document.querySelectorAll('input[type=radio]')); expect(radios.length >= 2).toBe(true); expect(new Set(radios.map((r) => r.name)).size).toBe(1); expect(radios.every((r) => r.closest('fieldset'))).toBe(true); const legenda = radios[0].closest('fieldset').querySelector('legend'); expect(legenda).toBeTruthy(); expect(legenda.textContent.trim().length > 0).toBe(true);",
      },
      {
        id: 'radio-labels',
        description: 'Cada radio tem rótulo',
        source:
          "expect(Array.from(document.querySelectorAll('input[type=radio]')).every((r) => r.labels.length > 0)).toBe(true);",
      },
      {
        id: 'submit',
        description: 'Há um botão de envio dentro do form',
        source:
          "const b = document.querySelector('form button'); expect(b).toBeTruthy(); expect(b.type).toBe('submit');",
      },
    ],
    hints: [
      'Ligue cada rótulo ao campo com for e id, ou coloque o campo dentro do label.',
      'Opções exclusivas são radios com o mesmo name; checkboxes permitem marcar as duas.',
      'O título do grupo de opções vai em <legend>, como primeiro filho do <fieldset>.',
    ],
    solution: [
      {
        type: 'code',
        language: 'html',
        code: `<form>
  <label for="email">E-mail</label>
  <input id="email" name="email" type="email" required autocomplete="email">

  <label for="telefone">Telefone</label>
  <input id="telefone" name="telefone" type="tel" autocomplete="tel">

  <label for="senha">Senha</label>
  <input id="senha" name="senha" type="password" required minlength="8" autocomplete="new-password">

  <fieldset>
    <legend>Plano</legend>
    <label><input type="radio" name="plano" value="mensal" required> Mensal</label>
    <label><input type="radio" name="plano" value="anual"> Anual</label>
  </fieldset>

  <button type="submit">Criar conta</button>
</form>`,
      },
      {
        type: 'paragraph',
        text: 'Os tipos mudam teclado e validação, o autocomplete deixa o navegador ajudar, o fieldset dá nome ao grupo e os radios tornam a escolha exclusiva. Tudo isso sem uma linha de JavaScript.',
      },
    ],
  },
  {
    id: 'forms-html-01-minlength',
    kind: 'multiple-choice',
    title: 'minlength e o valor vindo do script',
    difficulty: 'introductory',
    conceptIds: ['html-forms'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Um campo tem minlength="8". O código preenche campo.value = "abc" (vindo de um rascunho salvo). O que campo.validity.valid diz?',
      },
    ],
    options: [
      {
        id: 'valid',
        text: 'true: minlength só é verificado quando a pessoa edita o campo; valores atribuídos por script não disparam essa regra.',
        explanation:
          'Correto, e surpreendente. Medido no Chromium: "abc" digitado deu tooShort; "abc" atribuído por script deu valid. Por isso a validação também precisa existir no código e no servidor.',
      },
      {
        id: 'invalid',
        text: 'false, com tooShort: 3 é menor que 8.',
        explanation:
          'Seria assim se a pessoa tivesse digitado; para valores atribuídos por script, o navegador não aplica minlength.',
      },
      {
        id: 'error',
        text: 'O navegador lança um erro ao atribuir um valor curto.',
        explanation: 'Incorreto. A atribuição sempre funciona.',
      },
      {
        id: 'truncated',
        text: 'O valor é completado com espaços até 8 caracteres.',
        explanation: 'Incorreto. O navegador nunca altera o valor por causa de minlength.',
      },
    ],
    correctOptionIds: ['valid'],
    hints: ['A regra de tamanho mínimo reage a quê?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Atributos ajudam quem preenche; a regra de verdade precisa estar também no código e no servidor.',
      },
    ],
  },
  {
    id: 'forms-html-01-button-type',
    kind: 'multiple-choice',
    title: 'O botão que envia sem querer',
    difficulty: 'introductory',
    conceptIds: ['html-forms'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Na etapa de depuração, clicar em "Mostrar senha" envia o formulário. Por quê?',
      },
    ],
    options: [
      {
        id: 'default-submit',
        text: 'Um <button> dentro de um <form> é type="submit" por padrão. O botão de mostrar senha precisa de type="button".',
        explanation:
          'Correto. Declare sempre o type: submit no botão que envia, button nos demais. Assim a intenção fica explícita e nenhum clique envia por acidente.',
      },
      {
        id: 'enter',
        text: 'O navegador envia ao clicar em qualquer elemento do formulário.',
        explanation: 'Incorreto. Só botões de envio (e Enter num campo) enviam.',
      },
      {
        id: 'js-bug',
        text: 'Falta preventDefault no clique do botão.',
        explanation: 'Funciona, mas trata o sintoma; o correto é o botão não ser de envio.',
      },
      {
        id: 'order',
        text: 'O primeiro botão do formulário sempre envia.',
        explanation: 'Incorreto. Qualquer botão sem type dentro do form envia, não só o primeiro.',
      },
    ],
    correctOptionIds: ['default-submit'],
    hints: ['Qual é o type padrão de um <button> dentro de um form?'],
    solution: [
      {
        type: 'code',
        language: 'html',
        code: `<button type="button">Mostrar senha</button>\n<button type="submit">Cadastrar</button>`,
      },
    ],
  },
  {
    id: 'forms-html-01-inputmode',
    kind: 'multiple-choice',
    title: 'O campo do CEP',
    difficulty: 'introductory',
    conceptIds: ['html-forms'],
    prompt: [{ type: 'paragraph', text: 'Qual é a melhor marcação para o campo de CEP?' }],
    options: [
      {
        id: 'inputmode',
        text: '<input inputmode="numeric" autocomplete="postal-code" pattern="\\d{5}-?\\d{3}">',
        explanation:
          'Correto. inputmode pede o teclado numérico no celular sem as regras de quantidade; autocomplete permite preencher sozinho; pattern descreve o formato.',
      },
      {
        id: 'number',
        text: '<input type="number">',
        explanation:
          'Incorreto. CEP não é quantidade. Medido no Chromium: digitar "01310-100" num type number deixou o value vazio (o hífen torna a entrada inválida), e o valueAsNumber de "01310" é 1310, sem o zero. Ainda aparecem setas de incremento.',
      },
      {
        id: 'text-only',
        text: '<input type="text">, sem mais nada.',
        explanation:
          'Funciona, mas perde o teclado numérico, o preenchimento automático e a validação de formato.',
      },
      {
        id: 'tel',
        text: '<input type="tel">',
        explanation:
          'Dá teclado numérico, mas comunica "telefone" ao navegador e a gerenciadores de dados.',
      },
    ],
    correctOptionIds: ['inputmode'],
    hints: ['CEP é um número que se soma ou um código?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Códigos numéricos (CEP, cartão, documento): inputmode="numeric", não type="number".',
      },
    ],
  },
  {
    id: 'forms-html-01-user-invalid',
    kind: 'multiple-choice',
    title: ':invalid ou :user-invalid?',
    difficulty: 'introductory',
    conceptIds: ['html-forms'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Com input:invalid { border-color: red; }, todos os campos obrigatórios aparecem vermelhos assim que a página abre. Qual é a correção em CSS?',
      },
    ],
    options: [
      {
        id: 'user-invalid',
        text: 'Trocar :invalid por :user-invalid, que só se aplica depois que a pessoa interagiu com o campo ou tentou enviar.',
        explanation:
          'Correto. Medido no Chromium: o campo obrigatório vazio já era inválido ao abrir, mas :user-invalid só aplicou o estilo depois da digitação e da saída do campo.',
      },
      {
        id: 'remove-required',
        text: 'Remover required dos campos.',
        explanation: 'Incorreto. Perde-se a regra para esconder o estilo.',
      },
      {
        id: 'focus',
        text: 'Trocar por :focus:invalid.',
        explanation:
          'Incorreto. O erro aparece enquanto a pessoa ainda está digitando e some quando ela sai do campo: o oposto do desejado.',
      },
      {
        id: 'js',
        text: 'Não há como em CSS; só com JavaScript.',
        explanation: 'Incorreto. :user-invalid existe nos navegadores atuais.',
      },
    ],
    correctOptionIds: ['user-invalid'],
    hints: ['Qual pseudo-classe espera a interação?'],
    solution: [
      {
        type: 'code',
        language: 'css',
        code: `input:user-invalid { border-color: var(--cor-erro); }`,
      },
    ],
  },
  {
    id: 'forms-html-01-fieldset',
    kind: 'multiple-choice',
    title: 'Agrupando as opções',
    difficulty: 'introductory',
    conceptIds: ['html-forms', 'html-form-labels'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Duas opções de entrega (radios) aparecem embaixo do texto "Forma de entrega" num <div>. Para quem usa leitor de tela, o que muda ao usar <fieldset> e <legend>?',
      },
    ],
    options: [
      {
        id: 'group-name',
        text: 'Ao chegar nas opções, o leitor anuncia o grupo "Forma de entrega"; com o <div>, ouve só "Retirar na loja, botão de opção", sem saber a que pergunta a opção responde.',
        explanation:
          'Correto. Medido na árvore de acessibilidade do Chromium: o fieldset vira um grupo com o nome da legend.',
      },
      {
        id: 'nothing',
        text: 'Nada: o texto do <div> já é lido antes das opções.',
        explanation:
          'Só na leitura linear. Quem navega pelos campos (Tab) pula direto para as opções e perde o contexto.',
      },
      {
        id: 'style',
        text: 'Só a aparência: fieldset desenha uma borda.',
        explanation:
          'A borda é o de menos; a semântica é o que importa, e a borda pode ser removida com CSS.',
      },
      {
        id: 'validation',
        text: 'O fieldset passa a validar as opções.',
        explanation: 'Incorreto. A validação vem de required nos radios.',
      },
    ],
    correctOptionIds: ['group-name'],
    hints: ['Quem navega com Tab passa pelo texto do <div>?'],
    solution: [
      {
        type: 'code',
        language: 'html',
        code: `<fieldset>
  <legend>Forma de entrega</legend>
  <label><input type="radio" name="entrega" value="retirar" required> Retirar na loja</label>
  <label><input type="radio" name="entrega" value="casa"> Entregar em casa</label>
</fieldset>`,
      },
    ],
  },
];
