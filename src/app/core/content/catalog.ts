import { ContentCatalog } from '../../../content';
import { ContentId, Exercise, Lesson, Module, Phase } from '../models/content.models';

export type { ContentCatalog } from '../../../content';

/** Lessons in curriculum order: phase order, then module order, then lesson order. */
export function orderedLessons(catalog: ContentCatalog): Lesson[] {
  const lessons = new Map(catalog.lessons.map((l) => [l.id, l]));
  const modules = new Map(catalog.modules.map((m) => [m.id, m]));
  return [...catalog.phases]
    .sort((a, b) => a.order - b.order)
    .flatMap((phase) => phase.moduleIds.map((id) => modules.get(id)))
    .filter((module): module is Module => module !== undefined)
    .flatMap((module) => module.lessonIds.map((id) => lessons.get(id)))
    .filter((lesson): lesson is Lesson => lesson !== undefined);
}

export function lessonExerciseIds(lesson: Lesson): ContentId[] {
  return lesson.steps.flatMap((step) => step.exerciseIds ?? []);
}

/** Exercises the student must get right to complete the lesson. */
export function assessmentExerciseIds(lesson: Lesson): ContentId[] {
  return lesson.steps
    .filter((step) => step.kind === 'assessment')
    .flatMap((step) => step.exerciseIds ?? []);
}

export interface LessonContext {
  readonly phase: Phase;
  readonly module: Module;
}

export function lessonContext(catalog: ContentCatalog, lesson: Lesson): LessonContext | undefined {
  const module = catalog.modules.find((m) => m.id === lesson.moduleId);
  const phase = module && catalog.phases.find((p) => p.id === module.phaseId);
  return module && phase ? { phase, module } : undefined;
}

export function findExercise(catalog: ContentCatalog, id: ContentId): Exercise | undefined {
  return catalog.exercises.find((e) => e.id === id);
}
