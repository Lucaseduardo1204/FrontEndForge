import { Exercise } from '../../../core/models/content.models';
import { nextActivityView } from './next-activity-view';

describe('nextActivityView', () => {
  const exercise = { id: 'ex-1', title: 'Exercício 1', kind: 'multiple-choice' } as Exercise;

  it('links practice inside a lesson to the exact step (1-based)', () => {
    const view = nextActivityView({
      kind: 'practice',
      exercise,
      location: { type: 'lesson', lessonId: 'web-browser-01', stepIndex: 5 },
      reason: 'motivo',
    });

    expect(view.action).toEqual({
      text: 'Praticar este exercício',
      commands: ['/lessons', 'web-browser-01'],
      queryParams: { step: '6' },
    });
    expect(view.reason).toBe('motivo');
  });

  it('links practice to the mission or bug page where the exercise lives', () => {
    const base = { kind: 'practice' as const, exercise, reason: 'x' };

    expect(
      nextActivityView({ ...base, location: { type: 'mission', missionId: 'mission-xss' } }).action,
    ).toMatchObject({ commands: ['/missions', 'mission-xss'] });
    expect(
      nextActivityView({ ...base, location: { type: 'bug', bugId: 'bug-sort-mutation' } }).action,
    ).toMatchObject({ commands: ['/bugs', 'bug-sort-mutation'] });
  });

  it('sends reviews to the review session and lists the concepts', () => {
    const view = nextActivityView({
      kind: 'review',
      conceptTitles: ['DOM', 'CSSOM'],
      reason: 'motivo',
    });

    expect(view).toMatchObject({
      title: 'Revisar 2 conceitos',
      summary: 'DOM, CSSOM',
      action: { commands: ['/review'] },
    });
  });

  it('does not repeat a single concept as the summary', () => {
    const view = nextActivityView({ kind: 'review', conceptTitles: ['DOM'], reason: 'x' });

    expect(view).toMatchObject({ title: 'Revisar “DOM”', summary: undefined });
  });

  it('has no action when everything is done', () => {
    expect(nextActivityView({ kind: 'all-done', reason: 'x' }).action).toBeUndefined();
  });
});
