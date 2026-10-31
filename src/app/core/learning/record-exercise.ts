import { ContentCatalog } from '../content/catalog';
import { Exercise } from '../models/content.models';
import { Attempt, Progress } from '../models/progress.models';
import { recordAttempt } from '../progress/progress-updates';
import { reviewableConceptIds } from './performance';
import { recordReview, scheduleConcepts } from './spaced-repetition';

/**
 * Records a practice attempt. A correct answer also puts the exercise's concepts into
 * spaced review (only concepts that have objective exercises to review them with).
 */
export function recordExerciseAttempt(
  catalog: ContentCatalog,
  progress: Progress,
  exercise: Exercise,
  attempt: Attempt,
  now: Date,
): Progress {
  const next = recordAttempt(progress, attempt, now);
  if (!attempt.correct) return next;
  const reviewable = reviewableConceptIds(catalog);
  return scheduleConcepts(
    next,
    exercise.conceptIds.filter((id) => reviewable.has(id)),
    now,
  );
}

/** Records an answer given inside a review session for `conceptId`. */
export function recordReviewAttempt(
  progress: Progress,
  conceptId: string,
  exercise: Exercise,
  attempt: Omit<Attempt, 'activityType' | 'activityId'>,
  now: Date,
): Progress {
  return recordReview(
    progress,
    {
      ...attempt,
      activityType: 'review',
      activityId: conceptId,
      answer: { exerciseId: exercise.id, answer: attempt.answer },
    },
    now,
  );
}
