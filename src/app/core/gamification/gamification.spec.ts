import { CONTENT } from '../../../content';
import { ContentCatalog } from '../content/catalog';
import { Attempt, Progress } from '../models/progress.models';
import { createEmptyProgress } from '../persistence/progress-schema';
import { completeLesson, recordAttempt } from '../progress/progress-updates';
import { ACHIEVEMENT_RULES, achievementStates } from './achievement-rules';
import { longestRun, streakInfo } from './streak';
import { levelFor, totalXp, xpEntries, xpForLevel } from './xp';

const now = new Date(2026, 9, 29, 10);
let counter = 0;
function attempt(activityId: string, correct: boolean, extra: Partial<Attempt> = {}): Attempt {
  counter++;
  return {
    id: `a${counter}`,
    activityType: 'exercise',
    activityId,
    submittedAt: new Date(now.getTime() + counter * 1000).toISOString(),
    correct,
    score: correct ? 1 : 0,
    answer: null,
    hintsUsed: 0,
    solutionViewed: false,
    ...extra,
  };
}
const answered = (progress: Progress, ...attempts: Attempt[]) =>
  attempts.reduce((p, a) => recordAttempt(p, a, now), progress);
const empty = () => createEmptyProgress(now);

const unlockedIds = (progress: Progress) =>
  achievementStates(CONTENT, progress)
    .filter((s) => s.unlockedAt)
    .map((s) => s.id);

describe('XP', () => {
  it('awards XP once per exercise, by kind and difficulty', () => {
    const progress = answered(
      empty(),
      attempt('web-browser-01-display-none', false),
      attempt('web-browser-01-display-none', true), // introductory objective: 10
      attempt('web-browser-01-display-none', true), // repeated: 0
      attempt('web-browser-01-layout-change', true), // intermediate objective: 20
      attempt('lab-js-sum-even', true), // introductory code: 25
    );

    const entries = xpEntries(CONTENT, progress);

    expect(entries.map((e) => [e.id, e.amount])).toEqual([
      ['exercise:web-browser-01-display-none', 10],
      ['exercise:web-browser-01-layout-change', 20],
      ['exercise:lab-js-sum-even', 25],
    ]);
    expect(totalXp(entries)).toBe(55);
  });

  it('gives half when the solution was requested before trying, and says why', () => {
    const progress = answered(empty(), attempt('lab-js-sum-even', true, { solutionViewed: true }));

    const [entry] = xpEntries(CONTENT, progress);

    expect(entry.amount).toBe(13);
    expect(entry.reason).toContain('pediu a solução antes de tentar');
  });

  it('awards lessons once and reviews with reduced XP, right or wrong', () => {
    const lesson = completeLesson(
      completeLesson(empty(), 'web-browser-01', now),
      'web-browser-01',
      now,
    );
    const reviews = answered(
      lesson,
      attempt('web-dom', true, { activityType: 'review' }),
      attempt('web-dom', false, { activityType: 'review' }),
    );

    expect(xpEntries(CONTENT, reviews).map((e) => e.amount)).toEqual([50, 5, 2]);
  });

  it('awards 100 XP for a completed project', () => {
    const progress = {
      ...empty(),
      completions: { 'project:project-js-tasks': { firstCompletedAt: now.toISOString() } },
    };

    expect(xpEntries(CONTENT, progress)).toEqual([
      {
        id: 'project:project-js-tasks',
        at: now.toISOString(),
        amount: 100,
        reason: 'Concluiu o projeto “Aplicação de gerenciamento de tarefas”',
      },
    ]);
    expect(unlockedIds(progress)).toContain('first-project');
  });

  it('ignores attempts on content that no longer exists', () => {
    expect(xpEntries(CONTENT, answered(empty(), attempt('removido', true)))).toEqual([]);
  });

  it('maps XP to levels with growing steps', () => {
    expect([1, 2, 3, 4, 5].map(xpForLevel)).toEqual([0, 100, 300, 600, 1000]);
    expect(levelFor(0)).toMatchObject({ level: 1, nextLevelAt: 100 });
    expect(levelFor(299)).toMatchObject({ level: 2, levelStart: 100, nextLevelAt: 300 });
    expect(levelFor(300).level).toBe(3);
  });
});

describe('streak', () => {
  it('counts consecutive days and stays alive until the end of today', () => {
    const days = ['2026-10-26', '2026-10-27', '2026-10-28'];

    expect(streakInfo(days, '2026-10-28')).toEqual({ current: 3, longest: 3, studiedToday: true });
    expect(streakInfo(days, '2026-10-29')).toEqual({ current: 3, longest: 3, studiedToday: false });
  });

  it('resets the current streak but keeps the longest one recorded', () => {
    expect(streakInfo(['2026-10-20', '2026-10-21', '2026-10-27'], '2026-10-29')).toEqual({
      current: 0,
      longest: 2,
      studiedToday: false,
    });
  });

  it('records the first day each run length was reached', () => {
    expect(longestRun(['2026-10-01', '2026-10-03', '2026-10-04', '2026-10-05'])).toEqual({
      length: 3,
      reachedOn: ['2026-10-01', '2026-10-04', '2026-10-05'],
    });
  });
});

describe('achievements', () => {
  const unlocked = (progress: Progress) =>
    achievementStates(CONTENT, progress)
      .filter((s) => s.unlockedAt)
      .map((s) => s.id);

  it('has a rule for every published achievement', () => {
    expect(CONTENT.achievements.filter((a) => !ACHIEVEMENT_RULES[a.id])).toEqual([]);
  });

  it('starts with nothing unlocked', () => {
    expect(unlocked(empty())).toEqual([]);
  });

  it('unlocks from real events, with the date it happened', () => {
    const progress = answered(
      empty(),
      attempt('web-browser-01-script-null', false),
      attempt('web-browser-01-script-null', false),
      attempt('web-browser-01-script-null', true), // debugging step, after 2 errors
      attempt('lab-js-sum-even', true), // code, first try
      attempt('web-dom', false, { activityType: 'review' }),
    );

    expect(unlocked(progress)).toEqual([
      'first-correct-answer',
      'first-bug-diagnosed',
      'learned-from-mistakes',
      'first-code-passed',
      'code-first-try',
      'first-review',
    ]);
    const states = achievementStates(CONTENT, progress);
    expect(states.find((s) => s.id === 'learned-from-mistakes')?.unlockedAt).toBe(
      progress.attempts[2].submittedAt,
    );
  });

  it('does not count a code exercise solved after failing, or after asking for the solution', () => {
    const failedFirst = answered(
      empty(),
      attempt('lab-js-sum-even', false),
      attempt('lab-js-sum-even', true),
    );
    const askedSolution = answered(
      empty(),
      attempt('lab-js-sum-even', true, { solutionViewed: true }),
    );

    expect(unlocked(failedFirst)).not.toContain('code-first-try');
    expect(unlocked(askedSolution)).not.toContain('code-first-try');
    expect(unlocked(askedSolution)).toContain('first-code-passed');
  });

  it('replays reviews to detect box 5', () => {
    const review = (correct: boolean) => attempt('web-dom', correct, { activityType: 'review' });
    const fourRight = answered(empty(), review(true), review(true), review(true), review(true));
    const reset = answered(
      empty(),
      review(true),
      review(true),
      review(true),
      review(false),
      review(true),
    );

    expect(unlocked(fourRight)).toContain('long-term-memory');
    expect(unlocked(reset)).not.toContain('long-term-memory');
  });

  it('keeps streak achievements after the streak is broken', () => {
    const progress = {
      ...empty(),
      studyDays: ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-20'],
    };

    expect(unlocked(progress)).toEqual(['three-day-streak']);
  });

  it('uses only the catalog it is given', () => {
    const catalog = { ...CONTENT, achievements: [] } as ContentCatalog;

    expect(achievementStates(catalog, empty())).toEqual([]);
  });
});
