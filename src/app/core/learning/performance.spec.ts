import { ContentCatalog } from '../content/catalog';
import { Exercise } from '../models/content.models';
import { Attempt, Progress } from '../models/progress.models';
import { createEmptyProgress } from '../persistence/progress-schema';
import {
  recentAccuracy,
  reviewableConceptIds,
  reviewExercise,
  strugglingConcepts,
} from './performance';

const exercise = (id: string, kind: Exercise['kind'], conceptIds: string[]): Exercise =>
  ({ id, kind, conceptIds, title: id, difficulty: 'introductory' }) as unknown as Exercise;

const catalog = {
  phases: [],
  modules: [],
  lessons: [],
  exercises: [
    exercise('q1', 'multiple-choice', ['dom']),
    exercise('q2', 'predict-output', ['dom', 'scripts']),
    exercise('lab', 'code', ['arrays']),
  ],
  concepts: [
    { id: 'dom', title: 'DOM', competencyId: 'x' },
    { id: 'scripts', title: 'Scripts', competencyId: 'x' },
    { id: 'arrays', title: 'Arrays', competencyId: 'x' },
  ],
  competencies: [],
  achievements: [],
  projects: [],
  missions: [],
  bugs: [],
  library: [],
} as ContentCatalog;

function withAttempts(...results: [string, boolean, ('exercise' | 'review')?][]): Progress {
  const attempts: Attempt[] = results.map(([id, correct, type = 'exercise'], i) => ({
    id: String(i),
    activityType: type,
    activityId: type === 'review' ? 'dom' : id,
    submittedAt: '2026-10-29T10:00:00.000Z',
    correct,
    score: correct ? 1 : 0,
    answer: type === 'review' ? { exerciseId: id } : null,
    hintsUsed: 0,
    solutionViewed: false,
  }));
  return { ...createEmptyProgress(new Date()), attempts };
}

describe('learning performance', () => {
  it('flags a concept with at least 2 errors that are half of the recent attempts', () => {
    const progress = withAttempts(['q1', false], ['q2', false], ['q2', true]);

    expect(strugglingConcepts(catalog, progress)).toEqual([
      { conceptId: 'dom', title: 'DOM', attempts: 3, errors: 2 },
    ]);
  });

  it('counts review attempts through the exercise they used', () => {
    const progress = withAttempts(['q1', false, 'review'], ['q1', false, 'review']);

    expect(strugglingConcepts(catalog, progress).map((c) => c.conceptId)).toEqual(['dom']);
  });

  it('stops flagging once recent answers improve (only the last 5 count)', () => {
    const progress = withAttempts(
      ['q1', false],
      ['q1', false],
      ['q1', false],
      ['q1', true],
      ['q1', true],
      ['q1', true],
      ['q1', true],
    );

    expect(strugglingConcepts(catalog, progress)).toEqual([]);
  });

  it('does not flag a single mistake', () => {
    expect(strugglingConcepts(catalog, withAttempts(['q1', false]))).toEqual([]);
  });

  it('computes recent accuracy', () => {
    expect(recentAccuracy(createEmptyProgress(new Date()))).toBeNull();
    expect(
      recentAccuracy(withAttempts(['q1', true], ['q1', false], ['q1', true], ['q1', true])),
    ).toBe(0.75);
  });

  it('reviews only concepts with objective exercises, rotating the question', () => {
    expect([...reviewableConceptIds(catalog)].sort()).toEqual(['dom', 'scripts']);

    const none = createEmptyProgress(new Date());
    const oneReview = withAttempts(['q1', true, 'review']);
    expect(reviewExercise(catalog, none, 'dom')?.id).toBe('q1');
    expect(reviewExercise(catalog, oneReview, 'dom')?.id).toBe('q2');
    expect(reviewExercise(catalog, none, 'arrays')).toBeUndefined();
  });
});
