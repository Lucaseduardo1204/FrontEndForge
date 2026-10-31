import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
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
import { ERRORS_PREDICT_TS } from './exercises/angular-forms-01.exercises';
import { SIGNUP_HTML, SIGNUP_TS } from './lessons/angular-forms-01';

/**
 * The signup form of lesson "angular-forms-01" (Signal Forms), compiled and executed with the
 * Angular of this project. The template repeats the lesson pattern for all four fields.
 */
interface Cadastro {
  nome: string;
  email: string;
  senha: string;
  confirmacao: string;
}

@Component({
  selector: 'app-criar-conta',
  imports: [FormField],
  template: `
    <form (submit)="enviar($event)" novalidate>
      @for (c of campos; track c.id) {
        <div class="campo">
          <label [for]="c.id">{{ c.rotulo }}</label>
          <input
            [id]="c.id"
            [formField]="c.campo"
            [attr.aria-invalid]="mostrarErro(c.campo) ? 'true' : null"
            [attr.aria-describedby]="mostrarErro(c.campo) ? c.id + '-erro' : null"
          />
          @if (mostrarErro(c.campo)) {
            <p [id]="c.id + '-erro'" class="erro">{{ c.campo().errors()[0].message }}</p>
          }
        </div>
      }
      <button type="submit" [disabled]="cadastro().submitting()">Criar conta</button>
    </form>
    @if (contaCriada(); as nome) {
      <p role="status">Conta criada. Boas-vindas, {{ nome }}!</p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CriarConta {
  readonly modelo = signal<Cadastro>({ nome: '', email: '', senha: '', confirmacao: '' });

  readonly cadastro = form(this.modelo, (c) => {
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

  readonly contaCriada = signal<string | null>(null);
  resultado: boolean | null = null;

  protected readonly campos = [
    { id: 'nome', rotulo: 'Nome', campo: this.cadastro.nome },
    { id: 'email', rotulo: 'E-mail', campo: this.cadastro.email },
    { id: 'senha', rotulo: 'Senha', campo: this.cadastro.senha },
    { id: 'confirmacao', rotulo: 'Confirme a senha', campo: this.cadastro.confirmacao },
  ];

  protected mostrarErro(campo: FieldTree<string>): boolean {
    return campo().touched() && campo().invalid();
  }

  protected async enviar(evento: Event) {
    evento.preventDefault();
    this.resultado = await submit(this.cadastro, async (dados) => {
      this.contaCriada.set(dados().value().nome);
      return undefined;
    });
  }
}

/** The code of exercise forms-01-errors, in a component (ERRORS_PREDICT_TS). */
@Component({ selector: 'app-erros', template: '' })
class ErrosDoEmail {
  readonly modelo = signal({ email: '' });
  readonly f = form(this.modelo, (c) => {
    required(c.email);
    email(c.email);
  });

  verErros() {
    console.log(
      this.f
        .email()
        .errors()
        .map((e) => e.kind)
        .join(','),
    );
    this.modelo.set({ email: 'ana@' });
    console.log(
      this.f
        .email()
        .errors()
        .map((e) => e.kind)
        .join(','),
    );
  }
}

describe('Signal Forms lesson (run on this project’s Angular)', () => {
  async function render() {
    const fixture = TestBed.createComponent(CriarConta);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const input = (id: string) => el.querySelector<HTMLInputElement>(`#${id}`)!;
    const type = async (id: string, value: string) => {
      input(id).value = value;
      input(id).dispatchEvent(new Event('input'));
      input(id).dispatchEvent(new Event('blur'));
      await fixture.whenStable();
    };
    const send = async () => {
      el.querySelector('button')!.click();
      await fixture.whenStable();
      await new Promise((resolve) => setTimeout(resolve, 0));
      await fixture.whenStable();
    };
    return { fixture, el, input, type, send, form: fixture.componentInstance };
  }

  it('errors exist from the start, but no message is shown before interaction', async () => {
    const { el, form } = await render();

    expect(form.cadastro().valid()).toBe(false);
    expect(
      form.cadastro
        .email()
        .errors()
        .map((e) => e.kind),
    ).toEqual(['required']);
    expect(el.querySelectorAll('.erro').length).toBe(0);
  });

  it('[formField] sets required on the input but not aria-invalid', async () => {
    const { input } = await render();

    expect(input('email').required).toBe(true);
    expect(input('email').hasAttribute('aria-invalid')).toBe(false);
  });

  it('after leaving the field, the message appears and is linked to the input', async () => {
    const { el, input, type, form } = await render();

    await type('email', 'ana@');

    expect(form.modelo().email).toBe('ana@'); // typing updates the model
    expect(input('email').getAttribute('aria-invalid')).toBe('true');
    expect(input('email').getAttribute('aria-describedby')).toBe('email-erro');
    expect(el.querySelector('#email-erro')?.textContent).toBe(
      'Digite um e-mail válido, como nome@exemplo.com.',
    );
  });

  it('forms-01-submit: an invalid submit runs no action, marks all fields touched and resolves false', async () => {
    const { el, send, form } = await render();

    await send();

    expect(form.resultado).toBe(false);
    expect(form.contaCriada()).toBeNull();
    // nome, e-mail and senha; an empty confirmation matches the empty password.
    expect(Array.from(el.querySelectorAll('.erro')).map((e) => e.id)).toEqual([
      'nome-erro',
      'email-erro',
      'senha-erro',
    ]);
  });

  it('cross-field rule: the confirmation must match the password', async () => {
    const { el, type } = await render();

    await type('senha', '12345678');
    await type('confirmacao', '1234567X');
    expect(el.querySelector('#confirmacao-erro')?.textContent).toBe('As senhas não conferem.');

    await type('confirmacao', '12345678');
    expect(el.querySelector('#confirmacao-erro')).toBeNull();
  });

  it('a valid submit runs the action', async () => {
    const { el, type, send, form } = await render();
    await type('nome', 'Ana');
    await type('email', 'ana@exemplo.com');
    await type('senha', '12345678');
    await type('confirmacao', '12345678');

    await send();

    expect(form.resultado).toBe(true);
    expect(el.querySelector('[role="status"]')?.textContent).toContain('Boas-vindas, Ana!');
  });

  it('the model also updates the input (two-way)', async () => {
    const { fixture, input, form } = await render();

    form.modelo.update((m) => ({ ...m, nome: 'Bia' }));
    await fixture.whenStable();

    expect(input('nome').value).toBe('Bia');
  });

  it('submitting() is true while the action runs', async () => {
    const f = TestBed.runInInjectionContext(() => form(signal({ nome: 'Ana' })));
    let release!: () => void;
    const pending = submit(f, () => new Promise<undefined>((r) => (release = () => r(undefined))));

    await Promise.resolve();
    expect(f().submitting()).toBe(true);
    release();
    expect(await pending).toBe(true);
    expect(f().submitting()).toBe(false);
  });

  it('form() outside an injection context throws NG0203 (as the lesson says)', () => {
    expect(() => form(signal({ nome: '' }))).toThrow(/NG0203/);
  });

  it('email and minLength do not flag an empty field; required also flags null', () => {
    const f = TestBed.runInInjectionContext(() =>
      form(
        signal<{ email: string; senha: string; x: string | null }>({
          email: '',
          senha: '',
          x: null,
        }),
        (c) => {
          email(c.email);
          minLength(c.senha, 8);
          required(c.x);
        },
      ),
    );

    expect(f.email().errors()).toEqual([]);
    expect(f.senha().errors()).toEqual([]);
    expect(
      f
        .x()
        .errors()
        .map((e) => e.kind),
    ).toEqual(['required']);
  });

  it('forms-01-errors: required, then email (same code, inside a component)', () => {
    const logs: string[] = [];
    const original = console.log;
    console.log = (v: string) => logs.push(v);
    try {
      TestBed.createComponent(ErrosDoEmail).componentInstance.verErros();
    } finally {
      console.log = original;
    }

    expect(logs.join(' ')).toBe('required email');
    for (const line of [
      "readonly modelo = signal({ email: '' });",
      'required(c.email);',
      'email(c.email);',
      "this.modelo.set({ email: 'ana@' });",
    ]) {
      expect(ERRORS_PREDICT_TS, line).toContain(line);
    }
  });

  it('the lesson shows the same code that is tested here (drift guard)', () => {
    const lesson = `${SIGNUP_TS}\n${SIGNUP_HTML}`;
    for (const fragment of [
      "import { ChangeDetectionStrategy, Component, signal } from '@angular/core';",
      "from '@angular/forms/signals';",
      "required(c.email, { message: 'Informe seu e-mail.' });",
      "email(c.email, { message: 'Digite um e-mail válido, como nome@exemplo.com.' });",
      "minLength(c.senha, 8, { message: 'A senha precisa de pelo menos 8 caracteres.' });",
      'value() === valueOf(c.senha)',
      "{ kind: 'confirmacao', message: 'As senhas não conferem.' }",
      'return campo().touched() && campo().invalid();',
      'await submit(this.cadastro, async (dados) => {',
      '<form (submit)="enviar($event)" novalidate>',
      '[formField]="cadastro.email"',
      '[attr.aria-invalid]="mostrarErro(cadastro.email) ? \'true\' : null"',
      '[attr.aria-describedby]="mostrarErro(cadastro.email) ? \'email-erro\' : null"',
      '[disabled]="cadastro().submitting()"',
    ]) {
      expect(lesson, fragment).toContain(fragment);
    }
  });
});
