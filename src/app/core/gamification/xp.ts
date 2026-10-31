import { ContentCatalog } from '../content/catalog';
import { Difficulty, Exercise } from '../models/content.models';
import { IsoDateTime, Progress } from '../models/progress.models';
import { missionStatus } from '../progress/mission-status';

/**
 * XP rules (public, shown on the achievements page):
 * - First correct answer of an exercise: by kind and difficulty (table below).
 *   Half if the solution was requested before trying.
 * - Solving the same exercise again: no XP.
 * - Lesson completed (first time): 50. Project completed (first time): 100.
 * - Mission completed (all tasks solved): 30 on top of the tasks' own XP.
 * - Review: 5 when right, 2 when wrong (reviewing is practice too, but worth less than
 *   learning something new).
 */
export const XP_RULES = {
  objective: { introductory: 10, intermediate: 20, advanced: 30 },
  code: { introductory: 25, intermediate: 40, advanced: 60 },
  lesson: 50,
  project: 100,
  mission: 30,
  reviewCorrect: 5,
  reviewWrong: 2,
} as const satisfies {
  objective: Record<Difficulty, number>;
  code: Record<Difficulty, number>;
  lesson: number;
  project: number;
  mission: number;
  reviewCorrect: number;
  reviewWrong: number;
};

export interface XpEntry {
  /** Stable id: `exercise:<id>`, `lesson:<id>`, `project:<id>`, `mission:<id>` or `review:<attemptId>`. */
  readonly id: string;
  readonly at: IsoDateTime;
  readonly amount: number;
  readonly reason: string;
}

export function exerciseXp(exercise: Exercise): number {
  const table = exercise.kind === 'code' ? XP_RULES.code : XP_RULES.objective;
  return table[exercise.difficulty];
}

/** Every XP award, derived from the history, oldest first. */
export function xpEntries(catalog: ContentCatalog, progress: Progress): XpEntry[] {
  const entries: XpEntry[] = [];
  const awarded = new Set<string>();

  for (const attempt of progress.attempts) {
    if (
      attempt.activityType === 'exercise' &&
      attempt.correct &&
      !awarded.has(attempt.activityId)
    ) {
      const exercise = catalog.exercises.find((e) => e.id === attempt.activityId);
      if (!exercise) continue;
      awarded.add(exercise.id);
      const full = exerciseXp(exercise);
      entries.push({
        id: `exercise:${exercise.id}`,
        at: attempt.submittedAt,
        amount: attempt.solutionViewed ? Math.round(full / 2) : full,
        reason: attempt.solutionViewed
          ? `Resolveu “${exercise.title}” pela primeira vez (metade, porque pediu a solução antes de tentar)`
          : `Resolveu “${exercise.title}” pela primeira vez`,
      });
    }
    if (attempt.activityType === 'review') {
      const concept = catalog.concepts.find((c) => c.id === attempt.activityId);
      entries.push({
        id: `review:${attempt.id}`,
        at: attempt.submittedAt,
        amount: attempt.correct ? XP_RULES.reviewCorrect : XP_RULES.reviewWrong,
        reason: `Revisou “${concept?.title ?? attempt.activityId}”${attempt.correct ? '' : ' (errou, mas revisar também conta)'}`,
      });
    }
  }

  for (const [key, record] of Object.entries(progress.completions)) {
    if (key.startsWith('project:')) {
      const project = catalog.projects.find((p) => p.id === key.slice('project:'.length));
      if (project) {
        entries.push({
          id: key,
          at: record.firstCompletedAt,
          amount: XP_RULES.project,
          reason: `Concluiu o projeto “${project.title}”`,
        });
      }
      continue;
    }
    if (!key.startsWith('lesson:')) continue;
    const lesson = catalog.lessons.find((l) => l.id === key.slice('lesson:'.length));
    if (!lesson) continue;
    entries.push({
      id: key,
      at: record.firstCompletedAt,
      amount: XP_RULES.lesson,
      reason: `Concluiu a lição “${lesson.title}”`,
    });
  }

  for (const mission of catalog.missions) {
    const { completedAt } = missionStatus(mission, progress);
    if (!completedAt) continue;
    entries.push({
      id: `mission:${mission.id}`,
      at: completedAt,
      amount: XP_RULES.mission,
      reason: `Concluiu a missão “${mission.title}”`,
    });
  }

  return entries.sort((a, b) => a.at.localeCompare(b.at));
}

export function totalXp(entries: readonly XpEntry[]): number {
  return entries.reduce((sum, e) => sum + e.amount, 0);
}

/** Total XP needed to reach `level`: 0, 100, 300, 600, 1000, 1500… */
export function xpForLevel(level: number): number {
  return 50 * (level - 1) * level;
}

export interface LevelInfo {
  readonly level: number;
  readonly xp: number;
  readonly levelStart: number;
  readonly nextLevelAt: number;
}

export function levelFor(xp: number): LevelInfo {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  return { level, xp, levelStart: xpForLevel(level), nextLevelAt: xpForLevel(level + 1) };
}
