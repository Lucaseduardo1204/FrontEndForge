import { ContentCatalog, lessonExerciseIds } from '../../core/content/catalog';
import { Progress } from '../../core/models/progress.models';
import { isCompleted } from '../../core/progress/progress-updates';
import { dueReviews, upcomingReviews } from '../../core/learning/spaced-repetition';
import { ReviewOverview } from './learning-status/learning-status';
import { ProgressStats } from './progress-summary/progress-summary';
import { RecentItem } from './recent-activity/recent-activity';

/** Counts only real, saved data; published totals come from the content catalog. */
export function progressStats(catalog: ContentCatalog, progress: Progress): ProgressStats {
  return {
    lessonsCompleted: catalog.lessons.filter((l) => isCompleted(progress, 'lesson', l.id)).length,
    lessonsPublished: catalog.lessons.length,
    exercisesSolved: catalog.exercises.filter((e) => isCompleted(progress, 'exercise', e.id))
      .length,
    exercisesPublished: catalog.exercises.length,
    attempts: progress.attempts.length,
    correctAttempts: progress.attempts.filter((a) => a.correct).length,
    studyDays: progress.studyDays.length,
  };
}

export function recentActivity(
  catalog: ContentCatalog,
  progress: Progress,
  limit = 5,
): RecentItem[] {
  return progress.attempts
    .slice(-limit)
    .reverse()
    .map((attempt) => ({
      id: attempt.id,
      title:
        catalog.exercises.find((e) => e.id === attempt.activityId)?.title ??
        'Atividade que não existe mais no conteúdo',
      correct: attempt.correct,
      submittedAt: attempt.submittedAt,
      lessonId: catalog.lessons.find((l) => lessonExerciseIds(l).includes(attempt.activityId))?.id,
    }));
}

export function greeting(now: Date): string {
  const hour = now.getHours();
  if (hour < 5) return 'Boa noite';
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function reviewOverview(
  catalog: ContentCatalog,
  progress: Progress,
  now: Date,
): ReviewOverview {
  const title = (id: string) => catalog.concepts.find((c) => c.id === id)?.title ?? id;
  return {
    dueTitles: dueReviews(progress, now).map((d) => title(d.card.conceptId)),
    scheduled: Object.keys(progress.reviews).length,
    nextDueOn: upcomingReviews(progress, now)[0]?.dueOn ?? null,
  };
}
