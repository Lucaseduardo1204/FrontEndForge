import { CONTENT } from '.';
import { lessonExerciseIds, orderedLessons } from '../app/core/content/catalog';

/** Guards the content against broken references: saved progress depends on these ids. */
describe('content integrity', () => {
  const ids = (items: readonly { id: string }[]) => new Set(items.map((i) => i.id));
  const phaseIds = ids(CONTENT.phases);
  const moduleIds = ids(CONTENT.modules);
  const lessonIds = ids(CONTENT.lessons);
  const exerciseIds = ids(CONTENT.exercises);
  const conceptIds = ids(CONTENT.concepts);
  const competencyIds = ids(CONTENT.competencies);

  it('uses ids that are unique across all content types', () => {
    const all = [
      ...CONTENT.library,
      ...CONTENT.bugs,
      ...CONTENT.missions,
      ...CONTENT.projects,
      ...CONTENT.phases,
      ...CONTENT.modules,
      ...CONTENT.lessons,
      ...CONTENT.exercises,
      ...CONTENT.concepts,
      ...CONTENT.competencies,
    ].map((item) => item.id);

    expect(all.filter((id, index) => all.indexOf(id) !== index)).toEqual([]);
  });

  it('uses kebab-case ids', () => {
    const all = [...phaseIds, ...moduleIds, ...lessonIds, ...exerciseIds, ...conceptIds];

    expect(all.filter((id) => !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id))).toEqual([]);
  });

  it('has the 14 phases in order, with prerequisites pointing only to earlier phases', () => {
    expect(CONTENT.phases.map((p) => p.order)).toEqual([...Array(14).keys()]);
    for (const phase of CONTENT.phases) {
      expect(phase.topics.length, phase.id).toBeGreaterThan(0);
      expect(phase.introduction.length, phase.id).toBeGreaterThan(0);
      expect(phase.projectBrief, phase.id).not.toBe('');
      for (const id of phase.prerequisitePhaseIds) {
        const prerequisite = CONTENT.phases.find((p) => p.id === id);
        expect(prerequisite, `${phase.id} → ${id}`).toBeDefined();
        expect(prerequisite!.order, `${phase.id} → ${id}`).toBeLessThan(phase.order);
      }
    }
  });

  it('links phases, modules and lessons in both directions', () => {
    for (const phase of CONTENT.phases) {
      for (const id of phase.moduleIds) expect(moduleIds.has(id), id).toBe(true);
      for (const id of phase.competencyIds) expect(competencyIds.has(id), id).toBe(true);
    }
    for (const module of CONTENT.modules) {
      expect(phaseIds.has(module.phaseId), module.id).toBe(true);
      for (const id of module.lessonIds) {
        expect(CONTENT.lessons.find((l) => l.id === id)?.moduleId, id).toBe(module.id);
      }
      for (const id of module.prerequisiteModuleIds) expect(moduleIds.has(id), id).toBe(true);
    }
    for (const lesson of CONTENT.lessons) {
      expect(moduleIds.has(lesson.moduleId), lesson.id).toBe(true);
    }
  });

  it('reaches every lesson from the curriculum order', () => {
    expect(
      orderedLessons(CONTENT)
        .map((l) => l.id)
        .sort(),
    ).toEqual([...lessonIds].sort());
  });

  it('references existing exercises and concepts, each exercise used once', () => {
    // Lessons and missions share exercises' saved progress, so none may appear twice.
    const used = [
      ...CONTENT.lessons.flatMap(lessonExerciseIds),
      ...CONTENT.missions.flatMap((m) => m.exerciseIds),
      ...CONTENT.bugs.flatMap((b) => (b.diagnosisExerciseId ? [b.diagnosisExerciseId] : [])),
    ];
    for (const bug of CONTENT.bugs) {
      const diagnosis = CONTENT.exercises.find((e) => e.id === bug.diagnosisExerciseId);
      expect(diagnosis?.kind, `${bug.id}: diagnóstico precisa ser objetivo`).not.toBe('code');
      for (const id of bug.conceptIds) expect(conceptIds.has(id), `${bug.id} → ${id}`).toBe(true);
    }
    for (const mission of CONTENT.missions) {
      expect(mission.exerciseIds.length, mission.id).toBeGreaterThan(0);
      for (const id of mission.conceptIds)
        expect(conceptIds.has(id), `${mission.id} → ${id}`).toBe(true);
    }

    for (const id of used) expect(exerciseIds.has(id), id).toBe(true);
    expect(used.filter((id, index) => used.indexOf(id) !== index)).toEqual([]);
    for (const item of [...CONTENT.lessons, ...CONTENT.exercises]) {
      for (const id of item.conceptIds) expect(conceptIds.has(id), `${item.id} → ${id}`).toBe(true);
    }
    for (const concept of CONTENT.concepts) {
      expect(competencyIds.has(concept.competencyId), concept.id).toBe(true);
    }
  });

  it('gives every exercise hints, a solution and consistent answers', () => {
    for (const exercise of CONTENT.exercises) {
      expect(exercise.hints.length, exercise.id).toBeGreaterThan(0);
      expect(exercise.solution.length, exercise.id).toBeGreaterThan(0);

      switch (exercise.kind) {
        case 'multiple-choice': {
          const optionIds = exercise.options.map((o) => o.id);
          expect(new Set(optionIds).size, exercise.id).toBe(optionIds.length);
          expect(exercise.correctOptionIds.length, exercise.id).toBeGreaterThan(0);
          for (const id of exercise.correctOptionIds) expect(optionIds, exercise.id).toContain(id);
          break;
        }
        case 'predict-output':
          expect(exercise.acceptedAnswers.length, exercise.id).toBeGreaterThan(0);
          for (const mistake of exercise.commonMistakes) {
            expect(exercise.acceptedAnswers, exercise.id).not.toContain(mistake.answer);
          }
          break;
        case 'order-steps': {
          const itemIds = exercise.items.map((i) => i.id);
          expect(itemIds.length, exercise.id).toBeGreaterThan(2);
          expect(new Set(itemIds).size, exercise.id).toBe(itemIds.length);
          break;
        }
        case 'code':
          expect(exercise.tests.length, exercise.id).toBeGreaterThan(0);
          break;
      }
    }
  });

  it('requires an assessment to complete every lesson', () => {
    for (const lesson of CONTENT.lessons) {
      const assessment = lesson.steps.filter((s) => s.kind === 'assessment');
      expect(assessment.flatMap((s) => s.exerciseIds ?? []).length, lesson.id).toBeGreaterThan(0);
    }
  });

  it('links projects to their phase and keeps their ids unique', () => {
    for (const project of CONTENT.projects) {
      const phase = CONTENT.phases.find((p) => p.id === project.phaseId);
      expect(phase?.projectId, project.id).toBe(project.id);
      const itemIds = project.steps.flatMap((s) => s.checklist.map((i) => i.id));
      expect(new Set(itemIds).size, project.id).toBe(itemIds.length);
      const rubricIds = project.rubric.map((r) => r.id);
      expect(new Set(rubricIds).size, project.id).toBe(rubricIds.length);
      expect(project.autoCheck.tests.length, project.id).toBeGreaterThan(0);
      for (const id of project.competencyIds) expect(competencyIds.has(id), id).toBe(true);
    }
    for (const phase of CONTENT.phases.filter((p) => p.projectId)) {
      expect(
        CONTENT.projects.some((p) => p.id === phase.projectId),
        phase.id,
      ).toBe(true);
    }
  });

  it('keeps library links valid: internal targets exist, references are official HTTPS', () => {
    const targets: Record<string, readonly { id: string }[]> = {
      lesson: CONTENT.lessons,
      lab: CONTENT.exercises.filter((e) => e.kind === 'code'),
      mission: CONTENT.missions,
      bug: CONTENT.bugs,
      project: CONTENT.projects,
    };
    const official =
      /^https:\/\/(developer\.mozilla\.org|angular\.dev|www\.typescriptlang\.org|www\.w3\.org|developer\.chrome\.com|code\.visualstudio\.com|cheatsheetseries\.owasp\.org|rxjs\.dev)\//;
    for (const entry of CONTENT.library) {
      expect(entry.references.length, entry.id).toBeGreaterThan(0);
      for (const ref of entry.references) expect(ref.url, entry.id).toMatch(official);
      for (const link of entry.related) {
        expect(
          targets[link.type].some((t) => t.id === link.id),
          `${entry.id} → ${link.id}`,
        ).toBe(true);
      }
      for (const block of entry.body) {
        if (block.type !== 'table') continue;
        for (const row of block.rows) expect(row.length, entry.id).toBe(block.headers.length);
        // Screen readers announce each cell with its column header: an empty one says nothing.
        for (const header of block.headers) expect(header.trim(), entry.id).not.toBe('');
      }
    }
  });
});
