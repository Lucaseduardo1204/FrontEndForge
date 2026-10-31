import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { LucideSearch } from '@lucide/angular';
import { ContentService } from '../../../core/content/content.service';
import { phaseState } from '../../../core/learning/curriculum-status';
import { ProgressService } from '../../../core/progress/progress.service';
import { PhaseMapItem } from '../phase-map-item/phase-map-item';
import { searchPhases } from '../phase-search';

@Component({
  selector: 'app-academy-page',
  imports: [PhaseMapItem, LucideSearch],
  templateUrl: './academy-page.html',
  styleUrl: './academy-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcademyPage {
  private readonly catalog = inject(ContentService).catalog;
  private readonly progressService = inject(ProgressService);

  protected readonly query = signal('');
  private readonly phases = [...this.catalog.phases].sort((a, b) => a.order - b.order);

  protected readonly results = computed(() => {
    const progress = this.progressService.progress();
    return searchPhases(this.phases, this.query()).map((match) => ({
      ...match,
      state: phaseState(this.catalog, progress, match.phase),
    }));
  });

  protected readonly publishedPhases = this.phases.filter((p) => p.moduleIds.length > 0).length;
}
