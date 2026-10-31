import { CurrencyPipe, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { Component, LOCALE_ID, Pipe, PipeTransform, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import ts from 'typescript';
import { BINDINGS_TEMPLATE, PURE_PIPE_TS } from './lessons/angular-templates-01';

/**
 * The template and pipe of lesson "angular-templates-01", compiled and executed with this
 * project's Angular, plus the binding and locale claims of the lesson and its exercises.
 */
let execucoesDoPipe = 0;

@Pipe({ name: 'soma' })
class SomaPipe implements PipeTransform {
  // Pipe puro (o padrão): só roda de novo quando a referência do argumento muda.
  transform(valores: readonly number[]): number {
    execucoesDoPipe++;
    return valores.reduce((total, v) => total + v, 0);
  }
}

@Component({
  selector: 'app-filtros',
  imports: [SomaPipe],
  template: `
    <p>{{ comentario }}</p>

    <button
      type="button"
      [attr.aria-expanded]="aberto()"
      [class.ativo]="aberto()"
      (click)="aberto.set(!aberto())"
    >
      Filtros
    </button>

    <button type="button" [aria-pressed]="favorito()" (click)="favorito.set(!favorito())">
      Favorito
    </button>

    @let quantidade = itens().length;
    <p>{{ quantidade }} itens · total {{ itens() | soma }}</p>

    <input aria-label="Novo item" (keydown.enter)="adicionar($any($event.target).value)" />
  `,
})
class Filtros {
  readonly comentario = '<b>ótimo</b>';
  readonly aberto = signal(false);
  readonly favorito = signal(true);
  readonly itens = signal<number[]>([1, 2, 3]);
  readonly outro = signal(0);
  adicionados: string[] = [];
  adicionar(valor: string) {
    this.adicionados.push(valor);
  }
}

@Component({
  selector: 'app-desabilitar',
  template: `<button type="button" id="prop" [disabled]="false">a</button>
    <button type="button" id="prop-true" [disabled]="true">b</button>
    <button type="button" id="attr" [attr.disabled]="false">c</button>
    <button type="button" id="interp" disabled="{{ false }}">d</button>`,
})
class Desabilitar {}

@Component({
  selector: 'app-moeda',
  imports: [CurrencyPipe],
  template: `{{ 1234.5 | currency: 'BRL' }}`,
})
class Moeda {}

describe('angular-templates-01: the lesson template', () => {
  async function montar() {
    const fixture = TestBed.createComponent(Filtros);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      el,
      botoes: el.querySelectorAll('button'),
      paragrafos: el.querySelectorAll('p'),
    };
  }

  it('interpolation inserts text: no <b> element is created', async () => {
    const { paragrafos } = await montar();
    expect(paragrafos[0].textContent).toBe('<b>ótimo</b>');
    expect(paragrafos[0].querySelector('b')).toBeNull();
  });

  it('attribute, ARIA and class bindings', async () => {
    const { fixture, botoes } = await montar();
    expect(botoes[0].getAttribute('aria-expanded')).toBe('false');
    expect(botoes[0].classList.contains('ativo')).toBe(false);
    expect(botoes[1].getAttribute('aria-pressed')).toBe('true');

    botoes[0].click();
    await fixture.whenStable();
    expect(botoes[0].getAttribute('aria-expanded')).toBe('true');
    expect(botoes[0].classList.contains('ativo')).toBe(true);
  });

  it('@let and the pure pipe: push keeps the stale total; a new array recalculates', async () => {
    const { fixture, paragrafos } = await montar();
    expect(paragrafos[1].textContent!.trim()).toBe('3 itens · total 6');

    const antes = execucoesDoPipe;
    fixture.componentInstance.outro.set(1);
    fixture.componentInstance.itens().push(4);
    fixture.componentInstance.favorito.set(false);
    await fixture.whenStable();
    expect(execucoesDoPipe - antes).toBe(0);
    expect(paragrafos[1].textContent).toContain('total 6');

    fixture.componentInstance.itens.update((l) => [...l, 5]);
    await fixture.whenStable();
    expect(execucoesDoPipe - antes).toBe(1);
    expect(paragrafos[1].textContent).toContain('total 15');
  });

  it('(keydown.enter) reacts only to Enter', async () => {
    const { fixture, el } = await montar();
    const campo = el.querySelector('input')!;
    campo.value = 'café';
    campo.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    campo.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(fixture.componentInstance.adicionados).toEqual(['café']);
  });

  it('drift guard: the template and pipe lines are the ones shown in the lesson', () => {
    const spec = ts.sys.readFile('src/content/angular-templates.spec.ts') ?? '';
    const linhas = [...BINDINGS_TEMPLATE.split('\n'), ...PURE_PIPE_TS.split('\n')]
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('export class'));
    expect(linhas.filter((l) => !spec.includes(l))).toEqual([]);
  });
});

describe('angular-templates-01: disabled bindings (exercise claims)', () => {
  it('[disabled]=false enables; [attr.disabled]=false and disabled="{{ false }}" disable', async () => {
    const fixture = TestBed.createComponent(Desabilitar);
    await fixture.whenStable();
    const botao = (id: string) =>
      (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(`#${id}`)!;

    expect(botao('prop').disabled).toBe(false);
    expect(botao('prop').hasAttribute('disabled')).toBe(false);
    expect(botao('prop-true').disabled).toBe(true);
    expect(botao('attr').getAttribute('disabled')).toBe('false');
    expect(botao('attr').disabled).toBe(true);
    expect(botao('interp').disabled).toBe(true);
  });
});

describe('angular-templates-01: currency and locale', () => {
  it('without LOCALE_ID the default is en-US: R$1,234.50', async () => {
    const fixture = TestBed.createComponent(Moeda);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toBe('R$1,234.50');
  });

  it('with LOCALE_ID pt-BR and the locale data registered, the Brazilian format', async () => {
    registerLocaleData(localePt);
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }] });
    const fixture = TestBed.createComponent(Moeda);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent!.replace(/\u00a0/g, ' ')).toBe(
      'R$ 1.234,50',
    );
  });
});
