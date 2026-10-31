import {
  HttpClient,
  HttpErrorResponse,
  HttpInterceptorFn,
  httpResource,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { email, form, FormField, required, submit } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { IDLE_PREDICT_TS } from './exercises/angular-http-01.exercises';
import { CREATE_ACCOUNT_TS, HTTP_CONFIG_TS, SEARCH_TS } from './lessons/angular-http-01';

/**
 * Search and signup of lesson "angular-http-01", executed with the HttpClient of this project
 * against HttpTestingController (drift guard below).
 */
const idioma: HttpInterceptorFn = (req, next) =>
  next(req.clone({ setHeaders: { 'Accept-Language': 'pt-BR' } }));

interface Produto {
  id: number;
  nome: string;
}

@Component({
  selector: 'app-busca-produtos',
  template: `
    <label for="busca">Buscar produto</label>
    <input id="busca" type="search" [value]="busca()" (input)="buscar($event)" />

    @if (produtos.isLoading()) {
      <p role="status">Carregando…</p>
    } @else if (produtos.error()) {
      <p role="alert">
        Não foi possível carregar os produtos.
        <button type="button" (click)="produtos.reload()">Tentar de novo</button>
      </p>
    } @else if (produtos.hasValue()) {
      <ul>
        @for (produto of produtos.value(); track produto.id) {
          <li>{{ produto.nome }}</li>
        } @empty {
          <li>Nenhum produto encontrado.</li>
        }
      </ul>
    } @else {
      <p>Digite pelo menos 2 letras para buscar.</p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class BuscaProdutos {
  readonly busca = signal('');

  readonly produtos = httpResource<Produto[]>(() =>
    this.busca().length < 2 ? undefined : { url: '/api/produtos', params: { busca: this.busca() } },
  );

  protected buscar(evento: Event) {
    this.busca.set((evento.target as HTMLInputElement).value);
  }
}

@Component({
  selector: 'app-criar-conta',
  imports: [FormField],
  template: `<form (submit)="enviar($event)" novalidate>
    <input id="email" [formField]="cadastro.email" />
    @if (cadastro.email().touched() && cadastro.email().invalid()) {
      <p id="email-erro">{{ cadastro.email().errors()[0].message }}</p>
    }
    <button type="submit">Criar conta</button>
  </form>`,
})
class CriarConta {
  readonly modelo = signal({ nome: 'Ana', email: 'ana@exemplo.com' });
  readonly cadastro = form(this.modelo, (c) => {
    required(c.email);
    email(c.email);
  });
  readonly contaCriada = signal<string | null>(null);
  private readonly http = inject(HttpClient);

  protected async enviar(evento: Event) {
    evento.preventDefault();
    await submit(this.cadastro, async (dados) => {
      try {
        await firstValueFrom(this.http.post('/api/contas', dados().value()));
        this.contaCriada.set(dados().value().nome);
        return undefined;
      } catch (erro) {
        if (erro instanceof HttpErrorResponse && erro.status === 409) {
          return {
            fieldTree: dados.email,
            kind: 'server',
            message: 'Este e-mail já tem uma conta.',
          };
        }
        return {
          fieldTree: dados,
          kind: 'server',
          message: 'Não foi possível criar a conta. Tente de novo.',
        };
      }
    });
  }
}

describe('HTTP lesson (run on this project’s HttpClient)', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([idioma])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  async function search() {
    const fixture = TestBed.createComponent(BuscaProdutos);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const typeTerm = async (value: string) => {
      fixture.componentInstance.busca.set(value);
      TestBed.tick();
    };
    const text = () => el.textContent!.replace(/\s+/g, ' ').trim();
    return { fixture, el, typeTerm, text, cmp: fixture.componentInstance };
  }

  it('http-01-idle: with fewer than 2 letters, no request and status idle', async () => {
    const { cmp, text } = await search();
    const logs: string[] = [];

    new Function('produtos', 'busca', 'console', IDLE_PREDICT_TS)(cmp.produtos, cmp.busca, {
      log: (v: string) => logs.push(v),
    });
    TestBed.tick();

    expect(logs.join(' ')).toBe('idle idle');
    http.expectNone(() => true);
    expect(text()).toContain('Digite pelo menos 2 letras para buscar.');
  });

  it('loading, then the list; the interceptor adds Accept-Language', async () => {
    const { fixture, typeTerm, text } = await search();
    await typeTerm('ca');
    // whenStable() would wait for the pending request: render it as it is now.
    fixture.detectChanges();
    expect(text()).toContain('Carregando…');

    const req = http.expectOne((r) => r.url === '/api/produtos' && r.params.get('busca') === 'ca');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Accept-Language')).toBe('pt-BR');
    req.flush([{ id: 1, nome: 'Café' }]);
    await fixture.whenStable();

    expect(text()).toContain('Café');
  });

  it('an empty result shows the empty state', async () => {
    const { fixture, typeTerm, text } = await search();
    await typeTerm('xyz');
    http.expectOne((r) => r.url === '/api/produtos').flush([]);
    await fixture.whenStable();

    expect(text()).toContain('Nenhum produto encontrado.');
  });

  it('http-01-cancel: a new term cancels the pending request', async () => {
    const { fixture, typeTerm, text } = await search();
    await typeTerm('caf');
    const first = http.expectOne((r) => r.params.get('busca') === 'caf');

    await typeTerm('café');

    expect(first.cancelled).toBe(true);
    http
      .expectOne((r) => r.params.get('busca') === 'café')
      .flush([{ id: 1, nome: 'Café torrado' }]);
    await fixture.whenStable();
    expect(text()).toContain('Café torrado');
  });

  it('http-01-value-error: an error shows the message; value() would throw; reload retries', async () => {
    const { fixture, el, typeTerm, text, cmp } = await search();
    await typeTerm('ca');
    http
      .expectOne((r) => r.url === '/api/produtos')
      .flush('erro', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(text()).toContain('Não foi possível carregar os produtos.');
    expect(() => cmp.produtos.value()).toThrow(/error state/);

    el.querySelector('button')!.click();
    TestBed.tick();
    http.expectOne((r) => r.url === '/api/produtos').flush([{ id: 2, nome: 'Pão' }]);
    await fixture.whenStable();
    expect(text()).toContain('Pão');
  });

  it('a network failure arrives as HttpErrorResponse with status 0', async () => {
    const { fixture, typeTerm, cmp } = await search();
    await typeTerm('ca');
    http.expectOne((r) => r.url === '/api/produtos').error(new ProgressEvent('error'));
    await fixture.whenStable();

    const error = cmp.produtos.error();
    expect(error).toBeInstanceOf(HttpErrorResponse);
    expect((error as HttpErrorResponse).status).toBe(0);
  });

  describe('sending the signup with HttpClient', () => {
    async function signup() {
      const fixture = TestBed.createComponent(CriarConta);
      await fixture.whenStable();
      const el: HTMLElement = fixture.nativeElement;
      el.querySelector('button')!.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
      const req = http.expectOne('/api/contas');
      return { fixture, el, req, cmp: fixture.componentInstance };
    }
    const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
      await new Promise((resolve) => setTimeout(resolve, 0));
      await fixture.whenStable();
    };

    it('POSTs the form value', async () => {
      const { fixture, req, cmp } = await signup();

      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ nome: 'Ana', email: 'ana@exemplo.com' });
      req.flush({});
      await settle(fixture);
      expect(cmp.contaCriada()).toBe('Ana');
    });

    it('http-01-conflict: a 409 becomes an error on the e-mail field', async () => {
      const { fixture, el, req, cmp } = await signup();

      req.flush({}, { status: 409, statusText: 'Conflict' });
      await settle(fixture);

      expect(cmp.contaCriada()).toBeNull();
      expect(
        cmp.cadastro
          .email()
          .errors()
          .map((e) => e.kind),
      ).toContain('server');
      expect(el.querySelector('#email-erro')?.textContent).toBe('Este e-mail já tem uma conta.');
    });

    it('other errors go to the form as a whole', async () => {
      const { fixture, req, cmp } = await signup();

      req.flush({}, { status: 500, statusText: 'Server Error' });
      await settle(fixture);

      expect(
        cmp
          .cadastro()
          .errors()
          .map((e) => e.message),
      ).toEqual(['Não foi possível criar a conta. Tente de novo.']);
      expect(cmp.cadastro.email().errors()).toEqual([]);
    });
  });

  it('the lesson shows the same code that is tested here (drift guard)', () => {
    const lesson = `${HTTP_CONFIG_TS}\n${SEARCH_TS}\n${CREATE_ACCOUNT_TS}`;
    for (const fragment of [
      "next(req.clone({ setHeaders: { 'Accept-Language': 'pt-BR' } }));",
      'provideHttpClient(withInterceptors([idioma]))',
      "this.busca().length < 2\n      ? undefined\n      : { url: '/api/produtos', params: { busca: this.busca() } },",
      '@if (produtos.isLoading()) {',
      '} @else if (produtos.error()) {',
      '<button type="button" (click)="produtos.reload()">Tentar de novo</button>',
      '} @else if (produtos.hasValue()) {',
      '@for (produto of produtos.value(); track produto.id) {',
      "await firstValueFrom(this.http.post('/api/contas', dados().value()));",
      'if (erro instanceof HttpErrorResponse && erro.status === 409) {',
      "return { fieldTree: dados.email, kind: 'server', message: 'Este e-mail já tem uma conta.' };",
    ]) {
      expect(lesson, fragment).toContain(fragment);
    }
  });
});
