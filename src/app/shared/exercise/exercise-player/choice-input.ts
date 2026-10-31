import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { MultipleChoiceExercise } from '../../../core/models/content.models';

let nextId = 0;

@Component({
  selector: 'app-choice-input',
  template: `
    <fieldset class="choices" [disabled]="disabled()">
      <legend class="field__label">
        {{ multiple() ? 'Marque todas as opções corretas' : 'Escolha uma opção' }}
      </legend>
      @for (option of exercise().options; track option.id) {
        <label class="choices__option" [class.choices__option--selected]="isSelected(option.id)">
          <input
            [type]="multiple() ? 'checkbox' : 'radio'"
            [name]="name"
            [value]="option.id"
            [checked]="isSelected(option.id)"
            (change)="toggle(option.id, $any($event.target).checked)"
          />
          <span>{{ option.text }}</span>
        </label>
      }
    </fieldset>
  `,
  styles: `
    .choices {
      display: grid;
      gap: var(--space-2);
      margin: 0;
      padding: 0;
      border: 0;
    }

    legend {
      margin-bottom: var(--space-2);
      padding: 0;
    }

    .choices__option {
      display: flex;
      gap: var(--space-3);
      align-items: flex-start;
      padding: var(--space-3) var(--space-4);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface-2);
      cursor: pointer;
      transition: border-color var(--duration-fast) var(--easing-standard);

      &:hover {
        border-color: var(--color-border-strong);
      }

      &:has(input:focus-visible) {
        outline: 2px solid var(--color-focus);
        outline-offset: 2px;
      }

      input {
        flex-shrink: 0;
        width: 1.1rem;
        height: 1.1rem;
        margin: 0.2rem 0 0;
        accent-color: var(--color-accent);
      }
    }

    .choices__option--selected {
      border-color: var(--color-accent);
    }

    fieldset:disabled .choices__option {
      cursor: not-allowed;
      opacity: 0.7;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChoiceInput {
  readonly exercise = input.required<MultipleChoiceExercise>();
  readonly disabled = input(false);
  readonly selected = model.required<readonly string[]>();

  protected readonly name = `choice-${nextId++}`;
  protected readonly multiple = computed(() => this.exercise().correctOptionIds.length > 1);

  protected isSelected(id: string): boolean {
    return this.selected().includes(id);
  }

  protected toggle(id: string, checked: boolean): void {
    if (!this.multiple()) {
      this.selected.set([id]);
      return;
    }
    this.selected.update((current) =>
      checked ? [...current.filter((s) => s !== id), id] : current.filter((s) => s !== id),
    );
  }
}
