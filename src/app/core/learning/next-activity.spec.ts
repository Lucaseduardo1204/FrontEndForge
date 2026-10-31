import { ContentCatalog } from '../content/catalog';
import { Exercise, Lesson, Module, Project } from '../models/content.models';
import { Attempt, Progress } from '../models/progress.models';
import { createEmptyProgress } from '../persistence/progress-schema';
import {
  completeLesson,
  recordAttempt,
  setLessonStep,
  startLesson,
} from '../progress/progress-updates';
import { setChecklistItem } from '../progress/project-updates';
import { scheduleConcepts } from './spaced-repetition';
import { nextActivity } from './next-activity';

const lesson = (id: string, moduleId: string): Lesson => ({
  id,
  moduleId,
  title: `Lição ${id}`,
  summary: '',
  estimatedMinutes: 10,
  difficulty: 'introductory',
  conceptIds: [],
  steps: [
    { kind: 'context', title: 'Contexto', blocks: [] },
    { kind: 'explanation', title: 'Explicação', blocks: [] },
    { kind: 'assessment', title: 'Avaliação', blocks: [], exerciseIds: ['x'] },
  ],
});

const module = (id: string, lessonIds: string[], prerequisiteModuleIds: string[] = []): Module => ({
  id,
  phaseId: 'p0',
  title: id,
  summary: '',
  objectives: [],
  prerequisiteModuleIds,
  lessonIds,
  exerciseIds: [],
  competencyIds: [],
  completionCriteria: [],
});

const catalog: ContentCatalog = {
  phases: [
    {
      id: 'p0',
      order: 0,
      title: 'Fase',
      summary: '',
      introduction: [],
      topics: [],
      objectives: [],
      prerequisitePhaseIds: [],
      moduleIds: ['m1', 'm2'],
      projectBrief: 'Projeto',
      competencyIds: [],
    },
  ],
  modules: [module('m1', ['l1', 'l2']), module('m2', ['l3'], ['m1'])],
  lessons: [lesson('l1', 'm1'), lesson('l2', 'm1'), lesson('l3', 'm2')],
  exercises: [],
  concepts: [],
  competencies: [],
  achievements: [],
  projects: [],
  missions: [],
  bugs: [],
  library: [],
};

describe('nextActivity', () => {
  const now = new Date(2026, 9, 29);
  const empty = createEmptyProgress(now);

  it('recommends the first lesson to a new student, saying why', () => {
    const next = nextActivity(catalog, empty);

    expect(next).toMatchObject({ kind: 'start-lesson', lesson: { id: 'l1' } });
    expect(next.reason).toContain('primeira lição');
  });

  it('continues an unfinished lesson at the saved step', () => {
    const progress = setLessonStep(startLesson(empty, 'l2', now), 'l2', 1, now);

    const next = nextActivity(catalog, progress);

    expect(next).toMatchObject({ kind: 'continue-lesson', lesson: { id: 'l2' }, stepIndex: 1 });
    expect(next.reason).toContain('etapa 2 de 3');
  });

  it('moves to the next lesson after completing one', () => {
    const next = nextActivity(catalog, completeLesson(empty, 'l1', now));

    expect(next).toMatchObject({ kind: 'start-lesson', lesson: { id: 'l2' } });
    expect(next.reason).toContain('Lição l1');
  });

  it('respects module prerequisites', () => {
    const onlyL1AndL3Started = completeLesson(empty, 'l1', now);

    expect(nextActivity(catalog, onlyL1AndL3Started)).toMatchObject({ lesson: { id: 'l2' } });
    const afterModule1 = completeLesson(onlyL1AndL3Started, 'l2', now);
    expect(nextActivity(catalog, afterModule1)).toMatchObject({ lesson: { id: 'l3' } });
  });

  it('says so when everything is done', () => {
    const all = ['l1', 'l2', 'l3'].reduce((p, id) => completeLesson(p, id, now), empty);

    expect(nextActivity(catalog, all).kind).toBe('all-done');
  });

  describe('with reviews, mistakes and the lab', () => {
    const exercise = (
      id: string,
      kind: Exercise['kind'],
      difficulty: Exercise['difficulty'],
      concept = 'dom',
    ) =>
      ({ id, kind, difficulty, title: `Ex ${id}`, conceptIds: [concept] }) as unknown as Exercise;
    const rich: ContentCatalog = {
      ...catalog,
      lessons: catalog.lessons.map((l) =>
        l.id === 'l1'
          ? { ...l, steps: [...l.steps.slice(0, 2), { ...l.steps[2], exerciseIds: ['q1'] }] }
          : l,
      ),
      exercises: [
        exercise('q1', 'multiple-choice', 'intermediate'),
        exercise('q2', 'predict-output', 'introductory'),
        exercise('lab-hard', 'code', 'intermediate', 'arrays'),
        exercise('lab-easy', 'code', 'introductory', 'objects'),
      ],
      concepts: [{ id: 'dom', title: 'DOM', competencyId: 'x' }],
    };
    const attempt = (activityId: string, correct: boolean, i: number): Attempt => ({
      id: String(i),
      activityType: 'exercise',
      activityId,
      submittedAt: now.toISOString(),
      correct,
      score: correct ? 1 : 0,
      answer: null,
      hintsUsed: 0,
      solutionViewed: false,
    });
    const answered = (base: Progress, ...results: [string, boolean][]) =>
      results.reduce((p, [id, ok], i) => recordAttempt(p, attempt(id, ok, i), now), base);
    const allLessons = ['l1', 'l2', 'l3'].reduce((p, id) => completeLesson(p, id, now), empty);

    it('puts due reviews first, saying how late they are', () => {
      const scheduled = scheduleConcepts(
        startLesson(empty, 'l2', now),
        ['dom'],
        new Date(2026, 9, 25),
      );

      const next = nextActivity(rich, scheduled, now);

      expect(next).toMatchObject({ kind: 'review', conceptTitles: ['DOM'] });
      expect(next.reason).toContain('atrasada há 3 dias');
    });

    it('recommends practice on recurring mistakes, easiest unsolved exercise first', () => {
      const progress = answered(startLesson(empty, 'l2', now), ['q1', false], ['q1', false]);

      const next = nextActivity(rich, progress, now);

      expect(next).toMatchObject({ kind: 'practice', exercise: { id: 'q2' } });
      expect(next.reason).toContain('errou 2 das últimas 2 tentativas sobre “DOM”');
    });

    it('locates practice exercises inside their lesson step', () => {
      const progress = answered(empty, ['q1', false], ['q1', false], ['q2', true]);

      expect(nextActivity(rich, progress, now)).toMatchObject({
        kind: 'practice',
        exercise: { id: 'q1' },
        location: { type: 'lesson', lessonId: 'l1', stepIndex: 2 },
      });
    });

    it('suggests the easiest unsolved lab exercise after the lessons', () => {
      const next = nextActivity(rich, allLessons, now);

      expect(next).toMatchObject({ kind: 'lab-exercise', exercise: { id: 'lab-easy' } });
    });

    it('mentions low recent accuracy when it shapes the suggestion', () => {
      // 1 of 3 right (33%), but no concept has repeated mistakes.
      const exercises = rich.exercises.map((e) =>
        e.id === 'q2' ? ({ ...e, conceptIds: ['scripts'] } as Exercise) : e,
      );
      const progress = answered(allLessons, ['q1', false], ['q2', false], ['lab-easy', true]);

      const next = nextActivity({ ...rich, exercises }, progress, now);

      expect(next).toMatchObject({ kind: 'lab-exercise', exercise: { id: 'lab-hard' } });
      expect(next.reason).toContain('33%');
      expect(next.reason).toContain('Não há mais exercícios introdutórios pendentes');
    });
  });

  describe('with projects', () => {
    const project = {
      id: 'proj',
      title: 'Projeto X',
      steps: [{ id: 's', checklist: [{ id: 'a', text: 'A' }] }],
      rubric: [{ id: 'r' }],
    } as unknown as Project;
    const withProject: ContentCatalog = { ...catalog, projects: [project] };
    const allLessons = ['l1', 'l2', 'l3'].reduce((p, id) => completeLesson(p, id, now), empty);

    it('suggests starting a project once lessons and lab are done', () => {
      expect(nextActivity(withProject, allLessons, now)).toMatchObject({
        kind: 'start-project',
        project: { id: 'proj' },
      });
    });

    it('continues a started project before new lab work, listing what is missing', () => {
      const started = setChecklistItem(allLessons, 'proj', 'a', true, now);

      const next = nextActivity(withProject, started, now);

      expect(next).toMatchObject({ kind: 'continue-project' });
      expect(next.reason).toBe(
        'Você começou este projeto e falta: execute a verificação automática do seu código; preencha a autoavaliação (0 de 1 critérios).',
      );
    });
  });
});
