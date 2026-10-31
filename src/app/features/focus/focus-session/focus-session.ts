import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideCheck,
  LucideCirclePause,
  LucideCirclePlay,
  LucideFlag,
  LucideSkipForward,
} from '@lucide/angular';
import { ContentService } from '../../../core/content/content.service';
import { activeMinutes } from '../../../core/learning/session-plan';
import { FocusSession, SessionBlock } from '../../../core/models/progress.models';
import {
  endSession,
  pauseSession,
  resumeSession,
  setBlockState,
} from '../../../core/progress/session-updates';
import { ProgressService } from '../../../core/progress/progress.service';
import { LabExercisePage } from '../../lab/lab-exercise-page/lab-exercise-page';
import { LessonPage } from '../../lessons/lesson-page/lesson-page';
import { ReviewPage } from '../../review/review-page/review-page';
import { ExercisePlayer } from '../../../shared/exercise/exercise-player/exercise-player';

/** The active session: plan, current block (embedded), optional timer and pauses. */
@Component({
  selector: 'app-focus-session',
  imports: [
    ExercisePlayer,
    LabExercisePage,
    LessonPage,
    ReviewPage,
    LucideCheck,
    LucideCirclePause,
    LucideCirclePlay,
    LucideFlag,
    LucideSkipForward,
  ],
  templateUrl: './focus-session.html',
  styleUrl: './focus-session.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FocusSessionView {
  private readonly content = inject(ContentService);
  private readonly progressService = inject(ProgressService);
  private readonly router = inject(Router);

  readonly session = input.required<FocusSession>();

  /** Ticks every 30 s while the timer is on; the timer never pushes, it only informs. */
  private readonly now = signal(new Date());
  protected readonly elapsed = computed(() => activeMinutes(this.session(), this.now()));
  protected readonly overTime = computed(() => {
    const planned = this.session().plannedMinutes;
    return planned !== null && this.elapsed() >= planned;
  });
  protected readonly paused = computed(() => this.session().pausedAt !== undefined);

  protected readonly states = computed(() => {
    const s = this.session();
    return new Map(
      s.blocks.map((b) => [
        b.id,
        s.doneBlockIds.includes(b.id)
          ? 'done'
          : s.skippedBlockIds.includes(b.id)
            ? 'skipped'
            : 'pending',
      ]),
    );
  });
  protected readonly doneCount = computed(() => this.session().doneBlockIds.length);

  /** The block on screen: the first pending one, unless the student picked another. */
  protected readonly selectedId = linkedSignal(() => {
    const s = this.session();
    return s.blocks.find((b) => this.states().get(b.id) === 'pending')?.id ?? s.blocks.at(-1)!.id;
  });
  protected readonly current = computed(() =>
    this.session().blocks.find((b) => b.id === this.selectedId())!,
  );
  protected readonly exercise = computed(() => {
    const target = this.current().target;
    return target.type === 'exercise' ? this.content.exercise(target.exerciseId) : undefined;
  });

  protected readonly error = signal<string | null>(null);

  constructor() {
    effect((onCleanup) => {
      if (!this.session().timerEnabled) return;
      const timer = setInterval(() => this.now.set(new Date()), 30_000);
      onCleanup(() => clearInterval(timer));
    });
  }

  protected select(block: SessionBlock): void {
    this.selectedId.set(block.id);
  }

  protected mark(block: SessionBlock, state: 'done' | 'skipped' | 'pending'): void {
    void this.save((p, now) => setBlockState(p, block.id, state, now));
  }

  protected togglePause(): void {
    void this.save((p, now) => (this.paused() ? resumeSession(p, now) : pauseSession(p, now)));
    this.now.set(new Date());
  }

  protected async finish(): Promise<void> {
    const id = this.session().id;
    await this.save((p, now) => endSession(setBlockState(p, 'summary', 'done', now), now));
    if (!this.error()) await this.router.navigate(['/focus/summary', id]);
  }

  private async save(change: Parameters<ProgressService['update']>[0]): Promise<void> {
    try {
      await this.progressService.update(change);
      this.error.set(null);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Não foi possível salvar.');
    }
  }
}
