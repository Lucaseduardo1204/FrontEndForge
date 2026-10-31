import { NgOptimizedImage } from '@angular/common';
import { Component, ElementRef, viewChild } from '@angular/core';
import { DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { CodeExercise } from '../app/core/models/content.models';
import { A11Y_PRACTICE_01_EXERCISES } from './exercises/a11y-practice-01.exercises';
import { A11Y_PRACTICE_01, DIALOG_HTML } from './lessons/a11y-practice-01';
import { DEFER_HTML, IMAGE_HTML, PERF_LOADING_01 } from './lessons/perf-loading-01';

/** Claims of the phase 11 lessons, executed with the Angular of this project (D-056). */

// @defer resolves its dependencies at module level: keep these outside describe().
@Component({ selector: 'app-grafico-vendas', template: '<p>gráfico pesado</p>' })
class GraficoVendas {}

@Component({
  selector: 'app-painel',
  imports: [GraficoVendas],
  template: `@defer (on viewport) {
      <app-grafico-vendas />
    } @placeholder {
      <p>Gráfico de vendas</p>
    } @loading (minimum 300ms) {
      <p>Carregando o gráfico…</p>
    }`,
})
class Painel {}

describe('performance lesson', () => {
  it('@defer shows the placeholder first and the content once triggered', async () => {
    TestBed.configureTestingModule({ deferBlockBehavior: DeferBlockBehavior.Manual });
    const fixture = TestBed.createComponent(Painel);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent.trim()).toBe('Gráfico de vendas');

    const [block] = await fixture.getDeferBlocks();
    await block.render(DeferBlockState.Complete);

    expect(fixture.nativeElement.textContent.trim()).toBe('gráfico pesado');
  });

  @Component({
    selector: 'app-catalogo',
    imports: [NgOptimizedImage],
    template: `<img
        ngSrc="/produtos/cafe.jpg"
        width="800"
        height="600"
        priority
        alt="Pacote de café torrado"
      />
      <img ngSrc="/produtos/pao.jpg" width="400" height="300" alt="Pão de fermentação natural" />`,
  })
  class Catalogo {}

  it('priority loads the main image eagerly; the others are lazy', async () => {
    const fixture = TestBed.createComponent(Catalogo);
    await fixture.whenStable();
    const [main, other] = Array.from(
      fixture.nativeElement.querySelectorAll('img'),
    ) as HTMLImageElement[];

    expect(main.getAttribute('loading')).toBe('eager');
    expect(main.getAttribute('fetchpriority')).toBe('high');
    expect(other.getAttribute('loading')).toBe('lazy');
  });

  @Component({
    selector: 'app-sem-dimensoes',
    imports: [NgOptimizedImage],
    template: '<img ngSrc="/foto.jpg" alt="Foto" />',
  })
  class SemDimensoes {}

  it('NgOptimizedImage refuses an image without width and height (NG02954)', () => {
    expect(() => TestBed.createComponent(SemDimensoes).detectChanges()).toThrow(/NG02954/);
  });

  it('the lesson shows the same templates', () => {
    for (const fragment of [
      '@defer (on viewport) {',
      '} @placeholder {',
      '} @loading (minimum 300ms) {',
    ]) {
      expect(DEFER_HTML, fragment).toContain(fragment);
    }
    expect(IMAGE_HTML).toContain('width="800" height="600" priority');
    expect(
      PERF_LOADING_01.steps
        .flatMap((s) => s.blocks)
        .some((b) => b.type === 'paragraph' && b.text.includes('479 kB')),
    ).toBe(true);
  });
});

describe('accessibility lesson', () => {
  /** The confirmation dialog of the lesson, compiled as written. */
  @Component({ selector: 'app-confirmar-apagar', template: DIALOG_HTML_TEMPLATE() })
  class ConfirmarApagar {
    apagados = 0;
    readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');
    apagar() {
      this.apagados++;
    }
  }

  it('the dialog template of the lesson compiles and wires its buttons', async () => {
    const fixture = TestBed.createComponent(ConfirmarApagar);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const dialog = el.querySelector('dialog')!;

    expect(dialog.getAttribute('aria-labelledby')).toBe('titulo-apagar');
    expect(el.querySelector('#titulo-apagar')?.textContent).toBe('Apagar todo o progresso?');
    expect(el.querySelector('dialog button[autofocus]')?.textContent).toBe('Cancelar');
    expect(el.querySelector('button')?.textContent).toBe('Apagar progresso');
  });

  it('the contrast values quoted in the lesson come from the lab formula', () => {
    const exercise = A11Y_PRACTICE_01_EXERCISES.find(
      (e) => e.id === 'lab-js-contrast',
    ) as CodeExercise;
    const code = exercise.solution.find((b) => b.type === 'code');
    const razao = new Function(
      `${code?.type === 'code' ? code.code : ''}\nreturn razaoDeContraste;`,
    )() as (a: string, b: string) => number;
    const text = A11Y_PRACTICE_01.steps
      .flatMap((s) => s.blocks)
      .map((b) => (b.type === 'paragraph' ? b.text : ''))
      .join(' ');

    for (const [a, b, quoted] of [
      ['#e6e8eb', '#111317', '15,15'],
      ['#a3aab4', '#111317', '7,94'],
      ['#8a929d', '#111317', '5,91'],
      ['#767676', '#ffffff', '4,54'],
      ['#777777', '#ffffff', '4,48'],
    ]) {
      expect(razao(a, b).toFixed(2).replace('.', ','), `${a}/${b}`).toBe(quoted);
      expect(text, quoted).toContain(`${quoted}:1`);
    }
  });
});

/** The lesson template, unchanged. Kept in a function so the decorator can use it. */
function DIALOG_HTML_TEMPLATE(): string {
  return DIALOG_HTML;
}
