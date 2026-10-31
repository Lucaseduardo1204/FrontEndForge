import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpProgressRepository } from '../../../core/persistence/progress-storage.providers';
import {
  LocalStorageProgressRepository,
  ProgressRepository,
} from '../../../core/persistence/progress-repository';
import { createEmptyProgress } from '../../../core/persistence/progress-schema';
import { SettingsPage } from '../settings-page/settings-page';

async function render() {
  const fixture = TestBed.createComponent(SettingsPage);
  await fixture.whenStable();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

describe('Settings in local mode (default)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ProgressRepository, useClass: LocalStorageProgressRepository },
      ],
    });
  });

  it('has no account section and says the progress lives only in this browser', async () => {
    const { el } = await render();
    expect(el.querySelector('#account-heading')).toBeNull();
    expect(el.textContent).toContain('apenas neste navegador');
    expect(el.textContent).not.toContain('no servidor desta instalação');
  });
});

describe('Settings in server mode', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpProgressRepository(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    for (const startup of http.match('/api/auth/me')) {
      startup.flush(null, { status: 401, statusText: 'Unauthorized' });
    }
  });

  afterEach(() => http.verify());

  const field = (el: HTMLElement, id: string) => el.querySelector<HTMLInputElement>(`#${id}`)!;
  const type = (input: HTMLInputElement, value: string) => {
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };

  it('shows the account section, labelled fields and the server-mode notice', async () => {
    const { el } = await render();
    expect(el.querySelector('#account-heading')?.textContent).toContain('Conta');
    expect(el.textContent).toContain('no servidor desta instalação');
    expect(el.textContent).not.toContain('apenas neste navegador');
    for (const id of ['account-email', 'account-password']) {
      expect(field(el, id).labels?.length).toBe(1);
    }
    const conta = el.querySelector('#account-heading')!.closest('section')!;
    expect(conta.querySelector('fieldset legend')?.textContent).toContain('Você já tem conta?');
  });

  it('switches the password autocomplete and the rules with the mode', async () => {
    const { fixture, el } = await render();
    expect(field(el, 'account-password').getAttribute('autocomplete')).toBe('current-password');

    const criar = Array.from(
      el.querySelectorAll<HTMLInputElement>('input[name="account-mode"]'),
    )[1];
    criar.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(field(el, 'account-password').getAttribute('autocomplete')).toBe('new-password');
    expect(field(el, 'account-password').getAttribute('aria-describedby')).toBe(
      'account-password-hint',
    );
    expect(el.querySelector('button[type="submit"]')?.textContent).toContain('Criar conta');

    type(field(el, 'account-email'), 'ana@exemplo.com');
    type(field(el, 'account-password'), 'curta');
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    const password = field(el, 'account-password');
    expect(password.getAttribute('aria-invalid')).toBe('true');
    expect(password.getAttribute('aria-describedby')).toBe(
      'account-password-hint account-password-error',
    );
    expect(el.querySelector('#account-password-error')?.textContent).toContain('pelo menos 12');
    http.expectNone('/api/auth/register'); // invalid form: nothing is sent
  });

  it('signs in, then shows the account and loads its progress', async () => {
    const { fixture, el } = await render();
    http
      .match('/api/progress')
      .forEach((r) => r.flush(null, { status: 401, statusText: 'Unauthorized' }));
    type(field(el, 'account-email'), 'ana@exemplo.com');
    type(field(el, 'account-password'), 'senha-bem-longa-123');
    el.querySelector('form')!.dispatchEvent(new Event('submit'));

    http.expectOne({ method: 'POST', url: '/api/auth/login' }).flush({ email: 'ana@exemplo.com' });
    await Promise.resolve();
    http
      .expectOne('/api/progress')
      .flush(JSON.stringify(createEmptyProgress(new Date('2026-10-30T12:00:00Z'))));
    await fixture.whenStable();

    expect(el.textContent).toContain('Você entrou como');
    expect(el.textContent).toContain('ana@exemplo.com');
    expect(el.querySelector('form')).toBeNull();
  });

  it("announces the server's message when signing in fails", async () => {
    const { fixture, el } = await render();
    type(field(el, 'account-email'), 'ana@exemplo.com');
    type(field(el, 'account-password'), 'errada');
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    http
      .expectOne('/api/auth/login')
      .flush({ erro: 'E-mail ou senha incorretos.' }, { status: 401, statusText: 'Unauthorized' });
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();

    const alerta = Array.from(el.querySelectorAll('[role="alert"]')).map((n) => n.textContent);
    expect(alerta.join(' ')).toContain('E-mail ou senha incorretos.');
  });
});
