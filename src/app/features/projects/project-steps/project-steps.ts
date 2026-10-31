import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ProjectStep } from '../../../core/models/content.models';
import { ContentBlocks } from '../../../shared/ui/content-blocks/content-blocks';

export interface ChecklistChange {
  readonly itemId: string;
  readonly checked: boolean;
}

/** Guided steps with their checklists. The checklist is the student's own record. */
@Component({
  selector: 'app-project-steps',
  imports: [ContentBlocks],
  template: `
    <ol class="steps">
      @for (step of steps(); track step.id; let i = $index) {
        <li class="panel step">
          <h3 class="step__title">
            <span class="step__number" aria-hidden="true">{{ i + 1 }}</span>
            {{ step.title }}
          </h3>
          <app-content-blocks [blocks]="step.guidance" />
          <fieldset class="checklist" [disabled]="disabled()">
            <legend class="field__label">Checklist da etapa</legend>
            @for (item of step.checklist; track item.id) {
              <label class="choice">
                <input
                  type="checkbox"
                  [checked]="checked().includes(item.id)"
                  (change)="changed.emit({ itemId: item.id, checked: $any($event.target).checked })"
                />
                {{ item.text }}
              </label>
            }
          </fieldset>
        </li>
      }
    </ol>
  `,
  styles: `
    .steps {
      display: grid;
      gap: var(--space-4);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .step__title {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      font-size: var(--font-size-lg);
    }

    .step__number {
      display: grid;
      flex-shrink: 0;
      place-items: center;
      width: 1.75rem;
      height: 1.75rem;
      border-radius: var(--radius-full);
      background: var(--color-surface-3);
      font-size: var(--font-size-sm);
    }

    .checklist {
      display: grid;
      gap: var(--space-2);
      margin: 0;
      padding: var(--space-4);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface-2);

      legend {
        padding: 0 var(--space-1);
      }

      .choice {
        align-items: flex-start;

        input {
          margin-top: 0.2rem;
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectSteps {
  readonly steps = input.required<readonly ProjectStep[]>();
  readonly checked = input.required<readonly string[]>();
  readonly disabled = input(false);
  readonly changed = output<ChecklistChange>();
}
