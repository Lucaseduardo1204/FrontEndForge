import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  interval,
  map,
  Observable,
  of,
  Subject,
  switchMap,
} from 'rxjs';
import { transform } from 'sucrase';
import { COLD_TS, DEAD_STREAM_TS, SEARCH_TS } from './lessons/angular-rxjs-01';

/**
 * The RxJS lesson, executed with RxJS 7.8 and the Angular of this project. The debounce uses
 * real timers: each test waits a little longer than the 300 ms of the lesson.
 */
interface Cliente {
  id: number;
  nome: string;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Component({
  selector: 'app-busca-clientes',
  template: `<ul>
    @for (cliente of resultados(); track cliente.id) {
      <li>{{ cliente.nome }}</li>
    }
  </ul>`,
})
class BuscaClientes {
  private readonly http = inject(HttpClient);
  readonly termo = signal('');

  readonly resultados = toSignal(
    toObservable(this.termo).pipe(
      map((t) => t.trim()),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((t) =>
        t.length < 2
          ? of([])
          : this.http
              .get<Cliente[]>('/api/clientes', { params: { busca: t } })
              .pipe(catchError(() => of([]))),
      ),
    ),
    { initialValue: [] },
  );
}

/** The buggy version of the debugging step: catchError outside switchMap. */
@Component({ selector: 'app-busca-com-bug', template: '' })
class BuscaComBug {
  private readonly http = inject(HttpClient);
  readonly termo = signal('');
  readonly resultados = toSignal(
    toObservable(this.termo).pipe(
      debounceTime(300),
      switchMap((t) => this.http.get<Cliente[]>('/api/clientes', { params: { busca: t } })),
      catchError(() => of([])),
    ),
    { initialValue: [] },
  );
}

describe('RxJS lesson', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  async function type(cmp: { termo: { set(v: string): void } }, value: string, after = 0) {
    cmp.termo.set(value);
    TestBed.tick();
    if (after) await wait(after);
  }

  it('a cold Observable runs only when subscribed, once per subscription', () => {
    const logs: string[] = [];
    new Function('Observable', 'console', transform(COLD_TS, { transforms: ['typescript'] }).code)(
      Observable,
      {
        log: (...a: unknown[]) => logs.push(a.join(' ')),
      },
    );

    expect(logs).toEqual([
      'antes de assinar',
      'buscando preços',
      'preço 10',
      'preço 12',
      'buscando preços',
      'preço 10',
      'preço 12',
    ]);
  });

  it('HttpClient sends nothing until someone subscribes', () => {
    const request$ = TestBed.inject(HttpClient).get('/api/clientes');
    http.expectNone('/api/clientes');

    request$.subscribe();
    http.expectOne('/api/clientes').flush([]);
  });

  it('fast typing makes a single request, for the final term', async () => {
    const fixture = TestBed.createComponent(BuscaClientes);
    await fixture.whenStable();
    const cmp = fixture.componentInstance;

    await type(cmp, 'c', 50);
    await type(cmp, 'ca', 50);
    await type(cmp, 'caf', 400);

    const req = http.expectOne((r) => r.url === '/api/clientes');
    expect(req.request.params.get('busca')).toBe('caf');
    req.flush([{ id: 1, nome: 'Café & Cia' }]);
    expect(cmp.resultados().map((c) => c.nome)).toEqual(['Café & Cia']);
  });

  it('switchMap cancels the pending request when a new term arrives', async () => {
    const fixture = TestBed.createComponent(BuscaClientes);
    await fixture.whenStable();
    const cmp = fixture.componentInstance;

    await type(cmp, 'ca', 400);
    const first = http.expectOne((r) => r.params.get('busca') === 'ca');
    await type(cmp, 'café', 400);

    expect(first.cancelled).toBe(true);
    http.expectOne((r) => r.params.get('busca') === 'café').flush([]);
  });

  it('distinctUntilChanged: the same term (even with spaces) does not search again', async () => {
    const fixture = TestBed.createComponent(BuscaClientes);
    await fixture.whenStable();
    const cmp = fixture.componentInstance;

    await type(cmp, 'ana', 400);
    http.expectOne((r) => r.url === '/api/clientes').flush([]);
    await type(cmp, ' ana ', 400);

    http.expectNone((r) => r.url === '/api/clientes');
  });

  it('with catchError inside switchMap, a 500 does not kill the search', async () => {
    const fixture = TestBed.createComponent(BuscaClientes);
    await fixture.whenStable();
    const cmp = fixture.componentInstance;

    await type(cmp, 'ana', 400);
    http
      .expectOne((r) => r.url === '/api/clientes')
      .flush('x', { status: 500, statusText: 'Erro' });
    await type(cmp, 'bia', 400);

    http.expectOne((r) => r.params.get('busca') === 'bia').flush([{ id: 2, nome: 'Bia' }]);
    expect(cmp.resultados().map((c) => c.nome)).toEqual(['Bia']);
  });

  it('rxjs-01-dead-stream: with catchError outside, the search never requests again', async () => {
    const fixture = TestBed.createComponent(BuscaComBug);
    await fixture.whenStable();
    const cmp = fixture.componentInstance;

    await type(cmp, 'ana', 400);
    http
      .expectOne((r) => r.url === '/api/clientes')
      .flush('x', { status: 500, statusText: 'Erro' });
    await type(cmp, 'bia', 400);

    http.expectNone((r) => r.url === '/api/clientes');
  });

  it('toSignal unsubscribes when the component is destroyed', async () => {
    const source = new Subject<number>();
    @Component({ selector: 'app-ouve', template: '' })
    class Ouve {
      readonly valor = toSignal(source, { initialValue: 0 });
    }
    const fixture = TestBed.createComponent(Ouve);
    await fixture.whenStable();
    expect(source.observed).toBe(true);

    fixture.destroy();

    expect(source.observed).toBe(false);
  });

  it('rxjs-01-leak: a manual subscription keeps running after destroy; takeUntilDestroyed stops it', async () => {
    const ticks = { manual: 0, guarded: 0 };
    @Component({ selector: 'app-relogio', template: '' })
    class Relogio {
      constructor() {
        interval(10).subscribe(() => ticks.manual++);
        interval(10)
          .pipe(takeUntilDestroyed())
          .subscribe(() => ticks.guarded++);
      }
    }
    const fixture = TestBed.createComponent(Relogio);
    await wait(35);
    fixture.destroy();
    const afterDestroy = { ...ticks };

    await wait(50);

    expect(ticks.manual).toBeGreaterThan(afterDestroy.manual); // still running: a leak
    expect(ticks.guarded).toBe(afterDestroy.guarded); // stopped with the component
  });

  it('the lesson shows the same pipeline that is tested here (drift guard)', () => {
    for (const fragment of [
      'toObservable(this.termo).pipe(',
      'map((t) => t.trim()),',
      'debounceTime(300),',
      'distinctUntilChanged(),',
      "this.http.get<Cliente[]>('/api/clientes', { params: { busca: t } }).pipe(",
      'catchError(() => of([])), // dentro do switchMap',
      '{ initialValue: [] },',
    ]) {
      expect(SEARCH_TS, fragment).toContain(fragment);
    }
    expect(DEAD_STREAM_TS).toContain('catchError(() => of([])),\n);');
  });
});
