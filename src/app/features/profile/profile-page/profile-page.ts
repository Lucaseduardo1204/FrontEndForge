import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../../core/content/content.service';
import { competencyReport, LEVEL_LABELS } from '../../../core/learning/competency';
import { weeklyActivity } from '../../../core/learning/weekly-activity';
import { ProgressService } from '../../../core/progress/progress.service';
import { ActivityChart } from '../activity-chart/activity-chart';
import { LevelMeter } from '../level-meter/level-meter';

@Component({
  selector: 'app-profile-page',
  imports: [RouterLink, ActivityChart, LevelMeter],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {
  private readonly catalog = inject(ContentService).catalog;
  private readonly progressService = inject(ProgressService);

  protected readonly levelLabels = LEVEL_LABELS;
  protected readonly reports = computed(() => {
    const progress = this.progressService.progress();
    const now = new Date();
    return this.catalog.competencies.map((c) => competencyReport(this.catalog, progress, c, now));
  });
  /** Competencies with published activities first; the rest are listed separately. */
  protected readonly assessable = computed(() =>
    this.reports().filter((r) => r.exercisesAvailable > 0),
  );
  protected readonly upcoming = computed(() =>
    this.reports().filter((r) => r.exercisesAvailable === 0),
  );
  protected readonly upcomingTitles = computed(() =>
    this.upcoming()
      .map((r) => r.competency.title)
      .join(', '),
  );
  protected readonly weeks = computed(() =>
    weeklyActivity(this.progressService.progress(), new Date()),
  );
}
