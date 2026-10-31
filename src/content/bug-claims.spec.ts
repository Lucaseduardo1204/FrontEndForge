import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

/**
 * Executable proof of what the bestiary entry "bug-signal-mutation" claims, using the same
 * Angular version and zoneless setup as this app.
 */
@Component({
  selector: 'app-mutating-list',
  template: `@for (t of tarefas(); track $index) {
    <li>{{ t }}</li>
  }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MutatingList {
  readonly tarefas = signal<string[]>([]);
  adicionar(titulo: string): void {
    this.tarefas().push(titulo); // the bug
  }
}

@Component({
  selector: 'app-updating-list',
  template: `@for (t of tarefas(); track $index) {
    <li>{{ t }}</li>
  }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class UpdatingList {
  readonly tarefas = signal<readonly string[]>([]);
  adicionar(titulo: string): void {
    this.tarefas.update((lista) => [...lista, titulo]); // the fix
  }
}

describe('bestiary claim: mutating a signal value does not update the view', () => {
  it('push on the array leaves the OnPush view unchanged', async () => {
    const fixture = TestBed.createComponent(MutatingList);
    await fixture.whenStable();

    fixture.componentInstance.adicionar('Nova');
    await fixture.whenStable();

    expect(fixture.componentInstance.tarefas()).toEqual(['Nova']); // the data changed…
    expect(fixture.nativeElement.querySelectorAll('li').length).toBe(0); // …the view did not
  });

  it('update with a new array refreshes the view', async () => {
    const fixture = TestBed.createComponent(UpdatingList);
    await fixture.whenStable();

    fixture.componentInstance.adicionar('Nova');
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('li').length).toBe(1);
  });
});

describe('bestiary claim: "bug-number-cep"', () => {
  it('type number empties a CEP with a hyphen and drops the leading zero', () => {
    const campo = document.createElement('input');
    campo.type = 'number';

    campo.value = '01310-100';
    expect(campo.value).toBe('');

    campo.value = '01310100';
    expect(campo.valueAsNumber).toBe(1310100);
  });

  it('the fix keeps the CEP as text and validates the format', () => {
    const campo = document.createElement('input');
    campo.setAttribute('inputmode', 'numeric');
    campo.pattern = '\\d{5}-?\\d{3}';

    for (const cep of ['01310-100', '01310100']) {
      campo.value = cep;
      expect(campo.value).toBe(cep);
      expect(campo.validity.patternMismatch).toBe(false);
    }
    campo.value = '1310-100';
    expect(campo.validity.patternMismatch).toBe(true);
  });
});

describe('bestiary claim: "bug-float-money"', () => {
  it('19.9 * 3 is not 59.7; in cents it is exact', () => {
    expect(19.9 * 3).toBe(59.699999999999996);
    expect((1990 * 3) / 100).toBe(59.7);
  });
});
