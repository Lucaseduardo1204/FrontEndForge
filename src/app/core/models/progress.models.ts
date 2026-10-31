import { ContentId } from './content.models';

/** ISO 8601 timestamp, e.g. `2026-10-29T14:03:00.000Z`. */
export type IsoDateTime = string;

/** Local calendar day, `YYYY-MM-DD`. */
export type LocalDay = string;

export type ActivityType =
  'lesson' | 'exercise' | 'assessment' | 'review' | 'mission' | 'project' | 'bug';

/** One submission by the student. Attempts are append-only. */
export interface Attempt {
  readonly id: string;
  readonly activityType: ActivityType;
  readonly activityId: ContentId;
  readonly submittedAt: IsoDateTime;
  readonly correct: boolean;
  /** 0..1 */
  readonly score: number;
  /** Raw answer, kept so the student can review what they submitted. */
  readonly answer: unknown;
  readonly hintsUsed: number;
  readonly solutionViewed: boolean;
}

export interface CompletionRecord {
  readonly firstCompletedAt: IsoDateTime;
}

export interface LessonProgress {
  readonly startedAt: IsoDateTime;
  readonly currentStepIndex: number;
  readonly completedAt?: IsoDateTime;
}

/** Leitner box 1..5 (intervals of 1, 3, 7, 14 and 30 days). */
export type LeitnerBox = 1 | 2 | 3 | 4 | 5;

export interface ReviewCard {
  readonly conceptId: ContentId;
  readonly box: LeitnerBox;
  readonly dueOn: LocalDay;
  readonly lastReviewedAt: IsoDateTime;
}

export interface ProjectProgress {
  readonly startedAt: IsoDateTime;
  /** Ids of the checklist items the student marked as done. */
  readonly checkedItems: readonly string[];
  /** Rubric criterion id → chosen level score. */
  readonly selfAssessment: Readonly<Record<string, number>>;
  readonly completedAt?: IsoDateTime;
}

/** What a focus-session block opens. */
export type SessionTarget =
  | { readonly type: 'review' }
  | { readonly type: 'lesson'; readonly lessonId: ContentId }
  | { readonly type: 'exercise'; readonly exerciseId: ContentId }
  | { readonly type: 'summary' };

export interface SessionBlock {
  readonly id: string;
  readonly kind: 'review' | 'lesson' | 'practice' | 'summary';
  readonly title: string;
  /** Why this block is in the plan (shown to the student). */
  readonly reason: string;
  readonly estimatedMinutes: number;
  readonly target: SessionTarget;
}

/** A focus session. The plan is a suggestion: blocks can be done or skipped in any order. */
export interface FocusSession {
  readonly id: string;
  readonly startedAt: IsoDateTime;
  /** Minutes the student said they have; null means "no limit". */
  readonly plannedMinutes: number | null;
  readonly objective: string;
  readonly timerEnabled: boolean;
  readonly blocks: readonly SessionBlock[];
  readonly doneBlockIds: readonly string[];
  readonly skippedBlockIds: readonly string[];
  /** Total paused time, and the start of the current pause (if paused). */
  readonly pausedMs: number;
  readonly pausedAt?: IsoDateTime;
  readonly endedAt?: IsoDateTime;
  /** The student's own record of what was learned. */
  readonly notes?: string;
}

/**
 * Everything persisted about the student. Versioned so it can be migrated.
 * XP, levels, streaks and achievements are not stored: they are derived from this history
 * (see `core/gamification`), so they can never drift from what actually happened.
 */
export interface Progress {
  readonly schemaVersion: number;
  readonly createdAt: IsoDateTime;
  readonly updatedAt: IsoDateTime;
  readonly lessons: Readonly<Record<ContentId, LessonProgress>>;
  readonly projects: Readonly<Record<ContentId, ProjectProgress>>;
  /** Focus sessions, oldest first. The last one is active while it has no `endedAt`. */
  readonly sessions: readonly FocusSession[];
  /** Keyed by `${activityType}:${activityId}`. */
  readonly completions: Readonly<Record<string, CompletionRecord>>;
  readonly attempts: readonly Attempt[];
  readonly reviews: Readonly<Record<ContentId, ReviewCard>>;
  readonly studyDays: readonly LocalDay[];
}
