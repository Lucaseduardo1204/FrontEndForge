import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideClock } from '@lucide/angular';
import { LessonStatus, ModuleState } from '../../../core/learning/curriculum-status';
import { Lesson, Module } from '../../../core/models/content.models';
import { StatusBadge } from '../../../shared/ui/status-badge/status-badge';

export interface ModuleLesson {
  readonly lesson: Lesson;
  readonly status: LessonStatus;
  readonly assessmentExercises: number;
}

const LESSON_STATUS_LABELS: Readonly<Record<LessonStatus, string>> = {
  completed: 'Concluída',
  'in-progress': 'Em andamento',
  'not-started': 'Não iniciada',
};

@Component({
  selector: 'app-module-card',
  imports: [RouterLink, StatusBadge, LucideClock],
  templateUrl: './module-card.html',
  styleUrl: './module-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModuleCard {
  readonly module = input.required<Module>();
  readonly state = input.required<ModuleState>();
  readonly lessons = input.required<readonly ModuleLesson[]>();
  /** Titles of the prerequisite modules. */
  readonly prerequisites = input.required<readonly string[]>();
  readonly competencies = input.required<readonly string[]>();

  protected readonly lessonStatusLabels = LESSON_STATUS_LABELS;
}
