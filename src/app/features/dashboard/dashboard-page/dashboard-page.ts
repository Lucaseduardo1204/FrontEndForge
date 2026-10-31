import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideCircleAlert, LucideInbox } from '@lucide/angular';
import { ContentService } from '../../../core/content/content.service';
import { GamificationService } from '../../../core/gamification/gamification.service';
import { nextActivity } from '../../../core/learning/next-activity';
import { ProgressService } from '../../../core/progress/progress.service';
import { strugglingConcepts } from '../../../core/learning/performance';
import { greeting, progressStats, recentActivity, reviewOverview } from '../dashboard-view';
import { EvolutionSummary } from '../evolution-summary/evolution-summary';
import { LearningStatus } from '../learning-status/learning-status';
import { NextActivityCard } from '../next-activity-card/next-activity-card';
import { ProgressSummary } from '../progress-summary/progress-summary';
import { RecentActivity } from '../recent-activity/recent-activity';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    RouterLink,
    EvolutionSummary,
    LearningStatus,
    NextActivityCard,
    ProgressSummary,
    RecentActivity,
    LucideCircleAlert,
    LucideInbox,
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private readonly catalog = inject(ContentService).catalog;
  private readonly progressService = inject(ProgressService);
  protected readonly gamification = inject(GamificationService);

  protected readonly greeting = greeting(new Date());
  protected readonly loadError = this.progressService.loadError;
  protected readonly signInRequired = this.progressService.signInRequired;
  protected readonly hasHistory = this.progressService.hasHistory;
  protected readonly next = computed(() =>
    nextActivity(this.catalog, this.progressService.progress()),
  );
  protected readonly stats = computed(() =>
    progressStats(this.catalog, this.progressService.progress()),
  );
  protected readonly recent = computed(() =>
    recentActivity(this.catalog, this.progressService.progress()),
  );
  protected readonly reviews = computed(() =>
    reviewOverview(this.catalog, this.progressService.progress(), new Date()),
  );
  protected readonly struggling = computed(() =>
    strugglingConcepts(this.catalog, this.progressService.progress()),
  );
  protected readonly unlockedAchievements = computed(
    () => this.gamification.achievements().filter((a) => a.unlockedAt).length,
  );
}
