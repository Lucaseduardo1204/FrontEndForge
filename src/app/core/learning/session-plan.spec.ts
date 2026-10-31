import { CONTENT } from '../../../content';
import { Attempt, Progress } from '../models/progress.models';
import { createEmptyProgress } from '../persistence/progress-schema';
import { completeLesson, recordAttempt, startLesson } from '../progress/progress-updates';
import {
  activeSession,
  endSession,
  pauseSession,
  resumeSession,
  setBlockState,
  setSessionNotes,
  startSession,
} from '../progress/session-updates';
import { activeMinutes, planSession, sessionSummary } from './session-plan';
import { scheduleConcepts } from './spaced-repetition';

const at = (minutes: number) => new Date(2026, 9, 29, 10, minutes);
const empty = createEmptyProgress(at(0));
let n = 0;
const attempt = (
  id: string,
  correct: boolean,
  minute: number,
  extra: Partial<Attempt> = {},
): Attempt => ({
  id: `a${++n}`,
  activityType: 'exercise',
  activityId: id,
  submittedAt: at(minute).toISOString(),
  correct,
  score: correct ? 1 : 0,
  answer: null,
  hintsUsed: 0,
  solutionViewed: false,
  ...extra,
});

const kinds = (progress: Progress, minutes: number | null) =>
  planSession(CONTENT, progress, minutes, at(0)).blocks.map((b) => b.kind);

describe('session plan', () => {
  it('suggests new content, practice and a summary for a new student, explaining omissions', () => {
    const plan = planSession(CONTENT, empty, 60, at(0));

    expect(plan.blocks.map((b) => b.kind)).toEqual(['lesson', 'practice', 'summary']);
    expect(plan.omitted).toEqual(['Revisão: nenhum conceito com revisão vencida hoje.']);
    expect(plan.blocks.every((b) => b.reason.length > 0)).toBe(true);
  });

  it('starts with a quick review when concepts are due', () => {
    const due = scheduleConcepts(empty, ['web-dom', 'js-closures'], new Date(2026, 9, 20));

    const plan = planSession(CONTENT, due, 30, at(0));

    expect(plan.blocks[0]).toMatchObject({
      kind: 'review',
      title: 'Revisão rápida (2 conceitos)',
      estimatedMinutes: 4,
    });
  });

  it('fits the time: a short session keeps only what fits and says what was left out', () => {
    const plan = planSession(CONTENT, empty, 15, at(0));

    expect(plan.blocks.reduce((sum, b) => sum + b.estimatedMinutes, 0)).toBeLessThanOrEqual(15);
    expect(plan.blocks[0].reason).toContain('avance até onde der');
  });

  it('prefers practice on recurring mistakes', () => {
    const struggling = [1, 2].reduce(
      (p, i) => recordAttempt(p, attempt('mission-xss-impact', false, i), at(i)),
      empty,
    );

    const practice = planSession(CONTENT, struggling, 60, at(5)).blocks.find(
      (b) => b.kind === 'practice',
    );

    expect(practice?.reason).toContain('você errou 2 das últimas 2 tentativas');
  });

  it('skips new content when every lesson is done', () => {
    const done = CONTENT.lessons.reduce(
      (p, lesson) => completeLesson(startLesson(p, lesson.id, at(0)), lesson.id, at(0)),
      empty,
    );

    expect(kinds(done, null)).toEqual(['practice', 'summary']);
  });
});

describe('session lifecycle and summary', () => {
  const blocks = planSession(CONTENT, empty, 30, at(0)).blocks;
  const started = startSession(
    empty,
    { id: 's1', plannedMinutes: 30, objective: '  Entender o DOM  ', timerEnabled: true, blocks },
    at(0),
  );

  it('starts one active session at a time', () => {
    const second = startSession(
      started,
      { id: 's2', plannedMinutes: null, objective: '', timerEnabled: false, blocks },
      at(10),
    );

    expect(activeSession(started)?.objective).toBe('Entender o DOM');
    expect(second.sessions.map((s) => [s.id, s.endedAt !== undefined])).toEqual([
      ['s1', true],
      ['s2', false],
    ]);
  });

  it('marks blocks done or skipped, and lets the student change their mind', () => {
    let p = setBlockState(started, 'lesson', 'skipped', at(1));
    p = setBlockState(p, 'lesson', 'done', at(2));

    expect(activeSession(p)).toMatchObject({ doneBlockIds: ['lesson'], skippedBlockIds: [] });
  });

  it('excludes pauses from active time, including a pause open at the end', () => {
    let p = pauseSession(started, at(10));
    p = resumeSession(p, at(15)); // 5 min pause
    p = pauseSession(p, at(20));
    p = endSession(p, at(25)); // another 5 min, closed by the end

    expect(activeMinutes(p.sessions[0], at(30))).toBe(15);
  });

  it('summarizes demonstrated learning inside the session window only', () => {
    let p = recordAttempt(started, attempt('web-browser-01-li-count', false, 1), at(1));
    p = recordAttempt(p, attempt('web-browser-01-li-count', true, 2), at(2));
    p = recordAttempt(p, attempt('web-browser-01-display-none', true, 3), at(3));
    p = endSession(p, at(20));
    p = recordAttempt(p, attempt('web-browser-01-blocking-css', true, 30), at(30)); // after the end
    p = setSessionNotes(p, 's1', ' Scripts no head não veem o body. ', at(21));

    const summary = sessionSummary(CONTENT, p, p.sessions[0], at(40));

    expect(summary).toMatchObject({
      correctAnswers: 2,
      wrongAnswers: 1,
      exercisesSolved: ['Quantos itens o script enxerga?', 'display: none e visibility: hidden'],
      xp: 20,
      minutes: 20,
    });
    expect(summary.achievements).toContain('Primeira resposta certa');
    expect(p.sessions[0].notes).toBe('Scripts no head não veem o body.');
  });
});
