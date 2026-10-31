import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideCheck } from '@lucide/angular';
import { LessonStep } from '../../../core/models/content.models';

@Component({
  selector: 'app-lesson-step-nav',
  imports: [LucideCheck],
  template: `
    <nav aria-label="Etapas da lição">
      <ol class="steps">
        @for (step of steps(); track $index; let i = $index) {
          <li>
            <button
              type="button"
              class="steps__button"
              [class.steps__button--current]="i === current()"
              [attr.aria-current]="i === current() ? 'step' : null"
              (click)="selected.emit(i)"
            >
              <span class="steps__number" aria-hidden="true">
                @if (solvedSteps()[i]) {
                  <svg lucideCheck size="14"></svg>
                } @else {
                  {{ i + 1 }}
                }
              </span>
              <span class="steps__title">
                {{ step.title }}
                @if (solvedSteps()[i]) {
                  <span class="visually-hidden">(exercícios resolvidos)</span>
                }
              </span>
            </button>
          </li>
        }
      </ol>
    </nav>
  `,
  styleUrl: './lesson-step-nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonStepNav {
  readonly steps = input.required<readonly LessonStep[]>();
  readonly current = input.required<number>();
  /** Per step: true when it has exercises and all of them are solved. */
  readonly solvedSteps = input.required<readonly boolean[]>();
  readonly selected = output<number>();
}
