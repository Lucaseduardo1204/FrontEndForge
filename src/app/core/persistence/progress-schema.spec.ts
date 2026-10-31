import {
  createEmptyProgress,
  CURRENT_SCHEMA_VERSION,
  migrateProgress,
  parseProgressJson,
  ProgressDataError,
} from './progress-schema';
import { CONTENT } from '../../../content';
import { planSession } from '../learning/session-plan';
import { recordExerciseAttempt, recordReviewAttempt } from '../learning/record-exercise';
import { Attempt, Progress } from '../models/progress.models';
import { completeLesson, startLesson } from '../progress/progress-updates';
import { setChecklistItem, setSelfAssessment, startProject } from '../progress/project-updates';
import {
  endSession,
  pauseSession,
  setBlockState,
  setSessionNotes,
  startSession,
} from '../progress/session-updates';

describe('progress schema', () => {
  const now = new Date('2026-10-29T12:00:00.000Z');

  it('creates empty progress with the current schema version and no history', () => {
    const progress = createEmptyProgress(now);

    expect(progress.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(progress.createdAt).toBe('2026-10-29T12:00:00.000Z');
    expect(progress.attempts).toEqual([]);
    expect(progress.lessons).toEqual({});
  });

  it('accepts valid data of the current version unchanged', () => {
    const progress = createEmptyProgress(now);

    expect(migrateProgress(structuredClone(progress))).toEqual(progress);
  });

  it('round-trips through JSON (export then import)', () => {
    const progress = {
      ...createEmptyProgress(now),
      studyDays: ['2026-10-28', '2026-10-29'],
      reviews: {
        'web-dom': {
          conceptId: 'web-dom',
          box: 2 as const,
          dueOn: '2026-11-01',
          lastReviewedAt: '2026-10-29T12:00:00.000Z',
        },
      },
    };

    expect(parseProgressJson(JSON.stringify(progress))).toEqual(progress);
  });

  it.each([
    ['null', null],
    ['an array', []],
    ['a string', 'progress'],
  ])('rejects %s', (_label, raw) => {
    expect(() => migrateProgress(raw)).toThrow(ProgressDataError);
  });

  it('rejects data without a valid schemaVersion', () => {
    const withoutVersion: Record<string, unknown> = { ...createEmptyProgress(now) };
    delete withoutVersion['schemaVersion'];

    expect(() => migrateProgress(withoutVersion)).toThrow(/schemaVersion/);
    expect(() => migrateProgress({ ...withoutVersion, schemaVersion: 0 })).toThrow(/schemaVersion/);
  });

  it('rejects data saved by a newer schema instead of guessing', () => {
    const future = { ...createEmptyProgress(now), schemaVersion: CURRENT_SCHEMA_VERSION + 1 };

    expect(() => migrateProgress(future)).toThrow(/versão mais nova/);
  });

  it('lists every malformed field', () => {
    const broken = {
      ...createEmptyProgress(now),
      attempts: 'none',
      studyDays: [1],
      createdAt: 'x',
    };

    expect(() => migrateProgress(broken)).toThrow(/createdAt, attempts, studyDays/);
  });

  it('rejects text that is not JSON', () => {
    expect(() => parseProgressJson('{not json')).toThrow(ProgressDataError);
  });

  it('migrates v1 data to the current version, keeping the history', () => {
    const v1: Record<string, unknown> = {
      ...createEmptyProgress(now),
      schemaVersion: 1,
      studyDays: ['2026-10-28'],
      xp: [],
      achievements: {},
    };
    delete v1['projects']; // did not exist in v1
    delete v1['sessions'];

    const migrated = migrateProgress(v1);

    expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(migrated.projects).toEqual({});
    expect(migrated.sessions).toEqual([]);
    expect(migrated.studyDays).toEqual(['2026-10-28']);
    expect('xp' in migrated).toBe(false);
    expect('achievements' in migrated).toBe(false);
  });

  describe('deep validation of imported data', () => {
    /** Built with the app's own update functions, so it has every kind of record. */
    function realProgress(): Progress {
      const exercise = CONTENT.exercises.find((e) => e.id === 'web-browser-01-display-none')!;
      const attempt = (correct: boolean): Attempt => ({
        id: `a-${correct}`,
        activityType: 'exercise',
        activityId: exercise.id,
        submittedAt: now.toISOString(),
        correct,
        score: correct ? 1 : 0,
        answer: ['in-dom-not-render'],
        hintsUsed: 1,
        solutionViewed: false,
      });
      let p = createEmptyProgress(now);
      p = startLesson(p, 'web-browser-01', now);
      p = recordExerciseAttempt(CONTENT, p, exercise, attempt(false), now);
      p = recordExerciseAttempt(CONTENT, p, exercise, attempt(true), now);
      p = recordReviewAttempt(p, 'web-dom', exercise, attempt(true), now);
      p = completeLesson(p, 'web-browser-01', now);
      p = startProject(p, 'project-js-tasks', now);
      p = setChecklistItem(p, 'project-js-tasks', 'item-1', true, now);
      p = setSelfAssessment(p, 'project-js-tasks', 'criterion-1', 2, now);
      const blocks = planSession(CONTENT, p, 30, now).blocks;
      p = startSession(
        p,
        { id: 's1', plannedMinutes: 30, objective: 'x', timerEnabled: true, blocks },
        now,
      );
      p = setBlockState(p, blocks[0].id, 'done', now);
      p = pauseSession(p, now);
      p = endSession(p, now);
      p = setSessionNotes(p, 's1', 'Aprendi.', now);
      return p;
    }

    it('accepts every kind of record the app itself writes', () => {
      const progress = realProgress();
      expect(progress.attempts.length).toBeGreaterThan(0);
      expect(Object.keys(progress.reviews).length).toBeGreaterThan(0);

      expect(parseProgressJson(JSON.stringify(progress))).toEqual(progress);
    });

    /** Real progress with one value replaced: `path` is dot-separated (`sessions.0.blocks`). */
    const corrupt = (path: string, value: unknown) => {
      const data: unknown = JSON.parse(JSON.stringify(realProgress()));
      const keys = path.split('.');
      let node = data as Record<string, unknown>;
      for (const key of keys.slice(0, -1)) node = node[key] as Record<string, unknown>;
      node[keys.at(-1)!] = value;
      return () => migrateProgress(data);
    };

    it.each([
      ['a session without blocks', 'sessions.0.blocks', [], 'sessions[0].blocks'],
      ['blocks that are not a list', 'sessions.0.blocks', 'x', 'sessions[0].blocks'],
      [
        'an unknown block target',
        'sessions.0.blocks.0.target',
        { type: 'shell' },
        'sessions[0].blocks[0].target',
      ],
      [
        'an attempt with an invalid date',
        'attempts.0.submittedAt',
        'ontem',
        'attempts[0].submittedAt',
      ],
      [
        'an attempt with an unknown type',
        'attempts.0.activityType',
        'hack',
        'attempts[0].activityType',
      ],
      ['a score out of range', 'attempts.0.score', 7, 'attempts[0].score'],
      ['a Leitner box out of range', 'reviews.web-dom.box', 9, 'reviews.web-dom.box'],
      [
        'a review day in another format',
        'reviews.web-dom.dueOn',
        '01/11/2026',
        'reviews.web-dom.dueOn',
      ],
      [
        'a negative lesson step',
        'lessons.web-browser-01.currentStepIndex',
        -1,
        'lessons.web-browser-01.currentStepIndex',
      ],
      [
        'checked items that are not strings',
        'projects.project-js-tasks.checkedItems',
        [1],
        'projects.project-js-tasks.checkedItems',
      ],
      [
        'a completion without date',
        'completions.lesson:web-browser-01',
        {},
        'completions.lesson:web-browser-01.firstCompletedAt',
      ],
      ['notes that are not text', 'sessions.0.notes', { html: '<b>' }, 'sessions[0].notes'],
    ])('rejects %s and says where', (_label, path, value, where) => {
      expect(corrupt(path, value)).toThrow(ProgressDataError);
      expect(corrupt(path, value)).toThrow(where);
    });
  });
});
