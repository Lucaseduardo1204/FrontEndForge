import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  linkedSignal,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideChevronLeft, LucideChevronRight, LucideClock } from '@lucide/angular';
import { assessmentExerciseIds } from '../../../core/content/catalog';
import { ContentService } from '../../../core/content/content.service';
import { GamificationService, Reward } from '../../../core/gamification/gamification.service';
import { Exercise } from '../../../core/models/content.models';
import {
  completeLesson,
  isCompleted,
  setLessonStep,
  startLesson,
} from '../../../core/progress/progress-updates';
import { ProgressService } from '../../../core/progress/progress.service';
import { DIFFICULTY_LABELS, STEP_KIND_LABELS } from '../../../shared/labels';
import { ContentBlocks } from '../../../shared/ui/content-blocks/content-blocks';
import { RewardNotice } from '../../../shared/ui/reward-notice/reward-notice';
import { ExercisePlayer } from '../../../shared/exercise/exercise-player/exercise-player';
import { LessonCompletion } from '../lesson-completion/lesson-completion';
import { LessonStepNav } from '../lesson-step-nav/lesson-step-nav';

@Component({
  selector: 'app-lesson-page',
  imports: [
    RouterLink,
    ContentBlocks,
    ExercisePlayer,
    LessonCompletion,
    LessonStepNav,
    RewardNotice,
    LucideChevronLeft,
    LucideChevronRight,
    LucideClock,
  ],
  templateUrl: './lesson-page.html',
  styleUrl: './lesson-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonPage {
  private readonly content = inject(ContentService);
  private readonly progressService = inject(ProgressService);
  private readonly injector = inject(Injector);
  private readonly gamification = inject(GamificationService);

  /** Route parameter `:lessonId`. */
  readonly lessonId = input.required<string>();

  protected readonly lesson = computed(() => this.content.lesson(this.lessonId()));
  protected readonly context = computed(() => {
    const lesson = this.lesson();
    return lesson && this.content.context(lesson);
  });
  protected readonly difficultyLabels = DIFFICULTY_LABELS;
  protected readonly stepKindLabels = STEP_KIND_LABELS;

  /** Optional query parameter `?step=N` (1-based), used by links to a specific exercise. */
  readonly step = input<string>();

  /** Starts at `?step=` when given, otherwise at the saved step of the lesson. */
  protected readonly stepIndex = linkedSignal({
    source: () => ({ id: this.lessonId(), step: this.step() }),
    computation: ({ id, step }) => {
      const total = this.content.lesson(id)?.steps.length ?? 0;
      const requested = Number(step) - 1;
      if (Number.isInteger(requested) && requested >= 0 && requested < total) return requested;
      return untracked(() => this.progressService.progress().lessons[id]?.currentStepIndex ?? 0);
    },
  });
  protected readonly currentStep = computed(() => {
    const steps = this.lesson()?.steps ?? [];
    return steps[Math.min(this.stepIndex(), steps.length - 1)];
  });
  protected readonly isLastStep = computed(
    () => this.stepIndex() === (this.lesson()?.steps.length ?? 0) - 1,
  );

  protected readonly stepExercises = computed(() =>
    this.exercisesOf(this.currentStep()?.exerciseIds),
  );
  protected readonly solvedSteps = computed(() => {
    const progress = this.progressService.progress();
    return (this.lesson()?.steps ?? []).map(
      (step) =>
        (step.exerciseIds?.length ?? 0) > 0 &&
        step.exerciseIds!.every((id) => isCompleted(progress, 'exercise', id)),
    );
  });
  protected readonly remainingAssessment = computed(() => {
    const lesson = this.lesson();
    const progress = this.progressService.progress();
    if (!lesson) return [];
    return this.exercisesOf(assessmentExerciseIds(lesson))
      .filter((exercise) => !isCompleted(progress, 'exercise', exercise.id))
      .map((exercise) => exercise.title);
  });
  protected readonly completedAt = computed(
    () => this.progressService.progress().lessons[this.lessonId()]?.completedAt,
  );

  protected readonly completing = signal(false);
  protected readonly reward = signal<Reward | null>(null);
  protected readonly saveError = signal<string | null>(null);

  private readonly stepHeading = viewChild<ElementRef<HTMLElement>>('stepHeading');

  constructor() {
    effect(() => {
      const lesson = this.lesson();
      if (lesson) untracked(() => this.save((p, now) => startLesson(p, lesson.id, now)));
    });
  }

  protected goTo(index: number): void {
    const lesson = this.lesson();
    if (!lesson || index < 0 || index >= lesson.steps.length) return;
    this.stepIndex.set(index);
    this.save((p, now) => setLessonStep(p, lesson.id, index, now));
    // Move focus to the new step so keyboard and screen reader users land on it.
    afterNextRender(() => this.stepHeading()?.nativeElement.focus(), { injector: this.injector });
  }

  protected goToAssessment(): void {
    const index = this.lesson()?.steps.findIndex((s) => s.kind === 'assessment') ?? -1;
    if (index >= 0) this.goTo(index);
  }

  protected async complete(): Promise<void> {
    const lesson = this.lesson();
    if (!lesson || this.remainingAssessment().length > 0) return;
    this.completing.set(true);
    const before = this.gamification.snapshot();
    await this.save((p, now) => completeLesson(p, lesson.id, now));
    this.reward.set(this.gamification.rewardSince(before));
    this.completing.set(false);
  }

  private exercisesOf(ids: readonly string[] | undefined): Exercise[] {
    return (ids ?? []).flatMap((id) => this.content.exercise(id) ?? []);
  }

  private async save(change: Parameters<ProgressService['update']>[0]): Promise<void> {
    try {
      await this.progressService.update(change);
      this.saveError.set(null);
    } catch (error) {
      this.saveError.set(error instanceof Error ? error.message : 'Não foi possível salvar.');
    }
  }
}
