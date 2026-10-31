import { Attempt } from '../models/progress.models';
import { createEmptyProgress } from '../persistence/progress-schema';
import {
  completeLesson,
  exerciseStatus,
  isCompleted,
  recordAttempt,
  setLessonStep,
  startLesson,
  toLocalDay,
} from './progress-updates';

describe('progress updates', () => {
  const day1 = new Date(2026, 9, 28, 10, 0);
  const day2 = new Date(2026, 9, 29, 23, 30);
  const empty = createEmptyProgress(day1);

  const attempt = (correct: boolean, id = 'a1'): Attempt => ({
    id,
    activityType: 'exercise',
    activityId: 'ex-1',
    submittedAt: day1.toISOString(),
    correct,
    score: correct ? 1 : 0,
    answer: { kind: 'predict-output', text: 'x' },
    hintsUsed: 0,
    solutionViewed: false,
  });

  it('formats local days (not UTC)', () => {
    expect(toLocalDay(day2)).toBe('2026-10-29');
  });

  it('records a wrong attempt without completing the exercise', () => {
    const next = recordAttempt(empty, attempt(false), day1);

    expect(next.attempts).toHaveLength(1);
    expect(isCompleted(next, 'exercise', 'ex-1')).toBe(false);
    expect(next.studyDays).toEqual(['2026-10-28']);
    expect(empty.attempts).toHaveLength(0); // input untouched
  });

  it('completes the exercise on the first correct attempt and keeps the first date', () => {
    const first = recordAttempt(empty, attempt(true, 'a1'), day1);
    const again = recordAttempt(first, attempt(true, 'a2'), day2);

    expect(again.completions['exercise:ex-1'].firstCompletedAt).toBe(day1.toISOString());
    expect(exerciseStatus(again, 'ex-1')).toMatchObject({ attempts: 2, solved: true });
    expect(again.studyDays).toEqual(['2026-10-28', '2026-10-29']);
  });

  it('starts a lesson once and tracks the current step', () => {
    const started = startLesson(empty, 'lesson-1', day1);
    const restarted = startLesson(started, 'lesson-1', day2);
    const moved = setLessonStep(restarted, 'lesson-1', 3, day2);

    expect(restarted).toBe(started);
    expect(moved.lessons['lesson-1']).toEqual({
      startedAt: day1.toISOString(),
      currentStepIndex: 3,
    });
  });

  it('completes a lesson once', () => {
    const done = completeLesson(startLesson(empty, 'lesson-1', day1), 'lesson-1', day1);
    const again = completeLesson(done, 'lesson-1', day2);

    expect(again.lessons['lesson-1'].completedAt).toBe(day1.toISOString());
    expect(isCompleted(again, 'lesson', 'lesson-1')).toBe(true);
  });
});
