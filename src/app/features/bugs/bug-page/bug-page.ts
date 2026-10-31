import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideBug, LucideEye, LucideLock } from '@lucide/angular';
import { ContentService } from '../../../core/content/content.service';
import { ContentBlock } from '../../../core/models/content.models';
import { exerciseStatus } from '../../../core/progress/progress-updates';
import { ProgressService } from '../../../core/progress/progress.service';
import { DIFFICULTY_LABELS } from '../../../shared/labels';
import { ExercisePlayer } from '../../../shared/exercise/exercise-player/exercise-player';
import { ContentBlocks } from '../../../shared/ui/content-blocks/content-blocks';
import { TECHNOLOGY_LABELS } from '../bug-labels';

@Component({
  selector: 'app-bug-page',
  imports: [
    RouterLink,
    ContentBlocks,
    ExercisePlayer,
    LucideArrowLeft,
    LucideBug,
    LucideEye,
    LucideLock,
  ],
  templateUrl: './bug-page.html',
  styleUrl: './bug-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BugPage {
  private readonly content = inject(ContentService);
  private readonly progressService = inject(ProgressService);

  /** Route parameter `:bugId`. */
  readonly bugId = input.required<string>();

  protected readonly technologyLabels = TECHNOLOGY_LABELS;
  protected readonly difficultyLabels = DIFFICULTY_LABELS;
  protected readonly bug = computed(() =>
    this.content.catalog.bugs.find((b) => b.id === this.bugId()),
  );
  protected readonly codeBlocks = computed<ContentBlock[]>(() => {
    const code = this.bug()?.problematicCode;
    return code
      ? [{ type: 'code', language: code.language, code: code.code, caption: 'Código' }]
      : [];
  });
  protected readonly diagnosis = computed(() => {
    const id = this.bug()?.diagnosisExerciseId;
    return id ? this.content.exercise(id) : undefined;
  });
  protected readonly diagnosisStatus = computed(() => {
    const id = this.bug()?.diagnosisExerciseId;
    return id ? exerciseStatus(this.progressService.progress(), id) : undefined;
  });
  /** Explicit request to see the cause without diagnosing (kept for this visit only). */
  protected readonly revealRequested = linkedSignal({
    source: this.bugId,
    computation: () => false,
  });
  /** The cause is revealed after a diagnosis attempt (saved) or an explicit request. */
  protected readonly revealed = computed(
    () =>
      !this.diagnosis() || (this.diagnosisStatus()?.attempts ?? 0) > 0 || this.revealRequested(),
  );
}
