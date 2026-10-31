import {
  Component,
  computed,
  effect,
  Injector,
  input,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import ts from 'typescript';
import { COMPUTED_BEHAVIOUR_TS, SIZE_PICKER_TS } from './lessons/angular-signals-01';

/**
 * The claims of lesson "angular-signals-01", measured with this project's Angular, and its
 * component compiled and executed. Keep the component identical to the lesson (drift guard).
 */
@Component({
  selector: 'app-seletor-tamanho',
  template: `
    <fieldset>
      <legend>Tamanho</legend>
      @for (t of tamanhos(); track t) {
        <label>
          <input
            type="radio"
            name="tamanho"
            [checked]="t === selecionado()"
            (change)="selecionado.set(t)"
          />
          {{ t }}
        </label>
      }
    </fieldset>
    <p>Selecionado: {{ selecionado() }}</p>
  `,
})
class SeletorTamanho {
  readonly tamanhos = input.required<readonly string[]>();

  // Escolha local que acompanha a lista: mantém a escolha se ela
  // ainda existe; senão, volta para a primeira opção.
  readonly selecionado = linkedSignal<readonly string[], string>({
    source: this.tamanhos,
    computation: (novos, anterior) =>
      anterior && novos.includes(anterior.value) ? anterior.value : novos[0],
  });

  constructor() {
    // Efeito: sincroniza com algo fora dos signals (aqui, o título da aba).
    effect(() => {
      document.title = `Tamanho ${this.selecionado()}`;
    });
  }
}

@Component({
  selector: 'app-host',
  imports: [SeletorTamanho],
  template: `<app-seletor-tamanho [tamanhos]="tamanhos()" />`,
})
class Host {
  readonly tamanhos = signal<readonly string[]>(['P', 'M', 'G']);
}

describe('angular-signals-01: computed', () => {
  it('the lesson example runs the formula twice (lazy, memoized, Object.is)', () => {
    let execucoes = 0;
    const preco = signal(100);
    const quantidade = signal(2);
    const total = computed(() => {
      execucoes++;
      return preco() * quantidade();
    });
    expect(execucoes).toBe(0);
    expect(total()).toBe(200);
    expect(total()).toBe(200);
    preco.set(100);
    quantidade.set(3);
    expect(total()).toBe(300);
    expect(execucoes).toBe(2);
    expect(COMPUTED_BEHAVIOUR_TS).toContain('preco.set(100);   // mesmo valor (Object.is)');
  });

  it('an intermediate computed with the same value does not recompute its dependents', () => {
    let textoRuns = 0;
    const n = signal(2);
    const par = computed(() => n() % 2 === 0);
    const texto = computed(() => {
      textoRuns++;
      return par() ? 'par' : 'ímpar';
    });
    texto();
    n.set(4);
    texto();
    expect(textoRuns).toBe(1);
  });

  it('writing to a signal inside computed throws NG0600', () => {
    const w = signal(0);
    const bad = computed(() => {
      w.set(1);
      return 1;
    });
    expect(() => bad()).toThrowError(/NG0600/);
  });

  it('push on the array does not notify; update with a new array does', () => {
    const lista = signal<number[]>([]);
    const tamanho = computed(() => lista().length);
    tamanho();
    lista().push(1);
    expect(tamanho()).toBe(0);
    lista.update((l) => [...l, 2]);
    expect(tamanho()).toBe(2);
  });

  it('untracked: 11, 11, 22', () => {
    const x = signal(1);
    const y = signal(10);
    const soma = computed(() => x() + untracked(y));
    const lidos = [soma()];
    y.set(20);
    lidos.push(soma());
    x.set(2);
    lidos.push(soma());
    expect(lidos).toEqual([11, 11, 22]);
  });
});

describe('angular-signals-01: effect', () => {
  it('runs later, batches three sets into one run, and cleans up before rerunning and on destroy', () => {
    const injector = TestBed.inject(Injector);
    const contador = signal(0);
    const vistos: number[] = [];
    const limpezas: number[] = [];
    const ref = effect(
      (onCleanup) => {
        const v = contador();
        vistos.push(v);
        onCleanup(() => limpezas.push(v));
      },
      { injector },
    );
    expect(vistos).toEqual([]);
    TestBed.tick();
    expect(vistos).toEqual([0]);

    contador.set(1);
    contador.set(2);
    contador.set(3);
    expect(vistos).toEqual([0]);
    TestBed.tick();
    expect(vistos).toEqual([0, 3]);
    expect(limpezas).toEqual([0]);

    ref.destroy();
    expect(limpezas).toEqual([0, 3]);
  });
});

describe('angular-signals-01: linkedSignal', () => {
  it('short form: local writes, reset when the source changes (even if it still has the choice)', () => {
    const opcoes = signal(['P', 'M', 'G']);
    const sel = linkedSignal(() => opcoes()[0]);
    sel.set('G');
    expect(sel()).toBe('G');
    opcoes.set(['M', 'G']);
    expect(sel()).toBe('M');
  });

  it('the lesson component keeps G while it exists and falls back to the first option', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const texto = () => el.querySelector('p')!.textContent!.trim();

    expect(texto()).toBe('Selecionado: P');
    expect(document.title).toBe('Tamanho P');

    const g = Array.from(el.querySelectorAll('label')).find((l) => l.textContent!.includes('G'))!;
    g.querySelector('input')!.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(texto()).toBe('Selecionado: G');
    expect(document.title).toBe('Tamanho G');

    fixture.componentInstance.tamanhos.set(['M', 'G', 'GG']);
    await fixture.whenStable();
    expect(texto()).toBe('Selecionado: G');

    fixture.componentInstance.tamanhos.set(['36', '38']);
    await fixture.whenStable();
    expect(texto()).toBe('Selecionado: 36');
    expect(document.title).toBe('Tamanho 36');
  });
});

describe('angular-signals-01: drift guard', () => {
  it('every code line of the lesson component is in this spec', () => {
    const spec = ts.sys.readFile('src/content/angular-signals.spec.ts') ?? '';
    const lines = SIZE_PICKER_TS.split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('export class'));

    expect(lines.filter((l) => !spec.includes(l))).toEqual([]);
  });
});
