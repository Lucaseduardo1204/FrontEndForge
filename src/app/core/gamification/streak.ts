import { addDays } from '../learning/spaced-repetition';
import { LocalDay } from '../models/progress.models';

export interface StreakInfo {
  /** Consecutive study days up to today; a streak stays alive until the end of today. */
  readonly current: number;
  readonly longest: number;
  readonly studiedToday: boolean;
}

/**
 * Streaks only count; they never take anything away. Losing a streak does not remove XP
 * or achievements, and the longest streak stays recorded.
 */
export function streakInfo(studyDays: readonly LocalDay[], today: LocalDay): StreakInfo {
  const days = new Set(studyDays);
  const studiedToday = days.has(today);
  let cursor = studiedToday ? today : addDays(today, -1);
  let current = 0;
  while (days.has(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }
  return { current, longest: Math.max(current, longestRun(studyDays).length), studiedToday };
}

/**
 * Longest run of consecutive study days. `reachedOn[n - 1]` is the first day on which a run
 * of n days was completed (so `reachedOn.length` is the longest run).
 */
export function longestRun(studyDays: readonly LocalDay[]): {
  length: number;
  reachedOn: LocalDay[];
} {
  const reachedOn: LocalDay[] = [];
  let run = 0;
  let previous: LocalDay | null = null;
  for (const day of [...new Set(studyDays)].sort()) {
    run = previous !== null && addDays(previous, 1) === day ? run + 1 : 1;
    if (reachedOn[run - 1] === undefined) reachedOn[run - 1] = day;
    previous = day;
  }
  return { length: reachedOn.length, reachedOn };
}
