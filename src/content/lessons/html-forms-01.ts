import { Lesson } from '../../app/core/models/content.models';

/** Native validation behaviour measured in a real Chromium (D-061). */
export const CHECKOUT_FORM_HTML = `<form action="/pedidos" method="post" novalidate>
  <label for="email">E-mail</label>
  <input id="email" name="email" type="email" required autocomplete="email" />

  <label for="cep">CEP</label>
  <input id="cep" name="cep" inputmode="numeric" pattern="\\d{5}-?\\d{3}"
         required autocomplete="postal-code" aria-describedby="cep-dica" />
  <p id="cep-dica">Só números, como 01310-100.</p>

  <fieldset>
    <legend>Forma de entrega</legend>
    <label><input type="radio" name="entrega" value="retirar" required /> Retirar na loja</label>
    <label><input type="radio" name="entrega" value="casa" /> Entregar em casa</label>
  </fieldset>

  <label for="senha">Crie uma senha</label>
  <input id="senha" name="senha" type="password" minlength="8" required
         autocomplete="new-password" />

  <button type="submit">Finalizar pedido</button>
</form>`;

export const USER_INVALID_CSS = `/* Só marca depois que a pessoa interagiu com o campo (ou tentou enviar). */
input:user-invalid {
  border-color: var(--cor-erro);
}`;

export const HTML_FORMS_01: Lesson = {
  id: 'html-forms-01',
  moduleId: 'html-native-forms',
  title: 'Formulários HTML: tipos de campo, validação nativa e envio',
  summary:
    'O que o próprio navegador oferece de graça num formulário (teclados certos, preenchimento automático, validação, agrupamento acessível) e onde essa ajuda acaba.',
  estimatedMinutes: 35,
  difficulty: 'introductory',
  conceptIds: ['html-forms', 'html-form-labels'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Antes de qualquer framework, o HTML já sabe muito sobre formulários: o teclado numérico no celular, o preenchimento automático do endereço, a recusa de um e-mail sem domínio, o envio com Enter. Quem conhece esses recursos escreve menos código e entrega formulários melhores; quem não conhece reconstrói tudo, pior.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Escolher o tipo de campo e o autocomplete certos.',
            'Usar a validação nativa e o estado validity.',
            'Agrupar opções com fieldset e legend.',
            'Saber quando trocar as mensagens nativas pelas suas.',
            'Entender o que acontece no envio.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'O formulário de papel bem diagramado',
      blocks: [
        {
          type: 'paragraph',
          text: 'Um bom formulário de papel tem rótulos claros, caixinhas do tamanho certo para cada informação e as opções agrupadas sob um título ("Forma de entrega: ( ) retirar ( ) entregar"). Os atributos do HTML são essa diagramação: dizem ao navegador o que cada campo espera, e o navegador ajusta teclado, preenchimento e conferência.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Tipos, atributos e validação',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'type="email", "tel", "url", "number", "date" mudam o teclado no celular e a validação. inputmode="numeric" pede teclado numérico sem as regras de number (bom para CEP e cartão, que não são quantidades).',
            'autocomplete com valores padronizados (email, name, postal-code, new-password, current-password, one-time-code) permite que navegador e gerenciadores de senha preencham, e ajuda pessoas com dificuldades motoras ou de memória.',
            'required, minlength, maxlength, min, max e pattern descrevem as regras. O estado fica em campo.validity: valueMissing, typeMismatch, patternMismatch, tooShort... e valid.',
            'minlength e maxlength só são verificados quando a pessoa edita o campo: um valor curto atribuído por script continua "válido". Valide no código também.',
            'setCustomValidity("mensagem") marca o campo como inválido por uma regra sua (como senha e confirmação); setCustomValidity("") desfaz.',
            ':user-invalid estiliza o campo inválido só depois da interação, enquanto :invalid vale desde o carregamento.',
            'As mensagens nativas seguem o idioma e o estilo do navegador, nem sempre o da página, e aparecem como balões que somem. Para mensagens consistentes e ligadas ao campo, use novalidate e mostre as suas (como nas lições de formulários do Angular), mantendo os atributos para o teclado e o autocomplete.',
            'fieldset com legend agrupa opções relacionadas: o leitor de tela anuncia o título do grupo ao entrar nele.',
            'Envio: Enter num campo envia o formulário; um <button> dentro de <form> é submit por padrão (use type="button" para os que não enviam). E a validação no servidor é obrigatória: qualquer pessoa envia dados sem passar pelo navegador.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Medido num Chromium',
          text: 'Um e-mail obrigatório vazio já começa inválido (valueMissing), mas :user-invalid só aplicou o estilo depois que "ana@" foi digitado e o foco saiu (typeMismatch). Um minlength de 8 deu tooShort para "abc" digitado e valid para "abc" atribuído por script. As mensagens nativas vieram no idioma do navegador. O fieldset apareceu na árvore de acessibilidade como grupo com o nome "Forma de entrega".',
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: finalizar pedido',
      blocks: [
        { type: 'code', language: 'html', caption: 'checkout.html', code: CHECKOUT_FORM_HTML },
        {
          type: 'paragraph',
          text: 'Os atributos fazem o trabalho de teclado, preenchimento e regras; novalidate deixa as mensagens com você. Para estilizar erros só depois da interação:',
        },
        { type: 'code', language: 'css', caption: 'formulario.css', code: USER_INVALID_CSS },
      ],
    },
    {
      kind: 'experiment',
      title: 'Teste no navegador e no celular',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Abra o formulário no celular (ou no modo de dispositivo do DevTools) e toque em cada campo: qual teclado aparece?',
            'Remova novalidate e tente enviar vazio: em que idioma vêm as mensagens?',
            'No console, rode $0.validity com um campo selecionado no painel Elementos.',
            'Use a extensão de um gerenciador de senhas: ele sugere uma senha nova no campo com autocomplete="new-password"?',
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
          text: 'No laboratório, transforme um formulário de cadastro improvisado num formulário nativo correto. Depois, responda sobre minlength.',
        },
      ],
      exerciseIds: ['lab-html-signup-form', 'forms-html-01-minlength'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: o botão que envia sem querer',
      blocks: [
        {
          type: 'code',
          language: 'html',
          caption: 'Clicar em "Mostrar senha" envia o formulário',
          code: `<form action="/cadastro" method="post">
  <label for="senha">Senha</label>
  <input id="senha" type="password" name="senha" />
  <button>Mostrar senha</button>
  <button>Cadastrar</button>
</form>`,
        },
      ],
      exerciseIds: ['forms-html-01-button-type'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Formulários de pagamento e login funcionam muito melhor com autocomplete correto; gerenciadores de senha dependem disso.',
            'No Angular, [formField] e Reactive Forms convivem com esses atributos: o required do esquema vira o atributo required no input.',
            'inputmode e enterkeyhint ajustam o teclado do celular sem mudar a validação.',
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
      exerciseIds: [
        'forms-html-01-inputmode',
        'forms-html-01-user-invalid',
        'forms-html-01-fieldset',
      ],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Tipo e inputmode certos dão o teclado certo; autocomplete deixa o navegador ajudar.',
            'Atributos descrevem as regras; validity mostra o estado; :user-invalid espera a interação.',
            'minlength só vale para edição do usuário: valide no código e no servidor.',
            'fieldset e legend dão nome a grupos de opções.',
            'Botões dentro de form enviam, a menos que sejam type="button".',
          ],
        },
      ],
    },
  ],
};
