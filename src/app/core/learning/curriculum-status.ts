import { ContentCatalog } from '../content/catalog';
import { Module, Phase } from '../models/content.models';
import { Progress } from '../models/progress.models';
import { isCompleted } from '../progress/progress-updates';

export type ModuleStatus = 'completed' | 'in-progress' | 'available' | 'locked';
/** `planned`: the phase has no published module yet. */
export type PhaseStatus = ModuleStatus | 'planned';

export interface ModuleState {
  readonly status: ModuleStatus;
  /** Titles of what must be completed first (empty unless locked). */
  readonly blockers: readonly string[];
  readonly lessonsCompleted: number;
  readonly lessonsTotal: number;
}

export interface PhaseState {
  readonly status: PhaseStatus;
  readonly blockers: readonly string[];
  readonly lessonsCompleted: number;
  readonly lessonsTotal: number;
}

/**
 * Rules (deterministic and shown to the student):
 * - A module is complete when all of its lessons are complete.
 * - A phase is satisfied when all of its *published* modules are complete. A phase whose
 *   content is not published yet does not block the phases after it.
 * - A module is locked while a prerequisite module is incomplete or a prerequisite phase
 *   of its phase is not satisfied.
 */
export function moduleState(
  catalog: ContentCatalog,
  progress: Progress,
  module: Module,
): ModuleState {
  const lessonsCompleted = module.lessonIds.filter((id) =>
    isCompleted(progress, 'lesson', id),
  ).length;
  const lessonsTotal = module.lessonIds.length;
  const base = { lessonsCompleted, lessonsTotal };

  if (lessonsTotal > 0 && lessonsCompleted === lessonsTotal) {
    return { ...base, status: 'completed', blockers: [] };
  }
  if (module.lessonIds.some((id) => progress.lessons[id])) {
    return { ...base, status: 'in-progress', blockers: [] };
  }

  const missingModules = module.prerequisiteModuleIds
    .map((id) => catalog.modules.find((m) => m.id === id))
    .filter((m): m is Module => m !== undefined && !isModuleComplete(progress, m))
    .map((m) => `Módulo “${m.title}”`);
  const phase = catalog.phases.find((p) => p.id === module.phaseId);
  const blockers = [...missingModules, ...(phase ? missingPhases(catalog, progress, phase) : [])];

  return { ...base, status: blockers.length > 0 ? 'locked' : 'available', blockers };
}

export function phaseState(catalog: ContentCatalog, progress: Progress, phase: Phase): PhaseState {
  const modules = phase.moduleIds
    .map((id) => catalog.modules.find((m) => m.id === id))
    .filter((m): m is Module => m !== undefined);
  const states = modules.map((m) => moduleState(catalog, progress, m));
  const lessonsCompleted = states.reduce((sum, s) => sum + s.lessonsCompleted, 0);
  const lessonsTotal = states.reduce((sum, s) => sum + s.lessonsTotal, 0);
  const base = { lessonsCompleted, lessonsTotal };

  if (modules.length === 0) return { ...base, status: 'planned', blockers: [] };
  if (states.every((s) => s.status === 'completed')) {
    return { ...base, status: 'completed', blockers: [] };
  }
  if (states.some((s) => s.status === 'in-progress' || s.status === 'completed')) {
    return { ...base, status: 'in-progress', blockers: [] };
  }
  const blockers = missingPhases(catalog, progress, phase);
  return { ...base, status: blockers.length > 0 ? 'locked' : 'available', blockers };
}

function isModuleComplete(progress: Progress, module: Module): boolean {
  return (
    module.lessonIds.length > 0 &&
    module.lessonIds.every((id) => isCompleted(progress, 'lesson', id))
  );
}

function missingPhases(catalog: ContentCatalog, progress: Progress, phase: Phase): string[] {
  return phase.prerequisitePhaseIds
    .map((id) => catalog.phases.find((p) => p.id === id))
    .filter((p): p is Phase => p !== undefined)
    .filter((p) =>
      p.moduleIds.some((id) => {
        const module = catalog.modules.find((m) => m.id === id);
        return module !== undefined && !isModuleComplete(progress, module);
      }),
    )
    .map((p) => `Fase ${p.order}: ${p.title}`);
}

export type LessonStatus = 'completed' | 'in-progress' | 'not-started';

export function lessonStatus(progress: Progress, lessonId: string): LessonStatus {
  if (isCompleted(progress, 'lesson', lessonId)) return 'completed';
  return progress.lessons[lessonId] ? 'in-progress' : 'not-started';
}
