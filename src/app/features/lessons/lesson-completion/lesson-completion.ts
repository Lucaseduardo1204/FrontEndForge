import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight, LucideCircleCheck, LucideListChecks } from '@lucide/angular';

@Component({
  selector: 'app-lesson-completion',
  imports: [DatePipe, RouterLink, LucideArrowRight, LucideCircleCheck, LucideListChecks],
  template: `
    <section class="panel completion" aria-labelledby="completion-heading">
      @if (completedAt(); as date) {
        <h2 id="completion-heading" class="panel__title completion__title">
          <svg lucideCircleCheck aria-hidden="true" class="completion__icon--done"></svg>
          Lição concluída
        </h2>
        <p>
          Concluída em {{ date | date: "d 'de' MMMM 'de' y" }}. Você pode revisitar qualquer etapa.
        </p>
        <div class="btn-row">
          <a class="btn btn--primary" routerLink="/">
            Ver próxima atividade
            <svg lucideArrowRight aria-hidden="true"></svg>
          </a>
        </div>
      } @else if (remaining().length > 0) {
        <h2 id="completion-heading" class="panel__title completion__title">
          <svg lucideListChecks aria-hidden="true"></svg>
          Falta pouco para concluir
        </h2>
        <p>Para concluir a lição, acerte os exercícios da avaliação que ainda faltam:</p>
        <ul class="completion__list">
          @for (title of remaining(); track title) {
            <li>{{ title }}</li>
          }
        </ul>
        <div class="btn-row">
          <button type="button" class="btn" (click)="goToAssessment.emit()">
            Ir para a avaliação
          </button>
        </div>
      } @else {
        <h2 id="completion-heading" class="panel__title completion__title">
          <svg lucideListChecks aria-hidden="true"></svg>
          Avaliação concluída
        </h2>
        <p>Você acertou todos os exercícios da avaliação.</p>
        <div class="btn-row">
          <button
            type="button"
            class="btn btn--primary"
            [disabled]="busy()"
            [attr.aria-busy]="busy()"
            (click)="complete.emit()"
          >
            Concluir lição
          </button>
        </div>
      }
    </section>
  `,
  styles: `
    .completion {
      border-color: var(--color-border-strong);
    }

    .completion__title {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .completion__icon--done {
      color: var(--color-success);
    }

    .completion__list {
      margin: 0;
      padding-left: var(--space-5);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonCompletion {
  /** Titles of assessment exercises not solved yet. */
  readonly remaining = input.required<readonly string[]>();
  readonly completedAt = input<string | undefined>();
  readonly busy = input(false);

  readonly complete = output();
  readonly goToAssessment = output();
}
