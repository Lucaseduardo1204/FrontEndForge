import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideConstruction } from '@lucide/angular';
import { assessmentExerciseIds } from '../../../core/content/catalog';
import { ContentService } from '../../../core/content/content.service';
import { lessonStatus, moduleState, phaseState } from '../../../core/learning/curriculum-status';
import { Lesson, Module } from '../../../core/models/content.models';
import { ProgressService } from '../../../core/progress/progress.service';
import { ContentBlocks } from '../../../shared/ui/content-blocks/content-blocks';
import { StatusBadge } from '../../../shared/ui/status-badge/status-badge';
import { ModuleCard } from '../module-card/module-card';

@Component({
  selector: 'app-phase-page',
  imports: [
    RouterLink,
    ContentBlocks,
    ModuleCard,
    StatusBadge,
    LucideArrowLeft,
    LucideConstruction,
  ],
  templateUrl: './phase-page.html',
  styleUrl: './phase-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhasePage {
  private readonly catalog = inject(ContentService).catalog;
  private readonly progressService = inject(ProgressService);

  /** Route parameter `:phaseId`. */
  readonly phaseId = input.required<string>();

  protected readonly phase = computed(() =>
    this.catalog.phases.find((p) => p.id === this.phaseId()),
  );

  protected readonly view = computed(() => {
    const phase = this.phase();
    if (!phase) return undefined;
    const progress = this.progressService.progress();
    const competencyTitle = (id: string) =>
      this.catalog.competencies.find((c) => c.id === id)?.title ?? id;

    return {
      state: phaseState(this.catalog, progress, phase),
      competencies: phase.competencyIds.map(competencyTitle),
      prerequisites: phase.prerequisitePhaseIds
        .map((id) => this.catalog.phases.find((p) => p.id === id))
        .filter((p) => p !== undefined)
        .map((p) => ({ phase: p, state: phaseState(this.catalog, progress, p) })),
      modules: phase.moduleIds
        .map((id) => this.catalog.modules.find((m) => m.id === id))
        .filter((m): m is Module => m !== undefined)
        .map((module) => ({
          module,
          state: moduleState(this.catalog, progress, module),
          competencies: module.competencyIds.map(competencyTitle),
          prerequisites: module.prerequisiteModuleIds.map(
            (id) => this.catalog.modules.find((m) => m.id === id)?.title ?? id,
          ),
          lessons: module.lessonIds
            .map((id) => this.catalog.lessons.find((l) => l.id === id))
            .filter((l): l is Lesson => l !== undefined)
            .map((lesson) => ({
              lesson,
              status: lessonStatus(progress, lesson.id),
              assessmentExercises: assessmentExerciseIds(lesson).length,
            })),
        })),
    };
  });
}
