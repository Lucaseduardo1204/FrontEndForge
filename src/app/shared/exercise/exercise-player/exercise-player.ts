import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideCircleCheck, LucideRotateCcw } from '@lucide/angular';
import {
  evaluateExercise,
  Evaluation,
  ExerciseAnswer,
  initialOrder,
} from '../../../core/learning/exercise-evaluation';
import { Exercise, ExerciseKind } from '../../../core/models/content.models';
import { ContentService } from '../../../core/content/content.service';
import { GamificationService, Reward } from '../../../core/gamification/gamification.service';
import { recordExerciseAttempt, recordReviewAttempt } from '../../../core/learning/record-exercise';
import { exerciseStatus } from '../../../core/progress/progress-updates';
import { ProgressService } from '../../../core/progress/progress.service';
import { HintsSolution } from '../hints-solution';
import { ContentBlocks } from '../../../shared/ui/content-blocks/content-blocks';
import { RewardNotice } from '../../ui/reward-notice/reward-notice';
import { ChoiceInput } from './choice-input';
import { ExerciseFeedback } from '../exercise-feedback';
import { OrderInput } from './order-input';
import { PredictInput } from './predict-input';

const KIND_LABELS: Readonly<Record<ExerciseKind, string>> = {
  'multiple-choice': 'Múltipla escolha',
  'predict-output': 'Prever a saída',
  'order-steps': 'Ordenar etapas',
  code: 'Código',
};

/** Answers one exercise: hints, grading, feedback, solution and the saved attempt. */
@Component({
  selector: 'app-exercise-player',
  imports: [
    ContentBlocks,
    ChoiceInput,
    PredictInput,
    OrderInput,
    ExerciseFeedback,
    HintsSolution,
    RewardNotice,
    RouterLink,
    LucideCircleCheck,
    LucideRotateCcw,
  ],
  templateUrl: './exercise-player.html',
  styleUrl: './exercise-player.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExercisePlayer {
  private readonly progressService = inject(ProgressService);

  private readonly catalog = inject(ContentService).catalog;
  private readonly gamification = inject(GamificationService);

  readonly exercise = input.required<Exercise>();
  /** When set, the answer counts as a spaced review of this concept (one answer only). */
  readonly reviewConceptId = input<string>();
  readonly answered = output<Evaluation>();

  protected readonly kindLabel = computed(() => KIND_LABELS[this.exercise().kind]);
  protected readonly status = computed(() =>
    exerciseStatus(this.progressService.progress(), this.exercise().id),
  );

  // Answer drafts, reset whenever the exercise changes.
  protected readonly selected = linkedSignal<Exercise, readonly string[]>({
    source: this.exercise,
    computation: () => [],
  });
  protected readonly text = linkedSignal<Exercise, string>({
    source: this.exercise,
    computation: () => '',
  });
  protected readonly order = linkedSignal<Exercise, readonly string[]>({
    source: this.exercise,
    computation: (exercise) => (exercise.kind === 'order-steps' ? initialOrder(exercise) : []),
  });

  protected readonly hintsShown = linkedSignal({ source: this.exercise, computation: () => 0 });
  protected readonly solutionRequested = linkedSignal({
    source: this.exercise,
    computation: () => false,
  });
  protected readonly evaluation = linkedSignal<Exercise, Evaluation | null>({
    source: this.exercise,
    computation: () => null,
  });
  protected readonly reward = linkedSignal<Exercise, Reward | null>({
    source: this.exercise,
    computation: () => null,
  });
  protected readonly saving = signal(false);
  protected readonly saveError = signal<string | null>(null);

  /** The solution unlocks after any attempt or an explicit request. */
  protected readonly solutionUnlocked = computed(
    () => this.status().attempts > 0 || this.evaluation() !== null,
  );
  protected readonly locked = computed(() => this.evaluation() !== null || this.saving());

  protected readonly answer = computed<ExerciseAnswer | null>(() => {
    switch (this.exercise().kind) {
      case 'multiple-choice':
        return this.selected().length > 0
          ? { kind: 'multiple-choice', selected: this.selected() }
          : null;
      case 'predict-output':
        return this.text().trim() ? { kind: 'predict-output', text: this.text() } : null;
      case 'order-steps':
        return { kind: 'order-steps', order: this.order() };
      case 'code':
        return null;
    }
  });

  protected showHint(): void {
    this.hintsShown.update((n) => Math.min(n + 1, this.exercise().hints.length));
  }

  protected requestSolution(): void {
    this.solutionRequested.set(true);
  }

  protected tryAgain(): void {
    this.evaluation.set(null);
    this.reward.set(null);
    this.saveError.set(null);
  }

  protected async submit(): Promise<void> {
    const answer = this.answer();
    if (!answer || this.locked()) return;
    const exercise = this.exercise();
    const result = evaluateExercise(exercise, answer);

    this.saving.set(true);
    this.saveError.set(null);
    try {
      const before = this.gamification.snapshot();
      const conceptId = this.reviewConceptId();
      await this.progressService.update((progress, now) => {
        const attempt = {
          id: crypto.randomUUID(),
          submittedAt: now.toISOString(),
          correct: result.correct,
          score: result.score,
          answer,
          hintsUsed: this.hintsShown(),
          solutionViewed: this.solutionRequested(),
        };
        return conceptId
          ? recordReviewAttempt(progress, conceptId, exercise, attempt, now)
          : recordExerciseAttempt(
              this.catalog,
              progress,
              exercise,
              { ...attempt, activityType: 'exercise', activityId: exercise.id },
              now,
            );
      });
      this.reward.set(this.gamification.rewardSince(before));
    } catch (error) {
      this.saveError.set(
        `A resposta foi avaliada, mas a tentativa não foi salva. ${error instanceof Error ? error.message : ''}`,
      );
    } finally {
      this.saving.set(false);
      this.evaluation.set(result);
      this.answered.emit(result);
    }
  }
}
