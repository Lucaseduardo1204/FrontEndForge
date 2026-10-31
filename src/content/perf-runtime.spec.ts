import { Component, computed, signal, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TEMPLATE_WORK_TS, TRACK_VARIANTS_HTML } from './lessons/perf-runtime-01';

/**
 * Measures the claims of lesson "perf-runtime-01" with this project's Angular: which DOM
 * elements each track keeps, and how often template work runs.
 */
interface Tarefa {
  id: number;
  titulo: string;
}

const inicial = (): Tarefa[] => [
  { id: 1, titulo: 'A' },
  { id: 2, titulo: 'B' },
  { id: 3, titulo: 'C' },
];

@Component({
  selector: 'app-por-id',
  template: `@for (t of tarefas(); track t.id) {
    <li><input /> {{ t.titulo }}</li>
  }`,
})
class PorId {
  readonly tarefas = signal(inicial());
}

@Component({
  selector: 'app-por-indice',
  template: `@for (t of tarefas(); track $index) {
    <li><input /> {{ t.titulo }}</li>
  }`,
})
class PorIndice {
  readonly tarefas = signal(inicial());
}

@Component({
  selector: 'app-por-objeto',
  template: `@for (t of tarefas(); track t) {
    <li><input /> {{ t.titulo }}</li>
  }`,
})
class PorObjeto {
  readonly tarefas = signal(inicial());
}

@Component({
  selector: 'app-resumo',
  template: `<p>Total: {{ totalMetodo() }}</p>
    <p>Total: {{ total() }}</p>
    <p>{{ outro() }}</p>`,
})
class Resumo {
  readonly itens = signal<readonly { preco: number }[]>([{ preco: 10 }, { preco: 5 }]);
  readonly outro = signal(0);
  chamadasMetodo = 0;
  chamadasComputed = 0;

  totalMetodo() {
    this.chamadasMetodo++;
    return this.itens().reduce((s, i) => s + i.preco, 0);
  }

  readonly total = computed(() => {
    this.chamadasComputed++;
    return this.itens().reduce((s, i) => s + i.preco, 0);
  });
}

type Lista = PorId | PorIndice | PorObjeto;

async function montar(tipo: Type<Lista>) {
  const fixture = TestBed.createComponent(tipo);
  await fixture.whenStable();
  const linhas = () => Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('li'));
  return { fixture, linhas };
}

async function inverterComTextoEmA(tipo: Type<Lista>) {
  const { fixture, linhas } = await montar(tipo);
  const antes = linhas();
  antes[0].querySelector('input')!.value = 'anotação de A';
  fixture.componentInstance.tarefas.update((l) => [...l].reverse());
  await fixture.whenStable();
  const depois = linhas();
  return {
    titulos: depois.map((li) => li.textContent!.trim()),
    linhaComTexto: depois.find((li) => li.querySelector('input')!.value)!.textContent!.trim(),
  };
}

async function reaproveitadosComCopias(tipo: Type<Lista>) {
  const { fixture, linhas } = await montar(tipo);
  const antes = linhas();
  fixture.componentInstance.tarefas.update((l) => l.map((t) => ({ ...t })));
  await fixture.whenStable();
  return linhas().filter((li, i) => li === antes[i]).length;
}

describe('perf-runtime-01: what each track keeps', () => {
  it('the three variants measured here are the ones shown in the lesson', () => {
    for (const header of ['track t.id', 'track $index', 'track t)']) {
      expect(TRACK_VARIANTS_HTML.replace(/ \{\n/g, ')')).toContain(header.replace(')', ''));
    }
  });

  it('track t.id moves the element with the item: the typed text stays with A', async () => {
    const r = await inverterComTextoEmA(PorId);
    expect(r.titulos).toEqual(['C', 'B', 'A']);
    expect(r.linhaComTexto).toBe('A');
  });

  it('track $index keeps the element at the position: the typed text ends up in C', async () => {
    const r = await inverterComTextoEmA(PorIndice);
    expect(r.titulos).toEqual(['C', 'B', 'A']);
    expect(r.linhaComTexto).toBe('C');
  });

  it('with fresh copies, track t.id reuses 3 of 3 elements and track t reuses 0 of 3', async () => {
    expect(await reaproveitadosComCopias(PorId)).toBe(3);
    expect(await reaproveitadosComCopias(PorObjeto)).toBe(0);
  });
});

describe('perf-runtime-01: work in the template', () => {
  it('the method runs on every view update (4); the computed runs once', async () => {
    const fixture = TestBed.createComponent(Resumo);
    await fixture.whenStable();
    for (let k = 1; k <= 3; k++) {
      fixture.componentInstance.outro.set(k);
      await fixture.whenStable();
    }
    expect(fixture.componentInstance.chamadasMetodo).toBe(4);
    expect(fixture.componentInstance.chamadasComputed).toBe(1);
    expect(TEMPLATE_WORK_TS).toContain('readonly total = computed(');
    expect(TEMPLATE_WORK_TS).toContain('totalMetodo() {');
  });
});
