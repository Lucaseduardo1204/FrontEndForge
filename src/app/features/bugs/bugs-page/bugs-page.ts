import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../../core/content/content.service';
import { BugEntry } from '../../../core/models/content.models';
import { exerciseStatus } from '../../../core/progress/progress-updates';
import { ProgressService } from '../../../core/progress/progress.service';
import { DIFFICULTY_LABELS } from '../../../shared/labels';
import { TECHNOLOGY_LABELS } from '../bug-labels';

type Filter = BugEntry['technology'] | 'all';

@Component({
  selector: 'app-bugs-page',
  imports: [RouterLink],
  templateUrl: './bugs-page.html',
  styleUrl: './bugs-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BugsPage {
  private readonly catalog = inject(ContentService).catalog;
  private readonly progressService = inject(ProgressService);

  protected readonly technologyLabels = TECHNOLOGY_LABELS;
  protected readonly difficultyLabels = DIFFICULTY_LABELS;
  protected readonly filter = signal<Filter>('all');

  /** Only technologies that have entries become filter buttons. */
  protected readonly filters = computed<Filter[]>(() => [
    'all',
    ...new Set(this.catalog.bugs.map((b) => b.technology)),
  ]);

  protected readonly items = computed(() => {
    const progress = this.progressService.progress();
    const filter = this.filter();
    return this.catalog.bugs
      .filter((bug) => filter === 'all' || bug.technology === filter)
      .map((bug) => {
        const status = bug.diagnosisExerciseId
          ? exerciseStatus(progress, bug.diagnosisExerciseId)
          : undefined;
        return { bug, diagnosed: status?.solved ?? false, attempted: (status?.attempts ?? 0) > 0 };
      });
  });

  protected label(filter: Filter): string {
    return filter === 'all' ? 'Todos' : TECHNOLOGY_LABELS[filter];
  }
}
