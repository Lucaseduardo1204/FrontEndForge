import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CONTENT } from '.';
import {
  COMPUTED_PREDICT_CODE,
  EFFECT_MISUSE_CODE,
} from './exercises/angular-components-01.exercises';

/**
 * The Angular examples of lesson "angular-components-01", compiled and executed with the
 * Angular version of this project. If an API changes, these tests fail before students
 * see outdated code. Keep them identical to the code blocks of the lesson.
 */

interface Tarefa {
  id: number;
  titulo: string;
  feita: boolean;
}

@Component({
  selector: 'app-tarefa-item',
  template: `
    <label>
      <input type="checkbox" [checked]="tarefa().feita" (change)="alternada.emit(tarefa().id)" />
      {{ tarefa().titulo }}
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TarefaItem {
  readonly tarefa = input.required<Tarefa>();
  readonly alternada = output<number>();
}

@Component({
  selector: 'app-lista-tarefas',
  imports: [TarefaItem],
  template: `
    <p>{{ pendentes() }} pendentes</p>
    <ul>
      @for (tarefa of tarefas(); track tarefa.id) {
        <li><app-tarefa-item [tarefa]="tarefa" (alternada)="alternar($event)" /></li>
      } @empty {
        <li>Nenhuma tarefa.</li>
      }
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ListaTarefas {
  readonly tarefas = signal<readonly Tarefa[]>([
    { id: 1, titulo: 'Estudar signals', feita: false },
    { id: 2, titulo: 'Revisar closures', feita: true },
  ]);
  readonly pendentes = computed(() => this.tarefas().filter((t) => !t.feita).length);

  alternar(id: number) {
    this.tarefas.update((lista) => lista.map((t) => (t.id === id ? { ...t, feita: !t.feita } : t)));
  }
}

/** Same list, tracked by object reference (exercise "ng-track", wrong option). */
@Component({
  selector: 'app-lista-por-referencia',
  imports: [TarefaItem],
  template: `
    @for (tarefa of tarefas(); track tarefa) {
      <app-tarefa-item [tarefa]="tarefa" (alternada)="alternar($event)" />
    }
  `,
})
class ListaPorReferencia extends ListaTarefas {}

/** The effect version of exercise "ng-effect-misuse" (EFFECT_MISUSE_CODE). */
@Component({ selector: 'app-lista-com-effect', template: '' })
class ListaComEffect {
  readonly tarefas = signal<readonly Tarefa[]>([]);
  readonly pendentes = signal(0);

  constructor() {
    effect(() => {
      this.pendentes.set(this.tarefas().filter((t) => !t.feita).length);
    });
  }
}

describe('Angular examples of the lesson (run on this project’s Angular)', () => {
  it('renders the list from the signal, counting pending tasks with computed', async () => {
    const fixture = TestBed.createComponent(ListaTarefas);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('p')?.textContent).toContain('1 pendentes');
    expect(el.querySelectorAll('app-tarefa-item').length).toBe(2);
  });

  it('child emits through output(); parent updates immutably; view and computed follow', async () => {
    const fixture = TestBed.createComponent(ListaTarefas);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const before = fixture.componentInstance.tarefas();

    el.querySelector<HTMLInputElement>('input[type=checkbox]')!.click();
    await fixture.whenStable();

    expect(el.querySelector('p')?.textContent).toContain('0 pendentes');
    expect(fixture.componentInstance.tarefas()).not.toBe(before); // a new array
    expect(before[0].feita).toBe(false); // the old one was not mutated
  });

  it('@empty renders when the list is empty', async () => {
    const fixture = TestBed.createComponent(ListaTarefas);
    fixture.componentInstance.tarefas.set([]);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Nenhuma tarefa.');
  });

  it('claim: computed recalculates after update (exercise "ng-computed-predict")', () => {
    const tarefas = signal([
      { titulo: 'A', feita: false },
      { titulo: 'B', feita: true },
    ]);
    const pendentes = computed(() => tarefas().filter((t) => !t.feita).length);
    const saida: number[] = [];

    saida.push(pendentes());
    tarefas.update((lista) => [...lista, { titulo: 'C', feita: false }]);
    saida.push(pendentes());

    expect(saida).toEqual([1, 2]);
  });

  it('claim: input() is read-only (no set), unlike signal()', async () => {
    const fixture = TestBed.createComponent(TarefaItem);
    fixture.componentRef.setInput('tarefa', { id: 1, titulo: 'x', feita: false });
    await fixture.whenStable();

    expect('set' in fixture.componentInstance.tarefa).toBe(false);
    expect('set' in signal(0)).toBe(true);
  });

  it('claim: mutating an item inside the signal does not update computed', () => {
    const tarefas = signal([{ id: 1, titulo: 'A', feita: false }]);
    const pendentes = computed(() => tarefas().filter((t) => !t.feita).length);
    expect(pendentes()).toBe(1);

    tarefas()[0].feita = true;

    expect(pendentes()).toBe(1); // stale: the signal was never told
  });

  it('claim: track by id keeps the element of a recreated item; track by reference recreates it', async () => {
    for (const [component, keeps] of [
      [ListaTarefas, true],
      [ListaPorReferencia, false],
    ] as const) {
      const fixture = TestBed.createComponent(component);
      await fixture.whenStable();
      const el: HTMLElement = fixture.nativeElement;
      const before = el.querySelector('input[type=checkbox]');

      before!.dispatchEvent(new Event('change'));
      await fixture.whenStable();

      expect(el.querySelector('input[type=checkbox]') === before, component.name).toBe(keeps);
    }
  });

  it('claim: writing a signal in effect is allowed, but the value is stale until the effect runs', async () => {
    const fixture = TestBed.createComponent(ListaComEffect);
    await fixture.whenStable();
    const lista = fixture.componentInstance;

    expect(() => lista.tarefas.set([{ id: 1, titulo: 'A', feita: false }])).not.toThrow();
    expect(lista.pendentes()).toBe(0); // stale right after the update
    await fixture.whenStable();
    expect(lista.pendentes()).toBe(1);
  });

  it('exercise code is the code tested here (drift guard)', () => {
    expect(COMPUTED_PREDICT_CODE).toContain(
      "tarefas.update((lista) => [...lista, { titulo: 'C', feita: false }]);",
    );
    expect(EFFECT_MISUSE_CODE).toContain(
      'this.pendentes.set(this.tarefas().filter((t) => !t.feita).length);',
    );
  });

  it('the lesson shows the same APIs that are tested here (drift guard)', () => {
    const lesson = CONTENT.lessons.find((l) => l.id === 'angular-components-01')!;
    const code = lesson.steps
      .flatMap((s) => s.blocks)
      .filter((b) => b.type === 'code')
      .map((b) => (b.type === 'code' ? b.code : ''))
      .join('\n');

    for (const fragment of [
      'readonly tarefa = input.required<Tarefa>();',
      'readonly alternada = output<number>();',
      '(change)="alternada.emit(tarefa().id)"',
      '@for (tarefa of tarefas(); track tarefa.id)',
      '(alternada)="alternar($event)"',
      '} @empty {',
      'readonly pendentes = computed(() => this.tarefas().filter((t) => !t.feita).length);',
      'lista.map((t) => (t.id === id ? { ...t, feita: !t.feita } : t)),',
    ]) {
      expect(code, fragment).toContain(fragment);
    }
  });
});
