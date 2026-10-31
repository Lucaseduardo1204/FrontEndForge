import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucidePlay, LucideRotateCcw } from '@lucide/angular';
import { ContentService } from '../../../core/content/content.service';
import { GamificationService, Reward } from '../../../core/gamification/gamification.service';
import { evaluateCodeRun } from '../../../core/lab/code-evaluation';
import { RunResult } from '../../../core/lab/lab-protocol';
import { ScriptExerciseRunner } from '../../../core/lab/script-exercise-runner.service';
import { Evaluation } from '../../../core/learning/exercise-evaluation';
import { CodeExercise } from '../../../core/models/content.models';
import { recordExerciseAttempt } from '../../../core/learning/record-exercise';
import { exerciseStatus } from '../../../core/progress/progress-updates';
import { ProgressService } from '../../../core/progress/progress.service';
import { DIFFICULTY_LABELS } from '../../../shared/labels';
import { ExerciseFeedback } from '../../../shared/exercise/exercise-feedback';
import { HintsSolution } from '../../../shared/exercise/hints-solution';
import { ConfirmDialog } from '../../../shared/ui/confirm-dialog/confirm-dialog';
import { RewardNotice } from '../../../shared/ui/reward-notice/reward-notice';
import { CodeEditor } from '../../../shared/code/code-editor/code-editor';
import { ExerciseBrief } from '../exercise-brief/exercise-brief';
import { HtmlPreview } from '../../../shared/code/html-preview/html-preview';
import { RunOutput } from '../../../shared/code/run-output/run-output';

export const LANGUAGE_LABELS: Readonly<Record<CodeExercise['language'], string>> = {
  html: 'HTML e CSS',
  css: 'CSS',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
};

@Component({
  selector: 'app-lab-exercise-page',
  imports: [
    RouterLink,
    CodeEditor,
    ConfirmDialog,
    ExerciseBrief,
    ExerciseFeedback,
    HintsSolution,
    HtmlPreview,
    RewardNotice,
    RunOutput,
    LucideArrowLeft,
    LucidePlay,
    LucideRotateCcw,
  ],
  templateUrl: './lab-exercise-page.html',
  styleUrl: './lab-exercise-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabExercisePage {
  private readonly content = inject(ContentService);
  private readonly progressService = inject(ProgressService);
  private readonly scriptRunner = inject(ScriptExerciseRunner);
  private readonly gamification = inject(GamificationService);

  /** Route parameter `:exerciseId`. */
  readonly exerciseId = input.required<string>();

  protected readonly exercise = computed(() => {
    const exercise = this.content.exercise(this.exerciseId());
    return exercise?.kind === 'code' ? exercise : undefined;
  });
  /** Mission this exercise belongs to, if any (to link back to it). */
  protected readonly mission = computed(() =>
    this.content.catalog.missions.find((m) => m.exerciseIds.includes(this.exerciseId())),
  );
  protected readonly languageLabels = LANGUAGE_LABELS;
  protected readonly difficultyLabels = DIFFICULTY_LABELS;
  protected readonly status = computed(() =>
    exerciseStatus(this.progressService.progress(), this.exerciseId()),
  );

  /** Starts from the code of the last saved attempt, or from the starter code. */
  protected readonly code = linkedSignal(() => {
    const exercise = this.exercise();
    const last = this.status().lastAttempt?.answer as { code?: unknown } | undefined;
    return typeof last?.code === 'string' ? last.code : (exercise?.starterCode ?? '');
  });

  protected readonly running = signal(false);
  protected readonly result = signal<RunResult | null>(null);
  protected readonly evaluation = signal<Evaluation | null>(null);
  protected readonly saveError = signal<string | null>(null);
  protected readonly reward = signal<Reward | null>(null);
  protected readonly hintsShown = linkedSignal({ source: this.exerciseId, computation: () => 0 });
  protected readonly solutionRequested = linkedSignal({
    source: this.exerciseId,
    computation: () => false,
  });

  private readonly preview = viewChild(HtmlPreview);

  constructor() {
    // HTML exercises show the starting point right away (not graded, not saved).
    afterNextRender(() => {
      const exercise = this.exercise();
      if (exercise?.language === 'html') void this.preview()?.render(this.code(), []);
    });
  }

  protected async run(): Promise<void> {
    const exercise = this.exercise();
    if (!exercise || this.running()) return;
    this.running.set(true);
    this.saveError.set(null);
    this.reward.set(null);

    const code = this.code();
    const result =
      exercise.language === 'html'
        ? await (this.preview()?.render(code, exercise.tests) ??
            Promise.resolve<RunResult>({ status: 'unavailable', message: 'Prévia indisponível.' }))
        : await this.scriptRunner.run(exercise, code);
    const evaluation = evaluateCodeRun(exercise, result);
    this.result.set(result);
    this.evaluation.set(evaluation);

    // A failure of the environment is not the student's attempt; anything that ran is.
    if (result.status !== 'unavailable') {
      const before = this.gamification.snapshot();
      try {
        await this.progressService.update((progress, now) =>
          recordExerciseAttempt(
            this.content.catalog,
            progress,
            exercise,
            {
              id: crypto.randomUUID(),
              activityType: 'exercise',
              activityId: exercise.id,
              submittedAt: now.toISOString(),
              correct: evaluation.correct,
              score: evaluation.score,
              answer: { kind: 'code', code },
              hintsUsed: this.hintsShown(),
              solutionViewed: this.solutionRequested(),
            },
            now,
          ),
        );
        this.reward.set(this.gamification.rewardSince(before));
      } catch (error) {
        this.saveError.set(
          `O código foi executado, mas a tentativa não foi salva. ${error instanceof Error ? error.message : ''}`,
        );
      }
    }
    this.running.set(false);
  }

  protected resetCode(): void {
    const exercise = this.exercise();
    if (!exercise) return;
    this.code.set(exercise.starterCode);
    this.result.set(null);
    this.evaluation.set(null);
    if (exercise.language === 'html') void this.preview()?.render(exercise.starterCode, []);
  }

  protected showHint(): void {
    this.hintsShown.update((n) => n + 1);
  }
}
