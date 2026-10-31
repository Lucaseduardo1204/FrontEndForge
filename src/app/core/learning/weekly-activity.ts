import { LocalDay, Progress } from '../models/progress.models';
import { toLocalDay } from '../progress/progress-updates';
import { addDays } from './spaced-repetition';

export interface WeekActivity {
  /** Monday of the week (local). */
  readonly weekStart: LocalDay;
  readonly correct: number;
  readonly incorrect: number;
}

/** Monday of the week containing `date` (local time). */
export function weekStart(date: Date): LocalDay {
  const offset = (date.getDay() + 6) % 7; // Monday = 0
  return addDays(toLocalDay(date), -offset);
}

/** Right and wrong answers (practice, reviews, checks) per week, oldest first. */
export function weeklyActivity(progress: Progress, now: Date, weeks = 6): WeekActivity[] {
  const current = weekStart(now);
  const starts = Array.from({ length: weeks }, (_, i) => addDays(current, -7 * (weeks - 1 - i)));
  const counts = new Map(starts.map((start) => [start, { correct: 0, incorrect: 0 }]));
  for (const attempt of progress.attempts) {
    const bucket = counts.get(weekStart(new Date(attempt.submittedAt)));
    if (!bucket) continue;
    if (attempt.correct) bucket.correct++;
    else bucket.incorrect++;
  }
  return starts.map((start) => ({ weekStart: start, ...counts.get(start)! }));
}
