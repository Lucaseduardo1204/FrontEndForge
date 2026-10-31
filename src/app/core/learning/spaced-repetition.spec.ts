import { Attempt } from '../models/progress.models';
import { createEmptyProgress } from '../persistence/progress-schema';
import {
  addDays,
  daysBetween,
  dueReviews,
  recordReview,
  reviewCard,
  scheduleConcepts,
  upcomingReviews,
} from './spaced-repetition';

describe('spaced repetition (Leitner)', () => {
  const day = (d: number) => new Date(2026, 9, d, 10, 0);
  const empty = createEmptyProgress(day(1));

  const reviewAttempt = (conceptId: string, correct: boolean, d: number): Attempt => ({
    id: `${conceptId}-${d}-${correct}`,
    activityType: 'review',
    activityId: conceptId,
    submittedAt: day(d).toISOString(),
    correct,
    score: correct ? 1 : 0,
    answer: { exerciseId: 'ex' },
    hintsUsed: 0,
    solutionViewed: false,
  });

  it('does date arithmetic on local days, across month ends', () => {
    expect(addDays('2026-10-30', 3)).toBe('2026-11-02');
    expect(daysBetween('2026-10-30', '2026-11-02')).toBe(3);
    expect(daysBetween('2026-11-02', '2026-10-30')).toBe(-3);
  });

  it('schedules a newly learned concept in box 1 for tomorrow, once', () => {
    const scheduled = scheduleConcepts(empty, ['closures'], day(10));
    const again = scheduleConcepts(scheduled, ['closures'], day(12));

    expect(scheduled.reviews['closures']).toMatchObject({ box: 1, dueOn: '2026-10-11' });
    expect(again).toBe(scheduled);
  });

  it('moves up one box per correct review, with growing intervals', () => {
    let card = scheduleConcepts(empty, ['c'], day(1)).reviews['c'];
    const dueDates: string[] = [];
    for (let i = 0; i < 6; i++) {
      card = reviewCard(card, true, day(1));
      dueDates.push(`${card.box}:${card.dueOn}`);
    }

    expect(dueDates).toEqual([
      '2:2026-10-04',
      '3:2026-10-08',
      '4:2026-10-15',
      '5:2026-10-31',
      '5:2026-10-31',
      '5:2026-10-31',
    ]);
  });

  it('sends the concept back to box 1 after a wrong review', () => {
    const card = { conceptId: 'c', box: 4 as const, dueOn: '2026-10-05', lastReviewedAt: '' };

    expect(reviewCard(card, false, day(5))).toMatchObject({ box: 1, dueOn: '2026-10-06' });
  });

  it('records the review attempt and updates the card', () => {
    const scheduled = scheduleConcepts(empty, ['c'], day(1));

    const reviewed = recordReview(scheduled, reviewAttempt('c', true, 2), day(2));

    expect(reviewed.attempts).toHaveLength(1);
    expect(reviewed.reviews['c']).toMatchObject({ box: 2, dueOn: '2026-10-05' });
    expect(reviewed.studyDays).toEqual(['2026-10-02']);
  });

  it('lists due reviews, most overdue first, and upcoming ones by date', () => {
    let progress = scheduleConcepts(empty, ['a'], day(1)); // due 10-02
    progress = scheduleConcepts(progress, ['b'], day(3)); // due 10-04
    progress = scheduleConcepts(progress, ['c'], day(5)); // due 10-06

    const due = dueReviews(progress, day(5));

    expect(due.map((d) => [d.card.conceptId, d.daysOverdue])).toEqual([
      ['a', 3],
      ['b', 1],
    ]);
    expect(upcomingReviews(progress, day(5)).map((c) => c.conceptId)).toEqual(['c']);
    expect(dueReviews(progress, day(1))).toEqual([]);
  });
});
