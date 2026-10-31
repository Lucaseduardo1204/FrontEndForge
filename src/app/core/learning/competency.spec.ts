import { CONTENT } from '../../../content';
import { Attempt, Progress } from '../models/progress.models';
import { createEmptyProgress } from '../persistence/progress-schema';
import {
  completeProject,
  recordProjectCheck,
  setChecklistItem,
  setSelfAssessment,
} from '../progress/project-updates';
import { recordAttempt } from '../progress/progress-updates';
import { competencyReport } from './competency';
import { scheduleConcepts, recordReview } from './spaced-repetition';

const competency = (id: string) => CONTENT.competencies.find((c) => c.id === id)!;
const now = new Date(2026, 9, 29, 12);
let n = 0;
function attempt(id: string, correct: boolean, extra: Partial<Attempt> = {}): Attempt {
  n++;
  return {
    id: `a${n}`,
    activityType: 'exercise',
    activityId: id,
    submittedAt: new Date(now.getTime() + n * 1000).toISOString(),
    correct,
    score: correct ? 1 : 0,
    answer: null,
    hintsUsed: 0,
    solutionViewed: false,
    ...extra,
  };
}
const answered = (p: Progress, ...attempts: Attempt[]) =>
  attempts.reduce((acc, a) => recordAttempt(acc, a, now), p);
const report = (p: Progress, id = 'web-fundamentals') =>
  competencyReport(CONTENT, p, competency(id), now);

/**
 * Every competency of the real catalog has exercises now, so the "no activities yet" state is
 * tested with a catalog that has one extra competency without content.
 */
const competencyWithoutExercises = 'sem-conteudo-ainda';
const catalogWithEmptyCompetency = {
  ...CONTENT,
  competencies: [
    ...CONTENT.competencies,
    {
      id: competencyWithoutExercises,
      title: 'Competência sem conteúdo',
      description: 'Ainda sem lições publicadas.',
    },
  ],
};

describe('competency report', () => {
  const empty = createEmptyProgress(now);

  it('starts with no evidence and lists every criterion as unmet', () => {
    const r = report(empty);

    expect(r.level).toBe(0);
    expect(r.exercisesAvailable).toBeGreaterThan(0);
    expect(r.criteria.every((c) => !c.met)).toBe(true);
    expect(r.nextActivities[0].location).toMatchObject({ type: 'lesson' });
  });

  it('does not grant more than "Praticando" for solving exercises, however many', () => {
    const progress = answered(
      empty,
      attempt('web-browser-01-display-none', true),
      attempt('web-browser-01-li-count', true),
      attempt('web-browser-01-blocking-css', true),
      attempt('web-browser-01-layout-change', true),
    );

    const r = report(progress);

    expect(r.level).toBe(2);
    expect(r.evidence).toMatchObject({
      solved: 4,
      independent: 4,
      assessmentsSolved: 3,
    });
    expect(r.criteria.filter((c) => !c.met).map((c) => c.level)).toEqual([3, 4]);
  });

  it('needs an independent solve for level 2', () => {
    const helped = { hintsUsed: 2 };
    const progress = answered(
      empty,
      attempt('web-browser-01-display-none', true, helped),
      attempt('web-browser-01-li-count', true, { solutionViewed: true }),
      attempt('web-browser-01-blocking-css', true, helped),
    );

    expect(report(progress)).toMatchObject({ level: 1, evidence: { independent: 0 } });
  });

  it('reaches "Consolidando" with retention and accuracy, and drops when a concept is forgotten', () => {
    let progress = answered(
      empty,
      attempt('web-browser-01-display-none', true),
      attempt('web-browser-01-li-count', true),
      attempt('web-browser-01-blocking-css', true),
    );
    progress = scheduleConcepts(progress, ['web-dom'], now);
    const review = (correct: boolean) =>
      attempt('web-dom', correct, {
        activityType: 'review',
        answer: { exerciseId: 'web-browser-01-li-count' },
      });
    progress = recordReview(progress, review(true), now);
    progress = recordReview(progress, review(true), now); // box 3

    expect(report(progress).level).toBe(3);

    const forgot = recordReview(progress, review(false), now); // back to box 1
    expect(report(forgot).level).toBe(2);
    expect(report(forgot).evidence.highestBox).toBe(1);
  });

  it('reaches "Aplicando" only with a completed project or mission', () => {
    const project = CONTENT.projects.find((p) => p.id === 'project-js-tasks')!;
    let progress = answered(
      empty,
      attempt('lab-js-sum-even', true),
      attempt('lab-js-count-occurrences', true),
      attempt('bug-closure-var-loop-diagnosis', true),
    );
    progress = scheduleConcepts(progress, ['js-closures'], now);
    const review = () =>
      attempt('js-closures', true, {
        activityType: 'review',
        answer: { exerciseId: 'bug-closure-var-loop-diagnosis' },
      });
    progress = recordReview(recordReview(progress, review(), now), review(), now);
    expect(report(progress, 'javascript').level).toBe(3);

    for (const item of project.steps.flatMap((s) => s.checklist)) {
      progress = setChecklistItem(progress, project.id, item.id, true, now);
    }
    for (const criterion of project.rubric)
      progress = setSelfAssessment(progress, project.id, criterion.id, 1, now);
    progress = recordProjectCheck(
      progress,
      attempt(project.id, true, { activityType: 'project' }),
      now,
    );
    progress = completeProject(progress, project, now);

    const r = report(progress, 'javascript');
    expect(r.level).toBe(4);
    expect(r.evidence.appliedIn).toContain('Projeto: Aplicação de gerenciamento de tarefas');
  });

  it('reports competencies without published activities honestly', () => {
    const emptyCompetency = catalogWithEmptyCompetency.competencies.at(-1)!;
    expect(competencyReport(catalogWithEmptyCompetency, empty, emptyCompetency, now)).toMatchObject(
      {
        exercisesAvailable: 0,
        level: 0,
      },
    );
  });

  it('points out recurring mistakes as improvements', () => {
    const progress = answered(
      empty,
      attempt('web-browser-01-li-count', false),
      attempt('web-browser-01-li-count', false),
    );

    expect(report(progress).improvements.join(' ')).toContain('Erros recorrentes');
  });
});
