import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RubricCriterion } from '../../../core/models/content.models';

export interface RubricChange {
  readonly criterionId: string;
  readonly score: number;
}

/** Transparent self-assessment rubric: one level per criterion, chosen by the student. */
@Component({
  selector: 'app-project-rubric',
  template: `
    <div class="rubric">
      @for (criterion of rubric(); track criterion.id) {
        <fieldset class="criterion" [disabled]="disabled()">
          <legend class="criterion__title">{{ criterion.title }}</legend>
          <p class="criterion__description">{{ criterion.description }}</p>
          @for (level of criterion.levels; track level.score) {
            <label
              class="level"
              [class.level--selected]="assessment()[criterion.id] === level.score"
            >
              <input
                type="radio"
                [name]="'rubric-' + criterion.id"
                [checked]="assessment()[criterion.id] === level.score"
                (change)="changed.emit({ criterionId: criterion.id, score: level.score })"
              />
              <span
                ><strong>Nível {{ level.score }}.</strong> {{ level.description }}</span
              >
            </label>
          }
        </fieldset>
      }
    </div>
  `,
  styles: `
    .rubric {
      display: grid;
      gap: var(--space-4);

      @media (min-width: 56rem) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    .criterion {
      display: grid;
      gap: var(--space-2);
      margin: 0;
      padding: var(--space-4);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background: var(--color-surface-1);
    }

    .criterion__title {
      padding: 0 var(--space-1);
      font-weight: var(--font-weight-bold);
    }

    .criterion__description {
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
    }

    .level {
      display: flex;
      gap: var(--space-3);
      align-items: flex-start;
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      cursor: pointer;

      &:has(input:focus-visible) {
        outline: 2px solid var(--color-focus);
        outline-offset: 2px;
      }

      input {
        flex-shrink: 0;
        margin-top: 0.2rem;
        accent-color: var(--color-accent);
      }
    }

    .level--selected {
      border-color: var(--color-accent);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectRubric {
  readonly rubric = input.required<readonly RubricCriterion[]>();
  readonly assessment = input.required<Readonly<Record<string, number>>>();
  readonly disabled = input(false);
  readonly changed = output<RubricChange>();
}
