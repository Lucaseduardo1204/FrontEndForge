import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowLeft,
  LucideCircleCheck,
  LucideFlaskConical,
  LucideLightbulb,
  LucideLock,
} from '@lucide/angular';
import { ContentService } from '../../../core/content/content.service';
import { Exercise } from '../../../core/models/content.models';
import { missionStatus } from '../../../core/progress/mission-status';
import { exerciseStatus } from '../../../core/progress/progress-updates';
import { ProgressService } from '../../../core/progress/progress.service';
import { DIFFICULTY_LABELS } from '../../../shared/labels';
import { ExercisePlayer } from '../../../shared/exercise/exercise-player/exercise-player';
import { ContentBlocks } from '../../../shared/ui/content-blocks/content-blocks';

@Component({
  selector: 'app-mission-page',
  imports: [
    RouterLink,
    ContentBlocks,
    ExercisePlayer,
    LucideArrowLeft,
    LucideCircleCheck,
    LucideFlaskConical,
    LucideLightbulb,
    LucideLock,
  ],
  templateUrl: './mission-page.html',
  styleUrl: './mission-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MissionPage {
  private readonly content = inject(ContentService);
  private readonly progressService = inject(ProgressService);

  /** Route parameter `:missionId`. */
  readonly missionId = input.required<string>();

  protected readonly difficultyLabels = DIFFICULTY_LABELS;
  protected readonly mission = computed(() =>
    this.content.catalog.missions.find((m) => m.id === this.missionId()),
  );
  protected readonly status = computed(() => {
    const mission = this.mission();
    return mission && missionStatus(mission, this.progressService.progress());
  });
  protected readonly tasks = computed(() => {
    const progress = this.progressService.progress();
    return (this.mission()?.exerciseIds ?? [])
      .map((id) => this.content.exercise(id))
      .filter((e): e is Exercise => e !== undefined)
      .map((exercise) => ({ exercise, solved: exerciseStatus(progress, exercise.id).solved }));
  });
  protected readonly hintsShown = linkedSignal({ source: this.missionId, computation: () => 0 });
}
