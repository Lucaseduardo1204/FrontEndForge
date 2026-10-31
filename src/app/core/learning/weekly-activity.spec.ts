import { Attempt } from '../models/progress.models';
import { createEmptyProgress } from '../persistence/progress-schema';
import { weekStart, weeklyActivity } from './weekly-activity';

describe('weekly activity', () => {
  // Thursday, 29 Oct 2026
  const now = new Date(2026, 9, 29, 12);
  const attempt = (date: Date, correct: boolean): Attempt => ({
    id: date.toISOString() + correct,
    activityType: 'exercise',
    activityId: 'x',
    submittedAt: date.toISOString(),
    correct,
    score: correct ? 1 : 0,
    answer: null,
    hintsUsed: 0,
    solutionViewed: false,
  });

  it('starts weeks on Monday, in local time', () => {
    expect(weekStart(now)).toBe('2026-10-26');
    expect(weekStart(new Date(2026, 10, 1, 23, 59))).toBe('2026-10-26'); // Sunday
    expect(weekStart(new Date(2026, 10, 2, 0, 1))).toBe('2026-11-02'); // Monday
  });

  it('counts right and wrong answers per week and ignores older ones', () => {
    const progress = {
      ...createEmptyProgress(now),
      attempts: [
        attempt(new Date(2026, 9, 27), true),
        attempt(new Date(2026, 9, 28), false),
        attempt(new Date(2026, 9, 20), true),
        attempt(new Date(2026, 5, 1), true), // too old
      ],
    };

    const weeks = weeklyActivity(progress, now, 3);

    expect(weeks).toEqual([
      { weekStart: '2026-10-12', correct: 0, incorrect: 0 },
      { weekStart: '2026-10-19', correct: 1, incorrect: 0 },
      { weekStart: '2026-10-26', correct: 1, incorrect: 1 },
    ]);
  });
});
