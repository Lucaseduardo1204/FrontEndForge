import { ContentCatalog } from '../content/catalog';
import { IsoDateTime, LocalDay, Progress } from '../models/progress.models';
import { missionStatus } from '../progress/mission-status';
import { longestRun } from './streak';

/** Returns when the achievement was unlocked, or null. Derived from the history only. */
type Rule = (catalog: ContentCatalog, progress: Progress) => IsoDateTime | null;

const exerciseAttempts = (progress: Progress) =>
  progress.attempts.filter((a) => a.activityType === 'exercise');

const isCode = (catalog: ContentCatalog, id: string) =>
  catalog.exercises.find((e) => e.id === id)?.kind === 'code';

/** Noon of a local day, as ISO (achievements of streaks happen on a day, not an instant). */
const dayToIso = (day: LocalDay): IsoDateTime => {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d, 12).toISOString();
};

function streakRule(length: number): Rule {
  return (_catalog, progress) => {
    const day = longestRun(progress.studyDays).reachedOn[length - 1];
    return day ? dayToIso(day) : null;
  };
}

export const ACHIEVEMENT_RULES: Readonly<Record<string, Rule>> = {
  'first-correct-answer': (_c, p) =>
    exerciseAttempts(p).find((a) => a.correct)?.submittedAt ?? null,

  'first-lesson': (_c, p) =>
    Object.entries(p.completions)
      .filter(([key]) => key.startsWith('lesson:'))
      .map(([, record]) => record.firstCompletedAt)
      .sort()[0] ?? null,

  'first-project': (_c, p) =>
    Object.entries(p.completions)
      .filter(([key]) => key.startsWith('project:'))
      .map(([, record]) => record.firstCompletedAt)
      .sort()[0] ?? null,

  'first-mission': (c, p) =>
    c.missions
      .map((m) => missionStatus(m, p).completedAt)
      .filter((d): d is IsoDateTime => d !== null)
      .sort()[0] ?? null,

  'first-bug-diagnosed': (c, p) => {
    const debugging = new Set([
      ...c.lessons.flatMap((l) =>
        l.steps.filter((s) => s.kind === 'debugging').flatMap((s) => s.exerciseIds ?? []),
      ),
      ...c.bugs.flatMap((b) => (b.diagnosisExerciseId ? [b.diagnosisExerciseId] : [])),
    ]);
    return (
      exerciseAttempts(p).find((a) => a.correct && debugging.has(a.activityId))?.submittedAt ?? null
    );
  },

  'learned-from-mistakes': (_c, p) => {
    const errors = new Map<string, number>();
    for (const attempt of exerciseAttempts(p)) {
      const before = errors.get(attempt.activityId) ?? 0;
      if (attempt.correct && before >= 2) return attempt.submittedAt;
      if (!attempt.correct) errors.set(attempt.activityId, before + 1);
      else errors.set(attempt.activityId, -Infinity); // solved: later errors do not count
    }
    return null;
  },

  'first-code-passed': (c, p) =>
    exerciseAttempts(p).find((a) => a.correct && isCode(c, a.activityId))?.submittedAt ?? null,

  'code-first-try': (c, p) => {
    const seen = new Set<string>();
    for (const attempt of exerciseAttempts(p)) {
      if (!isCode(c, attempt.activityId)) continue;
      const first = !seen.has(attempt.activityId);
      seen.add(attempt.activityId);
      if (first && attempt.correct && !attempt.solutionViewed) return attempt.submittedAt;
    }
    return null;
  },

  'first-review': (_c, p) =>
    p.attempts.find((a) => a.activityType === 'review')?.submittedAt ?? null,

  // Replays the Leitner moves (every concept starts in box 1) to find when one reached box 5.
  'long-term-memory': (_c, p) => {
    const boxes = new Map<string, number>();
    for (const attempt of p.attempts) {
      if (attempt.activityType !== 'review') continue;
      const box = attempt.correct ? Math.min((boxes.get(attempt.activityId) ?? 1) + 1, 5) : 1;
      boxes.set(attempt.activityId, box);
      if (box === 5) return attempt.submittedAt;
    }
    return null;
  },

  'three-day-streak': streakRule(3),
  'seven-day-streak': streakRule(7),
};

export interface AchievementState {
  readonly id: string;
  readonly unlockedAt: IsoDateTime | null;
}

export function achievementStates(catalog: ContentCatalog, progress: Progress): AchievementState[] {
  return catalog.achievements.map((achievement) => ({
    id: achievement.id,
    unlockedAt: ACHIEVEMENT_RULES[achievement.id]?.(catalog, progress) ?? null,
  }));
}
