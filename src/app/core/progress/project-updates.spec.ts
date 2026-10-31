import { Project } from '../models/content.models';
import { Attempt } from '../models/progress.models';
import { createEmptyProgress } from '../persistence/progress-schema';
import {
  completeProject,
  projectStatus,
  recordProjectCheck,
  setChecklistItem,
  setSelfAssessment,
  startProject,
} from './project-updates';
import { isCompleted } from './progress-updates';

const project = {
  id: 'p1',
  steps: [
    {
      id: 's1',
      checklist: [
        { id: 'a', text: 'A' },
        { id: 'b', text: 'B' },
      ],
    },
    { id: 's2', checklist: [{ id: 'c', text: 'C' }] },
  ],
  rubric: [{ id: 'r1' }, { id: 'r2' }],
} as unknown as Project;

const now = new Date(2026, 9, 29, 10);
const check = (passed: boolean, i = 1): Attempt => ({
  id: `c${i}`,
  activityType: 'project',
  activityId: 'p1',
  submittedAt: new Date(now.getTime() + i).toISOString(),
  correct: passed,
  score: passed ? 1 : 0.5,
  answer: { code: '…' },
  hintsUsed: 0,
  solutionViewed: false,
});

function allDone() {
  let p = createEmptyProgress(now);
  for (const id of ['a', 'b', 'c']) p = setChecklistItem(p, 'p1', id, true, now);
  p = setSelfAssessment(p, 'p1', 'r1', 2, now);
  p = setSelfAssessment(p, 'p1', 'r2', 3, now);
  return recordProjectCheck(p, check(true), now);
}

describe('project progress', () => {
  it('lists everything that is missing for a new project', () => {
    const status = projectStatus(project, createEmptyProgress(now));

    expect(status.started).toBe(false);
    expect(status.missing).toEqual([
      'Execute a verificação automática do seu código.',
      'Marque os itens do checklist (0 de 3).',
      'Preencha a autoavaliação (0 de 2 critérios).',
    ]);
  });

  it('checks and unchecks items, and stores the self-assessment', () => {
    let p = startProject(createEmptyProgress(now), 'p1', now);
    p = setChecklistItem(p, 'p1', 'a', true, now);
    p = setChecklistItem(p, 'p1', 'b', true, now);
    p = setChecklistItem(p, 'p1', 'a', false, now);
    p = setSelfAssessment(p, 'p1', 'r1', 3, now);

    expect(p.projects['p1'].checkedItems).toEqual(['b']);
    expect(projectStatus(project, p)).toMatchObject({ checkedCount: 1, assessedCount: 1 });
  });

  it('records checks without completing the project by itself', () => {
    const p = recordProjectCheck(createEmptyProgress(now), check(true), now);

    expect(projectStatus(project, p).lastCheck?.passed).toBe(true);
    expect(isCompleted(p, 'project', 'p1')).toBe(false);
    expect(p.projects['p1']).toBeDefined();
  });

  it('uses only the latest check', () => {
    const p = recordProjectCheck(
      recordProjectCheck(allDone(), check(false, 2), now),
      check(false, 3),
      now,
    );

    expect(projectStatus(project, p).missing).toEqual([
      'A última verificação automática ainda tem testes falhando.',
    ]);
    expect(completeProject(p, project, now)).toBe(p);
  });

  it('completes only when everything is done, once', () => {
    const done = completeProject(allDone(), project, now);
    const again = completeProject(done, project, new Date(2026, 10, 1));

    expect(isCompleted(done, 'project', 'p1')).toBe(true);
    expect(projectStatus(project, again).completedAt).toBe(now.toISOString());
    expect(again).toBe(done);
  });
});
