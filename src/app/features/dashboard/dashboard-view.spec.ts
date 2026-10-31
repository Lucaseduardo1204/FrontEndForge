import { CONTENT } from '../../../content';
import { Attempt } from '../../core/models/progress.models';
import { createEmptyProgress } from '../../core/persistence/progress-schema';
import { recordAttempt } from '../../core/progress/progress-updates';
import { scheduleConcepts } from '../../core/learning/spaced-repetition';
import { greeting, progressStats, recentActivity, reviewOverview } from './dashboard-view';

describe('dashboard view', () => {
  const now = new Date(2026, 9, 29, 15, 0);
  const attempt = (id: string, activityId: string, correct: boolean): Attempt => ({
    id,
    activityType: 'exercise',
    activityId,
    submittedAt: now.toISOString(),
    correct,
    score: correct ? 1 : 0,
    answer: null,
    hintsUsed: 0,
    solutionViewed: false,
  });

  it('reports zeros for a new student and real published totals', () => {
    const stats = progressStats(CONTENT, createEmptyProgress(now));

    expect(stats).toMatchObject({ lessonsCompleted: 0, exercisesSolved: 0, attempts: 0 });
    expect(stats.lessonsPublished).toBe(CONTENT.lessons.length);
    expect(stats.exercisesPublished).toBe(CONTENT.exercises.length);
  });

  it('counts solved exercises once, however many attempts', () => {
    let progress = createEmptyProgress(now);
    progress = recordAttempt(progress, attempt('1', 'web-browser-01-li-count', false), now);
    progress = recordAttempt(progress, attempt('2', 'web-browser-01-li-count', true), now);
    progress = recordAttempt(progress, attempt('3', 'web-browser-01-li-count', true), now);

    expect(progressStats(CONTENT, progress)).toMatchObject({
      exercisesSolved: 1,
      attempts: 3,
      correctAttempts: 2,
      studyDays: 1,
    });
  });

  it('lists recent attempts newest first, linked to their lesson', () => {
    let progress = createEmptyProgress(now);
    progress = recordAttempt(progress, attempt('1', 'web-browser-01-li-count', false), now);
    progress = recordAttempt(progress, attempt('2', 'removed-exercise', true), now);

    const items = recentActivity(CONTENT, progress);

    expect(items.map((i) => i.id)).toEqual(['2', '1']);
    expect(items[1]).toMatchObject({
      title: 'Quantos itens o script enxerga?',
      lessonId: 'web-browser-01',
    });
    expect(items[0].title).toBe('Atividade que não existe mais no conteúdo');
  });

  it('greets by time of day', () => {
    expect(greeting(new Date(2026, 9, 29, 9))).toBe('Bom dia');
    expect(greeting(new Date(2026, 9, 29, 15))).toBe('Boa tarde');
    expect(greeting(new Date(2026, 9, 29, 21))).toBe('Boa noite');
  });

  it('summarizes due and upcoming reviews with concept titles', () => {
    let progress = scheduleConcepts(createEmptyProgress(now), ['web-dom'], new Date(2026, 9, 20));
    progress = scheduleConcepts(progress, ['web-render-tree'], now);

    expect(reviewOverview(CONTENT, progress, now)).toEqual({
      dueTitles: ['DOM'],
      scheduled: 2,
      nextDueOn: '2026-10-30',
    });
  });
});
