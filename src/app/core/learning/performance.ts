import { ContentCatalog } from '../content/catalog';
import { ContentId, Exercise } from '../models/content.models';
import { Attempt, Progress } from '../models/progress.models';

/** How many recent attempts per concept are considered. */
export const RECENT_WINDOW = 5;

export interface ConceptPerformance {
  readonly conceptId: ContentId;
  readonly title: string;
  readonly attempts: number;
  readonly errors: number;
}

/** Exercise behind an attempt: the activity itself, or `answer.exerciseId` for reviews. */
export function attemptExerciseId(attempt: Attempt): ContentId | undefined {
  if (attempt.activityType === 'exercise') return attempt.activityId;
  if (attempt.activityType === 'review') {
    const answer = attempt.answer as { exerciseId?: unknown } | null;
    return typeof answer?.exerciseId === 'string' ? answer.exerciseId : undefined;
  }
  return undefined;
}

/**
 * Recurring mistakes: for each concept, the last RECENT_WINDOW attempts on exercises of
 * that concept. A concept needs attention with at least 2 errors that are at least half
 * of those attempts. Most errors first.
 */
export function strugglingConcepts(
  catalog: ContentCatalog,
  progress: Progress,
): ConceptPerformance[] {
  const exercises = new Map(catalog.exercises.map((e) => [e.id, e]));
  const byConcept = new Map<ContentId, boolean[]>();
  for (const attempt of progress.attempts) {
    const exerciseId = attemptExerciseId(attempt);
    const exercise = exerciseId ? exercises.get(exerciseId) : undefined;
    for (const conceptId of exercise?.conceptIds ?? []) {
      const list = byConcept.get(conceptId) ?? [];
      list.push(attempt.correct);
      byConcept.set(conceptId, list);
    }
  }

  const result: ConceptPerformance[] = [];
  for (const [conceptId, outcomes] of byConcept) {
    const recent = outcomes.slice(-RECENT_WINDOW);
    const errors = recent.filter((ok) => !ok).length;
    if (errors >= 2 && errors * 2 >= recent.length) {
      const title = catalog.concepts.find((c) => c.id === conceptId)?.title ?? conceptId;
      result.push({ conceptId, title, attempts: recent.length, errors });
    }
  }
  return result.sort((a, b) => b.errors - a.errors || a.title.localeCompare(b.title));
}

/** Share of correct answers in the last `count` attempts, or null without attempts. */
export function recentAccuracy(progress: Progress, count = 10): number | null {
  const recent = progress.attempts.slice(-count);
  if (recent.length === 0) return null;
  return recent.filter((a) => a.correct).length / recent.length;
}

const OBJECTIVE_KINDS = new Set<Exercise['kind']>([
  'multiple-choice',
  'predict-output',
  'order-steps',
]);

/** Objective exercises can be answered inside a review session. */
export function isObjective(exercise: Exercise): boolean {
  return OBJECTIVE_KINDS.has(exercise.kind);
}

/** Concepts that have at least one objective exercise, so they can be reviewed. */
export function reviewableConceptIds(catalog: ContentCatalog): Set<ContentId> {
  return new Set(catalog.exercises.filter(isObjective).flatMap((e) => e.conceptIds));
}

/**
 * Exercise used to review a concept. Rotates through its objective exercises, so each
 * review of the same concept tends to use a different question.
 */
export function reviewExercise(
  catalog: ContentCatalog,
  progress: Progress,
  conceptId: ContentId,
): Exercise | undefined {
  const options = catalog.exercises.filter(
    (e) => isObjective(e) && e.conceptIds.includes(conceptId),
  );
  if (options.length === 0) return undefined;
  const reviewsDone = progress.attempts.filter(
    (a) => a.activityType === 'review' && a.activityId === conceptId,
  ).length;
  return options[reviewsDone % options.length];
}
