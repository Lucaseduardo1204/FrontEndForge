import { CONTENT } from '../../../content';
import { achievementStates } from '../gamification/achievement-rules';
import { xpEntries } from '../gamification/xp';
import { nextActivity } from '../learning/next-activity';
import { Attempt, Progress } from '../models/progress.models';
import { createEmptyProgress } from '../persistence/progress-schema';
import { missionStatus } from './mission-status';
import { completeLesson, recordAttempt } from './progress-updates';

const mission = CONTENT.missions.find((m) => m.id === 'mission-xss')!;
let n = 0;
const at = (minutes: number) => new Date(2026, 9, 29, 10, minutes);
const allLessonsDone = CONTENT.lessons.reduce(
  (p, lesson) => completeLesson(p, lesson.id, at(1)),
  createEmptyProgress(at(0)),
);
/** Standalone lab exercises (mission tasks are not among them). */
const labExerciseIds = CONTENT.exercises
  .filter((e) => e.kind === 'code' && e.id.startsWith('lab-'))
  .map((e) => e.id);
const solve = (progress: Progress, id: string, correct: boolean, minutes: number): Progress => {
  const attempt: Attempt = {
    id: `a${++n}`,
    activityType: 'exercise',
    activityId: id,
    submittedAt: at(minutes).toISOString(),
    correct,
    score: correct ? 1 : 0,
    answer: null,
    hintsUsed: 0,
    solutionViewed: false,
  };
  return recordAttempt(progress, attempt, at(minutes));
};

describe('missions', () => {
  const empty = createEmptyProgress(at(0));

  it('is derived from its tasks and completes when the last one is solved', () => {
    const started = solve(empty, 'mission-xss-impact', false, 1);
    const half = solve(started, 'mission-xss-impact', true, 2);
    const done = solve(half, 'mission-xss-escape', true, 5);

    expect(missionStatus(mission, empty)).toMatchObject({ started: false, solved: 0, total: 2 });
    expect(missionStatus(mission, started)).toMatchObject({ started: true, completedAt: null });
    expect(missionStatus(mission, half).solved).toBe(1);
    expect(missionStatus(mission, done).completedAt).toBe(at(5).toISOString());
  });

  it('adds a 30 XP bonus and the achievement on completion', () => {
    const done = solve(solve(empty, 'mission-xss-impact', true, 1), 'mission-xss-escape', true, 2);

    expect(xpEntries(CONTENT, done).find((e) => e.id === 'mission:mission-xss')?.amount).toBe(30);
    expect(achievementStates(CONTENT, done).find((s) => s.id === 'first-mission')?.unlockedAt).toBe(
      at(2).toISOString(),
    );
  });

  it('is recommended after the lab, and continued once started', () => {
    let progress = allLessonsDone;
    for (const id of labExerciseIds) {
      progress = solve(progress, id, true, 2);
    }

    expect(nextActivity(CONTENT, progress, at(3))).toMatchObject({
      kind: 'start-mission',
      mission: { id: 'mission-responsive-layout' },
    });

    const started = solve(progress, 'mission-xss-impact', true, 4);
    expect(nextActivity(CONTENT, started, at(5))).toMatchObject({
      kind: 'continue-mission',
      mission: { id: 'mission-xss' },
    });
  });

  it('does not recommend a mission task as a standalone lab exercise', () => {
    let progress = allLessonsDone;
    for (const id of labExerciseIds.filter((id) => id !== 'lab-html-semantic-card')) {
      progress = solve(progress, id, true, 2);
    }

    expect(nextActivity(CONTENT, progress, at(3))).toMatchObject({
      kind: 'lab-exercise',
      exercise: { id: 'lab-html-semantic-card' },
    });
  });
});
