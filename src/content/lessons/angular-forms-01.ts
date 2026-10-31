import { Lesson } from '../../app/core/models/content.models';

/**
 * Compiled and executed with Signal Forms of this project's Angular in
 * `src/content/angular-forms.spec.ts` (drift guard there). Behaviour described in the lesson
 * (errors from the start, required attribute, no aria-invalid, submit) was measured there too.
 */
export const SIGNUP_TS = `import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  email,
  FieldTree,
  form,
  FormField,
  minLength,
  required,
  submit,
  validate,
} from '@angular/forms/signals';

interface Cadastro {
  nome: string;
  email: string;
  senha: string;
  confirmacao: string;
}

@Component({
  selector: 'app-criar-conta',
  imports: [FormField],
  templateUrl: './criar-conta.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CriarConta {
  private readonly modelo = signal<Cadastro>({ nome: '', email: '', senha: '', confirmacao: '' });

  protected readonly cadastro = form(this.modelo, (c) => {
    required(c.nome, { message: 'Informe seu nome.' });
    required(c.email, { message: 'Informe seu e-mail.' });
    email(c.email, { message: 'Digite um e-mail válido, como nome@exemplo.com.' });
    required(c.senha, { message: 'Crie uma senha.' });
    minLength(c.senha, 8, { message: 'A senha precisa de pelo menos 8 caracteres.' });
    validate(c.confirmacao, ({ value, valueOf }) =>
      value() === valueOf(c.senha)
        ? undefined
        : { kind: 'confirmacao', message: 'As senhas não conferem.' },
    );
  });

  protected readonly contaCriada = signal<string | null>(null);

  /** Erro só depois que a pessoa passou pelo campo (ou tentou enviar). */
  protected mostrarErro(campo: FieldTree<string>): boolean {
    return campo().touched() && campo().invalid();
  }

  protected async enviar(evento: Event) {
    evento.preventDefault();
    await submit(this.cadastro, async (dados) => {
      // Na próxima lição, aqui entra a chamada ao servidor.
      this.contaCriada.set(dados().value().nome);
      return undefined;
    });
  }
}`;

export const SIGNUP_HTML = `<form (submit)="enviar($event)" novalidate>
  <div class="campo">
    <label for="email">E-mail</label>
    <input
      id="email"
      type="email"
      autocomplete="email"
      [formField]="cadastro.email"
      [attr.aria-invalid]="mostrarErro(cadastro.email) ? 'true' : null"
      [attr.aria-describedby]="mostrarErro(cadastro.email) ? 'email-erro' : null"
    />
    @if (mostrarErro(cadastro.email)) {
      <p id="email-erro" class="erro">{{ cadastro.email().errors()[0].message }}</p>
    }
  </div>

  <!-- nome, senha e confirmação seguem o mesmo padrão -->

  <button type="submit" [disabled]="cadastro().submitting()">Criar conta</button>
</form>

@if (contaCriada(); as nome) {
  <p role="status">Conta criada. Boas-vindas, {{ nome }}!</p>
}`;

export const ANGULAR_FORMS_01: Lesson = {
  id: 'angular-forms-01',
  moduleId: 'angular-forms-signals',
  title: 'Formulários com Signal Forms',
  summary:
    'Um formulário de cadastro com o modelo num signal, validações declaradas num só lugar, mensagens que aparecem na hora certa e erros acessíveis.',
  estimatedMinutes: 45,
  difficulty: 'intermediate',
  conceptIds: ['angular-signal-forms', 'html-form-labels'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Formulários são onde a aplicação recebe dados de pessoas, e onde a experiência mais costuma falhar: mensagem de erro gritando antes de a pessoa digitar qualquer coisa, erro que só a cor indica, botão que não faz nada sem explicar por quê, dados inválidos chegando ao servidor.',
        },
        {
          type: 'paragraph',
          text: 'No Angular 22, Signal Forms é a API estável de formulários baseada em signals: o modelo é um signal, as regras ficam num esquema e cada campo expõe o próprio estado como signals. Reactive Forms (FormGroup, FormControl) continua suportado e aparece muito em projetos existentes; os conceitos desta lição valem para os dois.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Criar um formulário a partir de um modelo em signal.',
            'Declarar validações, inclusive entre campos.',
            'Mostrar erros só depois que a pessoa interagiu com o campo.',
            'Ligar o erro ao campo para leitores de tela.',
            'Enviar só quando tudo é válido.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'O formulário de papel e o revisor',
      blocks: [
        {
          type: 'paragraph',
          text: 'Pense numa ficha de papel e num revisor sentado ao lado. A ficha (o modelo) guarda o que foi escrito. O revisor conhece as regras (o esquema) e sabe, a todo momento, o que está errado. Mas um bom revisor não interrompe quem ainda está escrevendo: ele aponta o problema quando a pessoa passa para o próximo campo, ou quando tenta entregar a ficha.',
        },
        {
          type: 'paragraph',
          text: 'Signal Forms separa exatamente essas coisas: o estado de validade existe desde o início; o momento de mostrar é decisão sua, usando touched.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Modelo, esquema e estado dos campos',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'form(modelo, esquema) recebe um signal com os dados e uma função que declara as regras. O resultado é uma árvore de campos: cadastro.email é o campo de e-mail. Como inject(), form() precisa de um contexto de injeção: crie o formulário num inicializador de campo do componente, não dentro de um método.',
            'Chamar o campo devolve o estado dele: cadastro.email().value(), errors(), invalid(), touched(), dirty(). Chamar a raiz, cadastro(), dá o estado do formulário inteiro, como valid() e submitting().',
            'No template, [formField]="cadastro.email" liga o input ao campo nos dois sentidos: digitar atualiza o modelo, e mudar o modelo atualiza o input.',
            'Validadores prontos: required, email, minLength, maxLength, min, max, pattern. Cada um aceita message com o texto mostrado à pessoa. email e minLength não acusam campo vazio; para isso, use required junto.',
            'validate(caminho, função) cria uma regra própria. A função recebe o contexto do campo: value() é o valor dele e valueOf(outroCaminho) lê outro campo, o que permite comparar senha e confirmação. Ela devolve undefined quando está tudo certo ou um erro com kind e message.',
            'Os erros existem desde o início: um campo obrigatório vazio já é inválido antes de a pessoa tocar nele. touched passa a true quando o campo perde o foco.',
            'submit(formulário, ação) marca todos os campos como tocados, e só executa a ação se o formulário for válido. Devolve uma promise com true ou false, e enquanto a ação roda, submitting() é true.',
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'O que [formField] não faz por você',
          text: 'A diretiva coloca o atributo required no input quando há required no esquema, mas não marca aria-invalid, não liga a mensagem ao campo e não adiciona classes de erro. Faça isso no template, com [attr.aria-invalid] e [attr.aria-describedby] apontando para o id da mensagem.',
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: criar conta',
      blocks: [
        {
          type: 'paragraph',
          text: 'Todas as regras ficam no esquema, perto do modelo. A confirmação de senha é uma regra própria que lê o outro campo.',
        },
        { type: 'code', language: 'typescript', caption: 'criar-conta.ts', code: SIGNUP_TS },
        {
          type: 'paragraph',
          text: 'No template, cada campo tem label, a mensagem aparece só depois do toque e fica ligada ao input. novalidate desliga os balões nativos do navegador, que apareceriam por causa do atributo required, para que as mensagens do formulário sejam as únicas.',
        },
        { type: 'code', language: 'html', caption: 'criar-conta.html', code: SIGNUP_HTML },
        {
          type: 'callout',
          tone: 'info',
          title: 'Este código é testado',
          text: 'O componente é compilado e executado nos testes da plataforma com o Angular usado no projeto: erros desde o início, mensagem só depois do toque, aria-invalid ligado ao erro, confirmação de senha e envio bloqueado enquanto o formulário é inválido.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Monte no seu computador',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Num projeto Angular 22, crie o componente e complete o template com os outros três campos no mesmo padrão.',
            'Clique em "Criar conta" sem preencher nada: todas as mensagens aparecem de uma vez. Por quê?',
            'Mostre os erros sem a condição de touched e recarregue a página. Como fica a primeira impressão?',
            'Remova novalidate e tente enviar vazio. Quem mostra a mensagem agora?',
            'Ative um leitor de tela (NVDA no Windows, VoiceOver no macOS), digite um e-mail inválido e saia do campo. Volte ao campo: o que é anunciado? Repita sem aria-describedby.',
          ],
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Prática',
      blocks: [{ type: 'paragraph', text: 'Responda pensando no formulário de cadastro.' }],
      exerciseIds: ['forms-01-errors', 'forms-01-cross-field'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: o formulário que já começa com erros',
      blocks: [
        {
          type: 'code',
          language: 'html',
          caption: 'A tela abre com quatro mensagens vermelhas',
          code: `@if (cadastro.email().invalid()) {
  <p class="erro">{{ cadastro.email().errors()[0].message }}</p>
}`,
        },
      ],
      exerciseIds: ['forms-01-touched'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Validação no frontend é para a experiência de quem preenche. O servidor valida de novo, sempre: qualquer pessoa pode enviar dados sem passar pela tela.',
            'Mensagens úteis dizem como corrigir ("como nome@exemplo.com"), não só que está errado.',
            'autocomplete="email", "new-password" e similares deixam o navegador e os gerenciadores de senha preencherem por você.',
            'Esta plataforma usa Reactive Forms tipados nos próprios formulários (o objetivo do modo foco, por exemplo), com o mesmo padrão de erro ligado ao campo. Em código novo no Angular 22, Signal Forms é a alternativa baseada em signals.',
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
      exerciseIds: ['forms-01-submit', 'forms-01-aria', 'forms-01-novalidate'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'form(modelo, esquema): dados num signal, regras num lugar só.',
            '[formField] liga o input ao campo nos dois sentidos e coloca required, mas não aria-invalid.',
            'Erros existem desde o início; mostre quando touched() for true.',
            'validate com valueOf para regras entre campos.',
            'submit só executa a ação com o formulário válido e marca tudo como tocado.',
          ],
        },
      ],
    },
  ],
};
