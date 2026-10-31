import { ContentId } from '../models/content.models';
import { Attempt, LeitnerBox, LocalDay, Progress, ReviewCard } from '../models/progress.models';
import { toLocalDay } from '../progress/progress-updates';

/**
 * Leitner boxes. A concept in box N is reviewed again after INTERVAL_DAYS[N] days.
 * Right answer in a review: up one box (max 5). Wrong answer: back to box 1.
 */
export const INTERVAL_DAYS: Readonly<Record<LeitnerBox, number>> = {
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30,
};

export function addDays(day: LocalDay, days: number): LocalDay {
  const [year, month, date] = day.split('-').map(Number);
  return toLocalDay(new Date(year, month - 1, date + days));
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: LocalDay, to: LocalDay): number {
  const [y1, m1, d1] = from.split('-').map(Number);
  const [y2, m2, d2] = to.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
}

/**
 * Puts concepts the student just got right into review (box 1, due tomorrow).
 * Concepts already scheduled are left as they are.
 */
export function scheduleConcepts(
  progress: Progress,
  conceptIds: readonly ContentId[],
  now: Date,
): Progress {
  const fresh = conceptIds.filter((id) => !progress.reviews[id]);
  if (fresh.length === 0) return progress;
  const today = toLocalDay(now);
  const reviews = { ...progress.reviews };
  for (const conceptId of fresh) {
    reviews[conceptId] = {
      conceptId,
      box: 1,
      dueOn: addDays(today, INTERVAL_DAYS[1]),
      lastReviewedAt: now.toISOString(),
    };
  }
  return { ...progress, reviews, updatedAt: now.toISOString() };
}

/** Next state of a card after a review answer. */
export function reviewCard(card: ReviewCard, correct: boolean, now: Date): ReviewCard {
  const box: LeitnerBox = correct ? (Math.min(card.box + 1, 5) as LeitnerBox) : 1;
  return {
    conceptId: card.conceptId,
    box,
    dueOn: addDays(toLocalDay(now), INTERVAL_DAYS[box]),
    lastReviewedAt: now.toISOString(),
  };
}

/**
 * Records a review attempt (`activityType: 'review'`, `activityId`: the concept) and moves
 * the card. The exercise used goes in `answer.exerciseId`.
 */
export function recordReview(progress: Progress, attempt: Attempt, now: Date): Progress {
  const card = progress.reviews[attempt.activityId];
  const day = toLocalDay(now);
  return {
    ...progress,
    updatedAt: now.toISOString(),
    attempts: [...progress.attempts, attempt],
    studyDays: progress.studyDays.includes(day) ? progress.studyDays : [...progress.studyDays, day],
    reviews: card
      ? { ...progress.reviews, [card.conceptId]: reviewCard(card, attempt.correct, now) }
      : progress.reviews,
  };
}

export interface DueReview {
  readonly card: ReviewCard;
  /** 0 = due today; 3 = three days late. */
  readonly daysOverdue: number;
}

/** Cards due today or earlier, most overdue first (then lower box first). */
export function dueReviews(progress: Progress, now: Date): DueReview[] {
  const today = toLocalDay(now);
  return Object.values(progress.reviews)
    .filter((card) => card.dueOn <= today)
    .map((card) => ({ card, daysOverdue: daysBetween(card.dueOn, today) }))
    .sort((a, b) => b.daysOverdue - a.daysOverdue || a.card.box - b.card.box);
}

/** Cards not due yet, soonest first. */
export function upcomingReviews(progress: Progress, now: Date): ReviewCard[] {
  const today = toLocalDay(now);
  return Object.values(progress.reviews)
    .filter((card) => card.dueOn > today)
    .sort((a, b) => a.dueOn.localeCompare(b.dueOn));
}
