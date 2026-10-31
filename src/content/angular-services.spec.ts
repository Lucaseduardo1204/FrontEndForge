import { CurrencyPipe, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injectable,
  input,
  LOCALE_ID,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CART_TOTAL_TS } from './exercises/angular-services-01.exercises';
import {
  CART_COMPONENTS_TS,
  CART_SERVICE_TS,
  COMPONENT_PROVIDER_TS,
} from './lessons/angular-services-01';

registerLocaleData(localePt);

/**
 * The service and components of lesson "angular-services-01", compiled and executed with the
 * Angular version of this project. Keep them identical to the lesson code (drift guard below).
 */
interface ItemCarrinho {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
}

@Injectable({ providedIn: 'root' })
class CarrinhoService {
  private readonly _itens = signal<readonly ItemCarrinho[]>([]);

  readonly itens = this._itens.asReadonly();
  readonly quantidade = computed(() => this._itens().reduce((n, i) => n + i.quantidade, 0));
  readonly total = computed(() => this._itens().reduce((s, i) => s + i.preco * i.quantidade, 0));

  adicionar(produto: { id: number; nome: string; preco: number }) {
    this._itens.update((itens) =>
      itens.some((i) => i.id === produto.id)
        ? itens.map((i) => (i.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i))
        : [...itens, { ...produto, quantidade: 1 }],
    );
  }
}

@Component({
  selector: 'app-botao-comprar',
  template: `<button type="button" (click)="comprar()">Comprar {{ nome() }}</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class BotaoComprar {
  private readonly carrinho = inject(CarrinhoService);
  readonly id = input.required<number>();
  readonly nome = input.required<string>();
  readonly preco = input.required<number>();

  comprar() {
    this.carrinho.adicionar({ id: this.id(), nome: this.nome(), preco: this.preco() });
  }
}

@Component({
  selector: 'app-resumo-carrinho',
  imports: [CurrencyPipe],
  template: `<p>
    Itens: {{ carrinho.quantidade() }} · Total: {{ carrinho.total() | currency: 'BRL' }}
  </p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ResumoCarrinho {
  protected readonly carrinho = inject(CarrinhoService);
}

/** Same summary with `providers` (exercise services-01-providers). */
@Component({
  selector: 'app-resumo-isolado',
  imports: [CurrencyPipe],
  providers: [CarrinhoService],
  template: `<p>Itens: {{ carrinho.quantidade() }}</p>`,
})
class ResumoIsolado {
  protected readonly carrinho = inject(CarrinhoService);
}

@Component({
  selector: 'app-pagina',
  imports: [BotaoComprar, ResumoCarrinho, ResumoIsolado],
  template: `
    <header><app-resumo-carrinho /><app-resumo-isolado /></header>
    <main>
      <app-botao-comprar [id]="1" nome="Café" [preco]="10" />
      <app-botao-comprar [id]="2" nome="Pão" [preco]="5" />
    </main>
  `,
})
class Pagina {}

/** inject() inside a method (exercise services-01-inject-context). */
@Component({ selector: 'app-errado', template: '' })
class BotaoErrado {
  comprar() {
    return inject(CarrinhoService);
  }
}

describe('services lesson (run on this project’s Angular)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }] });
  });

  const text = (el: HTMLElement, selector: string) =>
    el.querySelector(selector)!.textContent!.replace(/\s+/g, ' ').trim();

  it('distant components share the root instance: clicking a button updates the header summary', async () => {
    const fixture = TestBed.createComponent(Pagina);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const [cafe, pao] = Array.from(el.querySelectorAll('button'));

    cafe.click();
    cafe.click();
    pao.click();
    await fixture.whenStable();

    expect(text(el, 'app-resumo-carrinho')).toBe('Itens: 3 · Total: R$ 25,00');
  });

  it('providers in a component create a separate, empty instance (services-01-providers)', async () => {
    const fixture = TestBed.createComponent(Pagina);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;

    el.querySelector('button')!.click();
    await fixture.whenStable();

    expect(text(el, 'app-resumo-carrinho')).toContain('Itens: 1');
    expect(text(el, 'app-resumo-isolado')).toBe('Itens: 0');
  });

  it('services-01-total: 2 3 25', () => {
    const carrinho = TestBed.inject(CarrinhoService);
    const logs: string[] = [];

    new Function('carrinho', 'console', CART_TOTAL_TS)(carrinho, {
      log: (...a: unknown[]) => logs.push(a.join(' ')),
    });

    expect(logs).toEqual(['2 3 25']);
  });

  it('asReadonly exposes no set (services-01-readonly)', () => {
    const carrinho = TestBed.inject(CarrinhoService);

    expect('set' in carrinho.itens).toBe(false);
    expect('update' in carrinho.itens).toBe(false);
  });

  it('inject() outside an injection context throws NG0203 (services-01-inject-context)', () => {
    const fixture = TestBed.createComponent(BotaoErrado);

    expect(() => fixture.componentInstance.comprar()).toThrow(/NG0203/);
  });

  it('the service can be replaced by a fake in tests', async () => {
    TestBed.overrideProvider(CarrinhoService, {
      useValue: { quantidade: () => 42, total: () => 0 },
    });
    const fixture = TestBed.createComponent(ResumoCarrinho);
    await fixture.whenStable();

    expect(text(fixture.nativeElement, 'p')).toContain('Itens: 42');
  });

  it('the lesson shows the same code that is tested here (drift guard)', () => {
    const lesson = `${CART_SERVICE_TS}\n${CART_COMPONENTS_TS}\n${COMPONENT_PROVIDER_TS}`;
    for (const fragment of [
      "@Injectable({ providedIn: 'root' })",
      'private readonly _itens = signal<readonly ItemCarrinho[]>([]);',
      'readonly itens = this._itens.asReadonly();',
      'readonly quantidade = computed(() => this._itens().reduce((n, i) => n + i.quantidade, 0));',
      'readonly total = computed(() => this._itens().reduce((s, i) => s + i.preco * i.quantidade, 0));',
      'itens.some((i) => i.id === produto.id)',
      '[...itens, { ...produto, quantidade: 1 }]',
      'private readonly carrinho = inject(CarrinhoService);',
      'this.carrinho.adicionar({ id: this.id(), nome: this.nome(), preco: this.preco() });',
      "Itens: {{ carrinho.quantidade() }} · Total: {{ carrinho.total() | currency: 'BRL' }}",
      'providers: [CarrinhoService]',
    ]) {
      expect(lesson, fragment).toContain(fragment);
    }
  });
});
