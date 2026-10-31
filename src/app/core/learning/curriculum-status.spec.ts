import { ContentCatalog } from '../content/catalog';
import { Lesson, Module, Phase } from '../models/content.models';
import { createEmptyProgress } from '../persistence/progress-schema';
import { completeLesson, startLesson } from '../progress/progress-updates';
import { moduleState, phaseState } from './curriculum-status';

const lesson = (id: string, moduleId: string): Lesson => ({
  id,
  moduleId,
  title: id,
  summary: '',
  estimatedMinutes: 5,
  difficulty: 'introductory',
  conceptIds: [],
  steps: [],
});

const module = (
  id: string,
  phaseId: string,
  lessonIds: string[],
  prereqs: string[] = [],
): Module => ({
  id,
  phaseId,
  title: `Mod ${id}`,
  summary: '',
  objectives: [],
  prerequisiteModuleIds: prereqs,
  lessonIds,
  exerciseIds: [],
  competencyIds: [],
  completionCriteria: [],
});

const phase = (id: string, order: number, moduleIds: string[], prereqs: string[] = []): Phase => ({
  id,
  order,
  title: `Fase ${id}`,
  summary: '',
  introduction: [],
  topics: [],
  objectives: [],
  prerequisitePhaseIds: prereqs,
  moduleIds,
  projectBrief: 'Projeto',
  competencyIds: [],
});

// p0: m1 (l1, l2) → m2 (l3). p1: planned. p2: m3 (l4), requires p0 and p1.
const catalog: ContentCatalog = {
  phases: [
    phase('p0', 0, ['m1', 'm2']),
    phase('p1', 1, [], ['p0']),
    phase('p2', 2, ['m3'], ['p0', 'p1']),
  ],
  modules: [
    module('m1', 'p0', ['l1', 'l2']),
    module('m2', 'p0', ['l3'], ['m1']),
    module('m3', 'p2', ['l4']),
  ],
  lessons: [lesson('l1', 'm1'), lesson('l2', 'm1'), lesson('l3', 'm2'), lesson('l4', 'm3')],
  exercises: [],
  concepts: [],
  competencies: [],
  achievements: [],
  projects: [],
  missions: [],
  bugs: [],
  library: [],
};

const now = new Date(2026, 9, 29);
const empty = createEmptyProgress(now);
const mod = (id: string) => catalog.modules.find((m) => m.id === id)!;
const ph = (id: string) => catalog.phases.find((p) => p.id === id)!;
const complete = (...ids: string[]) => ids.reduce((p, id) => completeLesson(p, id, now), empty);

describe('curriculum status', () => {
  it('starts with the first module available and dependents locked, naming the blocker', () => {
    expect(moduleState(catalog, empty, mod('m1')).status).toBe('available');
    expect(moduleState(catalog, empty, mod('m2'))).toMatchObject({
      status: 'locked',
      blockers: ['Módulo “Mod m1”'],
    });
    expect(moduleState(catalog, empty, mod('m3'))).toMatchObject({
      status: 'locked',
      blockers: ['Fase 0: Fase p0'],
    });
  });

  it('marks a module in progress once a lesson is started', () => {
    const progress = startLesson(empty, 'l1', now);

    expect(moduleState(catalog, progress, mod('m1')).status).toBe('in-progress');
    expect(phaseState(catalog, progress, ph('p0')).status).toBe('in-progress');
  });

  it('counts completed lessons and completes the module', () => {
    const progress = complete('l1', 'l2');

    expect(moduleState(catalog, progress, mod('m1'))).toMatchObject({
      status: 'completed',
      lessonsCompleted: 2,
      lessonsTotal: 2,
    });
    expect(moduleState(catalog, progress, mod('m2')).status).toBe('available');
  });

  it('does not let a phase without published content block later phases', () => {
    const progress = complete('l1', 'l2', 'l3');

    expect(phaseState(catalog, progress, ph('p0')).status).toBe('completed');
    expect(phaseState(catalog, progress, ph('p1')).status).toBe('planned');
    expect(moduleState(catalog, progress, mod('m3')).status).toBe('available');
    expect(phaseState(catalog, progress, ph('p2'))).toMatchObject({
      status: 'available',
      lessonsCompleted: 0,
      lessonsTotal: 1,
    });
  });

  it('locks a phase while its prerequisite phase is incomplete', () => {
    expect(phaseState(catalog, empty, ph('p2'))).toMatchObject({
      status: 'locked',
      blockers: ['Fase 0: Fase p0'],
    });
  });
});
