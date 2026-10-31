import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface ProgressStats {
  readonly lessonsCompleted: number;
  readonly lessonsPublished: number;
  readonly exercisesSolved: number;
  readonly exercisesPublished: number;
  readonly attempts: number;
  readonly correctAttempts: number;
  readonly studyDays: number;
}

@Component({
  selector: 'app-progress-summary',
  template: `
    @let s = stats();
    <section class="panel" aria-labelledby="summary-heading">
      <h2 id="summary-heading" class="panel__title">Seu progresso</h2>
      <div class="field">
        <label class="field__label" for="lessons-progress">
          Lições concluídas: {{ s.lessonsCompleted }} de {{ s.lessonsPublished }} publicadas
        </label>
        <progress
          id="lessons-progress"
          class="bar"
          [max]="s.lessonsPublished || 1"
          [value]="s.lessonsCompleted"
        ></progress>
      </div>
      <dl class="stats">
        <div class="stats__item">
          <dt>Exercícios resolvidos</dt>
          <dd>
            {{ s.exercisesSolved }} <span>de {{ s.exercisesPublished }}</span>
          </dd>
        </div>
        <div class="stats__item">
          <dt>Respostas certas</dt>
          <dd>
            {{ s.correctAttempts }} <span>de {{ s.attempts }} tentativas</span>
          </dd>
        </div>
        <div class="stats__item">
          <dt>Dias com estudo</dt>
          <dd>{{ s.studyDays }}</dd>
        </div>
      </dl>
    </section>
  `,
  styles: `
    .bar {
      width: 100%;
      height: 0.5rem;
      border: 0;
      border-radius: var(--radius-full);
      background: var(--color-surface-3);
      overflow: hidden;
      appearance: none;

      &::-webkit-progress-bar {
        background: var(--color-surface-3);
      }

      &::-webkit-progress-value {
        background: var(--color-accent);
        border-radius: var(--radius-full);
      }

      &::-moz-progress-bar {
        background: var(--color-accent);
        border-radius: var(--radius-full);
      }
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
      gap: var(--space-3);
      margin: 0;
    }

    .stats__item {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      background: var(--color-surface-2);

      dt {
        color: var(--color-text-muted);
        font-size: var(--font-size-sm);
      }

      dd {
        margin: var(--space-1) 0 0;
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-bold);

        span {
          color: var(--color-text-subtle);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-regular);
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressSummary {
  readonly stats = input.required<ProgressStats>();
}
