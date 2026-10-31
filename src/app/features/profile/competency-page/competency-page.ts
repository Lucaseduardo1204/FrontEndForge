import { DatePipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideCircle, LucideCircleCheck } from '@lucide/angular';
import { ContentService } from '../../../core/content/content.service';
import {
  competencyReport,
  CompetencyReport,
  LEVEL_LABELS,
} from '../../../core/learning/competency';
import { ProgressService } from '../../../core/progress/progress.service';
import { LevelMeter } from '../level-meter/level-meter';

type NextActivity = CompetencyReport['nextActivities'][number];

@Component({
  selector: 'app-competency-page',
  imports: [
    DatePipe,
    PercentPipe,
    RouterLink,
    LevelMeter,
    LucideArrowLeft,
    LucideCircle,
    LucideCircleCheck,
  ],
  templateUrl: './competency-page.html',
  styleUrl: './competency-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompetencyPage {
  private readonly catalog = inject(ContentService).catalog;
  private readonly progressService = inject(ProgressService);

  /** Route parameter `:competencyId`. */
  readonly competencyId = input.required<string>();

  protected readonly levelLabels = LEVEL_LABELS;
  protected readonly report = computed(() => {
    const competency = this.catalog.competencies.find((c) => c.id === this.competencyId());
    return competency
      ? competencyReport(this.catalog, this.progressService.progress(), competency, new Date())
      : undefined;
  });
  /** Criteria grouped by level, for the checklist. */
  protected readonly criteriaByLevel = computed(() =>
    ([1, 2, 3, 4] as const).map((level) => ({
      level,
      criteria: (this.report()?.criteria ?? []).filter((c) => c.level === level),
    })),
  );

  protected link(item: NextActivity): { commands: string[]; queryParams?: Record<string, string> } {
    const location = item.location;
    switch (location.type) {
      case 'lesson':
        return {
          commands: ['/lessons', location.lessonId],
          queryParams: { step: String(location.stepIndex + 1) },
        };
      case 'mission':
        return { commands: ['/missions', location.missionId] };
      case 'bug':
        return { commands: ['/bugs', location.bugId] };
      case 'project':
        return { commands: ['/projects', location.projectId] };
      case 'review':
        return { commands: ['/review'] };
      case 'lab':
        return { commands: item.exerciseId ? ['/lab', item.exerciseId] : ['/lab'] };
    }
  }
}
