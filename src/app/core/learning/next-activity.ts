import { ContentCatalog, lessonExerciseIds, orderedLessons } from '../content/catalog';
import {
  CodeExercise,
  Difficulty,
  Exercise,
  Lesson,
  Mission,
  Project,
} from '../models/content.models';
import { missionStatus } from '../progress/mission-status';
import { projectStatus } from '../progress/project-updates';
import { Progress } from '../models/progress.models';
import { isCompleted } from '../progress/progress-updates';
import { moduleState } from './curriculum-status';
import { recentAccuracy, strugglingConcepts } from './performance';
import { dueReviews } from './spaced-repetition';

export type ExerciseLocation =
  | { readonly type: 'lesson'; readonly lessonId: string; readonly stepIndex: number }
  | { readonly type: 'mission'; readonly missionId: string }
  | { readonly type: 'bug'; readonly bugId: string }
  | { readonly type: 'lab' };

export type NextActivity =
  | {
      readonly kind: 'review';
      readonly conceptTitles: readonly string[];
      readonly reason: string;
    }
  | {
      readonly kind: 'practice';
      readonly exercise: Exercise;
      readonly location: ExerciseLocation;
      readonly reason: string;
    }
  | {
      readonly kind: 'continue-lesson';
      readonly lesson: Lesson;
      readonly stepIndex: number;
      readonly reason: string;
    }
  | { readonly kind: 'start-lesson'; readonly lesson: Lesson; readonly reason: string }
  | { readonly kind: 'lab-exercise'; readonly exercise: CodeExercise; readonly reason: string }
  | {
      readonly kind: 'continue-mission' | 'start-mission';
      readonly mission: Mission;
      readonly reason: string;
    }
  | {
      readonly kind: 'continue-project' | 'start-project';
      readonly project: Project;
      readonly reason: string;
    }
  | { readonly kind: 'all-done'; readonly reason: string };

const DIFFICULTY_ORDER: Readonly<Record<Difficulty, number>> = {
  introductory: 0,
  intermediate: 1,
  advanced: 2,
};

/** Below this share of correct recent answers, harder lab exercises wait. */
export const LOW_ACCURACY = 0.5;

/**
 * Deterministic recommendation. Rules, in priority order (each result says why):
 * 1. Concepts with review due (spaced repetition), most overdue first.
 * 2. Recurring mistakes: practice the easiest exercise of the concept, unsolved first.
 * 3. A lesson started and not completed (earliest in the curriculum).
 * 4. The first lesson not completed whose module is not locked (prerequisites).
 * 5. A project in progress, then a mission in progress.
 * 6. An unsolved lab exercise that is not a mission task, easiest first.
 * 7. A mission not started yet, then a project not started yet.
 */
export function nextActivity(
  catalog: ContentCatalog,
  progress: Progress,
  now: Date = new Date(),
): NextActivity {
  const conceptTitle = (id: string) => catalog.concepts.find((c) => c.id === id)?.title ?? id;

  const due = dueReviews(progress, now);
  if (due.length > 0) {
    const [first] = due;
    const when =
      first.daysOverdue === 0
        ? 'com revisão marcada para hoje'
        : `com revisão atrasada há ${first.daysOverdue} ${first.daysOverdue === 1 ? 'dia' : 'dias'}`;
    return {
      kind: 'review',
      conceptTitles: due.map((d) => conceptTitle(d.card.conceptId)),
      reason:
        due.length === 1
          ? `“${conceptTitle(first.card.conceptId)}” está ${when}. Revisar no intervalo certo é o que fixa o conteúdo.`
          : `${due.length} conceitos estão com revisão vencida, a começar por “${conceptTitle(first.card.conceptId)}” (${when.replace('com revisão ', '')}).`,
    };
  }

  const [struggling] = strugglingConcepts(catalog, progress);
  if (struggling) {
    const exercise = practiceExercise(catalog, progress, struggling.conceptId);
    if (exercise) {
      return {
        kind: 'practice',
        exercise,
        location: locate(catalog, exercise),
        reason: `Você errou ${struggling.errors} das últimas ${struggling.attempts} tentativas sobre “${struggling.title}”. Praticar agora, com a explicação fresca, evita que o erro vire hábito.`,
      };
    }
  }

  const study = lessonToStudy(catalog, progress);
  if (study?.stepIndex !== undefined) {
    const { lesson, stepIndex } = study;
    return {
      kind: 'continue-lesson',
      lesson,
      stepIndex,
      reason: `Você parou na etapa ${stepIndex + 1} de ${lesson.steps.length} (“${lesson.steps[stepIndex].title}”) e ainda não concluiu esta lição.`,
    };
  }
  if (study) {
    return {
      kind: 'start-lesson',
      lesson: study.lesson,
      reason: study.previous
        ? `É a próxima lição da trilha depois de “${study.previous.title}”, que você já concluiu.`
        : 'É a primeira lição da trilha e não tem pré-requisitos.',
    };
  }

  const projects = catalog.projects.map((project) => ({
    project,
    status: projectStatus(project, progress),
  }));
  const ongoing = projects.find((p) => p.status.started && !p.status.completedAt);
  if (ongoing) {
    return {
      kind: 'continue-project',
      project: ongoing.project,
      reason: `Você começou este projeto e falta: ${ongoing.status.missing
        .map((m) => m.charAt(0).toLowerCase() + m.slice(1).replace(/\.$/, ''))
        .join('; ')}.`,
    };
  }

  const missions = catalog.missions.map((mission) => ({
    mission,
    status: missionStatus(mission, progress),
  }));
  const ongoingMission = missions.find((m) => m.status.started && !m.status.completedAt);
  if (ongoingMission) {
    const { solved, total } = ongoingMission.status;
    return {
      kind: 'continue-mission',
      mission: ongoingMission.mission,
      reason: `Você começou esta missão e resolveu ${solved} de ${total} tarefas.`,
    };
  }

  const lab = labExercise(catalog, progress);
  if (lab) return lab;

  const freshMission = missions.find((m) => !m.status.started);
  if (freshMission) {
    return {
      kind: 'start-mission',
      mission: freshMission.mission,
      reason:
        'Uma missão aplica o que você estudou a um problema realista: primeiro o diagnóstico, depois a correção.',
    };
  }

  const fresh = projects.find((p) => !p.status.started);
  if (fresh) {
    return {
      kind: 'start-project',
      project: fresh.project,
      reason:
        'As lições e os exercícios disponíveis estão concluídos. Um projeto guiado junta tudo numa aplicação feita por você.',
    };
  }

  return {
    kind: 'all-done',
    reason: orderedLessons(catalog).every((l) => isCompleted(progress, 'lesson', l.id))
      ? 'Você concluiu todas as lições e exercícios publicados até agora, e não há revisões vencidas. Novas atividades aparecem aqui assim que forem adicionadas.'
      : 'As lições restantes dependem de módulos que ainda não foram concluídos.',
  };
}

/**
 * The lesson to study now: the earliest one started and not completed (with its step), or
 * else the first not completed whose module is not locked.
 */
export function lessonToStudy(
  catalog: ContentCatalog,
  progress: Progress,
): { lesson: Lesson; stepIndex?: number; previous?: Lesson } | undefined {
  const lessons = orderedLessons(catalog);
  const done = (lesson: Lesson) => isCompleted(progress, 'lesson', lesson.id);

  const inProgress = lessons.find((lesson) => progress.lessons[lesson.id] && !done(lesson));
  if (inProgress) {
    const stepIndex = Math.min(
      progress.lessons[inProgress.id].currentStepIndex,
      inProgress.steps.length - 1,
    );
    return { lesson: inProgress, stepIndex };
  }

  const available = (lesson: Lesson) => {
    const module = catalog.modules.find((m) => m.id === lesson.moduleId);
    return module !== undefined && moduleState(catalog, progress, module).status !== 'locked';
  };
  const index = lessons.findIndex((lesson) => !done(lesson) && available(lesson));
  if (index === -1) return undefined;
  return { lesson: lessons[index], previous: lessons.slice(0, index).reverse().find(done) };
}

/** Easiest exercise of the concept, preferring the ones not solved yet. */
export function practiceExercise(
  catalog: ContentCatalog,
  progress: Progress,
  conceptId: string,
): Exercise | undefined {
  return catalog.exercises
    .filter((e) => e.conceptIds.includes(conceptId))
    .map((exercise, order) => ({
      exercise,
      order,
      solved: isCompleted(progress, 'exercise', exercise.id) ? 1 : 0,
    }))
    .sort(
      (a, b) =>
        a.solved - b.solved ||
        DIFFICULTY_ORDER[a.exercise.difficulty] - DIFFICULTY_ORDER[b.exercise.difficulty] ||
        a.order - b.order,
    )[0]?.exercise;
}

function labExercise(catalog: ContentCatalog, progress: Progress): NextActivity | undefined {
  const missionTasks = new Set(catalog.missions.flatMap((m) => m.exerciseIds));
  const unsolved = catalog.exercises
    .filter((e): e is CodeExercise => e.kind === 'code' && !missionTasks.has(e.id))
    .filter((e) => !isCompleted(progress, 'exercise', e.id))
    .sort((a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]);
  if (unsolved.length === 0) return undefined;

  const accuracy = recentAccuracy(progress);
  const percent = accuracy === null ? null : Math.round(accuracy * 100);
  const [easiest] = unsolved;
  let reason =
    'As lições disponíveis estão concluídas. Este é o exercício mais simples ainda não resolvido no laboratório.';
  if (accuracy !== null && accuracy < LOW_ACCURACY) {
    reason =
      easiest.difficulty === 'introductory'
        ? `Seu aproveitamento nas últimas tentativas foi de ${percent}%, então a sugestão é um exercício introdutório do laboratório.`
        : `Seu aproveitamento nas últimas tentativas foi de ${percent}%. Não há mais exercícios introdutórios pendentes: antes deste, vale reler as soluções comentadas dos exercícios que você errou.`;
  }
  return { kind: 'lab-exercise', exercise: easiest, reason };
}

/** Where the student answers an exercise (lab only for code not tied to a mission). */
export function locate(catalog: ContentCatalog, exercise: Exercise): ExerciseLocation {
  for (const lesson of catalog.lessons) {
    if (!lessonExerciseIds(lesson).includes(exercise.id)) continue;
    const stepIndex = lesson.steps.findIndex((s) => s.exerciseIds?.includes(exercise.id));
    return { type: 'lesson', lessonId: lesson.id, stepIndex };
  }
  const mission = catalog.missions.find((m) => m.exerciseIds.includes(exercise.id));
  // Code tasks of a mission are solved in the lab; objective ones on the mission page.
  if (mission && exercise.kind !== 'code') return { type: 'mission', missionId: mission.id };
  const bug = catalog.bugs.find((b) => b.diagnosisExerciseId === exercise.id);
  if (bug) return { type: 'bug', bugId: bug.id };
  return { type: 'lab' };
}
