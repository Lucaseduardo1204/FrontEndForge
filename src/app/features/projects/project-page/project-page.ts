import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideCircleCheck, LucideListChecks } from '@lucide/angular';
import { ContentService } from '../../../core/content/content.service';
import { GamificationService, Reward } from '../../../core/gamification/gamification.service';
import {
  completeProject,
  projectStatus,
  setChecklistItem,
  setSelfAssessment,
} from '../../../core/progress/project-updates';
import { ProgressService } from '../../../core/progress/progress.service';
import { RewardNotice } from '../../../shared/ui/reward-notice/reward-notice';
import { ProjectAutoCheck } from '../project-auto-check/project-auto-check';
import { ProjectBrief } from '../project-brief/project-brief';
import { ProjectRubric, RubricChange } from '../project-rubric/project-rubric';
import { ChecklistChange, ProjectSteps } from '../project-steps/project-steps';

@Component({
  selector: 'app-project-page',
  imports: [
    DatePipe,
    RouterLink,
    ProjectAutoCheck,
    ProjectBrief,
    ProjectRubric,
    ProjectSteps,
    RewardNotice,
    LucideArrowLeft,
    LucideCircleCheck,
    LucideListChecks,
  ],
  templateUrl: './project-page.html',
  styleUrl: './project-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectPage {
  private readonly catalog = inject(ContentService).catalog;
  private readonly progressService = inject(ProgressService);
  private readonly gamification = inject(GamificationService);

  /** Route parameter `:projectId`. */
  readonly projectId = input.required<string>();

  protected readonly project = computed(() =>
    this.catalog.projects.find((p) => p.id === this.projectId()),
  );
  protected readonly phase = computed(() =>
    this.catalog.phases.find((p) => p.id === this.project()?.phaseId),
  );
  protected readonly status = computed(() => {
    const project = this.project();
    return project && projectStatus(project, this.progressService.progress());
  });
  protected readonly state = computed(
    () => this.progressService.progress().projects[this.projectId()],
  );
  protected readonly checkedItems = computed(() => this.state()?.checkedItems ?? []);
  protected readonly assessment = computed(() => this.state()?.selfAssessment ?? {});

  protected readonly saveError = signal<string | null>(null);
  protected readonly reward = signal<Reward | null>(null);
  protected readonly completing = signal(false);

  protected onChecklist(change: ChecklistChange): void {
    void this.save((p, now) =>
      setChecklistItem(p, this.projectId(), change.itemId, change.checked, now),
    );
  }

  protected onRubric(change: RubricChange): void {
    void this.save((p, now) =>
      setSelfAssessment(p, this.projectId(), change.criterionId, change.score, now),
    );
  }

  protected async complete(): Promise<void> {
    const project = this.project();
    if (!project || this.completing()) return;
    this.completing.set(true);
    const before = this.gamification.snapshot();
    await this.save((p, now) => completeProject(p, project, now));
    this.reward.set(this.gamification.rewardSince(before));
    this.completing.set(false);
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
