import { ContentId } from '../models/content.models';
import { ActivityType, Attempt, LocalDay, Progress } from '../models/progress.models';

/** Pure state transitions. They never mutate the input and always stamp `updatedAt`. */

export function toLocalDay(date: Date): LocalDay {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function completionKey(type: ActivityType, id: ContentId): string {
  return `${type}:${id}`;
}

export function isCompleted(progress: Progress, type: ActivityType, id: ContentId): boolean {
  return completionKey(type, id) in progress.completions;
}

function touch(progress: Progress, now: Date): Progress {
  const day = toLocalDay(now);
  return {
    ...progress,
    updatedAt: now.toISOString(),
    studyDays: progress.studyDays.includes(day) ? progress.studyDays : [...progress.studyDays, day],
  };
}

function complete(progress: Progress, type: ActivityType, id: ContentId, now: Date): Progress {
  if (isCompleted(progress, type, id)) return progress;
  return {
    ...progress,
    completions: {
      ...progress.completions,
      [completionKey(type, id)]: { firstCompletedAt: now.toISOString() },
    },
  };
}

/** Appends the attempt; a correct attempt completes the activity the first time. */
export function recordAttempt(progress: Progress, attempt: Attempt, now: Date): Progress {
  const next = touch({ ...progress, attempts: [...progress.attempts, attempt] }, now);
  return attempt.correct ? complete(next, attempt.activityType, attempt.activityId, now) : next;
}

export function startLesson(progress: Progress, lessonId: ContentId, now: Date): Progress {
  if (progress.lessons[lessonId]) return progress;
  return touch(
    {
      ...progress,
      lessons: {
        ...progress.lessons,
        [lessonId]: { startedAt: now.toISOString(), currentStepIndex: 0 },
      },
    },
    now,
  );
}

export function setLessonStep(
  progress: Progress,
  lessonId: ContentId,
  stepIndex: number,
  now: Date,
): Progress {
  const current = progress.lessons[lessonId] ?? {
    startedAt: now.toISOString(),
    currentStepIndex: 0,
  };
  if (current.currentStepIndex === stepIndex && progress.lessons[lessonId]) return progress;
  return touch(
    {
      ...progress,
      lessons: { ...progress.lessons, [lessonId]: { ...current, currentStepIndex: stepIndex } },
    },
    now,
  );
}

export function completeLesson(progress: Progress, lessonId: ContentId, now: Date): Progress {
  const current = progress.lessons[lessonId] ?? {
    startedAt: now.toISOString(),
    currentStepIndex: 0,
  };
  const next = touch(
    {
      ...progress,
      lessons: {
        ...progress.lessons,
        [lessonId]: { ...current, completedAt: current.completedAt ?? now.toISOString() },
      },
    },
    now,
  );
  return complete(next, 'lesson', lessonId, now);
}

export interface ExerciseStatus {
  readonly attempts: number;
  readonly solved: boolean;
  readonly lastAttempt?: Attempt;
}

export function exerciseStatus(progress: Progress, exerciseId: ContentId): ExerciseStatus {
  const attempts = progress.attempts.filter(
    (a) => a.activityType === 'exercise' && a.activityId === exerciseId,
  );
  return {
    attempts: attempts.length,
    solved: isCompleted(progress, 'exercise', exerciseId),
    lastAttempt: attempts.at(-1),
  };
}
