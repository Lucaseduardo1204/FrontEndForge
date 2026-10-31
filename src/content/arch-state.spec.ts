import { Component, computed, inject, input, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import ts from 'typescript';
import { DUPLICATED_TOTAL_TS, URL_STATE_TS } from './lessons/arch-state-01';

/**
 * The component of lesson "arch-state-01", compiled and executed with this project's Angular.
 * Keep it identical to the lesson code (drift guard at the end).
 */
const PRODUTOS = [
  { id: 1, nome: 'Café torrado' },
  { id: 2, nome: 'Pão de queijo' },
  { id: 3, nome: 'Café solúvel' },
];

@Component({
  selector: 'app-lista-produtos',
  template: `
    <label for="busca">Buscar</label>
    <input id="busca" type="search" [value]="termo()" (input)="buscar($any($event.target).value)" />
    <p>{{ filtrados().length }} de {{ produtos.length }} produtos</p>
    <ul>
      @for (p of filtrados(); track p.id) {
        <li>{{ p.nome }}</li>
      }
    </ul>
  `,
})
class ListaProdutos {
  private readonly router = inject(Router);
  readonly produtos = PRODUTOS;

  // Vem de ?busca= (withComponentInputBinding). Sem o parâmetro, chega undefined.
  readonly busca = input<string | undefined>();
  readonly termo = computed(() => this.busca() ?? '');

  // Derivado: calculado a partir da fonte, nunca guardado à parte.
  readonly filtrados = computed(() => {
    const t = this.termo().toLowerCase();
    return this.produtos.filter((p) => p.nome.toLowerCase().includes(t));
  });

  buscar(termo: string) {
    this.router.navigate([], {
      queryParams: { busca: termo || null },
      queryParamsHandling: 'merge',
    });
  }
}

@Component({ selector: 'app-com-padrao', template: `` })
class ComPadrao {
  readonly busca = input('');
}

function setup() {
  TestBed.configureTestingModule({
    providers: [
      provideRouter(
        [
          { path: 'produtos', component: ListaProdutos },
          { path: 'padrao', component: ComPadrao },
        ],
        withComponentInputBinding(),
      ),
    ],
  });
  return RouterTestingHarness.create();
}

const items = (el: HTMLElement) =>
  Array.from(el.querySelectorAll('li')).map((li) => li.textContent?.trim());

describe('arch-state-01: state in the URL, derived list', () => {
  it('opening /produtos?busca=cafe shows the filtered list', async () => {
    const harness = await setup();
    await harness.navigateByUrl('/produtos?busca=caf', ListaProdutos);

    expect(items(harness.routeNativeElement!)).toEqual(['Café torrado', 'Café solúvel']);
    expect(harness.routeNativeElement!.textContent).toContain('2 de 3 produtos');
  });

  it('typing in the field writes the search to the URL, and the list follows it', async () => {
    const harness = await setup();
    await harness.navigateByUrl('/produtos', ListaProdutos);
    const field = harness.routeNativeElement!.querySelector('input')!;

    field.value = 'pão';
    field.dispatchEvent(new Event('input'));
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/produtos?busca=p%C3%A3o');
    expect(items(harness.routeNativeElement!)).toEqual(['Pão de queijo']);
  });

  it('clearing the field removes the parameter, and the input arrives as undefined', async () => {
    const harness = await setup();
    const component = await harness.navigateByUrl('/produtos?busca=caf', ListaProdutos);

    component.buscar('');
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/produtos');
    expect(component.busca()).toBeUndefined();
    expect(component.termo()).toBe('');
    expect(items(harness.routeNativeElement!)).toHaveLength(3);
  });

  it('measured: without the parameter, the default of input("") is ignored', async () => {
    const harness = await setup();
    const opened = await harness.navigateByUrl('/padrao', ComPadrao);
    expect(opened.busca()).toBeUndefined();

    const withParam = await harness.navigateByUrl('/padrao?busca=x', ComPadrao);
    expect(withParam.busca()).toBe('x');
    await harness.navigateByUrl('/padrao', ComPadrao);
    expect(withParam.busca()).toBeUndefined();
  });
});

describe('arch-state-01: the duplicated total of the debugging step', () => {
  interface Item {
    id: number;
    preco: number;
  }
  class Carrinho {
    readonly itens = signal<readonly Item[]>([]);
    readonly total = signal(0);
    adicionar(item: Item) {
      this.itens.update((l) => [...l, item]);
      this.total.update((t) => t + item.preco);
    }
    remover(id: number) {
      this.itens.update((l) => l.filter((i) => i.id !== id));
    }
  }
  class CarrinhoDerivado {
    readonly itens = signal<readonly Item[]>([]);
    readonly total = computed(() => this.itens().reduce((s, i) => s + i.preco, 0));
    adicionar(item: Item) {
      this.itens.update((l) => [...l, item]);
    }
    remover(id: number) {
      this.itens.update((l) => l.filter((i) => i.id !== id));
    }
  }

  it('the duplicated total goes stale after remover; the computed one does not', () => {
    for (const C of [Carrinho, CarrinhoDerivado]) {
      const c = new C();
      c.adicionar({ id: 1, preco: 10 });
      c.adicionar({ id: 2, preco: 5 });
      c.remover(1);
      expect(c.itens()).toHaveLength(1);
      expect(c.total()).toBe(C === Carrinho ? 15 : 5);
    }
    expect(DUPLICATED_TOTAL_TS).toContain('// esqueceu de atualizar o total');
  });
});

describe('arch-state-01: drift guard', () => {
  it('every code line of the lesson component is in this spec', () => {
    const spec = ts.sys.readFile('src/content/arch-state.spec.ts') ?? '';
    const lines = URL_STATE_TS.split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('export class'));

    expect(lines.filter((l) => !spec.includes(l))).toEqual([]);
  });
});
