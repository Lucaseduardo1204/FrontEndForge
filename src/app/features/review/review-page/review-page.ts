import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideCircleCheck, LucideInbox } from '@lucide/angular';
import { ContentService } from '../../../core/content/content.service';
import { Evaluation } from '../../../core/learning/exercise-evaluation';
import { reviewExercise } from '../../../core/learning/performance';
import {
  daysBetween,
  dueReviews,
  INTERVAL_DAYS,
  upcomingReviews,
} from '../../../core/learning/spaced-repetition';
import { ProgressService } from '../../../core/progress/progress.service';
import { toLocalDay } from '../../../core/progress/progress-updates';
import { ExercisePlayer } from '../../../shared/exercise/exercise-player/exercise-player';
import { ReviewSchedule } from '../review-schedule/review-schedule';

interface SessionItem {
  readonly conceptId: string;
  readonly title: string;
  readonly box: number;
  readonly daysOverdue: number;
  readonly exerciseId: string;
}

@Component({
  selector: 'app-review-page',
  imports: [RouterLink, ExercisePlayer, ReviewSchedule, LucideCircleCheck, LucideInbox],
  templateUrl: './review-page.html',
  styleUrl: './review-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewPage {
  private readonly content = inject(ContentService);
  private readonly progressService = inject(ProgressService);
  private readonly catalog = this.content.catalog;

  protected readonly intervals = Object.entries(INTERVAL_DAYS).map(([box, days]) => ({
    box,
    days,
  }));
  protected readonly loadError = this.progressService.loadError;
  protected readonly signInRequired = this.progressService.signInRequired;
  protected readonly hasCards = computed(
    () => Object.keys(this.progressService.progress().reviews).length > 0,
  );

  /** Snapshot taken when the page opens, so the queue does not change while answering. */
  protected readonly session: readonly SessionItem[] = this.buildSession();
  protected readonly index = signal(0);
  protected readonly current = computed(() => this.session[this.index()]);
  protected readonly currentExercise = computed(() => {
    const item = this.current();
    return item ? this.content.exercise(item.exerciseId) : undefined;
  });
  protected readonly outcome = signal<string | null>(null);
  protected readonly correctCount = signal(0);

  protected readonly upcoming = computed(() =>
    upcomingReviews(this.progressService.progress(), new Date()).map((card) => ({
      ...card,
      title: this.conceptTitle(card.conceptId),
      inDays: daysBetween(toLocalDay(new Date()), card.dueOn),
    })),
  );

  protected onAnswered(evaluation: Evaluation): void {
    const item = this.current();
    if (!item) return;
    const card = this.progressService.progress().reviews[item.conceptId];
    if (evaluation.correct) this.correctCount.update((n) => n + 1);
    if (!card) {
      this.outcome.set(null);
      return;
    }
    const when = card.box === 1 ? 'amanhã' : `em ${INTERVAL_DAYS[card.box]} dias`;
    this.outcome.set(
      evaluation.correct
        ? `Você lembrou. “${item.title}” sobe para a caixa ${card.box}: próxima revisão ${when}.`
        : `Desta vez não foi. “${item.title}” volta para a caixa 1 e será revisado amanhã. Leia a explicação e a solução antes de seguir.`,
    );
  }

  protected next(): void {
    this.outcome.set(null);
    this.index.update((i) => i + 1);
  }

  private buildSession(): SessionItem[] {
    const progress = this.progressService.progress();
    return dueReviews(progress, new Date()).flatMap(({ card, daysOverdue }) => {
      const exercise = reviewExercise(this.catalog, progress, card.conceptId);
      return exercise
        ? [
            {
              conceptId: card.conceptId,
              title: this.conceptTitle(card.conceptId),
              box: card.box,
              daysOverdue,
              exerciseId: exercise.id,
            },
          ]
        : [];
    });
  }

  private conceptTitle(id: string): string {
    return this.catalog.concepts.find((c) => c.id === id)?.title ?? id;
  }
}
