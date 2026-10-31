import { httpResource, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SPLIT_BILL_MUTANTS } from './exercises/testing-unit-01.exercises';
import { FRAGILE_TEST_TS, SEARCH_SPEC_TS } from './lessons/testing-angular-01';
import {
  SPLIT_BILL_SPEC_TS,
  SPLIT_BILL_TS,
  SPY_AND_TIME_TS,
  VACUOUS_TEST_TS,
} from './lessons/testing-unit-01';

/**
 * The example tests of lessons "testing-unit-01" and "testing-angular-01", run as written,
 * plus evidence for the claims made about them (drift guards at the end).
 */

// ---- testing-unit-01 -------------------------------------------------------------------------

function dividirConta(totalCentavos: number, pessoas: number): number[] {
  if (!Number.isInteger(pessoas) || pessoas < 1) {
    throw new RangeError('É preciso pelo menos uma pessoa.');
  }
  const base = Math.floor(totalCentavos / pessoas);
  const resto = totalCentavos - base * pessoas;
  return Array.from({ length: pessoas }, (_, i) => (i < resto ? base + 1 : base));
}

function dividirERegistrar(
  total: number,
  pessoas: number,
  registrar: (r: { total: number; partes: number[] }) => void,
): number[] {
  const partes = dividirConta(total, pessoas);
  registrar({ total, partes });
  return partes;
}

function estaVencida(vencimento: Date, agora = new Date()): boolean {
  return agora > vencimento;
}

/** The four tests of the lesson, as a function, so they can also be run against mutants. */
function lessonTests(dividir: (total: number, pessoas: number) => number[]): void {
  expect(dividir(10000, 4)).toEqual([2500, 2500, 2500, 2500]);
  expect(dividir(1000, 3)).toEqual([334, 333, 333]);
  for (const [total, pessoas] of [
    [1000, 3],
    [1, 7],
    [99999, 13],
  ]) {
    const soma = dividir(total, pessoas).reduce((a, b) => a + b, 0);
    expect(soma).toBe(total);
  }
  expect(() => dividir(1000, 0)).toThrow(RangeError);
}

describe('dividirConta (lesson tests, as written)', () => {
  it('divide igualmente quando o total é divisível', () => {
    expect(dividirConta(10000, 4)).toEqual([2500, 2500, 2500, 2500]);
  });

  it('dá os centavos que sobram às primeiras pessoas', () => {
    expect(dividirConta(1000, 3)).toEqual([334, 333, 333]);
  });

  it('a soma das partes é sempre o total', () => {
    for (const [total, pessoas] of [
      [1000, 3],
      [1, 7],
      [99999, 13],
    ]) {
      const soma = dividirConta(total, pessoas).reduce((a, b) => a + b, 0);
      expect(soma).toBe(total);
    }
  });

  it('recusa menos de uma pessoa', () => {
    expect(() => dividirConta(1000, 0)).toThrow(RangeError);
  });

  it('registra cada divisão uma vez', () => {
    const registrar = vi.fn();

    dividirERegistrar(1000, 2, registrar);

    expect(registrar).toHaveBeenCalledOnce();
    expect(registrar).toHaveBeenCalledWith({ total: 1000, partes: [500, 500] });
  });

  it('considera vencida a conta depois do vencimento', () => {
    const vencimento = new Date('2026-10-30T23:59:59');

    expect(estaVencida(vencimento, new Date('2026-10-31T00:00:00'))).toBe(true);
    expect(estaVencida(vencimento, new Date('2026-10-30T12:00:00'))).toBe(false);
  });
});

describe('claims about the lesson tests', () => {
  it('the lesson tests fail against each of the five mutants', () => {
    expect(() => lessonTests(dividirConta)).not.toThrow();
    for (const mutant of SPLIT_BILL_MUTANTS) {
      const comBug = new Function(`return ${mutant.code}`)();
      expect(() => lessonTests(comBug), mutant.id).toThrow();
    }
  });

  it('the vacuous test runs no expect at all, so it passes with a wrong expectation', () => {
    let expectCalls = 0;
    const countingExpect = (...args: Parameters<typeof expect>) => {
      expectCalls++;
      return expect(...args);
    };
    const runTest = (_name: string, body: () => void) => body();

    expect(() =>
      new Function('it', 'expect', 'dividirConta', 'document', VACUOUS_TEST_TS)(
        runTest,
        countingExpect,
        dividirConta,
        document,
      ),
    ).not.toThrow();
    expect(expectCalls).toBe(0);
  });
});

// ---- testing-angular-01 ----------------------------------------------------------------------

interface Produto {
  id: number;
  nome: string;
}

/** BuscaProdutos from lesson "angular-http-01". */
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
  protected readonly busca = signal('');
  protected readonly produtos = httpResource<Produto[]>(() =>
    this.busca().length < 2 ? undefined : { url: '/api/produtos', params: { busca: this.busca() } },
  );
  protected buscar(evento: Event) {
    this.busca.set((evento.target as HTMLInputElement).value);
  }
}

/** Procura o campo como uma pessoa procuraria: pelo texto do rótulo. */
function campoPorRotulo(tela: HTMLElement, rotulo: string): HTMLInputElement {
  const label = Array.from(tela.querySelectorAll('label')).find(
    (l) => l.textContent?.trim() === rotulo,
  );
  return label!.control as HTMLInputElement;
}

describe('BuscaProdutos (lesson tests, as written)', () => {
  let servidor: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servidor = TestBed.inject(HttpTestingController);
  });

  afterEach(() => servidor.verify()); // nenhuma requisição esquecida ou inesperada

  it('mostra os produtos encontrados', async () => {
    const fixture = TestBed.createComponent(BuscaProdutos);
    const tela: HTMLElement = fixture.nativeElement;
    await fixture.whenStable();

    const campo = campoPorRotulo(tela, 'Buscar produto');
    campo.value = 'café';
    campo.dispatchEvent(new Event('input'));
    TestBed.tick();

    servidor
      .expectOne((req) => req.url === '/api/produtos' && req.params.get('busca') === 'café')
      .flush([{ id: 1, nome: 'Café torrado' }]);
    await fixture.whenStable();

    expect(tela.textContent).toContain('Café torrado');
  });

  it('oferece tentar de novo quando a API falha', async () => {
    const fixture = TestBed.createComponent(BuscaProdutos);
    const tela: HTMLElement = fixture.nativeElement;
    await fixture.whenStable();

    const campo = campoPorRotulo(tela, 'Buscar produto');
    campo.value = 'café';
    campo.dispatchEvent(new Event('input'));
    TestBed.tick();
    servidor
      .expectOne((req) => req.url === '/api/produtos')
      .flush('erro', {
        status: 500,
        statusText: 'Server Error',
      });
    await fixture.whenStable();

    const alerta = tela.querySelector('[role="alert"]');
    expect(alerta?.textContent).toContain('Não foi possível carregar os produtos.');
    expect(alerta?.querySelector('button')?.textContent).toContain('Tentar de novo');
  });

  it('claim: verify() fails when a request was left unanswered', async () => {
    const fixture = TestBed.createComponent(BuscaProdutos);
    await fixture.whenStable();
    const campo = campoPorRotulo(fixture.nativeElement, 'Buscar produto');
    campo.value = 'café';
    campo.dispatchEvent(new Event('input'));
    TestBed.tick();

    expect(() => servidor.verify()).toThrow(/Expected no open requests/);
    servidor.expectOne((req) => req.url === '/api/produtos').flush([]); // keep afterEach green
  });
});

describe('drift guards', () => {
  it('lesson testing-unit-01 shows the code tested here', () => {
    const lesson = `${SPLIT_BILL_TS}\n${SPLIT_BILL_SPEC_TS}\n${SPY_AND_TIME_TS}`;
    for (const fragment of [
      "throw new RangeError('É preciso pelo menos uma pessoa.');",
      'const base = Math.floor(totalCentavos / pessoas);',
      'const resto = totalCentavos - base * pessoas;',
      'return Array.from({ length: pessoas }, (_, i) => (i < resto ? base + 1 : base));',
      'expect(dividirConta(10000, 4)).toEqual([2500, 2500, 2500, 2500]);',
      'expect(dividirConta(1000, 3)).toEqual([334, 333, 333]);',
      'for (const [total, pessoas] of [[1000, 3], [1, 7], [99999, 13]]) {',
      'expect(() => dividirConta(1000, 0)).toThrow(RangeError);',
      'const registrar = vi.fn();',
      'expect(registrar).toHaveBeenCalledWith({ total: 1000, partes: [500, 500] });',
      "expect(estaVencida(vencimento, new Date('2026-10-31T00:00:00'))).toBe(true);",
    ]) {
      expect(lesson, fragment).toContain(fragment);
    }
  });

  it('lesson testing-angular-01 shows the tests run here', () => {
    const lesson = `${SEARCH_SPEC_TS}\n${FRAGILE_TEST_TS}`;
    for (const fragment of [
      'return label!.control as HTMLInputElement;',
      'providers: [provideHttpClient(), provideHttpClientTesting()],',
      'afterEach(() => servidor.verify());',
      "const campo = campoPorRotulo(tela, 'Buscar produto');",
      "campo.dispatchEvent(new Event('input'));",
      "req.url === '/api/produtos' && req.params.get('busca') === 'café'",
      ".flush([{ id: 1, nome: 'Café torrado' }]);",
      "expect(tela.textContent).toContain('Café torrado');",
      'const alerta = tela.querySelector(\'[role="alert"]\');',
      "(b) => b.textContent?.trim() === 'Tentar de novo',",
    ]) {
      expect(lesson, fragment).toContain(fragment);
    }
  });
});
