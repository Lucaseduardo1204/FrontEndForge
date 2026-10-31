import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideCircleCheck, LucideCircleX, LucideInfo } from '@lucide/angular';
import { Evaluation } from '../../core/learning/exercise-evaluation';

@Component({
  selector: 'app-exercise-feedback',
  imports: [LucideCircleCheck, LucideCircleX, LucideInfo],
  template: `
    @let result = evaluation();
    <div class="feedback" [class.feedback--correct]="result.correct">
      <p class="feedback__summary">
        @if (result.correct) {
          <svg lucideCircleCheck aria-hidden="true"></svg>
        } @else {
          <svg lucideCircleX aria-hidden="true"></svg>
        }
        {{ result.summary }}
      </p>
      <ul class="feedback__items">
        @for (item of result.feedback; track $index) {
          <li [class]="'feedback__item feedback__item--' + item.tone">
            @switch (item.tone) {
              @case ('correct') {
                <svg lucideCircleCheck aria-hidden="true"></svg>
                <span class="visually-hidden">Certo:</span>
              }
              @case ('incorrect') {
                <svg lucideCircleX aria-hidden="true"></svg>
                <span class="visually-hidden">Errado:</span>
              }
              @default {
                <svg lucideInfo aria-hidden="true"></svg>
              }
            }
            <span>{{ item.text }}</span>
          </li>
        }
      </ul>
    </div>
  `,
  styles: `
    .feedback {
      display: grid;
      gap: var(--space-3);
      padding: var(--space-4);
      border: 1px solid color-mix(in srgb, var(--color-danger) 45%, transparent);
      border-radius: var(--radius-md);
      background: var(--color-danger-soft);
    }

    .feedback--correct {
      border-color: color-mix(in srgb, var(--color-success) 45%, transparent);
      background: var(--color-success-soft);
    }

    .feedback__summary {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-weight: var(--font-weight-bold);
    }

    .feedback__items {
      display: grid;
      gap: var(--space-2);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .feedback__item {
      display: flex;
      gap: var(--space-2);
      align-items: flex-start;

      svg {
        width: 1.1rem;
        height: 1.1rem;
        margin-top: 0.2rem;
      }
    }

    .feedback__item--correct svg,
    .feedback--correct .feedback__summary svg {
      color: var(--color-success);
    }

    .feedback__item--incorrect svg,
    .feedback__summary svg {
      color: var(--color-danger);
    }

    .feedback__item--info svg {
      color: var(--color-info);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExerciseFeedback {
  readonly evaluation = input.required<Evaluation>();
}
